#!/usr/bin/env node
/**
 * Builder OS — Claude Concurrency Governance + Worktree Isolation (Horizon III).
 *
 * WHY THIS EXISTS
 *   docs/ops/CLAUDE_CODE_RAPID_ALLOTMENT_EXHAUSTION_AUDIT_2026-08-09.md established
 *   that ~10 Claude Code sessions launched inside 3 minutes, sustained ~11-way
 *   concurrency for ~7h, peaked at 14, mostly on ONE shared branch, and tripped the
 *   rolling usage boundary on 11 sessions within 60 seconds. This is the smallest
 *   safe control that makes that shape refusable instead of silent.
 *
 * WHAT IT IS NOT
 *   - It does NOT scan the OS for `claude` processes and call them active. Only
 *     sessions that explicitly `open` here are Builder-governed. Existence of a
 *     process is not semantic activity.
 *   - It does NOT kill anything. Ever.
 *   - It does NOT route, downgrade, or select models. Model is RECORDED only.
 *   - It does NOT claim to know subscription quota units. Anthropic does not expose
 *     them locally; this measures sessions, hours, and tokens-adjacent facts only.
 *
 * REUSED SUBSTRATE (not reimplemented)
 *   scripts/ain-worktree-claim.sh  — creates/locks isolated worktrees for the
 *     delegation lane. This layer governs OWNERSHIP of whatever worktree a Builder
 *     session operates in, whether or not that script created it.
 *   ~/.claude/ain-delegation/      — existing ledger home (AIN_DELEGATION_HOME).
 *
 * COMMANDS
 *   open     --unit <id> --branch <b> [--worktree <p>] [--model <m>] [--read-only]
 *            [--queue] [--override "<reason>"]
 *   heartbeat --session <id>
 *   check     --session <id>            collision detection; exit 2 on collision
 *   sync      --session <id> --reason "<why>"   owner acknowledges own change
 *   close     --session <id> --state completed|handed-off|paused|abandoned
 *   recover   --session <id> --reason "<why>"   explicit stale-claim recovery
 *   status    [--json]
 *   report    [--since <iso>] [--json]
 *
 * EXITS  0 ok · 1 refused · 2 collision · 3 queued · 4 usage/not-found
 */
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync, renameSync,
  realpathSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Rate is the second Horizon III axis (rate, not weight). Imported, not reimplemented.
import {
  measureRate, DEFAULT_BASELINE_RPH as DEFAULT_RATE_BASELINE_RPH,
  DEFAULT_BANDS as DEFAULT_RATE_BANDS,
} from './rate.mjs';

// ─────────────────────────────────────────────────────────────────── config
const HOME = process.env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
const SESSIONS_DIR = path.join(HOME, 'sessions');
const LEDGER = path.join(HOME, 'sessions.jsonl');
const CONFIG = path.join(HOME, 'concurrency.json');

/**
 * PROVISIONAL OPERATIONAL POLICY — founder-set, not constitutional canon.
 *
 * Founder directive (2026-08-09, Horizon III concurrency governance) sets the initial
 * default to ONE active Claude reasoning/write lane, with an explicit instruction not
 * to infer that 1 is permanently optimal.
 *
 * PRESERVED EVIDENCE (this value was 2 before the directive, and the reason was sound):
 *   the incident audit measured this installation running at concurrency 2 for the
 *   ~24h preceding the fan-out burst, so 2 is an OBSERVED-NORMAL for this machine
 *   rather than a number invented from the incident. That evidence is not withdrawn —
 *   it means raising this back to 2 is an evidence-backed configuration change, not a
 *   regression. What the evidence does NOT establish is an optimum; what it does
 *   establish is that the sustained-14 / peak-18 shape is unsafe.
 *
 * Raise it deliberately (config file, env, or --override), with evidence — never with
 * impatience. See `report` for the observations that would justify a change.
 */
const DEFAULT_MAX = 1;

/**
 * Conservative. A session is NOT stale merely because it went quiet — a founder
 * reading a long design doc is idle for an hour and is still working. Staleness
 * additionally requires the OS process to be gone, and even then only makes the
 * session RECOVERABLE, never auto-reaped.
 */
const DEFAULT_STALE_AFTER_S = 4 * 3600;

function config() {
  let f = {};
  if (existsSync(CONFIG)) { try { f = JSON.parse(readFileSync(CONFIG, 'utf8')); } catch { f = {}; } }
  const envMax = process.env.BUILDER_MAX_CLAUDE_SESSIONS;
  const envStale = process.env.BUILDER_STALE_AFTER_S;
  return {
    max_active: Number(envMax ?? f.max_active ?? DEFAULT_MAX),
    max_active_source: envMax ? 'env:BUILDER_MAX_CLAUDE_SESSIONS'
      : (f.max_active != null ? `file:${CONFIG}` : 'default (provisional)'),
    stale_after_s: Number(envStale ?? f.stale_after_s ?? DEFAULT_STALE_AFTER_S),
    // Rate-axis policy lives in the same config file; rate.mjs owns the defaults.
    rate_baseline_rph: Number(process.env.BUILDER_RATE_BASELINE_RPH
      ?? f.baseline_rph ?? DEFAULT_RATE_BASELINE_RPH),
    rate_bands: { ...DEFAULT_RATE_BANDS, ...(f.rate_bands ?? {}) },
  };
}

// ─────────────────────────────────────────────────────────────────── helpers
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n) => args.includes(n);
const opt = (n, d = null) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const nowISO = () => new Date().toISOString();
const die = (msg, code = 4) => { console.error(msg); process.exit(code); };

function git(a, cwd) {
  try { return execFileSync('git', a, { encoding: 'utf8', cwd }).trim(); } catch { return null; }
}

function ensureHome() { mkdirSync(SESSIONS_DIR, { recursive: true }); }

function ledger(event) {
  ensureHome();
  appendFileSync(LEDGER, JSON.stringify({ at: nowISO(), ...event }) + '\n');
}

function recPath(id) { return path.join(SESSIONS_DIR, `${id}.json`); }

function writeRec(rec) {
  ensureHome();
  const p = recPath(rec.session_id);
  const tmp = `${p}.tmp`;
  writeFileSync(tmp, JSON.stringify(rec, null, 2));
  renameSync(tmp, p);           // atomic within a directory
}

function readRec(id) {
  const p = recPath(id);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function allRecs() {
  ensureHome();
  return readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => { try { return JSON.parse(readFileSync(path.join(SESSIONS_DIR, f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
}

const pidAlive = (pid) => { if (!pid) return false; try { process.kill(pid, 0); return true; } catch { return false; } };

/** Measure the worktree NOW. Never inherit a session-start snapshot. */
function measure(worktree) {
  const porcelain = git(['status', '--porcelain'], worktree);
  const dirty = porcelain === null ? null : (porcelain === '' ? [] : porcelain.split('\n').sort());
  return {
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD'], worktree),
    head_sha: git(['rev-parse', 'HEAD'], worktree),
    dirty_count: dirty === null ? null : dirty.length,
    dirty_digest: dirty === null ? null : createHash('sha256').update(dirty.join('\n')).digest('hex').slice(0, 16),
  };
}

/**
 * Liveness, deliberately asymmetric — both directions err toward safety:
 *   counts_active : conservative for BUDGET (a dead pid still holds capacity until
 *                   a human recovers it, so we never silently free a slot)
 *   recoverable   : conservative for REAPING (needs pid gone AND long quiet)
 *
 * A heartbeat is an AUTHORITY ASSERTION — "I still hold execution authority" — not
 * evidence that something touched the record. Before 2026-08-10 any same-host caller
 * that knew a session id could refresh any lease, and `check` refreshed it as a side
 * effect of being *read*. A claim whose registered pid had died could therefore be kept
 * perpetually fresh by an unidentified writer and never became recoverable, holding a
 * capacity slot forever (see docs/ops/JARVIS_BUILDER_LIVENESS_AUTHORITY_2026-08-10.md).
 *
 * So: only an AUTHENTICATED heartbeat extends the lease. Unauthenticated touches are
 * recorded separately, as evidence of ambiguity — never as evidence of life.
 *
 * PID death and lease freshness are reported as SEPARATE signals; neither alone
 * defines ownership. `claim_state` is the derived semantic answer.
 */
function liveness(rec, cfg) {
  const alive = pidAlive(rec.pid);
  const leaseAgeS = (Date.now() - new Date(rec.last_heartbeat || rec.opened_at).getTime()) / 1000;
  const open = !rec.closed_at && rec.state === 'active';
  const authenticated = !!rec.lease_fingerprint;
  const unauthAgeS = rec.last_unauthenticated_touch
    ? (Date.now() - new Date(rec.last_unauthenticated_touch).getTime()) / 1000 : null;
  const unauthRecent = unauthAgeS !== null && unauthAgeS <= cfg.stale_after_s;
  const leaseStale = leaseAgeS > cfg.stale_after_s;

  // Derived ownership. Order matters: a living process outranks every other signal.
  let claim_state;
  if (alive) claim_state = 'LIVE';
  else if (authenticated && !leaseStale) claim_state = 'LIVE';        // legitimate supervisor lease
  else if (unauthRecent) claim_state = 'AMBIGUOUS_OWNERSHIP';         // something touches it; nobody owns it
  else if (leaseStale) claim_state = 'STALE';
  else claim_state = 'QUIET';                                         // recently gone, not yet stale

  return {
    pid_alive: alive,
    lease_authenticated: authenticated,
    heartbeat_age_s: Math.round(leaseAgeS),
    unauthenticated_touch_age_s: unauthAgeS === null ? null : Math.round(unauthAgeS),
    claim_state,
    counts_active: open,
    // Ordinary recovery is for genuine absence of ownership only.
    recoverable: open && claim_state === 'STALE',
    // Ambiguity is never permanently deadlocked: once the LEASE itself has aged past
    // the threshold, a governed reconciliation becomes available (never plain recover).
    reconcilable: open && claim_state === 'AMBIGUOUS_OWNERSHIP' && leaseStale,
  };
}

function activeRecs(cfg) { return allRecs().filter((r) => liveness(r, cfg).counts_active); }

const owner = () => `${os.userInfo().username}@${os.hostname()}`;

// ─────────────────────────────────────────────────────────────────── open
/**
 * Canonicalize a worktree path for OWNERSHIP COMPARISON.
 *
 * `path.resolve` normalizes `.`/`..` and relativity but NOT symlinks, so the same
 * physical directory can carry two spellings (/var/… vs /private/var/… on macOS;
 * any symlinked checkout elsewhere). Comparing unresolved paths would let two write
 * sessions each believe they hold a different worktree while writing the same files
 * — the exact defect the one-writer invariant exists to prevent. Found by
 * loop-governance-proof, not by inspection.
 *
 * Falls back to path.resolve when the path does not exist yet (a claim may legitimately
 * name a worktree that has not been created).
 */
function canonicalWorktree(p) {
  const resolved = path.resolve(p);
  try { return realpathSync(resolved); } catch { return resolved; }
}

function cmdOpen() {
  const cfg = config();
  const unit = opt('--unit') || die('usage: open --unit <id> --branch <branch> [--worktree <p>] [--model <m>] [--read-only] [--queue] [--override "<reason>"]');
  const branch = opt('--branch') || die('--branch required (the branch this unit will write on)');
  const worktree = canonicalWorktree(opt('--worktree') || process.cwd());
  const model = opt('--model') || process.env.BUILDER_SESSION_MODEL || 'UNKNOWN';
  const mode = flag('--read-only') ? 'read-only' : 'write';
  const override = opt('--override');
  const sid = `s-${randomBytes(4).toString('hex')}`;
  const active = activeRecs(cfg);

  // ── invariant 3: one active WRITE unit → one branch → one worktree → one owner.
  // Read-only lanes are exempt: inspection must never acquire write authority, and
  // therefore must never be able to block or displace a writer.
  if (mode === 'write') {
    const clash = active.find((r) => r.mode === 'write'
      && (canonicalWorktree(r.worktree) === worktree || r.branch === branch || r.work_unit === unit));
    if (clash) {
      const why = canonicalWorktree(clash.worktree) === worktree ? 'worktree'
        : (clash.branch === branch ? 'branch' : 'work_unit');
      ledger({ event: 'refused', reason: `worktree-ownership:${why}`, work_unit: unit, branch, worktree, held_by: clash.session_id });
      console.error(`\n🛑 REFUSED — ${why} is already owned by an active write session.`);
      console.error(`   holder    ${clash.session_id}  unit=${clash.work_unit}  owner=${clash.owner}`);
      console.error(`   branch    ${clash.branch}`);
      console.error(`   worktree  ${clash.worktree}`);
      console.error(`   opened    ${clash.opened_at}`);
      console.error(`\n   One active write unit → one branch → one worktree → one owner.`);
      console.error(`   Close it (session.mjs close --session ${clash.session_id} --state <s>)`);
      console.error(`   or open this unit in its OWN worktree:  scripts/ain-worktree-claim.sh claim ${unit} ${branch}\n`);
      process.exit(1);
    }
  }

  // ── invariant 2: concurrency budget. Read-only counts too — inspection consumes
  // the same scarce Claude capacity. It simply carries no write authority.
  if (active.length >= cfg.max_active) {
    if (override) {
      ledger({ event: 'override', session_id: sid, work_unit: unit, reason: override, by: owner(), at_active: active.length, limit: cfg.max_active });
      console.error(`\n⚠️  FOUNDER OVERRIDE — admitting session beyond the concurrency budget.`);
      console.error(`   active ${active.length} / limit ${cfg.max_active}   reason: ${override}`);
      console.error(`   This is recorded in ${LEDGER} and shown by \`status\`.\n`);
    } else if (flag('--queue')) {
      const q = {
        session_id: sid, work_unit: unit, branch, worktree, owner: owner(), pid: process.ppid,
        model, mode, opened_at: nowISO(), last_heartbeat: nowISO(), state: 'queued',
        override: null, baseline: null, collisions: [], queued_behind: active.map((r) => r.session_id),
      };
      writeRec(q);
      ledger({ event: 'queued', session_id: sid, work_unit: unit, branch, at_active: active.length, limit: cfg.max_active });
      console.error(`\n⏸  QUEUED — concurrency budget reached (${active.length}/${cfg.max_active}).`);
      console.error(`   session ${sid} recorded as queued. It has NOT started and holds no claim.`);
      console.error(`   It becomes eligible when an active session closes.\n`);
      console.log(sid);
      process.exit(3);
    } else {
      ledger({ event: 'refused', reason: 'concurrency-budget', work_unit: unit, branch, at_active: active.length, limit: cfg.max_active });
      console.error(`\n🛑 REFUSED — Claude concurrency budget reached: ${active.length} / ${cfg.max_active} active.`);
      console.error(`   limit source: ${cfg.max_active_source}`);
      for (const r of active) console.error(`     ${r.session_id}  ${r.mode}  ${r.model}  ${r.work_unit}  (${r.branch})`);
      console.error(`\n   Close a session, or re-run with --queue, or --override "<reason>" (audited).\n`);
      process.exit(1);
    }
  }

  // The lease secret is the smallest primitive that distinguishes "the owner is alive"
  // from "someone on this host knows the session id". user@host cannot: on a
  // single-user machine every concurrent lane resolves to the identical owner string.
  // Only the fingerprint is persisted — the record is world-readable, so storing the
  // token itself would hand the authority to every reader.
  const leaseToken = randomBytes(16).toString('hex');
  const rec = {
    session_id: sid, work_unit: unit, branch, worktree, owner: owner(), pid: process.ppid,
    model, mode, opened_at: nowISO(), last_heartbeat: nowISO(), state: 'active',
    lease_fingerprint: createHash('sha256').update(leaseToken).digest('hex'),
    last_unauthenticated_touch: null, unauthenticated_touches: 0,
    override: override ? { reason: override, by: owner(), at: nowISO() } : null,
    baseline: mode === 'write' ? measure(worktree) : null,
    baseline_set_at: nowISO(), collisions: [],
  };
  writeRec(rec);
  ledger({ event: 'opened', session_id: sid, work_unit: unit, branch, worktree, mode, model, owner: rec.owner, override: !!override });

  console.error(`[builder/session] opened ${sid}  unit=${unit}  mode=${mode}  model=${model}`);
  if (rec.baseline) console.error(`[builder/session] baseline branch=${rec.baseline.branch} head=${String(rec.baseline.head_sha).slice(0, 8)} dirty=${rec.baseline.dirty_count}`);
  if (mode === 'read-only') console.error(`[builder/session] READ-ONLY — no worktree ownership acquired, no write authority.`);
  console.error(`[builder/session] lease token (keep it; required to heartbeat/sync this claim):`);
  console.error(`                  BUILDER_LEASE_TOKEN=${leaseToken}`);
  console.log(sid);
}

// ─────────────────────────────────────────────────── heartbeat / check / sync
function requireRec(id) {
  const rec = readRec(id);
  if (!rec) die(`no such session: ${id}`);
  return rec;
}

/**
 * Does this caller hold the lease? Token may arrive by flag or environment so an owning
 * process can export it once. A claim opened before the lease existed has no fingerprint
 * and therefore cannot authenticate anyone — such claims degrade to AMBIGUOUS rather than
 * silently retaining the old "anyone may refresh" authority.
 */
function leaseHeld(rec) {
  const token = opt('--token') || process.env.BUILDER_LEASE_TOKEN || null;
  if (!rec.lease_fingerprint) return { ok: false, reason: 'claim predates lease authority (no fingerprint)' };
  if (!token) return { ok: false, reason: 'no lease token supplied' };
  return createHash('sha256').update(token).digest('hex') === rec.lease_fingerprint
    ? { ok: true }
    : { ok: false, reason: 'lease token does not match' };
}

/** Record an unauthenticated touch as evidence of ambiguity — never as evidence of life. */
function recordUnauthenticatedTouch(rec, command) {
  rec.last_unauthenticated_touch = nowISO();
  rec.unauthenticated_touches = (rec.unauthenticated_touches || 0) + 1;
  writeRec(rec);
  ledger({ event: 'unauthenticated_touch', session_id: rec.session_id, command, by: owner() });
}

function cmdHeartbeat() {
  const rec = requireRec(opt('--session') || die('usage: heartbeat --session <id> --token <t>'));
  if (rec.state !== 'active') die(`session ${rec.session_id} is ${rec.state}, not active`, 1);
  const held = leaseHeld(rec);
  if (!held.ok) {
    recordUnauthenticatedTouch(rec, 'heartbeat');
    console.error(`\n🛑 HEARTBEAT REFUSED — ${held.reason}.`);
    console.error(`   A heartbeat asserts "I still hold execution authority". Knowing a session id`);
    console.error(`   on this host is not that authority. The lease was NOT extended; this touch is`);
    console.error(`   recorded as evidence of ambiguous ownership.`);
    console.error(`   Supply the token printed at open:  --token <t>  or  BUILDER_LEASE_TOKEN=<t>\n`);
    process.exit(1);
  }
  rec.last_heartbeat = nowISO();
  writeRec(rec);
  console.log('ok');
}

function collide(rec, cur) {
  const b = rec.baseline;
  const moved = [];
  if (b.branch !== cur.branch) moved.push({ field: 'branch', expected: b.branch, found: cur.branch });
  if (b.head_sha !== cur.head_sha) moved.push({ field: 'head_sha', expected: b.head_sha, found: cur.head_sha });
  if (b.dirty_digest !== cur.dirty_digest) moved.push({ field: 'dirty_set', expected: `${b.dirty_count} files/${b.dirty_digest}`, found: `${cur.dirty_count} files/${cur.dirty_digest}` });
  return moved;
}

function cmdCheck() {
  const rec = requireRec(opt('--session') || die('usage: check --session <id>'));
  if (rec.mode === 'read-only') { console.log(JSON.stringify({ session_id: rec.session_id, verdict: 'OK', note: 'read-only session holds no baseline' })); return; }
  if (rec.state !== 'active') die(`session ${rec.session_id} is ${rec.state}, not active`, 1);

  const cur = measure(rec.worktree);
  const moved = collide(rec, cur);
  const ownerNow = owner();
  if (ownerNow !== rec.owner) moved.push({ field: 'owner', expected: rec.owner, found: ownerNow });

  if (moved.length === 0) {
    // OBSERVATIONAL. `check` answers a question about the WORKTREE ("is the artifact
    // still stable?"). A heartbeat asserts something about the OWNER ("I am still the
    // legitimate executor"). Those are different claims with different speakers, and
    // fusing them meant auditing a claim refreshed it — an investigator could not measure
    // staleness without destroying it. Observing claim state must never refresh liveness.
    console.log(JSON.stringify({ session_id: rec.session_id, verdict: 'OK', measured: cur }, null, 2));
    return;
  }

  // Evidence is preserved BEFORE anything else. Do not continue producing test
  // evidence against a moving artifact.
  const collision = { at: nowISO(), moved, measured: cur, baseline: rec.baseline };
  rec.collisions.push(collision);
  rec.state = 'active';                 // still open — the human decides, not us
  writeRec(rec);
  ledger({ event: 'collision', session_id: rec.session_id, work_unit: rec.work_unit, moved: moved.map((m) => m.field) });

  console.error(`\n🛑 COLLISION — the artifact moved underneath session ${rec.session_id}.`);
  for (const m of moved) console.error(`   ${m.field}\n     expected  ${m.expected}\n     found     ${m.found}`);
  console.error(`\n   STOP. Evidence produced after this point is against a moving artifact and is void.`);
  console.error(`   Contention is recorded in ${recPath(rec.session_id)}`);
  console.error(`   If YOU made this change, acknowledge it:`);
  console.error(`     node scripts/builder/session.mjs sync --session ${rec.session_id} --reason "<what you did>"\n`);
  process.exit(2);
}

function cmdSync() {
  const rec = requireRec(opt('--session') || die('usage: sync --session <id> --reason "<why>"'));
  const reason = opt('--reason') || die('--reason required — an unexplained baseline reset is indistinguishable from hiding a collision');
  if (rec.mode === 'read-only') die('read-only sessions have no baseline to sync', 1);
  // sync resets the collision baseline — an owner-only act. Without proof of lease this
  // would let any caller both re-baseline and refresh another lane's liveness.
  const heldSync = leaseHeld(rec);
  if (!heldSync.ok) {
    recordUnauthenticatedTouch(rec, 'sync');
    console.error(`\n🛑 SYNC REFUSED — ${heldSync.reason}.`);
    console.error(`   Resetting a baseline is an ownership act: it declares "I made this change".`);
    console.error(`   The lease was NOT extended and the baseline was NOT reset.\n`);
    process.exit(1);
  }
  const before = rec.baseline;
  rec.baseline = measure(rec.worktree);
  rec.baseline_set_at = nowISO();
  rec.last_heartbeat = nowISO();
  (rec.acknowledgements ||= []).push({ at: nowISO(), reason, from: before, to: rec.baseline });
  writeRec(rec);
  ledger({ event: 'acknowledged', session_id: rec.session_id, work_unit: rec.work_unit, reason });
  console.log(JSON.stringify({ session_id: rec.session_id, verdict: 'BASELINE-UPDATED', baseline: rec.baseline }, null, 2));
}

// ─────────────────────────────────────────────────────────── close / recover
const CLOSE_STATES = ['completed', 'handed-off', 'paused', 'abandoned'];

function cmdClose() {
  const rec = requireRec(opt('--session') || die(`usage: close --session <id> --state ${CLOSE_STATES.join('|')}`));
  const state = opt('--state') || die(`--state required, one of: ${CLOSE_STATES.join(', ')}`);
  if (!CLOSE_STATES.includes(state)) die(`invalid --state "${state}". one of: ${CLOSE_STATES.join(', ')}`);
  if (rec.closed_at) die(`session ${rec.session_id} already closed as ${rec.state} at ${rec.closed_at}`, 1);
  rec.state = state;
  rec.closed_at = nowISO();
  rec.duration_s = Math.round((new Date(rec.closed_at) - new Date(rec.opened_at)) / 1000);
  writeRec(rec);
  ledger({ event: 'closed', session_id: rec.session_id, work_unit: rec.work_unit, state, duration_s: rec.duration_s, collisions: rec.collisions.length });
  console.error(`[builder/session] closed ${rec.session_id} as ${state} — concurrency + worktree claim released.`);
  console.error(`[builder/session] no process was signalled; closure is a governance act, not a kill.`);
  console.log('ok');
}

function cmdRecover() {
  const cfg = config();
  const rec = requireRec(opt('--session') || die('usage: recover --session <id> --reason "<why>"'));
  const reason = opt('--reason') || die('--reason required — recovery is an audited act');
  const lv = liveness(rec, cfg);
  if (!lv.counts_active) die(`session ${rec.session_id} is ${rec.state} — nothing to recover`, 1);
  if (lv.claim_state === 'AMBIGUOUS_OWNERSHIP' && !flag('--force')) {
    console.error(`\n🛑 RECOVERY REFUSED — session ${rec.session_id} is AMBIGUOUS_OWNERSHIP.`);
    console.error(`   pid ${rec.pid} alive: ${lv.pid_alive}   lease age: ${lv.heartbeat_age_s}s   authenticated: ${lv.lease_authenticated}`);
    console.error(`   unauthenticated touches: ${rec.unauthenticated_touches || 0} (last ${lv.unauthenticated_touch_age_s}s ago)`);
    console.error(`   Something is touching this claim, but nothing has proven ownership of it.`);
    console.error(`   That is a governance question, not a staleness question — ordinary recovery`);
    console.error(`   cannot answer it. Use the governed path:`);
    console.error(`     session.mjs reconcile --session ${rec.session_id} --reason "<why>"`);
    console.error(`   ${lv.reconcilable ? 'The lease has aged past the threshold — reconcile is available now.'
      : `Available once the lease itself ages past ${cfg.stale_after_s}s.`}\n`);
    process.exit(1);
  }
  if (!lv.recoverable && !flag('--force')) {
    console.error(`\n🛑 RECOVERY REFUSED — session ${rec.session_id} does not meet the stale test.`);
    console.error(`   claim state: ${lv.claim_state}`);
    console.error(`   pid ${rec.pid} alive: ${lv.pid_alive}   quiet for: ${lv.heartbeat_age_s}s   threshold: ${cfg.stale_after_s}s`);
    console.error(`   A session is not abandoned merely because it went quiet.`);
    console.error(`   Both conditions are required: process gone AND quiet past the threshold.`);
    console.error(`   Deliberate exception: --force (recorded).\n`);
    process.exit(1);
  }
  rec.state = 'abandoned';
  rec.closed_at = nowISO();
  rec.duration_s = Math.round((new Date(rec.closed_at) - new Date(rec.opened_at)) / 1000);
  // Exceptional authority must be legible after the fact: what was bypassed, and what the
  // governor actually believed at the moment of the bypass.
  rec.recovered = {
    at: nowISO(), by: owner(), reason, forced: flag('--force'),
    pid_alive_at_recovery: lv.pid_alive, quiet_s: lv.heartbeat_age_s,
    claim_state_at_recovery: lv.claim_state,
    normal_recoverable: lv.recoverable,
    conflicting_liveness: !lv.pid_alive && lv.claim_state === 'AMBIGUOUS_OWNERSHIP',
    lease_authenticated: lv.lease_authenticated,
    unauthenticated_touches: rec.unauthenticated_touches || 0,
    safeguards_bypassed: flag('--force')
      ? [!lv.recoverable ? 'stale-test' : null, lv.claim_state === 'AMBIGUOUS_OWNERSHIP' ? 'ambiguous-ownership-gate' : null].filter(Boolean)
      : [],
  };
  writeRec(rec);
  ledger({ event: 'recovered', session_id: rec.session_id, work_unit: rec.work_unit, by: owner(), reason, forced: flag('--force') });
  console.error(`[builder/session] recovered ${rec.session_id} — claim released, state=abandoned.`);
  console.log('ok');
}

/**
 * The governed escape from AMBIGUOUS_OWNERSHIP. This is deliberately NOT `--force`:
 * force bypasses a safeguard, reconcile *discharges* one by proving the thing the
 * safeguard was protecting. The claim becomes reconcilable only once the lease itself
 * has aged past the stale threshold — i.e. no authenticated owner has spoken for it in
 * a full interval — so a genuinely live supervisor can always keep its claim by simply
 * heartbeating with its token. Ambiguity therefore cannot become a permanent deadlock,
 * and cannot be used to evict a lane that still holds authority.
 */
function cmdReconcile() {
  const cfg = config();
  const rec = requireRec(opt('--session') || die('usage: reconcile --session <id> --reason "<why>"'));
  const reason = opt('--reason') || die('--reason required — reconciliation is an audited act');
  const lv = liveness(rec, cfg);
  if (!lv.counts_active) die(`session ${rec.session_id} is ${rec.state} — nothing to reconcile`, 1);
  if (lv.claim_state !== 'AMBIGUOUS_OWNERSHIP') {
    die(`session ${rec.session_id} is ${lv.claim_state}, not AMBIGUOUS_OWNERSHIP — use the ordinary path`, 1);
  }
  if (!lv.reconcilable) {
    console.error(`\n🛑 RECONCILE REFUSED — the lease has not yet aged past the threshold.`);
    console.error(`   lease age ${lv.heartbeat_age_s}s / threshold ${cfg.stale_after_s}s`);
    console.error(`   An authenticated owner speaking within the interval keeps this claim.\n`);
    process.exit(1);
  }
  rec.state = 'abandoned';
  rec.closed_at = nowISO();
  rec.duration_s = Math.round((new Date(rec.closed_at) - new Date(rec.opened_at)) / 1000);
  rec.reconciled = {
    at: nowISO(), by: owner(), reason,
    claim_state_at_reconcile: lv.claim_state,
    lease_age_s: lv.heartbeat_age_s,
    unauthenticated_touches: rec.unauthenticated_touches || 0,
    last_unauthenticated_touch: rec.last_unauthenticated_touch,
    resolution: 'no authenticated owner spoke for a full stale interval',
  };
  writeRec(rec);
  ledger({ event: 'reconciled', session_id: rec.session_id, work_unit: rec.work_unit, by: owner(), reason,
           unauthenticated_touches: rec.unauthenticated_touches || 0 });
  console.error(`[builder/session] reconciled ${rec.session_id} — ambiguous claim released, state=abandoned.`);
  console.error(`[builder/session] no process was signalled; reconciliation is a governance act.`);
  console.log('ok');
}

// ─────────────────────────────────────────────────────────────────── status
/**
 * Read the local request-rate instrument. Isolated in a try/catch on purpose: rate is
 * OBSERVABILITY, and observability failing must never take down the control that
 * governs claims. A missing reading is reported as UNKNOWN, never as calm.
 */
function rateReading() {
  try {
    const root = process.env.BUILDER_TRANSCRIPT_ROOT
      || path.join(os.homedir(), '.claude', 'projects');
    if (!existsSync(root)) return { overall_band: 'UNKNOWN', error: `transcript root not found: ${root}` };
    const cfg = config();
    return measureRate({
      root,
      now: Date.now(),
      baselineRph: cfg.rate_baseline_rph,
      bands: cfg.rate_bands,
    });
  } catch (e) {
    return { overall_band: 'UNKNOWN', error: `rate reading failed: ${e.message}` };
  }
}

function cmdStatus() {
  const cfg = config();
  const all = allRecs();
  const active = all.filter((r) => liveness(r, cfg).counts_active);
  const queued = all.filter((r) => r.state === 'queued');
  const overrides = active.filter((r) => r.override);
  const collisions = all.filter((r) => (r.collisions?.length ?? 0) > 0 && !r.closed_at);
  const recoverable = active.filter((r) => liveness(r, cfg).recoverable);

  // Second Horizon III axis. Concurrency is a PROXY for the variable that actually
  // failed on 2026-08-09; rate is the variable itself. Never let a green concurrency
  // number imply a calm request rate — they can and did diverge.
  const rate = rateReading();

  if (flag('--json')) {
    console.log(JSON.stringify({
      limit: cfg.max_active, limit_source: cfg.max_active_source,
      active: active.length, queued: queued.length,
      sessions: active.map((r) => ({ ...r, liveness: liveness(r, cfg) })),
      queued_sessions: queued, overrides, collisions, recoverable,
      local_request_rate: rate,
    }, null, 2));
    return;
  }

  const dur = (r) => {
    const s = Math.round((Date.now() - new Date(r.opened_at).getTime()) / 1000);
    return s > 3600 ? `${(s / 3600).toFixed(1)}h` : `${Math.round(s / 60)}m`;
  };

  console.log(`\nBUILDER OS — Claude session governance`);
  console.log(`  Claude sessions active: ${active.length} / ${cfg.max_active}   (limit source: ${cfg.max_active_source})`);
  console.log(`  Queued: ${queued.length}`);

  console.log(`\nLOCAL REQUEST RATE  (⛔ not Anthropic quota units — local transcript counts)`);
  if (rate.error || rate.overall_band === 'UNKNOWN') {
    console.log(`  UNKNOWN — ${rate.error ?? 'no reading'}`);
  } else {
    for (const k of ['w5m', 'w30m', 'w60m', 'w5h']) {
      const v = rate.windows[k];
      console.log(`  ${v.label.padEnd(7)}${String(v.requests).padStart(6)} reqs  `
                + `${(v.ratio_to_baseline + 'x').padStart(7)} baseline  `
                + `${String(v.distinct_sessions).padStart(3)} sessions   ${v.band}`);
    }
    console.log(`  OVERALL ${rate.overall_band}`);
    if (rate.overall_band === 'ANOMALOUS' || rate.overall_band === 'HIGH') {
      console.log(`  ⚠ ${rate.recommendation}`);
    }
    // Ungoverned lanes are the 2026-08-09 failure mode: sessions that never opened
    // here consume the same allowance and are invisible to the budget above.
    const observed = rate.windows.w60m.distinct_sessions;
    if (observed > active.length) {
      console.log(`  ⚠ ${observed} distinct sessions observed in transcripts vs `
                + `${active.length} Builder-governed — ${observed - active.length} lane(s) are UNGOVERNED.`);
      console.log(`    The budget above governs only sessions that called \`session.mjs open\`.`);
    }
  }

  console.log(`\nActive:`);
  if (!active.length) console.log(`  (none)`);
  for (const r of active) {
    const lv = liveness(r, cfg);
    // Operators must not infer ownership from one lower-quality signal while the governor
    // holds stronger conflicting evidence. PID death alone is no longer the headline cue —
    // the derived claim_state is, with the raw signals shown beneath it.
    const warn = lv.claim_state === 'AMBIGUOUS_OWNERSHIP'
      ? `  🔶 AMBIGUOUS_OWNERSHIP — process dead, lease ${lv.heartbeat_age_s}s old, `
        + `${rec.unauthenticated_touches || 0} unauthenticated touch(es); no proven owner. `
        + (lv.reconcilable ? 'reconcile available.' : 'not yet reconcilable.')
      : lv.recoverable ? '  ⚠ RECOVERABLE (process gone + lease quiet past threshold)'
      : (!lv.pid_alive && lv.lease_authenticated ? `  ● LIVE via authenticated lease (pid gone, lease ${lv.heartbeat_age_s}s old)`
      : (!lv.pid_alive ? '  ⚠ process gone — still holds its claim until recovered' : ''));
    console.log(`  ${r.session_id}  ${r.work_unit}`);
    console.log(`      model     ${r.model}   mode ${r.mode}`);
    console.log(`      branch    ${r.branch}`);
    console.log(`      worktree  ${r.worktree}`);
    console.log(`      duration  ${dur(r)}   owner ${r.owner}${warn}`);
  }

  console.log(`\nCollisions:`);
  if (!collisions.length) console.log(`  (none)`);
  for (const r of collisions) {
    const last = r.collisions[r.collisions.length - 1];
    console.log(`  ${r.session_id}  ${r.work_unit}  — ${last.moved.map((m) => m.field).join(', ')} moved at ${last.at}`);
  }

  console.log(`\nWaiting for founder:`);
  const waiting = [...recoverable.map((r) => `  ${r.session_id} — stale claim, needs explicit recover`),
    ...queued.map((r) => `  ${r.session_id} — queued behind ${r.queued_behind?.length ?? 0} session(s)`),
    ...collisions.map((r) => `  ${r.session_id} — collision unresolved (sync or close)`)];
  console.log(waiting.length ? waiting.join('\n') : `  (nothing)`);

  if (overrides.length) {
    console.log(`\nFounder overrides in effect:`);
    for (const r of overrides) console.log(`  ${r.session_id}  "${r.override.reason}"  by ${r.override.by} at ${r.override.at}`);
  }
  console.log('');
}

// ─────────────────────────────────────────────────────────────────── report
function cmdReport() {
  const since = opt('--since');
  const cutoff = since ? new Date(since).getTime() : 0;
  const events = existsSync(LEDGER)
    ? readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)
        .map((l) => { try { return JSON.parse(l); } catch { return null; } })
        .filter((e) => e && new Date(e.at).getTime() >= cutoff)
    : [];
  const recs = allRecs().filter((r) => new Date(r.opened_at).getTime() >= cutoff);

  // max concurrency, reconstructed from opened/closed events (the only honest source)
  let cur = 0, max = 0;
  for (const e of events) {
    if (e.event === 'opened') cur++;
    if (e.event === 'closed' || e.event === 'recovered') cur = Math.max(0, cur - 1);
    max = Math.max(max, cur);
  }
  const hours = recs.reduce((a, r) => a + (r.duration_s ?? Math.round((Date.now() - new Date(r.opened_at)) / 1000)), 0) / 3600;
  const models = {}; for (const r of recs) models[r.model] = (models[r.model] ?? 0) + 1;
  const count = (ev, pred = () => true) => events.filter((e) => e.event === ev && pred(e)).length;

  const out = {
    window_since: since ?? 'all-time',
    max_builder_governed_concurrency: max,
    claude_session_hours: Number(hours.toFixed(2)),
    model_mix: models,
    queued: count('queued'),
    collisions_detected: count('collision'),
    worktree_conflicts_prevented: count('refused', (e) => String(e.reason).startsWith('worktree-ownership')),
    budget_refusals: count('refused', (e) => e.reason === 'concurrency-budget'),
    founder_overrides: count('override'),
    stale_recoveries: count('recovered'),
    work_completed: recs.filter((r) => r.state === 'completed').length,
    work_handed_off: recs.filter((r) => r.state === 'handed-off').length,
    caveat: 'Sessions, hours and counts only. Anthropic does not expose subscription '
          + 'quota units locally; no quota consumption is claimed or inferred here.',
  };
  if (flag('--json')) { console.log(JSON.stringify(out, null, 2)); return; }
  for (const [k, v] of Object.entries(out)) {
    console.log(`  ${k.padEnd(36)} ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
}

// ─────────────────────────────────────────────────────────────────── dispatch
switch (cmd) {
  case 'open': cmdOpen(); break;
  case 'heartbeat': cmdHeartbeat(); break;
  case 'check': cmdCheck(); break;
  case 'sync': cmdSync(); break;
  case 'close': cmdClose(); break;
  case 'recover': cmdRecover(); break;
  case 'reconcile': cmdReconcile(); break;
  case 'status': cmdStatus(); break;
  case 'report': cmdReport(); break;
  default:
    console.error(`usage: session.mjs <open|heartbeat|check|sync|close|recover|reconcile|status|report> [flags]

  open     --unit <id> --branch <b> [--worktree <p>] [--model <m>] [--read-only]
           [--queue] [--override "<reason>"]     → prints session_id + lease token
  heartbeat --session <id> --token <t>            (or BUILDER_LEASE_TOKEN=<t>)
  check     --session <id>                        → exit 2 on collision — OBSERVATIONAL
  sync      --session <id> --reason "<why>" --token <t>
  close     --session <id> --state completed|handed-off|paused|abandoned
  recover   --session <id> --reason "<why>" [--force]      stale claims only
  reconcile --session <id> --reason "<why>"                AMBIGUOUS_OWNERSHIP only
  status    [--json]
  report    [--since <iso>] [--json]

  A heartbeat asserts "I still hold execution authority" and requires the lease token
  printed at open. Observation (check/status) never refreshes a lease.

  home: ${HOME}   (override with AIN_DELEGATION_HOME)
  limit: BUILDER_MAX_CLAUDE_SESSIONS or ${CONFIG} or default ${DEFAULT_MAX}`);
    process.exit(4);
}
