'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, KeyRound, LogIn } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

type CircleListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  myRole: string;
  consentMode: 'manual' | 'not_now';
};

export default function CirclesPage() {
  const [circles, setCircles] = useState<CircleListItem[]>([]);
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
            <div>
              <h1 className="text-2xl font-semibold text-maia-ink-100">My Circles</h1>
              <p className="mt-1 text-sm text-maia-ink-60">Shared spaces, sovereign boundaries.</p>
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
              {circles.map((c, i) => (
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
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
