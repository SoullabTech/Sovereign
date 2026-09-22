/**
 * DEVELOP — THE ONE GOVERNED OBSERVATION
 *
 * `JARVIS-WRITERS-STUDIO-COMPLETE-01 / B0` · founder ruling, Develop data-driven
 * composition, 2026-09-22.
 *
 * ⭐⭐ THE ARCHITECTURAL CORRECTION THIS FILE EXISTS FOR.
 *
 * Continuity, Voice, Themes and Structure were being hand-authored as four
 * independent frames, so each correction landed on one and the next frame
 * reintroduced it. *A frame drawn by hand inherits nothing.* Here all four are
 * views over ONE object, and the guarantees are enforced **at construction** —
 * ⛔ not by a check that runs after something has already been rendered.
 *
 * `observe()` REFUSES. There is no way to obtain a `DevelopObservation` that
 * lacks evidence, lacks a return address, hides its provenance, grades the
 * member's Work, or makes a cross-Work claim without coverage. ⭐ A view cannot
 * drop what the constructor will not produce.
 */

import { inspectMemberCopy, inspectForMachinery } from './language';

/* ══════════════════════════════════════════════════════════════════════════
   PROVENANCE — ⭐ every pattern knows its kind

   Three epistemically different things were collapsing into one treatment:
   the member's own declaration, a word literally in the text, and MAIA's
   reading. ⛔ They may never render identically.
   ══════════════════════════════════════════════════════════════════════════ */

export type Provenance =
  /** ⭐ The member said so. Primary, solid, and theirs to revise. */
  | { readonly kind: 'member-declared'; readonly declaredWhen: string }
  /** ⭐ A name or phrase literally present in the manuscript. Countable. */
  | { readonly kind: 'textual-entity' }
  /** ⭐ MAIA's reading. ⛔ Visibly secondary, always evidence-backed. */
  | { readonly kind: 'maia-observation'; readonly readingId: string; readonly lens: string };

export const PROVENANCE_KINDS = ['member-declared', 'textual-entity', 'maia-observation'] as const;

/* ══════════════════════════════════════════════════════════════════════════
   COVERAGE — ⭐ required wherever a claim is about the whole Work
   ══════════════════════════════════════════════════════════════════════════ */

export interface Coverage {
  readonly read: number;
  readonly total: number;
  readonly depth: string;
  /** ⭐ A reading is a reading AT A TIME. The Work has moved since. */
  readonly when: string;
}

export const PERMANENT_NON_CONCLUSIONS = ['author-intent', 'reader-effect'] as const;
export type NonConclusion =
  | (typeof PERMANENT_NON_CONCLUSIONS)[number]
  | 'whole-work-pattern' | 'across-unread-span' | 'outside-coverage';

export interface Address {
  readonly label: string;
  readonly sectionId: string;
}

export type DevelopDomain = 'continuity' | 'voice' | 'themes' | 'structure' | 'development' | 'arc' | 'reader';

export interface DevelopObservation {
  readonly id: string;
  readonly domain: DevelopDomain;
  /** Plain, neutral name. ⛔ Never a verdict. */
  readonly label: string;
  /** ⭐ What is on the page, in evidence terms. */
  readonly description: string;
  /** ⛔ Non-empty. An observation with nothing to cite is a grade. */
  readonly evidence: readonly string[];
  /** ⭐ The exact authored location. ⛔ Never optional, on any surface. */
  readonly returnTo: Address;
  readonly doesNotEstablish: readonly NonConclusion[];
  readonly provenance: Provenance;
  /** ⭐ Present iff the claim reaches beyond the cited passage. */
  readonly coverage?: Coverage;
  /** True where the claim spans the Work rather than the cited passage. */
  readonly crossWork: boolean;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE CONSTRUCTOR — ⭐ it refuses
   ══════════════════════════════════════════════════════════════════════════ */

export type RefusalCode =
  | 'NO_EVIDENCE'
  | 'NO_RETURN_ADDRESS'
  | 'VERDICT_LANGUAGE'
  | 'MACHINERY_IN_COPY'
  | 'CROSS_WORK_WITHOUT_COVERAGE'
  | 'READER_EFFECT_NOT_HYPOTHESIS'
  | 'MISSING_PERMANENT_NON_CONCLUSION';

export interface Refusal { readonly ok: false; readonly code: RefusalCode; readonly detail: string }
export type Built = { readonly ok: true; readonly observation: DevelopObservation } | Refusal;

const no = (code: RefusalCode, detail: string): Refusal => ({ ok: false, code, detail });

export interface ObserveInput {
  id: string;
  domain: DevelopDomain;
  label: string;
  description: string;
  evidence: readonly string[];
  returnTo: Address;
  provenance: Provenance;
  crossWork?: boolean;
  coverage?: Coverage;
  doesNotEstablish?: readonly NonConclusion[];
}

export function observe(input: ObserveInput): Built {
  const crossWork = input.crossWork ?? false;

  if (input.evidence.length === 0) {
    return no('NO_EVIDENCE', `"${input.label}" cites nothing. An observation with nothing to point at is a grade.`);
  }
  if (!input.returnTo.sectionId || !input.returnTo.label) {
    return no('NO_RETURN_ADDRESS', `"${input.label}" has no return. The member must be able to ask "where?" and be taken there.`);
  }

  /* ⭐ The copy check runs on the LABEL AND the description together, because a
     lawful sentence under a verdict heading still asserts the heading. */
  const copy = `${input.label}. ${input.description}`;
  const findings = inspectMemberCopy(copy, 1);
  const verdict = findings.filter((f) => f.code === 'VERDICT_AS_FACT');
  if (verdict.length > 0) {
    return no('VERDICT_LANGUAGE', `"${input.label}": ${verdict[0]?.detail ?? 'grades the Work'}`);
  }
  const machinery = inspectForMachinery(copy);
  if (machinery.length > 0) {
    return no('MACHINERY_IN_COPY', `"${input.label}" exposes implementation vocabulary: ${machinery.join(', ')}`);
  }

  /* ⭐ A claim about the whole Work is bounded by what was read, or it is
     unbounded. ⛔ There is no third option. */
  if (crossWork && !input.coverage) {
    return no('CROSS_WORK_WITHOUT_COVERAGE',
      `"${input.label}" reaches beyond its cited passage and carries no coverage. The claim would be unbounded.`);
  }

  const dne = input.doesNotEstablish ?? [];

  /* ⛔ Reader-domain observations stay possibility-shaped, enforced HERE so a
     non-hedged one never becomes a thing a view could render. */
  if (input.domain === 'reader') {
    const hedged = /\b(might|may|could|perhaps|wonder whether)\b/i.test(input.description);
    if (!hedged) {
      return no('READER_EFFECT_NOT_HYPOTHESIS',
        `"${input.label}" states a reader effect as fact. It stays possibility-shaped: "a reader might…".`);
    }
    if (!dne.includes('reader-effect')) {
      return no('MISSING_PERMANENT_NON_CONCLUSION',
        `"${input.label}" is a reader-perspective entry and must record that it does not establish reader-effect.`);
    }
  }

  return {
    ok: true,
    observation: {
      id: input.id, domain: input.domain, label: input.label, description: input.description,
      evidence: input.evidence, returnTo: input.returnTo,
      doesNotEstablish: dne, provenance: input.provenance,
      crossWork, ...(input.coverage ? { coverage: input.coverage } : {}),
    },
  };
}

/** ⭐ Build a set, ⛔ refusing the whole set if any member is inadmissible.
 *  A view that silently dropped the bad one would render a partial truth. */
export function observeAll(inputs: readonly ObserveInput[]):
  { ok: true; observations: readonly DevelopObservation[] } | Refusal {
  const out: DevelopObservation[] = [];
  for (const i of inputs) {
    const b = observe(i);
    if (!b.ok) return b;
    out.push(b.observation);
  }
  return { ok: true, observations: out };
}

/* ══════════════════════════════════════════════════════════════════════════
   THE CONTINUITY MAP — presence × location

   ⭐ THE LAW, frozen by founder ruling:
   *The map shows WHERE something appears. ⛔ It does not, by itself, tell the
   writer what that presence MEANS or what should change.*
   ══════════════════════════════════════════════════════════════════════════ */

/** ⛔ Presence only. There is no way to grade a book with a presence grid. */
export type Presence = 0 | 1 | 2 | 3;
/**
 * ⭐ Plain FREQUENCY words, and the reason is worth keeping.
 *
 * The first version read `brief mention · moderate · stronger presence`, copied
 * from the reference. The verdict guard refused it on the `strong` stem — a
 * false positive on the rule as written, since presence is countable and not a
 * quality claim.
 *
 * ⭐ But the right repair was the copy, ⛔ not an exemption. The grid measures
 * HOW OFTEN something appears; `often · sometimes · once or twice` says exactly
 * that, needs no editorial ear, and cannot be misread as a grade. *The guard
 * pushed the language toward being plainer and truer, which is what it is for.*
 */
export const PRESENCE_LABEL: Readonly<Record<Presence, string>> = {
  0: 'not here', 1: 'once or twice', 2: 'sometimes', 3: 'often',
};

export interface ThreadRow {
  readonly id: string;
  readonly label: string;
  /** ⭐ `Clara` and `The River` are textual entities; `Belonging` is either the
   *  member's declaration or MAIA's observation — ⛔ and it must say which. */
  readonly provenance: Provenance;
  /** One per unit, in manuscript order. */
  readonly presence: readonly Presence[];
  /** ⭐ Every cell returns. The where-test passes at cell granularity. */
  readonly addressOf: readonly Address[];
}

export interface ContinuityMapData {
  readonly units: readonly string[];
  readonly rows: readonly ThreadRow[];
  readonly coverage: Coverage;
}

export function buildContinuityMap(d: ContinuityMapData):
  { ok: true; map: ContinuityMapData } | Refusal {
  for (const r of d.rows) {
    if (r.presence.length !== d.units.length) {
      return no('NO_EVIDENCE', `row "${r.label}" has ${r.presence.length} cells for ${d.units.length} units`);
    }
    if (r.addressOf.length !== d.units.length) {
      return no('NO_RETURN_ADDRESS', `row "${r.label}" has cells the member cannot open`);
    }
    const v = inspectMemberCopy(r.label, 0).filter((f) => f.code === 'VERDICT_AS_FACT');
    if (v.length > 0) return no('VERDICT_LANGUAGE', `row "${r.label}" grades rather than names`);
  }
  return { ok: true, map: d };
}
