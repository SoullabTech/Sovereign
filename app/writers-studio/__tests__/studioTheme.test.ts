import {
  assertFieldSurvivesCollapse,
  assertGoldIsBounded,
  assertGroundIsWarm,
  assertGroundRampOrdered,
  assertMaiaIsNotGold,
  assertPanelsAreNotFurniture,
  assertProseOutranksChrome,
  assertSpacingOrdered,
  assertStudioThemeCoherent,
  GOLD,
  GROUND,
  INSIGHT_CHIP,
  MAIA_ACCENT,
  MEASURE,
  PANELS,
  PRESS,
  RULE,
  TYPE,
} from '../studioTheme';

/**
 * The visual foundation, made executable.
 *
 * These are not snapshot tests and they are not a substitute for visual
 * acceptance — DESIGN-CONTRACT §3 requires a capture compared against the
 * reference image, and no unit test can do that. What they can do is refuse
 * the drifts that are invisible in a code review: gold spreading into
 * surfaces, MAIA quietly recoloured to match the work, chrome growing past
 * prose, a contextual panel becoming permanent furniture.
 */
describe('the foundation is coherent', () => {
  it('passes every invariant at once', () => {
    expect(() => assertStudioThemeCoherent()).not.toThrow();
  });
});

describe('ground — a warm ramp, not a flat colour', () => {
  it('ships monotonic', () => {
    expect(() => assertGroundRampOrdered()).not.toThrow();
  });

  it('ships warm — espresso, never charcoal', () => {
    expect(() => assertGroundIsWarm()).not.toThrow();
  });

  it('does not fork the palette: base is the existing PRESS ground', () => {
    // pressTheme.ts is duplicated into app/press/manuscript while #825 is open.
    // If these drift apart the member feels they changed products mid-session.
    expect(GROUND.base).toBe(PRESS.ink);
    expect(RULE.DEFAULT).toBe(PRESS.rule);
    expect(GOLD.DEFAULT).toBe(PRESS.accent);
  });
});

describe('gold — accent and emphasis, never decoration', () => {
  it('keeps its permitted and forbidden uses disjoint', () => {
    expect(() => assertGoldIsBounded()).not.toThrow();
  });

  it('refuses a ground that has become a gold surface', () => {
    const original = GROUND.field;
    try {
      // A plausible drift: someone "warms up" the writing field.
      (GROUND as Record<string, string>).field = '#C9A227';
      expect(() => assertGoldIsBounded()).toThrow(/gold surface/);
    } finally {
      (GROUND as Record<string, string>).field = original;
    }
  });
});

describe('MAIA is visually distinct from the member’s work (D-019)', () => {
  it('does not speak in gold', () => {
    expect(() => assertMaiaIsNotGold()).not.toThrow();
  });

  it('refuses MAIA being recoloured into the work’s accent', () => {
    const original = MAIA_ACCENT.voice;
    try {
      (MAIA_ACCENT as Record<string, string>).voice = GOLD.text;
      expect(() => assertMaiaIsNotGold()).toThrow(/D-019/);
    } finally {
      (MAIA_ACCENT as Record<string, string>).voice = original;
    }
  });

  it('sets MAIA’s reading in sans, not in the manuscript’s own face', () => {
    // Setting her language in the serif the member writes in would blur the
    // line the object model keeps: member material vs MAIA interpretation.
    expect(TYPE.maiaReading.family).not.toBe(TYPE.prose.family);
  });
});

describe('insight chips encode kind, never severity', () => {
  it('offers no ranked or alarm-coloured chip', () => {
    // A red "critical" chip would be a machine judgement wearing the costume
    // of a category — D-003, and maiaOffering.ts's rule at the visual layer.
    const names = Object.keys(INSIGHT_CHIP);
    for (const banned of ['critical', 'severe', 'warning', 'high', 'low', 'error']) {
      expect(names).not.toContain(banned);
    }
  });

  it('gives every chip both a ground and a legible ink', () => {
    for (const [name, chip] of Object.entries(INSIGHT_CHIP)) {
      expect(chip.bg).toMatch(/^#[0-9A-F]{6}$/i);
      expect(chip.ink).toMatch(/^#[0-9A-F]{6}$/i);
      expect(chip.bg).not.toBe(chip.ink);
      expect(name).toBeTruthy();
    }
  });
});

describe('long-form reading is the primary act', () => {
  it('keeps every chrome role smaller than prose', () => {
    expect(() => assertProseOutranksChrome()).not.toThrow();
  });

  it('refuses navigation grown to prose size', () => {
    const original = TYPE.navItem.size;
    try {
      TYPE.navItem.size = TYPE.prose.size;
      expect(() => assertProseOutranksChrome()).toThrow(/column\s+of prose/);
    } finally {
      TYPE.navItem.size = original;
    }
  });

  it('caps the prose measure rather than letting the column grow with the viewport', () => {
    expect(MEASURE.prose).toBeLessThanOrEqual(75);
    expect(MEASURE.prose).toBeGreaterThanOrEqual(60);
  });
});

describe('panels are contextual, not furniture', () => {
  it('ships with every contextual panel dismissible', () => {
    expect(() => assertPanelsAreNotFurniture()).not.toThrow();
  });

  it('lets only the writing field be undismissable — a member cannot dismiss their work', () => {
    const undismissable = PANELS.filter((p) => !p.dismissible).map((p) => p.role);
    expect(undismissable).toEqual(['writing-field']);
  });

  it('refuses a permanent MAIA panel', () => {
    const maia = PANELS.find((p) => p.role === 'maia')!;
    const original = maia.dismissible;
    try {
      maia.dismissible = false;
      expect(() => assertPanelsAreNotFurniture()).toThrow(/permanent furniture/);
    } finally {
      maia.dismissible = original;
    }
  });
});

describe('responsive — chrome yields before the writing field', () => {
  it('never collapses the field, and demotes Materials before the outline', () => {
    expect(() => assertFieldSurvivesCollapse()).not.toThrow();
  });

  it('keeps the spacing scale ordered, since spacing is structure', () => {
    expect(() => assertSpacingOrdered()).not.toThrow();
  });
});
