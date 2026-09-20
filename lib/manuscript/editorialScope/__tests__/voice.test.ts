/**
 * WS-EDITORIAL-SCOPE-01 · VOICE FALSIFIERS.
 *
 * ⭐ V1 is the case the size law cannot see: nine words for nine, every bound
 * satisfied, and not the writer's book.
 */

import {
  UNFAMILIAR_BOUND, measureVoiceIntrusion, vocabulary, voiceNote,
} from '../voice';
import { judgeProposalScope } from '../contract';

const AUTHOR_SECTION =
  'Fire appears through energy, vision, imagination, inspiration, and the illuminating '
  + 'sense of what might be possible. Water moves through feeling, emotion, memory, '
  + 'intuition, and the depths of our inner experience.';

const PASSAGE = 'Fire appears through energy, vision, imagination.';

describe('WS-EDITORIAL-SCOPE-01 · voice', () => {
  it('V1 · ⭐⭐ a size-lawful proposal in someone else\'s vocabulary is VISIBLE', () => {
    const slop = 'Fire discloses itself as a phenomenological register.';
    /* It is not caught by size — that is the point. */
    const size = judgeProposalScope(PASSAGE, slop, { latitude: 4, mayRemoveParagraphs: false });
    expect(size.ok).toBe(true);

    const v = measureVoiceIntrusion(AUTHOR_SECTION, PASSAGE, slop);
    expect(v.unfamiliar).toContain('phenomenological');
    expect(v.unfamiliar).toContain('discloses');
    expect(v.unfamiliar).toContain('register');
  });

  it('V2 · ⛔ the writer\'s OWN words are never reported as intrusions', () => {
    /* Words drawn from elsewhere in their own section. */
    const theirs = 'Fire appears through energy, vision, imagination, and inspiration.';
    expect(measureVoiceIntrusion(AUTHOR_SECTION, PASSAGE, theirs).unfamiliar).toEqual([]);
  });

  it('V3 · ⛔ rearranging the passage\'s own words introduces nothing', () => {
    const shuffled = 'Through energy, vision, imagination, Fire appears.';
    expect(measureVoiceIntrusion('', PASSAGE, shuffled).unfamiliar).toEqual([]);
  });

  it('V4 · an unchanged proposal introduces nothing', () => {
    const v = measureVoiceIntrusion(AUTHOR_SECTION, PASSAGE, PASSAGE);
    expect(v.addedWords).toBe(0);
    expect(v.unfamiliar).toEqual([]);
  });

  it('V5 · ⭐ case and edge punctuation do not make a stranger of a known word', () => {
    const v = measureVoiceIntrusion('Imagination matters.', PASSAGE,
      'Fire appears through energy, vision, Imagination!');
    expect(v.unfamiliar).toEqual([]);
  });

  it('V6 · ⛔ NO STEMMING — spiral and spiralling stay distinct', () => {
    const v = measureVoiceIntrusion('The spiral returns.', 'The spiral returns.',
      'The spiralling returns.');
    expect(v.unfamiliar).toEqual(['spiralling']);
  });

  it('V7 · distinct words, in first-appearance order, no duplicates', () => {
    const v = measureVoiceIntrusion('', 'a', 'a zeta alpha zeta alpha');
    expect(v.unfamiliar).toEqual(['zeta', 'alpha']);
  });

  it('V8 · ⭐ the note states a fact and asks a question — never a verdict', () => {
    const note = voiceNote(measureVoiceIntrusion(
      AUTHOR_SECTION, PASSAGE, 'Fire discloses itself as a phenomenological register.'))!;
    expect(note).toMatch(/haven't used nearby/);
    expect(note).toMatch(/are they yours\?/);
    /* ⛔ It must never grade the writer or the suggestion. */
    expect(note).not.toMatch(/better|worse|weak|strong|improve|should/i);
  });

  it('V9 · ⛔ no note when there is nothing to say', () => {
    expect(voiceNote(measureVoiceIntrusion(AUTHOR_SECTION, PASSAGE, PASSAGE))).toBeNull();
  });

  it('V10 · the note names at most eight words, then counts the rest', () => {
    const many = Array.from({ length: 12 }, (_, i) => `neologism${i}`).join(' ');
    const note = voiceNote(measureVoiceIntrusion('', 'x', `x ${many}`))!;
    expect(note).toMatch(/12 words/);
    expect(note).toMatch(/and 4 more/);
    expect(note).not.toContain('neologism8');
  });

  it('V11 · ⛔ latitude 1 is NOT zero — word choice is what Touch is for', () => {
    expect(UNFAMILIAR_BOUND[1]).toBeGreaterThan(0);
    const v = measureVoiceIntrusion(AUTHOR_SECTION, 'He was fixated.', 'He was steady.');
    expect(v.unfamiliar).toEqual(['steady']);
    expect(v.unfamiliar.length).toBeLessThan(UNFAMILIAR_BOUND[1] + 1);
  });

  it('V12 · the bounds ascend and never invert', () => {
    for (const l of [1, 2, 3, 4] as const) {
      expect(UNFAMILIAR_BOUND[(l + 1) as 2 | 3 | 4 | 5])
        .toBeGreaterThanOrEqual(UNFAMILIAR_BOUND[l]);
    }
  });

  it('V13 · ⛔ there is no stoplist — the sample supplies the common words', () => {
    /* With an empty sample "the" is genuinely unseen, and that is honest: the
       alternative is a curated list of words that do not count, in one
       language, which Invariant 14 forbids. */
    expect(measureVoiceIntrusion('', 'cat', 'cat and the dog').unfamiliar)
      .toEqual(['and', 'the', 'dog']);
  });

  it('V14 · sampleWords reports how much the comparison could see', () => {
    expect(measureVoiceIntrusion(AUTHOR_SECTION, PASSAGE, PASSAGE).sampleWords)
      .toBeGreaterThan(20);
    expect(measureVoiceIntrusion('', 'a', 'a').sampleWords).toBe(1);
  });

  it('V15 · vocabulary keeps internal apostrophes and hyphens', () => {
    expect(vocabulary("don't hard-won it's")).toEqual(["don't", 'hard-won', "it's"]);
  });
});
