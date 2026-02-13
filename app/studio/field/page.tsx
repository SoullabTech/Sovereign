'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wind, Scale, BookOpen, Calendar, CheckSquare, Mic,
  ArrowRight, Sparkles, ChevronRight, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { NameActionModal } from '@/components/studio/NameActionModal';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PulseQuestion {
  id: string;
  source: 'change' | 'decision' | 'threshold';
  sourceId: string;
  sourceTitle: string;
  text: string;
  urgency?: string;
  status: string;
  createdAt: string;
}

interface EdgeItem {
  id: string;
  type: 'change' | 'decision';
  title: string;
  description: string;
  reason: string;
  urgency?: string;
  status: string;
  createdAt: string;
}

interface FieldPulse {
  stillAlive: {
    questions: PulseQuestion[];
  };
  nextEdge: {
    item: EdgeItem | null;
    alternatives: EdgeItem[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Source badge styles
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  change:    { label: 'Change',    cls: 'bg-amber-500/10 text-amber-400/80 border-amber-500/20' },
  decision:  { label: 'Decision',  cls: 'bg-blue-500/10 text-blue-400/80 border-blue-500/20' },
  threshold: { label: 'Threshold', cls: 'bg-purple-500/10 text-purple-400/80 border-purple-500/20' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FieldPage() {
  const [pulse, setPulse] = useState<FieldPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<EdgeItem | null>(null);
  const [serviceCreatedName, setServiceCreatedName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPulse = useCallback(async (isRefresh = false) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isRefresh) setRefreshing(true);

    try {
      const res = await apiFetch('/api/studio/field/pulse', {
        signal: controller.signal,
      });
      if (res.ok && !controller.signal.aborted) {
        const data = await res.json();
        setPulse(data);
      }
    } catch (err) {
      // Ignore aborts; silently fail others (orientation, not critical)
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPulse();
    return () => { abortRef.current?.abort(); };
  }, [fetchPulse]);

  function handleNameAction(item: EdgeItem) {
    setSelectedEdge(item);
    setNameModalOpen(true);
  }

  function handleServiceCreated() {
    const createdName = selectedEdge?.title || 'Service';
    setNameModalOpen(false);
    setSelectedEdge(null);
    setServiceCreatedName(createdName);
    // Auto-dismiss toast after 4s
    setTimeout(() => setServiceCreatedName(null), 4000);
    // Refresh pulse — the edge may no longer qualify
    fetchPulse(true);
  }

  const greeting = getGreeting();
  const hasQuestions = (pulse?.stillAlive.questions.length ?? 0) > 0;
  const hasEdge = pulse?.nextEdge.item !== null;
  const hasContent = hasQuestions || hasEdge;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Greeting + Refresh */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm tracking-wider uppercase mb-2">{greeting.label}</p>
              <h1 className="text-3xl font-light text-white mb-2">Field</h1>
              <p className="text-slate-400">
                {hasContent ? 'What is alive right now.' : 'Your personal orientation space. What wants attention?'}
              </p>
            </div>
            {!loading && (
              <button
                onClick={() => fetchPulse(true)}
                disabled={refreshing}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition disabled:opacity-50"
                title="Refresh pulse"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Service created toast */}
        {serviceCreatedName && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
            <span className="text-emerald-400">Service created</span>
            <span className="text-slate-500">&middot;</span>
            <span className="text-white/80 truncate">{serviceCreatedName}</span>
            <Link
              href="/studio/services"
              className="ml-auto text-emerald-400/80 hover:text-emerald-300 text-xs whitespace-nowrap transition"
            >
              View Services
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Still Alive ──────────────────────────────────────── */}
            {hasQuestions && (
              <section className="mb-12">
                <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Still Alive
                </h2>
                <div className="space-y-2">
                  {pulse!.stillAlive.questions.slice(0, 5).map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </div>
                {pulse!.stillAlive.questions.length > 5 && (
                  <p className="text-xs text-slate-600 mt-3 pl-1">
                    +{pulse!.stillAlive.questions.length - 5} more questions alive
                  </p>
                )}
              </section>
            )}

            {/* ── Next Edge ────────────────────────────────────────── */}
            {hasEdge && pulse?.nextEdge.item && (
              <section className="mb-12">
                <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                  Next Edge
                </h2>
                <NextEdgeCard
                  item={pulse.nextEdge.item}
                  onNameAction={handleNameAction}
                />
                {pulse.nextEdge.alternatives.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {pulse.nextEdge.alternatives.map((alt) => (
                      <Link
                        key={alt.id}
                        href={alt.type === 'change' ? `/studio/changes` : `/studio/decisions`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition text-sm"
                      >
                        <span className="text-slate-400 truncate flex-1">{alt.title}</span>
                        <span className="text-[10px] text-slate-600 uppercase">{alt.type}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Navigate ─────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-3">
                Navigate
              </h2>
              <div className="space-y-2">
                <FieldCard href="/studio/changes" icon={Wind} title="Changes" subtitle="Navigate what is shifting" accent="amber" />
                <FieldCard href="/studio/decisions" icon={Scale} title="Decisions" subtitle="Clarify what needs choosing" accent="blue" />
                <FieldCard href="/studio/scribe" icon={Mic} title="Scribe" subtitle="Speak what needs to be heard" accent="emerald" />
                <FieldCard href="/studio/vault" icon={BookOpen} title="Vault" subtitle="Private notes and reflections" accent="purple" />
                <FieldCard href="/studio/calendar" icon={Calendar} title="Calendar" subtitle="What is coming" accent="slate" />
                <FieldCard href="/studio/tasks" icon={CheckSquare} title="Tasks" subtitle="What needs doing" accent="slate" />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Name Action Modal */}
      {nameModalOpen && selectedEdge && (
        <NameActionModal
          isOpen={nameModalOpen}
          onClose={() => {
            setNameModalOpen(false);
            setSelectedEdge(null);
          }}
          edgeItem={selectedEdge}
          onSuccess={handleServiceCreated}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question Card
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCard({ question }: { question: PulseQuestion }) {
  const sourceStyles: Record<string, string> = {
    change: 'border-l-amber-500/40',
    decision: 'border-l-blue-500/40',
    threshold: 'border-l-purple-500/40',
  };

  const sourceHref =
    question.source === 'change' ? '/studio/changes'
    : question.source === 'decision' ? '/studio/decisions'
    : null;

  const badge = SOURCE_BADGE[question.source];

  return (
    <div
      className={`pl-4 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${sourceStyles[question.source] || ''}`}
    >
      <p className="text-white/90 text-sm leading-relaxed mb-1.5">{question.text}</p>
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <span className="text-slate-700">&middot;</span>
        {sourceHref ? (
          <Link href={sourceHref} className="hover:text-slate-300 transition truncate">
            {question.sourceTitle}
          </Link>
        ) : (
          <span className="truncate">{question.sourceTitle}</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Next Edge Card
// ─────────────────────────────────────────────────────────────────────────────

function NextEdgeCard({
  item,
  onNameAction,
}: {
  item: EdgeItem;
  onNameAction: (item: EdgeItem) => void;
}) {
  const typeHref = item.type === 'change' ? '/studio/changes' : '/studio/decisions';

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-500/[0.07] to-purple-500/[0.07] border border-blue-500/20 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link
            href={typeHref}
            className="text-white font-medium hover:text-blue-300 transition"
          >
            {item.title}
          </Link>
          {item.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <span className="text-[10px] text-blue-400/70 uppercase tracking-wider flex-shrink-0">
          {item.type}
        </span>
      </div>

      <p className="text-xs text-blue-300/60 italic mb-4">{item.reason}</p>

      <button
        onClick={() => onNameAction(item)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30 rounded-lg text-sm text-white/80 hover:text-white transition"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        Name this as a service
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Card (demoted, simplified)
// ─────────────────────────────────────────────────────────────────────────────

function FieldCard({
  href,
  icon: Icon,
  title,
  subtitle,
  accent = 'slate',
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent?: string;
}) {
  const accentColors: Record<string, string> = {
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    slate: 'text-slate-400',
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition group"
    >
      <Icon className={`w-4 h-4 ${accentColors[accent] ?? 'text-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-white/80 text-sm">{title}</div>
        <div className="text-slate-600 text-xs">{subtitle}</div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting(): { label: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { label: 'Still night' };
  if (hour < 12) return { label: 'Morning' };
  if (hour < 17) return { label: 'Afternoon' };
  if (hour < 21) return { label: 'Evening' };
  return { label: 'Night' };
}
