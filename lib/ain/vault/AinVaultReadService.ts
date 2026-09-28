import 'server-only';

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  AIN_VAULT_SCOPES,
  getAinVaultScope,
  isAllowedVaultExtension,
  isDeniedVaultPath,
  normalizedRelativeVaultPath,
} from './VaultRegistry';
import type {
  AinVaultAlias,
  AinVaultBacklink,
  AinVaultDirectoryEntry,
  AinVaultLink,
  AinVaultLinksResult,
  AinVaultProvenance,
  AinVaultReadResult,
  AinVaultResolvedContextSource,
  AinVaultScopeDefinition,
  AinVaultScopePublic,
  AinVaultSearchResult,
  AinVaultSourceRef,
} from './types';

const execFileAsync = promisify(execFile);
const MAX_FILE_BYTES = 500_000;
const MAX_SEARCH_QUERY_CHARS = 300;
const MAX_CONTEXT_SOURCES = 4;

export class AinVaultReadError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_SCOPE'
      | 'INVALID_PATH'
      | 'DENIED_PATH'
      | 'NOT_FOUND'
      | 'NOT_READABLE'
      | 'TOO_LARGE'
      | 'HEADING_NOT_FOUND'
      | 'INVALID_QUERY',
    public readonly status: 400 | 403 | 404 | 413 = 400,
  ) {
    super(message);
    this.name = 'AinVaultReadError';
  }
}

type ScopeMap = Readonly<Record<AinVaultAlias, AinVaultScopeDefinition>>;

type ResolvedPath = {
  scope: AinVaultScopeDefinition;
  rootReal: string;
  absolutePath: string;
  relativePath: string;
};

function toPosix(input: string): string {
  return input.split(path.sep).join('/');
}

function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
}

const SEARCH_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'what', 'where',
  'when', 'have', 'about', 'our', 'your', 'their', 'how', 'does', 'did', 'can',
]);

function queryTerms(query: string): string[] {
  const clean = query.trim().slice(0, MAX_SEARCH_QUERY_CHARS);
  if (!clean) {
    throw new AinVaultReadError('Search query is required', 'INVALID_QUERY', 400);
  }
  const words: string[] = clean.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? [];
  const terms = [...new Set<string>(words.filter((word: string) =>
    word.length >= 3 && !SEARCH_STOPWORDS.has(word),
  ))].slice(0, 10);
  return terms.length > 0 ? terms : [clean.toLowerCase()];
}

function titleFor(relativePath: string): string {
  return path.basename(relativePath, path.extname(relativePath));
}

function isContained(rootReal: string, candidateReal: string): boolean {
  return candidateReal === rootReal
    || candidateReal.startsWith(rootReal + path.sep);
}

function selectedHeading(
  content: string,
  requestedHeading?: string,
): { content: string; heading: string | null; lineStart: number | null; lineEnd: number | null } {
  if (!requestedHeading?.trim()) {
    return { content, heading: null, lineStart: null, lineEnd: null };
  }

  const wanted = requestedHeading.trim().replace(/^#{1,6}\s*/, '').trim().toLowerCase();
  const lines = content.split(/\r?\n/);
  let foundIndex = -1;
  let foundLevel = 0;
  let foundHeading = '';

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const name = match[2].trim();
    if (name.toLowerCase() === wanted) {
      foundIndex = i;
      foundLevel = match[1].length;
      foundHeading = name;
      break;
    }
  }

  if (foundIndex < 0) {
    throw new AinVaultReadError(
      'Requested heading was not found in the admitted vault source',
      'HEADING_NOT_FOUND',
      404,
    );
  }

  let end = lines.length;
  for (let i = foundIndex + 1; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= foundLevel) {
      end = i;
      break;
    }
  }

  return {
    content: lines.slice(foundIndex, end).join('\n'),
    heading: foundHeading,
    lineStart: foundIndex + 1,
    lineEnd: end,
  };
}

async function runRipgrep(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('rg', args, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
      timeout: 7000,
    });
    return stdout;
  } catch (error: any) {
    if (error?.code === 1) return '';
    if (typeof error?.stdout === 'string' && error.stdout.length > 0) {
      return error.stdout;
    }
    throw error;
  }
}

function rgGlobs(scope: AinVaultScopeDefinition): string[] {
  const args: string[] = [];
  for (const ext of scope.allowedExtensions) {
    args.push('--glob', '*' + ext);
  }
  for (const prefix of scope.deniedPrefixes) {
    args.push('--glob', '!' + prefix + '/**');
  }
  return args;
}

type RgMatch = {
  relativePath: string;
  line: number;
  snippet: string;
};

function parseRgMatches(
  raw: string,
  rootReal: string,
  scope: AinVaultScopeDefinition,
): RgMatch[] {
  const matches: RgMatch[] = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (event.type !== 'match') continue;
      const rawPath = event.data?.path?.text;
      const lineNumber = event.data?.line_number;
      const snippet = event.data?.lines?.text;
      if (typeof rawPath !== 'string' || typeof lineNumber !== 'number' || typeof snippet !== 'string') {
        continue;
      }
      const relativePath = toPosix(path.relative(rootReal, rawPath));
      if (
        relativePath.startsWith('../')
        || isDeniedVaultPath(scope, relativePath)
        || !isAllowedVaultExtension(scope, relativePath)
      ) {
        continue;
      }
      matches.push({
        relativePath,
        line: lineNumber,
        snippet: snippet.trim().slice(0, 320),
      });
    } catch {
      // rg JSON summary/events we do not consume are intentionally ignored.
    }
  }
  return matches;
}

export class AinVaultReadService {
  constructor(private readonly scopes: ScopeMap = AIN_VAULT_SCOPES) {}

  private scope(alias: AinVaultAlias): AinVaultScopeDefinition {
    const scope = this.scopes[alias] ?? getAinVaultScope(alias);
    if (!scope?.readEligible) {
      throw new AinVaultReadError('Vault scope is not admitted for reading', 'INVALID_SCOPE', 403);
    }
    return scope;
  }

  private async rootReal(scope: AinVaultScopeDefinition): Promise<string> {
    try {
      const root = await fs.realpath(scope.rootPath);
      const stat = await fs.stat(root);
      if (!stat.isDirectory()) throw new Error('not-directory');
      return root;
    } catch {
      throw new AinVaultReadError(
        'Admitted vault scope is unavailable on this host',
        'NOT_READABLE',
        404,
      );
    }
  }

  private async resolve(
    alias: AinVaultAlias,
    relativePath: string,
    kind: 'file' | 'directory' | 'any' = 'any',
  ): Promise<ResolvedPath> {
    const scope = this.scope(alias);
    let clean: string;
    try {
      clean = normalizedRelativeVaultPath(relativePath);
    } catch {
      throw new AinVaultReadError(
        'Requested path escapes or violates the admitted vault root',
        'DENIED_PATH',
        403,
      );
    }
    if (clean && isDeniedVaultPath(scope, clean)) {
      throw new AinVaultReadError('Requested path is outside the admitted vault scope', 'DENIED_PATH', 403);
    }
    const rootReal = await this.rootReal(scope);
    const candidate = clean ? path.join(rootReal, clean) : rootReal;
    let candidateReal: string;
    try {
      candidateReal = await fs.realpath(candidate);
    } catch {
      throw new AinVaultReadError('Vault source was not found', 'NOT_FOUND', 404);
    }
    if (!isContained(rootReal, candidateReal)) {
      throw new AinVaultReadError('Resolved path escapes the admitted vault root', 'DENIED_PATH', 403);
    }
    const stat = await fs.stat(candidateReal);
    if (kind === 'file' && !stat.isFile()) {
      throw new AinVaultReadError('Requested vault source is not a file', 'INVALID_PATH', 400);
    }
    if (kind === 'directory' && !stat.isDirectory()) {
      throw new AinVaultReadError('Requested vault path is not a directory', 'INVALID_PATH', 400);
    }
    const actualRelative = toPosix(path.relative(rootReal, candidateReal));
    if (actualRelative && isDeniedVaultPath(scope, actualRelative)) {
      throw new AinVaultReadError('Resolved path is denied by vault policy', 'DENIED_PATH', 403);
    }
    return { scope, rootReal, absolutePath: candidateReal, relativePath: actualRelative };
  }

  async listScopes(): Promise<AinVaultScopePublic[]> {
    const results: AinVaultScopePublic[] = [];
    for (const scope of Object.values(this.scopes)) {
      let available = false;
      try {
        const root = await fs.realpath(scope.rootPath);
        available = (await fs.stat(root)).isDirectory();
      } catch {
        available = false;
      }
      results.push({
        alias: scope.alias,
        displayName: scope.displayName,
        description: scope.description,
        authorityKind: scope.authorityKind,
        readEligible: true,
        writeEligible: false,
        available,
      });
    }
    return results;
  }

  async list(alias: AinVaultAlias, directory = ''): Promise<AinVaultDirectoryEntry[]> {
    const resolved = await this.resolve(alias, directory, 'directory');
    const entries = await fs.readdir(resolved.absolutePath, { withFileTypes: true });
    const out: AinVaultDirectoryEntry[] = [];

    for (const entry of entries.slice(0, 1000)) {
      if (entry.name.startsWith('.')) continue;
      const childRelative = toPosix(path.join(resolved.relativePath, entry.name));
      if (isDeniedVaultPath(resolved.scope, childRelative)) continue;
      if (!entry.isDirectory() && !isAllowedVaultExtension(resolved.scope, childRelative)) continue;
      try {
        const child = await this.resolve(alias, childRelative, entry.isDirectory() ? 'directory' : 'file');
        const stat = await fs.stat(child.absolutePath);
        out.push({
          name: entry.name,
          relativePath: child.relativePath,
          kind: entry.isDirectory() ? 'directory' : 'file',
          extension: entry.isDirectory() ? null : path.extname(entry.name).toLowerCase(),
          modifiedAt: stat.mtime.toISOString(),
        });
      } catch {
        // Symlinks or races that no longer satisfy containment are omitted.
      }
    }

    return out.sort((a, b) =>
      Number(b.kind === 'directory') - Number(a.kind === 'directory')
      || a.name.localeCompare(b.name),
    );
  }

  async search(
    alias: AinVaultAlias,
    query: string,
    options: { limit?: number; maxMatchesPerFile?: number } = {},
  ): Promise<AinVaultSearchResult[]> {
    const scope = this.scope(alias);
    const rootReal = await this.rootReal(scope);
    const terms = queryTerms(query);
    const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
    const maxMatchesPerFile = Math.max(1, Math.min(options.maxMatchesPerFile ?? 4, 10));
    const pattern = terms.map(escapeRegex).join('|');

    const raw = await runRipgrep([
      '--json',
      '--ignore-case',
      '--line-number',
      '--max-count', String(maxMatchesPerFile),
      ...rgGlobs(scope),
      '-e', pattern,
      rootReal,
    ]);

    const grouped = new Map<string, RgMatch[]>();
    for (const match of parseRgMatches(raw, rootReal, scope)) {
      const bucket = grouped.get(match.relativePath) ?? [];
      if (bucket.length < maxMatchesPerFile) bucket.push(match);
      grouped.set(match.relativePath, bucket);
    }

    const scored: AinVaultSearchResult[] = [];
    for (const [relativePath, matches] of grouped) {
      const lowerPath = relativePath.toLowerCase();
      const lineText = matches.map((m) => m.snippet.toLowerCase()).join(' ');
      const pathScore = terms.reduce((score, term) => score + (lowerPath.includes(term) ? 2 : 0), 0);
      const textScore = terms.reduce((score, term) => score + (lineText.includes(term) ? 1 : 0), 0);
      const resolved = await this.resolve(alias, relativePath, 'file');
      const stat = await fs.stat(resolved.absolutePath);
      scored.push({
        vaultAlias: alias,
        relativePath,
        title: titleFor(relativePath),
        score: pathScore + textScore + Math.min(matches.length, 3) * 0.25,
        modifiedAt: stat.mtime.toISOString(),
        matches,
      });
    }

    return scored.sort((a, b) => b.score - a.score || b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, limit);
  }

  async read(alias: AinVaultAlias, relativePath: string, heading?: string): Promise<AinVaultReadResult> {
    const resolved = await this.resolve(alias, relativePath, 'file');
    if (!isAllowedVaultExtension(resolved.scope, resolved.relativePath)) {
      throw new AinVaultReadError('File type is not admitted for vault reading', 'DENIED_PATH', 403);
    }
    const stat = await fs.stat(resolved.absolutePath);
    if (stat.size > MAX_FILE_BYTES) {
      throw new AinVaultReadError('Vault source exceeds the read-only size limit', 'TOO_LARGE', 413);
    }
    const bytes = await fs.readFile(resolved.absolutePath);
    const wholeText = bytes.toString('utf8');
    const selection = selectedHeading(wholeText, heading);
    const provenance: AinVaultProvenance = {
      vaultAlias: alias,
      relativePath: resolved.relativePath,
      heading: selection.heading,
      lineStart: selection.lineStart,
      lineEnd: selection.lineEnd,
      fileSha256: sha256(bytes),
      contentSha256: sha256(selection.content),
      modifiedAt: stat.mtime.toISOString(),
      fileBytes: stat.size,
      authorityKind: resolved.scope.authorityKind,
    };
    return { content: selection.content, provenance };
  }

  async links(alias: AinVaultAlias, relativePath: string): Promise<AinVaultLinksResult> {
    const source = await this.read(alias, relativePath);
    const outboundMap = new Map<string, AinVaultLink>();
    const linkPattern = /\[\[([^\]]+)\]\]/g;
    for (const match of source.content.matchAll(linkPattern)) {
      const raw = match[1].trim();
      const [targetPart, aliasPart] = raw.split('|', 2);
      const [target, heading] = targetPart.split('#', 2);
      if (!target?.trim()) continue;
      const key = target.trim() + '#' + (heading?.trim() ?? '');
      outboundMap.set(key, {
        target: target.trim(),
        heading: heading?.trim() || null,
        aliasText: aliasPart?.trim() || null,
      });
    }

    const scope = this.scope(alias);
    const rootReal = await this.rootReal(scope);
    const stem = path.basename(source.provenance.relativePath, path.extname(source.provenance.relativePath));
    const relStem = source.provenance.relativePath.replace(/\.[^.]+$/, '');
    const patterns = [...new Set(['[[' + stem, '[[' + relStem])];
    const raw = await runRipgrep([
      '--json',
      '--fixed-strings',
      '--ignore-case',
      '--line-number',
      '--max-count', '4',
      ...rgGlobs(scope),
      ...patterns.flatMap((pattern) => ['-e', pattern]),
      rootReal,
    ]);
    const backlinks: AinVaultBacklink[] = parseRgMatches(raw, rootReal, scope)
      .filter((match) => match.relativePath !== source.provenance.relativePath)
      .slice(0, 30)
      .map((match) => ({
        relativePath: match.relativePath,
        line: match.line,
        snippet: match.snippet,
      }));

    return {
      source: source.provenance,
      outbound: [...outboundMap.values()].slice(0, 100),
      backlinks,
    };
  }

  async resolveContextSources(refs: readonly AinVaultSourceRef[]): Promise<AinVaultResolvedContextSource[]> {
    if (refs.length === 0) return [];
    if (refs.length > MAX_CONTEXT_SOURCES) {
      throw new AinVaultReadError(
        'At most ' + MAX_CONTEXT_SOURCES + ' vault sources may enter one MAIA turn',
        'INVALID_PATH',
        400,
      );
    }

    const unique = new Map<string, AinVaultSourceRef>();
    for (const ref of refs) {
      const key = ref.vaultAlias + ':' + ref.relativePath + ':' + (ref.heading ?? '');
      unique.set(key, ref);
    }

    const out: AinVaultResolvedContextSource[] = [];
    for (const ref of unique.values()) {
      const read = await this.read(ref.vaultAlias, ref.relativePath, ref.heading);
      out.push({ ref, ...read });
    }
    return out;
  }
}

export const ainVaultReadService = new AinVaultReadService();
