/**
 * S3 · P1 — THE WRITER-FACING SIDE OF BODY AUTHORIZATION.
 *
 *   ⭐⭐ Make the constitutional machinery disappear into one human moment:
 *       MAIA asks before she reads.
 *
 * ⛔ PURE. No fetch, no React, no DOM. The surface renders what this returns, so
 * the protocol's six meanings can be proved without a browser — the house
 * pattern (`classifyRefusalCopy`), and the reason the copy obligations below are
 * testable at all.
 *
 * ── THE RULES THE COPY MUST OBEY ───────────────────────────────────────────
 *
 * ⭐ SAY SECTION. Authority is section-scoped; `passage` is vocabulary, not
 * authority. Copy that says "passage" while establishing section authority is
 * silent widening, and the writer would be consenting to a description of the
 * act rather than the act.
 *
 * ⭐ PERMISSION HAPPENS WHERE THE ASK ALREADY IS. No second route, no Focus
 * page, no iframe. Nothing here navigates.
 *
 * ⭐ `DISCLOSURE_UNAVAILABLE` MUST CARRY THREE FACTS, not one:
 *      the authorization happened · nothing was read · another attempt needs
 *      another act.
 *    Saying only the failure leaves the writer believing they are still
 *    authorized.
 */

/** Exactly the protocol results the surface may receive. */
export type BodyProtocolResult =
  | { kind: 'BODY_AUTHORITY_REQUIRED'; sections: readonly string[]; pendingAskRef: string }
  | { kind: 'BODY_SCOPE_INCOMPLETE'; outstanding: readonly string[]; pendingAskRef: string }
  | { kind: 'DISCLOSURE_UNAVAILABLE'; actSpent: boolean; sections: readonly string[] }
  | { kind: 'BODY_UNVERIFIABLE' }
  | { kind: 'ALREADY_CONSUMED'; completion: 'completed' | 'incomplete' }
  | { kind: 'CONTINUED' };

/**
 * The facts a rendering must carry. ⭐ Named rather than described, so a test
 * can require them of the copy instead of trusting that the words are kind.
 */
export type DisclosureFact =
  | 'section_named'          // which section(s), by the member's own labels
  | 'nothing_read_yet'       // no authored body has been read
  | 'authorization_happened' // the member's act did occur
  | 'nothing_was_read'       // and still nothing was read
  | 'new_act_required'       // trying again is a NEW authorization
  | 'permission_established' // authority existed
  | 'evidence_unverifiable'  // and recovery/verification failed
  | 'some_sections_missing'; // the answer needs more than was authorized

export interface BodyAuthorizationView {
  readonly kind: BodyProtocolResult['kind'];
  /** Sections the member is being asked about, or that remain outstanding. */
  readonly sections: readonly string[];
  /** The act the member may take, or `null` where no act is offered. */
  readonly act: 'authorize' | 'authorize_remaining' | 'reauthorize' | null;
  /** ⛔ A test requires every one of these of the rendered words. */
  readonly facts: readonly DisclosureFact[];
  readonly message: string;
}

/** Two sections read as "X and Y"; more as a comma list with a final "and". */
export function nameSections(sections: readonly string[]): string {
  if (sections.length === 0) return 'this section';
  if (sections.length === 1) return sections[0];
  if (sections.length === 2) return `${sections[0]} and ${sections[1]}`;
  return `${sections.slice(0, -1).join(', ')} and ${sections[sections.length - 1]}`;
}

export function viewFor(result: BodyProtocolResult): BodyAuthorizationView {
  switch (result.kind) {
    case 'BODY_AUTHORITY_REQUIRED':
      return {
        kind: result.kind,
        sections: result.sections,
        act: 'authorize',
        facts: ['section_named', 'nothing_read_yet'],
        /* ⭐ SECTION, never passage. And the offer is bounded: this question,
           this reading — not a standing permission. */
        message: `I need to read ${nameSections(result.sections)} to answer that faithfully. `
          + `Nothing from your writing has been read yet. Allow MAIA to read `
          + `${result.sections.length > 1 ? 'these sections' : 'this section'} for this question?`,
      };

    case 'BODY_SCOPE_INCOMPLETE':
      return {
        kind: result.kind,
        sections: result.outstanding,
        act: 'authorize_remaining',
        facts: ['section_named', 'some_sections_missing', 'nothing_read_yet'],
        /* ⛔ Never a quieter answer built from part of what it needs. */
        message: `Answering that faithfully also needs ${nameSections(result.outstanding)}. `
          + `Nothing has been read yet. You can allow the rest, or ask a narrower question instead.`,
      };

    case 'DISCLOSURE_UNAVAILABLE':
      return {
        kind: result.kind,
        sections: result.sections,
        act: 'reauthorize',
        /* ⭐⭐ ALL THREE FACTS. Reporting only the failure would leave the
           writer believing their authorization is still standing. */
        facts: ['authorization_happened', 'nothing_was_read', 'new_act_required'],
        message: `I couldn't establish the reading boundary, so nothing from your writing was read. `
          + `Your permission was used for that attempt — trying again needs a new one.`,
      };

    case 'BODY_UNVERIFIABLE':
      return {
        kind: result.kind,
        sections: [],
        act: null,
        /* ⛔ CONSTITUTIONALLY DISTINCT from the state above: permission WAS
           established and reading began. "May I read it?" and "is this the
           material I claim it is?" are different questions. */
        facts: ['permission_established', 'evidence_unverifiable'],
        message: `You allowed the reading, but I couldn't verify that what I recovered is `
          + `the writing that observation was made against. I won't answer from something I can't stand behind.`,
      };

    case 'ALREADY_CONSUMED':
      return {
        kind: result.kind,
        sections: [],
        act: result.completion === 'completed' ? null : 'reauthorize',
        facts: result.completion === 'completed'
          ? ['authorization_happened']
          : ['authorization_happened', 'nothing_was_read', 'new_act_required'],
        message: result.completion === 'completed'
          ? `That permission has already been used for this question.`
          : `That permission was already used and the reading did not complete. Trying again needs a new one.`,
      };

    case 'CONTINUED':
      return { kind: result.kind, sections: [], act: null, facts: [], message: '' };
  }
}

/**
 * ⭐ ONE ACT, ALL REQUIRED SECTIONS. The member is shown the whole set before
 * acting, because all-or-none is the answer contract and nobody can make an
 * informed decision about part of a set they were never shown.
 *
 * ⛔ The client names sections and nothing else. It never sends prose, never
 * sends `may_cross`, and the server re-derives the requirement regardless.
 */
export function authorizeRequest(input: {
  pendingAskRef: string; sections: readonly string[]; question: string; threadId?: string;
}): Record<string, unknown> {
  return {
    act: 'authorize_sections_and_resume',
    pendingAskRef: input.pendingAskRef,
    authorizes: [...input.sections],
    question: input.question,
    ...(input.threadId ? { threadId: input.threadId } : {}),
  };
}
