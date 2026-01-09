/**
 * RCN Routing Decision Logic
 *
 * Determines when to route queries to the Recursive Corpus Navigator
 * based on intent detection, corpus availability, and context signals.
 */

import type { CorpusType, RcnIntent } from './budgetRouter';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RcnRoutingDecision {
  /** Whether RCN should handle this query */
  shouldUseRcn: boolean;
  /** Detected corpus type */
  corpusType: CorpusType;
  /** Detected intent */
  intent: RcnIntent;
  /** Explicit corpus paths/identifiers (if known) */
  corpus?: string[];
  /** Reasoning for the decision */
  rationale: string[];
  /** Confidence in the decision (0-1) */
  confidence: number;
}

export interface ConversationContext {
  /** Current voice mode */
  mode: 'dialogue' | 'counsel' | 'scribe';
  /** Recent messages for context */
  recentMessages?: string[];
  /** User's active corpus/vault path */
  vaultPath?: string;
  /** Available corpus types for this user */
  availableCorpora?: CorpusType[];
  /** Is this a sanctuary (private) session? */
  isSanctuary?: boolean;
  /** Current elemental field (from governor) */
  activeElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

// ═══════════════════════════════════════════════════════════════════════════════
// Intent Detection Patterns
// ═══════════════════════════════════════════════════════════════════════════════

const INTENT_PATTERNS: Record<RcnIntent, RegExp[]> = {
  chat: [
    /^(hi|hello|hey|thanks|ok|sure)/i,
  ],
  summarize: [
    /summarize|summary|overview|tldr|key points|main ideas/i,
    /give me the gist|what's (this|that|it) about/i,
  ],
  compare: [
    /compare|difference|differ|versus|vs\.?|contrast/i,
    /how (is|are|does) .+ different/i,
    /what changed|changes between/i,
  ],
  find_canonical: [
    /what (is|does) .+ say about/i,
    /according to|find (the|a) (definition|quote|passage)/i,
    /canonical|authoritative|official/i,
  ],
  verify: [
    /verify|confirm|check (if|whether)|validate|is (it|this) true/i,
    /prove|evidence|support for|cite|citation/i,
  ],
  debug: [
    /debug|error|bug|issue|problem|broken|fix|why (is|does|doesn't)/i,
    /not working|failing|crash/i,
  ],
  refactor: [
    /refactor|improve|optimize|clean up|reorganize/i,
    /better way to|simplify/i,
  ],
  audit: [
    /audit|review|assess|evaluate|analyze (all|every|thoroughly)/i,
    /compliance|security|thorough|comprehensive/i,
  ],
};

const CORPUS_SIGNAL_PATTERNS: Record<CorpusType, RegExp[]> = {
  general: [],
  docs: [
    /document(s|ation)?|readme|guide|manual|spec/i,
    /community commons|commons/i,
  ],
  transcript: [
    /conversation|chat|discussion|meeting|session/i,
    /transcript|recording|what (did|was) (I|we|they) (say|discuss)/i,
  ],
  codebase: [
    /code|function|class|component|file|module/i,
    /implementation|source|repo|codebase/i,
  ],
  vault: [
    /vault|obsidian|notes?|journal/i,
    /my (notes|writing|journal)/i,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Core Detection Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect the user's intent from their query
 */
function detectIntent(input: string): { intent: RcnIntent; confidence: number } {
  const lowerInput = input.toLowerCase();
  const matches: Array<{ intent: RcnIntent; confidence: number }> = [];

  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [RcnIntent, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(lowerInput)) {
        // Different intents have different base confidences
        const baseConfidence = intent === 'chat' ? 0.3 : 0.7;
        matches.push({ intent, confidence: baseConfidence });
        break; // Only count each intent once
      }
    }
  }

  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);

  // Return best match, or default to 'chat' with low confidence
  return matches[0] || { intent: 'chat', confidence: 0.2 };
}

/**
 * Detect which corpus type the query is targeting
 */
function detectCorpusType(input: string, context: ConversationContext): { corpusType: CorpusType; confidence: number } {
  const lowerInput = input.toLowerCase();
  const matches: Array<{ corpusType: CorpusType; confidence: number }> = [];

  // Check corpus signal patterns
  for (const [corpusType, patterns] of Object.entries(CORPUS_SIGNAL_PATTERNS) as [CorpusType, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(lowerInput)) {
        matches.push({ corpusType, confidence: 0.75 });
        break;
      }
    }
  }

  // Context-based signals
  if (context.vaultPath && lowerInput.includes('my')) {
    matches.push({ corpusType: 'vault', confidence: 0.6 });
  }

  if (context.mode === 'scribe') {
    // Scribe mode often deals with transcripts
    matches.push({ corpusType: 'transcript', confidence: 0.5 });
  }

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);

  // Return best match, or default to 'general'
  return matches[0] || { corpusType: 'general', confidence: 0.3 };
}

/**
 * Determine if RCN should handle this query
 */
function shouldUseRcn(
  input: string,
  intentResult: { intent: RcnIntent; confidence: number },
  corpusResult: { corpusType: CorpusType; confidence: number },
  context: ConversationContext
): { should: boolean; rationale: string[] } {
  const rationale: string[] = [];

  // Never use RCN in sanctuary sessions (privacy)
  if (context.isSanctuary) {
    rationale.push('Sanctuary session: RCN disabled for privacy');
    return { should: false, rationale };
  }

  // Voice mode prefers low latency
  const isVoice = context.mode === 'dialogue';
  if (isVoice && intentResult.intent !== 'verify' && intentResult.intent !== 'find_canonical') {
    rationale.push(`Voice mode: prefer direct response for ${intentResult.intent}`);
    return { should: false, rationale };
  }

  // Intent-based routing
  const rcnIntents: RcnIntent[] = ['compare', 'find_canonical', 'verify', 'debug', 'refactor', 'audit'];
  const isRcnIntent = rcnIntents.includes(intentResult.intent);

  if (isRcnIntent && intentResult.confidence > 0.5) {
    rationale.push(`RCN intent detected: ${intentResult.intent} (confidence: ${intentResult.confidence.toFixed(2)})`);
    return { should: true, rationale };
  }

  // Corpus-based routing
  const corpusRichTypes: CorpusType[] = ['docs', 'codebase', 'vault', 'transcript'];
  const hasCorpusSignal = corpusRichTypes.includes(corpusResult.corpusType) && corpusResult.confidence > 0.5;

  if (hasCorpusSignal) {
    rationale.push(`Corpus signal: ${corpusResult.corpusType} (confidence: ${corpusResult.confidence.toFixed(2)})`);

    // Even non-RCN intents benefit from RCN if corpus is available
    if (intentResult.intent === 'summarize') {
      rationale.push('Summarize intent benefits from corpus navigation');
      return { should: true, rationale };
    }
  }

  // Query length heuristic: longer queries often benefit from RCN
  const wordCount = input.split(/\s+/).length;
  if (wordCount > 20 && corpusResult.corpusType !== 'general') {
    rationale.push(`Long query (${wordCount} words) with corpus context`);
    return { should: true, rationale };
  }

  rationale.push(`Default to direct response (intent: ${intentResult.intent}, corpus: ${corpusResult.corpusType})`);
  return { should: false, rationale };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Routing Function
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Determine if and how to route a query to RCN
 *
 * @param input - User's query
 * @param context - Conversation context
 * @returns Routing decision with intent, corpus type, and rationale
 */
export function routeToRcn(input: string, context: ConversationContext): RcnRoutingDecision {
  // Detect intent
  const intentResult = detectIntent(input);

  // Detect corpus type
  const corpusResult = detectCorpusType(input, context);

  // Determine if RCN should handle this
  const routingResult = shouldUseRcn(input, intentResult, corpusResult, context);

  // Combined confidence
  const confidence = routingResult.should
    ? (intentResult.confidence + corpusResult.confidence) / 2
    : 0;

  return {
    shouldUseRcn: routingResult.should,
    corpusType: corpusResult.corpusType,
    intent: intentResult.intent,
    rationale: routingResult.rationale,
    confidence,
  };
}

/**
 * Check if a user's query explicitly asks for thorough analysis
 */
export function detectsThoroughRequest(input: string): boolean {
  const patterns = [
    /be thorough|thoroughly|comprehensive|in depth|deep dive/i,
    /check (everything|all|every)|verify (all|every)/i,
    /cite (sources|your sources|evidence)/i,
    /make sure|double check/i,
  ];

  return patterns.some(p => p.test(input));
}

/**
 * Extract explicit corpus references from a query
 *
 * @returns Array of corpus identifiers or paths mentioned
 */
export function extractCorpusReferences(input: string): string[] {
  const references: string[] = [];

  // Look for quoted paths or identifiers
  const quotedMatches = input.match(/"([^"]+)"|'([^']+)'/g);
  if (quotedMatches) {
    references.push(...quotedMatches.map(m => m.replace(/["']/g, '')));
  }

  // Look for file paths
  const pathMatches = input.match(/\/[\w\/\-_.]+\.\w+/g);
  if (pathMatches) {
    references.push(...pathMatches);
  }

  return references;
}
