'use client';

/**
 * SessionReviewChat — Post-session practitioner review toolkit
 *
 * Fathom-equivalent for Spiralogic practitioners.
 * Three lenses on the same session:
 *   Core      — clinical documentation (SOAP/DAP, themes, patterns)
 *   Spiralogic — elemental map, spiral phase, Council Report
 *   Mentor     — MAIA as supervisor: practitioner development + training edge
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  ClipboardList,
  TrendingUp,
  Search,
  Layers,
  BookOpen,
  GraduationCap,
  Flame,
  ListChecks,
  Users,
  Download,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface ReviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  lens?: 'core' | 'spiralogic' | 'mentor';
}

interface SessionReviewChatProps {
  reviewedSessionId: string;
  segmentCount: number;
  duration: number;
}

type Lens = 'core' | 'spiralogic' | 'mentor';

interface QuickPrompt {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const lenses: { id: Lens; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'core',       label: 'Core',       icon: ClipboardList, color: 'text-teal-400' },
  { id: 'spiralogic', label: 'Spiralogic', icon: Flame,         color: 'text-amber-400' },
  { id: 'mentor',     label: 'Mentor',     icon: GraduationCap, color: 'text-violet-400' },
];

const quickPromptsByLens: Record<Lens, QuickPrompt[]> = {
  core: [
    { icon: Search,      label: 'Session themes',  prompt: 'What were the main themes in this session?' },
    { icon: ClipboardList, label: 'SOAP note',     prompt: 'Generate a professional SOAP note for this session.' },
    { icon: BookOpen,    label: 'DAP note',         prompt: 'Generate a DAP note for this session.' },
    { icon: TrendingUp,  label: 'Next session',     prompt: 'Based on this session, what do you recommend focusing on next session?' },
    { icon: ListChecks,  label: 'Action items',     prompt: 'Extract all action items, intentions, and commitments from this session.' },
  ],
  spiralogic: [
    { icon: Flame,   label: 'Elemental map',    prompt: 'Map the dominant elements in this session. Where did the energy start, where did it move, and how did it resolve?' },
    { icon: Layers,  label: 'Spiral phase',     prompt: 'Assess the spiral phase of this client based on what emerged in the session. What is their current developmental edge?' },
    { icon: Users,   label: 'Council Report',   prompt: 'Generate a Spiralogic Council Report for this session. Offer perspectives from at least three council voices (e.g. Fire/Initiation, Water/Depth, Earth/Ground, Air/Clarity) on the session themes. Format as a structured report.' },
    { icon: Sparkles, label: 'Archetypal map',  prompt: 'What archetypal patterns or mythic themes are present in this session? How do they inform the developmental work?' },
    { icon: Search,  label: 'Shadow moments',   prompt: 'Where in this session did shadow or avoidance appear? What was the client moving away from, and what might that be protecting?' },
  ],
  mentor: [
    { icon: GraduationCap, label: 'Practitioner edge', prompt: 'From a practitioner training perspective, what did I navigate well in this session, and what is my growing edge?' },
    { icon: Sparkles,      label: 'Intervention review', prompt: 'Review the key interventions in this session. Which were most effective? Where might I have moved differently?' },
    { icon: Layers,        label: 'Case formulation',   prompt: 'Generate a Spiralogic case formulation for this client based on today\'s session. Include presenting pattern, elemental imbalance, relational phase, and suggested direction.' },
    { icon: Search,        label: 'Blind spots',        prompt: 'As my supervisor, what blind spots or countertransference moments do you notice in this session from my side as practitioner?' },
    { icon: BookOpen,      label: 'Training note',      prompt: 'Write a brief training note I could use for CPD (continuing professional development) based on what this session surfaced in my practice.' },
  ],
};

export function SessionReviewChat({ reviewedSessionId, segmentCount, duration }: SessionReviewChatProps) {
  const [messages, setMessages] = useState<ReviewMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Session captured — ${segmentCount} segments across ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s. I have the full transcript and markers. Choose a lens to begin, or ask anything directly.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [activeLens, setActiveLens] = useState<Lens>('core');
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content?: string, lens?: Lens) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    const usedLens = lens || activeLens;

    const userMessage: ReviewMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      lens: usedLens,
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
          lens: usedLens,
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
        lens: usedLens,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[SessionReview] Error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please check that the server is running and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await apiFetch('/api/scribe/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: reviewedSessionId,
          lens: 'full',
          format: 'markdown',
        }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-report-${reviewedSessionId.slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[SessionReview] Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const activeLensConfig = lenses.find(l => l.id === activeLens)!;
  const activePrompts = quickPromptsByLens[activeLens];

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '680px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">Review with MAIA</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{segmentCount} segments · {Math.floor(duration / 60)}m</span>
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            title="Export full session report as Markdown"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 rounded-lg text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <Download className="w-3 h-3" />
            {isExporting ? 'Generating…' : 'Export report'}
          </button>
        </div>
      </div>

      {/* Lens selector */}
      <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-1">
        {lenses.map(lens => {
          const Icon = lens.icon;
          const isActive = activeLens === lens.id;
          return (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? lens.color : ''}`} />
              {lens.label}
            </button>
          );
        })}
      </div>

      {/* Quick Prompts for active lens */}
      <div className="px-4 py-2 border-b border-slate-800/20 flex items-center gap-2 overflow-x-auto">
        {activePrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt, activeLens)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-400 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              <Icon className={`w-3 h-3 ${activeLensConfig.color}`} />
              {qp.label}
            </button>
          );
        })}
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
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-teal-500/15 text-teal-100'
                    : 'bg-slate-800/70 text-slate-200'
                }`}
              >
                {message.lens && message.role === 'assistant' && (
                  <div className="text-xs text-slate-500 mb-1 capitalize">{message.lens}</div>
                )}
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
            placeholder={`Ask through the ${activeLens} lens...`}
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
