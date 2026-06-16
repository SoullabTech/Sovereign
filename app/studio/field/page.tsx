'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wind, Scale, BookOpen, Calendar, CheckSquare, Mic,
  ChevronRight, RefreshCw, Flame, Compass, Sprout, Heart,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { useTeamContext } from '@/hooks/useStudioData';

// ─────────────────────────────────────────────────────────────────────────────
// Types — the orientation floor (four questions over the person's own content)
// ─────────────────────────────────────────────────────────────────────────────

interface FloorItem {
  id: string;
  source: 'change' | 'decision';
  sourceId: string;
  title: string;
  context?: string;
  href: string;
  createdAt: string;
}

interface FieldFloor {
  alive: FloorItem[];
  asking: FloorItem[];
  emerging: FloorItem[];
  tending: FloorItem[];
}

type FloorKey = keyof FieldFloor;

interface FloorQuestion {
  key: FloorKey;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'amber' | 'blue' | 'emerald' | 'purple';
  empty: string;
}

// The fixed floor. These four questions are the stable frame — they remain
// present even when a bucket is empty (the recognizable point of return).
// The floor holds room; it never tells the person what matters most.
const FLOOR: FloorQuestion[] = [
  { key: 'alive',    question: 'What is alive?',                icon: Flame,   accent: 'amber',   empty: 'Quiet here.' },
  { key: 'asking',   question: 'What is asking for attention?', icon: Compass, accent: 'blue',    empty: 'Nothing you’ve marked.' },
  { key: 'emerging', question: 'What is emerging?',             icon: Sprout,  accent: 'emerald', empty: 'Nothing new taking shape.' },
  { key: 'tending',  question: 'What are you tending?',         icon: Heart,   accent: 'purple',  empty: 'Nothing in motion.' },
];

const ACCENT_TEXT: Record<string, string> = {
  amber: 'text-amber-400', blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
};
const ACCENT_BORDER: Record<string, string> = {
  amber: 'border-l-amber-500/40', blue: 'border-l-blue-500/40', emerald: 'border-l-emerald-500/40', purple: 'border-l-purple-500/40',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FieldPage() {
  const [floor, setFloor] = useState<FieldFloor | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { currentTeamId, includePersonal } = useTeamContext();

  const fetchFloor = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (isRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (currentTeamId) params.set('teamId', currentTeamId);
      params.set('includePersonal', String(includePersonal));
      const res = await apiFetch(`/api/studio/field/pulse?${params.toString()}`, {
        signal: controller.signal,
      });
      if (res.ok && !controller.signal.aborted) {
        setFloor(await res.json());
      }
    } catch (err) {
      // Orientation is not critical — ignore aborts, fail quiet on the rest.
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [currentTeamId, includePersonal]);

  useEffect(() => {
    fetchFloor();
    return () => { abortRef.current?.abort(); };
  }, [fetchFloor]);

  const greeting = getGreeting();
  const total = floor
    ? floor.alive.length + floor.asking.length + floor.emerging.length + floor.tending.length
    : 0;
  const allQuiet = !loading && total === 0;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm tracking-wider uppercase mb-2">{greeting.label}</p>
              <h1 className="text-3xl font-light text-white mb-2">Field</h1>
              <p className="text-slate-400">
                {allQuiet ? 'Room for whatever’s here.' : 'What is alive right now.'}
              </p>
            </div>
            {!loading && (
              <button
                onClick={() => fetchFloor(true)}
                disabled={refreshing}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* The fixed orientation floor — four questions, always present */}
            {FLOOR.map((q) => (
              <FloorSection key={q.key} question={q} items={floor?.[q.key] ?? []} />
            ))}

            {/* Navigate — demoted, person-initiated; never injected into the field */}
            <section className="mt-2">
              <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Navigate</h2>
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Floor section — one question + its items, or quiet room
// ─────────────────────────────────────────────────────────────────────────────

function FloorSection({ question, items }: { question: FloorQuestion; items: FloorItem[] }) {
  const Icon = question.icon;
  const isEmpty = items.length === 0;
  return (
    <section className="mb-10">
      <h2 className={`text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${isEmpty ? 'text-slate-600' : 'text-slate-500'}`}>
        <Icon className={`w-4 h-4 ${isEmpty ? 'text-slate-600' : ACCENT_TEXT[question.accent]}`} />
        {question.question}
      </h2>
      {isEmpty ? (
        <p className="text-sm text-slate-600 pl-1">{question.empty}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <FloorItemCard key={item.id} item={item} accent={question.accent} />
          ))}
          {items.length > 6 && (
            <p className="text-xs text-slate-600 mt-2 pl-1">+{items.length - 6} more</p>
          )}
        </div>
      )}
    </section>
  );
}

function FloorItemCard({ item, accent }: { item: FloorItem; accent: string }) {
  return (
    <Link
      href={item.href}
      className={`block pl-4 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${ACCENT_BORDER[accent] ?? ''} hover:bg-white/5 transition`}
    >
      <p className="text-white/90 text-sm leading-relaxed">{item.title}</p>
      {item.context && (
        <p className="text-[11px] text-slate-500 mt-1 truncate">{item.context}</p>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation card (demoted)
// ─────────────────────────────────────────────────────────────────────────────

function FieldCard({
  href, icon: Icon, title, subtitle, accent = 'slate',
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent?: string;
}) {
  const accentColors: Record<string, string> = {
    amber: 'text-amber-400', blue: 'text-blue-400', emerald: 'text-emerald-400',
    purple: 'text-purple-400', slate: 'text-slate-400',
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
