/**
 * Astrology Reading Composer
 *
 * One input → multiple engines → one unified payload.
 * No HTTP hops. Engines are direct imports.
 */

import type { AstrologyIntake } from "./astrologyIntakeSchema";
import type { Lens } from "./pickLenses";
import type { UnifiedAstrologyReading, ComposerSection } from "./types";

import { runBirthChartEngine, type BirthChartEngineResult } from "./engines/birthChartEngine";
import { runTransitsEngine, type TransitsEngineResult } from "./engines/transitsEngine";
import { runLifeCyclesEngine, type LifeCyclesEngineResult } from "./engines/lifeCyclesEngine";
import { runNarrativeEngine, type NarrativeEngineResult } from "./engines/narrativeEngine";
import { runSpiralogicEngine, type SpiralogicEngineResult } from "./engines/spiralogicEngine";

function nowMs() {
  return Date.now();
}

async function timed<T>(fn: () => Promise<T>): Promise<ComposerSection<T>> {
  const t0 = nowMs();
  try {
    const data = await fn();
    const t1 = nowMs();
    return { ok: true, data: data as T, ms: t1 - t0 };
  } catch (e: unknown) {
    const t1 = nowMs();
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message, ms: t1 - t0 };
  }
}

function wants(lenses: Lens[], lens: Lens): boolean {
  return lenses.includes(lens);
}

/**
 * Build interpretation text from engine results
 */
function buildInterpretation(args: {
  intake: AstrologyIntake;
  lensesUsed: Lens[];
  natalChart?: ComposerSection<BirthChartEngineResult | null>;
  transits?: ComposerSection<TransitsEngineResult>;
  lifeCycles?: ComposerSection<LifeCyclesEngineResult | null>;
  narrative?: ComposerSection<NarrativeEngineResult | null>;
  spiralogic?: ComposerSection<SpiralogicEngineResult | null>;
}): UnifiedAstrologyReading["interpretation"] {
  const { intake, lensesUsed, natalChart, transits, lifeCycles, narrative, spiralogic } = args;

  const integrationPath: string[] = [];
  const notes: string[] = [];

  // Core pattern from available data
  let corePattern = "";

  if (natalChart?.ok && natalChart.data) {
    const summary = natalChart.data.summary;
    corePattern = `Your natal signature: Sun in ${summary.sun}, Moon in ${summary.moon}, ${summary.ascendant} Rising. ${summary.aspectCount} aspects shape your inner dynamics.`;
  } else if (intake.natal?.placements?.length) {
    const sun = intake.natal.placements.find((p) => p.body === "Sun");
    const moon = intake.natal.placements.find((p) => p.body === "Moon");
    if (sun && moon) {
      corePattern = `From your placements: Sun ${sun.pos || sun.sign}, Moon ${moon.pos || moon.sign}.`;
    }
  } else {
    corePattern = "Provide birth data or placements for a complete natal chart reading.";
    integrationPath.push("Add birth date, time, and location for full chart calculation.");
  }

  // Current activation from transits
  let currentActivation: string | undefined;

  if (transits?.ok && transits.data?.aspects?.length) {
    const tightestAspect = transits.data.aspects[0];
    currentActivation = `Current sky activation: ${tightestAspect.transitPlanet} ${tightestAspect.aspectType} your natal ${tightestAspect.natalPlanet} (orb: ${tightestAspect.orb.toFixed(1)}°).`;
  } else if (transits?.ok) {
    currentActivation = "Current planetary positions calculated. Add natal chart to see transit aspects.";
  }

  // Life cycles insight
  if (lifeCycles?.ok && lifeCycles.data) {
    const lc = lifeCycles.data;
    notes.push(`Age ${lc.currentAge}: ${lc.consciousness.structure} consciousness stage.`);
    if (lc.saturnCycle.nextReturn) {
      notes.push(`Saturn return ${lc.saturnCycle.nextReturn.yearsAway > 0 ? `in ${lc.saturnCycle.nextReturn.yearsAway} years` : "active now"}.`);
    }
  }

  // Narrative excerpt
  if (narrative?.ok && narrative.data?.narrative) {
    const excerpt = narrative.data.narrative.slice(0, 200);
    notes.push(`Archetypal story: ${excerpt}...`);
  }

  // Spiralogic coherence
  if (spiralogic?.ok && spiralogic.data) {
    const sp = spiralogic.data;
    integrationPath.push(
      `Elemental balance: Fire ${sp.elementalBalance.fire}%, Water ${sp.elementalBalance.water}%, Earth ${sp.elementalBalance.earth}%, Air ${sp.elementalBalance.air}%. Dominant: ${sp.elementalBalance.dominant}, strengthen: ${sp.elementalBalance.deficient}.`
    );
    integrationPath.push(...sp.coherencePractices.slice(0, 2));
  }

  // Lens-specific guidance
  if (wants(lensesUsed, "timing") && !transits?.data?.aspects?.length) {
    integrationPath.push("For timing analysis: we need your birth chart to show transit aspects.");
  }

  if (wants(lensesUsed, "mythic") && !narrative?.data) {
    integrationPath.push("Mythic lens requested but narrative couldn't be generated. Provide sun/moon/rising.");
  }

  if (wants(lensesUsed, "developmental")) {
    integrationPath.push("Developmental lens: Focus on maturation patterns and growth edges in the chart.");
  }

  return {
    corePattern,
    currentActivation,
    integrationPath,
    notes: notes.length > 0 ? notes : undefined,
  };
}

/**
 * Compose a unified astrology reading from intake data
 */
export async function composeAstrologyReading(args: {
  intake: AstrologyIntake;
  lensesUsed: Lens[];
}): Promise<UnifiedAstrologyReading> {
  const { intake, lensesUsed } = args;

  // Decide which engines to run based on lenses + available data
  const shouldRunBirthChart = !!intake.birth;
  const shouldRunTransits = wants(lensesUsed, "timing") || !!intake.timing?.transits?.length;
  const shouldRunLifeCycles = !!intake.birth?.date;
  const shouldRunNarrative = wants(lensesUsed, "mythic") || wants(lensesUsed, "developmental");
  const shouldRunSpiralogic = wants(lensesUsed, "spiralogic");

  // Run birth chart first since other engines may depend on it
  let birthChartResult: ComposerSection<BirthChartEngineResult | null> | undefined;
  if (shouldRunBirthChart) {
    birthChartResult = await timed(() => runBirthChartEngine(intake));
  }

  const birthChart = birthChartResult?.data?.chart;

  // Run remaining engines in parallel
  const [transits, lifeCycles, narrative, spiralogic] = await Promise.all([
    shouldRunTransits
      ? timed(() => runTransitsEngine(intake, birthChart))
      : Promise.resolve(undefined),
    shouldRunLifeCycles
      ? timed(() => runLifeCyclesEngine(intake, birthChart))
      : Promise.resolve(undefined),
    shouldRunNarrative
      ? timed(() => runNarrativeEngine(intake, birthChart, { useFastTemplate: !wants(lensesUsed, "mythic") }))
      : Promise.resolve(undefined),
    shouldRunSpiralogic
      ? timed(() => runSpiralogicEngine(intake, birthChart))
      : Promise.resolve(undefined),
  ]);

  // Build interpretation from results
  const interpretation = buildInterpretation({
    intake,
    lensesUsed,
    natalChart: birthChartResult,
    transits,
    lifeCycles,
    narrative,
    spiralogic,
  });

  const reading: UnifiedAstrologyReading = {
    ok: true,
    meta: {
      version: intake.version,
      houseSystem: intake.houseSystem,
      lensesUsed,
      source: intake.meta?.source ?? "other",
      timingIncluded: !!intake.timing?.transits?.length || wants(lensesUsed, "timing"),
    },
    intake: {
      question: intake.question,
      hasBirth: !!intake.birth,
      hasNatal: !!intake.natal?.placements?.length,
      hasTiming: !!intake.timing?.transits?.length,
    },
    natalChart: birthChartResult,
    transits,
    lifeCycles,
    narrative,
    spiralogic,
    interpretation,
  };

  return reading;
}
