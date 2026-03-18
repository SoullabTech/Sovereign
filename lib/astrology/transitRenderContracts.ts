/**
 * Transit Render Contracts — Phase 11
 *
 * Stable audit grammar for all rendered astrology output.
 *
 * Every rendered item exposes two surfaces:
 *   text  — the string content (compatible with existing prompt callers)
 *   audit — provenance metadata (for dashboards, QA, cross-agent reuse)
 *
 * This type file is the shared contract between renderers, dashboards,
 * and any future system that consumes rendered astrology.
 *
 * Design principle: audit metadata travels with the output, not separate from it.
 * "Why did MAIA say this?" is answerable from the rendered item itself.
 */

import type { AstroAuthority } from '@/lib/astrology/astrologyPayload';

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER MODE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export type TransitRendererMode =
  | 'diagnostic'
  | 'maia'
  | 'spiralogic'
  | 'practitioner'
  | 'practitioner_text';

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT METADATA
// Attached to every rendered item. Answers: "where did this come from?"
// ─────────────────────────────────────────────────────────────────────────────

export interface RenderAuditMeta {
  /** Deterministic trace key from TransitImpact — links to aspect + synthesis path */
  traceId: string;

  /** Trust tier: authoritative (ephemeris/event_table) | derived | fallback */
  authority: AstroAuthority;

  /** Which payload records back this item (empty if fallback or passthrough) */
  supportingIds: string[];

  /** True if the authority layer suppressed the original content */
  renderBlocked: boolean;

  /** Why it was blocked — undefined when renderBlocked is false */
  blockReason?: string;

  /** Which renderer produced this item */
  rendererMode: TransitRendererMode;

  /**
   * True when no payload was provided — authority gating was not applied.
   * Callers should treat passthrough items as unvalidated.
   */
  passthrough: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERED ITEM CONTRACTS
// One per renderer mode — text + audit at the item level.
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticRenderItem {
  text: string;
  audit: RenderAuditMeta;
}

export interface MAIARenderItem {
  text: string;
  audit: RenderAuditMeta;
}

export interface SpiralogicRenderItem {
  text: string;
  audit: RenderAuditMeta;
}

export interface PractitionerRenderItemContract {
  text: string;
  audit: RenderAuditMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER BATCH CONTRACT
// The full output shape for a rendered payload.
// ─────────────────────────────────────────────────────────────────────────────

export interface RenderBatchAudit {
  rendererMode: TransitRendererMode;
  totalItems: number;
  blockedItems: number;
  authoritativeItems: number;
  derivedItems: number;
  fallbackItems: number;
  passthroughMode: boolean;
}

/** Compute a summary audit for a batch of rendered items */
export function buildRenderBatchAudit(
  items: Array<{ audit: RenderAuditMeta }>,
  rendererMode: TransitRendererMode
): RenderBatchAudit {
  return {
    rendererMode,
    totalItems: items.length,
    blockedItems: items.filter(i => i.audit.renderBlocked).length,
    authoritativeItems: items.filter(i => i.audit.authority === 'authoritative').length,
    derivedItems: items.filter(i => i.audit.authority === 'derived').length,
    fallbackItems: items.filter(i => i.audit.authority === 'fallback').length,
    passthroughMode: items.some(i => i.audit.passthrough),
  };
}
