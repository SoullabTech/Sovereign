/**
 * Ideas room — shared constraints (client + server).
 *
 * IDEA_BLOCK_MAX_CHARS was 4,000 and was enforced in two incompatible ways:
 *   - the composer's `maxLength={4000}` SILENTLY clipped a long paste
 *     mid-sentence, and
 *   - the server returned 400 while the client swallowed the error.
 *
 * Both are failures of the room's purpose: a member developing an idea over
 * time must never lose their own words without being told. The cap is raised
 * to a length that fits substantive written thinking, and it is now enforced
 * visibly (counter + refusal message), never by silent truncation.
 *
 * The reflection context assembler bounds what MAIA actually reads
 * (see lib/team/maiaThreadReflection.ts) — a longer block does not mean an
 * unbounded prompt.
 */
export const IDEA_BLOCK_MAX_CHARS = 12000;

/** Point at which the composer starts showing the character counter. */
export const IDEA_BLOCK_COUNTER_THRESHOLD = Math.floor(IDEA_BLOCK_MAX_CHARS * 0.8);
