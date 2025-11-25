"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2, Activity, Wifi, WifiOff } from "lucide-react";
import VoiceFeedbackPrevention from "@/lib/voice/voice-feedback-prevention";
// import { Analytics } from "../../lib/analytics/supabaseAnalytics"; // Disabled for Vercel build

interface ContinuousConversationProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onAudioLevelChange?: (amplitude: number, isSpeaking: boolean) => void; // Audio amplitude callback for visualization
  isProcessing?: boolean;
  isSpeaking?: boolean; // When Maya is speaking
  autoStart?: boolean; // Start listening immediately
  silenceThreshold?: number; // Silence detection threshold in ms (default 2000)
  vadSensitivity?: number; // Voice activity detection sensitivity 0-1
}

export interface ContinuousConversationRef {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  extendRecording: () => void; // Reset silence timer to keep recording longer
  isListening: boolean;
  isRecording: boolean;
}

export const ContinuousConversation = forwardRef<ContinuousConversationRef, ContinuousConversationProps>((props, ref) => {
  const {
    onTranscript,
    onInterimTranscript,
    onRecordingStateChange,
    onAudioLevelChange,
    isProcessing = false,
    isSpeaking = false,
    autoStart = false, // Changed default to false to avoid initialization issues
    silenceThreshold = 6000, // 6s to capture full thoughts and complex sentences - increased for longer pauses
    vadSensitivity = 0.3
  } = props;

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelRef = useRef<number>(0); // Use ref for animation frame updates
  const lastAudioLevelUpdate = useRef<number>(0); // Throttle UI updates
  const micStreamRef = useRef<MediaStream | null>(null);
  const lastSpeechTime = useRef<number>(Date.now());
  const accumulatedTranscript = useRef<string>("");
  const isProcessingRef = useRef(false);
  const isSpeakingRef = useRef(false); // Track isSpeaking via ref to avoid stale closures
  const isListeningRef = useRef(false); // Track isListening via ref to avoid stale closures
  const isRecordingRef = useRef(false); // Track isRecording via ref to avoid stale closures
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<string>("");
  const lastSentTimeRef = useRef<number>(0); // Track when we last sent a transcript
  const isCallingProcessRef = useRef(false); // CRITICAL: Prevent concurrent processAccumulatedTranscript calls
  const isRestartingRef = useRef(false);
  const networkErrorCount = useRef<number>(0);
  const lastNetworkErrorTime = useRef<number>(0);
  const consecutiveRestartCount = useRef<number>(0); // Prevent infinite restart loops

  // 🎯 ADAPTIVE SILENCE DETECTION - Monitor audio levels for natural speech pauses
  const isSpeakingNowRef = useRef(false); // Track if user is actively speaking based on audio levels
  const silenceStartTimeRef = useRef<number>(0); // When silence began
  const hasSpokenRef = useRef(false); // Track if user has spoken at all (to differentiate from background noise)
  const adaptiveSilenceThreshold = 2500; // 2.5 seconds for thinking pauses - respectful, not rushed

  // Function refs to avoid temporal dead zone in useImperativeHandle
  const startListeningFnRef = useRef<() => void>();
  const stopListeningFnRef = useRef<() => void>();
  const toggleListeningFnRef = useRef<() => void>();
  const extendRecordingFnRef = useRef<() => void>();

  // Auto-restart listening when Maya stops speaking, but with timeout to stop if no response
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // DISABLED: Auto-restart causes echo loops - OracleConversation handles restart via startListening()
  // useEffect(() => {
  //   if (!isSpeaking && isListening && !isRecording && !isProcessing) {
  //     console.log('🎤 Maya stopped speaking, restarting microphone...');
  //     setTimeout(() => {
  //       if (recognitionRef.current && isListening && !isRecording && !isSpeaking) {
  //         recognitionRef.current.start();
  //       }
  //     }, 2000);
  //   }
  // }, [isSpeaking, isListening, isRecording, isProcessing]);

  // Safari browser detection
  const isSafari = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  // Initialize Web Speech API
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;

    // SAFARI FIX: Safari requires webkitSpeechRecognition specifically
    const SpeechRecognition = isSafari()
      ? (window as any).webkitSpeechRecognition
      : (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported - Safari needs webkitSpeechRecognition');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Enable continuous listening
    recognition.interimResults = true; // Get real-time interim results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3; // Increased for better accuracy

    // CRITICAL: Register with feedback prevention to stop mic when Maya speaks
    const feedbackPrevention = VoiceFeedbackPrevention.getInstance();
    feedbackPrevention.registerRecognition(recognition);
    console.log('✅ [ContinuousConversation] Registered with VoiceFeedbackPrevention');

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref immediately
      onRecordingStateChange?.(true);
      accumulatedTranscript.current = "";

      // Reset consecutive restart count on successful start
      consecutiveRestartCount.current = 0;

      // Clear conversation timeout when user starts speaking
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
        conversationTimeoutRef.current = null;
      }

      // Set timeout to auto-stop recognition after 60 seconds (increased for long reflections)
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      recognitionTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          // Only stop if no speech detected for a while
          const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
          if (timeSinceLastSpeech > 8000) {
            recognitionRef.current.stop();
          } else {
            // Reset the timeout if there was recent speech
            recognitionTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                recognitionRef.current.stop();
              }
            }, 20000);
          }
        }
      }, 60000);
    };

    recognition.onresult = (event: any) => {
      console.log('🎤 [onresult] FIRED - event:', event.results.length, 'results');

      // 🛑 INTERRUPT: If user starts speaking while MAIA is talking, interrupt MAIA immediately
      if (isSpeakingRef.current) {
        console.log('🛑 [INTERRUPT] User speaking while MAIA talks - interrupting MAIA');
        const feedbackPrevention = VoiceFeedbackPrevention.getInstance();
        feedbackPrevention.interruptMaya();
        isSpeakingRef.current = false; // Update ref immediately
      }

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        console.log(`  Result [${i}]: "${transcript}" (isFinal: ${isFinal})`);

        if (isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update speech time on any speech
      if (interimTranscript || finalTranscript) {
        lastSpeechTime.current = Date.now();

        // CRITICAL FIX: Accumulate final transcripts, but only show latest interim
        if (finalTranscript) {
          console.log('✅ Got FINAL transcript:', finalTranscript);
          // ACCUMULATE final transcripts - this lets us capture across browser restarts
          if (accumulatedTranscript.current) {
            accumulatedTranscript.current += ' ' + finalTranscript.trim();
          } else {
            accumulatedTranscript.current = finalTranscript.trim();
          }
        } else if (interimTranscript) {
          console.log('📝 Got INTERIM transcript:', interimTranscript);
          // For interim, show accumulated finals + current interim
          // This gives live feedback while preserving finals
          const currentInterim = interimTranscript.trim();
          // Don't modify accumulatedTranscript for interim - just pass to callback
        }

        console.log('📊 Accumulated so far:', accumulatedTranscript.current);

        // Reset silence timer on speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Start new silence timer - use the configurable threshold
        console.log(`⏱️ Starting silence timer (${silenceThreshold}ms)`);
        silenceTimerRef.current = setTimeout(() => {
          console.log('🔕 Silence detected - processing transcript');
          console.log('   isProcessingRef:', isProcessingRef.current);
          console.log('   accumulatedTranscript:', accumulatedTranscript.current);
          // CRITICAL FIX: Don't check isRecording - onend fires before this timer
          // Just check if we have a transcript to send
          if (!isProcessingRef.current && accumulatedTranscript.current.trim()) {
            processAccumulatedTranscript();
          } else {
            console.log('⚠️ Silence timer fired but conditions not met to process');
          }
        }, silenceThreshold); // Use configurable threshold from props
      }

      // Show user the accumulated finals + current interim for live feedback
      if (interimTranscript) {
        const fullTranscript = accumulatedTranscript.current
          ? accumulatedTranscript.current + ' ' + interimTranscript
          : interimTranscript;
        onInterimTranscript?.(fullTranscript);
      } else if (finalTranscript) {
        // Also update interim display when we get finals
        onInterimTranscript?.(accumulatedTranscript.current);
      }
    };

    recognition.onerror = (event: any) => {
      // Only log critical errors (not no-speech or aborted, which are common)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('❌ [Continuous] Speech recognition error:', event.error);
      }

      if (event.error === 'no-speech') {
        // DISABLED: Don't process here - silence timer already handles it
        // Processing here causes DOUBLE TRANSCRIPTION bug
        // if (accumulatedTranscript.current.trim()) {
        //   processAccumulatedTranscript();
        // }
        // No-speech is normal in continuous mode, auto-restart happens in onend
      } else if (event.error === 'network') {
        networkErrorCount.current++;
        lastNetworkErrorTime.current = Date.now();

        if (networkErrorCount.current >= 5) {
          console.error('🚫 Too many network errors (5+), stopping recognition');
          setIsListening(false);
          // TODO: Show user-friendly toast message
          return;
        }

        console.warn(`⚠️ Network error in speech recognition (${networkErrorCount.current}/5), will retry with backoff`);
        // Network errors will be retried by the auto-restart mechanism with exponential backoff
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.error('🚫 Microphone permission denied');
        // Stop listening permanently if permission denied
        setIsListening(false);
        // Note: onError is not defined in props, removed the call
      } else if (event.error === 'aborted') {
        // Aborted is normal when stopping/restarting - don't log as error
        console.log('⏹️ Recognition aborted (normal during restart)');
        // Don't trigger any restart logic here - let onend handle it
      }
    };

    recognition.onend = () => {
      console.log('🏁 [onend] Recognition stopped');
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref immediately
      onRecordingStateChange?.(false);

      // Clear timeout
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
      }

      // CRITICAL: Prevent infinite restart loop
      // Check if already restarting to prevent multiple simultaneous attempts
      if (isRestartingRef.current) {
        console.log('⚠️ [onend] Already restarting, skipping');
        return;
      }

      // CRITICAL FIX: Only restart if we're actively listening AND recognition wasn't manually stopped
      // Check if recognition still exists - if it was set to null, that means stopListening was called
      if (!recognitionRef.current) {
        console.log('🚫 [onend] Recognition object is null, this was a manual stop');
        return;
      }

      // PREVENT RESTART LOOP: Stop if we've restarted too many times consecutively
      consecutiveRestartCount.current += 1;
      if (consecutiveRestartCount.current > 0) { // EMERGENCY FIX: Stop any restart loop immediately
        console.log('🛑 [onend] Preventing restart loop, count:', consecutiveRestartCount.current);
        setIsListening(false);
        return;
      }

      // Only restart if we're actively listening and not processing/speaking
      // CRITICAL: Use refs instead of closure state to avoid stale values
      if (isListeningRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
        // Calculate backoff delay based on network error count
        const timeSinceLastError = Date.now() - lastNetworkErrorTime.current;

        // Reset error count if it's been more than 30 seconds since last error
        if (timeSinceLastError > 30000) {
          networkErrorCount.current = 0;
        }

        // Exponential backoff: 300ms, 600ms, 1200ms, 2400ms, 4800ms
        const backoffDelay = networkErrorCount.current > 0
          ? Math.min(300 * Math.pow(2, networkErrorCount.current - 1), 5000)
          : 300;

        console.log(`🔄 [onend] Will restart recognition after ${backoffDelay}ms delay (errors: ${networkErrorCount.current})...`);
        isRestartingRef.current = true;

        setTimeout(() => {
          // Triple-check conditions before restart to prevent race conditions
          // CRITICAL: Use refs to check current state, not stale closure values
          if (recognitionRef.current && isListeningRef.current && !isRecordingRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
            try {
              recognitionRef.current.start();
              console.log('✅ [onend] Recognition restarted');
            } catch (err: any) {
              // If start fails, it's likely already running or in a bad state
              console.log('⚠️ [onend] Could not restart recognition:', err.message);
              // Don't retry to avoid infinite loop
            }
          } else {
            console.log('🚫 [onend] Conditions changed, not restarting. State:', {
              hasRecognition: !!recognitionRef.current,
              isListening: isListeningRef.current,
              isRecording: isRecordingRef.current,
              isProcessing: isProcessingRef.current,
              isSpeaking: isSpeakingRef.current
            });
          }
          // Clear the restarting flag
          isRestartingRef.current = false;
        }, backoffDelay);
      } else {
        console.log('🚫 [onend] Not restarting - conditions not met. State:', {
          isListening: isListeningRef.current,
          isProcessing: isProcessingRef.current,
          isSpeaking: isSpeakingRef.current,
          reason: !isListeningRef.current ? 'NOT_LISTENING' :
                  isProcessingRef.current ? 'IS_PROCESSING' :
                  isSpeakingRef.current ? 'IS_SPEAKING' : 'UNKNOWN'
        });
      }
    };

    return recognition;
  }, [silenceThreshold, onInterimTranscript, onRecordingStateChange, isSafari]);

  // Sync props and state to refs to avoid stale closures in recognition callbacks
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 🔇 CRITICAL: Stop recognition when MAIA starts speaking to prevent voice feedback loop
  useEffect(() => {
    if (isSpeaking && recognitionRef.current) {
      console.log('🔇 [Voice Feedback Prevention] MAIA started speaking - stopping STT');
      try {
        // Always stop recognition when MAIA speaks, regardless of isRecording state
        recognitionRef.current.stop();
        setIsRecording(false);
        isProcessingRef.current = false; // Clear processing flag
      } catch (err) {
        console.warn('⚠️ [Voice Feedback Prevention] Error stopping recognition:', err);
      }
    }
  }, [isSpeaking]);

  // 🎤 DISABLED: Auto-restart via useEffect - the onend handler already handles restart
  // This was causing duplicate restart attempts and race conditions
  // The recognition.onend handler (above) is the single source of truth for restarts
  // useEffect(() => {
  //   if (!isSpeaking && !isRecording && isListening && recognitionRef.current) {
  //     isProcessingRef.current = false;
  //     const restartTimer = setTimeout(() => {
  //       if (recognitionRef.current && !isRecording && !isSpeaking && isListening) {
  //         try {
  //           recognitionRef.current.start();
  //           setIsRecording(true);
  //           console.log('✅ [effect] Recognition restarted after Maya stopped speaking');
  //         } catch (err: any) {
  //           if (!err?.message?.includes('already started')) {
  //             console.warn('⚠️ [Voice Feedback Prevention] Error restarting recognition:', err);
  //           }
  //         }
  //       }
  //     }, 2000);
  //     return () => clearTimeout(restartTimer);
  //   }
  // }, [isSpeaking, isRecording, isListening]);

  // Process accumulated transcript
  const processAccumulatedTranscript = useCallback(() => {
    // CRITICAL: Prevent concurrent calls - use a synchronous flag
    if (isCallingProcessRef.current) {
      console.log('🚫 [GUARD] Blocked concurrent processAccumulatedTranscript call');
      return;
    }
    isCallingProcessRef.current = true;

    const transcript = accumulatedTranscript.current.trim();
    console.log('🔄 [processAccumulatedTranscript] Called with:', transcript);

    if (!transcript) {
      console.log('⚠️ [processAccumulatedTranscript] No transcript to process');
      isCallingProcessRef.current = false;
      return;
    }

    // CRITICAL FIX: If already processing, don't retry - just skip
    if (isProcessingRef.current) {
      console.log('⏳ [ContinuousConversation] Already processing, skipping');
      isCallingProcessRef.current = false;
      return;
    }
    
    // ✅ CRITICAL: Prevent duplicate sends with multiple checks
    const now = Date.now();
    const normalizedTranscript = transcript.toLowerCase().trim();
    const lastSentNormalized = lastSentRef.current.toLowerCase().trim();

    // Check 1: Exact match within last 2 seconds
    if (normalizedTranscript === lastSentNormalized && (now - lastSentTimeRef.current) < 2000) {
      console.log('🚫 [DEDUP] Blocked duplicate transcript:', transcript);
      accumulatedTranscript.current = ""; // Clear duplicate
      return;
    }

    // Check 2: Very similar transcript (>90% match) within last 1 second
    if (lastSentNormalized && (now - lastSentTimeRef.current) < 1000) {
      const similarity = normalizedTranscript.length > 0
        ? normalizedTranscript.split(' ').filter(word => lastSentNormalized.includes(word)).length / normalizedTranscript.split(' ').length
        : 0;
      if (similarity > 0.9) {
        console.log('🚫 [DEDUP] Blocked similar transcript (similarity:', similarity, '):', transcript);
        accumulatedTranscript.current = ""; // Clear duplicate
        isCallingProcessRef.current = false;
        return;
      }
    }

    // Check 3: Echo/Feedback Prevention - Block MAIA's own voice patterns
    // Common MAIA response patterns that indicate echo/feedback loop
    const maiaPatterns = [
      'mmm', 'yes', 'there\'s something', 'i can feel', 'what\'s alive',
      'i notice', 'i\'m curious', 'what does', 'how does that feel',
      'where do you feel', 'in your body', 'that sensation', 'pause',
      'what\'s it like', 'like...', 'suspension', 'quality of'
    ];

    const looksLikeMaiaVoice = maiaPatterns.some(pattern =>
      normalizedTranscript.includes(pattern.toLowerCase())
    );

    if (looksLikeMaiaVoice && normalizedTranscript.split(' ').length < 15) {
      console.log('🔇 [ECHO BLOCK] Transcript looks like MAIA\'s voice:', transcript);
      accumulatedTranscript.current = ""; // Clear echo
      isCallingProcessRef.current = false;
      return;
    }

    lastSentRef.current = transcript;
    lastSentTimeRef.current = now;

    isProcessingRef.current = true;

    // CRITICAL: Clear accumulated transcript IMMEDIATELY to prevent double-send
    accumulatedTranscript.current = "";

    // Stop recognition while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Send transcript
    console.log('📤 [ContinuousConversation] Sending transcript to parent:', transcript);
    onTranscript(transcript);
    console.log('✅ [ContinuousConversation] onTranscript callback completed');

    // Track analytics (disabled for Vercel build)
    // Analytics.transcriptionSuccess({
    //   transcription_duration_ms: Date.now() - lastSpeechTime.current,
    //   transcription_length: transcript.length,
    //   mode: 'continuous'
    // });

    // Reset the guard flag immediately
    isCallingProcessRef.current = false;

    // Will restart when Maya finishes speaking
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  }, [onTranscript]);

  // Initialize audio level monitoring
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      // BUGFIX: Don't request getUserMedia if we already have a stream
      // This prevents permission re-request loops on iPad Safari
      if (micStreamRef.current) {
        console.log('✅ [Continuous] Already have microphone stream, reusing');
        return true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // SAFARI FIX: Unlock audio context on Safari if needed
      if (isSafari() && audioContext.state === 'suspended') {
        console.log('🍎 [Safari] Unlocking audio context...');
        try {
          await audioContext.resume();
          console.log('✅ [Safari] Audio context unlocked successfully');
        } catch (error) {
          console.error('❌ [Safari] Failed to unlock audio context:', error);
        }
      }

      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 256;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Monitor audio levels
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const normalizedLevel = Math.min(average / 128, 1);

        // Store in ref for immediate use (no re-render)
        audioLevelRef.current = normalizedLevel;

        // Throttle state updates to 10fps (every 100ms) instead of 60fps
        const now = Date.now();
        if (now - lastAudioLevelUpdate.current > 100) {
          setAudioLevel(normalizedLevel);
          lastAudioLevelUpdate.current = now;
        }

        // 🌸 Call amplitude callback directly for holoflower visualization
        // Use ref instead of state to avoid triggering re-renders
        onAudioLevelChange?.(normalizedLevel, isRecordingRef.current);

        // 🎯 ADAPTIVE SILENCE DETECTION - Detect when user stops speaking
        // Respect thinking pauses - only send after meaningful silence
        const voiceThreshold = vadSensitivity; // Use sensitivity from props (default 0.3)
        const wasSpeaking = isSpeakingNowRef.current;
        const isSpeakingNow = normalizedLevel > voiceThreshold;

        if (isSpeakingNow && !wasSpeaking) {
          // User started speaking
          isSpeakingNowRef.current = true;
          hasSpokenRef.current = true; // Mark that we've detected real speech
          silenceStartTimeRef.current = 0;
          console.log('🗣️ [VAD] User speaking (level:', normalizedLevel.toFixed(2), ')');
        } else if (!isSpeakingNow && wasSpeaking) {
          // User paused - start silence timer (might be thinking, might be done)
          isSpeakingNowRef.current = false;
          silenceStartTimeRef.current = now;
          console.log('⏸️ [VAD] Pause detected - listening for continuation...');
        } else if (!isSpeakingNow && silenceStartTimeRef.current > 0 && hasSpokenRef.current) {
          // Check if pause has lasted long enough AND we have real content
          const silenceDuration = now - silenceStartTimeRef.current;
          if (silenceDuration >= adaptiveSilenceThreshold && accumulatedTranscript.current.trim()) {
            console.log('✅ [VAD] Natural completion detected after', silenceDuration, 'ms - sending to MAIA');
            silenceStartTimeRef.current = 0; // Reset to prevent duplicate triggers
            hasSpokenRef.current = false; // Reset for next turn
            if (!isProcessingRef.current) {
              processAccumulatedTranscript();
            }
          }
        }

        if (isListening) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
      
      return true;
    } catch (error) {
      console.error('❌ [Continuous] Microphone access error:', error);
      return false;
    }
  }, [isListening, isSafari]);

  // Start listening
  const startListening = useCallback(async () => {
    console.log('🎤 [ContinuousConversation] startListening called');

    try {
      // Initialize audio monitoring
      const audioReady = await initializeAudioMonitoring();
      if (!audioReady) {
        console.error('❌ [ContinuousConversation] Audio monitoring failed');
        // Don't show alert - let parent component handle error state
        throw new Error('MICROPHONE_UNAVAILABLE');
      }

      console.log('✅ [ContinuousConversation] Audio monitoring ready');

    // Initialize speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
      console.log('🔧 [ContinuousConversation] Speech recognition initialized');
    }

    if (recognitionRef.current) {
      setIsListening(true);
      isListeningRef.current = true; // Update ref immediately to avoid timing issues
      isProcessingRef.current = false;

      try {
        recognitionRef.current.start();
        console.log('🎙️ [ContinuousConversation] Recognition started');

        // Track analytics (disabled for Vercel build)
        // Analytics.startRecording({
        //   timestamp: new Date().toISOString(),
        //   mode: 'continuous',
        //   user_agent: window.navigator.userAgent
        // });
      } catch (err: any) {
        // Ignore "already started" errors since the onend handler will manage restart
        if (err?.message?.includes('already started')) {
          console.log('⏸️ [ContinuousConversation] Recognition already active');
        } else {
          console.error('❌ [ContinuousConversation] Error starting recognition:', err);
        }
      }
    }
    } catch (error: any) {
      console.error('❌ [ContinuousConversation] Failed to start listening:', error);
      // Reset state on error
      setIsListening(false);
      isListeningRef.current = false;
      throw error; // Re-throw so parent component can handle
    }
  }, [initializeSpeechRecognition, initializeAudioMonitoring]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('🛑 [ContinuousConversation] stopListening called');

    setIsListening(false);
    isListeningRef.current = false; // Update ref immediately
    setIsRecording(false);
    isRecordingRef.current = false; // Update ref immediately
    setAudioLevel(0);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }

    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
      conversationTimeoutRef.current = null;
    }

    // Stop audio monitoring
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Track analytics (disabled for Vercel build)
    // Analytics.stopRecording({
    //   recording_duration_ms: Date.now() - lastSpeechTime.current,
    //   success: true,
    //   mode: 'continuous'
    // });
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    console.log('🔄 [ContinuousConversation] toggleListening called - isListening:', isListeningRef.current);
    if (isListeningRef.current) {
      console.log('⏹️ [ContinuousConversation] Stopping listening');
      stopListening();
    } else {
      console.log('▶️ [ContinuousConversation] Starting listening');
      startListening();
    }
  }, [startListening, stopListening]);

  // Extend recording - reset silence timer to keep recording longer
  const extendRecording = useCallback(() => {
    console.log('⏱️ [extendRecording] Resetting silence timer');

    // Clear existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Restart silence timer with full threshold
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔕 Silence detected after extension - processing transcript');
      if (!isProcessingRef.current && accumulatedTranscript.current.trim()) {
        processAccumulatedTranscript();
      }
    }, silenceThreshold);
  }, [silenceThreshold, processAccumulatedTranscript]);

  // Assign functions to refs after they're defined
  useEffect(() => {
    startListeningFnRef.current = startListening;
    stopListeningFnRef.current = stopListening;
    toggleListeningFnRef.current = toggleListening;
    extendRecordingFnRef.current = extendRecording;
  }, [startListening, stopListening, toggleListening, extendRecording]);

  // Expose methods to parent via refs (avoids temporal dead zone)
  useImperativeHandle(ref, () => ({
    startListening: () => startListeningFnRef.current?.(),
    stopListening: () => stopListeningFnRef.current?.(),
    toggleListening: () => toggleListeningFnRef.current?.(),
    extendRecording: () => extendRecordingFnRef.current?.(),
    isListening,
    isRecording
  }), [isListening, isRecording]);

  // DISABLED: Auto-start temporarily disabled to fix initialization issues
  // TODO: Re-enable with proper initialization order
  // const hasMountedRef = useRef(false);
  // useEffect(() => {
  //   if (!hasMountedRef.current) {
  //     hasMountedRef.current = true;
  //     if (autoStart && !isListening && !isSpeaking && !isProcessing) {
  //       const timer = setTimeout(() => {
  //         if (typeof startListening === 'function') {
  //           startListening();
  //         }
  //       }, 1000);
  //       return () => clearTimeout(timer);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // 🎤 DISABLED: All restart logic is now handled by recognition.onend
  // User-initiated restarts happen via parent component calling startListening()
  // This prevents infinite loop issues

  // DISABLED: This was causing infinite loop - onAudioLevelChange triggers setState in parent
  // which re-renders, which calls this effect again with onAudioLevelChange recreated
  // useEffect(() => {
  //   if (onAudioLevelChange) {
  //     onAudioLevelChange(audioLevel, isRecording);
  //   }
  // }, [audioLevel, isRecording, onAudioLevelChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  // Visual states
  const isActive = isListening && !isSpeaking && !isProcessing;
  const showLoader = isTranscribing || isProcessing;

  return (
    <div className="flex items-center gap-3">
      {/* Main control button */}
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`
          relative p-3 rounded-lg transition-all
          ${isListening 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isListening ? 'Stop continuous listening' : 'Start continuous listening'}
      >
        {showLoader ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isListening && (
          <>
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              {isRecording ? 'Listening...' : 
               isSpeaking ? 'Maya speaking...' : 
               isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </>
        )}
      </div>

      {/* Audio level indicator */}
      {isListening && isRecording && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-${Math.max(1, Math.floor(audioLevel * 5) - i)} 
                         bg-green-400/60 rounded-full transition-all duration-100`}
              style={{ height: `${Math.max(4, audioLevel * 20 * (1 - i * 0.15))}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ContinuousConversation.displayName = 'ContinuousConversation';