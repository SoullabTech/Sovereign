import fs from 'node:fs';
import path from 'node:path';

const writing = fs.readFileSync(
  path.resolve(process.cwd(), 'components/journal/room/WritingSurface.tsx'),
  'utf8',
);
const reader = fs.readFileSync(
  path.resolve(process.cwd(), 'components/journal/room/EntryReader.tsx'),
  'utf8',
);
const route = fs.readFileSync(
  path.resolve(process.cwd(), 'app/api/journal/quick/list/route.ts'),
  'utf8',
);
const material = fs.readFileSync(
  path.resolve(process.cwd(), 'app/journal/journal-sanctum.module.css'),
  'utf8',
);

describe('Journal lived-context conventions', () => {
  it('places Day / Dream in the lived header before the writing surface', () => {
    const typeGroup = writing.indexOf('aria-label="Journal entry type"');
    const textarea = writing.indexOf('<textarea');
    expect(typeGroup).toBeGreaterThan(0);
    expect(typeGroup).toBeLessThan(textarea);
    expect(writing).toContain("(['day', 'dream'] as const)");
    expect(writing).toContain('aria-pressed={entryType === t}');
  });

  it('allows a member-authored place but never requests device location', () => {
    expect(writing).toContain('Add a place');
    expect(writing).toContain('placeholder="Home, the garden, New Haven…"');
    expect(writing).toContain("place.trim().slice(0, 120)");
    expect(writing).not.toMatch(/navigator\.geolocation|getCurrentPosition|latitude|longitude/);
  });

  it('preserves a real MAIA-origin question as provenance rather than member text', () => {
    expect(writing).toContain('Written from a question with MAIA');
    expect(writing).toContain('fromQuestion.slice(0, 500)');
    expect(reader).toContain('Written from a question with MAIA');
    expect(route).toContain('fromQuestion?: string');
  });

  it('keeps Dream writing-first and hands the exact kept identity to the Dream room', () => {
    expect(reader).toContain('Explore this dream →');
    expect(reader).toContain('/dream?dream=');
    expect(reader).toContain('&from=journal');
    expect(writing).not.toContain('Interpret this dream');
    expect(writing).not.toContain('dream symbols');
  });

  it('uses one central crease rather than the old three-tone double gutter', () => {
    expect(material).toContain('left: 50%;');
    expect(material).toContain('width: 1px;');
    expect(material).not.toContain('49.55%');
    expect(material).not.toContain('50.45%');
  });

  it('keeps the enchanted register ambient and reduced-motion safe', () => {
    expect(material).toContain('journalWatermarkBreath');
    expect(material).toContain('@media (prefers-reduced-motion: reduce)');
    expect(material).toContain('animation: none !important');
  });
});
