import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

import {
  decideAdmission,
  loadDeclaration,
  type AdmissionRule,
} from './admission';
import {
  chunkText,
  estimateTokens,
  extractTitle,
  classifySource,
  type KnowledgeChunk,
} from '../ain/knowledge/ChunkingService';
import {
  classifyChunkSpiralogic,
  mergeTagsIntoMeta,
} from '../library/spiralogicTagger';

export const EA01_BUILD_ID = 'CORPUS-BUILD-EA-01';
export const EA01_SUBJECT_REL =
  'data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md';
export const EA01_AUTHORITY_REF = 'docs/corpus-authority/elemental-alchemy.md';
export const EA01_LIBRARY_SOURCE_TYPE = 'book';
export const EA01_NORMALIZATION_ID = 'ea01-text-v1';
export const EA01_CONTENT_SHA256 = '0b34063412c8d3594ee7cc0694c30c95c4d74e4851ffb895a750444ccdd1ae8d';
export const EA01_EXPECTED_AIN_CHUNKS = 215;
export const EA01_EXPECTED_LIBRARY_CHUNKS = 244;
export interface Ea01LibraryChunk {
  content: string;
  tokenCount: number;
  meta: Record<string, unknown>;
}

export interface Ea01BuildPlan {
  buildId: string;
  subjectRel: string;
  subjectFile: string;
  subjectSha256: string;
  contentSha256: string;
  normalizationId: string;
  rightsHolder: string;
  authorityRef: string;
  sourceTitle: string;
  sourceType: string;
  ainChunks: KnowledgeChunk[];
  libraryChunks: Ea01LibraryChunk[];
  libraryTokenCount: number;
  admittedPaths: string[];
}

export interface Ea01DbState {
  ainTotalRows: number;
  ainSubjectRows: number;
  ainSubjectEmbeddedRows: number;
  ainSubjectDigestRows: number;
  ainSubjectBuildRows: number;
  ainSubjectContentRows: number;
  ainSubjectNormalizationRows: number;
  libraryCorpusSources: number;
  librarySubjectSources: number;
  librarySubjectCompletedSources: number;
  librarySubjectValidSources: number;
  librarySubjectDigestSources: number;
  librarySubjectBuildSources: number;
  librarySubjectContentSources: number;
  librarySubjectNormalizationSources: number;
  librarySubjectChunks: number;
  librarySubjectEmbeddedChunks: number;
}

function sha256Text(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function normalizeRel(input: string): string {
  return input.split(path.sep).join('/');
}

const DATA_IMAGE_DEFINITION = /^\s*\[[^\]]+\]:\s*<data:image\/[^;>\s]+;base64,/i;
const EMPTY_IMAGE_REFERENCE = /!\[\]\[[^\]]+\]/g;
const FORMAT_ONLY_AFTER_IMAGE_REMOVAL = /^[\s#*_`~-]*$/;

/**
 * CORPUS-BUILD-EA-01 text derivative. The authorized raw manuscript is kept
 * intact; this transform removes only embedded binary-image transport and
 * empty-alt image placeholders before knowledge chunking. Line endings become LF.
 */
export function normalizeEa01Text(raw: string): string {
  const lines: string[] = [];
  for (const sourceLine of raw.split(/\r?\n/)) {
    if (DATA_IMAGE_DEFINITION.test(sourceLine)) continue;
    const line = sourceLine.replace(EMPTY_IMAGE_REFERENCE, '');
    if (line !== sourceLine && FORMAT_ONLY_AFTER_IMAGE_REMOVAL.test(line)) continue;
    lines.push(line);
  }
  return lines.join('\n');
}

function listCorpusCandidates(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listCorpusCandidates(full));
    if (entry.isFile() && /\.(md|txt)$/i.test(entry.name)) out.push(full);
  }
  return out.sort();
}

function exactSubjectRule(rules: AdmissionRule[]): AdmissionRule {
  const rule = rules.find((candidate) => normalizeRel(candidate.prefix) === EA01_SUBJECT_REL);
  if (!rule) throw new Error('EA01 exact subject rule is missing');
  return rule;
}
export function buildEa01Plan(repoRoot: string): Ea01BuildPlan {
  const sourceRoot = path.join(repoRoot, 'data/ain/source');
  const candidates = listCorpusCandidates(sourceRoot);
  const declaration = loadDeclaration(repoRoot);
  const verdict = decideAdmission(repoRoot, candidates, declaration);

  if (verdict.refused.length > 0) {
    throw new Error(`EA01 refused corpus entries: ${verdict.refused.length}`);
  }

  const admittedPaths = verdict.admitted.map(normalizeRel).sort();
  if (admittedPaths.length !== 1 || admittedPaths[0] !== EA01_SUBJECT_REL) {
    throw new Error(
      `EA01 subject lock failed: expected only ${EA01_SUBJECT_REL}, got ${admittedPaths.join(', ')}`,
    );
  }

  const rule = exactSubjectRule(declaration.rules);
  const authority = rule.authority;
  if (!authority || authority.kind !== 'rights_holder_authorized') {
    throw new Error('EA01 requires rights_holder_authorized authority');
  }
  if (!authority.rightsHolder?.trim()) {
    throw new Error('EA01 requires a named rights holder');
  }
  const evidence = authority.evidence;
  if (evidence.source !== 'governed_record') {
    throw new Error('EA01 rights-holder authority must use a governed record');
  }
  if (normalizeRel(evidence.ref) !== EA01_AUTHORITY_REF) {
    throw new Error(`EA01 authority ref mismatch: ${evidence.ref}`);
  }
  if (!evidence.subject_sha256) {
    throw new Error('EA01 governed authority is missing subject SHA-256');
  }

  const subjectAbs = path.join(repoRoot, EA01_SUBJECT_REL);
  const subjectFile = path.basename(subjectAbs);
  const rawContent = fs.readFileSync(subjectAbs, 'utf8');
  const subjectSha256 = sha256Text(rawContent);
  if (subjectSha256.toLowerCase() !== evidence.subject_sha256.toLowerCase()) {
    throw new Error('EA01 subject digest does not match governed authorization');
  }

  const content = normalizeEa01Text(rawContent);
  const contentSha256 = sha256Text(content);
  if (contentSha256 !== EA01_CONTENT_SHA256) {
    throw new Error(`EA01 normalized content digest changed: ${contentSha256}`);
  }
  if (/data:image\//i.test(content) || /!\[\]\[[^\]]+\]/.test(content)) {
    throw new Error('EA01 normalization left embedded-image transport in corpus text');
  }

  const sourceTitle = extractTitle(subjectFile);
  const { categories, domain } = classifySource(subjectFile, content);
  const ainTexts = chunkText(content);
  const ainChunks: KnowledgeChunk[] = ainTexts.map((chunkText, chunkIndex) => ({
    sourceFile: subjectFile,
    sourceTitle,
    chunkIndex,
    chunkText,
    chunkTokens: estimateTokens(chunkText),
    categories,
    domain,
    author: authority.rightsHolder.trim(),
  }));
  const libraryTexts = chunkText(content, {
    maxTokens: 700,
    overlapTokens: 80,
    minChunkTokens: 40,
  });
  if (ainChunks.length !== EA01_EXPECTED_AIN_CHUNKS) {
    throw new Error(`EA01 AIN chunk count changed: ${ainChunks.length}`);
  }
  if (libraryTexts.length !== EA01_EXPECTED_LIBRARY_CHUNKS) {
    throw new Error(`EA01 Library chunk count changed: ${libraryTexts.length}`);
  }

  const authorityMeta = {
    corpus_build_id: EA01_BUILD_ID,
    source_checksum: subjectSha256,
    content_checksum: contentSha256,
    normalization_id: EA01_NORMALIZATION_ID,
    authority_ref: EA01_AUTHORITY_REF,
    rights_holder: authority.rightsHolder,
  };

  const libraryChunks: Ea01LibraryChunk[] = libraryTexts.map((chunkContent) => ({
    content: chunkContent,
    tokenCount: estimateTokens(chunkContent),
    meta: mergeTagsIntoMeta(
      authorityMeta,
      classifyChunkSpiralogic(chunkContent),
    ),
  }));

  return {
    buildId: EA01_BUILD_ID,
    subjectRel: EA01_SUBJECT_REL,
    subjectFile,
    subjectSha256,
    contentSha256,
    normalizationId: EA01_NORMALIZATION_ID,
    rightsHolder: authority.rightsHolder.trim(),
    authorityRef: EA01_AUTHORITY_REF,
    sourceTitle,
    sourceType: EA01_LIBRARY_SOURCE_TYPE,
    ainChunks,
    libraryChunks,
    libraryTokenCount: libraryChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0),
    admittedPaths,
  };
}
export function assertEa01PreState(state: Ea01DbState): void {
  const failures: string[] = [];
  if (state.ainTotalRows !== 0) failures.push(`AIN rows=${state.ainTotalRows}`);
  if (state.ainSubjectRows !== 0) failures.push(`AIN subject rows=${state.ainSubjectRows}`);
  if (state.libraryCorpusSources !== 0) {
    failures.push(`Library corpus sources=${state.libraryCorpusSources}`);
  }
  if (state.librarySubjectSources !== 0) {
    failures.push(`Library subject sources=${state.librarySubjectSources}`);
  }
  if (state.librarySubjectChunks !== 0) {
    failures.push(`Library subject chunks=${state.librarySubjectChunks}`);
  }
  if (failures.length) {
    throw new Error(`EA01 pre-state is not the witnessed empty corpus: ${failures.join('; ')}`);
  }
}

export function assertEa01PostState(plan: Ea01BuildPlan, state: Ea01DbState): void {
  const failures: string[] = [];
  const ainExpected = plan.ainChunks.length;
  const libraryExpected = plan.libraryChunks.length;

  if (state.ainTotalRows !== ainExpected) failures.push(`AIN total=${state.ainTotalRows}/${ainExpected}`);
  if (state.ainSubjectRows !== ainExpected) failures.push(`AIN subject=${state.ainSubjectRows}/${ainExpected}`);
  if (state.ainSubjectEmbeddedRows !== ainExpected) failures.push(`AIN embedded=${state.ainSubjectEmbeddedRows}/${ainExpected}`);
  if (state.ainSubjectDigestRows !== ainExpected) failures.push(`AIN digest=${state.ainSubjectDigestRows}/${ainExpected}`);
  if (state.ainSubjectBuildRows !== ainExpected) failures.push(`AIN build=${state.ainSubjectBuildRows}/${ainExpected}`);
  if (state.ainSubjectContentRows !== ainExpected) failures.push(`AIN content=${state.ainSubjectContentRows}/${ainExpected}`);
  if (state.ainSubjectNormalizationRows !== ainExpected) failures.push(`AIN normalization=${state.ainSubjectNormalizationRows}/${ainExpected}`);
  if (state.libraryCorpusSources !== 1) failures.push(`Library corpus sources=${state.libraryCorpusSources}/1`);
  if (state.librarySubjectSources !== 1) failures.push(`Library subject sources=${state.librarySubjectSources}/1`);
  if (state.librarySubjectCompletedSources !== 1) failures.push(`Library completed=${state.librarySubjectCompletedSources}/1`);
  if (state.librarySubjectValidSources !== 1) failures.push(`Library identity-valid=${state.librarySubjectValidSources}/1`);
  if (state.librarySubjectDigestSources !== 1) failures.push(`Library digest=${state.librarySubjectDigestSources}/1`);
  if (state.librarySubjectBuildSources !== 1) failures.push(`Library build=${state.librarySubjectBuildSources}/1`);
  if (state.librarySubjectContentSources !== 1) failures.push(`Library content=${state.librarySubjectContentSources}/1`);
  if (state.librarySubjectNormalizationSources !== 1) failures.push(`Library normalization=${state.librarySubjectNormalizationSources}/1`);
  if (state.librarySubjectChunks !== libraryExpected) failures.push(`Library chunks=${state.librarySubjectChunks}/${libraryExpected}`);
  if (state.librarySubjectEmbeddedChunks !== libraryExpected) {
    failures.push(`Library embedded=${state.librarySubjectEmbeddedChunks}/${libraryExpected}`);
  }

  if (failures.length) {
    throw new Error(`EA01 post-state mismatch: ${failures.join('; ')}`);
  }
}
