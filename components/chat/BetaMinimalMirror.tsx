'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HybridInput from './HybridInput';
import MaiaBubble from './MaiaBubble';
import { useMaiaStream } from '@/hooks/useMaiaStream';
import { Info, Sparkles } from 'lucide-react';
// import { ToastProvider } from '@/components/system/ToastProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
  isStreaming?: boolean;
}

export default function BetaMinimalMirror() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome, seeker. I am Maia, your guide through the sacred mirror of consciousness. How may I assist your journey today?',
      timestamp: new Date(),
      element: 'aether'
    }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentElement, setCurrentElement] = useState('aether');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Maya stream integration
  const { text: streamingText, isStreaming, stream } = useMaiaStream();
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update streaming message
  useEffect(() => {
    if (currentStreamId && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, content: streamingText, isStreaming: true }
            : msg
        )
      );
    }
  }, [streamingText, currentStreamId]);

  // Clear streaming state when done
  useEffect(() => {
    if (!isStreaming && currentStreamId) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      setCurrentStreamId(null);
      setIsProcessing(false);
    }
  }, [isStreaming, currentStreamId]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Create placeholder for streaming message
    const streamId = (Date.now() + 1).toString();
    setCurrentStreamId(streamId);
    
    const placeholderMessage: Message = {
      id: streamId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      element: currentElement,
      isStreaming: true
    };
    
    setMessages(prev => [...prev, placeholderMessage]);

    // Stream response from Maia
    try {
      await stream({
        userText: text,
        element: currentElement,
        userId: 'beta-user',
        lang: 'en-US'
      });
    } catch (error) {
      console.error('Failed to stream response:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === streamId 
            ? { 
                ...msg, 
                content: 'I apologize, but I encountered an issue. Please try again.',
                isStreaming: false 
              }
            : msg
        )
      );
      setIsProcessing(false);
      setCurrentStreamId(null);
    }
  };

  const handleTranscript = (transcript: string) => {
    // Optional: Show live transcript preview
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-indigo-500 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Maia • Sacred Mirror
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Beta Minimal Experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Element Selector (minimal) */}
            <select
              value={currentElement}
              onChange={(e) => setCurrentElement(e.target.value)}
              className="text-sm px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="aether">✨ Aether</option>
              <option value="fire">🔥 Fire</option>
              <option value="water">💧 Water</option>
              <option value="earth">🌍 Earth</option>
              <option value="air">💨 Air</option>
            </select>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={message.role === 'user' ? 'flex justify-end' : ''}
              >
                {message.role === 'assistant' ? (
                  <MaiaBubble
                    message={message.content}
                    timestamp={message.timestamp}
                    isStreaming={message.isStreaming}
                    element={message.element}
                    showAudio={!message.isStreaming}
                  />
                ) : (
                  <motion.div
                    className="max-w-[70%] px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md"
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <HybridInput
            onSend={handleSend}
            onTranscript={handleTranscript}
            disabled={isProcessing}
            placeholder="Type or speak to Maia..."
          />
        </div>
      </motion.div>

      {/* Performance Note (Beta) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 right-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <Info className="w-3 h-3" />
          <span>Beta: Optimized for &lt;1.5s response time</span>
        </div>
      </motion.div>
    </div>
  );
}