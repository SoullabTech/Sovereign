"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2, Activity, Wifi, WifiOff, AlertCircle } from "lucide-react";
import VoiceFeedbackPrevention from "@/lib/voice/voice-feedback-prevention";
import { getPlatformInfo, getVoiceUnavailableMessage, type PlatformInfo } from "@/lib/utils/platformDetection";
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { VoiceController } from '@/lib/voice/AudioSessionManager';
// import { Analytics } from "../../lib/analytics/supabaseAnalytics"; // Disabled for Vercel build

export interface ContinuousConversationProps {
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
    autoStart = false, // Disabled to prevent infinite restart loops
    silenceThreshold = 8000, // 8s to capture full thoughts - generous buffer so user doesn't feel rushed
    vadSensitivity = 0.3
  } = props;

  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]); // On-screen debug for iOS
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Disabled - was interfering with mic activation

  // Helper to add debug messages (visible on screen for iOS debugging)
  const addDebug = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullMsg = `[${timestamp}] ${msg}`;
    console.log('🐛 [DEBUG]', msg);
    setDebugLog(prev => [...prev.slice(-14), fullMsg]); // Keep last 15 messages for better diagnosis
  }, []);

  const recognitionRef = useRef<any>(null);
  const useNativeSpeechRef = useRef<boolean>(Capacitor.isNativePlatform()); // Use native speech on iOS/Android
  const nativeListenerRef = useRef<any>(null); // Store native listener handle
  const nativeStateListenerRef = useRef<any>(null); // Store listeningState listener handle
  const nativeAudioLevelListenerRef = useRef<any>(null); // Store audioLevel listener handle for UV visualizer
  const nativeSilenceTimerRef = useRef<NodeJS.Timeout | null>(null); // Silence detection timer for auto-submit
  const nativeStatusRef = useRef<'started' | 'stopped'>('stopped'); // 🔑 Single source of truth for native listening state
  const smoothedAudioLevelRef = useRef<number>(0); // EMA-smoothed audio level for UV visualizer
  const lastHighAudioTimeRef = useRef<number>(0); // Track when we last had speech (for silence detection)
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
  const consecutiveRestartCount = useRef<number>(0);
  const lastRestartTime = useRef<number>(0);
  const recognitionStartTime = useRef<number>(0);

  // 🎯 ADAPTIVE SILENCE DETECTION - Monitor audio levels for natural speech pauses
  const isSpeakingNowRef = useRef(false); // Track if user is actively speaking based on audio levels
  const silenceStartTimeRef = useRef<number>(0); // When silence began
  const hasSpokenRef = useRef(false); // Track if user has spoken at all (to differentiate from background noise)
  const adaptiveSilenceThreshold = 3500; // 3.5 seconds - generous buffer for natural pauses and thinking

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
      recognitionStartTime.current = Date.now(); // Track when recognition actually started
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref immediately
      onRecordingStateChange?.(true);
      accumulatedTranscript.current = "";

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

      // 🛡️ GUARD: If MAIA is speaking, IGNORE this result entirely
      // This prevents MAIA's voice from being detected as user speech
      // (Interrupt feature removed to prevent voice feedback loop)
      if (isSpeakingRef.current) {
        console.log('🚫 [onresult] IGNORED - MAIA is speaking, this is likely echo/feedback');
        return; // Don't process anything while MAIA speaks
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

      // Check if recognition ended too quickly after starting (rapid abort pattern)
      const timeSinceStart = Date.now() - recognitionStartTime.current;
      if (timeSinceStart < 500 && recognitionStartTime.current > 0) { // Ended in less than 500ms
        console.log('🚨 [onend] Recognition ended too quickly after start (' + timeSinceStart + 'ms) - possible infinite abort loop, stopping');
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }

      // 🔥 FIX: DON'T auto-restart on silence timeouts (prevents "blinking listening")
      // Web Speech API times out after ~5-8 seconds of silence. If there's been no speech,
      // don't restart - let the user tap to restart when ready.
      const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
      const hasRecentSpeech = timeSinceLastSpeech < 15000; // Was there speech in last 15 seconds?
      const hasAccumulatedTranscript = accumulatedTranscript.current.trim().length > 0;

      if (!hasRecentSpeech && !hasAccumulatedTranscript) {
        console.log('🔕 [onend] No recent speech detected (' + Math.round(timeSinceLastSpeech/1000) + 's since last speech) - stopping to prevent blink');
        console.log('   (User can tap mic to restart when ready to speak)');
        setIsListening(false);
        isListeningRef.current = false;
        onRecordingStateChange?.(false);
        return;
      }

      // Only restart if we're actively listening and not processing/speaking
      // CRITICAL: Use refs instead of closure state to avoid stale values
      if (isListeningRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
        // Check for too many consecutive restarts (infinite loop prevention)
        const currentTime = Date.now();
        const timeSinceLastRestart = currentTime - lastRestartTime.current;

        // Only count RAPID restarts (< 2 seconds apart) as potentially problematic
        // Normal Web Speech API behavior stops after ~8 seconds of silence - that's fine
        if (timeSinceLastRestart < 2000) { // Less than 2 seconds = rapid restart (potential loop)
          consecutiveRestartCount.current++;
        } else {
          consecutiveRestartCount.current = 0; // Reset counter for normal restarts (> 2 seconds apart)
        }

        lastRestartTime.current = currentTime;

        // Only stop if we have RAPID consecutive restarts (true infinite loop)
        if (consecutiveRestartCount.current >= 10) { // Allow 10 rapid restart attempts before blocking
          console.log('🛑 [onend] Preventing restart loop (' + consecutiveRestartCount.current + ' rapid restarts), stopping voice recognition');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }

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

        console.log(`🔄 [onend] Will restart recognition after ${backoffDelay}ms delay (errors: ${networkErrorCount.current}, restarts: ${consecutiveRestartCount.current}, timeSinceLastRestart: ${timeSinceLastRestart}ms)...`);
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
  // 🔥 CRITICAL: Sync isSpeaking SYNCHRONOUSLY (not in useEffect) to prevent race conditions
  // This ensures the guard in startListening() always has the latest value
  isSpeakingRef.current = isSpeaking;

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 🔇 CRITICAL: Stop recognition AND clear all timers when MAIA starts speaking
  useEffect(() => {
    if (isSpeaking) {
      console.log('🔇 [Voice Feedback Prevention] MAIA started speaking - FULL STOP');

      // Stop native speech recognition on iOS/Android
      if (useNativeSpeechRef.current) {
        (async () => {
          try {
            await NativeSpeechRecognition.stop();
            console.log('🛑 [Native] Stopped for MAIA speech');
          } catch (e) {
            // May already be stopped
          }
        })();
      }

      // Stop web recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.warn('⚠️ Error stopping recognition:', err);
        }
      }

      // Clear ALL timers to prevent any delayed processing
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        console.log('🧹 Cleared silence timer');
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
        recognitionTimeoutRef.current = null;
        console.log('🧹 Cleared recognition timeout');
      }

      // Clear any accumulated transcript (it's MAIA's voice, not user's)
      if (accumulatedTranscript.current) {
        console.log('🧹 Discarding accumulated transcript (was MAIA echo):',
          accumulatedTranscript.current.substring(0, 50));
        accumulatedTranscript.current = '';
      }

      // Reset all state
      setIsRecording(false);
      isRecordingRef.current = false;
      isProcessingRef.current = false;
    }
  }, [isSpeaking]);

  // 🎤 Auto-restart native speech recognition when MAIA finishes speaking
  // This ensures the mic comes back on automatically for continuous conversation
  useEffect(() => {
    if (!isSpeaking && isListeningRef.current && useNativeSpeechRef.current) {
      console.log('🔄 [Native] MAIA stopped speaking, will auto-restart mic in 1.5s...');
      isProcessingRef.current = false;

      const restartTimer = setTimeout(async () => {
        // Double-check conditions before restart
        // 🔑 CRITICAL: Only restart if native isn't already started (prevents thrash)
        if (isListeningRef.current && !isSpeakingRef.current && !isProcessingRef.current && nativeStatusRef.current !== 'started') {
          try {
            // 🔊 CRITICAL: Re-prepare audio session after TTS finished
            // TTS leaves session in .playback mode, need to switch back to .playAndRecord
            if (VoiceController.isNativeIOS()) {
              console.log('🔊 [Native] Re-preparing audio session for listening...');
              const prepared = await VoiceController.prepareForListening();
              if (!prepared) {
                console.error('❌ [Native] Failed to re-prepare audio session');
                return;
              }
            }
            console.log('🎙️ [Native] Auto-restarting after MAIA speech...');
            await NativeSpeechRecognition.start({
              language: 'en-US',
              maxResults: 3,
              partialResults: true,
              popup: false
            });
            console.log('✅ [Native] Auto-restart after speech successful');
            // Note: setIsRecording will be updated by listeningState listener
          } catch (e: any) {
            console.warn('⚠️ [Native] Auto-restart failed:', e?.message || e);
          }
        } else {
          console.log('🚫 [Native] Conditions changed or already started, skipping auto-restart');
        }
      }, 1500); // 1.5s delay for iOS audio session to release

      return () => clearTimeout(restartTimer);
    }
  }, [isSpeaking]);

  // 🎤 DISABLED: Old auto-restart via useEffect - replaced by above
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

  // 🔊 Track if audio loop is currently running to prevent duplicates
  const audioLoopRunningRef = useRef(false);

  // 🔊 Start the audio level monitoring loop (can be called multiple times safely)
  const startAudioLevelLoop = useCallback(() => {
    // Prevent multiple loops running simultaneously
    if (audioLoopRunningRef.current) {
      console.log('🔊 [AudioLoop] Already running, skipping duplicate start');
      return;
    }

    if (!analyserRef.current) {
      console.log('🔊 [AudioLoop] No analyser - cannot start');
      return;
    }

    audioLoopRunningRef.current = true;
    console.log('🔊 [AudioLoop] Starting audio level monitoring loop');

    const checkAudioLevel = () => {
      if (!analyserRef.current) {
        audioLoopRunningRef.current = false;
        return;
      }

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

      // 🔥 Use ref instead of state to avoid stale closure issues
      if (isListeningRef.current) {
        requestAnimationFrame(checkAudioLevel);
      } else {
        // Loop stopped - mark as not running
        audioLoopRunningRef.current = false;
        console.log('🔊 [AudioLoop] Stopped (isListening=false)');
      }
    };

    checkAudioLevel();
  }, [onAudioLevelChange, vadSensitivity, processAccumulatedTranscript]);

  // Initialize audio level monitoring
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      // BUGFIX: Don't request getUserMedia if we already have a stream
      // This prevents permission re-request loops on iPad Safari
      if (micStreamRef.current && analyserRef.current) {
        console.log('✅ [Continuous] Already have microphone stream, reusing');
        // 🔥 CRITICAL FIX: Even when reusing stream, restart the audio loop!
        startAudioLevelLoop();
        return true;
      }

      // 🔍 Log available audio input devices BEFORE requesting mic
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        console.log('[voice] audioinput devices:', audioInputs.map(d => ({
          label: d.label || '(no label - permission not yet granted)',
          deviceId: d.deviceId?.slice(0, 8) + '...',
          groupId: d.groupId?.slice(0, 8) + '...'
        })));
        if (audioInputs.length === 0) {
          console.warn('[voice] ⚠️ No audio input devices found! Check OS privacy settings.');
        }
      } catch (enumErr) {
        console.warn('[voice] enumerateDevices failed:', enumErr);
      }

      // Try with standard constraints first
      let stream: MediaStream | null = null;
      const standardConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
          // IMPORTANT: do NOT set deviceId here (no exact/ideal)
        }
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(standardConstraints);
      } catch (firstErr: any) {
        console.error('[voice] getUserMedia failed first attempt:', firstErr?.name, firstErr?.message);

        // HARD FALLBACK: request default mic with simplest constraints
        if (firstErr?.name === 'NotFoundError' || firstErr?.name === 'OverconstrainedError') {
          console.warn('[voice] 🔄 Retrying with { audio: true } fallback...');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw firstErr;
        }
      }

      if (!stream) {
        throw new Error('MICROPHONE_UNAVAILABLE');
      }

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

      // 🔥 Start the audio level monitoring loop
      startAudioLevelLoop();

      return true;
    } catch (error) {
      console.error('❌ [Continuous] Microphone access error:', error);
      return false;
    }
  }, [isSafari, startAudioLevelLoop]);

  // 🎛️ Ensure native speech recognition is ready (permissions + availability)
  const ensureNativeSpeechReady = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    const platform = Capacitor.getPlatform();
    addDebug(`Platform: ${platform}`);

    try {
      // Check if speech recognition is available on device
      addDebug('Checking availability...');
      const avail = await NativeSpeechRecognition.available();
      addDebug(`Available: ${JSON.stringify(avail)}`);

      if (!avail?.available) {
        return { ok: false, reason: 'Speech not available on device' };
      }

      // Check current permission status
      addDebug('Checking permissions...');
      const perms = await NativeSpeechRecognition.checkPermissions();
      addDebug(`Perms: ${perms?.speechRecognition}`);

      if (perms?.speechRecognition !== 'granted') {
        // Request permissions (this covers both speech + mic on iOS)
        addDebug('Requesting permissions...');
        const req = await NativeSpeechRecognition.requestPermissions();
        addDebug(`Req result: ${req?.speechRecognition}`);

        if (req?.speechRecognition !== 'granted') {
          return { ok: false, reason: `Perm denied: ${req?.speechRecognition || 'unknown'}` };
        }
      }

      addDebug('✅ Ready!');
      return { ok: true };
    } catch (e: any) {
      addDebug(`❌ Error: ${e?.message || e}`);
      return { ok: false, reason: e?.message || String(e) };
    }
  }, [addDebug]);

  // 🛡️ CRASH PREVENTION: Track startup state to prevent concurrent starts
  const isStartingRef = useRef(false);
  const lastStartAttemptRef = useRef(0);

  // Start listening
  const startListening = useCallback(async () => {
    console.log('🎤 [ContinuousConversation] startListening called');
    addDebug('🎤 startListening called');

    // 🛡️ CRASH PREVENTION: Debounce rapid taps (500ms minimum between attempts)
    const now = Date.now();
    if (now - lastStartAttemptRef.current < 500) {
      console.log('⏳ [ContinuousConversation] Debounced - too soon after last attempt');
      return;
    }
    lastStartAttemptRef.current = now;

    // 🛡️ CRASH PREVENTION: Don't start if already starting
    if (isStartingRef.current) {
      console.log('🚫 [ContinuousConversation] Already starting - ignoring duplicate call');
      return;
    }
    isStartingRef.current = true;

    // 🔄 CRITICAL: Determine platform at START time
    // With remote server URLs (beta builds), Capacitor bridge may initialize after page load
    const platform = Capacitor.getPlatform();
    // IMPORTANT: On iOS/Android, ALWAYS use native - never fall back to web speech
    const shouldUseNative = platform === 'ios' || platform === 'android';
    useNativeSpeechRef.current = shouldUseNative;

    console.log('📱 [ContinuousConversation] Platform:', platform, 'shouldUseNative:', shouldUseNative);
    console.log('📱 [ContinuousConversation] Capacitor.isNativePlatform():', Capacitor.isNativePlatform());
    addDebug(`Platform: ${platform}, native: ${shouldUseNative}`);

    // 🛡️ GUARD: Don't start listening if MAIA is speaking - prevents voice feedback loop
    if (isSpeakingRef.current) {
      console.log('🚫 [ContinuousConversation] BLOCKED: Cannot start listening while MAIA is speaking');
      isStartingRef.current = false;
      return;
    }

    try {
      // 🔄 Use native speech recognition on iOS/Android
      if (shouldUseNative) {
        console.log('📱 [ContinuousConversation] Using NATIVE speech recognition for platform:', platform);

        // 🛡️ CRASH PREVENTION: Stop any existing recognition first
        // This prevents "already listening" crashes on iOS
        try {
          await NativeSpeechRecognition.stop();
          console.log('🛑 [Native] Pre-emptively stopped any existing recognition');
        } catch {
          // Ignore errors - recognition may not have been running
        }

        // 🎛️ CRITICAL: Ensure permissions before showing "Listening..."
        const ready = await ensureNativeSpeechReady();
        if (!ready.ok) {
          console.warn('🚫 [Native] Not starting recognition:', ready.reason);
          setVoiceError(ready.reason || 'Speech recognition not available');
          // DON'T show "Listening..." if we can't actually listen
          isStartingRef.current = false;
          return;
        }

        // Permissions OK - but don't tell parent yet! Wait for listeningState: started
        // The listeningState listener is the SOURCE OF TRUTH for when mic is actually active
        setIsListening(true);
        isListeningRef.current = true;
        // NOTE: onRecordingStateChange will be called when listeningState: started fires
        console.log('📡 [Native] Permissions OK - waiting for mic to actually start...');

        setVoiceError(null);
        isProcessingRef.current = false;
        consecutiveRestartCount.current = 0;
        // 🔥 FIX: Reset lastSpeechTime so silence detection doesn't trigger immediately
        lastSpeechTime.current = Date.now();

        // 🚫 SKIP audio monitoring on native iOS - it conflicts with native speech recognition
        // The native plugin handles mic access directly; calling getUserMedia() causes crashes
        console.log('📱 [Native] Skipping audio monitoring - native plugin handles mic access');

        // 🧹 CRITICAL: Remove any existing listeners before adding new ones
        // This prevents listener accumulation that causes crashes
        if (nativeListenerRef.current) {
          try {
            await nativeListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: partialResults listener already removed');
          }
          nativeListenerRef.current = null;
        }
        if (nativeStateListenerRef.current) {
          try {
            await nativeStateListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: listeningState listener already removed');
          }
          nativeStateListenerRef.current = null;
        }
        if (nativeAudioLevelListenerRef.current) {
          try {
            await nativeAudioLevelListenerRef.current.remove();
          } catch (e) {
            console.log('⚠️ [Native] Cleanup: audioLevel listener already removed');
          }
          nativeAudioLevelListenerRef.current = null;
        }
        // Clear any pending silence timer
        if (nativeSilenceTimerRef.current) {
          clearTimeout(nativeSilenceTimerRef.current);
          nativeSilenceTimerRef.current = null;
        }

        // Set up listener for partial results
        addDebug('📡 Setting up partialResults listener...');
        nativeListenerRef.current = await NativeSpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
          if (data.matches && data.matches.length > 0) {
            const transcript = data.matches[0];
            console.log('📝 [Native] Partial:', transcript);
            addDebug(`🗣️ HEARD: "${transcript.slice(0, 40)}${transcript.length > 40 ? '...' : ''}"`);
            lastSpeechTime.current = Date.now();
            setIsRecording(true);
            isRecordingRef.current = true;
            hasSpokenRef.current = true;
            // 🔥 FIX: Reset restart counter when user actually speaks - prevents stopping during valid conversation
            consecutiveRestartCount.current = 0;

            // Send interim transcript
            if (onInterimTranscript) {
              onInterimTranscript(transcript);
            }

            // Accumulate transcript
            accumulatedTranscript.current = transcript;
          } else {
            addDebug('⚠️ partialResults fired but no matches');
          }
        });
        addDebug('✅ partialResults listener ready');

        // 🎚️ Listen for audio levels from native plugin to drive UV visualizer
        // Note: 'audioLevel' is a custom event we added to the patched plugin
        nativeAudioLevelListenerRef.current = await (NativeSpeechRecognition as any).addListener('audioLevel', (data: { level: number }) => {
          const rawLevel = data.level || 0;
          const now = Date.now();

          // 🔊 AMPLIFY: iOS native mic levels are inherently quiet (0.001-0.03 range)
          // Amplify by 30x to scale into visualizer range (0-1)
          const amplifiedLevel = Math.min(1.0, rawLevel * 30);

          // 🌊 EMA SMOOTHING: Make UV visualizer feel alive, not twitchy
          // smoothed = smoothed * 0.85 + new * 0.15 (adjust to taste)
          smoothedAudioLevelRef.current = smoothedAudioLevelRef.current * 0.85 + amplifiedLevel * 0.15;

          // 🌟 FLOOR: When mic is on, always show a minimum "alive" level
          // This makes the field feel "on" without faking speech peaks
          const displayLevel = Math.max(smoothedAudioLevelRef.current, 0.03);

          // Track when we last had high audio (for silence detection)
          if (rawLevel >= 0.02) {
            lastHighAudioTimeRef.current = now;
          }

          // Update audio level for UV visualizer animation
          setAudioLevel(displayLevel);
          audioLevelRef.current = displayLevel;

          // 🔥 CRITICAL: Call onAudioLevelChange to update OracleConversation visualizer
          onAudioLevelChange?.(displayLevel, isRecordingRef.current);

          // 🔇 IMPROVED SILENCE DETECTION
          // Only start timer if ALL conditions met:
          // 1. Raw level is low (< 0.01 = silence)
          // 2. We have any transcript (at least 1 char - don't gate on length, SR already handles this)
          // 3. We had recent speech (high audio within last 2s) - prevents false triggers on ambient noise
          const transcript = accumulatedTranscript.current.trim();
          const hasRecentSpeech = (now - lastHighAudioTimeRef.current) < 2000; // 2s window for natural pauses
          const hasAnyTranscript = transcript.length > 0;

          if (rawLevel < 0.01 && hasAnyTranscript && hasRecentSpeech) {
            // Start silence timer if not already running
            if (!nativeSilenceTimerRef.current) {
              console.log('🔕 [Native] Silence detected after speech, starting 2.0s timer');
              nativeSilenceTimerRef.current = setTimeout(() => {
                // Double-check we still have transcript
                if (accumulatedTranscript.current.trim() && !isProcessingRef.current) {
                  const finalTranscript = accumulatedTranscript.current.trim();
                  console.log('⏱️ [Native] Silence timeout - auto-submitting:', finalTranscript);
                  accumulatedTranscript.current = '';
                  isProcessingRef.current = true;
                  setIsRecording(false);
                  isRecordingRef.current = false;
                  onTranscript(finalTranscript);
                }
                nativeSilenceTimerRef.current = null;
              }, 2000); // 2.0s of silence = end of speech (increased from 1.2s to prevent truncation)
            }
          } else if (rawLevel >= 0.02) {
            // Clear silence timer if speech detected (higher threshold than silence)
            if (nativeSilenceTimerRef.current) {
              clearTimeout(nativeSilenceTimerRef.current);
              nativeSilenceTimerRef.current = null;
            }
          }
        });

        // Handle when speech ends - store listener reference for cleanup
        addDebug('📡 Setting up listeningState listener...');
        nativeStateListenerRef.current = await NativeSpeechRecognition.addListener('listeningState', async (state: { status: string }) => {
          console.log('🔊 [Native] State:', state.status);
          addDebug(`📻 listeningState: ${state.status}`);
          // 🔑 Update single source of truth for native status
          nativeStatusRef.current = state.status === 'started' ? 'started' : 'stopped';
          const isNowRecording = nativeStatusRef.current === 'started';
          setIsRecording(isNowRecording);
          isRecordingRef.current = isNowRecording;

          // 🔥 CRITICAL: Notify parent of ACTUAL mic state - this is the SOURCE OF TRUTH
          // This will clear isActivating and set isListening in OracleConversation
          onRecordingStateChange?.(isNowRecording);
          if (isNowRecording) {
            console.log('✅ [Native] Mic is LIVE - orange dot should be visible');
            addDebug('✅ MIC IS LIVE - orange dot visible!');
          }

          if (state.status === 'stopped' && isListeningRef.current) {
            // Process accumulated transcript
            if (accumulatedTranscript.current.trim()) {
              const finalTranscript = accumulatedTranscript.current.trim();
              console.log('✅ [Native] Final transcript:', finalTranscript);
              accumulatedTranscript.current = '';
              setIsRecording(false);
              isRecordingRef.current = false;
              onTranscript(finalTranscript);
            }

            // 🔥 FIX: Increment restart counter and check limit to prevent blinking loop
            consecutiveRestartCount.current++;
            const MAX_NATIVE_RESTARTS = 3; // Only allow 3 auto-restarts before stopping

            if (consecutiveRestartCount.current > MAX_NATIVE_RESTARTS) {
              console.log(`🛑 [Native] Stopping after ${consecutiveRestartCount.current} restart attempts - user must tap mic`);
              setIsListening(false);
              isListeningRef.current = false;
              onRecordingStateChange?.(false);
              consecutiveRestartCount.current = 0;
              return;
            }

            // Auto-restart if still in listening mode
            // 🔥 CRITICAL: Longer delay (1.5s) to allow iOS audio session to fully release after TTS
            if (isListeningRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
              console.log(`🔄 [Native] Will auto-restart in 1.5s... (attempt ${consecutiveRestartCount.current}/${MAX_NATIVE_RESTARTS})`);
              setTimeout(async () => {
                // Double-check conditions before restart
                if (isListeningRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
                  try {
                    // 🔊 Re-prepare audio session before restart
                    if (VoiceController.isNativeIOS()) {
                      await VoiceController.prepareForListening();
                    }
                    console.log('🎙️ [Native] Restarting speech recognition...');
                    await NativeSpeechRecognition.start({
                      language: 'en-US',
                      maxResults: 3,
                      partialResults: true,
                      popup: false
                    });
                    console.log('✅ [Native] Restart successful');
                    // Reset counter on successful restart with speech
                    // (will be reset to 0 when user actually speaks - see partialResults handler)
                  } catch (e: any) {
                    console.warn('⚠️ [Native] Restart failed:', e?.message || e);
                    // Don't retry - let the next listeningState: stopped handle it
                    // This prevents nested restart attempts
                  }
                } else {
                  console.log('🚫 [Native] Conditions changed, not restarting');
                  consecutiveRestartCount.current = 0; // Reset on intentional stop
                }
              }, 1500); // 1.5 seconds - gives iOS audio session time to release
            }
          }
        });

        // 🔊 CRITICAL: Prepare audio session BEFORE starting speech recognition
        // This ensures iOS audio session is properly configured for recording/listening mode
        if (VoiceController.isNativeIOS()) {
          console.log('🔊 [ContinuousConversation] Preparing audio session for listening...');
          addDebug('🔊 Calling prepareForListening...');
          const prepared = await VoiceController.prepareForListening();
          if (!prepared) {
            console.error('❌ [ContinuousConversation] Failed to prepare audio session');
            addDebug('❌ prepareForListening FAILED');
            setVoiceError('Failed to prepare audio session');
            setIsListening(false);
            isListeningRef.current = false;
            isStartingRef.current = false;
            onRecordingStateChange?.(false);
            return;
          }
          addDebug('✅ Audio session prepared');
        }

        // Start native speech recognition
        console.log('🎙️ [ContinuousConversation] About to call NativeSpeechRecognition.start()...');
        addDebug('🎙️ Calling SR.start(popup:false)...');
        try {
          const startOptions = {
            language: 'en-US',
            maxResults: 3,
            prompt: 'Speak to MAIA',
            partialResults: true,
            popup: false  // Set to true if iOS requires the popup UI
          };
          addDebug(`📝 Options: ${JSON.stringify(startOptions)}`);
          await NativeSpeechRecognition.start(startOptions);
          console.log('✅ [ContinuousConversation] NativeSpeechRecognition.start() succeeded!');
          addDebug('✅ SR.start() SUCCESS! Mic should be active');
          addDebug('🎤 Speak now - watching for partialResults...');
        } catch (startError: any) {
          const errName = startError?.name || 'UnknownError';
          const errMsg = startError?.message || String(startError);
          const errCode = startError?.code || 'no-code';
          console.error('❌ [ContinuousConversation] NativeSpeechRecognition.start() FAILED:', startError);
          console.error('❌ [ContinuousConversation] Error details:', JSON.stringify(startError, null, 2));
          addDebug(`❌ start() FAILED: ${errName}`);
          addDebug(`   msg: ${errMsg}`);
          addDebug(`   code: ${errCode}`);

          // Try with popup: true as fallback (iOS may require it)
          console.log('🔄 [ContinuousConversation] Retrying with popup: true...');
          addDebug('🔄 Retrying popup:true...');
          try {
            await NativeSpeechRecognition.start({
              language: 'en-US',
              maxResults: 3,
              prompt: 'Speak to MAIA',
              partialResults: true,
              popup: true  // Try with popup enabled
            });
            console.log('✅ [ContinuousConversation] Retry with popup: true succeeded!');
            addDebug('✅ Retry succeeded!');
          } catch (retryError: any) {
            console.error('❌ [ContinuousConversation] Retry also FAILED:', retryError);
            addDebug(`❌ Retry failed: ${retryError?.message || retryError}`);
            throw retryError;
          }
        }

        console.log('🎙️ [ContinuousConversation] Native recognition started');

        isStartingRef.current = false; // ✅ Reset after successful start
        return;
      }

      // 🌐 Web Speech API fallback for browsers
      console.log('🌐 [ContinuousConversation] Using WEB speech recognition');

      // Check platform capabilities - ALWAYS get fresh info (don't use cached value)
      // This ensures voice works even if earlier check failed before user gesture
      const info = await getPlatformInfo();
      setPlatformInfo(info);
      console.log('[voice] Platform info:', info);

      if (!info.hasVoiceSupport) {
        const errorMsg = getVoiceUnavailableMessage(info);
        console.warn('⚠️ [ContinuousConversation] Voice not supported:', errorMsg);
        setVoiceError(errorMsg);
        throw new Error('VOICE_UNAVAILABLE');
      }

      // 🔥 FIX: Set isListeningRef BEFORE initializing audio monitoring
      // This prevents the audio level loop from immediately stopping
      isListeningRef.current = true;

      // Initialize audio monitoring
      const audioReady = await initializeAudioMonitoring();
      if (!audioReady) {
        isListeningRef.current = false; // Reset on failure
        console.error('❌ [ContinuousConversation] Audio monitoring failed');
        setVoiceError('Microphone access failed. Please check permissions.');
        throw new Error('MICROPHONE_UNAVAILABLE');
      }

      console.log('✅ [ContinuousConversation] Audio monitoring ready');
      setVoiceError(null); // Clear any previous errors

      // NOW we can show listening state for web
      setIsListening(true);
      onRecordingStateChange?.(true);
      console.log('📡 [Web] Permissions OK - showing listening state');

    // Initialize speech recognition
    if (!recognitionRef.current) {
      recognitionRef.current = initializeSpeechRecognition();
      console.log('🔧 [ContinuousConversation] Speech recognition initialized');
    }

    if (recognitionRef.current) {
      isProcessingRef.current = false;

      // Reset restart counter when user manually starts listening
      consecutiveRestartCount.current = 0;
      // 🔥 FIX: Reset lastSpeechTime so "no recent speech" check doesn't trigger immediately
      lastSpeechTime.current = Date.now();

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
      // Reset state on error and notify parent
      setIsListening(false);
      isListeningRef.current = false;
      isStartingRef.current = false; // ✅ Reset starting flag on error
      onRecordingStateChange?.(false); // Hide visualizer on error
      throw error; // Re-throw so parent component can handle
    } finally {
      // Ensure starting flag is always reset, even on unexpected errors
      isStartingRef.current = false;
    }
  }, [initializeSpeechRecognition, initializeAudioMonitoring, onTranscript, onInterimTranscript, onRecordingStateChange, addDebug, ensureNativeSpeechReady]);

  // Stop listening
  const stopListening = useCallback(async () => {
    console.log('🛑 [ContinuousConversation] stopListening called');

    // 🔥 CRITICAL: Process accumulated transcript BEFORE stopping
    // On iOS, the final transcript from native is often empty, so we must use accumulated partials
    if (accumulatedTranscript.current.trim()) {
      const finalTranscript = accumulatedTranscript.current.trim();
      console.log('📤 [stopListening] Processing accumulated transcript:', finalTranscript);

      if (onTranscript && !isProcessingRef.current) {
        isProcessingRef.current = true;
        setIsRecording(false);
        onRecordingStateChange?.(false);
        onTranscript(finalTranscript);
      }
      accumulatedTranscript.current = '';
    }

    setIsListening(false);
    isListeningRef.current = false; // Update ref immediately
    setIsRecording(false);
    isRecordingRef.current = false; // Update ref immediately
    setAudioLevel(0);
    smoothedAudioLevelRef.current = 0; // Reset EMA smoothing
    nativeStatusRef.current = 'stopped'; // 🔑 Reset native status immediately

    // Stop native speech recognition on iOS/Android
    if (useNativeSpeechRef.current) {
      try {
        // Stop recognition first
        await NativeSpeechRecognition.stop();
        console.log('🛑 [Native] Recognition stopped');

        // Clean up partialResults listener
        if (nativeListenerRef.current) {
          try {
            await nativeListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeListenerRef.current = null;
        }

        // Clean up listeningState listener
        if (nativeStateListenerRef.current) {
          try {
            await nativeStateListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeStateListenerRef.current = null;
        }

        // Clean up audioLevel listener
        if (nativeAudioLevelListenerRef.current) {
          try {
            await nativeAudioLevelListenerRef.current.remove();
          } catch (e) {
            // Ignore - may already be removed
          }
          nativeAudioLevelListenerRef.current = null;
        }

        // Clear silence timer
        if (nativeSilenceTimerRef.current) {
          clearTimeout(nativeSilenceTimerRef.current);
          nativeSilenceTimerRef.current = null;
        }

        // Final cleanup - remove any remaining listeners
        await NativeSpeechRecognition.removeAllListeners();
        console.log('🧹 [Native] All listeners cleaned up');
      } catch (e) {
        console.warn('⚠️ [Native] Error stopping:', e);
      }
    }

    // Stop web speech recognition
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
  }, [onTranscript, onRecordingStateChange]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    // 🔑 For native: use nativeStatusRef as single source of truth
    // For web: use isListeningRef
    const shouldStop = useNativeSpeechRef.current
      ? nativeStatusRef.current === 'started'
      : isListeningRef.current;

    console.log('🔄 [ContinuousConversation] toggleListening - native:', useNativeSpeechRef.current,
      'nativeStatus:', nativeStatusRef.current, 'isListening:', isListeningRef.current, '→', shouldStop ? 'STOP' : 'START');

    if (shouldStop) {
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

  // 🐛 Show diagnostic info on mount for native platforms
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      addDebug(`🚀 Mount: platform=${platform}, isNative=${Capacitor.isNativePlatform()}`);
      addDebug(`📱 UserAgent: ${navigator.userAgent.slice(0, 60)}...`);

      // Check speech recognition availability immediately
      (async () => {
        try {
          const avail = await NativeSpeechRecognition.available();
          addDebug(`🎤 SR available: ${avail?.available}`);
          const perms = await NativeSpeechRecognition.checkPermissions();
          addDebug(`🔐 SR permission: ${perms?.speechRecognition}`);
        } catch (e: any) {
          addDebug(`❌ SR check error: ${e?.message || e}`);
        }
      })();
    }
  }, [addDebug]);

  return (
    <>
      {/* Debug panel removed - was interfering with mic activation */}

    <div className="flex items-center gap-3">
      {/* Main control button */}
      <button
        onClick={toggleListening}
        disabled={isProcessing || (platformInfo?.hasVoiceSupport === false)}
        className={`
          relative p-3 rounded-lg transition-all
          ${isListening
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }
          ${(isProcessing || platformInfo?.hasVoiceSupport === false) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isListening ? 'Stop continuous listening' : 'Start continuous listening'}
        title={platformInfo?.hasVoiceSupport === false ? voiceError || 'Voice unavailable' : undefined}
      >
        {showLoader ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : platformInfo?.hasVoiceSupport === false ? (
          <AlertCircle className="w-5 h-5" />
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
        {voiceError ? (
          <>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 max-w-xs text-xs">
              {voiceError}
            </span>
          </>
        ) : isListening ? (
          <>
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              {isRecording ? 'Listening...' :
               isSpeaking ? 'Maya speaking...' :
               isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </>
        ) : null}
      </div>

      {/* Audio level indicator */}
      {isListening && isRecording && !voiceError && (
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
    </>
  );
});

ContinuousConversation.displayName = 'ContinuousConversation';