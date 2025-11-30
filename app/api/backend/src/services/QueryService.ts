// CQRS Query Side - Soul Memory System
// Handles all read operations and projections

import { supabase } from "../../lib/supabaseClient";
import { MemoryItem } from "../../types/memory";
import { logger } from "../../utils/logger";

export interface MemoryQuery {
  userId: string;
  element?: string;
  sourceAgent?: string;
  limit?: number;
  offset?: number;
  symbols?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface SpiritualTheme {
  name: string;
  frequency: number;
  lastSeen: string;
}

export class SoulMemoryQueryService {
  async getMemories(query: MemoryQuery): Promise<MemoryItem[]> {
    try {
      let supabaseQuery = supabase
        .from("memories")
        .select("*")
        .eq("user_id", query.userId)
        .order("created_at", { ascending: false });

      if (query.element) {
        supabaseQuery = supabaseQuery.eq("element", query.element);
      }

      if (query.sourceAgent) {
        supabaseQuery = supabaseQuery.eq("source_agent", query.sourceAgent);
      }

      if (query.dateRange) {
        supabaseQuery = supabaseQuery
          .gte("created_at", query.dateRange.from)
          .lte("created_at", query.dateRange.to);
      }

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(
          query.offset,
          query.offset + (query.limit || 10) - 1,
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error("Failed to query memories", { error, query });
      throw new Error(
        `Memory query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getMemoryById(id: string, userId: string): Promise<MemoryItem | null> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error("Failed to get memory by ID", { error, id, userId });
      throw new Error(
        `Memory retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getRecentMemories(
    userId: string,
    limit: number = 10,
  ): Promise<MemoryItem[]> {
    return this.getMemories({ userId, limit });
  }

  async getMemoriesByElement(
    userId: string,
    element: string,
    limit: number = 20,
  ): Promise<MemoryItem[]> {
    return this.getMemories({ userId, element, limit });
  }

  async searchMemories(
    userId: string,
    searchTerm: string,
    limit: number = 20,
  ): Promise<MemoryItem[]> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .textSearch("content", searchTerm)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Search query failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error("Failed to search memories", { error, userId, searchTerm });
      throw new Error(
        `Memory search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getSpiritualThemes(userId: string): Promise<SpiritualTheme[]> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("symbols, created_at")
        .eq("user_id", userId)
        .not("symbols", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Themes query failed: ${error.message}`);
      }

      const themeMap = new Map<string, { count: number; lastSeen: string }>();

      for (const memory of data || []) {
        const symbols = memory.symbols as string[];
        const timestamp = memory.created_at;

        if (Array.isArray(symbols)) {
          for (const symbol of symbols) {
            const current = themeMap.get(symbol) || {
              count: 0,
              lastSeen: timestamp,
            };
            themeMap.set(symbol, {
              count: current.count + 1,
              lastSeen:
                current.lastSeen > timestamp ? current.lastSeen : timestamp,
            });
          }
        }
      }

      return Array.from(themeMap.entries())
        .map(([name, data]) => ({
          name,
          frequency: data.count,
          lastSeen: data.lastSeen,
        }))
        .sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      logger.error("Failed to get spiritual themes", { error, userId });
      throw new Error(
        `Themes retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    memoriesByElement: Record<string, number>;
    recentActivity: { date: string; count: number }[];
  }> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("element, created_at")
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Stats query failed: ${error.message}`);
      }

      const memories = data || [];
      const elementCounts: Record<string, number> = {};
      const dailyCounts: Record<string, number> = {};

      for (const memory of memories) {
        // Element counts
        const element = memory.element || "unknown";
        elementCounts[element] = (elementCounts[element] || 0) + 1;

        // Daily activity
        const date = new Date(memory.created_at).toISOString().split("T")[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      }

      const recentActivity = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30); // Last 30 days

      return {
        totalMemories: memories.length,
        memoriesByElement: elementCounts,
        recentActivity,
      };
    } catch (error) {
      logger.error("Failed to get memory stats", { error, userId });
      throw new Error(
        `Stats retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const soulMemoryQueryService = new SoulMemoryQueryService();
