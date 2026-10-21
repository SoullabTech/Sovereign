/** @jest-environment node */
/** CORPUS-BUILD-EA-01 — exact-subject build law. */
import fs from 'node:fs';
import path from 'node:path';

import {
  EA01_BUILD_ID,
  EA01_CONTENT_SHA256,
  EA01_EXPECTED_AIN_CHUNKS,
  EA01_EXPECTED_LIBRARY_CHUNKS,
  EA01_NORMALIZATION_ID,
  EA01_SUBJECT_REL,
  assertEa01PostState,
  assertEa01PreState,
  buildEa01Plan,
  normalizeEa01Text,
  type Ea01DbState,
} from '../ea01Build';

const ROOT = path.resolve(__dirname, '../../..');

function emptyState(): Ea01DbState {
  return {
    ainTotalRows: 0,
    ainSubjectRows: 0,
    ainSubjectEmbeddedRows: 0,
    ainSubjectDigestRows: 0,
    ainSubjectBuildRows: 0,
    ainSubjectContentRows: 0,
    ainSubjectNormalizationRows: 0,
    libraryCorpusSources: 0,
    librarySubjectSources: 0,
    librarySubjectCompletedSources: 0,
    librarySubjectValidSources: 0,
    librarySubjectDigestSources: 0,
    librarySubjectBuildSources: 0,
    librarySubjectContentSources: 0,
    librarySubjectNormalizationSources: 0,
    librarySubjectChunks: 0,
    librarySubjectEmbeddedChunks: 0,
  };
}

function completedState(ainChunks: number, libraryChunks: number): Ea01DbState {
  return {
    ainTotalRows: ainChunks,
    ainSubjectRows: ainChunks,
    ainSubjectEmbeddedRows: ainChunks,
    ainSubjectDigestRows: ainChunks,
    ainSubjectBuildRows: ainChunks,
    ainSubjectContentRows: ainChunks,
    ainSubjectNormalizationRows: ainChunks,
    libraryCorpusSources: 1,
    librarySubjectSources: 1,
    librarySubjectCompletedSources: 1,
    librarySubjectValidSources: 1,
    librarySubjectDigestSources: 1,
    librarySubjectBuildSources: 1,
    librarySubjectContentSources: 1,
    librarySubjectNormalizationSources: 1,
    librarySubjectChunks: libraryChunks,
    librarySubjectEmbeddedChunks: libraryChunks,
  };
}

describe('CORPUS-BUILD-EA-01', () => {
  test('B1 — normalization removes only binary image transport and empty image markers', () => {
    const raw = [
      'Authored prose.',
      '[image1]: <data:image/png;base64,AAAA>',
      '# ![][image1]',
      'moments of ![][image2]synchronicity',
      '![Meaningful caption][image3]',
    ].join('\n');
    const normalized = normalizeEa01Text(raw);

    expect(normalized).toContain('Authored prose.');
    expect(normalized).toContain('moments of synchronicity');
    expect(normalized).toContain('![Meaningful caption][image3]');
    expect(normalized).not.toContain('data:image/');
    expect(normalized).not.toContain('![][image1]');
    expect(normalized).not.toContain('![][image2]');
  });
  test('B2 — real build plan is locked to one authorized raw revision and one normalized derivative', () => {
    const plan = buildEa01Plan(ROOT);
    expect(plan.buildId).toBe(EA01_BUILD_ID);
    expect(plan.admittedPaths).toEqual([EA01_SUBJECT_REL]);
    expect(plan.subjectSha256).toBe('f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0');
    expect(plan.contentSha256).toBe(EA01_CONTENT_SHA256);
    expect(plan.normalizationId).toBe(EA01_NORMALIZATION_ID);
    expect(plan.rightsHolder).toBe('Kelly Nezat');
    expect(plan.sourceTitle).toBe('Elemental Alchemy The Ancient Art of Living a Phenomenal Life');
    expect(plan.ainChunks.every((c) => c.author === 'Kelly Nezat')).toBe(true);
    expect(plan.ainChunks).toHaveLength(EA01_EXPECTED_AIN_CHUNKS);
    expect(plan.libraryChunks).toHaveLength(EA01_EXPECTED_LIBRARY_CHUNKS);
    expect(plan.ainChunks.every((c) => !/data:image\/|!\[\]\[[^\]]+\]/.test(c.chunkText))).toBe(true);
    expect(plan.libraryChunks.every((c) => !/data:image\/|!\[\]\[[^\]]+\]/.test(c.content))).toBe(true);
  });

  test('B3 — first-build pre-state requires both production corpus engines to be empty', () => {
    expect(() => assertEa01PreState(emptyState())).not.toThrow();
    expect(() => assertEa01PreState({ ...emptyState(), ainTotalRows: 1 })).toThrow(/AIN rows=1/);
    expect(() => assertEa01PreState({ ...emptyState(), libraryCorpusSources: 1 })).toThrow(/Library corpus sources=1/);
  });
  test('B4 — post-state requires exact rows, embeddings, raw/normalized provenance, and identity validity', () => {
    const plan = buildEa01Plan(ROOT);
    const state = completedState(plan.ainChunks.length, plan.libraryChunks.length);
    expect(() => assertEa01PostState(plan, state)).not.toThrow();
    expect(() => assertEa01PostState(plan, { ...state, ainSubjectContentRows: state.ainSubjectContentRows - 1 }))
      .toThrow(/AIN content=/);
    expect(() => assertEa01PostState(plan, { ...state, librarySubjectNormalizationSources: 0 }))
      .toThrow(/Library normalization=0\/1/);
    expect(() => assertEa01PostState(plan, { ...state, librarySubjectValidSources: 0 }))
      .toThrow(/Library identity-valid=0\/1/);
  });

  test('B5 — executor has no table-wide destructive corpus operation', () => {
    const script = fs.readFileSync(path.join(ROOT, 'scripts/corpus-build-ea-01.ts'), 'utf8');
    expect(script).not.toMatch(/\bTRUNCATE\b/i);
    expect(script).not.toMatch(/DELETE\s+FROM\s+library_chunks/i);
    expect(script).toMatch(/DELETE FROM ain_knowledge_chunks[\s\S]*source_checksum[\s\S]*content_checksum[\s\S]*normalization_id[\s\S]*corpus_build_id/);
    expect(script).toMatch(/DELETE FROM library_sources[\s\S]*checksum[\s\S]*content_checksum[\s\S]*normalization_id[\s\S]*corpus_build_id/);
    expect(script).toContain("mode = rollback ? 'rollback' : execute ? 'execute' : 'plan'");
  });
  test('B6 — AIN provenance migration makes raw and normalized provenance mandatory for new rows', () => {
    const sql = fs.readFileSync(
      path.join(ROOT, 'database/migrations/20260917160000_ain_knowledge_provenance.sql'),
      'utf8',
    );
    for (const field of ['source_checksum', 'content_checksum', 'normalization_id', 'authority_ref', 'corpus_build_id']) {
      expect(sql).toContain(field);
    }
    expect(sql).toMatch(/ain_knowledge_new_rows_require_provenance/);
    expect(sql).toMatch(/CHECK\s*\([\s\S]*content_checksum IS NOT NULL[\s\S]*normalization_id IS NOT NULL[\s\S]*\) NOT VALID/i);
    expect(sql).toMatch(/UNIQUE INDEX[\s\S]*source_file, source_checksum, content_checksum, normalization_id, chunk_index/i);
  });
});

// Additional composition witnesses live outside the describe above only if this
// file is appended during the build-act review; keep them in a second suite.
describe('CORPUS-BUILD-EA-01 composition boundaries', () => {
  test('B7 — generic source-corpus writers refuse governed content instead of bypassing EA01', () => {
    const ain = fs.readFileSync(path.join(ROOT, 'scripts/embed-ain-knowledge.ts'), 'utf8');
    const library = fs.readFileSync(path.join(ROOT, 'scripts/ingest-library.ts'), 'utf8');
    const compiled = fs.readFileSync(path.join(ROOT, 'scripts/build-ain-corpus.ts'), 'utf8');

    expect(ain).toContain('generic AIN source writes do not carry governed normalization/provenance');
    expect(library).toContain('generic Living Library source writes do not carry governed normalization/provenance');
    expect(compiled).toContain('generic compiled-corpus writes are retired for governed content');
    expect(compiled.indexOf('generic compiled-corpus writes are retired')).toBeLessThan(compiled.indexOf('fs.mkdir(OUT_DIR'));
    expect(library.indexOf('generic Living Library source writes')).toBeLessThan(library.indexOf("new pg.Pool"));
  });

  test('B8 — controlled executor precomputes embeddings before transaction and rollback is provenance-keyed', () => {
    const script = fs.readFileSync(path.join(ROOT, 'scripts/corpus-build-ea-01.ts'), 'utf8');
    const executeBody = script.slice(
      script.indexOf('async function executeBuild'),
      script.indexOf('async function rollbackBuild'),
    );
    expect(executeBody.indexOf('const embeddings = await precomputeEmbeddings(plan)'))
      .toBeLessThan(executeBody.indexOf("await client.query('BEGIN')"));
    expect(executeBody).toContain('LOCK TABLE ain_knowledge_chunks, library_sources, library_chunks IN SHARE ROW EXCLUSIVE MODE');
    expect(script).toContain('assertEa01PostState(plan, inTransactionPost)');
    expect(script).toContain('Post-commit witness failed; rolling back exact EA01 provenance rows.');
    expect(script).toContain("CORPUS_BUILD_EA01_EXECUTE");
    expect(script).toContain("CORPUS_BUILD_EA01_ROLLBACK");
  });
});

describe('CORPUS-BUILD-EA-01 schema rollback', () => {
  test('B9 — schema rollback removes only the legacy-writer gate and preserves provenance evidence', () => {
    const sql = fs.readFileSync(
      path.join(ROOT, 'database/rollbacks/20260917160000_ain_knowledge_provenance_ROLLBACK.sql'),
      'utf8',
    );
    expect(sql).toMatch(/DROP CONSTRAINT IF EXISTS ain_knowledge_new_rows_require_provenance/);
    expect(sql).not.toMatch(/DROP COLUMN/i);
    expect(sql).not.toMatch(/DROP TABLE/i);
    expect(sql).not.toMatch(/DROP INDEX/i);
    expect(sql).toContain('Provenance columns/indexes retained intentionally');
  });
});


describe('CORPUS-BUILD-EA-01 execution preflight', () => {
  test('B10 — executor requires the complete AIN provenance substrate, not columns alone', () => {
    const script = fs.readFileSync(path.join(ROOT, 'scripts/corpus-build-ea-01.ts'), 'utf8');
    expect(script).toContain("ain_knowledge_new_rows_require_provenance");
    expect(script).toContain("ain_knowledge_source_checksum_shape");
    expect(script).toContain("idx_ain_knowledge_provenance_chunk");
    expect(script).toContain("indexdef ILIKE 'CREATE UNIQUE INDEX%'");
    expect(script).toContain('AIN provenance substrate is incomplete');
    expect(script.indexOf('await verifyProvenanceSchema(pool)'))
      .toBeLessThan(script.indexOf('const embeddings = await precomputeEmbeddings(plan)'));
  });
});
