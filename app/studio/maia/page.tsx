'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Lightbulb,
  Target,
  GitBranch,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Target, label: 'Run Clarity Gate', prompt: 'Help me run the Clarity Gate on a new goal' },
  { icon: GitBranch, label: 'Delegation help', prompt: 'Help me break down this task for delegation' },
  { icon: Clock, label: 'Time audit', prompt: 'Review my time usage this week and suggest improvements' },
  { icon: Lightbulb, label: 'Strategic review', prompt: 'What should I focus on this week?' },
];

export default function StudioMAIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm here to help you operate, not just produce. What decision needs clarity right now?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate response - in real implementation, this would call the MAIA API
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(messageContent),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getSimulatedResponse = (prompt: string): string => {
    if (prompt.toLowerCase().includes('clarity gate')) {
      return `Let's run the Clarity Gate.\n\n**PRE-GATE FRAME**\n\nThe Clarity Gate isn't about pressure or perfection. It's about deciding whether this is something to *build now* or simply *explore*.\n\nEither answer is valid — but they lead to different paths.\n\n**Q1: Who specifically is this for?**\n\nNot "everyone" — a person you could name, describe, find.`;
    }
    if (prompt.toLowerCase().includes('delegation') || prompt.toLowerCase().includes('break down')) {
      return `To delegate effectively, I need to understand:\n\n1. **What's the task?** (specific outcome needed)\n2. **What's blocking you from delegating it now?** (missing context? unclear scope? risk?)\n3. **What would "done" look like?** (so we can verify the output)\n\nWhich task do you want to break down?`;
    }
    if (prompt.toLowerCase().includes('time') || prompt.toLowerCase().includes('week')) {
      return `Looking at your week:\n\n**Hours**: Averaging 5.9h/day — *under your 8h target*. That's progress.\n\n**Fires**: 12 total, but trending down. You had 1 zero-fire day (Friday).\n\n**Delegation**: 32 tasks delegated, 19 shipped. Your delegation ratio is 73%.\n\n**The pattern**: You're spending less time, but still fighting fires. The next leverage point is reducing fires to near-zero.\n\nWant to identify which fire types keep recurring?`;
    }
    return `I hear you. Let me help you think through this as an operator, not a worker.\n\nWhat's the actual outcome you need? And who does it serve?`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-teal-400" />
          MAIA Consultation
        </h1>
        <p className="text-slate-400 mt-1">
          Strategic thinking, Clarity Gate, or just working through a problem
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b border-slate-800/50 flex items-center gap-2 overflow-x-auto">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-300 whitespace-nowrap transition-colors"
          >
            <qp.icon className="w-4 h-4 text-teal-400" />
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal-500/20 text-teal-100'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="What needs clarity?"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-teal-500/50 min-h-[48px] max-h-32"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
