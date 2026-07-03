import { useEffect, useState, useRef } from "react";
import { useInterviewStore } from "../stores/interviewStore";

export const useMediaRecorder = () => {
  const {
    mediaStream,
    setMediaStream,
    setMediaRecorder,
    addRecordedChunk,
    recordedChunks,
    setRecordedChunks,
  } = useInterviewStore();

  const [recordingActive, setRecordingActive] = useState(false);
  const mediaRecorderRef = useRef(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMediaStream(stream);
      return stream;
    } catch (error) {
      console.error("Permission error:", error);
      throw new Error("Failed to access camera/microphone: " + error.message);
    }
  };

  const startRecording = async (stream) => {
    if (!stream) return;

    try {
      const options = {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      };

      // Fallback mime types
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm;codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm";
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "";
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          addRecordedChunk(event.data);
        }
      };

      recorder.onstop = () => {
        console.log("Recording stopped");
      };

      recorder.start();
      setRecordingActive(true);
      return recorder;
    } catch (error) {
      console.error("Recording start error:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return null;

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      recorder.onstop = () => {
        resolve(new Blob(recordedChunks, { type: "video/webm" }));
      };

      recorder.stop();
      setRecordingActive(false);
    });
  };

  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    mediaRecorderRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  return {
    recordingActive,
    requestPermissions,
    startRecording,
    stopRecording,
    stopMediaStream,
    resetRecording,
    mediaStream,
  };
};
