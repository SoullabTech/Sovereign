/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { passageActInstruction, passageActQuestion } from '../passageActs';

/**
 * F1 follow-up (WRITERS-ACADEMY_F1_WITNESS_AND_CLOSURE_2026-11-02.md, open findings):
 * "Why this?" on a revision mark in the manuscript sent a composed instruction as the
 * writer's words. It now sends only the button's question with the server-owned
 * change-why act, the same act Craftsman's Table's "Why?" uses.
 */

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const VIEW = 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx';

/** The old composed "Why this?" instruction, as it was sent as the writer's turn. */
const OLD_WHY = /Show me the evidence in my sentence|make the strongest case for keeping mine/;

function whyRevisionEditSource(source: string): string {
  const start = source.indexOf('const whyRevisionEdit');
  if (start < 0) return '';
  const end = source.indexOf('const teachRevisionEdit', start);
  return source.slice(start, end < 0 ? undefined : end);
}

describe('"Why this?" on a revision mark sends only the writer’s words (F1)', () => {
  const why = whyRevisionEditSource(read(VIEW));

  it('the handler exists where the guard looks for it', () => {
    expect(why).not.toBe('');
  });

  it('sends the change-why question and the closed act, reply only', () => {
    expect(why).toContain("passageActQuestion(\n      'change-why',");
    expect(why).toContain("passageAct: 'change-why'");
    expect(why).toContain("proposalPolicy: 'reply_only'");
  });

  it('no longer composes the instruction on the client', () => {
    expect(why).not.toMatch(OLD_WHY);
  });

  it('defeat candidate: the guard catches the old composed send', () => {
    const before = "const whyRevisionEdit = (edit) => { props.onSendEditorial(`Why did you change it? Show me the evidence in my sentence and make the strongest case for keeping mine.`); };\n  const teachRevisionEdit";
    expect(whyRevisionEditSource(before)).toMatch(OLD_WHY);
    expect(whyRevisionEditSource(before)).not.toContain("passageAct: 'change-why'");
  });

  it('the server instruction still carries what the old send asked for', () => {
    const t = passageActInstruction('change-why');
    expect(t).toContain('Use evidence from my exact words');
    expect(t).toContain('Make the strongest case for my original too');
    expect(t).toContain('Do not propose new wording in this answer');
    expect(passageActQuestion('change-why', 'adding "x"')).toBe('Why adding "x"?');
  });
});
