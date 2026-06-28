'use client';

/**
 * PortalThreshold — Personal Portal arrival surface (Track A)
 *
 * Doctrine:
 *   - ORIENTATION_CONTINUITY_MEANING_2026-06-12.md  (empty = orientation)
 *   - VISIBLE_DOORS_2026-06-12.md                   (explorer sees the path, not a paywall)
 *   - PORTAL_STRATEGY_SAME_ROOM_MORE_DEPTH_2026-06-12.md
 *
 * Tier gating: uses lib/portal/tier.ts adapter.
 * Do not read members.tier directly — always go through toPortalTier().
 *
 * Track A scope: arrival + gathering strip + visible companion doors.
 * Track B: signin → /home redirect.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Anchor, FlaskConical, Sparkles, ArrowRight } from 'lucide-react';
import { hasPortalAccess } from '@/lib/portal/tier';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LastSession {
  id: string;
  created_at: string;
  message_count: number;
}

interface RecentAtom {
  id: string;
  title: string;
  body: string | null;
  is_breakthrough: boolean;
  created_at: string;
}

interface Props {
  memberName: string;
  storedTier: string;
  lastSession: LastSession | null;
  recentAtom: RecentAtom | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting(name: string): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const first = name?.split(' ')[0] || '';
  return first ? `Good ${time}, ${first}.` : `Good ${time}.`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArrivalMoment({ memberName }: { memberName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center pt-16 pb-10 px-6"
    >
      <p className="text-maia-ink-60 text-sm font-light mb-3 tracking-wide">
        {greeting(memberName)}
      </p>
      <p className="text-maia-ink-40 text-sm font-light max-w-sm mx-auto leading-relaxed">
        This is a place for reflection, growth, and meaningful conversation.
        Begin anywhere.
      </p>

      {/* Three invitations */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/maia"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-maia-navy-800/60 hover:bg-maia-navy-700
                     border border-maia-navy-700/50 hover:border-maia-navy-600
                     text-maia-ink-80 hover:text-maia-ink-100 text-sm font-light
                     transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4 text-maia-ink-40" />
          Talk with MAIA
        </Link>
        <Link
          href="/maia?anchor=true"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-maia-navy-800/40 hover:bg-maia-navy-700/60
                     border border-maia-navy-700/30 hover:border-maia-navy-600/50
                     text-maia-ink-60 hover:text-maia-ink-80 text-sm font-light
                     transition-all duration-200"
        >
          <Anchor className="w-4 h-4 text-maia-ink-30" />
          Daily Anchor
        </Link>
        <Link
          href="/labtools"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-maia-navy-800/40 hover:bg-maia-navy-700/60
                     border border-maia-navy-700/30 hover:border-maia-navy-600/50
                     text-maia-ink-60 hover:text-maia-ink-80 text-sm font-light
                     transition-all duration-200"
        >
          <FlaskConical className="w-4 h-4 text-maia-ink-30" />
          Explore Practices
        </Link>
      </div>
    </motion.div>
  );
}

function GatheringStrip({
  lastSession,
  recentAtom,
}: {
  lastSession: LastSession | null;
  recentAtom: RecentAtom | null;
}) {
  const hasAnything = lastSession || recentAtom;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-lg mx-auto px-6 pb-8"
    >
      <p className="text-maia-ink-30 text-xs font-light tracking-widest uppercase mb-4">
        Your Gathering
      </p>

      {!hasAnything ? (
        <p className="text-maia-ink-30 text-sm font-light leading-relaxed">
          You&apos;re at the beginning of a thread.
          Everything you explore here becomes part of your continuing story.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lastSession && (
            <Link
              href="/maia"
              className="group flex items-start gap-3 p-3 rounded-xl
                         bg-maia-navy-800/30 hover:bg-maia-navy-800/50
                         border border-maia-navy-700/20 hover:border-maia-navy-700/40
                         transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 text-maia-ink-30 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-maia-ink-60 text-sm font-light">
                  Your conversation is still here
                </p>
                <p className="text-maia-ink-30 text-xs font-light mt-0.5">
                  {lastSession.message_count > 0
                    ? `${lastSession.message_count} exchange${lastSession.message_count === 1 ? '' : 's'} · `
                    : ''}
                  {timeAgo(lastSession.created_at)}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-maia-ink-20 group-hover:text-maia-ink-40 ml-auto shrink-0 mt-0.5 transition-colors" />
            </Link>
          )}

          {recentAtom && (
            <div className="flex items-start gap-3 p-3 rounded-xl
                           bg-maia-navy-800/20
                           border border-maia-navy-700/10">
              {recentAtom.is_breakthrough && (
                <Sparkles className="w-4 h-4 text-amber-400/60 mt-0.5 shrink-0" />
              )}
              {!recentAtom.is_breakthrough && (
                <div className="w-1 h-1 rounded-full bg-maia-ink-20 mt-2 ml-1.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-maia-ink-50 text-sm font-light truncate">
                  {recentAtom.title}
                </p>
                <p className="text-maia-ink-25 text-xs font-light mt-0.5">
                  Saved · {timeAgo(recentAtom.created_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function VisibleCompanionDoors() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="max-w-lg mx-auto px-6 pb-16"
    >
      <div className="border-t border-maia-navy-700/20 pt-6">
        <p className="text-maia-ink-20 text-xs font-light tracking-widest uppercase mb-4">
          What becomes available
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              name: 'Continuity',
              description:
                'Patterns and themes across your conversations become visible over time.',
              tier: 'Companion',
            },
            {
              name: 'Focus Garden',
              description:
                'Work intentionally with recurring themes and long-term development.',
              tier: 'Companion',
            },
            {
              name: 'Gathering',
              description:
                'A curated view of what you have built here, drawn together over time.',
              tier: 'Companion',
            },
          ].map((door) => (
            <div key={door.name} className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-maia-ink-15 mt-2 ml-1 shrink-0" />
              <div>
                <span className="text-maia-ink-35 text-sm font-light">
                  {door.description}
                </span>{' '}
                <span className="text-maia-ink-20 text-xs font-light">
                  · Available at {door.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PortalThreshold({
  memberName,
  storedTier,
  lastSession,
  recentAtom,
}: Props) {
  const isExplorer = !hasPortalAccess(storedTier, 'companion');

  return (
    <div className="min-h-screen bg-maia-navy-950 flex flex-col">
      {/* Back to MAIA link */}
      <div className="flex justify-end px-6 pt-4">
        <Link
          href="/maia"
          className="text-maia-ink-30 hover:text-maia-ink-60 text-xs font-light transition-colors"
        >
          Enter MAIA →
        </Link>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <ArrivalMoment memberName={memberName} />
        <GatheringStrip lastSession={lastSession} recentAtom={recentAtom} />
        {isExplorer && <VisibleCompanionDoors />}
      </div>
    </div>
  );
}
