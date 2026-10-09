import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

/**
 * A non-persistent reading projection. The source sections remain untouched.
 *
 * The complete Preface begins at its explicit heading and ends at the next
 * sibling/ancestor heading or an explicitly named major book boundary.
 * A missing depth is NOT permission to cross an explicit boundary.
 */
export type PrefaceReading = {
  title: 'Preface';
  sections: readonly RebuildSection[];
  sourceSectionIds: readonly string[];
  wordCount: number;
  boundary: 'next-major-section' | 'end-of-work';
};

const MAJOR_BOUNDARY = /^(?:introduction|prologue|foreword|afterword|epilogue|conclusion|bibliography|references|acknowledg(?:e)?ments|appendix(?:\s+[A-Z0-9]+)?|part\s+(?:\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten)\b.*|chapter\s+\S+.*)$/i;

function isBoundary(section: RebuildSection, rootDepth: number | null): boolean {
  const heading = section.heading?.trim() ?? '';
  if (!heading) return false;
  if (MAJOR_BOUNDARY.test(heading)) return true;

  // Never join a sibling or ancestor of Preface to the reading.
  if (typeof rootDepth === 'number' && typeof section.headingDepth === 'number') {
    return section.headingDepth <= rootDepth;
  }

  // With incomplete source depth, a confirmed top-level heading still closes it.
  return section.headingDepth === 1;
}

export function fullPrefaceReading(sections: readonly RebuildSection[]): PrefaceReading | null {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const start = ordered.findIndex((s) => /^preface$/i.test(s.heading?.trim() ?? ''));
  if (start < 0) return null;

  const root = ordered[start]!;
  const selected: RebuildSection[] = [root];
  let boundary: PrefaceReading['boundary'] = 'end-of-work';

  for (let i = start + 1; i < ordered.length; i++) {
    const candidate = ordered[i]!;
    if (isBoundary(candidate, root.headingDepth)) {
      boundary = 'next-major-section';
      break;
    }
    selected.push(candidate);
  }

  return {
    title: 'Preface',
    sections: selected,
    sourceSectionIds: selected.map((s) => s.draftSectionId),
    wordCount: selected.reduce((total, s) => total + (s.body.match(/\S+/g)?.length ?? 0), 0),
    boundary,
  };
}
