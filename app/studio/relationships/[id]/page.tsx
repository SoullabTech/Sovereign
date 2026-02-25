'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  RelationshipRecord,
  CheckinRecord,
  ChildState,
  ParentNeed,
} from '@/lib/studio/relationships/types';
import {
  ROLE_LABELS,
  CHILD_STATE_LABELS,
  PARENT_NEED_LABELS,
} from '@/lib/studio/relationships/types';

// ─── Child State Options ────────────────────────────────────

const CHILD_STATES: { value: ChildState; label: string; color: string }[] = [
  { value: 'calm', label: 'Calm', color: 'text-emerald-300 border-emerald-700/50 bg-emerald-900/20' },
  { value: 'sensitive', label: 'Sensitive', color: 'text-blue-300 border-blue-700/50 bg-blue-900/20' },
  { value: 'anxious', label: 'Anxious', color: 'text-amber-300 border-amber-700/50 bg-amber-900/20' },
  { value: 'angry', label: 'Angry', color: 'text-red-300 border-red-700/50 bg-red-900/20' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'text-slate-300 border-slate-600/50 bg-slate-800/40' },
  { value: 'big_questions', label: 'Big Questions', color: 'text-purple-300 border-purple-700/50 bg-purple-900/20' },
  { value: 'social_pain', label: 'Social Pain', color: 'text-rose-300 border-rose-700/50 bg-rose-900/20' },
];

const PARENT_NEEDS: { value: ParentNeed; label: string }[] = [
  { value: 'what_to_say', label: 'What should I say?' },
  { value: 'how_serious', label: 'How serious is this?' },
  { value: 'regulate', label: 'How do I help regulate?' },
  { value: 'is_normal', label: 'Is this normal?' },
  { value: 'pattern', label: 'What pattern might be happening?' },
];

export default function RelationshipHubPage() {
  const params = useParams();
  const id = params?.id as string;

  const [relationship, setRelationship] = useState<RelationshipRecord | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCheckin, setExpandedCheckin] = useState<string | null>(null);

  // Check-in flow state
  const [showCheckin, setShowCheckin] = useState(false);
  const [step, setStep] = useState(1);
  const [whatHappened, setWhatHappened] = useState('');
  const [childState, setChildState] = useState<ChildState | null>(null);
  const [parentNeed, setParentNeed] = useState<ParentNeed | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [latestCheckin, setLatestCheckin] = useState<CheckinRecord | null>(null);

  // Mentor state
  const [requestingMentor, setRequestingMentor] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [relRes, checkinsRes] = await Promise.all([
        apiFetch(`/api/studio/relationships/${id}`),
        apiFetch(`/api/studio/relationships/${id}/checkins`),
      ]);

      if (relRes.ok) {
        const data = await relRes.json();
        setRelationship(data.relationship);
      }
      if (checkinsRes.ok) {
        const data = await checkinsRes.json();
        setCheckins(data.checkins || []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function resetCheckin() {
    setShowCheckin(false);
    setStep(1);
    setWhatHappened('');
    setChildState(null);
    setParentNeed(null);
    setLatestCheckin(null);
  }

  async function submitCheckin() {
    if (!whatHappened.trim()) return;
    setSubmitting(true);

    try {
      const res = await apiFetch(`/api/studio/relationships/${id}/checkin`, {
        method: 'POST',
        body: JSON.stringify({
          whatHappened: whatHappened.trim(),
          childState,
          parentNeed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLatestCheckin(data.checkin);
        setStep(4); // Show response
        // Refresh timeline
        const checkinsRes = await apiFetch(`/api/studio/relationships/${id}/checkins`);
        if (checkinsRes.ok) {
          const checkinsData = await checkinsRes.json();
          setCheckins(checkinsData.checkins || []);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Check-in failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function requestMentor(checkinId: string) {
    setRequestingMentor(checkinId);
    try {
      const res = await apiFetch(
        `/api/studio/relationships/${id}/checkin/${checkinId}/mentor`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        // Update the checkin in state
        setCheckins(prev =>
          prev.map(c =>
            c.id === checkinId
              ? { ...c, mentorReflection: data.mentorReflection }
              : c
          )
        );
        if (latestCheckin?.id === checkinId) {
          setLatestCheckin(prev =>
            prev ? { ...prev, mentorReflection: data.mentorReflection } : prev
          );
        }
      }
    } finally {
      setRequestingMentor(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-3xl mx-auto text-center py-16">
          <p className="text-slate-400">Relationship not found.</p>
          <Link href="/studio/relationships" className="text-amber-400 text-sm mt-2 inline-block">
            Back to Relationships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/studio/relationships" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-light text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                {relationship.personName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {ROLE_LABELS[relationship.role]}
                {relationship.ageYears ? ` \u00B7 ${relationship.ageYears} years old` : ''}
              </p>
            </div>
          </div>
          <Link
            href={`/studio/relationships/${id}`}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Primary Action */}
        {!showCheckin && (
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowCheckin(true)}
            className="w-full p-5 rounded-xl border-2 border-dashed border-amber-700/40 bg-amber-950/10 hover:border-amber-600/60 hover:bg-amber-950/20 transition-colors text-center group mb-8"
          >
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-amber-200 font-medium text-sm">
              Something happened &mdash; help me respond
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Quick check-in with MAIA guidance
            </p>
          </motion.button>
        )}

        {/* Check-in Flow */}
        <AnimatePresence>
          {showCheckin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
            >
              <div className="p-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2, 3].map(s => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        s <= step ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: What happened */}
                {step === 1 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      What happened?
                    </label>
                    <textarea
                      value={whatHappened}
                      onChange={e => setWhatHappened(e.target.value)}
                      placeholder="Describe what's going on..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={resetCheckin}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!whatHappened.trim()}
                        className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Child state */}
                {step === 2 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-3">
                      {relationship.role === 'child' ? 'Child' : relationship.personName} is:
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CHILD_STATES.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setChildState(s.value)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            childState === s.value
                              ? s.color
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-300">
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                      >
                        {childState ? 'Next' : 'Skip'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: What do you need */}
                {step === 3 && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-3">
                      What do you need?
                    </label>
                    <div className="space-y-2">
                      {PARENT_NEEDS.map(n => (
                        <button
                          key={n.value}
                          onClick={() => setParentNeed(n.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border transition-colors ${
                            parentNeed === n.value
                              ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                              : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button onClick={() => setStep(2)} className="text-xs text-slate-500 hover:text-slate-300">
                        Back
                      </button>
                      <button
                        onClick={submitCheckin}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Asking MAIA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {parentNeed ? 'Get Guidance' : 'Submit'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: MAIA Response */}
                {step === 4 && latestCheckin?.maiaResponse && (
                  <div>
                    <h3 className="text-sm font-medium text-amber-200 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      MAIA Response
                    </h3>

                    <div className="space-y-4">
                      <ResponseBlock
                        label="What this is"
                        content={latestCheckin.maiaResponse.framing}
                      />
                      <ResponseBlock
                        label="What to say"
                        content={latestCheckin.maiaResponse.script}
                        highlight
                      />
                      <ResponseBlock
                        label="What to do"
                        content={latestCheckin.maiaResponse.action}
                      />
                      <ResponseBlock
                        label="When to worry"
                        content={latestCheckin.maiaResponse.threshold}
                      />
                    </div>

                    {/* Mentor button */}
                    {!latestCheckin.mentorReflection ? (
                      <button
                        onClick={() => requestMentor(latestCheckin.id)}
                        disabled={requestingMentor === latestCheckin.id}
                        className="mt-5 flex items-center gap-2 px-4 py-2 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-amber-700/50 hover:text-amber-200 disabled:opacity-50 transition-colors"
                      >
                        {requestingMentor === latestCheckin.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Reflecting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Ask MAIA Mentor
                          </>
                        )}
                      </button>
                    ) : (
                      <MentorReflectionCard reflection={latestCheckin.mentorReflection} />
                    )}

                    <div className="flex justify-between mt-5 pt-4 border-t border-slate-800">
                      <button
                        onClick={resetCheckin}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          resetCheckin();
                          setShowCheckin(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        Another check-in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        {checkins.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Timeline
            </h2>
            <div className="space-y-3">
              {checkins.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => setExpandedCheckin(expandedCheckin === c.id ? null : c.id)}
                    className="w-full text-left p-4 rounded-lg border border-slate-800/60 bg-slate-900/30 hover:border-slate-700/60 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white line-clamp-2">{c.whatHappened}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          {c.childState && (
                            <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/50">
                              {CHILD_STATE_LABELS[c.childState]}
                            </span>
                          )}
                          {c.mentorReflection && (
                            <span className="text-xs text-purple-400">
                              <Sparkles className="w-3 h-3 inline" /> Mentor
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 text-slate-600">
                        {expandedCheckin === c.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded view */}
                    <AnimatePresence>
                      {expandedCheckin === c.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-3 border-t border-slate-800"
                          onClick={e => e.stopPropagation()}
                        >
                          {c.parentNeed && (
                            <p className="text-xs text-slate-500 mb-3">
                              Need: {PARENT_NEED_LABELS[c.parentNeed]}
                            </p>
                          )}

                          {c.maiaResponse && (
                            <div className="space-y-3">
                              <ResponseBlock label="What this is" content={c.maiaResponse.framing} />
                              <ResponseBlock label="What to say" content={c.maiaResponse.script} highlight />
                              <ResponseBlock label="What to do" content={c.maiaResponse.action} />
                              <ResponseBlock label="When to worry" content={c.maiaResponse.threshold} />
                            </div>
                          )}

                          {/* Mentor section */}
                          {c.mentorReflection ? (
                            <MentorReflectionCard reflection={c.mentorReflection} />
                          ) : c.maiaResponse ? (
                            <button
                              onClick={() => requestMentor(c.id)}
                              disabled={requestingMentor === c.id}
                              className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs border border-slate-700 text-slate-400 rounded-lg hover:border-amber-700/50 hover:text-amber-200 disabled:opacity-50 transition-colors"
                            >
                              {requestingMentor === c.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Reflecting...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  Ask MAIA Mentor
                                </>
                              )}
                            </button>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for timeline */}
        {!loading && checkins.length === 0 && !showCheckin && (
          <div className="text-center py-8 text-slate-600 text-sm">
            No check-ins yet. Use the button above when something comes up.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function ResponseBlock({
  label,
  content,
  highlight,
}: {
  label: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-amber-950/20 border border-amber-800/30' : 'bg-slate-800/30'}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-sm ${highlight ? 'text-amber-100' : 'text-slate-300'}`}>{content}</p>
    </div>
  );
}

function MentorReflectionCard({ reflection }: { reflection: CheckinRecord['mentorReflection'] }) {
  if (!reflection) return null;
  return (
    <div className="mt-4 rounded-lg border border-purple-800/30 bg-purple-950/10 p-4">
      <h4 className="text-xs font-medium text-purple-300 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        MAIA Mentor
      </h4>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Questions for you</p>
          <ul className="space-y-1">
            {reflection.questions.map((q, i) => (
              <li key={i} className="text-xs text-slate-300">
                {i + 1}. {q}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Sovereignty check</p>
          <p className="text-xs text-slate-300">{reflection.sovereigntyCheck}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Try this week</p>
          <p className="text-xs text-amber-200/80">{reflection.nextExperiment}</p>
        </div>
      </div>
    </div>
  );
}
