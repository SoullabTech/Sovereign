'use client';

/**
 * SessionReviewChat — Post-session conversation with MAIA
 *
 * Content-first flow (2026-07-18): opening a review immediately pulls a layered
 * overview — the practitioner should never have to identify the client before
 * seeing the session, because you often cannot recognize who it was until you
 * see the content. The client name is optional metadata that can be added
 * afterward to personalize further questions; it is never a gate and never an
 * auth/ownership key (ownership is enforced server-side by member_id).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  FileText,
  ListTree,
  Lightbulb,
  ScrollText,
  ArrowRight,
  AlertTriangle,
  UserPlus,
  X,
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
  /**
   * Whether Parent Update applies to this session source. Default false:
   * Parent Update is an rl_session-scoped artifact and must NOT appear merely
   * because a review exists (it fails closed with session_not_found on scribe
   * sessions). Only a caller whose session source + policy explicitly support
   * it passes true. Future: a deliberate practitioner workflow with its own
   * consent/recipient/provenance policy.
   */
  parentUpdateSupported?: boolean;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Primary deliverables — always available once a session has content.
// These are the headline outputs a practitioner reaches for first.
// `kind: 'transcript'` is served from the raw transcript endpoint (GET), not
// the model — the others are model syntheses (POST).
// ---------------------------------------------------------------------------

const DELIVERABLES: Array<{
  label: string;
  icon: typeof FileText;
  prompt?: string;
  kind?: 'transcript';
}> = [
  { label: 'Overview', icon: FileText, prompt: 'Provide a layered overview of this session.' },
  { label: 'Outline', icon: ListTree, prompt: 'Give me a structured outline of this session — the main sections and how it moved from beginning to end.' },
  { label: 'Insights', icon: Lightbulb, prompt: 'What are the key insights and themes from this session?' },
  { label: 'Transcript', icon: ScrollText, kind: 'transcript' },
];

// ---------------------------------------------------------------------------
// Lens-specific deeper prompts — shown below the deliverables.
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

export function SessionReviewChat({ reviewedSessionId, segmentCount, duration, parentUpdateSupported = false }: SessionReviewChatProps) {
  const durationMin = Math.floor(duration / 60);
  const durationSec = Math.floor(duration % 60);
  const hasContent = segmentCount > 0;

  // Client name is optional metadata, added after the content is seen.
  const [clientName, setClientName] = useState<string | null>(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const clientNameRef = useRef<string | null>(null);
  clientNameRef.current = clientName;

  const [messages, setMessages] = useState<ReviewMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: hasContent
        ? `Session captured — ${segmentCount} turns across ${durationMin}m ${durationSec}s. Pulling together your overview…`
        : `Session recorded (${durationMin}m ${durationSec}s) but no transcript was captured. Review is not available for this session.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [activeLens, setActiveLens] = useState<ReviewLens>('core');
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
    if (nameEditing) nameInputRef.current?.focus();
  }, [nameEditing]);

  // ---------------------------------------------------------------------------
  // Model call (POST) — syntheses. clientName is read live from the ref so a
  // name added mid-review personalizes later answers without re-wiring deps.
  // ---------------------------------------------------------------------------

  const sendToMaia = useCallback(
    async (question: string) => {
      if (isLoading) return;
      setIsLoading(true);

      const nextQ = questionCount + 1;
      setQuestionCount(nextQ);

      // One message bubble per request, updated in place: a long session shows
      // truthful progress ("N of M segments read…") that resolves into the
      // final answer, instead of a spinner then a generic error.
      const msgId = `sr-${Date.now()}`;
      const upsert = (content: string) =>
        setMessages(prev => {
          const idx = prev.findIndex(m => m.id === msgId);
          if (idx === -1) return [...prev, { id: msgId, role: 'assistant' as const, content, timestamp: new Date() }];
          const copy = prev.slice();
          copy[idx] = { ...copy[idx], content };
          return copy;
        });

      const deadline = Date.now() + 6 * 60 * 1000; // honest cap for very long sessions
      let pollDelay = 2500;

      try {
        // Poll loop: the server runs long reviews as a background job and
        // returns 202 {status:'processing'} until the artifact is ready.
        // Distinct terminal states — processing, failed(stage), provider
        // failure, load failure, connection loss — are never collapsed.
        while (true) {
          let data: any;
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
                clientName: clientNameRef.current,
              }),
            });
            data = await response.json();
          } catch (netErr) {
            console.error('[SessionReview] connection', netErr);
            upsert('The connection dropped while loading the review. Your session is safe — please try again.');
            break;
          }

          if (data._meta && !transcriptQuality && data._meta.segmentCount !== undefined) {
            setTranscriptQuality({
              phantomRemoved: data._meta.phantomPrefixRemoved || null,
              sampled: (data._meta.segmentsSampled ?? data._meta.segmentCount) < data._meta.segmentCount,
              segmentCount: data._meta.segmentCount,
              segmentsSampled: data._meta.segmentsSampled ?? data._meta.segmentCount,
            });
          }

          if (data.status === 'processing') {
            const done = data.progress?.done ?? 0;
            const total = data.progress?.total ?? '…';
            upsert(`Reviewing the full session — ${done} of ${total} segments read…`);
            if (Date.now() > deadline) {
              upsert('This review is taking longer than expected and may still be finishing in the background. Please try again in a moment.');
              break;
            }
            await sleep(pollDelay);
            pollDelay = Math.min(pollDelay + 1000, 6000);
            continue;
          }

          if (data.status === 'failed') {
            const where = data.stage === 'digest'
              ? 'while reading part of the session'
              : 'while drawing the parts together';
            upsert(`I couldn't complete this review ${where}, so I did not produce a partial one. Your session is safe — please try again.`);
            break;
          }

          if (data.success) {
            upsert(data.response);
            break;
          }

          upsert(
            data.phase === 'generation'
              ? `I couldn't generate that just now — the language model was briefly unavailable. Your session is safe; please try again in a moment.${data.error ? ` (${data.error})` : ''}`
              : `I wasn't able to load the session data.${data.error ? ` (${data.error})` : ' Please try again.'}`
          );
          break;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, questionCount, reviewedSessionId, activeLens, transcriptQuality]
  );

  // ---------------------------------------------------------------------------
  // Raw transcript (GET) — the actual session text, not a model synthesis.
  // ---------------------------------------------------------------------------

  const fetchTranscript = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `/api/scribe/review-session?sessionId=${encodeURIComponent(reviewedSessionId)}`
      );
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.displayText?.trim()
            ? data.displayText
            : `I couldn't load the transcript.${data.error ? ` (${data.error})` : ''}`,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('[SessionReview] transcript', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Connection error loading the transcript. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, reviewedSessionId]);

  // ---------------------------------------------------------------------------
  // Auto-overview on open — content-first. Fires once.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (hasContent && !hasAutoOverview.current) {
      hasAutoOverview.current = true;
      sendToMaia('Provide a layered overview of this session.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasContent]);

  const runDeliverable = useCallback(
    (d: (typeof DELIVERABLES)[number]) => {
      if (d.kind === 'transcript') fetchTranscript();
      else if (d.prompt) sendToMaia(d.prompt);
    },
    [fetchTranscript, sendToMaia]
  );

  const handleSend = useCallback(
    async (content?: string) => {
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
      await sendToMaia(messageContent);
    },
    [input, isLoading, sendToMaia]
  );

  const commitName = useCallback(() => {
    const trimmed = nameInput.trim();
    setClientName(trimmed === '' ? null : trimmed);
    setNameInput('');
    setNameEditing(false);
  }, [nameInput]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const currentPrompts = LENS_PROMPTS[activeLens];
  const [parentUpdateOpen, setParentUpdateOpen] = useState(false);

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '680px' }}>
      {/* Header + Lens tabs */}
      <div className="px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">Review with MAIA</span>

          {/* Optional client name — added after the content is seen */}
          <div className="ml-auto flex items-center gap-1">
            {nameEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitName();
                    if (e.key === 'Escape') { setNameEditing(false); setNameInput(''); }
                  }}
                  placeholder="Client name…"
                  className="w-36 bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
                <button onClick={commitName} className="p-1 text-teal-400 hover:text-teal-300" title="Save name">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : clientName ? (
              <button
                onClick={() => { setNameInput(clientName); setNameEditing(true); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                title="Edit client name"
              >
                with {clientName}
                <X
                  className="w-3 h-3 hover:text-rose-400"
                  onClick={e => { e.stopPropagation(); setClientName(null); }}
                />
              </button>
            ) : (
              hasContent && (
                <button
                  onClick={() => setNameEditing(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
                  title="Add client name (optional)"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add name
                </button>
              )
            )}
          </div>
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
          {hasContent && parentUpdateSupported && (
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

      {/* Primary deliverables — always available once there is content */}
      {hasContent && (
        <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2 overflow-x-auto">
          {DELIVERABLES.map(d => {
            const Icon = d.icon;
            return (
              <button
                key={d.label}
                onClick={() => runDeliverable(d)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 rounded-lg text-xs text-teal-200 whitespace-nowrap transition-colors disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5" />
                {d.label}
              </button>
            );
          })}
        </div>
      )}

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

      {/* Lens-specific deeper prompts */}
      {hasContent && (
        <div className="px-4 py-2 border-b border-slate-800/30 flex items-center gap-2 overflow-x-auto">
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
        </div>
      )}

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

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800/50">
        {!hasContent ? (
          <div className="text-center py-1">
            <p className="text-xs text-slate-600">Review unavailable — no transcript content.</p>
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

      {/* Parent Update Drawer — only mounted for supported session sources */}
      {parentUpdateSupported && (
        <ParentUpdateDrawer
          sessionId={reviewedSessionId}
          clientName={clientName}
          isOpen={parentUpdateOpen}
          onClose={() => setParentUpdateOpen(false)}
        />
      )}
    </div>
  );
}
