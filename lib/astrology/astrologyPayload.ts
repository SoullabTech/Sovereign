/**
 * Canonical Astrology Payload Schema — Phase 7
 *
 * SEPARATION PRINCIPLE (do not collapse):
 *   facts[]      = pure astronomy — what IS (no interpretation)
 *   impacts[]    = structured interpretation — what it MEANS (no raw position claims)
 *   guardrails[] = epistemic rules — what MAIA may and may not assert
 *
 * Every field carries source + confidence so provenance is preserved
 * through formatting, rendering, and model consumption.
 *
 * traceId on TransitImpact enables explainability:
 *   "why did MAIA say this?" → traceId → aspect + synthesis entry + fallback path
 *
 * authority field enforces:
 *   authoritative — directly from ephemeris or verified event table
 *   derived       — calculated or synthesized from authoritative data
 *   fallback      — generated language with no event/fact backing
 */

import { type ConfidenceLevel, type AstroEvent } from '@/lib/astrology/transitSnapshot';
import { type TransitImpact } from '@/lib/astrology/transitInterpretation';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Where did this piece of information come from?
 *
 * ephemeris              — calculated directly from astronomy-engine (most authoritative)
 * event_table            — from the locked 2026 event table (NASA-verified dates)
 * derived_interpretation — synthesis from aspect library (synthesizeAspect returned data)
 * fallback               — default text path (aspect library had no matching entry)
 */
export type AstroSource =
  | 'ephemeris'
  | 'event_table'
  | 'derived_interpretation'
  | 'fallback';

/**
 * Authority tier — orthogonal to source, used by the authority layer for render gating.
 *
 * authoritative — from ephemeris or verified event table (safe to state as fact)
 * derived       — synthesized from authoritative data (safe for interpretation)
 * fallback      — generated language; must not make date-bound astronomical claims
 */
export type AstroAuthority = 'authoritative' | 'derived' | 'fallback';

// Re-export so consumers only need one import
export type { ConfidenceLevel };

// ─────────────────────────────────────────────────────────────────────────────
// ASTRO FACT — pure astronomy, no interpretation
// ─────────────────────────────────────────────────────────────────────────────

export type AstroFactKind =
  | 'planet_position'
  | 'moon_phase'
  | 'retrograde'
  | 'lunation'
  | 'eclipse';

export interface AstroFact {
  id?: string;             // optional stable identifier for tracing + test assertions
  kind: AstroFactKind;
  label: string;           // e.g. "Saturn", "New Moon", "Total Lunar Eclipse"
  value: string;           // e.g. "18° Aries", "Waxing Gibbous (62%)", "2026-03-03"
  sign?: string;           // zodiac sign when relevant
  degree?: number;         // degree within sign when relevant
  source: AstroSource;
  confidence: ConfidenceLevel;
  authority?: AstroAuthority; // explicit authority tier for render gating
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Payload-level authority summary — instant health metrics for dashboards and QA.
 * Built by buildAuthoritySummary() in astrologyAuthority.ts after payload assembly.
 */
export interface AstrologyAuthoritySummary {
  totalFacts: number;
  totalImpacts: number;
  totalEvents: number;
  authoritativeFacts: number;   // facts with source ephemeris or event_table
  derivedImpacts: number;       // impacts sourced from derived_interpretation
  fallbackImpacts: number;      // impacts sourced from fallback text
  blockedImpacts: number;       // impacts that would fail authority gating
  guardrailCount: number;
}

export interface AstrologyContextPayload {
  generatedAt: string;    // ISO timestamp
  facts: AstroFact[];     // raw astronomical facts — ONLY these may be stated as fact
  impacts: TransitImpact[]; // structured interpretation — separated from facts
  events: AstroEvent[];   // upcoming events from locked table
  guardrails: string[];   // machine-readable rules enforcing epistemic boundaries
  authoritySummary?: AstrologyAuthoritySummary; // computed after assembly
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAIL REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical guardrails — enforced structurally and included in every payload */
export const ASTRO_GUARDRAILS: string[] = [
  'eclipse_bounded: Only reference eclipses present in payload.events[]',
  'positions_from_ephemeris: Planet positions come from payload.facts[kind=planet_position] only',
  'no_training_inference: Do not draw on model training data to fill astronomical gaps',
  'unknown_events: If asked about an event not in payload.events[], state you lack verified data',
  'confidence_transparency: Never present derived or uncertain claims with known-level confidence',
  'separation: Do not blend facts[] with impacts[] — state which layer you are drawing from',
  // Phase 7 authority guardrails
  'facts_only_for_astronomical_occurrence: facts[] describes what IS — not meaning, not advice',
  'impacts_may_interpret_but_not_invent_events: impacts[] may describe meaning but may not assert new astronomical occurrences',
  'date_sensitive_claims_must_be_backed: Any date, event name, or timing claim must exist in facts[] or events[]',
  'fallback_generation_may_not_override_authoritative_data: Generated language cannot substitute for or contradict verified event data',
  'relative_time_requires_event_binding: Phrases like "tomorrow" or "this week" require an explicit event date in payload',
  'narrative_preserves_source_boundaries: The narrative layer may combine facts and impacts but may not introduce new astronomical events',
];

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export interface BuildPayloadInput {
  currentTransits: Array<{ planet: string; sign: string; degree: number; retrograde: boolean }>;
  moonPhase: { phase: string; percentage: number };
  events: AstroEvent[];
  impacts: TransitImpact[];
}

/**
 * Build a typed AstrologyContextPayload from calculated inputs.
 * This is the single assembly point — all provenance decisions are made here.
 */
export function buildAstrologyPayload(input: BuildPayloadInput): AstrologyContextPayload {
  const facts: AstroFact[] = [];

  // ── Planet positions (ephemeris — always known) ────────────────────────────
  const planetOrder = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  for (const name of planetOrder) {
    const t = input.currentTransits.find(t => t.planet === name);
    if (!t) continue;

    facts.push({
      kind: 'planet_position',
      label: name,
      value: `${Math.round(t.degree)}° ${t.sign}`,
      sign: t.sign,
      degree: Math.round(t.degree),
      source: 'ephemeris',
      confidence: 'known',
    });

    if (t.retrograde) {
      facts.push({
        kind: 'retrograde',
        label: `${name} retrograde`,
        value: 'active',
        source: 'ephemeris',
        confidence: 'known',
      });
    }
  }

  // ── Moon phase (ephemeris) ─────────────────────────────────────────────────
  facts.push({
    kind: 'moon_phase',
    label: 'Moon Phase',
    value: `${input.moonPhase.phase} (${input.moonPhase.percentage}% illuminated)`,
    source: 'ephemeris',
    confidence: 'known',
  });

  // ── Upcoming events (from locked table) ───────────────────────────────────
  for (const event of input.events) {
    const kind: AstroFactKind =
      event.type === 'solar_eclipse' || event.type === 'lunar_eclipse' ? 'eclipse' : 'lunation';

    facts.push({
      kind,
      label: event.description,
      value: event.date,
      sign: event.sign,
      degree: event.degree,
      source: event.source === 'event_table' ? 'event_table' : 'ephemeris',
      confidence: event.confidence,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    facts,
    impacts: input.impacts,
    events: input.events,
    guardrails: ASTRO_GUARDRAILS,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render payload.facts as a compact prompt section.
 * Preserves source tags so MAIA can cite provenance.
 */
export function renderFactsForPrompt(facts: AstroFact[]): string {
  if (facts.length === 0) return '';

  const byKind: Partial<Record<AstroFactKind, AstroFact[]>> = {};
  for (const f of facts) {
    if (!byKind[f.kind]) byKind[f.kind] = [];
    byKind[f.kind]!.push(f);
  }

  let out = '';

  if (byKind.planet_position?.length) {
    out += '**Current Planet Positions [source: ephemeris, confidence: known]:**\n';
    for (const f of byKind.planet_position) {
      out += `- ${f.label}: ${f.value}\n`;
    }
    out += '\n';
  }

  if (byKind.retrograde?.length) {
    out += `**Currently Retrograde:** ${byKind.retrograde.map(f => f.label.replace(' retrograde','')).join(', ')} [source: ephemeris]\n\n`;
  }

  if (byKind.moon_phase?.length) {
    out += `**Moon Phase:** ${byKind.moon_phase[0].value} [source: ephemeris]\n\n`;
  }

  const eventFacts = [...(byKind.eclipse ?? []), ...(byKind.lunation ?? [])];
  if (eventFacts.length > 0) {
    out += '**Upcoming Astronomical Events [source: event_table / calculated]:**\n';
    for (const f of eventFacts) {
      out += `- ${f.label} — ${f.value} [confidence: ${f.confidence}]\n`;
    }
    out += '\n';
  }

  return out;
}

/**
 * Render guardrails as a prompt directive block.
 */
export function renderGuardrailsForPrompt(guardrails: string[]): string {
  if (guardrails.length === 0) return '';
  let out = '**Epistemic Rules (enforce strictly):**\n';
  for (const g of guardrails) {
    out += `- ${g}\n`;
  }
  return out + '\n';
}
