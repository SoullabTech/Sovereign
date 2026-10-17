/**
 * Stage B — physical, fictional corpus admission + Perry lens integration.
 *
 * This suite imports the actual admission, global Library authority, and
 * Perry source lens implementations (Node 22 type strip only). It constructs
 * disposable ORIGINAL fiction documents and metadata on disk. It NEVER
 * promotes Perry's copyrighted books, a real member, or a source branch.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const readRepo = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');
const relativeSource = 'data/ain/source/FICTIONAL-Soullab-Perry-Informed-Reflection.md';
const marker = 'FICTIONAL_RIGHTS_MARKER_NO_REAL_LICENSE';
const originalText = [
  '---',
  'title: Fictional source for isolated acceptance testing',
  'author: Soullab editorial synthesis',
  'authority: derivative',
  'source_type: research',
  'tier: 4',
  'status: stable',
  'safe_for_retrieval: true',
  '---',
  'A fictional original question about human needs, emotional expression and choice.',
  marker,
].join('\n');
const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const approved = {
  sourcePath: relativeSource,
  sourceSha256: sha(originalText),
  creditedTo: 'Soullab editorial synthesis',
  approvalRecord: 'docs/corpus-authority/fictional-founder-record.md',
};

let loadingDir;
let admission, globalAuthority, perry;

test.before(async () => {
  loadingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perry-stage-b-modules-'));
  const modules = [
    ['lib/corpus/admission.ts', 'lib/corpus/admission.mjs'],
    ['lib/library/globalRetrievalAuthority.ts', 'lib/library/globalRetrievalAuthority.mjs'],
    ['lib/maia/knowledge/perrySourceLens.ts', 'lib/maia/knowledge/perrySourceLens.mjs'],
  ];
  for (const [source, target] of modules) {
    const destination = path.join(loadingDir, target);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    let text = readRepo(source);
    if (source.includes('globalRetrievalAuthority')) {
      text = text.replace("from '../corpus/admission'", "from '../corpus/admission.mjs'");
    }
    if (source.includes('perrySourceLens')) {
      text = text.replace("from '@/lib/library/globalRetrievalAuthority'",
        "from '../../library/globalRetrievalAuthority.mjs'");
    }
    fs.writeFileSync(destination, stripTypeScriptTypes(text, { mode: 'strip' }));
  }
  admission = await import(pathToFileURL(path.join(loadingDir, 'lib/corpus/admission.mjs')).href);
  globalAuthority = await import(pathToFileURL(path.join(loadingDir, 'lib/library/globalRetrievalAuthority.mjs')).href);
  perry = await import(pathToFileURL(path.join(loadingDir, 'lib/maia/knowledge/perrySourceLens.mjs')).href);
});

test.after(() => {
  if (loadingDir) fs.rmSync(loadingDir, { recursive: true, force: true });
});

async function withCorpus(fn, {
  doc = originalText,
  classification = 'organizational_public',
  evidence = { source: 'in_file', marker },
  authorityKind = 'soullab_owned',
  admittingRule = true,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'perry-fictional-corpus-'));
  const file = path.join(root, relativeSource);
  const manifest = path.join(root, 'data/ain/corpus-admission.json');
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, doc);
    const rule = {
      prefix: relativeSource,
      classification,
      reason: 'fictional test authority; not an actual rights grant',
      authority: { kind: authorityKind, evidence },
    };
    fs.writeFileSync(manifest, JSON.stringify({ rules: admittingRule ? [rule] : [] }));
    globalAuthority.resetGlobalLibraryAuthorityCacheForTests();
    const server = {
      approvedSource: approved,
      authorityKeys: () => globalAuthority.getGlobalLibraryAuthorityKeys(root),
      readSource: (rel) => fs.readFileSync(path.join(root, rel), 'utf8'),
    };
    const turn = { requestedLens: perry.PERRY_SOURCE_LENS_ID,
      verifiedMemberId: 'fictional-verified-member', isSanctuary: false, enabled: true };
    await fn({ root, file, manifest, server, turn });
  } finally {
    globalAuthority.resetGlobalLibraryAuthorityCacheForTests();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('actual admission guard gives a matching fictional, explicit Soullab source key', async () => {
  await withCorpus(({ root, server, turn }) => {
    const keys = globalAuthority.getGlobalLibraryAuthorityKeys(root);
    assert.equal(keys.length, 1);
    assert.equal(keys[0].filePath, relativeSource);
    assert.equal(keys[0].checksum, sha(originalText));
    const block = perry.buildPerrySourceLensAddendum(turn, server);
    assert.ok(block && block.includes('Glenn Perry'));
    assert.ok(block.includes('sha256:' + sha(originalText)));
    assert.ok(!block.includes(marker), 'original source body never leaks');
  });
});

test('real production approval remains ungranted even in an approved fictional corpus', async () => {
  await withCorpus(({ turn }) => {
    assert.equal(perry.APPROVED_PERRY_EDITORIAL_SOURCE, null);
    assert.equal(perry.buildPerrySourceLensAddendum(turn), null);
  });
});

test('missing corpus admission produces zero keys and zero Perry source lens', async () => {
  await withCorpus(({ root, server, turn }) => {
    assert.deepEqual(globalAuthority.getGlobalLibraryAuthorityKeys(root), []);
    assert.equal(perry.buildPerrySourceLensAddendum(turn, server), null);
  }, { admittingRule: false });
});

test('a copyright-incompatible third-party admission rule cannot authorize original commentary', async () => {
  await withCorpus(({ root, server, turn }) => {
    assert.deepEqual(globalAuthority.getGlobalLibraryAuthorityKeys(root), []);
    assert.equal(perry.buildPerrySourceLensAddendum(turn, server), null);
  }, { classification: 'third_party_published', authorityKind: 'soullab_owned' });
});

test('invented manifest permission without corroborating in-file evidence is denied', async () => {
  await withCorpus(({ root, server, turn }) => {
    assert.deepEqual(globalAuthority.getGlobalLibraryAuthorityKeys(root), []);
    assert.equal(perry.buildPerrySourceLensAddendum(turn, server), null);
  }, { evidence: { source: 'in_file', marker: 'FAKE_RIGHTS_MARKER_NOT_IN_DOC' } });
});

test('a stale authority-key cache cannot override a changed source checksum', async () => {
  await withCorpus(({ root, file, server, turn }) => {
    const keys = globalAuthority.getGlobalLibraryAuthorityKeys(root);
    assert.equal(keys.length, 1);
    fs.writeFileSync(file, originalText + '\nUNEXPECTED MODIFY AFTER REVIEW\n');
    assert.equal(perry.buildPerrySourceLensAddendum(turn, server), null);
    assert.equal(keys[0].checksum, sha(originalText));
  });
});

test('frontmatter without stable/retrieval-safe status cannot reach the lens', async () => {
  await withCorpus(({ root, server, turn }) => {
    assert.equal(globalAuthority.getGlobalLibraryAuthorityKeys(root).length, 1);
    assert.equal(perry.buildPerrySourceLensAddendum(turn, server), null);
  }, { doc: originalText.replace('status: stable', 'status: review') });
});

test('Sanctuary never reads the real fictional admitted source', async () => {
  await withCorpus(({ server, turn }) => {
    let reads = 0, authorityQueries = 0;
    const monitored = {
      ...server,
      readSource: (path) => { reads++; return server.readSource(path); },
      authorityKeys: () => { authorityQueries++; return server.authorityKeys(); },
    };
    assert.equal(perry.buildPerrySourceLensAddendum(
      { ...turn, isSanctuary: true }, monitored), null);
    assert.equal(reads, 0);
    assert.equal(authorityQueries, 0);
  });
});
