'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  BookOpen,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BookChatProps {
  bookTitle: string;
  author: string;
  currentChapter?: {
    number: number;
    title: string;
    element?: string;
  };
  userId: string;
}

export function BookChat({
  bookTitle,
  author,
  currentChapter,
  userId
}: BookChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const buildContextMessage = (userMessage: string): string => {
    let context = `[Book Context: I'm reading "${bookTitle}" by ${author}`;

    if (currentChapter) {
      context += `. Currently on Chapter ${currentChapter.number}: "${currentChapter.title}"`;
      if (currentChapter.element) {
        context += ` (${currentChapter.element} element)`;
      }
    }

    context += ']\n\n';
    context += userMessage;

    return context;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationContext = messages
        .slice(-6) // Last 3 exchanges for context
        .map(m => `${m.role === 'user' ? 'Reader' : 'MAIA'}: ${m.content}`)
        .join('\n\n');

      const fullMessage = conversationContext
        ? `${buildContextMessage(userMessage)}\n\n[Previous conversation:\n${conversationContext}]`
        : buildContextMessage(userMessage);

      const res = await fetch('/api/between/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullMessage,
          userId,
          mode: 'counsel',
          meta: {
            context: 'elemental-alchemy-book-chat',
            bookTitle,
            author,
            ...(currentChapter && {
              chapterNum: currentChapter.number,
              chapterTitle: currentChapter.title,
              element: currentChapter.element
            })
          },
          sanctuary: false
        })
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I apologize, I had trouble responding. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Book chat error:', err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble connecting. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                     bg-gradient-to-r from-amber-500 to-orange-600
                     shadow-lg shadow-amber-500/30 flex items-center justify-center
                     hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full
                             text-xs text-white flex items-center justify-center font-medium">
                {messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]
                     bg-gradient-to-br from-slate-900 to-slate-950
                     rounded-2xl border border-white/10 shadow-2xl shadow-black/50
                     flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10
                          bg-gradient-to-r from-amber-500/10 to-orange-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                              flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Chat with MAIA</h3>
                  <p className="text-white/50 text-xs flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {currentChapter
                      ? `Ch. ${currentChapter.number}: ${currentChapter.title}`
                      : 'Elemental Alchemy'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white/60" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white/60" />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full
                                    bg-gradient-to-br from-amber-500/20 to-orange-500/20
                                    flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-amber-400" />
                      </div>
                      <p className="text-white/70 text-sm mb-2">
                        Ask me anything about the book
                      </p>
                      <p className="text-white/40 text-xs">
                        I'll guide you through the elemental teachings
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                              : 'bg-white/5 border border-white/10 text-white/90'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-white/60">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">MAIA is reflecting...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about the teachings..."
                      rows={1}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3
                               text-white placeholder-white/30 resize-none text-sm
                               focus:outline-none focus:border-amber-500/50
                               max-h-24 overflow-y-auto"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="w-11 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600
                               flex items-center justify-center text-white
                               hover:opacity-90 transition-opacity
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
