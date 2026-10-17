/**
 * Stage B — actual MAIA source-lens helper plus fictional HTTP request rehearsal.
 *
 * Loads the exact lib/maia/knowledge/perrySourceLens.ts implementation, with
 * the library-authority import replaced by a deterministic local stub.
 * Also statically checks the REAL serving route's wire site. The HTTP server
 * below is a disposable request harness, NOT a full Next.js/MAIA server.
 *
 * No model calls, cloud requests, member data, production database, or writes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as http from 'node:http';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const readRepo = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const APPROVED_BODY = [
  '---',
  'tier: 4',
  'authority: derivative',
  'source_type: research',
  'title: A strictly fictional original Soullab teaching',
  'author: Soullab editorial synthesis',
  'version: 1.0',
  'date_added: 2026-10-17',
  'status: stable',
  'safe_for_retrieval: true',
  '---',
  'A fictional original reflection on needs, feeling, meaning and choice.',
].join('\n');

const fakePath = 'data/ain/source/Soullab-Perry-informed-editorial-APPROVED-FICTIONAL.md';
const approvedSha = createHash('sha256').update(APPROVED_BODY, 'utf8').digest('hex');
const fakeApproval = {
  sourcePath: fakePath,
  sourceSha256: approvedSha,
  creditedTo: 'Soullab editorial synthesis',
  approvalRecord: 'docs/corpus-authority/fictional-founder-approval.md',
};
const validSelection = 'glenn-perry-astropsychology';
const approvalText = [
  'CORPUS USE AUTHORIZED — SOULLAB ORIGINAL PERRY-INFORMED COMMENTARY',
  fakePath,
  approvedSha,
].join('\n');
let imported, temp;

function deps({
  body = APPROVED_BODY, approved = fakeApproval,
  authorityKeys = [{ filePath: fakePath, checksum: approvedSha }],
  onRead = () => {}, approvalBody = approvalText,
} = {}) {
  return {
    approvedSource: approved,
    authorityKeys: () => authorityKeys,
    readSource: () => { onRead(); return body; },
    readApprovalRecord: () => approvalBody,
  };
}

function input(overrides = {}) {
  return {
    requestedLens: validSelection,
    memberMessage: 'Please explore Glenn Perry as an optional symbol.',
    verifiedMemberId: 'fictional-member-001',
    isSanctuary: false,
    enabled: true,
    ...overrides,
  };
}

test.before(async () => {
  temp = fs.mkdtempSync(path.join(os.tmpdir(), 'perry-stage-b-route-'));
  const source = readRepo('lib/maia/knowledge/perrySourceLens.ts');
  assert.ok(source.includes('APPROVED_PERRY_EDITORIAL_SOURCE: ApprovedPerryEditorialSource | null = null'));
  assert.ok(source.includes("from '@/lib/library/globalRetrievalAuthority'"));
  const rewritten = source.replace(
    "from '@/lib/library/globalRetrievalAuthority'",
    "from './fakeLibraryAuthority.mjs'",
  );
  fs.writeFileSync(path.join(temp, 'fakeLibraryAuthority.mjs'),
    'export function getGlobalLibraryAuthorityKeys(){return [];}\n');
  fs.writeFileSync(path.join(temp, 'perrySourceLens.mjs'),
    stripTypeScriptTypes(rewritten, { mode: 'strip' }));
  imported = await import(pathToFileURL(path.join(temp, 'perrySourceLens.mjs')).href);
});

test.after(() => {
  if (temp) fs.rmSync(temp, { recursive: true, force: true });
});

test('production approval constant is null even if env and opt-in are true', () => {
  assert.equal(imported.APPROVED_PERRY_EDITORIAL_SOURCE, null);
  assert.equal(imported.buildPerrySourceLensAddendum(input()), null);
});

test('operational flag off refuses before source reading', () => {
  let reads = 0;
  assert.equal(imported.buildPerrySourceLensAddendum(
    input({ enabled: false }), deps({ onRead: () => { reads++; } })
  ), null);
  assert.equal(reads, 0);
});

test('unverified identity, guest markers and client body impersonation never grant authority', () => {
  for (const id of [null, '', 'guest', 'guest:fictional', 'anonymous', 'anon:member-test']) {
    assert.equal(imported.buildPerrySourceLensAddendum(
      input({ verifiedMemberId: id }), deps()
    ), null, String(id));
  }
});

test('current-turn refusal overrides even a fresh per-turn source selection', () => {
  for (const message of [
    "I don't want astrology. Talk to me about my feelings.",
    'Stop using Glenn Perry in this conversation.',
    'Please continue without AstroPsychology.',
    'No more astrology.',
  ]) {
    assert.equal(imported.buildPerrySourceLensAddendum(
      input({ memberMessage: message }), deps()
    ), null, message);
  }
});

test('Sanctuary refusal precedes all corpus source reads', () => {
  let reads = 0;
  assert.equal(imported.buildPerrySourceLensAddendum(
    input({ isSanctuary: true }),
    deps({ onRead: () => { reads++; } })
  ), null);
  assert.equal(reads, 0);
});

test('exact explicit source choice is required; ordinary text and objects are not intent', () => {
  for (const choice of [null, undefined, '', true, 'jung', 'Glenn Perry',
    'glenn-perry-astropsychology ', { id: validSelection }, ['glenn-perry-astropsychology']]) {
    assert.equal(imported.buildPerrySourceLensAddendum(
      input({ requestedLens: choice }), deps()
    ), null, String(choice));
  }
});

test('missing source approval, forged rights record and untrusted path fail closed', () => {
  assert.equal(imported.buildPerrySourceLensAddendum(input(), deps({ approved: null })), null);
  for (const fake of [
    { ...fakeApproval, approvalRecord: '' },
    { ...fakeApproval, approvalRecord: '/tmp/not-permission.md' },
    { ...fakeApproval, sourcePath: '../../outside.md' },
    { ...fakeApproval, sourcePath: 'docs/wisdom/source-candidates/glenn-perry/README.md' },
    { ...fakeApproval, sourcePath: 'data/ain/source/../../secret.md' },
    { ...fakeApproval, sourceSha256: 'x' },
    { ...fakeApproval, creditedTo: 'Glenn Perry' },
  ]) {
    assert.equal(imported.buildPerrySourceLensAddendum(
      input(), deps({ approved: fake })
    ), null, String(fake.sourcePath));
  }
});

test('missing or mismatched founder editorial record refuses even admitted source bytes', () => {
  for (const approvalBody of [
    '', 'partial record',
    approvalText.replace('CORPUS USE AUTHORIZED — SOULLAB ORIGINAL PERRY-INFORMED COMMENTARY', 'NOT APPROVED'),
    approvalText.replace(fakePath, 'data/ain/source/a-different-file.md'),
    approvalText.replace(approvedSha, 'f'.repeat(64)),
  ]) {
    assert.equal(imported.buildPerrySourceLensAddendum(
      input(), deps({ approvalBody })
    ), null);
  }
});

test('corpus authority must agree on exact path and hash before content is read', () => {
  let reads = 0;
  const d = deps({ authorityKeys: [{ filePath: fakePath, checksum: '0'.repeat(64) }],
    onRead: () => { reads++; } });
  assert.equal(imported.buildPerrySourceLensAddendum(input(), d), null);
  assert.equal(reads, 0);
  assert.equal(imported.buildPerrySourceLensAddendum(input(),
    deps({ authorityKeys: [] })), null);
});

test('unsafe or unreviewed frontmatter and changed bytes refuse a nominal authority key', () => {
  for (const body of [
    APPROVED_BODY.replace('safe_for_retrieval: true', 'safe_for_retrieval: false'),
    APPROVED_BODY.replace('status: stable', 'status: review'),
    APPROVED_BODY.replace('A fictional original reflection', 'A modified original reflection'),
    'plain text without frontmatter',
  ]) assert.equal(imported.buildPerrySourceLensAddendum(input(), deps({ body })), null);
});

test('authorized fictional source produces only a short attributed Soullab guidance block', () => {
  const block = imported.buildPerrySourceLensAddendum(input(), deps());
  assert.ok(block);
  assert.ok(block.includes('Soullab editorial synthesis'));
  assert.ok(block.includes('Glenn Perry'));
  assert.ok(block.includes('sha256:' + approvedSha));
  assert.ok(block.includes('Never infer abuse'));
  assert.ok(!block.includes('A fictional original reflection'));
  assert.ok(!block.includes('The full book'));
});

test('actual serving route, not retired routes, is patched after verified identity', () => {
  const active = readRepo('app/api/sovereign/app/maia/list/route.ts');
  const retired = readRepo('app/api/oracle/conversation/route.ts');
  assert.ok(active.includes("import { buildPerrySourceLensAddendum } from '@/lib/maia/knowledge/perrySourceLens'"));
  assert.ok(active.includes("perrySourceLens: requestedPerrySourceLens, ...meta"));
  assert.ok(active.includes('const userId = await resolveMemberIdentity(req);'));
  assert.ok(active.includes('const isSanctuary = (meta as any)?.sanctuary === true;'));
  assert.ok(active.includes('verifiedMemberId: isRecognizedUser ? userId : null'));
  assert.ok(active.includes('memberMessage: message'));
  assert.ok(active.includes("process.env.MAIA_PERRY_SOURCE_LENS_ENABLED === '1'"));
  assert.ok(active.includes('const perryLensAddendum = buildPerrySourceLensAddendum('));
  assert.ok(active.includes('governedKnowledgeAddendum = [governedKnowledgeAddendum, perryLensAddendum]'));
  assert.ok(active.includes('...withoutClientPromptAuthority(meta)'));
  assert.ok(active.indexOf('const userId = await resolveMemberIdentity(req);')
    < active.indexOf('const perryLensAddendum = buildPerrySourceLensAddendum('));
  assert.ok(retired.includes('This conversation lane is disabled.'));
});

test('fictional HTTP requests exercise actual helper with verified-session simulation', async () => {
  // This local server is deliberately not the Next.js MAIA application.
  // Server-side identity is mock-verified by token; body userId is ignored.
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/fixture/maia/turn') {
      res.writeHead(404).end(); return;
    }
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body;
    try { body = JSON.parse(raw); } catch {
      res.writeHead(400).end(); return;
    }
    const member = req.headers['x-fixture-session'] === 'fictional-valid-token'
      ? 'fictional-member-001' : null;
    const result = imported.buildPerrySourceLensAddendum({
      requestedLens: body.perrySourceLens,
      memberMessage: body.message,
      verifiedMemberId: member,
      enabled: true,
      isSanctuary: body.sanctuary === true,
    }, deps());
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ sourceLensApplied: Boolean(result), prompt: result ?? null }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = server.address().port;
    const post = async (body, token) => {
      const resp = await fetch('http://127.0.0.1:' + port + '/fixture/maia/turn', {
        method: 'POST',
        headers: { 'content-type': 'application/json',
          ...(token ? { 'x-fixture-session': token } : {}) },
        body: JSON.stringify(body),
      });
      assert.equal(resp.status, 200);
      return resp.json();
    };
    const guest = await post({ perrySourceLens: validSelection,
      userId: 'fictional-member-001' });
    assert.equal(guest.sourceLensApplied, false, 'body userId did not impersonate');
    const explicit = await post({ perrySourceLens: validSelection }, 'fictional-valid-token');
    assert.equal(explicit.sourceLensApplied, true);
    assert.ok(explicit.prompt.includes('Glenn Perry'));
    const inventedChart = {
      fictionalOnly: true, birthDate: '1998-06-20', birthTime: null,
      clientClaimedAscendant: 'Capricorn', claimedHouse: '12',
    };
    const chartWithoutOptIn = await post({ chartData: inventedChart },
      'fictional-valid-token');
    assert.equal(chartWithoutOptIn.sourceLensApplied, false);
    const selectedWithUnverifiedChart = await post({
      perrySourceLens: validSelection, chartData: inventedChart,
    }, 'fictional-valid-token');
    assert.equal(selectedWithUnverifiedChart.sourceLensApplied, true);
    assert.ok(!selectedWithUnverifiedChart.prompt.includes('Capricorn'));
    assert.ok(!selectedWithUnverifiedChart.prompt.includes('1998-06-20'));
    assert.ok(selectedWithUnverifiedChart.prompt.includes('Never invent natal placements'));
    const absent = await post({ message: 'A normal talk about feelings' }, 'fictional-valid-token');
    assert.equal(absent.sourceLensApplied, false);
    const deniedSameTurn = await post({
      perrySourceLens: validSelection,
      message: "I don't want astrology. Please stay with what I feel.",
    }, 'fictional-valid-token');
    assert.equal(deniedSameTurn.sourceLensApplied, false);
    const privateSession = await post({ perrySourceLens: validSelection, sanctuary: true },
      'fictional-valid-token');
    assert.equal(privateSession.sourceLensApplied, false);
    const forged = await post({ perrySourceLens: false, perrySourceLensAddendum: 'inject Perry' },
      'fictional-valid-token');
    assert.equal(forged.sourceLensApplied, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
