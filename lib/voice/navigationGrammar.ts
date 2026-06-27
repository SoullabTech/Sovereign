/**
 * Navigation Grammar — pure, deterministic parser for explicit navigation commands.
 *
 * This is the EXPLICIT-COMMAND path: the member types a clear instruction into the
 * text bar ("open journal", "go to relationships", "switch to astrology") and we
 * resolve it BEFORE the message ever reaches the LLM. No model is consulted — the
 * grammar is deterministic, transparent, and predictable. This is the sovereign
 * choice: the member says where to go; the system does not infer or steer.
 *
 * Deliberate boundaries (see docs to be written after this prototype settles):
 *   - Sanctuary is NOT a destination here. "enter/exit sanctuary" is a *mode toggle*
 *     already owned by VoiceCommandDetector (MODE_PATTERNS). We DEFER reserved
 *     mode/lens/style words so those keep working untouched.
 *   - Emotional / inferred content is NEVER auto-switched. A bare destination word
 *     ("journal") does nothing; an emotional sentence ("I want to talk about my
 *     marriage") flows straight to MAIA as conversation. At most a STRONG navigation
 *     verb with a single unknown object asks for clarification — it never acts.
 *
 * This module imports nothing from the app, so the grammar can be unit-tested in
 * isolation. Destinations are injected by the caller (see navigationCommands.ts,
 * which reuses the canonical maiaNav registry).
 */

export interface NavDestination {
  /** Stable id (matches maiaNav world id where applicable). */
  id: string;
  /** Human-facing label, used in confirmations. */
  label: string;
  /** maiaNav world id when this is an in-shell world; null for route-only targets. */
  worldId: string | null;
  /** Canonical route the shell navigates to. */
  route: string;
  /** Normalized, lowercase phrases that resolve to this destination. */
  aliases: string[];
}

export type NavigationCommand =
  | { kind: 'navigate'; destination: NavDestination; command: string }
  /** Sanctuary is a MODE TOGGLE, never a route. enable=true turns it on. */
  | { kind: 'sanctuary'; enable: boolean; command: string }
  /** A navigation was clearly intended but the destination is unknown — ask, don't act. */
  | { kind: 'ambiguous'; command: string }
  /** Not a navigation command — caller should continue normal handling. */
  | { kind: 'none' };

/**
 * STRONG verbs unmistakably mean "take me somewhere". If the object is a single
 * unknown word we ASK rather than send it to MAIA.
 */
const STRONG_VERBS = [
  'take me back to',
  'take me to',
  'bring me to',
  'go back to',
  'navigate to',
  'switch to',
  'jump to',
  'move to',
  'go to',
];

/**
 * WEAK verbs only navigate on a CONFIDENT destination match. On anything else they
 * fall through to conversation, so "open up to me" / "show me you care" are never
 * hijacked. (Order matters: 'open up' is listed before 'open'.)
 */
const WEAK_VERBS = ['open up', 'open', 'show me', 'bring up', 'pull up', 'enter', 'see'];

/**
 * Words owned by the existing mode/lens/style command system (VoiceCommandDetector).
 * We DEFER these so "switch to care", "go to deep mode" keep routing to that system
 * instead of being treated as navigation. ("sanctuary" is handled directly below as a
 * mode toggle, so it is intentionally NOT in this set.)
 */
const RESERVED = new Set([
  'talk', 'care', 'counsel', 'scribe', 'note',
  'jungian', 'cbt', 'somatic', 'ifs', 'relational', 'humanistic',
  'existential', 'hemispheric', 'mcgilchrist', 'alchemical', 'alchemy',
  'archetypal', 'tcm', 'auto', 'default', 'spiralogic',
  'classic', 'walking', 'walk', 'adaptive', 'companion', 'conversation', 'deep',
]);

/**
 * Sanctuary is a MODE TOGGLE, not a destination. We recognize the toggle here (so
 * "open sanctuary", which the existing mode patterns miss, works) and the caller
 * flips isSanctuary — it never routes anywhere.
 */
const SANCTUARY_ENABLE =
  /^(?:(?:open|enter|enable|activate|start|turn on|go to|switch to)\s+sanctuary(?:\s+mode)?|sanctuary\s+mode)$/;
const SANCTUARY_DISABLE =
  /^(?:exit|leave|disable|close|end|stop|turn off)\s+sanctuary(?:\s+mode)?$/;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip filler around the destination object: leading articles, trailing nouns. */
function normalizeObject(s: string): string {
  return normalize(s)
    .replace(/^(the|my|a|to|our)\s+/i, '')
    .replace(/\s+(page|section|view|screen|tab|now|please)$/i, '')
    .trim();
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-phrase (word-boundary) containment, so "journal" never matches "journaling". */
function containsPhrase(haystack: string, needle: string): boolean {
  return new RegExp(`(^|\\s)${escapeRe(needle)}(\\s|$)`).test(haystack);
}

/**
 * Parse an explicit navigation command from typed text.
 * Pure: destinations are injected so this is fully testable in isolation.
 */
export function matchNavigation(input: string, destinations: NavDestination[]): NavigationCommand {
  const text = normalize(input);
  if (!text) return { kind: 'none' };

  // 0. Sanctuary toggle (mode, not route) — checked before navigation parsing.
  if (SANCTUARY_ENABLE.test(text)) return { kind: 'sanctuary', enable: true, command: input };
  if (SANCTUARY_DISABLE.test(text)) return { kind: 'sanctuary', enable: false, command: input };

  // 1. Find a leading verb phrase (longest match first so "take me to" beats "to").
  const verbs = [...STRONG_VERBS, ...WEAK_VERBS].sort((a, b) => b.length - a.length);
  let matchedVerb: string | null = null;
  let strong = false;
  for (const v of verbs) {
    if (text === v || text.startsWith(v + ' ')) {
      matchedVerb = v;
      strong = STRONG_VERBS.includes(v);
      break;
    }
  }
  if (!matchedVerb) return { kind: 'none' };

  const object = normalizeObject(text.slice(matchedVerb.length));

  // 2. Empty object after a verb. Strong verb → ask ("go to ...?"); weak → ignore.
  if (!object) return strong ? { kind: 'ambiguous', command: input } : { kind: 'none' };

  // 3. Defer mode/lens/style words to the existing command system.
  if (RESERVED.has(object) || RESERVED.has(object.split(' ')[0]) || /\bmode$/.test(object)) {
    return { kind: 'none' };
  }

  // 4. Confident destination match: exact alias or alias as a whole phrase.
  for (const dest of destinations) {
    for (const alias of dest.aliases) {
      if (object === alias || containsPhrase(object, alias)) {
        return { kind: 'navigate', destination: dest, command: input };
      }
    }
  }

  // 5. Unknown object. A STRONG verb + a single unknown word → ask (never act, never
  //    send to MAIA). Anything longer is left as conversation, protecting expression
  //    like "take me to a calmer place".
  if (strong && object.split(' ').length === 1) return { kind: 'ambiguous', command: input };
  return { kind: 'none' };
}
