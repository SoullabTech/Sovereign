/**
 * Ephemeral founder-local manuscript bridge.
 *
 * This is presentation/session state only. It never writes localStorage, a
 * database, Source custody, a server file, or production provenance. The
 * dedicated founder-review browser keeps it in sessionStorage so Import,
 * Write and Publish can review one coherent fictional/local manuscript.
 */

export type LocalReviewSection = Readonly<{
  position: number;
  heading: string | null;
  body: string;
  headingDepth?: 1 | 2 | 3 | null;
  headingSignal?: string | null;
}>;

export type LocalReviewManuscript = Readonly<{
  version: 1;
  manuscriptId: string;
  title: string;
  author: string | null;
  sections: readonly LocalReviewSection[];
  createdAt: string;
}>;

const PREFIX = 'soullab.writer.local-review.manuscript.v1.';

export function localReviewManuscriptKey(manuscriptId: string): string {
  return PREFIX + manuscriptId;
}

function validSection(value: unknown, index: number): value is LocalReviewSection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  const depth = row.headingDepth;
  return row.position === index
    && (row.heading === null || typeof row.heading === 'string')
    && typeof row.body === 'string'
    && (depth === undefined || depth === null || depth === 1 || depth === 2 || depth === 3)
    && (row.headingSignal === undefined || row.headingSignal === null || typeof row.headingSignal === 'string');
}

export function writeLocalReviewManuscript(
  input: Omit<LocalReviewManuscript, 'version' | 'createdAt'>,
): LocalReviewManuscript | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  if (!input.manuscriptId || !input.title.trim() || input.sections.length === 0) return null;
  const sections = input.sections.map((section, position) => ({ ...section, position }));
  if (!sections.every(validSection)) return null;
  const record: LocalReviewManuscript = Object.freeze({
    version: 1,
    manuscriptId: input.manuscriptId,
    title: input.title.trim(),
    author: input.author?.trim() || null,
    sections: Object.freeze(sections.map((section) => Object.freeze(section))),
    createdAt: new Date().toISOString(),
  });
  try {
    window.sessionStorage.setItem(localReviewManuscriptKey(record.manuscriptId), JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

export function readLocalReviewManuscript(manuscriptId: string): LocalReviewManuscript | null {
  if (typeof window === 'undefined' || !window.sessionStorage || !manuscriptId) return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(localReviewManuscriptKey(manuscriptId));
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.version !== 1
        || value.manuscriptId !== manuscriptId
        || typeof value.title !== 'string'
        || !value.title.trim()
        || (value.author !== null && typeof value.author !== 'string')
        || typeof value.createdAt !== 'string'
        || !Array.isArray(value.sections)
        || value.sections.length === 0
        || !value.sections.every(validSection)) {
      return null;
    }
    return value as LocalReviewManuscript;
  } catch {
    return null;
  }
}

export function removeLocalReviewManuscript(manuscriptId: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage || !manuscriptId) return;
  try {
    window.sessionStorage.removeItem(localReviewManuscriptKey(manuscriptId));
  } catch {
    // The dedicated review remains usable without storage mutation.
  }
}
