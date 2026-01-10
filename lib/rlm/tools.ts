/**
 * RLM Tool Adapters
 *
 * Wraps filesystem operations for use by the RLM loop.
 * These tools provide structured access to codebase exploration.
 */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { execSync } from 'child_process';
import type { SearchAction, ReadAction, ListAction, ToolResult } from './types';

const MAX_CONTENT_CHARS = 8000;
const MAX_SEARCH_RESULTS = 20;
const MAX_LIST_RESULTS = 50;

/**
 * Search code using ripgrep (rg) or grep
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

    // Build rg command
    let cmd = `rg --line-number --max-count=5 --max-columns=200 -i`;
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

    const lines = output.trim().split('\n').filter(Boolean);
    const truncated = lines.length > MAX_SEARCH_RESULTS;
    const results = lines.slice(0, MAX_SEARCH_RESULTS).join('\n');

    if (!results) {
      return {
        success: true,
        content: `No matches found for: ${searchPattern}`,
        metadata: { matchCount: 0 },
      };
    }

    return {
      success: true,
      content: results,
      truncated,
      metadata: { matchCount: lines.length },
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
 */
export async function readFileContent(action: ReadAction): Promise<ToolResult> {
  try {
    const { filePath, startLine, endLine } = action;

    const content = await readFile(filePath, 'utf-8');
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

    const truncated = result.length > MAX_CONTENT_CHARS;
    if (truncated) {
      result = result.slice(0, MAX_CONTENT_CHARS) + '\n... (truncated)';
    }

    return {
      success: true,
      content: result,
      truncated,
      metadata: {
        totalLines: lines.length,
        selectedLines: selectedLines.length,
      },
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
 */
export async function listFiles(action: ListAction): Promise<ToolResult> {
  try {
    const { glob: pattern, maxResults = MAX_LIST_RESULTS } = action;

    const files = await glob(pattern, {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
      nodir: true,
    });

    const truncated = files.length > maxResults;
    const results = files.slice(0, maxResults);

    return {
      success: true,
      content: results.join('\n') || 'No files matched',
      truncated,
      metadata: { fileCount: files.length },
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
