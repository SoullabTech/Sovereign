/**
 * Pattern Chips
 *
 * Displays clickable chips for patterns detected in a MAIA message.
 * Clicking a chip opens the PatternDrawer to show supporting evidence.
 */
"use client";

import React, { useMemo } from "react";

export type PatternMeta = {
  id: string;
  key: string;
  sig?: number;
  seen?: number;
};

type Props = {
  patterns: PatternMeta[];
  onOpen: (pattern: PatternMeta) => void;
};

/**
 * Format pattern key for display
 */
function formatPatternKey(key: string): string {
  // recurring_somatic:chest -> "Chest"
  // facet_dwelling:FIRE-2 -> "Fire-2"
  // potential_spiritual_bypassing -> "Spiritual Bypassing"
  const parts = key.split(":");
  const lastPart = parts[parts.length - 1];

  return lastPart
    .replace(/_/g, " ")
    .replace(/potential /gi, "")
    .replace(/recurring /gi, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PatternChips({ patterns, onOpen }: Props) {
  const list = useMemo(() => patterns?.filter(Boolean) ?? [], [patterns]);

  if (list.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
      {list.map((p) => (
        <button
          key={p.id}
          className="rounded-full border border-amber-500/30 bg-amber-900/20
                     px-3 py-1.5 text-xs text-amber-300
                     hover:bg-amber-800/30 hover:border-amber-400/50
                     transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(p);
          }}
          title="Show why MAIA detected this pattern"
        >
          <span className="font-medium">{formatPatternKey(p.key)}</span>
          {typeof p.seen === "number" && p.seen > 1 && (
            <span className="ml-1.5 text-amber-400/60">{p.seen}×</span>
          )}
        </button>
      ))}
    </div>
  );
}
