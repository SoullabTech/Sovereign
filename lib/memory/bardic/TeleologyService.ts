/**
 * TeleologyService
 *
 * Fire intelligence: tracks "what wants to become" (future-pull)
 *
 * Principles:
 * - Teleology is not prediction (mechanical) - it's sensing the pull of the future
 * - Teloi emerge from lived experience, not goal-setting
 * - Alignment is measured in deltas (convergence/divergence) not binary success/failure
 * - Multiple teloi can coexist (polyvalent futures)
 * - Teloi can fade, transform, or crystallize over time
 *
 * Core operations:
 * 1. Extract teloi from reflection/conversation
 * 2. Log alignment deltas (how episodes relate to teloi)
 * 3. Calculate telos strength (based on alignment history)
 * 4. Detect Fire-Air imbalance (projection outruns continuity)
 *
 * Architecture:
 * - Uses Postgres-native storage via TeleologyRepo
 * - Uses Anthropic for semantic analysis (telos extraction)
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  Telos,
  TeleologyExtraction,
  BalanceCheck,
} from './types';
import { TeleologyRepo, type TelosRow } from './storage/TeleologyRepo';

export interface ExtractTeloiInput {
  userId: string;
  text: string; // Reflection or conversation text
  originEpisodeId?: string; // Episode where this emerged
}

export interface LogAlignmentInput {
  episodeId: string;
  telosId: string;
  delta: number; // -1 to +1 (diverging to converging)
  notes?: string;
}

export interface CheckBalanceInput {
  userId: string;
  recentDays?: number; // Look back window (default: 7)
}

export class TeleologyService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || ''
    });
  }

  /**
   * Extract teloi from text
   *
   * Uses Claude to identify what wants to become.
   * Returns structured teloi with phrases, horizons, and signals.
   */
  async extract(input: ExtractTeloiInput): Promise<TeleologyExtraction> {
    try {
      const prompt = this.craftExtractionPrompt(input.text);

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Parse Claude's response (expects JSON)
      const extraction = this.parseExtraction(content);

      // Store teloi in database
      for (const telos of extraction.teloi) {
        await this.create({
          userId: input.userId,
          phrase: telos.phrase,
          originEpisodeId: input.originEpisodeId,
          strength: telos.strength,
          horizonDays: telos.horizon_days,
          signals: telos.signals
        });
      }

      return extraction;
    } catch (error) {
      console.error('[TeleologyService] Error extracting teloi:', error);
      return { teloi: [] };
    }
  }

  /**
   * Create a new telos
   */
  async create(input: {
    userId: string;
    phrase: string;
    originEpisodeId?: string;
    strength?: number;
    horizonDays?: number;
    signals?: string[];
  }): Promise<Telos | null> {
    try {
      const row = await TeleologyRepo.createTelos({
        userId: input.userId,
        phrase: input.phrase,
        originEpisodeId: input.originEpisodeId,
        strength: input.strength,
        horizonDays: input.horizonDays,
        signals: input.signals,
      });

      if (!row) {
        console.error('[TeleologyService] Failed to create telos');
        return null;
      }

      console.log(`[TeleologyService] Created telos: "${input.phrase}"`);
      return this.parseTelos(row);
    } catch (error) {
      console.error('[TeleologyService] Error creating telos:', error);
      return null;
    }
  }

  /**
   * Log alignment delta for an episode
   *
   * Delta measures how this episode relates to the telos:
   * - +1.0: strong convergence (moving toward)
   * - +0.5: gentle convergence
   * - 0.0: neutral (no change)
   * - -0.5: gentle divergence
   * - -1.0: strong divergence (moving away)
   */
  async logAlignment(input: LogAlignmentInput): Promise<boolean> {
    try {
      await TeleologyRepo.logAlignment({
        episodeId: input.episodeId,
        telosId: input.telosId,
        delta: input.delta,
        notes: input.notes,
      });

      // Update telos strength based on recent alignment
      await this.updateTelosStrength(input.telosId);

      console.log(`[TeleologyService] Logged alignment for telos ${input.telosId}: ${input.delta}`);
      return true;
    } catch (error) {
      console.error('[TeleologyService] Error logging alignment:', error);
      return false;
    }
  }

  /**
   * Update telos strength based on recent alignment history
   *
   * Strength is weighted average of recent alignment deltas:
   * - Recent deltas weighted more heavily
   * - Persistent convergence increases strength
   * - Persistent divergence decreases strength
   */
  private async updateTelosStrength(telosId: string): Promise<void> {
    try {
      // Get last 10 alignment logs
      const logs = await TeleologyRepo.getRecentAlignments(telosId, 10);

      if (logs.length === 0) {
        return;
      }

      // Calculate weighted average (more recent = higher weight)
      let totalWeight = 0;
      let weightedSum = 0;

      logs.forEach((log, index) => {
        const weight = Math.pow(0.9, index); // Exponential decay
        weightedSum += log.delta * weight;
        totalWeight += weight;
      });

      const newStrength = Math.max(0, Math.min(1,
        0.5 + (weightedSum / totalWeight) * 0.5 // Map [-1,1] to [0,1]
      ));

      // Update telos strength
      await TeleologyRepo.updateStrength(telosId, newStrength);

      console.log(`[TeleologyService] Updated telos ${telosId} strength to ${newStrength.toFixed(2)}`);
    } catch (error) {
      console.error('[TeleologyService] Error updating strength:', error);
    }
  }

  /**
   * Get all active teloi for a user
   *
   * Sorted by strength (strongest first)
   */
  async getActive(userId: string): Promise<Telos[]> {
    try {
      const rows = await TeleologyRepo.getActiveTeloi(userId);
      return rows.map(row => this.parseTelos(row));
    } catch (error) {
      console.error('[TeleologyService] Error getting active teloi:', error);
      return [];
    }
  }

  /**
   * Check Fire-Air balance
   *
   * Detects two imbalances:
   * 1. Projection outruns continuity (too much Fire, not enough Air)
   *    - Many teloi with high strength but no recent episodes aligning with them
   *    - Recommendation: GROUND - create microacts to embody the vision
   *
   * 2. Continuity stalls telos (too much Air, not enough Fire)
   *    - Many episodes but no clear telos emerging
   *    - Recommendation: CRYSTALLIZE - extract what wants to become
   */
  async checkBalance(input: CheckBalanceInput): Promise<BalanceCheck> {
    try {
      const days = input.recentDays ?? 7;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      // Get active teloi
      const teloi = await this.getActive(input.userId);
      const telosCount = teloi.length;

      // Get recent episode IDs
      const episodeIds = await TeleologyRepo.getEpisodeIdsInRange(input.userId, cutoff);
      const episodeCount = episodeIds.length;

      // Count alignments for those episodes
      const alignments = await TeleologyRepo.getAlignmentsForEpisodes(episodeIds);
      const alignmentCount = alignments.length;

      // IMBALANCE 1: Projection outruns continuity
      // Many strong teloi but few episodes aligning with them
      if (telosCount >= 3 && alignmentCount < telosCount * 2) {
        const strongestTelos = teloi[0];
        return {
          imbalance: 'projection_outruns_continuity',
          recommendation: {
            type: 'ground',
            stanza: `Fire reaches ahead, but feet stay still. ${strongestTelos.phrase} - what tiny step makes it real?`,
            telos: strongestTelos,
            horizon_hours: 48
          }
        };
      }

      // IMBALANCE 2: Continuity stalls telos
      // Many episodes but no clear telos
      if (episodeCount >= 5 && telosCount === 0) {
        return {
          imbalance: 'continuity_stalls_telos',
          recommendation: {
            type: 'crystallize',
            stanza: 'Rich days unfold, but where do they lead? Time to ask: what wants to become?',
            horizon_hours: 24
          }
        };
      }

      // No imbalance detected
      return {};
    } catch (error) {
      console.error('[TeleologyService] Error checking balance:', error);
      return {};
    }
  }

  /**
   * Craft prompt for telos extraction
   */
  private craftExtractionPrompt(text: string): string {
    return `
You are a Fire intelligence that senses future-pull in conversation.

Read this text and extract any TELOI (singular: telos) - things that want to become.

Teloi are NOT:
- Goals or resolutions ("I should exercise more")
- External obligations ("Need to finish the project")
- Borrowed desires ("My parents want me to...")

Teloi ARE:
- Emergent pulls toward possibility ("Something wants to shift in how I relate to my body")
- Resonant futures that feel alive ("I sense myself moving toward more spaciousness")
- Things knocking at the door of becoming ("This creative practice is asking for more room")

For each telos, extract:
- phrase: Concise statement (10-30 words)
- horizon_days: Temporal horizon (30, 90, 365, or more)
- signals: Observable markers of convergence (3-5 specific signs)
- strength: Initial pull intensity (0.3-0.7 for newly emerged, 0.7-0.9 for strong)

Return ONLY valid JSON in this exact format:
{
  "teloi": [
    {
      "phrase": "...",
      "horizon_days": 90,
      "signals": ["signal 1", "signal 2", "signal 3"],
      "strength": 0.5
    }
  ]
}

If no teloi detected, return: {"teloi": []}

Text to analyze:
${text.substring(0, 2000)}
`.trim();
  }

  /**
   * Parse Claude's extraction response
   */
  private parseExtraction(text: string): TeleologyExtraction {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                        text.match(/(\{[\s\S]*\})/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed as TeleologyExtraction;
      }

      return { teloi: [] };
    } catch (error) {
      console.error('[TeleologyService] Error parsing extraction:', error);
      return { teloi: [] };
    }
  }

  /**
   * Parse database row to Telos type
   */
  private parseTelos(row: TelosRow): Telos {
    return {
      id: row.id,
      user_id: row.user_id,
      phrase: row.phrase,
      origin_episode: row.origin_episode ?? undefined,
      strength: row.strength,
      horizon_days: row.horizon_days ?? undefined,
      signals: row.signals || [],
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}

/**
 * Create singleton instance
 */
let teleologyService: TeleologyService | null = null;

export function getTeleologyService(): TeleologyService {
  if (!teleologyService) {
    teleologyService = new TeleologyService();
  }
  return teleologyService;
}
