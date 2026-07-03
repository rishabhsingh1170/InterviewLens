import React, { useState } from "react";
import { useInterviewStore } from "../../stores/interviewStore";

export const InterviewControls = ({
  onNextQuestion,
  onEndInterview,
  isProcessing,
}) => {
  const {
    isMicActive,
    currentAnswerDuration,
    questions,
    currentQuestionIndex,
  } = useInterviewStore();
  const [confirmEnd, setConfirmEnd] = useState(false);

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const minDurationMet = currentAnswerDuration >= 3000;

  return (
    <div className="space-y-3">
      {/* Stop Microphone / Submit Answer Button */}
      {isMicActive && (
        <button
          onClick={onNextQuestion}
          disabled={!minDurationMet || isProcessing}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            minDurationMet
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50"
              : "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              {isLastQuestion ? "Finish" : "Next"}
            </>
          )}
        </button>
      )}

      {/* Next Question Button */}
      {!isMicActive && !isProcessing && (
        <button
          onClick={onNextQuestion}
          disabled={isProcessing}
          className="w-full py-2 px-4 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {isLastQuestion ? "Complete" : "Next Question"}
        </button>
      )}

      {/* End Interview Button */}
      <div className="space-y-2">
        {!confirmEnd ? (
          <button
            onClick={() => setConfirmEnd(true)}
            disabled={isProcessing}
            className="w-full py-2 px-4 rounded-lg font-semibold bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition-all duration-200"
          >
            End Interview
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
            <p className="text-xs text-red-200">
              Confirm exit? Your progress will be saved.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onEndInterview}
                disabled={isProcessing}
                className="flex-1 py-1 px-3 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200"
              >
                Yes, End
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                disabled={isProcessing}
                className="flex-1 py-1 px-3 rounded bg-gray-600 text-white text-sm font-semibold hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duration Info */}
      {isMicActive && !minDurationMet && (
        <p className="text-xs text-amber-200 bg-amber-900/20 border border-amber-500/20 rounded p-2 text-center">
          Keep speaking for {Math.ceil((3000 - currentAnswerDuration) / 1000)}{" "}
          more seconds
        </p>
      )}
    </div>
  );
};
