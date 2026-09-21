/**
 * JARVIS-KP-01 / I4 — Now What cell-candidate integration shadow.
 *
 * This is the deliberately narrow first real-path adapter:
 * existing read-only CellCandidate -> explicit canonical I2 request -> structural
 * shadow telemetry -> discard.
 *
 * It imports canonical I2 evaluation only. It has no I3 persistence import, no
 * response object, no router/provider handle, and no downstream representation
 * capability.
 */

import { evaluateJoin } from '../evaluate';
import type {
  EvaluationRequest,
  Jurisdiction,
  RefusalCode,
  RelationStanding,
} from '../types';
import { epistemicJoinIntegrationShadowEnabled } from './feature';

export type ShadowCellElement = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

export interface ShadowCellCandidate {
  readonly element: ShadowCellElement;
  readonly phase: 1 | 2 | 3;
  readonly confidence: number;
  readonly source: 'system_inferred';
}

export type ShadowTranslationRefusal =
  | 'missing_member_scope'
  | 'missing_jurisdiction'
  | 'wrong_jurisdiction'
  | 'invalid_candidate';

export type ShadowStatus =
  | 'disabled'
  | 'no_candidate'
  | 'translation_refused'
  | 'evaluated'
  | 'evaluation_error';

export interface EpistemicJoinShadowTelemetry {
  readonly surface: 'now_what_cell_candidate';
  readonly shadowOnly: true;
  readonly downstreamRepresentationAuthorized: false;
  readonly status: ShadowStatus;
  readonly translationRefusal?: ShadowTranslationRefusal;
  readonly requestedJurisdiction?: Jurisdiction;
  readonly admittedStanding?: RelationStanding;
  readonly refusalCodes?: readonly RefusalCode[];
  readonly relianceValid?: boolean;
  readonly compositeWarrantRequired?: boolean;
}

export interface NowWhatCellShadowInput {
  readonly memberScope: string;
  readonly jurisdiction: Jurisdiction | null | undefined;
  readonly candidate: ShadowCellCandidate | null;
  readonly env?: Readonly<NodeJS.ProcessEnv>;
  /** Structural-only sink. Sink failure is swallowed and can never fail the request. */
  readonly emit?: (telemetry: EpistemicJoinShadowTelemetry) => void;
}

export type ShadowTranslation =
  | { readonly ok: true; readonly request: EvaluationRequest }
  | { readonly ok: false; readonly reason: ShadowTranslationRefusal };

const ELEMENTS = new Set<ShadowCellElement>(['Fire', 'Water', 'Earth', 'Air', 'Aether']);

const MEMBER_TURN_BOUNDARY = {
  boundaryId: 'i4-now-what-member-turn-bounded',
  statement:
    'The member turn is relied upon only as source material for this one system inference; it is not promoted into a durable member trait.',
  live: true,
} as const;

const CELL_CANDIDATE_BOUNDARY = {
  boundaryId: 'i4-now-what-cell-candidate-bounded',
  statement:
    'The cell candidate is a tentative system inference, not identity, diagnosis, member adoption, or established standing.',
  live: true,
} as const;

function safeEmit(
  emit: NowWhatCellShadowInput['emit'],
  telemetry: EpistemicJoinShadowTelemetry,
): void {
  if (!emit) return;
  try {
    emit(telemetry);
  } catch {
    // Shadow observability is not request authority.
  }
}

function validCandidate(candidate: ShadowCellCandidate): boolean {
  return (
    ELEMENTS.has(candidate.element) &&
    (candidate.phase === 1 || candidate.phase === 2 || candidate.phase === 3) &&
    Number.isFinite(candidate.confidence) &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    candidate.source === 'system_inferred'
  );
}

/**
 * Convert only information the Now What seam already knows into a canonical I2
 * request. No member confirmation, warrant, source independence, causation,
 * diagnosis, scientific standing, motive, or representation authority is
 * invented.
 */
export function translateNowWhatCellCandidate(
  input: Pick<NowWhatCellShadowInput, 'memberScope' | 'jurisdiction' | 'candidate'>,
): ShadowTranslation {
  const memberScope = input.memberScope.trim();
  if (!memberScope) return { ok: false, reason: 'missing_member_scope' };
  if (!input.jurisdiction) return { ok: false, reason: 'missing_jurisdiction' };
  if (input.jurisdiction !== 'maia_conversational_inquiry') {
    return { ok: false, reason: 'wrong_jurisdiction' };
  }
  if (!input.candidate || !validCandidate(input.candidate)) {
    return { ok: false, reason: 'invalid_candidate' };
  }

  const candidate = input.candidate;
  const memberEndpointId = 'now-what:member-turn';
  const cellEndpointId = 'now-what:cell-candidate';

  return {
    ok: true,
    request: {
      envelope: {
        joinId: 'shadow:now-what:cell-candidate',
        memberScope,
        endpoints: [
          {
            endpointId: memberEndpointId,
            proposition: 'A current member turn exists in the Now What interview.',
            authorship: {
              authorClass: 'MEMBER_AUTHORED',
              roleExercised: 'member',
              authorRef: memberScope,
            },
            provenanceRef: 'now-what:request-history:last-member-turn',
            standing: 'WARRANTED',
            jurisdiction: 'member_lived_account',
            boundaries: [MEMBER_TURN_BOUNDARY],
            mode: 'reliance',
          },
          {
            endpointId: cellEndpointId,
            proposition:
              `The system produced a tentative Spiralogic cell candidate: ${candidate.element}, phase ${candidate.phase}.`,
            authorship: {
              authorClass: 'MAIA_PROPOSED',
              roleExercised: 'maia',
              authorRef: 'now-what:detectCellCandidate',
            },
            provenanceRef: 'now-what:detectCellCandidate',
            standing: 'CANDIDATE_UNESTABLISHED',
            jurisdiction: 'maia_conversational_inquiry',
            boundaries: [CELL_CANDIDATE_BOUNDARY],
            mode: 'reliance',
          },
        ],
        relationProposition:
          'The current member turn is tentatively associated, by system inference only, with the detected Spiralogic cell candidate.',
        relationPredicate: 'tentatively_associated_with_cell_candidate',
        directional: true,
        claimedSemantics: ['association'],
        operation: 'HYPOTHESIZE',
        authorship: {
          authorClass: 'MAIA_PROPOSED',
          roleExercised: 'maia',
          authorRef: 'now-what:detectCellCandidate',
        },
        provenance: {
          introducedBy: {
            authorClass: 'MAIA_PROPOSED',
            roleExercised: 'maia',
            authorRef: 'now-what:detectCellCandidate',
          },
          inquiryContext: 'Now What turn cell-candidate shadow evaluation',
          reliedUponRefs: [memberEndpointId, cellEndpointId],
          referenceOnlyRefs: [],
          transformationStep:
            'keyword-gated detectCellCandidate output -> explicit candidate relation; no member adoption or warrant inferred',
        },
        jurisdiction: 'maia_conversational_inquiry',
        offeredWarrantRefs: [],
        components: [],
        boundaries: [MEMBER_TURN_BOUNDARY, CELL_CANDIDATE_BOUNDARY],
        uncertainty: {
          statement:
            `System keyword inference only (reported confidence ${candidate.confidence}); no stronger standing is inferred.`,
          blocksStrongerStanding: true,
        },
      },
      warrants: [],
      standingActs: [],
      adoptionActs: [],
      requestedStanding: 'CANDIDATE_UNESTABLISHED',
      requestedJurisdiction: 'maia_conversational_inquiry',
    },
  };
}

/**
 * Run the real-path shadow evaluation. The result is structural telemetry only.
 * This function never throws and never persists.
 */
export async function runNowWhatCellShadow(
  input: NowWhatCellShadowInput,
): Promise<EpistemicJoinShadowTelemetry> {
  if (!epistemicJoinIntegrationShadowEnabled(input.env)) {
    return {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: false,
      status: 'disabled',
    };
  }

  if (input.candidate === null) {
    const telemetry: EpistemicJoinShadowTelemetry = {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: false,
      status: 'no_candidate',
    };
    safeEmit(input.emit, telemetry);
    return telemetry;
  }

  let translated: ShadowTranslation;
  try {
    translated = translateNowWhatCellCandidate(input);
  } catch {
    const telemetry: EpistemicJoinShadowTelemetry = {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: false,
      status: 'evaluation_error',
    };
    safeEmit(input.emit, telemetry);
    return telemetry;
  }

  if (!translated.ok) {
    const telemetry: EpistemicJoinShadowTelemetry = {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: false,
      status: 'translation_refused',
      translationRefusal: translated.reason,
    };
    safeEmit(input.emit, telemetry);
    return telemetry;
  }

  try {
    const evaluation = evaluateJoin(translated.request);
    const telemetry: EpistemicJoinShadowTelemetry = {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: evaluation.downstreamRepresentationAuthorized,
      status: 'evaluated',
      requestedJurisdiction: translated.request.requestedJurisdiction,
      admittedStanding: evaluation.admittedStanding,
      refusalCodes: [...new Set(evaluation.refusals.map((item) => item.code))].sort(),
      relianceValid: evaluation.relianceValid,
      compositeWarrantRequired: evaluation.compositeWarrantRequired,
    };
    safeEmit(input.emit, telemetry);
    return telemetry;
  } catch {
    const telemetry: EpistemicJoinShadowTelemetry = {
      surface: 'now_what_cell_candidate',
      shadowOnly: true,
      downstreamRepresentationAuthorized: false,
      status: 'evaluation_error',
    };
    safeEmit(input.emit, telemetry);
    return telemetry;
  }
}
