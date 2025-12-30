/**
 * LinkingService
 *
 * Auto-generates episode links based on:
 * - Echoes: similar affect/pattern
 * - Contrasts: opposite/shadow
 * - Fulfills: resolution/completion
 * - Co-occurs: temporal proximity
 *
 * This builds the mycelial memory graph automatically.
 *
 * Architecture:
 * - Uses Postgres-native storage via EpisodeRepo + LinkingRepo
 * - Uses Anthropic for semantic analysis (fulfillment patterns)
 */

import Anthropic from '@anthropic-ai/sdk';
import { EpisodeRepo } from './storage/EpisodeRepo';
import { LinkingRepo, type StoredLink } from './storage/LinkingRepo';
import type { Episode, EpisodeRelation } from './types';

export interface LinkSuggestion {
  targetEpisodeId: string;
  relation: EpisodeRelation;
  weight: number; // 0-1
  reasoning: string;
}

export class LinkingService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Generate links for a new episode
   *
   * Finds related episodes and creates graph edges
   */
  async generateLinks(episodeId: string, userId: string): Promise<number> {
    try {
      // Get the episode
      const episode = await EpisodeRepo.getEpisode(episodeId, userId);

      if (!episode) {
        console.error('[LinkingService] Episode not found:', episodeId);
        return 0;
      }

      // Don't link sacred episodes
      if (episode.sacred_flag) {
        return 0;
      }

      // Get recent episodes for comparison (last 30 days)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const recentEpisodes = await EpisodeRepo.listRecentEpisodes({
        userId,
        limit: 20,
        excludeEpisodeId: episodeId,
        includeSacred: false,
        sinceDate: cutoff,
      });

      if (recentEpisodes.length === 0) {
        return 0;
      }

      // Generate link suggestions using multiple methods
      const suggestions: LinkSuggestion[] = [];

      // 1. Affect-based linking (echoes/contrasts)
      const affectLinks = this.findAffectLinks(episode, recentEpisodes);
      suggestions.push(...affectLinks);

      // 2. Temporal co-occurrence
      const coOccurLinks = this.findCoOccurLinks(episode, recentEpisodes);
      suggestions.push(...coOccurLinks);

      // 3. Semantic analysis via Claude (fulfillment patterns)
      const semanticLinks = await this.findSemanticLinks(
        episode,
        recentEpisodes
      );
      suggestions.push(...semanticLinks);

      // Store links
      let createdCount = 0;
      for (const suggestion of suggestions) {
        const success = await this.createLink(
          episodeId,
          suggestion.targetEpisodeId,
          suggestion.relation,
          suggestion.weight,
          suggestion.reasoning
        );
        if (success) createdCount++;
      }

      console.log(
        `[LinkingService] Created ${createdCount} links for episode ${episodeId}`
      );
      return createdCount;
    } catch (error) {
      console.error('[LinkingService] Error generating links:', error);
      return 0;
    }
  }

  /**
   * Find affect-based links (echoes/contrasts)
   */
  private findAffectLinks(
    episode: Episode,
    candidates: Episode[]
  ): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];

    if (episode.affect_valence == null || episode.affect_arousal == null) {
      return suggestions;
    }

    for (const candidate of candidates) {
      if (
        candidate.affect_valence == null ||
        candidate.affect_arousal == null
      ) {
        continue;
      }

      const valenceDiff = Math.abs(
        episode.affect_valence - candidate.affect_valence
      );
      const arousalDiff = Math.abs(
        episode.affect_arousal - candidate.affect_arousal
      );

      // ECHOES: Similar affect (small differences)
      if (valenceDiff <= 2 && arousalDiff <= 2) {
        const similarity = 1 - (valenceDiff + arousalDiff) / 14; // Normalize to 0-1

        suggestions.push({
          targetEpisodeId: candidate.id,
          relation: 'echoes',
          weight: similarity * 0.8, // Scale weight
          reasoning: 'Similar emotional signature',
        });
      }

      // CONTRASTS: Opposite valence, similar arousal
      if (
        Math.abs(episode.affect_valence + candidate.affect_valence) <= 1 &&
        arousalDiff <= 2
      ) {
        suggestions.push({
          targetEpisodeId: candidate.id,
          relation: 'contrasts',
          weight: 0.7,
          reasoning: 'Opposite emotional polarity',
        });
      }
    }

    return suggestions;
  }

  /**
   * Find temporal co-occurrence links
   */
  private findCoOccurLinks(
    episode: Episode,
    candidates: Episode[]
  ): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];
    const episodeTime = new Date(episode.occurred_at).getTime();

    for (const candidate of candidates) {
      const candidateTime = new Date(candidate.occurred_at).getTime();
      const hoursDiff =
        Math.abs(episodeTime - candidateTime) / (1000 * 60 * 60);

      // CO_OCCURS: Within 24 hours
      if (hoursDiff <= 24) {
        const weight = 1 - hoursDiff / 24; // Closer in time = higher weight

        suggestions.push({
          targetEpisodeId: candidate.id,
          relation: 'co_occurs',
          weight: weight * 0.6,
          reasoning: `Occurred within ${Math.round(hoursDiff)} hours`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Find semantic links using Claude (fulfillment patterns)
   */
  private async findSemanticLinks(
    episode: Episode,
    candidates: Episode[]
  ): Promise<LinkSuggestion[]> {
    // This is expensive, so only check top 5 candidates
    const topCandidates = candidates.slice(0, 5);

    if (topCandidates.length === 0) {
      return [];
    }

    try {
      const prompt = this.craftSemanticPrompt(episode, topCandidates);

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022', // Fast model for this task
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content =
        response.content[0].type === 'text' ? response.content[0].text : '';

      return this.parseSemanticResponse(content);
    } catch (error) {
      console.error('[LinkingService] Error finding semantic links:', error);
      return [];
    }
  }

  /**
   * Craft prompt for semantic analysis
   */
  private craftSemanticPrompt(episode: Episode, candidates: Episode[]): string {
    return `
Analyze if this new episode FULFILLS any of these recent episodes.

FULFILLS means: resolves, completes, or brings closure to a pattern/tension/question.

NEW EPISODE:
Stanza: ${episode.scene_stanza || 'No stanza'}
Place: ${episode.place_cue || 'Unknown'}
Occurred: ${episode.occurred_at}

RECENT EPISODES:
${candidates
  .map(
    (c, i) => `
[${i}] ${c.scene_stanza || 'No stanza'}
Place: ${c.place_cue || 'Unknown'}
ID: ${c.id}
`
  )
  .join('\n')}

Return ONLY valid JSON:
{
  "fulfills": [
    { "episodeId": "...", "weight": 0.8, "reasoning": "..." }
  ]
}

If no fulfillment detected, return: {"fulfills": []}
`.trim();
  }

  /**
   * Parse Claude's semantic response
   */
  private parseSemanticResponse(content: string): LinkSuggestion[] {
    try {
      const jsonMatch =
        content.match(/\{[\s\S]*\}/) ||
        content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      const suggestions: LinkSuggestion[] = [];

      if (parsed.fulfills && Array.isArray(parsed.fulfills)) {
        for (const item of parsed.fulfills) {
          suggestions.push({
            targetEpisodeId: item.episodeId,
            relation: 'fulfills',
            weight: item.weight || 0.7,
            reasoning: item.reasoning || 'Completes a pattern',
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('[LinkingService] Error parsing semantic response:', error);
      return [];
    }
  }

  /**
   * Create a link between episodes
   */
  private async createLink(
    srcId: string,
    dstId: string,
    relation: EpisodeRelation,
    weight: number,
    reasoning?: string
  ): Promise<boolean> {
    try {
      return await LinkingRepo.createLink({
        srcEpisodeId: srcId,
        dstEpisodeId: dstId,
        relation,
        weight,
        reasoning,
      });
    } catch (error) {
      console.error('[LinkingService] Error creating link:', error);
      return false;
    }
  }

  /**
   * Get all links from an episode
   */
  async getLinksFrom(episodeId: string): Promise<StoredLink[]> {
    return LinkingRepo.getLinksFrom(episodeId);
  }

  /**
   * Get all links to an episode
   */
  async getLinksTo(episodeId: string): Promise<StoredLink[]> {
    return LinkingRepo.getLinksTo(episodeId);
  }

  /**
   * Delete a link
   */
  async deleteLink(linkId: string): Promise<boolean> {
    return LinkingRepo.deleteLink(linkId);
  }
}

/**
 * Create singleton instance
 */
let linkingService: LinkingService | null = null;

export function getLinkingService(): LinkingService {
  if (!linkingService) {
    linkingService = new LinkingService();
  }
  return linkingService;
}
