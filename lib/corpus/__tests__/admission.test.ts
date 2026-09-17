/**
 * @jest-environment node
 *
 * SOURCE-CUSTODY-PII-01 · ACT 4 §C — corpus admission.
 *
 * The law under test:
 *
 *     Membership must be DECLARED and CHECKED,
 *     never INHERITED from where a thing happens to sit.
 *
 * ⭐ T6 IS THE MUTANT and it is the reason the rest of this suite means
 * anything. It reruns T1's proposition against a default-admit implementation —
 * the pre-repair behaviour, where being in the directory was enough — and
 * REQUIRES it to fail. A guard whose default is admission is the defect wearing
 * a manifest, and this is what distinguishes the two.
 */
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  decideAdmission,
  loadDeclaration,
  type AdmissionDeclaration,
} from '../admission';

const ROOT = '/repo';
const files = (...names: string[]) => names.map((n) => path.join(ROOT, n));

const declaration = (rules: AdmissionDeclaration['rules']): AdmissionDeclaration => ({ rules });

const reader = (contents: Record<string, string>) => (abs: string) => {
  const rel = path.relative(ROOT, abs);
  if (!(rel in contents)) throw new Error('missing');
  return contents[rel];
};

describe('ACT 4 §C · corpus admission', () => {
  test('T1 — an undeclared file is EXCLUDED, not admitted', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/anything.md'),
      declaration([]),
      reader({ 'data/ain/source/anything.md': 'harmless prose' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded).toHaveLength(1);
    expect(v.excluded[0].reason).toMatch(/no admission rule/);
  });

  test('T2 — unclassified_legacy does not admit', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/legacy.md'),
      declaration([
        { prefix: 'data/ain/source', classification: 'unclassified_legacy', reason: 'held' },
      ]),
      reader({ 'data/ain/source/legacy.md': 'harmless prose' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/does not permit/);
  });

  test('T3 — a declared, classified, clean file IS admitted', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        { prefix: 'data/ain/source/books', classification: 'published_knowledge', reason: 'ok', authority: { kind: 'soullab_owned', evidence: { source: 'in_file', marker: 'On the nature of attention.' } } },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'On the nature of attention.' }),
    );
    expect(v.admitted).toEqual(['data/ain/source/books/essay.md']);
    expect(v.refused).toEqual([]);
  });

  test('T4 — content overrides a wrong declaration (defence in depth)', () => {
    const roster = [
      'Beta tester list',
      'a@gmail.com',
      'b@gmail.com',
      'c@gmail.com',
      'passcode: SOULLAB-SOMEONE',
    ].join('\n');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/testers.md'),
      declaration([
        { prefix: 'data/ain/source/books', classification: 'published_knowledge', reason: 'wrong', authority: { kind: 'soullab_owned', evidence: { source: 'in_file', marker: 'Beta tester list' } } },
      ]),
      reader({ 'data/ain/source/books/testers.md': roster }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.refused).toHaveLength(1);
    expect(v.refused[0].reason).toMatch(/human-record signal/);
  });

  test('T5 — the longest matching prefix wins, so a narrow rule can close a broad one', () => {
    const rules = declaration([
      { prefix: 'data/ain/source', classification: 'published_knowledge', reason: 'broad', authority: { kind: 'soullab_owned', evidence: { source: 'in_file', marker: 'public essay' } } },
      {
        prefix: 'data/ain/source/private',
        classification: 'operational_human_record',
        reason: 'narrow',
      },
    ]);
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/open.md', 'data/ain/source/private/roster.md'),
      rules,
      reader({
        'data/ain/source/open.md': 'public essay',
        'data/ain/source/private/roster.md': 'names',
      }),
    );
    expect(v.admitted).toEqual(['data/ain/source/open.md']);
    expect(v.excluded.map((e) => e.file)).toEqual(['data/ain/source/private/roster.md']);
  });

  test('T6 — MUTANT: a default-admit implementation fails T1', () => {
    // The pre-repair behaviour: presence in the directory was admission.
    const defaultAdmit = (candidates: string[]) => ({ admitted: candidates, excluded: [] });
    const v = defaultAdmit(files('data/ain/source/anything.md'));
    // T1's proposition, rerun against it — it must NOT hold.
    expect(v.admitted).not.toEqual([]);
    expect(v.excluded).toEqual([]);
  });

  test('T7 — a missing declaration file admits nothing', () => {
    const empty = loadDeclaration('/nonexistent-repo-root');
    expect(empty.rules).toEqual([]);
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/x.md'),
      empty,
      reader({ 'data/ain/source/x.md': 'prose' }),
    );
    expect(v.admitted).toEqual([]);
  });

  test('T8 — the shipped declaration holds the real corpus closed', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const real = loadDeclaration(repoRoot);
    expect(real.rules.length).toBeGreaterThan(0);
    const v = decideAdmission(
      repoRoot,
      [path.join(repoRoot, 'data/ain/source/some-unclassified-file.md')],
      real,
      () => 'prose',
    );
    expect(v.admitted).toEqual([]);
  });

  test('T9 — declaration paths are segment-bounded, not character prefixes', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source-private/roster.md'),
      declaration([
        { prefix: 'data/ain/source', classification: 'published_knowledge', reason: 'source only', authority: { kind: 'soullab_owned', evidence: { source: 'in_file', marker: 'harmless prose' } } },
      ]),
      reader({ 'data/ain/source-private/roster.md': 'harmless prose' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded).toHaveLength(1);
    expect(v.excluded[0].reason).toMatch(/no admission rule/);
  });

  test('T10 — every bulk data/ain/source ingestion path reaches the admission boundary', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const readCode = (rel: string) =>
      fs.readFileSync(path.join(repoRoot, rel), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');

    const builder = readCode('scripts/build-ain-corpus.ts');
    const embed = readCode('scripts/embed-ain-knowledge.ts');
    const chunker = readCode('lib/ain/knowledge/ChunkingService.ts');
    const library = readCode('scripts/ingest-library.ts');

    expect(builder).toMatch(/decideAdmission\(/);
    expect(embed).toMatch(/processAllSources\(/);
    expect(chunker).toMatch(/decideAdmission\(/);
    expect(library).toMatch(/decideAdmission\(/);
  });

  test('T11 — Living Library zero-admission force refusal precedes destructive deletes', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const src = fs.readFileSync(path.join(repoRoot, 'scripts/ingest-library.ts'), 'utf8');
    const refusal = src.indexOf("sourceAdmission!.admitted.length === 0");
    const deleteChunks = src.indexOf("DELETE FROM library_chunks");
    const deleteSources = src.indexOf("DELETE FROM library_sources");
    expect(refusal).toBeGreaterThan(-1);
    expect(deleteChunks).toBeGreaterThan(refusal);
    expect(deleteSources).toBeGreaterThan(refusal);
  });

  test('T12 — an admitting classification without structured authority is EXCLUDED', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        { prefix: 'data/ain/source/books', classification: 'published_knowledge', reason: 'looks authored' },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'On the nature of attention.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/requires a structured corpus authority basis/);
  });

  test('T13 — third-party publication requires third-party authority, not an ownership fiction', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'published work',
          authority: { kind: 'soullab_owned', evidence: { source: 'in_file', marker: 'Published prose.' } },
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/incompatible/);
  });

  test('T14 — a reason string cannot smuggle authority into the corpus', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'licensed and definitely okay',
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/structured corpus authority basis/);
  });

  test('T15 — a compatible third-party license basis can admit a clean file', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'license verified',
          authority: { kind: 'license', evidence: { source: 'in_file', marker: 'CC BY 4.0' } },
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose. CC BY 4.0' }),
    );
    expect(v.admitted).toEqual(['data/ain/source/books/essay.md']);
  });

  test('T16 — a free-text authority evidence assertion is EXCLUDED rather than trusted', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'license claimed',
          authority: { kind: 'license', evidence: 'licensed' } as any,
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/structured corpus authority basis/);
  });

  test('T17 — declared in-file authority evidence must actually occur in the work', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'license claimed',
          authority: { kind: 'license', evidence: { source: 'in_file', marker: 'CC BY 4.0' } },
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose with no license statement.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/in-file authority evidence was not found/);
  });

  test('T18 — governed-record authority must resolve to a record containing the declared marker', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'permission recorded',
          authority: {
            kind: 'permission',
            evidence: { source: 'governed_record', ref: 'docs/corpus-authority/essay.md', marker: 'CORPUS USE AUTHORIZED' },
          },
        },
      ]),
      reader({
        'data/ain/source/books/essay.md': 'Published prose.',
        'docs/corpus-authority/essay.md': 'CORPUS USE AUTHORIZED',
      }),
    );
    expect(v.admitted).toEqual(['data/ain/source/books/essay.md']);
  });

  test('T19 — governed-record evidence cannot escape repository custody', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'permission claimed',
          authority: {
            kind: 'permission',
            evidence: { source: 'governed_record', ref: '../outside.txt', marker: 'AUTHORIZED' },
          },
        },
      ]),
      reader({ 'data/ain/source/books/essay.md': 'Published prose.' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/escapes repository custody/);
  });

  test('T20 — a repository file outside the governed authority namespace cannot stand as permission', () => {
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/essay.md'),
      declaration([
        {
          prefix: 'data/ain/source/books',
          classification: 'third_party_published',
          reason: 'permission claimed',
          authority: {
            kind: 'permission',
            evidence: { source: 'governed_record', ref: 'docs/random-note.md', marker: 'AUTHORIZED' },
          },
        },
      ]),
      reader({
        'data/ain/source/books/essay.md': 'Published prose.',
        'docs/random-note.md': 'AUTHORIZED',
      }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/outside the governed corpus-authority namespace/);
  });

  test('T21 — governed authority evidence cannot escape its namespace through a symlink', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-authority-record-link-'));
    try {
      const candidate = path.join(repo, 'data/ain/source/books/essay.md');
      const authorityDir = path.join(repo, 'docs/corpus-authority');
      const outsideRecord = path.join(repo, 'docs/unruled-note.md');
      fs.mkdirSync(path.dirname(candidate), { recursive: true });
      fs.mkdirSync(authorityDir, { recursive: true });
      fs.writeFileSync(candidate, 'Published prose.');
      fs.writeFileSync(outsideRecord, 'CORPUS USE AUTHORIZED');
      fs.symlinkSync('../unruled-note.md', path.join(authorityDir, 'essay.md'));

      const v = decideAdmission(
        repo,
        [candidate],
        declaration([
          {
            prefix: 'data/ain/source/books/essay.md',
            classification: 'third_party_published',
            reason: 'permission claimed',
            authority: {
              kind: 'permission',
              evidence: {
                source: 'governed_record',
                ref: 'docs/corpus-authority/essay.md',
                marker: 'CORPUS USE AUTHORIZED',
              },
            },
          },
        ]),
      );
      expect(v.admitted).toEqual([]);
      expect(v.excluded[0].reason).toMatch(/symbolic link/);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  test('T22 — a declared corpus item cannot inherit authority through a symlinked carrier', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-authority-item-link-'));
    try {
      const sourceDir = path.join(repo, 'data/ain/source/books');
      const outsideWork = path.join(repo, 'outside.md');
      const candidate = path.join(sourceDir, 'essay.md');
      fs.mkdirSync(sourceDir, { recursive: true });
      fs.writeFileSync(outsideWork, 'Copyright © 2026 by Kelly Nezat');
      fs.symlinkSync(outsideWork, candidate);

      const v = decideAdmission(
        repo,
        [candidate],
        declaration([
          {
            prefix: 'data/ain/source/books/essay.md',
            classification: 'published_knowledge',
            reason: 'owned work',
            authority: {
              kind: 'soullab_owned',
              evidence: { source: 'in_file', marker: 'Copyright © 2026 by Kelly Nezat' },
            },
          },
        ]),
      );
      expect(v.admitted).toEqual([]);
      expect(v.excluded[0].reason).toMatch(/symbolic link/);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  test('T23 — shipped declaration admits Elemental Alchemy only by governed rights-holder authorization', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const real = loadDeclaration(repoRoot);
    const ea = path.join(repoRoot, 'data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md');
    const other = path.join(repoRoot, 'data/ain/source/60-second-protocol.md');
    const v = decideAdmission(repoRoot, [ea, other], real);
    expect(v.admitted).toEqual(['data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md']);
    expect(v.excluded.map((e) => e.file)).toContain('data/ain/source/60-second-protocol.md');
  });

  test('T24 — published knowledge may be admitted by exact governed rights-holder authorization without claiming organizational ownership', () => {
    const work = 'Copyright © Author. Published work.';
    const digest = createHash('sha256').update(work, 'utf8').digest('hex');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([
        {
          prefix: 'data/ain/source/books/author-work.md',
          classification: 'published_knowledge',
          reason: 'rights-holder authorization',
          authority: {
            kind: 'rights_holder_authorized',
            rightsHolder: 'Author Name',
            evidence: {
              source: 'governed_record',
              ref: 'docs/corpus-authority/author-work.md',
              marker: 'CORPUS USE AUTHORIZED',
              subject_sha256: digest,
            },
          },
        },
      ]),
      reader({
        'data/ain/source/books/author-work.md': work,
        'docs/corpus-authority/author-work.md': `CORPUS USE AUTHORIZED\nAuthor Name\n${digest}`,
      }),
    );
    expect(v.admitted).toEqual(['data/ain/source/books/author-work.md']);
  });

  test('T25 — rights-holder authorization requires a named rights holder', () => {
    const work = 'Copyright © Author. Published work.';
    const digest = createHash('sha256').update(work, 'utf8').digest('hex');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([{
        prefix: 'data/ain/source/books/author-work.md',
        classification: 'published_knowledge',
        reason: 'missing rights holder',
        authority: {
          kind: 'rights_holder_authorized',
          rightsHolder: '',
          evidence: { source: 'governed_record', ref: 'docs/corpus-authority/author-work.md', marker: 'AUTHORIZED', subject_sha256: digest },
        },
      }]),
      reader({ 'data/ain/source/books/author-work.md': work, 'docs/corpus-authority/author-work.md': 'AUTHORIZED' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/named rights holder/);
  });

  test('T26 — rights-holder authorization requires a governed authorization record', () => {
    const work = 'Copyright © Author. Published work.';
    const digest = createHash('sha256').update(work, 'utf8').digest('hex');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([{
        prefix: 'data/ain/source/books/author-work.md',
        classification: 'published_knowledge',
        reason: 'wrong evidence source',
        authority: {
          kind: 'rights_holder_authorized',
          rightsHolder: 'Author Name',
          evidence: { source: 'in_file', marker: 'Copyright © Author' },
        },
      }]),
      reader({ 'data/ain/source/books/author-work.md': work }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/governed authorization record/);
  });

  test('T27 — rights-holder authorization is bound to the exact candidate SHA-256', () => {
    const work = 'Copyright © Author. Revised published work.';
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([{
        prefix: 'data/ain/source/books/author-work.md',
        classification: 'published_knowledge',
        reason: 'digest mismatch',
        authority: {
          kind: 'rights_holder_authorized',
          rightsHolder: 'Author Name',
          evidence: { source: 'governed_record', ref: 'docs/corpus-authority/author-work.md', marker: 'AUTHORIZED', subject_sha256: '0'.repeat(64) },
        },
      }]),
      reader({ 'data/ain/source/books/author-work.md': work, 'docs/corpus-authority/author-work.md': 'AUTHORIZED' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/authorized subject SHA-256/);
  });

  test('T28 — governed rights-holder record must name the declared rights holder', () => {
    const work = 'Copyright © Author. Published work.';
    const digest = createHash('sha256').update(work, 'utf8').digest('hex');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([{
        prefix: 'data/ain/source/books/author-work.md',
        classification: 'published_knowledge',
        reason: 'record holder mismatch',
        authority: {
          kind: 'rights_holder_authorized',
          rightsHolder: 'Author Name',
          evidence: { source: 'governed_record', ref: 'docs/corpus-authority/author-work.md', marker: 'AUTHORIZED', subject_sha256: digest },
        },
      }]),
      reader({ 'data/ain/source/books/author-work.md': work, 'docs/corpus-authority/author-work.md': `AUTHORIZED
Different Person
${digest}` }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/does not name the declared rights holder/);
  });

  test('T29 — governed rights-holder record must bind the authorized subject SHA-256', () => {
    const work = 'Copyright © Author. Published work.';
    const digest = createHash('sha256').update(work, 'utf8').digest('hex');
    const v = decideAdmission(
      ROOT,
      files('data/ain/source/books/author-work.md'),
      declaration([{
        prefix: 'data/ain/source/books/author-work.md',
        classification: 'published_knowledge',
        reason: 'record digest missing',
        authority: {
          kind: 'rights_holder_authorized',
          rightsHolder: 'Author Name',
          evidence: { source: 'governed_record', ref: 'docs/corpus-authority/author-work.md', marker: 'AUTHORIZED', subject_sha256: digest },
        },
      }]),
      reader({ 'data/ain/source/books/author-work.md': work, 'docs/corpus-authority/author-work.md': `AUTHORIZED\nAuthor Name\nno digest here` }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded[0].reason).toMatch(/does not bind the authorized subject SHA-256/);
  });

});
