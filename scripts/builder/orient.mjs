#!/usr/bin/env node
/**
 * /orient — deterministic orientation probe for JARVIS Closed Loop 1.
 *
 * Design: docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md
 *
 * Establishes CURRENT REALITY by measurement, independently of any packet.
 * When given a continuation packet, the packet is a CLAIM SET TO TEST, never a
 * state snapshot to trust: no packet claim is promoted into a current-state fact.
 *
 * Read-only. Runs git plumbing and stats files. Writes nothing.
 *
 * Usage:
 *   node scripts/builder/orient.mjs [--packet <path>] [--json] [--trunk <ref>]
 *                                   [--deployed]   # gated production re-witness
 *
 * Exit: 0 always (orientation is a reading, not a gate). Escalation is in the output.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';

const UNKNOWN = 'UNKNOWN';
const NOT_NEEDED = 'UNKNOWN-NOT-NEEDED';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => {
  const i = args.indexOf(n);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};

function git(a, { allowFail = true } = {}) {
  try {
    return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    if (allowFail) return null;
    throw new Error(`git ${a.join(' ')} failed`);
  }
}

// ---------------------------------------------------------------- A. workspace
function workspace() {
  const top = git(['rev-parse', '--show-toplevel']);
  if (!top) return { error: 'not a git repository' };
  const gitDir = git(['rev-parse', '--absolute-git-dir']);
  const commonDir = path.resolve(top, git(['rev-parse', '--git-common-dir']) || '.git');
  return {
    worktree: top,
    is_linked_worktree: path.resolve(gitDir) !== path.resolve(commonDir),
    git_common_dir: commonDir,
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),          // never session gitStatus
    head_sha: git(['rev-parse', '--short', 'HEAD']),
    head_sha_full: git(['rev-parse', 'HEAD']),
    head_committed_at: git(['log', '-1', '--format=%cI', 'HEAD']),
    upstream: git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']) ?? UNKNOWN,
    dirty_count: (() => {
      const s = git(['status', '--porcelain']);
      return s === null ? UNKNOWN : (s === '' ? 0 : s.split('\n').length);
    })(),
  };
}

// ------------------------------------------------------------------- B. trunk
// Provenance-aware: report WHICH source named the trunk, never guess silently.
function trunk(explicit) {
  const candidates = [];
  if (explicit) candidates.push([explicit, 'flag']);
  if (process.env.BUILDER_TRUNK) candidates.push([process.env.BUILDER_TRUNK, 'env:BUILDER_TRUNK']);
  const claudeMd = path.join(git(['rev-parse', '--show-toplevel']) ?? '.', 'CLAUDE.md');
  if (existsSync(claudeMd)) {
    const m = readFileSync(claudeMd, 'utf8').match(/\b(clean-main-no-secrets)\b/);
    if (m) candidates.push([m[1], 'CLAUDE.md']);
  }
  const originHead = git(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
  if (originHead) candidates.push([originHead.replace(/^origin\//, ''), 'origin/HEAD']);
  candidates.push(['main', 'default'], ['master', 'default']);

  for (const [ref, source] of candidates) {
    const resolved = git(['rev-parse', '--verify', '--quiet', ref]);
    if (resolved) {
      const counts = git(['rev-list', '--left-right', '--count', `${ref}...HEAD`]);
      const [behind, ahead] = counts ? counts.split(/\s+/).map(Number) : [UNKNOWN, UNKNOWN];
      return { name: ref, source, sha: resolved.slice(0, 9), ahead, behind };
    }
  }
  return { name: UNKNOWN, source: UNKNOWN, ahead: UNKNOWN, behind: UNKNOWN };
}

// ------------------------------------------------- C. cache / generated hazards
// A generated artifact NEWER than HEAD's commit may encode pre-HEAD state and
// silently contaminate any instrument that consumes it.
const HAZARD_PATHS = [
  'tsconfig.ship.tsbuildinfo', 'tsconfig.tsbuildinfo', '.next/cache',
  'node_modules/.cache', '.turbo', 'artifacts', 'coverage', '.eslintcache',
];

function hazards(root, headCommittedAt) {
  if (!headCommittedAt) return { status: UNKNOWN, items: [] };
  const headMs = Date.parse(headCommittedAt);
  const items = [];
  for (const rel of HAZARD_PATHS) {
    const p = path.join(root, rel);
    if (!existsSync(p)) continue;
    const mtime = statSync(p).mtime;
    const newer = mtime.getTime() > headMs;
    items.push({
      path: rel,
      mtime: mtime.toISOString(),
      newer_than_head: newer,
      tracked: git(['ls-files', '--error-unmatch', rel]) !== null,
    });
  }
  const flagged = items.filter((i) => i.newer_than_head);
  return {
    status: flagged.length ? 'HAZARD' : (items.length ? 'clear' : 'none-present'),
    head_committed_at: headCommittedAt,
    items,
    flagged: flagged.map((i) => i.path),
  };
}

// ------------------------------------------------ D. deployed referent (GATED)
function deployed(enabled) {
  if (!enabled) {
    return { deployed_sha: NOT_NEEDED, note: 'not acquired — task made no production claim' };
  }
  const out = (() => {
    try {
      return execFileSync('ssh', ['soullab@minisforum',
        'docker exec maia-sovereign printenv GIT_COMMIT'],
        { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch { return null; }
  })();
  return out ? { deployed_sha: out } : { deployed_sha: UNKNOWN, note: 'probe failed — remains UNKNOWN, do not infer' };
}

// ------------------------------------------- D2. governance: claims + capacity
/**
 * Horizon III. `/orient` must be able to answer, BEFORE writable work begins:
 * does someone already own this worktree, and is there Claude capacity for me?
 *
 * This READS the session registry — it never claims, never opens, never releases.
 * Orientation is a reading. Acquiring a claim is a separate deliberate act
 * (`session.mjs open`), because a probe that silently acquired authority would be
 * exactly the "model grants itself authority" failure the directive forbids.
 *
 * Both fields are UNKNOWN when the registry cannot be read — never "free".
 */
function governance(ws) {
  const here = path.dirname(new URL(import.meta.url).pathname);
  const sessionCli = path.join(here, 'session.mjs');
  if (!existsSync(sessionCli)) {
    return { status: UNKNOWN, reason: 'session registry not installed at ' + sessionCli };
  }
  let st;
  try {
    st = JSON.parse(execFileSync('node', [sessionCli, 'status', '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (e) {
    return { status: UNKNOWN, reason: `session registry unreadable: ${e.message}` };
  }

  const sessions = st.sessions ?? [];
  // A worktree is claimed if a live WRITE session holds it. Read-only sessions
  // hold no baseline and never block a writer.
  const writers = sessions.filter((s) => s.mode !== 'read-only');
  const holder = writers.find((s) => s.worktree === ws.worktree) ?? null;
  const branchHolder = writers.find((s) => s.branch === ws.branch) ?? null;

  const capacityFull = (st.active ?? 0) >= (st.limit ?? 1);

  return {
    status: 'MEASURED',
    worktree_claim: holder
      ? { claimed: true, by: holder.session_id, work_unit: holder.work_unit,
          owner: holder.owner, since: holder.opened_at, mode: holder.mode }
      : { claimed: false },
    branch_claim: branchHolder && branchHolder !== holder
      ? { claimed: true, by: branchHolder.session_id, branch: branchHolder.branch }
      : { claimed: false },
    claude_capacity: {
      active: st.active ?? 0, limit: st.limit ?? null,
      limit_source: st.limit_source ?? UNKNOWN,
      full: capacityFull,
      may_claim_slot: !capacityFull,
    },
    local_request_rate: st.local_request_rate
      ? { overall_band: st.local_request_rate.overall_band,
          w60m: st.local_request_rate.windows?.w60m ?? null,
          recommendation: st.local_request_rate.recommendation ?? null,
          caveat: 'LOCAL observability — not Anthropic quota units' }
      : { overall_band: UNKNOWN },
    contended: sessions.filter((s) => (s.collisions?.length ?? 0) > 0)
      .map((s) => ({ session_id: s.session_id, work_unit: s.work_unit })),
  };
}

// ---------------------------------------------------------- E. packet as CLAIMS
// Classification vocabulary (design §1, founder-specified):
//   confirmed | drifted | contradicted | not_measurable | governance_witness
function parsePacket(text) {
  const claims = {};
  const probeBlock = text.match(/##\s*DRIFT PROBES[^\n]*\n([\s\S]*?)(?=\n##\s|\n*$)/i)
                  ?? text.match(/##\s*BASELINE[^\n]*\n([\s\S]*?)(?=\n##\s|\n*$)/i);
  if (probeBlock) {
    for (const line of probeBlock[1].split('\n')) {
      const m = line.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/i);
      if (m) claims[m[1].toLowerCase()] = m[2].replace(/\s*·.*$/, '').trim();
    }
  }
  // Entry markers: '-' (list), '?' (open question), '∅' (not measured).
  // '∅' MUST be recognised — a dropped UNKNOWN is silently inferred by the successor,
  // which is the exact failure this contract exists to prevent.
  const ENTRY = /^[-?∅]/;
  const section = (name) => {
    const m = text.match(new RegExp(`##\\s*${name}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`, 'i'));
    return m ? m[1].split('\n').map((l) => l.trim()).filter((l) => ENTRY.test(l)) : [];
  };
  return {
    claims,
    changed: section('CHANGED'),
    governing: section('GOVERNING DECISIONS'),
    verified: section('VERIFIED'),
    unknowns: section('OPEN').filter((l) => l.includes('∅')),
  };
}

function classify(packet, now, root) {
  const out = [];
  const cmp = (field, claimed, measured, onDiff) => {
    if (claimed === undefined || claimed === null) return;
    if (String(measured) === String(claimed)) {
      out.push({ field, claimed, measured, verdict: 'confirmed', action: 'ok' });
    } else {
      out.push({ field, claimed, measured, ...onDiff });
    }
  };

  cmp('branch', packet.claims.branch, now.workspace.branch,
    { verdict: 'contradicted', action: 'STOP', why: 'wrong lane — a packet from another branch' });
  cmp('head_sha', packet.claims.head_sha, now.workspace.head_sha,
    { verdict: 'drifted', action: 'WARN', why: `replay: git log ${packet.claims.head_sha}..HEAD` });
  cmp('worktree', packet.claims.worktree, now.workspace.worktree,
    { verdict: 'contradicted', action: 'STOP', why: 'correct handoff, wrong checkout' });

  if (packet.claims.dirty !== undefined) {
    const claimed = String(packet.claims.dirty).match(/\d+/)?.[0];
    const measured = String(now.workspace.dirty_count);
    out.push(claimed === measured
      ? { field: 'dirty', claimed, measured, verdict: 'confirmed', action: 'ok' }
      : { field: 'dirty', claimed, measured, verdict: 'drifted', action: 'WARN',
          why: 'uncommitted work the packet did not know about' });
  }

  if (packet.claims.production_sha && packet.claims.production_sha !== 'n/a') {
    const m = now.deployed.deployed_sha;
    out.push(m === NOT_NEEDED || m === UNKNOWN
      ? { field: 'production_sha', claimed: packet.claims.production_sha, measured: m,
          verdict: 'not_measurable', action: 'UNKNOWN',
          why: 'production not re-witnessed — every production-referent claim stays unverified' }
      : (m === packet.claims.production_sha
          ? { field: 'production_sha', claimed: packet.claims.production_sha, measured: m, verdict: 'confirmed', action: 'ok' }
          : { field: 'production_sha', claimed: packet.claims.production_sha, measured: m,
              verdict: 'drifted', action: 'WARN', why: 'invalidates production-referent claims' }));
  }

  if (packet.claims.migrations) {
    out.push({ field: 'migrations', claimed: packet.claims.migrations, measured: UNKNOWN,
      verdict: 'not_measurable', action: 'UNKNOWN', why: 'requires a DB probe; not acquired' });
  }

  // CHANGED paths must still exist, else the whole packet is downgraded.
  const missing = [];
  for (const line of packet.changed) {
    const p = line.match(/([\w./-]+\.[a-z]{2,4})(?::\d+)?/i)?.[1];
    if (p && !p.startsWith('commits') && !existsSync(path.join(root, p))) missing.push(p);
  }
  if (missing.length) {
    out.push({ field: 'changed_paths', claimed: `${packet.changed.length} entries`,
      measured: `${missing.length} missing`, verdict: 'contradicted', action: 'DOWNGRADE',
      why: `packet unreliable — verify each claim independently: ${missing.join(', ')}` });
  }

  for (const g of packet.governing) {
    out.push({ field: 'governing_decision', claimed: g.slice(0, 90), measured: 'cite-only',
      verdict: 'governance_witness', action: 'VERIFY-SOURCE',
      why: 'open the cited path — a paraphrase is never the ruling' });
  }

  // VERIFIED never survives a SHA change.
  if (packet.verified.length && packet.claims.head_sha &&
      packet.claims.head_sha !== now.workspace.head_sha) {
    out.push({ field: 'verified', claimed: `${packet.verified.length} gate(s)`, measured: 'stale SHA',
      verdict: 'contradicted', action: 'NEVER-INHERIT',
      why: 'do not inherit PASS across a SHA change — re-run the gate or drop the claim' });
  }

  for (const u of packet.unknowns) {
    out.push({ field: 'unknown_carried', claimed: u.replace(/^-\s*/, '').slice(0, 90),
      measured: UNKNOWN, verdict: 'not_measurable', action: 'PRESERVE',
      why: 'was never measured — must not be inferred' });
  }
  return out;
}

// -------------------------------------------------------------------- assemble
const ws = workspace();
if (ws.error) { console.error(ws.error); process.exit(2); }

const now = {
  generated_at: new Date().toISOString(),
  workspace: ws,
  trunk: trunk(opt('--trunk')),
  hazards: hazards(ws.worktree, ws.head_committed_at),
  governance: governance(ws),
  deployed: deployed(flag('--deployed')),
  memory_staleness: {
    status: UNKNOWN,
    reason: 'supersession is prose, not structure — /orient cannot determine that a memory '
          + 'record has been superseded. CITE-ONLY is mitigation, not proof. '
          + '(design §1E, falsification case 6 — declared limitation, NOT solved)',
  },
};

let packetReport = null;
const packetPath = opt('--packet');
if (packetPath) {
  if (!existsSync(packetPath)) {
    packetReport = { path: packetPath, error: 'packet not found', classifications: [] };
  } else {
    const parsed = parsePacket(readFileSync(packetPath, 'utf8'));
    packetReport = {
      path: packetPath,
      provenance: { mtime: statSync(packetPath).mtime.toISOString(),
                    tracked: git(['ls-files', '--error-unmatch', packetPath]) !== null },
      posture: 'CLAIM SET UNDER TEST — not a state snapshot; no claim is promoted to current-state fact',
      classifications: classify(parsed, now, ws.worktree),
    };
  }
}

const escalation = (() => {
  const acts = (packetReport?.classifications ?? []).map((c) => c.action);
  const g = now.governance;
  // Ownership outranks everything else: writable work on a worktree someone else
  // owns produces evidence about a moving artifact, which is not evidence at all.
  if (g?.worktree_claim?.claimed || g?.branch_claim?.claimed) return 'STOP';
  if (acts.includes('STOP')) return 'STOP';
  if (acts.includes('DOWNGRADE')) return 'DOWNGRADE';
  // Capacity is not a defect — it is a scheduling fact. It gets its own verdict so
  // a full lane is never mistaken for a broken workspace.
  if (g?.claude_capacity?.full) return 'WAITING_FOR_CLAUDE';
  if (acts.includes('WARN') || now.hazards.status === 'HAZARD'
      || g?.local_request_rate?.overall_band === 'ANOMALOUS') return 'WARN';
  return 'OK';
})();

const report = { ...now, packet: packetReport, escalation };

if (flag('--json')) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

// ------------------------------------------------------------------ human view
const w = report.workspace, t = report.trunk;
console.log(`/orient — ${report.generated_at}`);
console.log(`\nWORKSPACE  (measured now; session-start gitStatus is never used)`);
console.log(`  worktree      ${w.worktree}${w.is_linked_worktree ? '  [LINKED WORKTREE]' : ''}`);
console.log(`  branch        ${w.branch}`);
console.log(`  HEAD          ${w.head_sha}   committed ${w.head_committed_at}`);
console.log(`  upstream      ${w.upstream}`);
console.log(`  dirty         ${w.dirty_count} path(s)`);
console.log(`  trunk         ${t.name}  (named by: ${t.source})   ahead ${t.ahead} / behind ${t.behind}`);
console.log(`\nGENERATED-STATE HAZARDS  [${report.hazards.status}]`);
if (report.hazards.items.length === 0) console.log('  none present');
for (const i of report.hazards.items) {
  console.log(`  ${i.newer_than_head ? '⚠️ ' : '   '}${i.path}  mtime ${i.mtime}` +
    (i.newer_than_head ? '  NEWER THAN HEAD — instrument readings suspect until cleared or declared' : ''));
}
const g = report.governance;
console.log(`\nGOVERNANCE  (read-only — /orient never claims anything)`);
if (g.status === UNKNOWN) {
  console.log(`  ${UNKNOWN} — ${g.reason}`);
} else {
  if (g.worktree_claim.claimed) {
    console.log(`  ⛔ WORKTREE OWNED by ${g.worktree_claim.by} (${g.worktree_claim.work_unit})`);
    console.log(`       owner ${g.worktree_claim.owner}  since ${g.worktree_claim.since}`);
    console.log(`       Do not begin writable work here. Ask, or use an isolated worktree.`);
  } else if (g.branch_claim.claimed) {
    console.log(`  ⛔ BRANCH OWNED by ${g.branch_claim.by} — a different worktree does not make`);
    console.log(`       the same branch safe to write.`);
  } else {
    console.log(`  worktree claim   free (claim it deliberately: session.mjs open)`);
  }
  const c = g.claude_capacity;
  console.log(`  Claude capacity  ${c.active} / ${c.limit}  ${c.full ? '— FULL → WAITING_FOR_CLAUDE' : '— slot available'}`);
  const r = g.local_request_rate;
  if (r.overall_band !== UNKNOWN) {
    console.log(`  local rate       ${r.overall_band}`
      + (r.w60m ? `  (${r.w60m.requests} reqs/60m, ${r.w60m.ratio_to_baseline}x baseline, ${r.w60m.distinct_sessions} sessions)` : ''));
    console.log(`                   ⛔ local observability, not Anthropic quota units`);
  }
  if (g.contended.length) {
    console.log(`  ⚠ CONTENDED      ${g.contended.map((x) => x.session_id).join(', ')}`);
  }
}

console.log(`\nDEPLOYED REFERENT`);
console.log(`  ${report.deployed.deployed_sha}${report.deployed.note ? `  (${report.deployed.note})` : ''}`);
console.log(`\nMEMORY STALENESS`);
console.log(`  ${report.memory_staleness.status} — ${report.memory_staleness.reason}`);

if (packetReport) {
  console.log(`\nPACKET  ${packetReport.path}`);
  if (packetReport.error) console.log(`  ${packetReport.error}`);
  else {
    console.log(`  posture: ${packetReport.posture}`);
    for (const c of packetReport.classifications) {
      console.log(`  [${c.verdict.toUpperCase().padEnd(18)}] ${c.field}`);
      console.log(`      claimed:  ${c.claimed}`);
      console.log(`      measured: ${c.measured}`);
      if (c.why) console.log(`      → ${c.action}: ${c.why}`);
    }
  }
}
console.log(`\nESCALATION: ${report.escalation}`);
