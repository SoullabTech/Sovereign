// RGE-001 · B′ conformance suite (controlled cases, local harness)
// Extracts the live script block from covenant-gates.yml and runs it against
// mocked GitHub API surfaces. Tests BEHAVIOUR + LEDGER TEXT, not just exit code.
import fs from 'node:fs';

const WF = process.argv[2];
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);

// ── extract the `script: |` block verbatim from the workflow ────────────────
function extractScript(path) {
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  const i = lines.findIndex(l => l.trim() === 'script: |');
  if (i < 0) throw new Error('no script block found');
  const indent = lines[i + 1].length - lines[i + 1].trimStart().length;
  const out = [];
  for (const l of lines.slice(i + 1)) {
    if (l.trim() === '') { out.push(''); continue; }
    if (l.length - l.trimStart().length < indent) break;
    out.push(l.slice(indent));
  }
  return out.join('\n');
}
const SCRIPT = extractScript(WF);
const runGate = new Function('github', 'context', 'core', `return (async () => { ${SCRIPT} })()`);

// ── harness ─────────────────────────────────────────────────────────────────
async function run({ labels = [], body = '', files = [], comments = [], headSha = SHA_A }) {
  const posted = [];
  let failed = null;
  const context = {
    repo: { owner: 'SoullabTech', repo: 'Sovereign' },
    payload: {
      pull_request: {
        number: 1, body,
        labels: labels.map(name => ({ name })),
        head: { sha: headSha }
      }
    }
  };
  const github = {
    rest: {
      pulls: { listFiles: async () => ({ data: files.map(filename => ({ filename })) }) },
      issues: {
        listComments: async () => ({ data: comments.map((c, i) => ({
          id: 1000 + i, body: c.body, user: { login: c.author }, created_at: '2026-08-12T00:00:00Z'
        })) }),
        createComment: async ({ body }) => { posted.push(body); },
        updateComment: async ({ body }) => { posted.push(body); }
      }
    }
  };
  const core = { setFailed: m => { failed = m; } };
  await runGate(github, context, core);
  return { failed, comment: posted.join('\n') };
}

// ── fixtures ────────────────────────────────────────────────────────────────
const GOV_FILES = [
  'docs/architecture/governance/crp-001/CRP-001-STEP2-RULINGS.md',
  'docs/architecture/audits/MIR-001_MAIA_HEALTH_MAP_2026-08-12.md'
];
const DECL = 'independent_council_review: NOT SATISFIED';
const founderSignoff = (sha = SHA_A, author = 'Soullab', role = 'founder-steward') =>
  ({ author, body: `/covenant-signoff role=${role} sha=${sha}` });

// ── cases ───────────────────────────────────────────────────────────────────
const cases = [];
const N = (id, name, input, expect) => cases.push({ id, name, input, expect: { ...expect, mustFail: true } });
const P = (id, name, input, expect) => cases.push({ id, name, input, expect: { ...expect, mustFail: false } });

// -- the seven ruled negative controls --------------------------------------
N('N1', 'class-a + governance scope + NO founder signoff',
  { labels: ['class-a'], body: DECL, files: GOV_FILES },
  { expectText: /Founder-Steward signoff|requires a Founder-Steward signoff/i });

N('N2', 'founder signoff on STALE sha (head moved A→B)',
  { labels: ['class-a'], body: DECL, files: GOV_FILES, headSha: SHA_B, comments: [founderSignoff(SHA_A)] },
  { expectText: /stale signoff|requires a Founder-Steward signoff/i });

N('N3', 'product/runtime path inside an otherwise-valid bootstrap PR',
  { labels: ['class-a'], body: DECL, files: [...GOV_FILES, 'lib/memory/retrieval.ts'], comments: [founderSignoff()] },
  { expectText: /outside governance-bootstrap scope/i });

N('N4', 'BOOTSTRAP claimed while Guardian Circle NON-EMPTY',
  { labels: ['class-a'], body: DECL, files: GOV_FILES, comments: [founderSignoff()] },
  { expectText: /Council signoffs required/i, patchCircle: ['CouncilAlice', 'CouncilBob'] });

N('N5', 'missing "independent_council_review: NOT SATISFIED" declaration',
  { labels: ['class-a'], body: 'no declaration here', files: GOV_FILES, comments: [founderSignoff()] },
  { expectText: /independent_council_review/i });

N('N6', 'covenant-signoff LABEL only, no structured act',
  { labels: ['class-a', 'covenant-signoff'], body: DECL, files: GOV_FILES },
  { expectText: /requires a Founder-Steward signoff/i });

N('N7', 'service identity claiming role=council',
  { labels: ['class-a'], body: DECL, files: GOV_FILES,
    comments: [founderSignoff(), { author: 'SoullabCovenant', body: `/covenant-signoff role=council sha=${SHA_A}` }] },
  { expectText: /Identity violation/i });

// -- family 1 · role/identity regression -------------------------------------
N('R1a', 'service identity claiming role=mentor',
  { labels: ['class-a'], body: DECL, files: GOV_FILES,
    comments: [founderSignoff(), { author: 'SoullabCovenant', body: `/covenant-signoff role=mentor sha=${SHA_A}` }] },
  { expectText: /Identity violation/i });

N('R1b', 'UNKNOWN account claiming Founder-Steward',
  { labels: ['class-a'], body: DECL, files: GOV_FILES, comments: [founderSignoff(SHA_A, 'RandomPerson')] },
  { expectText: /requires a Founder-Steward signoff/i });

P('R1c', 'service-attestation accepted as service evidence, never a vote',
  { labels: ['class-a'], body: DECL, files: GOV_FILES,
    comments: [founderSignoff(), { author: 'SoullabCovenant', body: `/covenant-signoff role=service-attestation sha=${SHA_A}` }] },
  { expectText: /constitutional_mentor_vote\s+NO/i });

// -- family 2 · freshness / scope regression ---------------------------------
P('R2a', 'valid founder signoff on SHA A → pass',
  { labels: ['class-a'], body: DECL, files: GOV_FILES, comments: [founderSignoff(SHA_A)] },
  { expectText: /BOOTSTRAP_NO_COUNCIL/ });

N('R2b', 'a DIFFERENT docs/architecture/audits/* file → scope fails',
  { labels: ['class-a'], body: DECL, comments: [founderSignoff()],
    files: ['docs/architecture/governance/crp-001/x.md', 'docs/architecture/audits/SOME_OTHER_AUDIT.md'] },
  { expectText: /outside governance-bootstrap scope/i });

// -- family 3 · non-Class-A regression ---------------------------------------
P('R3a', 'Class C unaffected by bootstrap logic',
  { labels: ['class-c'], body: '', files: ['components/Button.tsx'] }, {});

N('R3b', 'Class B still requires a rollback plan',
  { labels: ['class-b'], body: '', files: ['database/migrations/001_x.sql'] },
  { expectText: /Rollback plan required/i });

P('R3c', 'Class B with rollback plan passes; no disposition engine applied',
  { labels: ['class-b'], body: '[x] Revert commit is sufficient', files: ['lib/api/routing.ts'] },
  { forbidText: /BOOTSTRAP_NO_COUNCIL|Council #1/ });

// -- the positive control, shaped like real #1039 -----------------------------
P('POS', 'positive control — real #1039 shape',
  { labels: ['class-a'], body: `Some body.\n\n${DECL}\n`, files: GOV_FILES, comments: [founderSignoff(SHA_A)] },
  { expectText: /BOOTSTRAP_NO_COUNCIL/,
    ledgerMust: [
      /Founder-Steward\s+SATISFIED/i,
      /mentor_status\s+NOT_INDEPENDENTLY_SATISFIED/i,
      /Council #1\s+NOT AVAILABLE/i,
      /Council #2\s+NOT AVAILABLE/i,
      /independent review\s+NOT SATISFIED/i,
      /disposition\s+BOOTSTRAP_NO_COUNCIL/i
    ],
    forbidText: /Class A approved|CLASS_A_SATISFIED/i });

// ── execute ─────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
for (const c of cases) {
  let wf = WF;
  let tmp = null;
  if (c.expect.patchCircle) {
    // simulate an appointed Guardian Circle by patching the roster constant
    tmp = '/tmp/wf-patched.yml';
    fs.writeFileSync(tmp, fs.readFileSync(WF, 'utf8').replace(
      'const GUARDIAN_CIRCLE = [];',
      `const GUARDIAN_CIRCLE = ${JSON.stringify(c.expect.patchCircle)};`));
    wf = tmp;
  }
  const savedScript = SCRIPT;
  let runner = runGate;
  if (tmp) {
    const s = extractScript(tmp);
    runner = new Function('github', 'context', 'core', `return (async () => { ${s} })()`);
  }
  const origRun = globalThis.__gate; globalThis.__gate = runner;

  let res;
  try {
    // temporarily swap the compiled gate for patched-roster cases
    res = await (async () => {
      const saved = runGate;
      if (tmp) {
        const g = runner;
        return await (async () => {
          const posted = [];
          let failed = null;
          const context = { repo: { owner: 'o', repo: 'r' }, payload: { pull_request: {
            number: 1, body: c.input.body || '', labels: (c.input.labels || []).map(name => ({ name })),
            head: { sha: c.input.headSha || SHA_A } } } };
          const github = { rest: {
            pulls: { listFiles: async () => ({ data: (c.input.files || []).map(filename => ({ filename })) }) },
            issues: {
              listComments: async () => ({ data: (c.input.comments || []).map((x, i) => ({ id: 1000 + i, body: x.body, user: { login: x.author }, created_at: 'T' })) }),
              createComment: async ({ body }) => posted.push(body),
              updateComment: async ({ body }) => posted.push(body) } } };
          const core = { setFailed: m => { failed = m; } };
          await g(github, context, core);
          return { failed, comment: posted.join('\n') };
        })();
      }
      return await run(c.input);
    })();
  } catch (e) {
    res = { failed: `HARNESS ERROR: ${e.message}`, comment: '' };
  }
  globalThis.__gate = origRun;

  const blob = `${res.failed || ''}\n${res.comment || ''}`;
  const errs = [];
  if (c.expect.mustFail && !res.failed) errs.push('expected FAIL, got PASS');
  if (!c.expect.mustFail && res.failed) errs.push(`expected PASS, got FAIL: ${String(res.failed).slice(0, 160)}`);
  if (c.expect.expectText && !c.expect.expectText.test(blob)) errs.push(`missing expected text ${c.expect.expectText}`);
  if (c.expect.forbidText && c.expect.forbidText.test(blob)) errs.push(`contains forbidden text ${c.expect.forbidText}`);
  for (const re of (c.expect.ledgerMust || [])) if (!re.test(blob)) errs.push(`ledger missing ${re}`);

  if (errs.length) { fail++; console.log(`❌ ${c.id}  ${c.name}`); errs.forEach(e => console.log(`      ${e}`)); }
  else { pass++; console.log(`✅ ${c.id}  ${c.name}`); }
}

console.log(`\n${pass} passed, ${fail} failed, ${cases.length} total`);
if (fail === 0) {
  const shown = (await run({ labels: ['class-a'], body: DECL, files: GOV_FILES, comments: [founderSignoff(SHA_A)] })).comment;
  console.log('\n──── POSITIVE-CONTROL LEDGER AS RENDERED ────');
  console.log(shown);
}
process.exit(fail === 0 ? 0 : 1);
