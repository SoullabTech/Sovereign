/**
 * Keep-this intent interpreter — the constitutional seam of the Personal Wisdom Library.
 *
 * This module is the boundary between two worlds:
 *
 *     Member's world                      │  System's world
 *     (natural human expression)          │  (deterministic representation)
 *     "Keep this" · "Reflect with me"     │  { scope, visibility, usageAuthority, lifecycle }
 *                                         │
 *          intent  ──▶  interpretKeepIntent()  ──▶  GovernedIntent
 *
 * Design contract (docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md §0;
 * candidate `project_intent_over_axes_candidate`):
 *   1. The seam stays SMALL. This module knows nothing about retrieval, embeddings,
 *      prompt assembly, the database, or the member's identity. It only maps a member
 *      intent to a governed-state object. (Enforced by a no-imports test.)
 *   2. The seam is DETERMINISTIC. An intent that does not resolve to exactly one
 *      governed state is REJECTED — it must never guess (UnresolvedIntentError).
 *   3. Member labels live only above the seam; governed enums live only below it.
 *
 * Above the seam (member-facing labels) is PROVISIONAL ("member language is evidence;
 * platform language is hypothesis", architecture §6A). Below the seam (the enums) is
 * stable. Changing a label is a one-line edit to USAGE_LABEL_TO_AUTHORITY and touches
 * nothing downstream — that decoupling is the whole point.
 */

// ─── Below the seam: governed enums (stable; mirror the schema in impl spec §3) ───

export type MemberIntentVerb = 'keep'; // v1. Future: 'practice' | 'question' | 'share' | 'let_go'

export type UsageAuthority = 'store_only' | 'only_when_i_ask' | 'reflect_with_me' | 'use_in_guidance';
export type Scope = 'platform' | 'practitioner' | 'member';
export type Visibility = 'private' | 'shared' | 'published';
export type LifecycleState = 'kept' | 'curated' | 'trusted' | 'active' | 'retired';
export type SourceType =
  | 'conversation' | 'transcript' | 'manual' | 'book' | 'paper'
  | 'workshop' | 'personal_insight' | 'clinical' | 'tradition';

/** Usage authority as a monotonic ladder of MAIA's initiative, low → high (architecture §4). */
export const USAGE_AUTHORITY_LADDER: readonly UsageAuthority[] = [
  'store_only',       // never used, even on request — a private vault
  'only_when_i_ask',  // reactive — explicit invocation only
  'reflect_with_me',          // proactive mirror, non-directive
  'use_in_guidance',  // proactive, directive-eligible
] as const;

/** The default sits at the low end. Invariant: no kept item is guidance-authoritative by default. */
export const DEFAULT_USAGE_AUTHORITY: UsageAuthority = 'only_when_i_ask';

// ─── Above the seam: provisional member-facing labels (architecture §6A — hypothesis, not canon) ───

export type UsageChoiceLabel = 'Store only' | 'Only when I ask' | 'Reflect with me' | 'Use in guidance';

/**
 * The translation that IS the seam. PROVISIONAL: architecture §6A currently shows an
 * alternative wording ("Remember only … Don't use unless I ask"). Reconciling the member
 * labels is a one-line change here and touches nothing below the seam — by design.
 */
export const USAGE_LABEL_TO_AUTHORITY: Readonly<Record<UsageChoiceLabel, UsageAuthority>> = {
  'Store only': 'store_only',
  'Only when I ask': 'only_when_i_ask',
  'Reflect with me': 'reflect_with_me',
  'Use in guidance': 'use_in_guidance',
};

// ─── The governed intent object (the seam's output; downstream consumes only this) ───

export interface GovernedIntent {
  memberIntent: MemberIntentVerb;
  scope: Scope;
  visibility: Visibility;
  usageAuthority: UsageAuthority;
  lifecycle: LifecycleState;
  source: SourceType;
}

export interface KeepInput {
  /** The member's act. v1 deterministically resolves only 'keep'. */
  intent: MemberIntentVerb;
  /** Answer to "How should MAIA use this?" — a member-facing label or the governed enum. Omitted → low default. */
  usage?: UsageChoiceLabel | UsageAuthority;
  /** Where the material came from (set by the entry path, never guessed). */
  source: SourceType;
}

export class UnresolvedIntentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnresolvedIntentError';
  }
}

const USAGE_AUTHORITY_SET: ReadonlySet<string> = new Set<string>(USAGE_AUTHORITY_LADDER);

function resolveUsageAuthority(usage: KeepInput['usage']): UsageAuthority {
  if (usage == null) return DEFAULT_USAGE_AUTHORITY;
  // Accept the governed enum directly (API/UI may send it) …
  if (USAGE_AUTHORITY_SET.has(usage)) return usage as UsageAuthority;
  // … or a member-facing label.
  const mapped = (USAGE_LABEL_TO_AUTHORITY as Record<string, UsageAuthority>)[usage];
  if (!mapped) {
    // Falsifier #1, in code: never guess authority. An unrecognized choice is rejected,
    // never silently widened toward guidance.
    throw new UnresolvedIntentError(`Unrecognized usage choice "${usage}"; refusing to guess authority.`);
  }
  return mapped;
}

/**
 * Map a member's "Keep this" intent to its governed state.
 * Pure and total over its declared input; rejects anything it cannot resolve deterministically.
 */
export function interpretKeepIntent(input: KeepInput): GovernedIntent {
  if (input.intent !== 'keep') {
    // v1 resolves only 'keep'. Other intents (practice/question/share/let_go) do not yet have a
    // single deterministic governed state — refuse rather than guess (architecture §6 / falsifier #1).
    throw new UnresolvedIntentError(
      `Intent "${input.intent}" does not resolve to a single governed state in v1; refusing to guess.`,
    );
  }

  return {
    memberIntent: 'keep',
    scope: 'member',       // v1 fixed (impl spec §5)
    visibility: 'private', // v1 fixed
    lifecycle: 'kept',     // the member kept it
    usageAuthority: resolveUsageAuthority(input.usage),
    source: input.source,
  };
}
