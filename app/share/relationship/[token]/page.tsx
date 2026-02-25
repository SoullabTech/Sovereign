'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import type { ChildState } from '@/lib/studio/relationships/types';
import { CHILD_STATE_LABELS, ROLE_LABELS, type RelationshipRole } from '@/lib/studio/relationships/types';

interface SharedData {
  personName: string;
  role: RelationshipRole;
  ageYears: number | null;
  permissionLevel: string;
  weeklyCheckinCount?: number;
  recentStates?: string[];
  latestCheckin?: { date: string; childState: string | null } | null;
  recentFramings?: Array<{ date: string; framing: string }>;
  checkins?: Array<{
    id: string;
    whatHappened: string;
    childState: ChildState | null;
    parentNeed: string | null;
    maiaResponse: {
      framing: string;
      script: string;
      action: string;
      threshold: string;
    } | null;
    createdAt: string;
  }>;
}

export default function ShareViewPage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadShare();
  }, [token]);

  async function loadShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/share/relationship/${token}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        const err = await res.json();
        setError(err.error || 'Share not found');
      }
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-400">{error || 'Share not found'}</p>
          <p className="text-xs text-slate-600 mt-2">
            This link may have expired or been revoked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <Heart className="w-3 h-3" />
            Shared Relationship View
          </div>
          <h1 className="text-2xl font-light text-white">
            {data.personName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ROLE_LABELS[data.role]}
            {data.ageYears ? ` \u00B7 ${data.ageYears} years old` : ''}
          </p>
        </div>

        {/* Summary-only view */}
        {data.permissionLevel === 'summary_only' && (
          <div className="space-y-6">
            {/* Week at a glance */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
              <h2 className="text-sm font-medium text-slate-300 mb-4">This Week</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Check-ins</p>
                  <p className="text-lg text-white">{data.weeklyCheckinCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Most frequent states</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(data.recentStates || []).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {s}
                      </span>
                    ))}
                    {(!data.recentStates || data.recentStates.length === 0) && (
                      <span className="text-xs text-slate-600">No data yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent framings */}
            {data.recentFramings && data.recentFramings.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
                <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Recent Insights
                </h2>
                <div className="space-y-3">
                  {data.recentFramings.map((f, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-xs text-slate-600 flex-shrink-0 pt-0.5">
                        {new Date(f.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <p className="text-sm text-slate-300">{f.framing}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-600 text-center">
              This is a summary view. Full details are private.
            </p>
          </div>
        )}

        {/* Full stream view */}
        {(data.permissionLevel === 'read_stream' || data.permissionLevel === 'selected_entries') && data.checkins && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Timeline
            </h2>
            {data.checkins.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-lg border border-slate-800/60 bg-slate-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  {c.childState && (
                    <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/50">
                      {CHILD_STATE_LABELS[c.childState]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white mb-3">{c.whatHappened}</p>

                {c.maiaResponse && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
                    <div className="bg-slate-800/30 rounded p-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">What this is</p>
                      <p className="text-xs text-slate-300">{c.maiaResponse.framing}</p>
                    </div>
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded p-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">What to say</p>
                      <p className="text-xs text-amber-100">{c.maiaResponse.script}</p>
                    </div>
                    <div className="bg-slate-800/30 rounded p-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">What to do</p>
                      <p className="text-xs text-slate-300">{c.maiaResponse.action}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-700">
            Powered by Soullab
          </p>
        </div>
      </div>
    </div>
  );
}
