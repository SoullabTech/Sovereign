import {
  ACCOUNT_ERASURE_ACTIVATION_REGISTRY,
  type AccountErasureActivationRegistry,
} from './accountErasureActivationRegistry';
import { buildAccountErasureShadowPlan } from './accountErasureShadowPlan';
import type { CollectedAccountErasureFacts, RuntimeFkEffectFact } from './accountErasureFacts';
import type { AdapterPlanEntry, ErasureDisposition } from './accountErasureAdapters';

export type ActivationOutcome = 'candidate_destructive_plan' | 'governed_refusal' | 'evidence_incomplete';

export interface DurableErasureDispositionPlan {
  locusKey: string;
  domainKey: string;
  memberLabel: string;
  bindingRule: string;
  plannedDisposition: ErasureDisposition;
  authorityReason: string;
  verificationRule: string;
  adapterKey: string;
  requiresS5: boolean;
}

export interface AccountErasureActivationPlan {
  registryVersion: string;
  outcome: ActivationOutcome;
  activationReady: boolean;
  dispositions: DurableErasureDispositionPlan[];
  blockedLabels: string[];
  blockers: Array<{ code: string; key: string; detail: string }>;
  activeCircleIds: string[] | 'unknown';
}

const SUPPORTED_ACTIVE_ADAPTERS = new Set([
  'account_session',
  'circles_lifecycle',
  'ledger_retention',
  'account_identity_terminal',
  'absence',
]);

function directDisposition(
  entry: AdapterPlanEntry,
  registry: AccountErasureActivationRegistry,
): DurableErasureDispositionPlan {
  const locus = registry.memberBoundLoci.find((x) => x.table === entry.locusKey);
  const shared = entry.key === 'domain:circles:shared_artifacts';
  const synthetic = entry.key === 'synthetic:members-row';
  return {
    locusKey: entry.locusKey,
    domainKey: shared ? 'circles' : synthetic ? 'account_identity' : 'registry',
    memberLabel: entry.memberLabel,
    bindingRule: locus?.bindingRule ?? (shared ? 'shared_artifacts.shared_by' : 'members.id'),
    plannedDisposition: entry.plannedDisposition,
    authorityReason:
      locus?.authorityReason ??
      (shared
        ? 'P5-D: existing Circles sharing lifecycle requires revocation before account identity ends.'
        : 'P5-D: the authenticated member row is the terminal identity-ending disposition.'),
    verificationRule: entry.verificationRule,
    adapterKey: entry.adapterKey,
    // P5-B deliberately left shared_artifacts outside direct-registry S5. P5-D
    // closes that debt: restored Circle representations must stay withdrawn.
    requiresS5: shared ? true : entry.requiresS5,
  };
}

function fkDisposition(
  effect: RuntimeFkEffectFact,
  registry: AccountErasureActivationRegistry,
): DurableErasureDispositionPlan {
  const direct = registry.memberBoundLoci.find((x) => x.table === effect.table);
  const plannedDisposition: ErasureDisposition =
    effect.rows === 0 ? 'no_op' : effect.rows === 'unknown' ? 'refuse' : effect.disposition;
  return {
    locusKey: `fk:${effect.table}:${effect.onDelete}`,
    domainKey: 'member_fk_effect',
    memberLabel: direct?.memberLabel ?? 'linked account records',
    bindingRule:
      `runtime ${effect.table}(${effect.localColumns.join(',') || 'unknown'}) -> members.id ` +
      `ON DELETE ${effect.onDelete}; declarations=${effect.declarationKeys.length}; constraints=${effect.constraintNames.length}`,
    plannedDisposition,
    authorityReason: effect.authorityReason,
    verificationRule:
      effect.rows === 0
        ? 'observed_zero_fk_rows'
        : effect.rows === 'unknown'
          ? 'runtime_fk_evidence_required'
          : direct?.verificationRule ?? 'refusal_means_no_mutation',
    adapterKey: effect.rows === 0 ? 'absence' : direct?.adapterKey ?? 'member_fk_effect',
    requiresS5: effect.rows !== 0 && effect.rows !== 'unknown' ? (direct?.requiresS5 ?? false) : false,
  };
}

export function buildAccountErasureActivationPlan(
  collected: CollectedAccountErasureFacts,
  registry: AccountErasureActivationRegistry = ACCOUNT_ERASURE_ACTIVATION_REGISTRY,
): AccountErasureActivationPlan {
  const shadow = buildAccountErasureShadowPlan(collected.shadowFacts, registry);
  const blockers: Array<{ code: string; key: string; detail: string }> = shadow.blockers.map((x) => ({ ...x }));
  const direct = shadow.entries.map((entry) => directDisposition(entry, registry));
  const fk = collected.fkEffects.map((effect) => fkDisposition(effect, registry));

  for (const effect of collected.fkEffects) {
    if (effect.evidenceProblem) {
      blockers.push({ code: 'runtime_fk_evidence', key: `fk:${effect.key}`, detail: effect.evidenceProblem });
    }
  }
  if (collected.activeCircleIds === 'unknown') {
    blockers.push({ code: 'missing_circle_fact', key: 'circles:active-memberships', detail: 'active Circle ids unavailable' });
  }

  for (const disposition of direct) {
    if (
      disposition.plannedDisposition !== 'no_op' &&
      disposition.plannedDisposition !== 'refuse' &&
      !SUPPORTED_ACTIVE_ADAPTERS.has(disposition.adapterKey)
    ) {
      blockers.push({
        code: 'unsupported_adapter',
        key: disposition.locusKey,
        detail: `P5-D has no executable adapter for ${disposition.adapterKey}`,
      });
    }
  }

  const evidenceIncomplete =
    shadow.outcome === 'evidence_incomplete' ||
    blockers.some((b) => b.code === 'runtime_fk_evidence' || b.code === 'missing_circle_fact');
  const governedRefusal =
    shadow.outcome === 'governed_refusal' ||
    blockers.some((b) => b.code === 'unsupported_adapter');
  const outcome: ActivationOutcome = evidenceIncomplete
    ? 'evidence_incomplete'
    : governedRefusal
      ? 'governed_refusal'
      : 'candidate_destructive_plan';

  const dispositions = [...direct, ...fk];
  const blockedLabels = [...new Set(
    dispositions
      .filter((x) => x.plannedDisposition === 'refuse')
      .map((x) => x.memberLabel),
  )].sort();

  return {
    registryVersion: registry.version,
    outcome,
    activationReady: !registry.activationProhibited && outcome === 'candidate_destructive_plan',
    dispositions,
    blockedLabels,
    blockers,
    activeCircleIds: collected.activeCircleIds,
  };
}
