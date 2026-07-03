import { create } from "zustand";

export const useInterviewStore = create((set) => ({
  // Questions state
  questions: [],
  currentQuestionIndex: 0,

  // Interview state
  answers: {}, // { questionId: { text: "...", timestamp: 0 } }
  transcript: "",
  interviewStarted: false,
  interviewCompleted: false,
  recordingState: "idle", // idle, recording, processing

  // Media state
  mediaStream: null,
  mediaRecorder: null,
  recordedChunks: [],

  // UI state
  isAISpeaking: false,
  isMicActive: false,
  permissionError: null,
  currentAnswerDuration: 0,

  // Actions
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setInterviewStarted: (started) => set({ interviewStarted: started }),
  setInterviewCompleted: (completed) => set({ interviewCompleted: completed }),
  setTranscript: (transcript) => set({ transcript }),
  setRecordingState: (state) => set({ recordingState: state }),
  setMediaStream: (stream) => set({ mediaStream: stream }),
  setMediaRecorder: (recorder) => set({ mediaRecorder: recorder }),
  setRecordedChunks: (chunks) => set({ recordedChunks: chunks }),
  setIsAISpeaking: (speaking) => set({ isAISpeaking: speaking }),
  setIsMicActive: (active) => set({ isMicActive: active }),
  setPermissionError: (error) => set({ permissionError: error }),
  setCurrentAnswerDuration: (duration) =>
    set({ currentAnswerDuration: duration }),

  // Answer management
  addAnswer: (questionId, answerText) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          text: answerText,
          timestamp: new Date().toISOString(),
        },
      },
    })),

  addRecordedChunk: (chunk) =>
    set((state) => ({
      recordedChunks: [...state.recordedChunks, chunk],
    })),

  // Reset
  reset: () =>
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      transcript: "",
      interviewStarted: false,
      interviewCompleted: false,
      recordingState: "idle",
      mediaStream: null,
      mediaRecorder: null,
      recordedChunks: [],
      isAISpeaking: false,
      isMicActive: false,
      permissionError: null,
      currentAnswerDuration: 0,
    }),

  // Computed selectors
  getCurrentQuestion: () =>
    set((state) => {
      if (
        state.questions.length > 0 &&
        state.currentQuestionIndex < state.questions.length
      ) {
        return { currentQuestion: state.questions[state.currentQuestionIndex] };
      }
      return { currentQuestion: null };
    }),

  getProgress: () =>
    set((state) => {
      const total = state.questions.length;
      const current = state.currentQuestionIndex + 1;
      return { progress: total > 0 ? (current / total) * 100 : 0 };
    }),

  goToNextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1,
      ),
      transcript: "",
      currentAnswerDuration: 0,
    })),
}));
