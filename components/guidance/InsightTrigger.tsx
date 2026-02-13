/**
 * INSIGHT TRIGGER
 *
 * Inline "tap for insight" icon placed next to feature labels.
 * Renders a subtle lightbulb that opens contextual guidance.
 *
 * Two layers:
 *   Guide layer (default) — dynamic, member-centric whisper from MAIA
 *   Legend layer — static "What is this?" tooltip from guidance_content
 *
 * The trigger calls /api/guidance/insight first. If a whisper is available,
 * it shows the whisper + suggested actions. The member can toggle to the
 * static legend via a "What is this?" link. If no whisper is available
 * (no context, AI unavailable), it falls back to the static tooltip.
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

import { useState, useRef, useCallback, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import type { GuideInsightResponse, WhisperAction } from '@/lib/guidance/types';

type Placement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'right';

type InsightLayer = 'whisper' | 'legend';

interface InsightTriggerProps {
  featureKey: string;
  label?: string;
  placement?: Placement;
  onLearnMore?: () => void;
  /** Callback when "Explore with MAIA" is tapped — receives the whisper text as seed */
  onExploreMaia?: (seed: string) => void;
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
  onExploreMaia,
}: InsightTriggerProps) {
  const [open, setOpen] = useState(false);
  const [layer, setLayer] = useState<InsightLayer>('whisper');
  const [data, setData] = useState<GuideInsightResponse | null>(null);
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

  // Fetch insight on first open
  const fetchInsight = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/guidance/insight?featureKey=${encodeURIComponent(featureKey)}`,
      );
      const json: GuideInsightResponse = await res.json();
      setData(json);
      // Default to whisper layer if whisper is available, legend if not
      setLayer(json.whisper ? 'whisper' : 'legend');
    } catch {
      setData(null);
      setLayer('legend');
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [featureKey, fetched]);

  /** Stop both click and pointer events from bubbling into parent controls */
  const stopBubble = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const next = !open;
      setOpen(next);
      if (next) fetchInsight();
    },
    [open, fetchInsight],
  );

  const handleAction = useCallback(
    (action: WhisperAction) => {
      if (action.intent === 'leave_it') {
        setOpen(false);
        return;
      }
      if (action.intent === 'explore_maia' && onExploreMaia && data?.whisper) {
        onExploreMaia(data.whisper.whisper);
        setOpen(false);
        return;
      }
      // Other intents (capture, name) — close for now; future phases wire these
      setOpen(false);
    },
    [data, onExploreMaia],
  );

  const offset = PLACEMENT_INITIAL[placement];

  // Determine whether the lightbulb should glow (whisper available from cache)
  const hasWhisper = data?.whisper != null;

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
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full
          border transition-all duration-200
          ${
            hasWhisper
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400/70 hover:text-amber-300 hover:border-amber-400/40'
              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/80 hover:border-white/20'
          }`}
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
            className={`absolute z-50 w-80 rounded-2xl
              border border-white/10 bg-[#0b1020]/95 p-4
              shadow-xl backdrop-blur-xl
              ${PLACEMENT_CLASSES[placement]}`}
          >
            {loading ? (
              <LoadingState />
            ) : layer === 'whisper' && data?.whisper ? (
              <WhisperLayer
                whisper={data.whisper}
                onAction={handleAction}
                onSwitchToLegend={() => setLayer('legend')}
                onClose={() => setOpen(false)}
              />
            ) : (
              <LegendLayer
                title={data?.fallbackTitle}
                summary={data?.fallbackSummary}
                featureKey={featureKey}
                hasWhisper={hasWhisper}
                onSwitchToWhisper={() => setLayer('whisper')}
                onLearnMore={onLearnMore}
                onClose={() => setOpen(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingState() {
  return (
    <div className="text-sm text-white/50 py-2">
      <span className="animate-pulse">Sensing...</span>
    </div>
  );
}

function WhisperLayer({
  whisper,
  onAction,
  onSwitchToLegend,
  onClose,
}: {
  whisper: NonNullable<GuideInsightResponse['whisper']>;
  onAction: (action: WhisperAction) => void;
  onSwitchToLegend: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Close */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-white/30 hover:text-white/60 transition text-sm"
          aria-label="Close"
        >
          &#x2715;
        </button>
      </div>

      {/* Whisper text */}
      <p className="text-[13px] text-white/80 leading-relaxed mt-1 italic">
        {whisper.whisper}
      </p>

      {/* Context summary */}
      {whisper.contextSummary && (
        <p className="text-[11px] text-white/25 mt-2">
          {whisper.contextSummary}
        </p>
      )}

      {/* Actions */}
      {whisper.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {whisper.actions.map((action) => (
            <button
              key={action.intent}
              type="button"
              onClick={() => onAction(action)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition
                ${
                  action.intent === 'leave_it'
                    ? 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                    : 'border-amber-500/20 text-amber-400/80 hover:bg-amber-500/10 hover:border-amber-400/30'
                }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Toggle to legend */}
      <div className="mt-3 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onSwitchToLegend}
          className="text-[11px] text-white/30 hover:text-white/50 transition"
        >
          What is this feature?
        </button>
      </div>
    </>
  );
}

function LegendLayer({
  title,
  summary,
  featureKey,
  hasWhisper,
  onSwitchToWhisper,
  onLearnMore,
  onClose,
}: {
  title?: string;
  summary?: string;
  featureKey: string;
  hasWhisper: boolean;
  onSwitchToWhisper: () => void;
  onLearnMore?: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header + close */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-white/90 font-medium">
            {title ?? 'Insight'}
          </div>
          <div className="mt-1 text-[13px] text-white/60 leading-relaxed">
            {summary ?? 'No guidance published for this feature yet.'}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
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

        <div className="flex items-center gap-3">
          {hasWhisper && (
            <button
              type="button"
              onClick={onSwitchToWhisper}
              className="text-[11px] text-amber-400/50 hover:text-amber-400/80 transition"
            >
              &larr; Guide
            </button>
          )}

          {onLearnMore && (
            <button
              type="button"
              onClick={() => {
                onLearnMore();
                onClose();
              }}
              className="text-xs text-white/50 hover:text-white/80 transition"
            >
              Learn more &rarr;
            </button>
          )}
        </div>
      </div>
    </>
  );
}
