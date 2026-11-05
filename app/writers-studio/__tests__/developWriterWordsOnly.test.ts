/**
 * CONVERSATION-STAGE · step 3 (founder rulings Q2/Q4, 2026-11-05) — Develop never
 * puts instructions to MAIA in the writer's mouth.
 */
import fs from 'node:fs';
import path from 'node:path';
import { GUIDED_STARTERS, OBSERVATION_STARTERS, placeStarter } from '@/lib/writersStudio/developStarters';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const DEVELOP = strip(fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8'));
const DIALOGUE = strip(fs.readFileSync(path.join(process.cwd(), 'app/writers-studio/develop/ObservationDialogue.tsx'), 'utf8'));

/** Phrases that are instructions to MAIA, not something a writer says. */
const INSTRUCTION = /Do not |Stay with this exact|Begin by asking|ask me one useful question|Use the full editorial vocabulary|No technical editorial vocabulary|Keep those states|Treat every structure|Stay at the whole-Work scale/i;

describe('Develop: the writer\'s turn holds only the writer\'s words', () => {
  const words = [
    ...Object.values(OBSERVATION_STARTERS).map((s) => s.words),
    ...Object.values(GUIDED_STARTERS),
    placeStarter('II. Finding Our Place'),
    placeStarter(null),
  ];

  it.each(words)('"%s" is short and is not an instruction to MAIA', (w) => {
    expect(w.length).toBeLessThanOrEqual(80);
    expect(w).not.toMatch(INSTRUCTION);
  });

  it('no observation button auto-sends composed text', () => {
    const prompts = [...DEVELOP.matchAll(/setDialoguePrompt\(([^)]*)\)/g)].map((m) => m[1].trim());
    for (const p of prompts) {
      expect(p === "''" || p.startsWith('OBSERVATION_STARTERS.') || p.startsWith('teachingQuestion(')).toBe(true);
    }
  });

  it('no Work-conversation starter is composed instruction text', () => {
    const calls = [...DEVELOP.matchAll(/beginWholeConversation\(([\s\S]*?)\)\s*[;}]/g)].map((m) => m[1]);
    expect(calls.length).toBeGreaterThan(0);
    for (const c of calls) expect(c).not.toMatch(INSTRUCTION);
  });

  it('depth travels as responseStyle, not as words', () => {
    expect(DEVELOP).toMatch(/initialResponseStyle=\{/);
    expect(DIALOGUE).toMatch(/initialResponseStyle/);
    expect(DIALOGUE).toMatch(/q === initialQuestion\.trim\(\)[\s\S]{0,80}initialResponseStyle/);
  });
});
