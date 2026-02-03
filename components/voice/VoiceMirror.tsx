// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HybridVoiceInput from './HybridVoiceInput';
import TranscriptStream from './TranscriptStream';
import MaiaBubble from './MaiaBubble';
import { useMaiaStream } from '@/hooks/useMayaStream';
import { unlockAudio } from '@/lib/audio/audioUnlock';
import { useToastContext } from '@/components/system/ToastProvider';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as CapacitorSpeechRecognition } from '@capacitor-community/speech-recognition';

interface VoiceMirrorProps {
  userId: string;
  onModeChange?: (mode: 'text' | 'voice') => void;
  autoStartWelcome?: boolean;
}

export default function VoiceMirror({ 
  userId, 
  onModeChange,
  autoStartWelcome = true 
}: VoiceMirrorProps) {
  const { showToast } = useToastContext();
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    audioUrl?: string;
  }>>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [maiaResponse, setMaiaResponse] = useState('');
  const [isResponsePlaying, setIsResponsePlaying] = useState(false);
  const [prosodyData, setProsodyData] = useState<any>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isNativeRef = useRef<boolean>(false);
  const capacitorListenerRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Maya stream hook
  const {
    startConversation,
    sendMessage,
    audioUrl,
    isStreaming,
    error: streamError
  } = useMaiaStream({
    userId,
    sessionId: `voice-mirror-${Date.now()}`,
    onMessage: (msg) => {
      if (msg.role === 'assistant') {
        setMaiaResponse(msg.content);
        addMessage('assistant', msg.content, msg.audioUrl);
      }
    },
    onProsodyUpdate: (data) => {
      setProsodyData(data);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const unlocked = await unlockAudio();
        setAudioUnlocked(unlocked);
        if (!unlocked) {
          showToast({
            title: "Tap to enable voice",
            description: "Audio needs to be unlocked for the best experience",
            variant: "info"
          });
        }
      } catch (err) {
        console.error('Audio unlock failed:', err);
      }
    };
    
    if (autoStartWelcome) {
      initAudio();
      // Trigger Maya welcome ritual
      startConversation();
    }
  }, []);

  // Initialize native speech recognition on iOS/Android
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    isNativeRef.current = isNative;

    if (isNative) {
      console.log('🎤 VoiceMirror: Using native Capacitor speech recognition');

      // Check availability
      CapacitorSpeechRecognition.available().then((result) => {
        console.log('🎤 VoiceMirror: Speech available:', result.available);
      }).catch((err) => {
        console.error('🎤 VoiceMirror: Availability check failed:', err);
      });

      // Request permission on init
      CapacitorSpeechRecognition.requestPermissions().then((result) => {
        console.log('🎤 VoiceMirror: Permission:', result.speechRecognition);
        if (result.speechRecognition !== 'granted') {
          showToast({
            title: "Microphone access needed",
            description: "Please enable in Settings to use voice",
            variant: "error"
          });
        }
      }).catch((err) => {
        console.error('🎤 VoiceMirror: Permission request failed:', err);
      });

      // Add listening state listener
      CapacitorSpeechRecognition.addListener('listeningState', (data) => {
        console.log('🎤 VoiceMirror: Listening state:', data.status);
        if (data.status === 'started') {
          setIsListening(true);
        } else if (data.status === 'stopped') {
          setIsListening(false);
        }
      });

      return () => {
        CapacitorSpeechRecognition.removeAllListeners();
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };
    }
  }, []);

  // Initialize Web Speech API (for web only)
  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast({
        title: "Voice not supported",
        description: "Please use Chrome or Edge for voice features",
        variant: "error"
      });
      return false;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setCurrentTranscript(prev => prev + finalTranscript);
      } else if (interimTranscript) {
        // Show interim results for real-time feedback
        setCurrentTranscript(prev => prev + interimTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        showToast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice",
          variant: "error"
        });
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (currentTranscript) {
        handleSendMessage(currentTranscript);
      }
    };
    
    recognitionRef.current = recognition;
    return true;
  };

  const startVoice = async () => {
    if (!audioUnlocked) {
      const unlocked = await unlockAudio();
      if (!unlocked) {
        showToast({
          title: "Tap to play Maia",
          description: "Audio needs user interaction to start",
          variant: "info"
        });
        return;
      }
      setAudioUnlocked(true);
    }

    setMode('voice');
    setCurrentTranscript('');

    // Native: Use Capacitor speech recognition
    if (isNativeRef.current) {
      try {
        showToast({
          title: "Starting voice...",
          description: "Initializing native speech recognition",
          variant: "info"
        });

        // Check if already listening
        const listeningStatus = await CapacitorSpeechRecognition.isListening();
        if (listeningStatus.listening) {
          await CapacitorSpeechRecognition.stop();
        }

        // Set up listener for partial results BEFORE starting
        capacitorListenerRef.current = await CapacitorSpeechRecognition.addListener(
          'partialResults',
          (data: { matches: string[] }) => {
            showToast({
              title: "Speech detected!",
              description: data.matches?.[0] || "Processing...",
              variant: "success"
            });
            if (data.matches && data.matches.length > 0) {
              const text = data.matches[0];
              setCurrentTranscript(text);

              // Clear existing silence timeout
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
              }

              // Set silence timeout for auto-stop (1.5 seconds)
              silenceTimeoutRef.current = setTimeout(async () => {
                const finalText = text.trim();
                if (finalText.length >= 3) {
                  await CapacitorSpeechRecognition.stop();
                  setIsListening(false);
                  handleSendMessage(finalText);
                }
              }, 1500);
            }
          }
        );

        // Start recognition - use popup:true on iOS for native UI
        await CapacitorSpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          popup: true,  // iOS needs native speech UI
          maxResults: 5
        });

        setIsListening(true);
        showToast({
          title: "Listening...",
          description: "Speak now - native recognition active",
          variant: "info"
        });

      } catch (err: any) {
        console.error('🎤 VoiceMirror: Failed to start native recognition:', err);
        showToast({
          title: "Voice unavailable",
          description: err?.message || "Could not start voice recognition",
          variant: "error"
        });
        setMode('text');
      }
      return;
    }

    // Web: Use browser Speech API
    if (!recognitionRef.current) {
      if (!initSpeechRecognition()) return;
    }

    // Wrapped in try-catch for compatibility - recognition.start() can throw
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      showToast({
        title: "Voice unavailable",
        description: "Could not start voice recognition. Please try again.",
        variant: "error"
      });
      setMode('text');
    }
  };

  const stopVoice = async () => {
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // Native: Use Capacitor stop
    if (isNativeRef.current) {
      try {
        await CapacitorSpeechRecognition.stop();
        if (capacitorListenerRef.current) {
          capacitorListenerRef.current.remove();
          capacitorListenerRef.current = null;
        }
      } catch (err) {
        console.error('🎤 VoiceMirror: Failed to stop native recognition:', err);
      }
    } else {
      // Web: Use browser API
      recognitionRef.current?.stop();
    }

    setIsListening(false);

    if (currentTranscript) {
      handleSendMessage(currentTranscript);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    addMessage('user', text);
    setCurrentTranscript('');
    setIsProcessing(true);
    
    try {
      // Send to Maya pipeline
      await sendMessage(text);
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast({
        title: "Connection issue",
        description: "Failed to reach Maia. Please try again.",
        variant: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string, audioUrl?: string) => {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      audioUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const pauseResponse = () => {
    // Pause audio playback
    setIsResponsePlaying(false);
    // Implementation depends on your audio player
  };

  const resumeResponse = () => {
    // Resume audio playback
    setIsResponsePlaying(true);
    // Implementation depends on your audio player
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      {/* Sacred Header */}
      <motion.div 
        className="p-4 border-b border-neutral-200 dark:border-neutral-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-xl font-light text-neutral-700 dark:text-neutral-300">
            Mirror Chamber
          </h2>
          
          {/* Mode Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {mode === 'voice' ? '🎤 Voice Mode' : '✍️ Text Mode'}
            </span>
            {prosodyData?.currentPhase && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-xs text-amber-700 dark:text-amber-300">
                {prosodyData.currentPhase}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'user' ? (
                  <div className="max-w-md px-4 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-lg">
                    {message.content}
                  </div>
                ) : (
                  <MaiaBubble 
                    text={message.content} 
                    audioUrl={message.audioUrl}
                    onPlayStateChange={setIsResponsePlaying}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="px-4 py-3 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-neutral-500 italic">
                      Maia is reflecting...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Hybrid Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        <HybridVoiceInput
          onSendMessage={handleSendMessage}
          onStartVoice={startVoice}
          onStopVoice={stopVoice}
          onPauseResponse={pauseResponse}
          onResumeResponse={resumeResponse}
          isVoiceActive={isListening}
          isResponsePlaying={isResponsePlaying}
          disabled={isProcessing || isStreaming}
          transcript={currentTranscript}
          isListening={isListening}
          showProsodyIndicator={true}
          prosodyData={prosodyData}
        />
      </div>

      {/* Audio Unlock Toast */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <button
              onClick={async () => {
                const unlocked = await unlockAudio();
                setAudioUnlocked(unlocked);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Tap to enable sacred voice ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}