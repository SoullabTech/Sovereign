/** D13 — the constitution states C1C1 as carrying the S3 authorization-act / disclosure-receipt model. */
export * from '../contract';
import { SEAMS as reference } from '../contract';
export const SEAMS = Object.freeze({
  ...reference,
  C1C1: { ...reference.C1C1, carriesS3AuthorizationAct: true, carriesDisclosureReceipt: true },
  REVIEW_DISCUSS: { ...reference.REVIEW_DISCUSS, isC1C1WithAFindingAttached: true, closestPriorOntology: 'C1C1' },
});
