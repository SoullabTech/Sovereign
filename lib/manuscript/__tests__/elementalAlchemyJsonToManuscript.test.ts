/**
 * Smoke tests — elementalAlchemyJsonToManuscript
 *
 * Phase 1, Step 1 verification. Confirms the adapter:
 *   - lifts top-level book metadata
 *   - emits image-placeholder blocks for ![][imageN] markers in keyTeachings
 *   - parses italic + em-dash epigraphs into quote blocks
 *   - defaults remaining paragraphs to text blocks
 *   - preserves chapter fields (number, title, element, keyTeachings)
 *   - ignores non-string front matter (object-shaped preface)
 *
 * Pure / inline fixtures only — no JSON file load, no I/O.
 */

import { describe, it, expect } from '@jest/globals';

import { elementalAlchemyJsonToManuscript } from '../adapters/elementalAlchemyJsonToManuscript';
import type { Block, ElementalAlchemyJsonShape } from '../types';

const FIXTURE: ElementalAlchemyJsonShape = {
  type: 'book',
  title: 'Test Book',
  author: 'Test Author',
  source: 'test_source',
  processed_at: '2026-01-01T00:00:00Z',
  content: {
    chapters: [
      {
        number: 1,
        title: 'Chapter 1: The Test Begins',
        element: 'fire',
        keyTeachings: ['![][image1]', 'A Teaching Title', '![][image2]'],
        content_excerpt:
          '*"Testing is the path of clarity." \u2013 A Wise Author*\n\nFirst paragraph of body text.\n\nSecond paragraph of body text.',
      },
    ],
  },
};

describe('elementalAlchemyJsonToManuscript', () => {
  it('lifts top-level book metadata', () => {
    const m = elementalAlchemyJsonToManuscript(FIXTURE);
    expect(m.title).toBe('Test Book');
    expect(m.author).toBe('Test Author');
    expect(m.type).toBe('book');
    expect(m.source).toBe('test_source');
    expect(m.processed_at).toBe('2026-01-01T00:00:00Z');
    expect(m.chapters).toHaveLength(1);
  });

  it('extracts image-placeholder blocks from keyTeachings', () => {
    const m = elementalAlchemyJsonToManuscript(FIXTURE);
    const blocks = m.chapters?.[0].blocks ?? [];
    const placeholders = blocks.filter(
      (b: Block): b is Extract<Block, { type: 'image-placeholder' }> =>
        b.type === 'image-placeholder',
    );
    expect(placeholders).toHaveLength(2);
    expect(placeholders.map((p) => p.ref)).toEqual(['image1', 'image2']);
  });

  it('parses italic + em-dash epigraph as a quote block', () => {
    const m = elementalAlchemyJsonToManuscript(FIXTURE);
    const blocks = m.chapters?.[0].blocks ?? [];
    const quotes = blocks.filter(
      (b: Block): b is Extract<Block, { type: 'quote' }> => b.type === 'quote',
    );
    expect(quotes).toHaveLength(1);
    expect(quotes[0].content).toBe('Testing is the path of clarity.');
    expect(quotes[0].attribution).toBe('A Wise Author');
  });

  it('defaults remaining paragraphs to text blocks', () => {
    const m = elementalAlchemyJsonToManuscript(FIXTURE);
    const blocks = m.chapters?.[0].blocks ?? [];
    const textBlocks = blocks.filter(
      (b: Block): b is Extract<Block, { type: 'text' }> => b.type === 'text',
    );
    expect(textBlocks).toHaveLength(2);
    expect(textBlocks[0].content).toBe('First paragraph of body text.');
    expect(textBlocks[1].content).toBe('Second paragraph of body text.');
  });

  it('preserves original chapter fields alongside the new blocks array', () => {
    const m = elementalAlchemyJsonToManuscript(FIXTURE);
    const ch = m.chapters?.[0];
    expect(ch?.number).toBe(1);
    expect(ch?.title).toBe('Chapter 1: The Test Begins');
    expect(ch?.element).toBe('fire');
    expect(ch?.keyTeachings).toEqual(['![][image1]', 'A Teaching Title', '![][image2]']);
    expect(ch?.content_excerpt).toContain('Testing is the path of clarity');
  });

  it('does not lift non-string front matter into Manuscript.preface', () => {
    // Mirrors the real elemental-alchemy-book.json shape, where
    // content.preface is an object — we must not promote that to
    // Manuscript.preface (which is typed as string | undefined).
    const withObjectPreface = {
      ...FIXTURE,
      content: {
        ...FIXTURE.content,
        preface: {
          dedication: 'For the seekers',
          coreTeachings: ['be honest', 'be present'],
        } as unknown as string, // shape-mismatch, intentionally cast for the test
      },
    } as ElementalAlchemyJsonShape;

    const m = elementalAlchemyJsonToManuscript(withObjectPreface);

    expect(m.preface).toBeUndefined();
    // It should be preserved on metadata.front_matter so it isn't lost.
    const front = (m.metadata?.front_matter as Record<string, unknown> | undefined) ?? {};
    expect(front.preface).toBeDefined();
  });

  it('handles empty chapters array safely', () => {
    const empty: ElementalAlchemyJsonShape = {
      ...FIXTURE,
      content: { chapters: [] },
    };
    const m = elementalAlchemyJsonToManuscript(empty);
    expect(m.chapters).toEqual([]);
  });
});
