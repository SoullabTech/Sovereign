/**
 * RLM Navigator - TypeScript-native codebase navigation
 *
 * Implements the "bloodhound" pattern: given a query, return the next
 * files to open + suggested grep queries + confidence score.
 *
 * Emits proof objects (sourceRefs, usage) for audit trails.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { RLMSourceRef, RLMUsage } from './types';

export type RLMNavigateRequest = {
  query: string;
  limit?: number; // default 5
  includeSnippets?: boolean; // default true
  focus?: {
    path: string;
    content: string; // from /api/rlm/open (already allowlisted + size-capped)
  };
};

export type RLMFileHit = {
  file: string; // repo-relative path
  score: number; // higher = better
  why: string[]; // short reasons
  snippet?: string; // small excerpt (optional)
};

export type RLMNavigateResponse = {
  success: true;
  query: string;
  nextFiles: RLMFileHit[];
  grepQueries: string[];
  confidence: number; // 0..1
  stats: {
    indexedFiles: number;
    searchedFiles: number;
    ms: number;
  };
  // Proof objects (sovereignty-grade audit trails)
  sourceRefs?: RLMSourceRef[];
  usage?: RLMUsage;
};

type IndexedFile = {
  file: string;
  tokens: string[];
};

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.vercel',
  'out',
  'tmp',
  'temp',
  'mobile-app/android/.gradle',
  'mobile-app/android/app/.cxx',
]);

const ALLOWED_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.md',
  '.sql',
  '.sh',
  '.json',
  '.yml',
  '.yaml',
]);

const MAX_FILE_BYTES = 300_000; // keep it safe and fast

let cachedIndex: { at: number; files: IndexedFile[] } | null = null;
const INDEX_TTL_MS = 60_000; // 1 minute in-memory TTL

function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_/-]/g, '');
}

function tokenizeQuery(query: string): string[] {
  return query
    .split(/\s+/g)
    .map((t) => normalizeToken(t))
    .filter(Boolean)
    .slice(0, 12);
}

function extractTokensFromSource(src: string): string[] {
  const tokens = new Set<string>();

  // exports / declarations (cheap heuristics)
  const patterns = [
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
    /\bexport\s+const\s+([A-Za-z0-9_]+)/g,
    /\bexport\s+class\s+([A-Za-z0-9_]+)/g,
    /\bfunction\s+([A-Za-z0-9_]+)\s*\(/g,
    /\bclass\s+([A-Za-z0-9_]+)/g,
    /\binterface\s+([A-Za-z0-9_]+)/g,
    /\btype\s+([A-Za-z0-9_]+)/g,
    /\bconst\s+([A-Za-z0-9_]+)\s*=\s*\(/g,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      tokens.add(normalizeToken(m[1]));
      if (tokens.size > 300) break;
    }
    if (tokens.size > 300) break;
  }

  return Array.from(tokens);
}

async function walkRepo(rootAbs: string, relDir = ''): Promise<string[]> {
  const absDir = path.join(rootAbs, relDir);
  let ents;
  try {
    ents = await fs.readdir(absDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: string[] = [];

  for (const ent of ents) {
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name;

    // ignore dot dirs / named ignores
    const first = rel.split('/')[0];
    if (IGNORE_DIRS.has(ent.name) || IGNORE_DIRS.has(first)) continue;

    if (ent.isDirectory()) {
      // keep scan bounded
      if (rel.split('/').length > 8) continue;
      out.push(...(await walkRepo(rootAbs, rel)));
      continue;
    }

    const ext = path.extname(ent.name);
    if (!ALLOWED_EXT.has(ext)) continue;

    out.push(rel);
  }

  return out;
}

async function buildIndex(rootAbs: string): Promise<IndexedFile[]> {
  const files = await walkRepo(rootAbs);
  const indexed: IndexedFile[] = [];

  // keep read concurrency modest
  const CONCURRENCY = 16;
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const rel = files[idx];
      const abs = path.join(rootAbs, rel);

      try {
        const st = await fs.stat(abs);
        if (st.size > MAX_FILE_BYTES) continue;

        const src = await fs.readFile(abs, 'utf8');
        const tokens = extractTokensFromSource(src);

        // also include path tokens (big signal)
        const pathTokens = rel
          .split(/[\/._-]+/g)
          .map(normalizeToken)
          .filter(Boolean);

        indexed.push({
          file: rel,
          tokens: Array.from(new Set([...tokens, ...pathTokens])).slice(0, 400),
        });
      } catch {
        // skip unreadable files
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return indexed;
}

function scoreFile(
  qTokens: string[],
  file: IndexedFile
): { score: number; why: string[] } {
  let score = 0;
  const why: string[] = [];

  // token overlap
  const set = new Set(file.tokens);
  let hits = 0;
  for (const t of qTokens) {
    if (!t) continue;
    if (set.has(t)) hits += 1;
    if (file.file.toLowerCase().includes(t)) hits += 2;
  }

  score += hits * 10;

  // prioritize likely "entry points"
  if (file.file.includes('/route.ts')) score += 8;
  if (file.file.includes('/page.tsx')) score += 6;
  if (file.file.includes('/components/')) score += 4;
  if (file.file.includes('/lib/')) score += 3;

  if (hits > 0) why.push(`matched ${hits} query tokens`);
  if (file.file.includes('/route.ts')) why.push('API route');
  if (file.file.includes('/page.tsx')) why.push('page');
  if (file.file.includes('/components/')) why.push('component');
  if (file.file.includes('/lib/')) why.push('library');

  return { score, why };
}

async function makeSnippet(
  rootAbs: string,
  relFile: string,
  qTokens: string[]
): Promise<string | undefined> {
  try {
    const abs = path.join(rootAbs, relFile);
    const src = await fs.readFile(abs, 'utf8');
    const lines = src.split('\n');

    const needle = qTokens.find((t) => t && src.toLowerCase().includes(t));
    if (!needle) return lines.slice(0, 20).join('\n');

    const idx = lines.findIndex((l) => l.toLowerCase().includes(needle));
    const start = Math.max(0, idx - 8);
    const end = Math.min(lines.length, idx + 12);
    return lines.slice(start, end).join('\n');
  } catch {
    return undefined;
  }
}

export async function navigateCodebase(
  req: RLMNavigateRequest
): Promise<RLMNavigateResponse> {
  const t0 = Date.now();

  const query = (req.query ?? '').trim();
  const limit = Math.max(1, Math.min(req.limit ?? 5, 12));
  const includeSnippets = req.includeSnippets ?? true;
  const focus = req.focus;

  // Build effective query tokens (include focus content tokens if present)
  let qTokens = tokenizeQuery(query);

  // Focus context: extract additional tokens from focus content
  let focusDir: string | null = null;
  if (focus?.path && focus?.content) {
    focusDir = path.dirname(focus.path);
    // Extract tokens from focus content (capped for safety)
    const focusText = String(focus.content).slice(0, 12_000);
    const focusTokens = extractTokensFromSource(focusText);
    // Add top focus tokens to query tokens (don't overwhelm)
    qTokens = [...qTokens, ...focusTokens.slice(0, 8)];
  }

  const rootAbs = process.cwd();
  const now = Date.now();

  if (!cachedIndex || now - cachedIndex.at > INDEX_TTL_MS) {
    const files = await buildIndex(rootAbs);
    cachedIndex = { at: now, files };
  }

  const index = cachedIndex.files;

  const scored = index
    .map((f) => {
      let { score, why } = scoreFile(qTokens, f);

      // Focus boost: files in same directory get magnetized
      if (focusDir) {
        const fileDir = path.dirname(f.file);
        if (fileDir === focusDir) {
          score += 15;
          why = [...why, 'same dir as focus'];
        } else if (f.file.startsWith(focusDir + '/')) {
          score += 8;
          why = [...why, 'child of focus dir'];
        } else if (focusDir.startsWith(path.dirname(fileDir) + '/')) {
          score += 5;
          why = [...why, 'sibling dir'];
        }
      }

      return { f, score, why };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(limit, 8));

  const nextFiles: RLMFileHit[] = [];
  for (const item of scored.slice(0, limit)) {
    nextFiles.push({
      file: item.f.file,
      score: item.score,
      why: item.why.slice(0, 3),
      snippet: includeSnippets
        ? await makeSnippet(rootAbs, item.f.file, qTokens)
        : undefined,
    });
  }

  const grepQueries = [
    ...qTokens.slice(0, 3).map((t) => `rg -n "${t}" .`),
    `rg -n "export (function|const|class)\\s+.*(${qTokens.join('|')})" .`,
    `rg -n "${qTokens.join('|')}" app lib components`,
  ].slice(0, 5);

  const confidence = Math.max(
    0,
    Math.min(
      1,
      nextFiles.length === 0 ? 0.1 : Math.min(0.95, nextFiles[0].score / 60)
    )
  );

  // Build sourceRefs from nextFiles (proof anchor)
  // If confidence > 0.4, guarantee at least one sourceRef
  const sourceRefs: RLMSourceRef[] = nextFiles.slice(0, 5).map((hit) => ({
    path: hit.file,
    startLine: 1,
    endLine: 1, // Coarse ref - bloodhound doesn't track lines
  }));

  // Bloodhound doesn't use budget (pure local indexing)
  const usage: RLMUsage = {
    budgets: { search: 0, read: 0, list: 0 },
    used: { search: 0, read: 0, list: 0 },
  };

  return {
    success: true,
    query,
    nextFiles,
    grepQueries,
    confidence,
    stats: {
      indexedFiles: index.length,
      searchedFiles: index.length,
      ms: Date.now() - t0,
    },
    sourceRefs: sourceRefs.length > 0 ? sourceRefs : undefined,
    usage,
  };
}
