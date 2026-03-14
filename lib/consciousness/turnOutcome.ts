/**
 * TurnOutcome — normalized interpretation of a single oracle turn.
 *
 * This module owns meaning assembly. It does not write anything.
 * Side effects belong in lib/oracle/executeTurnWrites.ts.
 *
 * See: docs/oracle-turn-outcome-note.md
 */

import { randomUUID } from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TurnObservations {
  insights: string[];
  markers: string[];            // e.g. 'shadow', 'breakthrough', 'pattern-aware'
  symbolPatterns: string[];
  breakthroughDetected: boolean;
  emotionalTone?: string;
  relationalSignals?: string[];
}

export interface TurnSpiralState {
  element: string;
  phase: number;
  motion?: string;
  intensity?: number;
}

export type TurnDepth = 'threshold' | 'core' | 'deep';

export interface TurnOutcome {
  turnId: string;
  memberId: string;
  sessionId?: string;
  timestamp: string;

  turn: {
    user: string;
    maia: string;
  };

  observations: TurnObservations;
  spiral?: TurnSpiralState;
  depth: TurnDepth;

  metadata: {
    route: 'oracle';
    mode?: string;    // 'Talk' | 'Care' | 'Scribe'
    posture?: string;
  };
}

// ─── Builder ─────────────────────────────────────────────────────────────────

export interface BuildTurnOutcomeParams {
  memberId: string;
  sessionId?: string;
  userMessage: string;
  maiaResponse: string;
  observations: TurnObservations;
  spiral?: TurnSpiralState;
  depth: TurnDepth;
  mode?: string;
  posture?: string;
}

export function buildTurnOutcome(params: BuildTurnOutcomeParams): TurnOutcome {
  return {
    turnId: randomUUID(),
    memberId: params.memberId,
    sessionId: params.sessionId,
    timestamp: new Date().toISOString(),
    turn: {
      user: params.userMessage,
      maia: params.maiaResponse,
    },
    observations: params.observations,
    spiral: params.spiral,
    depth: params.depth,
    metadata: {
      route: 'oracle',
      mode: params.mode,
      posture: params.posture,
    },
  };
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

/**
 * Extract relational signals from a turn.
 * Centralizes cue extraction that was previously inline before saveRelationshipEssence.
 */
export function extractRelationalSignals(
  userMessage: string,
  maiaResponse: string,
  existingMarkers: string[]
): string[] {
  const signals: string[] = [];

  // Relationship-relevant markers propagate as relational signals
  const relationalMarkers = ['connection', 'rupture', 'repair', 'trust', 'boundary', 'intimacy'];
  for (const marker of existingMarkers) {
    if (relationalMarkers.some(r => marker.toLowerCase().includes(r))) {
      signals.push(marker);
    }
  }

  // Placeholder: inline pattern extraction from the route can migrate here
  // as part of the Step 1 extraction described in oracle-turn-outcome-note.md

  return signals;
}

/**
 * Normalize raw symbol pattern strings into a clean deduplicated list.
 */
export function normalizeSymbolPatterns(raw: string[]): string[] {
  return [...new Set(raw.map(s => s.trim().toLowerCase()).filter(Boolean))];
}
