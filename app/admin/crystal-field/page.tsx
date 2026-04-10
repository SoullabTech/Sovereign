'use client';

/**
 * Crystal Field Weekly Review
 *
 * Structured observation loop for MAIA system tuning.
 * Two views:
 * 1. New Review — fill out the weekly template
 * 2. Past Reviews — browse saved reviews
 */

import React, { useState, useEffect, useCallback } from 'react';

// --- Types ---

interface MomentLanded {
  element: string;
  state: string;
  closing_type: string;
  what_happened: string;
  why_it_worked: string;
}

interface MomentOff {
  element: string;
  state: string;
  closing_type: string;
  what_happened: string;
  where_it_missed: string;
}

interface SystemSignals {
  closing_type_notes: string;
  depth_mode_notes: string;
  doorway_notes: string;
}

interface Review {
  id: string;
  reviewer: string;
  review_date: string;
  sample_size: string | null;
  source: string | null;
  moments_landed: MomentLanded[];
  moments_off: MomentOff[];
  pattern_emerging: string | null;
  candidate_rule: string | null;
  system_signals: SystemSignals;
  decision: string;
  decision_notes: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

// --- Constants ---

const ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;
const CLOSING_TYPES = ['question', 'none', 'doorway'] as const;
const MISS_TYPES = ['interrupting', 'overreaching', 'under-inviting', 'misaligned movement'] as const;
const DECISIONS = ['hold', 'refine', 'investigate'] as const;

const DECISION_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  hold: { label: 'HOLD', desc: 'Keep observing', color: 'bg-stone-700 text-stone-300' },
  refine: { label: 'REFINE', desc: 'Small prompt-level adjustment', color: 'bg-amber-500/20 text-amber-300' },
  investigate: { label: 'INVESTIGATE', desc: 'Need more examples', color: 'bg-blue-500/20 text-blue-300' },
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-red-500/20 text-red-300',
  water: 'bg-blue-500/20 text-blue-300',
  earth: 'bg-emerald-500/20 text-emerald-300',
  air: 'bg-sky-500/20 text-sky-300',
  aether: 'bg-purple-500/20 text-purple-300',
};

// --- Helpers ---

function emptyMomentLanded(): MomentLanded {
  return { element: 'fire', state: '', closing_type: 'question', what_happened: '', why_it_worked: '' };
}

function emptyMomentOff(): MomentOff {
  return { element: 'fire', state: '', closing_type: 'question', what_happened: '', where_it_missed: 'interrupting' };
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// --- Component ---

export default function CrystalFieldReview() {
  const [view, setView] = useState<'new' | 'past'>('new');
  const [pastReviews, setPastReviews] = useState<Review[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Form state
  const [reviewer, setReviewer] = useState('');
  const [reviewDate, setReviewDate] = useState(todayISO);
  const [sampleSize, setSampleSize] = useState('');
  const [source, setSource] = useState('');
  const [momentsLanded, setMomentsLanded] = useState<MomentLanded[]>([emptyMomentLanded()]);
  const [momentsOff, setMomentsOff] = useState<MomentOff[]>([emptyMomentOff()]);
  const [patternEmerging, setPatternEmerging] = useState('');
  const [candidateRule, setCandidateRule] = useState('');
  const [systemSignals, setSystemSignals] = useState<SystemSignals>({
    closing_type_notes: '',
    depth_mode_notes: '',
    doorway_notes: '',
  });
  const [decision, setDecision] = useState<string>('hold');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [notes, setNotes] = useState('');

  // Load past reviews
  const loadPast = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/crystal-field?limit=20');
      const data = await res.json();
      setPastReviews(data.reviews || []);
    } catch {
      console.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'past') loadPast();
  }, [view, loadPast]);

  // Submit new review
  const submit = async () => {
    if (!reviewer.trim() || !reviewDate) {
      setMessage({ text: 'Reviewer and date are required.', type: 'err' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/crystal-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: reviewer.trim(),
          review_date: reviewDate,
          sample_size: sampleSize || null,
          source: source || null,
          moments_landed: momentsLanded.filter(m => m.what_happened.trim()),
          moments_off: momentsOff.filter(m => m.what_happened.trim()),
          pattern_emerging: patternEmerging || null,
          candidate_rule: candidateRule || null,
          system_signals: systemSignals,
          decision,
          decision_notes: decisionNotes || null,
          notes: notes || null,
        }),
      });

      if (res.status === 409) {
        setMessage({ text: 'A review already exists for this date + reviewer.', type: 'err' });
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        setMessage({ text: err.details?.join(', ') || err.error || 'Failed', type: 'err' });
        return;
      }

      setMessage({ text: 'Review saved.', type: 'ok' });
      // Reset form
      setMomentsLanded([emptyMomentLanded()]);
      setMomentsOff([emptyMomentOff()]);
      setPatternEmerging('');
      setCandidateRule('');
      setSystemSignals({ closing_type_notes: '', depth_mode_notes: '', doorway_notes: '' });
      setDecision('hold');
      setDecisionNotes('');
      setNotes('');
    } catch {
      setMessage({ text: 'Network error.', type: 'err' });
    } finally {
      setSaving(false);
    }
  };

  // Archive a review
  const archiveReview = async (id: string) => {
    await fetch('/api/admin/crystal-field', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'archived' }),
    });
    loadPast();
  };

  // --- Moment Card Updaters ---

  const updateLanded = (index: number, field: keyof MomentLanded, value: string) => {
    setMomentsLanded(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const updateOff = (index: number, field: keyof MomentOff, value: string) => {
    setMomentsOff(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-light text-amber-200/80 mb-1">Crystal Field Review</h1>
        <p className="text-stone-500 text-sm mb-6">Weekly observation loop</p>

        {/* View tabs */}
        <div className="flex gap-2 mb-6">
          {(['new', 'past'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-sm rounded capitalize ${
                view === v ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {v === 'new' ? 'New Review' : 'Past Reviews'}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 px-4 py-2 rounded text-sm ${
            message.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* ==================== NEW REVIEW ==================== */}
        {view === 'new' && (
          <div className="space-y-6">

            {/* 1. Session Context */}
            <Section title="1. Session Context">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Reviewer" value={reviewer} onChange={setReviewer} placeholder="Name" />
                <Field label="Date" value={reviewDate} onChange={setReviewDate} type="date" />
                <Field label="Sample Size" value={sampleSize} onChange={setSampleSize} placeholder="e.g., 6 turns" />
                <Field label="Source" value={source} onChange={setSource} placeholder="e.g., live sessions, testers" />
              </div>
            </Section>

            {/* 2. Moments That Landed */}
            <Section title="2. Moments That Landed" subtitle="Where did the system feel like it truly saw the person?">
              {momentsLanded.map((m, i) => (
                <MomentCard key={i} index={i} kind="landed">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Select label="Element" value={m.element} options={ELEMENTS} onChange={v => updateLanded(i, 'element', v)} />
                    <Field label="State (your read)" value={m.state} onChange={v => updateLanded(i, 'state', v)} placeholder="e.g., integration" />
                    <Select label="Closing Type" value={m.closing_type} options={CLOSING_TYPES} onChange={v => updateLanded(i, 'closing_type', v)} />
                  </div>
                  <TextArea label="What happened" value={m.what_happened} onChange={v => updateLanded(i, 'what_happened', v)} rows={2} />
                  <TextArea label="Why it worked" value={m.why_it_worked} onChange={v => updateLanded(i, 'why_it_worked', v)} rows={2} />
                </MomentCard>
              ))}
              <AddButton label="Add moment" onClick={() => setMomentsLanded(prev => [...prev, emptyMomentLanded()])} />
            </Section>

            {/* 3. Moments Slightly Off */}
            <Section title="3. Moments Slightly Off" subtitle="Not wrong, but not precise.">
              {momentsOff.map((m, i) => (
                <MomentCard key={i} index={i} kind="off">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <Select label="Element" value={m.element} options={ELEMENTS} onChange={v => updateOff(i, 'element', v)} />
                    <Field label="State (your read)" value={m.state} onChange={v => updateOff(i, 'state', v)} placeholder="e.g., threshold" />
                    <Select label="Closing Type" value={m.closing_type} options={CLOSING_TYPES} onChange={v => updateOff(i, 'closing_type', v)} />
                  </div>
                  <TextArea label="What happened" value={m.what_happened} onChange={v => updateOff(i, 'what_happened', v)} rows={2} />
                  <Select label="Where it missed" value={m.where_it_missed} options={MISS_TYPES} onChange={v => updateOff(i, 'where_it_missed', v)} />
                </MomentCard>
              ))}
              <AddButton label="Add moment" onClick={() => setMomentsOff(prev => [...prev, emptyMomentOff()])} />
            </Section>

            {/* 4. Pattern Emerging */}
            <Section title="4. Pattern Emerging" subtitle="1-3 sentences only.">
              <TextArea
                value={patternEmerging}
                onChange={setPatternEmerging}
                rows={3}
                placeholder='e.g., "Aether + integration -> questions feel interrupting"'
              />
            </Section>

            {/* 5. Candidate Rule */}
            <Section title="5. Candidate Rule" subtitle="Do NOT implement unless clear.">
              <TextArea
                value={candidateRule}
                onChange={setCandidateRule}
                rows={2}
                placeholder='If [element + state], -> [movement / no movement]  ...or "insufficient signal"'
              />
            </Section>

            {/* 6. System Signal Check */}
            <Section title="6. System Signal Check" subtitle="Quick scan, no deep analysis.">
              <TextArea
                label="ClosingType distribution (rough feel)"
                value={systemSignals.closing_type_notes}
                onChange={v => setSystemSignals(s => ({ ...s, closing_type_notes: v }))}
                rows={2}
                placeholder="Too many questions? Too many none?"
              />
              <TextArea
                label="DepthMode"
                value={systemSignals.depth_mode_notes}
                onChange={v => setSystemSignals(s => ({ ...s, depth_mode_notes: v }))}
                rows={2}
                placeholder="Activating at the right moments?"
              />
              <TextArea
                label="Doorways"
                value={systemSignals.doorway_notes}
                onChange={v => setSystemSignals(s => ({ ...s, doorway_notes: v }))}
                rows={2}
                placeholder="Feeling like recognition or suggestion?"
              />
            </Section>

            {/* 7. One Decision Only */}
            <Section title="7. One Decision Only">
              <div className="flex gap-2 mb-3">
                {DECISIONS.map(d => {
                  const cfg = DECISION_LABELS[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setDecision(d)}
                      className={`px-4 py-2 rounded text-sm transition-colors ${
                        decision === d ? cfg.color : 'text-stone-500 hover:text-stone-300 bg-stone-800/50'
                      }`}
                    >
                      <span className="font-medium">{cfg.label}</span>
                      <span className="block text-xs opacity-70 mt-0.5">{cfg.desc}</span>
                    </button>
                  );
                })}
              </div>
              <TextArea
                value={decisionNotes}
                onChange={setDecisionNotes}
                rows={2}
                placeholder="Decision context (optional)"
              />
            </Section>

            {/* 8. Notes */}
            <Section title="8. Notes" subtitle="Anything intuitive, felt, or hard to categorize.">
              <TextArea value={notes} onChange={setNotes} rows={3} />
            </Section>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2 pb-8">
              <button
                onClick={submit}
                disabled={saving}
                className="px-6 py-2 bg-amber-200/20 text-amber-200 rounded hover:bg-amber-200/30 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Review'}
              </button>
              <p className="text-stone-600 text-xs">One insight per week is enough.</p>
            </div>
          </div>
        )}

        {/* ==================== PAST REVIEWS ==================== */}
        {view === 'past' && (
          <div className="space-y-3">
            {loading && <p className="text-stone-500 text-sm">Loading...</p>}
            {!loading && pastReviews.length === 0 && (
              <p className="text-stone-500 text-sm">No reviews yet.</p>
            )}
            {pastReviews.map(r => {
              const expanded = expandedId === r.id;
              const cfg = DECISION_LABELS[r.decision] || DECISION_LABELS.hold;
              return (
                <div key={r.id} className="bg-stone-900 rounded-lg overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-800/50 transition-colors"
                  >
                    <span className="text-stone-400 text-sm font-mono">{r.review_date}</span>
                    <span className="text-stone-500 text-sm">{r.reviewer}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ml-auto ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-stone-600 text-xs">{expanded ? '\u25B2' : '\u25BC'}</span>
                  </button>

                  {/* Expanded content */}
                  {expanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-stone-800">

                      {/* Context */}
                      {(r.sample_size || r.source) && (
                        <div className="flex gap-4 pt-3 text-xs text-stone-500">
                          {r.sample_size && <span>Sample: {r.sample_size}</span>}
                          {r.source && <span>Source: {r.source}</span>}
                        </div>
                      )}

                      {/* Moments landed */}
                      {r.moments_landed.length > 0 && (
                        <div>
                          <p className="text-stone-500 text-xs mb-2">Moments That Landed</p>
                          {r.moments_landed.map((m, i) => (
                            <div key={i} className="bg-stone-800/50 rounded p-3 mb-2 text-sm">
                              <div className="flex gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${ELEMENT_COLORS[m.element] || ''}`}>
                                  {m.element}
                                </span>
                                {m.state && <span className="text-stone-500 text-xs">{m.state}</span>}
                                <span className="text-stone-600 text-xs">{m.closing_type}</span>
                              </div>
                              <p className="text-stone-300">{m.what_happened}</p>
                              {m.why_it_worked && (
                                <p className="text-stone-500 text-xs mt-1">{m.why_it_worked}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Moments off */}
                      {r.moments_off.length > 0 && (
                        <div>
                          <p className="text-stone-500 text-xs mb-2">Moments Slightly Off</p>
                          {r.moments_off.map((m, i) => (
                            <div key={i} className="bg-stone-800/50 rounded p-3 mb-2 text-sm">
                              <div className="flex gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${ELEMENT_COLORS[m.element] || ''}`}>
                                  {m.element}
                                </span>
                                {m.state && <span className="text-stone-500 text-xs">{m.state}</span>}
                                <span className="text-stone-600 text-xs">{m.closing_type}</span>
                                <span className="text-red-400/60 text-xs ml-auto">{m.where_it_missed}</span>
                              </div>
                              <p className="text-stone-300">{m.what_happened}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pattern + Rule */}
                      {r.pattern_emerging && (
                        <div>
                          <p className="text-stone-500 text-xs mb-1">Pattern Emerging</p>
                          <p className="text-stone-300 text-sm">{r.pattern_emerging}</p>
                        </div>
                      )}
                      {r.candidate_rule && (
                        <div>
                          <p className="text-stone-500 text-xs mb-1">Candidate Rule</p>
                          <p className="text-stone-400 text-sm font-mono text-xs">{r.candidate_rule}</p>
                        </div>
                      )}

                      {/* System signals */}
                      {(r.system_signals.closing_type_notes || r.system_signals.depth_mode_notes || r.system_signals.doorway_notes) && (
                        <div>
                          <p className="text-stone-500 text-xs mb-2">System Signal Check</p>
                          <div className="space-y-1 text-sm">
                            {r.system_signals.closing_type_notes && (
                              <p className="text-stone-400"><span className="text-stone-600">ClosingType:</span> {r.system_signals.closing_type_notes}</p>
                            )}
                            {r.system_signals.depth_mode_notes && (
                              <p className="text-stone-400"><span className="text-stone-600">DepthMode:</span> {r.system_signals.depth_mode_notes}</p>
                            )}
                            {r.system_signals.doorway_notes && (
                              <p className="text-stone-400"><span className="text-stone-600">Doorways:</span> {r.system_signals.doorway_notes}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Decision notes */}
                      {r.decision_notes && (
                        <div>
                          <p className="text-stone-500 text-xs mb-1">Decision Notes</p>
                          <p className="text-stone-400 text-sm">{r.decision_notes}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {r.notes && (
                        <div>
                          <p className="text-stone-500 text-xs mb-1">Notes</p>
                          <p className="text-stone-400 text-sm">{r.notes}</p>
                        </div>
                      )}

                      {/* Archive */}
                      <button
                        onClick={() => archiveReview(r.id)}
                        className="text-stone-600 text-xs hover:text-stone-400 mt-2"
                      >
                        Archive this review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-900 rounded-lg p-4">
      <h2 className="text-amber-200/60 text-sm font-medium mb-1">{title}</h2>
      {subtitle && <p className="text-stone-600 text-xs mb-3">{subtitle}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      {label && <label className="text-stone-500 text-xs block mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-800 text-stone-300 text-sm px-3 py-2 rounded border border-stone-700 focus:border-stone-600 outline-none"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, rows = 2, placeholder,
}: {
  label?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      {label && <label className="text-stone-500 text-xs block mb-1">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-stone-800 text-stone-300 text-sm px-3 py-2 rounded border border-stone-700 focus:border-stone-600 outline-none resize-none"
      />
    </div>
  );
}

function Select({
  label, value, options, onChange,
}: {
  label?: string; value: string; options: readonly string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && <label className="text-stone-500 text-xs block mb-1">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-stone-800 text-stone-300 text-sm px-3 py-2 rounded border border-stone-700 focus:border-stone-600 outline-none"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MomentCard({ index, kind, children }: { index: number; kind: 'landed' | 'off'; children: React.ReactNode }) {
  return (
    <div className={`rounded p-3 ${kind === 'landed' ? 'bg-stone-800/40' : 'bg-stone-800/30 border border-stone-800'}`}>
      <p className="text-stone-600 text-xs mb-2">{kind === 'landed' ? 'Landed' : 'Off'} #{index + 1}</p>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-stone-600 text-xs hover:text-stone-400 transition-colors"
    >
      + {label}
    </button>
  );
}
