/**
 * SERVING-IDENTITY / F2-IM — pure explicit identity-mismatch fact producer.
 *
 * This module compares an already-governed cognition identity commitment
 * against canonical actual serving truth.
 *
 * It does not discover commitments, inspect member text/history, invoke D2/D1,
 * persist evidence, log content, or make routing decisions.
 */

import type { ClassifiedBoolean } from './disclosureFactAdmission';
import type {
  ExecutionDomain,
  LiveServingTruth,
} from '../ai/liveServingTruth';

type ServedModel = Extract<
  NonNullable<LiveServingTruth['served']>,
  { kind: 'model' }
>;

export type CognitionCommitmentProvider = ServedModel['provider'];
export type CognitionCommitmentDomain = Exclude<ExecutionDomain, 'unknown'>;

export type CognitionIdentityCommitmentTarget =
  | {
      kind: 'provider';
      provider: CognitionCommitmentProvider;
    }
  | {
      kind: 'domain';
      domain: CognitionCommitmentDomain;
    };

export type GovernedCognitionCommitmentSource = {
  kind: 'governed_cognition_commitment_registry';
  version: string;
  completeness: 'closed_world' | 'partial';
};

export type NonAuthoritativeCognitionCommitmentSource = {
  kind:
    | 'studio_video_provider'
    | 'trust_drawer_telemetry'
    | 'operator_routing'
    | 'provider_name_in_prose'
    | 'unstructured_member_preference'
    | 'serving_divergence'
    | 'identity_inquiry_fact'
    | 'unknown_source';
};

export type CognitionIdentityCommitmentSource =
  | GovernedCognitionCommitmentSource
  | NonAuthoritativeCognitionCommitmentSource;

export type CognitionIdentityCommitmentEvidence = {
  source: CognitionIdentityCommitmentSource;
  scope: 'covers_current_turn' | 'does_not_cover_current_turn' | 'unknown';
  commitment:
    | { status: 'active'; target: CognitionIdentityCommitmentTarget }
    | { status: 'none' }
    | { status: 'unknown' };
};

const known = (value: boolean): ClassifiedBoolean => ({
  status: 'known',
  value,
});

const unknown = (): ClassifiedBoolean => ({ status: 'unknown' });

function comparableServedModel(
  servingTruth: LiveServingTruth
): ServedModel | null {
  if (
    servingTruth.serviceState !== 'served_model' ||
    servingTruth.served?.kind !== 'model'
  ) {
    return null;
  }

  return servingTruth.served;
}

/**
 * Produce explicitIdentityMismatch from authoritative commitment evidence
 * and actual serving truth.
 */
export function produceExplicitIdentityMismatchFact(
  evidence: CognitionIdentityCommitmentEvidence,
  servingTruth: LiveServingTruth
): ClassifiedBoolean {
  if (evidence.source.kind !== 'governed_cognition_commitment_registry') {
    return unknown();
  }

  if (evidence.source.completeness !== 'closed_world') {
    return unknown();
  }

  if (evidence.scope !== 'covers_current_turn') {
    return unknown();
  }

  if (evidence.commitment.status === 'unknown') {
    return unknown();
  }

  if (evidence.commitment.status === 'none') {
    return known(false);
  }

  const served = comparableServedModel(servingTruth);

  if (!served) {
    return unknown();
  }

  const target = evidence.commitment.target;

  if (target.kind === 'provider') {
    return known(served.provider !== target.provider);
  }

  if (served.domain === 'unknown') {
    return unknown();
  }

  return known(served.domain !== target.domain);
}
