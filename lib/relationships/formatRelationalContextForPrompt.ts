/**
 * Relational Context → prompt block
 *
 * Formats an ActiveRelationalContext for injection into MAIA's prompt when a
 * member has explicitly handed a relationship off from /relationships/[id]
 * ("Take this to MAIA").
 *
 * Provenance discipline (why this file is mostly caveats):
 *
 *   - Entry KINDS (note / reflection / threshold / rupture / repair) are
 *     member-authored — the member chose them.
 *   - Themes and tension signals are SYSTEM-OBSERVED inference produced by
 *     lib/consciousness/relationalObserver.ts. They are not the member's words
 *     and they can be wrong.
 *   - None of it carries a recency stamp. The service returns the most recent
 *     five entry kinds with no timestamps, so this block must never assert that
 *     any of it is currently true. Presenting a stale record as present fact is
 *     the epistemic defect this wording exists to prevent.
 *
 * The block therefore states what was recorded, marks who recorded it, and
 * subordinates all of it to what the member is saying right now.
 *
 * Mirrors the conventions of formatAtomsForPrompt / formatMemberWebForPrompt.
 */

import type { ActiveRelationalContext } from './types';

/** Human-readable list, or null when the source array is empty. */
function list(values: string[]): string | null {
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(', ') : null;
}

export function formatRelationalContextForPrompt(
  ctx: ActiveRelationalContext
): string {
  const label = ctx.relationshipLabel?.trim() || 'this relationship';

  const descriptor = [ctx.realm, ctx.bondType]
    .map((v) => (v ? String(v).trim() : ''))
    .filter(Boolean)
    .join(', ');

  const lines: string[] = [
    'RELATIONAL CONTEXT (member-initiated handoff)',
    '',
    `The member came into this conversation from their Relationship page for ${label}.`,
    'They chose to bring it here.',
    '',
    `- Relationship: ${label}${descriptor ? ` (${descriptor})` : ''}`,
  ];

  if (ctx.mode) {
    lines.push(`- Field mode: ${ctx.mode}`);
  }

  const continuity = list(ctx.continuitySignals);
  if (continuity) {
    lines.push(`- Entries the member logged, most recent first: ${continuity}`);
  }

  const themes = list(ctx.salientThemes);
  if (themes) {
    lines.push(`- Themes the system observed across those entries: ${themes}`);
  }

  const tensions = list(ctx.currentTensions);
  if (tensions) {
    lines.push(`- Tension signals the system flagged: ${tensions}`);
  }

  lines.push(
    '',
    'HOW TO HOLD THIS:',
    '- Entry kinds are the member\'s own. Themes and tension signals are system',
    '  inference, not their words, and may be wrong.',
    '- This is a record of what was written down before, with no timestamp. It is',
    '  not a statement about how things stand today. Never present it as current',
    '  fact, and never imply you know the present state of this relationship.',
    '- If what the member says now differs from anything above, the member is',
    '  right and the record is out of date.',
    '- Do not recite this list back, do not diagnose the relationship, and do not',
    '  characterise the other person. Let it inform what you already hear; it is',
    '  background, not an agenda.',
    '- If the member has moved on to something else, follow them.'
  );

  return lines.join('\n');
}
