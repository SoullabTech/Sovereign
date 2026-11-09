/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { STUDIO_ACTIONS, parseStudioActions, stripStudioActions, studioActionsInstruction } from '../studioActions';

/** Design 1B (founder-approved v1 set, 2026-11-02): MAIA offers; the writer clicks; nothing else. */

describe('the closed allowlist', () => {
  it('is exactly the approved v1 set, with no "go to section"', () => {
    // Craftsman's Table restored as a place to go (founder, 2026-11-04), passage Focus only.
    // G4 (founder, 2026-11-09): read-chapter, Work conversation only, started by the writer's click.
    // Amendment 2 (founder, 2026-11-09, "Yes, amend it"): grant-reading, make-plan, note-settled, open-desk — Work conversation only.
    // Standing rule completion (founder, 2026-11-09): navigation offers so every Develop capability is askable; go-chapter takes an id, never a heading.
    expect(STUDIO_ACTIONS.map((a) => a.id).sort()).toEqual(['close-conversation', 'craftsmans-table', 'develop-overview', 'editorial-pass', 'focus', 'go-chapter', 'grant-reading', 'make-plan', 'new-conversation', 'note-settled', 'open-desk', 'open-in-maia', 'read-chapter', 'show', 'show-keeps']);
    expect(JSON.stringify(STUDIO_ACTIONS)).not.toMatch(/section-|go-to-section/);
  });

  it('a known marker becomes the action and is removed from the text', () => {
    const r = parseStudioActions('Try reading the whole chapter.\n\n[[studio:develop-overview]]', 'passage-focus');
    expect(r.action?.id).toBe('develop-overview');
    expect(r.text).toBe('Try reading the whole chapter.');
  });

  it('an invented marker becomes nothing and never shows', () => {
    const r = parseStudioActions('Done. [[studio:delete-work]]', 'passage-focus');
    expect(r.action).toBeNull();
    expect(r.text).toBe('Done.');
  });

  it('a marker this surface cannot honour is stripped and not offered', () => {
    const r = parseStudioActions('Use the table. [[studio:craftsmans-table]]', 'work-conversation');
    expect(r.action).toBeNull();
    expect(r.text).not.toContain('[[studio:');
  });

  it('only the first allowed marker is offered; all are stripped', () => {
    const r = parseStudioActions('A [[studio:editorial-pass]] B [[studio:develop-overview]]', 'work-conversation');
    expect(r.action?.id).toBe('editorial-pass');
    expect(r.text).not.toContain('[[studio:');
  });

  it('text with no marker is unchanged in substance', () => {
    expect(parseStudioActions('Plain reply.', 'passage-focus')).toEqual({ text: 'Plain reply.', action: null });
    expect(stripStudioActions('x [[studio:anything]] y')).toBe('x  y');
  });
});

describe('what MAIA is told', () => {
  it('lists exactly the actions each surface can show, and forbids inventing', () => {
    const focus = studioActionsInstruction('passage-focus');
    const work = studioActionsInstruction('work-conversation');
    for (const a of STUDIO_ACTIONS) {
      expect(focus.includes(`[[studio:${a.id}]]`)).toBe(a.surfaces.includes('passage-focus'));
      expect(work.includes(`[[studio:${a.id}]]`)).toBe(a.surfaces.includes('work-conversation'));
    }
    expect(focus).toContain('Never invent a marker');
    expect(focus).toContain('it does not press anything');
  });

  it('only the Focus and Work-conversation paths tell her; Develop does not', () => {
    const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain("studioActionsInstruction('passage-focus')");
    expect(read('lib/manuscript/ask/askReader.ts')).toContain("studioActionsInstruction('work-conversation')");
    expect(read('lib/manuscript/ask/developmentalAskReader.ts')).not.toContain('studioActionsInstruction');
  });

  it('every surface that shows these replies strips markers', () => {
    const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
    for (const f of [
      'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx',
      'app/dev/writers-studio-pc3-live/MaiaCraftCompanionR1.tsx',
      'app/writers-studio/canvas/EditorialConversation.tsx',
      'app/writers-studio/canvas/WorkConversation.tsx',
    ]) expect(read(f)).toMatch(/parseStudioActions|stripStudioActions/);
  });
});

describe('G4: Read this chapter, offered in conversation', () => {
  it('parses with a real lens, defaults to overview, and never accepts an invented lens', () => {
    expect(parseStudioActions('Shall I? [[studio:read-chapter:arc]]', 'work-conversation')).toMatchObject({ action: { id: 'read-chapter' }, lens: 'arc', text: 'Shall I?' });
    expect(parseStudioActions('Shall I? [[studio:read-chapter]]', 'work-conversation').lens).toBe('overview');
    expect(parseStudioActions('[[studio:read-chapter:rewrite-it]]', 'work-conversation').lens).toBe('overview');
  });
  it('is not offered in passage Focus, and no other action accepts a parameter', () => {
    expect(parseStudioActions('[[studio:read-chapter]]', 'passage-focus').action).toBeNull();
    expect(parseStudioActions('[[studio:develop-overview:arc]]', 'work-conversation').action).toBeNull();
  });
  it('MAIA is told only the click starts it, and the lenses she may name', () => {
    const work = studioActionsInstruction('work-conversation');
    expect(work).toContain('You never start a reading yourself');
    expect(work).toContain('[[studio:read-chapter:arc]]');
    expect(studioActionsInstruction('passage-focus')).not.toContain('read-chapter');
  });
});

describe('Design 1B amendment 2: acting offers', () => {
  const { parseStudioActions, studioActionsInstruction } = jest.requireActual('../studioActions');
  it('grant-reading carries only chapter or work; anything else is no button', () => {
    expect(parseStudioActions('x\n[[studio:grant-reading:work]]', 'work-conversation').level).toBe('work');
    expect(parseStudioActions('x\n[[studio:grant-reading]]', 'work-conversation').level).toBe('chapter');
    expect(parseStudioActions('x\n[[studio:grant-reading:everything]]', 'work-conversation').action).toBeNull();
  });
  it('the four are Work-conversation only, and she is told only the click performs them', () => {
    for (const id of ['grant-reading', 'make-plan', 'note-settled', 'open-desk']) {
      expect(parseStudioActions(`x\n[[studio:${id}]]`, 'passage-focus').action).toBeNull();
      expect(parseStudioActions(`x\n[[studio:${id}]]`, 'work-conversation').action?.id).toBe(id);
    }
    expect(studioActionsInstruction('work-conversation')).toMatch(/Consent is theirs/);
    expect(studioActionsInstruction('work-conversation')).toMatch(/never yours/);
  });
});

describe('standing rule: navigation offers', () => {
  const { parseStudioActions } = jest.requireActual('../studioActions');
  it('show takes only a known place; go-chapter takes only an id-shaped target; neither stands bare', () => {
    expect(parseStudioActions('x\n[[studio:show:plan]]', 'work-conversation').target).toBe('plan');
    expect(parseStudioActions('x\n[[studio:show:secrets]]', 'work-conversation').action).toBeNull();
    expect(parseStudioActions('x\n[[studio:show]]', 'work-conversation').action).toBeNull();
    expect(parseStudioActions('x\n[[studio:go-chapter:abc-123]]', 'work-conversation').target).toBe('abc-123');
    expect(parseStudioActions('x\n[[studio:go-chapter:The Harbour]]', 'work-conversation').action).toBeNull();
    expect(parseStudioActions('x\n[[studio:go-chapter]]', 'work-conversation').action).toBeNull();
  });
});
