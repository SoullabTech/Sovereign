// JARVIS Desktop — pure founder-intent -> governed Work Unit packet authoring.
// No filesystem, no execution, no provider calls. Main supplies the canonical SHA.
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisOperatorWorkUnit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SUPPORTED_REVIEW_PROVIDERS = Object.freeze(['qwen-local', 'gpt-oss-local', 'nemotron-zen', 'inkling-tinker']);
  const EXTERNAL_REVIEW_PROVIDERS = Object.freeze(['nemotron-zen', 'inkling-tinker']);

  function lines(value) {
    return String(value || '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  function slug(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 34) || 'work';
  }

  function makeId(objective, nowMs) {
    const suffix = Number(nowMs || Date.now()).toString(36).slice(-8);
    return `desktop-${slug(objective)}-${suffix}`.slice(0, 63).replace(/-+$/g, '');
  }

  function parseEvidence(value, canonicalSha) {
    return lines(value).map((row) => {
      // path/to/file.ts:10-40 — line bound at this exact canonical SHA.
      const m = /^(.*?):(\d+)-(\d+)$/.exec(row);
      if (m) {
        return {
          ref: m[1], source_sha: canonicalSha,
          selector: { type: 'lines', start: Number(m[2]), end: Number(m[3]) },
          why: 'Founder-selected evidence focus',
        };
      }
      return { ref: row, selector: { type: 'file' }, why: 'Founder-selected evidence focus' };
    });
  }

  function validateSpec(spec) {
    const objective = String(spec?.objective || '').trim();
    const providers = Array.isArray(spec?.providers) ? [...new Set(spec.providers)] : [];
    const errors = [];
    if (!objective) errors.push('Describe the outcome this Work Unit should produce.');
    if (!providers.length) errors.push('Select at least one review provider.');
    for (const p of providers) if (!SUPPORTED_REVIEW_PROVIDERS.includes(p)) errors.push(`Unsupported provider strategy: ${p}`);
    const externalProviders = providers.filter(p => EXTERNAL_REVIEW_PROVIDERS.includes(p));
    if (externalProviders.length && spec?.externalRepoOk !== true) {
      errors.push('Repository-grounded external review requires explicit read-only repository disclosure authorization.');
    }
    if (providers.includes('inkling-tinker') && spec?.providerSpendOk !== true) {
      errors.push('Inkling is registered as a metered provider; explicit provider-spend authorization is required.');
    }
    return { ok: errors.length === 0, objective, providers, errors };
  }

  function buildPacket(spec, { canonicalSha, nowMs = Date.now() } = {}) {
    const checked = validateSpec(spec);
    if (!checked.ok) return { ok: false, errors: checked.errors, packet: null };
    if (!/^[0-9a-f]{7,40}$/i.test(String(canonicalSha || ''))) {
      return { ok: false, errors: ['Canonical repository SHA is unavailable.'], packet: null };
    }

    const id = makeId(checked.objective, nowMs);
    const acceptance = lines(spec.acceptanceCriteria);
    const selectors = parseEvidence(spec.evidenceFocus, canonicalSha);
    const externalReview = checked.providers.some(p => EXTERNAL_REVIEW_PROVIDERS.includes(p));
    const providerSpend = checked.providers.includes('inkling-tinker') && spec.providerSpendOk === true;
    const acts = ['repo.read'];
    if (externalReview) {
      acts.push('network.external');
      acts.push('repo.disclose:external-readonly');
    }
    if (providerSpend) acts.push('provider.spend');

    const packet = {
      work_unit_id: id,
      title: checked.objective.slice(0, 96),
      objective: checked.objective,
      execution_lane: 'opencode',
      canonical_sha: canonicalSha,
      branch: `chore/ain-delegate-${id}`,
      worktree: null,
      governing_authority: 'Founder-authored via JARVIS Desktop operator flow',
      established_facts: [],
      allowed_files: selectors.map(s => s.ref),
      prohibited_files_actions: [
        'Read-only evaluation only; do not edit repository files.',
        'No production read/write, deploy, merge, or authority mutation.',
        'Model/provider output is evidence, never authority.',
      ],
      acceptance_criteria: acceptance.length ? acceptance : [
        'Return evidence-grounded findings, unresolved risks, and the next bounded action.',
        'Name uncertainty instead of guessing.',
      ],
      verification_commands: [],
      escalation_conditions: [
        'The requested conclusion exceeds the available repository evidence.',
        'A constitutional, consent, privacy, production, deployment, or authority decision is required.',
        'The model cannot distinguish implementation behavior from an intentional safety boundary.',
      ],
      max_attempts: Math.max(2, checked.providers.length),
      expected_output: 'A concise independent review with evidence, falsifiers, unresolved questions, and a recommended next bounded action. No code changes.',
      context_selectors: selectors,
      project: 'JARVIS Desktop',
      capability: 'governed-provider-review',
      task_class: 'independent_evaluation',
      risk_class: 'high',
      priority: 'current',
      dependencies: [], blockers: [],
      authorized_acts: acts,
      not_authorized_acts: [
        'repo.write:worktree', 'production.read', 'production.write', 'deploy', 'authority.change',
        ...(externalReview ? [] : ['network.external', 'repo.disclose:external-readonly']),
        ...(providerSpend ? [] : ['provider.spend']),
      ],
      integration_actor: 'founder',
      autonomy_ceiling: 'LEVEL_1_REVIEW',
      provider_strategy: checked.providers,
      routing: {
        evidence_class: externalReview ? 'E3_EXTERNAL_REPO_BUNDLE' : 'E1_REPOSITORY_LOCAL',
        task_shape: String(spec?.taskShape || 'FRONTIER_UNKNOWN'),
      },
      disclosure: {
        repository_read_only_external: externalReview,
        provider_spend_authorized: providerSpend,
      },
    };
    return { ok: true, errors: [], packet };
  }

  return { SUPPORTED_REVIEW_PROVIDERS, lines, slug, makeId, parseEvidence, validateSpec, buildPacket };
});
