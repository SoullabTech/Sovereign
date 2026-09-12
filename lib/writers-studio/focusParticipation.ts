/**
 * FOCUS PARTICIPATION — the writer's distributed attention, preserved all the
 * way into response-producing cognition.
 *
 * ⭐⭐ THE RULING THIS FILE IMPLEMENTS (founder, 2026-09-12):
 *
 *   Attention membership authority ≠ content disclosure authority.
 *
 * A Focus Set of five places where only three can lawfully disclose current
 * text must reach MAIA as FIVE memberships and THREE bodies. Showing her three
 * and letting her believe the writer's attention is exhausted by them is
 * lawful disclosure followed by EPISTEMIC FLATTENING: the boundary held, and
 * the truth was lost anyway, one inch further downstream.
 *
 *   A partially readable Focus Set is not a complete evidentiary view of the
 *   Focus Set. MAIA must know that limitation.
 *
 * ── What an unreadable member may carry ────────────────────────────────────
 *
 *   MAY CROSS       identity within this set · ordinal · currency state
 *                   · active=false · bodyAvailable=false
 *
 *   MUST NOT CROSS  authored body · quoted text · current offsets · a derived
 *                   summary · a semantic description · a digest-derived
 *                   description · "what this passage is about"
 *
 * ⛔ THE FORBIDDEN LIST IS THE POINT. Every item on it is a way of describing
 * prose without quoting it, and each would let Focus membership smuggle content
 * across a boundary that refused it. A one-line summary of an unauthorized
 * passage is a disclosure of that passage. If a section's title is independently
 * lawful as authored structure, it travels under THAT authority — never because
 * membership carried it.
 *
 * ⭐ THE SENTENCE THIS EXISTS TO MAKE TRUE:
 *
 *   "You've asked me to work across five places, but I can currently read only
 *    three of them. Two anchors need confirmation before I can treat them as
 *    current text."
 *
 * ── The active target ──────────────────────────────────────────────────────
 *
 * ⛔ `active` CONFERS NO ADDITIONAL DISCLOSURE AUTHORITY. It answers only:
 * within the writer's declared attention, what are we acting on right now? It
 * is derived here from `activeMemberId` and NEVER trusted from a member — a
 * member that arrived claiming to be active would be action semantics entering
 * through the content channel.
 *
 * ⛔ AND IT IS NEVER SUBSTITUTED. Naming an unreadable member as the target is
 * a refusal, not an invitation to pick a readable one instead. Quietly moving
 * the writer's edit target is the system deciding what they meant to change.
 */

export type FocusMemberStatus = 'readable' | 'unverified' | 'unavailable';

export interface FocusParticipationMember {
  /** Identity WITHIN this set. Not a database id, not a section id. */
  readonly focusMemberId: string;
  /** 1-based position in the set, as the writer declared it. */
  readonly ordinal: number;
  /**
   * The section this member stands in.
   *
   * ⭐⭐ PRESENT IF AND ONLY IF `status === 'readable'` — FOUNDER RULING,
   * FOCUS-W5, 2026-09-12. Enforced below, not merely documented.
   *
   * It travels for a READABLE member because the receipt is scoped to that
   * section and MAIA must be able to tell §45 from §62 when she attributes a
   * passage. ⛔ It does NOT travel for a withheld one:
   *
   *   ATTENTION MEMBERSHIP  ≠  CONTENT DISCLOSURE
   *
   * Section identity may travel only under a lawful structure authority; Focus
   * membership does not confer it. Given the identity of a place she was not
   * given, MAIA can and did speak about that place's current content as though
   * she had read it — the source collapse FOCUS-W5 names. Withholding the body
   * while handing over the name is the shape that produced
   * *"Section 56 gives the same sequence again…"* about a section no boundary
   * ever disclosed.
   *
   * ⛔ The server and the durable act still hold the real section identity for
   * provenance. This rule governs what enters response-producing cognition.
   */
  readonly sectionRef?: string;
  readonly status: FocusMemberStatus;
  /** Derived from the set's activeMemberId. ⛔ Never accepted from the member. */
  readonly active: boolean;
  readonly bodyAvailable: boolean;
  /** ⛔ PRESENT IF AND ONLY IF `status === 'readable'`. Enforced, not documented. */
  readonly content?: string;
}

export interface FocusParticipation {
  readonly members: readonly FocusParticipationMember[];
  readonly activeMemberId: string | null;
  /** How many bodies MAIA actually has. */
  readonly readable: number;
  /** How many places the writer declared. ⛔ Always `members.length`. */
  readonly total: number;
}

export interface FocusParticipationInput {
  readonly members: readonly FocusParticipationMember[];
  readonly activeMemberId: string | null;
}

/**
 * Construct the participation, refusing every shape that would let one of the
 * two authorities stand in for the other.
 *
 * ⛔ THROWS rather than repairing. Every refusal below describes a state in
 * which MAIA would be told something untrue about the writer's attention or
 * would receive material no boundary authorized. There is no degraded form of
 * either that is better than not crossing.
 */
export function focusParticipation(input: FocusParticipationInput): FocusParticipation {
  const { members, activeMemberId } = input;

  const seen = new Set<string>();
  for (const m of members) {
    if (seen.has(m.focusMemberId)) {
      throw new Error(`focus participation: duplicate member identity ${m.focusMemberId}`);
    }
    seen.add(m.focusMemberId);

    /* ⭐ THE HARD REFUSAL. Content and readability are one fact, asserted in two
       places; if they disagree, one of them is a lie and we cannot tell which. */
    const hasContent = m.content !== undefined;
    if (m.status !== 'readable' && hasContent) {
      throw new Error(
        `focus participation: a ${m.status} member carries content — an unreadable member's body must not cross`,
      );
    }
    if (m.status === 'readable' && !hasContent) {
      throw new Error('focus participation: a readable member carries no content');
    }
    if (m.bodyAvailable !== hasContent) {
      throw new Error('focus participation: bodyAvailable disagrees with content');
    }

    /* ⭐⭐ W5 · THE SECOND HARD REFUSAL, and it binds in BOTH directions.
       A withheld member carrying its section identity is the defect; a
       readable member without one cannot have its passage attributed, and an
       unattributed passage is what F7 forbids. */
    const hasRef = m.sectionRef !== undefined;
    if (m.status !== 'readable' && hasRef) {
      throw new Error(
        `focus participation: a ${m.status} member carries a section identity`
        + ' — membership is not disclosure, and a withheld place is not named',
      );
    }
    if (m.status === 'readable' && !hasRef) {
      throw new Error('focus participation: a readable member carries no section identity');
    }
  }

  if (activeMemberId !== null) {
    const target = members.find((m) => m.focusMemberId === activeMemberId);
    /* ⛔ ONE MESSAGE FOR BOTH FAILURES, naming no other member. A refusal that
       said "f3 is unverified; did you mean f2?" would be proposing a
       substitution, which is exactly what F4 forbids. */
    if (!target || target.status !== 'readable') {
      throw new Error('focus participation: the active target is not a readable member of this set');
    }
  }

  const resolved = members.map<FocusParticipationMember>((m, i) => ({
    focusMemberId: m.focusMemberId,
    ordinal: i + 1,
    /* ⛔ Carried only where the refusal above already proved it lawful. */
    ...(m.sectionRef !== undefined ? { sectionRef: m.sectionRef } : {}),
    status: m.status,
    active: activeMemberId !== null && m.focusMemberId === activeMemberId,
    bodyAvailable: m.content !== undefined,
    ...(m.content !== undefined ? { content: m.content } : {}),
  }));

  return {
    members: resolved,
    activeMemberId,
    readable: resolved.filter((m) => m.status === 'readable').length,
    total: resolved.length,
  };
}

const STATUS_NOTE: Readonly<Record<FocusMemberStatus, string>> = {
  readable: 'current text, which you can read below',
  unverified: 'an anchor that needs the writer’s confirmation before it can be treated as current text.'
    + ' You have not been given it, and you do not know which section it is.',
  unavailable: 'a place whose current text could not be made available to you.'
    + ' You have not been given it, and you do not know which section it is.',
};

/**
 * ⭐ THE MEMBERSHIP SENTENCE. Both numbers, in one place, so MAIA cannot report
 * one without the other — which is the whole mechanism by which she is unable
 * to mistake a partial view for a complete one.
 */
export function renderFocusMembership(p: FocusParticipation): string {
  const unread = p.total - p.readable;
  const places = `${p.total} place${p.total === 1 ? '' : 's'}`;
  const head = unread === 0
    ? `The writer is working across ${places}, and you can read all of them.`
    : `The writer is working across ${places}. You can read ${p.readable} of ${p.total};`
      + ` ${unread} cannot be read in this turn.`
      + ' ⛔ This is a partial view of their attention, and you must not treat the'
      + ` ${p.readable} you can see as the whole of it.`
      /* ⭐⭐ W5-9 · SOURCE COLLAPSE, NAMED. The structural repair already
         withholds the identity; this forbids the remaining move — speaking
         about a withheld place from some other source as though it were the
         current Work. Prior lawful knowledge is not erased, but it must be
         attributed, because the writer cannot otherwise tell which of your
         claims rest on their prose. */
      + ' ⛔ You have not read the withheld place(s) in this turn and you are not'
      + ' told which sections they are. Do not describe what they currently say.'
      + ' If something you were given elsewhere — an earlier developmental'
      + ' reading, for instance — bears on one of them, say so and say that you'
      + ' could not check it against the current Work.';
  const target = p.activeMemberId === null
    ? 'They have not yet chosen which of these places they are acting on.'
    : `They are working on ${p.members.find((m) => m.active)?.sectionRef ?? 'one of these places'} right now`
      + ' — that is which place is in hand, not which place matters most.';
  return `${head} ${target}`;
}

/**
 * One line per member: identity, place, state. ⛔ Never a description of prose.
 *
 * ⭐ W5 · A WITHHELD MEMBER IS LISTED AND NOT NAMED. It keeps its focus-local
 * identity and its ordinal — it must remain visibly part of the writer's
 * attention, because deleting it would make a partial view look complete — and
 * it carries no section identity at all.
 */
export function renderFocusMembers(p: FocusParticipation): string {
  return p.members
    .map((m) => {
      const place = m.sectionRef ?? 'a place in this Work that is withheld from you in this turn';
      return `  F${m.ordinal} · ${place}${m.active ? '  ← working on this' : ''}`
        + `\n        ${STATUS_NOTE[m.status]}`;
    })
    .join('\n');
}

/**
 * The readable bodies, each attributed to the place it came from.
 *
 * ⛔ Attribution is not decoration. An unattributed concatenation is what F7
 * forbids: MAIA would have three passages and no way to say which is which,
 * and every proposal she eventually makes would be anchored to nothing.
 */
export function renderFocusBodies(p: FocusParticipation): string {
  return p.members
    .filter((m) => m.content !== undefined)
    .map((m) => `[F${m.ordinal} · ${m.sectionRef}]\n${m.content}`)
    .join('\n\n');
}
