import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BenchmarkCorpusSource } from './corpus';

export interface BenchmarkChunk {
  chunkId: string;
  sourceRef: string;
  sourceClass: string;
  ordinal: number;
  heading: string | null;
  content: string;
  tokenEstimate: number;
}

export interface ChunkingPolicy {
  maxChars: number;
  maxChunks: number;
  anchorTerms?: string[];
}

const DEFAULT_POLICY: ChunkingPolicy = {
  maxChars: 1400,
  maxChunks: 2048,
};

const SOURCE_POLICIES: Record<string, Partial<ChunkingPolicy>> = {
  'ea-manuscript': {
    maxChunks: 80,
    anchorTerms: ['Book of the Lambspring', 'Edward F. Edinger', 'individuation'],
  },
};
function policyFor(sourceRef: string): ChunkingPolicy {
  return { ...DEFAULT_POLICY, ...(SOURCE_POLICIES[sourceRef] ?? {}) };
}

function splitHard(text: string, maxChars: number): string[] {
  const parts: string[] = [];
  let rest = text.trim();
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf(' ', maxChars);
    if (cut < Math.floor(maxChars * .6)) cut = maxChars;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function markdownBlocks(markdown: string): Array<{ heading: string | null; text: string }> {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Array<{ heading: string | null; text: string }> = [];
  let heading: string | null = null;
  let paragraph: string[] = [];

  const flush = () => {
    const text = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    if (text) blocks.push({ heading, text });
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      flush();
      heading = trimmed.replace(/^#{1,6}\s+/, '').trim();
      continue;
    }
    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed === '---') continue;
    paragraph.push(trimmed);
  }
  flush();
  return blocks;
}
export function chunkMarkdownSource(
  source: BenchmarkCorpusSource,
  markdown: string,
): BenchmarkChunk[] {
  const policy = policyFor(source.sourceRef);
  const raw: BenchmarkChunk[] = [];
  let ordinal = 0;

  for (const block of markdownBlocks(markdown)) {
    const prefix = block.heading ? block.heading + '\n' : '';
    for (const part of splitHard(prefix + block.text, policy.maxChars)) {
      raw.push({
        chunkId: source.sourceRef + '#' + ordinal,
        sourceRef: source.sourceRef,
        sourceClass: source.sourceClass,
        ordinal,
        heading: block.heading,
        content: part,
        tokenEstimate: Math.max(1, Math.ceil(part.length / 4)),
      });
      ordinal += 1;
    }
  }

  if (raw.length <= policy.maxChunks) return raw;
  return balanceChunks(raw, policy);
}

function balanceChunks(raw: BenchmarkChunk[], policy: ChunkingPolicy): BenchmarkChunk[] {
  const chosen = new Set<number>();
  const anchors = (policy.anchorTerms ?? []).map(t => t.toLowerCase());

  for (const chunk of raw) {
    const text = chunk.content.toLowerCase();
    if (anchors.some(anchor => text.includes(anchor))) chosen.add(chunk.ordinal);
  }

  const budget = policy.maxChunks;
  if (chosen.size > budget) {
    return raw.filter(c => chosen.has(c.ordinal)).slice(0, budget);
  }

  const remaining = budget - chosen.size;
  if (remaining > 0) {
    const candidates = raw.filter(c => !chosen.has(c.ordinal));
    const step = candidates.length / remaining;
    for (let i = 0; i < remaining; i += 1) {
      const index = Math.min(candidates.length - 1, Math.floor(i * step));
      chosen.add(candidates[index].ordinal);
    }
  }

  return raw.filter(c => chosen.has(c.ordinal)).sort((a,b) => a.ordinal - b.ordinal);
}
export function buildBenchmarkChunks(
  repoRoot: string,
  sources: readonly BenchmarkCorpusSource[],
): BenchmarkChunk[] {
  return sources.flatMap(source => {
    const markdown = readFileSync(resolve(repoRoot, source.path), 'utf8');
    return chunkMarkdownSource(source, markdown);
  });
}

export function chunkingPolicyFor(sourceRef: string): ChunkingPolicy {
  return policyFor(sourceRef);
}
