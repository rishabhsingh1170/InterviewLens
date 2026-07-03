import React from "react";
import { useInterviewStore } from "../../stores/interviewStore";

export const TranscriptBox = () => {
  const { transcript, isMicActive, isAISpeaking } = useInterviewStore();

  return (
    <div className="p-4 rounded-lg bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-purple-500/20 h-48 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-purple-500/10">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Live Transcript
        </h4>
        {isMicActive && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-300 font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto">
        {transcript ? (
          <p className="text-sm text-purple-200/90 leading-relaxed wrap-break-word">
            {transcript}
          </p>
        ) : (
          <p className="text-sm text-purple-200/40 italic">
            {isMicActive
              ? "Listening... Start speaking when you see this message."
              : isAISpeaking
                ? "Waiting for AI to finish speaking..."
                : "Answer will appear here once you start speaking"}
          </p>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-3 pt-3 border-t border-purple-500/10">
        <p className="text-xs text-purple-200/50">
          {isMicActive
            ? "🎤 Your microphone is active"
            : "Ready for your response"}
        </p>
      </div>
    </div>
  );
};
