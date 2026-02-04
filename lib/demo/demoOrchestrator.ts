/**
 * Demo Orchestrator
 *
 * Coordinates MAIA's spoken manifesto with UI triggers for demos.
 * Fires custom events that OracleConversation listens to, triggering
 * Capture and Breakthrough popups at precise moments during speech.
 *
 * @see docs/canon/MAIA_SPOKEN_MANIFESTO.md
 */

export type DemoUIEvent =
  | 'demo:show-capture'
  | 'demo:show-breakthrough'
  | 'demo:show-pattern-offering'
  | 'demo:hide-all'
  | 'demo:pulse-holoflower';

export interface DemoManifestoCue {
  /** Timestamp in seconds from start of speech */
  timestampSeconds: number;
  /** Event to fire */
  event: DemoUIEvent;
  /** Optional data payload */
  data?: Record<string, unknown>;
  /** Description for debugging */
  description: string;
}

/**
 * Cues for the AI Entrepreneur / Investor Version manifesto
 * These timestamps should be calibrated to actual TTS timing
 */
export const INVESTOR_MANIFESTO_CUES: DemoManifestoCue[] = [
  {
    timestampSeconds: 0,
    event: 'demo:hide-all',
    description: 'Clear any existing popups at start',
  },
  {
    // "What I remember most clearly is not everything you've said —
    //  but what you marked as important."
    timestampSeconds: 75, // ~1:15 into the speech
    event: 'demo:show-capture',
    data: {
      previewMode: true,
      sampleContent: 'A decision I made about how to approach this project...',
    },
    description: 'Show Capture panel when discussing "what you marked as important"',
  },
  {
    // "Your decisions. Your turning points."
    timestampSeconds: 82,
    event: 'demo:pulse-holoflower',
    description: 'Pulse the holoflower during "Your decisions. Your turning points."',
  },
  {
    // "I do recognize patterns — often ones you cannot yet see."
    timestampSeconds: 48, // Earlier in speech
    event: 'demo:show-pattern-offering',
    data: {
      pattern: 'The word "permission" keeps showing up when you talk about creative work.',
      confidence: 0.65,
    },
    description: 'Show pattern offering when discussing pattern recognition',
  },
  {
    // "This architecture changes trust."
    timestampSeconds: 95,
    event: 'demo:hide-all',
    description: 'Clear popups before the closing section',
  },
  {
    // "Because an intelligence that cannot quietly colonize meaning..."
    timestampSeconds: 100,
    event: 'demo:show-breakthrough',
    data: {
      score: 75,
      message: 'This conversation feels significant. Want to capture the essence?',
    },
    description: 'Show breakthrough suggestion during the climactic statement',
  },
];

/**
 * Cues for the 45-second distilled version
 */
export const DISTILLED_45S_CUES: DemoManifestoCue[] = [
  {
    timestampSeconds: 0,
    event: 'demo:hide-all',
    description: 'Clear at start',
  },
  {
    // "I remember what you marked as important—"
    timestampSeconds: 8,
    event: 'demo:show-capture',
    data: { previewMode: true },
    description: 'Flash capture panel',
  },
  {
    // "I notice patterns you may not yet see."
    timestampSeconds: 15,
    event: 'demo:show-pattern-offering',
    data: {
      pattern: 'Something I\'m noticing across our conversations...',
      confidence: 0.5,
    },
    description: 'Show pattern offering',
  },
  {
    timestampSeconds: 25,
    event: 'demo:hide-all',
    description: 'Clear before closing',
  },
];

/**
 * Fire a demo UI event
 */
export function fireDemoEvent(event: DemoUIEvent, data?: Record<string, unknown>): void {
  const customEvent = new CustomEvent(event, { detail: data });
  window.dispatchEvent(customEvent);
  console.log(`🎬 [Demo] Fired event: ${event}`, data);
}

/**
 * Schedule all cues for a manifesto
 */
export function scheduleManifestoCues(
  cues: DemoManifestoCue[],
  startTime: number = Date.now()
): { cancel: () => void } {
  const timeouts: NodeJS.Timeout[] = [];

  for (const cue of cues) {
    const delay = cue.timestampSeconds * 1000;
    const timeout = setTimeout(() => {
      console.log(`🎬 [Demo] Cue at ${cue.timestampSeconds}s: ${cue.description}`);
      fireDemoEvent(cue.event, cue.data);
    }, delay);
    timeouts.push(timeout);
  }

  return {
    cancel: () => {
      for (const t of timeouts) clearTimeout(t);
      fireDemoEvent('demo:hide-all');
      console.log('🎬 [Demo] All cues cancelled');
    },
  };
}

/**
 * Start the investor manifesto demo sequence
 */
export function startInvestorDemo(): { cancel: () => void } {
  console.log('🎬 [Demo] Starting investor manifesto demo sequence');
  return scheduleManifestoCues(INVESTOR_MANIFESTO_CUES);
}

/**
 * Start the 45-second distilled demo sequence
 */
export function start45SecondDemo(): { cancel: () => void } {
  console.log('🎬 [Demo] Starting 45-second distilled demo sequence');
  return scheduleManifestoCues(DISTILLED_45S_CUES);
}

/**
 * Manual trigger functions for live demos
 * Use these when timing needs to be human-controlled
 */
export const demoTriggers = {
  showCapture: (data?: Record<string, unknown>) => fireDemoEvent('demo:show-capture', data),
  showBreakthrough: (data?: Record<string, unknown>) => fireDemoEvent('demo:show-breakthrough', data),
  showPattern: (data?: Record<string, unknown>) => fireDemoEvent('demo:show-pattern-offering', data),
  hideAll: () => fireDemoEvent('demo:hide-all'),
  pulseHoloflower: () => fireDemoEvent('demo:pulse-holoflower'),
};

/**
 * Hook for demo mode detection
 * Checks URL params or localStorage
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') return true;
  if (urlParams.get('mark') === 'true') return true;

  return localStorage.getItem('maia_demo_mode') === 'true';
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
  localStorage.setItem('maia_demo_mode', 'true');
  console.log('🎬 [Demo] Demo mode enabled');
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
  localStorage.removeItem('maia_demo_mode');
  console.log('🎬 [Demo] Demo mode disabled');
}
