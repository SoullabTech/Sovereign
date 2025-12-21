/**
 * SPIRALOGIC FACET RULES - Backend Integration
 * Phase 4.4-A: S-Expression Rule Templates
 *
 * This module bridges the unified facet ontology with the S-expression rule engine.
 * It provides utilities for:
 * - Fetching facet-specific rules from consciousness_rules table
 * - Detecting facets from user input
 * - Generating practice recommendations
 * - Building response templates
 */

import type { FacetCode, FacetMapping } from "../../../../lib/consciousness/spiralogic-facet-mapping";
import {
  ALL_FACETS,
  getFacetByCode,
  detectFacetFromKeywords,
  getPracticeRecommendation
} from "../../../../lib/consciousness/spiralogic-facet-mapping";
import { fetchEnabledRulesSexpr } from "../../services/rulesService";
import { query } from "../../../../lib/db/postgres";

/**
 * Database row type for consciousness_rules table
 */
export interface FacetRule {
  id: string;
  name: string;
  sexpr: string;
  enabled: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Parsed S-expression response template
 */
export interface FacetResponse {
  facetCode: FacetCode;
  archetype: string;
  therapeuticName: string;
  practice: string;
  reframe: string;
  insight: string;
  naturalWisdom: string;
}

/**
 * Fetch all enabled facet rules from the database
 * Returns rules sorted by priority (highest first)
 */
export async function fetchFacetRules(): Promise<FacetRule[]> {
  const result = await query<FacetRule>(
    `SELECT id, name, sexpr, enabled, priority, created_at, updated_at
     FROM consciousness_rules
     WHERE name LIKE 'facet:%' AND enabled = true
     ORDER BY priority DESC, name ASC`
  );
  return result.rows;
}

/**
 * Fetch a specific facet rule by facet code
 * Example: getFacetRule('W1') returns the Spring/Safety rule
 */
export async function getFacetRule(facetCode: FacetCode): Promise<FacetRule | null> {
  const ruleName = buildFacetRuleName(facetCode);
  const result = await query<FacetRule>(
    `SELECT id, name, sexpr, enabled, priority, created_at, updated_at
     FROM consciousness_rules
     WHERE name = $1 AND enabled = true
     LIMIT 1`,
    [ruleName]
  );
  return result.rows[0] || null;
}

/**
 * Detect the most relevant facet from user input text
 * Returns both the facet mapping and the corresponding rule
 */
export async function detectFacetFromInput(userInput: string): Promise<{
  facet: FacetMapping | null;
  rule: FacetRule | null;
}> {
  const facet = detectFacetFromKeywords(userInput);
  if (!facet) {
    return { facet: null, rule: null };
  }

  const rule = await getFacetRule(facet.code);
  return { facet, rule };
}

/**
 * Generate a complete facet response for user input
 * This is the primary function for MAIA to use when routing consciousness states
 */
export async function generateFacetResponse(userInput: string): Promise<FacetResponse | null> {
  const { facet, rule } = await detectFacetFromInput(userInput);

  if (!facet) {
    return null;
  }

  // Build response from facet mapping (rule S-expression provides additional context)
  return {
    facetCode: facet.code,
    archetype: facet.archetype,
    therapeuticName: facet.therapeuticName,
    practice: facet.defaultPractice,
    reframe: facet.naturalWisdom,
    insight: facet.gift,
    naturalWisdom: facet.naturalWisdom
  };
}

/**
 * Get practice recommendation for a specific facet code
 * Falls back to a generic grounding practice if facet not found
 */
export function getFacetPractice(facetCode: FacetCode): string {
  return getPracticeRecommendation(facetCode);
}

/**
 * Build the canonical rule name for a facet code
 * Example: buildFacetRuleName('W1') -> 'facet:W1:spring:safety'
 */
function buildFacetRuleName(facetCode: FacetCode): string {
  const facet = getFacetByCode(facetCode);
  if (!facet) {
    throw new Error(`Invalid facet code: ${facetCode}`);
  }

  const archetypeLower = facet.archetype.toLowerCase();
  const therapeuticShort = facet.therapeuticName.split('/')[0].trim().toLowerCase();

  return `facet:${facetCode}:${archetypeLower}:${therapeuticShort}`;
}

/**
 * Get all facets for a specific element (Fire, Water, Earth, Air, Aether)
 * Useful for thematic consciousness routing
 */
export function getFacetsByElement(element: "Fire" | "Water" | "Earth" | "Air" | "Aether"): readonly FacetMapping[] {
  return ALL_FACETS.filter(f => f.element === element);
}

/**
 * Get the next facet in the developmental spiral sequence
 * Returns null if already at the final Aether facet (Æ3)
 */
export function getNextFacet(currentCode: FacetCode): FacetMapping | null {
  const current = getFacetByCode(currentCode);
  if (!current) return null;

  const nextSeq = current.seq + 1;
  return ALL_FACETS.find(f => f.seq === nextSeq) || null;
}

/**
 * Get the previous facet in the developmental spiral sequence
 * Returns null if already at the first facet (F1)
 */
export function getPreviousFacet(currentCode: FacetCode): FacetMapping | null {
  const current = getFacetByCode(currentCode);
  if (!current) return null;

  const prevSeq = current.seq - 1;
  if (prevSeq < 1) return null;

  return ALL_FACETS.find(f => f.seq === prevSeq) || null;
}

/**
 * Check if a facet is in the Aether realm (transpersonal)
 */
export function isAetherFacet(facetCode: FacetCode): boolean {
  return facetCode.startsWith('Æ');
}

/**
 * Get all keywords across all facets for pattern analysis
 * Useful for building comprehensive detection models
 */
export function getAllKeywords(): Map<FacetCode, string[]> {
  const keywordMap = new Map<FacetCode, string[]>();

  for (const facet of ALL_FACETS) {
    keywordMap.set(facet.code, facet.keywords);
  }

  return keywordMap;
}

/**
 * Batch detect multiple facets from user input
 * Returns all matching facets ranked by keyword match count
 */
export function detectMultipleFacets(userInput: string): Array<{
  facet: FacetMapping;
  matchCount: number;
}> {
  const normalizedInput = userInput.toLowerCase();
  const matches: Array<{ facet: FacetMapping; matchCount: number }> = [];

  for (const facet of ALL_FACETS) {
    let matchCount = 0;
    for (const keyword of facet.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      matches.push({ facet, matchCount });
    }
  }

  // Sort by match count descending
  return matches.sort((a, b) => b.matchCount - a.matchCount);
}

/**
 * EXAMPLE USAGE for MAIA consciousness routing:
 *
 * ```typescript
 * // User sends: "I'm feeling overwhelmed and frozen, don't know what to do"
 * const response = await generateFacetResponse(userInput);
 *
 * if (response) {
 *   console.log(`Detected: ${response.archetype} (${response.facetCode})`);
 *   console.log(`Therapeutic context: ${response.therapeuticName}`);
 *   console.log(`Practice: ${response.practice}`);
 *   console.log(`Reframe: ${response.reframe}`);
 * }
 * // Output:
 * // Detected: Spring (W1)
 * // Therapeutic context: Safety / Containment
 * // Practice: Slow exhale, orient to your room, name three stable objects you can see
 * // Reframe: Springs emerge where pressure finds release
 * ```
 */
