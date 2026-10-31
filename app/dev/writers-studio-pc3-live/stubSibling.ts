import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

/**
 * A short section that shares its name with a much longer one is very likely the notes, works-cited or summary that
 * follows a chapter, not the chapter. If the author selected the short one and asks MAIA to "stay with this chapter",
 * MAIA is handed a few hundred characters. This finds that case so the author can be ASKED which one she means.
 * It never chooses for her and never reads the text for meaning: only the heading and the length.
 */
export interface StubSibling {
  selected: { id: string; label: string; words: number };
  longer: { id: string; label: string; words: number };
}

const norm = (value: string | null | undefined) => (value ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const wordsOf = (body: string) => body.trim().split(/\s+/).filter(Boolean).length;
const labelOf = (section: RebuildSection) => section.heading?.trim() || `Section ${section.position + 1}`;

export const STUB_MAX_WORDS = 600;      // roughly three and a half thousand characters
export const SIBLING_MIN_WORDS = 1500;  // a real chapter-sized section
export const SIBLING_MIN_RATIO = 5;     // and at least five times the length

export function findLongerSibling(sections: readonly RebuildSection[], selectedId: string | null): StubSibling | null {
  if (!selectedId) return null;
  const selected = sections.find((section) => section.draftSectionId === selectedId);
  const name = norm(selected?.heading);
  if (!selected || !name) return null;
  const selectedWords = wordsOf(selected.body);
  if (selectedWords >= STUB_MAX_WORDS) return null;
  let best: { section: RebuildSection; words: number } | null = null;
  for (const section of sections) {
    if (section.draftSectionId === selected.draftSectionId || norm(section.heading) !== name) continue;
    const words = wordsOf(section.body);
    if (words >= SIBLING_MIN_WORDS && words >= selectedWords * SIBLING_MIN_RATIO && (!best || words > best.words)) {
      best = { section, words };
    }
  }
  if (!best) return null;
  return {
    selected: { id: selected.draftSectionId, label: labelOf(selected), words: selectedWords },
    longer: { id: best.section.draftSectionId, label: labelOf(best.section), words: best.words },
  };
}

/** "about 90 words", "about 12,000 words": rounded so it reads as an estimate, because it is one. */
export function aboutWords(words: number): string {
  const step = words >= 1000 ? 500 : words >= 100 ? 50 : 10;
  return `about ${(Math.max(step, Math.round(words / step) * step)).toLocaleString('en-US')} words`;
}
