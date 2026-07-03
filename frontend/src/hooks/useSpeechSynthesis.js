import { useEffect, useRef } from "react";
import { useInterviewStore } from "../stores/interviewStore";

export const useSpeechSynthesis = () => {
  const { setIsAISpeaking } = useInterviewStore();
  const utteranceRef = useRef(null);
  const synth = window.speechSynthesis;

  const getPreferredVoice = () => {
    const voices = synth.getVoices();

    if (!voices.length) {
      return null;
    }

    return (
      voices.find(
        (voice) => voice.lang && voice.lang.toLowerCase().startsWith("en"),
      ) || voices[0]
    );
  };

  const speakQuestion = (question, onEnd) => {
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(question);
      const preferredVoice = getPreferredVoice();

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang || "en-US";
      }

      utterance.onstart = () => {
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        if (
          event.error === "interrupted" ||
          event.error === "canceled" ||
          event.error === "aborted"
        ) {
          setIsAISpeaking(false);
          resolve();
          return;
        }

        console.error("Speech synthesis error:", event.error);
        setIsAISpeaking(false);
        if (onEnd) onEnd();
        resolve();
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    });
  };

  const cancelSpeech = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsAISpeaking(false);
    }
  };

  const isSpeaking = () => {
    return synth.speaking;
  };

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  return {
    speakQuestion,
    cancelSpeech,
    isSpeaking,
  };
};
