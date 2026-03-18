/**
 * Symbolic Telemetry — Phase 17
 *
 * Runtime instrumentation for the governed symbolic pipeline.
 * Purely observational — no behavior changes.
 *
 * WHAT THIS ANSWERS IN PRODUCTION:
 *   - How often are items blocked, and by which rule?
 *   - What is the authority distribution across domains?
 *   - How much material reaches each surface (prompt / practitioner / user / memory)?
 *   - Is any domain overproducing fallback / question_seed output?
 *   - Which cross-domain synthesis attempts are succeeding vs being blocked?
 *   - Is memory being appropriately filtered, or is it accepting too much or too little?
 *
 * DESIGN PRINCIPLE:
 *   Telemetry is a read-only view of the governance layer.
 *   It captures what the governance rules already decided — nothing more.
 *   It does not change what gets blocked or rendered.
 *
 * USAGE PATTERN:
 *   const event = telemetryFromIngressItem(item);
 *   recordTelemetryEvent(event, session);          // fire-and-forget
 *   const summary = buildTelemetrySummary(events); // for dashboards / audit
 */

import type { SymbolicDomain, SymbolicAuthority } from '@/lib/symbolic/symbolicAuthorityContracts';
import type { PromptRole, PromptIngressItem } from '@/lib/symbolic/promptIngressGovernance';

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY EVENT
// One event per governed symbolic item that passes through prompt ingress.
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicTelemetryEvent {
  traceId: string;
  domain: SymbolicDomain | 'cross_domain';
  authority: SymbolicAuthority;
  promptRole: PromptRole;
  renderBlocked: boolean;
  blockReason?: string;
  allowedInPrompt: boolean;
  allowedInPractitionerView: boolean;
  allowedInUserView: boolean;
  allowedInMemory: boolean;
  /** ISO timestamp of when this item was processed */
  timestamp?: string;
  /** Optional session identifier for per-session aggregation */
  sessionId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CONSTRUCTION
// Build a telemetry event from a governed prompt ingress item.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a telemetry event from a PromptIngressItem.
 * This is the primary ingress point — called after buildPromptIngressItem().
 */
export function telemetryFromIngressItem(
  item: PromptIngressItem,
  sessionId?: string
): SymbolicTelemetryEvent {
  return {
    traceId: item.traceId,
    domain: item.domain,
    authority: item.authority,
    promptRole: item.promptRole,
    renderBlocked: item.renderBlocked,
    blockReason: item.blockReason,
    allowedInPrompt: item.allowedInPrompt,
    allowedInPractitionerView: item.allowedInPractitionerView,
    allowedInUserView: item.allowedInUserView,
    allowedInMemory: item.allowedInMemory,
    timestamp: new Date().toISOString(),
    sessionId,
  };
}

/**
 * Derive telemetry events from a batch of PromptIngressItems.
 */
export function telemetryFromIngressBatch(
  items: PromptIngressItem[],
  sessionId?: string
): SymbolicTelemetryEvent[] {
  return items.map(item => telemetryFromIngressItem(item, sessionId));
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY SUMMARY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetryDomainSummary {
  domain: SymbolicDomain | 'cross_domain';
  totalItems: number;
  authoritativeCount: number;
  derivedCount: number;
  fallbackCount: number;
  blockedCount: number;
  allowedInPromptCount: number;
  allowedInUserViewCount: number;
  allowedInMemoryCount: number;
  blockReasonBreakdown: Record<string, number>;
}

export interface TelemetryAuthoritySummary {
  authority: SymbolicAuthority;
  totalItems: number;
  promptRoleBreakdown: Record<PromptRole, number>;
  allowedInPromptCount: number;
  allowedInMemoryCount: number;
}

export interface TelemetryRoleSummary {
  role: PromptRole;
  count: number;
  domains: Record<string, number>;
}

export interface TelemetryBlockSummary {
  totalBlocked: number;
  byReason: Record<string, number>;
  byDomain: Record<string, number>;
  /** Percentage of total events that were blocked (0–100) */
  blockRate: number;
}

export interface TelemetrySurfaceSummary {
  totalEvents: number;
  allowedInPrompt: number;
  allowedInPractitionerView: number;
  allowedInUserView: number;
  allowedInMemory: number;
  excludedFromAll: number;
  /** Memory yield rate: allowedInMemory / totalEvents (0–1) */
  memoryYieldRate: number;
  /** User view yield rate: allowedInUserView / totalEvents (0–1) */
  userViewYieldRate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL TELEMETRY SUMMARY
// All aggregations in one structure — for dashboards and audit reports.
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetrySummary {
  totalEvents: number;
  sessionId?: string;
  generatedAt: string;

  /** Per-domain breakdowns */
  byDomain: TelemetryDomainSummary[];

  /** Per-authority breakdowns */
  byAuthority: TelemetryAuthoritySummary[];

  /** Per-role breakdowns */
  byRole: TelemetryRoleSummary[];

  /** Block analysis */
  blocks: TelemetryBlockSummary;

  /** Surface eligibility summary */
  surfaces: TelemetrySurfaceSummary;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

function increment(record: Record<string, number>, key: string): void {
  record[key] = (record[key] ?? 0) + 1;
}

export function buildDomainSummaries(
  events: SymbolicTelemetryEvent[]
): TelemetryDomainSummary[] {
  const map = new Map<string, TelemetryDomainSummary>();

  for (const event of events) {
    const key = event.domain;
    if (!map.has(key)) {
      map.set(key, {
        domain: key as SymbolicDomain | 'cross_domain',
        totalItems: 0,
        authoritativeCount: 0,
        derivedCount: 0,
        fallbackCount: 0,
        blockedCount: 0,
        allowedInPromptCount: 0,
        allowedInUserViewCount: 0,
        allowedInMemoryCount: 0,
        blockReasonBreakdown: {},
      });
    }

    const s = map.get(key)!;
    s.totalItems++;
    if (event.authority === 'authoritative') s.authoritativeCount++;
    if (event.authority === 'derived') s.derivedCount++;
    if (event.authority === 'fallback') s.fallbackCount++;
    if (event.renderBlocked) {
      s.blockedCount++;
      if (event.blockReason) increment(s.blockReasonBreakdown, event.blockReason);
    }
    if (event.allowedInPrompt) s.allowedInPromptCount++;
    if (event.allowedInUserView) s.allowedInUserViewCount++;
    if (event.allowedInMemory) s.allowedInMemoryCount++;
  }

  return [...map.values()];
}

export function buildAuthoritySummaries(
  events: SymbolicTelemetryEvent[]
): TelemetryAuthoritySummary[] {
  const authorities: SymbolicAuthority[] = ['authoritative', 'derived', 'fallback'];

  return authorities.map(authority => {
    const subset = events.filter(e => e.authority === authority);
    const promptRoleBreakdown: Record<PromptRole, number> = {
      fact: 0, interpretation: 0, uncertainty: 0, question_seed: 0, excluded: 0,
    };
    for (const e of subset) {
      promptRoleBreakdown[e.promptRole]++;
    }
    return {
      authority,
      totalItems: subset.length,
      promptRoleBreakdown,
      allowedInPromptCount: subset.filter(e => e.allowedInPrompt).length,
      allowedInMemoryCount: subset.filter(e => e.allowedInMemory).length,
    };
  });
}

export function buildRoleSummaries(
  events: SymbolicTelemetryEvent[]
): TelemetryRoleSummary[] {
  const roles: PromptRole[] = ['fact', 'interpretation', 'uncertainty', 'question_seed', 'excluded'];

  return roles.map(role => {
    const subset = events.filter(e => e.promptRole === role);
    const domains: Record<string, number> = {};
    for (const e of subset) increment(domains, e.domain);
    return { role, count: subset.length, domains };
  });
}

export function buildBlockSummary(
  events: SymbolicTelemetryEvent[]
): TelemetryBlockSummary {
  const blocked = events.filter(e => e.renderBlocked);
  const byReason: Record<string, number> = {};
  const byDomain: Record<string, number> = {};

  for (const e of blocked) {
    if (e.blockReason) increment(byReason, e.blockReason);
    increment(byDomain, e.domain);
  }

  return {
    totalBlocked: blocked.length,
    byReason,
    byDomain,
    blockRate: events.length > 0 ? (blocked.length / events.length) * 100 : 0,
  };
}

export function buildSurfaceSummary(
  events: SymbolicTelemetryEvent[]
): TelemetrySurfaceSummary {
  const total = events.length;
  const allowedInPrompt = events.filter(e => e.allowedInPrompt).length;
  const allowedInPractitionerView = events.filter(e => e.allowedInPractitionerView).length;
  const allowedInUserView = events.filter(e => e.allowedInUserView).length;
  const allowedInMemory = events.filter(e => e.allowedInMemory).length;
  const excludedFromAll = events.filter(
    e => !e.allowedInPrompt && !e.allowedInPractitionerView &&
         !e.allowedInUserView && !e.allowedInMemory
  ).length;

  return {
    totalEvents: total,
    allowedInPrompt,
    allowedInPractitionerView,
    allowedInUserView,
    allowedInMemory,
    excludedFromAll,
    memoryYieldRate: total > 0 ? allowedInMemory / total : 0,
    userViewYieldRate: total > 0 ? allowedInUserView / total : 0,
  };
}

/**
 * Build the full telemetry summary from a batch of events.
 * Use this for dashboards, session audit reports, and anomaly detection.
 */
export function buildTelemetrySummary(
  events: SymbolicTelemetryEvent[],
  sessionId?: string
): TelemetrySummary {
  return {
    totalEvents: events.length,
    sessionId,
    generatedAt: new Date().toISOString(),
    byDomain: buildDomainSummaries(events),
    byAuthority: buildAuthoritySummaries(events),
    byRole: buildRoleSummaries(events),
    blocks: buildBlockSummary(events),
    surfaces: buildSurfaceSummary(events),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANOMALY DETECTION HELPERS
// Lightweight heuristics to surface operational concerns from telemetry.
// These return observations only — no behavior changes.
// ─────────────────────────────────────────────────────────────────────────────

export interface TelemetryAnomaly {
  kind:
    | 'high_block_rate'           // >30% of items blocked
    | 'fallback_dominance'        // >50% of items are fallback
    | 'memory_starvation'         // <10% of items reach memory
    | 'user_view_starvation'      // <20% of items reach user view
    | 'no_authoritative_items'    // zero authoritative items in session
    | 'cross_domain_mostly_blocked'; // >50% of cross_domain syntheses blocked
  details: string;
  severity: 'info' | 'warn';
}

/**
 * Detect operational anomalies from a telemetry summary.
 * Returns observations for logging or practitioner review — no action taken.
 */
export function detectTelemetryAnomalies(
  summary: TelemetrySummary
): TelemetryAnomaly[] {
  const anomalies: TelemetryAnomaly[] = [];
  const { surfaces, blocks, byAuthority, byDomain } = summary;

  if (surfaces.totalEvents === 0) return anomalies;

  // High block rate
  if (blocks.blockRate > 30) {
    anomalies.push({
      kind: 'high_block_rate',
      details: `${blocks.blockRate.toFixed(1)}% of items were blocked. Check if claim detection rules are over-triggering.`,
      severity: 'warn',
    });
  }

  // Fallback dominance
  const fallbackTotal = byAuthority.find(a => a.authority === 'fallback')?.totalItems ?? 0;
  if (summary.totalEvents > 0 && (fallbackTotal / summary.totalEvents) > 0.5) {
    anomalies.push({
      kind: 'fallback_dominance',
      details: `${fallbackTotal} of ${summary.totalEvents} items are fallback authority (${((fallbackTotal / summary.totalEvents) * 100).toFixed(1)}%). Symbolic pipeline may lack source grounding.`,
      severity: 'warn',
    });
  }

  // Memory starvation
  if (surfaces.memoryYieldRate < 0.1 && surfaces.totalEvents >= 5) {
    anomalies.push({
      kind: 'memory_starvation',
      details: `Only ${(surfaces.memoryYieldRate * 100).toFixed(1)}% of items are eligible for memory. This may be intentional, or the governance rules may be too restrictive.`,
      severity: 'info',
    });
  }

  // User view starvation
  if (surfaces.userViewYieldRate < 0.2 && surfaces.totalEvents >= 5) {
    anomalies.push({
      kind: 'user_view_starvation',
      details: `Only ${(surfaces.userViewYieldRate * 100).toFixed(1)}% of items reach user view. Check for over-triggering of assertive framing or claim type rules.`,
      severity: 'warn',
    });
  }

  // No authoritative items
  const authCount = byAuthority.find(a => a.authority === 'authoritative')?.totalItems ?? 0;
  if (authCount === 0 && summary.totalEvents >= 3) {
    anomalies.push({
      kind: 'no_authoritative_items',
      details: 'No authoritative items in this session. All symbolic output is derived or fallback — no facts anchor the interpretation.',
      severity: 'info',
    });
  }

  // Cross-domain mostly blocked
  const crossDomain = byDomain.find(d => d.domain === 'cross_domain');
  if (crossDomain && crossDomain.totalItems >= 2) {
    const crossBlockRate = crossDomain.blockedCount / crossDomain.totalItems;
    if (crossBlockRate > 0.5) {
      anomalies.push({
        kind: 'cross_domain_mostly_blocked',
        details: `${(crossBlockRate * 100).toFixed(1)}% of cross-domain synthesis attempts were blocked. Domains may be frequently diverging or producing fallback-only output.`,
        severity: 'info',
      });
    }
  }

  return anomalies;
}
