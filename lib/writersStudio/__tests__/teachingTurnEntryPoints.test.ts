import fs from 'node:fs';
import path from 'node:path';
import {
  ATTUNEMENT_DIRECTIVE,
  DEPTH_DIRECTIVE,
  EPISTEMIC_INTEGRITY_DIRECTIVE,
  LEARNING_TEACHING_PRECEDENCE,
  STYLE_RESPONSIVE_DIRECTIVE,
  editorialDirective,
  type EditorialDepth,
} from '../editorialDepth';
import { EDITORIAL_INTELLIGENCE_DIRECTIVE } from '../editorialIntelligence';
import {
  TEACHING_TURN_SHAPE,
  continueTeachingPrompt,
  teachingTurnPrompt,
  type TeachingAnchor,
} from '../teachingTurn';

/**
 * SEMANTIC-FIELD-01 teaching plan (2026-11-01): every "Teach me" builds its
 * message in lib/writersStudio/teachingTurn.ts, so no entry point can ask MAIA
 * for the whole lesson at once.
 */

const ROOT = process.cwd();
const SCAN_DIRS = ['app/dev/writers-studio-pc3-live', 'app/writers-studio', 'lib/writersStudio'];
const MODULE = path.join('lib', 'writersStudio', 'teachingTurn.ts');

/** A composed teaching instruction: a string literal opening the way teaching
 *  requests open, and longer than a button or display label. */
const BESPOKE_TEACH = /(['"`])(Teach me|What writing technique|Explain the craft)[^'"`]{50,}\1/g;

export function bespokeTeachingInstructions(source: string): string[] {
  return source.match(BESPOKE_TEACH) ?? [];
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      out.push(...sourceFiles(rel));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('every Teach me goes through the shared teaching turn', () => {
  it('no Studio source composes its own Teach me instruction', () => {
    const offenders: string[] = [];
    for (const dir of SCAN_DIRS) {
      for (const file of sourceFiles(dir)) {
        if (file === MODULE) continue;
        for (const hit of bespokeTeachingInstructions(read(file))) offenders.push(`${file}: ${hit.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('defeat candidate: the guard catches a restored bespoke prompt', () => {
    const before = "props.onSendEditorial('Teach me what is happening in this passage as writing. Use my own words as the example.');";
    expect(bespokeTeachingInstructions(before)).toHaveLength(1);
    const rebuildBefore = 'const ask = `What writing technique is at work in changing ${it}? Describe what it does for a reader, what it may cost.`;';
    expect(bespokeTeachingInstructions(rebuildBefore)).toHaveLength(1);
    expect(bespokeTeachingInstructions("<b>Teach me</b> displayText: 'Teach me what is happening here.'")).toEqual([]);
  });

  it('each known entry point calls the module', () => {
    const calls: Array<[string, string]> = [
      ['app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx', "teachingTurnPrompt('passage')"],
      ['app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx', "teachingTurnPrompt('direction')"],
      ['app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx', 'continueTeachingPrompt()'],
      ['app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx', "teachingTurnPrompt('passage')"],
      ['app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx', 'teachingTurnPrompt(\n      \'change\''],
      ['app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx', "teachingTurnPrompt('passage')"],
      ['app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx', "teachingTurnPrompt('change', subject)"],
      ['app/dev/writers-studio-pc3-live/ObservationManuscriptLayer.tsx', "teachingTurnPrompt('observation')"],
      ['app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx', "teachingTurnPrompt('observation')"],
      ['app/writers-studio/insight/RevisionDesk.tsx', "['Help me understand', teachingTurnPrompt('observation')]"],
      ['app/writers-studio/insight/RevisionDesk.tsx', "['Explain the craft', teachingTurnPrompt('change'"],
      ['app/writers-studio/rebuild/RebuildStudioClient.tsx', "teachingTurnPrompt('change', `changing ${it}`)"],
    ];
    for (const [file, call] of calls) expect(read(file)).toContain(call);
    expect(read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx').split("teachingTurnPrompt('observation')")).toHaveLength(3);
  });
});

describe('the teaching turn is one idea and a question the writer steers by', () => {
  const ANCHORS: TeachingAnchor[] = ['passage', 'observation', 'change', 'direction'];
  const prompts = [...ANCHORS.map((a) => teachingTurnPrompt(a, a === 'change' ? 'changing "a" to "b"' : undefined)), continueTeachingPrompt()];

  it('carries the whole shape on every turn', () => {
    for (const p of prompts) for (const line of TEACHING_TURN_SHAPE) expect(p).toContain(line);
  });

  it('asks for one idea and one closing question, and never for the full lesson', () => {
    for (const p of prompts) {
      expect(p).toContain('one idea');
      expect(p).toContain('End with one short question');
      expect(p).not.toMatch(/what (the move|it) may cost|professional terminology second|then professional terminology/i);
    }
  });

  it('names no level, skill or competence of the writer (L6c)', () => {
    for (const text of [...prompts, LEARNING_TEACHING_PRECEDENCE]) {
      expect(text).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill(ed)?|competen\w*|experienced)\b/i);
    }
  });

  it('keeps the change subject when one is given', () => {
    expect(teachingTurnPrompt('change', 'changing "rain" to "storm"')).toContain('changing "rain" to "storm"');
  });
});

describe('Learning teaching governs length; Guided and Direct are unchanged', () => {
  const before = (d: EditorialDepth) => [
    DEPTH_DIRECTIVE[d],
    STYLE_RESPONSIVE_DIRECTIVE,
    ATTUNEMENT_DIRECTIVE,
    EDITORIAL_INTELLIGENCE_DIRECTIVE,
    EPISTEMIC_INTEGRITY_DIRECTIVE,
  ].join(' ');

  it('places the teaching precedence last, for Learning only', () => {
    expect(editorialDirective('learning')).toBe(`${before('learning')} ${LEARNING_TEACHING_PRECEDENCE}`);
    expect(editorialDirective('learning').endsWith(LEARNING_TEACHING_PRECEDENCE)).toBe(true);
  });

  it('leaves Guided and Direct byte-identical', () => {
    expect(editorialDirective('guided')).toBe(before('guided'));
    expect(editorialDirective('direct')).toBe(before('direct'));
  });
});
