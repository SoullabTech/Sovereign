/**
 * MAIA Memory Notes Loader
 *
 * Loads external markdown files that give MAIA persistent "global wisdom"
 * that survives context compaction. This is system-level knowledge that
 * applies across all users.
 *
 * Architecture:
 * - maia_notes/*.md = Canonical knowledge (AUTHORITATIVE - injected into prompt)
 * - maia_notes/_inbox/*.md = Proposed updates (NOT injected - human review only)
 *
 * Usage:
 * - loadMemoryNotes() returns formatted string for system prompt injection
 * - appendProposedUpdate() safely adds to _inbox for human review
 * - getNotesStatus() returns health/debug info
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Path resolution: Use process.cwd() which is the project root
// where `next dev` or `next start` is executed from.
// __dirname doesn't work because compiled code runs from .next/server/
const NOTES_DIR = path.resolve(process.cwd(), 'maia_notes');
const INBOX_DIR = path.join(NOTES_DIR, '_inbox');

// Size limits to prevent prompt bloat
const MAX_CHARS_PER_FILE = 12000;  // 12k chars per file max
const MAX_TOTAL_CHARS = 50000;     // 50k chars total max (~12k tokens)

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache

/**
 * Canonical files in PRIORITY ORDER
 * Files 00-03 are critical and always loaded first
 * Files 04-07 are included if space permits
 */
const PRIORITY_FILES = [
  // CRITICAL - Always load these first
  '00_context.md',         // North star identity
  '01_product_truths.md',  // How the system works
  '02_support_playbook.md', // Decision trees
  '03_known_failures.md',  // Symptoms → Cause → Fix
  '08_spiralogic_patterns.md', // Archetypal literacy (CRITICAL for facet support)
  // SECONDARY - Load if space permits
  '04_patterns_across_users.md', // Recurring themes
  '05_decision_log.md',    // Why we built it this way
  '06_copy_snippets.md',   // Pre-approved responses
  '07_checklists.md',      // Operational procedures
];

const CRITICAL_FILE_COUNT = 5; // First 5 files are critical (including spiralogic patterns)

// ============================================================================
// CACHE STATE
// ============================================================================

interface CacheState {
  content: string | null;
  timestamp: number;
  stats: NotesStats;
}

interface NotesStats {
  filesLoaded: string[];
  filesMissing: string[];
  filesTruncated: string[];
  filesSkipped: string[];
  totalChars: number;
  warnings: string[];
}

let cache: CacheState = {
  content: null,
  timestamp: 0,
  stats: {
    filesLoaded: [],
    filesMissing: [],
    filesTruncated: [],
    filesSkipped: [],
    totalChars: 0,
    warnings: [],
  },
};

// ============================================================================
// MAIN LOADER
// ============================================================================

/**
 * Load all memory notes and format for system prompt injection
 * Returns empty string if notes directory doesn't exist (graceful degradation)
 *
 * IMPORTANT: Only loads CANONICAL files. Inbox is NEVER injected.
 */
export function loadMemoryNotes(): string {
  const now = Date.now();

  // Check cache first
  if (cache.content !== null && (now - cache.timestamp) < CACHE_TTL_MS) {
    return cache.content;
  }

  // Reset stats for fresh load
  const stats: NotesStats = {
    filesLoaded: [],
    filesMissing: [],
    filesTruncated: [],
    filesSkipped: [],
    totalChars: 0,
    warnings: [],
  };

  // Verify notes directory exists
  if (!fs.existsSync(NOTES_DIR)) {
    stats.warnings.push(`maia_notes/ directory not found at ${NOTES_DIR}`);
    console.warn(`[MaiaNotesLoader] ${stats.warnings[0]}`);
    cache = { content: '', timestamp: now, stats };
    return '';
  }

  const sections: string[] = [];
  let totalChars = 0;

  // Load files in priority order
  for (let i = 0; i < PRIORITY_FILES.length; i++) {
    const filename = PRIORITY_FILES[i];
    const filepath = path.join(NOTES_DIR, filename);
    const isCritical = i < CRITICAL_FILE_COUNT;

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      stats.filesMissing.push(filename);
      if (isCritical) {
        stats.warnings.push(`Critical file missing: ${filename}`);
      }
      continue;
    }

    // Check if we have space (skip non-critical files if over budget)
    if (totalChars >= MAX_TOTAL_CHARS && !isCritical) {
      stats.filesSkipped.push(filename);
      continue;
    }

    try {
      let content = fs.readFileSync(filepath, 'utf-8');
      const originalLength = content.length;

      // Process and clean content
      content = processNoteContent(content, filename);

      // Truncate if too large
      if (content.length > MAX_CHARS_PER_FILE) {
        content = truncateWithMarker(content, MAX_CHARS_PER_FILE, filename);
        stats.filesTruncated.push(filename);
      }

      // Check total budget
      if (totalChars + content.length > MAX_TOTAL_CHARS) {
        // Truncate to fit remaining budget
        const remaining = MAX_TOTAL_CHARS - totalChars;
        if (remaining > 500) { // Only include if meaningful amount fits
          content = truncateWithMarker(content, remaining, filename);
          stats.filesTruncated.push(filename);
        } else {
          stats.filesSkipped.push(filename);
          continue;
        }
      }

      sections.push(content);
      stats.filesLoaded.push(filename);
      totalChars += content.length;

    } catch (err) {
      stats.warnings.push(`Failed to read ${filename}: ${(err as Error).message}`);
      console.warn(`[MaiaNotesLoader] Failed to read ${filename}:`, err);
    }
  }

  stats.totalChars = totalChars;

  // Build result
  let result = '';
  if (sections.length > 0) {
    result = `
## MAIA MEMORY NOTES (Authoritative Knowledge)

The following is MAIA's accumulated wisdom from operating the system.
This is AUTHORITATIVE knowledge — use it to provide accurate, helpful responses.

${sections.join('\n\n---\n\n')}

---
END MEMORY NOTES (${stats.filesLoaded.length} files, ${totalChars} chars)
`;
  }

  // Update cache
  cache = { content: result, timestamp: now, stats };

  // Log status
  console.log(`[MaiaNotesLoader] Loaded ${stats.filesLoaded.length} files (${totalChars} chars)`, {
    loaded: stats.filesLoaded,
    missing: stats.filesMissing.length > 0 ? stats.filesMissing : undefined,
    truncated: stats.filesTruncated.length > 0 ? stats.filesTruncated : undefined,
    skipped: stats.filesSkipped.length > 0 ? stats.filesSkipped : undefined,
  });

  return result;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Process note content - remove metadata, keep substance
 */
function processNoteContent(content: string, filename: string): string {
  const lines = content.split('\n');
  const processedLines: string[] = [];
  let skipNext = false;

  for (const line of lines) {
    // Skip "Last updated" lines
    if (line.includes('Last updated:')) {
      skipNext = true;
      continue;
    }
    // Skip empty lines after "Last updated"
    if (skipNext && line.trim() === '') {
      skipNext = false;
      continue;
    }
    skipNext = false;
    processedLines.push(line);
  }

  return processedLines.join('\n').trim();
}

/**
 * Truncate content with a clear marker
 */
function truncateWithMarker(content: string, maxChars: number, filename: string): string {
  // Find last complete paragraph within limit
  const truncated = content.slice(0, maxChars);
  const lastParagraph = truncated.lastIndexOf('\n\n');

  if (lastParagraph > maxChars * 0.7) {
    return truncated.slice(0, lastParagraph) + `\n\n[...${filename} truncated for prompt size...]`;
  }

  // Fall back to last sentence
  const lastSentence = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
  );

  if (lastSentence > maxChars * 0.7) {
    return truncated.slice(0, lastSentence + 1) + `\n\n[...${filename} truncated for prompt size...]`;
  }

  return truncated + `\n\n[...${filename} truncated for prompt size...]`;
}

// ============================================================================
// INBOX (Proposals - NOT injected into prompts)
// ============================================================================

/**
 * Append a proposed update to the _inbox for human review
 * IMPORTANT: Inbox content is NEVER injected into MAIA's prompt.
 * It exists purely for human stewards to review and promote to canonical files.
 *
 * @param targetFile - Which canonical file this update is for (e.g., '03_known_failures.md')
 * @param proposal - The markdown content to propose
 * @param reasoning - Why this update is being suggested
 */
export function appendProposedUpdate(
  targetFile: string,
  proposal: string,
  reasoning: string
): boolean {
  try {
    // Ensure _inbox directory exists
    if (!fs.existsSync(INBOX_DIR)) {
      fs.mkdirSync(INBOX_DIR, { recursive: true });
    }

    const proposedUpdatesPath = path.join(INBOX_DIR, 'proposed_updates.md');

    // Format the proposal entry
    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const entry = `
## ${date} | ${targetFile}

**Proposed at:** ${timestamp}

${proposal}

**Reasoning:** ${reasoning}

---
`;

    // Append to file
    fs.appendFileSync(proposedUpdatesPath, entry);

    console.log(`[MaiaNotesLoader] Proposed update appended for ${targetFile}`);
    return true;
  } catch (err) {
    console.error('[MaiaNotesLoader] Failed to append proposed update:', err);
    return false;
  }
}

// ============================================================================
// STATUS & DEBUGGING
// ============================================================================

export interface NotesStatus {
  loaded: boolean;
  cacheAgeMs: number;
  cacheAgeReadable: string;
  notesDir: string;
  notesDirExists: boolean;
  stats: NotesStats;
  health: 'healthy' | 'degraded' | 'error';
  healthDetails: string[];
}

/**
 * Get comprehensive status of the notes system
 * Use this for debugging and health checks
 */
export function getNotesStatus(): NotesStatus {
  const notesDirExists = fs.existsSync(NOTES_DIR);
  const cacheAgeMs = cache.content !== null ? Date.now() - cache.timestamp : 0;

  // Determine health
  const healthDetails: string[] = [];
  let health: 'healthy' | 'degraded' | 'error' = 'healthy';

  if (!notesDirExists) {
    health = 'error';
    healthDetails.push('Notes directory not found');
  } else {
    // Check for critical missing files
    const criticalMissing = cache.stats.filesMissing.filter((f, i) =>
      PRIORITY_FILES.indexOf(f) < CRITICAL_FILE_COUNT
    );
    if (criticalMissing.length > 0) {
      health = 'degraded';
      healthDetails.push(`Critical files missing: ${criticalMissing.join(', ')}`);
    }

    // Check for warnings
    if (cache.stats.warnings.length > 0) {
      health = health === 'healthy' ? 'degraded' : health;
      healthDetails.push(...cache.stats.warnings);
    }

    // Check for truncation
    if (cache.stats.filesTruncated.length > 0) {
      healthDetails.push(`Files truncated: ${cache.stats.filesTruncated.join(', ')}`);
    }

    // Check total size
    if (cache.stats.totalChars > MAX_TOTAL_CHARS * 0.9) {
      healthDetails.push(`Near size limit: ${cache.stats.totalChars}/${MAX_TOTAL_CHARS} chars`);
    }
  }

  if (healthDetails.length === 0) {
    healthDetails.push('All systems nominal');
  }

  return {
    loaded: cache.content !== null,
    cacheAgeMs,
    cacheAgeReadable: formatDuration(cacheAgeMs),
    notesDir: NOTES_DIR,
    notesDirExists,
    stats: { ...cache.stats },
    health,
    healthDetails,
  };
}

/**
 * Format milliseconds to human-readable duration
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

/**
 * Clear the notes cache (useful for development/testing)
 */
export function clearNotesCache(): void {
  cache = {
    content: null,
    timestamp: 0,
    stats: {
      filesLoaded: [],
      filesMissing: [],
      filesTruncated: [],
      filesSkipped: [],
      totalChars: 0,
      warnings: [],
    },
  };
  console.log('[MaiaNotesLoader] Cache cleared');
}

/**
 * Force reload notes (bypasses cache)
 */
export function reloadNotes(): string {
  clearNotesCache();
  return loadMemoryNotes();
}
