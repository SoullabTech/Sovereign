// Adaptive Voice Mic Button - Intimate Conversation Edition
// Designed for natural, thoughtful mobile conversations with adaptive silence detection
import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Pause, Play } from 'lucide-react';
import { logVoiceAttemptStarted, logVoiceTranscriptReceived } from '../../utils/voiceAnalytics';

interface AdaptiveVoiceMicButtonProps {
  onTranscript?: (text: string) => void;
  onVoiceStateChange?: (state: any) => void;
  size?: number;
  position?: 'bottom-center' | 'bottom-right' | 'floating';
  silenceThreshold?: number; // Base threshold, will be adaptive
  pauseListening?: boolean; // External control to pause listening
  conversationMode?: 'intimate' | 'normal' | 'quick'; // Conversation pacing
}

export const AdaptiveVoiceMicButton = forwardRef<any, AdaptiveVoiceMicButtonProps>(({
  onTranscript,
  onVoiceStateChange,
  size = 64,
  position = 'bottom-center',
  silenceThreshold = 2200, // 2.2s base for intimate conversations
  pauseListening = false,
  conversationMode = 'intimate'
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isThinking, setIsThinking] = useState(false); // Visual indicator for thinking pauses
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const wasListeningBeforePause = useRef<boolean>(false);
  const speechStartTimeRef = useRef<number>(0);
  const hasSentTranscriptRef = useRef<boolean>(false);
  const pauseCountRef = useRef<number>(0);
  const sentenceStartRef = useRef<number>(0);
  const sentRef = useRef<boolean>(false);

  // Request microphone permissions
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());

      setPermissionGranted(true);
      setError(null);
      console.log('✅ Microphone permission granted');

      // iOS Fix: Resume any suspended audio contexts after permission grant
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        // Try to resume Web Audio API context if it exists
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const tempContext = new AudioContextClass();
          if (tempContext.state === 'suspended') {
            await tempContext.resume();
            console.log('✅ iOS AudioContext resumed after permission');
          }
          tempContext.close(); // Clean up temp context
        }

        // Also trigger Maya's voice system to reinitialize audio
        window.dispatchEvent(new CustomEvent('ios-audio-reactivate'));
      }

      return true;
    } catch (err: any) {
      console.error('❌ Microphone permission denied:', err);
      setPermissionGranted(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else if (err.name === 'NotReadableError') {
        setError('Microphone is in use by another application.');
      } else {
        setError('Failed to access microphone. Please check your settings.');
      }
      return false;
    }
  }, []);

  // Adaptive silence threshold calculation
  const getAdaptiveSilenceThreshold = useCallback(() => {
    const transcript = finalTranscriptRef.current.trim();
    const speechDuration = Date.now() - speechStartTimeRef.current;
    const wordCount = transcript.split(' ').length;
    const timeSinceLastWord = Date.now() - lastSpeechTimeRef.current;

    // Quick mode: rapid exchanges
    if (conversationMode === 'quick') {
      return 1200; // 1.2s for quick back-and-forth
    }

    // Normal mode: standard conversation
    if (conversationMode === 'normal') {
      return 1800; // 1.8s standard pause
    }

    // Intimate mode: thoughtful, unhurried conversation
    // Detect incomplete thoughts that need more time
    const incompleteMarkers = [
      ', ', ' and', ' but', ' so', ' because', ' when', ' if', ' while',
      ' although', ' since', ' unless', ' after', ' before'
    ];

    const thoughtContinuationMarkers = [
      '...', '—', ' um', ' uh', ' like', ' you know', ' I mean',
      ' well', ' actually', ' basically', ' honestly'
    ];

    // Extended pause for trailing thoughts
    if (transcript.endsWith('...') || transcript.endsWith('—')) {
      setIsThinking(true);
      return 4000; // 4s for explicit trailing thoughts
    }

    // Questions often need thoughtful formulation
    if (transcript.includes('?') || transcript.toLowerCase().startsWith('how') ||
        transcript.toLowerCase().startsWith('why') || transcript.toLowerCase().startsWith('what')) {
      return 3000; // 3s for questions
    }

    // Mid-sentence pause (incomplete thought)
    if (incompleteMarkers.some(marker => transcript.endsWith(marker))) {
      setIsThinking(true);
      return 3500; // 3.5s for incomplete sentences
    }

    // Thought continuation markers
    if (thoughtContinuationMarkers.some(marker => transcript.includes(marker))) {
      return 3200; // 3.2s for hesitant speech
    }

    // Very short utterances might be complete
    if (wordCount <= 3 && speechDuration < 1500) {
      return 1500; // 1.5s for brief responses like "Yes", "I see", "Okay"
    }

    // Emotional or deep content (detected by certain words)
    const emotionalMarkers = ['feel', 'felt', 'love', 'hurt', 'pain', 'joy', 'scared', 'afraid', 'happy', 'sad'];
    if (emotionalMarkers.some(marker => transcript.toLowerCase().includes(marker))) {
      return 3000; // 3s for emotional processing
    }

    // Longer speech sessions get more pause time
    if (speechDuration > 8000) {
      return 3000; // 3s after extended speech (catching breath, gathering thoughts)
    } else if (speechDuration > 5000) {
      return 2500; // 2.5s after moderate speech
    }

    // Multiple pauses detected (thoughtful speaker)
    if (pauseCountRef.current > 2) {
      return 3500; // 3.5s for naturally pause-filled speech
    }

    // Default intimate conversation pause
    setIsThinking(false);
    return 2200; // 2.2s standard intimate pause
  }, [conversationMode]);

  // Initialize speech recognition
  useEffect(() => {
    // Check for secure context (HTTPS, localhost, or Vercel/production domains)
    const isSecureContext = window.location.protocol === 'https:' ||
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('vercel.app') ||
                           window.location.hostname.includes('soullab.life') ||
                           window.isSecureContext; // Browser's native secure context check

    console.log('🔒 Security check:', {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isSecureContext,
      hasWebkit: 'webkitSpeechRecognition' in window,
      hasSpeechRecognition: 'SpeechRecognition' in window,
      nativeSecureContext: window.isSecureContext
    });

    // More flexible secure context check for development
    if (!isSecureContext && !window.isSecureContext) {
      console.warn('⚠️ Not in secure context - voice features may be limited');
      setError('Voice requires HTTPS connection. Please use https:// or localhost');
      return;
    }

    // Try both webkit and standard SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      console.log('✅ Speech Recognition available');
      const recognition = new SpeechRecognition();
      console.log('🎤 Created speech recognition instance');

      recognition.continuous = true; // Enable continuous recognition
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started (intimate mode)');
        console.log('Recognition settings:', {
          continuous: recognition.continuous,
          interimResults: recognition.interimResults,
          lang: recognition.lang,
          maxAlternatives: recognition.maxAlternatives
        });
        setError(null);
        finalTranscriptRef.current = '';
        speechStartTimeRef.current = Date.now();
        hasSentTranscriptRef.current = false;
        pauseCountRef.current = 0;
        sentenceStartRef.current = Date.now();
        setIsThinking(false);
      };

      recognition.onresult = (event: any) => {
        console.log('📝 Recognition result event, results:', event.results.length);
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
            console.log('✅ Final transcript:', result[0].transcript);
          } else {
            interimText += result[0].transcript;
            console.log('📝 Interim transcript:', result[0].transcript);
          }
        }

        // Update final transcript
        if (finalText) {
          console.log('💭 Words spoken:', finalText);
          finalTranscriptRef.current += finalText;
          setTranscript(finalTranscriptRef.current);

          // IMMEDIATE SEND: Send as soon as we get a final result
          console.log('🚀 IMMEDIATE SEND - Final result detected');
          console.log('📤 Transcript to send:', finalTranscriptRef.current);
          console.log('📤 Has already sent:', hasSentTranscriptRef.current);

          if (!sentRef.current && finalTranscriptRef.current.trim() && onTranscript) {
            sentRef.current = true;
            console.log('🎯 Sending immediately on final result:', finalTranscriptRef.current);

            // Analytics: Track successful transcript
            logVoiceTranscriptReceived(finalTranscriptRef.current);

            try {
              // Stop recognition to prevent multiple sends
              recognition.stop();
              console.log('🛑 Stopped recognition');
            } catch (e) {
              console.log('Recognition already stopped');
            }

            // Send the transcript
            try {
              onTranscript(finalTranscriptRef.current.trim());
              console.log('✅ Transcript sent successfully');
            } catch (error) {
              console.error('❌ Error sending transcript:', error);
            }

            // Clear for next input
            setTimeout(() => {
              finalTranscriptRef.current = '';
              setTranscript('');
              sentRef.current = false;
              console.log('🔄 Reset for next input');

              // DO NOT restart listening automatically - wait for MAIA to finish speaking
              // The pauseListening effect will handle restarting when MAIA is done
              console.log('⏸️ Waiting for MAIA to respond before restarting mic...');
            }, 100);
          }
        }

        setInterimTranscript(interimText);

        // Update voice state with nuanced feedback
        onVoiceStateChange?.({
          isSpeaking: true,
          amplitude: 0.3 + Math.random() * 0.4, // Gentler amplitude for intimate conversation
          emotion: isThinking ? 'thoughtful' : 'engaged',
          energy: 0.6,
          clarity: 0.9
        });
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error event:', event.error);

        if (event.error === 'aborted') {
          console.log('Voice recognition aborted - restarting...');
          // Restart recognition after abort
          if (isListening && !pauseListening) {
            setTimeout(() => {
              try {
                recognition.start();
                console.log('🔄 Restarted after abort');
              } catch (e) {
                console.log('Already listening');
              }
            }, 100);
          }
          return;
        }

        console.error('Speech recognition error:', event.error);

        let errorMessage = '';
        switch(event.error) {
          case 'not-allowed':
            errorMessage = 'Please allow microphone access for voice conversation';
            break;
          case 'no-speech':
            // This is okay in intimate conversations - silence is natural
            console.log('Comfortable silence detected');
            return;
          case 'audio-capture':
            errorMessage = 'Microphone not available';
            break;
          case 'network':
            errorMessage = 'Connection issue - please check your network';
            break;
          default:
            errorMessage = `Voice error: ${event.error}`;
        }

        if (errorMessage) {
          setError(errorMessage);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Recognition ended - checking if should restart');
        console.log('State:', { isListening, pauseListening, sentRef: sentRef.current });

        // Only restart if actively listening AND not paused AND haven't just sent a message
        // If we just sent a message, wait for MAIA to respond (pauseListening will control restart)
        if (isListening && !pauseListening && !sentRef.current) {
          console.log('🔄 Restarting continuous recognition...');

          setTimeout(() => {
            try {
              recognition.start();
              console.log('✅ Recognition restarted successfully');
            } catch (e) {
              console.log('Already listening or error restarting:', e);
            }
          }, 100);
        } else {
          console.log('Not restarting - waiting for conditions:', {
            isListening,
            pauseListening,
            justSentMessage: sentRef.current
          });
        }
      };

      recognitionRef.current = recognition;

      // Register with ENHANCED feedback prevention to prevent Maya hearing herself
      if (typeof window !== 'undefined') {
        import('../../lib/voice/enhanced-feedback-prevention').then(({ EnhancedFeedbackPrevention }) => {
          const prevention = EnhancedFeedbackPrevention.getInstance();
          prevention.registerRecognition(recognition);
          console.log('✅ Registered recognition with enhanced feedback prevention');
        });
      }
    } else {
      console.error('❌ Speech Recognition not available');
      setError('Voice not supported in this browser. Please use Chrome, Safari, or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();

        // Unregister from enhanced feedback prevention
        import('../../lib/voice/enhanced-feedback-prevention').then(({ EnhancedFeedbackPrevention }) => {
          const prevention = EnhancedFeedbackPrevention.getInstance();
          // Note: unregisterRecognition not needed with enhanced version
          console.log('✅ Cleaned up enhanced feedback prevention');
        });
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [pauseListening, isListening, conversationMode]);

  // Handle silence detection (natural conversation completion)
  const handleSilenceDetected = useCallback(() => {
    const thoughtText = finalTranscriptRef.current.trim();

    // Prevent duplicate sends
    if (sentRef.current) {
      console.log('⚠️ Already sent this thought');
      return;
    }

    console.log('🌟 Complete thought detected:', thoughtText);
    console.log('📤 onTranscript callback available:', !!onTranscript);

    if (thoughtText && onTranscript) {
      hasSentTranscriptRef.current = true;
      setIsProcessing(true);
      setIsThinking(false);

      console.log('📤 Sending transcript to parent component:', thoughtText);
      console.log('📤 Callback function:', onTranscript.toString().substring(0, 100));
      // Send the complete thought
      try {
        onTranscript(thoughtText);
        console.log('✅ onTranscript callback completed successfully');
      } catch (error) {
        console.error('❌ Error calling onTranscript:', error);
      }

      // Clear for next thought
      setTimeout(() => {
        setTranscript('');
        setInterimTranscript('');
        finalTranscriptRef.current = '';
        setIsProcessing(false);
        speechStartTimeRef.current = Date.now();
        pauseCountRef.current = 0;
        console.log('✨ Ready for next thought');
      }, 500);
    }

    // Clear timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [onTranscript, silenceTimer]);

  // Start listening
  const startListening = useCallback(async () => {
    // Ensure audio context is unlocked (for playback later)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('🔊 Audio context unlocked');
      }
    } catch (e) {
      console.log('Audio context error:', e);
    }

    // First request microphone permission if not already granted
    if (permissionGranted === false || permissionGranted === null) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.error('❌ Microphone permission denied');
        return;
      }
    }

    if (!recognitionRef.current) {
      console.error('❌ Recognition not initialized');
      setError('Voice recognition not available. Please check your browser settings.');
      return;
    }

    console.log('🎙️ Starting intimate conversation mode');
    setIsListening(true);
    hasSentTranscriptRef.current = false;
    sentRef.current = false;  // Reset send guard

    // Analytics: Track voice attempt
    logVoiceAttemptStarted({ mode: 'voice' });

    try {
      recognitionRef.current.start();
      console.log('✅ Speech recognition started successfully');
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);

      // Provide more helpful error messages
      if (error.message && error.message.includes('not-allowed')) {
        setError('Microphone access denied. Please allow microphone access and refresh.');
      } else if (error.message && error.message.includes('service-not-allowed')) {
        setError('Speech recognition service not available. Please try Chrome or Edge.');
      } else if (error.message && error.message.includes('already started')) {
        // Recognition already running, just set the state
        console.log('⚠️ Recognition already running');
        setIsListening(true);
      } else {
        setError(`Failed to start voice recognition: ${error.message || 'Unknown error'}`);
      }
    }
  }, [permissionGranted, requestMicrophonePermission]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    console.log('⏹️ Ending conversation');

    // Send any final thoughts
    if (finalTranscriptRef.current.trim() && !sentRef.current) {
      console.log('📤 Sending final thought before stopping');
      handleSilenceDetected();
    }

    setIsListening(false);
    recognitionRef.current.stop();

    // Clear states
    setTimeout(() => {
      if (!isListening) {
        setTranscript('');
        setInterimTranscript('');
        finalTranscriptRef.current = '';
        setIsThinking(false);
      }
    }, 500);
  }, [isListening, handleSilenceDetected]);

  // Handle pause/resume from external control
  useEffect(() => {
    if (pauseListening && isListening) {
      console.log('⏸️ Pausing microphone (MAIA is speaking)');
      wasListeningBeforePause.current = true;
      try {
        recognitionRef.current?.abort(); // Use abort instead of stop to prevent restart
        console.log('✅ Recognition aborted while MAIA speaks');
      } catch (e) {
        console.log('Recognition already stopped');
      }
    } else if (!pauseListening && wasListeningBeforePause.current && isListening) {
      console.log('▶️ Resuming microphone (MAIA finished speaking)');
      wasListeningBeforePause.current = false;

      // Clear the sent flag so we can accept new input
      sentRef.current = false;
      finalTranscriptRef.current = '';
      setTranscript('');

      // Restart recognition after a brief delay
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
          console.log('✅ Recognition restarted after MAIA finished');
        } catch (e) {
          console.log('Error restarting recognition:', e);
        }
      }, 500); // Give MAIA's audio a moment to fully stop
    }
  }, [pauseListening, isListening]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    isListening
  }));

  // Position styles
  const positionStyles = {
    'bottom-center': 'bottom-8 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-8 right-8',
    'floating': 'bottom-20 right-8'
  };

  return (
    <>
      {/* Main button */}
      <motion.button
        onClick={() => {
          console.log('🔘 Mic button clicked, isListening:', isListening);
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        }}
        className={`fixed ${positionStyles[position]} z-50 group`}
        whileHover={{
          scale: 1.05,
          filter: 'drop-shadow(0 0 25px rgba(212,184,150,0.5))'
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className={`relative w-16 h-16 rounded-full overflow-hidden
                      bg-gradient-to-br from-gold-divine/20 via-gold-amber/10 to-transparent
                      ring-1 ring-gold-divine/30 backdrop-blur-sm
                      shadow-[0_0_20px_rgba(212,184,150,0.3),0_0_40px_rgba(212,184,150,0.1)]
                      border border-gold-divine/20`}>
          {/* Divine Light Receiving Animation */}
          {isListening && (
            <>
              {/* Outer divine glow pulse */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-gold-divine/40 via-gold-amber/20 to-transparent rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Inner sacred light */}
              <motion.div
                className="absolute inset-1 bg-gradient-to-br from-gold-divine/60 via-gold-amber/30 to-transparent rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              />
              {/* Signal reception sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gold-divine rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    x: [0, Math.cos(i * Math.PI / 4) * 20],
                    y: [0, Math.sin(i * Math.PI / 4) * 20],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}

          {/* Sacred Icon */}
          <div className="relative w-full h-full flex items-center justify-center z-10">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-gold-divine drop-shadow-[0_0_8px_rgba(212,184,150,0.8)]" />
              </motion.div>
            ) : isListening ? (
              pauseListening ? (
                <Pause className="w-8 h-8 text-gold-divine drop-shadow-[0_0_8px_rgba(212,184,150,0.8)]" />
              ) : (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    filter: [
                      'drop-shadow(0 0 8px rgba(212,184,150,0.8))',
                      'drop-shadow(0 0 12px rgba(212,184,150,1))',
                      'drop-shadow(0 0 8px rgba(212,184,150,0.8))'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Mic className="w-8 h-8 text-gold-divine" />
                </motion.div>
              )
            ) : (
              <MicOff className="w-7 h-7 text-gold-divine/60 drop-shadow-[0_0_4px_rgba(212,184,150,0.4)]" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Transcript display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 mx-auto max-w-md z-40"
          >
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gold-divine">Taking a moment to think...</span>
                </div>
              )}

              {/* Transcript text */}
              <p className="text-white text-sm">
                {transcript}
                {interimTranscript && (
                  <span className="text-white/60 ml-1">{interimTranscript}</span>
                )}
              </p>

              {/* Conversation mode indicator */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {conversationMode === 'intimate' ? '💭 Thoughtful pace' :
                   conversationMode === 'normal' ? '💬 Natural pace' :
                   '⚡ Quick pace'}
                </span>
                {pauseCountRef.current > 0 && (
                  <span className="text-xs text-white/40">
                    {pauseCountRef.current} natural pause{pauseCountRef.current > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-sm"
          >
            <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg border border-red-400/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">Voice System</p>
              </div>
              <p className="text-xs mt-1 opacity-90">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AdaptiveVoiceMicButton.displayName = 'AdaptiveVoiceMicButton';

export default AdaptiveVoiceMicButton;