import React from "react";
import { useInterviewStore } from "../../stores/interviewStore";

export const QuestionCard = () => {
  const { questions, currentQuestionIndex, isAISpeaking } = useInterviewStore();

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 h-full flex items-center justify-center">
        <p className="text-purple-200/60">Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionText =
    currentQuestion?.question ||
    currentQuestion?.question_text ||
    currentQuestion?.text ||
    currentQuestion?.prompt ||
    currentQuestion?.title ||
    `Question ${currentQuestionIndex + 1}`;

  if (!currentQuestion) {
    return (
      <div className="p-6 rounded-lg bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 h-full flex items-center justify-center">
        <p className="text-purple-200/60">No question available</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 h-full flex flex-col">
      {/* Question Number */}
      <div className="mb-4">
        <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question Text */}
      <div className="flex-1 mb-4">
        <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
          {questionText}
        </h3>

        {/* AI Speaking Indicator */}
        {isAISpeaking && (
          <div className="mt-4 p-4 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-start gap-3">
            <div className="flex gap-1 mt-1">
              <div
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <span className="text-sm text-amber-200">
              AI is reading the question...
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/20">
        <p className="text-xs text-blue-200/80 leading-relaxed">
          🎤 Listen carefully to the question. After the AI finishes speaking,
          your microphone will start recording automatically. Speak clearly and
          take your time to provide a comprehensive answer.
        </p>
      </div>
    </div>
  );
};
