import fs from 'node:fs';
import path from 'node:path';
import {
  CONVENTION_STANCE_DIRECTIVE,
  DEPTH_DIRECTIVE,
  EDITING_NAMES_DIRECTIVE,
  EDITORIAL_LEVELS_DIRECTIVE,
  EPISTEMIC_INTEGRITY_DIRECTIVE,
  WRITER_ATTENTION_DIRECTIVE,
  editorialDirective,
  type EditorialDepth,
} from '../editorialDepth';
import { EDITORIAL_INTELLIGENCE_DIRECTIVE } from '../editorialIntelligence';

/**
 * WS-CRAFT-CONVENTIONS-01 · founder rulings 1 and 2 (2026-11-09).
 * The convention stance text was approved verbatim; these guards keep it verbatim and make
 * sure it reaches every depth. ⛔ They prove the instruction is sent, not that MAIA follows
 * it: that is the witness. "Describes, not prescribes" stays a human judgement.
 */

const DEPTHS: EditorialDepth[] = ['guided', 'learning', 'direct'];
const RECORD = 'docs/programme/WS-CRAFT-CONVENTIONS-01_CENSUS_AND_PROPOSAL_2026-11-09.md';

/** The seven numbered rules exactly as quoted in the approved record (§4.2a). */
function approvedRules(): string[] {
  const doc = fs.readFileSync(path.join(process.cwd(), RECORD), 'utf8');
  const start = doc.indexOf('### 4.2a');
  const block = doc.slice(start, doc.indexOf('Choices made in drafting', start));
  const quoted = block.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join('\n');
  return quoted.split(/\n(?=\d\. )/).map((r) => r.replace(/^\d\.\s+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
}

export function carriesConventionStance(directive: string): boolean {
  return directive.includes(CONVENTION_STANCE_DIRECTIVE);
}

describe('MAIA holds conventions as knowledge, never as a measure', () => {
  it('is word for word the text the founder approved', () => {
    const rules = approvedRules();
    expect(rules).toHaveLength(7);
    expect(CONVENTION_STANCE_DIRECTIVE).toBe(rules.join(' '));
  });

  it('reaches every depth, after the editorial stance and before epistemic integrity', () => {
    for (const d of DEPTHS) {
      const composed = editorialDirective(d);
      expect(carriesConventionStance(composed)).toBe(true);
      const at = composed.indexOf(CONVENTION_STANCE_DIRECTIVE);
      expect(composed.indexOf(EDITORIAL_INTELLIGENCE_DIRECTIVE)).toBeLessThan(at);
      expect(composed.indexOf(EPISTEMIC_INTEGRITY_DIRECTIVE)).toBeGreaterThan(at);
    }
  });

  it('leaves the depth texts themselves untouched', () => {
    for (const d of DEPTHS) expect(DEPTH_DIRECTIVE[d]).not.toMatch(/convention/i);
  });

  it('reaches both MAIA paths: Write/Focus turns and the Develop ask reader', () => {
    const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain("editorialDirective(input.responseDepth ?? 'guided')");
    expect(read('lib/manuscript/ask/developmentalAskReader.ts')).toContain("editorialDirective('guided')");
  });

  it('names no level or skill of the writer and ranks nothing', () => {
    expect(CONVENTION_STANCE_DIRECTIVE).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill(ed)?|competen\w*|best|better|worse|priority)\b/i);
  });

  it('defeat candidate: the guard fails on the composition as it was before', () => {
    const before = editorialDirective('guided').replace(` ${CONVENTION_STANCE_DIRECTIVE}`, '');
    expect(carriesConventionStance(before)).toBe(false);
  });
});

/** Ruling 8, exactly as recorded in proposal §6b. */
function ruling8Text(): string {
  const doc = fs.readFileSync(path.join(process.cwd(), RECORD), 'utf8');
  const start = doc.indexOf('**Directive text** (`WRITER_ATTENTION_DIRECTIVE`');
  const block = doc.slice(start, doc.indexOf('**One limit, stated.**', start));
  return block.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join(' ').replace(/\s+/g, ' ').trim();
}

describe('Ruling 8 · MAIA follows the writer\'s attention', () => {
  it('is word for word the recorded ruling', () => {
    expect(WRITER_ATTENTION_DIRECTIVE).toBe(ruling8Text());
  });

  it('sits beside the seven rules without changing them', () => {
    expect(CONVENTION_STANCE_DIRECTIVE).not.toContain(WRITER_ATTENTION_DIRECTIVE);
    expect(CONVENTION_STANCE_DIRECTIVE).toBe(approvedRules().join(' '));
  });

  it('reaches every depth, directly after the seven rules', () => {
    for (const d of DEPTHS) {
      expect(editorialDirective(d)).toContain(`${CONVENTION_STANCE_DIRECTIVE} ${WRITER_ATTENTION_DIRECTIVE} ${EPISTEMIC_INTEGRITY_DIRECTIVE}`);
    }
  });

  it('names no level and ranks nothing', () => {
    expect(WRITER_ATTENTION_DIRECTIVE).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill(ed)?|competen\w*|best|better|worse|priority)\b/i);
  });

  it('defeat candidate: the composition without it fails', () => {
    const without = editorialDirective('guided').replace(` ${WRITER_ATTENTION_DIRECTIVE}`, '');
    expect(without.includes(WRITER_ATTENTION_DIRECTIVE)).toBe(false);
  });
});

/** The editorial levels (design §5a, wording approved 2026-11-09). */
const DESIGN = 'docs/programme/WS-CRAFT-CONVENTIONS-01_CONVERSATIONAL_EDITORIAL_PROCESS_2026-11-09.md';
function levelsText(): string {
  const doc = fs.readFileSync(path.join(process.cwd(), DESIGN), 'utf8');
  const start = doc.indexOf('### 5a.');
  const block = doc.slice(start, doc.indexOf('Why each sentence:', start));
  return block.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join(' ').replace(/\s+/g, ' ').trim();
}

describe('The editorial levels directive', () => {
  it('is word for word the approved §5a text', () => {
    expect(EDITORIAL_LEVELS_DIRECTIVE).toBe(levelsText());
  });

  it('reaches every depth, after the editorial stance and before the convention rules', () => {
    for (const d of DEPTHS) {
      expect(editorialDirective(d)).toContain(`${EDITORIAL_INTELLIGENCE_DIRECTIVE} ${EDITORIAL_LEVELS_DIRECTIVE} ${EDITING_NAMES_DIRECTIVE} ${CONVENTION_STANCE_DIRECTIVE}`);
    }
  });

  it('reaches the Work conversation unchanged', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/manuscript/ask/askReader.ts'), 'utf8');
    expect(src).toContain('export const WORK_LEVELS_RULES = `${EDITORIAL_LEVELS_DIRECTIVE} ${EDITING_NAMES_DIRECTIVE}`;');
    expect(src).toContain("WORK_STANDING, '', WORK_LEVELS_RULES,");
  });

  it('ranks nothing and names no level of the writer', () => {
    expect(EDITORIAL_LEVELS_DIRECTIVE).not.toMatch(/\b(beginner|novice|advanced|expert|skill(ed)?|competen\w*|best|better|worse|priority)\b/i);
    // "should" appears only inside the prohibition "never as what I should do next".
    expect(EDITORIAL_LEVELS_DIRECTIVE.match(/\bshould\b/g) ?? []).toHaveLength(1);
  });

  it('defeat candidate: the composition without it fails', () => {
    const without = editorialDirective('guided').replace(` ${EDITORIAL_LEVELS_DIRECTIVE}`, '');
    expect(without.includes(EDITORIAL_LEVELS_DIRECTIVE)).toBe(false);
  });
});

describe('Ruling 3 · professional names on request and at Direct', () => {
  it('reaches every depth and the Work conversation', () => {
    for (const d of DEPTHS) expect(editorialDirective(d)).toContain(EDITING_NAMES_DIRECTIVE);
  });
  it('keeps plain names by default and maps each band', () => {
    expect(EDITING_NAMES_DIRECTIVE).toContain('Use those plain names unless I ask');
    for (const band of ['Touch', 'Line', 'Passage', 'Shape', 'Open']) expect(EDITING_NAMES_DIRECTIVE).toContain(band);
    expect(EDITING_NAMES_DIRECTIVE).toMatch(/used differently by different publishers/);
  });
  it('names no level of the writer', () => {
    expect(EDITING_NAMES_DIRECTIVE).not.toMatch(/\b(beginner|novice|advanced|expert|skill(ed)?)\b/i);
  });
});
