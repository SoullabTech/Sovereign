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
  ScrollText,
  ArrowRight,
  AlertTriangle,
  UserPlus,
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
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

// Progressive disclosure: recognition → meaning → organization → evidence.
const OVERVIEW_PROMPT = 'Provide an overview of this session for fast recognition.';
const DELIVERABLES: Array<{
  label: string;
  icon: typeof FileText;
  prompt?: string;
  kind?: 'transcript';
}> = [
  { label: 'Overview', icon: FileText, prompt: OVERVIEW_PROMPT },
  { label: 'Elemental & Psychological', icon: Sparkles, prompt: 'Give an elemental and psychological reading of this session.' },
  { label: 'Organizational', icon: ListTree, prompt: 'Give the organizational practitioner view of this session — what to carry forward and follow up.' },
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
  // Recording provenance (audit 2026-07-19): true when the server reports the
  // transcript came from a single undiarized stream, so any participant
  // distinction in a review is inferred, not captured. Server-derived from the
  // transcript itself — dual-track diarization removes the notice naturally.
  const [singleSpeakerSource, setSingleSpeakerSource] = useState(false);
  // Reading mode: the card is height-capped for the room layout; expanded mode
  // lifts it to a full-viewport overlay so long reviews can be read in place.
  const [expanded, setExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const hasAutoOverview = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (nameEditing) nameInputRef.current?.focus();
  }, [nameEditing]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  // ---------------------------------------------------------------------------
  // Export — download / print. The provenance notices (speaker attribution,
  // transcript quality) MUST travel with any exported artifact: an export that
  // strips them would read as more certain than the review it came from.
  // ---------------------------------------------------------------------------

  const buildExportParts = useCallback(() => {
    const notices: string[] = [];
    if (singleSpeakerSource) {
      notices.push(
        'Speaker attribution: not available — this session was recorded as a single undiarized stream. Distinctions between participants in the review may be inferred from context, not captured.'
      );
    }
    if (transcriptQuality?.phantomRemoved) {
      notices.push('Transcript cleaned: repeated phrase removed from segments.');
    }
    if (transcriptQuality?.sampled) {
      notices.push(
        `Long session — using ${transcriptQuality.segmentsSampled} of ${transcriptQuality.segmentCount} segments (head + sampled middle + tail).`
      );
    }
    const meta = [
      `Duration: ${durationMin}m ${durationSec}s (${segmentCount} turns)`,
      clientName ? `Client: ${clientName}` : null,
      `Exported: ${new Date().toLocaleString()}`,
    ].filter(Boolean) as string[];
    // The transient status line (id '1') is UI chrome, not review content.
    const body = messages.filter(m => m.id !== '1');
    return { meta, notices, body };
  }, [messages, singleSpeakerSource, transcriptQuality, clientName, durationMin, durationSec, segmentCount]);

  const handleDownload = useCallback(() => {
    const { meta, notices, body } = buildExportParts();
    const md = [
      '# Session Review — MAIA',
      '',
      ...meta.map(l => `> ${l}`),
      ...(notices.length ? ['', ...notices.map(n => `> ⚠ ${n}`)] : []),
      '',
      ...body.map(m => (m.role === 'user' ? `## Question\n\n${m.content}` : m.content)),
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-review-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildExportParts]);

  const handlePrint = useCallback(() => {
    const { meta, notices, body } = buildExportParts();
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return; // popup blocked — nothing to clean up
    w.document.write(`<!doctype html><html><head><title>Session Review — MAIA</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a2e; max-width: 46rem; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.55; }
  h1 { font-size: 1.4rem; border-bottom: 1px solid #ccc; padding-bottom: .5rem; }
  .meta { color: #555; font-size: .85rem; }
  .notice { background: #fdf6e3; border-left: 3px solid #d4a017; padding: .5rem .75rem; font-size: .85rem; margin: .5rem 0; }
  .q { font-weight: bold; margin-top: 1.5rem; color: #0b6e63; }
  .a { white-space: pre-wrap; margin-top: .5rem; }
  @media print { body { margin: 0 auto; } }
</style></head><body>
<h1>Session Review — MAIA</h1>
${meta.map(l => `<div class="meta">${esc(l)}</div>`).join('')}
${notices.map(n => `<div class="notice">⚠ ${esc(n)}</div>`).join('')}
${body
  .map(m =>
    m.role === 'user' ? `<div class="q">Question: ${esc(m.content)}</div>` : `<div class="a">${esc(m.content)}</div>`
  )
  .join('')}
</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }, [buildExportParts]);

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

          if (data._meta?.singleSpeakerSource === true) setSingleSpeakerSource(true);

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
            const phase = data.progress?.phase ?? 'reading';
            const label =
              phase === 'reading'
                ? `Reading the session — ${done} of ${total} sections…`
                : phase === 'overview'
                  ? 'Building the overview…'
                  : phase === 'elemental'
                    ? 'Reading elemental and psychological patterns…'
                    : phase === 'organizational'
                      ? 'Organizing practitioner follow-through…'
                      : 'Working through your question…';
            upsert(label);
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
      sendToMaia(OVERVIEW_PROMPT);
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

  const hasReviewContent = messages.some(m => m.role === 'assistant' && m.id !== '1');

  return (
    <>
      {/* Backdrop for expanded reading mode */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}
    <div
      className={`bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden flex flex-col ${
        expanded ? 'fixed inset-2 md:inset-8 z-50' : ''
      }`}
      style={expanded ? undefined : { maxHeight: '680px' }}
    >
      {/* Header + Lens tabs */}
      <div className="px-4 py-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-white">Review with MAIA</span>

          {/* Read in full / download / print — the review is a deliverable the
              practitioner takes with them, not only a pane they scroll */}
          <div className="ml-auto flex items-center gap-0.5">
            {hasReviewContent && (
              <>
                <button
                  onClick={handleDownload}
                  className="p-1.5 text-slate-500 hover:text-teal-300 transition-colors"
                  title="Download review (Markdown)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-slate-500 hover:text-teal-300 transition-colors"
                  title="Print review (or save as PDF)"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-slate-500 hover:text-teal-300 transition-colors"
              title={expanded ? 'Exit full view (Esc)' : 'Read in full view'}
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Optional client name — added after the content is seen */}
          <div className="flex items-center gap-1">
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

      {/* Speaker-attribution evidence notice — provenance-gated (single
          undiarized stream). Inferred participant distinctions must never
          read as captured attribution (Kelly ruling, 2026-07-19). */}
      <AnimatePresence>
        {singleSpeakerSource && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-2 border-b border-slate-800/30"
          >
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <AlertTriangle className="w-3 h-3 text-amber-500/70 mt-0.5 flex-shrink-0" />
              <p>
                Speaker attribution: not available — this session was recorded as a single
                undiarized stream. Distinctions between participants in the review may be
                inferred from context, not captured.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
