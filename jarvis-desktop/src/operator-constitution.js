// JARVIS Orchestration & Operator — O0 Operator Constitution.
// Pure, deterministic, DOM-free. This module classifies structured acts only.
// Natural-language intent is deliberately NOT interpreted here; O1 owns intent.
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisOperatorConstitution = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CLASSIFICATION = Object.freeze({
    ORCHESTRATION: 'ORCHESTRATION',
    CONSEQUENTIAL: 'CONSEQUENTIAL',
    AUTHORITY_EXPANSION: 'AUTHORITY_EXPANSION',
    HUMAN_JUDGMENT: 'HUMAN_JUDGMENT',
    UNRESOLVED_EVIDENCE: 'UNRESOLVED_EVIDENCE',
    STOP_CONDITION: 'STOP_CONDITION',
  });

  const DECISION = Object.freeze({
    CONTINUE: 'CONTINUE',
    NEEDS_OPERATOR_AUTHORITY: 'NEEDS_OPERATOR_AUTHORITY',
    NEEDS_OPERATOR_JUDGMENT: 'NEEDS_OPERATOR_JUDGMENT',
    BLOCKED_BY_EVIDENCE: 'BLOCKED_BY_EVIDENCE',
    STOP: 'STOP',
  });

  const ACTION_RULES = Object.freeze({
    'repo.read': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'repo.read' },
    'workgraph.decompose': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'orchestration.plan' },
    'worker.select': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'worker.select' },
    'provider.local.select': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'provider.local' },
    'verify.run': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'verify.run' },
    'repair.bounded': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'repair.bounded' },
    'worktree.write': { classification: CLASSIFICATION.ORCHESTRATION, authority: 'repo.write:worktree' },
    'network.external': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'network.external' },
    'repo.disclose:external': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'repo.disclose:external' },
    'provider.spend': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'provider.spend' },
    'pr.create': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'pr.create' },
    merge: { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'merge' },
    deploy: { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'deploy' },
    'production.write': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'production.write' },
    'constraint.waive': { classification: CLASSIFICATION.CONSEQUENTIAL, authority: 'constraint.waive' },
  });

  const CONSTITUTION = Object.freeze({
    programme: 'JARVIS-ORCHESTRATION-OPERATOR-01',
    gate: 'O0',
    principle: 'JARVIS manages complexity. The operator governs consequence.',
    continuationLaw: 'Continue inside established authority when no operator gate is present.',
    noAuthorityCascade: true,
    naturalLanguageGrantsAuthority: false,
    routingGrantsAuthority: false,
    verificationGrantsIntegrationAuthority: false,
    orchestrationPowers: Object.freeze([
      'decompose objective into bounded Work Units',
      'order dependencies and safe parallelism',
      'select admitted workers and local models',
      'assemble bounded context and evidence',
      'sequence verification and permitted bounded repair',
      'track progress, reconcile state, and report failure',
    ]),
    consequentialPowers: Object.freeze([
      'expand authority',
      'create external disclosure or provider spend',
      'resolve product, semantic, values, or strategic intention',
      'create PR, merge, deploy, or production mutation',
      'accept unresolved risk or waive a governing constraint',
    ]),
    stopConditions: Object.freeze([
      'authority absent',
      'governing envelope contradictory',
      'scope indeterminate',
      'verification falsifier established',
      'bounded repair consumed',
      'evidence custody unavailable',
      'required provenance unavailable',
      'human semantic decision required',
    ]),
  });

  function unique(values) {
    return [...new Set(Array.isArray(values) ? values.filter(Boolean).map(String) : [])];
  }

  function classify(input = {}) {
    const action = String(input.action || '').trim();
    const rule = ACTION_RULES[action];
    if (!rule) {
      return {
        action,
        actionClassification: CLASSIFICATION.STOP_CONDITION,
        classification: CLASSIFICATION.STOP_CONDITION,
        requiredAuthorities: [],
        missingAuthorities: [],
        reason: 'Unknown action has no O0 authority classification.',
      };
    }

    const held = new Set(unique(input.heldAuthorities));
    const requiredAuthorities = unique(input.requiredAuthorities || [rule.authority]);
    const missingAuthorities = requiredAuthorities.filter((authority) => !held.has(authority));

    let classification = rule.classification;
    let reason = 'Act remains inside its established authority envelope.';
    if (input.stopReason) {
      classification = CLASSIFICATION.STOP_CONDITION;
      reason = String(input.stopReason);
    } else if (input.unresolvedEvidence === true) {
      classification = CLASSIFICATION.UNRESOLVED_EVIDENCE;
      reason = 'Evidence cannot safely establish progression.';
    } else if (input.humanJudgment === true) {
      classification = CLASSIFICATION.HUMAN_JUDGMENT;
      reason = 'Meaning or product intention requires operator judgment.';
    } else if (missingAuthorities.length) {
      classification = CLASSIFICATION.AUTHORITY_EXPANSION;
      reason = 'The next act requires authority not presently held.';
    }

    return {
      action,
      actionClassification: rule.classification,
      classification,
      requiredAuthorities,
      missingAuthorities,
      reason,
    };
  }

  function decide(input = {}) {
    const result = classify(input);
    let decision = DECISION.CONTINUE;

    if (result.classification === CLASSIFICATION.STOP_CONDITION) decision = DECISION.STOP;
    else if (result.classification === CLASSIFICATION.UNRESOLVED_EVIDENCE) decision = DECISION.BLOCKED_BY_EVIDENCE;
    else if (result.classification === CLASSIFICATION.HUMAN_JUDGMENT) decision = DECISION.NEEDS_OPERATOR_JUDGMENT;
    else if (result.classification === CLASSIFICATION.AUTHORITY_EXPANSION) decision = DECISION.NEEDS_OPERATOR_AUTHORITY;

    return {
      ...result,
      decision,
      operatorRequired: decision !== DECISION.CONTINUE,
    };
  }

  return {
    CLASSIFICATION,
    DECISION,
    ACTION_RULES,
    CONSTITUTION,
    unique,
    classify,
    decide,
  };
});
