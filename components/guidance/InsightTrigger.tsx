/**
 * INSIGHT TRIGGER
 *
 * Inline "tap for insight" icon placed next to feature labels.
 * Renders a subtle lightbulb that opens contextual guidance.
 *
 * Phase 1: tooltip depth only (fetched from /api/guidance/content).
 * Phase 2: "Learn more" opens InsightSheet at micro/deep level.
 *
 * Usage:
 *   <h1 className="flex items-center gap-2">
 *     Field
 *     <InsightTrigger featureKey="studio.field" />
 *   </h1>
 *
 *   // In a narrow sidebar, tooltip opens to the right:
 *   <InsightTrigger featureKey="studio.vault" placement="right" />
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import type { GuidanceItem } from '@/lib/guidance/types';

type Placement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'right';

interface InsightTriggerProps {
  featureKey: string;
  label?: string;
  placement?: Placement;
  onLearnMore?: () => void;
}

/** Tailwind position classes per placement */
const PLACEMENT_CLASSES: Record<Placement, string> = {
  'bottom-left':  'left-0 top-9',
  'bottom-right': 'right-0 top-9',
  'top-left':     'left-0 bottom-9',
  'top-right':    'right-0 bottom-9',
  'right':        'left-9 top-0',
};

/** Framer Motion origin offset per placement */
const PLACEMENT_INITIAL: Record<Placement, { x: number; y: number }> = {
  'bottom-left':  { x: 0, y: 6 },
  'bottom-right': { x: 0, y: 6 },
  'top-left':     { x: 0, y: -6 },
  'top-right':    { x: 0, y: -6 },
  'right':        { x: -6, y: 0 },
};

export function InsightTrigger({
  featureKey,
  label = 'Learn more',
  placement = 'bottom-left',
  onLearnMore,
}: InsightTriggerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<GuidanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fetch content on first open
  const fetchContent = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/guidance/content?featureKey=${encodeURIComponent(featureKey)}`);
      const json = await res.json();
      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [featureKey, fetched]);

  /** Stop both click and pointer events from bubbling into parent controls */
  const stopBubble = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next) fetchContent();
  }, [open, fetchContent]);

  const top = items[0];
  const offset = PLACEMENT_INITIAL[placement];

  return (
    <div
      className="relative inline-flex items-center"
      ref={panelRef}
      onPointerDown={stopBubble}
    >
      <button
        type="button"
        aria-label={label}
        onClick={handleToggle}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full
          border border-white/10 bg-white/5
          text-white/40 hover:text-white/80 hover:border-white/20
          transition-all duration-200"
      >
        <Lightbulb className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-72 rounded-2xl
              border border-white/10 bg-[#0b1020]/95 p-4
              shadow-xl backdrop-blur-xl
              ${PLACEMENT_CLASSES[placement]}`}
          >
            {/* Header + close */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/90 font-medium">
                  {loading ? 'Loading\u2026' : (top?.title ?? 'Insight')}
                </div>
                <div className="mt-1 text-[13px] text-white/60 leading-relaxed">
                  {loading
                    ? '\u2026'
                    : (top?.summary ?? 'No guidance published for this feature yet.')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/60 transition text-sm
                  shrink-0 mt-0.5"
                aria-label="Close"
              >
                &#x2715;
              </button>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-white/25 truncate">
                {featureKey}
              </span>

              {onLearnMore && (
                <button
                  type="button"
                  onClick={() => {
                    onLearnMore();
                    setOpen(false);
                  }}
                  className="text-xs text-white/50 hover:text-white/80 transition"
                >
                  Learn more &rarr;
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
