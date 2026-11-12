/** @jest-environment node */
/**
 * WS-STUDIO-GUIDE-WHOLE-01 eval finding (2026-11-12): MAIA was told about acting offers in rooms that show no button for them
 * (Write, Review, the older Develop map). She is now told only about the buttons the conversation's room will show.
 */
import fs from 'fs';
import path from 'path';
import { ROOM_ACTS, STUDIO_ACTIONS, studioActionsInstruction } from '../studioActions';

const ROOT = path.resolve(__dirname, '../../..');
const marker = (id: string) => `[[studio:${id}]]`;

describe('acting offers are described only where the room can carry them out', () => {
  it('without roomActs, the Work conversation hears of no acting offer, and is told not to say "click below" for them', () => {
    const text = studioActionsInstruction('work-conversation');
    for (const id of ROOM_ACTS) expect(text).not.toContain(marker(id));
    expect(text).not.toContain('[[studio:grant-reading:chapter]]');
    expect(text).not.toContain('[[studio:show:');
    expect(text).toContain('Do not say "click below" for them');
    // navigation every room shows is still offered
    for (const id of ['develop-overview', 'editorial-pass', 'new-conversation', 'teach-me', 'open-in-maia']) expect(text).toContain(marker(id));
  });

  it('with roomActs (the Develop stage), every Work-conversation offer is described — the check can fail', () => {
    const text = studioActionsInstruction('work-conversation', { roomActs: true });
    for (const a of STUDIO_ACTIONS.filter((x) => x.surfaces.includes('work-conversation'))) expect(text).toContain(marker(a.id));
    expect(text).toContain('[[studio:grant-reading:chapter]]');
    expect(text).not.toContain('Do not say "click below" for them');
  });

  it('Passage Focus is unchanged by the flag', () => {
    expect(studioActionsInstruction('passage-focus')).toBe(studioActionsInstruction('passage-focus', { roomActs: true }));
  });

  it('ROOM_ACTS is exactly what WorkConversation needs onStudioAct / onReadChapter for', () => {
    const src = fs.readFileSync(path.join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'), 'utf8');
    const acting = src.match(/const ACTING = new Set\(\[([^\]]+)\]\)/)![1].match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));
    expect(src).toContain("parsed.action?.id === 'read-chapter' && !onReadChapter");
    expect([...ROOM_ACTS].sort()).toEqual([...acting, 'read-chapter'].sort());
  });

  it('the flag travels: WorkConversation sends it only with onStudioAct; the route and reader carry it', () => {
    const conv = fs.readFileSync(path.join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'), 'utf8');
    expect(conv).toContain('...(onStudioAct ? { roomActs: true } : {})');
    const route = fs.readFileSync(path.join(ROOT, 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8');
    expect(route).toContain('const roomActs = body.roomActs === true;');
    const reader = fs.readFileSync(path.join(ROOT, 'lib/manuscript/ask/askReader.ts'), 'utf8');
    expect(reader).toContain("studioActionsInstruction('work-conversation', { roomActs: ctx.roomActs === true })");
  });
});
