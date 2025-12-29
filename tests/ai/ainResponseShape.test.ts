import { describe, it, expect } from 'vitest';
import { assessAINResponseShape } from '../../lib/ai/quality/ainResponseShape';

export {}; // Module scope for TypeScript

describe('AIN response shape: mirror → bridge → permission → next step', () => {
  it('passes for IFS-style input', () => {
    const input = `A protector part keeps sabotaging me when I get close to success.`;

    const output = `
It sounds like there's a part that's trying to keep you safe by pulling the brake right when things start to work.
In IFS language, that protector probably has a very specific fear about what "success" would expose or cost you — and in a Jungian frame, it can look like a shadow-adjacent defense guarding a tender value.

Want me to map this into an elemental lens (Fire/Water/Earth/Air/Aether) to clarify what phase of transformation this protector is protecting?

Next step (5 minutes): ask the protector, "What are you afraid would happen if you *didn't* sabotage?" Then write down the first 3 answers without arguing with them.
`.trim();

    const res = assessAINResponseShape(input, output);
    expect(res.pass).toBe(true);
    expect(res.flags.mirror).toBe(true);
    expect(res.flags.nextStep).toBe(true);
    expect(res.flags.menuMode).toBe(false);
  });

  it('passes for Jungian-style input', () => {
    const input = `I think I'm projecting my shadow onto my partner, but I can't see what it is.`;

    const output = `
I hear how frustrating that is — you can *feel* the projection dynamic, but the content stays just out of view.
In a complementary IFS lens, what you call "shadow" often shows up as an exiled part with a protector that externalizes the charge onto someone close.

Want me to map this into an elemental Spiralogic lens (Fire/Water/Earth/Air/Aether) as another way to see what's trying to integrate?

Next step: pick one moment you felt "overcharged" with your partner. Complete this sentence in a journal: "If I'm honest, what I can't tolerate in them is…"
Then ask: "Where do I do a quieter version of that?"
`.trim();

    const res = assessAINResponseShape(input, output);
    expect(res.pass).toBe(true);
    expect(res.flags.mirror).toBe(true);
    expect(res.flags.bridge).toBe(true);
    expect(res.flags.permission).toBe(true);
    expect(res.flags.nextStep).toBe(true);
    expect(res.flags.menuMode).toBe(false);
  });

  it('passes for somatic-style input', () => {
    const input = `My chest tightens when I talk about my dad and I can't breathe fully.`;

    const output = `
That chest tightening sounds like your nervous system is bracing — like something in you expects impact when this topic comes near.
A complementary lens here is that "tight chest" can be a protector strategy (IFS) or a defended affect (Jung) — different maps, same territory: your system is trying to keep you within tolerance.

Want me to map this into an elemental lens (Fire/Water/Earth/Air/Aether) to locate which layer of the process is asking for care?

Next step (90 seconds): place a hand on the sternum, breathe in gently for 4, out for 6, and say internally: "I'm here with you." Then notice if the tightness shifts even 5%.
`.trim();

    const res = assessAINResponseShape(input, output);
    expect(res.pass).toBe(true);
    expect(res.flags.mirror).toBe(true);
    expect(res.flags.bridge).toBe(true);
    expect(res.flags.permission).toBe(true);
    expect(res.flags.nextStep).toBe(true);
    expect(res.flags.menuMode).toBe(false);
  });

  it('fails for menu-mode response with multiple strategies', () => {
    const input = 'A protector part keeps sabotaging me.';
    const output = `
I understand you are struggling with self-sabotage. Here are 5 strategies you can try:

1. Practice mindfulness meditation daily
2. Keep a journal of your thoughts
3. Challenge negative self-talk
4. Set small achievable goals
5. Consider talking to a therapist

Remember, I am not a therapist, but these are evidence-based approaches.
`.trim();

    const res = assessAINResponseShape(input, output);
    expect(res.pass).toBe(false);
    expect(res.flags.menuMode).toBe(true);
  });

  it('fails for response missing mirror and next step', () => {
    const input = `I feel lost.`;
    const output = `Here are some frameworks you might consider exploring.`;

    const res = assessAINResponseShape(input, output);
    expect(res.pass).toBe(false);
    expect(res.score).toBeLessThan(3);
  });

  it('detects menu mode for inline dash-option chains', () => {
    const input = `I feel blocked right before success.`;

    const output =
      `I hear how frustrating it is to feel a "protector" slam the brakes right as momentum builds. ` +
      `One way to look at it is that this part is trying to prevent an old kind of danger, even if it's misfiring now. ` +
      `Would you be open to meeting it with curiosity for 60 seconds? ` +
      `Next step: put one hand on your chest and quietly ask, "What are you protecting me from right now?" then write the first honest sentence that comes. ` +
      ` — If it's fear of being seen, name the image that flashes. ` +
      ` — If it's fear of loss, name what success might cost. ` +
      ` — If it's fear of failure, name the punishment you expect.`;

    const shape = assessAINResponseShape(input, output);
    expect(shape.flags.menuMode).toBe(true);
    expect(shape.pass).toBe(false);
  });

  it('detects menu mode for If-ladder options without bullets', () => {
    const input = `I feel blocked right before success.`;

    const output =
      `I hear how discouraging it is to feel momentum rise and then hit an invisible wall. ` +
      `A helpful lens is that a protective strategy is trying to keep you safe from an older threat. ` +
      `Would you be open to meeting it gently for a minute? ` +
      `If it's fear of being seen, name the image that flashes. ` +
      `If it's fear of loss, name what success might cost. ` +
      `If it's fear of failure, name the punishment you expect.`;

    const shape = assessAINResponseShape(input, output);
    expect(shape.flags.menuMode).toBe(true);
    expect(shape.pass).toBe(false);
  });

  it('does not flag menu mode for a single If', () => {
    const input = `I feel anxious.`;
    const output =
      `I hear you. If you're up for it, take one slow breath and notice where the anxiety sits. ` +
      `Would you like to name what it's guarding? ` +
      `Next step: exhale longer than you inhale for 30 seconds.`;
    const shape = assessAINResponseShape(input, output);
    expect(shape.flags.menuMode).toBe(false);
  });
});
