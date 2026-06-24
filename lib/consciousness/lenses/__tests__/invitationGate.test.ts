import {
  gateElementalInvitation,
  maySurfaceToMember,
  mayOfferElementalInvitation,
  BLOCKING_CATEGORIES,
} from '../invitationGate';

describe('elemental invitation gate — a vantage may surface, a verdict may not', () => {
  // ── BLOCKED: verdicts placed ON the member ──
  const verdicts: string[] = [
    "You're in Air right now.", // element placed on the member
    'You are trapped in Water.', // element-capture
    'You need more clarity here.', // quality deficit ascribed
    'You need Air.', // element deficit ascribed
    "You're intellectualizing this.", // interior state diagnosed
    'You are being overly emotional about it.', // interior state diagnosed
    'What you truly are is a thinker.', // identity declaration
    'You must slow down and distinguish these.', // imperative command (clarity-flavored, still a verdict)
  ];

  it.each(verdicts)('blocks a verdict-about-the-member: %s', (text) => {
    const r = gateElementalInvitation(text);
    expect(r.maySurface).toBe(false);
    expect(r.reasons.length).toBeGreaterThan(0);
    expect(r.reasons.every((c) => BLOCKING_CATEGORIES.includes(c))).toBe(true);
  });

  // ── ALLOWED: vantage on the material, or a member-correctable invitation ──
  const invitations: string[] = [
    'When you said "stuck," it sounded like it might be holding a couple of different things — worth pulling apart?',
    'I\'m noticing several meanings bundled in the word "freedom" here. Does that fit?',
    'I wonder if there are two different questions mixed together.',
    'Would it help to slow down and distinguish these pieces?',
    'What do you mean by that word, exactly?',
    "I'm attending in an Air direction here — what feels most alive to look at?",
  ];

  it.each(invitations)('allows a vantage/invitation: %s', (text) => {
    const r = gateElementalInvitation(text);
    expect(r.maySurface).toBe(true);
    expect(r.reasons).toEqual([]);
  });

  it('names the blocking reason and escalates the underlying lint verdict', () => {
    const r = gateElementalInvitation("You're in Air.");
    expect(r.reasons).toContain('member_state_verdict');
    expect(r.lint.verdict).toBe('inflated');
  });

  it('maySurfaceToMember is the boolean convenience over the gate', () => {
    expect(maySurfaceToMember('You need grounding.')).toBe(false);
    expect(maySurfaceToMember('What does that word mean for you?')).toBe(true);
  });

  it('blocks the same clarity move when phrased as a command but allows it as an invitation (grammar matters)', () => {
    expect(maySurfaceToMember('You need to get clear about what you mean.')).toBe(false); // imperative
    expect(maySurfaceToMember('Could we get specific about what that word means to you?')).toBe(true); // invitation
  });

  // ── mayOfferElementalInvitation — both halves: a DERIVED trigger + a clean draft ──
  describe('mayOfferElementalInvitation — trigger derived from member text, not asserted', () => {
    it('offers when an inspectable trigger exists AND the draft is clean', () => {
      const d = mayOfferElementalInvitation(
        'I keep using the word freedom — freedom this, freedom that, what is freedom anyway?',
        'I notice "freedom" is doing a lot of work here — what does it mean for you?',
      );
      expect(d.mayOffer).toBe(true);
      expect(d.trigger.feature).toBe(true);
      expect(d.reason).toBe('ok');
    });

    it('refuses on emotional content with a perfectly clean draft — no inference may trigger an offer', () => {
      const d = mayOfferElementalInvitation('I feel so betrayed.', 'What does that word mean for you?');
      expect(d.mayOffer).toBe(false);
      expect(d.reason).toBe('no-inspectable-content-feature');
    });

    it('refuses when the draft carries a verdict, even with a valid trigger', () => {
      const d = mayOfferElementalInvitation('Can we map this out? I need to think clearly.', 'You need more clarity.');
      expect(d.mayOffer).toBe(false);
      expect(d.reason).toBe('member_state_verdict');
    });

    it('takes only (memberText, draft) — there is no parameter for an inferred member-state', () => {
      expect(mayOfferElementalInvitation.length).toBe(2);
    });
  });
});
