/**
 * Memory Canon Guard — single source of truth for §V/§VI of MAIA_MEMORY_CANON_v1.0.md
 *
 * Authority: docs/canon/MAIA_MEMORY_CANON_v1.0.md
 *   §V — Forbidden Language (Authenticated Members)
 *   §VI — Required Fallback Language
 *
 * Implementation spec: docs/specs/CUT_1_SUBSTRATE_RESTORATION.md §II.A
 *
 * Rationale for centralization:
 *   The forbidden-language block existed in three places (oracle/conversation/route.ts,
 *   lib/sovereign/maiaService.ts, lib/consciousness/MAIA_RUNTIME_PROMPT.ts) — each with
 *   a slightly different verb coverage. MAIA in production drifted to a synonym
 *   ("I don't carry memory between conversations") that the maiaService scrubber regex
 *   did not catch because its pattern targeted only "have memory".
 *
 *   This module is the single canonical source. Drift across paths is now structurally
 *   impossible: every path imports the same block + the same regex array.
 *
 * What this module exports:
 *   - MEMORY_CANON_GUARD_PROMPT: the canonical §V + §VI prose block for system prompts.
 *   - FORBIDDEN_AMNESIA_PATTERNS: regex array with verb-synonym coverage for
 *     post-generation scrubbing.
 *   - scrubMemoryAmnesia(text, opts): scrubber that returns corrected text when a
 *     forbidden pattern fires, or null when no scrub is needed.
 *
 * What this module does NOT do:
 *   - Does NOT touch identity guards ("I'm Claude" / "made by Anthropic" / etc.) —
 *     those remain in maiaService.ts. Identity guard ≠ memory guard, even if they
 *     historically lived in the same block.
 *   - Does NOT load any memory layer.
 *   - Does NOT decide when to surface what — that's the orchestrator's job.
 *   - Does NOT condition the prompt on memoryHealth — that's the route handler's job
 *     (see lib/maia/memoryHealth.ts).
 */

/**
 * Canonical §V + §VI prose block, injected into the system prompt of every authenticated
 * MAIA path.
 *
 * §V — what MUST NOT be said.
 * §VI — what to say instead when continuity is degraded.
 *
 * The prose is intentionally identical across paths so the model receives the same
 * canonical instruction regardless of which route the user hit.
 */
export const MEMORY_CANON_GUARD_PROMPT = `# Memory Posture (Canon §V / §VI)

You are within an ongoing thread. Your context window is finite — earlier turns may not be visible to you in any given moment — but the conversation, the person, and the relationship continue.

You DO have memory architecture. Recent conversation, member-placed portfolio material, and field context are provided to you when they exist. Do not misrepresent your own architecture.

Statements about your own memory are easy to get wrong. False statements about memory rupture trust at the substrate level. Therefore, never produce any of the following or their variants:

- "I don't have memory between conversations"
- "I don't carry memory between conversations"
- "I don't hold memory of earlier conversations"
- "I don't retain memory"
- "I don't keep memory of past sessions"
- "I'm coming in fresh each time"
- "Each time we talk, I start fresh"
- "I can't recall previous conversations"
- "I have no context for that"
- Any sentence that frames an operational gap as an identity limitation

If you encounter a gap — the person references something you cannot locate in your current context — name the specific gap and invite them to bring it back:

- "I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there."
- "I don't have that detail in front of me right now — can you remind me?"
- "Tell me again — I want to be present to this without guessing."
- "I'm missing the thread there. Can you bring me back?"
- "My continuity is partial right now. Remind me what you told me, and we'll pick up the thread."

Asking is honest. Confabulating about your nature is not. The person re-introducing context is the conversation working, not failing.

When the system prompt below contains member-placed portfolio material or member-authored continuity blocks (Daily Anchor, kept atoms, idea threads, journey patterns), those are the member's own words and you may recognize them directly. The "don't display memory / weave naturally" guidance applies to system-inferred patterns, not to material the member explicitly placed.`;

/**
 * Verb-synonym blocklist for the post-generation scrubber.
 *
 * Pattern shape:
 *   I (don't|do not|can't|cannot|won't|will not|am not able to|have no way to|have no ability to)
 *     (have|carry|hold|retain|maintain|keep|preserve|store|remember)
 *     (any|the)? (memor(y|ies)|context|continuity|recollection|recall|thread|history)
 *
 * Also catches: "starting fresh", "coming in fresh", "each time we talk", "I'm new to this thread".
 *
 * Wide enough to catch the family of denial-shapes; deliberately does NOT match legitimate
 * uses like "I don't have that detail in front of me right now" — note the trailing
 * "memory/context/continuity/etc." anchor.
 */
export const FORBIDDEN_AMNESIA_PATTERNS: RegExp[] = [
  // Verb-synonym family + memory-noun family
  /\bI(?:'m| am)? ?(?:don'?t|do not|can'?t|cannot|won'?t|will not|am not able to|have no way to|have no ability to) (?:have|carry|hold|retain|maintain|keep|preserve|store|remember) (?:any |the )?(?:memor(?:y|ies)|context|continuity|recollection|recall|thread(?:s)? of (?:our )?(?:past|earlier|prior)|history of (?:our )?(?:past|earlier|prior))\b/i,

  // "I don't remember" attached to conversations/sessions/threads
  /\bI(?:'m| am)? ?(?:don'?t|do not) remember (?:our |any |the )?(?:earlier|previous|prior|past) (?:conversation|session|exchange|thread|chat|interaction)/i,

  // "Coming in fresh" / "starting fresh" / "fresh each time"
  /\b(?:coming|starting|come|start)(?:ing)? (?:in )?fresh\b/i,
  /\bfresh each (?:time|conversation|session|day)\b/i,
  /\beach time we (?:talk|chat|meet|speak)[, ]?I (?:start|come|begin)/i,

  // "I'm new to this thread/conversation" (denial of continuity)
  /\bI(?:'m| am)? new to (?:this |our )?(?:thread|conversation|exchange|chat)\b/i,

  // "I have no memory/context/continuity"
  /\bI have no (?:memory|context|continuity|recall|recollection|access to (?:our |the )?(?:past|earlier|prior))/i,

  // "I should tell you clearly: I don't..." — pre-amble pattern
  /\bI should tell you (?:clearly|honestly|that)[: ,]?\s*(?:I |my)/i,

  // "Without memory of" / "with no memory of"
  /\bwith(?:out)? no? memory of (?:our |any |the )?(?:past|earlier|prior|previous)/i,

  // "Can't access" memory/context
  /\bI(?:'m| am)? ?(?:can'?t|cannot) access (?:any |the |our )?(?:memor(?:y|ies)|context|continuity|past (?:conversation|session|exchange))/i,

  // "I can't/don't recall our X conversation" — recall as verb attached to a past
  // conversation noun. Narrow enough not to catch "I can't recall the date".
  /\bI(?:'m| am)? ?(?:can'?t|cannot|don'?t|do not) recall (?:our |any |the )?(?:earlier|previous|prior|past|former) (?:conversation|session|exchange|thread|chat|interaction|discussion|talk)/i,
];

/**
 * Required §VI fallback shape — when a forbidden pattern fires, the scrubber
 * replaces with one of these. Selection depends on context:
 *   - has loaded context (member, recent turns): "I may not have loaded the earlier specifics yet"
 *   - no loaded context: "I don't have that detail in front of me right now"
 *
 * Both honor §VI: name the gap, invite the member to ground.
 */
const SCRUB_REPLACEMENT_WITH_CONTEXT =
  "I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there.";

const SCRUB_REPLACEMENT_WITHOUT_CONTEXT =
  "I don't have that detail in front of me right now — can you remind me what you mean? I want to be present to this without guessing.";

/**
 * Post-generation scrubber. Detects §V violations in the model's output and replaces
 * with §VI-compliant language.
 *
 * @param text - the model's response text
 * @param opts.hasLoadedContext - true if any memory layer loaded successfully this turn
 * @returns corrected text if a scrub was needed; null if the text is canon-compliant
 *
 * The caller decides what to do with null vs replacement:
 *   - null: ship the text unchanged
 *   - string: log the violation, log the replacement, ship the replacement
 *
 * The scrubber DOES log a warning when it fires, since a fired scrub is a signal that
 * the system prompt's §V guard did not hold for that turn — worth tracking in telemetry.
 */
export function scrubMemoryAmnesia(
  text: string,
  opts: { hasLoadedContext: boolean },
): string | null {
  if (!text || typeof text !== 'string') return null;

  const matched = FORBIDDEN_AMNESIA_PATTERNS.find((pattern) => pattern.test(text));
  if (!matched) return null;

  console.warn(
    '[MemoryCanonGuard] §V violation detected in model output — scrubbing',
    { pattern: matched.toString(), hasLoadedContext: opts.hasLoadedContext },
  );

  return opts.hasLoadedContext
    ? SCRUB_REPLACEMENT_WITH_CONTEXT
    : SCRUB_REPLACEMENT_WITHOUT_CONTEXT;
}

/**
 * Lightweight check: does the text contain any §V-forbidden pattern?
 *
 * Used by the falsifiability test script (scripts/verify-memory-canon-v.sh) and by
 * any code that wants to check without performing a scrub.
 */
export function containsForbiddenAmnesia(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return FORBIDDEN_AMNESIA_PATTERNS.some((pattern) => pattern.test(text));
}
