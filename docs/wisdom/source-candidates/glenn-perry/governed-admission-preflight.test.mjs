/**
 * Bounded, disposable test of the REAL repository corpus admission and
 * global Library retrieval-authorization functions against Perry candidate
 * content. Do not confuse this with deployment, database, or model testing.
 *
 * Usage (Node 22+):
 *   node --test docs/wisdom/source-candidates/glenn-perry/governed-admission-preflight.test.mjs
 *
 * No model calls, network, credentials, member data, production writes,
 * mutation of the repository declaration, or copyrighted book/essay bodies.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const read = (rel) => fs.readFileSync(path.join(repo, rel), 'utf8');
const sourceRel = 'data/ain/source/Perry-Soullab-editorial-candidate.md';
const orig = read('docs/wisdom/source-candidates/glenn-perry/soullab-original-teaching-candidate.md');

async function withFixture(run) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'perry-admission-preflight-'));
  try {
    for (const dir of ['lib/corpus','lib/library','data/ain/source'])
      fs.mkdirSync(path.join(temp, dir), { recursive: true });
    const admission = stripTypeScriptTypes(read('lib/corpus/admission.ts'), { mode: 'strip' });
    const library = stripTypeScriptTypes(read('lib/library/globalRetrievalAuthority.ts'), { mode: 'strip' })
      .replace("from '../corpus/admission'", "from '../corpus/admission.mjs'");
    fs.writeFileSync(path.join(temp, 'lib/corpus/admission.mjs'), admission);
    fs.writeFileSync(path.join(temp, 'lib/library/globalRetrievalAuthority.mjs'), library);
    fs.writeFileSync(path.join(temp, 'data/ain/corpus-admission.json'), read('data/ain/corpus-admission.json'));
    const work = path.join(temp, sourceRel);
    fs.writeFileSync(work, orig);
    const admissionFns = await import(pathToFileURL(path.join(temp, 'lib/corpus/admission.mjs')).href);
    const libraryFns = await import(pathToFileURL(path.join(temp, 'lib/library/globalRetrievalAuthority.mjs')).href);
    await run({ temp, work, admissionFns, libraryFns });
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

test('actual admission decision excludes unapproved Perry-informed editorial text', async () => {
  await withFixture(async ({ temp, work, admissionFns }) => {
    const d = admissionFns.loadDeclaration(temp);
    const v = admissionFns.decideAdmission(temp, [work], d);
    assert.deepEqual(v.admitted, []);
    assert.equal(v.refused.length, 0);
    assert.equal(v.excluded.length, 1);
    assert.match(v.excluded[0].reason, /unclassified_legacy|no admission rule/);
  });
});

test('forged safe_for_retrieval frontmatter does not grant corpus membership', async () => {
  await withFixture(async ({ temp, work, admissionFns }) => {
    const altered = orig.replace('safe_for_retrieval: false', 'safe_for_retrieval: true');
    assert.notEqual(altered, orig);
    fs.writeFileSync(work, altered);
    const verdict = admissionFns.decideAdmission(temp, [work], admissionFns.loadDeclaration(temp));
    assert.deepEqual(verdict.admitted, []);
    assert.equal(verdict.excluded.length, 1);
  });
});

test('a new admitting rule without structured rights evidence is refused', async () => {
  await withFixture(async ({ temp, work, admissionFns }) => {
    const d = admissionFns.loadDeclaration(temp);
    d.rules.unshift({
      prefix: sourceRel,
      classification: 'published_knowledge',
      reason: 'intentionally forged permission test',
    });
    const v = admissionFns.decideAdmission(temp, [work], d);
    assert.deepEqual(v.admitted, []);
    assert.match(v.excluded[0].reason, /structured corpus authority/);
  });
});

test('a made-up rights-holder record or false digest cannot authorize text', async () => {
  await withFixture(async ({ temp, work, admissionFns }) => {
    const d = admissionFns.loadDeclaration(temp);
    d.rules.unshift({
      prefix: sourceRel,
      classification: 'published_knowledge',
      reason: 'intentionally forged authorization test',
      authority: {
        kind: 'rights_holder_authorized',
        rightsHolder: 'Glenn Perry',
        evidence: {
          source: 'governed_record',
          ref: 'docs/corpus-authority/perry-missing.md',
          marker: 'NOT_A_REAL_PERMISSION',
          subject_sha256: '0'.repeat(64),
        },
      },
    });
    const v = admissionFns.decideAdmission(temp, [work], d);
    assert.deepEqual(v.admitted, []);
    assert.match(v.excluded[0].reason, /SHA-256|authorization|governed/);
  });
});

test('real global Library authority SQL is fail-closed for the staged source', async () => {
  await withFixture(async ({ temp, libraryFns }) => {
    libraryFns.resetGlobalLibraryAuthorityCacheForTests();
    assert.deepEqual(libraryFns.getGlobalLibraryAuthorityKeys(temp), []);
    const sql = libraryFns.buildGlobalLibraryAuthoritySql('src', 1, temp);
    assert.equal(sql.clause.trim(), 'AND FALSE');
    assert.deepEqual(sql.params, []);
  });
});
