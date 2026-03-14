'use client';

/**
 * FeatureTooltip - Contextual help for MAIA features
 *
 * Provides rich hover/tap tooltips for every interactive feature.
 * Designed to help testers and new users understand what each
 * button and feature does without leaving the interface.
 *
 * Desktop: hover to show (Radix Tooltip)
 * Mobile: tap to show, tap-away to dismiss (controlled open state)
 *
 * Uses Radix UI Tooltip primitives with MAIA's amber/gold design system.
 */

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────
// Pointer detection hook
// ─────────────────────────────────────────────────────────

function useIsCoarsePointer(): boolean {
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isCoarse;
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Guard against malformed, placeholder, or protocol-relative URLs in guideSection */
function isValidUrl(s: string): boolean {
  const raw = s?.trim();
  if (!raw || raw.startsWith('//')) return false;
  try {
    const url = new URL(raw, window.location.origin);
    // Relative internal routes — safe by definition
    if (url.origin === window.location.origin && url.pathname.startsWith('/')) return true;
    // Only allow https/http for external
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    // Allowlisted external hosts
    const host = url.hostname.toLowerCase();
    const allowed = ['youtube.com', 'www.youtube.com', 'youtu.be', 'soullab.life'];
    return allowed.includes(host) || host.endsWith('.soullab.life');
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// Feature Tooltip Content Map
// ─────────────────────────────────────────────────────────

export interface FeatureTooltipContent {
  /** Short name of the feature */
  label: string;
  /** One-line description of what it does */
  description: string;
  /** How to use it (1-2 lines) */
  howToUse: string;
  /** Optional keyboard/gesture hint */
  gesture?: string;
  /** Optional link to deeper guide */
  guideSection?: string;
}

/**
 * All feature tooltips for the MAIA interface.
 * Keyed by a stable feature ID used across mobile + desktop.
 */
export const FEATURE_TOOLTIPS: Record<string, FeatureTooltipContent> = {
  // ── Mode Buttons ──────────────────────────────────────
  'voice-text-toggle': {
    label: 'Voice / Text',
    description: 'Speak or type. Your choice.',
    howToUse: 'Tap to switch between microphone and text input.',
    gesture: 'Tap to toggle',
  },
  'mode-talk': {
    label: 'Talk',
    description: 'Open conversation. Ask anything, explore anything.',
    howToUse: 'Tap to enter Talk mode.',
    gesture: 'Tap',
  },
  'mode-care': {
    label: 'Care',
    description: 'Switch to Care when you want gentleness and steadiness.',
    howToUse: 'Tap to enter. Double-tap to choose a framework (Jungian, Somatic, IFS, DBT).',
    gesture: 'Double-tap for frameworks',
  },
  'mode-scribe': {
    label: 'Scribe',
    description: 'MAIA mirrors your insights back. For when you want to see your own thinking.',
    howToUse: 'Tap to enter. Double-tap to choose a lens (Jungian, Somatic, Archetypal, Narrative).',
    gesture: 'Double-tap for lenses',
  },

  // ── Action Buttons ────────────────────────────────────
  'capture': {
    label: 'Capture',
    description: 'Save the essence of what just happened.',
    howToUse: 'Tap after a meaningful moment. MAIA distills the key threads.',
    gesture: 'Tap',
  },
  'session-start': {
    label: 'Start Session',
    description: 'Begin focused work with a clear beginning.',
    howToUse: 'Tap to start. Choose a session type. End it when you\'re done for a summary.',
    gesture: 'Tap',
  },
  'session-end': {
    label: 'End Session',
    description: 'Close the container. MAIA reflects back what was explored.',
    howToUse: 'Tap to end your session and receive a summary.',
    gesture: 'Tap',
  },

  // ── Tool Buttons ──────────────────────────────────────
  'help': {
    label: 'Help',
    description: 'Guides for MAIA, voice features, and TestFlight.',
    howToUse: 'Tap to open.',
    gesture: 'Tap',
  },
  'journal': {
    label: 'Journal',
    description: 'Write something down. Dreams, reflections, raw thoughts.',
    howToUse: 'Tap to open. Write freely. Optionally share with MAIA.',
    gesture: 'Tap',
  },
  'guide': {
    label: 'Guide',
    description: 'Full walkthrough of everything you can do here.',
    howToUse: 'Tap to open.',
    gesture: 'Tap',
  },
  'shadow-work': {
    label: 'Shadow Work',
    description: 'Prompts for meeting what you\'ve disowned. Honest work.',
    howToUse: 'Tap to open. Answer what comes. Responses are saved for later.',
    gesture: 'Tap',
  },
  'feedback': {
    label: 'Feedback',
    description: 'Tell us what\'s working and what isn\'t.',
    howToUse: 'Tap to open. Goes directly to the team.',
    gesture: 'Tap',
  },
  'account': {
    label: 'Account',
    description: 'Community, tools, studios, settings, membership.',
    howToUse: 'Tap to open. Everything else lives here.',
    gesture: 'Tap',
  },

  // ── Settings & Features ───────────────────────────────
  'sanctuary-mode': {
    label: 'Sanctuary',
    description: 'This session won\'t be remembered. Speak freely.',
    howToUse: 'Toggle ON. Nothing from this session can be saved or recalled. Ever.',
    gesture: 'Toggle',
  },
  'voice-settings': {
    label: 'Voice',
    description: 'Choose how MAIA sounds when she speaks to you.',
    howToUse: 'Pick a voice. Adjust speed to your preference.',
    gesture: 'Tap to configure',
  },
  'memory-control': {
    label: 'Memory',
    description: 'How much MAIA holds between conversations.',
    howToUse: 'Minimal = basic facts. Moderate = patterns. Deep = full integration.',
    gesture: 'Tap to adjust',
  },
  'archetype-selector': {
    label: 'Presence',
    description: 'How MAIA relates to you. Friend, guide, mentor, lab partner.',
    howToUse: 'Choose what feels right. Auto lets MAIA adapt.',
    gesture: 'Tap to choose',
  },
  'conversation-style': {
    label: 'Style',
    description: 'How MAIA speaks. Natural, reflective, or adaptive.',
    howToUse: 'Pick the style that helps you be most honest.',
    gesture: 'Tap to choose',
  },
  'streaming-voice': {
    label: 'Streaming Voice',
    description: 'MAIA speaks sentence by sentence instead of waiting for the full response.',
    howToUse: 'Toggle ON for a more natural conversational flow.',
    gesture: 'Toggle',
  },
  'interrupt-mode': {
    label: 'Interruption',
    description: 'Speak to cut in while MAIA is talking. Like a real conversation.',
    howToUse: 'Toggle ON. Adjust sensitivity if needed.',
    gesture: 'Toggle',
  },
  'range-of-effect': {
    label: 'Range of Effect',
    description: 'How much ceremony MAIA carries in her voice.',
    howToUse: '0 = neutral. 4 = full depth. Start at 1 and adjust.',
    gesture: 'Drag',
  },
  'wisdom-dashboard': {
    label: 'Wisdom Journey',
    description: 'Patterns emerging from your conversations over time.',
    howToUse: 'Appears on the side. Threads of meaning from your sessions.',
    gesture: 'Appears automatically',
  },

  // ── Community & Tools ─────────────────────────────────
  'community-commons': {
    label: 'Commons',
    description: 'The shared field. Other members, resources, events.',
    howToUse: 'Open from Account Menu.',
    gesture: 'Via Account',
  },
  'labtools': {
    label: 'LabTools',
    description: 'Journal, reflections, analytics, alchemy, and more.',
    howToUse: 'Open from Account Menu.',
    gesture: 'Via Account',
  },
  'soullab-studios': {
    label: 'Studios',
    description: 'For practitioners. Clients, sessions, documentation.',
    howToUse: 'Open from Account Menu.',
    gesture: 'Via Account',
  },
  'sustaining-circle': {
    label: 'Sustaining Circle',
    description: 'Support the infrastructure. No data monetization, ever.',
    howToUse: 'Choose your amount. See exactly where it goes.',
    gesture: 'Via Account',
  },
  'seva-exchange': {
    label: 'Seva Exchange',
    description: 'Contribute skills and time in service to the community.',
    howToUse: 'Choose from available pathways.',
    gesture: 'Via Account',
  },

  // ── Academy & Learning ────────────────────────────────
  'academy': {
    label: 'Academy',
    description: 'Structured paths for deepening your practice.',
    howToUse: 'Browse domains and bookmark what resonates.',
    gesture: 'Via LabTools',
  },
};

// ─────────────────────────────────────────────────────────
// Shared tooltip content renderer
// ─────────────────────────────────────────────────────────

function TooltipBody({ content, isMobile }: { content: FeatureTooltipContent; isMobile?: boolean }) {
  return (
    <>
      {/* Header */}
      <div className="px-3.5 pt-3 pb-1.5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
        <span className="text-xs font-medium text-amber-300/90 tracking-wide">
          {content.label}
        </span>
      </div>

      {/* Description */}
      <div className="px-3.5 pb-2">
        <p className="text-[11px] leading-relaxed text-stone-300/90 font-light">
          {content.description}
        </p>
      </div>

      {/* How to use */}
      <div className="px-3.5 pb-2.5 border-t border-stone-800/60 pt-2">
        <p className="text-[10px] leading-relaxed text-stone-400/80 font-light">
          {content.howToUse}
        </p>
      </div>

      {/* Gesture hint + Learn more */}
      <div className="px-3.5 pb-2.5 flex items-center justify-between">
        {content.gesture && (
          <span className="text-[9px] text-amber-500/60 font-light opacity-60">
            {isMobile ? 'Tap' : content.gesture}
          </span>
        )}
        {content.guideSection && isValidUrl(content.guideSection) && (
          <a
            href={content.guideSection}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-amber-400/50 hover:text-amber-400/80 font-light transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more
          </a>
        )}
      </div>
    </>
  );
}

const TOOLTIP_CONTENT_CLASS = cn(
  'z-[100] max-w-[280px] rounded-xl overflow-hidden',
  'bg-gradient-to-b from-stone-900/98 to-stone-950/98',
  'border border-amber-500/20',
  'shadow-lg shadow-black/40',
  'backdrop-blur-xl',
  // Radix animations
  'animate-in fade-in-0 zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2',
  'data-[side=left]:slide-in-from-right-2',
  'data-[side=right]:slide-in-from-left-2',
  'data-[side=top]:slide-in-from-bottom-2',
);

// ─────────────────────────────────────────────────────────
// FeatureTooltip Component
// ─────────────────────────────────────────────────────────

interface FeatureTooltipProps {
  /** The feature ID from FEATURE_TOOLTIPS map */
  featureId: string;
  /** The button/element to wrap */
  children: React.ReactNode;
  /** Which side to show the tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional offset from the trigger */
  sideOffset?: number;
  /** Alignment along the side */
  align?: 'start' | 'center' | 'end';
  /** Delay before showing (ms) — desktop only */
  delayDuration?: number;
  /** Additional className for the wrapper */
  className?: string;
}

export function FeatureTooltip({
  featureId,
  children,
  side = 'bottom',
  sideOffset = 8,
  align = 'center',
  delayDuration = 400,
  className,
}: FeatureTooltipProps) {
  const content = FEATURE_TOOLTIPS[featureId];
  const isCoarse = useIsCoarsePointer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  // Clear any surviving timer on unmount (prevents phantom opens)
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
  }, []);

  // If no content found, just render children
  if (!content) {
    return <>{children}</>;
  }

  // ── Mobile: controlled open/close on tap ──────────────
  if (isCoarse) {
    return (
      <TooltipPrimitive.Root
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        delayDuration={0}
      >
        <TooltipPrimitive.Trigger asChild>
          <span
            className={cn('inline-flex', className)}
            onPointerDown={(e) => {
              // Long-press (>350ms) to show tooltip
              // Cancel if finger moves >10px or page scrolls (prevents fight with scroll)
              const startX = e.clientX;
              const startY = e.clientY;
              const startScroll = window.scrollY;
              const MOVE_THRESHOLD = 10;

              // Clear any previous timer (rapid successive taps)
              if (longPressTimer.current) {
                window.clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
              }

              const timer = window.setTimeout(() => {
                longPressTimer.current = null;
                setMobileOpen((prev) => !prev);
                cleanup();
              }, 350);
              longPressTimer.current = timer;

              const cancel = () => {
                if (longPressTimer.current) {
                  window.clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
                cleanup();
              };

              const onMove = (me: PointerEvent) => {
                const dx = Math.abs(me.clientX - startX);
                const dy = Math.abs(me.clientY - startY);
                const scrolled = Math.abs(window.scrollY - startScroll) > 2;
                if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD || scrolled) cancel();
              };

              const cleanup = () => {
                e.currentTarget?.removeEventListener('pointermove', onMove as EventListener);
                e.currentTarget?.removeEventListener('pointerup', cancel);
                e.currentTarget?.removeEventListener('pointercancel', cancel);
              };

              e.currentTarget.addEventListener('pointerup', cancel, { once: true });
              e.currentTarget.addEventListener('pointermove', onMove as EventListener);
              e.currentTarget.addEventListener('pointercancel', cancel, { once: true });
            }}
          >
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align={align}
            className={TOOLTIP_CONTENT_CLASS}
            onPointerDownOutside={() => setMobileOpen(false)}
          >
            <TooltipBody content={content} isMobile />
            <TooltipPrimitive.Arrow className="fill-stone-900/95" width={12} height={6} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }

  // ── Desktop: standard hover behavior ──────────────────
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        <span className={cn('inline-flex', className)}>
          {children}
        </span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          align={align}
          className={TOOLTIP_CONTENT_CLASS}
        >
          <TooltipBody content={content} />
          <TooltipPrimitive.Arrow className="fill-stone-900/95" width={12} height={6} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

// ─────────────────────────────────────────────────────────
// FeatureTooltipProvider - Wrap at layout level
// ─────────────────────────────────────────────────────────

interface FeatureTooltipProviderProps {
  children: React.ReactNode;
  /** Global delay before any tooltip shows (ms) */
  delayDuration?: number;
  /** How quickly tooltips open when moving between triggers */
  skipDelayDuration?: number;
}

export function FeatureTooltipProvider({
  children,
  delayDuration = 400,
  skipDelayDuration = 150,
}: FeatureTooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

// ─────────────────────────────────────────────────────────
// InfoBubble - Standalone info icon with tooltip
// For use in settings panels, sheets, etc.
// ─────────────────────────────────────────────────────────

interface InfoBubbleProps {
  /** The feature ID from FEATURE_TOOLTIPS */
  featureId?: string;
  /** Custom content (overrides featureId lookup) */
  content?: {
    label: string;
    description: string;
  };
  /** Size of the info icon */
  size?: 'sm' | 'md';
  /** Tooltip side */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoBubble({
  featureId,
  content: customContent,
  size = 'sm',
  side = 'top',
}: InfoBubbleProps) {
  const tooltipContent = customContent || (featureId ? FEATURE_TOOLTIPS[featureId] : null);
  const isCoarse = useIsCoarsePointer();
  const [open, setOpen] = useState(false);

  if (!tooltipContent) return null;

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const buttonSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <TooltipPrimitive.Root
      open={isCoarse ? open : undefined}
      onOpenChange={isCoarse ? setOpen : undefined}
      delayDuration={isCoarse ? 0 : 200}
    >
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'text-amber-500/40 hover:text-amber-500/70 transition-colors',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/30',
            buttonSize,
          )}
          aria-label={`Info about ${tooltipContent.label}`}
          onClick={isCoarse ? () => setOpen((p) => !p) : undefined}
        >
          <Info className={iconSize} />
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-[100] max-w-[240px] rounded-lg overflow-hidden',
            'bg-stone-900/95 border border-amber-500/15',
            'shadow-lg shadow-black/30 backdrop-blur-xl',
            'px-3 py-2.5',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2',
          )}
          onPointerDownOutside={isCoarse ? () => setOpen(false) : undefined}
        >
          <p className="text-[11px] font-medium text-amber-300/80 mb-1">
            {tooltipContent.label}
          </p>
          <p className="text-[10px] leading-relaxed text-stone-400/80 font-light">
            {tooltipContent.description}
          </p>
          <TooltipPrimitive.Arrow
            className="fill-stone-900/95"
            width={10}
            height={5}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
