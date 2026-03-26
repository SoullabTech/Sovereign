'use client';

/**
 * Today's Field — Practitioner's working surface
 *
 * Not a dashboard. Not analytics. Not system navigation.
 * A place to meet the work: who you're seeing, what's arriving, how to orient.
 *
 * Structure:
 *   1. Next Session (primary anchor)
 *   2. Today's remaining sessions
 *   3. Recent sessions (light continuity cue)
 */

import { useState, useEffect } from 'react';
import { Clock, User, ChevronDown, ChevronUp, Calendar, Sun } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { SessionBriefingCard } from '@/components/studio/SessionBriefingCard';

// ─── Types ───────────────────────────────────────────────

interface TodaySession {
  id: string;
  client_name: string | null;
  client_email: string | null;
  service_name: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  notes: string | null;
  practitioner_notes: string | null;
}

// ─── Helpers ─────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isUpcoming(iso: string): boolean {
  return new Date(iso) > new Date();
}

// ─── Session Card ────────────────────────────────────────

function SessionCard({
  session,
  isNext,
}: {
  session: TodaySession;
  isNext?: boolean;
}) {
  const [showPrepare, setShowPrepare] = useState(false);

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all
        ${isNext
          ? 'bg-[#1e1e38] border-amber-500/30'
          : 'bg-[#1a1a2e] border-slate-800/50'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
              ${isNext
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-300'}
            `}
          >
            {session.client_name
              ? session.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)
              : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {session.client_name || 'Client'}
            </div>
            <div className="text-xs text-slate-400">
              {session.service_name || 'Session'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeRange(session.scheduled_start, session.scheduled_end)}</span>
        </div>
      </div>

      {/* Theme signal — what is arriving in the person */}
      {session.notes && (
        <div className="mb-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Theme</span>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
            {session.notes}
          </p>
        </div>
      )}

      {/* Prepare button */}
      <button
        onClick={() => setShowPrepare(!showPrepare)}
        className={`
          flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all
          ${showPrepare
            ? 'bg-amber-500/20 text-amber-300'
            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
        `}
      >
        {showPrepare ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Prepare
      </button>

      {/* Briefing (expand) — uses existing SessionBriefingCard */}
      {showPrepare && (
        <div className="mt-3">
          <SessionBriefingCard sessionId={session.id} />
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function TodayFieldPage() {
  const [sessions, setSessions] = useState<TodaySession[]>([]);
  const [recentSessions, setRecentSessions] = useState<TodaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch upcoming sessions (sorted by start time ASC)
        const res = await apiFetch('/api/studio/sessions?upcoming=true&limit=20');
        const data = await res.json();
        const all: TodaySession[] = data.sessions ?? [];

        // Split: today vs future
        const today = all.filter(s => isToday(s.scheduled_start));
        setSessions(today);

        // Fetch recent completed sessions for continuity
        const recentRes = await apiFetch('/api/studio/sessions?status=completed&limit=3');
        const recentData = await recentRes.json();
        setRecentSessions(recentData.sessions ?? []);
      } catch (err) {
        console.warn('[TodayField] Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Split today's sessions: next upcoming vs rest
  const upcomingSessions = sessions.filter(s => isUpcoming(s.scheduled_start));
  const nextSession = upcomingSessions[0] ?? null;
  const remainingSessions = upcomingSessions.slice(1);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-medium text-white">Today&apos;s Field</h1>
          </div>
          <p className="text-sm text-slate-400">{todayFormatted}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-sm text-slate-400 py-8 text-center">
            Loading your field...
          </div>
        )}

        {/* No sessions today */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No sessions today.</p>
            <p className="text-xs text-slate-500 mt-1">Your field is clear.</p>
          </div>
        )}

        {/* Next Session (primary) */}
        {!loading && nextSession && (
          <div className="mb-6">
            <div className="text-xs text-amber-400/70 uppercase tracking-wider mb-2">
              Next Session
            </div>
            <SessionCard session={nextSession} isNext />
          </div>
        )}

        {/* Remaining today */}
        {!loading && remainingSessions.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Later Today
            </div>
            <div className="space-y-3">
              {remainingSessions.map(s => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>
        )}

        {/* Recent sessions (continuity cue) */}
        {!loading && recentSessions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Recent
            </div>
            <div className="space-y-2">
              {recentSessions.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#16162a] border border-slate-800/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                      {s.client_name
                        ? s.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                        : '?'}
                    </div>
                    <span className="text-xs text-slate-300">{s.client_name || 'Client'}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(s.scheduled_start).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
