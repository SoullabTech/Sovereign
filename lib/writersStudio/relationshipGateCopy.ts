/**
 * F1 (guided beta session 2026-11-19; #1800 contract D1; founder ruling 2026-11-19 item 5) — the relationship gate's words.
 *
 * The gate guards one thing: passage work needs a MAIA relationship (a kept conversation) for this Work. It knows nothing about
 * what MAIA has READ, so it must never say "I haven't read this Work with you yet". A writer who had talked with MAIA about the
 * Work that afternoon was told exactly that. When earlier conversations exist, continuing one is the first choice, by the
 * writer's own click.
 *
 * ⛔ Pure copy and ordering. No relationship is chosen, bound or resumed automatically (auto-continue is HELD: R3.4.4 recurrence).
 * ⛔ Program Works (e.g. College Essay) keep their own `notYetCopy` from studioPaths; that path has its own owner (#1900).
 */

export type RelationshipChoice = { readonly id: string; readonly createdAt: string };

export type RelationshipGateCopy = {
  /** The gate's heading. */
  readonly heading: string;
  /** Said when the writer asked for passage work before choosing; nothing has been sent. */
  readonly nudge: string;
  /** The first button: continue the most recent conversation, or start one when there is none. */
  readonly primary: { readonly kind: 'continue'; readonly id: string; readonly label: string } | { readonly kind: 'begin'; readonly label: string };
  /** Shown beside the primary when earlier conversations exist: start a new one instead. */
  readonly beginInstead: string | null;
  /** Older conversations, newest first, after the most recent. */
  readonly older: readonly { readonly id: string; readonly label: string }[];
};

export const BEGIN_LABEL = 'Start with MAIA';
export const BEGIN_INSTEAD_LABEL = 'Start a new conversation';

const day = (iso: string, format: (d: Date) => string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : format(d);
};

export function relationshipGateCopy(
  choices: readonly RelationshipChoice[],
  format: (d: Date) => string = (d) => d.toLocaleDateString(),
): RelationshipGateCopy {
  const sorted = [...choices].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const [latest, ...rest] = sorted;
  if (!latest) {
    return {
      heading: 'To work on a passage together, start a conversation with me about this Work.',
      nudge: 'Start with me first, and I’ll pick this up. I haven’t sent anything.',
      primary: { kind: 'begin', label: BEGIN_LABEL },
      beginInstead: null,
      older: [],
    };
  }
  const when = day(latest.createdAt, format);
  return {
    heading: 'We’ve talked about this Work before. Continue that conversation, or start a new one.',
    nudge: 'Choose a conversation first, and I’ll pick this up. I haven’t sent anything.',
    primary: { kind: 'continue', id: latest.id, label: when ? `Continue our conversation · begun ${when}` : 'Continue our conversation' },
    beginInstead: BEGIN_INSTEAD_LABEL,
    older: rest.map((c) => ({ id: c.id, label: `Continue · ${day(c.createdAt, format) ?? 'earlier'}` })),
  };
}
