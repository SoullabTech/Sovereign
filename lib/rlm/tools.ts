/**
 * RLM Tool Adapters
 *
 * Wraps filesystem operations for use by the RLM loop.
 * These tools provide structured access to codebase exploration.
 * Includes denylist for sensitive files and structured output parsing.
 */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { execSync } from 'child_process';
import type { SearchAction, ReadAction, ListAction, ToolResult, SearchMatch } from './types';

const MAX_CONTENT_CHARS = 8000;
const MAX_SEARCH_RESULTS = 20;
const MAX_LIST_RESULTS = 50;
const MAX_READ_BYTES = 120_000;

// ============================================================================
// Denylist: Never read or return these paths
// ============================================================================

const DENY_PATH_PARTS = [
  '/.git/',
  '/node_modules/',
  '/.next/',
  '/dist/',
  '/build/',
  '/.beads/',
];

const DENY_FILENAMES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'credentials.json',
  'serviceAccountKey.json',
];

/**
 * Check if a path should be denied (secrets, node_modules, etc.)
 */
export function isDeniedPath(p: string): boolean {
  const norm = p.replace(/\\/g, '/');

  // Check path parts
  if (DENY_PATH_PARTS.some(part => norm.includes(part))) return true;

  // Check filename
  const base = norm.split('/').pop() || norm;
  if (DENY_FILENAMES.includes(base)) return true;

  // Check for secret-like names
  const baseLower = base.toLowerCase();
  if (baseLower.includes('secret')) return true;
  if (baseLower.includes('apikey')) return true;
  if (baseLower.includes('privatekey')) return true;
  if (baseLower.includes('credentials')) return true;
  if (baseLower.endsWith('.pem')) return true;
  if (baseLower.endsWith('.key')) return true;

  return false;
}

// ============================================================================
// Ripgrep output parsing
// ============================================================================

/**
 * Parse ripgrep output into structured matches
 * rg format: path:line:content
 */
function parseRgOutput(output: string): SearchMatch[] {
  const matches: SearchMatch[] = [];

  for (const line of output.split('\n')) {
    // Match: ./path/to/file.ts:123:content here
    const m = line.match(/^(.+?):(\d+):(.*)$/);
    if (!m) continue;

    const path = m[1].replace(/^\.\//, ''); // normalize ./path to path
    const lineNum = Number(m[2]);
    const preview = (m[3] ?? '').slice(0, 300);

    if (!Number.isFinite(lineNum)) continue;
    if (isDeniedPath(path)) continue;

    matches.push({ path, line: lineNum, preview });
  }

  return matches;
}

// ============================================================================
// Tool implementations
// ============================================================================

/**
 * Search code using ripgrep (rg)
 * Returns structured matches with paths that can be used for reading
 */
export async function searchCode(action: SearchAction): Promise<ToolResult> {
  try {
    const { query, pattern, fileGlob } = action;

    // If pattern is provided, use it directly
    // Otherwise, extract key terms from query for better matching
    let searchPattern = pattern;
    if (!searchPattern || searchPattern.trim() === '') {
      // Extract likely search terms (longest words, skip common words)
      const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'where', 'how', 'what', 'which', 'with', 'from', 'for', 'and', 'or', 'to', 'in', 'on', 'at', 'by']);
      const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      // Sort by length (longer words are more specific) and take first few
      const keyTerms = words.sort((a, b) => b.length - a.length).slice(0, 3);
      // Create OR pattern for ripgrep
      searchPattern = keyTerms.join('|');
    }

    if (!searchPattern) {
      return {
        success: false,
        content: 'Could not extract meaningful search terms from query',
      };
    }

    // Build rg command - exclude denied paths
    let cmd = `rg --line-number --max-count=5 --max-columns=200 -i`;
    cmd += ` --glob '!node_modules/**' --glob '!.git/**' --glob '!.next/**' --glob '!dist/**'`;
    cmd += ` --glob '!*.env*' --glob '!*secret*' --glob '!*credential*'`;
    if (fileGlob) {
      cmd += ` --glob '${fileGlob}'`;
    }
    cmd += ` '${searchPattern.replace(/'/g, "'\\''")}'`;
    cmd += ` . 2>/dev/null || true`;

    const output = execSync(cmd, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024,
      encoding: 'utf-8',
    });

    const matches = parseRgOutput(output);
    const truncated = matches.length > MAX_SEARCH_RESULTS;
    const limitedMatches = matches.slice(0, MAX_SEARCH_RESULTS);

    if (limitedMatches.length === 0) {
      return {
        success: true,
        content: `No matches found for: ${searchPattern}`,
        meta: { matches: [] },
      };
    }

    // Format for display
    const content = limitedMatches
      .map(m => `${m.path}:${m.line}: ${m.preview}`)
      .join('\n');

    return {
      success: true,
      content,
      truncated,
      meta: { matches: limitedMatches },
    };
  } catch (err) {
    return {
      success: false,
      content: `Search failed: ${err}`,
    };
  }
}

/**
 * Read a file or section of a file
 * Enforces denylist and size limits
 */
export async function readFileContent(action: ReadAction): Promise<ToolResult> {
  try {
    const { filePath, startLine, endLine } = action;

    // Enforce denylist
    if (isDeniedPath(filePath)) {
      return {
        success: false,
        content: `Denied: ${filePath} is a protected file`,
      };
    }

    const buf = await readFile(filePath);

    // Enforce size limit
    const content = buf.length > MAX_READ_BYTES
      ? buf.subarray(0, MAX_READ_BYTES).toString('utf-8')
      : buf.toString('utf-8');

    const lines = content.split('\n');

    let selectedLines: string[];
    if (startLine !== undefined || endLine !== undefined) {
      const start = (startLine ?? 1) - 1;
      const end = endLine ?? lines.length;
      selectedLines = lines.slice(start, end);
    } else {
      selectedLines = lines;
    }

    let result = selectedLines
      .map((line, i) => `${(startLine ?? 1) + i}: ${line}`)
      .join('\n');

    const truncated = result.length > MAX_CONTENT_CHARS || buf.length > MAX_READ_BYTES;
    if (result.length > MAX_CONTENT_CHARS) {
      result = result.slice(0, MAX_CONTENT_CHARS) + '\n... (truncated)';
    }

    return {
      success: true,
      content: result,
      truncated,
      meta: { linesRead: selectedLines.length },
    };
  } catch (err) {
    return {
      success: false,
      content: `Failed to read ${action.filePath}: ${err}`,
    };
  }
}

/**
 * List files matching a glob pattern
 * Filters out denied paths
 */
export async function listFiles(action: ListAction): Promise<ToolResult> {
  try {
    const { glob: pattern, maxResults = MAX_LIST_RESULTS } = action;

    const allFiles = await glob(pattern, {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**', '.beads/**'],
      nodir: true,
    });

    // Filter denied paths
    const files = allFiles.filter(f => !isDeniedPath(f));
    const truncated = files.length > maxResults;
    const results = files.slice(0, maxResults);

    return {
      success: true,
      content: results.join('\n') || 'No files matched',
      truncated,
      meta: { files: results },
    };
  } catch (err) {
    return {
      success: false,
      content: `Failed to list files: ${err}`,
    };
  }
}

/**
 * Execute an action and return the result
 */
export async function executeAction(
  action: SearchAction | ReadAction | ListAction
): Promise<ToolResult> {
  switch (action.type) {
    case 'search':
      return searchCode(action);
    case 'read':
      return readFileContent(action);
    case 'list':
      return listFiles(action);
    default:
      return {
        success: false,
        content: `Unknown action type: ${(action as { type: string }).type}`,
      };
  }
}
