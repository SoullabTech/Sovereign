/**
 * MEMORY TOOL BACKEND — PostgreSQL-backed handler for Anthropic Memory Tool pilot
 *
 * Maps virtual file paths to DB rows in `memory_tool_store`.
 * Claude issues tool_use requests (view/create/etc); this handler resolves them.
 *
 * PILOT SCOPE: Read-only from Claude's perspective. Server-side code writes
 * pre-computed context (wisdom, council) after each turn. Claude reads via `view`.
 *
 * SOVEREIGNTY NOTE: Storage is local PostgreSQL. Retrieved content transits the
 * Anthropic API as tool_result blocks. No Sanctuary content is ever stored here.
 */

import { query } from '@/lib/db/postgres';

/** Maximum characters per memory file. Latest overwrites previous — no append. */
export const MAX_MEMORY_CHARS = 4000;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MemoryToolInput {
  command: 'view' | 'create' | 'str_replace' | 'insert' | 'delete' | 'rename';
  path?: string;
  file_text?: string;
  old_str?: string;
  new_str?: string;
  line?: number;
  text?: string;
  old_path?: string;
  new_path?: string;
  view_range?: [number, number];
}

// ─── Tool Handler (called when Claude issues memory tool_use) ────────────────

/**
 * Handle a memory tool_use request from Claude.
 * Only `view` is functional; all write operations return a read-only notice.
 *
 * @param memberId - The member whose memory namespace is being accessed
 * @param input    - The tool input from Claude's tool_use block
 * @returns        - String result to send back as tool_result
 */
export async function handleMemoryToolUse(
  memberId: string,
  input: MemoryToolInput
): Promise<string> {
  try {
    switch (input.command) {
      case 'view':
        return await handleView(memberId, input.path, input.view_range);

      case 'create':
      case 'str_replace':
      case 'insert':
      case 'delete':
      case 'rename':
        return 'Memory is read-only in this context. Context is maintained by the system.';

      default:
        return `Unknown memory command: ${(input as any).command}`;
    }
  } catch (err) {
    console.error('[MemoryTool] handler error:', err);
    return 'Memory temporarily unavailable.';
  }
}

// ─── View Handler ────────────────────────────────────────────────────────────

async function handleView(
  memberId: string,
  path?: string,
  viewRange?: [number, number]
): Promise<string> {
  if (!path) {
    return 'Error: path is required for view command.';
  }

  // Path validation: prevent traversal
  const normalizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/');

  // Directory listing: /memories/{memberId}/ or /memories/
  if (normalizedPath.endsWith('/') || normalizedPath === `/memories/${memberId}`) {
    const result = await query(
      `SELECT path, LENGTH(content) as size, updated_at
       FROM memory_tool_store
       WHERE member_id = $1
       ORDER BY path`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return `Directory /memories/${memberId}/ is empty. No context files available.`;
    }

    const listing = result.rows
      .map((r: any) => `${r.size}B\t/memories/${memberId}/${r.path}\t(updated ${new Date(r.updated_at).toISOString()})`)
      .join('\n');

    return `Here are the files in /memories/${memberId}/:\n${listing}`;
  }

  // File read: extract the filename from the path
  const filename = extractFilename(normalizedPath, memberId);

  const result = await query(
    `SELECT content, updated_at FROM memory_tool_store WHERE member_id = $1 AND path = $2`,
    [memberId, filename]
  );

  if (result.rows.length === 0) {
    return `The path /memories/${memberId}/${filename} does not exist.`;
  }

  const content = result.rows[0].content;
  const lines = content.split('\n');

  // Apply view_range if specified
  if (viewRange && viewRange.length === 2) {
    const [start, end] = viewRange;
    const sliced = lines.slice(Math.max(0, start - 1), end);
    return formatWithLineNumbers(sliced, Math.max(1, start));
  }

  return formatWithLineNumbers(lines, 1);
}

// ─── Server-Side Write (fire-and-forget) ─────────────────────────────────────

/**
 * Write pre-computed context to a member's memory store.
 * Called server-side after each turn — NOT by Claude.
 *
 * Fire-and-forget pattern (matches spiralStatePersistence.upsertSpiralState):
 * - Returns void
 * - Errors are logged, never thrown
 * - Skips entirely when isSanctuary is true
 * - Content truncated to MAX_MEMORY_CHARS
 *
 * @param memberId    - Member UUID
 * @param path        - Virtual filename (e.g. 'wisdom.txt', 'council.txt')
 * @param content     - Content to store (will be truncated)
 * @param isSanctuary - When true, skip write entirely (hard boundary)
 */
export function writeMemoryContent(
  memberId: string,
  path: string,
  content: string | null | undefined,
  isSanctuary: boolean = false
): void {
  // Hard Sanctuary boundary — no exceptions
  if (isSanctuary) return;

  // Nothing to write
  if (!content || content.trim().length === 0) return;

  // Truncate to size limit
  const truncated = content.length > MAX_MEMORY_CHARS
    ? content.slice(0, MAX_MEMORY_CHARS) + '\n[...truncated]'
    : content;

  // Fire-and-forget: async but not awaited
  query(
    `INSERT INTO memory_tool_store (member_id, path, content, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (member_id, path)
     DO UPDATE SET content = $3, updated_at = NOW()`,
    [memberId, path, truncated]
  ).catch((err) => {
    console.warn('[MemoryTool] write failed (non-blocking):', err?.message);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the filename from a virtual path like /memories/{memberId}/wisdom.txt
 */
function extractFilename(path: string, memberId: string): string {
  // Remove /memories/{memberId}/ prefix if present
  const prefix = `/memories/${memberId}/`;
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length);
  }
  // Remove /memories/ prefix if present
  if (path.startsWith('/memories/')) {
    return path.slice('/memories/'.length);
  }
  // Return as-is (bare filename)
  return path;
}

/**
 * Format content with line numbers (matches Anthropic memory tool convention)
 */
function formatWithLineNumbers(lines: string[], startLine: number): string {
  const maxLineNum = startLine + lines.length - 1;
  const padding = String(maxLineNum).length;
  return lines
    .map((line, i) => `${String(startLine + i).padStart(padding)}\t${line}`)
    .join('\n');
}
