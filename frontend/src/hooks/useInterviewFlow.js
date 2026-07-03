import { useEffect, useRef, useState } from "react";
import { useInterviewStore } from "../stores/interviewStore";
import { useMediaRecorder } from "./useMediaRecorder";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useWhisperTranscription } from "./useWhisperTranscription";
import interviewAPI from "../services/interviewAPI";

const MIN_ANSWER_DURATION = 3000; // 3 seconds minimum

export const useInterviewFlow = () => {
  const {
    questions,
    currentQuestionIndex,
    answers,
    reset,
    setQuestions,
    setInterviewStarted,
    setInterviewCompleted,
    setCurrentQuestionIndex,
    addAnswer,
    goToNextQuestion,
    setTranscript,
    setRecordingState,
    setIsMicActive,
    setCurrentAnswerDuration,
    currentAnswerDuration,
    setPermissionError,
    recordedChunks,
    setRecordedChunks,
  } = useInterviewStore();

  const {
    requestPermissions,
    startRecording,
    stopRecording,
    mediaStream,
    stopMediaStream,
    resetRecording,
  } = useMediaRecorder();
  const { speakQuestion } = useSpeechSynthesis();
  const {
    startAudioCapture,
    stopAudioCapture,
    transcribeAudio,
    startLiveTranscription,
    stopLiveTranscription,
    resetAudioCapture,
  } = useWhisperTranscription();

  const [isLoading, setIsLoading] = useState(false);
  const recordingStartTimeRef = useRef(null);
  const answerTimerRef = useRef(null);
  const audioRecorderRef = useRef(null);

  // Initialize interview
  const initializeInterview = async (interviewId) => {
    setIsLoading(true);
    try {
      const response = await interviewAPI.getQuestions(interviewId);
      reset();
      const normalizedQuestions = (response.questions || []).map(
        (question) => ({
          ...question,
          id: question.id || question.question_id,
        }),
      );
      setQuestions(normalizedQuestions);
      setCurrentQuestionIndex(0);
      setPermissionError(null);
      // console.log("Loaded questions:", questions);
      return response;
    } catch (error) {
      const errorMsg = error.message || "Failed to load questions";
      setPermissionError(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Request permissions and start interview
  const startInterview = async () => {
    try {
      setRecordingState("processing");
      const stream = await requestPermissions();
      await startRecording(stream);
      setInterviewStarted(true);
      setRecordingState("recording");
      return true;
    } catch (error) {
      setPermissionError(error.message);
      setRecordingState("idle");
      return false;
    }
  };

  // Ask a specific question index, defaulting to the current one.
  const askQuestionAtIndex = async (questionIndex = currentQuestionIndex) => {
    const questionItem = questions[questionIndex];

    if (!questionItem) {
      return;
    }

    const question = questionItem.question;

    setRecordingState("processing");
    try {
      await speakQuestion(question, async () => {
        await startMicrophoneRecording();
      });
    } catch (error) {
      console.error("Error asking question:", error);
      setRecordingState("recording");
      await startMicrophoneRecording();
    }
  };

  // Start microphone recording for answer
  const startMicrophoneRecording = async () => {
    if (!mediaStream) return;

    try {
      const { recorder } = await startAudioCapture(mediaStream);
      audioRecorderRef.current = recorder;

      setIsMicActive(true);
      setRecordingState("recording");
      recordingStartTimeRef.current = Date.now();
      resetAudioCapture();
      setTranscript("");
      startLiveTranscription();

      // Start answer duration timer
      answerTimerRef.current = setInterval(() => {
        const duration = Date.now() - recordingStartTimeRef.current;
        setCurrentAnswerDuration(duration);
      }, 100);
    } catch (error) {
      console.error("Microphone recording error:", error);
      setPermissionError("Failed to start microphone recording");
    }
  };

  // Stop microphone recording and transcribe
  const stopMicrophoneRecording = async () => {
    setIsMicActive(false);
    setRecordingState("processing");
    stopLiveTranscription();

    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
    }

    if (audioRecorderRef.current) {
      await stopAudioCapture(audioRecorderRef.current);
      audioRecorderRef.current = null;
    }

    try {
      const transcript = await transcribeAudio();
      if (transcript) {
        addAnswer(questions[currentQuestionIndex].id, transcript);
      }
      setRecordingState("recording");
      return transcript;
    } catch (error) {
      console.error("Transcription error:", error);
      setRecordingState("recording");
      return "";
    }
  };

  // Move to next question
  const nextQuestion = async () => {
    console.debug("nextQuestion invoked", {
      currentAnswerDuration,
      MIN_ANSWER_DURATION,
      currentQuestionIndex,
      questionsCount: questions.length,
    });
    if (currentAnswerDuration < MIN_ANSWER_DURATION) {
      console.debug("nextQuestion blocked: answer too short", {
        currentAnswerDuration,
        required: MIN_ANSWER_DURATION,
      });
      setPermissionError(
        `Please answer for at least ${Math.ceil(MIN_ANSWER_DURATION / 1000)} seconds`,
      );
      return false;
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    const hasNextQuestion = nextQuestionIndex < questions.length;

    if (!hasNextQuestion) {
      console.debug("No next question; interview completed or at end");
      return false;
    }

    console.debug("Advancing to question index (expected)", nextQuestionIndex);
    setCurrentQuestionIndex(nextQuestionIndex);
    setCurrentAnswerDuration(0);
    setPermissionError(null);
    setTranscript("");
    return true;
  };

  // End interview and submit
  const endInterview = async (interviewId) => {
    try {
      setRecordingState("processing");
      setIsMicActive(false);

      // Stop recording
      await stopRecording();
      stopMediaStream();
      resetRecording();

      // Prepare answers
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        answer: answers[questionId].text,
        timestamp: answers[questionId].timestamp,
      }));

      // Submit to backend
      setRecordingState("processing");
      await interviewAPI.submitInterview(interviewId, formattedAnswers);

      setInterviewCompleted(true);
      setRecordingState("idle");
      return true;
    } catch (error) {
      console.error("End interview error:", error);
      setPermissionError("Failed to submit interview");
      setRecordingState("recording");
      return false;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current);
      }
      stopMediaStream();
    };
  }, []);

  return {
    initializeInterview,
    startInterview,
    askQuestionAtIndex,
    startMicrophoneRecording,
    stopMicrophoneRecording,
    nextQuestion,
    endInterview,
    isLoading,
  };
};
