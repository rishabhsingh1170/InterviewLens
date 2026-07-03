import React, { useEffect, useRef } from "react";
import { useInterviewStore } from "../../stores/interviewStore";

export const WebcamPreview = () => {
  const videoRef = useRef(null);
  const {
    mediaStream,
    recordingState,
    currentAnswerDuration,
    isMicActive,
    isAISpeaking,
    permissionError,
  } = useInterviewStore();

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Camera Preview */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden border-2 border-purple-500/20">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay Status Indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* Recording Indicator */}
          {recordingState === "recording" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-white">REC</span>
            </div>
          )}

          {/* Mic Active Indicator */}
          {isMicActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <path d="M4 15a2 2 0 104 0H4zm6 0a2 2 0 104 0h-4zm2-5a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span className="text-xs font-semibold text-white">MIC</span>
            </div>
          )}

          {/* AI Speaking Indicator */}
          {isAISpeaking && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/80 backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5.5C2 3.57 3.57 2 5.5 2h9C16.43 2 18 3.57 18 5.5v9c0 1.93-1.57 3.5-3.5 3.5h-9C3.57 18 2 16.43 2 14.5v-9z" />
              </svg>
              <span className="text-xs font-semibold text-white">
                AI SPEAKING
              </span>
            </div>
          )}
        </div>

        {/* Answer Duration Timer */}
        {isMicActive && (
          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-black/70 backdrop-blur-sm border border-purple-500/30">
            <span className="text-sm font-mono font-bold text-purple-300">
              {formatTime(currentAnswerDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-4 p-3 rounded-lg bg-linear-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/10">
        <p className="text-xs text-purple-200/60">
          {mediaStream
            ? "✓ Camera & Microphone Connected"
            : "○ Waiting for camera connection"}
        </p>
        {permissionError && (
          <p className="mt-2 text-xs text-red-300">{permissionError}</p>
        )}
      </div>
    </div>
  );
};
