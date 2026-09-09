/**
 * EVIDENCE-NAMING-01A — withdrawn pattern identities.
 *
 * One list, imported by both the WRITER (`PatternMemoryStore.upsertByKey`, which
 * refuses to create them) and the READER (`loadRecentDevelopmentalMemories`,
 * which refuses to load them). A quarantine that lives in only one of those two
 * places is not a quarantine.
 *
 * ⭐ WHY THESE KEYS ARE WITHDRAWN RATHER THAN RENAMED
 *
 * `potential_spiritual_bypassing` was emitted when a member's mental-tagged
 * events outnumbered their emotional-tagged events by more than 3:1 over seven
 * days, and was described as *"Mental insights without emotional integration"*.
 * Three claims were stacked onto one count, and the count establishes none of
 * them: not that the mental events were insights, not that the emotional events
 * were integration, not that the asymmetry is a deficit.
 *
 * ⭐ THE FOUNDER'S PRECISION (2026-09-09) — the count is not the error.
 *
 *   OBSERVATION   more mental-tagged than emotional-tagged activity in 7 days
 *        ↓ interpret through Spiralogic
 *   ELEMENTAL     more Air than Water in the recent recorded field  (DERIVED)
 *        ↓ relationally offered
 *   INQUIRY       "is insight moving faster than feeling right now?"
 *
 * The observation plane is lawful. The inflation happened when all three planes
 * were collapsed into a stored fact — *"you have mental insights without
 * emotional integration"* — and that sentence, being the `description`, is what
 * `generateLocalEmbedding()` vectorises. The clinical rendering therefore governs
 * SEMANTIC RETRIEVAL, not merely display.
 *
 * ⛔ Even "Air without Water" would overstate it. A 3:1 ratio is Air-heavy
 * RELATIVE TO Water; it is not Water-less.
 *
 * ⭐ COMPANION DOCTRINE (founder, 2026-09-09), alongside *The Sacred Is Not a
 * Symptom*: **an elemental configuration is not a diagnosis.** Elemental
 * asymmetry describes the present organization of experience; it does not, by
 * itself, establish pathology, deficiency, incapacity, or failed development.
 * Fire-heavy, Water-heavy, Earth-heavy, Air-heavy are places a person can stand.
 *
 * ⛔ NO REPLACEMENT KEY EXISTS YET. `high_mental_to_emotional_event_ratio` is
 * the candidate lawful observation identity and belongs to EVIDENCE-NAMING-01C,
 * together with the elemental translation layer. Do not introduce it here.
 * Containment first; custody second; lawful identity third.
 */

export const DEPRECATED_PATTERN_KEYS = ['potential_spiritual_bypassing'] as const;

export type DeprecatedPatternKey = (typeof DEPRECATED_PATTERN_KEYS)[number];

/**
 * True when a pattern key names a withdrawn identity.
 *
 * Keys have the shape `pattern_type` or `pattern_type:identifier`, so the type
 * segment is what is compared — a suffixed variant must not slip past.
 */
export function isDeprecatedPatternKey(patternKey: string | null | undefined): boolean {
  if (!patternKey) return false;
  const [patternType] = patternKey.split(':');
  return (DEPRECATED_PATTERN_KEYS as readonly string[]).includes(patternType);
}
