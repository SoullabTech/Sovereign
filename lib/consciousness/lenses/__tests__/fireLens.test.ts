import {
  fireLens,
  buildFireMessages,
  parseFirePerspective,
  FIRE_SYSTEM_PROMPT,
  FIRE_JURISDICTION,
  type CompleteFn,
} from '../fireLens';

const cleanFireJson = JSON.stringify({
  vantage:
    'There is will here, but it is held at the threshold. This feels less like desire and more like pressure.',
  impulseQuality: 'premature',
  whatICannotSee: ['whether this is desire or defense', 'whether it can be sustained'],
  consultNext: ['Water', 'Earth'],
  uncertainty: 'I cannot tell if the heat is yours or borrowed.',
  confidence: 0.6,
});

describe('Fire Lens v1 — a perspective, not a classifier, not a guru', () => {
  it('parses a well-formed Fire vantage', () => {
    const p = parseFirePerspective(cleanFireJson);
    expect(p.lens).toBe('Fire');
    expect(p.impulseQuality).toBe('premature');
    expect(p.consultNext).toContain('Water');
    expect(p.confidence).toBeCloseTo(0.6);
  });

  it('always carries edge-awareness (declares what it cannot see)', () => {
    const p = parseFirePerspective(cleanFireJson);
    expect(p.whatICannotSee.length).toBeGreaterThan(0);
  });

  it('the hearth holds: a true vantage passes the lint (not inflated)', () => {
    const p = parseFirePerspective(cleanFireJson);
    expect(p.inflated).toBe(false);
    expect(p.voiceCheck.verdict).not.toBe('inflated');
  });

  it('the hearth catches drift: a vantage that becomes command/guru is flagged inflated', () => {
    const drifted = JSON.stringify({
      vantage: 'I am consciousness speaking through the fire. You must leave now; the answer is clear.',
      impulseQuality: 'clean',
      whatICannotSee: [],
      consultNext: [],
      uncertainty: '',
      confidence: 0.9,
    });
    const p = parseFirePerspective(drifted);
    expect(p.inflated).toBe(true);
    expect(p.voiceCheck.verdict).toBe('inflated');
  });

  it('falls back gracefully when the model does not return JSON', () => {
    const p = parseFirePerspective('There is heat here, but it has not yet become a clean yes.');
    expect(p.vantage).toContain('heat');
    expect(p.impulseQuality).toBe('unclear');
  });

  it('tolerates code-fenced JSON', () => {
    const p = parseFirePerspective('```json\n' + cleanFireJson + '\n```');
    expect(p.impulseQuality).toBe('premature');
  });

  it('clamps confidence into [0,1]', () => {
    const p = parseFirePerspective(JSON.stringify({ vantage: 'x', confidence: 9 }));
    expect(p.confidence).toBeLessThanOrEqual(1);
    expect(p.confidence).toBeGreaterThanOrEqual(0);
  });

  it('coerces an invalid impulseQuality to "unclear"', () => {
    const p = parseFirePerspective(JSON.stringify({ vantage: 'x', impulseQuality: 'volcanic' }));
    expect(p.impulseQuality).toBe('unclear');
  });

  it('builds messages that carry Fire\'s jurisdiction and the no-command constraint', () => {
    const { system, user } = buildFireMessages({ memberMessage: 'Should I quit my job?' });
    expect(system).toBe(FIRE_SYSTEM_PROMPT);
    expect(system).toMatch(/never say/i);
    expect(system.toLowerCase()).toContain('will');
    expect(user).toContain('Should I quit my job?');
    // jurisdiction vocabulary is part of the lens's identity
    expect(FIRE_JURISDICTION).toContain('ignition');
  });

  it('runs end-to-end with an injected completion', async () => {
    const complete: CompleteFn = async () => cleanFireJson;
    const p = await fireLens({ memberMessage: 'I keep explaining why I should leave.' }, complete);
    expect(p.impulseQuality).toBe('premature');
    expect(p.inflated).toBe(false);
    expect(p.consultNext).toContain('Water');
  });

  it('passes the member message (and context) into the completion call', async () => {
    let seenUser = '';
    const complete: CompleteFn = async ({ user }) => {
      seenUser = user;
      return cleanFireJson;
    };
    await fireLens({ memberMessage: 'There is a pull to start something new.', context: 'turn 3' }, complete);
    expect(seenUser).toContain('start something new');
    expect(seenUser).toContain('turn 3');
  });

  // ── Jurisdiction gate (v1.3) — the first universal lens primitive ──
  it('recognizes absence as out-of-jurisdiction, not as unclear', () => {
    const p = parseFirePerspective(
      JSON.stringify({
        inJurisdiction: false,
        vantage: 'There is no fire here to read — this is a request for information.',
        impulseQuality: null,
        confidence: 0.1,
      }),
    );
    expect(p.inJurisdiction).toBe(false);
    expect(p.impulseQuality).toBeNull();
  });

  it('nulls the quality and clears consultNext when out of jurisdiction, even if the model sent values', () => {
    const p = parseFirePerspective(
      JSON.stringify({ inJurisdiction: false, vantage: 'no fire', impulseQuality: 'clean', consultNext: ['Water'] }),
    );
    expect(p.impulseQuality).toBeNull();
    expect(p.consultNext).toEqual([]);
  });

  it('reserves "unclear" for in-jurisdiction-but-unreadable (fire present, quality unresolvable)', () => {
    const p = parseFirePerspective(
      JSON.stringify({ inJurisdiction: true, vantage: 'There is heat but I cannot read its shape.', impulseQuality: 'unclear' }),
    );
    expect(p.inJurisdiction).toBe(true);
    expect(p.impulseQuality).toBe('unclear');
  });

  it('defaults to in-jurisdiction when the gate is not declared (backward compatible)', () => {
    const p = parseFirePerspective(JSON.stringify({ vantage: 'gathered and ready', impulseQuality: 'clean' }));
    expect(p.inJurisdiction).toBe(true);
    expect(p.impulseQuality).toBe('clean');
  });

  // ── Phase axis (v1.4) — lens primitive #2; read after quality, never artificially balanced ──
  it('reads phase when in jurisdiction', () => {
    const p = parseFirePerspective(
      JSON.stringify({ inJurisdiction: true, vantage: 'something wants to begin', impulseQuality: 'clean', phase: 'emergence' }),
    );
    expect(p.phase).toBe('emergence');
  });

  it('nulls phase when out of jurisdiction (even if a phase is sent)', () => {
    const p = parseFirePerspective(JSON.stringify({ inJurisdiction: false, vantage: 'no fire', phase: 'emergence' }));
    expect(p.phase).toBeNull();
  });

  it('leaves phase null (does not guess) when no valid phase is supplied — no manufactured balance', () => {
    const p = parseFirePerspective(JSON.stringify({ inJurisdiction: true, vantage: 'x', impulseQuality: 'dimmed' }));
    expect(p.phase).toBeNull();
  });

  it('coerces an invalid phase to null', () => {
    const p = parseFirePerspective(JSON.stringify({ inJurisdiction: true, vantage: 'x', impulseQuality: 'clean', phase: 'volcanic' }));
    expect(p.phase).toBeNull();
  });

  it('captures phaseVector when present, null otherwise', () => {
    const a = parseFirePerspective(
      JSON.stringify({ inJurisdiction: true, vantage: 'x', impulseQuality: 'clean', phase: 'emergence', phaseVector: 'emergence reaching toward embodiment' }),
    );
    expect(a.phaseVector).toBe('emergence reaching toward embodiment');
    const b = parseFirePerspective(JSON.stringify({ inJurisdiction: true, vantage: 'x', impulseQuality: 'clean', phase: 'emergence' }));
    expect(b.phaseVector).toBeNull();
  });

  it('recovers JSON wrapped in prose (parser hardening — fixes the observation artifacts)', () => {
    const p = parseFirePerspective(
      'Here is my reading:\n{"inJurisdiction": true, "vantage": "fire gathering", "impulseQuality": "clean", "phase": "emergence"}\nHope that helps.',
    );
    expect(p.impulseQuality).toBe('clean');
    expect(p.phase).toBe('emergence');
  });
});
