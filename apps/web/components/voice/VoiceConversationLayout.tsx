'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface VoiceConversationLayoutProps {
  title: string;
  subtitle: string;
  messages: Message[];
  children?: React.ReactNode;
  headerActions?: React.ReactNode;
  renderMessage?: (message: Message) => React.ReactNode;
}

export default function VoiceConversationLayout({
  title,
  subtitle,
  messages,
  children,
  headerActions,
  renderMessage,
}: VoiceConversationLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
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
                {title}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderMessage ? renderMessage(message) : (
                  <DefaultMessageRenderer message={message} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {children}
    </div>
  );
}

function DefaultMessageRenderer({ message }: { message: Message }) {
  if (message.role === 'system') {
    return (
      <div className="text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
          {message.content}
        </p>
      </div>
    );
  }

  if (message.role === 'assistant') {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {message.content}
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[70%] bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white shadow-sm">
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}