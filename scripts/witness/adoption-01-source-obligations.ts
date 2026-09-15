/**
 * ADOPTION-01 · PHASE B — SOURCE OBLIGATIONS.
 *
 * ⭐ The behavioural witness proves what the system DID once. These prove what
 * the source CANNOT do — the prohibitions that must hold for every future run,
 * not merely for the fixtures that happened to be built.
 *
 * ⛔⛔ EVERY SCAN STRIPS COMMENTS FIRST. This file's own subjects document their
 * prohibitions in prose, and a raw-source scanner fails a file precisely
 * BECAUSE it states its own compliance — the C21 class, which this programme has
 * now met eight times. ⭐ A prohibition that fires on the sentence explaining it
 * is not an instrument.
 */
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${String(want)}] got [${String(got)}]`);

/** ⛔ Block comments, line comments and JSX comments — then the code alone. */
const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const read = (p: string) => strip(readFileSync(p, 'utf8'));

const SEAM = 'lib/manuscript/editorialRuntime/adoption.ts';
const ROUTE = 'app/api/writers-studio/editorial/adoption/route.ts';
const PANEL = 'app/writers-studio/canvas/EditorialConversation.tsx';
const CONTRACT = 'lib/manuscript/revisionAuthorization/contract.ts';
const STATUS = 'lib/manuscript/revisionAuthorization/status.ts';

const seam = read(SEAM), route = read(ROUTE), panel = read(PANEL);

console.log('\n══════════════════════════════════════════════════════════════════');
console.log(' ADOPTION-01 · PHASE B · SOURCE OBLIGATIONS');
console.log('══════════════════════════════════════════════════════════════════\n');

/* ── the version is NAMED, never derived ─────────────────────────────────── */
eq('S1  ⛔ no ORDER BY anywhere in the adoption seam', /order\s+by/i.test(seam), false);
eq('S2  ⛔ no LIMIT anywhere in the adoption seam', /\blimit\b/i.test(seam), false);
eq('S3  ⛔ no head/latest/newest lookup in the seam',
  /headVersion|latestVersion|newestVersion|\.at\(-1\)|versions\[[^\]]*length/i.test(seam), false);
eq('S4  ⛔ no head lookup in the route', /headVersion|latest|newest/i.test(route), false);

/* ── the caller asserts two ids and nothing else ─────────────────────────── */
const keys = route.match(/const BODY_KEYS = \[([^\]]*)\]/);
eq('S5  the route body is CLOSED to exactly two keys',
  keys ? keys[1].replace(/['"\s]/g, '') : 'ABSENT', 'threadId,versionId');
for (const forbidden of ['baseVersion', 'expectedText', 'idempotencyKey', 'range', 'authorizationId']) {
  eq(`S6  ⛔ the route never reads a caller ${forbidden}`,
    new RegExp(`b\\.${forbidden}|body\\.${forbidden}`).test(route), false);
}
eq('S7  ⛔ the seam takes no chainId from anyone — it derives it from the thread',
  /input\.chainId|chainId:\s*input\./.test(seam), false);
eq('S8  the chain is derived in SQL from an owned thread',
  /FROM ask_threads WHERE id = \$1 AND member_id = \$2/.test(seam), true);

/* ── the seam is not a third authority ───────────────────────────────────── */
eq('S9  ⛔ the seam writes nothing itself',
  /\b(INSERT|UPDATE|DELETE)\b/i.test(seam), false);
eq('S10 ⛔ the seam does not re-implement fit',
  /evaluateExecutionFit|occurrences\(/.test(seam), false);
eq('S11 the seam calls the two existing acts, in order',
  seam.indexOf('authorizeVersion(') < seam.indexOf('executeAuthorization(')
    && seam.includes('authorizeVersion(') && seam.includes('executeAuthorization('), true);
eq('S12 ⛔ and it never retries either of them',
  (seam.match(/executeAuthorization\(/g) ?? []).length, 1);

/* ── exhaustive classification, ⛔ no catch-all ──────────────────────────── */
const classifiers = seam.split('function classify').slice(1);
eq('S13 both classification tables exist', classifiers.length, 2);
eq('S14 ⛔⛔ NO `default:` — an unknown refusal must fail the typecheck, never fall through',
  classifiers.some((c) => /\bdefault\s*:/.test(c.split('\n}')[0])), false);

/* ── the browser is a renderer, ⛔ not an interpreter of manuscript location ─ */
const adoptFn = panel.slice(panel.indexOf('const adopt = async'), panel.indexOf('return (', panel.indexOf('const adopt = async')));
eq('S15 the gesture sends exactly threadId + versionId',
  /JSON\.stringify\(\{\s*threadId,\s*versionId:\s*adoptionTarget\.versionId\s*\}\)/.test(adoptFn), true);
eq('S16 ⛔⛔ the adopted version is the FROZEN target, never the head',
  /adoptionTarget\.versionId/.test(adoptFn) && !/headVersionId/.test(adoptFn), true);
eq('S17 ⛔ the gesture never retries on refusal',
  /retry|again\(\)|for\s*\(|while\s*\(/.test(adoptFn), false);
eq('S18 ⛔ the browser never searches the manuscript to locate the change',
  /locusText\.(indexOf|search|match)|\.indexOf\(view\./.test(panel), false);
eq('S19 ⛔ the browser never constructs a range',
  /range:\s*\{|start:\s*\d|projected_section_body/.test(panel), false);

/* ── the substrate's own laws are untouched ──────────────────────────────── */
const contract = readFileSync(CONTRACT, 'utf8');
eq('S20 the receipt is still whole-or-absent BY TYPE',
  /acceptedAt: null; readonly resultingVersion: null \}\s*\|\s*\{ readonly acceptedAt: string; readonly resultingVersion: number \}/
    .test(contract.replace(/\s+/g, ' ')), true);
const status = read(STATUS);
eq('S21 ChangeLocator is still SERVER-derived, with a required space',
  /space:\s*'projected_section_body'/.test(status), true);

console.log(`\n  ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
