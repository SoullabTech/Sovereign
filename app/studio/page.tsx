'use client';

/**
 * STUDIO HOME — "Reveal the practitioner's world."
 *
 * Replaces the developer cockpit (moved to /studio/command) with a threshold built
 * around people, sessions, continuity, and community. Presentation over endpoints
 * that already exist — no new backend.
 *
 * The ZERO-STATE is first-class. A practitioner with no clients yet should feel a
 * warm entrance that guides ONE concrete action — not an empty dashboard. Only once
 * there is something to hold do the cards appear.
 *
 * Governing test: does this help a practitioner care for someone?
 * See docs/specs/STUDIO_HOME_REVEAL_SPEC_2026-06-10.md
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sunrise, Sun, Moon, Sparkles, Users, History, Users2,
  ChevronRight, ArrowRight, Plus, Loader2, CalendarClock, DoorOpen,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { SessionBriefingCard } from '@/components/studio/SessionBriefingCard';

// ─── Shapes (subset of the endpoints we read) ───
interface Identity { name?: string | null; portalType?: string | null }
interface ClientRow {
  id: string; name: string; status?: string;
  lastSessionAt?: string | null; nextSessionAt?: string | null; totalSessions?: number;
}
interface Booking {
  id: string; startAt: string; status?: string;
  serviceName?: string | null; clientName?: string | null;
}
interface Channel { id: string; slug: string; name: string; unreadCount?: number }

// ─── Helpers ───
function greeting(hour: number): { word: string; Icon: typeof Sun } {
  if (hour < 12) return { word: 'Good morning', Icon: Sunrise };
  if (hour < 18) return { word: 'Good afternoon', Icon: Sun };
  return { word: 'Good evening', Icon: Moon };
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameDay = d.toDateString() === now.toDateString();
  const tom = new Date(now); tom.setDate(now.getDate() + 1);
  if (sameDay) return `Today at ${time}`;
  if (d.toDateString() === tom.toDateString()) return `Tomorrow at ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} at ${time}`;
}

function formatLastSeen(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) { const w = Math.floor(days / 7); return w === 1 ? 'a week ago' : `${w} weeks ago`; }
  const m = Math.floor(days / 30); return m === 1 ? 'a month ago' : `${m} months ago`;
}

const CARD = 'bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5';

/**
 * First entrance — the zero-state. One warm invitation, one concrete action.
 * Shown only when a practitioner has no people and no sessions yet.
 */
function FirstEntrance({ hasCommunities }: { hasCommunities: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#1e1e38] border border-amber-500/20 rounded-2xl p-8 md:p-12 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
        <Users className="w-6 h-6 text-amber-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-3">Your practice begins with one person.</h2>
      <p className="text-slate-400 max-w-md mx-auto mb-7 leading-relaxed">
        Add someone you care for — then Studio can help you prepare for them,
        remember what matters, and follow the thread between sessions.
      </p>
      <Link
        href="/studio/clients"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#1a1a2e] font-medium hover:bg-amber-400 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add your first person
      </Link>
      {hasCommunities && (
        <div className="mt-6">
          <Link href="/team" className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5">
            Or step into the commons <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function StudioHome() {
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const safeJson = async (path: string) => {
      try { const r = await apiFetch(path); if (!r.ok) return null; return await r.json(); }
      catch { return null; }
    };
    (async () => {
      const [w, c, b, ch] = await Promise.all([
        safeJson('/api/studio/whoami'),
        safeJson('/api/studio/clients'),
        safeJson('/api/studio/bookings?limit=20'),
        safeJson('/api/team/channels'),
      ]);
      if (w?.identity) setIdentity(w.identity);
      setClients(Array.isArray(c?.clients) ? c.clients : []);
      setBookings(Array.isArray(b?.bookings) ? b.bookings : []);
      setChannels(Array.isArray(ch?.channels) ? ch.channels : []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const firstName = (identity?.name || '').trim().split(/\s+/)[0] || 'there';
  const { word, Icon } = greeting(new Date().getHours());

  const upcoming = [...bookings]
    .filter(b => b.startAt)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const nextBooking = upcoming[0] || null;
  const clientCount = clients.length;
  const upcomingCount = upcoming.length;

  // True zero-state: no people AND no sessions. The first entrance, not a dashboard.
  const isEmptyPractice = clientCount === 0 && upcomingCount === 0;

  const recentPeople = clients
    .filter(c => c.lastSessionAt)
    .sort((a, b) => new Date(b.lastSessionAt!).getTime() - new Date(a.lastSessionAt!).getTime())
    .slice(0, 4);

  const communities = channels.slice(0, 5);

  const parts: string[] = [];
  if (upcomingCount > 0) parts.push(`${upcomingCount} upcoming session${upcomingCount === 1 ? '' : 's'}`);
  if (clientCount > 0) parts.push(`${clientCount} ${clientCount === 1 ? 'person' : 'people'} in your care`);
  const subline = parts.length
    ? `You have ${parts.join(' and ')}.`
    : 'The room is quiet, and ready for you.';

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── MAIA greeting — a presence, not a chat icon ── */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-white">{word}, {firstName}.</h1>
            <p className="text-slate-400 mt-1">{subline}</p>
            {nextBooking && (
              <p className="text-sm text-slate-500 mt-1">
                Next: {nextBooking.clientName || 'a session'} · {formatWhen(nextBooking.startAt)}
              </p>
            )}
          </div>
        </div>

        {isEmptyPractice ? (
          /* ── The first entrance — one warm invitation, one concrete action ── */
          <FirstEntrance hasCommunities={communities.length > 0} />
        ) : (
          <>
            {/* ── Prepare Me — the crown jewel, impossible to miss ── */}
            <motion.section
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1e38] border border-amber-500/20 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">Prepare Me</h2>
              </div>

              {nextBooking ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CalendarClock className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white font-medium truncate">
                          {nextBooking.clientName || 'Upcoming session'}
                        </div>
                        <div className="text-sm text-slate-400 truncate">
                          {formatWhen(nextBooking.startAt)}
                          {nextBooking.serviceName ? ` · ${nextBooking.serviceName}` : ''}
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/studio/session-room"
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25 transition-colors"
                    >
                      <DoorOpen className="w-4 h-4" /> Enter Session Studio
                    </Link>
                  </div>
                  {/* The prep itself, surfaced inline — the existing engine, finally on the threshold */}
                  <SessionBriefingCard sessionId={nextBooking.id} />
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  When you have a session coming up, you’ll prepare for it here — what matters,
                  what’s unresolved, what to remember — in one breath.
                </p>
              )}
            </motion.section>

            {/* ── People · Threads · Communities ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* My People */}
              <div className={CARD}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-medium text-white">My People</h3>
                  </div>
                  <Link href="/studio/clients" className="text-slate-600 hover:text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {clientCount > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-white">{clientCount}</div>
                    <div className="text-sm text-slate-400 mb-3">
                      {clientCount === 1 ? 'person' : 'people'} in your care
                    </div>
                    <Link href="/studio/clients" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                      Open your people <ArrowRight className="w-3 h-3" />
                    </Link>
                  </>
                ) : (
                  <div className="py-2">
                    <p className="text-sm text-slate-400 mb-3">No people yet. This is where they’ll live.</p>
                    <Link href="/studio/clients" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add your first person
                    </Link>
                  </div>
                )}
              </div>

              {/* My Threads — v1: where you left off (real last-session data; not yet the full primitive) */}
              <div className={CARD}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-medium text-white">My Threads</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-600">Where you left off</span>
                </div>
                {recentPeople.length > 0 ? (
                  <ul className="space-y-2">
                    {recentPeople.map(p => (
                      <li key={p.id}>
                        <Link href={`/studio/clients/${p.id}`} className="flex items-center justify-between group">
                          <span className="text-sm text-slate-200 truncate group-hover:text-white">{p.name}</span>
                          <span className="text-xs text-slate-500 shrink-0 ml-2">
                            {p.lastSessionAt ? formatLastSeen(p.lastSessionAt) : ''}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 py-2">
                    Your relationships will gather here — every thread, held in one place.
                  </p>
                )}
              </div>

              {/* My Communities */}
              <div className={CARD}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-medium text-white">My Communities</h3>
                  </div>
                  <Link href="/team" className="text-slate-600 hover:text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {communities.length > 0 ? (
                  <ul className="space-y-2">
                    {communities.map(c => (
                      <li key={c.id}>
                        <Link href="/team" className="flex items-center justify-between group">
                          <span className="text-sm text-slate-200 truncate group-hover:text-white">{c.name}</span>
                          {(c.unreadCount || 0) > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 shrink-0 ml-2">
                              {c.unreadCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-2">
                    <p className="text-sm text-slate-400 mb-3">The first circles are forming.</p>
                    <Link href="/team" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                      Enter the commons <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
