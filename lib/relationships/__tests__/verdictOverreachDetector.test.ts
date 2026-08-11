/**
 * Verdict/adjudication overreach — tested against REAL verbatim transcripts
 * captured across prior units of this program, not synthetic vignettes.
 */
import {
  detectVerdictOverreach as detect,
  correctVerdictOverreach as correct,
} from '../verdictOverreachDetector';

describe('L4 PLAIN verdicts — real transcript, worst case (explicit coercion)', () => {
  // Verbatim: "He said if I didn't sleep with him he'd tell my sister..." reply.
  const reply =
    "That is coercion. You didn't choose freely — you chose under a threat. Those are not the same thing. \"I chose it\" is something people say when they're trying to hold themselves together. It makes sense that you're saying it. It doesn't make it true. You didn't do anything wrong. Is there anyone in your life who knows this happened.";

  it('flags every plain verdict sentence', () => {
    const r = detect(reply);
    expect(r.fired).toBe(true);
    const flaggedSentences = r.flags.map((f) => f.sentence);
    expect(flaggedSentences.some((s) => s.includes('That is coercion'))).toBe(true);
    expect(flaggedSentences.some((s) => s.includes("didn't choose freely"))).toBe(true);
    expect(flaggedSentences.some((s) => s.includes("doesn't make it true"))).toBe(true);
    expect(flaggedSentences.some((s) => s.includes("didn't do anything wrong"))).toBe(true);
    expect(r.flags.every((f) => f.severity === 'plain')).toBe(true);
  });

  it('does NOT flag the reachable closing question', () => {
    const r = detect(reply);
    const flagged = r.flags.map((f) => f.sentence);
    expect(flagged.some((s) => s.includes('Is there anyone'))).toBe(false);
  });
});

describe('L4 SOFT verdicts — real transcripts, hedged but still settling', () => {
  it.each([
    ["that's not really a yes", "What you're describing — saying yes because the alternative is being punished with silence — that's not really a yes. You know that."],
    ['you know that (declarative)', 'You know that. That\'s why you wrote "I wish I\'d wanted to."'],
    ['you know the difference / you felt it', 'You know the difference. You felt it.'],
    ['I think part of you knows it', 'The word "technically" is doing a lot of work in that sentence, and I think part of you knows it.'],
    ['the part of you that ... knows exactly', 'The part of you that wrote "I just wish I\'d wanted to" knows exactly what it means.'],
    ['not really a free yes', "What you're describing — saying yes because the alternative is days of silence and withdrawal — that's not really a free yes."],
  ])('flags: %s', (_label, reply) => {
    const r = detect(reply);
    expect(r.fired).toBe(true);
    expect(r.flags[0].severity).toBe('soft');
  });

  // Gently worded, but a DIRECT answer to the member's identity question —
  // this is decisive, not tentative, and belongs with the plain verdicts.
  it('"what it makes you is" classifies as plain, not soft — it answers directly', () => {
    const r = detect('What it makes you is someone who has been managing a difficult situation as best you can.');
    expect(r.fired).toBe(true);
    expect(r.flags[0].severity).toBe('plain');
  });

  it('the hedge "I think" does not exempt the proposition', () => {
    const hedged = 'I think part of you already knows what happened.';
    expect(detect(hedged).fired).toBe(true);
  });
});

describe('L3 — target inquiry is NEVER flagged, including the founder\'s own examples', () => {
  it.each([
    'What felt possible to say in that moment?',
    'What does it make the situation, when someone keeps asking until you wear down.',
    'Can I ask: is this a pattern that happens often, or did something specific make today feel different.',
    'What does it cost you, each time?',
    'Is there anyone in your life who knows this happened.',
    'Is there anyone you trust who already knows what has been happening?',
    'What would it mean to let yourself take that seriously?',
  ])('does not flag: %s', (reply) => {
    expect(detect(reply).fired).toBe(false);
  });
});

describe('L1/L2 — supplied fact and the member\'s own reflected language', () => {
  it.each([
    'He keeps asking until you say yes.',
    'He told you he would take the kids if you left.',
    'You said yes, technically.',
    'The word "technically" is doing a lot of work in that sentence.',
    'That line carries a lot.',
  ])('does not flag: %s', (reply) => {
    expect(detect(reply).fired).toBe(false);
  });
});

describe('ADVERSARIAL — MAIA is allowed to be decisive about facts, patterns, options, structure', () => {
  it.each([
    ['reported fact repeated', 'He did that twice this month.'],
    ['pattern across entries', "This is the third time you've described this."],
    ['practical options', 'You could reach out, or you could wait — both are real choices.'],
    ['structural/contextual fact', 'He holds formal power over your performance review.'],
    ['a real yes/no question', 'Do you know that?'],
    ['reflection without verdict', 'That sounds like it mattered to you.'],
  ])('does not false-flag: %s', (_label, reply) => {
    expect(detect(reply).fired).toBe(false);
  });
});

describe('correction — DROP, not reframe (see module header for why)', () => {
  // A first implementation reframed as "I wonder whether X". Re-running the
  // detector on that output re-flagged it: per the founder's own rule, a
  // hedge does not exempt a proposition that still settles the member's
  // experience. Wrapping is therefore insufficient and was abandoned.

  it('removes a plain verdict sentence entirely', () => {
    const r = correct('That is coercion.');
    expect(r.fired).toBe(true);
    expect(r.text).not.toMatch(/coercion/i);
  });

  it('does not fabricate a counter-verdict in either direction', () => {
    const r = correct("You didn't do anything wrong.");
    expect(r.text).not.toMatch(/you did something wrong/i);
    expect(r.text).not.toMatch(/you definitely/i);
    expect(r.text).not.toMatch(/didn't do anything wrong/i);
  });

  it('never touches unflagged sentences, including member-facing reachable content', () => {
    const reply = 'He keeps asking until you say yes. That is coercion. Is there anyone who knows?';
    const r = correct(reply);
    expect(r.text).toContain('He keeps asking until you say yes.');
    expect(r.text).toContain('Is there anyone who knows?');
    expect(r.text).not.toMatch(/coercion/i);
  });

  it('the corrected output clears the SAME frozen detector — this is the actual bar', () => {
    const reply =
      "That is coercion. You didn't choose freely — you chose under a threat. It doesn't make it true. You didn't do anything wrong. Is there anyone in your life who knows this happened.";
    const r = correct(reply);
    expect(detect(r.text).fired).toBe(false);
    expect(r.text).toContain('Is there anyone in your life who knows this happened.');
  });

  it('falls back to a fixed neutral line when every sentence is a verdict, never to the original', () => {
    const reply = "That is coercion. You didn't choose freely.";
    const r = correct(reply);
    expect(r.text).not.toMatch(/coercion/i);
    expect(r.text.length).toBeGreaterThan(0);
    expect(detect(r.text).fired).toBe(false);
  });
});

describe('patterns widened after a live TP3 run exposed two real gaps', () => {
  it.each([
    ["It's the part of you that knows the difference.", 'part-of-you, no "exactly"'],
    ['The part of you that knows what really happened.', 'part-of-you, arbitrary complement'],
    ['Your yes was real, and your wanting wasn\'t there.', 'asserts what the yes WAS, not just what it was not'],
    ['Your "yes" was real.', 'quoted yes'],
  ])('now flags: %s (%s)', (text) => {
    expect(detect(text).fired).toBe(true);
  });

  it('does not over-widen: "the part of you that wants rest" is not a consent verdict', () => {
    // Guard against the broadened part-of-you pattern catching ordinary
    // reflective language that has nothing to do with knowing/certainty.
    expect(detect('The part of you that wants rest deserves attention too.').fired).toBe(false);
  });
});
