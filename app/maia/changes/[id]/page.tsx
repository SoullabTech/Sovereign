'use client';

/**
 * Changes — detail view (MAIA-native, minimal)
 *
 * A place where a single change can deepen. Shows: header, description,
 * hexagram (if cast), council interpretation, iterations, experiences logged,
 * and chain to child changes.
 *
 * Full iteration / casting / consultation flows remain in ChangesSheet.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, GitBranch, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Iteration {
  id: string;
  iterationNumber: number;
  sessionNotes: string | null;
  updatedDescription: string | null;
  hexagramNumber: number | null;
  consultedAt: string | null;
}

interface Experience {
  id: string;
  occurredAt: string;
  experienceType: string;
  content: string;
  element: string | null;
  tags: string[];
}

interface ChildChange {
  id: string;
  title: string;
  changeType: string;
  status: string;
  hexagramNumber: number | null;
}

interface ChangeDetail {
  id: string;
  title: string;
  description: string | null;
  changeType: string;
  emotionalState: string | null;
  urgency: string;
  hexagramNumber: number | null;
  hexagramName: string | null;
  relatingHexagramNumber: number | null;
  changingLines: number[];
  councilResult: Record<string, unknown> | null;
  hexagramInterpretation: string | null;
  notes: string | null;
  questions: string[];
  followUpIntention: string | null;
  status: string;
  iterationCount: number;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;
  parentChangeId: string | null;
  rootChangeId: string | null;
  iterations?: Iteration[];
  experiences?: Experience[];
  childChanges?: ChildChange[];
}

export default function ChangeDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [change, setChange] = useState<ChangeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiFetch(`/api/changes/${id}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Change not found.' : 'Could not load this change.');
        return;
      }
      const data = await res.json();
      // API shape: { change, iterations, childChanges, experiences }
      setChange({
        ...(data.change as ChangeDetail),
        iterations: data.iterations,
        childChanges: data.childChanges,
        experiences: data.experiences,
      });
    } catch (err) {
      console.error('[changes/detail] load failed:', err);
      setError('Could not load this change.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0b0f1c] text-white pl-14"
    >
      {/* Return threshold */}
      <div className="p-6">
        <button
          onClick={() => router.push('/maia/changes')}
          className="text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-2 text-sm"
          aria-label="Back to changes"
        >
          <ArrowLeft size={16} />
          <span>Changes</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-5 h-5 border border-emerald-500/30 border-t-emerald-400/70 rounded-full animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">{error}</p>
          </div>
        ) : change ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-[11px] text-stone-500 uppercase tracking-wider">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400/70" />
                <span>{change.status}</span>
                <span className="text-stone-700">&middot;</span>
                <span>{change.changeType}</span>
                <span className="text-stone-700">&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(change.updatedAt || change.createdAt)}
                </span>
              </div>
              <h1
                className="text-3xl text-emerald-100/95 font-light leading-tight"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {change.title}
              </h1>
            </div>

            {/* Description */}
            {change.description && (
              <Section label="What is shifting">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {change.description}
                </p>
              </Section>
            )}

            {/* Hexagram */}
            {change.hexagramNumber && (
              <Section label="Hexagram" accent>
                <div className="flex items-center gap-3 text-sm text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400/70" />
                  <span className="font-light" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    {change.hexagramNumber}
                    {change.hexagramName && <span className="ml-2 text-amber-200/80">&middot; {change.hexagramName}</span>}
                  </span>
                </div>
                {change.relatingHexagramNumber && (
                  <p className="text-xs text-stone-500 mt-2">
                    Changing into hexagram {change.relatingHexagramNumber}
                    {change.changingLines.length > 0 && ` (lines ${change.changingLines.join(', ')})`}
                  </p>
                )}
                {change.hexagramInterpretation && (
                  <p className="text-xs text-stone-400 leading-relaxed whitespace-pre-wrap mt-3">
                    {change.hexagramInterpretation}
                  </p>
                )}
              </Section>
            )}

            {/* Notes */}
            {change.notes && (
              <Section label="Your notes">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {change.notes}
                </p>
              </Section>
            )}

            {/* Questions */}
            {change.questions.length > 0 && (
              <Section label="Questions">
                <ul className="space-y-1">
                  {change.questions.map((q, i) => (
                    <li key={i} className="text-sm text-stone-300 leading-relaxed">
                      &middot; {q}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Experiences */}
            {change.experiences && change.experiences.length > 0 && (
              <Section label={`Experiences (${change.experiences.length})`}>
                <ul className="space-y-3">
                  {change.experiences.slice(0, 5).map((e) => (
                    <li key={e.id} className="pl-3 border-l border-stone-700/50">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                        <span>{e.experienceType}</span>
                        {e.element && (
                          <>
                            <span className="text-stone-700">&middot;</span>
                            <span>{e.element}</span>
                          </>
                        )}
                        <span className="text-stone-700">&middot;</span>
                        <span>{formatTimeAgo(e.occurredAt)}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">{e.content}</p>
                    </li>
                  ))}
                  {change.experiences.length > 5 && (
                    <li className="text-[11px] text-stone-500 pl-3">
                      and {change.experiences.length - 5} more...
                    </li>
                  )}
                </ul>
              </Section>
            )}

            {/* Iterations */}
            {change.iterations && change.iterations.length > 0 && (
              <Section label={`Iterations (${change.iterations.length})`}>
                <ul className="space-y-2">
                  {change.iterations.map((it) => (
                    <li key={it.id} className="p-3 rounded-lg bg-stone-900/40 border border-stone-800/50">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                        <span>Iteration {it.iterationNumber}</span>
                        {it.hexagramNumber && (
                          <>
                            <span className="text-stone-700">&middot;</span>
                            <span className="text-amber-400/60">Hex {it.hexagramNumber}</span>
                          </>
                        )}
                        {it.consultedAt && (
                          <>
                            <span className="text-stone-700">&middot;</span>
                            <span>{formatTimeAgo(it.consultedAt)}</span>
                          </>
                        )}
                      </div>
                      {it.sessionNotes && (
                        <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">
                          {it.sessionNotes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Child changes (chain) */}
            {change.childChanges && change.childChanges.length > 0 && (
              <Section label="Follow-on changes">
                <ul className="space-y-1">
                  {change.childChanges.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => router.push(`/maia/changes/${c.id}`)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-emerald-500/30 transition-all text-left text-xs text-stone-300"
                      >
                        <span className="truncate">{c.title}</span>
                        <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Follow-up intention */}
            {change.followUpIntention && (
              <Section label="Follow-up intention">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {change.followUpIntention}
                </p>
              </Section>
            )}

            {/* Edit affordance */}
            <div className="mt-10 pt-6 border-t border-stone-800/50">
              <p className="text-xs text-stone-500 leading-relaxed">
                To log an experience, cast a new reading, or add an iteration,
                open the Changes journey from any MAIA conversation.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}

function Section({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`mb-6 pb-6 ${accent ? 'border-l-2 border-amber-500/30 pl-4' : ''}`}>
      <h2 className={`text-[11px] uppercase tracking-wider mb-2 ${accent ? 'text-amber-400/70' : 'text-stone-500'}`}>
        {label}
      </h2>
      {children}
    </div>
  );
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
