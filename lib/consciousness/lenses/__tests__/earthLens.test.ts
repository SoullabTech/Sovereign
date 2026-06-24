import {
  earthLens,
  buildEarthMessages,
  parseEarthPerspective,
  EARTH_SYSTEM_PROMPT,
  EARTH_JURISDICTION,
  type CompleteFn,
} from '../earthLens';

const cleanEarthJson = JSON.stringify({
  inJurisdiction: true,
  vantage: 'The structure is sound, but it is carrying more than it was built to hold.',
  formQuality: 'overextended',
  whatICannotSee: ['what wants to move beneath this (Fire)', 'what is felt about it (Water)'],
  consultNext: ['Fire'],
  uncertainty: 'I cannot tell whether the ground was ever adequate or has only recently given way.',
  confidence: 0.7,
});

describe('Earth Lens v1 — a reader of form, not movement', () => {
  it('parses a well-formed Earth vantage', () => {
    const p = parseEarthPerspective(cleanEarthJson);
    expect(p.lens).toBe('Earth');
    expect(p.formQuality).toBe('overextended');
    expect(p.confidence).toBeCloseTo(0.7);
  });

  it('always carries edge-awareness', () => {
    expect(parseEarthPerspective(cleanEarthJson).whatICannotSee.length).toBeGreaterThan(0);
  });

  it('the hearth holds: a true vantage passes the lint', () => {
    expect(parseEarthPerspective(cleanEarthJson).inflated).toBe(false);
  });

  it('the hearth catches command-drift', () => {
    const drifted = JSON.stringify({
      inJurisdiction: true,
      vantage: 'You must let this go. You need to build something new.',
      formQuality: 'eroding',
    });
    expect(parseEarthPerspective(drifted).inflated).toBe(true);
  });

  it('recognizes absence (no form) as out-of-jurisdiction, not unformed', () => {
    const p = parseEarthPerspective(
      JSON.stringify({ inJurisdiction: false, vantage: 'There is no form here — a logistical fact.', formQuality: null }),
    );
    expect(p.inJurisdiction).toBe(false);
    expect(p.formQuality).toBeNull();
  });

  it('nulls quality + consult when out of jurisdiction, even if sent', () => {
    const p = parseEarthPerspective(
      JSON.stringify({ inJurisdiction: false, vantage: 'x', formQuality: 'grounded', consultNext: ['Fire'] }),
    );
    expect(p.formQuality).toBeNull();
    expect(p.consultNext).toEqual([]);
  });

  it('coerces an invalid formQuality to unformed (in jurisdiction)', () => {
    const p = parseEarthPerspective(JSON.stringify({ inJurisdiction: true, vantage: 'x', formQuality: 'liquid' }));
    expect(p.formQuality).toBe('unformed');
  });

  it('recovers JSON wrapped in prose (parser hardening)', () => {
    const p = parseEarthPerspective('Here:\n{"inJurisdiction": true, "vantage": "this form has done its work", "formQuality": "fulfilled"}\nok');
    expect(p.formQuality).toBe('fulfilled');
  });

  it("builds messages carrying Earth's core question and the no-command constraint", () => {
    const { system, user } = buildEarthMessages({ memberMessage: "I've built this for fifteen years." });
    expect(system).toBe(EARTH_SYSTEM_PROMPT);
    expect(system.toLowerCase()).toContain('can it endure');
    expect(system).toMatch(/never say/i);
    expect(user).toContain('fifteen years');
    expect(EARTH_JURISDICTION).toContain('foundation');
  });

  it('runs end-to-end with an injected completion', async () => {
    const complete: CompleteFn = async () => cleanEarthJson;
    const p = await earthLens({ memberMessage: 'I have carried this responsibility a long time.' }, complete);
    expect(p.formQuality).toBe('overextended');
    expect(p.inflated).toBe(false);
  });
});
