import fs from 'node:fs';
import path from 'node:path';
import {
  ATTUNEMENT_DIRECTIVE,
  CONVENTION_STANCE_DIRECTIVE,
  DEPTH_DIRECTIVE,
  WRITER_ATTENTION_DIRECTIVE,
  EPISTEMIC_INTEGRITY_DIRECTIVE,
  LEARNING_TEACHING_PRECEDENCE,
  STYLE_RESPONSIVE_DIRECTIVE,
  editorialDirective,
  type EditorialDepth,
} from '../editorialDepth';
import { EDITORIAL_INTELLIGENCE_DIRECTIVE } from '../editorialIntelligence';
import {
  TEACHING_ANCHORS,
  TEACHING_TURN_SHAPE,
  isTeachingAnchor,
  teachingQuestion,
  teachingTurnInstruction,
} from '../teachingTurn';
import { CONVERSATION_TURN_SHAPE } from '../conversationTurn';

/**
 * SEMANTIC-FIELD-01 teaching plan (2026-11-01) and the F1 ruling (founder,
 * 2026-11-02): every "Teach me" sends only the button's words as the writer's
 * turn. How MAIA answers is server-owned and travels as a closed anchor.
 */

const ROOT = process.cwd();
const CLIENT_DIRS = ['app/dev/writers-studio-pc3-live', 'app/writers-studio'];
const SCAN_DIRS = [...CLIENT_DIRS, 'lib/writersStudio'];
const MODULE = path.join('lib', 'writersStudio', 'teachingTurn.ts');

/** A composed teaching instruction: a string literal opening the way teaching
 *  requests open, and longer than a button or display label. */
const BESPOKE_TEACH = /(['"`])(Teach me|What writing technique|Explain the craft)[^'"`]{50,}\1/g;

export function bespokeTeachingInstructions(source: string): string[] {
  return source.match(BESPOKE_TEACH) ?? [];
}

/** Lines only a teaching turn uses. "Do not propose replacement wording…" is
 *  shared with non-teaching prompts (Discuss and others), which F1 leaves as
 *  they are, so it is not a teaching signal. */
const TEACHING_ONLY: readonly string[] = [
  ...TEACHING_TURN_SHAPE.filter((line) => !line.startsWith('Do not propose replacement wording')),
  'as a conversation rather than a lesson',
];

/** Any teaching-only line found in a client source: the instruction leaking
 *  back into what the writer's turn carries. */
export function teachingShapeInClient(source: string): string[] {
  return TEACHING_ONLY.filter((line) => source.includes(line));
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

describe('every Teach me sends only the button’s words (F1)', () => {
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

  it('no client source carries a teaching-shape line', () => {
    const offenders: string[] = [];
    for (const dir of CLIENT_DIRS) {
      for (const file of sourceFiles(dir)) {
        for (const hit of teachingShapeInClient(read(file))) offenders.push(`${file}: ${hit.slice(0, 60)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('defeat candidates: the guards catch a restored composed prompt', () => {
    const before = "props.onSendEditorial('Teach me what is happening in this passage as writing. Use my own words as the example.');";
    expect(bespokeTeachingInstructions(before)).toHaveLength(1);
    const rebuildBefore = 'const ask = `What writing technique is at work in changing ${it}? Describe what it does for a reader, what it may cost.`;';
    expect(bespokeTeachingInstructions(rebuildBefore)).toHaveLength(1);
    expect(bespokeTeachingInstructions("<b>Teach me</b> displayText: 'Teach me what is happening here.'")).toEqual([]);
    const leaked = `props.onSend(['Teach me.', '${TEACHING_TURN_SHAPE[4]}'].join(' '));`;
    expect(teachingShapeInClient(leaked)).toHaveLength(1);
  });

  it('each known entry point sends a visible question and names its anchor', () => {
    const calls: Array<[string, string[]]> = [
      ['app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx', [
        "teachingQuestion('passage')", "teachingAnchor: 'passage'",
        "teachingQuestion('direction'), { teachingAnchor: 'direction' }",
        "teachingQuestion('continue'), 'learning', { proposalPolicy: 'reply_only', teachingAnchor: 'continue' }",
      ]],
      ['app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx', [
        // The passage menu now sends every act through one hold-or-send helper
        // (2026-11-03 dead-end fix). The law is unchanged: the prompt is exactly the
        // button's question and the act names its anchor.
        "prompt: teachingQuestion('passage'),",
        "options: { proposalPolicy: 'reply_only', teachingAnchor: 'passage' }",
        "{ teachingAnchor: 'change' }",
      ]],
      ['app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx', ["teachingQuestion('passage')", "teachingAnchor: 'passage'"]],
      ['app/dev/writers-studio-pc3-live/CraftsmansTableR1.tsx', ["teachingQuestion('change', subject)", "teachingAnchor: 'change'"]],
      ['app/dev/writers-studio-pc3-live/ObservationManuscriptLayer.tsx', ["teachingQuestion('observation')", "teachingAnchor: 'observation'"]],
      ['app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx', ["teachingQuestion('observation')", "teachingAnchor: 'observation'"]],
    ];
    for (const [file, needles] of calls) for (const n of needles) expect(read(file)).toContain(n);
  });

  it('both MAIA paths add the server-owned shape and refuse an unknown anchor', () => {
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain('teachingTurnInstruction(input.teachingAnchor)');
    expect(read('lib/manuscript/ask/developmentalAskReader.ts')).toContain('teachingTurnInstruction(teachingAnchor)');
    expect(read('app/api/writers-studio/editorial/turn/route.ts')).toContain('isTeachingAnchor(b.teachingAnchor)');
    expect(read('app/api/sovereign/manuscripts/[id]/ask/route.ts')).toContain('isTeachingAnchor(body.teachingAnchor)');
  });
});

describe('the writer’s words: short, visible, and about nothing but the request', () => {
  const questions = TEACHING_ANCHORS.map((a) => teachingQuestion(a, a === 'change' ? 'changing "a" to "b"' : undefined));

  it('is one short request per button, with no rule, policy or remark about the writer', () => {
    for (const q of questions) {
      expect(q.startsWith('Teach me')).toBe(true);
      expect(q.length).toBeLessThan(60);
      expect(q).not.toMatch(/\b(do not|don't|end with|keep it|ability|test me)\b/i);
    }
  });

  it('keeps the change subject when one is given', () => {
    expect(teachingQuestion('change', 'changing "rain" to "storm"')).toBe('Teach me about changing "rain" to "storm".');
  });

  it('accepts only the five anchors', () => {
    for (const a of TEACHING_ANCHORS) expect(isTeachingAnchor(a)).toBe(true);
    for (const bad of ['lesson', 'Passage', '', null, undefined, 3]) expect(isTeachingAnchor(bad)).toBe(false);
  });
});

describe('the server-owned teaching turn is one idea and a question the writer steers by', () => {
  const instructions = TEACHING_ANCHORS.map((a) => teachingTurnInstruction(a));

  it('carries the whole shape on every turn', () => {
    for (const p of instructions) for (const line of TEACHING_TURN_SHAPE) expect(p).toContain(line);
  });

  it('asks for one idea and one closing question, and never for the full lesson', () => {
    for (const p of instructions) {
      expect(p).toContain('one idea');
      expect(p).toContain('End with one short question');
      expect(p).not.toMatch(/what (the move|it) may cost|professional terminology second|then professional terminology/i);
    }
  });

  it('names no level, skill or competence of the writer (L6c)', () => {
    for (const text of [...instructions, ...questions(), LEARNING_TEACHING_PRECEDENCE]) {
      expect(text).not.toMatch(/\b(level|beginner|novice|advanced|expert|skill(ed)?|competen\w*|experienced)\b/i);
    }
  });

  function questions(): string[] {
    return TEACHING_ANCHORS.map((a) => teachingQuestion(a));
  }
});

describe('Learning teaching governs length; Guided and Direct are unchanged', () => {
  const before = (d: EditorialDepth) => [
    DEPTH_DIRECTIVE[d],
    STYLE_RESPONSIVE_DIRECTIVE,
    ATTUNEMENT_DIRECTIVE,
    EDITORIAL_INTELLIGENCE_DIRECTIVE,
    // WS-CRAFT-CONVENTIONS-01 (founder ruling 2, 2026-11-09): reaches every depth equally.
    CONVENTION_STANCE_DIRECTIVE,
    WRITER_ATTENTION_DIRECTIVE,
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

describe('the teaching shape builds on the shared conversation shape (roadmap 2a)', () => {
  const shared = CONVERSATION_TURN_SHAPE.find((l) => l.startsWith('End with one short question'));

  it('the shared shape still has its closing-question line', () => {
    expect(shared).toBeDefined();
  });

  it('teaching’s closing line is the shared line plus its examples, so the two cannot drift', () => {
    const teachingClosing = TEACHING_TURN_SHAPE.find((l) => l.startsWith('End with one short question'));
    expect(teachingClosing?.startsWith(shared!.replace(/\.$/, ''))).toBe(true);
    expect(teachingClosing).toBe(
      'End with one short question that lets me choose where we go next — for example whether to say it more simply, look at why it works, or see what it costs.',
    );
  });
});
