'use client';

/**
 * SessionReviewChat — Post-session conversation with MAIA
 *
 * After a scribe recording is stopped, this component lets the practitioner
 * ask MAIA questions about the completed session. Uses the existing
 * /api/scribe/review-session endpoint which injects full transcript context.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  FileText,
  ClipboardList,
  TrendingUp,
  Search,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface ReviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SessionReviewChatProps {
  reviewedSessionId: string;
  segmentCount: number;
  duration: number;
}

const quickPrompts = [
  { icon: Search, label: 'Session themes', prompt: 'What were the main themes in this session?' },
  { icon: ClipboardList, label: 'SOAP note', prompt: 'Generate a SOAP note for this session.' },
  { icon: Sparkles, label: 'Patterns', prompt: 'What patterns did you notice in the transcript?' },
  { icon: TrendingUp, label: 'Recommendations', prompt: 'Based on this session, what would you recommend for the next session?' },
];

export function SessionReviewChat({ reviewedSessionId, segmentCount, duration }: SessionReviewChatProps) {
  const [messages, setMessages] = useState<ReviewMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Session recorded — ${segmentCount} segments across ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s. I have the full transcript and any insights generated during the session. What would you like to explore?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ReviewMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const nextQuestionNumber = questionCount + 1;
    setQuestionCount(nextQuestionNumber);

    try {
      const response = await apiFetch('/api/scribe/review-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedSessionId,
          currentSessionId: `studio-review-${reviewedSessionId}`,
          question: messageContent,
          questionNumber: nextQuestionNumber,
        }),
      });

      const data = await response.json();

      const assistantMessage: ReviewMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success
          ? data.response
          : 'I was unable to process that question. The session data may still be loading — try again in a moment.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[SessionReview] Error:', err);
      const errorMessage: ReviewMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please check that the server is running and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '600px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-teal-400" />
        <span className="text-sm font-medium text-white">Review with MAIA</span>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2 overflow-x-auto">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-400 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            <qp.icon className="w-3 h-3 text-teal-400" />
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '250px' }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-teal-500/15 text-teal-100'
                    : 'bg-slate-800/70 text-slate-200'
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
            <div className="bg-slate-800/70 rounded-xl px-3.5 py-2.5">
              <div className="flex items-center gap-1.5 text-slate-500">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about the session..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-teal-500/50 min-h-[40px] max-h-24"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-teal-500/80 text-white rounded-lg hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
