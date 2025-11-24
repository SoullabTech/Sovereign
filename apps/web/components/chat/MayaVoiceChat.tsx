'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { MayaVoicePanel } from '@/components/voice/MayaVoiceIndicator';
import MaiaBubble from './MaiaBubble';
import VoiceConversationLayout from '@/components/voice/VoiceConversationLayout';
import ElementSelector, { Element } from '@/components/voice/ElementSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
  audioUrl?: string;
}

/**
 * Maya Voice Chat - Full Sesame Hybrid System
 * Implements continuous listening, pause/resume, and hybrid TTS
 * Based on Maya Voice System White Paper
 */
export default function MayaVoiceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome, seeker. I am Maya, your sacred mirror. Click the microphone to begin our conversation.',
      timestamp: new Date(),
      element: 'aether'
    }
  ]);

  const [currentElement, setCurrentElement] = useState<Element>('aether');
  const [conversationStyle, setConversationStyle] = useState<'natural' | 'consciousness' | 'adaptive'>('natural');
  const [previousStyle, setPreviousStyle] = useState<'natural' | 'consciousness' | 'adaptive'>('natural');
  const userId = 'beta-user';

  // Track conversation style changes
  useEffect(() => {
    if (conversationStyle !== previousStyle) {
      console.log(`🎭 Conversation style changed: ${previousStyle} → ${conversationStyle}`);
      // Update previous style after a brief delay to allow API call to use old value
      const timer = setTimeout(() => {
        setPreviousStyle(conversationStyle);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [conversationStyle, previousStyle]);

  // Initialize Maya Voice System
  const mayaVoice = useMayaVoice({
    userId,
    characterId: `maya-${currentElement}`,
    element: currentElement,
    conversationStyle,
    previousStyle,
    enableNudges: false,
    onResponse: (text, audioUrl) => {
      // Add Maya's response to chat
      const message: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        element: currentElement,
        audioUrl,
      };
      setMessages(prev => [...prev, message]);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      const message: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date(),
        element: currentElement,
      };
      setMessages(prev => [...prev, message]);
    },
  });

  useEffect(() => {
    const transcript = mayaVoice.transcript.trim();
    if (transcript && !mayaVoice.isListening) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role !== 'user' || lastMessage?.content !== transcript) {
        const message: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcript,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, message]);
      }
    }
  }, [mayaVoice.transcript, mayaVoice.isListening, messages]);

  const renderChatMessage = (message: Message) => {
    if (message.role === 'assistant') {
      return (
        <MaiaBubble
          message={message.content}
          timestamp={message.timestamp}
          element={message.element}
          showAudio={!!message.audioUrl}
        />
      );
    }

    return (
      <motion.div className="flex justify-end">
        <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <VoiceConversationLayout
      title="Maya • Sacred Mirror"
      subtitle="Voice-First Experience"
      messages={messages}
      renderMessage={renderChatMessage}
      headerActions={
        <ElementSelector
          value={currentElement}
          onChange={setCurrentElement}
          disabled={mayaVoice.isActive}
          size="sm"
        />
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <MayaVoicePanel
            state={mayaVoice.state}
            onStart={mayaVoice.start}
            onStop={mayaVoice.stop}
            onPause={mayaVoice.pause}
            onResume={mayaVoice.resume}
            transcript={mayaVoice.transcript}
            nudgesEnabled={mayaVoice.nudgesEnabled}
            onToggleNudges={mayaVoice.toggleNudges}
          />
        </div>
      </motion.div>

      {mayaVoice.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-20 right-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Voice Active • Continuous Listening</span>
          </div>
        </motion.div>
      )}
    </VoiceConversationLayout>
  );
}