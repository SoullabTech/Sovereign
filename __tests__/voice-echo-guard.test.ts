/**
 * MAIA VOICE — ECHO GUARD ACCEPTANCE.
 *
 * Founder acceptance requirements (2026-11-18), tested as named laws:
 *   1. No lost speech — ordinary short sentences reach MAIA reliably.
 *   2. No feedback loops — MAIA does not mistake her own voice for a member.
 *   3. Natural conversation — pauses, interruptions and consecutive turns work
 *      without disappearing text or duplicate responses.
 *
 * REGRESSION ORIGIN: the shipped guard blocked any transcript containing one of
 * 17 static English phrases when under 15 words, substring matched. R-1 below
 * is the reported failure in the tester's own terms.
 */
import {
  decideEcho,
  overlapAgainstUtterance,
  ECHO_DECISION,
  ECHO_TAIL_WINDOW_MS,
} from '../lib/voice/echoGuard';

const MAIA_SAID = "Mmm. There's something in the quality of that pause. What does it feel like in your body?";
const sent = (r: ReturnType<typeof decideEcho>) => r.decision === ECHO_DECISION.SEND;

/** The static list that caused the regression. Kept to prove it is not consulted. */
const LEGACY_PATTERNS = ['mmm', 'yes', "there's something", 'i can feel', "what's alive",
  'i notice', "i'm curious", 'what does', 'how does that feel', 'where do you feel',
  'in your body', 'that sensation', 'pause', "what's it like", 'like...', 'suspension', 'quality of'];

describe('REQUIREMENT 1 — no lost speech', () => {
  // Every one of these was DROPPED by the shipped guard.
  const ordinary = [
    'I closed my eyes and felt it',        // 'yes' matched inside "eyes"
    'My eyesight has been blurry',         // 'yes' inside "eyesight"
    'Yes, exactly that',
    'I said yes to the job',
    'I paused before answering',
    'I notice I keep avoiding it',
    'what does it mean to you',
    'the quality of my sleep is poor',
    'in your body language I saw it',
    'Mmm, let me think',
  ];

  test.each(ordinary)('R1 ordinary speech reaches MAIA: %s', (transcript) => {
    const r = decideEcho({ transcript, maiaLastUtterance: null, msSinceMaiaSpokeEnded: null });
    expect(sent(r)).toBe(true);
  });

  test('R1 ordinary speech is sent even moments after MAIA spoke', () => {
    for (const transcript of ordinary) {
      const r = decideEcho({ transcript, maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: 200 });
      expect(sent(r)).toBe(true);
    }
  });

  test('R1 the static phrase list is not consulted at all', () => {
    // Each legacy pattern, alone, as a member utterance. MAIA silent.
    for (const p of LEGACY_PATTERNS) {
      const r = decideEcho({ transcript: p, maiaLastUtterance: null, msSinceMaiaSpokeEnded: null });
      expect(sent(r)).toBe(true);
    }
  });

  test('R1 missing speech timing never deletes member speech', () => {
    for (const since of [null, undefined, NaN, -1] as unknown as number[]) {
      const r = decideEcho({ transcript: 'I closed my eyes', maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: since });
      expect(sent(r)).toBe(true);
    }
  });
});

describe('REQUIREMENT 2 — no feedback loops', () => {
  test('R2 MAIA hearing her own sentence back is blocked', () => {
    const r = decideEcho({ transcript: MAIA_SAID, maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: 300 });
    expect(r.decision).toBe(ECHO_DECISION.BLOCK_AS_ECHO);
  });

  test('R2 a substantial fragment of her own sentence is blocked', () => {
    const r = decideEcho({
      transcript: "there's something in the quality of that pause",
      maiaLastUtterance: MAIA_SAID,
      msSinceMaiaSpokeEnded: 400,
    });
    expect(r.decision).toBe(ECHO_DECISION.BLOCK_AS_ECHO);
  });

  test('R2 echo is only blocked inside the tail window', () => {
    const inside = decideEcho({ transcript: MAIA_SAID, maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: ECHO_TAIL_WINDOW_MS - 1 });
    const outside = decideEcho({ transcript: MAIA_SAID, maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: ECHO_TAIL_WINDOW_MS + 1 });
    expect(inside.decision).toBe(ECHO_DECISION.BLOCK_AS_ECHO);
    expect(sent(outside)).toBe(true);
  });

  test('R2 nothing is blocked when MAIA never spoke', () => {
    const r = decideEcho({ transcript: MAIA_SAID, maiaLastUtterance: null, msSinceMaiaSpokeEnded: 100 });
    expect(sent(r)).toBe(true);
  });
});

describe('REQUIREMENT 3 — natural conversation', () => {
  test('R3 a member quoting MAIA back deliberately is still heard', () => {
    // Short quote inside the member's own sentence: low overlap, must pass.
    const r = decideEcho({
      transcript: "you said something about my body and I want to stay with that for a while because it landed",
      maiaLastUtterance: MAIA_SAID,
      msSinceMaiaSpokeEnded: 500,
    });
    expect(sent(r)).toBe(true);
  });

  test('R3 consecutive member turns both reach MAIA', () => {
    const first = decideEcho({ transcript: 'I think I am avoiding it', maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: 600 });
    const second = decideEcho({ transcript: 'actually no, that is not right', maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: 4000 });
    expect(sent(first)).toBe(true);
    expect(sent(second)).toBe(true);
  });

  test('R3 a long pause mid-thought does not change the decision', () => {
    for (const since of [0, 900, 5_000, 60_000, 600_000]) {
      const r = decideEcho({ transcript: 'I paused because I did not know what to say', maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: since });
      expect(sent(r)).toBe(true);
    }
  });

  test('R3 an interruption during MAIA speech is the member, and is sent', () => {
    // Barge-in: member speaks over MAIA. Different words, zero elapsed.
    const r = decideEcho({ transcript: 'wait, stop, that is not what I meant', maiaLastUtterance: MAIA_SAID, msSinceMaiaSpokeEnded: 0 });
    expect(sent(r)).toBe(true);
  });

  test('R3 the tester’s reported turn is heard', () => {
    const r = decideEcho({ transcript: 'did you get all that I just said', maiaLastUtterance: 'I am here.', msSinceMaiaSpokeEnded: 800 });
    expect(sent(r)).toBe(true);
  });
});

describe('overlap measure', () => {
  test('identical text overlaps fully', () => {
    expect(overlapAgainstUtterance(MAIA_SAID, MAIA_SAID)).toBe(1);
  });
  test('unrelated text does not overlap', () => {
    expect(overlapAgainstUtterance('the dog ran outside quickly', 'completely different words here')).toBeLessThan(0.3);
  });
  test('punctuation and case are not significant', () => {
    expect(overlapAgainstUtterance('Mmm. THERE的S something!', "mmm there s something")).toBeGreaterThan(0.6);
  });
});
