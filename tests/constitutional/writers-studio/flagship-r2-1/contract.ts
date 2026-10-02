/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-1
 * PURE REVIEW DISCUSS ACT CONTRACT
 *
 * NON-EXECUTING CONSTITUTIONAL CONTRACT.
 * No route, provider, persistence, database, UI, retrieval or cognition is wired here.
 */

export type ReadingId = string & { readonly __brand: 'R21ReadingId' };
export type ObservationKey = string & { readonly __brand: 'R21ObservationKey' };
export type SectionId = string & { readonly __brand: 'R21SectionId' };
export type Sha256 = string & { readonly __brand: 'R21Sha256' };
export type AuthorizationRef = string & { readonly __brand: 'R21AuthorizationRef' };
export type DisclosureReceiptRef = string & { readonly __brand: 'R21DisclosureReceiptRef' };

export const readingId = (s: string) => s as ReadingId;
export const observationKey = (s: string) => s as ObservationKey;
export const sectionId = (s: string) => s as SectionId;
export const sha256 = (s: string) => s as Sha256;
export const authorizationRef = (s: string) => s as AuthorizationRef;
export const disclosureReceiptRef = (s: string) => s as DisclosureReceiptRef;

export interface FindingAnchor {
  readonly on: 'observation';
  readonly readingId: ReadingId;
  readonly observationKey: ObservationKey;
}

export type CurrentLocationState =
  | { readonly state: 'current' }
  | { readonly state: 'superseded'; readonly moved: readonly string[] }
  | { readonly state: 'unmeasured' };

export type InputClass =
  | 'MEMBER_WORK_TEXT'
  | 'DURABLE_READING_OUTPUT'
  | 'READING_PROVENANCE';

export type InputRole = 'FINDING' | 'THEN' | 'PROVENANCE';

export interface HistoricalEvidence {
  readonly role: 'THEN';
  readonly inputClass: 'MEMBER_WORK_TEXT';
  readonly sectionId: SectionId;
  readonly revisionNumber: number;
  readonly revisionDigest: Sha256;
  readonly sectionDigest: Sha256;
  readonly range?: { readonly start: number; readonly end: number };
  readonly text: string;
  readonly verified: 'digest-verified';
  readonly evidenceRefs: readonly [string, ...string[]];
}

export interface DurableReadingOutput {
  readonly role: 'FINDING';
  readonly inputClass: 'DURABLE_READING_OUTPUT';
  readonly observation: string;
  readonly doesNotEstablish: readonly string[];
  readonly lens: string;
}

export interface ReadingProvenance {
  readonly role: 'PROVENANCE';
  readonly inputClass: 'READING_PROVENANCE';
  readonly inputFingerprint: string;
  readonly revisionNumber: number;
  readonly evidenceRefs: readonly string[];
  readonly location: CurrentLocationState;
}

export interface R21Authorization {
  readonly kind: 'R2_REVIEW_DISCUSS_ACT';
  readonly ref: AuthorizationRef;
  readonly inputRoles: readonly ['FINDING', 'THEN', 'PROVENANCE'];
  readonly disclosureReceiptRefs:
    readonly [DisclosureReceiptRef, ...DisclosureReceiptRef[]];
}

export interface AuthorizedAsReadObject {
  readonly posture: 'AS_READ';
  readonly finding: FindingAnchor;
  readonly output: DurableReadingOutput;
  readonly then: HistoricalEvidence;
  readonly provenance: ReadingProvenance;
  readonly authorization: R21Authorization;
  readonly now?: never;
  readonly currentProse?: never;
}

export type ExecutablePosture = 'AS_READ';
export type KnownPosture = 'AS_READ' | 'THEN_VS_NOW' | 'CURRENT_TEXT_ONLY';

export type InputManifestEntry =
  | { readonly role: 'FINDING'; readonly inputClass: 'DURABLE_READING_OUTPUT'; readonly authoredBy: 'maia' }
  | { readonly role: 'THEN'; readonly inputClass: 'MEMBER_WORK_TEXT'; readonly authoredBy: 'member' }
  | { readonly role: 'PROVENANCE'; readonly inputClass: 'READING_PROVENANCE'; readonly authoredBy: 'system' };

export interface InputManifest {
  readonly entries: readonly [
    { readonly role: 'FINDING'; readonly inputClass: 'DURABLE_READING_OUTPUT'; readonly authoredBy: 'maia' },
    { readonly role: 'THEN'; readonly inputClass: 'MEMBER_WORK_TEXT'; readonly authoredBy: 'member' },
    { readonly role: 'PROVENANCE'; readonly inputClass: 'READING_PROVENANCE'; readonly authoredBy: 'system' },
  ];
}

export interface R21CrossingDeclaration {
  readonly crossed: true;
  readonly entries: InputManifest['entries'];
}

export interface R21ThreadPolicy {
  readonly persistentThread: true;
  readonly custodyShape: 'SINGLE_ACT';
  readonly historyPolicy: 'NONE';
  readonly priorTurnCount: 0;
  readonly providerHistory: readonly [];
  readonly continuationAuthorized: false;
}

export interface R21Act {
  readonly contractVersion: 'R2-1';
  readonly posture: 'AS_READ';
  readonly object: Omit<AuthorizedAsReadObject, 'authorization'>;
  readonly authorization: R21Authorization;
  readonly inputManifest: InputManifest;
  readonly crossing: R21CrossingDeclaration;
  readonly threadPolicy: R21ThreadPolicy;
  readonly instructions: {
    readonly currentTextClaim: 'FORBIDDEN';
    readonly rereadClaim: 'FORBIDDEN';
    readonly reassessmentClaim: 'FORBIDDEN';
    readonly durableMutation: 'FORBIDDEN';
    readonly temporalPosture: 'AS_READ';
  };
}

const INPUT_ENTRIES: InputManifest['entries'] = Object.freeze([
  Object.freeze({ role: 'FINDING', inputClass: 'DURABLE_READING_OUTPUT', authoredBy: 'maia' }),
  Object.freeze({ role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', authoredBy: 'member' }),
  Object.freeze({ role: 'PROVENANCE', inputClass: 'READING_PROVENANCE', authoredBy: 'system' }),
]);

const THREAD_POLICY: R21ThreadPolicy = Object.freeze({
  persistentThread: true,
  custodyShape: 'SINGLE_ACT',
  historyPolicy: 'NONE',
  priorTurnCount: 0,
  providerHistory: Object.freeze([]) as readonly [],
  continuationAuthorized: false,
});

const INSTRUCTIONS: R21Act['instructions'] = Object.freeze({
  currentTextClaim: 'FORBIDDEN',
  rereadClaim: 'FORBIDDEN',
  reassessmentClaim: 'FORBIDDEN',
  durableMutation: 'FORBIDDEN',
  temporalPosture: 'AS_READ',
});

export function buildR21Act(input: AuthorizedAsReadObject): R21Act {
  const { authorization, ...object } = input;
  return Object.freeze({
    contractVersion: 'R2-1',
    posture: 'AS_READ',
    object: Object.freeze(object),
    authorization: Object.freeze({
      ...authorization,
      inputRoles: Object.freeze([...authorization.inputRoles]) as R21Authorization['inputRoles'],
      disclosureReceiptRefs: Object.freeze([...authorization.disclosureReceiptRefs]) as R21Authorization['disclosureReceiptRefs'],
    }),
    inputManifest: Object.freeze({ entries: INPUT_ENTRIES }),
    crossing: Object.freeze({ crossed: true, entries: INPUT_ENTRIES }),
    threadPolicy: THREAD_POLICY,
    instructions: INSTRUCTIONS,
  });
}

export type PostureAdmission =
  | { readonly admitted: true; readonly posture: 'AS_READ' }
  | { readonly admitted: false; readonly because: 'THEN_VS_NOW_DEFERRED_BEYOND_R2_1' | 'CURRENT_TEXT_ONLY_IS_NOT_REVIEW_DISCUSS' | 'UNKNOWN_POSTURE'; readonly handOff?: 'current-passage-cognition' };

export function admitPosture(posture: string): PostureAdmission {
  if (posture === 'AS_READ') return { admitted: true, posture: 'AS_READ' };
  if (posture === 'THEN_VS_NOW') return { admitted: false, because: 'THEN_VS_NOW_DEFERRED_BEYOND_R2_1' };
  if (posture === 'CURRENT_TEXT_ONLY') return { admitted: false, because: 'CURRENT_TEXT_ONLY_IS_NOT_REVIEW_DISCUSS', handOff: 'current-passage-cognition' };
  return { admitted: false, because: 'UNKNOWN_POSTURE' };
}

export interface ThreadBinding {
  readonly threadRef: string;
  readonly anchor: FindingAnchor;
}

export function bindThread(threadRef: string, anchor: FindingAnchor): ThreadBinding {
  return Object.freeze({
    threadRef,
    anchor: Object.freeze({
      on: 'observation',
      readingId: anchor.readingId,
      observationKey: anchor.observationKey,
    }),
  });
}

export function sameSubject(thread: ThreadBinding, anchor: FindingAnchor): boolean {
  return thread.anchor.readingId === anchor.readingId &&
    thread.anchor.observationKey === anchor.observationKey;
}

export const CONVERSATIONAL_EFFECTS = Object.freeze({
  deletesFinding: false,
  rewritesFinding: false,
  changesStanding: false,
  recordsAgreement: false,
  recordsDisagreement: false,
  createsMemberObservation: false,
  supersedesReading: false,
  commissionsReread: false,
} as const);

export type SanctuaryDecision =
  | { readonly admitted: false; readonly because: 'SANCTUARY_REFUSAL_PRE_OPEN'; readonly threadCreated: false; readonly memberTurnCreated: false; readonly actCreated: false; readonly receiptCreated: false; readonly providerCalled: false; readonly assistantTurnCreated: false; readonly persistedBeforeDecision: false }
  | { readonly admitted: true; readonly because: 'SANCTUARY_ALLOWS_OPEN'; readonly threadCreated: false; readonly memberTurnCreated: false; readonly actCreated: false; readonly receiptCreated: false; readonly providerCalled: false; readonly assistantTurnCreated: false; readonly persistedBeforeDecision: false };

export function sanctuaryDecision(state: 'ALLOW' | 'FORBID'): SanctuaryDecision {
  if (state === 'FORBID') {
    return Object.freeze({
      admitted: false,
      because: 'SANCTUARY_REFUSAL_PRE_OPEN',
      threadCreated: false,
      memberTurnCreated: false,
      actCreated: false,
      receiptCreated: false,
      providerCalled: false,
      assistantTurnCreated: false,
      persistedBeforeDecision: false,
    });
  }
  return Object.freeze({
    admitted: true,
    because: 'SANCTUARY_ALLOWS_OPEN',
    threadCreated: false,
    memberTurnCreated: false,
    actCreated: false,
    receiptCreated: false,
    providerCalled: false,
    assistantTurnCreated: false,
    persistedBeforeDecision: false,
  });
}

export const FINGERPRINT_COVERAGE = Object.freeze({
  mode: 'FULL_ASSEMBLED_INPUT',
  covers: Object.freeze([
    'finding',
    'historical_evidence',
    'posture',
    'current_location',
    'input_manifest',
    'instructions',
  ]),
} as const);

function canonicalInput(act: R21Act): string {
  return JSON.stringify({
    finding: { anchor: act.object.finding, output: act.object.output },
    historical_evidence: act.object.then,
    posture: act.posture,
    current_location: act.object.provenance.location,
    input_manifest: act.inputManifest,
    instructions: act.instructions,
  });
}

export function fingerprintCognitionInput(act: R21Act): string {
  const input = canonicalInput(act);
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < input.length; i += 1) {
    h ^= BigInt(input.charCodeAt(i));
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return 'fnv1a64:' + h.toString(16).padStart(16, '0');
}

export interface AnswerMeta {
  readonly provider: string;
  readonly model: string;
  readonly answeredAt: string;
  readonly answerText: string;
}

export const PROVENANCE_AUTHORITY = 'SERVER' as const;

export interface ResponseEnvelope {
  readonly contractVersion: 'R2-1';
  readonly posture: 'AS_READ';
  readonly provenanceAuthority: 'SERVER';
  readonly anchor: FindingAnchor;
  readonly historicalEvidence: { readonly identity: string; readonly refs: readonly [string, ...string[]] };
  readonly currentLocation: CurrentLocationState;
  readonly inputManifest: InputManifest;
  readonly authorizationRef: AuthorizationRef;
  readonly disclosureReceiptRefs: readonly [DisclosureReceiptRef, ...DisclosureReceiptRef[]];
  readonly historyPolicy: 'NONE';
  readonly provider: string;
  readonly model: string;
  readonly answeredAt: string;
  readonly cognitionInputFingerprint: string;
  readonly answerText: string;
  readonly durableEffect: 'NONE';
}

export function composeResponseEnvelope(act: R21Act, answer: AnswerMeta): ResponseEnvelope {
  const then = act.object.then;
  const range = then.range ? String(then.range.start) + ':' + String(then.range.end) : 'whole-section';
  return Object.freeze({
    contractVersion: 'R2-1',
    posture: 'AS_READ',
    provenanceAuthority: PROVENANCE_AUTHORITY,
    anchor: act.object.finding,
    historicalEvidence: Object.freeze({
      identity: String(then.sectionId) + ':' + String(then.revisionNumber) + ':' + String(then.sectionDigest) + ':' + range,
      refs: then.evidenceRefs,
    }),
    currentLocation: act.object.provenance.location,
    inputManifest: act.inputManifest,
    authorizationRef: act.authorization.ref,
    disclosureReceiptRefs: act.authorization.disclosureReceiptRefs,
    historyPolicy: 'NONE',
    provider: answer.provider,
    model: answer.model,
    answeredAt: answer.answeredAt,
    cognitionInputFingerprint: fingerprintCognitionInput(act),
    answerText: answer.answerText,
    durableEffect: 'NONE',
  });
}

export const INFERENCE_POLICY = Object.freeze({
  seam: 'AUTHORIZED_STRUCTURED_INFERENCE',
  vendorSpecific: false,
  providerPolicyApplies: true,
  runtimeWired: false,
} as const);
