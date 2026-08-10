#!/usr/bin/env node
/**
 * /continue — continuation-packet generator and validator for Closed Loop 1.
 *
 * Design: docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md
 *
 * A packet is a witness of WHAT THIS SESSION ENCODED and WHAT GOVERNANCE WAS
 * ESTABLISHED. It is never a witness of what will still be true when the next
 * session begins. Measurement-class facts appear ONLY as DRIFT PROBES — prior
 * readings whose job is to be confirmed or contradicted by /orient.
 *
 * Usage:
 *   node scripts/builder/continue.mjs --init            # skeleton, probes measured now
 *   node scripts/builder/continue.mjs --validate <path> # grammar + budget + invariants
 *   node scripts/builder/continue.mjs --validate <path> --json
 *   node scripts/builder/continue.mjs --validate <path> --handoff <session-id>
 *
 * Read-only by default: --init writes to stdout; validation writes nothing.
 *
 * `--handoff` is the ONE mutating path, and it is deliberately gated (Horizon III):
 * it releases the session's write claim and its Claude concurrency slot, but ONLY
 * after the packet validates. Releasing a claim without a valid packet would free
 * the lane while destroying the continuity that made the lane worth holding — the
 * worst of both. An invalid packet therefore keeps the claim.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d = null) => { const i = args.indexOf(n); return i !== -1 && args[i + 1] ? args[i + 1] : d; };
const git = (a) => { try { return execFileSync('git', a, { encoding: 'utf8' }).trim(); } catch { return null; } };

/** Packet budget. Unit per the design and the session-burden audit: ~4 chars/token. */
const BUDGET_TOKENS = 3000;
const CHARS_PER_TOKEN = 4;
const estimateTokens = (s) => Math.ceil(s.length / CHARS_PER_TOKEN);

const REQUIRED_SECTIONS = [
  'GOAL', 'DRIFT PROBES', 'GOVERNING DECISIONS', 'CAPABILITY CONSTRAINTS',
  'ESTABLISHED', 'CHANGED', 'VERIFIED', 'INSTRUMENTS USED', 'OPEN',
  'DO NOT REDISCOVER', 'NEXT COHERENT ACTION',
];

/**
 * Headings that assert frozen present-state authority. A packet may not use them:
 * every fact they would introduce is measurement-class and must be re-established.
 */
const FORBIDDEN_HEADINGS = [
  'CURRENT REALITY', 'LIVE STATE', 'VERIFIED CURRENT STATE', 'CURRENT STATE',
  'BASELINE',   // renamed to DRIFT PROBES — see design §0.2
];

/** Measurement-class fields that may appear ONLY inside DRIFT PROBES. */
const MEASUREMENT_FIELDS = [
  'branch', 'head_sha', 'dirty', 'ahead_of_trunk', 'behind_trunk',
  'cache_state', 'production_sha', 'migrations', 'worktree',
];

const VERIFIED_KEYS = ['jurisdiction', 'witness', 'referent', 'provenance'];
const JURISDICTIONS = ['measurement', 'implementation', 'governance'];

// ------------------------------------------------------------------ --init
function measureProbes() {
  const top = git(['rev-parse', '--show-toplevel']);
  const headAt = git(['log', '-1', '--format=%cI', 'HEAD']);
  let trunk = 'UNKNOWN', ahead = 'UNKNOWN', behind = 'UNKNOWN';
  const claudeMd = path.join(top ?? '.', 'CLAUDE.md');
  if (existsSync(claudeMd)) {
    const m = readFileSync(claudeMd, 'utf8').match(/\b(clean-main-no-secrets)\b/);
    if (m && git(['rev-parse', '--verify', '--quiet', m[1]])) {
      trunk = m[1];
      // Named two-dot ranges — never `--left-right`, whose operand order is easy to reverse.
      ahead = git(['rev-list', '--count', `${trunk}..HEAD`]);
      behind = git(['rev-list', '--count', `HEAD..${trunk}`]);
    }
  }
  const status = git(['status', '--porcelain']);
  const dirty = status === null ? 'UNKNOWN' : (status === '' ? 0 : status.split('\n').length);

  const hazards = [];
  for (const rel of ['tsconfig.ship.tsbuildinfo', 'tsconfig.tsbuildinfo', '.next/cache',
                     'node_modules/.cache', '.turbo', 'artifacts', 'coverage', '.eslintcache']) {
    const p = path.join(top ?? '.', rel);
    if (!existsSync(p)) continue;
    if (statSync(p).mtime.getTime() > Date.parse(headAt)) hazards.push(rel);
  }
  return {
    worktree: top, branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
    head_sha: git(['rev-parse', '--short', 'HEAD']), trunk, ahead, behind, dirty,
    cache_state: hazards.length ? `${hazards.join(', ')} NEWER than HEAD` : 'no artifact newer than HEAD',
  };
}

function skeleton() {
  const p = measureProbes();
  return `# CONTINUATION RECORD — <slug>
episode: <what this episode was>   closed: <ISO date>   record-version: 2

## GOAL
<one sentence — the goal being served, not the last task performed>

## DRIFT PROBES
<!-- Prior readings, NOT state. Their only job is to be confirmed or contradicted by /orient.
     Semantically named: never carry raw \`0 10\` and make the reader recall git operand order. -->
worktree: ${p.worktree}
branch: ${p.branch}
head_sha: ${p.head_sha}
ahead_of_trunk: ${p.ahead}
behind_trunk: ${p.behind}
dirty: ${p.dirty}
cache_state: ${p.cache_state}
production_sha: n/a
migrations: none

## GOVERNING DECISIONS
<!-- cite, never restate -->
- <decision> → <path>

## CAPABILITY CONSTRAINTS
- <what must not be removed, downgraded, or read as unwanted — and why>

## ESTABLISHED
- <finding> — evidence: <command | file:line | measured value>

## CHANGED
- <path>:<line> — <what and why>

## VERIFIED
<!-- grammar: <claim> | jurisdiction: <m|i|g> | witness: <x> | referent: <y> | provenance: <z> -->
- <claim> | jurisdiction: implementation | witness: <instrument> | referent: <what it measured> | provenance: <sha · dirty · when>

## INSTRUMENTS USED
- <instrument> | boundary: <bound|deliberately-manual|dormant> | provenance: <run id/hash · when> | result: <r>

## OPEN
? <genuinely unresolved question>
∅ <fact> — not measured

## DO NOT REDISCOVER
- <hypothesis> — FALSIFIED by <evidence>

## NEXT COHERENT ACTION
<one action, specific enough to start without asking a question>
`;
}

// -------------------------------------------------------------- --validate
function validate(text) {
  const findings = [];
  const add = (sev, rule, detail) => findings.push({ severity: sev, rule, detail });

  for (const s of REQUIRED_SECTIONS) {
    if (!new RegExp(`^##\\s*${s.replace(/ /g, '\\s+')}\\b`, 'im').test(text)) {
      add('ERROR', 'missing_section', s);
    }
  }
  for (const h of FORBIDDEN_HEADINGS) {
    if (new RegExp(`^#{1,3}\\s*${h.replace(/ /g, '\\s+')}\\b`, 'im').test(text)) {
      add('ERROR', 'present_state_heading',
        `"${h}" asserts frozen present state; measurement-class facts belong in DRIFT PROBES`);
    }
  }

  const sectionBody = (name) => {
    const m = text.match(new RegExp(`##\\s*${name.replace(/ /g, '\\s+')}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`, 'i'));
    return m ? m[1] : '';
  };
  const entries = (name) => sectionBody(name).split('\n')
    .map((l) => l.trim()).filter((l) => /^[-?∅]/.test(l) && !/^-\s*<.*>\s*$/.test(l));

  // Measurement-class fields may appear only under DRIFT PROBES.
  const probeBody = sectionBody('DRIFT PROBES');
  for (const other of ['ESTABLISHED', 'VERIFIED', 'GOAL', 'DO NOT REDISCOVER']) {
    const body = sectionBody(other);
    for (const f of MEASUREMENT_FIELDS) {
      if (new RegExp(`^\\s*${f}\\s*:`, 'im').test(body)) {
        add('ERROR', 'measurement_outside_drift_probes', `"${f}:" appears under ${other}`);
      }
    }
  }
  for (const f of ['branch', 'head_sha', 'dirty']) {
    if (!new RegExp(`^\\s*${f}\\s*:`, 'im').test(probeBody)) {
      add('WARN', 'drift_probe_missing', `${f} — /orient cannot detect drift on an absent probe`);
    }
  }
  // Raw left/right output must not be carried; semantics must be named.
  if (/^\s*(ahead_behind|trunk_counts)\s*:/im.test(probeBody) || /^\s*\d+\s+\d+\s*$/m.test(probeBody)) {
    add('ERROR', 'unnamed_drift_semantics',
      'carry ahead_of_trunk / behind_trunk, never raw `--left-right` output');
  }

  // VERIFIED grammar — makes under-specified verification hard to encode.
  for (const line of entries('VERIFIED')) {
    for (const k of VERIFIED_KEYS) {
      if (!new RegExp(`${k}\\s*:`, 'i').test(line)) {
        add('ERROR', 'verified_underspecified', `missing "${k}:" → ${line.slice(0, 70)}`);
      }
    }
    const j = line.match(/jurisdiction\s*:\s*([a-z]+)/i)?.[1]?.toLowerCase();
    if (j && !JURISDICTIONS.includes(j)) {
      add('ERROR', 'verified_bad_jurisdiction', `"${j}" ∉ {${JURISDICTIONS.join(', ')}}`);
    }
  }
  for (const line of entries('INSTRUMENTS USED')) {
    if (!/boundary\s*:/i.test(line)) add('ERROR', 'instrument_no_boundary', line.slice(0, 70));
    if (!/provenance\s*:/i.test(line)) add('ERROR', 'instrument_no_provenance', line.slice(0, 70));
  }
  for (const line of entries('ESTABLISHED')) {
    if (!/evidence\s*:/i.test(line)) {
      add('ERROR', 'established_without_evidence',
        `no evidence field → belongs in OPEN: ${line.slice(0, 60)}`);
    }
  }
  for (const line of entries('GOVERNING DECISIONS')) {
    if (!/→|->|\.md|docs\//.test(line)) {
      add('WARN', 'governing_without_citation', line.slice(0, 70));
    }
  }
  const nca = sectionBody('NEXT COHERENT ACTION').split('\n')
    .map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith('<!--'));
  if (nca.filter((l) => /^[-*\d]/.test(l)).length > 1) {
    add('ERROR', 'next_action_not_singular', 'a list means the episode did not close');
  }

  const unknowns = entries('OPEN').filter((l) => l.startsWith('∅'));
  const questions = entries('OPEN').filter((l) => l.startsWith('?'));

  const tokens = estimateTokens(text);
  if (tokens > BUDGET_TOKENS) {
    add('ERROR', 'over_budget', `${tokens} > ${BUDGET_TOKENS} tokens — split; write detail to a doc and cite the path`);
  }

  return {
    tokens, budget: BUDGET_TOKENS, chars: text.length,
    unknown_count: unknowns.length, unknowns,
    open_question_count: questions.length,
    errors: findings.filter((f) => f.severity === 'ERROR'),
    warnings: findings.filter((f) => f.severity === 'WARN'),
    ok: findings.every((f) => f.severity !== 'ERROR'),
  };
}

// -------------------------------------------------------------------- main
if (flag('--init')) { console.log(skeleton()); process.exit(0); }

const target = opt('--validate');
if (!target) {
  console.error('usage: continue.mjs --init | --validate <path> [--json]');
  process.exit(2);
}
if (!existsSync(target)) { console.error(`packet not found: ${target}`); process.exit(2); }

const result = validate(readFileSync(target, 'utf8'));
if (flag('--json')) { console.log(JSON.stringify(result, null, 2)); process.exit(result.ok ? 0 : 1); }

console.log(`/continue --validate ${target}`);
console.log(`  budget    ${result.tokens} / ${result.budget} tokens  (${result.chars} chars)  ${result.tokens <= result.budget ? 'OK' : 'OVER'}`);
console.log(`  UNKNOWN   ${result.unknown_count} carried (∅)   open questions: ${result.open_question_count}`);
for (const u of result.unknowns) console.log(`      ${u.slice(0, 96)}`);
if (result.errors.length) {
  console.log(`\n  ERRORS (${result.errors.length}):`);
  for (const e of result.errors) console.log(`    [${e.rule}] ${e.detail}`);
}
if (result.warnings.length) {
  console.log(`\n  WARNINGS (${result.warnings.length}):`);
  for (const w of result.warnings) console.log(`    [${w.rule}] ${w.detail}`);
}
console.log(`\n  ${result.ok ? 'VALID' : 'INVALID'}`);

// ------------------------------------------------- handoff: release the claim
const handoffSid = opt('--handoff');
if (handoffSid) {
  if (!result.ok) {
    console.error(`\n  ⛔ HANDOFF REFUSED — the packet is INVALID.`);
    console.error(`     The write claim and Claude slot are STILL HELD by ${handoffSid}.`);
    console.error(`     Fix the packet and re-run. A lane released without a valid packet`);
    console.error(`     frees capacity by destroying the continuity it was holding.`);
    process.exit(1);
  }
  const sessionCli = path.join(path.dirname(new URL(import.meta.url).pathname), 'session.mjs');
  if (!existsSync(sessionCli)) {
    console.error(`\n  ⚠ session registry not installed — packet is valid, but no claim was released.`);
    process.exit(0);
  }
  try {
    execFileSync('node', [sessionCli, 'close', '--session', handoffSid, '--state', 'handed-off'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`\n  HANDOFF  ${handoffSid} closed as handed-off`);
    console.log(`     write claim released · Claude concurrency slot released`);
    console.log(`     the next /orient will see this worktree free`);
  } catch (e) {
    console.error(`\n  ⚠ release FAILED for ${handoffSid}: ${(e.stderr || e.message).toString().trim()}`);
    console.error(`     The packet is valid and written. The claim is still held — release it`);
    console.error(`     explicitly: node scripts/builder/session.mjs close --session ${handoffSid} --state handed-off`);
    process.exit(1);
  }
}

process.exit(result.ok ? 0 : 1);
