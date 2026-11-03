/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { STUDIO_CONTROLS, studioGuideInstruction } from '../studioGuide';

const ROOT = path.resolve(__dirname, '../../..');
const UI_DIRS = ['app/dev/writers-studio-pc3-live', 'app/dev/writers-studio-p4r1', 'app/writers-studio'];

function uiSource(): string {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== '__tests__') walk(full); continue; }
      if (/\.tsx?$/.test(entry.name)) out.push(fs.readFileSync(full, 'utf8'));
    }
  };
  for (const d of UI_DIRS) walk(path.join(ROOT, d));
  return out.join('\n');
}

const UI = uiSource();
const shown = (label: string) => UI.includes(label);

describe('MAIA is told only about controls the Studio actually has (founder ruling 2026-11-02, Design 1A)', () => {
  it.each(STUDIO_CONTROLS.map((c) => [c.label]))('"%s" appears in the Studio UI', (label) => {
    expect(shown(label)).toBe(true);
  });

  it('the check can fail: an invented control is not found', () => {
    expect(shown('Rewrite my whole chapter for me')).toBe(false);
  });

  it('labels are unique, and every control says where it is and what it does', () => {
    expect(new Set(STUDIO_CONTROLS.map((c) => c.label)).size).toBe(STUDIO_CONTROLS.length);
    for (const c of STUDIO_CONTROLS) {
      expect(c.where.trim().length).toBeGreaterThan(0);
      expect(c.does.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('what MAIA is told', () => {
  const text = studioGuideInstruction();

  it('names every control exactly as shown', () => {
    for (const c of STUDIO_CONTROLS) expect(text).toContain(`"${c.label}"`);
  });

  it('forbids inventing controls and doing things for the writer', () => {
    expect(text).toContain('Only name controls from this list');
    expect(text).toContain('do not invent one or guess at a location');
    expect(text).toContain('You cannot press any control for them');
  });

  it('points to the Studio’s own reading instead of asking the writer to paste text', () => {
    expect(text).toContain('rather than asking them to paste text that is already in the Studio');
  });

  it('says nothing about the writer’s level', () => {
    expect(text).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill|competen\w*|experienced)\b/i);
  });
});

describe('every Studio conversation path is given the guide', () => {
  const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  it.each([
    ['Passage Focus / editorial turns', 'lib/manuscript/editorialRuntime/turn.ts'],
    ['Work conversation', 'lib/manuscript/ask/askReader.ts'],
    ['Develop observation dialogue', 'lib/manuscript/ask/developmentalAskReader.ts'],
  ])('%s', (_name, file) => {
    const src = read(file);
    expect(src).toContain("from '@/lib/writersStudio/studioGuide'");
    expect(src).toContain('studioGuideInstruction()');
  });
});
