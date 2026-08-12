/**
 * RME-001 — Competent-B machinery
 *
 * B is a GENUINE attempt to meet the member beautifully without accumulated
 * member-specific continuity. It is never a deliberately weakened baseline.
 *
 *   B RETAINS: full model capability · ordinary safety · present-conversation
 *   information needed to understand the current utterance · normal relational
 *   intelligence · the original encounter's SANCTUARY/posture constraints.
 *
 *   B LOSES: only accumulated member-specific continuity from before the
 *   experimental boundary.
 *
 * PRE-REGISTERED, before any run:
 *   B > A is a SUCCESSFUL FINDING. It means current memory harmed that encounter.
 *   It is not a test failure, and must not be rerun, reweighted, or explained away.
 *
 * THIS MODULE DOES NOT EXECUTE B. Execution is blocked at COR-B.
 */

import type { ContextProvenance, EncounterRecord, EligibilityStatus } from '../schema/encounter';

export interface CorBStatus {
  /** A1 exposed a broader real /list write footprint than earlier discovery authorized. */
  readonly writeFootprintInventoryCorrected: boolean;
  /** B must not create live member artifacts. Isolation by construction, not cleanup. */
  readonly nonPersistingGenerationGuaranteed: boolean;
  readonly evidenceRef: string | null;
}

export class CorBNotClosed extends Error {
  constructor(status: CorBStatus) {
    super(
      'RME-001: refusing to execute condition B. COR-B is not closed. ' +
        `writeFootprintInventoryCorrected=${status.writeFootprintInventoryCorrected}, ` +
        `nonPersistingGenerationGuaranteed=${status.nonPersistingGenerationGuaranteed}. ` +
        'Do not solve this by generating B through the ordinary live route and cleaning up ' +
        'afterward — the evaluation condition must be isolated by construction.',
    );
    this.name = 'CorBNotClosed';
  }
}

/** Current state. Both false until the founder closes COR-B with bound evidence. */
export const COR_B: CorBStatus = {
  writeFootprintInventoryCorrected: false,
  nonPersistingGenerationGuaranteed: false,
  evidenceRef: null,
};

export function corBClosed(status: CorBStatus = COR_B): boolean {
  return status.writeFootprintInventoryCorrected && status.nonPersistingGenerationGuaranteed;
}

/**
 * The B specification: what context B is permitted, derived from the original encounter.
 * Building this is authorized. Executing it is not.
 */
export interface ConditionBSpec {
  readonly encounterId: string;
  readonly memberMessage: string;
  readonly provenance: ContextProvenance;
  readonly eligibility: EligibilityStatus;
}

export function buildConditionBSpec(args: {
  encounterId: string;
  memberMessage: string;
  originalPosture: string | null;
  experimentalBoundaryTurnId: number | null;
  sameTurnContextAvailable: boolean;
}): ConditionBSpec {
  // Where the exact original posture cannot be established, the encounter is
  // INELIGIBLE_FOR_COUNTERFACTUAL rather than guessed. Changing posture between
  // A and B would create a confound.
  const postureEstablished = args.originalPosture !== null;

  const provenance: ContextProvenance = {
    posture: args.originalPosture ?? 'UNESTABLISHED',
    postureEstablished,
    experimentalBoundaryTurnId: args.experimentalBoundaryTurnId,
    carriedSameTurnContext: args.sameTurnContextAvailable,
    carriedAccumulatedContinuity: false, // the single intended difference from A
    safetyConstraintsApplied: true,
    modelCapabilityFull: true,
  };

  const eligibility: EligibilityStatus = !postureEstablished
    ? 'INELIGIBLE_FOR_COUNTERFACTUAL'
    : corBClosed()
      ? 'ELIGIBLE'
      : 'PENDING_COR_B';

  return {
    encounterId: args.encounterId,
    memberMessage: args.memberMessage,
    provenance,
    eligibility,
  };
}

/** Structural refusal. The execution path does not exist yet, by design. */
export async function executeConditionB(_spec: ConditionBSpec): Promise<never> {
  throw new CorBNotClosed(COR_B);
}

/** Pre-flight assertion for the eventual runner. */
export function assertBIsCompetent(spec: ConditionBSpec): void {
  const p = spec.provenance;
  const weakened: string[] = [];
  if (!p.modelCapabilityFull) weakened.push('model capability reduced');
  if (!p.safetyConstraintsApplied) weakened.push('safety constraints dropped');
  if (!p.carriedSameTurnContext) weakened.push('present-turn context withheld');
  if (!p.postureEstablished) weakened.push('posture unestablished');
  if (weakened.length) {
    throw new Error(
      `RME-001: condition B would be a weakened baseline (${weakened.join('; ')}). ` +
        'B must be a genuine attempt to meet the member beautifully.',
    );
  }
}

/**
 * C is RESERVED. Present as a refusal so that no one later "fills it in".
 * Prohibited substitutes: simulated better memory, hand-curated ideal context,
 * or any prompt telling the model what rehabilitation is supposed to achieve.
 */
export function buildConditionCSpec(): never {
  throw new Error(
    'RME-001: condition C is RESERVED and not constructible. C enters prospectively only ' +
      'when rehabilitation produces a real candidate architecture worth evaluating.',
  );
}

export type { EncounterRecord };
