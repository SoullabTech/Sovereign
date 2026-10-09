import { describe, expect, it } from 'vitest';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { fullPrefaceReading } from '../fullPrefaceReading';

const row = (
  position: number, heading: string, depth: number | null, body: string,
): RebuildSection => ({
  draftSectionId: 'sec-' + position,
  sourceSectionId: 'source-' + position,
  position,
  heading,
  headingDepth: depth,
  headingSignal: 'explicit',
  body,
  editable: true,
});

describe('Listen · complete Preface projection', () => {
  const rows: RebuildSection[] = [
    row(7, 'Preface', 1, 'Zhuangzi butterfly epigraph'),
    row(8, 'A Vivid Dream and a New Understanding', 2, 'Dream and forest.'),
    row(9, 'Reflection and Interaction', 2, 'Reflections without rewriting.'),
    row(10, 'Call to Adventure', 2, 'Reader invitation.'),
    row(11, 'Introduction', 1, 'This belongs to a different part.'),
    row(12, 'The Nature of Transformation', 2, 'Do not include.'),
    row(13, 'Chapter 1: The Journey Begins', 1, 'Never join.'),
  ];

  it('includes the Preface and its sub-sections in source order, without Introduction', () => {
    const result = fullPrefaceReading([...rows].reverse());
    expect(result?.sections.map(s => s.heading)).toEqual([
      'Preface', 'A Vivid Dream and a New Understanding',
      'Reflection and Interaction', 'Call to Adventure',
    ]);
    expect(result?.sourceSectionIds).toEqual(['sec-7', 'sec-8', 'sec-9', 'sec-10']);
    expect(result?.wordCount).toBe(11);
    expect(result?.boundary).toBe('next-major-section');
  });

  it('protects original heading and body fields, with no structural mutation', () => {
    const before = JSON.stringify(rows);
    const result = fullPrefaceReading(rows);
    expect(JSON.stringify(rows)).toBe(before);
    expect(result?.sections[0]).toBe(rows[0]);
    expect(result?.sections[1]?.body).toBe('Dream and forest.');
  });

  it('stops at explicit major headings even if hierarchy depth is missing', () => {
    const flat = [
      row(0, 'Preface', null, 'Author note.'),
      row(1, 'A Vivid Dream and a New Understanding', null, 'The full story.'),
      row(2, 'Part One — The Ground', null, 'Do not include.'),
      row(3, 'Chapter 1: The Journey Begins', null, 'Do not include.'),
    ];
    const result = fullPrefaceReading(flat);
    expect(result?.sections.map(s => s.position)).toEqual([0, 1]);
    expect(result?.boundary).toBe('next-major-section');
  });

  it('does not cross siblings or ancestor headings', () => {
    const result = fullPrefaceReading([
      row(0, 'Preface', 2, 'Text.'),
      row(1, 'Subheading', 3, 'Text.'),
      row(2, 'Other section', 2, 'Not the preface.'),
    ]);
    expect(result?.sourceSectionIds).toEqual(['sec-0', 'sec-1']);
  });

  it('refuses to invent a Preface when the manuscript has none', () => {
    expect(fullPrefaceReading([row(0, 'Chapter 1', 1, 'Text')])).toBeNull();
  });
});
