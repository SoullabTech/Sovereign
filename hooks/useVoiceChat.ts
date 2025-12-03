import { useState, useCallback, useRef, useEffect } from 'react';
import { getMayaVoiceHandler } from '@/lib/voice/maia-voice-handler';
import { useVoiceInput } from '@/lib/hooks/useVoiceInput';

interface UseVoiceChatOptions {
  onMessage: (message: string) => void;
  onManualStop?: () => void;
  autoListen?: boolean;
  conversationDepth?: 'quick' | 'normal' | 'deep';
}

interface UseVoiceChatReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  volume: number;
  error: string | null;
  toggleListening: () => void;
  speak: (text: string) => void;
  manualStop: () => void;
}

export function useVoiceChat({
  onMessage,
  onManualStop,
  autoListen = true,
  conversationDepth = 'normal'
}: UseVoiceChatOptions): UseVoiceChatReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const voiceHandlerRef = useRef(getMayaVoiceHandler());
  const volumeAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Calculate silence timeout based on conversation depth
  const silenceTimeoutMs = conversationDepth === 'quick' ? 3000 :
                          conversationDepth === 'deep' ? 8000 : 6000;

  const {
    isRecording: isListening,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript
  } = useVoiceInput({
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setFinalTranscript(transcript);
        setInterimTranscript('');
      } else {
        setInterimTranscript(transcript);
      }
    },
    onAutoStop: (finalText) => {
      if (finalText.trim()) {
        onMessage(finalText);
        setFinalTranscript('');
        setInterimTranscript('');
        resetTranscript();

        // Auto-resume listening after message if enabled
        if (autoListen && !isSpeaking) {
          setTimeout(() => {
            startRecording();
          }, 1000); // Wait 1s before resuming
        }
      }
    },
    onError: (error) => {
      console.error('Voice input error:', error);
    },
    continuous: true,
    interimResults: true,
    silenceTimeoutMs,
    minSpeechLengthChars: 3
  });

  // Set up volume monitoring
  useEffect(() => {
    if (isListening && !audioContextRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);

          audioContextRef.current = audioContext;
          volumeAnalyserRef.current = analyser;

          // Start volume monitoring
          const updateVolume = () => {
            if (volumeAnalyserRef.current && isListening) {
              const bufferLength = volumeAnalyserRef.current.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);
              volumeAnalyserRef.current.getByteFrequencyData(dataArray);

              // Calculate average volume
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setVolume(average / 128.0); // Normalize to 0-1

              requestAnimationFrame(updateVolume);
            }
          };
          updateVolume();
        })
        .catch(console.error);
    } else if (!isListening && audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      volumeAnalyserRef.current = null;
      setVolume(0);
    }
  }, [isListening]);

  // Monitor Maya's voice handler for speaking state
  useEffect(() => {
    const checkSpeakingState = () => {
      const isCurrentlySpeaking = voiceHandlerRef.current.getIsPlaying();
      setIsSpeaking(isCurrentlySpeaking);

      // Auto-resume listening after Maya finishes speaking
      if (!isCurrentlySpeaking && autoListen && !isListening) {
        setTimeout(() => {
          startRecording();
        }, 500); // Brief pause after Maya stops
      }
    };

    const interval = setInterval(checkSpeakingState, 250);
    return () => clearInterval(interval);
  }, [autoListen, isListening, startRecording]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  const speak = useCallback(async (text: string) => {
    try {
      if (isListening) {
        stopRecording(); // Stop listening while speaking
      }
      await voiceHandlerRef.current.speakResponse(text);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [isListening, stopRecording]);

  const manualStop = useCallback(() => {
    if (isListening) {
      stopRecording();
      const currentTranscript = finalTranscript || transcript;
      if (currentTranscript.trim()) {
        onMessage(currentTranscript.trim());
        setFinalTranscript('');
        setInterimTranscript('');
        resetTranscript();
      }
      onManualStop?.();
    }
  }, [isListening, stopRecording, finalTranscript, transcript, onMessage, onManualStop, resetTranscript]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript: finalTranscript || transcript,
    interimTranscript,
    volume,
    error,
    toggleListening,
    speak,
    manualStop
  };
}