'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { FieldSignal } from './FieldSignal';
import type { CircleState } from '@/lib/circles/types';

const PHASE_ANCHORING: Record<string, string> = {
  forming: 'You are entering a forming field',
  active: 'This field is active right now',
  integrating: 'This field is integrating',
  quiet: 'You are entering a quiet field',
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

interface FieldPresenceProps {
  circleId: string;
  circleName: string;
  circleDescription?: string | null;
}

export function FieldPresence({ circleId, circleName, circleDescription }: FieldPresenceProps) {
  const [pulse, setPulse] = useState<CircleState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/circles/${circleId}/pulse`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setPulse(json.pulse ?? null);
        }
      } catch {
        // Graceful — field presence is atmospheric, not critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  const phase = pulse?.phase ?? 'quiet';
  const anchoring = PHASE_ANCHORING[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mb-6 rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-6"
    >
      {/* Circle identity */}
      <h1 className="text-2xl font-semibold text-maia-ink-100">{circleName}</h1>
      {circleDescription && (
        <p className="mt-1 text-sm text-maia-ink-40">{circleDescription}</p>
      )}

      {/* Field atmosphere */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5"
        >
          {/* Anchoring line */}
          <p className="text-xs font-medium uppercase tracking-widest text-maia-ink-30 mb-3">
            What is present here
          </p>

          <p className="text-sm text-maia-ink-50 italic mb-3">
            {anchoring}
          </p>

          {/* Field signals */}
          {pulse && pulse.signals.length > 0 && (
            <div className="space-y-0.5">
              {pulse.signals.map((signal, i) => (
                <FieldSignal
                  key={signal._themeKey || i}
                  description={signal.description}
                  element={signal.element}
                />
              ))}
            </div>
          )}

          {/* Active inquiry teaser */}
          {pulse?.hasActiveInquiry && pulse.activeInquiryQuestion && (
            <div className="mt-4 rounded-xl border border-amber-800/30 bg-amber-900/10 px-4 py-3">
              <p className="text-xs text-amber-400/70 mb-1">An inquiry is open</p>
              <p className="text-sm text-maia-ink-80 italic leading-relaxed">
                &ldquo;{pulse.activeInquiryQuestion}&rdquo;
              </p>
            </div>
          )}

          {/* Empty field */}
          {pulse && pulse.signals.length === 0 && !pulse.hasActiveInquiry && (
            <p className="text-sm text-maia-ink-30 leading-relaxed">
              The field is quiet. Themes emerge as members engage with MAIA.
            </p>
          )}

          {/* Last movement */}
          {pulse?.lastMovementAt && (
            <p className="mt-3 text-xs text-maia-ink-20">
              Last movement: {timeAgo(pulse.lastMovementAt)}
            </p>
          )}
        </motion.div>
      )}

      {loading && (
        <div className="mt-5 h-16 flex items-center">
          <div className="h-2 w-2 animate-pulse rounded-full bg-maia-ink-20" />
        </div>
      )}
    </motion.div>
  );
}
