/**
 * Astrology Reading Composer
 *
 * One input -> multiple engines -> one unified payload.
 * No HTTP hops. Engines are direct imports.
 *
 * Supports detailLevel: "mini" | "standard" | "full"
 * - mini: minimal summaries only
 * - standard (default): summaries, no raw arrays
 * - full: everything including raw engine data
 */

import type { AstrologyIntake } from "./astrologyIntakeSchema";
import type { Lens } from "./pickLenses";
import type {
  ComposerInput,
  ComposerSection,
  DetailLevel,
  IncludeFlags,
  UnifiedAstrologyReading,
} from "./types";

import { runBirthChartEngine, type BirthChartEngineResult } from "./engines/birthChartEngine";
import { runTransitsEngine, type TransitsEngineResult } from "./engines/transitsEngine";
import { runLifeCyclesEngine, type LifeCyclesEngineResult } from "./engines/lifeCyclesEngine";
import { runNarrativeEngine, type NarrativeEngineResult } from "./engines/narrativeEngine";
import { runSpiralogicEngine, type SpiralogicEngineResult } from "./engines/spiralogicEngine";
import { dominanceSentence, type DominanceVerdict } from "@/lib/spiralogic/interpretation";

function nowMs() {
  return Date.now();
}

function defaultInclude(): Required<IncludeFlags> {
  return {
    natalChart: true,
    transits: true,
    lifeCycles: true,
    narrative: true,
    spiralogic: true,
  };
}

function mergeInclude(partial?: IncludeFlags): Required<IncludeFlags> {
  return { ...defaultInclude(), ...(partial ?? {}) };
}

function wants(lenses: Lens[], lens: Lens) {
  return lenses.includes(lens);
}

function shouldIncludeRaw(detailLevel: DetailLevel, debug: boolean) {
  return debug || detailLevel === "full";
}

function pickTop<T>(arr: T[] | undefined, n: number): T[] {
  if (!arr?.length) return [];
  return arr.slice(0, n);
}

/**
 * Wrap engine execution with timing + error handling.
 */
async function timed<T>(
  fn: () => Promise<T>
): Promise<{ ok: true; data: T; ms: number } | { ok: false; error: string; ms: number }> {
  const t0 = nowMs();
  try {
    const data = await fn();
    const t1 = nowMs();
    return { ok: true, data, ms: t1 - t0 };
  } catch (e: any) {
    const t1 = nowMs();
    return { ok: false, error: e?.message ?? String(e), ms: t1 - t0 };
  }
}

/**
 * Build safe summaries from each engine output.
 * These are intentionally conservative and UI-friendly.
 */
function summarizeNatalChart(raw: BirthChartEngineResult | null, detailLevel: DetailLevel) {
  if (!raw) return undefined;

  const topAspectsCount = detailLevel === "mini" ? 3 : 5;

  return {
    big3: {
      sun: raw.summary.sun,
      moon: raw.summary.moon,
      rising: raw.summary.ascendant,
    },
    aspectCount: raw.summary.aspectCount,
    topAspects: pickTop(raw.chart?.aspects, topAspectsCount),
  };
}

function summarizeTransits(raw: TransitsEngineResult | undefined, detailLevel: DetailLevel) {
  if (!raw) return undefined;

  const n = detailLevel === "mini" ? 3 : 5;

  return {
    timestamp: raw.timestamp,
    aspectCount: raw.aspects?.length ?? 0,
    topAspects: pickTop(raw.aspects, n),
    hasPositions: !!raw.positions?.length,
    positionCount: raw.positions?.length ?? 0,
  };
}

function summarizeLifeCycles(raw: LifeCyclesEngineResult | null) {
  if (!raw) return undefined;

  return {
    age: raw.currentAge,
    consciousness: raw.consciousness.structure,
    saturnReturn: raw.saturnCycle.nextReturn
      ? {
          yearsAway: raw.saturnCycle.nextReturn.yearsAway,
          isActive: raw.saturnCycle.nextReturn.isActive,
        }
      : null,
    uranusOpposition: {
      progress: raw.uranusOpposition.progress,
      isActive: raw.uranusOpposition.isActive,
    },
    insight: raw.insight,
  };
}

function summarizeNarrative(raw: NarrativeEngineResult | null, detailLevel: DetailLevel) {
  if (!raw) return undefined;

  const maxChars = detailLevel === "mini" ? 500 : 1200;

  return {
    preview:
      typeof raw.narrative === "string"
        ? raw.narrative.slice(0, maxChars) + (raw.narrative.length > maxChars ? "..." : "")
        : undefined,
    method: raw.method,
    focus: raw.focus,
  };
}

function summarizeSpiralogic(raw: SpiralogicEngineResult | null) {
  if (!raw) return undefined;

  return {
    elementalBalance: raw.elementalBalance,
    dominantElement: raw.elementalBalance.dominant,
    deficientElement: raw.elementalBalance.deficient,
    practices: raw.coherencePractices.slice(0, 3),
    currentPhase: raw.currentPhase,
    activeFacetCount: raw.activeFacets.length,
  };
}

/**
 * Compose a unified astrology reading from intake data
 */
export async function composeAstrologyReading(input: ComposerInput): Promise<UnifiedAstrologyReading> {
  const intake: AstrologyIntake = input.intake;
  const lensesUsed: Lens[] = input.lensesUsed;

  const detailLevel: DetailLevel = input.detailLevel ?? "standard";
  const debug = !!input.debug;
  const include = mergeInclude(input.include);

  const includeRaw = shouldIncludeRaw(detailLevel, debug);

  // Engine run decisions (based on lenses + available data)
  const shouldRunBirthChart = include.natalChart && !!intake.birth;
  const shouldRunTransits =
    include.transits && (wants(lensesUsed, "timing") || !!intake.timing?.transits?.length);
  const shouldRunLifeCycles = include.lifeCycles && !!intake.birth?.date;
  const shouldRunNarrative =
    include.narrative &&
    (wants(lensesUsed, "mythic") || wants(lensesUsed, "developmental") || wants(lensesUsed, "integration"));
  const shouldRunSpiralogic = include.spiralogic && wants(lensesUsed, "spiralogic");

  // Run birth chart first since other engines may depend on it
  let birthChartResult: { ok: true; data: BirthChartEngineResult | null; ms: number } | { ok: false; error: string; ms: number } | null = null;
  if (shouldRunBirthChart) {
    birthChartResult = await timed(() => runBirthChartEngine(intake));
  }

  const birthChart = birthChartResult?.ok ? birthChartResult.data?.chart : undefined;

  // Run remaining engines in parallel
  const [transitsRes, cyclesRes, narrativeRes, spiralogicRes] = await Promise.all([
    shouldRunTransits ? timed(() => runTransitsEngine(intake, birthChart)) : Promise.resolve(null),
    shouldRunLifeCycles ? timed(() => runLifeCyclesEngine(intake, birthChart)) : Promise.resolve(null),
    shouldRunNarrative
      ? timed(() => runNarrativeEngine(intake, birthChart, { useFastTemplate: !wants(lensesUsed, "mythic") }))
      : Promise.resolve(null),
    shouldRunSpiralogic ? timed(() => runSpiralogicEngine(intake, birthChart)) : Promise.resolve(null),
  ]);

  // Build sections with summary/raw gating
  const natalChartSection: ComposerSection | undefined = birthChartResult
    ? birthChartResult.ok
      ? {
          ok: true,
          ms: birthChartResult.ms,
          summary: summarizeNatalChart(birthChartResult.data, detailLevel),
          raw: includeRaw ? birthChartResult.data : undefined,
        }
      : { ok: false, ms: birthChartResult.ms, error: birthChartResult.error }
    : undefined;

  const transitsSection: ComposerSection | undefined = transitsRes
    ? transitsRes.ok
      ? {
          ok: true,
          ms: transitsRes.ms,
          summary: summarizeTransits(transitsRes.data as TransitsEngineResult, detailLevel),
          raw: includeRaw ? transitsRes.data : undefined,
        }
      : { ok: false, ms: transitsRes.ms, error: transitsRes.error }
    : undefined;

  const lifeCyclesSection: ComposerSection | undefined = cyclesRes
    ? cyclesRes.ok
      ? {
          ok: true,
          ms: cyclesRes.ms,
          summary: summarizeLifeCycles(cyclesRes.data as LifeCyclesEngineResult | null),
          raw: includeRaw ? cyclesRes.data : undefined,
        }
      : { ok: false, ms: cyclesRes.ms, error: cyclesRes.error }
    : undefined;

  const narrativeSection: ComposerSection | undefined = narrativeRes
    ? narrativeRes.ok
      ? {
          ok: true,
          ms: narrativeRes.ms,
          summary: summarizeNarrative(narrativeRes.data as NarrativeEngineResult | null, detailLevel),
          raw: includeRaw ? narrativeRes.data : undefined,
        }
      : { ok: false, ms: narrativeRes.ms, error: narrativeRes.error }
    : undefined;

  const spiralogicSection: ComposerSection | undefined = spiralogicRes
    ? spiralogicRes.ok
      ? {
          ok: true,
          ms: spiralogicRes.ms,
          summary: summarizeSpiralogic(spiralogicRes.data as SpiralogicEngineResult | null),
          raw: includeRaw ? spiralogicRes.data : undefined,
        }
      : { ok: false, ms: spiralogicRes.ms, error: spiralogicRes.error }
    : undefined;

  // Build interpretation
  const integrationPath: string[] = [];
  const notes: string[] = [];

  // Core pattern from natal chart
  let corePattern = "";
  if (natalChartSection?.ok && natalChartSection.summary?.big3) {
    const b3 = natalChartSection.summary.big3;
    corePattern = `Your natal signature: Sun in ${b3.sun}, Moon in ${b3.moon}, ${b3.rising} Rising.`;
  } else if (intake.natal?.placements?.length) {
    const sun = intake.natal.placements.find((p) => p.body === "Sun");
    const moon = intake.natal.placements.find((p) => p.body === "Moon");
    if (sun && moon) {
      corePattern = `From your placements: Sun ${sun.pos || sun.sign}, Moon ${moon.pos || moon.sign}.`;
    }
  } else {
    corePattern = "Reading composed from your selected lenses. Use summaries for quick clarity.";
    integrationPath.push("Add birth date, time, and location for full natal chart calculation.");
  }

  // Current activation from transits
  let currentActivation: string | undefined;
  const topTransit = (transitsSection?.summary as any)?.topAspects?.[0];
  if (topTransit) {
    const tPlanet = topTransit.transitPlanet ?? topTransit.transitingBody ?? "Transit";
    const aType = topTransit.aspectType ?? topTransit.type ?? "aspecting";
    const nPlanet = topTransit.natalPlanet ?? topTransit.toNatalBody ?? "natal point";
    const orb = typeof topTransit.orb === "number" ? `${topTransit.orb.toFixed(1)}deg` : undefined;
    currentActivation = `Current activation: ${tPlanet} ${aType} ${nPlanet}${orb ? ` (orb ${orb})` : ""}.`;
  } else if (shouldRunTransits) {
    currentActivation = "Current planetary positions calculated. Add natal chart to see transit aspects.";
  }

  // Life cycles insight
  if (lifeCyclesSection?.ok && lifeCyclesSection.summary) {
    const lc = lifeCyclesSection.summary as any;
    notes.push(`Age ${lc.age}: ${lc.consciousness} consciousness stage.`);
    if (lc.saturnReturn?.yearsAway !== undefined) {
      notes.push(
        `Saturn return ${lc.saturnReturn.yearsAway > 0 ? `in ${lc.saturnReturn.yearsAway.toFixed(1)} years` : "active now"}.`
      );
    }
  }

  // Spiralogic guidance
  if (spiralogicSection?.ok && spiralogicSection.summary) {
    const sp = spiralogicSection.summary as any;
    // Dominance is the single versioned rule's claim (C-fence) and may be
    // null. When it is, the copy says balanced honestly — no invented crown.
    if (sp.dominantElement) {
      integrationPath.push(
        `Elemental balance: Dominant ${sp.dominantElement}${sp.deficientElement ? `, strengthen ${sp.deficientElement}` : ""}.`
      );
    } else {
      const verdict = sp.elementalBalance?.dominance as DominanceVerdict | undefined;
      if (verdict) {
        integrationPath.push(`Elemental balance: ${dominanceSentence(verdict)}`);
      }
      // No verdict at all (chart could not be registered): no elemental
      // line — absence propagates as absence.
    }
    if (sp.practices?.length) {
      integrationPath.push(...sp.practices.slice(0, 2));
    }
  }

  // Lens-specific guidance
  if (wants(lensesUsed, "timing") && !transitsSection?.summary?.topAspects?.length) {
    integrationPath.push("For timing analysis: add birth chart to show transit aspects.");
  }

  if (wants(lensesUsed, "mythic") && !narrativeSection?.ok) {
    integrationPath.push("Mythic lens requested but narrative couldn't be generated. Provide sun/moon/rising.");
  }

  // Hint about full detail
  if (detailLevel !== "full" && !debug) {
    integrationPath.push('Want full export (all aspects, all transits, full narrative)? Set detailLevel: "full".');
  }

  const reading: UnifiedAstrologyReading = {
    ok: true,
    meta: {
      version: intake.version,
      houseSystem: intake.houseSystem,
      lensesUsed,
      source: intake.meta?.source ?? "other",
      timingIncluded: !!intake.timing?.transits?.length || wants(lensesUsed, "timing"),
      detailLevel,
      debug,
    },
    intake: {
      question: intake.question,
      hasBirth: !!intake.birth,
      hasNatal: !!intake.natal?.placements?.length,
      hasTiming: !!intake.timing?.transits?.length,
    },
    natalChart: natalChartSection,
    transits: transitsSection,
    lifeCycles: lifeCyclesSection,
    narrative: narrativeSection,
    spiralogic: spiralogicSection,
    interpretation: {
      corePattern,
      currentActivation,
      integrationPath,
      notes: notes.length > 0 ? notes : undefined,
    },
  };

  return reading;
}
