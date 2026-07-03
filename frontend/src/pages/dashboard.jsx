import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { interviewAPI } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await interviewAPI.getSessions();
      setSessions(res || []);
    } catch (err) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      await interviewAPI.createSession(topic, level);
      setTopic("");
      setLevel("intermediate");
      setShowCreate(false);
      fetchSessions();
    } catch (err) {
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (sessionId) => {
    navigate(`/interview?id=${sessionId}`);
  };

  const openDetails = async (sessionId) => {
    setLoading(true);
    try {
      const res = await interviewAPI.getSessionDetails(sessionId);
      setSessionDetails(res);
    } catch (err) {
      setError(err.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => setSessionDetails(null);

  const handleReview = async (sessionId) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setSessionDetails(null);
    } else {
      setLoading(true);
      try {
        const res = await interviewAPI.getSessionDetails(sessionId);
        setSessionDetails(res);
        setExpandedSessionId(sessionId);
      } catch (err) {
        setError(err.message || "Failed to fetch session details");
      } finally {
        setLoading(false);
      }
    }
  };

  const getSessionStatus = (session) => {
    return (session?.status || session?.session_status || "")
      .toString()
      .trim()
      .toLowerCase();
  };

  const isCompletedSession = (session) => {
    return (
      getSessionStatus(session) === "complete" ||
      session?.is_completed === true ||
      session?.completed === true
    );
  };

  const isActiveSession = (session) => {
    const status = getSessionStatus(session);
    return status === "active" || status === "in_progress";
  };

  const completedSessionsCount = sessions.filter(isCompletedSession).length;
  const activeSessionsCount = sessions.filter(isActiveSession).length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {user?.user_name || user?.name || "User"}
            </h2>
            <p className="text-sm text-purple-200/60">
              Your interview sessions and stats.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate((s) => !s)}
              className="px-4 py-2 rounded-md bg-linear-to-r from-blue-500 to-purple-500 text-white"
            >
              {showCreate ? "Close" : "Create Session"}
            </button>
          </div>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-4 bg-[#0b0a1a] rounded-lg border border-purple-500/10"
          >
            <div className="flex gap-3">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Session topic (e.g. System Design)"
                className="flex-1 p-2 rounded-md bg-transparent border border-purple-500/10 text-white"
              />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="p-2 rounded-md bg-transparent border border-purple-500/10 text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-green-600 text-white"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[#0b0a1a] border border-purple-500/10">
            <div className="text-sm text-purple-200/60">Total Sessions</div>
            <div className="text-2xl font-bold text-white">
              {sessions.length}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[#0b0a1a] border border-purple-500/10">
            <div className="text-sm text-purple-200/60">Completed</div>
            <div className="text-2xl font-bold text-white">
              {completedSessionsCount}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[#0b0a1a] border border-purple-500/10">
            <div className="text-sm text-purple-200/60">Active</div>
            <div className="text-2xl font-bold text-white">
              {activeSessionsCount}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Sessions</h3>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-purple-200/60">
              No sessions yet. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((s) => (
                <div
                  key={s.id || s._id || s.session_id}
                  className="p-4 rounded-lg bg-[#0b0a1a] border border-purple-500/8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-purple-200/60">
                        {s.topic}
                      </div>
                      <div className="text-xs text-purple-300/60">
                        Level: {s.level || "N/A"}
                      </div>
                      <div className="mt-2 text-white font-medium">
                        Score: {s.overall_score ?? "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-2 py-1 rounded text-xs ${isCompletedSession(s) ? "bg-green-700 text-white" : isActiveSession(s) ? "bg-yellow-700 text-white" : "bg-slate-700 text-white"}`}
                      >
                        {getSessionStatus(s) || "unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {isActiveSession(s) && (
                      <button
                        onClick={() =>
                          handleStart(s.id || s._id || s.session_id)
                        }
                        className="px-3 py-1 rounded bg-blue-600 text-white"
                      >
                        Start
                      </button>
                    )}
                    {isCompletedSession(s) && (
                      <button
                        onClick={() =>
                          handleReview(s.id || s._id || s.session_id)
                        }
                        className={`px-3 py-1 rounded text-white ${expandedSessionId === (s.id || s._id || s.session_id) ? "bg-purple-700" : "bg-purple-600"}`}
                      >
                        {expandedSessionId === (s.id || s._id || s.session_id)
                          ? "Hide Review"
                          : "Review"}
                      </button>
                    )}
                  </div>

                  {expandedSessionId === (s.id || s._id || s.session_id) &&
                    sessionDetails && (
                      <div className="mt-4 pt-4 border-t border-purple-500/20">
                        <h4 className="text-sm font-semibold text-white mb-3">
                          Session Review
                        </h4>

                        {Array.isArray(sessionDetails.questions) &&
                        sessionDetails.questions.length > 0 ? (
                          <div className="space-y-4">
                            {sessionDetails.questions.map((q, idx) => (
                              <div
                                key={idx}
                                className="space-y-2 p-3 rounded bg-[#0a0810] border border-purple-500/10"
                              >
                                <div>
                                  <p className="text-xs text-purple-300">
                                    ID: {q.id || q._id || `Q${idx + 1}`}
                                  </p>
                                  <p className="text-sm font-semibold text-white mt-1">
                                    Question:
                                  </p>
                                  <p className="text-sm text-purple-200/80">
                                    {q.question || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    User Answer:
                                  </p>
                                  <p className="text-sm text-purple-200/80">
                                    {q.user_answer ||
                                      q.userAnswer ||
                                      "No answer provided"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Score:
                                  </p>
                                  <p className="text-sm text-purple-200/80">
                                    {typeof q.score === "number"
                                      ? `${q.score.toFixed(2)}/10`
                                      : (q.score ?? "N/A")}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Ideal Answer:
                                  </p>
                                  <p className="text-sm text-purple-200/80">
                                    {q.ideal_answer || q.idealAnswer || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    Feedback:
                                  </p>
                                  <p className="text-sm text-purple-200/80">
                                    {q.feedback || "No feedback"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-purple-200/60">
                            No detailed questions available
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
