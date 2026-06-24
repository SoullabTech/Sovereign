import {
  waterLens,
  buildWaterMessages,
  parseWaterPerspective,
  WATER_SYSTEM_PROMPT,
  WATER_JURISDICTION,
  type CompleteFn,
} from '../waterLens';

const cleanWaterJson = JSON.stringify({
  inJurisdiction: true,
  vantage: 'The grief is moving, but slowly, against something that will not yet give way.',
  currentQuality: 'held',
  whatICannotSee: ['whether the will to act on this has gathered (Fire)', 'what this would cost (Earth)'],
  consultNext: ['Fire'],
  uncertainty: 'I cannot tell if the holding is protection or habit.',
  confidence: 0.6,
});

describe('Water Lens v1 — a current-reader, not an emotion-namer', () => {
  it('parses a well-formed Water vantage', () => {
    const p = parseWaterPerspective(cleanWaterJson);
    expect(p.lens).toBe('Water');
    expect(p.currentQuality).toBe('held');
    expect(p.confidence).toBeCloseTo(0.6);
  });

  it('always carries edge-awareness', () => {
    expect(parseWaterPerspective(cleanWaterJson).whatICannotSee.length).toBeGreaterThan(0);
  });

  it('the hearth holds: a true vantage passes the lint', () => {
    expect(parseWaterPerspective(cleanWaterJson).inflated).toBe(false);
  });

  it('the hearth catches therapeutic command-drift', () => {
    const drifted = JSON.stringify({
      inJurisdiction: true,
      vantage: 'You must let go of this grief. You need to release it now.',
      currentQuality: 'held',
    });
    expect(parseWaterPerspective(drifted).inflated).toBe(true);
  });

  it('recognizes absence (no current) as out-of-jurisdiction, not murky', () => {
    const p = parseWaterPerspective(
      JSON.stringify({ inJurisdiction: false, vantage: 'There is no current here — a logistical question.', currentQuality: null }),
    );
    expect(p.inJurisdiction).toBe(false);
    expect(p.currentQuality).toBeNull();
  });

  it('nulls quality + consult when out of jurisdiction, even if sent', () => {
    const p = parseWaterPerspective(
      JSON.stringify({ inJurisdiction: false, vantage: 'x', currentQuality: 'flowing', consultNext: ['Fire'] }),
    );
    expect(p.currentQuality).toBeNull();
    expect(p.consultNext).toEqual([]);
  });

  it('coerces an invalid currentQuality to murky (in jurisdiction)', () => {
    const p = parseWaterPerspective(JSON.stringify({ inJurisdiction: true, vantage: 'x', currentQuality: 'volcanic' }));
    expect(p.currentQuality).toBe('murky');
  });

  it('recovers JSON wrapped in prose (parser hardening)', () => {
    const p = parseWaterPerspective('Here:\n{"inJurisdiction": true, "vantage": "the tide is turning", "currentQuality": "releasing"}\nok');
    expect(p.currentQuality).toBe('releasing');
  });

  it("builds messages carrying Water's core question and the no-command constraint", () => {
    const { system, user } = buildWaterMessages({ memberMessage: "I can't stop crying." });
    expect(system).toBe(WATER_SYSTEM_PROMPT);
    expect(system.toLowerCase()).toContain('what is moving');
    expect(system).toMatch(/never say/i);
    expect(user).toContain("can't stop crying");
    expect(WATER_JURISDICTION).toContain('grief');
  });

  it('runs end-to-end with an injected completion', async () => {
    const complete: CompleteFn = async () => cleanWaterJson;
    const p = await waterLens({ memberMessage: 'The grief sits in my chest.' }, complete);
    expect(p.currentQuality).toBe('held');
    expect(p.inflated).toBe(false);
  });
});
