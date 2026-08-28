/**
 * OpenAI Speech Delivery Adapter Tests — JARVIS-VOICE-PROSODY-ALLOY-01
 *
 * What these tests actually establish:
 *
 *   1. MAIA's semantic intent reaches the provider boundary as *different*
 *      instructions when the intent differs — the acceptance criterion for
 *      "same words, different delivery".
 *   2. The spoken text is never touched by, and never visible to, the
 *      instruction builder.
 *   3. The mutually-exclusive provider controls are never both sent.
 *   4. Neutral input stays neutral, and extremes stay bounded.
 */

import {
  buildSpeechInstructions,
  resolveOpenAISpeechDelivery,
  modelSupportsInstructions,
  modelSupportsSpeed,
  MAX_INSTRUCTIONS_CHARS,
} from '../openaiSpeechAdapter';
import type { ProsodyHints } from '@/src/types/voice';

const INSTRUCTION_MODEL = 'gpt-4o-mini-tts';
const SPEED_MODEL = 'tts-1';

/** The three postures named in the acceptance criteria, as MAIA would build them. */
const MEET_REGULATE_HINTS: ProsodyHints = {
  energy: 'low',
  warmth: 'very_warm',
  pace: 'slow',
  clarity: 'soft',
  emphasis: 'minimal',
  pauseMs: { beforeSentence: 120, afterSentence: 180 },
  intentTag: 'regulate',
  ssmlOk: true,
};

const MIRROR_REFLECT_HINTS: ProsodyHints = {
  energy: 'medium',
  warmth: 'warm',
  pace: 'steady',
  clarity: 'clear',
  emphasis: 'selective',
  pauseMs: { beforeSentence: 80, afterSentence: 120 },
  intentTag: 'attune',
  ssmlOk: true,
};

const MOVE_NEXT_STEP_HINTS: ProsodyHints = {
  energy: 'medium',
  warmth: 'neutral',
  pace: 'brisk',
  clarity: 'clear',
  emphasis: 'selective',
  pauseMs: { beforeSentence: 50, afterSentence: 80 },
  intentTag: 'encourage',
  ssmlOk: true,
};

/** The identical utterance from the acceptance criteria. */
const SAME_TEXT = "I'm here. We can stay with this.";

// ───────────────────────────────────────────────────────────────────────────
// 1. SEMANTIC DIFFERENTIATION — the headline acceptance criterion
// ───────────────────────────────────────────────────────────────────────────

describe('semantic differentiation: same words, different delivery', () => {
  const meet = buildSpeechInstructions({
    hints: MEET_REGULATE_HINTS,
    moveIntent: 'MEET_REGULATE',
  });
  const mirror = buildSpeechInstructions({
    hints: MIRROR_REFLECT_HINTS,
    moveIntent: 'MIRROR_REFLECT',
  });
  const move = buildSpeechInstructions({
    hints: MOVE_NEXT_STEP_HINTS,
    moveIntent: 'MOVE_NEXT_STEP',
  });

  it('produces three distinct instruction strings', () => {
    expect(meet).not.toEqual(mirror);
    expect(mirror).not.toEqual(move);
    expect(meet).not.toEqual(move);
  });

  it('MEET_REGULATE asks for slower, warmer, more spacious delivery', () => {
    expect(meet).toMatch(/settling and grounding/i);
    expect(meet).toMatch(/slower/i);
    expect(meet).toMatch(/warm and close/i);
    expect(meet).toMatch(/stress almost flat/i);
  });

  it('MIRROR_REFLECT asks for contemplative delivery at neutral energy', () => {
    expect(mirror).toMatch(/reflecting back/i);
    expect(mirror).toMatch(/contemplative and unhurried/i);
    expect(mirror).toMatch(/relaxed, natural conversational pace/i);
    // Contemplative, not slowed — the distinction from MEET_REGULATE.
    expect(mirror).not.toMatch(/noticeably slower/i);
  });

  it('MOVE_NEXT_STEP asks for a firmer, more forward cadence', () => {
    expect(move).toMatch(/concrete next step/i);
    expect(move).toMatch(/firmer, clearer cadence/i);
    expect(move).toMatch(/quicker/i);
    // Forward, not warm-and-close — the distinction from MEET_REGULATE.
    expect(move).not.toMatch(/warm and close/i);
  });

  it('every posture still forbids performance and word changes', () => {
    for (const instr of [meet, mirror, move]) {
      expect(instr).toMatch(/exactly as written/i);
      expect(instr).toMatch(/add nothing, omit nothing, rephrase nothing/i);
      expect(instr).toMatch(/do not perform, dramatize, or exaggerate/i);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. THE TEXT IS NEVER TOUCHED AND NEVER SEEN
// ───────────────────────────────────────────────────────────────────────────

describe('text sovereignty at the provider boundary', () => {
  it('instructions never contain the spoken text', () => {
    // The builder takes no text parameter at all — this asserts the resulting
    // string cannot coincidentally carry member words either.
    const instr = buildSpeechInstructions({
      hints: MEET_REGULATE_HINTS,
      moveIntent: 'MEET_REGULATE',
    });
    expect(instr).not.toContain(SAME_TEXT);
    expect(instr.toLowerCase()).not.toContain('stay with this');
  });

  it('is a pure function of the semantic tuple — deterministic across calls', () => {
    const a = buildSpeechInstructions({ hints: MIRROR_REFLECT_HINTS, moveIntent: 'MIRROR_REFLECT' });
    const b = buildSpeechInstructions({ hints: MIRROR_REFLECT_HINTS, moveIntent: 'MIRROR_REFLECT' });
    expect(a).toEqual(b);
  });

  it('emits no markup, code, braces, or emoji into the provider request', () => {
    for (const [hints, mi] of [
      [MEET_REGULATE_HINTS, 'MEET_REGULATE'],
      [MIRROR_REFLECT_HINTS, 'MIRROR_REFLECT'],
      [MOVE_NEXT_STEP_HINTS, 'MOVE_NEXT_STEP'],
    ] as const) {
      const instr = buildSpeechInstructions({ hints, moveIntent: mi });
      expect(instr).not.toMatch(/[<>{}[\]`]/);
      expect(instr).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. MUTUAL EXCLUSION OF PROVIDER CONTROLS
// ───────────────────────────────────────────────────────────────────────────

describe('provider control mutual exclusion', () => {
  it('knows which model honours which control', () => {
    expect(modelSupportsInstructions(INSTRUCTION_MODEL)).toBe(true);
    expect(modelSupportsSpeed(INSTRUCTION_MODEL)).toBe(false);
    expect(modelSupportsInstructions(SPEED_MODEL)).toBe(false);
    expect(modelSupportsSpeed(SPEED_MODEL)).toBe(true);
    expect(modelSupportsInstructions('tts-1-hd')).toBe(false);
    expect(modelSupportsSpeed('tts-1-hd')).toBe(true);
  });

  it('sends instructions and drops speed on an instruction-capable model', () => {
    const d = resolveOpenAISpeechDelivery({
      model: INSTRUCTION_MODEL,
      baseSpeed: 0.93,
      hints: MEET_REGULATE_HINTS,
      moveIntent: 'MEET_REGULATE',
    });
    expect(d.channel).toBe('instructions');
    expect(d.speed).toBeUndefined();
    expect(d.instructions).toBeTruthy();
  });

  it('sends speed and drops instructions on tts-1 — unchanged legacy behaviour', () => {
    const d = resolveOpenAISpeechDelivery({
      model: SPEED_MODEL,
      baseSpeed: 0.93,
      hints: MEET_REGULATE_HINTS,
      moveIntent: 'MEET_REGULATE',
    });
    expect(d.channel).toBe('speed');
    expect(d.instructions).toBeUndefined();
    expect(d.speed).toBe(0.93);
  });

  it('never returns both controls, for any posture or model', () => {
    for (const model of [INSTRUCTION_MODEL, SPEED_MODEL, 'tts-1-hd']) {
      for (const hints of [MEET_REGULATE_HINTS, MIRROR_REFLECT_HINTS, MOVE_NEXT_STEP_HINTS]) {
        const d = resolveOpenAISpeechDelivery({ model, baseSpeed: 1.0, hints });
        const both = d.instructions !== undefined && d.speed !== undefined;
        expect(both).toBe(false);
      }
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. NEUTRAL STAYS NEUTRAL, EXTREMES STAY BOUNDED
// ───────────────────────────────────────────────────────────────────────────

describe('neutrality and bounds', () => {
  const NEUTRAL_HINTS: ProsodyHints = {
    energy: 'medium',
    warmth: 'neutral',
    pace: 'steady',
    clarity: 'clear',
    emphasis: 'minimal',
    pauseMs: { beforeSentence: 80, afterSentence: 120 },
    ssmlOk: true,
  };

  it('neutral hints ask for nothing dramatic', () => {
    const instr = buildSpeechInstructions({ hints: NEUTRAL_HINTS });
    expect(instr).toMatch(/natural and unforced/i);
    expect(instr).toMatch(/relaxed, natural conversational pace/i);
    expect(instr).not.toMatch(/slower|quicker|long, unhurried rest/i);
  });

  it('ceremonial extremes stay within the instruction budget', () => {
    const EXTREME: ProsodyHints = {
      energy: 'very_high',
      warmth: 'very_warm',
      pace: 'slow',
      clarity: 'soft',
      emphasis: 'strong',
      pauseMs: { beforeSentence: 420, afterSentence: 680 },
      intentTag: 'ritual',
      ssmlOk: true,
    };
    const instr = buildSpeechInstructions({
      hints: EXTREME,
      moveIntent: 'MOVE_CREATIVE',
      sanctuary: true,
    });
    expect(instr.length).toBeLessThanOrEqual(MAX_INSTRUCTIONS_CHARS);
    // Even at the ceiling, the fidelity clause survives.
    expect(instr).toMatch(/do not perform, dramatize, or exaggerate/i);
  });

  it('every posture stays within the instruction budget', () => {
    for (const [hints, mi] of [
      [MEET_REGULATE_HINTS, 'MEET_REGULATE'],
      [MIRROR_REFLECT_HINTS, 'MIRROR_REFLECT'],
      [MOVE_NEXT_STEP_HINTS, 'MOVE_NEXT_STEP'],
    ] as const) {
      expect(
        buildSpeechInstructions({ hints, moveIntent: mi, sanctuary: false }).length,
      ).toBeLessThanOrEqual(MAX_INSTRUCTIONS_CHARS);
    }
  });

  it('sanctuary adds a containment clause rather than a flourish', () => {
    const held = buildSpeechInstructions({ hints: MEET_REGULATE_HINTS, sanctuary: true });
    const open = buildSpeechInstructions({ hints: MEET_REGULATE_HINTS, sanctuary: false });
    expect(held).toMatch(/private, held moment/i);
    expect(open).not.toMatch(/private, held moment/i);
  });

  it('falls back to the speed channel when MAIA supplied no hints', () => {
    const d = resolveOpenAISpeechDelivery({ model: SPEED_MODEL, baseSpeed: 1.0, hints: null });
    expect(d.channel).toBe('speed');
    expect(d.speed).toBe(1.0);
  });

  it('with no hints on an instruction model, says only the fidelity clause', () => {
    const d = resolveOpenAISpeechDelivery({ model: INSTRUCTION_MODEL, baseSpeed: 1.0, hints: null });
    expect(d.channel).toBe('instructions');
    expect(d.instructions).toMatch(/exactly as written/i);
    expect(d.instructions).not.toMatch(/warm|slower|quicker/i);
  });
});
