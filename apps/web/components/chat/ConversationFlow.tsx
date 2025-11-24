'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MaiaBubble from '../voice/MaiaBubble';
import TranscriptStream from '../voice/TranscriptStream';
import HybridVoiceInput from '../voice/HybridVoiceInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: string;
}

interface ConversationFlowProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isTyping?: boolean;
  className?: string;
}

export default function ConversationFlow({ 
  onSendMessage,
  messages,
  isTyping = false,
  className = ''
}: ConversationFlowProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle voice start
  const handleStartVoice = async () => {
    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Unlock audio if first time
      if (!audioUnlocked) {
        const audio = new Audio();
        audio.play().catch(() => {});
        setAudioUnlocked(true);
      }

      // Start speech recognition
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setMicError('Speech recognition not supported');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptChunk + ' ';
          } else {
            interim += transcriptChunk;
          }
        }
        
        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Microphone access denied');
        }
        setIsVoiceActive(false);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      
      setIsVoiceActive(true);
      setIsListening(true);
      setMicError(null);
    } catch (err) {
      console.error('Failed to start voice:', err);
      setMicError('Microphone access denied');
    }
  };

  // Handle voice stop  
  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Send transcript if exists
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      setTranscript('');
    }
    
    setIsVoiceActive(false);
    setIsListening(false);
    setInterimTranscript('');
  };

  // Handle text message send
  const handleSendMessage = async (message: string) => {
    await onSendMessage(message);
    setTranscript('');
    setInterimTranscript('');
  };

  // Render user message bubble
  const renderUserMessage = (message: Message) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-end mb-4"
    >
      <div className="max-w-[85%] px-4 py-2 rounded-2xl bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">
        <p className="text-sm">{message.content}</p>
        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {message.timestamp}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            message.role === 'user' 
              ? renderUserMessage(message)
              : <MaiaBubble
                  key={message.id}
                  text={message.content}
                  audioUrl={message.audioUrl}
                  timestamp={message.timestamp}
                />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <MaiaBubble
            text=""
            isTyping={true}
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript display */}
      {isListening && (
        <div className="px-4 pb-2">
          <TranscriptStream
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />
        </div>
      )}

      {/* Error display */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm"
          >
            {micError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio unlock toast */}
      <AnimatePresence>
        {audioUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              setTimeout(() => setAudioUnlocked(false), 3000);
            }}
            className="mx-4 mb-2 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm"
          >
            🔊 Maia&apos;s voice unlocked — you&apos;ll now hear her replies
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t dark:border-neutral-700">
        <HybridVoiceInput
          onSendMessage={handleSendMessage}
          onStartVoice={handleStartVoice}
          onStopVoice={handleStopVoice}
          isVoiceActive={isVoiceActive}
          isListening={isListening}
          transcript={transcript + interimTranscript}
          placeholder="Type or speak to Maia..."
        />
      </div>
    </div>
  );
}