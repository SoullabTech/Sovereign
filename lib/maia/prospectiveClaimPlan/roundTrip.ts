import crypto from 'node:crypto';
import { segmentClaimUnits } from '../claimIdentityShadow/claimUnits';
import { verifyRenderedPlan } from './renderer';
import type { ClaimPlan, PlanSpeechAct, PlanStanding, RenderedClaimPlan } from './types';

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export interface RealizationMapEntry {
  readonly prospectiveClaimId: string;
  readonly retrospectiveClaimId: string;
  readonly startChar: number;
  readonly endChar: number;
  readonly exactTextHash: string;
  readonly prospectiveSpeechAct: PlanSpeechAct;
  readonly prospectiveStanding: PlanStanding;
  readonly retrospectiveKind: string;
}

export interface RoundTripAudit {
  readonly ok: boolean;
  readonly reason: string;
  readonly prospectiveClaimIds: readonly string[];
  readonly retrospectiveClaimIds: readonly string[];
  readonly retrospectiveKinds: readonly string[];
  readonly mappings: readonly RealizationMapEntry[];
  readonly droppedClaimCount: number;
  readonly unplannedUnitCount: number;
}

const fail = (
  plan: ClaimPlan,
  units: ReturnType<typeof segmentClaimUnits>,
  reason: string,
  mappings: readonly RealizationMapEntry[] = [],
): RoundTripAudit => ({
  ok: false,
  reason,
  prospectiveClaimIds: plan.claims.map((c) => c.claimId),
  retrospectiveClaimIds: units.map((u) => u.claimId),
  retrospectiveKinds: units.map((u) => u.kind),
  mappings,
  droppedClaimCount: Math.max(0, plan.claims.length - units.length),
  unplannedUnitCount: Math.max(0, units.length - plan.claims.length),
});

export function auditRenderedRoundTrip(
  plan: ClaimPlan,
  rendered: RenderedClaimPlan,
): RoundTripAudit {
  const units = segmentClaimUnits(`render:${plan.planId}`, rendered.text);
  if (!verifyRenderedPlan(plan, rendered)) return fail(plan, units, 'render-contract-failed');
  if (units.length !== plan.claims.length) return fail(plan, units, 'claim-count-changed');

  const mappings: RealizationMapEntry[] = [];
  const seenRetrospective = new Set<string>();

  for (let i = 0; i < plan.claims.length; i += 1) {
    const claim = plan.claims[i]!;
    const span = rendered.spans[i]!;
    const unit = units[i]!;

    if (unit.startChar !== span.startChar || unit.endChar !== span.endChar) {
      return fail(plan, units, 'surface-span-changed', mappings);
    }
    const renderedSlice = rendered.text.slice(span.startChar, span.endChar);
    if (unit.text !== claim.surfaceText || renderedSlice !== claim.surfaceText || unit.exactTextHash !== sha256(renderedSlice)) {
      return fail(plan, units, 'surface-bytes-changed', mappings);
    }
    if (seenRetrospective.has(unit.claimId)) {
      return fail(plan, units, 'retrospective-unit-reused', mappings);
    }
    seenRetrospective.add(unit.claimId);

    if (claim.speechAct === 'QUESTION' && unit.kind !== 'question') {
      return fail(plan, units, 'question-status-changed', mappings);
    }
    if (claim.speechAct !== 'QUESTION' && unit.kind === 'question') {
      return fail(plan, units, 'assertive-status-changed', mappings);
    }

    mappings.push({
      prospectiveClaimId: claim.claimId,
      retrospectiveClaimId: unit.claimId,
      startChar: unit.startChar,
      endChar: unit.endChar,
      exactTextHash: unit.exactTextHash,
      prospectiveSpeechAct: span.speechAct,
      prospectiveStanding: span.standing,
      retrospectiveKind: unit.kind,
    });
  }

  return {
    ok: true,
    reason: 'one-to-one',
    prospectiveClaimIds: plan.claims.map((c) => c.claimId),
    retrospectiveClaimIds: units.map((u) => u.claimId),
    retrospectiveKinds: units.map((u) => u.kind),
    mappings,
    droppedClaimCount: 0,
    unplannedUnitCount: 0,
  };
}
