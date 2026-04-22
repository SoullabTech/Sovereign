'use client';

/**
 * Decisions — detail view (MAIA-native, minimal)
 *
 * A place where a single decision can deepen. Not a full workspace yet —
 * just a surface for: header, context, council synthesis (if consulted),
 * linked child decisions, and the member's own notes.
 *
 * Edit / council / mentor actions route through the existing DecisionsSheet,
 * which is still the canonical workspace for that depth.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface DecisionDetail {
  id: string;
  title: string;
  context: string | null;
  stakes: string | null;
  status: string;
  situationType: string | null;
  councilResult: {
    synthesis?: string;
    recommendation?: string;
    tensions?: string[];
    insights?: string;
  } | null;
  consultantNotes: string | null;
  questionsForLeader: string[];
  iterationCount: number;
  consultedAt: string | null;
  createdAt: string;
  updatedAt: string;
  parentDecisionId: string | null;
  rootDecisionId: string | null;
  childDecisions?: Array<{ id: string; title: string; status: string }>;
  followUpIntention: string | null;
}

export default function DecisionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [decision, setDecision] = useState<DecisionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiFetch(`/api/studio/decisions/${id}`);
      if (!res.ok) {
        setError(res.status === 404 ? 'Decision not found.' : 'Could not load this decision.');
        return;
      }
      const data = await res.json();
      setDecision(data.decision as DecisionDetail);
    } catch (err) {
      console.error('[decisions/detail] load failed:', err);
      setError('Could not load this decision.');
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
          onClick={() => router.push('/maia/decisions')}
          className="text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-2 text-sm"
          aria-label="Back to decisions"
        >
          <ArrowLeft size={16} />
          <span>Decisions</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-5 h-5 border border-teal-500/30 border-t-teal-400/70 rounded-full animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-400">{error}</p>
          </div>
        ) : decision ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-[11px] text-stone-500 uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-teal-400/70" />
                <span>{decision.status}</span>
                {decision.situationType && (
                  <>
                    <span className="text-stone-700">&middot;</span>
                    <span>{decision.situationType}</span>
                  </>
                )}
                <span className="text-stone-700">&middot;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(decision.updatedAt || decision.createdAt)}
                </span>
              </div>
              <h1
                className="text-3xl text-teal-100/95 font-light leading-tight"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {decision.title}
              </h1>
            </div>

            {/* Context */}
            {decision.context && (
              <Section label="Context">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {decision.context}
                </p>
              </Section>
            )}

            {/* Stakes */}
            {decision.stakes && (
              <Section label="Stakes">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {decision.stakes}
                </p>
              </Section>
            )}

            {/* Council synthesis */}
            {decision.consultedAt && decision.councilResult && (
              <Section label="Council synthesis" accent>
                <div className="flex items-center gap-2 text-[11px] text-amber-400/60 mb-3">
                  <Sparkles className="w-3 h-3" />
                  <span>Consulted {formatTimeAgo(decision.consultedAt)}</span>
                </div>
                {decision.councilResult.recommendation && (
                  <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap mb-4">
                    {decision.councilResult.recommendation}
                  </p>
                )}
                {decision.councilResult.insights && (
                  <p className="text-xs text-stone-400 leading-relaxed whitespace-pre-wrap">
                    {decision.councilResult.insights}
                  </p>
                )}
              </Section>
            )}

            {/* Notes */}
            {decision.consultantNotes && (
              <Section label="Your notes">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {decision.consultantNotes}
                </p>
              </Section>
            )}

            {/* Follow-up intention */}
            {decision.followUpIntention && (
              <Section label="Follow-up intention">
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {decision.followUpIntention}
                </p>
              </Section>
            )}

            {/* Child decisions (chain) */}
            {decision.childDecisions && decision.childDecisions.length > 0 && (
              <Section label="Follow-on decisions">
                <ul className="space-y-1">
                  {decision.childDecisions.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => router.push(`/maia/decisions/${c.id}`)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-teal-500/30 transition-all text-left text-xs text-stone-300"
                      >
                        <span className="truncate">{c.title}</span>
                        <ChevronRight className="w-3 h-3 text-stone-500 flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Edit affordance */}
            <div className="mt-10 pt-6 border-t border-stone-800/50">
              <p className="text-xs text-stone-500 leading-relaxed">
                To edit this decision, consult the council, or add an iteration,
                open the Decisions Council from any MAIA conversation.
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
