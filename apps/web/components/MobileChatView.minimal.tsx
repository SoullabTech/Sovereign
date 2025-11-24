'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send } from 'lucide-react';

/**
 * MINIMAL WORKING MobileChatView - Skeleton Template
 * Use this to compare against broken version and identify extra moving parts
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}

interface MobileChatViewProps {
  userId: string;
  onSendMessage: (text: string) => void;
  messages: Message[];
  isLoading?: boolean;
}

export default function MobileChatView({
  userId,
  onSendMessage,
  messages = [],
  isLoading = false
}: MobileChatViewProps) {
  // ============ STATE ============
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============ EFFECTS ============
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============ HANDLERS ============
  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage?.(inputText.trim());
      setInputText('');
    }
  };

  // ============ RENDER ============
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 via-neutral-800 to-orange-900/20">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages?.map((message, index) => (
            <motion.div
              key={message.id ?? index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] px-4 py-3 rounded-2xl
                ${message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white'
                  : 'bg-white/15 text-white border border-emerald-500/20'}
              `}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/15 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 bg-black/30 p-4">
        <div className="flex items-center gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's present..."
              className="w-full px-4 py-3 bg-white/15 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px] max-h-[120px] text-base leading-relaxed"
              rows={1}
            />
          </div>

          {/* Send/Voice button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500 disabled:bg-white/20 disabled:text-white/40 text-white transition-all hover:scale-105 active:scale-95"
          >
            {inputText ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}