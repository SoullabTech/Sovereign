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

import type { SectionRecognition } from '@/lib/manuscript/ask/bodyGate/sectionRecognition';

/**
 * ⭐⭐ SERVER-DERIVED RECOGNITION IS THE ONLY SOURCE FOR THE AUTHORIZATION
 * SURFACE. The identity and the display string were derived together for THIS
 * request, so the surface renders these and never substitutes
 * `focusSections.heading`, a write-state heading, or a cached client heading —
 * even where they look equivalent.
 *
 * ⭐ D9's heading remains legitimate: it describes where the writer's ATTENTION
 * is. It simply has no authority to name the disclosure scope.
 *
 * ⚠️ If the two ever disagree for the same `sectionId`, that is a real
 * consistency finding — ⛔ and it is NOT resolved by taking whichever string
 * looks newer. The authorization stays bound to the server identity and the
 * server label, and the mismatch is recorded separately.
 */
export type DisclosureSection = SectionRecognition;

/**
 * Everything the surface may receive.
 *
 * ⭐⭐ TWO SHAPES, NOT ONE. The route answers some outcomes as `{ result }` and
 * others as `{ refusal }`, and the refusal-bearing ones — an expired or unknown
 * pending Ask — are exactly the continuity failures a member is most likely to
 * meet. A mapper that could only see results would render nothing for them and
 * leave the surface to improvise.
 */
export type BodyProtocolOutcome =
  | { kind: 'BODY_AUTHORITY_REQUIRED'; sections: readonly DisclosureSection[]; pendingAskRef: string }
  | { kind: 'BODY_SCOPE_INCOMPLETE'; outstanding: readonly DisclosureSection[]; pendingAskRef: string }
  | { kind: 'DISCLOSURE_UNAVAILABLE'; actSpent: boolean; sections: readonly DisclosureSection[] }
  | { kind: 'BODY_UNVERIFIABLE' }
  /**
   * ⭐ The same human press arriving twice. `completion` is a SEPARATE fact: the
   * kind says what happened to the ACT, completion says whether that act
   * produced an ANSWER. ⛔ Neither implies the other.
   */
  | { kind: 'ACT_ALREADY_PROCESSED'; completion: 'completed' | 'incomplete' }
  /** A DIFFERENT act spent this resume. */
  | { kind: 'ALREADY_CONSUMED'; completion: 'completed' | 'incomplete' }
  /** The pending window closed. Continuity hygiene, not an authority judgement. */
  | { kind: 'PENDING_EXPIRED' }
  /** No such paused Ask — forged, truncated, or long gone. */
  | { kind: 'PENDING_UNKNOWN' }
  /** The resume named an Ask that is not this one. */
  | { kind: 'PENDING_MISMATCH' }
  /** ⛔ A resume could not even be opened; the member was never truly offered one. */
  | { kind: 'PENDING_UNAVAILABLE' }
  /** ⭐ The member's own act, and it reaches no server at all. */
  | { kind: 'DECLINED' }
  | { kind: 'BODY_AUTHORIZED' };

export interface BodyAuthorizationView {
  readonly kind: BodyProtocolResult['kind'];
  /** Sections the member is being asked about, or that remain outstanding. */
  readonly sections: readonly string[];
  /** The act the member may take, or `null` where no act is offered. */
  /**
   * ⭐⭐ `reauthorize` AND `retry_same` ARE NOT THE SAME OFFER, and the word
   * "Try again" is no longer safe for both.
   *
   *   retry_same     the network failed before the server's outcome was known
   *                  → send the SAME act again, with the SAME actId
   *   reauthorize    the act is definitely spent
   *                  → a NEW human authorization, and a NEW actId
   */
  readonly act: 'authorize' | 'authorize_remaining' | 'reauthorize' | 'retry_same' | null;
  /** ⛔ A test requires every one of these of the rendered words. */
  readonly facts: readonly DisclosureFact[];
  readonly message: string;
}

/**
 * Two sections read as "X and Y"; more as a comma list with a final "and".
 *
 * ⛔ NEVER A UUID. `label` always renders — the server guarantees it — so a
 * member is never asked to authorize a string they cannot read.
 */
export function nameSections(sections: readonly DisclosureSection[]): string {
  const names = sections.map((s) => s.label);
  if (names.length === 0) return 'this section';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const view = (
  kind: BodyAuthorizationView['kind'],
  sections: readonly DisclosureSection[],
  act: BodyAuthorizationView['act'],
  facts: readonly DisclosureFact[],
  message: string,
): BodyAuthorizationView => ({ kind, sections, act, facts, message });

export function viewFor(outcome: BodyProtocolOutcome): BodyAuthorizationView {
  switch (outcome.kind) {
    case 'BODY_AUTHORITY_REQUIRED': {
      const many = outcome.sections.length > 1;
      return view(outcome.kind, outcome.sections, 'authorize',
        ['section_named', 'nothing_read_yet'],
        /* ⭐ SECTION, never passage — and the offer is bounded to THIS question. */
        `MAIA needs to read ${nameSections(outcome.sections)} to answer that faithfully. `
        + `Nothing from your writing has been read yet. `
        + `Allow MAIA to read ${many ? 'these sections' : 'this section'} for this question?`);
    }

    case 'BODY_SCOPE_INCOMPLETE':
      /* ⛔ Never a quieter answer built from part of what it needs. */
      return view(outcome.kind, outcome.outstanding, 'authorize_remaining',
        ['section_named', 'some_sections_missing', 'nothing_read_yet'],
        `Answering that faithfully also needs ${nameSections(outcome.outstanding)}. `
        + `Nothing has been read yet. You can allow the rest, or ask a narrower question instead.`);

    case 'DISCLOSURE_UNAVAILABLE':
      /* ⭐⭐ ALL THREE FACTS. Reporting only the failure would leave the writer
         believing their authorization is still standing. */
      return view(outcome.kind, outcome.sections, 'reauthorize',
        ['authorization_happened', 'nothing_was_read', 'new_act_required'],
        `MAIA couldn't establish the reading boundary, so nothing from your writing was read. `
        + `Your permission was used for that attempt — trying again needs a new one.`);

    case 'BODY_UNVERIFIABLE':
      /* ⛔ CONSTITUTIONALLY DISTINCT from the state above: permission WAS
         established and recovery began. "May I read it?" and "is this the
         material I claim it is?" are different questions. */
      return view(outcome.kind, [], null,
        ['permission_established', 'evidence_unverifiable'],
        `You allowed the reading, but MAIA couldn't verify that what she recovered is `
        + `the writing that observation was made against. She won't answer from something she can't stand behind.`);

    case 'ACT_ALREADY_PROCESSED':
      /* ⭐⭐ THE SAME PRESS, ARRIVING TWICE — and the two facts stay apart. The
         kind says the act was recognised; `completion` says whether it produced
         an answer. ⛔ Telling the member they tried to reuse a spent permission
         would be false: they pressed once. */
      return view(outcome.kind, [], null,
        outcome.completion === 'completed'
          ? ['authorization_happened']
          : ['authorization_happened', 'nothing_was_read', 'new_act_required'],
        outcome.completion === 'completed'
          ? `That's the same permission you just gave — MAIA already has it and has answered.`
          : `That's the same permission you just gave. It didn't finish, so answering again needs a new one.`);

    case 'ALREADY_CONSUMED':
      return view(outcome.kind, [], outcome.completion === 'completed' ? null : 'reauthorize',
        outcome.completion === 'completed'
          ? ['authorization_happened']
          : ['authorization_happened', 'nothing_was_read', 'new_act_required'],
        outcome.completion === 'completed'
          ? `That permission has already been used for this question.`
          : `That permission was already used and the reading did not complete. Trying again needs a new one.`);

    case 'PENDING_EXPIRED':
      /* ⭐ Continuity hygiene, not a judgement about authority. Nothing was read
         and nothing was refused — the question simply waited too long. */
      return view(outcome.kind, [], 'reauthorize',
        ['nothing_read_yet', 'new_act_required'],
        `That question has been waiting a while and its thread has lapsed. Nothing was read. Ask again when you're ready.`);

    case 'PENDING_UNKNOWN':
      return view(outcome.kind, [], null, ['nothing_read_yet'],
        `MAIA can't find the question that was waiting on this. Nothing was read.`);

    case 'PENDING_MISMATCH':
      return view(outcome.kind, [], null, ['nothing_read_yet'],
        `That permission belongs to a different question. Nothing was read.`);

    case 'PENDING_UNAVAILABLE':
      /* ⛔ The member was never truly offered a resume: it could not be opened. */
      return view(outcome.kind, [], 'retry_same', ['nothing_read_yet'],
        `MAIA couldn't hold this question open long enough to ask permission. Nothing was read.`);

    case 'DECLINED':
      /* ⭐ The member's own act, and it reaches no server at all. */
      return view(outcome.kind, [], null, ['nothing_read_yet'],
        `Nothing was read. MAIA will answer from what she already has, or not at all.`);

    case 'BODY_AUTHORIZED':
      return view(outcome.kind, [], null, [], '');
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
  pendingAskRef: string;
  /** ⛔ Section IDENTITIES only. Headings and labels are display material. */
  sectionIds: readonly string[];
  /**
   * ⭐ Minted ONCE per physical press by the interaction owner, and passed in.
   * ⛔ THIS FUNCTION MUST NEVER MINT ONE. A builder that generated an id would
   * turn every transport retry into a new apparent human act.
   */
  actId: string;
  question: string;
  threadId?: string;
}): Record<string, unknown> {
  return {
    act: 'authorize_sections_and_resume',
    pendingAskRef: input.pendingAskRef,
    actId: input.actId,
    authorizes: [...input.sectionIds],
    question: input.question,
    ...(input.threadId ? { threadId: input.threadId } : {}),
  };
}
