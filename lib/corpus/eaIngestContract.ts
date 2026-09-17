import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { processAllSources, type KnowledgeChunk } from '../ain/knowledge/ChunkingService';
import { decideAdmission, loadDeclaration, type AdmissionVerdict } from './admission';
import { ELEMENTAL_ALCHEMY_GOVERNED_SOURCE } from './governedKnowledgeRegistry';

export const EA_INGEST_CONTRACT = Object.freeze({
  act: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.ingestAct,
  sourcePath: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourcePath,
  sourceFile: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceFile,
  sourceSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceSha256,
  candidateCount: 736,
  runtimeCandidateCount: 1,
  runtimeAdmittedCount: 1,
  runtimeExcludedCount: 0,
  runtimeRefusedCount: 0,
  admittedCount: 1,
  excludedCount: 735,
  refusedCount: 0,
  chunkCount: 1238,
  chunkSetSha256: '87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852',
  embeddingModel: 'nomic-embed-text',
  embeddingDimensions: 768,
});

export type ChunkDigestInput = Pick<KnowledgeChunk, 'sourceFile' | 'chunkIndex' | 'chunkText'>;

export type EaCustodyMode = 'canonical' | 'runtime';

export interface EaBuildWitness {
  custody: EaCustodyMode;
  chunks: KnowledgeChunk[];
  verdict: AdmissionVerdict;
  candidateCount: number;
  sourceSha256: string;
  chunkSetSha256: string;
}

export interface DatabaseChunkRow {
  source_file: string;
  source_title: string | null;
  chunk_index: number;
  chunk_text: string;
  chunk_tokens: number | null;
  categories: string[] | null;
  domain: string | null;
}

export function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function chunkSetDigest(chunks: readonly ChunkDigestInput[]): string {
  const material = chunks.map((chunk) => ({
    sourceFile: chunk.sourceFile,
    chunkIndex: chunk.chunkIndex,
    chunkSha256: sha256Text(chunk.chunkText),
  }));
  return sha256Text(JSON.stringify(material));
}

function listCorpusCandidates(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listCorpusCandidates(full));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
      files.push(full);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function assertExactAdmission(
  verdict: AdmissionVerdict,
  candidateCount: number,
  custody: EaCustodyMode,
): void {
  const expected = EA_INGEST_CONTRACT;
  const admitted = verdict.admitted.map((p) => p.split(path.sep).join('/')).sort();
  const counts = custody === 'canonical'
    ? {
        candidates: expected.candidateCount,
        admitted: expected.admittedCount,
        excluded: expected.excludedCount,
        refused: expected.refusedCount,
      }
    : {
        candidates: expected.runtimeCandidateCount,
        admitted: expected.runtimeAdmittedCount,
        excluded: expected.runtimeExcludedCount,
        refused: expected.runtimeRefusedCount,
      };

  if (candidateCount !== counts.candidates) {
    throw new Error(
      `${expected.act} refused: ${custody} candidate corpus count changed ` +
      `(${candidateCount} != ${counts.candidates}); reconcile before ingestion`,
    );
  }
  if (
    verdict.admitted.length !== counts.admitted ||
    verdict.excluded.length !== counts.excluded ||
    verdict.refused.length !== counts.refused
  ) {
    throw new Error(
      `${expected.act} refused: ${custody} corpus verdict changed ` +
      `(${verdict.admitted.length}/${verdict.excluded.length}/${verdict.refused.length} != ` +
      `${counts.admitted}/${counts.excluded}/${counts.refused})`,
    );
  }
  if (admitted.length !== 1 || admitted[0] !== expected.sourcePath) {
    throw new Error(`${expected.act} refused: admitted source is not exactly Elemental Alchemy`);
  }
}

function assertExactChunks(chunks: readonly KnowledgeChunk[]): void {
  const expected = EA_INGEST_CONTRACT;
  const files = [...new Set(chunks.map((chunk) => chunk.sourceFile))].sort();

  if (chunks.length !== expected.chunkCount) {
    throw new Error(
      `${expected.act} refused: chunk count changed (${chunks.length} != ${expected.chunkCount})`,
    );
  }
  if (files.length !== 1 || files[0] !== expected.sourceFile) {
    throw new Error(`${expected.act} refused: chunk set contains a foreign or missing source`);
  }
  for (let i = 0; i < chunks.length; i += 1) {
    if (chunks[i].chunkIndex !== i) {
      throw new Error(
        `${expected.act} refused: chunk index discontinuity at position ${i} ` +
        `(saw ${chunks[i].chunkIndex})`,
      );
    }
  }
  const digest = chunkSetDigest(chunks);
  if (digest !== expected.chunkSetSha256) {
    throw new Error(
      `${expected.act} refused: chunk-set digest changed (${digest} != ${expected.chunkSetSha256})`,
    );
  }
}

export async function witnessEaBuild(
  repoRoot: string = process.cwd(),
  options: { custody?: EaCustodyMode } = {},
): Promise<EaBuildWitness> {
  const expected = EA_INGEST_CONTRACT;
  const custody = options.custody ?? 'canonical';
  const sourceAbs = path.join(repoRoot, expected.sourcePath);
  const sourceText = fs.readFileSync(sourceAbs, 'utf8');
  const sourceSha256 = sha256Text(sourceText);
  if (sourceSha256 !== expected.sourceSha256) {
    throw new Error(
      `${expected.act} refused: source SHA-256 changed (${sourceSha256} != ${expected.sourceSha256})`,
    );
  }

  const sourceRoot = path.join(repoRoot, 'data/ain/source');
  const candidates = listCorpusCandidates(sourceRoot);
  const verdict = decideAdmission(repoRoot, candidates, loadDeclaration(repoRoot));
  assertExactAdmission(verdict, candidates.length, custody);

  const chunks = await processAllSources(sourceRoot, repoRoot);
  assertExactChunks(chunks);

  return {
    custody,
    chunks,
    verdict,
    candidateCount: candidates.length,
    sourceSha256,
    chunkSetSha256: chunkSetDigest(chunks),
  };
}

export function verifyDatabaseRowsAgainstChunks(
  rows: readonly DatabaseChunkRow[],
  expectedChunks: readonly KnowledgeChunk[],
): string {
  if (rows.length !== expectedChunks.length) {
    throw new Error(
      `${EA_INGEST_CONTRACT.act} refused: staged DB row count ${rows.length} ` +
      `does not match expected chunk count ${expectedChunks.length}`,
    );
  }

  const orderedRows = [...rows].sort((a, b) => a.chunk_index - b.chunk_index);
  const digestInput: ChunkDigestInput[] = [];

  for (let i = 0; i < expectedChunks.length; i += 1) {
    const row = orderedRows[i];
    const chunk = expectedChunks[i];
    const categories = row.categories ?? [];

    if (row.source_file !== chunk.sourceFile) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB source mismatch at chunk ${i}`);
    }
    if (row.chunk_index !== chunk.chunkIndex) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB chunk index mismatch at chunk ${i}`);
    }
    if (row.chunk_text !== chunk.chunkText) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB chunk text mismatch at chunk ${i}`);
    }
    if (row.source_title !== chunk.sourceTitle) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB source title mismatch at chunk ${i}`);
    }
    if (row.chunk_tokens !== chunk.chunkTokens) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB token count mismatch at chunk ${i}`);
    }
    if (JSON.stringify(categories) !== JSON.stringify(chunk.categories)) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB categories mismatch at chunk ${i}`);
    }
    if (row.domain !== chunk.domain) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: DB domain mismatch at chunk ${i}`);
    }

    digestInput.push({
      sourceFile: row.source_file,
      chunkIndex: row.chunk_index,
      chunkText: row.chunk_text,
    });
  }

  return chunkSetDigest(digestInput);
}
