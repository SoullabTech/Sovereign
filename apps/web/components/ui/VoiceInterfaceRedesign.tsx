/**
 * Redesigned Voice Interface
 * Fixes all identified UI/UX issues:
 * - Subtle sparkles (not thick)
 * - Mic below logo (not overlapping)
 * - Voice/Chat as bottom-right buttons (not sidebar)
 * - Natural greeting (not "How's your heart?")
 * - Audio output toggle for text chat
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, Volume2, VolumeX } from 'lucide-react';

interface VoiceInterfaceRedesignProps {
  onTranscript: (text: string) => void;
  onModeChange: (mode: 'voice' | 'chat') => void;
  isProcessing?: boolean;
  enabled?: boolean;
  isMayaSpeaking?: boolean;
}

// Subtle sparkle generation (fewer, smaller)
const generateSubtleSparkles = (count: number = 12) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = Math.random() * 80 + 60;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: Math.random() * 0.8 + 0.3, // Much smaller (0.3-1.1px)
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.4 + 0.2, // More transparent
    };
  });
};

export const VoiceInterfaceRedesign: React.FC<VoiceInterfaceRedesignProps> = ({
  onTranscript,
  onModeChange,
  isProcessing = false,
  enabled = true,
  isMayaSpeaking = false,
}) => {
  const [mode, setMode] = useState<'voice' | 'chat'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sparkles] = useState(() => generateSubtleSparkles(12)); // Only 12 subtle sparkles
  const [greeting] = useState(() => {
    // Natural greetings
    const greetings = [
      "Hey, what's up?",
      "What's on your mind?",
      "How's it going?",
      "Hey there",
      "What's happening?",
      "Talk to me",
      "I'm here, what's up?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize speech recognition WITHOUT wake word requirement
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported. Please use Chrome or Edge.');
      alert('Voice input only works in Chrome or Edge browsers');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let silenceTimer: NodeJS.Timeout;
    let accumulatedTranscript = '';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Process final results WITHOUT wake word
      if (finalTranscript) {
        accumulatedTranscript += finalTranscript;
        setTranscript(accumulatedTranscript);

        // Clear existing timer
        clearTimeout(silenceTimer);

        // Send after 1.5 seconds of silence
        silenceTimer = setTimeout(() => {
          const message = accumulatedTranscript.trim();
          if (message) {
            console.log('🚀 Sending to Maya:', message);
            onTranscript(message);
            accumulatedTranscript = '';
            setTranscript('');
          }
        }, 1500);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please enable it in your browser settings.');
      }
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart if still in listening mode
      if (isListening && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Auto-restart failed:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isListening, onTranscript]);

  // Toggle voice input
  const toggleVoice = useCallback(async () => {
    if (!isListening) {
      // Check for browser support first
      const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      if (!isSupported) {
        alert('Voice input is only supported in Chrome or Edge browsers.');
        return;
      }

      // Request microphone permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        alert('Microphone access is required for voice input.');
        return;
      }

      // Initialize and start
      if (initializeSpeechRecognition() && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          console.log('✅ Voice recognition started');
        } catch (error) {
          console.error('Failed to start recognition:', error);
        }
      }
    } else {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
          console.log('🛑 Voice recognition stopped');
        } catch (error) {
          console.error('Error stopping recognition:', error);
        }
      }
    }
  }, [isListening, initializeSpeechRecognition]);

  // Mode switch handler
  const handleModeChange = (newMode: 'voice' | 'chat') => {
    setMode(newMode);
    onModeChange(newMode);

    // If switching to voice, start listening
    if (newMode === 'voice' && !isListening) {
      toggleVoice();
    }
    // If switching away from voice, stop listening
    if (newMode === 'chat' && isListening) {
      toggleVoice();
    }
  };

  // Load audio preference
  useEffect(() => {
    const savedPref = localStorage.getItem('maya-audio-enabled');
    setAudioEnabled(savedPref === 'true');
  }, []);

  // Save audio preference
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem('maya-audio-enabled', newState.toString());
  };

  return (
    <>
      {/* Main Voice Interface - Centered */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Logo Area */}
        <div className="mb-8">
          {/* Maya Logo Here */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
        </div>

        {/* Microphone - Below Logo */}
        {mode === 'voice' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Subtle Sparkles */}
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute rounded-full bg-yellow-300"
                style={{
                  width: sparkle.size,
                  height: sparkle.size,
                  opacity: sparkle.opacity,
                }}
                animate={{
                  x: [sparkle.x * 0.5, sparkle.x, sparkle.x * 0.5],
                  y: [sparkle.y * 0.5, sparkle.y, sparkle.y * 0.5],
                }}
                transition={{
                  duration: sparkle.duration,
                  delay: sparkle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Microphone Button */}
            <motion.button
              onClick={toggleVoice}
              className={`
                relative z-10 p-6 rounded-full transition-all duration-300
                ${isListening
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-orange-400/50'
                  : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-gray-400" />
              )}
            </motion.button>

            {/* Status Text */}
            <div className="text-center mt-4">
              {isListening ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-300"
                >
                  Listening...
                </motion.p>
              ) : (
                <p className="text-gray-400">Click to speak</p>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-4 w-64 text-center text-gray-300"
              >
                {transcript}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Chat Mode Greeting */}
        {mode === 'chat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl text-gray-300 mb-4">{greeting}</h2>
            <p className="text-gray-500">Type your message below or switch to voice</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Right Control Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        {/* Audio Toggle (for text chat) */}
        {mode === 'chat' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={toggleAudio}
            className={`
              p-3 rounded-full backdrop-blur-lg transition-all
              ${audioEnabled
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30'
                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={audioEnabled ? 'Mute voice responses' : 'Enable voice responses'}
          >
            {audioEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-300" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        )}

        {/* Chat Mode Button */}
        <motion.button
          onClick={() => handleModeChange('chat')}
          className={`
            p-3 rounded-full backdrop-blur-lg transition-all
            ${mode === 'chat'
              ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Text chat"
        >
          <MessageSquare className="w-5 h-5 text-blue-300" />
        </motion.button>

        {/* Voice Mode Button */}
        <motion.button
          onClick={() => handleModeChange('voice')}
          className={`
            p-3 rounded-full backdrop-blur-lg transition-all
            ${mode === 'voice'
              ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Voice chat"
        >
          <Mic className="w-5 h-5 text-yellow-300" />
        </motion.button>
      </div>
    </>
  );
};