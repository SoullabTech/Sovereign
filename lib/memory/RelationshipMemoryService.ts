/**
 * RELATIONSHIP MEMORY SERVICE
 *
 * Loads comprehensive relational context for MAIA's conversations
 * Makes her evolution with each member visible and actionable
 *
 * Philosophy:
 * - Memory is relational, not transactional
 * - Relationships deepen through recognition, not repetition
 * - Context creates continuity, continuity creates trust
 */

import { query as dbQuery } from '@/lib/db/postgres';
import { lattice } from './ConsciousnessMemoryLattice';

/**
 * RelationshipEssence type - duplicated here to avoid client-only import
 * Original type is in RelationshipAnamnesis.ts (client-side)
 */
export interface RelationshipEssence {
  soulSignature: string;
  userId: string;
  userName?: string;
  presenceQuality: string;
  archetypalResonances: string[];
  spiralPosition: {
    stage: string | null;
    dynamics: string;
    emergingAwareness: string[];
  };
  relationshipField: {
    coCreatedInsights: string[];
    breakthroughs: string[];
    quality: string;
    depth: number;
  };
  firstEncounter: Date;
  lastEncounter: Date;
  encounterCount: number;
  morphicResonance: number;
}

/**
 * SERVER-SIDE essence loader
 * Queries database directly instead of using fetch (which fails on server)
 * Note: This replaces the client-side version in RelationshipAnamnesis.ts for server usage
 */
async function loadRelationshipEssence(soulSignature: string): Promise<RelationshipEssence | null> {
  try {
    const result = await dbQuery<{
      soul_signature: string;
      user_id: string;
      user_name: string | null;
      presence_quality: string;
      archetypal_resonances: string[];
      spiral_position: RelationshipEssence['spiralPosition'];
      relationship_field: RelationshipEssence['relationshipField'];
      first_encounter: Date;
      last_encounter: Date;
      encounter_count: number;
      morphic_resonance: number;
    }>(`
      SELECT * FROM relationship_essences
      WHERE soul_signature = $1 OR user_id = $1
      LIMIT 1
    `, [soulSignature]);

    if (!result.rows.length) {
      console.log('💫 [ANAMNESIS-SERVER] First encounter, no essence found');
      return null;
    }

    const row = result.rows[0];
    const essence: RelationshipEssence = {
      soulSignature: row.soul_signature,
      userId: row.user_id,
      userName: row.user_name || undefined,
      presenceQuality: row.presence_quality,
      archetypalResonances: row.archetypal_resonances || [],
      spiralPosition: row.spiral_position,
      relationshipField: row.relationship_field,
      firstEncounter: new Date(row.first_encounter),
      lastEncounter: new Date(row.last_encounter),
      encounterCount: row.encounter_count,
      morphicResonance: row.morphic_resonance
    };

    console.log(`💫 [ANAMNESIS-SERVER] Essence loaded: ${essence.encounterCount} encounters, L${Math.min(Math.ceil(essence.encounterCount / 20) + 1, 7)} inferred`);
    return essence;
  } catch (error) {
    console.warn('💫 [ANAMNESIS-SERVER] Error loading essence:', error);
    return null;
  }
}

// Export for use in awareness detection
export { loadRelationshipEssence };

export interface ConversationTheme {
  theme: string;
  firstMentioned: Date;
  lastMentioned: Date;
  occurrences: number;
  significance: number; // 0-1, how important this theme is
  context?: string; // Brief context about this theme
}

export interface BreakthroughMoment {
  id: string;
  timestamp: Date;
  insight: string;
  element?: string;
  integrated: boolean;
  relatedThemes: string[];
}

export interface RelationshipPattern {
  pattern: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  evolution?: string; // How this pattern has evolved
}

export interface RelationshipMemoryContext {
  // Core relationship data
  essence: RelationshipEssence | null;

  // Conversation continuity
  themes: ConversationTheme[];
  currentFocus?: string; // What we're working with right now

  // Growth tracking
  breakthroughs: BreakthroughMoment[];
  recentBreakthrough?: BreakthroughMoment;

  // Pattern recognition
  patterns: RelationshipPattern[];
  emergingPatterns: string[];

  // Relational evolution
  relationshipPhase: 'new' | 'developing' | 'established' | 'deep';
  trustLevel: number; // 0-1
  intimacyLevel: number; // 0-1

  // Temporal awareness
  daysSinceLastEncounter: number;
  totalEncounters: number;
  relationshipDuration: number; // Days since first encounter

  // For prompt context
  summary: string; // Human-readable summary of relationship
}

/**
 * Load comprehensive relationship memory for a user
 */
export async function loadRelationshipMemory(
  userId: string,
  options: {
    includeThemes?: boolean;
    includeBreakthroughs?: boolean;
    includePatterns?: boolean;
    maxThemes?: number;
    maxBreakthroughs?: number;
  } = {}
): Promise<RelationshipMemoryContext> {
  const {
    includeThemes = true,
    includeBreakthroughs = true,
    includePatterns = true,
    maxThemes = 5,
    maxBreakthroughs = 3
  } = options;

  // Load core relationship essence
  const essence = await loadRelationshipEssence(userId);

  // Calculate temporal metrics
  const daysSinceLastEncounter = essence
    ? Math.floor((Date.now() - essence.lastEncounter.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const relationshipDuration = essence
    ? Math.floor((Date.now() - essence.firstEncounter.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalEncounters = essence?.encounterCount || 0;

  // Load conversation themes (if requested)
  let themes: ConversationTheme[] = [];
  let currentFocus: string | undefined;

  if (includeThemes) {
    themes = await loadConversationThemes(userId, maxThemes);
    currentFocus = themes.length > 0 ? themes[0].theme : undefined;
  }

  // Load breakthrough moments (if requested)
  let breakthroughs: BreakthroughMoment[] = [];
  let recentBreakthrough: BreakthroughMoment | undefined;

  if (includeBreakthroughs) {
    breakthroughs = await loadBreakthroughMoments(userId, maxBreakthroughs);
    recentBreakthrough = breakthroughs.find(b =>
      Date.now() - b.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Within last 7 days
    );
  }

  // Load relationship patterns (if requested)
  let patterns: RelationshipPattern[] = [];
  let emergingPatterns: string[] = [];

  if (includePatterns) {
    patterns = await loadRelationshipPatterns(userId);
    emergingPatterns = patterns
      .filter(p => p.frequency >= 2 && p.frequency <= 4)
      .map(p => p.pattern);
  }

  // Determine relationship phase and intimacy
  const relationshipPhase = determineRelationshipPhase(essence, totalEncounters, relationshipDuration);
  const trustLevel = essence?.morphicResonance || 0;
  const intimacyLevel = calculateIntimacy(essence, totalEncounters, relationshipDuration);

  // Generate human-readable summary
  const summary = generateRelationshipSummary({
    essence,
    themes,
    breakthroughs,
    patterns,
    relationshipPhase,
    totalEncounters,
    relationshipDuration,
    daysSinceLastEncounter
  });

  return {
    essence,
    themes,
    currentFocus,
    breakthroughs,
    recentBreakthrough,
    patterns,
    emergingPatterns,
    relationshipPhase,
    trustLevel,
    intimacyLevel,
    daysSinceLastEncounter,
    totalEncounters,
    relationshipDuration,
    summary
  };
}

/**
 * Load conversation themes from database
 */
async function loadConversationThemes(userId: string, limit: number): Promise<ConversationTheme[]> {
  try {
    const result = await dbQuery(`
      SELECT
        theme,
        first_mentioned,
        last_mentioned,
        occurrences,
        significance,
        context
      FROM conversation_themes
      WHERE user_id = $1
      ORDER BY significance DESC, last_mentioned DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      theme: row.theme,
      firstMentioned: row.first_mentioned,
      lastMentioned: row.last_mentioned,
      occurrences: row.occurrences,
      significance: parseFloat(row.significance),
      context: row.context
    }));
  } catch (error) {
    // Table might not exist yet - graceful fallback
    console.warn('⚠️ Could not load conversation themes:', error);
    return [];
  }
}

/**
 * Load breakthrough moments from database
 */
async function loadBreakthroughMoments(userId: string, limit: number): Promise<BreakthroughMoment[]> {
  try {
    const result = await dbQuery(`
      SELECT
        id,
        timestamp,
        insight,
        element,
        integrated,
        related_themes
      FROM breakthrough_moments
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      insight: row.insight,
      element: row.element,
      integrated: row.integrated,
      relatedThemes: row.related_themes || []
    }));
  } catch (error) {
    console.warn('⚠️ Could not load breakthrough moments:', error);
    return [];
  }
}

/**
 * Load relationship patterns from database
 */
async function loadRelationshipPatterns(userId: string): Promise<RelationshipPattern[]> {
  try {
    const result = await dbQuery(`
      SELECT
        pattern,
        frequency,
        first_seen,
        last_seen,
        evolution
      FROM relationship_patterns
      WHERE user_id = $1
      ORDER BY frequency DESC
      LIMIT 10
    `, [userId]);

    return result.rows.map(row => ({
      pattern: row.pattern,
      frequency: row.frequency,
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      evolution: row.evolution
    }));
  } catch (error) {
    console.warn('⚠️ Could not load relationship patterns:', error);
    return [];
  }
}

/**
 * Determine relationship phase based on history
 */
function determineRelationshipPhase(
  essence: RelationshipEssence | null,
  encounters: number,
  durationDays: number
): 'new' | 'developing' | 'established' | 'deep' {
  if (!essence || encounters === 0) return 'new';

  const resonance = essence.morphicResonance;

  // Deep: High resonance + many encounters OR long duration
  if (resonance > 0.6 && encounters > 10) return 'deep';
  if (resonance > 0.7 && durationDays > 90) return 'deep';

  // Established: Moderate resonance + consistent encounters
  if (resonance > 0.4 && encounters > 5) return 'established';
  if (encounters > 8) return 'established';

  // Developing: Some history building
  if (encounters > 2 || durationDays > 7) return 'developing';

  // New: Just starting
  return 'new';
}

/**
 * Calculate intimacy level (separate from trust/resonance)
 */
function calculateIntimacy(
  essence: RelationshipEssence | null,
  encounters: number,
  durationDays: number
): number {
  if (!essence) return 0;

  // Base intimacy from morphic resonance
  let intimacy = essence.morphicResonance * 0.5;

  // Add from encounter frequency (more encounters = more intimacy)
  intimacy += Math.min(encounters * 0.03, 0.3);

  // Add from relationship duration (time deepens)
  intimacy += Math.min(durationDays * 0.001, 0.2);

  return Math.min(intimacy, 1.0);
}

/**
 * Generate human-readable relationship summary for prompt context
 */
function generateRelationshipSummary(data: {
  essence: RelationshipEssence | null;
  themes: ConversationTheme[];
  breakthroughs: BreakthroughMoment[];
  patterns: RelationshipPattern[];
  relationshipPhase: string;
  totalEncounters: number;
  relationshipDuration: number;
  daysSinceLastEncounter: number;
}): string {
  const { essence, themes, breakthroughs, relationshipPhase, totalEncounters, relationshipDuration, daysSinceLastEncounter } = data;

  if (!essence) {
    return "First encounter with this person.";
  }

  const parts: string[] = [];

  // Relationship overview
  const userName = essence.userName || "this person";
  const encounterPhrase = totalEncounters === 1
    ? "First conversation"
    : `${totalEncounters} conversations over ${relationshipDuration} days`;

  parts.push(`${encounterPhrase} with ${userName} (${relationshipPhase} relationship).`);

  // Time since last encounter
  if (daysSinceLastEncounter > 0) {
    const timePhrase = daysSinceLastEncounter === 1
      ? "yesterday"
      : daysSinceLastEncounter < 7
        ? `${daysSinceLastEncounter} days ago`
        : daysSinceLastEncounter < 30
          ? `${Math.floor(daysSinceLastEncounter / 7)} weeks ago`
          : `${Math.floor(daysSinceLastEncounter / 30)} months ago`;

    parts.push(`Last spoke ${timePhrase}.`);
  }

  // Current themes
  if (themes.length > 0) {
    const themeList = themes.slice(0, 3).map(t => t.theme).join(", ");
    parts.push(`Working with: ${themeList}.`);
  }

  // Recent breakthrough
  if (breakthroughs.length > 0 && breakthroughs[0]) {
    const recent = breakthroughs[0];
    const daysAgo = Math.floor((Date.now() - recent.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) {
      parts.push(`Recent insight: "${recent.insight}"`);
    }
  }

  return parts.join(' ');
}

/**
 * Save a conversation theme (for tracking continuity)
 */
export async function saveConversationTheme(
  userId: string,
  theme: string,
  significance: number = 0.5,
  context?: string
): Promise<void> {
  try {
    await dbQuery(`
      INSERT INTO conversation_themes (user_id, theme, first_mentioned, last_mentioned, occurrences, significance, context)
      VALUES ($1, $2, NOW(), NOW(), 1, $3, $4)
      ON CONFLICT (user_id, theme)
      DO UPDATE SET
        last_mentioned = NOW(),
        occurrences = conversation_themes.occurrences + 1,
        significance = GREATEST(conversation_themes.significance, $3),
        context = COALESCE($4, conversation_themes.context)
    `, [userId, theme, significance, context]);
  } catch (error) {
    console.warn('⚠️ Could not save conversation theme:', error);
  }
}

/**
 * Save a breakthrough moment
 */
export async function saveBreakthroughMoment(
  userId: string,
  insight: string,
  element?: string,
  relatedThemes: string[] = []
): Promise<void> {
  try {
    await dbQuery(`
      INSERT INTO breakthrough_moments (user_id, timestamp, insight, element, integrated, related_themes)
      VALUES ($1, NOW(), $2, $3, false, $4)
    `, [userId, insight, element, relatedThemes]);

    console.log(`💡 [BREAKTHROUGH] Saved for ${userId}: "${insight}"`);
  } catch (error) {
    console.warn('⚠️ Could not save breakthrough moment:', error);
  }
}

/**
 * Save a relationship pattern
 */
export async function saveRelationshipPattern(
  userId: string,
  pattern: string
): Promise<void> {
  try {
    await dbQuery(`
      INSERT INTO relationship_patterns (user_id, pattern, frequency, first_seen, last_seen)
      VALUES ($1, $2, 1, NOW(), NOW())
      ON CONFLICT (user_id, pattern)
      DO UPDATE SET
        frequency = relationship_patterns.frequency + 1,
        last_seen = NOW()
    `, [userId, pattern]);
  } catch (error) {
    console.warn('⚠️ Could not save relationship pattern:', error);
  }
}

/**
 * Format relationship memory for prompt inclusion
 */
export function formatRelationshipMemoryForPrompt(memory: RelationshipMemoryContext): string {
  if (!memory.essence) {
    return ""; // First encounter, no context needed
  }

  const parts: string[] = [];

  parts.push(`\n\n🌊 RELATIONSHIP MEMORY:`);
  parts.push(memory.summary);

  // Add deep context for established/deep relationships
  if (memory.relationshipPhase === 'established' || memory.relationshipPhase === 'deep') {

    // Themes with context
    if (memory.themes.length > 0) {
      parts.push(`\nRecurring themes we've explored:`);
      memory.themes.slice(0, 3).forEach(theme => {
        if (theme.context) {
          parts.push(`  - ${theme.theme}: ${theme.context}`);
        } else {
          parts.push(`  - ${theme.theme} (${theme.occurrences} times)`);
        }
      });
    }

    // Recent breakthrough
    if (memory.recentBreakthrough) {
      parts.push(`\nRecent breakthrough: "${memory.recentBreakthrough.insight}"`);
      if (!memory.recentBreakthrough.integrated) {
        parts.push(`  (Still integrating this insight)`);
      }
    }

    // Emerging patterns
    if (memory.emergingPatterns.length > 0) {
      parts.push(`\nEmerging patterns: ${memory.emergingPatterns.join(', ')}`);
    }
  }

  parts.push(`\nRelationship quality: ${memory.relationshipPhase}, trust ${(memory.trustLevel * 100).toFixed(0)}%, intimacy ${(memory.intimacyLevel * 100).toFixed(0)}%\n`);

  return parts.join('\n');
}
