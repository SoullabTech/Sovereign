'use client';

/**
 * SessionReviewChat — Post-session conversation with MAIA
 *
 * Flow after session ends:
 *  1. MAIA asks for client name (or skip)
 *  2. After name is set, MAIA auto-sends a layered session overview
 *  3. Full option menu is shown so practitioner can explore further
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  FileText,
  ClipboardList,
  TrendingUp,
  Search,
  Zap,
  Globe,
  Eye,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { ParentUpdateDrawer } from '@/components/studio/ParentUpdateDrawer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ReviewLens = 'core' | 'spiralogic' | 'mentor';

interface SessionReviewChatProps {
  reviewedSessionId: string;
  segmentCount: number;
  duration: number;
  caseId?: string | null;
}

// ---------------------------------------------------------------------------
// Quick options — shown after overview loads
// ---------------------------------------------------------------------------

const CORE_PROMPTS = [
  { label: 'SOAP note', prompt: 'Generate a SOAP note for this session.' },
  { label: 'DAP note', prompt: 'Generate a DAP note for this session.' },
  { label: 'Next session', prompt: 'What would you focus on in the next session based on this?' },
  { label: 'Action items', prompt: 'What are the key action items from this session?' },
];

const SPIRALOGIC_PROMPTS = [
  { label: 'Elemental map', prompt: 'Map this session through the five elements (Fire, Water, Earth, Air, Aether).' },
  { label: 'Spiral phase', prompt: 'Which spiral phase does this person appear to be in, and why?' },
  { label: 'Council report', prompt: 'Generate a Council Report for this session — one voice per element.' },
  { label: 'Shadow moments', prompt: 'Identify the shadow moments in this session.' },
];

const MENTOR_PROMPTS = [
  { label: 'Practitioner edge', prompt: 'What was my growing edge as a practitioner in this session?' },
  { label: 'Intervention review', prompt: 'Review my interventions — what landed, what missed?' },
  { label: 'Blind spots', prompt: 'What blind spots might I have had in this session?' },
  { label: 'Training note', prompt: 'Write a reflective training note I could use for CPD.' },
];

const LENS_PROMPTS: Record<ReviewLens, typeof CORE_PROMPTS> = {
  core: CORE_PROMPTS,
  spiralogic: SPIRALOGIC_PROMPTS,
  mentor: MENTOR_PROMPTS,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionReviewChat({ reviewedSessionId, segmentCount, duration }: SessionReviewChatProps) {
  const durationMin = Math.floor(duration / 60);
  const durationSec = Math.floor(duration % 60);

  // Name collection phase
  const [clientName, setClientName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [namePhase, setNamePhase] = useState<'asking' | 'done'>('asking');

  // Chat state
  const hasContent = segmentCount > 0;
  const [messages, setMessages] = useState<ReviewMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: hasContent
        ? `Session captured — ${segmentCount} turns across ${durationMin}m ${durationSec}s.\n\nWho was this session with? Enter a name, or press Enter to skip.`
        : `Session recorded (${durationMin}m ${durationSec}s) but no transcript was captured. Review is not available for this session.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [activeLens, setActiveLens] = useState<ReviewLens>('core');
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [transcriptQuality, setTranscriptQuality] = useState<{
    phantomRemoved: string | null;
    sampled: boolean;
    segmentCount: number;
    segmentsSampled: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const hasAutoOverview = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------------------
  // API call
  // ---------------------------------------------------------------------------

  const sendToMaia = useCallback(
    async (question: string, overrideName?: string) => {
      if (isLoading) return;
      setIsLoading(true);

      const nextQ = questionCount + 1;
      setQuestionCount(nextQ);

      try {
        const response = await apiFetch('/api/scribe/review-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewedSessionId,
            currentSessionId: `studio-review-${reviewedSessionId}`,
            question,
            questionNumber: nextQ,
            lens: activeLens,
            clientName: overrideName !== undefined ? overrideName : clientName,
          }),
        });

        const data = await response.json();

        // Capture transcript quality info from first response
        if (data._meta && !transcriptQuality) {
          setTranscriptQuality({
            phantomRemoved: data._meta.phantomPrefixRemoved || null,
            sampled: data._meta.segmentsSampled < data._meta.segmentCount,
            segmentCount: data._meta.segmentCount,
            segmentsSampled: data._meta.segmentsSampled,
          });
        }

        const assistantMessage: ReviewMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.success
            ? data.response
            : data.phase === 'generation'
              ? `I couldn't generate the overview just now — the language model was briefly unavailable. Your session is safe; please try again in a moment.${data.error ? ` (${data.error})` : ''}`
              : `I wasn't able to load the session data.${data.error ? ` (${data.error})` : ' Please try again.'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setOptionsVisible(true);
      } catch (err) {
        console.error('[SessionReview]', err);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Connection error. Please check the server is running and try again.',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, questionCount, reviewedSessionId, activeLens, clientName, transcriptQuality]
  );

  // ---------------------------------------------------------------------------
  // Name submission → trigger auto-overview
  // ---------------------------------------------------------------------------

  const handleNameSubmit = useCallback(
    (rawName: string) => {
      if (namePhase === 'done') return;
      setNamePhase('done');

      const trimmed = rawName.trim();
      const resolvedName = trimmed === '' || trimmed.toLowerCase() === 'skip' ? null : trimmed;
      setClientName(resolvedName);

      // Echo user choice
      const userMsg: ReviewMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: resolvedName || '(anonymous)',
        timestamp: new Date(),
      };

      const bridgeMsg: ReviewMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: resolvedName
          ? `Got it — session with ${resolvedName}. Building an overview now…`
          : 'Anonymous session. Building an overview now…',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg, bridgeMsg]);

      if (!hasAutoOverview.current) {
        hasAutoOverview.current = true;
        setTimeout(() => {
          sendToMaia('Provide a layered overview of this session.', resolvedName ?? undefined);
        }, 200);
      }
    },
    [namePhase, sendToMaia]
  );

  // ---------------------------------------------------------------------------
  // Regular message send
  // ---------------------------------------------------------------------------

  const handleSend = useCallback(
    async (content?: string) => {
      const messageContent = content || input;
      if (!messageContent.trim() || isLoading) return;

      if (namePhase === 'asking') {
        handleNameSubmit(messageContent);
        setInput('');
        return;
      }

      const userMessage: ReviewMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      await sendToMaia(messageContent);
    },
    [input, isLoading, namePhase, handleNameSubmit, sendToMaia]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const currentPrompts = LENS_PROMPTS[activeLens];

  // Parent update drawer
  const [parentUpdateOpen, setParentUpdateOpen] = useState(false);

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '680px' }}>
      {/* Header + Lens tabs */}
      <div className="px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">Review with MAIA</span>
          {clientName && (
            <span className="ml-auto text-xs text-slate-500">with {clientName}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(['core', 'spiralogic', 'mentor'] as ReviewLens[]).map(lens => (
            <button
              key={lens}
              onClick={() => setActiveLens(lens)}
              className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                activeLens === lens
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {lens}
            </button>
          ))}
          {namePhase === 'done' && hasContent && (
            <button
              onClick={() => setParentUpdateOpen(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
            >
              <Send className="w-3 h-3" />
              Parent Update
            </button>
          )}
        </div>
      </div>

      {/* Transcript quality banner */}
      <AnimatePresence>
        {transcriptQuality && (transcriptQuality.phantomRemoved || transcriptQuality.sampled) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-2 border-b border-slate-800/30"
          >
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <AlertTriangle className="w-3 h-3 text-amber-500/70 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                {transcriptQuality.phantomRemoved && (
                  <p>Transcript cleaned: repeated phrase removed from segments.</p>
                )}
                {transcriptQuality.sampled && (
                  <p>
                    Long session — using {transcriptQuality.segmentsSampled} of {transcriptQuality.segmentCount} segments
                    (head + sampled middle + tail).
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick option chips — shown after overview */}
      <AnimatePresence>
        {optionsVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2 overflow-x-auto"
          >
            {currentPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-xs text-slate-400 whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '280px' }}>
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-xl px-3.5 py-2.5 ${
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
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

      {/* Input — disabled when no transcript content */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        {!hasContent ? (
          <div className="text-center py-1">
            <p className="text-xs text-slate-600">Review unavailable — no transcript content.</p>
          </div>
        ) : namePhase === 'asking' ? (
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleNameSubmit(nameInput);
                  setNameInput('');
                }
              }}
              placeholder="Client name or press Enter to skip…"
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
            <button
              onClick={() => { handleNameSubmit(nameInput); setNameInput(''); }}
              className="p-2 bg-teal-500/80 text-white rounded-lg hover:bg-teal-500 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask through the ${activeLens} lens…`}
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
        )}
      </div>

      {/* Parent Update Drawer */}
      <ParentUpdateDrawer
        sessionId={reviewedSessionId}
        clientName={clientName}
        isOpen={parentUpdateOpen}
        onClose={() => setParentUpdateOpen(false)}
      />
    </div>
  );
}
