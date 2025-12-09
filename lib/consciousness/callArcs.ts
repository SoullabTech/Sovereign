/**
 * CallArc System - Trackable Spirals for Nested Callings
 * Each calling (micro/meso/macro) becomes a named arc through the torus
 * Enables MAIA to track nested spirals and their relationships over time
 */

import type {
  CallScale,
  CallKind,
  SpiralogicPosition
} from './spiralogicPosition';
import type { FacetCode } from './spiralogicFacets';

// ====================================================================
// CALL ARC CORE TYPES
// ====================================================================

export type CallArcStatus = 'active' | 'paused' | 'completed' | 'dormant';

export interface CallArc {
  id: string;
  userId: string;

  // Core identity
  title: string;           // e.g. "Land-based life", "Herbalism 101 Quest"
  description?: string;

  // Scale and kind classification
  scale: CallScale;        // micro | meso | macro
  kind: CallKind;          // learning | lifestyle | service | etc.
  domain?: string;         // vocation | relationship | spiritual_path | etc.

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;

  // Status and lifecycle
  status: CallArcStatus;

  // Optional intended horizon (for reflection, not pressure)
  horizonMonths?: number;  // e.g. 1 (micro quest), 24 (meso chapter), undefined (macro way-of-life)

  // Current felt position in the spiral
  currentPosition?: SpiralogicPosition;

  // Nested relationships
  parentArcId?: string;    // if this is nested within a larger calling
  childArcIds?: string[];  // nested callings within this one

  // Light-weight history summary (for quick UI usage)
  stats?: {
    totalEvents: number;
    lastFacetCodes: FacetCode[];    // ["F2", "W1", "E1"] etc.
    lastEventAt?: string;
    phaseSummary?: string;          // "Currently in Fire 1 → early Water 1"
  };

  // User-defined tags and notes
  tags?: string[];
  notes?: string;

  // Completion tracking
  completedAt?: string;
  completionInsight?: string;
}

// ====================================================================
// ARC RELATIONSHIPS & NESTING
// ====================================================================

export interface ArcNestingMap {
  userId: string;
  macroArcs: CallArc[];      // Way-of-life level callings
  mesoArcs: CallArc[];       // Chapter-level callings
  microArcs: CallArc[];      // Quest-level callings
  orphanArcs: CallArc[];     // Arcs without clear nesting
}

export function buildNestingMap(arcs: CallArc[]): ArcNestingMap {
  const userId = arcs[0]?.userId || '';

  const macroArcs = arcs.filter(arc => arc.scale === 'macro');
  const mesoArcs = arcs.filter(arc => arc.scale === 'meso');
  const microArcs = arcs.filter(arc => arc.scale === 'micro');
  const orphanArcs = arcs.filter(arc => !arc.parentArcId && arc.scale !== 'macro');

  return {
    userId,
    macroArcs,
    mesoArcs,
    microArcs,
    orphanArcs
  };
}

// ====================================================================
// ARC CREATION & INFERENCE
// ====================================================================

export interface CallArcCreationParams {
  title: string;
  description?: string;
  scale: CallScale;
  kind: CallKind;
  domain?: string;
  horizonMonths?: number;
  parentArcId?: string;
  tags?: string[];
  initialPosition?: SpiralogicPosition;
}

export function createCallArc(
  userId: string,
  params: CallArcCreationParams
): CallArc {
  const id = generateArcId();
  const now = new Date().toISOString();

  // Suggest horizon based on scale if not provided
  let horizonMonths = params.horizonMonths;
  if (!horizonMonths) {
    switch (params.scale) {
      case 'micro':
        horizonMonths = Math.random() > 0.5 ? 1 : 2; // 1-2 months
        break;
      case 'meso':
        horizonMonths = 6 + Math.floor(Math.random() * 18); // 6-24 months
        break;
      case 'macro':
        // Intentionally undefined for macro - it's a way of life
        break;
    }
  }

  return {
    id,
    userId,
    title: params.title,
    description: params.description,
    scale: params.scale,
    kind: params.kind,
    domain: params.domain,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    status: 'active',
    horizonMonths,
    currentPosition: params.initialPosition,
    parentArcId: params.parentArcId,
    childArcIds: [],
    stats: {
      totalEvents: 0,
      lastFacetCodes: [],
      phaseSummary: params.initialPosition ?
        `Starting in ${params.initialPosition.facet}` :
        'Initial calling phase'
    },
    tags: params.tags || [],
    notes: ''
  };
}

// ====================================================================
// ARC LINKING & NESTING LOGIC
// ====================================================================

export function findPotentialParentArcs(
  newArc: CallArc,
  existingArcs: CallArc[]
): CallArc[] {
  const candidates: CallArc[] = [];

  // Only look for parents in larger scales
  const largerScales: CallScale[] = [];
  if (newArc.scale === 'micro') largerScales.push('meso', 'macro');
  if (newArc.scale === 'meso') largerScales.push('macro');

  for (const existingArc of existingArcs) {
    if (!largerScales.includes(existingArc.scale)) continue;
    if (existingArc.status === 'completed') continue;

    // Check domain overlap
    if (newArc.domain && existingArc.domain &&
        newArc.domain === existingArc.domain) {
      candidates.push(existingArc);
      continue;
    }

    // Check kind synergy
    if (newArc.kind === existingArc.kind) {
      candidates.push(existingArc);
      continue;
    }

    // Check title/description semantic similarity (basic keyword matching)
    const newWords = (newArc.title + ' ' + (newArc.description || '')).toLowerCase();
    const existingWords = (existingArc.title + ' ' + (existingArc.description || '')).toLowerCase();

    const keywords = ['land', 'healing', 'art', 'creative', 'spiritual', 'service', 'community'];
    for (const keyword of keywords) {
      if (newWords.includes(keyword) && existingWords.includes(keyword)) {
        candidates.push(existingArc);
        break;
      }
    }
  }

  return candidates;
}

export function linkArcToParent(childArc: CallArc, parentArc: CallArc): void {
  childArc.parentArcId = parentArc.id;

  if (!parentArc.childArcIds) {
    parentArc.childArcIds = [];
  }

  if (!parentArc.childArcIds.includes(childArc.id)) {
    parentArc.childArcIds.push(childArc.id);
  }
}

// ====================================================================
// ARC REFLECTION & SUMMARY
// ====================================================================

export function generateArcSummary(arc: CallArc): string {
  const scaleLabel = arc.scale.charAt(0).toUpperCase() + arc.scale.slice(1);
  const kindLabel = arc.kind.replace('_', ' ');

  let summary = `${scaleLabel} ${kindLabel} calling: "${arc.title}"`;

  if (arc.currentPosition) {
    summary += ` • Currently in ${arc.currentPosition.facet}`;

    if (arc.stats?.phaseSummary) {
      summary += ` (${arc.stats.phaseSummary})`;
    }
  }

  if (arc.status !== 'active') {
    summary += ` • Status: ${arc.status}`;
  }

  if (arc.horizonMonths) {
    const timeframe = arc.horizonMonths < 6 ?
      `${arc.horizonMonths} month${arc.horizonMonths > 1 ? 's' : ''}` :
      `${Math.round(arc.horizonMonths / 12)} year${arc.horizonMonths > 12 ? 's' : ''}`;
    summary += ` • ~${timeframe} horizon`;
  }

  return summary;
}

export function generateNestingInsight(
  focusArc: CallArc,
  nestingMap: ArcNestingMap
): string {
  const insights: string[] = [];

  // Parent context
  if (focusArc.parentArcId) {
    const parent = [...nestingMap.macroArcs, ...nestingMap.mesoArcs]
      .find(arc => arc.id === focusArc.parentArcId);

    if (parent) {
      insights.push(`This ${focusArc.scale} calling serves your larger ${parent.scale} calling: "${parent.title}"`);
    }
  }

  // Child context
  if (focusArc.childArcIds && focusArc.childArcIds.length > 0) {
    const children = [...nestingMap.mesoArcs, ...nestingMap.microArcs]
      .filter(arc => focusArc.childArcIds!.includes(arc.id));

    if (children.length > 0) {
      insights.push(`This calling is supported by ${children.length} nested ${children[0].scale} calling${children.length > 1 ? 's' : ''}`);
    }
  }

  // Sibling context
  if (focusArc.parentArcId) {
    const siblings = [...nestingMap.mesoArcs, ...nestingMap.microArcs]
      .filter(arc => arc.parentArcId === focusArc.parentArcId && arc.id !== focusArc.id);

    if (siblings.length > 0) {
      insights.push(`${siblings.length} other calling${siblings.length > 1 ? 's' : ''} also serve${siblings.length === 1 ? 's' : ''} this larger arc`);
    }
  }

  return insights.join('. ');
}

// ====================================================================
// UTILITIES
// ====================================================================

function generateArcId(): string {
  return 'arc_' + Math.random().toString(36).substring(2, 15);
}

export function getActiveArcs(arcs: CallArc[]): CallArc[] {
  return arcs.filter(arc => arc.status === 'active');
}

export function getRecentArcs(arcs: CallArc[], daysBack: number = 90): CallArc[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  return arcs.filter(arc => {
    const lastActive = new Date(arc.lastActiveAt || arc.updatedAt);
    return lastActive >= cutoff;
  });
}

export function updateArcPosition(
  arc: CallArc,
  newPosition: SpiralogicPosition
): void {
  const oldPosition = arc.currentPosition;
  arc.currentPosition = newPosition;
  arc.updatedAt = new Date().toISOString();
  arc.lastActiveAt = arc.updatedAt;

  // Update stats
  if (!arc.stats) arc.stats = { totalEvents: 0, lastFacetCodes: [] };

  arc.stats.totalEvents += 1;
  arc.stats.lastEventAt = arc.updatedAt;

  // Track facet progression
  if (!arc.stats.lastFacetCodes.includes(newPosition.facet)) {
    arc.stats.lastFacetCodes.push(newPosition.facet);

    // Keep last 5 facets
    if (arc.stats.lastFacetCodes.length > 5) {
      arc.stats.lastFacetCodes = arc.stats.lastFacetCodes.slice(-5);
    }
  }

  // Update phase summary
  if (oldPosition && oldPosition.facet !== newPosition.facet) {
    arc.stats.phaseSummary = `${oldPosition.facet} → ${newPosition.facet}`;
  } else {
    arc.stats.phaseSummary = `Currently in ${newPosition.facet}`;
  }
}