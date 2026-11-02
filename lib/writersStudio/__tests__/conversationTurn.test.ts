/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { CONVERSATION_TURN_SHAPE, conversationTurnPrompt } from '../conversationTurn';

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

describe('conversationTurnPrompt', () => {
  it('keeps the writer’s question first and unchanged', () => {
    const q = 'Is the ending too quick?\nBe honest.';
    const out = conversationTurnPrompt(q);
    expect(out.startsWith(q)).toBe(true);
    for (const line of CONVERSATION_TURN_SHAPE) expect(out).toContain(line);
  });
});

describe('the free Ask box uses it', () => {
  const panel = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx'), 'utf8');
  const start = panel.indexOf('const sendOpenPrompt');
  const sendOpenPrompt = panel.slice(start, panel.indexOf('};', start));

  it('the typed question carries the shape', () => {
    expect(sendOpenPrompt).toContain('...CONVERSATION_TURN_SHAPE');
  });

  it('a spoken question carries it too', () => {
    expect(panel).toContain('onAsk={(text) => props.onSend(withOrigin(conversationTurnPrompt(text)))}');
  });
});
