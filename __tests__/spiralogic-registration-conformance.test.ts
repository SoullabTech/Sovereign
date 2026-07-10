/**
 * Spiralogic Registration Grammar — Conformance Suite
 *
 * Spec:   docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md
 * Target: lib/astrology/engines/spiralogicEngine.ts (AS-IS — zero product-code changes)
 * Report: docs/specs/SPIRALOGIC_REGISTRATION_CONFORMANCE_REPORT_2026-07-09.md
 *
 * DISCIPLINE: every assertion below derives from the spec's sign table, INV-1..8,
 * ratified decisions (Q0, Q2, Q3, Q6=Option C, Q7) and proposed defaults (Q1, Q4, Q5) —
 * NOT from the engine's current behavior. Tests are EXPECTED to fail where the engine
 * diverges; each failure is classified in the report as spec-hole / engine-bug /
 * undocumented-decision.
 *
 * Tests prefixed [DOC] are behavior-documentation pins (they assert observed engine
 * behavior so the report can cite it precisely); they are NOT conformance assertions
 * and are labeled to prevent grandfathering.
 *
 * The engine consumes pre-resolved sign strings (PlanetPosition.sign), never ecliptic
 * longitudes — so INV-5 (cusp determinism) and the historical-dates boundary row are
 * structurally upstream (ephemerisCalculator.longitudeToZodiac, unexported). See the
 * INV-5 block for what IS assertable at this layer.
 */

import { runSpiralogicEngine } from "@/lib/astrology/engines/spiralogicEngine";
import type { BirthChart, PlanetPosition } from "@/lib/astrology/ephemerisCalculator";
import type { AstrologyIntake } from "@/lib/astrology/astrologyIntakeSchema";

// ---------------------------------------------------------------------------
// Fixtures — hardcoded positions (spec: the grammar consumes positions, never
// computes them; no ephemeris calls anywhere in this suite)
// ---------------------------------------------------------------------------

const INTAKE = {} as AstrologyIntake; // engine signature requires it; unused by balance math

function pos(sign: string, degree = 15, house = 1): PlanetPosition {
  return { sign, degree, house };
}

/** The ten Q1 bodies, keyed by BirthChart field name. */
const Q1_BODIES = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

type Q1Body = (typeof Q1_BODIES)[number];

/**
 * Build a full BirthChart with every Q1 body at a named sign.
 * Non-Q1 fields (chiron, nodes, asteroids, angles, houses, aspects) are stubbed;
 * the conformance target reads only sun..pluto {sign, house}.
 */
function makeChart(placements: Partial<Record<Q1Body, PlanetPosition>>, defaults = pos("Aries")): BirthChart {
  const chart: Record<string, unknown> = {};
  for (const body of Q1_BODIES) {
    chart[body] = placements[body] ?? { ...defaults };
  }
  chart.chiron = pos("Aries");
  chart.northNode = pos("Aries");
  chart.southNode = pos("Libra");
  chart.lilith = pos("Aries");
  chart.ceres = pos("Aries");
  chart.pallas = pos("Aries");
  chart.juno = pos("Aries");
  chart.vesta = pos("Aries");
  chart.ascendant = { sign: "Aries", degree: 0 };
  chart.midheaven = { sign: "Capricorn", degree: 0 };
  chart.houses = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  chart.aspects = [];
  return chart as unknown as BirthChart;
}

/** Spec Q2 sign table — THE grammar. element + phase (Cardinal→1, Fixed→2, Mutable→3). */
const SPEC_SIGN_TABLE: Record<string, { element: "fire" | "water" | "earth" | "air"; phase: 1 | 2 | 3 }> = {
  Aries: { element: "fire", phase: 1 },
  Leo: { element: "fire", phase: 2 },
  Sagittarius: { element: "fire", phase: 3 },
  Cancer: { element: "water", phase: 1 },
  Scorpio: { element: "water", phase: 2 },
  Pisces: { element: "water", phase: 3 },
  Capricorn: { element: "earth", phase: 1 },
  Taurus: { element: "earth", phase: 2 },
  Virgo: { element: "earth", phase: 3 },
  Libra: { element: "air", phase: 1 },
  Aquarius: { element: "air", phase: 2 },
  Gemini: { element: "air", phase: 3 },
};

const SPEC_PHASE_KEYS = Object.values(SPEC_SIGN_TABLE).map((r) => `${r.element}${r.phase}`);
const UNIQUE_PHASE_KEYS = [...new Set(SPEC_PHASE_KEYS)]; // 12 keys

/** Mixed fixture A — one body per sign-family spread, used for shape/determinism tests. */
const FIXTURE_A = makeChart({
  sun: pos("Leo", 15, 5),
  moon: pos("Cancer", 3, 4),
  mercury: pos("Virgo", 22, 6),
  venus: pos("Libra", 8, 7),
  mars: pos("Aries", 29, 1),
  jupiter: pos("Sagittarius", 11, 9),
  saturn: pos("Capricorn", 17, 10),
  uranus: pos("Aquarius", 25, 11),
  neptune: pos("Pisces", 19, 12),
  pluto: pos("Scorpio", 7, 8),
});

async function run(chart: BirthChart) {
  const result = await runSpiralogicEngine(INTAKE, chart);
  if (!result) throw new Error("engine returned null for a complete chart");
  return result;
}

// ---------------------------------------------------------------------------
// INV-1 — Determinism: identical birth data → identical profile, byte-for-byte;
// version identity via mandatory grammar_version
// ---------------------------------------------------------------------------

describe("INV-1 Determinism", () => {
  test("identical input twice → deep-equal output", async () => {
    const a = await run(FIXTURE_A);
    const b = await run(FIXTURE_A);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  test("profile carries mandatory grammar_version (version identity)", async () => {
    const result = await run(FIXTURE_A);
    expect(result).toHaveProperty("grammar_version");
    expect((result as Record<string, unknown>)["grammar_version"]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// INV-2 — Totality: every Q1 body registers to exactly one phase;
// Q2 sign table; Q5 equal weights (proposed default 1.0)
// ---------------------------------------------------------------------------

describe("INV-2 Totality (Q1 closed set, Q2 sign table, Q5 weights)", () => {
  test.each(Object.entries(SPEC_SIGN_TABLE))(
    "sign table (element axis): all ten bodies in %s → 100%% of weight in %p.element",
    async (sign, expected) => {
      const result = await run(makeChart({}, pos(sign)));
      const balance = result.elementalBalance as unknown as Record<string, number>;
      expect(balance[expected.element]).toBe(100);
      for (const other of ["fire", "water", "earth", "air"].filter((e) => e !== expected.element)) {
        expect(balance[other]).toBe(0);
      }
    }
  );

  test("sign table (phase axis): registration resolves to element×phase, not element alone", async () => {
    // Spec: Aries → fire·1, Leo → fire·2, Sagittarius → fire·3. An engine that
    // registers all three identically as "fire" has no phase concept.
    const result = await run(FIXTURE_A);
    const r = result as unknown as Record<string, unknown>;
    const distribution = (r["distribution"] ?? r["phases"] ?? null) as Record<string, number> | null;
    expect(distribution).not.toBeNull(); // structural: engine emits no 12-phase distribution
    for (const key of UNIQUE_PHASE_KEYS) {
      expect(distribution).toHaveProperty(key);
    }
  });

  test("Q5 equal weights: moving Sun vs moving Pluto shifts the distribution identically", async () => {
    // Baseline: all ten in Aries. Spec (all bodies 1.0): moving any single body
    // to Cancer moves exactly 1/10 of total weight into water — regardless of which body.
    const sunMoved = await run(makeChart({ sun: pos("Cancer") }));
    const plutoMoved = await run(makeChart({ pluto: pos("Cancer") }));
    expect(sunMoved.elementalBalance.water).toEqual(plutoMoved.elementalBalance.water);
  });

  test("Q1 closed set: Chiron and North Node do not register", async () => {
    // Fixture: all ten Q1 bodies in Aries (fire); chiron/northNode stubbed in Aries by
    // makeChart. Re-point chiron+node at Cancer: spec says water stays 0.
    const chart = makeChart({});
    (chart as unknown as Record<string, PlanetPosition>)["chiron"] = pos("Cancer");
    (chart as unknown as Record<string, PlanetPosition>)["northNode"] = pos("Cancer");
    const result = await run(chart);
    expect(result.elementalBalance.water).toBe(0);
    expect(result.elementalBalance.fire).toBe(100);
  });

  test("totality: a body with an unknown sign must not silently vanish", async () => {
    // Spec INV-2: every body in the closed set registers to exactly one phase
    // (Moon-split the sole flagged exception). A typo'd/unknown sign is neither
    // registerable nor flagged — it must surface as an explicit error or flag.
    const chart = makeChart({ mars: pos("Ophiuchus") });
    let threw = false;
    let result: Awaited<ReturnType<typeof run>> | null = null;
    try {
      result = await run(chart);
    } catch {
      threw = true;
    }
    if (!threw && result) {
      // if it did not throw, it must have flagged the degradation explicitly
      const r = result as unknown as Record<string, unknown>;
      const flagged =
        r["degraded"] !== undefined || r["errors"] !== undefined || r["unregistered"] !== undefined;
      expect(flagged).toBe(true);
    } else {
      expect(threw).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// INV-3 — Output shape: distribution + derivations + grammar_version + mode;
// derivations are pure functions of the distribution
// ---------------------------------------------------------------------------

describe("INV-3 Output shape", () => {
  test("profile = distribution + grammar_version + mode (+ input fingerprint)", async () => {
    const result = await run(FIXTURE_A);
    const r = result as unknown as Record<string, unknown>;
    expect(r).toHaveProperty("distribution");
    expect(r).toHaveProperty("grammar_version");
    expect(r).toHaveProperty("mode");
  });

  test("registration layer emits no interpretive content (hierarchy: registration vs modulation)", async () => {
    // Spec: "Modulation layers are out of scope for v1 registration — they belong to
    // interpretation (rendering / MAIA), never to the base profile."
    const result = await run(FIXTURE_A);
    const r = result as unknown as Record<string, unknown>;
    expect(r["coherencePractices"]).toBeUndefined();
    expect(r["currentPhase"]).toBeUndefined();
    expect(r["activeFacets"]).toBeUndefined();
  });

  test("distribution conserves total registered weight (no lossy normalization)", async () => {
    // Partition chosen so the engine's rounded-percent representation sums to 99:
    // fire 5.5 (Sun 3 + Venus 1.5 + Uranus 1), water 5.5 (Moon 3 + Mars 1.5 + Neptune 1),
    // earth 5 (Jupiter 2 + Saturn 2 + Mercury 1), air 1 (Pluto 1) — total 17.
    // Spec: distribution is weight-per-phase; any normalized representation must at
    // minimum be self-consistent (sum to its own whole).
    const chart = makeChart({
      sun: pos("Aries"), venus: pos("Leo"), uranus: pos("Sagittarius"),
      moon: pos("Cancer"), mars: pos("Scorpio"), neptune: pos("Pisces"),
      jupiter: pos("Taurus"), saturn: pos("Virgo"), mercury: pos("Capricorn"),
      pluto: pos("Libra"),
    });
    const result = await run(chart);
    const { fire, water, earth, air } = result.elementalBalance;
    expect(fire + water + earth + air).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// INV-4 — Ontology-closed: emitted vocabulary ⊆ {fire,water,earth,air}×{1,2,3}
// ∪ {aether-as-structural-position}
// ---------------------------------------------------------------------------

describe("INV-4 Ontology-closed", () => {
  test("element vocabulary is closed over {fire, water, earth, air}", async () => {
    const result = await run(FIXTURE_A);
    const numericKeys = Object.entries(result.elementalBalance)
      .filter(([, v]) => typeof v === "number")
      .map(([k]) => k);
    for (const key of numericKeys) {
      expect(["fire", "water", "earth", "air"]).toContain(key);
    }
  });

  test("phase vocabulary is closed over {1, 2, 3}", async () => {
    // Spec ontology admits phases 1|2|3 only. The engine's currentPhase.stage emits
    // 'vector' | 'circle' | 'spiral' — vocabulary outside the closed ontology.
    const result = await run(FIXTURE_A);
    const r = result as unknown as Record<string, unknown>;
    const currentPhase = r["currentPhase"] as { stage?: unknown } | undefined;
    if (currentPhase !== undefined) {
      expect([1, 2, 3]).toContain(currentPhase.stage);
    }
  });

  test("grammar layer emits no dominance crown (Q6 RATIFIED = Option C)", async () => {
    // Ratified: "no automatic 'dominant element' crown in the base grammar."
    // Pre-flagged undocumented-decision: spiralogicEngine.ts:108-114 emits `dominant`.
    const result = await run(FIXTURE_A);
    expect((result.elementalBalance as unknown as Record<string, unknown>)["dominant"]).toBeUndefined();
    expect((result.elementalBalance as unknown as Record<string, unknown>)["deficient"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// INV-5 — Cusp determinism: half-open [0°, 30°) intervals; boundaries at
// 29°59′59.99″ and 0°00′00″ exactly.
// STRUCTURAL NOTE: the engine consumes pre-resolved sign strings; longitude→sign
// happens upstream in ephemerisCalculator.longitudeToZodiac (unexported, :78-89).
// Only sign-string passthrough is assertable at this layer.
// ---------------------------------------------------------------------------

describe("INV-5 Cusp determinism (assertable slice: sign passthrough, degree-invariance)", () => {
  test("a body at 29°59′59.99″ of Aries (sign already resolved) registers fire", async () => {
    // 29°59′59.99″ = 29.9999972°
    const result = await run(makeChart({}, pos("Aries", 29.9999972)));
    expect(result.elementalBalance.fire).toBe(100);
  });

  test("a body at exactly 0°00′00″ of Taurus registers earth (half-open interval)", async () => {
    const result = await run(makeChart({}, pos("Taurus", 0)));
    expect(result.elementalBalance.earth).toBe(100);
  });

  test("registration depends on sign only, never on degree (degree cannot flip registration)", async () => {
    const atStart = await run(makeChart({}, pos("Leo", 0)));
    const atEnd = await run(makeChart({}, pos("Leo", 29.9999972)));
    expect(atStart.elementalBalance).toEqual(atEnd.elementalBalance);
  });

  test.todo(
    "NOT TESTABLE HERE: longitude→sign half-open rule lives upstream in unexported " +
      "ephemerisCalculator.longitudeToZodiac (lib/astrology/ephemerisCalculator.ts:78-89). " +
      "Observed there: sign via Math.floor (half-open, conformant) but degree via " +
      "toFixed(2) rounds 29.9999972 → 30.00, emitting degree 30 inside a sign — a " +
      "representation that escapes [0°, 30°). See report."
  );
});

// ---------------------------------------------------------------------------
// INV-6 — Degraded input explicit: unknown time → mode:'noon' (+ moonUncertain
// when applicable); never a silent guess
// ---------------------------------------------------------------------------

describe("INV-6 Degraded input explicit (Q4)", () => {
  test("profile declares its mode (e.g. 'noon' for unknown birth time)", async () => {
    const result = await run(FIXTURE_A);
    expect((result as unknown as Record<string, unknown>)["mode"]).toBeDefined();
  });

  test("Moon sign ambiguity is expressible (moonUncertain travels with the distribution)", async () => {
    // Q4 under Option C: both Moon-branch distributions emitted, moonUncertain: true
    // travels; the flag does not evaporate in transit. The engine's input shape
    // (a single resolved sign per body) cannot express a Moon branch at all.
    const result = await run(FIXTURE_A);
    const r = result as unknown as Record<string, unknown>;
    // A conformant profile has the field (false when time is known)
    expect(r["moonUncertain"]).toBeDefined();
  });

  test("a missing body is an explicit degradation, not a silent skip", async () => {
    // Engine loop: `if (planet.data?.sign)` — a body with no sign silently
    // contributes nothing. Spec: "never a silent guess."
    const chart = makeChart({});
    (chart as unknown as Record<string, unknown>)["moon"] = undefined;
    const result = await runSpiralogicEngine(INTAKE, chart);
    if (result === null) {
      // explicit refusal would be acceptable
      expect(result).toBeNull();
    } else {
      const r = result as unknown as Record<string, unknown>;
      const flagged =
        r["degraded"] !== undefined || r["errors"] !== undefined || r["missingBodies"] !== undefined;
      expect(flagged).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// INV-7 — No aether metric: the profile contains no computed aether/coherence value
// ---------------------------------------------------------------------------

describe("INV-7 No aether metric (Q0 constitutional guard)", () => {
  test("no numeric aether key anywhere in the profile", async () => {
    const result = await run(FIXTURE_A);
    const flat = JSON.parse(JSON.stringify(result)) as Record<string, unknown>;
    const findNumericKey = (obj: unknown, name: string): boolean => {
      if (obj === null || typeof obj !== "object") return false;
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (k.toLowerCase().includes(name) && typeof v === "number") return true;
        if (typeof v === "object" && findNumericKey(v, name)) return true;
      }
      return false;
    };
    expect(findNumericKey(flat, "aether")).toBe(false);
  });

  test("no computed coherence value (index, score, or metric)", async () => {
    const result = await run(FIXTURE_A);
    const flat = JSON.parse(JSON.stringify(result)) as Record<string, unknown>;
    const findNumericKey = (obj: unknown, name: string): boolean => {
      if (obj === null || typeof obj !== "object") return false;
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (k.toLowerCase().includes(name) && typeof v === "number") return true;
        if (typeof v === "object" && findNumericKey(v, name)) return true;
      }
      return false;
    };
    expect(findNumericKey(flat, "coherence")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// INV-8 — Two provenance axes, same row (schema-level: portrait provenance rows
// must carry grammar_version + model-provenance together)
// ---------------------------------------------------------------------------

describe("INV-8 Two provenance axes", () => {
  test.todo(
    "NOT TESTABLE HERE: INV-8 binds at the portrait schema (Gate 3), not at the " +
      "registration function. The function-level slice — that the profile emits " +
      "grammar_version at all — is asserted under INV-1 and INV-3 (currently absent)."
  );
});

// ---------------------------------------------------------------------------
// Boundary cases (spec table)
// ---------------------------------------------------------------------------

describe("Boundary cases", () => {
  test("retrograde is modulation, not registration: input shape cannot alter registration", async () => {
    // PlanetPosition carries no retrograde field, so retrograde structurally cannot
    // affect the engine's registration — conformant by absence. A retrograde Mars in
    // Leo is whatever a Mars in Leo is.
    const direct = await run(makeChart({ mars: pos("Leo") }));
    const alsoDirect = await run(makeChart({ mars: pos("Leo") })); // no retro flag exists to set
    expect(direct.elementalBalance).toEqual(alsoDirect.elementalBalance);
  });

  test("[DOC] tie behavior pin: exact fire/water tie is crowned by element-array insertion order", async () => {
    // NOT a conformance assertion (Q6=C: ties belong to the interpretive layer;
    // the grammar has no dominance to tie). This pins observed engine behavior for
    // the report: fire 5 (Sun 3 + Jupiter 2), water 5 (Moon 3 + Pluto... )
    // fire: Sun Leo 3 + Jupiter Sagittarius 2 = 5
    // water: Moon Cancer 3 + Saturn Scorpio 2 = 5
    // earth: Mercury Virgo 1 + Venus Taurus 1.5 + Mars Capricorn 1.5 = 4
    // air:   Uranus Aquarius 1 + Neptune Libra 1 + Pluto Gemini 1 = 3
    const chart = makeChart({
      sun: pos("Leo"), jupiter: pos("Sagittarius"),
      moon: pos("Cancer"), saturn: pos("Scorpio"),
      mercury: pos("Virgo"), venus: pos("Taurus"), mars: pos("Capricorn"),
      uranus: pos("Aquarius"), neptune: pos("Libra"), pluto: pos("Gemini"),
    });
    const result = await run(chart);
    expect(result.elementalBalance.fire).toEqual(result.elementalBalance.water); // genuine tie
    // Observed: sorted[0] under a tie is whichever element precedes in
    // ["fire","water","earth","air"] — an arbitrary, insertion-order crown.
    expect(result.elementalBalance.dominant).toBe("fire");
  });

  test("unknown birth time row: covered under INV-6 (mode:'noon' + Moon split) — see failures there", () => {
    // Cross-reference test: the boundary row is asserted by INV-6 tests above.
    expect(true).toBe(true);
  });
});
