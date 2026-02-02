'use client';

/**
 * Embedded MAIA Chat for Oracle Results
 *
 * A lightweight, inline conversation component that allows users to discuss
 * oracle readings with MAIA without leaving the results page.
 *
 * Features:
 * - Pre-seeded with reading context
 * - Collapsible/expandable interface
 * - Simple text-based chat
 * - Uses /api/between/chat endpoint
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Message {
  id: string;
  role: 'user' | 'maia';
  content: string;
  timestamp: Date;
}

interface EmbeddedMAIAChatProps {
  /** Pre-formatted context about the oracle reading to seed the conversation */
  readingContext: string;
  /** The original question asked */
  question: string;
  /** Oracle type for context (e.g., 'I Ching', 'Tarot') */
  oracleType: string;
  /** Optional className for styling */
  className?: string;
  /** Start expanded */
  defaultExpanded?: boolean;
}

export function EmbeddedMAIAChat({
  readingContext,
  question,
  oracleType,
  className = '',
  defaultExpanded = false
}: EmbeddedMAIAChatProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && hasStarted) {
      inputRef.current?.focus();
    }
  }, [isExpanded, hasStarted]);

  // Start conversation with context
  const startConversation = async () => {
    setHasStarted(true);
    setIsLoading(true);

    // Create the initial context message
    const contextMessage = `I just received a ${oracleType} reading for my question: "${question}"\n\n${readingContext}\n\nHelp me understand how this applies to my situation.`;

    // Add user message to UI
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `I'd like to explore this ${oracleType} reading with you.`,
      timestamp: new Date()
    };
    setMessages([userMessage]);

    try {
      // Send to MAIA with full context
      const response = await apiFetch('/api/between/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextMessage,
          conversationHistory: [],
          context: {
            oracleType,
            question,
            isOracleReading: true
          }
        })
      });

      const data = await response.json();

      if (data.response || data.message) {
        const maiaMessage: Message = {
          id: `maia-${Date.now()}`,
          role: 'maia',
          content: data.response || data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, maiaMessage]);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'maia',
        content: 'I apologize, but I encountered an issue connecting. Please try again or use the main conversation page.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a follow-up message
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages.map(m => ({
        role: m.role === 'maia' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await apiFetch('/api/between/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText.trim(),
          conversationHistory: history,
          context: {
            oracleType,
            question,
            isOracleReading: true
          }
        })
      });

      const data = await response.json();

      if (data.response || data.message) {
        const maiaMessage: Message = {
          id: `maia-${Date.now()}`,
          role: 'maia',
          content: data.response || data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, maiaMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'maia',
        content: 'I apologize, but I had trouble processing that. Could you try rephrasing?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`bg-gradient-to-br from-violet-900/30 via-purple-800/20 to-indigo-900/30 backdrop-blur-xl border border-violet-500/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!hasStarted && !isExpanded) {
            startConversation();
          }
        }}
        className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
      >
        <MessageSquare className="w-6 h-6 text-violet-400" />
        <div className="flex-1 text-left">
          <h4 className="text-lg font-semibold text-violet-200">Explore with MAIA</h4>
          <p className="text-violet-300/70 text-sm">
            {hasStarted
              ? `${messages.length} message${messages.length !== 1 ? 's' : ''} in conversation`
              : 'Discuss this reading\'s meaning for your situation'}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-violet-400" />
        </motion.div>
      </button>

      {/* Expandable Chat Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-violet-500/20">
              {/* Messages Area */}
              <div className="h-64 overflow-y-auto p-4 space-y-4">
                {!hasStarted ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="w-10 h-10 text-violet-400/50 mb-3" />
                    <p className="text-violet-300/70 text-sm">
                      Click to begin exploring your {oracleType} reading with MAIA
                    </p>
                    <button
                      onClick={startConversation}
                      className="mt-4 px-4 py-2 bg-violet-600/50 hover:bg-violet-600/70 text-violet-100 rounded-lg text-sm transition-colors"
                    >
                      Start Conversation
                    </button>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-violet-600/50 text-violet-100'
                              : 'bg-black/30 text-violet-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-black/30 rounded-lg px-4 py-2">
                          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {hasStarted && (
                <div className="p-4 border-t border-violet-500/20">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask about your reading..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-black/30 border border-violet-500/30 rounded-lg text-violet-100 placeholder-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputText.trim() || isLoading}
                      className="px-4 py-2 bg-violet-600/50 hover:bg-violet-600/70 disabled:bg-violet-600/20 disabled:cursor-not-allowed text-violet-100 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmbeddedMAIAChat;
