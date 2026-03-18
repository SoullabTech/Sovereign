/**
 * Symbolic Authority Contracts — Phase 12
 *
 * Generalizes the astrology governance model into a shared symbolic authority
 * layer. These types can be reused by:
 *   - astrology (transit interpretation, render gating)
 *   - journal interpretation (source fragments, extracted symbols, derived meaning)
 *   - pattern ledger synthesis (observed evidence vs. inferred pattern)
 *   - field sensing / relational inference
 *
 * CORE SEPARATION PRINCIPLE (all symbolic domains):
 *   occurrence layer  — what IS (facts, events, observations) — authoritative
 *   meaning layer     — what it MEANS (interpretation, synthesis) — derived
 *   narrative layer   — how it is expressed (renderers, voice) — contextual
 *
 * Renderers in any domain must pass through authority gating before emitting
 * date-sensitive, time-relative, or occurrence-asserting language.
 *
 * Design: audit metadata travels with output, not separate from it.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC DOMAIN REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All symbolic domains that use the shared governance layer.
 * Add new domains here as they are scaffolded.
 */
export type SymbolicDomain =
  | 'astrology'
  | 'journal'
  | 'pattern_ledger'
  | 'field';

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY TIERS
// Same three-tier model as the astrology layer, generalized across domains.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trust tier for any symbolic claim:
 *   authoritative — backed by source data (ephemeris, event table, raw text, logged observation)
 *   derived       — inferred via interpretation engine, grounded in source
 *   fallback      — generated without source backing; may still be useful but unverified
 */
export type SymbolicAuthority = 'authoritative' | 'derived' | 'fallback';

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM TYPES — GENERALIZED
// Each domain may extend this with domain-specific claim types.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cross-domain claim types that require backing before render.
 */
export type SymbolicClaimType =
  // Shared: time-relative language always blocked
  | 'relative_time'
  // Shared: exact calendar dates need source backing
  | 'calendar_date'
  // Astrology-specific (retained for interop)
  | 'eclipse'
  | 'lunation'
  | 'retrograde'
  | 'ingress'
  | 'exact_aspect'
  // Journal-specific
  | 'recurring_pattern'   // "you always..." / "this keeps happening"
  | 'causation_claim'     // "because X, you Y" — causal inference
  | 'identity_claim'      // "you are..." — character assertion
  // Pattern ledger
  | 'trend_assertion'     // "there is a trend of..." — requires N observations
  // Field
  | 'field_shift'         // "something has shifted" — needs anchored contrast
  | 'relational_claim';   // "in your relationships..." — needs relational data

// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC AUDIT METADATA
// The universal audit grammar — one shape across all domains and renderers.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attached to every rendered item in any symbolic domain.
 * Answers: "where did this come from, and was it safe to render?"
 */
export interface SymbolicAuditMeta {
  /** Deterministic trace key — links to the source item that produced this output */
  traceId: string;

  /** Which symbolic domain produced this item */
  domain: SymbolicDomain;

  /** Trust tier: authoritative | derived | fallback */
  authority: SymbolicAuthority;

  /** IDs of source records that back this item (empty if fallback or passthrough) */
  supportingIds: string[];

  /** True if the authority layer suppressed the original content */
  renderBlocked: boolean;

  /** Why it was blocked — undefined when renderBlocked is false */
  blockReason?: string;

  /** Which claim types were detected in the text */
  detectedClaimTypes: SymbolicClaimType[];

  /**
   * True when no payload was provided — authority gating was not applied.
   * Callers must treat passthrough items as unvalidated.
   */
  passthrough: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC RENDER ITEM
// The universal rendered output shape — text + audit, any domain.
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicRenderItem {
  text: string;
  audit: SymbolicAuditMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC AUTHORITY SUMMARY
// Payload-level health metrics — computable for any domain payload.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Summary of a domain payload's authority health.
 * Equivalent to AstrologyAuthoritySummary, generalized.
 */
export interface SymbolicAuthoritySummary {
  domain: SymbolicDomain;

  /** Total items in the payload's primary collection */
  totalItems: number;

  /** Items backed by authoritative source data */
  authoritativeItems: number;

  /** Items produced by the interpretation engine */
  derivedItems: number;

  /** Items generated without source backing */
  fallbackItems: number;

  /** Items blocked from rendering by the authority gate */
  blockedItems: number;

  /** Number of guardrails active for this payload */
  guardrailCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY CHECK RESULT — GENERALIZED
// Same shape as AuthorityCheckResult in astrologyAuthority.ts, domain-agnostic.
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicAuthorityCheckResult {
  ok: boolean;
  authority: SymbolicAuthority;
  reason:
    | 'source_backed'
    | 'derived_only'
    | 'fallback_only'
    | 'missing_support'
    | 'relative_time_not_allowed'
    | 'unsupported_claim_type';
  supportingIds: string[];
  detectedClaimTypes: SymbolicClaimType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH AUDIT — GENERALIZED
// Summary across a collection of rendered items.
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicRenderBatchAudit {
  domain: SymbolicDomain;
  totalItems: number;
  blockedItems: number;
  authoritativeItems: number;
  derivedItems: number;
  fallbackItems: number;
  passthroughMode: boolean;
}

/** Compute a summary audit for a batch of rendered symbolic items */
export function buildSymbolicRenderBatchAudit(
  items: Array<{ audit: SymbolicAuditMeta }>,
  domain: SymbolicDomain
): SymbolicRenderBatchAudit {
  return {
    domain,
    totalItems: items.length,
    blockedItems: items.filter(i => i.audit.renderBlocked).length,
    authoritativeItems: items.filter(i => i.audit.authority === 'authoritative').length,
    derivedItems: items.filter(i => i.audit.authority === 'derived').length,
    fallbackItems: items.filter(i => i.audit.authority === 'fallback').length,
    passthroughMode: items.some(i => i.audit.passthrough),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTROLOGY INTEROP
// Map astrology's RenderAuditMeta → SymbolicAuditMeta (domain: 'astrology').
// Preserves backward compatibility — existing astrology callers are unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import type { RenderAuditMeta } from '@/lib/astrology/transitRenderContracts';

/**
 * Convert an astrology RenderAuditMeta to the shared SymbolicAuditMeta.
 * Used when astrology output is consumed by a cross-domain system.
 */
export function astrologyAuditToSymbolic(audit: RenderAuditMeta): SymbolicAuditMeta {
  return {
    traceId: audit.traceId,
    domain: 'astrology',
    authority: audit.authority as SymbolicAuthority,
    supportingIds: audit.supportingIds,
    renderBlocked: audit.renderBlocked,
    blockReason: audit.blockReason,
    // Astrology audit does not carry detectedClaimTypes at item level — empty here.
    // Full claim detection happens in astrologyAuthority.ts validateImpactForRendering().
    detectedClaimTypes: [],
    passthrough: audit.passthrough,
  };
}

/**
 * Wrap an astrology SymbolicRenderItem with the shared contract shape.
 */
export function astrologyRenderItemToSymbolic(
  item: { text: string; audit: RenderAuditMeta }
): SymbolicRenderItem {
  return {
    text: item.text,
    audit: astrologyAuditToSymbolic(item.audit),
  };
}
