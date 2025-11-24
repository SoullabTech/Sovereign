// ===============================================
// MEMORY INTEGRATION SERVICE
// Bridges existing memory modules with Soul Memory System
// ===============================================

import { SoulMemorySystem } from "../../memory/SoulMemorySystem.js";
import {
  storeJournalEntry,
  retrieveJournalEntries,
} from "../../memory/journalMemory.js";
import { oracleMemoryRouter } from "../../memory/memoryRouter.js";
import { soulMemoryService } from "./soulMemoryService.js";
import { logger } from "../utils/logger.js";

export class MemoryIntegrationService {
  private soulMemorySystem?: SoulMemorySystem;

  constructor() {
    logger.info("Memory Integration Service initialized");
  }

  // ===============================================
  // JOURNAL INTEGRATION
  // ===============================================

  async storeJournalEntryIntegrated(
    userId: string,
    content: string,
    symbols: string[] = [],
    metadata?: {
      element?: string;
      spiralPhase?: string;
      shadowContent?: boolean;
    },
  ) {
    try {
      // Store in both traditional Supabase journal and Soul Memory
      const [supabaseResult, soulMemoryResult] = await Promise.all([
        storeJournalEntry(userId, content, symbols),
        soulMemoryService.storeJournalEntry(userId, content, {
          element: metadata?.element || "water",
          spiralPhase: metadata?.spiralPhase,
          shadowContent:
            metadata?.shadowContent || this.detectShadowContent(content),
          symbols: symbols.join(", "),
        }),
      ]);

      logger.info(`Journal entry stored in both systems for user: ${userId}`);

      return {
        supabaseEntry: supabaseResult,
        soulMemory: soulMemoryResult,
        unified: true,
      };
    } catch (error) {
      logger.error("Error storing integrated journal entry:", error);
      throw error;
    }
  }

  async retrieveJournalEntriesIntegrated(userId: string) {
    try {
      // Get from both systems and merge
      const [supabaseEntries, soulMemoryEntries] = await Promise.all([
        retrieveJournalEntries(userId),
        soulMemoryService.getUserMemories(userId, {
          type: "journal_entry",
          limit: 50,
        }),
      ]);

      // Merge and deduplicate entries
      const mergedEntries = this.mergeJournalEntries(
        supabaseEntries,
        soulMemoryEntries,
      );

      return {
        entries: mergedEntries,
        supabaseCount: supabaseEntries?.length || 0,
        soulMemoryCount: soulMemoryEntries.length,
        total: mergedEntries.length,
      };
    } catch (error) {
      logger.error("Error retrieving integrated journal entries:", error);
      throw error;
    }
  }

  // ===============================================
  // ORACLE MEMORY ROUTING INTEGRATION
  // ===============================================

  async processOracleMemoryQuery(input: string, userId: string) {
    try {
      // Use traditional memory router for symbolic interpretation
      const traditionalResult = await oracleMemoryRouter(input, userId);

      // Use Soul Memory for semantic search
      const soulMemoryResults = await soulMemoryService.searchMemories(
        userId,
        input,
        {
          topK: 5,
          includeArchetypal: true,
        },
      );

      // Combine results with Soul Memory taking priority
      const combinedResults = this.combineMemoryResults(
        traditionalResult,
        soulMemoryResults,
      );

      return {
        results: combinedResults,
        source: "integrated",
        traditional: traditionalResult,
        soulMemory: soulMemoryResults,
      };
    } catch (error) {
      logger.error("Error processing oracle memory query:", error);
      throw error;
    }
  }

  // ===============================================
  // MIGRATION UTILITIES
  // ===============================================

  async migrateExistingJournalsToSoulMemory(userId: string) {
    try {
      logger.info(`Starting journal migration for user: ${userId}`);

      // Get all existing journal entries from Supabase
      const existingEntries = await retrieveJournalEntries(userId);

      if (!existingEntries || existingEntries.length === 0) {
        logger.info("No existing journal entries to migrate");
        return { migrated: 0 };
      }

      let migratedCount = 0;

      // Migrate each entry to Soul Memory
      for (const entry of existingEntries) {
        try {
          await soulMemoryService.storeJournalEntry(userId, entry.content, {
            element: this.detectElementFromContent(entry.content),
            shadowContent: this.detectShadowContent(entry.content),
            symbols: entry.symbols?.join(", "),
            migrated: true,
            originalTimestamp: entry.created_at,
          });

          migratedCount++;
        } catch (entryError) {
          logger.error(
            `Error migrating journal entry ${entry.id}:`,
            entryError,
          );
        }
      }

      logger.info(
        `Successfully migrated ${migratedCount} journal entries for user: ${userId}`,
      );

      return {
        migrated: migratedCount,
        total: existingEntries.length,
        success: true,
      };
    } catch (error) {
      logger.error("Error during journal migration:", error);
      throw error;
    }
  }

  // ===============================================
  // UNIFIED MEMORY SEARCH
  // ===============================================

  async searchUnifiedMemory(
    userId: string,
    query: string,
    options?: {
      includeJournals?: boolean;
      includeOracleExchanges?: boolean;
      includeSacredMoments?: boolean;
      limit?: number;
    },
  ) {
    try {
      const searchPromises = [];

      // Search Soul Memory System
      searchPromises.push(
        soulMemoryService.searchMemories(userId, query, {
          topK: options?.limit || 10,
          memoryTypes: this.getMemoryTypesFromOptions(options),
        }),
      );

      // Search traditional oracle memory router
      searchPromises.push(this.processOracleMemoryQuery(query, userId));

      const [soulMemoryResults, oracleRouterResults] =
        await Promise.all(searchPromises);

      // Combine and rank results
      const unifiedResults = this.rankUnifiedResults([
        ...soulMemoryResults,
        ...oracleRouterResults.results,
      ]);

      return {
        results: unifiedResults,
        sources: {
          soulMemory: soulMemoryResults.length,
          oracleRouter: oracleRouterResults.results.length,
        },
        query,
        unified: true,
      };
    } catch (error) {
      logger.error("Error in unified memory search:", error);
      throw error;
    }
  }

  // ===============================================
  // HELPER METHODS
  // ===============================================

  private detectShadowContent(content: string): boolean {
    const shadowKeywords = [
      "anger",
      "hate",
      "shame",
      "fear",
      "jealous",
      "resentment",
      "dark",
      "shadow",
      "avoid",
      "hide",
      "deny",
      "suppress",
    ];

    const lowerContent = content.toLowerCase();
    return shadowKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  private detectElementFromContent(content: string): string {
    const elementKeywords = {
      fire: ["passion", "energy", "action", "anger", "drive", "power"],
      water: ["emotion", "flow", "feeling", "tears", "heart", "love"],
      earth: ["body", "ground", "stable", "practical", "solid", "root"],
      air: ["thought", "mind", "clarity", "breath", "idea", "mental"],
      aether: ["spirit", "transcend", "unity", "divine", "sacred", "mystical"],
    };

    const lowerContent = content.toLowerCase();

    for (const [element, keywords] of Object.entries(elementKeywords)) {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        return element;
      }
    }

    return "aether"; // Default element
  }

  private mergeJournalEntries(
    supabaseEntries: any[],
    soulMemoryEntries: any[],
  ): any[] {
    // Create a map to avoid duplicates based on content similarity
    const mergedMap = new Map();

    // Add Supabase entries
    supabaseEntries?.forEach((entry) => {
      const key = this.createContentKey(entry.content);
      mergedMap.set(key, {
        ...entry,
        source: "supabase",
        timestamp: new Date(entry.created_at),
      });
    });

    // Add Soul Memory entries (with higher priority)
    soulMemoryEntries.forEach((entry) => {
      const key = this.createContentKey(entry.content);
      mergedMap.set(key, {
        ...entry,
        source: "soul_memory",
        timestamp: entry.timestamp,
      });
    });

    return Array.from(mergedMap.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  private createContentKey(content: string): string {
    // Create a key based on first 50 characters for deduplication
    return content.substring(0, 50).toLowerCase().replace(/\s+/g, "");
  }

  private combineMemoryResults(traditional: any[], soulMemory: any[]): any[] {
    // Soul Memory results take priority
    const combined = [...soulMemory];

    // Add traditional results that don't overlap
    traditional.forEach((trad) => {
      const overlap = soulMemory.some(
        (soul) =>
          this.createContentKey(soul.content) ===
          this.createContentKey(trad.content),
      );

      if (!overlap) {
        combined.push({
          ...trad,
          source: "traditional",
        });
      }
    });

    return combined;
  }

  private getMemoryTypesFromOptions(options?: any): string[] {
    const types = [];

    if (options?.includeJournals) types.push("journal_entry");
    if (options?.includeOracleExchanges) types.push("oracle_exchange");
    if (options?.includeSacredMoments) {
      types.push("ritual_moment", "breakthrough", "sacred_pause");
    }

    return types.length > 0 ? types : undefined;
  }

  private rankUnifiedResults(results: any[]): any[] {
    // Simple ranking: Soul Memory results first, then by timestamp
    return results.sort((a, b) => {
      // Prioritize Soul Memory results
      if (a.source === "soul_memory" && b.source !== "soul_memory") return -1;
      if (b.source === "soul_memory" && a.source !== "soul_memory") return 1;

      // Then by timestamp
      const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
      const timeB = new Date(b.timestamp || b.created_at || 0).getTime();

      return timeB - timeA;
    });
  }

  // ===============================================
  // INITIALIZATION
  // ===============================================

  async initialize(userId: string) {
    try {
      // Check if user needs migration
      const existingEntries = await retrieveJournalEntries(userId);
      const soulMemoryEntries = await soulMemoryService.getUserMemories(
        userId,
        {
          type: "journal_entry",
        },
      );

      // If user has Supabase entries but no Soul Memory entries, migrate
      if (existingEntries?.length > 0 && soulMemoryEntries.length === 0) {
        logger.info(`Auto-migrating journals for user: ${userId}`);
        await this.migrateExistingJournalsToSoulMemory(userId);
      }

      return {
        initialized: true,
        migrationPerformed:
          existingEntries?.length > 0 && soulMemoryEntries.length === 0,
      };
    } catch (error) {
      logger.error("Error initializing memory integration:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const memoryIntegrationService = new MemoryIntegrationService();
export default memoryIntegrationService;
