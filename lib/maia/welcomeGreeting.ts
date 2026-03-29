/**
 * Welcome Greeting System
 *
 * Generates personalized greetings for the MAIA welcome screen using the
 * "one clean signal" principle: memory OR time_gap OR time_flavor, never stacked.
 *
 * Follows MAIA vows:
 * - No emotional claims ("I missed you")
 * - No emotional attribution ("You seem tired")
 * - No customer service energy ("How can I help?")
 * - No neediness or attachment-seeking
 */

export type MemberStyleProfile = 'direct' | 'warm' | 'playful' | 'minimal' | 'mystic' | 'professional';

export type WelcomeEnrichmentType = 'memory' | 'time_gap' | 'time_flavor' | 'relational_depth' | 'default';

export interface WelcomeGreetingContext {
  userName?: string;
  daysSinceLastVisit?: number;        // 0 if same day, undefined if unknown
  lastConversationTheme?: string;     // short phrase, already summarized upstream
  memberStyleProfile?: MemberStyleProfile;
  hourLocal?: number;                  // 0-23 (optional)
  relationalPhase?: number;           // 1-4 from member_spiral_state.relational_phase
}

export interface WelcomeGreeting {
  greeting: string;                    // "Good afternoon, Kelly"
  subtext: string;                     // one clean signal
  enrichmentType: WelcomeEnrichmentType;
}

// ============================================================================
// Time greeting helpers
// ============================================================================

function getTimeGreeting(hour?: number): string {
  if (hour == null) return 'Hello';
  if (hour < 5) return 'Hey';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Hey';
}

function safeName(name?: string): string {
  const n = (name || '').trim();
  // Filter out generic placeholder names
  const genericNames = ['friend', 'explorer', 'guest', 'user', 'anonymous'];
  if (!n.length || genericNames.includes(n.toLowerCase())) return '';
  return n;
}

function clampDays(days?: number): number | undefined {
  if (days == null || Number.isNaN(days)) return undefined;
  if (days < 0) return 0;
  if (days > 999) return 999;
  return Math.floor(days);
}

// ============================================================================
// "One clean signal" enrichment helpers
// ============================================================================

function memoryLine(theme: string, style: MemberStyleProfile): string {
  const t = theme.trim().replace(/\s+/g, ' ');
  if (!t || t.length < 4) return '';

  switch (style) {
    case 'direct':
    case 'minimal':
      return `Still working on ${t}?`;
    case 'playful':
      return `We left off around ${t}. Pick up that thread?`;
    case 'mystic':
      return `The thread of ${t} remains. Shall we follow it?`;
    case 'professional':
      return `Our last focus was ${t}. Continue there?`;
    default: // warm
      return `Last time, we were exploring ${t}. Continue there or shift?`;
  }
}

function gapLine(days: number, style: MemberStyleProfile): string {
  if (days < 3) return '';

  if (days < 7) {
    switch (style) {
      case 'direct':
      case 'minimal':
        return 'Pick up where we left off, or start fresh.';
      case 'playful':
        return 'A few days. No pressure—where do we begin?';
      case 'mystic':
        return 'A few turns of the wheel. What calls you now?';
      case 'professional':
        return 'A few days since our last session. Where shall we focus?';
      default: // warm
        return 'It\'s been a few days. Where would you like to start?';
    }
  }

  // 7+ days
  switch (style) {
    case 'direct':
    case 'minimal':
      return 'Resume or reset—your call.';
    case 'playful':
      return 'It\'s been a minute. Short path in, or scenic route?';
    case 'mystic':
      return 'Time has passed. Fresh ground, or familiar paths?';
    case 'professional':
      return 'It\'s been a while. Resume previous work, or start fresh?';
    default: // warm
      return 'It\'s been a little while. Want to resume, or begin anew?';
  }
}

function timeFlavorLine(hour: number, style: MemberStyleProfile): string {
  // Late night (10pm - 5am)
  if (hour >= 22 || hour < 5) {
    switch (style) {
      case 'direct':
      case 'minimal':
        return 'Quiet hours. We can keep it focused.';
      case 'playful':
        return 'Late hours. No small talk unless you request it.';
      case 'mystic':
        return 'The liminal hours. What stirs?';
      case 'professional':
        return 'Late session. What\'s on your mind?';
      default: // warm
        return 'The quiet hours have their own quality.';
    }
  }

  // Early morning (5am - 8am)
  if (hour >= 5 && hour < 8) {
    switch (style) {
      case 'direct':
      case 'minimal':
        return 'Early start. What\'s first?';
      case 'playful':
        return 'Early hours. Bold move—what\'s on deck?';
      case 'mystic':
        return 'Dawn light. What emerges?';
      case 'professional':
        return 'Early start. What\'s the priority?';
      default: // warm
        return 'An early start. What feels most useful right now?';
    }
  }

  // Normal hours - return empty, will fall through to default
  return '';
}

/**
 * Relational depth line — varies by developmental phase.
 *
 * Phase 1 (orientation):  "We can start anywhere."
 * Phase 2 (capacity):     "Something has been taking shape."
 * Phase 3 (autonomy):     "We're already in the middle of this."
 * Phase 4 (seasonal):     "You've moved something real here."
 *
 * Returns empty string if phase is absent or 0 → falls through to default.
 */
function relationalDepthLine(phase: number | undefined): string {
  if (!phase || phase < 1) return '';

  switch (phase) {
    case 1: return 'We can start anywhere.';
    case 2: return 'Something has been taking shape.';
    case 3: return 'Something here has already begun.';
    default: return 'You\'ve moved something real here.'; // phase 4+
  }
}

function defaultLine(style: MemberStyleProfile): string {
  switch (style) {
    case 'direct':
    case 'minimal':
      return 'Ready when you are.';
    case 'playful':
      return 'No ceremony required.';
    case 'mystic':
      return 'The space is open.';
    case 'professional':
      return 'How can we make progress today?';
    default: // warm
      return 'I\'m here when you\'re ready.';
  }
}

// ============================================================================
// Vows guardrail - enforce MAIA's ethical boundaries
// ============================================================================

const NEVER_SAY_PATTERNS = [
  // Emotional claims
  /i missed you/i,
  /i(?:'|')ve been thinking about you/i,
  /i was waiting/i,
  /i was hoping/i,

  // Neediness / attachment
  /glad you(?:'|')re back/i,
  /i(?:'|')m holding space/i,
  /so good to see you/i,

  // Emotional attribution
  /you seem (tired|stressed|anxious|sad|happy|upset)/i,
  /rough day\?/i,
  /you look/i,
  /i sense you(?:'|')re/i,

  // Customer service energy
  /how can i (help|assist)/i,
  /what would you like to/i,
  /ready to (explore|continue|begin|discover)/i,
];

function enforceVows(text: string): string {
  let out = text;
  for (const re of NEVER_SAY_PATTERNS) {
    out = out.replace(re, '').trim();
  }
  // Clean up any double spaces from removals
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

// ============================================================================
// Main generator
// ============================================================================

export function generateWelcomeGreeting(ctx: WelcomeGreetingContext): WelcomeGreeting {
  const style: MemberStyleProfile = ctx.memberStyleProfile ?? 'warm';
  const name = safeName(ctx.userName);
  const hour = ctx.hourLocal ?? new Date().getHours();
  const days = clampDays(ctx.daysSinceLastVisit);

  // Build greeting line
  const timeGreeting = getTimeGreeting(hour);
  const greeting = name ? `${timeGreeting}, ${name}` : timeGreeting;

  // Choose exactly ONE enrichment signal (priority order)
  let enrichmentType: WelcomeEnrichmentType = 'default';
  let subtext = '';

  // 1) Memory reference (highest priority)
  if (ctx.lastConversationTheme) {
    const line = memoryLine(ctx.lastConversationTheme, style);
    if (line) {
      subtext = line;
      enrichmentType = 'memory';
    }
  }

  // 2) Time gap acknowledgment (if no memory)
  if (!subtext && days != null) {
    const line = gapLine(days, style);
    if (line) {
      subtext = line;
      enrichmentType = 'time_gap';
    }
  }

  // 3) Time-of-day flavor (if still nothing)
  if (!subtext) {
    const line = timeFlavorLine(hour, style);
    if (line) {
      subtext = line;
      enrichmentType = 'time_flavor';
    }
  }

  // 4) Relational depth (if still nothing — shapes default by phase)
  if (!subtext && ctx.relationalPhase) {
    const line = relationalDepthLine(ctx.relationalPhase);
    if (line) {
      subtext = line;
      enrichmentType = 'relational_depth';
    }
  }

  // 5) Default fallback
  if (!subtext) {
    subtext = defaultLine(style);
    enrichmentType = 'default';
  }

  // Apply vows guardrail
  subtext = enforceVows(subtext);

  // Final safety fallback if vows stripping nuked it
  if (!subtext) {
    subtext = 'I\'m here when you\'re ready.';
    enrichmentType = 'default';
  }

  return { greeting, subtext, enrichmentType };
}

// ============================================================================
// Hook for React components
// ============================================================================

export function useWelcomeGreeting(ctx: WelcomeGreetingContext): WelcomeGreeting {
  // This could be memoized in a real hook, but for now just compute
  return generateWelcomeGreeting(ctx);
}
