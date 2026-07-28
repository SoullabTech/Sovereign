/**
 * Library ingestion integrity — identity + completeness contract.
 *
 * Class A defect remediation:
 * docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md
 *
 * D1 — Identity: "Did the system correctly identify what this work is?"
 *   Title/author must come from validated extraction. Junk identity
 *   (bare heading markers, emoji, content fragments like author "would like")
 *   fails validation and blocks completion + retrieval.
 *
 * D2 — Completeness: "Did the system completely ingest the work it identified?"
 *   Expected chunk count is planned from the full content before writing;
 *   a mismatch resolves to 'partial', never 'completed'.
 *
 * These two are separate invariants: a work can be complete but misidentified
 * (the Elemental Alchemy case) or correctly identified but incomplete.
 */

export interface IdentityValidation {
  valid: boolean;
  /** Machine-readable reasons, e.g. ['junk_title'] or ['junk_author'] */
  reasons: string[];
}

export interface ExtractedIdentity {
  title: string;
  author: string | null;
  validation: IdentityValidation;
}

// A title must start with a letter, digit, or quote; contain at least three
// alphabetic characters; and be at least 4 chars long. This rejects the
// observed corpus failures: '#', '**🌱', '. Elemental...', emoji-only titles.
const TITLE_MIN_LENGTH = 4;
const TITLE_START = /^["'“”A-Za-z0-9]/;
const TITLE_MIN_ALPHA = /[A-Za-z].*[A-Za-z].*[A-Za-z]/;

// An author is 1–4 name-shaped words. First and last words must start with an
// uppercase letter (Unicode-aware: Ávila); interior words may be lowercase name
// particles (von, van, de, of, the, ...). Case-sensitive by design: the
// original defect was a case-insensitive match that accepted "would like"
// from mid-document prose. Single names (Rumi, Hafiz) are legitimate authors.
const AUTHOR_WORD = /^[\p{L}'.\-]+$/u;
const AUTHOR_CAP = /^\p{Lu}/u;
const AUTHOR_PARTICLES = new Set([
  'von', 'van', 'de', 'da', 'di', 'del', 'della', 'der', 'den', 'ter', 'ten',
  'of', 'the', 'al', 'el', 'bin', 'ibn', 'la', 'le',
]);

function isNameShaped(candidate: string): boolean {
  const words = candidate.trim().split(/\s+/);
  if (words.length < 1 || words.length > 4) return false;
  if (!words.every((w) => AUTHOR_WORD.test(w))) return false;
  if (!AUTHOR_CAP.test(words[0]) || !AUTHOR_CAP.test(words[words.length - 1])) return false;
  return words
    .slice(1, -1)
    .every((w) => AUTHOR_CAP.test(w) || AUTHOR_PARTICLES.has(w));
}

// Author extraction only trusts an attribution near the head of the document,
// where front-matter/byline attributions actually live — never mid-book prose.
const AUTHOR_SCAN_WINDOW = 1000;
const AUTHOR_PATTERN = /(?:^|\n)\s*(?:[Bb]y|Author:?)\s+([A-Z][a-z]+(?: [A-Z][A-Za-z'.\-]+){1,3})\s*$/m;

export function validateTitle(title: string): IdentityValidation {
  const t = (title || '').trim();
  const reasons: string[] = [];
  if (t.length < TITLE_MIN_LENGTH || !TITLE_START.test(t) || !TITLE_MIN_ALPHA.test(t)) {
    reasons.push('junk_title');
  }
  return { valid: reasons.length === 0, reasons };
}

export function validateAuthor(author: string | null | undefined): IdentityValidation {
  if (author === null || author === undefined || author.trim() === '') {
    // Absent author is honest and valid; invalid author is a lie.
    return { valid: true, reasons: [] };
  }
  const ok = isNameShaped(author.trim());
  return { valid: ok, reasons: ok ? [] : ['junk_author'] };
}

/**
 * Derive a title from a filename (existing convention: dashes/underscores to
 * spaces, title-cased words).
 */
export function titleFromFilename(basenameNoExt: string): string {
  return basenameNoExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract a validated identity from content + filename.
 *
 * Filename-derived title is the baseline. A markdown heading may override it
 * ONLY if the heading itself passes validation — the original defect was an
 * unconditional override. If neither candidate validates, the identity is
 * invalid (never silently "best-effort").
 */
export function extractIdentity(content: string, basenameNoExt: string): ExtractedIdentity {
  const fromFilename = titleFromFilename(basenameNoExt);

  let title = fromFilename;
  // [ \t] not \s: a bare "#" line must not swallow the next paragraph as a
  // "heading" (\s+ matches newlines).
  const headingMatch = content.match(/^#[ \t]+(\S.*)$/m);
  if (headingMatch) {
    const heading = headingMatch[1].trim();
    if (validateTitle(heading).valid) {
      title = heading;
    }
  }
  if (!validateTitle(title).valid && validateTitle(fromFilename).valid) {
    title = fromFilename;
  }

  let author: string | null = null;
  const head = content.slice(0, AUTHOR_SCAN_WINDOW);
  const authorMatch = head.match(AUTHOR_PATTERN);
  if (authorMatch && validateAuthor(authorMatch[1]).valid) {
    author = authorMatch[1].trim();
  }

  const titleCheck = validateTitle(title);
  const authorCheck = validateAuthor(author);
  return {
    title,
    author,
    validation: {
      valid: titleCheck.valid && authorCheck.valid,
      reasons: [...titleCheck.reasons, ...authorCheck.reasons],
    },
  };
}

export type IngestStatus = 'completed' | 'partial' | 'failed';

export interface IngestOutcome {
  status: IngestStatus;
  error: string | null;
}

/**
 * Resolve the terminal ingestion status from the completeness + identity
 * contract. 'completed' is the only retrieval-eligible status, and it requires
 * BOTH invariants to hold. ('completed' matches the existing corpus value —
 * introducing a parallel 'complete' state would strand legacy rows.)
 */
export function resolveIngestStatus(params: {
  expectedChunks: number;
  actualChunks: number;
  identityValid: boolean;
}): IngestOutcome {
  const { expectedChunks, actualChunks, identityValid } = params;
  if (!identityValid) {
    return { status: 'failed', error: 'identity_invalid' };
  }
  if (expectedChunks <= 0 || actualChunks === 0) {
    return { status: 'failed', error: 'no_chunks_produced' };
  }
  if (actualChunks < expectedChunks) {
    return {
      status: 'partial',
      error: `partial_ingest: ${actualChunks}/${expectedChunks} chunks written`,
    };
  }
  return { status: 'completed', error: null };
}
