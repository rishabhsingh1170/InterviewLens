import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
console.log("API_BASE_URL:", API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    if (typeof responseData.detail === "string") {
      return responseData.detail;
    }

    if (Array.isArray(responseData.detail)) {
      return responseData.detail
        .map((item) => item?.msg || item?.message || JSON.stringify(item))
        .join(", ");
    }

    if (typeof responseData.message === "string") {
      return responseData.message;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const interviewAPI = {
  // Get interview questions
  getQuestions: async (interviewId) => {
    try {
      const response = await api.get(`/interview/start`, {
        params: { session_id: interviewId },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to load interview questions"),
      );
    }
  },

  // Submit interview answers with video
  submitInterview: async (interviewId, answers) => {
    try {
      const formData = new FormData();
      formData.append("interviewId", interviewId);
      formData.append("answers", JSON.stringify(answers));

      const response = await api.post(`/interview/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to submit interview"));
    }
  },

  // Save a single answer before moving to the next question
  saveAnswer: async (questionId, userAnswer) => {
    try {
      const response = await api.post(`/interview/save_answer`, null, {
        params: {
          question_id: questionId,
          user_answer: userAnswer,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to save answer"));
    }
  },

  // Transcribe audio with Whisper (backend will handle)
  transcribeAudio: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const response = await api.post(`/interview/transcribe`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.transcript;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to transcribe audio"));
    }
  },

  // Get session details
  getSessionDetails: async (sessionId) => {
    try {
      const response = await api.get(`/interview/session_details`, {
        params: { session_id: sessionId },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch session details"),
      );
    }
  },
};

export default interviewAPI;
