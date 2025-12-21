/**
 * FACET ANALYTICS SERVICE
 * Phase 4.4-B: Analytics Dashboard Backend
 *
 * Provides aggregated consciousness trace analytics grouped by facet code.
 * Data sourced from facet_trace_summary view for optimal performance.
 */

import { query } from "../../../../lib/db/postgres";
import type { FacetCode } from "../../../../lib/consciousness/spiralogic-facet-mapping";

/**
 * Aggregated facet analytics from consciousness traces
 */
export interface FacetAnalytics {
  facetCode: FacetCode;
  element: "Fire" | "Water" | "Earth" | "Air" | "Aether" | "Unknown";
  phase: 1 | 2 | 3 | null;
  traceCount: number;
  avgConfidence: number;
  avgLatencyMs: number;
  lastTraceAt: string;  // ISO 8601
  firstTraceAt: string; // ISO 8601
}

/**
 * Element-level aggregation (rolls up all phases)
 */
export interface ElementAnalytics {
  element: "Fire" | "Water" | "Earth" | "Air" | "Aether";
  totalTraces: number;
  avgConfidence: number;
  avgLatencyMs: number;
  facets: FacetAnalytics[];
}

/**
 * Time-series analytics for trend visualization
 */
export interface TimeSeriesPoint {
  timestamp: string;  // ISO 8601
  facetCode: FacetCode;
  traceCount: number;
}

/**
 * Fetch all facet analytics from the summary view
 * Returns data sorted by trace count (descending)
 */
export async function getFacetAnalytics(): Promise<FacetAnalytics[]> {
  const sql = `
    SELECT
      facet as facet_code,
      'Unknown' as element,
      NULL::integer as phase,
      total_traces as trace_count,
      avg_confidence,
      avg_latency_ms,
      last_seen as last_trace_at,
      first_seen as first_trace_at
    FROM analytics_facet_distribution
    ORDER BY total_traces DESC
  `;

  const result = await query<{
    facet_code: string;
    element: string;
    phase: number | null;
    trace_count: number;
    avg_confidence: number;
    avg_latency_ms: number;
    last_trace_at: Date;
    first_trace_at: Date;
  }>(sql);

  return result.rows.map((row) => ({
    facetCode: row.facet_code as FacetCode,
    element: row.element as FacetAnalytics["element"],
    phase: row.phase as FacetAnalytics["phase"],
    traceCount: row.trace_count,
    avgConfidence: row.avg_confidence,
    avgLatencyMs: row.avg_latency_ms,
    lastTraceAt: row.last_trace_at.toISOString(),
    firstTraceAt: row.first_trace_at.toISOString(),
  }));
}

/**
 * Fetch analytics for a specific facet code
 * Returns null if no traces exist for that facet
 */
export async function getFacetAnalyticsByCode(
  facetCode: FacetCode
): Promise<FacetAnalytics | null> {
  const sql = `
    SELECT
      facet as facet_code,
      'Unknown' as element,
      NULL::integer as phase,
      total_traces as trace_count,
      avg_confidence,
      avg_latency_ms,
      last_seen as last_trace_at,
      first_seen as first_trace_at
    FROM analytics_facet_distribution
    WHERE facet = $1
  `;

  const result = await query<{
    facet_code: string;
    element: string;
    phase: number | null;
    trace_count: number;
    avg_confidence: number;
    avg_latency_ms: number;
    last_trace_at: Date;
    first_trace_at: Date;
  }>(sql, [facetCode]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    facetCode: row.facet_code as FacetCode,
    element: row.element as FacetAnalytics["element"],
    phase: row.phase as FacetAnalytics["phase"],
    traceCount: row.trace_count,
    avgConfidence: row.avg_confidence,
    avgLatencyMs: row.avg_latency_ms,
    lastTraceAt: row.last_trace_at.toISOString(),
    firstTraceAt: row.first_trace_at.toISOString(),
  };
}

/**
 * Fetch element-level analytics (aggregated across all phases)
 * Useful for high-level dashboard overview
 */
export async function getElementAnalytics(): Promise<ElementAnalytics[]> {
  const facets = await getFacetAnalytics();

  // Group by element
  const elementMap = new Map<string, FacetAnalytics[]>();
  for (const facet of facets) {
    if (facet.element === "Unknown") continue;

    if (!elementMap.has(facet.element)) {
      elementMap.set(facet.element, []);
    }
    elementMap.get(facet.element)!.push(facet);
  }

  // Aggregate
  const elements: ElementAnalytics[] = [];
  for (const [element, facetList] of elementMap.entries()) {
    const totalTraces = facetList.reduce((sum, f) => sum + f.traceCount, 0);
    const avgConfidence =
      facetList.reduce((sum, f) => sum + f.avgConfidence * f.traceCount, 0) /
      totalTraces;
    const avgLatencyMs =
      facetList.reduce((sum, f) => sum + f.avgLatencyMs * f.traceCount, 0) /
      totalTraces;

    elements.push({
      element: element as ElementAnalytics["element"],
      totalTraces,
      avgConfidence: Math.round(avgConfidence * 1000) / 1000,
      avgLatencyMs: Math.round(avgLatencyMs * 100) / 100,
      facets: facetList,
    });
  }

  // Sort by total traces descending
  return elements.sort((a, b) => b.totalTraces - a.totalTraces);
}

/**
 * Fetch time-series data for trend analysis
 * Groups traces by hour for the last N hours
 *
 * @param hoursBack - Number of hours to look back (default: 24)
 * @param facetCode - Optional: filter by specific facet
 */
export async function getTimeSeriesAnalytics(
  hoursBack: number = 24,
  facetCode?: FacetCode
): Promise<TimeSeriesPoint[]> {
  const sql = `
    SELECT
      DATE_TRUNC('hour', created_at) AS timestamp,
      facet,
      COUNT(*) AS trace_count
    FROM consciousness_traces
    WHERE
      created_at >= NOW() - INTERVAL '${hoursBack} hours'
      AND facet IS NOT NULL
      ${facetCode ? `AND facet = $1` : ""}
    GROUP BY DATE_TRUNC('hour', created_at), facet
    ORDER BY timestamp DESC, facet
  `;

  const result = await query<{
    timestamp: Date;
    facet: string;
    trace_count: number;
  }>(sql, facetCode ? [facetCode] : []);

  return result.rows.map((row) => ({
    timestamp: row.timestamp.toISOString(),
    facetCode: row.facet as FacetCode,
    traceCount: row.trace_count,
  }));
}

/**
 * Get top N most active facets by trace count
 *
 * @param limit - Number of facets to return (default: 5)
 */
export async function getTopFacets(limit: number = 5): Promise<FacetAnalytics[]> {
  const all = await getFacetAnalytics();
  return all.slice(0, limit);
}

/**
 * Get facets with low confidence scores (< threshold)
 * Useful for identifying areas needing better routing logic
 *
 * @param confidenceThreshold - Minimum confidence (default: 0.7)
 */
export async function getLowConfidenceFacets(
  confidenceThreshold: number = 0.7
): Promise<FacetAnalytics[]> {
  const all = await getFacetAnalytics();
  return all.filter((f) => f.avgConfidence < confidenceThreshold);
}

/**
 * EXAMPLE USAGE:
 *
 * ```typescript
 * // Get all facet analytics
 * const analytics = await getFacetAnalytics();
 * console.log(`Total facets with traces: ${analytics.length}`);
 *
 * // Get element-level overview
 * const elements = await getElementAnalytics();
 * console.log(`Water element: ${elements.find(e => e.element === 'Water')?.totalTraces} traces`);
 *
 * // Get time-series for last 24 hours
 * const timeSeries = await getTimeSeriesAnalytics(24);
 * console.log(`Hourly trace distribution: ${timeSeries.length} data points`);
 *
 * // Get top 5 most active facets
 * const topFacets = await getTopFacets(5);
 * console.log(`Most active: ${topFacets[0].facetCode} (${topFacets[0].traceCount} traces)`);
 * ```
 */
