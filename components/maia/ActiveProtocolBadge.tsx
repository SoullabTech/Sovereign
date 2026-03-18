'use client';

/**
 * ActiveProtocolBadge — components/maia/ActiveProtocolBadge.tsx
 *
 * Minimal indicator shown in the MAIA interface when a member has an active
 * pattern inquiry protocol running. Quiet container — not a task manager.
 *
 * Shows: protocol name | "Week N" | week title (e.g. "Somatic Mapping")
 *
 * Phase 1: Display only. Tapping is a stub (no dedicated protocol mode yet).
 * Phase 2+: Tapping will open the protocol session mode.
 *
 * Fetches from /api/members/active-protocol on mount.
 * Renders nothing if no active protocol.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface WeekConfig {
  title: string;
  goal: string;
  trackingFocus: string[];
}

interface ActiveProtocol {
  id: string;
  patternName: string;
  currentWeek: number;
  weekConfig: WeekConfig;
}

export function ActiveProtocolBadge() {
  const [protocol, setProtocol] = useState<ActiveProtocol | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/members/active-protocol')
      .then((res) => res.json())
      .then((data) => {
        setProtocol(data.protocol ?? null);
      })
      .catch(() => {
        // Silent failure — badge simply does not appear
        setProtocol(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Don't render anything while loading or if no active protocol
  if (loading || !protocol) return null;

  return (
    // Phase 1: display-only badge. No action on tap.
    // Phase 2: replace div with button and open protocol session mode.
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs"
      title={`Active inquiry: ${protocol.patternName} — ${protocol.weekConfig.goal}`}
    >
      {/* Week indicator */}
      <span className="font-semibold tabular-nums">
        Week {protocol.currentWeek}
      </span>

      {/* Divider */}
      <span className="text-amber-700" aria-hidden>·</span>

      {/* Week title */}
      <span className="text-amber-400/80">
        {protocol.weekConfig.title}
      </span>

      {/* Pattern name — truncated */}
      <span className="text-amber-700" aria-hidden>·</span>
      <span className="text-amber-500/70 max-w-[120px] truncate" title={protocol.patternName}>
        {protocol.patternName}
      </span>
    </div>
  );
}
