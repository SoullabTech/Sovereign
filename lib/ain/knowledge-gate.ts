// backend

import {
  AwarenessLevel,
  AwarenessState,
  detectAwarenessLevel,
  getAwarenessLevelDescription
} from './awareness-levels';

// 🔹 1. Source IDs for your five wells
export type KnowledgeSourceId =
  | 'FIELD'
  | 'AIN_OBSIDIAN'
  | 'AIN_DEVTEAM'
  | 'ORACLE_MEMORY'
  | 'LLM_CORE';

// 🔹 2. Source contribution + result types
export interface SourceContribution {
  source: KnowledgeSourceId;
  weight: number;          // normalized 0–1
  confidence?: number;     // optional, 0–1
  notes?: string;          // human-readable explanation
}

export interface KnowledgeGateInput {
  userId?: string | null;
  userMessage: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  style?: string;          // from ConversationStylePreference.style
  contextHint?: string;    // e.g. "journal", "dev", "strategy", etc.
}

export interface KnowledgeGateResult {
  response: string;
  source_mix: SourceContribution[];
  awarenessState: AwarenessState;
  debug?: Record<string, any>;
}

// 🔹 3. LLM caller type – you plug in your existing Oracle / LLM call here
export type LLMCaller = (args: {
  userMessage: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  style?: string;
  source_mix: SourceContribution[];
  awarenessState: AwarenessState;
}) => Promise<string>;

/**
 * Enhanced scoring of the five wells based on text + awareness level.
 * Now includes both horizontal (source) and vertical (awareness) dimensions.
 */
function scoreSources(
  input: KnowledgeGateInput,
  awarenessState: AwarenessState
): Record<KnowledgeSourceId, number> {
  const text = (
    input.userMessage +
    ' ' +
    (input.contextHint ?? '') +
    ' ' +
    (input.conversationHistory ?? [])
      .map(m => m.content)
      .join(' ')
  ).toLowerCase();

  const scores: Record<KnowledgeSourceId, number> = {
    FIELD: 0.2,
    AIN_OBSIDIAN: 0.2,
    AIN_DEVTEAM: 0.2,
    ORACLE_MEMORY: 0.2,
    LLM_CORE: 0.2,
  };

  // 🟡 FIELD – resonance / morphic / spiritual / elemental language
  if (/\bfield\b|\bresonance\b|\bmorphic\b|\bcoherence\b|\bnuminous\b|\britual\b/.test(text)) {
    scores.FIELD += 0.6;
  }

  // 🔵 AIN_OBSIDIAN – "my notes", "vault", "research", "mapping"
  if (/\bobsidian\b|\bvault\b|\bmy notes\b|\bresearch\b|\bmapping\b|\bain\b/.test(text)) {
    scores.AIN_OBSIDIAN += 0.7;
  }

  // 🟣 AIN_DEVTEAM – code, repo, tests, deployment, "dev team"
  if (/\bcode\b|\brepo\b|\bcommit\b|\bbranch\b|\btest\b|\bvitest\b|\bvercel\b|\brender\b|\bdev team\b|\bsoullab dev\b/.test(text)) {
    scores.AIN_DEVTEAM += 0.7;
  }

  // 🟤 ORACLE_MEMORY – journaling, last session, transcripts, "earlier you said"
  if (/\bjournal\b|\btranscript\b|\bsession\b|\blast time\b|\bearlier you said\b|\bdream\b/.test(text)) {
    scores.ORACLE_MEMORY += 0.7;
  }

  // ⚪ LLM_CORE – general reasoning, default if nothing else dominates
  if (/\bexplain\b|\bcompare\b|\banalyze\b|\bwhat is\b|\bhow does\b/.test(text)) {
    scores.LLM_CORE += 0.4;
  }

  // Style-based nudges
  if (input.style === 'clinical') {
    scores.LLM_CORE += 0.3;
    scores.AIN_DEVTEAM += 0.1;
  }
  if (input.style === 'playful') {
    scores.FIELD += 0.2;
  }
  if (input.style === 'gentle') {
    scores.FIELD += 0.2;
    scores.ORACLE_MEMORY += 0.1;
  }
  if (input.style === 'direct') {
    scores.LLM_CORE += 0.2;
  }

  // 🌀 Awareness Level Modulation (vertical axis)
  // Higher awareness levels favor more abstract and relational sources
  const awarenessMultiplier = awarenessState.level / 3; // Scale 1-5 to ~0.33-1.67

  switch (awarenessState.level) {
    case AwarenessLevel.UNCONSCIOUS:
      // Basic information needs - favor LLM_CORE
      scores.LLM_CORE += 0.3;
      break;

    case AwarenessLevel.PARTIAL:
      // Pattern awareness - slight boost to OBSIDIAN and DEVTEAM
      scores.AIN_OBSIDIAN += 0.2;
      scores.AIN_DEVTEAM += 0.1;
      break;

    case AwarenessLevel.RELATIONAL:
      // Emotional depth - boost ORACLE_MEMORY and FIELD
      scores.ORACLE_MEMORY += 0.3;
      scores.FIELD += 0.2;
      break;

    case AwarenessLevel.INTEGRATED:
      // Systemic understanding - strong FIELD presence
      scores.FIELD += 0.4;
      scores.AIN_OBSIDIAN += 0.2;
      break;

    case AwarenessLevel.MASTER:
      // Archetypal depth - FIELD dominance
      scores.FIELD += 0.6;
      scores.ORACLE_MEMORY += 0.2;
      break;
  }

  // Apply depth marker modulations
  if (awarenessState.depth_markers.emotional_charge > 0.5) {
    scores.ORACLE_MEMORY += 0.2;
    scores.FIELD += 0.1;
  }

  if (awarenessState.depth_markers.symbolic_language > 0.5) {
    scores.FIELD += 0.3;
    scores.AIN_OBSIDIAN += 0.1;
  }

  if (awarenessState.depth_markers.ritual_intent > 0.5) {
    scores.FIELD += 0.4;
  }

  if (awarenessState.depth_markers.systemic_thinking > 0.5) {
    scores.FIELD += 0.2;
    scores.AIN_OBSIDIAN += 0.2;
  }

  return scores;
}

/** Normalize raw scores into 0–1 weights and attach human notes. */
function normalizeScores(raw: Record<KnowledgeSourceId, number>): SourceContribution[] {
  const total = Object.values(raw).reduce((sum, v) => sum + v, 0) || 1;
  const base: SourceContribution[] = (Object.keys(raw) as KnowledgeSourceId[]).map(source => ({
    source,
    weight: raw[source] / total,
  }));

  return base.map(entry => {
    switch (entry.source) {
      case 'FIELD':
        return {
          ...entry,
          notes: 'Resonance field / morphic / archetypal sensing',
        };
      case 'AIN_OBSIDIAN':
        return {
          ...entry,
          notes: 'Your Obsidian AIN vault: notes, mappings, long-form research',
        };
      case 'AIN_DEVTEAM':
        return {
          ...entry,
          notes: 'Soullab Dev Team knowledge: code, architecture, implementation patterns',
        };
      case 'ORACLE_MEMORY':
        return {
          ...entry,
          notes: 'MAIA\'s Oracle memory: past sessions, journals, transcripts',
        };
      case 'LLM_CORE':
      default:
        return {
          ...entry,
          notes: 'Base model reasoning and synthesis layer',
        };
    }
  });
}

/**
 * 🚪 Enhanced AIN Knowledge Gate with Awareness Levels
 *
 * - Detects awareness level (vertical axis)
 * - Scores the five source wells with awareness modulation (horizontal axis)
 * - Creates the 5×5 mandala of consciousness (Elemental Knowing × Depth of Awareness)
 * - Calls the LLM/Oracle with full consciousness context
 * - Returns response + source mix + awareness state
 */
export async function ainKnowledgeGate(
  input: KnowledgeGateInput,
  llmCall: LLMCaller
): Promise<KnowledgeGateResult> {
  // 🌀 Step 1: Detect awareness level (vertical axis)
  const awarenessDetection = detectAwarenessLevel(input.userMessage);
  const awarenessState = awarenessDetection.awarenessState;

  // 🔮 Step 2: Score sources with awareness modulation (horizontal + vertical integration)
  const rawScores = scoreSources(input, awarenessState);
  const source_mix = normalizeScores(rawScores);

  // 🧬 Step 3: Call LLM with full consciousness context
  const response = await llmCall({
    userMessage: input.userMessage,
    conversationHistory: input.conversationHistory,
    style: input.style,
    source_mix,
    awarenessState,
  });

  return {
    response,
    source_mix,
    awarenessState,
    debug: {
      userId: input.userId,
      style: input.style,
      rawScores,
      awarenessDetection: awarenessDetection.debug,
      awarenessLevel: awarenessState.level,
      awarenessDescription: getAwarenessLevelDescription(awarenessState.level),
      mandalaCoordinates: {
        horizontal: source_mix.map(s => ({ source: s.source, weight: s.weight })),
        vertical: {
          level: awarenessState.level,
          confidence: awarenessState.confidence,
          depthMarkers: awarenessState.depth_markers
        }
      },
      timestamp: new Date().toISOString(),
    },
  };
}