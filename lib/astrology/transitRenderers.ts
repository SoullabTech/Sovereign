/**
 * Transit Renderers — Phase 10 / Phase 11
 *
 * String renderers (unchanged, backward-compatible):
 *   renderDiagnostic(impacts, payload?)   — clinical, precise
 *   renderMAIA(impacts, payload?)         — relational, MAIA voice
 *   renderSpiralogic(impacts, payload?)   — elemental dynamics
 *   renderPractitioner(impacts, payload?) — structured blocks
 *   renderPractitionerText(impacts, payload?) — text form of practitioner blocks
 *
 * Structured item renderers (Phase 11 — text + audit metadata per item):
 *   renderDiagnosticItems(impacts, payload?)       → DiagnosticRenderItem[]
 *   renderMAIAItems(impacts, payload?)             → MAIARenderItem[]
 *   renderSpiralogicItems(impacts, payload?)       → SpiralogicRenderItem[]
 *   renderPractitionerItemsContract(impacts, payload?) → PractitionerRenderItemContract[]
 *
 * All renderers are pure functions: same input → same output.
 * No model calls. No side effects. Safe to cache.
 *
 * AUTHORITY GATING: All renderers accept an optional payload parameter.
 * When provided, each impact is validated against the authority layer before rendering.
 * Blocked impacts are suppressed and replaced with safe boundary text.
 * Without a payload, renderers operate in passthrough mode (no gating).
 */

import type { TransitImpact, TransitForce } from '@/lib/astrology/transitInterpretation';
import type { AstrologyContextPayload } from '@/lib/astrology/astrologyPayload';
import {
  validateImpactForRendering,
  getSafeFallbackText,
  detectClaimTypes,
} from '@/lib/astrology/astrologyAuthority';
import type { RenderableStatement } from '@/lib/astrology/astrologyAuthority';
import type {
  DiagnosticRenderItem,
  MAIARenderItem,
  SpiralogicRenderItem,
  PractitionerRenderItemContract,
  RenderAuditMeta,
  TransitRendererMode,
} from '@/lib/astrology/transitRenderContracts';
import { buildRenderBatchAudit } from '@/lib/astrology/transitRenderContracts';
export { buildRenderBatchAudit };

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY HELPER
// ─────────────────────────────────────────────────────────────────────────────

const BOUNDARY_TEXT =
  'This interpretation may be meaningful, but it is not currently backed by authoritative event data for a date-specific claim.';

function checkImpact(
  impact: TransitImpact,
  payload: AstrologyContextPayload | undefined
): { ok: boolean; reason?: string } {
  if (!payload) return { ok: true };
  const result = validateImpactForRendering(impact, payload);
  return { ok: result.ok, reason: result.reason };
}

function safeFallback(impact: TransitImpact, payload: AstrologyContextPayload): string {
  const text = [impact.synthesis, impact.spiralogicVoice].filter(Boolean).join(' ');
  const claimTypes = detectClaimTypes(text);
  const stmt: RenderableStatement = {
    id: impact.traceId,
    text,
    claimTypes,
    source: impact.source === 'fallback' ? 'fallback' : 'derived',
    traceId: impact.traceId,
  };
  return getSafeFallbackText(stmt, payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC — clinical precision, minimal interpretation
// Suitable for: debugging, testing, practitioner dashboards, audit logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders impacts as structured diagnostic text.
 * Every field is explicit: planet, aspect, orb, element, source, confidence.
 * Blocked impacts are annotated with [RENDER BLOCKED] rather than suppressed,
 * because the diagnostic output is itself an audit trail.
 */
export function renderDiagnostic(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): string {
  if (impacts.length === 0) return '';

  const lines: string[] = ['[TRANSIT DIAGNOSTIC]', ''];

  for (const impact of impacts) {
    const check = checkImpact(impact, payload);

    lines.push(
      `Natal ${cap(impact.natalPlanet)} (${impact.element.toUpperCase()}) — ${impact.domain}`,
      `  traceId:    ${impact.traceId}`,
      `  source:     ${impact.source}`,
      `  confidence: ${impact.confidence}`,
    );

    if (!check.ok) {
      lines.push(`  [RENDER BLOCKED: ${check.reason}]`, '');
      continue;
    }

    for (const force of impact.forces) {
      const dir = force.applying ? 'APPLYING' : 'SEPARATING';
      lines.push(
        `  ↳ ${cap(force.transitPlanet)} ${force.aspectType.toUpperCase()} (orb: ${force.orb}°, ${dir})`,
        `     element:  ${force.transitElement}`,
        `     effect:   ${force.effect}`,
        `     source:   ${force.source} / ${force.confidence}`,
      );
    }

    lines.push(`  synthesis:  ${impact.synthesis}`, '');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIA RELATIONAL — psychologically attuned, MAIA's natural voice
// Suitable for: oracle system prompt context, conversation framing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders impacts in MAIA's relational voice — named forces, felt quality,
 * invitational framing. Does not assert facts; interprets dynamics.
 * Blocked impacts are replaced with safe boundary text.
 */
export function renderMAIA(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): string {
  if (impacts.length === 0) return '';

  const sections: string[] = ['**What the sky is doing now:**', ''];

  for (const impact of impacts) {
    const check = checkImpact(impact, payload);

    sections.push(`**${cap(impact.natalPlanet)} — ${impact.domain}**`);

    if (!check.ok && payload) {
      sections.push(safeFallback(impact, payload), '');
      continue;
    }

    const forceDesc = formatForcesNatural(impact.forces);
    sections.push(forceDesc, '', impact.spiralogicVoice);

    if (impact.somaticSignature) {
      sections.push(impact.somaticSignature);
    }
    sections.push('');
  }

  return sections.join('\n');
}

function formatForcesNatural(forces: TransitForce[]): string {
  if (forces.length === 0) return '';
  if (forces.length === 1) {
    const f = forces[0];
    const dir = f.applying ? 'moving in' : 'moving through';
    return `${cap(f.transitPlanet)} is ${dir} ${f.aspectType} — ${f.effect}`;
  }
  const parts = forces.map(f => {
    const dir = f.applying ? '(approaching)' : '(separating)';
    return `${cap(f.transitPlanet)} ${f.aspectType} ${dir}`;
  });
  return parts.join(', ') + ` — ${forces[0].effect}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPIRALOGIC — elemental dynamics at center, elements named first
// Suitable for: Spiralogic mode responses, elemental awareness framing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders impacts through the Spiralogic elemental lens.
 * Elements are foregrounded; planets are the named agents of those elements.
 * Blocked impacts are replaced with safe boundary text.
 */
export function renderSpiralogic(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): string {
  if (impacts.length === 0) return '';

  const sections: string[] = ['**Elemental Field:**', ''];

  for (const impact of impacts) {
    const check = checkImpact(impact, payload);
    const natalEl = cap(impact.element);
    const forceEls = [...new Set(impact.forces.map(f => cap(f.transitElement)))].join(' + ');

    sections.push(`**${natalEl} (${cap(impact.natalPlanet)})** ← ${forceEls}`);

    if (!check.ok && payload) {
      sections.push(safeFallback(impact, payload), '');
      continue;
    }

    sections.push(impact.spiralogicVoice);

    if (impact.forces.length > 0) {
      sections.push(`Elemental quality: ${impact.synthesis}`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// PRACTITIONER — timing, somatic, integration guidance, caution flags
// Suitable for: deep facilitation work, practitioner-mode oracle, session prep
// ─────────────────────────────────────────────────────────────────────────────

export interface PractitionerImpactBlock {
  natalPlanet: string;
  element: string;
  domain: string;
  traceId: string;
  forces: Array<{
    planet: string;
    aspect: string;
    orb: number;
    timing: 'applying' | 'separating';
    element: string;
    effect: string;
  }>;
  synthesis: string;
  somaticSignature?: string;
  integrationQuestion: string;
  cautionFlags: string[];
  authority: 'authoritative' | 'derived' | 'fallback';
  renderBlocked: boolean;
  blockReason?: string;
}

/**
 * Renders impacts as structured practitioner blocks.
 * When payload is provided, blocked impacts are flagged with renderBlocked=true
 * and their synthesis replaced with safe boundary text.
 */
export function renderPractitioner(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): PractitionerImpactBlock[] {
  return impacts.map(impact => {
    const check = checkImpact(impact, payload);
    const blocked = !check.ok;

    return {
      natalPlanet: impact.natalPlanet,
      element: impact.element,
      domain: impact.domain,
      traceId: impact.traceId,
      forces: impact.forces.map(f => ({
        planet: f.transitPlanet,
        aspect: f.aspectType,
        orb: f.orb,
        timing: (f.applying ? 'applying' : 'separating') as 'applying' | 'separating',
        element: f.transitElement,
        effect: f.effect,
      })),
      synthesis: blocked && payload ? safeFallback(impact, payload) : impact.synthesis,
      somaticSignature: blocked ? undefined : impact.somaticSignature,
      integrationQuestion: blocked ? '' : buildIntegrationQuestion(impact),
      cautionFlags: buildCautionFlags(impact),
      authority: impact.source === 'derived_interpretation' ? 'derived' : 'fallback',
      renderBlocked: blocked,
      blockReason: check.reason,
    };
  });
}

/**
 * Render practitioner blocks as a formatted prompt section.
 * Blocked impacts emit boundary text; integration questions are suppressed.
 */
export function renderPractitionerText(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): string {
  const blocks = renderPractitioner(impacts, payload);
  if (blocks.length === 0) return '';

  const lines: string[] = ['**Active Transit Pressures (Practitioner View):**', ''];

  for (const block of blocks) {
    lines.push(`**${cap(block.natalPlanet)} (${cap(block.element)}) — ${block.domain}**`);

    if (block.renderBlocked) {
      lines.push(block.synthesis, '');
      continue;
    }

    for (const f of block.forces) {
      const timing = f.timing === 'applying' ? 'building' : 'releasing';
      lines.push(`- ${cap(f.planet)} ${f.aspect} / ${f.orb}° orb / ${timing} — ${f.effect}`);
    }

    lines.push(`Synthesis: ${block.synthesis}`);

    if (block.somaticSignature) {
      lines.push(`Somatic: ${block.somaticSignature}`);
    }

    if (block.integrationQuestion) {
      lines.push(`Reflection: ${block.integrationQuestion}`);
    }

    if (block.cautionFlags.length > 0) {
      lines.push(`Caution: ${block.cautionFlags.join('; ')}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED ITEM RENDERERS — Phase 11
// Parallel to the string renderers above; return text + RenderAuditMeta per item.
// Use these for dashboards, QA, cross-agent reuse, and any caller that needs
// to inspect provenance rather than just consume the rendered string.
// ─────────────────────────────────────────────────────────────────────────────

/** Build a RenderAuditMeta from an impact check result */
function buildAudit(
  impact: TransitImpact,
  check: { ok: boolean; reason?: string; supportingIds?: string[] },
  mode: TransitRendererMode,
  passthrough: boolean
): RenderAuditMeta {
  return {
    traceId: impact.traceId,
    authority: check.ok
      ? (impact.source === 'derived_interpretation' ? 'derived' : 'fallback')
      : 'fallback',
    supportingIds: check.supportingIds ?? [],
    renderBlocked: !check.ok,
    blockReason: check.ok ? undefined : check.reason,
    rendererMode: mode,
    passthrough,
  };
}

/** Per-impact check helper — returns structured result including supportingIds */
function checkImpactFull(
  impact: TransitImpact,
  payload: AstrologyContextPayload | undefined
): { ok: boolean; reason?: string; supportingIds: string[] } {
  if (!payload) return { ok: true, supportingIds: [] };
  const result = validateImpactForRendering(impact, payload);
  return { ok: result.ok, reason: result.reason, supportingIds: result.supportingIds };
}

export function renderDiagnosticItems(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): DiagnosticRenderItem[] {
  const passthrough = !payload;
  return impacts.map(impact => {
    const check = checkImpactFull(impact, payload);
    const text = !check.ok
      ? `[RENDER BLOCKED: ${check.reason}] traceId: ${impact.traceId}`
      : [
          `Natal ${cap(impact.natalPlanet)} (${impact.element.toUpperCase()})`,
          ...impact.forces.map(f => `  ${cap(f.transitPlanet)} ${f.aspectType} ${f.orb}° — ${f.effect}`),
          `  synthesis: ${impact.synthesis}`,
        ].join('\n');
    return { text, audit: buildAudit(impact, check, 'diagnostic', passthrough) };
  });
}

export function renderMAIAItems(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): MAIARenderItem[] {
  const passthrough = !payload;
  return impacts.map(impact => {
    const check = checkImpactFull(impact, payload);
    const text = !check.ok && payload
      ? safeFallback(impact, payload)
      : [
          impact.spiralogicVoice,
          impact.somaticSignature ?? '',
        ].filter(Boolean).join(' ');
    return { text, audit: buildAudit(impact, check, 'maia', passthrough) };
  });
}

export function renderSpiralogicItems(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): SpiralogicRenderItem[] {
  const passthrough = !payload;
  return impacts.map(impact => {
    const check = checkImpactFull(impact, payload);
    const text = !check.ok && payload
      ? safeFallback(impact, payload)
      : `${cap(impact.element)} ← ${[...new Set(impact.forces.map(f => cap(f.transitElement)))].join(' + ')}: ${impact.synthesis}`;
    return { text, audit: buildAudit(impact, check, 'spiralogic', passthrough) };
  });
}

export function renderPractitionerItemsContract(
  impacts: TransitImpact[],
  payload?: AstrologyContextPayload
): PractitionerRenderItemContract[] {
  const passthrough = !payload;
  return impacts.map(impact => {
    const check = checkImpactFull(impact, payload);
    const text = !check.ok && payload
      ? safeFallback(impact, payload)
      : [
          impact.synthesis,
          impact.somaticSignature ?? '',
          buildIntegrationQuestion(impact),
        ].filter(Boolean).join('\n');
    return { text, audit: buildAudit(impact, check, 'practitioner', passthrough) };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRACTITIONER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildIntegrationQuestion(impact: TransitImpact): string {
  const planet = impact.natalPlanet;
  const element = impact.element;
  const planets = impact.forces.map(f => cap(f.transitPlanet)).join(' and ');

  if (impact.forces.length === 0) return '';

  if (planet === 'mars' || planet === 'sun') {
    return `Where is your ${element} trying to move, and what is ${planets} asking of it right now?`;
  }
  if (planet === 'moon') {
    return `What is this ${element} beneath the surface — and what would it need to feel safe to surface fully?`;
  }
  if (planet === 'mercury') {
    return `What is trying to be understood here, and is the mind being asked to slow down or to clarify?`;
  }
  if (planet === 'venus') {
    return `What do you value most in this moment, and is ${planets} supporting or testing that?`;
  }
  if (planet === 'ascendant') {
    return `How are you showing up right now — and is that congruent with what you're actually holding?`;
  }
  if (planet === 'chiron') {
    return `What old wound is being touched by this pressure — and what would it mean to let it complete its arc?`;
  }

  return `What is ${planets} revealing about your ${cap(element)} right now?`;
}

function buildCautionFlags(impact: TransitImpact): string[] {
  const flags: string[] = [];
  const applyingTight = impact.forces.filter(f => f.applying && f.orb <= 2);
  const multiOuter = impact.forces.length >= 2;
  const hasPluto = impact.forces.some(f => f.transitPlanet === 'pluto');
  const hasSaturn = impact.forces.some(f => f.transitPlanet === 'saturn');
  const hasNeptune = impact.forces.some(f => f.transitPlanet === 'neptune');

  if (applyingTight.length > 0) {
    const planets = applyingTight.map(f => cap(f.transitPlanet)).join(' + ');
    flags.push(`${planets} within 2° — pressure peak approaching`);
  }

  if (multiOuter) {
    flags.push('Multiple outer planets active — avoid premature interpretation or action');
  }

  if (hasPluto && hasSaturn) {
    flags.push('Saturn + Pluto: structural transformation under pressure — slow facilitation required');
  }

  if (hasNeptune && (impact.element === 'fire' || impact.element === 'earth')) {
    flags.push(`Neptune on ${cap(impact.element)}: direction may feel lost — do not force clarity`);
  }

  if (impact.source === 'fallback') {
    flags.push('Interpretation uses fallback text — aspect library has no specific entry for this combination');
  }

  return flags;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
