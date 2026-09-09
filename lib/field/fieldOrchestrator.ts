/**
 * FIELD ORCHESTRATOR — Single seam connecting PFI → Unified Field → Resonance Field
 *
 * This is the ONLY file that knows how the field engines connect.
 * All hot paths (FAST/CORE/DEEP) call buildFieldContext() once,
 * then append formatFieldAddendum() to their system prompt.
 *
 * Design principles:
 * - Fire-and-forget safe (never blocks the oracle)
 * - Sanctuary: returns empty context (meta only)
 * - Depth-gated: PFI always, Resonance at turn 3+, Unified at turn 4+
 * - Hard-capped output: max 3000 chars JSON (configurable)
 * - Timeout per module: 250ms default (configurable)
 */

import {
  generatePFIMindState,
  type PFIMindContext,
  type PFIMindState,
} from '../sovereign/pfiMindEntrypoint';
import { ResonanceFieldGenerator } from '../maia/resonance-field-system';
import {
  UnifiedElementalFieldCalculator,
} from '../consciousness/field/UnifiedElementalFieldCalculator';
import type { CognitiveProfile } from '../consciousness/cognitiveProfileService';

/**
 * FIELD-TRUTH-01 — PFI failures are counted, not merely warned about.
 * The census could not say how often production had spoken a defaulted element
 * because nothing counted. Read via getFieldTruthCounters() for the receipt.
 */
const counters = {
  pfiFailures: 0,            // threw or timed out
  pfiFallbackPosture: 0,     // returned, but source === 'fallback' — posture, not evidence
  pfiNoElement: 0,           // ran, but no elemental signal reached it
  unifiedSkippedNoPfi: 0,    // Unified declined for want of PFI evidence
};
export function getFieldTruthCounters(): Readonly<typeof counters> {
  return { ...counters };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldFlags = {
  pfi: boolean;
  unified: boolean;
  resonance: boolean;
};

export type FieldContext = {
  pfi?: {
    /** FIELD-TRUTH-03 — absent when no elemental signal reached PFI. Never defaulted. */
    element?: string;
    coherence: number;
    fieldWorkSafe: boolean;
    realm: string;
    deepWorkRecommended: boolean;
  };
  unified?: {
    elementPressure: Record<string, number>;
    dominantElement: string;
    coherenceLevel: string;
    interference: string[];
  };
  resonance?: {
    elements: Record<string, number>;
    wordDensity: number;
    silenceProbability: number;
    fragmentationRate: number;
  };
  meta: {
    ms: number;
    truncated: boolean;
    sources: string[];
    chars: number;
    depth: number;
  };
  /**
   * FIELD-TRUTH-01 — what this turn could NOT know, and why.
   *
   * ⭐ `unavailable` is evidence for the RECEIPT, not content for cognition.
   * `formatFieldAddendum()` strips this field, so an absence is recorded and
   * observable without ever being narrated to MAIA as though it were subject
   * matter. That closes F-ABSENCE from both sides: no fabricated value, and no
   * silent disappearance.
   */
  unavailability?: Array<{ id: string; reason: string }>;
};

export type BuildFieldContextArgs = {
  memberId: string;
  sessionId: string;
  isSanctuary: boolean;
  depth: number;           // turnCount or conversationHistory.length
  text: string;            // current user message
  conversationHistory?: Array<{ role?: string; content?: string }>;
  cognitiveProfile?: CognitiveProfile | null;
  element?: string | null;
  facet?: string | null;
  archetype?: string | null;
  bloomLevel?: number | null;
  // tuning
  flags?: Partial<FieldFlags>;
  timeoutMs?: number;
  maxChars?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function runWithTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error('field-timeout')), ms)
    ),
  ]);
}

function truncateFieldContext(
  ctx: FieldContext,
  maxChars: number
): FieldContext {
  const json = JSON.stringify(ctx);
  if (json.length <= maxChars) {
    ctx.meta.chars = json.length;
    return ctx;
  }

  // Aggressive truncation: drop unified interference, trim resonance
  const slim: FieldContext = {
    pfi: ctx.pfi,
    resonance: ctx.resonance
      ? {
          elements: ctx.resonance.elements,
          wordDensity: ctx.resonance.wordDensity,
          silenceProbability: ctx.resonance.silenceProbability,
          fragmentationRate: ctx.resonance.fragmentationRate,
        }
      : undefined,
    unified: ctx.unified
      ? {
          elementPressure: Object.fromEntries(
            Object.entries(ctx.unified.elementPressure).slice(0, 3)
          ),
          dominantElement: ctx.unified.dominantElement,
          coherenceLevel: ctx.unified.coherenceLevel,
          interference: ctx.unified.interference.slice(0, 2),
        }
      : undefined,
    meta: { ...ctx.meta, truncated: true },
  };

  slim.meta.chars = JSON.stringify(slim).length;
  return slim;
}

// Singleton resonance generator (stateful — tracks field history per session)
let resonanceGenerator: ResonanceFieldGenerator | null = null;
function getResonanceGenerator(): ResonanceFieldGenerator {
  if (!resonanceGenerator) {
    resonanceGenerator = new ResonanceFieldGenerator();
  }
  return resonanceGenerator;
}

// ---------------------------------------------------------------------------
// Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Build a structured FieldContext from the real field engines.
 *
 * Call once per turn, before the LLM call.
 * Returns null only on catastrophic failure.
 */
export async function buildFieldContext(
  args: BuildFieldContextArgs
): Promise<FieldContext | null> {
  const started = Date.now();
  const timeoutMs = args.timeoutMs ?? 250;
  const maxChars = args.maxChars ?? 3000;

  const flags: FieldFlags = {
    pfi: true,
    resonance: args.depth >= 3,
    unified: args.depth >= 4,
    ...(args.flags ?? {}),
  };

  // Sanctuary: meta-only, no field intelligence
  if (args.isSanctuary) {
    return {
      meta: {
        ms: Date.now() - started,
        truncated: false,
        sources: [],
        chars: 0,
        depth: args.depth,
      },
    };
  }

  const sources: string[] = [];
  let pfiEvidenceBearing = false;
  const unavailability: Array<{ id: string; reason: string }> = [];
  const ctx: FieldContext = {
    meta: {
      ms: 0,
      truncated: false,
      sources,
      chars: 0,
      depth: args.depth,
    },
  };

  try {
    // ─── PFI (always runs, turn 1+) ─────────────────────────────
    if (flags.pfi) {
      try {
        const pfiContext: PFIMindContext = {
          userId: args.memberId,
          sessionId: args.sessionId,
          input: args.text,
          conversationHistory: (args.conversationHistory ?? []).map((h) => ({
            role: (h.role as 'user' | 'assistant') ?? 'user',
            content: h.content ?? '',
          })),
          cognitiveProfile: args.cognitiveProfile ?? null,
          element: args.element,
          facet: args.facet,
          archetype: args.archetype,
          bloomLevel: args.bloomLevel,
        };

        const pfiState: PFIMindState = await runWithTimeout(
          generatePFIMindState(pfiContext),
          timeoutMs
        );

        /**
         * FIELD-TRUTH-03 — a returned object is not evidence.
         *
         * generatePFIMindState() does NOT throw on internal failure; it RETURNS
         * buildFallbackMindState() with `source: 'fallback'`. FIELD-TRUTH-01's
         * `if (!ctx.pfi)` gate therefore never saw that path. `source` is the
         * discriminator, and it was already on the object — merely unread.
         *
         * ⭐⭐ A fallback may preserve operational posture. It may not manufacture
         *     observational content.
         */
        pfiEvidenceBearing = pfiState.source !== 'fallback';
        if (!pfiEvidenceBearing) {
          counters.pfiFallbackPosture++;
          unavailability.push({ id: 'pfi.evidence', reason: 'PFI returned a fallback operational posture, not observation' });
          console.warn('[field-truth] pfi_fallback_posture', JSON.stringify({
            outcome: 'fallback_posture', source: pfiState.source,
            pfiFallbackPosture: counters.pfiFallbackPosture,
          }));
        }
        if (pfiState.elementalDominance === undefined) {
          counters.pfiNoElement++;
          unavailability.push({ id: 'pfi.elementalDominance', reason: 'no elemental signal reached PFI' });
        }
        ctx.pfi = {
          element: pfiState.elementalDominance,
          coherence: pfiState.coherenceLevel,
          fieldWorkSafe: pfiState.fieldWorkSafe,
          realm: pfiState.realm,
          deepWorkRecommended: pfiState.deepWorkRecommended,
        };
        sources.push('pfi');
      } catch (err) {
        // PFI failure is non-fatal — log and continue. FIELD-TRUTH-01: it is now
        // also COUNTED and recorded, because everything PFI-dependent downstream
        // must become unavailable rather than defaulted.
        counters.pfiFailures++;
        unavailability.push({ id: 'pfi', reason: 'PFI engine failed or timed out' });
        console.warn('[field-truth] pfi_unavailable', JSON.stringify({
          reason: err instanceof Error ? err.message : 'unknown',
          pfiFailures: counters.pfiFailures,
        }));
      }
    }

    // ─── Resonance Field (turn 3+) ──────────────────────────────
    if (flags.resonance) {
      try {
        const rfs = getResonanceGenerator();
        const exchangeCount = args.depth;
        const intimacyLevel = Math.min(1, exchangeCount / 30); // Grows with turns

        const field = await runWithTimeout(
          Promise.resolve(
            rfs.generateField(args.text, {
              userWeather: '',
              userState: '',
            }, exchangeCount, intimacyLevel)
          ),
          timeoutMs
        );

        ctx.resonance = {
          elements: { ...field.elements },
          wordDensity: field.wordDensity,
          silenceProbability: field.silenceProbability,
          fragmentationRate: field.fragmentationRate,
        };
        sources.push('resonance');
      } catch (err) {
        console.warn('[field-orchestrator] Resonance failed:', err instanceof Error ? err.message : 'unknown');
      }
    }

    // ─── Unified Field (turn 4+) ────────────────────────────────
    if (flags.unified) {
      /**
       * FIELD-TRUTH-01 — PREREQUISITE GATE.
       *
       * Every meaningful input this leg feeds the calculator is derived from PFI:
       * sacredThreshold, soulEmergence, the one-hot elementalPrescription, and
       * archetypalRouting. Before this gate, a swallowed PFI failure left
       * `ctx.pfi` undefined and the element defaulted to 'earth' — so an Earth
       * identity the member never showed reached cognition indistinguishable
       * from an observed one.
       *
       * ⭐⭐ WHEN A PREREQUISITE IS ABSENT, DOWNSTREAM INTELLIGENCE BECOMES
       *     UNAVAILABLE — NOT GENERIC. Absence of an elemental reading is not Earth.
       *
       * ⛔ No fallback element. No 'unknown' masquerading as a real enum value.
       * ⛔ The remaining fabricated inputs on this leg (the 0 / 0.5 / 'normal' /
       *    'stable' stubs) are SEPARATELY OWED and deliberately untouched here.
       */
      /**
       * FIELD-TRUTH-03 amends FIELD-TRUTH-01's gate. Every meaningful Unified
       * input derives from PFI EVIDENCE, so the prerequisite is evidence — not
       * the mere presence of a PFI-shaped object, and not a defaulted element.
       */
      const unifiedPrereq =
        !ctx.pfi ? 'PFI prerequisite unavailable'
        : !pfiEvidenceBearing ? 'PFI returned operational posture, not evidence'
        : ctx.pfi.element === undefined ? 'no elemental signal to derive from'
        : null;
      if (unifiedPrereq) {
        counters.unifiedSkippedNoPfi++;
        unavailability.push({ id: 'unified', reason: unifiedPrereq });
        console.warn('[field-truth] unified_unavailable', JSON.stringify({
          reason: unifiedPrereq,
          unifiedSkippedNoPfi: counters.unifiedSkippedNoPfi,
        }));
      } else {
      try {
        // Build a minimal SystemOutputs from what we have.
        // The real UEFC expects 50+ system outputs — we provide what's available
        // so the calculator returns meaningful (if partial) results.
        // The prerequisite above established all three facts; bind them once so the
        // compiler sees what the guard proved.
        const pfi = ctx.pfi!;
        const pfiElement = pfi.element!.toLowerCase();
        const minimalSystems = {
          fieldIntelligence: {
            sacredThreshold: pfi.fieldWorkSafe ? 0.3 : 0.1,
            relationalField: {
              emotionalVelocity: 0.5,
              soulEmergence: pfi.deepWorkRecommended ? 0.7 : 0.2,
            },
          },
          unifiedIntelligence: {
            frameworkConvergence: [],
            elementalPrescription: {
              fire: pfiElement === 'fire' ? 0.8 : 0.2,
              water: pfiElement === 'water' ? 0.8 : 0.2,
              earth: pfiElement === 'earth' ? 0.8 : 0.2,
              air: pfiElement === 'air' ? 0.8 : 0.2,
              aether: pfiElement === 'aether' ? 0.8 : 0.1,
            },
          },
          affectDetector: {
            archetypalRouting: pfi.element!,
          },
          // Stubs for required fields — zero-value defaults
          consciousnessEmergencePredictor: { next15Minutes: 0 },
          advancedConsciousnessDetection: { fieldQuality: 'normal' },
          patternRecognition: { emergentInsightGeneration: 0 },
          voiceAnalyzer: {
            consciousnessIndicators: { flowState: 0.5, integration: 0.5, authenticExpression: 0.5 },
            prosodyMetrics: { spectralCentroid: 0 },
          },
          bioelectricDialogue: {
            coherenceMetrics: { therapeuticAlignment: 0 },
            therapeuticVoltage: { energeticSignature: { activation: 0, receptivity: 0 } },
          },
          therapeuticStressMonitor: {
            therapeuticVoltage: { energeticSignature: { receptivity: 0 } },
          },
          conversationPatternAnalyzer: { shadowProjection: { integrationDepth: 0 } },
          resonanceField: { emotionalTone: { joy: 0, love: 0 } },
          somaticResponse: { windowOfTolerance: 0.5 },
          circadianOptimizer: { circadianPhase: 0.5 },
          healthData: { overallVitality: 0.5 },
          coherenceDetector: {},
          fascialField: { biotensegrityCoherence: 0.5, tissueCoherence: 0.5 },
          cognitiveLightCone: { goalCoherence: 0.5 },
          realTimeMonitor: { presenceQuality: 0.5, sacredResonance: 0.3 },
          symbolExtraction: { archetypalActivationStrength: 0 },
          wisdomSynthesis: { integrationDepth: 0 },
          consciousnessLevelDetector: { coherenceTrend: 'stable' },
          archetypalFieldResonance: { modalityResonance: 0 },
          masterConsciousness: { unifiedFieldStrength: 0 },
          realTimeMonitoring: { consciousnessBreakthroughProbability: 0 },
          collectiveIntelligence: { fieldCoherence: { overallCoherence: 0 } },
          morphoresonantField: { fieldWisdom: { resonanceStrength: 0 } },
        };

        const unifiedState = await runWithTimeout(
          Promise.resolve(
            UnifiedElementalFieldCalculator.calculateUnifiedElementalField(
              minimalSystems as any
            )
          ),
          timeoutMs
        );

        const healthSummary = UnifiedElementalFieldCalculator.getFieldHealthSummary(unifiedState);
        const interference = UnifiedElementalFieldCalculator.calculateElementalInterference(unifiedState);

        // Build compact pressure map from elemental balances
        const elementPressure: Record<string, number> = {
          fire: +unifiedState.fireResonance.fireElementBalance.toFixed(2),
          water: +unifiedState.waterResonance.waterElementBalance.toFixed(2),
          earth: +unifiedState.earthResonance.earthElementBalance.toFixed(2),
          air: +unifiedState.airResonance.airElementBalance.toFixed(2),
          aether: +unifiedState.aetherResonance.aetherElementBalance.toFixed(2),
        };

        // Extract top interference signals
        const interferenceSignals: string[] = [];
        if (interference.fireWater > 0.6) interferenceSignals.push('fire-water resonance');
        if (interference.fireAir > 0.6) interferenceSignals.push('fire-air resonance');
        if (interference.waterEarth > 0.6) interferenceSignals.push('water-earth resonance');
        if (interference.earthAir > 0.6) interferenceSignals.push('earth-air resonance');
        if (interference.allToAether > 0.5) interferenceSignals.push('aether convergence');
        if (healthSummary.emergenceIndicators.length > 0) {
          interferenceSignals.push(...healthSummary.emergenceIndicators);
        }

        ctx.unified = {
          elementPressure,
          dominantElement: healthSummary.dominantElement,
          coherenceLevel: healthSummary.coherenceLevel,
          interference: interferenceSignals.slice(0, 5),
        };
        sources.push('unified');
      } catch (err) {
        unavailability.push({ id: 'unified', reason: 'Unified calculator failed or timed out' });
        console.warn('[field-orchestrator] Unified failed:', err instanceof Error ? err.message : 'unknown');
      }
      }
    }
  } catch (err) {
    // Catastrophic failure — still return what we have
    console.error('[field-orchestrator] Outer failure:', err);
  } finally {
    ctx.meta.ms = Date.now() - started;
    ctx.meta.sources = sources;
    if (unavailability.length) ctx.unavailability = unavailability;
  }

  return truncateFieldContext(ctx, maxChars);
}

// ---------------------------------------------------------------------------
// Prompt Formatting
// ---------------------------------------------------------------------------

/**
 * Format FieldContext as a compact prompt addendum.
 * Returns empty string if context is null or empty.
 */
export function formatFieldAddendum(field: FieldContext | null): string {
  if (!field) return '';
  if (field.meta.sources.length === 0) return '';

  // FIELD-TRUTH-01: `unavailability` is receipt evidence, never prompt content.
  // Handing MAIA "somatic tolerance: unavailable" would make an absence into
  // subject matter. Stripped here so the prompt carries only what exists —
  // and so this change adds NOTHING to any existing room's prompt.
  const { unavailability: _receiptOnly, ...forPrompt } = field;
  const json = JSON.stringify(forPrompt);
  if (json.length < 10) return '';

  return `\n\n[Field Intelligence]\n${json}`;
}
