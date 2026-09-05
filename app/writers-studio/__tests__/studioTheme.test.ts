import {
  assertContextualPanelsAreDismissible,
  assertEveryTokenGroupHasProvenance,
  assertGoldIsBounded,
  assertGroundIsWarm,
  assertGroundRampOrdered,
  assertMaiaIsVisuallyDistinctFromTheWork,
  assertProseOutranksChrome,
  assertResponsiveClaimsAreObserved,
  assertSpacingOrdered,
  assertStudioThemeCoherent,
  GOLD,
  GROUND,
  INSIGHT_CHIP,
  MAIA_ACCENT,
  MEASURE,
  NEVER_COLLAPSES,
  PANELS,
  PRESENT_AT_COMPACT,
  PRESS,
  PROVENANCE,
  RULE,
  TYPE,
  YIELDS_BEFORE,
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

describe('MAIA is visually distinct from the member’s work (screen 04; D-019 is why)', () => {
  it('does not speak in gold', () => {
    expect(() => assertMaiaIsVisuallyDistinctFromTheWork()).not.toThrow();
  });

  it('refuses MAIA being recoloured into the work’s accent', () => {
    const original = MAIA_ACCENT.voice;
    try {
      (MAIA_ACCENT as Record<string, string>).voice = GOLD.text;
      expect(() => assertMaiaIsVisuallyDistinctFromTheWork()).toThrow(/Screen 04/);
    } finally {
      (MAIA_ACCENT as Record<string, string>).voice = original;
    }
  });

  it('sets MAIA’s reading in sans, as both references do', () => {
    // The font is the design contract's choice; D-019 is why holding it
    // matters. Neither decrees the other.
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
    expect(() => assertContextualPanelsAreDismissible()).not.toThrow();
  });

  it('refuses a permanent MAIA panel — she is contextual, so she must be dismissible', () => {
    const maia = PANELS.find((p) => p.role === 'maia')!;
    const original = maia.dismissible;
    try {
      maia.dismissible = false;
      expect(() => assertContextualPanelsAreDismissible()).toThrow(/permanent furniture/);
    } finally {
      maia.dismissible = original;
    }
  });

  it('does NOT rule that only the writing field may be undismissable', () => {
    // §2 establishes "contextual implies dismissible" and nothing more. A
    // future persistent structural rail could be undismissable without being
    // the permanent furniture the contract refuses, so the guard must stay
    // silent about non-contextual surfaces rather than pre-emptively ruling.
    const structuralRail = [
      ...PANELS,
      { role: 'shell-rail' as const, dismissible: false, contextual: false, placement: 'left' },
    ] as typeof PANELS;
    expect(() => {
      for (const p of structuralRail) {
        if (p.contextual && !p.dismissible) throw new Error('permanent furniture');
      }
    }).not.toThrow();
  });
});

describe('responsive — chrome yields before the writing field', () => {
  it('claims only what the references establish', () => {
    expect(() => assertResponsiveClaimsAreObserved()).not.toThrow();
  });

  it('records exactly one witnessed ordering — the rest would be prediction', () => {
    // 08 demotes Materials to a bottom strip while the outline keeps its rail.
    // That is the only collapse step any reference shows; there is nothing
    // narrower than 08 to establish a further sequence.
    expect(YIELDS_BEFORE).toEqual([['materials', 'manuscript-outline']]);
    expect(NEVER_COLLAPSES).toEqual(['writing-field']);
  });

  it('does not predict MAIA out of existence below the narrowest reference', () => {
    // §1 makes MAIA a persistent companion across the modes. A token file may
    // not decide her disappearance by inventing a breakpoint.
    expect(PRESENT_AT_COMPACT).toContain('maia');
  });

  it('keeps the spacing scale ordered, since spacing is structure', () => {
    expect(() => assertSpacingOrdered()).not.toThrow();
  });
});

describe('provenance — an unlabelled number inherits authority it has not earned', () => {
  it('labels every token group', () => {
    expect(() => assertEveryTokenGroupHasProvenance()).not.toThrow();
  });

  it('refuses a new token group that states no provenance', () => {
    expect(() => assertEveryTokenGroupHasProvenance(['ELEVATION'])).toThrow(/no provenance/);
  });

  it('does not claim measurement for values that were translated', () => {
    // The correction this scale exists for: colours were sampled, but a 216px
    // rail and a 1024px breakpoint are translations. Marking them SAMPLED
    // would make the first disagreeing capture look like a design violation
    // rather than a provisional number meeting a real screen.
    expect(PROVENANCE.BREAKPOINT.level).toBe('PROVISIONAL');
    expect(PROVENANCE.RADIUS.level).toBe('PROVISIONAL');
    expect(PROVENANCE.TYPE.level).toBe('DERIVED');
    expect(PROVENANCE.SPACE.level).toBe('DERIVED');
    // and does not understate the ones that were measured
    expect(PROVENANCE.GROUND.level).toBe('SAMPLED');
    expect(PROVENANCE.MAIA_ACCENT.level).toBe('SAMPLED');
    expect(PROVENANCE.RULE.level).toBe('INHERITED');
  });

  it('lets a PROVISIONAL value graduate only by actual measurement', () => {
    // MEASURE was PROVISIONAL. WS2-02B measured the column spans off 04, so
    // those moved to COLUMN_FRACTION as SAMPLED and MEASURE kept only its
    // translations, which are DERIVED. The pixel values stay DERIVED because
    // they depend on a viewport — proportions were measured, widths were not.
    expect(PROVENANCE.COLUMN_FRACTION.level).toBe('SAMPLED');
    expect(PROVENANCE.MEASURE.level).toBe('DERIVED');
  });
});
