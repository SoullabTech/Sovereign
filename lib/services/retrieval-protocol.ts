/**
 * Bardic Memory Retrieval Protocol
 *
 * Implements the 3-stage protocol for re-entering lived moments:
 * Stage 1: RECOGNITION - Detect morphic resonance
 * Stage 2: RE-ENTRY - Present portal with consent gate
 * Stage 3: RECALL - Provide full episode details with narrative threads
 *
 * @module lib/services/retrieval-protocol
 */

import type {
  Episode,
  RecognitionInput,
  RecognitionSignal,
  ReentryExperience,
  EpisodeDetails,
  RecallDepth,
} from '../types';
import {
  getEpisode,
  findSimilarEpisodes,
  getEpisodeVector,
} from './episode-service';

// ============================================================================
// STAGE 1: RECOGNITION
// ============================================================================

/**
 * Detect morphic resonance: does current message resonate with past episodes?
 * Returns recognition signals without full retrieval
 */
export async function recognizeResonance(
  input: RecognitionInput
): Promise<RecognitionSignal | null> {
  // Get current embedding for user's message
  const currentEmbedding = await generateEmbedding(input.currentMessage);

  // Find similar episodes
  const similarEpisodes = await findSimilarEpisodes(
    input.userId,
    currentEmbedding,
    {
      limit: 5,
      minSimilarity: input.minSimilarity || 0.6,
    }
  );

  if (similarEpisodes.length === 0) {
    return null; // No resonance detected
  }

  // Take the most similar episode
  const resonantEpisode = similarEpisodes[0];

  // Check affect compatibility
  const affectMatch = checkAffectCompatibility(
    input.currentAffect,
    {
      valence: resonantEpisode.affectValence,
      arousal: resonantEpisode.affectArousal,
    }
  );

  // Check elemental pattern match
  const elementalMatch = input.currentElementalState
    ? checkElementalPattern(
        input.currentElementalState,
        resonantEpisode.elementalState
      )
    : 0.5;

  // Calculate overall resonance strength
  const resonanceStrength =
    resonantEpisode.similarity * 0.5 +
    affectMatch * 0.3 +
    elementalMatch * 0.2;

  // Only return signal if resonance is strong enough
  if (resonanceStrength < 0.5) {
    return null;
  }

  return {
    episodeId: resonantEpisode.id!,
    sceneStanza: resonantEpisode.sceneStanza || undefined,
    resonanceStrength,
    similarity: resonantEpisode.similarity,
    affectMatch,
    elementalMatch,
    placeCue: resonantEpisode.placeCue || undefined,
    datetime: resonantEpisode.datetime,
    dominantElement: resonantEpisode.dominantElement,
  };
}

// ============================================================================
// STAGE 2: RE-ENTRY (Consent Gate)
// ============================================================================

/**
 * Present portal for re-entry with consent gate
 * Shows just enough to recognize, not so much as to overwhelm
 */
export async function prepareReentry(
  episodeId: string,
  options?: {
    checkCapacity?: boolean;
    currentAffectArousal?: number;
  }
): Promise<ReentryExperience> {
  const episode = await getEpisode(episodeId);

  if (!episode) {
    throw new Error('Episode not found');
  }

  // Check if sacred episode (witness only)
  if (episode.sacredFlag) {
    return {
      episodeId,
      sceneStanza: episode.sceneStanza || 'Sacred moment',
      datetime: episode.datetime,
      canEnter: false,
      consentRequired: true,
      reason: 'This is a sacred moment. Witness only, no analysis.',
      affectWarning: null,
    };
  }

  // Check affect capacity (titration)
  let affectWarning: string | null = null;
  let requiresConsent = false;

  if (options?.checkCapacity && episode.affectArousal !== undefined) {
    const currentArousal = options.currentAffectArousal || 0.5;
    const episodeArousal = episode.affectArousal;

    // High arousal episode + already aroused user = potential overwhelm
    if (episodeArousal > 0.7 && currentArousal > 0.6) {
      affectWarning =
        'This memory has high emotional intensity. Would you like to enter gently?';
      requiresConsent = true;
    }

    // Recalibration episodes always require consent
    if (episode.isRecalibration) {
      affectWarning =
        'This is a threshold crossing. Re-entering may stir deep material.';
      requiresConsent = true;
    }
  }

  return {
    episodeId,
    sceneStanza: episode.sceneStanza,
    placeCue: episode.placeCue,
    datetime: episode.datetime,
    dominantElement: episode.dominantElement,
    affectValence: episode.affectValence,
    affectArousal: episode.affectArousal,
    canEnter: true,
    consentRequired: requiresConsent,
    affectWarning,
  };
}

/**
 * Check if user has capacity to re-enter
 * (Titration: don't overwhelm with high-arousal memories)
 */
function checkAffectCapacity(
  currentArousal: number,
  episodeArousal: number
): { hasCapacity: boolean; reason?: string } {
  // If both current and episode arousal are high, may lack capacity
  if (currentArousal > 0.7 && episodeArousal > 0.7) {
    return {
      hasCapacity: false,
      reason: 'Current arousal too high to safely re-enter intense memory',
    };
  }

  // If episode arousal is very high (>0.8), always check
  if (episodeArousal > 0.8) {
    return {
      hasCapacity: currentArousal < 0.6,
      reason: currentArousal >= 0.6 ? 'Episode intensity too high for current state' : undefined,
    };
  }

  return { hasCapacity: true };
}

// ============================================================================
// STAGE 3: RECALL (Full Details)
// ============================================================================

/**
 * Provide full episode details with narrative threads
 * Only called after consent is given
 */
export async function recallEpisode(
  episodeId: string,
  depth: RecallDepth = 'full'
): Promise<EpisodeDetails> {
  const episode = await getEpisode(episodeId);

  if (!episode) {
    throw new Error('Episode not found');
  }

  // Basic recall
  const details: EpisodeDetails = {
    episode,
    linkedEpisodes: [],
    resonantCues: [],
    telosAlignments: [],
    microacts: [],
    narrativeThreads: [],
  };

  if (depth === 'shallow') {
    return details;
  }

  // Get linked episodes (narrative threads)
  const { data: links } = await getSupabase()
    .from('episode_links')
    .select(`
      id,
      relation_type,
      relation_strength,
      notes,
      episode_a:episodes!episode_links_episode_a_fkey(*),
      episode_b:episodes!episode_links_episode_b_fkey(*)
    `)
    .or(`episode_a.eq.${episodeId},episode_b.eq.${episodeId}`);

  if (links) {
    details.linkedEpisodes = links.map((link: any) => ({
      episode: link.episode_a?.id === episodeId ? link.episode_b : link.episode_a,
      relationType: link.relation_type,
      relationStrength: link.relation_strength,
      notes: link.notes,
    }));
  }

  // Get cues (sensory portals)
  const { data: cueLinks } = await getSupabase()
    .from('episode_cues')
    .select(`
      strength,
      cue:cues(*)
    `)
    .eq('episode_id', episodeId);

  if (cueLinks) {
    details.resonantCues = cueLinks.map((link: any) => ({
      cue: link.cue,
      strength: link.strength,
    }));
  }

  if (depth === 'deep') {
    // Get telos alignments
    const { data: alignments } = await getSupabase()
      .from('telos_alignment_log')
      .select(`
        delta,
        notes,
        telos:teloi(*)
      `)
      .eq('episode_id', episodeId);

    if (alignments) {
      details.telosAlignments = alignments.map((a: any) => ({
        telos: a.telos,
        delta: a.delta,
        notes: a.notes,
      }));
    }

    // Get microacts
    const { data: microactLogs } = await getSupabase()
      .from('microact_logs')
      .select(`
        context_note,
        microact:microacts(*)
      `)
      .eq('episode_id', episodeId);

    if (microactLogs) {
      details.microacts = microactLogs.map((log: any) => ({
        microact: log.microact,
        contextNote: log.context_note,
      }));
    }
  }

  // Build narrative threads
  details.narrativeThreads = buildNarrativeThreads(details.linkedEpisodes);

  return details;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate embedding for a text using OpenAI
 * TODO: Implement actual OpenAI API call
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Placeholder: In production, call OpenAI embeddings API
  // const response = await openai.embeddings.create({
  //   model: 'text-embedding-ada-002',
  //   input: text,
  // });
  // return response.data[0].embedding;

  // For now, return a dummy embedding
  return Array(1536).fill(0);
}

/**
 * Check affect compatibility between current state and episode
 * Returns 0-1 score
 */
function checkAffectCompatibility(
  current: { valence?: number; arousal?: number } | undefined,
  episode: { valence?: number; arousal?: number }
): number {
  if (!current || !current.valence || !current.arousal) {
    return 0.5; // Neutral if no current affect
  }

  if (!episode.valence || !episode.arousal) {
    return 0.5; // Neutral if episode has no affect
  }

  // Calculate Euclidean distance in 2D affect space
  const valenceDiff = Math.abs(current.valence - episode.valence);
  const arousalDiff = Math.abs(current.arousal - episode.arousal);

  const distance = Math.sqrt(valenceDiff ** 2 + arousalDiff ** 2);

  // Max distance in affect space is sqrt(2^2 + 1^2) = sqrt(5) ≈ 2.236
  // Normalize to 0-1 and invert (closer = higher score)
  return 1 - Math.min(distance / 2.236, 1);
}

/**
 * Check elemental pattern similarity
 * Returns 0-1 score
 */
function checkElementalPattern(
  current: any,
  episode: any
): number {
  if (!current || !episode) {
    return 0.5;
  }

  const elements = ['fire', 'air', 'water', 'earth', 'aether'];

  let totalDiff = 0;
  let count = 0;

  for (const element of elements) {
    if (current[element] !== undefined && episode[element] !== undefined) {
      totalDiff += Math.abs(current[element] - episode[element]);
      count++;
    }
  }

  if (count === 0) {
    return 0.5;
  }

  // Average difference, normalized
  const avgDiff = totalDiff / count;

  // Invert: lower difference = higher similarity
  return 1 - avgDiff;
}

/**
 * Build narrative threads from linked episodes
 */
function buildNarrativeThreads(
  linkedEpisodes: Array<{
    episode: Episode;
    relationType: string;
    relationStrength: number;
    notes?: string;
  }>
): string[] {
  const threads: string[] = [];

  // Group by relation type
  const byType = new Map<string, typeof linkedEpisodes>();

  for (const link of linkedEpisodes) {
    if (!byType.has(link.relationType)) {
      byType.set(link.relationType, []);
    }
    byType.get(link.relationType)!.push(link);
  }

  // Build thread descriptions
  for (const [type, links] of byType.entries()) {
    if (links.length === 1) {
      threads.push(
        `This moment ${type} another: "${links[0].episode.sceneStanza || 'a previous episode'}"`
      );
    } else {
      threads.push(
        `This moment ${type} ${links.length} others in your story`
      );
    }
  }

  return threads;
}

/**
 * Get Supabase client (imported locally to avoid circular deps)
 */
function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ============================================================================
// UNCERTAINTY & DRIFT SUPPORT
// ============================================================================

/**
 * Express uncertainty in recall
 * Bardic memory acknowledges when it's not sure
 */
export function expressUncertainty(resonanceStrength: number): string {
  if (resonanceStrength > 0.9) {
    return 'This feels strongly resonant';
  } else if (resonanceStrength > 0.7) {
    return 'This may be connected';
  } else if (resonanceStrength > 0.5) {
    return 'There might be an echo here';
  } else {
    return 'I sense a faint resonance, but I\'m uncertain';
  }
}

/**
 * Support representational drift
 * Allow the meaning of episodes to evolve over time
 */
export async function updateEpisodeMeaning(
  episodeId: string,
  newSceneStanza: string,
  notes: string
): Promise<void> {
  const { updateEpisode } = require('./episode-service');

  await updateEpisode(episodeId, {
    sceneStanza: newSceneStanza,
    // Keep original data, just update the stanza (poetic compression)
  });

  // Log the drift
  console.log(`Episode ${episodeId} meaning evolved: ${notes}`);
}
