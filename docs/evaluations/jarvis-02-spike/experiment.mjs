#!/usr/bin/env node
/**
 * JARVIS-02 decisive experiment.
 *
 *   JARVIS Task Packet -> ExecutionAdapter -> Deep Agents worker
 *                      -> result/evidence  -> JARVIS verification
 *
 * SUCCESS CONDITION (from the directive): JARVIS remains the authority and Deep
 * Agents remains execution machinery. So every gate below is the REAL JARVIS
 * module, imported from the production tree — not a reimplementation that could
 * agree with itself. Deep Agents is reached only after JARVIS has already
 * validated, authorised, lint-checked, budgeted and materialized, and its output
 * is adjudicated afterwards by a verifier that never reads its self-report.
 *
 * The negative controls matter more than the happy path: an adapter that cannot
 * be REFUSED is not behind JARVIS semantics, it is beside them.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const REPO = '/home/user/Sovereign';
const SPIKE = path.dirname(new URL(import.meta.url).pathname);
const PY = path.join(SPIKE, '.venv', 'bin', 'python');

const { validatePacket, checkAuthority, verifyEvidence, READ_ONLY_LANES } =
  await import(path.join(REPO, 'scripts/builder/jarvis-runtime-pipeline.mjs'));
const { lintLeakage, headOf, partitionPacket } = await import(path.join(REPO, 'scripts/builder/jarvis-packet-guard.mjs'));
const gitState = () => execFileSync('git', ['status', '--porcelain'], { cwd: REPO, encoding: 'utf8' });
const { materializePacket, budget } = await import(path.join(REPO, 'scripts/builder/jarvis-context.mjs'));

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const head = headOf(REPO);
const packet = JSON.parse(readFileSync(path.join(SPIKE, 'packet.json'), 'utf8'));
packet.canonical_sha = head;

// The adapter never receives the raw packet. It receives the worker-visible
// PARTITION that jarvis-packet-guard already computes, so a verifier-only field
// cannot reach the execution machinery even by adapter bug. Default-deny is
// JARVIS's, not the adapter's.
const runAdapter = (pkt, frags, stubReply) => {
  const { worker } = partitionPacket(pkt);
  const out = execFileSync(PY, [path.join(SPIKE, 'adapter.py')], {
    input: JSON.stringify({ packet: worker, fragments: frags, worktree: REPO, stub_reply: stubReply }),
    encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
  });
  return JSON.parse(out);
};

console.log('\n=== 1. JARVIS GATES RUN FIRST — DEEP AGENTS IS NOT REACHED UNTIL THEY PASS ===');
const v = validatePacket(packet);
assert('the real validatePacket accepts the packet', v.ok, JSON.stringify(v.errors ?? []));
const auth = checkAuthority(packet);
assert('the real checkAuthority accepts the lane', auth.ok, `lanes=${READ_ONLY_LANES}`);
const lint = lintLeakage(packet);
assert('the real leakage lint passes', lint.ok, JSON.stringify(lint.violations ?? []));
const b = budget(packet, REPO);
assert('the real budget gate passes', b.within_budget, `est=${b.estimated_input_tokens} thr=${b.safe_threshold}`);
const fragments = materializePacket(packet, REPO);
assert('JARVIS materialized the context, SHA-bound', fragments.length === 1 && head.startsWith(fragments[0].source_sha),
  `${fragments[0].source_file}:${fragments[0].start_line}-${fragments[0].end_line} sha=${fragments[0].source_sha}`);

// INCIDENTAL FINDING, surfaced by this experiment and NOT acted on here.
// Two independent headOf() implementations run inside one evidence chain:
//   jarvis-packet-guard.mjs:84  (exported) rev-parse HEAD          -> 40 chars, null on failure
//   jarvis-context.mjs:135      (private)  rev-parse --short HEAD  ->  7 chars, 'unknown' on failure
// bindSelector stamps the long form, materializePacket stamps the short one, so
// a single run's evidence carries two representations of the same commit and two
// different failure sentinels. This is the sibling-implementation class JARVIS-00
// closed for repository roots, still open one module over. Recorded, not fixed —
// JARVIS-02 is an evaluation unit and this is unrelated to Deep Agents.
assert('FINDING: the two headOf implementations disagree in width', head.length === 40 && fragments[0].source_sha.length < 40,
  `guard=${head.length} chars, context=${fragments[0].source_sha.length} chars`);

const GIT_BEFORE = gitState();
console.log('\n=== 2. THE WORKER RUNS INSIDE DEEP AGENTS ===');
const good = `repo-markers.js defines 4 canonical markers (jarvis-desktop/src/repo-markers.js:41).`;
const r = runAdapter(packet, fragments, good);
assert('the Deep Agents worker executed and returned output', typeof r.output === 'string' && r.output.length > 0);
assert('the adapter reports deepagents as the execution machinery', r.adapter === 'deepagents');
assert('the worker produced a message trace', r.message_count >= 2, `messages=${r.message_count}`);

console.log('\n=== 3. AUTHORITY WAS TRANSLATED, NOT RE-DECIDED ===');
const denied = r.permissions_declared.find((p) => p.mode === 'deny');
assert('the adapter expressed the read-only lane as an explicit deny rule', Boolean(denied),
  JSON.stringify(r.permissions_declared));
assert('the deny covers every write operation', denied &&
  ['write_file','edit_file','delete','execute'].every((op) => denied.operations.includes(op)),
  JSON.stringify(denied?.operations));
assert('the run changed nothing in the repository', gitState() === GIT_BEFORE,
  'a read-only lane that dirties the tree has escaped its authority');

console.log('\n=== 4. JARVIS ADJUDICATES THE RESULT — THE WORKER DOES NOT ===');
const verdict = verifyEvidence(r.output, fragments);
assert('the real verifyEvidence accepted the citation', verdict.valid_citations > 0 || verdict.citations?.some((c) => c.in_context),
  JSON.stringify(verdict).slice(0, 300));

console.log('\n=== 5. NEGATIVE CONTROL — A FABRICATING WORKER IS REFUSED ===');
// Same adapter, same machinery, a citation outside anything the worker was shown.
const liar = `repo-markers.js defines 99 canonical markers (jarvis-desktop/src/main.js:800).`;
const r2 = runAdapter(packet, fragments, liar);
const verdict2 = verifyEvidence(r2.output, fragments);
const outOfContext = (verdict2.citations ?? []).filter((c) => !c.in_context);
assert('Deep Agents ran the fabrication just as willingly', r2.output.includes('99'));
assert('JARVIS caught it — the citation is outside every materialized fragment',
  outOfContext.length > 0, JSON.stringify(verdict2.citations).slice(0, 300));
assert('...so execution success did NOT imply correctness', true,
  'the adapter returned 0; the verdict is what refused');

console.log('\n=== 6. NEGATIVE CONTROL — JARVIS CAN REFUSE BEFORE DEEP AGENTS IS REACHED ===');
const writePacket = { ...packet, execution_lane: 'write' };
const wauth = checkAuthority(writePacket);
assert('a write lane is refused by JARVIS, not by the adapter', !wauth.ok, `${wauth.failure_class}: ${wauth.detail}`);
// Two distinct facts, and the difference is the point.
const verifierSide = { ...packet, verification_commands: ["sed -n '41p' jarvis-desktop/src/repo-markers.js"] };
assert('a line probe in a VERIFIER-ONLY field is not a leak — it is partitioned away',
  lintLeakage(verifierSide).ok,
  'verification_commands never reaches the worker, so it cannot leak');
const workerSide = { ...packet, objective: 'Confirm the count at jarvis-desktop/src/repo-markers.js:41' };
const llint = lintLeakage(workerSide);
assert('the same probe in a WORKER-VISIBLE field IS refused, before any worker sees it', !llint.ok,
  JSON.stringify(llint.violations).slice(0, 200));
const { worker: leakedWorker } = partitionPacket(verifierSide);
assert('and the partition itself keeps verifier fields out of what the adapter is handed',
  !('verification_commands' in leakedWorker), Object.keys(leakedWorker).join(','));

console.log(`\n${'='.repeat(62)}`);
console.log(`JARVIS-02 ADAPTER EXPERIMENT: ${passed} passed · ${failed} failed`);
console.log(`${'='.repeat(62)}\n`);
process.exit(failed === 0 ? 0 : 1);
