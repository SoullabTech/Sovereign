/**
 * Astrology Authority Layer — Phase 7
 *
 * Prevents date-sensitive astronomical claims from being rendered unless
 * they are backed by facts[] or events[] in AstrologyContextPayload.
 *
 * SEPARATION ENFORCED HERE:
 *   facts[]   → occurrence (what IS, astronomically) — authoritative
 *   impacts[] → meaning (what it MEANS) — derived
 *   narrative → may combine both, but MAY NOT invent new occurrences
 *
 * Every renderer that outputs date-sensitive language must pass through
 * assertEventBacked() before producing prose.
 */

import type {
  AstroFact,
  AstrologyContextPayload,
  AstrologyAuthoritySummary,
} from '@/lib/astrology/astrologyPayload';
import type { TransitImpact } from '@/lib/astrology/transitInterpretation';

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AstroAuthority = 'authoritative' | 'derived' | 'fallback';

export type DateSensitiveClaimType =
  | 'eclipse'
  | 'lunation'
  | 'retrograde'
  | 'ingress'
  | 'exact_aspect'
  | 'calendar_date'
  | 'relative_time';

export interface AuthorityCheckResult {
  ok: boolean;
  authority: AstroAuthority;
  reason:
    | 'event_backed'
    | 'fact_backed'
    | 'impact_only'
    | 'fallback_only'
    | 'missing_support'
    | 'relative_time_not_allowed';
  supportingIds: string[];
}

export interface RenderableStatement {
  id: string;
  text: string;
  claimTypes: DateSensitiveClaimType[];
  source: AstroAuthority;
  traceId?: string;
  supportingIds?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const DATE_SENSITIVE_KINDS = new Set<DateSensitiveClaimType>([
  'eclipse', 'lunation', 'retrograde', 'ingress', 'exact_aspect', 'calendar_date',
]);

/** Detect which date-sensitive claim types appear in a text string */
export function detectClaimTypes(text: string): DateSensitiveClaimType[] {
  const lower = text.toLowerCase();
  const types: DateSensitiveClaimType[] = [];

  if (lower.includes('eclipse'))                                   types.push('eclipse');
  if (lower.includes('new moon') || lower.includes('full moon') ||
      lower.includes('lunation'))                                  types.push('lunation');
  if (lower.includes('retrograde'))                                types.push('retrograde');
  if (lower.includes('ingress'))                                   types.push('ingress');
  if (lower.includes('exact') && lower.includes('aspect'))        types.push('exact_aspect');
  if (/\d{4}-\d{2}-\d{2}/.test(text))                             types.push('calendar_date');
  if (/\b(today|tomorrow|this week|next week|next eclipse)\b/i.test(text))
                                                                   types.push('relative_time');
  return types;
}

export function isDateSensitiveStatement(statement: RenderableStatement): boolean {
  return statement.claimTypes.some(t => DATE_SENSITIVE_KINDS.has(t));
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT LOOKUPS
// ─────────────────────────────────────────────────────────────────────────────

function factId(fact: AstroFact, index: number): string {
  return fact.id ?? `fact:${fact.kind}:${index}`;
}

function factMatchesClaimType(fact: AstroFact, claimType: DateSensitiveClaimType): boolean {
  const kind = String(fact.kind ?? '').toLowerCase();
  switch (claimType) {
    case 'eclipse':      return kind.includes('eclipse');
    case 'lunation':     return kind === 'lunation' || kind === 'new_moon' || kind === 'full_moon';
    case 'retrograde':   return kind.includes('retrograde');
    case 'ingress':      return kind.includes('ingress');
    case 'exact_aspect': return kind.includes('aspect');
    case 'calendar_date':return Boolean(fact.value && /\d{4}-\d{2}-\d{2}/.test(String(fact.value)));
    default:             return false;
  }
}

function findSupportingFacts(
  payload: AstrologyContextPayload,
  claimTypes: DateSensitiveClaimType[]
): string[] {
  const ids: string[] = [];
  payload.facts.forEach((fact, i) => {
    for (const ct of claimTypes) {
      if (factMatchesClaimType(fact, ct)) { ids.push(factId(fact, i)); break; }
    }
  });
  return ids;
}

function findSupportingEvents(
  payload: AstrologyContextPayload,
  claimTypes: DateSensitiveClaimType[]
): string[] {
  const ids: string[] = [];
  (payload.events ?? []).forEach((event, i) => {
    const type = String(event.type ?? '').toLowerCase();
    const matched = claimTypes.some(ct => {
      switch (ct) {
        case 'eclipse':      return type.includes('eclipse');
        case 'lunation':     return type.includes('moon') || type.includes('lunation');
        case 'retrograde':   return type.includes('retrograde');
        case 'ingress':      return type.includes('ingress');
        case 'exact_aspect': return type.includes('aspect');
        case 'calendar_date':return Boolean(event.date && /\d{4}-\d{2}-\d{2}/.test(event.date));
        default:             return false;
      }
    });
    if (matched) ids.push((event as any).id ?? `event:${event.type}:${event.date ?? i}`);
  });
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE AUTHORITY CHECK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Primary gate: check whether a statement's date-sensitive claims are
 * backed by authoritative payload data.
 */
export function assertEventBacked(
  statement: RenderableStatement,
  payload: AstrologyContextPayload
): AuthorityCheckResult {
  if (statement.claimTypes.includes('relative_time')) {
    return { ok: false, authority: 'fallback', reason: 'relative_time_not_allowed', supportingIds: [] };
  }

  const eventIds = findSupportingEvents(payload, statement.claimTypes);
  if (eventIds.length > 0) {
    return { ok: true, authority: 'authoritative', reason: 'event_backed', supportingIds: eventIds };
  }

  const factIds = findSupportingFacts(payload, statement.claimTypes);
  if (factIds.length > 0) {
    return { ok: true, authority: 'authoritative', reason: 'fact_backed', supportingIds: factIds };
  }

  if (statement.claimTypes.length === 0) {
    return { ok: true, authority: statement.source, reason: 'impact_only', supportingIds: [] };
  }

  return { ok: false, authority: statement.source, reason: 'missing_support', supportingIds: [] };
}

export function canRenderDateSensitiveStatement(
  statement: RenderableStatement,
  payload: AstrologyContextPayload
): boolean {
  if (!isDateSensitiveStatement(statement)) return true;
  return assertEventBacked(statement, payload).ok;
}

export function isAuthoritativeAstroClaim(
  statement: RenderableStatement,
  payload: AstrologyContextPayload
): boolean {
  const result = assertEventBacked(statement, payload);
  return result.ok && result.authority === 'authoritative';
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE RENDERING
// ─────────────────────────────────────────────────────────────────────────────

export function decorateStatementAuthority(
  statement: RenderableStatement,
  payload: AstrologyContextPayload
): RenderableStatement {
  const result = assertEventBacked(statement, payload);
  return { ...statement, source: result.authority, supportingIds: result.supportingIds };
}

export function getSafeFallbackText(
  statement: RenderableStatement,
  payload: AstrologyContextPayload
): string {
  const result = assertEventBacked(statement, payload);
  if (result.ok) return statement.text;

  if (result.reason === 'relative_time_not_allowed') {
    return 'A time-sensitive astrological event is suggested here, but this system does not have authoritative event timing attached to this statement.';
  }
  return 'This interpretation may be meaningful, but it is not currently backed by authoritative event data for a date-specific claim.';
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT VALIDATION
// Uses our actual TransitImpact fields: synthesis, spiralogicVoice, somaticSignature
// ─────────────────────────────────────────────────────────────────────────────

export function validateImpactForRendering(
  impact: TransitImpact,
  payload: AstrologyContextPayload
): AuthorityCheckResult {
  // Gather all text surfaces that could contain date-sensitive language
  const text = [impact.synthesis, impact.spiralogicVoice, impact.somaticSignature]
    .filter(Boolean)
    .join(' ');

  const claimTypes = detectClaimTypes(text);

  const statement: RenderableStatement = {
    id: impact.traceId || 'impact:unknown',
    text,
    claimTypes,
    source: impact.source === 'fallback' ? 'fallback' : 'derived',
    traceId: impact.traceId,
  };

  return assertEventBacked(statement, payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// PRACTITIONER RENDER ITEM
// ─────────────────────────────────────────────────────────────────────────────

export interface PractitionerAstroRenderItem {
  traceId: string;
  text: string;
  authority: AstroAuthority;
  supportingIds: string[];
  renderBlocked: boolean;
  blockReason?: string;
}

export function buildPractitionerRenderItems(
  payload: AstrologyContextPayload
): PractitionerAstroRenderItem[] {
  return payload.impacts.map(impact => {
    const check = validateImpactForRendering(impact, payload);
    const text = [impact.synthesis, impact.spiralogicVoice].filter(Boolean).join(' — ');

    return {
      traceId: impact.traceId,
      text,
      authority: check.authority,
      supportingIds: check.supportingIds,
      renderBlocked: !check.ok,
      blockReason: check.ok ? undefined : check.reason,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY SUMMARY — payload-level health metrics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a payload-level authority summary.
 * Call this after buildAstrologyPayload() to attach instant health metrics.
 *
 * Usage:
 *   const payload = buildAstrologyPayload(input);
 *   payload.authoritySummary = buildAuthoritySummary(payload);
 */
export function buildAuthoritySummary(
  payload: AstrologyContextPayload
): AstrologyAuthoritySummary {
  const authoritativeFacts = payload.facts.filter(
    f => f.source === 'ephemeris' || f.source === 'event_table'
  ).length;

  const derivedImpacts = payload.impacts.filter(
    i => i.source === 'derived_interpretation'
  ).length;

  const fallbackImpacts = payload.impacts.filter(
    i => i.source === 'fallback'
  ).length;

  const blockedImpacts = payload.impacts.filter(
    i => !validateImpactForRendering(i, payload).ok
  ).length;

  return {
    totalFacts: payload.facts.length,
    totalImpacts: payload.impacts.length,
    totalEvents: payload.events.length,
    authoritativeFacts,
    derivedImpacts,
    fallbackImpacts,
    blockedImpacts,
    guardrailCount: payload.guardrails.length,
  };
}
