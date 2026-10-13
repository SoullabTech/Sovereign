import {
  LEGACY_EIGHT_CHAPTER_REVIEW_LENSES, isCompleteChapterReviewAccounting,
} from '../chapterReviewCompatibility';
import { REVIEW_DEVELOPMENTAL_LENSES } from '@/lib/writersStudio/studio/wholeReview';

describe('WS-BETA-R2 old/new chapter-review accounting', () => {
  const matches = (items: readonly string[]) =>
    isCompleteChapterReviewAccounting(new Set(items), REVIEW_DEVELOPMENTAL_LENSES);

  it('keeps the new seven-lens Review valid without Themes or Overview', () => {
    expect(REVIEW_DEVELOPMENTAL_LENSES).toHaveLength(7);
    expect(matches(REVIEW_DEVELOPMENTAL_LENSES)).toBe(true);
  });
  it('accepts exactly the legacy eight-lens manifest without rewriting its Themes provenance', () => {
    expect(LEGACY_EIGHT_CHAPTER_REVIEW_LENSES).toHaveLength(8);
    expect(matches(LEGACY_EIGHT_CHAPTER_REVIEW_LENSES)).toBe(true);
  });
  it('refuses incomplete or mixed Review sets, even when Overview fills the count', () => {
    expect(matches(REVIEW_DEVELOPMENTAL_LENSES.slice(1))).toBe(false);
    expect(matches([...REVIEW_DEVELOPMENTAL_LENSES, 'overview'])).toBe(false);
    expect(matches([...REVIEW_DEVELOPMENTAL_LENSES, 'themes', 'overview'])).toBe(false);
    expect(matches([...LEGACY_EIGHT_CHAPTER_REVIEW_LENSES, 'overview'])).toBe(false);
    expect(matches(LEGACY_EIGHT_CHAPTER_REVIEW_LENSES.filter(l => l !== 'themes'))).toBe(true);
  });
  it('refuses a seven-lens set with a substituted Themes lens', () => {
    const substituted = [...REVIEW_DEVELOPMENTAL_LENSES.slice(1), 'themes'];
    expect(matches(substituted)).toBe(false);
  });
});
