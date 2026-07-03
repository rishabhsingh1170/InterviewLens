import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInterviewStore } from "../../stores/interviewStore";
import { useInterviewFlow } from "../../hooks/useInterviewFlow";
import interviewAPI from "../../services/interviewAPI";
import { WebcamPreview } from "./WebcamPreview";
import { QuestionCard } from "./QuestionCard";
import { TranscriptBox } from "./TranscriptBox";
import { ProgressIndicator } from "./ProgressIndicator";
import { InterviewControls } from "./InterviewControls";

export const InterviewContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get("id");

  const {
    questions,
    currentQuestionIndex,
    interviewStarted,
    interviewCompleted,
    permissionError,
    recordingState,
    isAISpeaking,
    isMicActive,
    mediaStream,
    setMediaStream,
    answers,
  } = useInterviewStore();

  const {
    initializeInterview,
    startInterview,
    askQuestionAtIndex,
    stopMicrophoneRecording,
    nextQuestion,
    endInterview,
    isLoading,
  } = useInterviewFlow();

  const [initialized, setInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initError, setInitError] = useState("");
  const lastSpokenQuestionIndexRef = useRef(-1);

  // Initialize interview on mount
  useEffect(() => {
    const init = async () => {
      if (!interviewId) {
        navigate("/dashboard");
        return;
      }

      try {
        setInitError("");
        await initializeInterview(interviewId);
        setInitialized(true);
      } catch (error) {
        console.error("Initialization failed:", error);
        setInitError(error?.message || "Failed to initialize interview");
        setInitialized(true);
      }
    };

    init();
  }, [interviewId]);

  // Ensure media tracks are stopped when leaving the interview
  useEffect(() => {
    return () => {
      try {
        if (mediaStream) {
          mediaStream.getTracks().forEach((t) => t.stop());
          setMediaStream(null);
        }
      } catch (err) {
        console.warn("Error stopping media tracks on unmount:", err);
      }
    };
  }, [mediaStream, setMediaStream]);

  // Start interview once initialized
  useEffect(() => {
    if (
      initialized &&
      !interviewStarted &&
      !initError &&
      questions.length > 0
    ) {
      handleStartInterview();
    }
  }, [initialized, interviewStarted, initError, questions.length]);

  // Speak only when the current question index changes.
  useEffect(() => {
    if (interviewStarted && questions.length > 0) {
      if (lastSpokenQuestionIndexRef.current === currentQuestionIndex) {
        return;
      }

      const timer = setTimeout(() => {
        askQuestionAtIndex(currentQuestionIndex);
        lastSpokenQuestionIndexRef.current = currentQuestionIndex;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    interviewStarted,
    questions.length,
    currentQuestionIndex,
    askQuestionAtIndex,
  ]);

  const handleStartInterview = async () => {
    setIsProcessing(true);
    try {
      const success = await startInterview();
      if (!success) {
        console.error("Failed to start interview");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    // Debug: log all questions with any provided answers
    try {
      const debugList = questions.map((q) => ({
        id: q.id || q.question_id,
        question: q.question || q.text || q.prompt || null,
        answer: answers && answers[q.id] ? answers[q.id].text : null,
      }));
      console.debug("Interview debug - questions with answers:", debugList);
    } catch (err) {
      console.warn("Failed to build debug questions list:", err);
    }
    if (isMicActive) {
      // Stop microphone and process answer
      setIsProcessing(true);
      try {
        const transcript = await stopMicrophoneRecording();

        if (questions[currentQuestionIndex]) {
          await interviewAPI.saveAnswer(
            questions[currentQuestionIndex].id,
            transcript,
          );
        }

        if (
          questions.length > 0 &&
          currentQuestionIndex >= questions.length - 1
        ) {
          await endInterview(interviewId);
        } else {
          await nextQuestion();
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (
        questions.length > 0 &&
        currentQuestionIndex >= questions.length - 1
      ) {
        setIsProcessing(true);
        try {
          await endInterview(interviewId);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // Move to next question
      setIsProcessing(true);
      try {
        await nextQuestion();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (initError) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 to-purple-950 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30">
            <svg
              className="w-8 h-8 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Interview unavailable
          </h2>
          <p className="text-purple-200/80 mb-6">{initError}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEndInterview = async () => {
    setIsProcessing(true);
    try {
      await endInterview(interviewId);
    } finally {
      setIsProcessing(false);
    }
  };

  // Interview Completed Screen
  if (interviewCompleted) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 to-purple-950 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-green-600 to-emerald-600">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Interview Complete!
          </h2>
          <p className="text-purple-200/80 mb-6">
            Your interview has been submitted successfully. Great job!
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (!initialized || isLoading) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 to-purple-950 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mb-4 inline-flex">
            <svg
              className="w-12 h-12 text-purple-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-purple-200">Initializing interview...</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Permission Error
  if (permissionError && !interviewStarted) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-slate-950 to-purple-950 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30">
            <svg
              className="w-8 h-8 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Permission Denied
          </h2>
          <p className="text-purple-200/80 mb-6">{permissionError}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-linear-to-br from-slate-950 to-purple-950 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-500/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Interview</h1>
              <p className="text-sm text-purple-200/60">
                {recordingState === "recording" && "Recording interview..."}
                {recordingState === "processing" && "Processing..."}
                {recordingState === "idle" && "Preparing..."}
              </p>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-green-300 font-medium">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-3 gap-6 p-6">
            {/* Left: Webcam Preview */}
            <div className="col-span-1">
              <WebcamPreview />
            </div>

            {/* Middle: Question & Transcript */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1 min-h-0">
                <QuestionCard />
              </div>
              <div className="h-48">
                <TranscriptBox />
              </div>
            </div>

            {/* Right: Progress & Controls */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1 p-6 rounded-lg bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 overflow-y-auto">
                <ProgressIndicator />
              </div>

              <div className="p-6 rounded-lg bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20">
                <InterviewControls
                  onNextQuestion={handleNextQuestion}
                  onEndInterview={handleEndInterview}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
