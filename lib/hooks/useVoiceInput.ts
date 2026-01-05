import { useState, useCallback, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as CapacitorSpeechRecognition } from '@capacitor-community/speech-recognition';

interface UseVoiceInputOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onAutoStop?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  silenceTimeoutMs?: number;
  minSpeechLengthChars?: number;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput({
  onResult,
  onAutoStop,
  onError,
  continuous = true,
  interimResults = true,
  language = 'en-US',
  silenceTimeoutMs = 1200,
  minSpeechLengthChars = 3
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(0);
  const isNativeRef = useRef<boolean>(false);
  const capacitorListenerRef = useRef<any>(null);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    isNativeRef.current = isNative;

    // Native iOS/Android: Use Capacitor Speech Recognition plugin
    if (isNative) {
      console.log('🎤 Using native Capacitor speech recognition');

      // Check availability first
      CapacitorSpeechRecognition.available().then((result) => {
        console.log('🎤 Speech recognition available:', result.available);
        if (!result.available) {
          setError('Speech recognition not available on this device');
          setIsSupported(false);
          return;
        }
        setIsSupported(true);
      }).catch((err) => {
        console.error('🎤 Availability check failed:', err);
        setIsSupported(false);
      });

      // Request permission on init
      CapacitorSpeechRecognition.requestPermissions().then((result) => {
        console.log('🎤 Speech recognition permission:', result.speechRecognition);
        if (result.speechRecognition !== 'granted') {
          setError('Microphone permission denied. Please enable in Settings.');
          setIsSupported(false);
        }
      }).catch((err) => {
        console.error('🎤 Permission request failed:', err);
      });

      // Add listening state listener for debugging
      CapacitorSpeechRecognition.addListener('listeningState', (data) => {
        console.log('🎤 Listening state changed:', data.status);
        if (data.status === 'started') {
          setIsRecording(true);
        } else if (data.status === 'stopped') {
          setIsRecording(false);
        }
      });

      return () => {
        // Cleanup native listeners
        CapacitorSpeechRecognition.removeAllListeners();
      };
    }

    // Web: Use browser Speech Recognition API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          setError(null);
          console.log('Voice recognition started');
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let currentConfidence = 0;
          let hasFinalResult = false;

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result[0]) {
              const resultText = result[0].transcript;
              currentConfidence = Math.max(currentConfidence, result[0].confidence || 0);

              if (result.isFinal) {
                finalTranscriptRef.current += resultText + ' ';
                hasFinalResult = true;
                lastSpeechTimeRef.current = Date.now();
              } else {
                interimTranscript += resultText;
                lastSpeechTimeRef.current = Date.now();
              }
            }
          }

          // Combine final and interim text for display
          const fullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
          setTranscript(fullTranscript);
          setConfidence(currentConfidence);
          onResult(fullTranscript, hasFinalResult);

          // Clear existing silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Set new silence timeout for auto-stop
          if (continuous && (hasFinalResult || interimTranscript)) {
            silenceTimeoutRef.current = setTimeout(() => {
              const finalText = finalTranscriptRef.current.trim();
              if (finalText.length >= minSpeechLengthChars) {
                console.log(`🎤 Auto-stopping after ${silenceTimeoutMs}ms silence`);
                recognition.stop();
                onAutoStop?.(finalText);
              }
            }, silenceTimeoutMs);
          }

          // Auto-stop after getting final result (for non-continuous mode)
          if (hasFinalResult && !continuous) {
            recognition.stop();
          }
        };

        recognition.onerror = (event) => {
          let errorMessage = 'Voice recognition error';

          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not accessible. Please check permissions.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone permission denied.';
              break;
            case 'network':
              errorMessage = 'Network error during voice recognition.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Voice recognition service not available.';
              break;
            case 'bad-grammar':
              errorMessage = 'Grammar error in voice recognition.';
              break;
            case 'language-not-supported':
              errorMessage = `Language "${language}" not supported.`;
              break;
            default:
              errorMessage = `Voice recognition error: ${event.error}`;
          }

          console.error('Speech recognition error:', event.error);
          setError(errorMessage);
          setIsRecording(false);
          onError?.(errorMessage);
        };

        recognition.onend = () => {
          setIsRecording(false);
          console.log('Voice recognition ended');
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [continuous, interimResults, language, onResult, onError]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition not supported';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Native: Use Capacitor plugin
    if (isNativeRef.current) {
      try {
        setTranscript('');
        setConfidence(0);
        setError(null);
        finalTranscriptRef.current = '';
        lastSpeechTimeRef.current = Date.now();

        console.log('🎤 Starting native speech recognition...');

        // Check if already listening
        const listeningStatus = await CapacitorSpeechRecognition.isListening();
        if (listeningStatus.listening) {
          console.log('🎤 Already listening, stopping first...');
          await CapacitorSpeechRecognition.stop();
        }

        // Set up listener for partial results BEFORE starting
        capacitorListenerRef.current = await CapacitorSpeechRecognition.addListener(
          'partialResults',
          (data: { matches: string[] }) => {
            console.log('🎤 Partial results received:', data.matches);
            if (data.matches && data.matches.length > 0) {
              const text = data.matches[0];
              lastSpeechTimeRef.current = Date.now();
              setTranscript(text);
              onResult(text, false);

              // Clear existing silence timeout
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
              }

              // Set silence timeout for auto-stop
              silenceTimeoutRef.current = setTimeout(() => {
                const finalText = text.trim();
                if (finalText.length >= minSpeechLengthChars) {
                  console.log(`🎤 Auto-stopping native after ${silenceTimeoutMs}ms silence`);
                  CapacitorSpeechRecognition.stop();
                  setIsRecording(false);
                  onAutoStop?.(finalText);
                }
              }, silenceTimeoutMs);
            }
          }
        );

        // Start recognition with explicit options
        console.log('🎤 Calling CapacitorSpeechRecognition.start()...');
        const result = await CapacitorSpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          popup: false,
          maxResults: 5
        });
        console.log('🎤 Start result:', result);

        setIsRecording(true);

        // Set max recording timeout
        timeoutRef.current = setTimeout(async () => {
          console.log('🎤 Max timeout reached, stopping...');
          const stillListening = await CapacitorSpeechRecognition.isListening();
          if (stillListening.listening) {
            await CapacitorSpeechRecognition.stop();
            setIsRecording(false);
          }
        }, 30000);

      } catch (error: any) {
        console.error('🎤 Failed to start native recognition:', error);
        const errorMsg = error?.message || 'Failed to start voice recording';
        setError(errorMsg);
        setIsRecording(false);
        onError?.(errorMsg);
      }
      return;
    }

    // Web: Use browser API
    if (!recognitionRef.current || isRecording) return;

    try {
      setTranscript('');
      setConfidence(0);
      setError(null);
      finalTranscriptRef.current = '';
      lastSpeechTimeRef.current = Date.now();
      recognitionRef.current.start();

      // Set a timeout to automatically stop recording after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
      }, 30000);

    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice recording');
      onError?.('Failed to start voice recording');
    }
  }, [isSupported, isRecording, onError, language, silenceTimeoutMs, minSpeechLengthChars, onResult, onAutoStop]);

  const stopRecording = useCallback(async () => {
    // Native: Use Capacitor plugin
    if (isNativeRef.current) {
      try {
        await CapacitorSpeechRecognition.stop();
        if (capacitorListenerRef.current) {
          capacitorListenerRef.current.remove();
          capacitorListenerRef.current = null;
        }
      } catch (error) {
        console.error('🎤 Failed to stop native recognition:', error);
      }
      setIsRecording(false);
    } else {
      // Web: Use browser API
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setError(null);
    finalTranscriptRef.current = '';
    lastSpeechTimeRef.current = 0;
  }, []);

  return {
    isRecording,
    isSupported,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
    resetTranscript
  };
}