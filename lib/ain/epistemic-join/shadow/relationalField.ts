/**
 * JARVIS-KP-01 / I4 — MAIA relational-field integration shadow.
 *
 * Mirrors an already-structured, already-provisional synthesis into the I2
 * evaluator. It derives no warrant and claims no semantic force beyond
 * HYPOTHESIZE. Structural telemetry only leaves this module.
 */
import { createHash } from 'node:crypto';

import { evaluateJoin } from '../evaluate';
import type {
  Authorship,
  Endpoint,
  EvaluationRequest,
  JoinEvaluation,
  RefusalCode,
  RelationStanding,
  StandingAct,
} from '../types';

export const EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG =
  'MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW' as const;

export interface ShadowEvidence {
  readonly id: string;
  readonly text: string;
  readonly authoredBy: string;
}

export interface ShadowPacket {
  readonly evidence: readonly ShadowEvidence[];
  readonly packetDigest: string;
}
export interface ShadowInterpretivePlan {
  readonly synthesis: readonly {
    readonly text: string;
    readonly basisEvidenceIds: readonly string[];
  }[];
}

export interface EpistemicJoinShadowTelemetry {
  readonly status: 'evaluated' | 'error';
  readonly proposalCount: number;
  readonly evaluatedCount: number;
  readonly admittedStandingCounts: Readonly<Partial<Record<RelationStanding, number>>>;
  readonly refusalCodeCounts: Readonly<Partial<Record<RefusalCode, number>>>;
  readonly representationClosed: boolean;
  readonly errorCount: number;
}

export interface RelationalFieldEpistemicShadowInput {
  readonly memberId: string;
  readonly modelName: string;
  readonly architectureVersion: string;
  readonly packet: ShadowPacket;
  readonly plan: ShadowInterpretivePlan;
  readonly env?: Readonly<NodeJS.ProcessEnv>;
}

export function epistemicJoinIntegrationShadowEnabled(
  env: Readonly<NodeJS.ProcessEnv> = process.env,
): boolean {
  return env[EPISTEMIC_JOIN_INTEGRATION_SHADOW_FLAG] === '1';
}

const hash = (value: string): string =>
  createHash('sha256').update(value).digest('hex');
const maiaAuthor = (input: RelationalFieldEpistemicShadowInput): Authorship => ({
  authorClass: 'MAIA_PROPOSED',
  roleExercised: 'maia',
  authorRef: `${input.architectureVersion}:${input.modelName}`,
});

function evidenceEndpoint(
  evidence: ShadowEvidence,
  memberId: string,
  packetDigest: string,
): Endpoint {
  if (evidence.authoredBy !== 'member') {
    throw new Error('shadow_basis_not_member_authored');
  }
  return {
    endpointId: evidence.id,
    proposition: `The member authored this conversational evidence: ${evidence.text}`,
    authorship: {
      authorClass: 'MEMBER_AUTHORED',
      roleExercised: 'member',
      authorRef: memberId,
    },
    provenanceRef: `relational-field-shadow:${packetDigest}:${evidence.id}`,
    standing: 'WARRANTED',
    jurisdiction: 'maia_conversational_inquiry',
    boundaries: [],
    mode: 'reliance',
  };
}

export function buildRelationalFieldShadowRequest(
  input: RelationalFieldEpistemicShadowInput,
  synthesisIndex: number,
): EvaluationRequest {
  const synthesis = input.plan.synthesis[synthesisIndex];
  const distinctBasisIds = synthesis ? [...new Set(synthesis.basisEvidenceIds)] : [];
  if (!synthesis || !synthesis.text.trim() || distinctBasisIds.length < 2) {
    throw new Error('shadow_join_requires_two_distinct_basis_evidence');
  }
  const byId = new Map(input.packet.evidence.map((e) => [e.id, e] as const));
  const basis = distinctBasisIds.map((id) => {
    const found = byId.get(id);
    if (!found) throw new Error('shadow_basis_unknown');
    return evidenceEndpoint(found, input.memberId, input.packet.packetDigest);
  });
  const author = maiaAuthor(input);
  const joinId = `rf-shadow-${hash(JSON.stringify({
    packet: input.packet.packetDigest,
    model: input.modelName,
    architecture: input.architectureVersion,
    synthesisIndex,
    synthesis: synthesis.text,
    basis: distinctBasisIds,
  }))}`;
  const act: StandingAct = {
    actId: `${joinId}:proposal`,
    joinId,
    componentId: null,
    claimedStanding: 'CANDIDATE_UNESTABLISHED',
    basis: 'initial_proposal',
    warrantRef: null,
    authorship: author,
    jurisdiction: 'maia_conversational_inquiry',
    supersedesActId: null,
  };

  return {
    envelope: {
      joinId,
      memberScope: input.memberId,
      endpoints: basis,
      relationProposition: synthesis.text,
      relationPredicate: 'maia_provisional_synthesis',
      directional: false,
      claimedSemantics: [],
      operation: 'HYPOTHESIZE',
      authorship: author,
      provenance: {
        introducedBy: author,
        inquiryContext: `relational-field-shadow:${input.packet.packetDigest}`,
        reliedUponRefs: distinctBasisIds,
        referenceOnlyRefs: [],
        transformationStep: 'MAIA provisional synthesis; basis establishes lineage, not entailment',
      },
      jurisdiction: 'maia_conversational_inquiry',
      offeredWarrantRefs: [],
      components: [],
      boundaries: [{
        boundaryId: 'lineage-not-entailment',
        statement: 'Basis evidence establishes lineage only; it does not warrant the synthesis as fact.',
        live: true,
      }],
      uncertainty: {
        statement: 'Integration-shadow synthesis is candidate reasoning only.',
        blocksStrongerStanding: true,
      },
    },
    warrants: [],
    standingActs: [act],
    adoptionActs: [],
    requestedStanding: 'CANDIDATE_UNESTABLISHED',
    requestedJurisdiction: 'maia_conversational_inquiry',
  };
}

const increment = <K extends string>(
  record: Partial<Record<K, number>>,
  key: K,
): void => {
  record[key] = (record[key] ?? 0) + 1;
};

export function evaluateRelationalFieldEpistemicShadow(
  input: RelationalFieldEpistemicShadowInput,
): EpistemicJoinShadowTelemetry | null {
  if (!epistemicJoinIntegrationShadowEnabled(input.env)) return null;

  const standings: Partial<Record<RelationStanding, number>> = {};
  const refusals: Partial<Record<RefusalCode, number>> = {};
  let evaluatedCount = 0;
  let errorCount = 0;
  let representationClosed = true;
  const eligibleIndexes = input.plan.synthesis
    .map((synthesis, index) => ({ index, distinctBasisCount: new Set(synthesis.basisEvidenceIds).size }))
    .filter((item) => item.distinctBasisCount >= 2)
    .map((item) => item.index);

  for (const i of eligibleIndexes) {
    try {
      const result: JoinEvaluation = evaluateJoin(
        buildRelationalFieldShadowRequest(input, i),
      );
      evaluatedCount += 1;
      increment(standings, result.admittedStanding);
      for (const refusal of result.refusals) {
        increment(refusals, refusal.code);
      }
      representationClosed &&=
        result.downstreamRepresentationAuthorized === false
        && result.representationAuthority === 'closed';
    } catch {
      errorCount += 1;
    }
  }

  return {
    status: errorCount > 0 ? 'error' : 'evaluated',
    proposalCount: eligibleIndexes.length,
    evaluatedCount,
    admittedStandingCounts: standings,
    refusalCodeCounts: refusals,
    representationClosed,
    errorCount,
  };
}
