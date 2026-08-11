'use strict';
/**
 * JARVIS O-1 Observer — composition.
 *
 * Assembles the adapters into one view. It composes; it does not reconcile.
 * Where two sources disagree or one is missing, that stays visible — the
 * composition layer is forbidden from smoothing uncertainty into a single
 * confident number.
 *
 * Per-family freshness: each family carries its own observed_at. There is no
 * global "updated just now", because one successful refresh does not make every
 * source current.
 */

const {
  readClaims, ratePressure, readRuntime, readGovernance,
  readGit, readPullRequest, readProduction, productionVsTrunk,
} = require('./adapters');
const { freshness, hasValue, CLASS, FRESHNESS, isoNow, carryForward } = require('./reading');

/** Per-family TTLs. Beyond these a reading renders stale rather than current. */
const TTL = Object.freeze({
  claims: 30_000,
  runtime: 20_000,
  governance: 20_000,
  git: 60_000,
  github: 120_000,
  production: 120_000,
});

/**
 * Take one full observation.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot          worktree to observe
 * @param {function} [opts.redact]        publicGovernanceGate
 * @param {object} [opts.previous]        prior view, for last-known carry-forward
 * @param {object} [opts.deps]            injected adapters (tests / negative controls)
 */
async function observeAll(opts = {}) {
  const { repoRoot, redact, previous = null, production = {}, runtime = {}, deps = {} } = opts;

  const _claims = deps.readClaims || readClaims;
  const _runtime = deps.readRuntime || readRuntime;
  const _git = deps.readGit || readGit;
  const _pr = deps.readPullRequest || readPullRequest;
  const _prod = deps.readProduction || readProduction;
  const _gov = deps.readGovernance || readGovernance;

  // Families are independent. One failing must not abort the others, and must
  // not mark the others stale.
  const [claimsRes, runtimeRes, gitRes, prodRes] = await Promise.all([
    _claims({ repoRoot }).catch((e) => ({ claims: null, rate: null, ungoverned: null, _err: e })),
    _runtime(runtime).catch((e) => ({ health: null, runs: null, _err: e })),
    _git({ repoRoot }).catch((e) => ({ _err: e })),
    _prod(production).catch((e) => ({ _err: e })),
  ]);

  const govRes = _gov(runtimeRes.runs, { redact });

  const branchVal = hasValue(gitRes.branch) ? gitRes.branch.value : null;
  const prRes = await _pr({ repoRoot, branch: branchVal }).catch(() => ({ pr: null }));

  const prev = previous && previous.families ? previous.families : {};

  const families = {
    claims: {
      claims: carryForward(claimsRes.claims, prev.claims && prev.claims.claims),
      rate: claimsRes.rate,
      rate_pressure: ratePressure(claimsRes.claims, claimsRes.rate),
      ungoverned_lanes: claimsRes.ungoverned,
    },
    runtime: {
      health: carryForward(runtimeRes.health, prev.runtime && prev.runtime.health),
      runs: runtimeRes.runs,
    },
    governance: {
      gates: govRes.gates,
      waiting_for_founder: govRes.waiting,
    },
    git: {
      branch: gitRes.branch,
      head: gitRes.head,
      dirty: gitRes.dirty,
      trunk_remote: gitRes.trunk_remote,
      branch_on_remote: gitRes.branch_on_remote,
      trunk_delta: gitRes.trunk_delta,
    },
    github: { pr: prRes.pr },
    production: {
      sha: carryForward(prodRes.sha, prev.production && prev.production.sha),
      reach: prodRes.reach,
      vs_trunk: productionVsTrunk(prodRes.sha, gitRes.trunk_remote),
    },
  };

  const now = Date.now();
  const fresh = {};
  for (const [family, ttl] of Object.entries(TTL)) {
    const readings = Object.values(families[family] || {});
    // A family is only LIVE if every reading in it is LIVE. Mixed states resolve
    // downward, so a partially-failed family never presents as current.
    const states = readings.map((r) => freshness(r, ttl, now));
    let state = FRESHNESS.LIVE;
    if (states.includes(FRESHNESS.UNAVAILABLE)) state = FRESHNESS.UNAVAILABLE;
    else if (states.includes(FRESHNESS.UNKNOWN)) state = FRESHNESS.UNKNOWN;
    else if (states.includes(FRESHNESS.STALE)) state = FRESHNESS.STALE;

    const stamps = readings.map((r) => r && r.observed_at).filter(Boolean).sort();
    fresh[family] = {
      state,
      ttl_ms: ttl,
      observed_at: stamps.length ? stamps[stamps.length - 1] : null,
      sources: [...new Set(readings.map((r) => r && r.source).filter(Boolean))],
    };
  }

  return {
    schema: 'jarvis.observer.v1',
    composed_at: isoNow(),
    repo_root: repoRoot || null,
    families,
    freshness: fresh,
    attention: buildAttention(families),
  };
}

/**
 * Genuinely actionable conditions only — the things that need the founder.
 *
 * Deliberately NOT a severity rollup. Each entry keeps its own epistemic class,
 * so "Observer cannot determine production health" never renders in the same
 * shape as "production is unhealthy".
 */
function buildAttention(f) {
  const out = [];
  const push = (kind, klass, text, detail) => out.push({ kind, klass, text, detail: detail ?? null });

  // Rate pressure survives low concurrency.
  const rp = f.claims.rate_pressure;
  if (hasValue(rp) && rp.value.elevated) {
    push('rate', CLASS.DERIVED,
      `Local request rate ${rp.value.band} (concurrency ${rp.value.concurrency_active} — proxy only, not calm)`,
      rp.value.note);
  } else if (rp && rp.klass === CLASS.UNKNOWN) {
    push('rate', CLASS.UNKNOWN, 'Rate pressure indeterminate — low concurrency does NOT imply calm', rp.error);
  }

  // Ungoverned lanes: an inference, labelled.
  const ug = f.claims.ungoverned_lanes;
  if (ug && ug.klass === CLASS.INFERRED && ug.value.ungoverned > 0) {
    push('ungoverned-lanes', CLASS.INFERRED,
      `${ug.value.ungoverned} session lane(s) appear UNGOVERNED (${ug.value.observed_sessions} observed vs ${ug.value.governed_sessions} governed)`,
      ug.basis);
  }

  const col = f.claims.claims;
  if (hasValue(col) && col.value.collisions.length) {
    push('collision', CLASS.OBSERVED, `${col.value.collisions.length} claim collision(s)`);
  }
  if (hasValue(col) && col.value.recoverable.length) {
    push('stale-claim', CLASS.OBSERVED, `${col.value.recoverable.length} stale claim(s) need explicit recovery`);
  }

  const wf = f.governance.waiting_for_founder;
  if (hasValue(wf) && wf.value.length) {
    push('waiting-for-founder', CLASS.OBSERVED, `${wf.value.length} unit(s) waiting for founder`);
  }

  // Remote sync unknown is its own condition — never "probably synchronized".
  const bor = f.git.branch_on_remote;
  if (bor && bor.klass === CLASS.UNKNOWN) {
    push('remote-unknown', CLASS.UNKNOWN, 'Remote synchronization UNKNOWN — remote unreachable', bor.error);
  } else if (hasValue(bor) && !bor.value.present) {
    push('local-only-branch', CLASS.OBSERVED, 'Current branch has NO remote ref — local-only, single copy');
  } else if (hasValue(bor) && bor.value.present && !bor.value.in_sync) {
    push('branch-diverged', CLASS.OBSERVED, 'Local branch differs from its remote ref');
  }

  for (const [family, val] of Object.entries(f)) {
    for (const [key, r] of Object.entries(val)) {
      if (r && r.klass === CLASS.UNAVAILABLE) {
        push('source-down', CLASS.UNAVAILABLE, `${family}.${key} UNAVAILABLE — Observer cannot determine this`, r.error);
      }
    }
  }

  const prod = f.production.sha;
  if (hasValue(prod) && prod.value.provenance === 'BYPASSED') {
    push('provenance', CLASS.OBSERVED, 'Production GIT_COMMIT=unknown — deploy bypassed the provenance chain');
  }

  const pr = f.github.pr;
  if (hasValue(pr) && pr.value) {
    if (pr.value.merge_state === 'BLOCKED') {
      push('pr-blocked', CLASS.OBSERVED, `PR #${pr.value.number} BLOCKED (review: ${pr.value.review_decision || 'none recorded'})`);
    }
    const unreported = pr.value.checks.filter((c) => !c.reported).map((c) => c.name);
    if (unreported.length) {
      push('check-unreported', CLASS.OBSERVED, `Check(s) reporting no conclusion: ${unreported.join(', ')}`);
    }
  }

  return out;
}

module.exports = { observeAll, buildAttention, TTL };
