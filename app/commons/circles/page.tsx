'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Plus, KeyRound, LogIn } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { FieldPhase } from '@/lib/circles/types';

type CircleListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: string;
  consentMode: 'manual' | 'not_now';
};

type PulseSummary = {
  phase: FieldPhase;
  lastMovementAt: string | null;
  hasActiveInquiry: boolean;
};

const PHASE_LABELS: Record<FieldPhase, { text: string; className: string }> = {
  active: { text: 'Active', className: 'bg-amber-900/20 text-amber-400/80' },
  integrating: { text: 'Integrating', className: 'bg-teal-900/20 text-teal-400/70' },
  forming: { text: 'Forming', className: 'bg-violet-900/20 text-violet-400/70' },
  quiet: { text: 'Quiet', className: 'bg-maia-navy-800 text-maia-ink-30' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<CircleListItem[]>([]);
  const [summaries, setSummaries] = useState<Record<string, PulseSummary>>({});
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/circles');
        if (res.status === 401) {
          if (!cancelled) setSignedOut(true);
          return;
        }
        const json = await res.json();
        if (!cancelled) setCircles(json.circles ?? []);

        // Fetch pulse summaries in parallel
        const pulseRes = await apiFetch('/api/circles/pulse-summary');
        if (pulseRes.ok) {
          const pulseJson = await pulseRes.json();
          if (!cancelled) setSummaries(pulseJson.summaries ?? {});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-maia-ink-100">My Circles</h1>
                <p className="mt-1 text-sm text-maia-ink-60">Shared spaces, sovereign boundaries.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/commons/circles/new"
                className="flex items-center gap-2 rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20"
              >
                <Plus className="h-4 w-4" /> Create circle
              </Link>
              <Link
                href="/commons/join"
                className="flex items-center gap-2 rounded-xl border border-maia-navy-700 px-4 py-2 text-sm text-maia-ink-60 transition-colors hover:border-maia-ink-40"
              >
                <KeyRound className="h-4 w-4" /> Join with invite
              </Link>
            </div>
          </div>

          {loading && (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-maia-spice-400" />
              <p className="mt-4 text-sm text-maia-ink-40">Loading circles...</p>
            </div>
          )}

          {!loading && signedOut && (
            <div className="rounded-2xl border border-maia-spice-500/20 bg-maia-navy-850 p-8 text-center">
              <LogIn className="mx-auto h-12 w-12 text-maia-spice-400/60" />
              <h2 className="mt-4 text-lg font-semibold text-maia-ink-80">Sign in to see your circles</h2>
              <p className="mt-2 text-sm text-maia-ink-40">
                You need to be signed in to create or join circles.
              </p>
              <div className="mt-6">
                <Link
                  href="/signin"
                  className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-6 py-2 text-sm font-medium text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {!loading && !signedOut && circles.length === 0 && (
            <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-maia-ink-40" />
              <h2 className="mt-4 text-lg font-semibold text-maia-ink-80">No circles yet</h2>
              <p className="mt-2 text-sm text-maia-ink-40">
                Create a circle for a group you steward, or join one with an invite link.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/commons/circles/new"
                  className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400"
                >
                  Create circle
                </Link>
                <Link
                  href="/commons/join"
                  className="rounded-xl border border-maia-navy-700 px-4 py-2 text-sm text-maia-ink-60"
                >
                  Join with invite
                </Link>
              </div>
            </div>
          )}

          {!loading && !signedOut && circles.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {circles.map((c, i) => {
                const pulse = summaries[c.id];
                const phaseInfo = pulse ? PHASE_LABELS[pulse.phase] : null;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/commons/circles/${c.id}`}
                      className="block rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5 transition-all hover:border-maia-spice-500/30 hover:shadow-maia-panel"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-maia-ink-100">{c.name}</h3>
                          {c.description && (
                            <p className="mt-1 truncate text-sm text-maia-ink-40">{c.description}</p>
                          )}
                          <div className="mt-3 flex items-center gap-3 text-xs text-maia-ink-40">
                            <span className="rounded-md border border-maia-navy-700 bg-maia-navy-900 px-2 py-0.5">
                              {c.myRole}
                            </span>
                            <span>{c.consentMode === 'manual' ? 'Sharing enabled' : 'Sharing paused'}</span>
                          </div>

                          {/* Field state — phase badge + last movement */}
                          {pulse && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              {phaseInfo && (
                                <span className={`rounded-md px-1.5 py-0.5 ${phaseInfo.className}`}>
                                  {phaseInfo.text}
                                </span>
                              )}
                              {pulse.hasActiveInquiry && (
                                <span className="text-amber-400/60">An inquiry is open</span>
                              )}
                              {pulse.lastMovementAt && (
                                <span className="text-maia-ink-20">
                                  {timeAgo(pulse.lastMovementAt)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
