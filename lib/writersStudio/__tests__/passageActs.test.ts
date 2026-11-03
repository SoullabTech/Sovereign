/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { PASSAGE_ACTS, isPassageAct, passageActInstruction, passageActQuestion } from '../passageActs';
import { EDITORIAL_PACKET_LABELS } from '../editorialIntelligence';

/** Conversation-first Focus, step 1: a card stores only its words; the instruction is server-owned. */

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('the writer’s words', () => {
  it('are short, plain sentences with no rules or instructions in them', () => {
    for (const act of PASSAGE_ACTS) {
      const q = passageActQuestion(act);
      expect(q.length).toBeLessThan(80);
      expect(q).not.toMatch(/\n|Do not|exactly these|Nothing is to be applied|hypothesis/);
    }
  });
});

describe('the server instruction', () => {
  it('keeps the revise packet labels the panel parses', () => {
    for (const act of ['revise', 'revise-after-talk'] as const) {
      const t = passageActInstruction(act);
      expect(t).toContain(`"${EDITORIAL_PACKET_LABELS.preserve}: …"`);
      expect(t).toContain('"What changed: …"');
      expect(t).toContain('"What I protected: …"');
    }
    expect(passageActInstruction('revise-after-talk')).toContain('Based on what we just discussed');
  });

  it('a closed set; unknown values are not acts', () => {
    expect(isPassageAct('discuss')).toBe(true);
    for (const v of ['teach', 'Discuss', '', null, undefined, 3]) expect(isPassageAct(v)).toBe(false);
  });
});

describe('wiring', () => {
  const panel = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');
  const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');

  it('no card, follow-up or menu item composes the old instructions as the writer’s words', () => {
    for (const src of [panel, view]) {
      expect(src).not.toMatch(/Help me revise this exact passage|Discuss what is happening in this exact passage|Show me examples of how a craft move|Give me several ideas for where|editorial reasoning you can support/);
    }
  });

  it('every card and follow-up sends the closed field with its own words', () => {
    for (const act of PASSAGE_ACTS) {
      expect(panel).toContain(`passageActQuestion('${act}')`);
      expect(panel).toContain(`passageAct: '${act}'`);
    }
    for (const act of ['discuss', 'revise', 'deeper'] as const) {
      expect(view).toContain(`onSendEditorial(passageActQuestion('${act}')`);
    }
  });

  it('the route validates it and the runtime adds the instruction', () => {
    expect(read('app/api/writers-studio/editorial/turn/route.ts')).toContain('isPassageAct(b.passageAct)');
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain('passageActInstruction(input.passageAct)');
    expect(read('lib/writersStudio/rebuild/editorialCollaboration.ts')).toContain('...(passageAct ? { passageAct } : {})');
  });
});
