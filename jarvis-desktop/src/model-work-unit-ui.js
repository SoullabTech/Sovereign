// JARVIS Desktop — ROUTER-03B model Work Unit presentation lens.
//
// Pure, DOM-free, dependency-free.
//   renderer  — plain <script>, attaches to window.JarvisModelWorkUnitUI
//   tests     — require('./model-work-unit-ui.js')
//
// This module is deliberately a LENS over ROUTER-03 output. It does not call
// IPC, choose a provider, alter routing, widen budgets, or manufacture standing.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisModelWorkUnitUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WORK_UNIT_ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;

  function cleanText(value, fallback = '—') {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  }

  function humanToken(value) {
    return cleanText(value).replaceAll('_', ' ').replaceAll('-', ' ');
  }

  function validateWorkUnitId(value) {
    const id = typeof value === 'string' ? value.trim() : '';
    if (!id) return { ok: false, id: '', error: 'Enter an existing canonical Work Unit ID.' };
    if (!WORK_UNIT_ID_RE.test(id)) {
      return {
        ok: false,
        id,
        error: 'Work Unit ID must be 3–64 lowercase letters, numbers, or hyphens and cannot be a path.',
      };
    }
    return { ok: true, id, error: null };
  }

  function roleView(card, fallbackRole) {
    if (!card || typeof card !== 'object') return null;
    return {
      provider_id: cleanText(card.provider_id),
      role: humanToken(card.role || fallbackRole),
      locality: card.external_network === true || card.external === true ? 'EXTERNAL' : 'LOCAL',
      provider_standing: humanToken(card.provider_standing),
    };
  }

  function planObject(result) {
    return result?.admission?.orchestration ?? null;
  }

  function summarizePlan(result, workUnitId) {
    const orchestration = planObject(result);
    const plan = orchestration?.plan ?? null;
    const primary = roleView(plan?.primary, 'primary');
    const challengers = Array.isArray(plan?.challengers)
      ? plan.challengers.map((c) => roleView(c, 'challenger')).filter(Boolean)
      : [];

    const budgets = orchestration?.budgets ?? {};
    const status = cleanText(result?.outcome ?? orchestration?.status, 'UNKNOWN');
    const executable = status === 'READY' && orchestration?.executable === true;

    let blocker = null;
    if (!executable) {
      blocker = {
        status,
        detail: cleanText(
          orchestration?.reason
          ?? orchestration?.blocker
          ?? orchestration?.plan?.reason
          ?? result?.reason,
          'The canonical runtime did not admit this Work Unit for execution.',
        ),
      };
    }

    return {
      work_unit_id: cleanText(workUnitId),
      status,
      ready_to_execute: executable,
      primary,
      challengers,
      budget: {
        stages_planned: Array.isArray(orchestration?.stages) ? orchestration.stages.length : null,
        stage_budget: Number.isInteger(budgets.model_stage_budget)
          ? budgets.model_stage_budget
          : (Number.isInteger(orchestration?.model_stage_budget) ? orchestration.model_stage_budget : null),
        external_calls_planned: Number.isInteger(budgets.external_calls_planned)
          ? budgets.external_calls_planned
          : (Number.isInteger(orchestration?.required_external_calls)
            ? orchestration.required_external_calls
            : null),
        external_call_budget: Number.isInteger(budgets.external_call_budget)
          ? budgets.external_call_budget
          : (Number.isInteger(orchestration?.external_call_budget)
            ? orchestration.external_call_budget
            : null),
      },
      blocker,
      disposition: cleanText(result?.disposition ?? result?.admission?.disposition, null),
    };
  }

  function executionGuard(result, summary) {
    const orchestration = planObject(result);
    const stages = Array.isArray(orchestration?.stages)
      ? orchestration.stages.map((s) => ({
          role: s.role ?? null,
          provider_id: s.provider_id ?? null,
          external: s.external === true,
        }))
      : [];
    return JSON.stringify({
      route_plan_id: orchestration?.route_plan_id ?? null,
      status: summary?.status ?? null,
      ready_to_execute: summary?.ready_to_execute === true,
      stages,
      stage_budget: summary?.budget?.stage_budget ?? null,
      external_calls_planned: summary?.budget?.external_calls_planned ?? null,
      external_call_budget: summary?.budget?.external_call_budget ?? null,
    });
  }

  function summarizeExecution(result, priorPlan) {
    const base = priorPlan && typeof priorPlan === 'object'
      ? JSON.parse(JSON.stringify(priorPlan))
      : summarizePlan(result, priorPlan?.work_unit_id ?? result?.admission?.work_unit_id ?? '—');

    base.status = cleanText(result?.outcome ?? result?.admission?.status, 'UNKNOWN');
    base.ready_to_execute = false;
    base.disposition = cleanText(
      result?.disposition
      ?? result?.admission?.disposition
      ?? result?.admission?.orchestration?.disposition,
      null,
    );

    if (base.status !== 'COMPLETE') {
      base.blocker = {
        status: base.status,
        detail: cleanText(
          result?.reason
          ?? result?.admission?.orchestration?.disposition
          ?? result?.admission?.orchestration?.blocker,
          'Execution stopped at a governed boundary.',
        ),
      };
    } else {
      base.blocker = null;
    }
    return base;
  }

  return Object.freeze({
    WORK_UNIT_ID_RE,
    validateWorkUnitId,
    summarizePlan,
    executionGuard,
    summarizeExecution,
    humanToken,
  });
});
