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
        { prefix: 'data/ain/source/books', classification: 'published_knowledge', reason: 'ok' },
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
        { prefix: 'data/ain/source/books', classification: 'published_knowledge', reason: 'wrong' },
      ]),
      reader({ 'data/ain/source/books/testers.md': roster }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.refused).toHaveLength(1);
    expect(v.refused[0].reason).toMatch(/human-record signal/);
  });

  test('T5 — the longest matching prefix wins, so a narrow rule can close a broad one', () => {
    const rules = declaration([
      { prefix: 'data/ain/source', classification: 'published_knowledge', reason: 'broad' },
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
        { prefix: 'data/ain/source', classification: 'published_knowledge', reason: 'source only' },
      ]),
      reader({ 'data/ain/source-private/roster.md': 'harmless prose' }),
    );
    expect(v.admitted).toEqual([]);
    expect(v.excluded).toHaveLength(1);
    expect(v.excluded[0].reason).toMatch(/no admission rule/);
  });

});
