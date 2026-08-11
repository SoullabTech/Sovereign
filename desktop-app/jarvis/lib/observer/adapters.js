'use strict';
/**
 * JARVIS O-1 Observer — read-only adapters.
 *
 * One adapter per authoritative producer identified in the source map. Each
 * returns Readings, never bare values, and none of them writes anything.
 *
 * STRUCTURAL READ-ONLY (N9): this module never imports the runtime client's
 * POST paths, never spawns a shell, and every subprocess is invoked with a
 * fixed argv array. There is no code path here that can submit a command,
 * mutate a claim, resolve a gate, or deploy. Absence of reach, not absence of
 * buttons.
 *
 * Every producer is injectable so the negative-control suite can exercise
 * failure semantics without standing up real infrastructure.
 */

const { execFile } = require('node:child_process');
const http = require('node:http');

const {
  observed, derived, inferred, unavailable, unknown, hasValue, CLASS,
} = require('./reading');

const DEFAULT_TIMEOUT_MS = 8000;

/** Fixed-argv subprocess. No shell, ever — argv is not a string here by design. */
function runCommand(file, args, { timeout = DEFAULT_TIMEOUT_MS, cwd, env } = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { timeout, cwd, env, encoding: 'utf8', shell: false, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          const reason = err.killed ? `timed out after ${timeout}ms`
            : (String(stderr || err.message).trim().split('\n')[0] || 'command failed');
          resolve({ ok: false, reason, stdout: stdout || '', stderr: stderr || '' });
          return;
        }
        resolve({ ok: true, stdout: stdout || '', stderr: stderr || '' });
      });
  });
}

/* ------------------------------------------------------------------ *
 * 1. CLAIMS — session.mjs status --json
 * ------------------------------------------------------------------ */

/**
 * Preserves two upstream doctrines the producer already encodes:
 *  - concurrency is a PROXY; rate is the variable that actually failed.
 *    Low concurrency must never be rendered as "calm" when rate says otherwise.
 *  - ungoverned lanes: sessions consuming the shared allowance while invisible
 *    to the governed budget.
 */
async function readClaims({ repoRoot, exec = runCommand } = {}) {
  const source = 'session.mjs status --json';
  const r = await exec('node', ['scripts/builder/session.mjs', 'status', '--json'], { cwd: repoRoot });
  if (!r.ok) return { claims: unavailable(source, r.reason), rate: unavailable(source, r.reason), ungoverned: unknown(source) };

  let d;
  try {
    d = JSON.parse(r.stdout);
  } catch (e) {
    const why = `unparseable JSON from producer: ${e.message}`;
    return { claims: unavailable(source, why), rate: unavailable(source, why), ungoverned: unknown(source) };
  }

  const sessions = Array.isArray(d.sessions) ? d.sessions : [];
  const claims = observed({
    limit: d.limit ?? null,
    limit_source: d.limit_source ?? null,
    active: d.active ?? sessions.length,
    queued: d.queued ?? 0,
    sessions: sessions.map((s) => ({
      session_id: s.session_id ?? null,
      work_unit: s.work_unit ?? null,
      owner: s.owner ?? null,
      mode: s.mode ?? null,
      branch: s.branch ?? null,
      worktree: s.worktree ?? null,
      opened_at: s.opened_at ?? null,
      age_s: s.opened_at ? Math.round((Date.now() - new Date(s.opened_at).getTime()) / 1000) : null,
      liveness: s.liveness ?? null,
      recoverable: Boolean(s.liveness && s.liveness.recoverable),
    })),
    queued_sessions: d.queued_sessions ?? [],
    overrides: d.overrides ?? [],
    collisions: d.collisions ?? [],
    recoverable: d.recoverable ?? [],
  }, source);

  // Rate is a SEPARATE reading. It is deliberately not folded into `claims`
  // so that no consumer can render one while silently dropping the other.
  const rr = d.local_request_rate;
  const rate = (!rr || rr.error || rr.overall_band === 'UNKNOWN')
    ? unknown(source, rr && rr.error ? rr.error : 'no rate reading')
    : observed({
        overall_band: rr.overall_band,
        windows: rr.windows ?? {},
        recommendation: rr.recommendation ?? null,
        // Explicit: these are local transcript counts, NOT Anthropic quota units.
        units: 'local transcript request counts',
      }, source);

  // Ungoverned lanes: an INFERENCE, labelled as such.
  let ungoverned = unknown(source, 'rate window unavailable');
  const w60 = rr && rr.windows && rr.windows.w60m;
  if (w60 && typeof w60.distinct_sessions === 'number') {
    const activeN = d.active ?? sessions.length;
    const diff = w60.distinct_sessions - activeN;
    ungoverned = inferred(
      { observed_sessions: w60.distinct_sessions, governed_sessions: activeN, ungoverned: Math.max(0, diff) },
      source,
      'distinct sessions seen in transcripts (60m) exceed Builder-governed sessions; the budget governs only sessions that called session.mjs open',
    );
  }

  return { claims, rate, ungoverned };
}

/**
 * Rate pressure must survive low concurrency. Returns a Reading describing
 * whether pressure exists, and refuses to answer when rate is not observed —
 * "no rate reading" is not "calm".
 */
function ratePressure(claimsR, rateR) {
  const src = 'observer:rate-pressure';
  if (!hasValue(rateR)) {
    return unknown(src, 'rate not observed — pressure indeterminate; low concurrency does NOT imply calm');
  }
  const band = rateR.value.overall_band;
  const elevated = band === 'HIGH' || band === 'ANOMALOUS';
  return derived({
    band,
    elevated,
    concurrency_active: hasValue(claimsR) ? claimsR.value.active : null,
    // The doctrine, carried in the datum itself so a UI cannot drop it.
    note: 'concurrency is a proxy; rate is the variable that actually failed 2026-08-09',
  }, src, [rateR]);
}

/* ------------------------------------------------------------------ *
 * 2. RUNTIME — GET /health, /runs  (REST is truth; SSE is notification)
 * ------------------------------------------------------------------ */

const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);

function httpGetJson(host, port, path, timeout = 4000) {
  return new Promise((resolve) => {
    if (!LOOPBACK.has(host)) { resolve({ ok: false, reason: `non-loopback host refused: ${host}` }); return; }
    const req = http.request({ host, port, path, method: 'GET', timeout }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          resolve({ ok: false, reason: `runtime answered ${res.statusCode}` }); return;
        }
        try { resolve({ ok: true, data: JSON.parse(body) }); }
        catch (e) { resolve({ ok: false, reason: `unparseable runtime response: ${e.message}` }); }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, reason: `timed out after ${timeout}ms` }); });
    req.on('error', (e) => resolve({ ok: false, reason: `${e.code || 'ERR'}: ${e.message}` }));
    req.end();
  });
}

async function readRuntime({ host = '127.0.0.1', port = Number(process.env.JARVIS_RUNTIME_PORT) || 8787, get = httpGetJson } = {}) {
  const source = `jarvis-runtime http://${host}:${port}`;

  const h = await get(host, port, '/health');
  if (!h.ok) {
    // Runtime down means runs are UNAVAILABLE — emphatically not "0 runs".
    return { health: unavailable(source + ' /health', h.reason), runs: unavailable(source + ' /runs', h.reason) };
  }
  const health = observed(h.data, source + ' /health');

  const rs = await get(host, port, '/runs');
  if (!rs.ok) return { health, runs: unavailable(source + ' /runs', rs.reason) };

  const list = Array.isArray(rs.data) ? rs.data : (rs.data && rs.data.runs) || [];
  // Project to display fields. Run records carry packets, results and logs;
  // shipping them whole produced a ~9.5 MB view, which is both a needless IPC
  // load every refresh and a way for material Observer never intended to show
  // to reach the renderer. Keep `gate` — governance redacts it downstream.
  const runs = list.map((r) => ({
    run_id: r.run_id ?? r.id ?? null,
    work_unit: r.work_unit ?? null,
    state: r.state ?? null,
    created_at: r.created_at ?? r.opened_at ?? null,
    updated_at: r.updated_at ?? null,
    principal: r.principal ?? null,
    gate: r.gate ?? null,
  }));
  return { health, runs: observed(runs, source + ' /runs') };
}

/* ------------------------------------------------------------------ *
 * 3. GOVERNANCE — from run records, through publicGovernanceGate
 * ------------------------------------------------------------------ */

/**
 * Governance state is read from already-materialized run records and passed
 * through the existing redaction boundary. Observer never calls a resolver:
 * observation must not silently become governance decision-making.
 *
 * `redact` is injected (the real caller supplies publicGovernanceGate) so this
 * module has no import-time dependency on ESM builder scripts.
 */
function readGovernance(runsR, { redact } = {}) {
  const source = 'run records → publicGovernanceGate';
  if (!hasValue(runsR)) {
    return { gates: unavailable(source, runsR && runsR.error ? runsR.error : 'runs unavailable'), waiting: unknown(source) };
  }
  if (typeof redact !== 'function') {
    // Refuse to display governance rather than expose unredacted internals.
    return {
      gates: unavailable(source, 'publicGovernanceGate unavailable — refusing to render unredacted gate material'),
      waiting: unknown(source),
    };
  }

  const gates = [];
  for (const run of runsR.value) {
    if (!run || !run.gate) continue;
    let pub;
    try { pub = redact(run.gate); } catch (e) { pub = null; }
    if (!pub) continue;
    gates.push({
      run_id: run.run_id ?? run.id ?? null,
      work_unit: run.work_unit ?? null,
      state: run.state ?? null,
      gate: pub,
    });
  }

  const waitingList = gates.filter((g) => {
    const s = String(g.gate.status ?? '').toUpperCase();
    return s.includes('WAIT') || s.includes('PENDING') || s.includes('FOUNDER') || s.includes('BLOCK');
  });

  return {
    gates: observed(gates, source),
    waiting: observed(waitingList, source),
  };
}

/* ------------------------------------------------------------------ *
 * 4. GIT / PR — remote truth from the remote, never from tracking refs
 * ------------------------------------------------------------------ */

/**
 * N6 regression guard. On 2026-08-10 this program reported trunk as 0d145071c
 * by reading an unfetched local tracking ref; true remote trunk was 06f5103ef,
 * which also made the production delta wrong (2 vs 6).
 *
 * Therefore: every remote claim here comes from `git ls-remote` (the remote
 * itself). If ls-remote fails, remote state is UNKNOWN — never "probably
 * synchronized", and never substituted from refs/remotes/*.
 */
async function readGit({ repoRoot, trunk = 'clean-main-no-secrets', exec = runCommand } = {}) {
  const localSrc = 'git (local worktree)';
  const remoteSrc = 'git ls-remote origin';

  const [br, sha, dirty] = await Promise.all([
    exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: repoRoot }),
    exec('git', ['rev-parse', 'HEAD'], { cwd: repoRoot }),
    exec('git', ['status', '--porcelain'], { cwd: repoRoot }),
  ]);

  const branch = br.ok ? observed(br.stdout.trim(), localSrc) : unavailable(localSrc, br.reason);
  const head = sha.ok ? observed(sha.stdout.trim(), localSrc) : unavailable(localSrc, sha.reason);
  const dirtyCount = dirty.ok
    ? observed(dirty.stdout.split('\n').filter((l) => l.trim()).length, localSrc)
    : unavailable(localSrc, dirty.reason);

  // Remote truth — from the remote.
  const ls = await exec('git', ['ls-remote', 'origin'], { cwd: repoRoot, timeout: 20000 });
  if (!ls.ok) {
    return {
      branch, head, dirty: dirtyCount,
      trunk_remote: unavailable(remoteSrc, ls.reason),
      branch_on_remote: unknown(remoteSrc, 'remote unreachable — synchronization state UNKNOWN, not assumed'),
      trunk_delta: unknown('observer:trunk-delta', 'remote trunk unavailable'),
    };
  }

  const refs = new Map();
  for (const line of ls.stdout.split('\n')) {
    const [s, ref] = line.split('\t');
    if (s && ref) refs.set(ref.trim(), s.trim());
  }

  const trunkSha = refs.get(`refs/heads/${trunk}`);
  const trunkRemote = trunkSha
    ? observed(trunkSha, remoteSrc)
    : unavailable(remoteSrc, `refs/heads/${trunk} not present on origin`);

  const branchOnRemote = hasValue(branch)
    ? observed({
        present: refs.has(`refs/heads/${branch.value}`),
        remote_sha: refs.get(`refs/heads/${branch.value}`) ?? null,
        in_sync: hasValue(head) && refs.get(`refs/heads/${branch.value}`) === head.value,
      }, remoteSrc)
    : unknown(remoteSrc, 'local branch unknown');

  let trunkDelta = unknown('observer:trunk-delta', 'inputs unavailable');
  if (hasValue(head) && hasValue(trunkRemote)) {
    const cnt = await exec('git', ['rev-list', '--count', `${head.value}..${trunkRemote.value}`], { cwd: repoRoot });
    trunkDelta = cnt.ok
      ? derived({ behind_trunk: Number(cnt.stdout.trim()) }, 'observer:trunk-delta', [head, trunkRemote])
      : unavailable('observer:trunk-delta', cnt.reason);
  }

  return { branch, head, dirty: dirtyCount, trunk_remote: trunkRemote, branch_on_remote: branchOnRemote, trunk_delta: trunkDelta };
}

async function readPullRequest({ repoRoot, branch, exec = runCommand } = {}) {
  const source = 'gh pr view --json';
  if (!branch) return { pr: unknown(source, 'no branch') };
  const r = await exec('gh', ['pr', 'view', branch, '--json',
    'number,state,mergeable,mergeStateStatus,reviewDecision,headRefOid,statusCheckRollup'],
    { cwd: repoRoot, timeout: 20000 });
  if (!r.ok) {
    // No PR is a legitimate answer; anything else is UNAVAILABLE, never cached.
    if (/no pull requests found|could not resolve/i.test(r.reason)) {
      return { pr: observed(null, source) };
    }
    return { pr: unavailable(source, r.reason) };
  }
  try {
    const d = JSON.parse(r.stdout);
    const checks = Array.isArray(d.statusCheckRollup) ? d.statusCheckRollup : [];
    return { pr: observed({
      number: d.number, state: d.state, mergeable: d.mergeable,
      merge_state: d.mergeStateStatus, review_decision: d.reviewDecision || null,
      head: d.headRefOid,
      checks: checks.map((c) => ({
        name: c.name || c.context || 'check',
        conclusion: c.conclusion || c.state || null,
        reported: Boolean(c.conclusion || c.state),
      })),
    }, source) };
  } catch (e) {
    return { pr: unavailable(source, `unparseable gh output: ${e.message}`) };
  }
}

/* ------------------------------------------------------------------ *
 * 5. PRODUCTION
 * ------------------------------------------------------------------ */

/**
 * "endpoint responded" is not "production healthy". This adapter reports only
 * what it actually established: the provenance SHA and container reachability.
 */
async function readProduction({ host = 'soullab@minisforum', exec = runCommand, enabled = true } = {}) {
  const source = `ssh ${host} docker`;
  if (!enabled) return { sha: unknown(source, 'production probe disabled'), reach: unknown(source, 'production probe disabled') };

  const r = await exec('ssh', ['-o', 'ConnectTimeout=8', '-o', 'BatchMode=yes', host,
    'docker exec maia-sovereign printenv GIT_COMMIT'], { timeout: 20000 });

  if (!r.ok) {
    const why = r.reason;
    // Unreachable is UNAVAILABLE. It is never "healthy", and never "unhealthy"
    // either — we did not establish the container's state, only our own failure.
    return { sha: unavailable(source, why), reach: unavailable(source, why) };
  }
  const sha = r.stdout.trim();
  return {
    sha: sha === 'unknown'
      // Distinct state: the deploy bypassed the provenance chain (CLAUDE.md).
      ? observed({ sha: null, provenance: 'BYPASSED', raw: 'unknown' }, source)
      : observed({ sha, provenance: 'OK', raw: sha }, source),
    reach: observed({ container_responded: true }, source),
  };
}

function productionVsTrunk(prodShaR, trunkRemoteR) {
  const src = 'observer:prod-trunk-delta';
  if (!hasValue(prodShaR) || !hasValue(trunkRemoteR)) {
    return unknown(src, 'comparison requires both production SHA and remote trunk to be OBSERVED');
  }
  if (!prodShaR.value.sha) return unknown(src, 'production provenance bypassed — no SHA to compare');
  return derived({ production: prodShaR.value.sha, trunk: trunkRemoteR.value },
    src, [prodShaR, trunkRemoteR]);
}

module.exports = {
  runCommand,
  readClaims,
  ratePressure,
  readRuntime,
  readGovernance,
  readGit,
  readPullRequest,
  readProduction,
  productionVsTrunk,
  httpGetJson,
  LOOPBACK,
};
