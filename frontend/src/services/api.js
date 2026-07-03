
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API calls
export const authAPI = {
  signup: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: name,
        email,
        password,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Signup failed");
    }
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }
    return response.json();
  },
};

// Interview API calls
export const interviewAPI = {
  createSession: async (topic, level) => {
    const response = await fetch(`${API_BASE_URL}/interview/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic,
        level,
        status: "active",
        overall_score: 0,
        scores_id: "",
        questions: [],
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create session");
    }
    return response.json();
  },

  getSessions: async () => {
    const response = await fetch(`${API_BASE_URL}/interview/get_sessions`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch sessions");
    }
    return response.json();
  },

  startInterview: async (sessionId) => {
    const response = await fetch(
      `${API_BASE_URL}/interview/start?session_id=${sessionId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to start interview");
    }
    return response.json();
  },

  getSessionDetails: async (sessionId) => {
    const response = await fetch(
      `${API_BASE_URL}/interview/session_details?session_id=${sessionId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch session details");
    }
    return response.json();
  },

  saveAnswer: async (questionId, userAnswer) => {
    const response = await fetch(`${API_BASE_URL}/interview/save_answer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_id: questionId,
        user_answer: userAnswer,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save answer");
    }
    return response.json();
  },

  saveScoreFeedback: async (sessionId) => {
    const response = await fetch(
      `${API_BASE_URL}/interview/save_score_feedback`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId }),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save feedback");
    }
    return response.json();
  },

  reviewSession: async (sessionId) => {
    const response = await fetch(
      `${API_BASE_URL}/interview/review?session_id=${sessionId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch session review");
    }
    return response.json();
  },
};

export default API_BASE_URL;
