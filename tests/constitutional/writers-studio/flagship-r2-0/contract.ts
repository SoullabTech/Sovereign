/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-0 — REVIEW DISCUSS EPISTEMIC-OBJECT CONSTITUTION · TYPED BOUNDARY CONTRACT
 *
 * Authority: the founder authorization of R2-0 (2026-09-23), §§II–XV. This file types the LAW at the boundary,
 * before any machine exists behind it (the S3 B-i precedent).
 *
 * ⭐ THE QUESTION IT ANSWERS: what exactly is MAIA discussing when a writer discusses a durable Review finding?
 *
 *   the exact reading-local finding            (readingId, observationKey)            §VI
 *   at a DECLARED temporal posture              AS_READ · THEN_VS_NOW · CURRENT_TEXT_ONLY   §III
 *   what the original reader actually saw       digest-verified historical evidence    §III.A, §IV
 *   whether the section has changed             CurrentLocation metadata               §V
 *   whether current prose enters cognition      only under an explicitly lawful posture §III.B, §V
 *   whose material each input is                declared input classes                 §VIII, §IX
 *
 * ⛔ NON-EXECUTING. Not imported by runtime, routes, providers, persistence or UI, and importing it would confer
 *    nothing. It performs no retrieval, no validation of live data, no prompt assembly. Its functions are pure
 *    declarations whose only purpose is to make the epistemic distinctions mechanically expressible and falsifiable.
 * ⛔ THE ANTI-COLLAPSE LAW (§IV): historical evidence, current location and current prose are THREE facts.
 *    recoverEvidence ≠ locateCurrent ≠ load current Work prose. No one may masquerade as another.
 * ⛔ NO RUNTIME AUTHORITY. This file constitutes future cognition law; FS3 remains governing; product behaviour is unchanged.
 */

/* ── identities (brands so a test cannot pass one for another) ── */
export type ReadingId = string & { readonly __brand: 'R2ReadingId' };
export type ObservationKey = string & { readonly __brand: 'R2ObservationKey' };
export type SectionId = string & { readonly __brand: 'R2SectionId' };
export type Sha256 = string & { readonly __brand: 'R2Sha256' };
export const readingId = (s: string) => s as ReadingId;
export const observationKey = (s: string) => s as ObservationKey;
export const sectionId = (s: string) => s as SectionId;
export const sha256 = (s: string) => s as Sha256;

/** §VI — the binding identity of the finding under discussion: the reading-local address the substrate already
 *  carries (`AskAnchor {on:'observation'}`, authorization acts, standing events). ⛔ No `observationId` field:
 *  under §VII `observation_id` is provenance identity only, governed by OBSERVATION-ADDRESS-01, and may not bind a thread. */
export interface FindingAnchor { readonly on: 'observation'; readonly readingId: ReadingId; readonly observationKey: ObservationKey }

/** §V — accepted as constitutional input from `locateCurrent`: digest-based, whole-section granular. It is not prose,
 *  not a reread, not an assessment, and (§V) never a reason to escalate posture. */
export type CurrentLocationState =
  | { readonly state: 'current' }
  | { readonly state: 'superseded'; readonly moved: readonly string[] }
  | { readonly state: 'unmeasured' };

/** §III — three postures. ⛔ Not aliases: three different cognition acts. */
export type Posture = 'AS_READ' | 'THEN_VS_NOW' | 'CURRENT_TEXT_ONLY';

/** §VIII — semantic input classes. The current receipt vocabulary (`source_class = work`) cannot say these apart. */
export type InputClass = 'MEMBER_WORK_TEXT' | 'DURABLE_READING_OUTPUT' | 'READING_PROVENANCE';

/** THEN — MEMBER_WORK_TEXT recovered from the immutable revision the reader actually read, digest-verified. The
 *  verification travels with the text: revision digest, section digest, code-point range as read. It remains member
 *  material although retrieved from history (§VIII). */
export interface HistoricalEvidence {
  readonly role: 'THEN';
  readonly inputClass: 'MEMBER_WORK_TEXT';
  readonly sectionId: SectionId;
  readonly revisionNumber: number;
  readonly revisionDigest: Sha256;
  readonly sectionDigest: Sha256;
  /** code points within the section AS READ; absent = the whole section as read */
  readonly range?: { readonly start: number; readonly end: number };
  readonly text: string;
  readonly verified: 'digest-verified';
}

/** NOW — MEMBER_WORK_TEXT loaded from the Work as it is now, under its OWN admission (§III.B: separately loaded,
 *  separately authorized). ⛔ Never derived from THEN; ⛔ never a stand-in for it. */
export interface CurrentProse {
  readonly role: 'NOW';
  readonly inputClass: 'MEMBER_WORK_TEXT';
  readonly sectionId: SectionId;
  readonly text: string;
  readonly admission: { readonly kind: 'separately_authorized'; readonly authorityRef: string };
}

/** FINDING — DURABLE_READING_OUTPUT: MAIA's prior developmental cognition preserved in the durable reading.
 *  ⛔ Not member-authored Work text; ⛔ never to be receipted as though the member wrote it; ⭐ nevertheless declared. */
export interface DurableReadingOutput {
  readonly role: 'FINDING';
  readonly inputClass: 'DURABLE_READING_OUTPUT';
  readonly observation: string;
  readonly doesNotEstablish: readonly string[];
  readonly lens: string;
}

/** PROVENANCE — READING_PROVENANCE: the machine facts that ground the prior reading. Not prose, not a finding. */
export interface ReadingProvenance {
  readonly role: 'PROVENANCE';
  readonly inputClass: 'READING_PROVENANCE';
  readonly inputFingerprint: string;
  readonly revisionNumber: number;
  readonly evidenceRefs: readonly string[];
  readonly location: CurrentLocationState;
}

/** §III.A — AS_READ: the finding according to what the reader actually read. Current location MAY be known as
 *  metadata (it rides in `provenance.location`); current prose is structurally IMPOSSIBLE (`now?: never`). */
export interface AsReadObject {
  readonly posture: 'AS_READ';
  readonly finding: FindingAnchor;
  readonly output: DurableReadingOutput;
  readonly then: HistoricalEvidence;
  readonly provenance: ReadingProvenance;
  readonly now?: never;
}

/** §III.B — THEN_VS_NOW: lawful ontology, ⛔ not runnable substrate. Both texts REQUIRED, and distinct by role. */
export interface ThenVsNowObject {
  readonly posture: 'THEN_VS_NOW';
  readonly finding: FindingAnchor;
  readonly output: DurableReadingOutput;
  readonly then: HistoricalEvidence;
  readonly now: CurrentProse;
  readonly provenance: ReadingProvenance;
}

/** §III.C — CURRENT_TEXT_ONLY: a recognized category so it cannot be confused with A or B. ⛔ OUTSIDE Review Discuss;
 *  it belongs to current-passage cognition (C1C1 or a later governed successor). Carries no finding by construction. */
export interface CurrentTextOnlyObject {
  readonly posture: 'CURRENT_TEXT_ONLY';
  readonly sectionId: SectionId;
  readonly now: CurrentProse;
  readonly finding?: never;
  readonly output?: never;
  readonly then?: never;
}

/** A Review Discuss object is A or B, and nothing else. An omitted posture is not a member of this union. */
export type ReviewDiscussObject = AsReadObject | ThenVsNowObject;
/** Everything a boundary may be handed; C is admitted to the boundary only so that it can be REFUSED explicitly. */
export type DeclaredCognitionObject = ReviewDiscussObject | CurrentTextOnlyObject;

/** §III.C — the boundary rejects or hands off; it never silently performs C as Review Discuss. */
export type Admission =
  | { readonly admitted: true; readonly object: ReviewDiscussObject }
  | { readonly admitted: false; readonly because: 'CURRENT_TEXT_ONLY_IS_NOT_REVIEW_DISCUSS'; readonly handOff: 'current-passage-cognition' };
export function admitReviewDiscuss(o: DeclaredCognitionObject): Admission {
  return o.posture === 'CURRENT_TEXT_ONLY'
    ? { admitted: false, because: 'CURRENT_TEXT_ONLY_IS_NOT_REVIEW_DISCUSS', handOff: 'current-passage-cognition' }
    : { admitted: true, object: o };
}

/** §IX — the crossing declares EVERY class actually entering cognition, by role and authorship. Derived from the
 *  object, total: it cannot say `work` while a finding rides along undeclared. */
export interface CrossingEntry { readonly role: 'FINDING' | 'THEN' | 'NOW' | 'PROVENANCE'; readonly inputClass: InputClass; readonly authoredBy: 'member' | 'maia' | 'system' }
export interface CrossingDeclaration { readonly posture: Posture; readonly entries: readonly CrossingEntry[] }
export function declareCrossing(o: ReviewDiscussObject): CrossingDeclaration {
  const entries: CrossingEntry[] = [
    { role: 'FINDING', inputClass: o.output.inputClass, authoredBy: 'maia' },
    { role: 'THEN', inputClass: o.then.inputClass, authoredBy: 'member' },
    { role: 'PROVENANCE', inputClass: o.provenance.inputClass, authoredBy: 'system' },
  ];
  if (o.posture === 'THEN_VS_NOW') entries.push({ role: 'NOW', inputClass: o.now.inputClass, authoredBy: 'member' });
  return { posture: o.posture, entries };
}

/** §V — temporal state never escalates posture. AS_READ + superseded is still AS_READ; current prose requires its own
 *  lawful admission. ⛔ No automatic AS_READ → THEN_VS_NOW. The location parameter is accepted and deliberately unread. */
export function postureUnderLocation(declared: Posture, _location: CurrentLocationState): Posture { return declared; }

/** §VI, §XIII — a thread is bound at open to one reading-local finding for its lifetime. */
export interface ThreadBinding { readonly threadRef: string; readonly anchor: FindingAnchor }
export const threadKeyOf = (a: FindingAnchor): string => `${a.readingId}/${a.observationKey}`;
export const bindThread = (threadRef: string, anchor: FindingAnchor): ThreadBinding =>
  Object.freeze({ threadRef, anchor: Object.freeze({ on: anchor.on, readingId: anchor.readingId, observationKey: anchor.observationKey }) });
export const sameSubject = (t: ThreadBinding, a: FindingAnchor): boolean => threadKeyOf(t.anchor) === threadKeyOf(a);
/* ⛔ There is deliberately no repoint / migrate / rebind. A newer reading, a similar observation, a reread of the same
   section, a revision elsewhere or changed current text are each a DIFFERENT epistemic object: a new binding. */

/** §XIV — conversation about a durable finding has no durable effect by itself. Every entry is false; a turn may
 *  question · clarify · contest · explore meaning · compare (compare only in THEN_VS_NOW). The durable semantics of
 *  agreement, disagreement, own observation, standing, Keep, supersession and reread belong to R3+ (§XV). */
export const CONVERSATIONAL_EFFECTS = Object.freeze({
  deletesFinding: false, rewritesFinding: false, changesStanding: false, recordsAgreement: false, recordsDisagreement: false,
  createsMemberObservation: false, supersedesReading: false, commissionsReread: false, repointsThread: false,
} as const);
export type ConversationalAct = 'question' | 'clarify' | 'contest' | 'explore-meaning' | 'compare';
export function actAdmissible(act: ConversationalAct | string, posture: Posture): boolean {
  return act === 'compare' ? posture === 'THEN_VS_NOW' : ['question', 'clarify', 'contest', 'explore-meaning'].includes(act);
}

/** §X–§XII — the seams, stated as typed fact so the record correction cannot drift back into prose.
 *  C1C1 is the editorial-runtime seam (thread open/turn, held current passage, version-checked, no reading identity).
 *  The developmental Ask path separately carries the S3 authorization act, the disclosure receipt and a non-repointing
 *  reading identity. Review Discuss is its OWN cognition act — ⛔ not C1C1 with a finding attached — whose closest prior
 *  ONTOLOGY is the developmental Ask; plumbing may be reused only where contracts are proven compatible. */
export const SEAMS = Object.freeze({
  C1C1: Object.freeze({ seam: 'editorial-runtime', object: 'held current passage', carriesS3AuthorizationAct: false, carriesDisclosureReceipt: false, carriesReadingIdentity: false } as const),
  DEVELOPMENTAL_ASK: Object.freeze({ seam: 'developmental-ask', object: 'observation-anchored thread', carriesS3AuthorizationAct: true, carriesDisclosureReceipt: true, carriesReadingIdentity: true } as const),
  REVIEW_DISCUSS: Object.freeze({ seam: 'not-built', ontology: 'own', isC1C1WithAFindingAttached: false, closestPriorOntology: 'DEVELOPMENTAL_ASK', reusesPlumbing: 'only where contracts are proven compatible' } as const),
} as const);
