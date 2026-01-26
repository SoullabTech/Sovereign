/**
 * BeadService: Memory Atom Detection and Activation
 *
 * A bead is a compressed state-token - not the story, but the signature.
 * This service detects beads from content, activates them, and learns patterns.
 */

import { query, queryOne, transaction, type TransactionClient } from '@/lib/db/postgres';
import { elementalDetector } from '@/lib/voice/elementalDetect';
import type { Element } from '@/lib/voice/types';

// ----- Types -----

export interface Bead {
  id: string;
  user_id: string;
  code: string;
  label: string;
  element: Element;
  facet: string | null;
  polarity: 'descent' | 'ascent' | 'shadow' | 'gift' | 'neutral';
  signal_type: 'emotional' | 'somatic' | 'cognitive' | 'relational' | 'imaginal' | null;
  intensity_band: 'low' | 'medium' | 'high' | 'peak' | null;
  spiral_scale: 'micro' | 'meso' | 'macro' | 'collective' | null;
  spiral_id: string | null;
  activation_count: number;
  first_seen: Date;
  last_activated: Date;
  confidence: number;
  triggers: string[];
  resolvers: string[];
  typical_followers: string[];
}

export interface BeadActivation {
  id: string;
  bead_id: string;
  user_id: string;
  source_type: 'journal' | 'capture' | 'conversation' | 'episode' | 'elemental_journal';
  source_id: string;
  activated_at: Date;
  intensity: number | null;
  user_confirmed: boolean | null;
  co_activated_beads: string[];
  is_sanctuary: boolean;
}

export interface CanonicalBead {
  code: string;
  label: string;
  element: Element;
  facet: string | null;
  polarity: 'gift' | 'shadow' | 'neutral';
  description: string | null;
  typical_triggers: string[] | null;
  typical_resolvers: string[] | null;
}

export interface DetectedBead {
  code: string;
  label: string;
  element: Element;
  facet: string | null;
  polarity: 'descent' | 'ascent' | 'shadow' | 'gift' | 'neutral';
  intensity: number;
  confidence: number;
  isNew: boolean;
}

export interface VoiceFeatures {
  pitch?: number;      // 0-1 normalized
  energy?: number;     // 0-1 normalized
  speed?: number;      // Words per minute
  pauseRatio?: number; // Silence vs speech ratio
}

// Facet keywords for more precise detection
const FACET_MARKERS: Record<string, { keywords: string[]; patterns: RegExp[] }> = {
  F1: {
    keywords: ['call', 'calling', 'beginning', 'start', 'initiate', 'desire', 'want', 'ready'],
    patterns: [/\b(feel called|drawn to|something stirring)\b/i]
  },
  F2: {
    keywords: ['challenge', 'struggle', 'fight', 'test', 'trial', 'difficult', 'hard', 'effort'],
    patterns: [/\b(going through|facing|confronting)\b/i]
  },
  F3: {
    keywords: ['mastery', 'integrated', 'living', 'embodied', 'natural', 'second nature'],
    patterns: [/\b(finally|now I|have become)\b/i]
  },
  W1: {
    keywords: ['vulnerable', 'open', 'soft', 'tender', 'feeling', 'heart', 'sensitive'],
    patterns: [/\b(letting in|opening to|allow myself)\b/i]
  },
  W2: {
    keywords: ['grief', 'loss', 'pain', 'wound', 'shadow', 'dark', 'depth', 'underworld'],
    patterns: [/\b(going down|descending|in the depths|grieving)\b/i]
  },
  W3: {
    keywords: ['treasure', 'gold', 'gift', 'wisdom', 'emerged', 'returned', 'integrated'],
    patterns: [/\b(found|discovered|brought back|emerged with)\b/i]
  },
  E1: {
    keywords: ['seed', 'potential', 'possibility', 'vision', 'dream', 'imagine', 'form'],
    patterns: [/\b(could become|want to build|see a way)\b/i]
  },
  E2: {
    keywords: ['practice', 'discipline', 'routine', 'habit', 'building', 'training', 'working'],
    patterns: [/\b(every day|consistent|putting in|building)\b/i]
  },
  E3: {
    keywords: ['harvest', 'legacy', 'steward', 'maintain', 'nurture', 'care for', 'tend'],
    patterns: [/\b(caring for|maintaining|passing on|stewardship)\b/i]
  },
  A1: {
    keywords: ['say', 'speak', 'voice', 'communicate', 'express', 'articulate', 'word'],
    patterns: [/\b(need to say|want to express|finding words)\b/i]
  },
  A2: {
    keywords: ['understand', 'realize', 'see', 'pattern', 'meaning', 'insight', 'clarity'],
    patterns: [/\b(now I see|I understand|it makes sense|the pattern)\b/i]
  },
  A3: {
    keywords: ['myth', 'story', 'narrative', 'meaning', 'purpose', 'larger', 'connected'],
    patterns: [/\b(part of something|my story|larger pattern|making meaning)\b/i]
  }
};

// Polarity detection keywords
const POLARITY_MARKERS = {
  shadow: ['stuck', 'trapped', 'can\'t', 'won\'t', 'afraid', 'avoiding', 'blocked', 'lost', 'overwhelmed', 'drowning'],
  gift: ['breakthrough', 'clarity', 'finally', 'free', 'integrated', 'whole', 'healed', 'understood', 'found'],
  descent: ['going down', 'sinking', 'falling', 'letting go', 'surrendering', 'releasing'],
  ascent: ['rising', 'emerging', 'climbing', 'returning', 'coming back', 'lifting']
};

// ----- Service Class -----

class BeadServiceImpl {
  /**
   * Detect beads from text content and optional voice features
   * Returns detected beads with confidence scores
   */
  async detectBeads(
    userId: string,
    text: string,
    voiceFeatures?: VoiceFeatures
  ): Promise<DetectedBead[]> {
    const detected: DetectedBead[] = [];
    const lower = text.toLowerCase();

    // Get elemental blend from ElementalDetector
    const elementBlend = await elementalDetector.detectWithVoiceFeatures(text, voiceFeatures);

    // For each element with significant presence, detect facet and polarity
    for (const [element, intensity] of Object.entries(elementBlend)) {
      if (intensity < 0.2) continue;

      const facet = this.detectFacet(element as Element, lower);
      const polarity = this.detectPolarity(lower);

      // Build bead code
      const beadCode = facet
        ? `${facet}-${polarity}`
        : `${element}-${polarity}`;

      // Check if this is a canonical bead
      const canonical = await this.findCanonicalBead(beadCode, element as Element, facet, polarity);

      // Check if user already has this bead
      const existingBead = await this.getUserBead(userId, canonical?.code || beadCode);

      detected.push({
        code: canonical?.code || beadCode,
        label: canonical?.label || this.generateLabel(element as Element, facet, polarity),
        element: element as Element,
        facet,
        polarity,
        intensity: intensity as number,
        confidence: canonical ? 0.8 : 0.5,
        isNew: !existingBead
      });
    }

    // Sort by intensity
    detected.sort((a, b) => b.intensity - a.intensity);

    return detected;
  }

  /**
   * Detect the specific facet (F1-F3, W1-W3, E1-E3, A1-A3) from text
   */
  private detectFacet(element: Element, text: string): string | null {
    const elementPrefix = {
      fire: 'F',
      water: 'W',
      earth: 'E',
      air: 'A',
      aether: null
    }[element];

    if (!elementPrefix) return null;

    let bestFacet: string | null = null;
    let bestScore = 0;

    for (let i = 1; i <= 3; i++) {
      const facet = `${elementPrefix}${i}`;
      const markers = FACET_MARKERS[facet];
      if (!markers) continue;

      let score = 0;

      // Check keywords
      for (const keyword of markers.keywords) {
        if (text.includes(keyword)) score += 1;
      }

      // Check patterns
      for (const pattern of markers.patterns) {
        if (pattern.test(text)) score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestFacet = facet;
      }
    }

    // Only return facet if we have reasonable confidence
    return bestScore >= 2 ? bestFacet : null;
  }

  /**
   * Detect polarity from text
   */
  private detectPolarity(text: string): 'descent' | 'ascent' | 'shadow' | 'gift' | 'neutral' {
    const lower = text.toLowerCase();

    // Count matches for each polarity
    const scores: Record<string, number> = {
      shadow: 0,
      gift: 0,
      descent: 0,
      ascent: 0
    };

    for (const [polarity, keywords] of Object.entries(POLARITY_MARKERS)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          scores[polarity]++;
        }
      }
    }

    // Find highest score
    let maxPolarity: 'descent' | 'ascent' | 'shadow' | 'gift' | 'neutral' = 'neutral';
    let maxScore = 0;

    for (const [polarity, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxPolarity = polarity as typeof maxPolarity;
      }
    }

    return maxScore >= 1 ? maxPolarity : 'neutral';
  }

  /**
   * Find a canonical bead matching the detected pattern
   */
  private async findCanonicalBead(
    code: string,
    element: Element,
    facet: string | null,
    polarity: string
  ): Promise<CanonicalBead | null> {
    // Try exact match first
    let bead = await queryOne<CanonicalBead>(
      'SELECT * FROM canonical_beads WHERE code = $1',
      [code]
    );

    if (bead) return bead;

    // Try matching by facet and polarity
    if (facet) {
      bead = await queryOne<CanonicalBead>(
        'SELECT * FROM canonical_beads WHERE facet = $1 AND polarity = $2',
        [facet, polarity === 'descent' || polarity === 'ascent' ? 'neutral' : polarity]
      );
    }

    return bead;
  }

  /**
   * Get user's existing bead by code
   */
  private async getUserBead(userId: string, code: string): Promise<Bead | null> {
    return queryOne<Bead>(
      'SELECT * FROM beads WHERE user_id = $1 AND code = $2',
      [userId, code]
    );
  }

  /**
   * Generate a human-readable label for a bead
   */
  private generateLabel(element: Element, facet: string | null, polarity: string): string {
    const elementLabels: Record<Element, string> = {
      fire: 'Fire',
      water: 'Water',
      earth: 'Earth',
      air: 'Air',
      aether: 'Aether'
    };

    const polarityLabels: Record<string, string> = {
      descent: 'Descent',
      ascent: 'Ascent',
      shadow: 'Shadow',
      gift: 'Gift',
      neutral: 'Movement'
    };

    if (facet) {
      return `${facet} ${polarityLabels[polarity]}`;
    }

    return `${elementLabels[element]} ${polarityLabels[polarity]}`;
  }

  /**
   * Activate a bead for a user (record that it was detected)
   * Creates the bead if it doesn't exist
   */
  async activateBead(
    userId: string,
    beadCode: string,
    sourceType: BeadActivation['source_type'],
    sourceId: string,
    options: {
      intensity?: number;
      coActivatedBeads?: string[];
      isSanctuary?: boolean;
      label?: string;
      element?: Element;
      facet?: string | null;
      polarity?: string;
    } = {}
  ): Promise<{ bead: Bead; activation: BeadActivation; wasCreated: boolean }> {
    // Don't persist sanctuary activations
    if (options.isSanctuary) {
      throw new Error('Cannot activate beads in sanctuary mode');
    }

    return transaction(async (client) => {
      // Get or create the bead
      let bead = await this.getOrCreateBead(client, userId, beadCode, {
        label: options.label,
        element: options.element,
        facet: options.facet,
        polarity: options.polarity
      });

      const wasCreated = bead.activation_count === 0;

      // Create activation record
      const activationResult = await client.query<BeadActivation>(`
        INSERT INTO bead_activations (bead_id, user_id, source_type, source_id, intensity, co_activated_beads, is_sanctuary)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (bead_id, source_type, source_id) DO UPDATE SET
          intensity = EXCLUDED.intensity,
          activated_at = NOW()
        RETURNING *
      `, [
        bead.id,
        userId,
        sourceType,
        sourceId,
        options.intensity ?? null,
        options.coActivatedBeads ?? [],
        options.isSanctuary ?? false
      ]);

      // Update bead stats
      await client.query(`
        UPDATE beads SET
          activation_count = activation_count + 1,
          last_activated = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `, [bead.id]);

      // Refresh bead data
      const updatedBead = await client.query<Bead>(
        'SELECT * FROM beads WHERE id = $1',
        [bead.id]
      );

      return {
        bead: updatedBead.rows[0],
        activation: activationResult.rows[0],
        wasCreated
      };
    });
  }

  /**
   * Get or create a bead for a user
   */
  private async getOrCreateBead(
    client: TransactionClient,
    userId: string,
    code: string,
    options: {
      label?: string;
      element?: Element;
      facet?: string | null;
      polarity?: string;
    }
  ): Promise<Bead> {
    // Try to get existing bead
    const existing = await client.query<Bead>(
      'SELECT * FROM beads WHERE user_id = $1 AND code = $2',
      [userId, code]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Try to get canonical bead for defaults
    const canonical = await client.query<CanonicalBead>(
      'SELECT * FROM canonical_beads WHERE code = $1',
      [code]
    );

    const canonicalBead = canonical.rows[0];

    // Create new bead
    const element = options.element || canonicalBead?.element || 'aether';
    const label = options.label || canonicalBead?.label || code;
    const facet = options.facet !== undefined ? options.facet : (canonicalBead?.facet || null);
    const polarity = options.polarity || canonicalBead?.polarity || 'neutral';

    const result = await client.query<Bead>(`
      INSERT INTO beads (user_id, code, label, element, facet, polarity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, code, label, element, facet, polarity]);

    return result.rows[0];
  }

  /**
   * Get recently activated beads for a user
   */
  async getActiveBeads(
    userId: string,
    limit: number = 10
  ): Promise<Array<Bead & { recent_activation: Date }>> {
    const result = await query<Bead & { recent_activation: Date }>(`
      SELECT b.*, ba.activated_at as recent_activation
      FROM beads b
      JOIN bead_activations ba ON b.id = ba.bead_id
      WHERE b.user_id = $1 AND ba.is_sanctuary = FALSE
      ORDER BY ba.activated_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  /**
   * Get user's most frequently activated beads
   */
  async getTopBeads(
    userId: string,
    limit: number = 10
  ): Promise<Bead[]> {
    const result = await query<Bead>(`
      SELECT * FROM beads
      WHERE user_id = $1
      ORDER BY activation_count DESC, last_activated DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  /**
   * Confirm or correct a bead activation (user feedback)
   */
  async confirmBead(
    activationId: string,
    confirmed: boolean
  ): Promise<void> {
    await query(`
      UPDATE bead_activations
      SET user_confirmed = $1
      WHERE id = $2
    `, [confirmed, activationId]);

    // If confirmed, boost the bead's confidence
    if (confirmed) {
      await query(`
        UPDATE beads b
        SET confidence = LEAST(1.0, confidence + 0.1)
        FROM bead_activations ba
        WHERE ba.id = $1 AND b.id = ba.bead_id
      `, [activationId]);
    } else {
      // If rejected, reduce confidence
      await query(`
        UPDATE beads b
        SET confidence = GREATEST(0.1, confidence - 0.1)
        FROM bead_activations ba
        WHERE ba.id = $1 AND b.id = ba.bead_id
      `, [activationId]);
    }
  }

  /**
   * Get transition patterns (what beads tend to follow a given bead)
   */
  async getBeadTransitions(
    userId: string,
    beadCode: string,
    limit: number = 5
  ): Promise<Array<{ code: string; probability: number; count: number }>> {
    const result = await query<{ to_code: string; count: number }>(`
      WITH source_activations AS (
        SELECT ba.activated_at, ba.source_id
        FROM bead_activations ba
        JOIN beads b ON ba.bead_id = b.id
        WHERE b.user_id = $1 AND b.code = $2 AND ba.is_sanctuary = FALSE
      ),
      following_activations AS (
        SELECT b2.code as to_code, COUNT(*) as count
        FROM source_activations sa
        JOIN bead_activations ba2 ON ba2.user_id = $1
          AND ba2.activated_at > sa.activated_at
          AND ba2.activated_at < sa.activated_at + INTERVAL '7 days'
          AND ba2.source_id != sa.source_id
          AND ba2.is_sanctuary = FALSE
        JOIN beads b2 ON ba2.bead_id = b2.id
        WHERE b2.code != $2
        GROUP BY b2.code
      )
      SELECT to_code, count
      FROM following_activations
      ORDER BY count DESC
      LIMIT $3
    `, [userId, beadCode, limit]);

    const total = result.rows.reduce((sum, r) => sum + Number(r.count), 0);

    return result.rows.map(r => ({
      code: r.to_code,
      probability: total > 0 ? Number(r.count) / total : 0,
      count: Number(r.count)
    }));
  }

  /**
   * Get beads by element for a user
   */
  async getBeadsByElement(
    userId: string,
    element: Element
  ): Promise<Bead[]> {
    const result = await query<Bead>(`
      SELECT * FROM beads
      WHERE user_id = $1 AND element = $2
      ORDER BY activation_count DESC
    `, [userId, element]);

    return result.rows;
  }

  /**
   * Get beads by facet for a user
   */
  async getBeadsByFacet(
    userId: string,
    facet: string
  ): Promise<Bead[]> {
    const result = await query<Bead>(`
      SELECT * FROM beads
      WHERE user_id = $1 AND facet = $2
      ORDER BY activation_count DESC
    `, [userId, facet]);

    return result.rows;
  }

  /**
   * Get all canonical beads (the 36 starter set)
   */
  async getCanonicalBeads(): Promise<CanonicalBead[]> {
    const result = await query<CanonicalBead>(
      'SELECT * FROM canonical_beads ORDER BY element, facet, polarity'
    );
    return result.rows;
  }

  /**
   * Get activations for a specific source (entry)
   */
  async getActivationsForSource(
    sourceType: BeadActivation['source_type'],
    sourceId: string
  ): Promise<Array<BeadActivation & { bead: Bead }>> {
    const result = await query<BeadActivation & { bead_code: string; bead_label: string; bead_element: Element }>(`
      SELECT ba.*, b.code as bead_code, b.label as bead_label, b.element as bead_element
      FROM bead_activations ba
      JOIN beads b ON ba.bead_id = b.id
      WHERE ba.source_type = $1 AND ba.source_id = $2
    `, [sourceType, sourceId]);

    // Transform to include nested bead object
    return result.rows.map(row => ({
      ...row,
      bead: {
        id: row.bead_id,
        code: row.bead_code,
        label: row.bead_label,
        element: row.bead_element
      } as Bead
    }));
  }
}

// Export singleton instance
export const BeadService = new BeadServiceImpl();
export default BeadService;
