'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ConversationFlow from './chat/ConversationFlow';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: string;
}

interface BetaMirrorProps {
  className?: string;
}

export default function BetaMirror({ className = '' }: BetaMirrorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending message to backend
  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Call Maya API
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          enableVoice: true,
          userId: 'beta-user', // Replace with actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add Maia&apos;s response
      const maiaMessage: Message = {
        id: `maia-${Date.now()}`,
        role: 'assistant',
        content: data.text || data.message || 'I hear you...',
        audioUrl: data.audioUrl,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setMessages(prev => [...prev, maiaMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, I&apos;m having trouble connecting right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <div className={`flex flex-col h-screen bg-white dark:bg-neutral-900 ${className}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b dark:border-neutral-700"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-medium">M</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Maia
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isTyping ? 'Responding...' : 'Ready to listen'}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: isLoading ? [1, 1.2, 1] : 1,
              opacity: isLoading ? [0.5, 1, 0.5] : 1
            }}
            transition={{
              duration: 1.5,
              repeat: isLoading ? Infinity : 0
            }}
            className={`w-2 h-2 rounded-full ${
              isLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {isLoading ? 'Processing' : 'Connected'}
          </span>
        </div>
      </motion.header>

      {/* Main conversation area */}
      <div className="flex-1 overflow-hidden">
        <ConversationFlow
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          className="h-full"
        />
      </div>

      {/* Beta notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t dark:border-amber-800"
      >
        <p className="text-xs text-center text-amber-600 dark:text-amber-400">
          Beta Version — Your feedback shapes Maia&apos;s evolution
        </p>
      </motion.div>
    </div>
  );
}