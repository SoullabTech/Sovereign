/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { CONVERSATION_TURN_SHAPE, conversationTurnInstruction, isTurnShape } from '../conversationTurn';

/** Design 3C (founder ruling 2026-11-02): the free Ask box is a conversation by default. */

const LEVEL_WORDS = /\b(level|beginner|novice|advanced|expert|skill|competen\w*|experienced)\b/i;

describe('the conversational shape', () => {
  const text = CONVERSATION_TURN_SHAPE.join('\n');

  it('leads with the most important thing and ends with a steering question', () => {
    expect(text).toContain('lead with the most important thing');
    expect(text).toContain('End with one short question');
  });

  it('gives the full answer when the question itself asks for breadth', () => {
    expect(text).toContain('If my question itself asks for breadth');
    expect(text).toContain('give the full answer instead');
  });

  it('judges the question, never the writer', () => {
    expect(text).toContain('only from what my question asks for');
    expect(text).not.toMatch(LEVEL_WORDS);
  });
});

describe('the server-owned instruction', () => {
  const text = conversationTurnInstruction();

  it('carries every line of the shape and the Ask box rules', () => {
    for (const line of CONVERSATION_TURN_SHAPE) expect(text).toContain(line);
    expect(text).toContain('Do not change or apply anything unless they later choose a revision');
    expect(text).not.toMatch(LEVEL_WORDS);
  });

  it('turnShape is a closed value', () => {
    expect(isTurnShape('conversation')).toBe(true);
    for (const v of ['Conversation', 'teach', '', null, undefined, 1]) expect(isTurnShape(v)).toBe(false);
  });
});

describe('only the writer’s words are the writer’s turn (F1 applied to the Ask box)', () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
  const panel = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');

  it('the typed and spoken questions send the words plus the closed field, no instruction text', () => {
    expect(panel).toContain("props.onSend(withOrigin(q), { turnShape: 'conversation' })");
    expect(panel).toContain("onAsk={(text) => props.onSend(withOrigin(text), { turnShape: 'conversation' })}");
    expect(panel).not.toContain('CONVERSATION_TURN_SHAPE');
    expect(panel).not.toContain('What I want help with:');
  });

  it('the route validates the field and the runtime adds the instruction server-side', () => {
    expect(read('app/api/writers-studio/editorial/turn/route.ts')).toContain('isTurnShape(b.turnShape)');
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain("input.turnShape === 'conversation' ? conversationTurnInstruction() : ''");
    expect(read('lib/writersStudio/rebuild/editorialCollaboration.ts')).toContain('...(turnShape ? { turnShape } : {})');
  });
});
