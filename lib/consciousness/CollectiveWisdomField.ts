/**
 * SOVEREIGNTY: CollectiveWisdomField — non-sovereign, blocked.
 *
 * The original implementation used:
 *   - OpenAI (gpt-4-turbo-preview) for contribution analysis
 *   - Supabase for storage (collective_contributions, collective_journey_patterns, etc.)
 *
 * Both are prohibited under MAIA's zero-access doctrine and no-Supabase invariant.
 * This file has no live callers in the current serving path.
 *
 * Type shapes are preserved for compiler compatibility.
 * The runtime class throws on any attempt to use it, surfacing the dependency
 * before it can silently transmit data.
 *
 * When this feature is ready to implement properly, it should use:
 *   - Claude (Anthropic) for analysis
 *   - Self-hosted PostgreSQL via lib/db/postgres.ts for storage
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 */

// ─── Type exports (safe — no runtime cost) ────────────────────────────────

export interface JourneyPattern {
  patternId: string;
  patternName: string;
  contributingSouls: Array<{ userId: string; name?: string; uniqueGift: string; journeyPhase: string }>;
  commonThresholds: string[];
  elementalSignatures: { fire: number; water: number; earth: number; air: number; aether: number };
  wisdomExtracted: string;
  exampleJourneys: string[];
}

export interface InterferenceSignature {
  signatureId: string;
  whenWhoMeets: string[];
  whatEmerges: string;
  conditions: string[];
  somaticMarkers: string[];
  timestamp: Date;
  sessionId: string;
  depthLevel: number;
}

export interface TraditionParallel {
  parallelId: string;
  universalPrinciple: string;
  traditions: Array<{ tradition: string; terminology: string; practices: string[]; uniqueGifts: string[]; keyTexts: string[] }>;
  spiralogicMapping: { elements: string[]; archetypes: string[]; practices: string[] };
}

// ─── Runtime class (blocked) ──────────────────────────────────────────────

export class CollectiveWisdomField {
  constructor() {
    throw new Error(
      'SOVEREIGNTY VIOLATION: CollectiveWisdomField is non-sovereign (used OpenAI + Supabase). ' +
        'This feature must be reimplemented with Claude and PostgreSQL before use. ' +
        'See lib/ai/openaiPolicy.ts and CLAUDE.md database invariants.'
    );
  }
}

export function getCollectiveWisdomField(): CollectiveWisdomField {
  throw new Error(
    'SOVEREIGNTY VIOLATION: CollectiveWisdomField is blocked. ' +
      'See lib/consciousness/CollectiveWisdomField.ts for migration notes.'
  );
}
