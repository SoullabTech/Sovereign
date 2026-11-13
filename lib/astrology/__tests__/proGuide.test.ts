/** @jest-environment node */
import fs from 'fs';
import path from 'path';
import { PRO_CONTROLS, proGuideInstruction } from '../proGuide';
import { proAskSystemPrompt } from '../proAskMaiaSections';

const ROOT = path.resolve(__dirname, '../../..');
// The workstation and the shared astrology views it renders.
const UI_DIRS = ['app/astrology/pro-preview', 'components/astrology'];

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

describe('MAIA is told only about controls Astrology Pro actually has', () => {
  it.each(PRO_CONTROLS.map((c) => [c.label]))('"%s" appears in the Pro UI source', (label) => {
    expect(shown(label)).toBe(true);
  });

  it('the check can fail: an invented control is not found', () => {
    expect(shown('Predict my client\'s future')).toBe(false);
  });

  it('labels are unique, and every control says where it is and what it does', () => {
    expect(new Set(PRO_CONTROLS.map((c) => c.label)).size).toBe(PRO_CONTROLS.length);
    for (const c of PRO_CONTROLS) {
      expect(c.where.trim().length).toBeGreaterThan(0);
      expect(c.does.trim().length).toBeGreaterThan(0);
    }
  });

  it('covers all nine tools on the rail', () => {
    for (const tool of ['Chart', 'Timing', 'Relationships', 'Places', 'Traditions', 'Readings', 'Research', 'Study', 'Saved charts']) {
      expect(PRO_CONTROLS.some((c) => c.label === tool)).toBe(true);
    }
  });
});

describe('what MAIA is told', () => {
  const text = proGuideInstruction();

  it('names every control exactly as shown', () => {
    for (const c of PRO_CONTROLS) expect(text).toContain(`"${c.label}"`);
  });

  it('states her scope: astrology, the workstation, and its technical side', () => {
    expect(text).toContain('astrology (the chart in front of them, techniques, and the traditions)');
    expect(text).toContain('the workstation itself');
    expect(text).toContain('its technical side');
    expect(text).toContain('the main MAIA conversation is the place for the rest of life');
  });

  it('forbids inventing controls and acting for the astrologer', () => {
    expect(text).toContain('Only name controls from this list');
    expect(text).toContain('do not invent one or guess at a location');
    expect(text).toContain('You cannot press any control, save a chart, make a link or change a setting for them');
  });

  it('explains Free and Pro as rooms, not priced plans, and never as public', () => {
    expect(text).toContain('Free Astrology and Astrology Pro are two different rooms');
    expect(text).toContain('there are no prices or tiers to quote');
    expect(text).toContain('open at present to invited testers');
    expect(text).toContain('open by individual invitation');
    expect(text).toContain('never imply either is publicly available');
  });

  it('carries the declared calculation limits', () => {
    expect(text).toContain('not yet independently certified');
    expect(text).toContain('66° latitude');
  });

  it('client consent steps are stated where the controls are', () => {
    expect(text).toContain('permission to keep the birth details');
    expect(text).toContain('only after the astrologer ticks that the person agreed');
  });
});

describe('the Pro Ask prompt carries the guide', () => {
  it('in Ask and in Mentor', () => {
    for (const mode of ['ask', 'mentor'] as const) {
      const prompt = proAskSystemPrompt('natal', 'Sun Gemini 24.39°', { mode });
      expect(prompt).toContain('THE WORKSTATION YOU ARE IN');
      expect(prompt).toContain('"Saved charts"');
    }
  });
});
