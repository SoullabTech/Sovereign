'use client';

/**
 * Contrast Experience Dashboard
 *
 * Observation tool for contrast moment telemetry.
 * Three views:
 * 1. Summary — eligible / shown / accepted / suppressed
 * 2. Events — filterable list with reviewer labels
 * 3. Review — events needing human classification
 */

import React, { useState, useEffect, useCallback } from 'react';

type PostResponseState = 'shift' | 'continue' | 'resist' | 'unclear';

interface ContrastEvent {
  id: string;
  created_at: string;
  session_id: string;
  turn_index: number;
  event_type: string;
  original_tradition: string | null;
  contrast_tradition: string | null;
  contrast_mode: string | null;
  gate_reason: string | null;
  next_user_message: string | null;
  primary_response: string | null;
  latency_ms: number | null;
  post_response_state_predicted: PostResponseState | null;
  post_response_state_reviewed: PostResponseState | null;
  review_notes: string | null;
  meta: Record<string, unknown>;
}

interface Summary {
  event_type: string;
  count: string;
}

interface ReviewProgress {
  reviewed: string;
  needs_review: string;
  classified: string;
  agreement: string;
}

interface StateDistribution {
  state: string;
  count: string;
}

const STATE_COLORS: Record<string, string> = {
  shift: 'bg-emerald-500/20 text-emerald-300',
  continue: 'bg-blue-500/20 text-blue-300',
  resist: 'bg-red-500/20 text-red-300',
  unclear: 'bg-stone-500/20 text-stone-400',
};

export default function ContrastDashboard() {
  const [events, setEvents] = useState<ContrastEvent[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [reviewProgress, setReviewProgress] = useState<ReviewProgress | null>(null);
  const [stateDistribution, setStateDistribution] = useState<StateDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [view, setView] = useState<'summary' | 'events' | 'review'>('summary');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewLabel, setReviewLabel] = useState<PostResponseState>('unclear');
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const needsReview = view === 'review' ? '&needs_review=true' : '';
      const res = await fetch(`/api/admin/contrast-events?days=${days}&limit=100${needsReview}`);
      const data = await res.json();
      setEvents(data.events || []);
      setSummary(data.summary || []);
      setReviewProgress(data.reviewProgress || null);
      setStateDistribution(data.stateDistribution || []);
    } catch (err) {
      console.error('Failed to load contrast data:', err);
    } finally {
      setLoading(false);
    }
  }, [days, view]);

  useEffect(() => { loadData(); }, [loadData]);

  const submitReview = async (eventId: string) => {
    try {
      await fetch('/api/admin/contrast-events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          reviewedState: reviewLabel,
          reviewNotes: reviewNotes || null,
        }),
      });
      setReviewingId(null);
      setReviewLabel('unclear');
      setReviewNotes('');
      loadData();
    } catch (err) {
      console.error('Review submit failed:', err);
    }
  };

  const getSummaryCount = (type: string) => {
    const row = summary.find(s => s.event_type === type);
    return row ? parseInt(row.count) : 0;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-light text-amber-200/80 mb-1">Contrast Experience</h1>
        <p className="text-stone-500 text-sm mb-6">Observation dashboard — not live gating</p>

        {/* Time range + view tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {[1, 7, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-sm rounded ${
                  days === d ? 'bg-amber-200/20 text-amber-200' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {(['summary', 'events', 'review'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm rounded capitalize ${
                  view === v ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-stone-500">Loading...</p>}

        {/* SUMMARY VIEW */}
        {!loading && view === 'summary' && (
          <div className="space-y-6">
            {/* Funnel */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Gate Passed', type: 'gate_passed', color: 'text-emerald-300' },
                { label: 'Shown', type: 'shown', color: 'text-blue-300' },
                { label: 'Accepted', type: 'accepted', color: 'text-amber-300' },
                { label: 'Engaged After', type: 'engaged_after_contrast', color: 'text-purple-300' },
              ].map(({ label, type, color }) => (
                <div key={type} className="bg-stone-900 rounded-lg p-4">
                  <p className="text-stone-500 text-xs mb-1">{label}</p>
                  <p className={`text-2xl font-light ${color}`}>{getSummaryCount(type)}</p>
                </div>
              ))}
            </div>

            {/* Suppression reasons */}
            <div className="bg-stone-900 rounded-lg p-4">
              <p className="text-stone-500 text-xs mb-3">Gate Rejected: {getSummaryCount('gate_rejected')}</p>
              <div className="grid grid-cols-2 gap-2">
                {summary
                  .filter(s => s.event_type === 'gate_rejected')
                  .map(s => (
                    <div key={s.event_type} className="text-stone-400 text-sm">
                      {s.count} rejected
                    </div>
                  ))}
              </div>
            </div>

            {/* Review progress */}
            {reviewProgress && (
              <div className="bg-stone-900 rounded-lg p-4">
                <p className="text-stone-500 text-xs mb-3">Review Progress</p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-stone-500">Reviewed</p>
                    <p className="text-stone-200">{reviewProgress.reviewed}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Needs Review</p>
                    <p className="text-amber-300">{reviewProgress.needs_review}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Classified</p>
                    <p className="text-stone-200">{reviewProgress.classified}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Agreement</p>
                    <p className="text-emerald-300">{reviewProgress.agreement}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Post-response state distribution */}
            {stateDistribution.length > 0 && (
              <div className="bg-stone-900 rounded-lg p-4">
                <p className="text-stone-500 text-xs mb-3">Post-Response States (reviewed)</p>
                <div className="flex gap-3">
                  {stateDistribution.map(s => (
                    <span key={s.state} className={`px-3 py-1 rounded text-sm ${STATE_COLORS[s.state] || ''}`}>
                      {s.state}: {s.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EVENTS VIEW */}
        {!loading && view === 'events' && (
          <div className="space-y-2">
            {events.length === 0 && (
              <p className="text-stone-500 text-sm">No contrast events in the last {days} day(s).</p>
            )}
            {events.map(e => (
              <div key={e.id} className="bg-stone-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    e.event_type === 'accepted' ? 'bg-amber-500/20 text-amber-300' :
                    e.event_type === 'gate_passed' ? 'bg-emerald-500/20 text-emerald-300' :
                    e.event_type === 'gate_rejected' ? 'bg-red-500/20 text-red-300' :
                    'bg-stone-700 text-stone-400'
                  }`}>
                    {e.event_type}
                  </span>
                  <span className="text-stone-500 text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                  {e.original_tradition && (
                    <span className="text-stone-600 text-xs">{e.original_tradition}</span>
                  )}
                  {e.contrast_tradition && (
                    <span className="text-stone-500 text-xs">&rarr; {e.contrast_tradition}</span>
                  )}
                  {e.gate_reason && e.gate_reason !== 'ok' && (
                    <span className="text-stone-600 text-xs ml-auto">{e.gate_reason}</span>
                  )}
                </div>
                {e.post_response_state_reviewed && (
                  <span className={`px-2 py-0.5 rounded text-xs ${STATE_COLORS[e.post_response_state_reviewed]}`}>
                    {e.post_response_state_reviewed}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REVIEW VIEW */}
        {!loading && view === 'review' && (
          <div className="space-y-4">
            {events.length === 0 && (
              <p className="text-stone-500 text-sm">No events need review.</p>
            )}
            {events.map(e => (
              <div key={e.id} className="bg-stone-900 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-stone-500 text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                  <span className="text-stone-600 text-xs">Turn {e.turn_index}</span>
                  {e.latency_ms && (
                    <span className="text-stone-600 text-xs">{e.latency_ms}ms latency</span>
                  )}
                </div>

                {e.primary_response && (
                  <div className="mb-3">
                    <p className="text-stone-600 text-xs mb-1">MAIA response:</p>
                    <p className="text-stone-400 text-sm leading-relaxed">{e.primary_response.slice(0, 300)}...</p>
                  </div>
                )}

                {e.next_user_message && (
                  <div className="mb-3">
                    <p className="text-stone-600 text-xs mb-1">User replied:</p>
                    <p className="text-stone-300 text-sm leading-relaxed">{e.next_user_message}</p>
                  </div>
                )}

                {e.post_response_state_predicted && (
                  <div className="mb-3">
                    <p className="text-stone-600 text-xs mb-1">Predicted:</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${STATE_COLORS[e.post_response_state_predicted]}`}>
                      {e.post_response_state_predicted}
                    </span>
                  </div>
                )}

                {reviewingId === e.id ? (
                  <div className="space-y-2 mt-3 border-t border-stone-800 pt-3">
                    <div className="flex gap-2">
                      {(['shift', 'continue', 'resist', 'unclear'] as const).map(state => (
                        <button
                          key={state}
                          onClick={() => setReviewLabel(state)}
                          className={`px-3 py-1 rounded text-sm ${
                            reviewLabel === state
                              ? STATE_COLORS[state]
                              : 'text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={reviewNotes}
                      onChange={ev => setReviewNotes(ev.target.value)}
                      className="w-full bg-stone-800 text-stone-300 text-sm px-3 py-2 rounded border border-stone-700"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReview(e.id)}
                        className="px-4 py-1 bg-amber-200/20 text-amber-200 text-sm rounded hover:bg-amber-200/30"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setReviewingId(null); setReviewNotes(''); }}
                        className="px-4 py-1 text-stone-500 text-sm hover:text-stone-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewingId(e.id)}
                    className="text-amber-200/60 text-sm hover:text-amber-200 mt-2"
                  >
                    Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
