import { useRef, useState } from "react";
import { useInterviewStore } from "../stores/interviewStore";
import interviewAPI from "../services/interviewAPI";

export const useWhisperTranscription = () => {
  const { setTranscript, setPermissionError } = useInterviewStore();
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fallbackAudioStreamRef = useRef(null);
  const audioMimeTypeRef = useRef("audio/webm");
  const recognitionRef = useRef(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const startLiveTranscription = () => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setPermissionError(
        "Live speech recognition is not supported in this browser. Final Whisper transcription will still work.",
      );
      return null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        transcript += result[0].transcript;
      }

      setTranscript(transcript.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        console.debug("Speech recognition ended without speech:", event.error);
        return;
      }

      console.error("Speech recognition error:", event.error);
      setPermissionError(
        `Speech recognition failed: ${event.error || "unknown error"}`,
      );
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      return recognition;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setPermissionError("Failed to start live transcription.");
      return null;
    }
  };

  const stopLiveTranscription = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Failed to stop speech recognition:", error);
      }
      recognitionRef.current = null;
    }
  };

  const getSupportedAudioMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];

    for (const mimeType of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return "";
  };

  const startAudioCapture = async (mediaStream) => {
    try {
      audioChunksRef.current = [];

      const audioTracks = mediaStream.getAudioTracks();
      if (!audioTracks.length) {
        throw new Error("No microphone track available for transcription.");
      }

      // Create an independent audio-only stream by cloning tracks where possible.
      let audioStream;
      try {
        if (typeof mediaStream.clone === "function") {
          const cloned = mediaStream.clone();
          audioStream = new MediaStream(cloned.getAudioTracks());
        } else {
          // Fallback: clone individual tracks if clone() exists on tracks
          const clonedTracks = audioTracks.map((t) =>
            typeof t.clone === "function" ? t.clone() : t,
          );
          audioStream = new MediaStream(clonedTracks);
        }
      } catch (err) {
        // If cloning fails, fall back to using the original audio tracks.
        console.warn(
          "Failed to clone media stream/tracks, using original tracks:",
          err,
        );
        audioStream = new MediaStream(audioTracks);
      }

      const mimeType = getSupportedAudioMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;

      let recorder;
      try {
        recorder = new MediaRecorder(audioStream, recorderOptions);
      } catch (ctorErr) {
        // Try without options
        console.warn(
          "MediaRecorder constructor failed with options, retrying without options:",
          ctorErr,
        );
        recorder = new MediaRecorder(audioStream);
      }

      audioMimeTypeRef.current = recorder.mimeType || mimeType || "audio/webm";
      audioRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      try {
        recorder.start();
      } catch (startErr) {
        console.warn(
          "MediaRecorder.start() failed, attempting fallback recorder start:",
          startErr,
        );

        // First fallback: try a new recorder from the same audio tracks without options
        try {
          const fallbackStream = new MediaStream(audioStream.getAudioTracks());
          const fallbackRecorder = new MediaRecorder(fallbackStream);
          fallbackRecorder.ondataavailable = recorder.ondataavailable;
          fallbackRecorder.start();
          audioRecorderRef.current = fallbackRecorder;
          recorder = fallbackRecorder;
        } catch (fallbackErr) {
          console.warn("Fallback recorder start failed:", fallbackErr);

          // Second fallback: request a fresh audio-only stream via getUserMedia
          try {
            if (
              !navigator.mediaDevices ||
              !navigator.mediaDevices.getUserMedia
            ) {
              throw new Error("getUserMedia not available");
            }

            const userAudioStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            // keep reference for cleanup
            fallbackAudioStreamRef.current = userAudioStream;

            const userRecorder = new MediaRecorder(userAudioStream);
            userRecorder.ondataavailable = recorder.ondataavailable;
            userRecorder.start();
            audioRecorderRef.current = userRecorder;
            recorder = userRecorder;
          } catch (userErr) {
            // Clean up any cloned tracks to avoid leaks
            try {
              audioStream.getTracks().forEach((t) => t.stop());
            } catch (stopErr) {
              console.warn(
                "Error stopping cloned tracks after failed recorder start:",
                stopErr,
              );
            }
            console.error(
              "Audio capture setup error:",
              startErr,
              fallbackErr,
              userErr,
            );
            throw startErr;
          }
        }
      }

      return { recorder };
    } catch (error) {
      console.error("Audio capture setup error:", error);
      throw error;
    }
  };

  const stopAudioCapture = async (recorder) => {
    const activeRecorder = recorder || audioRecorderRef.current;

    if (!activeRecorder) {
      return;
    }

    return new Promise((resolve) => {
      if (activeRecorder.state === "inactive") {
        resolve();
        return;
      }

      activeRecorder.onstop = () => {
        // Clean up any fallback audio stream that was created
        try {
          if (fallbackAudioStreamRef.current) {
            fallbackAudioStreamRef.current.getTracks().forEach((t) => t.stop());
            fallbackAudioStreamRef.current = null;
          }
        } catch (err) {
          console.warn("Failed to stop fallback audio stream:", err);
        }

        resolve();
      };

      activeRecorder.stop();
    });
  };

  const transcribeAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      return "";
    }

    setIsTranscribing(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: audioMimeTypeRef.current || "audio/webm",
      });
      const transcript = await interviewAPI.transcribeAudio(audioBlob);
      setTranscript(transcript || "");
      return transcript || "";
    } catch (error) {
      console.error("Transcription error:", error);
      return "";
    } finally {
      setIsTranscribing(false);
      audioChunksRef.current = [];
    }
  };

  const resetAudioCapture = () => {
    audioChunksRef.current = [];
  };

  return {
    startLiveTranscription,
    stopLiveTranscription,
    startAudioCapture,
    stopAudioCapture,
    transcribeAudio,
    resetAudioCapture,
    isTranscribing,
  };
};
