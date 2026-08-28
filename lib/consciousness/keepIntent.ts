// lib/consciousness/keepIntent.ts
// KEEP-INTENT-01 — Keep intent recognition. Deterministic phrase matching.
// No model calls. No side effects. No persistence.
//
// ═══════════════════════════════════════════════════════════════════════════
// KEEP AUTHORITY CONTRACT (Kelly ruling 2026-08-28)
//
//   UNDERSTAND   MAIA understands the member is expressing Keep intent.
//   FACILITATE   The House may surface / open the member-controlled Keep gesture.
//   COMMIT       Only the member's own confirmation may persist the material.
//
// Recognition must never silently collapse into commitment. This module only
// answers "did the member express Keep intent, and of what kind" — it opens
// nothing, writes nothing, and knows nothing about Sanctuary. Callers own that.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY THIS EXISTS SEPARATELY FROM detectJournalCommand():
// That detector CONSUMES the member's utterance — when it matches, the message
// never reaches MAIA and she goes silent. "Can we keep this?" is relational
// speech addressed to her. The interface must not turn her mute because it
// recognized an affordance. So Keep intent is recognized on a path that leaves
// the conversational turn intact, and the affordance is surfaced alongside the
// reply rather than in place of it.

export type KeepIntentKind =
  /** "keep this", "mark this moment" — the member wants to hold onto material. */
  | 'keep_material'
  /** "open Keep", "MAIA, open the Keep function" — an explicit House command. */
  | 'open_keep';

export interface KeepIntentResult {
  kind: KeepIntentKind | null;
  /** The phrase that matched, for logging and for explaining the recognition. */
  matched: string | null;
}

const NONE: KeepIntentResult = { kind: null, matched: null };

/**
 * Explicit commands to open the Keep surface. These name Keep as a thing to be
 * opened, so they are unambiguous in a way "keep this" is not.
 */
const OPEN_KEEP_PHRASES = [
  'open keep',
  'open the keep',
  'open up keep',
  'bring up keep',
  'show me keep',
  'show keep',
  'keep function',
  'keep panel',
  'i want to keep something',
  'i want to keep some things',
  'i would like to keep something',
  "i'd like to keep something",
];

/**
 * The member wants to hold onto what just passed. Every phrase here anchors the
 * keep-verb to a deictic object ("this", "that moment") — that anchoring is what
 * separates "keep this" from "keep going".
 *
 * Deliberately NOT included: 'capture this', 'record this', 'save this
 * conversation', 'journal this'. Those already trigger detectJournalCommand(),
 * which returns before MAIA responds — listing them here would be a lie, since
 * this recognizer never runs for them. Unifying those paths is KEEP-INTENT-02
 * work, not this cut's.
 */
const KEEP_MATERIAL_PHRASES = [
  'keep this',
  'keep that moment',
  'keep this moment',
  'keeping this',
  'mark this',
  'mark that moment',
  'remember this moment',
  'remember this exchange',
  'remember this part',
  'save this moment',
  'save this part',
  'hold onto this',
  'hold on to this',
  'bookmark this',
];

/**
 * Constructions that contain a positive phrase but are not Keep intent. These
 * are checked against the MATCHED REGION, not the whole message: a member who
 * says "keep going — actually, can we keep this?" means both things, and the
 * second one is a real request.
 *
 * Ordinary uses of "keep" that contain no deictic object ("keep going", "keep
 * talking", "keep the door open", "what keeps happening") never match a positive
 * phrase in the first place and need no guard here.
 */
const FALSE_FRIENDS = [
  'keep this up',
  'keep this going',
  'keep that up',
  'keep that going',
  'keep this in mind',
  'keep that in mind',
  'keep this door open',
  'keep this to yourself',
  'keep this between us',
  'keep this brief',
  'keep this short',
  'keep this simple',
  'mark this as read',
];

/** Normalize for matching: lowercase, collapse whitespace, strip curly quotes. */
function normalize(message: string): string {
  return message
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Does `phrase` occur at `index` only as part of a false-friend construction?
 * A message can contain the same phrase twice; one guarded occurrence does not
 * disqualify an unguarded one.
 */
function everyOccurrenceIsFalseFriend(text: string, phrase: string): boolean {
  const occurrences: number[] = [];
  let at = text.indexOf(phrase);
  while (at !== -1) {
    occurrences.push(at);
    at = text.indexOf(phrase, at + 1);
  }
  if (occurrences.length === 0) return true;

  return occurrences.every((start) =>
    FALSE_FRIENDS.some((ff) => {
      const ffAt = text.indexOf(ff);
      if (ffAt === -1) return false;
      // The occurrence sits inside a false-friend span.
      let cursor = ffAt;
      while (cursor !== -1) {
        if (start >= cursor && start < cursor + ff.length) return true;
        cursor = text.indexOf(ff, cursor + 1);
      }
      return false;
    }),
  );
}

function findPhrase(text: string, phrases: string[]): string | null {
  // Longest first, so "keep this moment" reports itself rather than "keep this".
  const ordered = [...phrases].sort((a, b) => b.length - a.length);
  for (const phrase of ordered) {
    if (!text.includes(phrase)) continue;
    if (everyOccurrenceIsFalseFriend(text, phrase)) continue;
    return phrase;
  }
  return null;
}

/**
 * Recognize Keep intent in a member utterance.
 *
 * Returns what the member expressed, nothing more. It does not open Keep, does
 * not decide whether Keep is available (Sanctuary is the caller's to enforce),
 * and does not imply anything was kept.
 *
 * Unlike detectIntent() in intentRouter.ts, there is no minimum length and no
 * question-mark suppression: "Can we keep this?" is an explicit request, not
 * ambient signal to be read off the field, and a question mark is how members
 * politely ask for things.
 */
export function detectKeepIntent(message: string): KeepIntentResult {
  if (!message) return NONE;
  const text = normalize(message);

  // Explicit House command wins — it is the less ambiguous reading, and it asks
  // for the surface rather than for this particular material.
  const open = findPhrase(text, OPEN_KEEP_PHRASES);
  if (open) return { kind: 'open_keep', matched: open };

  const material = findPhrase(text, KEEP_MATERIAL_PHRASES);
  if (material) return { kind: 'keep_material', matched: material };

  return NONE;
}
