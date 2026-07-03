import React from "react";
import { useInterviewStore } from "../../stores/interviewStore";

export const ProgressIndicator = () => {
  const { questions, currentQuestionIndex } = useInterviewStore();

  if (!questions || questions.length === 0) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-300">
            Progress
          </span>
          <span className="text-xs text-purple-200/60">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-purple-900/30 border border-purple-500/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg text-xs transition-all duration-200 ${
              idx === currentQuestionIndex
                ? "bg-purple-600/40 border border-purple-500/50 text-white font-medium"
                : idx < currentQuestionIndex
                  ? "bg-green-900/20 border border-green-500/20 text-green-200"
                  : "bg-purple-900/10 border border-purple-500/10 text-purple-200/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {idx < currentQuestionIndex ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border 2 border-current flex items-center justify-center">
                  {idx === currentQuestionIndex && (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
              )}
              <span className="flex-1 truncate">Q{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
