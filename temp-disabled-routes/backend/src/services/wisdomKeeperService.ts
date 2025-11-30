// Wisdom Keeper Service - Permanent sacred knowledge repository
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { logger } from "../utils/logger";

interface WisdomEntry {
  id: string;
  participantId: string;
  retreatId: string;
  type: "insight" | "practice" | "story" | "guidance" | "blessing";
  content: {
    title: string;
    body: string;
    element: string;
    tags: string[];
    context?: string;
  };
  accessibility: "private" | "retreat_alumni" | "public";
  metadata: {
    createdAt: Date;
    views: number;
    resonance: number;
    bookmarks: number;
    shares: number;
  };
  connections: {
    relatedWisdom: string[];
    inspiredBy: string[];
    inspires: string[];
  };
}

interface WisdomSearchParams {
  query?: string;
  element?: string;
  type?: string;
  tags?: string[];
  requesterId: string;
}

interface WisdomCollection {
  contributed: WisdomEntry[];
  bookmarked: WisdomEntry[];
  received: WisdomEntry[];
}

export class WisdomKeeperService {
  // Add wisdom to the keeper
  async addWisdom(wisdomData: any): Promise<WisdomEntry> {
    try {
      const wisdom: WisdomEntry = {
        id: uuidv4(),
        participantId: wisdomData.participantId,
        retreatId: wisdomData.retreatId,
        type: wisdomData.type,
        content: wisdomData.content,
        accessibility: wisdomData.accessibility,
        metadata: {
          createdAt: new Date(),
          views: 0,
          resonance: 0,
          bookmarks: 0,
          shares: 0,
        },
        connections: {
          relatedWisdom: [],
          inspiredBy: wisdomData.inspiredBy || [],
          inspires: [],
        },
      };

      // Store wisdom
      const { error } = await supabase.from("wisdom_keeper").insert(wisdom);

      if (error) throw error;

      // Update participant's wisdom score
      await this.updateWisdomScore(wisdom.participantId);

      // Find and link related wisdom
      await this.linkRelatedWisdom(wisdom);

      logger.info("Wisdom added to keeper", {
        wisdomId: wisdom.id,
        type: wisdom.type,
      });

      return wisdom;
    } catch (error) {
      logger.error("Failed to add wisdom", error);
      throw error;
    }
  }

  // Index wisdom for searchability
  async indexWisdom(wisdom: WisdomEntry): Promise<void> {
    try {
      // Create search index entry
      const searchIndex = {
        wisdom_id: wisdom.id,
        searchable_text: this.createSearchableText(wisdom),
        element: wisdom.content.element,
        type: wisdom.type,
        tags: wisdom.content.tags,
        participant_id: wisdom.participantId,
        accessibility: wisdom.accessibility,
        created_at: wisdom.metadata.createdAt,
      };

      await supabase.from("wisdom_search_index").insert(searchIndex);

      // Update tag cloud
      await this.updateTagCloud(wisdom.content.tags);

      logger.info("Wisdom indexed", { wisdomId: wisdom.id });
    } catch (error) {
      logger.error("Failed to index wisdom", error);
    }
  }

  // Notify relevant community members
  async notifyRelevantMembers(wisdom: WisdomEntry): Promise<void> {
    try {
      // Find members interested in this type/element
      const { data: interestedMembers } = await supabase
        .from("member_interests")
        .select("participant_id")
        .or(
          `elements.cs.{${wisdom.content.element}},types.cs.{${wisdom.type}}`,
        );

      if (!interestedMembers || interestedMembers.length === 0) return;

      // Create notifications
      const notifications = interestedMembers.map((member) => ({
        participant_id: member.participant_id,
        type: "new_wisdom",
        content: {
          wisdomId: wisdom.id,
          wisdomType: wisdom.type,
          title: wisdom.content.title,
          element: wisdom.content.element,
        },
        created_at: new Date(),
      }));

      await supabase.from("participant_notifications").insert(notifications);

      logger.info("Members notified of new wisdom", {
        wisdomId: wisdom.id,
        notifiedCount: notifications.length,
      });
    } catch (error) {
      logger.error("Failed to notify members", error);
    }
  }

  // Search wisdom archive
  async searchWisdom(params: WisdomSearchParams): Promise<WisdomEntry[]> {
    try {
      let query = supabase.from("wisdom_keeper").select("*");

      // Access control
      query = query.or(
        `accessibility.eq.public,accessibility.eq.retreat_alumni`,
      );

      // Add participant's private wisdom
      query = query.or(
        `and(participant_id.eq.${params.requesterId},accessibility.eq.private)`,
      );

      // Text search
      if (params.query) {
        query = query.textSearch("searchable_text", params.query);
      }

      // Element filter
      if (params.element) {
        query = query.eq("content->element", params.element);
      }

      // Type filter
      if (params.type) {
        query = query.eq("type", params.type);
      }

      // Tag filter
      if (params.tags && params.tags.length > 0) {
        query = query.contains("content->tags", params.tags);
      }

      // Order by relevance and recency
      query = query
        .order("metadata->resonance", { ascending: false })
        .order("metadata->createdAt", { ascending: false })
        .limit(50);

      const { data } = await query;

      // Track search for recommendations
      await this.trackSearch(params);

      return data || [];
    } catch (error) {
      logger.error("Failed to search wisdom", error);
      throw error;
    }
  }

  // Get wisdom facets for filtering
  async getWisdomFacets(facetType: "element" | "type"): Promise<any> {
    try {
      const { data } = await supabase
        .from("wisdom_keeper")
        .select(facetType === "element" ? "content->element" : "type");

      const facets: any = {};
      data?.forEach((item) => {
        const value =
          facetType === "element" ? item.content?.element : item.type;
        facets[value] = (facets[value] || 0) + 1;
      });

      return Object.entries(facets)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => (b.count as number) - (a.count as number));
    } catch (error) {
      logger.error("Failed to get wisdom facets", error);
      throw error;
    }
  }

  // Get popular tags
  async getPopularTags(limit: number = 20): Promise<any[]> {
    try {
      const { data } = await supabase
        .from("tag_cloud")
        .select("*")
        .order("usage_count", { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      logger.error("Failed to get popular tags", error);
      throw error;
    }
  }

  // Get personal wisdom collection
  async getPersonalCollection(
    participantId: string,
  ): Promise<WisdomCollection> {
    try {
      // Get contributed wisdom
      const { data: contributed } = await supabase
        .from("wisdom_keeper")
        .select("*")
        .eq("participant_id", participantId)
        .order("metadata->createdAt", { ascending: false });

      // Get bookmarked wisdom
      const { data: bookmarks } = await supabase
        .from("wisdom_bookmarks")
        .select("wisdom_id")
        .eq("participant_id", participantId);

      let bookmarked: WisdomEntry[] = [];
      if (bookmarks && bookmarks.length > 0) {
        const wisdomIds = bookmarks.map((b) => b.wisdom_id);
        const { data } = await supabase
          .from("wisdom_keeper")
          .select("*")
          .in("id", wisdomIds);
        bookmarked = data || [];
      }

      // Get wisdom received (shared directly with participant)
      const { data: received } = await supabase
        .from("wisdom_shares")
        .select("wisdom_id")
        .eq("shared_with", participantId);

      let receivedWisdom: WisdomEntry[] = [];
      if (received && received.length > 0) {
        const wisdomIds = received.map((r) => r.wisdom_id);
        const { data } = await supabase
          .from("wisdom_keeper")
          .select("*")
          .in("id", wisdomIds);
        receivedWisdom = data || [];
      }

      return {
        contributed: contributed || [],
        bookmarked,
        received: receivedWisdom,
      };
    } catch (error) {
      logger.error("Failed to get personal collection", error);
      throw error;
    }
  }

  // Bookmark wisdom
  async bookmarkWisdom(participantId: string, wisdomId: string): Promise<void> {
    try {
      await supabase.from("wisdom_bookmarks").insert({
        participant_id: participantId,
        wisdom_id: wisdomId,
        created_at: new Date(),
      });

      // Update bookmark count
      await this.incrementMetric(wisdomId, "bookmarks");

      logger.info("Wisdom bookmarked", { participantId, wisdomId });
    } catch (error) {
      logger.error("Failed to bookmark wisdom", error);
      throw error;
    }
  }

  // Share wisdom with another participant
  async shareWisdom(
    wisdomId: string,
    sharedBy: string,
    sharedWith: string,
    message?: string,
  ): Promise<void> {
    try {
      await supabase.from("wisdom_shares").insert({
        wisdom_id: wisdomId,
        shared_by: sharedBy,
        shared_with: sharedWith,
        message,
        created_at: new Date(),
      });

      // Update share count
      await this.incrementMetric(wisdomId, "shares");

      // Notify recipient
      await supabase.from("participant_notifications").insert({
        participant_id: sharedWith,
        type: "wisdom_shared",
        content: {
          wisdomId,
          sharedBy,
          message,
        },
        created_at: new Date(),
      });

      logger.info("Wisdom shared", { wisdomId, sharedBy, sharedWith });
    } catch (error) {
      logger.error("Failed to share wisdom", error);
      throw error;
    }
  }

  // Record wisdom resonance
  async recordResonance(
    wisdomId: string,
    participantId: string,
    resonanceLevel: number,
  ): Promise<void> {
    try {
      await supabase.from("wisdom_resonance").insert({
        wisdom_id: wisdomId,
        participant_id: participantId,
        resonance_level: resonanceLevel,
        created_at: new Date(),
      });

      // Update average resonance
      await this.updateAverageResonance(wisdomId);

      logger.info("Resonance recorded", { wisdomId, resonanceLevel });
    } catch (error) {
      logger.error("Failed to record resonance", error);
      throw error;
    }
  }

  // Get wisdom recommendations
  async getRecommendations(
    participantId: string,
    limit: number = 10,
  ): Promise<WisdomEntry[]> {
    try {
      // Get participant's interests and element
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("oracleElement, retreatIntentions")
        .eq("id", participantId)
        .single();

      // Get participant's interaction history
      const { data: interactions } = await supabase
        .from("wisdom_interactions")
        .select("wisdom_id, interaction_type")
        .eq("participant_id", participantId);

      // Build recommendation query
      let query = supabase
        .from("wisdom_keeper")
        .select("*")
        .neq("participant_id", participantId); // Exclude own wisdom

      // Filter by element affinity
      if (participant?.oracleElement) {
        query = query.eq("content->element", participant.oracleElement);
      }

      // Exclude already interacted wisdom
      if (interactions && interactions.length > 0) {
        const interactedIds = interactions.map((i) => i.wisdom_id);
        query = query.not("id", "in", `(${interactedIds.join(",")})`);
      }

      // Order by resonance and recency
      query = query
        .order("metadata->resonance", { ascending: false })
        .order("metadata->createdAt", { ascending: false })
        .limit(limit);

      const { data } = await query;

      return data || [];
    } catch (error) {
      logger.error("Failed to get recommendations", error);
      throw error;
    }
  }

  // Create wisdom threads (connected wisdom)
  async createWisdomThread(
    sourceWisdomId: string,
    targetWisdomId: string,
    connectionType: "response" | "expansion" | "question" | "integration",
  ): Promise<void> {
    try {
      await supabase.from("wisdom_threads").insert({
        source_wisdom_id: sourceWisdomId,
        target_wisdom_id: targetWisdomId,
        connection_type: connectionType,
        created_at: new Date(),
      });

      // Update connections in both wisdom entries
      await this.updateWisdomConnections(sourceWisdomId, targetWisdomId);

      logger.info("Wisdom thread created", {
        sourceWisdomId,
        targetWisdomId,
        connectionType,
      });
    } catch (error) {
      logger.error("Failed to create wisdom thread", error);
      throw error;
    }
  }

  // Get wisdom threads
  async getWisdomThreads(wisdomId: string): Promise<any> {
    try {
      const { data: threads } = await supabase
        .from("wisdom_threads")
        .select(
          `
          *,
          source_wisdom:wisdom_keeper!source_wisdom_id(*),
          target_wisdom:wisdom_keeper!target_wisdom_id(*)
        `,
        )
        .or(`source_wisdom_id.eq.${wisdomId},target_wisdom_id.eq.${wisdomId}`)
        .order("created_at", { ascending: true });

      return threads || [];
    } catch (error) {
      logger.error("Failed to get wisdom threads", error);
      throw error;
    }
  }

  // Archive wisdom by theme
  async getThematicArchives(): Promise<any> {
    try {
      const themes = [
        "Shadow Integration",
        "Elemental Mastery",
        "Relationship Alchemy",
        "Purpose Clarification",
        "Spiritual Awakening",
        "Creative Expression",
        "Leadership Evolution",
        "Abundance Activation",
      ];

      const archives = await Promise.all(
        themes.map(async (theme) => {
          const { data, count } = await supabase
            .from("wisdom_keeper")
            .select("*", { count: "exact" })
            .textSearch("searchable_text", theme)
            .limit(5);

          return {
            theme,
            count: count || 0,
            featured: data || [],
          };
        }),
      );

      return archives.filter((a) => a.count > 0);
    } catch (error) {
      logger.error("Failed to get thematic archives", error);
      throw error;
    }
  }

  // Export personal wisdom journal
  async exportWisdomJournal(participantId: string): Promise<any> {
    try {
      const collection = await this.getPersonalCollection(participantId);

      // Get participant info
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("firstName, lastName, oracleElement, retreatDate")
        .eq("id", participantId)
        .single();

      const journal = {
        participant: {
          name: `${participant?.firstName} ${participant?.lastName}`,
          element: participant?.oracleElement,
          retreatDate: participant?.retreatDate,
        },
        exportDate: new Date(),
        contributed: collection.contributed.map((w) => ({
          date: w.metadata.createdAt,
          type: w.type,
          title: w.content.title,
          body: w.content.body,
          element: w.content.element,
          resonance: w.metadata.resonance,
        })),
        bookmarked: collection.bookmarked.map((w) => ({
          title: w.content.title,
          body: w.content.body,
          author: "Fellow Journeyer",
          element: w.content.element,
        })),
        statistics: {
          totalContributed: collection.contributed.length,
          totalBookmarked: collection.bookmarked.length,
          totalResonance: collection.contributed.reduce(
            (sum, w) => sum + w.metadata.resonance,
            0,
          ),
        },
      };

      return journal;
    } catch (error) {
      logger.error("Failed to export wisdom journal", error);
      throw error;
    }
  }

  // Helper methods
  private createSearchableText(wisdom: WisdomEntry): string {
    return [
      wisdom.content.title,
      wisdom.content.body,
      wisdom.content.context || "",
      wisdom.content.tags.join(" "),
      wisdom.content.element,
      wisdom.type,
    ]
      .join(" ")
      .toLowerCase();
  }

  private async updateTagCloud(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await supabase.rpc("increment_tag_usage", { tag_name: tag });
    }
  }

  private async linkRelatedWisdom(wisdom: WisdomEntry): Promise<void> {
    // Find wisdom with similar tags or element
    const { data: related } = await supabase
      .from("wisdom_keeper")
      .select("id")
      .neq("id", wisdom.id)
      .or(
        `content->element.eq.${wisdom.content.element},content->tags.cs.{${wisdom.content.tags.join(",")}}`,
      )
      .limit(5);

    if (related && related.length > 0) {
      const connections = related.map((r) => ({
        wisdom_id: wisdom.id,
        related_wisdom_id: r.id,
        created_at: new Date(),
      }));

      await supabase.from("wisdom_connections").insert(connections);
    }
  }

  private async updateWisdomScore(participantId: string): Promise<void> {
    const { count } = await supabase
      .from("wisdom_keeper")
      .select("*", { count: "exact" })
      .eq("participant_id", participantId);

    await supabase.from("participant_stats").upsert({
      participant_id: participantId,
      wisdom_contributions: count || 0,
      last_wisdom_date: new Date(),
    });
  }

  private async trackSearch(params: WisdomSearchParams): Promise<void> {
    await supabase.from("wisdom_searches").insert({
      participant_id: params.requesterId,
      search_query: params.query,
      filters: {
        element: params.element,
        type: params.type,
        tags: params.tags,
      },
      created_at: new Date(),
    });
  }

  private async incrementMetric(
    wisdomId: string,
    metric: "views" | "bookmarks" | "shares",
  ): Promise<void> {
    await supabase.rpc(`increment_wisdom_${metric}`, { wisdom_id: wisdomId });
  }

  private async updateAverageResonance(wisdomId: string): Promise<void> {
    const { data } = await supabase
      .from("wisdom_resonance")
      .select("resonance_level")
      .eq("wisdom_id", wisdomId);

    if (data && data.length > 0) {
      const average =
        data.reduce((sum, r) => sum + r.resonance_level, 0) / data.length;

      await supabase
        .from("wisdom_keeper")
        .update({ "metadata.resonance": average })
        .eq("id", wisdomId);
    }
  }

  private async updateWisdomConnections(
    sourceId: string,
    targetId: string,
  ): Promise<void> {
    // Update source wisdom
    const { data: source } = await supabase
      .from("wisdom_keeper")
      .select("connections")
      .eq("id", sourceId)
      .single();

    if (source) {
      source.connections.inspires.push(targetId);
      await supabase
        .from("wisdom_keeper")
        .update({ connections: source.connections })
        .eq("id", sourceId);
    }

    // Update target wisdom
    const { data: target } = await supabase
      .from("wisdom_keeper")
      .select("connections")
      .eq("id", targetId)
      .single();

    if (target) {
      target.connections.inspiredBy.push(sourceId);
      await supabase
        .from("wisdom_keeper")
        .update({ connections: target.connections })
        .eq("id", targetId);
    }
  }

  // Get wisdom daily digest
  async getWisdomDailyDigest(participantId: string): Promise<any> {
    try {
      // Get participant preferences
      const { data: preferences } = await supabase
        .from("participant_preferences")
        .select("wisdom_digest_preferences")
        .eq("participant_id", participantId)
        .single();

      // Get recent high-resonance wisdom
      const { data: recentWisdom } = await supabase
        .from("wisdom_keeper")
        .select("*")
        .gte(
          "metadata->createdAt",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        )
        .order("metadata->resonance", { ascending: false })
        .limit(3);

      // Get wisdom from participant's element
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("oracleElement")
        .eq("id", participantId)
        .single();

      const { data: elementalWisdom } = await supabase
        .from("wisdom_keeper")
        .select("*")
        .eq("content->element", participant?.oracleElement)
        .order("metadata->createdAt", { ascending: false })
        .limit(2);

      // Get a random blessing
      const { data: blessings } = await supabase
        .from("wisdom_keeper")
        .select("*")
        .eq("type", "blessing")
        .limit(10);

      const randomBlessing =
        blessings?.[Math.floor(Math.random() * (blessings?.length || 1))];

      return {
        date: new Date(),
        recentHighResonance: recentWisdom || [],
        elementalWisdom: elementalWisdom || [],
        dailyBlessing: randomBlessing,
        personalRecommendations: await this.getRecommendations(
          participantId,
          2,
        ),
      };
    } catch (error) {
      logger.error("Failed to get wisdom daily digest", error);
      throw error;
    }
  }

  // Create wisdom ritual
  async createWisdomRitual(participantId: string, theme: string): Promise<any> {
    try {
      // Get wisdom related to theme
      const { data: themeWisdom } = await supabase
        .from("wisdom_keeper")
        .select("*")
        .textSearch("searchable_text", theme)
        .order("metadata->resonance", { ascending: false })
        .limit(7);

      if (!themeWisdom || themeWisdom.length === 0) {
        return null;
      }

      // Create 7-day ritual
      const ritual = {
        theme,
        participantId,
        days: themeWisdom.map((wisdom, index) => ({
          day: index + 1,
          wisdom: {
            id: wisdom.id,
            title: wisdom.content.title,
            body: wisdom.content.body,
            element: wisdom.content.element,
          },
          practice: this.selectRitualPractice(wisdom.content.element, theme),
          reflection: `How does today's wisdom about "${wisdom.content.title}" resonate with your ${theme} journey?`,
        })),
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      // Store ritual
      await supabase.from("wisdom_rituals").insert({
        participant_id: participantId,
        ritual,
        created_at: new Date(),
      });

      return ritual;
    } catch (error) {
      logger.error("Failed to create wisdom ritual", error);
      throw error;
    }
  }

  private selectRitualPractice(element: string, theme: string): string {
    const practices: any = {
      fire: "Light a candle and read the wisdom aloud with passion",
      water: "Read near water or while taking a ritual bath",
      earth: "Read while grounded in nature or holding a crystal",
      air: "Read after breathwork or in open air",
      aether: "Read in meditation posture with all elements present",
    };

    return practices[element] || practices.aether;
  }
}

// Export singleton instance
export const wisdomKeeperService = new WisdomKeeperService();
