'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface BriefingLastSession {
  date: string;
  type: string;
  notes: string | null;
  themes: string[];
  insights: string[];
  days_ago: number;
}

interface BriefingJourney {
  total_sessions: number;
  months_together: number;
  recurring_themes: string[];
  stated_goals: string | null;
}

interface BriefingFlags {
  has_emergency_info: boolean;
  has_safety_plan: boolean;
  has_risk_factors: boolean;
  upcoming_life_events?: string[];
}

interface BriefingRecentSession {
  id: string;
  date: string;
  type: string;
  themes?: string[];
}

interface BriefingMessageDigest {
  messages_since_last_session: number;
  has_safety_concerns: boolean;
  has_time_sensitive: boolean;
  synthesis: string | null;
}

interface BriefingData {
  client_name: string | null;
  last_session: BriefingLastSession | null;
  journey: BriefingJourney;
  flags: BriefingFlags;
  recent_sessions: BriefingRecentSession[];
  message_digest: BriefingMessageDigest | null;
}

function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function SessionBriefingCard({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/studio/sessions/${sessionId}/briefing`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load briefing');
      setBriefing(data.briefing || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load briefing');
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // No client linked — don't render
  if (!loading && error === 'No client linked to this session') {
    return null;
  }

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-medium text-white">Pre-Session Briefing</h3>
        </div>
        <button
          onClick={load}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-sm text-slate-400 py-2">Loading briefing...</div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-sm text-rose-300 flex items-start gap-2 py-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* No history */}
      {!loading && !error && !briefing && (
        <div className="text-sm text-slate-400 py-2">
          No session history yet. This will populate after your first session.
        </div>
      )}

      {/* Briefing content */}
      {!loading && !error && briefing && (
        <div className="space-y-4">

          {/* Safety flags — always first */}
          {(briefing.flags.has_risk_factors || briefing.flags.has_safety_plan || briefing.message_digest?.has_safety_concerns) && (
            <div className="border border-rose-500/30 bg-rose-500/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-rose-300" />
                <span className="text-xs font-medium text-rose-200">Flags</span>
              </div>
              <ul className="text-xs text-rose-100 space-y-1">
                {briefing.flags.has_risk_factors && (
                  <li>Risk factors documented</li>
                )}
                {briefing.flags.has_safety_plan && (
                  <li>Safety plan on file</li>
                )}
                {briefing.message_digest?.has_safety_concerns && (
                  <li>Safety concern in recent messages</li>
                )}
              </ul>
            </div>
          )}

          {/* Last session */}
          {briefing.last_session && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">
                  Last session — {formatDaysAgo(briefing.last_session.days_ago)}
                </span>
              </div>

              {/* Themes */}
              {briefing.last_session.themes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {briefing.last_session.themes.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes excerpt */}
              {briefing.last_session.notes && (
                <p className="text-xs text-slate-300 line-clamp-3">
                  {briefing.last_session.notes}
                </p>
              )}

              {/* Insights */}
              {briefing.last_session.insights.length > 0 && (
                <ul className="mt-1.5 text-xs text-slate-400 space-y-0.5">
                  {briefing.last_session.insights.slice(0, 3).map((insight, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">-</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Between-session messages */}
          {briefing.message_digest && briefing.message_digest.messages_since_last_session > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">
                  {briefing.message_digest.messages_since_last_session} message{briefing.message_digest.messages_since_last_session !== 1 ? 's' : ''} since last session
                </span>
              </div>
              {briefing.message_digest.synthesis && (
                <p className="text-xs text-slate-300">
                  {briefing.message_digest.synthesis}
                </p>
              )}
            </div>
          )}

          {/* Recurring themes / journey */}
          {briefing.journey.recurring_themes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">
                  Recurring themes
                  {briefing.journey.total_sessions > 0 && (
                    <> &middot; {briefing.journey.total_sessions} session{briefing.journey.total_sessions !== 1 ? 's' : ''}</>
                  )}
                  {briefing.journey.months_together > 0 && (
                    <> &middot; {briefing.journey.months_together}mo together</>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {briefing.journey.recurring_themes.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stated goals */}
          {briefing.journey.stated_goals && (
            <div>
              <div className="text-xs text-slate-400 mb-1">Stated goals</div>
              <p className="text-xs text-slate-300">
                {briefing.journey.stated_goals}
              </p>
            </div>
          )}

          {/* Upcoming life events */}
          {briefing.flags.upcoming_life_events && briefing.flags.upcoming_life_events.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 mb-1">Upcoming life events</div>
              <ul className="text-xs text-slate-300 space-y-0.5">
                {briefing.flags.upcoming_life_events.map((e, i) => (
                  <li key={i}>- {e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* No history but client exists */}
          {!briefing.last_session && briefing.journey.total_sessions === 0 && (
            <div className="text-xs text-slate-400">
              First session with this client. No prior history.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
