'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, ChevronLeft, ChevronRight, Sparkles,
  BookOpen, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Session {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  serviceName: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  intakePresentingIssue: string | null;
  intakeFocusArea: string | null;
  intakeDesiredOutcome: string | null;
  practitionerPrep: {
    summary?: string;
    tone?: string;
    stance?: string;
    keywords?: string[];
  } | null;
  bookingSource: string | null;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return `${Math.round(ms / 60000)} min`;
}

function getDayLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Session Card ──
function SessionCard({ session }: { session: Session }) {
  const hasIntake = session.intakePresentingIssue || session.intakeFocusArea || session.intakeDesiredOutcome;
  const hasPrep = session.practitionerPrep?.summary;

  return (
    <Link href={`/studio/sessions/${session.id}`}>
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="group p-4 rounded-xl bg-[#1e1e38] border border-slate-800/50 hover:border-slate-700 transition-colors"
      >
        {/* Time + Client + Service */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white">
              {formatTime(session.scheduledStart)}
            </div>
            <div className="text-xs text-slate-600">
              {formatDuration(session.scheduledStart, session.scheduledEnd)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {session.bookingSource === 'portal' && (
              <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">portal</span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              session.status === 'scheduled' ? 'text-blue-400 bg-blue-500/10' :
              session.status === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10' :
              session.status === 'in_progress' ? 'text-amber-400 bg-amber-500/10' :
              session.status === 'completed' ? 'text-slate-500 bg-slate-800' :
              'text-red-400 bg-red-500/10'
            }`}>
              {session.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <User size={13} className="text-slate-500" />
          <span className="text-sm text-slate-200">{session.clientName || 'Unknown client'}</span>
        </div>

        {session.serviceName && (
          <div className="text-xs text-slate-500 mb-2 ml-5">{session.serviceName}</div>
        )}

        {/* Intake preview (compact) */}
        {hasIntake && (
          <div className="mt-2 pt-2 border-t border-slate-800/30">
            {session.intakeFocusArea && (
              <span className="inline-block px-2 py-0.5 bg-slate-800/50 text-slate-400 text-[10px] rounded-full mr-1.5 mb-1">
                {session.intakeFocusArea}
              </span>
            )}
            {session.intakePresentingIssue && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                {session.intakePresentingIssue}
              </p>
            )}
          </div>
        )}

        {/* MAIA prep hint */}
        {hasPrep && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-500/60">
            <Sparkles size={10} />
            <span className="line-clamp-1">{session.practitionerPrep!.stance}</span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ArrowRight size={10} />
        </div>
      </motion.div>
    </Link>
  );
}

// ── Day Column ──
function DayColumn({ date, sessions }: { date: Date; sessions: Session[] }) {
  const label = getDayLabel(date);
  const isToday = label === 'Today';
  const daySessions = sessions
    .filter(s => {
      const sDate = new Date(s.scheduledStart);
      return sDate.toDateString() === date.toDateString() && s.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

  return (
    <div className="min-w-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${isToday ? 'border-amber-500/30' : 'border-slate-800/50'}`}>
        <div className={`text-xs font-medium uppercase tracking-wider ${isToday ? 'text-amber-400' : 'text-slate-500'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-600">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        {daySessions.length > 0 && (
          <div className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isToday ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
            {daySessions.length}
          </div>
        )}
      </div>

      {daySessions.length === 0 ? (
        <div className="text-xs text-slate-700 text-center py-8">
          No sessions
        </div>
      ) : (
        <div className="space-y-2">
          {daySessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function StudioSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7)); // Sunday start

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  // Fetch sessions for the visible week
  useEffect(() => {
    const start = weekDates[0].toISOString();
    const end = new Date(weekDates[6].getTime() + 24 * 60 * 60 * 1000).toISOString();

    setLoading(true);
    apiFetch(`/api/studio/sessions?upcoming=false&limit=100`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Filter to week range client-side
          const weekSessions = (data.sessions || []).filter((s: Session) => {
            const sDate = new Date(s.scheduledStart);
            return sDate >= weekDates[0] && sDate <= new Date(weekDates[6].getTime() + 24 * 60 * 60 * 1000);
          });
          setSessions(weekSessions);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekDates]);

  // Today + Tomorrow quick stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.scheduledStart);
    return d.toDateString() === today.toDateString() && s.status !== 'cancelled';
  });
  const tomorrowSessions = sessions.filter(s => {
    const d = new Date(s.scheduledStart);
    return d.toDateString() === tomorrow.toDateString() && s.status !== 'cancelled';
  });
  const weekTotal = sessions.filter(s => s.status !== 'cancelled').length;
  const withIntake = sessions.filter(s => s.intakePresentingIssue || s.intakeFocusArea).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDateHeader(weekDates[0])} — {formatDateHeader(weekDates[6])}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              weekOffset === 0 ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
          >
            This week
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Today', value: todaySessions.length, accent: true },
          { label: 'Tomorrow', value: tomorrowSessions.length, accent: false },
          { label: 'This week', value: weekTotal, accent: false },
          { label: 'With intake', value: withIntake, accent: false },
        ].map(stat => (
          <div key={stat.label} className={`p-3 rounded-xl border ${stat.accent ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-800/50 bg-[#1e1e38]'}`}>
            <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
            <div className={`text-lg font-semibold ${stat.accent ? 'text-amber-400' : 'text-white'}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        </div>
      ) : (
        /* Week grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDates.map(date => (
            <DayColumn key={date.toISOString()} date={date} sessions={sessions} />
          ))}
        </div>
      )}
    </div>
  );
}
