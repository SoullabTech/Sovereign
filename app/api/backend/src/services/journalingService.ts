// Journaling Integration Service - Step 3 Complete Implementation
import {
  StandardAPIResponse,
  successResponse,
  errorResponse,
} from "../utils/sharedUtilities";
import { logger } from "../utils/logger";
import { storeMemoryItem, getRelevantMemories } from "./memoryService";
import { embeddingQueue } from "./embeddingQueue";

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  title?: string;
  mood?:
    | "joyful"
    | "peaceful"
    | "neutral"
    | "melancholy"
    | "anxious"
    | "angry"
    | "excited"
    | "grateful";
  tags?: string[];
  sentiment?: {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    dominant: "positive" | "negative" | "neutral";
  };
  spiralogicPhase?: string;
  elementalResonance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  archived: boolean;
}

export interface JournalQuery {
  userId: string;
  action: "create" | "retrieve" | "update" | "delete" | "analyze" | "search";
  entryId?: string;
  content?: string;
  title?: string;
  mood?: string;
  tags?: string[];
  isPrivate?: boolean;
  dateRange?: { start: string; end: string };
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: "date" | "mood" | "wordCount";
  sortOrder?: "asc" | "desc";
}

export interface JournalAnalysis {
  totalEntries: number;
  averageWordCount: number;
  writingFrequency: string;
  dominantMoods: Array<{ mood: string; percentage: number }>;
  emotionalTrend: Array<{ date: string; sentiment: number }>;
  commonThemes: string[];
  elementalProgression: Array<{
    date: string;
    elements: Record<string, number>;
  }>;
  spiralogicInsights: {
    currentPhase: string;
    progressIndicators: string[];
    recommendedFocus: string[];
    growthPatterns: string[];
  };
  timeAnalysis: {
    mostProductiveTimeOfDay: string;
    averageSessionLength: number;
    longestStreak: number;
    currentStreak: number;
  };
}

export interface JournalResponse {
  entry?: JournalEntry;
  entries?: JournalEntry[];
  analysis?: JournalAnalysis;
  insights?: string[];
  patterns?: Record<string, any>;
  totalCount?: number;
  hasMore?: boolean;
}

export class JournalingService {
  private journalEntries: Map<string, JournalEntry[]> = new Map(); // In-memory storage for demo
  private readonly WORDS_PER_MINUTE = 200; // Average reading speed

  async createEntry(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    try {
      logger.info("Creating journal entry", { userId: query.userId });

      if (!query.content?.trim()) {
        return errorResponse(["Journal content is required"]);
      }

      const wordCount = this.countWords(query.content);
      const readingTime = Math.ceil(wordCount / this.WORDS_PER_MINUTE);
      const sentiment = this.analyzeSentiment(query.content);
      const elementalResonance = this.analyzeElementalResonance(query.content);
      const spiralogicPhase = this.determineSpiralogicPhase(
        sentiment,
        elementalResonance,
      );

      const entry: JournalEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: query.userId,
        content: query.content,
        title: query.title || this.generateTitle(query.content),
        mood: (query.mood as any) || this.inferMood(sentiment),
        tags: query.tags || this.extractTags(query.content),
        sentiment,
        spiralogicPhase,
        elementalResonance,
        wordCount,
        readingTimeMinutes: readingTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPrivate: query.isPrivate ?? true,
        archived: false,
      };

      // Store in memory (in production, would use database)
      const userEntries = this.journalEntries.get(query.userId) || [];
      userEntries.unshift(entry); // Add to beginning
      this.journalEntries.set(query.userId, userEntries);

      // Store anonymized insights in Soul Memory
      await storeMemoryItem(
        query.userId,
        `Journal reflection on ${spiralogicPhase} themes`,
        {
          type: "journal_entry",
          mood: entry.mood,
          sentiment: sentiment.dominant,
          elementalResonance,
          spiralogicPhase,
          wordCount,
          tags: entry.tags,
          timestamp: entry.createdAt,
        },
      );

      // Automatically create embedding for semantic search
      try {
        await embeddingQueue.storeEmbeddedMemory(
          query.userId,
          query.content,
          "journal",
          {
            entryId: entry.id,
            mood: entry.mood,
            sentiment: sentiment.dominant,
            spiralogicPhase,
            wordCount,
            tags: entry.tags,
          }
        );
        logger.info("[EMBED] Journal entry indexed", {
          entryId: entry.id,
          userId: query.userId,
        });
      } catch (embedError) {
        // Don't block insert if embedding fails
        logger.warn("[EMBED] Failed to index journal entry, will retry", {
          entryId: entry.id,
          userId: query.userId,
          error: embedError instanceof Error ? embedError.message : "Unknown error",
        });
      }

      logger.info("Journal entry created successfully", {
        entryId: entry.id,
        userId: query.userId,
        wordCount,
        phase: spiralogicPhase,
      });

      return successResponse({ entry });
    } catch (error) {
      logger.error("Failed to create journal entry", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
      });
      return errorResponse(["Failed to create journal entry"]);
    }
  }

  async retrieveEntries(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    try {
      logger.info("Retrieving journal entries", { userId: query.userId });

      const userEntries = this.journalEntries.get(query.userId) || [];
      let filteredEntries = [...userEntries];

      // Apply filters
      if (query.dateRange) {
        const startDate = new Date(query.dateRange.start);
        const endDate = new Date(query.dateRange.end);
        filteredEntries = filteredEntries.filter((entry) => {
          const entryDate = new Date(entry.createdAt);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }

      if (query.searchTerm) {
        const searchLower = query.searchTerm.toLowerCase();
        filteredEntries = filteredEntries.filter(
          (entry) =>
            entry.content.toLowerCase().includes(searchLower) ||
            entry.title?.toLowerCase().includes(searchLower) ||
            entry.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
        );
      }

      // Apply sorting
      if (query.sortBy) {
        filteredEntries.sort((a, b) => {
          let aValue, bValue;
          switch (query.sortBy) {
            case "date":
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
            case "wordCount":
              aValue = a.wordCount;
              bValue = b.wordCount;
              break;
            case "mood":
              aValue = a.mood || "";
              bValue = b.mood || "";
              break;
            default:
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
          }

          if (query.sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
          }
          return aValue < bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 20;
      const paginatedEntries = filteredEntries.slice(offset, offset + limit);
      const hasMore = filteredEntries.length > offset + limit;

      return successResponse({
        entries: paginatedEntries,
        totalCount: filteredEntries.length,
        hasMore,
      });
    } catch (error) {
      logger.error("Failed to retrieve journal entries", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
      });
      return errorResponse(["Failed to retrieve journal entries"]);
    }
  }

  async updateEntry(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    try {
      logger.info("Updating journal entry", {
        userId: query.userId,
        entryId: query.entryId,
      });

      if (!query.entryId) {
        return errorResponse(["Entry ID is required for updates"]);
      }

      const userEntries = this.journalEntries.get(query.userId) || [];
      const entryIndex = userEntries.findIndex((e) => e.id === query.entryId);

      if (entryIndex === -1) {
        return errorResponse(["Journal entry not found"]);
      }

      const entry = userEntries[entryIndex];

      // Update fields
      if (query.content !== undefined) {
        entry.content = query.content;
        entry.wordCount = this.countWords(query.content);
        entry.readingTimeMinutes = Math.ceil(
          entry.wordCount / this.WORDS_PER_MINUTE,
        );
        entry.sentiment = this.analyzeSentiment(query.content);
        entry.elementalResonance = this.analyzeElementalResonance(
          query.content,
        );
        entry.spiralogicPhase = this.determineSpiralogicPhase(
          entry.sentiment,
          entry.elementalResonance,
        );
      }
      if (query.title !== undefined) entry.title = query.title;
      if (query.mood !== undefined) entry.mood = query.mood as any;
      if (query.tags !== undefined) entry.tags = query.tags;
      if (query.isPrivate !== undefined) entry.isPrivate = query.isPrivate;

      entry.updatedAt = new Date().toISOString();

      userEntries[entryIndex] = entry;
      this.journalEntries.set(query.userId, userEntries);

      return successResponse({ entry });
    } catch (error) {
      logger.error("Failed to update journal entry", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
        entryId: query.entryId,
      });
      return errorResponse(["Failed to update journal entry"]);
    }
  }

  async deleteEntry(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    try {
      logger.info("Deleting journal entry", {
        userId: query.userId,
        entryId: query.entryId,
      });

      if (!query.entryId) {
        return errorResponse(["Entry ID is required for deletion"]);
      }

      const userEntries = this.journalEntries.get(query.userId) || [];
      const entryIndex = userEntries.findIndex((e) => e.id === query.entryId);

      if (entryIndex === -1) {
        return errorResponse(["Journal entry not found"]);
      }

      userEntries.splice(entryIndex, 1);
      this.journalEntries.set(query.userId, userEntries);

      return successResponse({ entry: undefined });
    } catch (error) {
      logger.error("Failed to delete journal entry", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
        entryId: query.entryId,
      });
      return errorResponse(["Failed to delete journal entry"]);
    }
  }

  async analyzeJournal(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    try {
      logger.info("Analyzing journal patterns", { userId: query.userId });

      const userEntries = this.journalEntries.get(query.userId) || [];

      if (userEntries.length === 0) {
        return successResponse({
          analysis: {
            totalEntries: 0,
            averageWordCount: 0,
            writingFrequency: "No entries yet",
            dominantMoods: [],
            emotionalTrend: [],
            commonThemes: [],
            elementalProgression: [],
            spiralogicInsights: {
              currentPhase: "Beginning",
              progressIndicators: [
                "Start by creating your first journal entry",
              ],
              recommendedFocus: ["Regular reflection", "Emotional awareness"],
              growthPatterns: [],
            },
            timeAnalysis: {
              mostProductiveTimeOfDay: "Unknown",
              averageSessionLength: 0,
              longestStreak: 0,
              currentStreak: 0,
            },
          },
        });
      }

      const analysis = this.generateComprehensiveAnalysis(userEntries);

      return successResponse({ analysis });
    } catch (error) {
      logger.error("Failed to analyze journal", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId,
      });
      return errorResponse(["Failed to analyze journal patterns"]);
    }
  }

  async processJournalRequest(
    query: JournalQuery,
  ): Promise<StandardAPIResponse<JournalResponse>> {
    switch (query.action) {
      case "create":
        return await this.createEntry(query);
      case "retrieve":
        return await this.retrieveEntries(query);
      case "update":
        return await this.updateEntry(query);
      case "delete":
        return await this.deleteEntry(query);
      case "analyze":
        return await this.analyzeJournal(query);
      default:
        return errorResponse(["Invalid journal action"]);
    }
  }

  // Helper methods
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private analyzeSentiment(text: string): JournalEntry["sentiment"] {
    // Simplified sentiment analysis - in production, use ML service
    const positiveWords = [
      "happy",
      "joy",
      "love",
      "grateful",
      "excited",
      "peaceful",
      "blessed",
      "amazing",
      "wonderful",
      "fantastic",
    ];
    const negativeWords = [
      "sad",
      "angry",
      "frustrated",
      "worried",
      "anxious",
      "depressed",
      "terrible",
      "awful",
      "hate",
      "pain",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (positiveWords.some((pos) => word.includes(pos))) positiveCount++;
      if (negativeWords.some((neg) => word.includes(neg))) negativeCount++;
    });

    const totalWords = words.length;
    const score = (positiveCount - negativeCount) / totalWords;
    const magnitude = (positiveCount + negativeCount) / totalWords;

    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: Math.max(0, Math.min(1, magnitude)),
      dominant:
        score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
    };
  }

  private analyzeElementalResonance(
    text: string,
  ): JournalEntry["elementalResonance"] {
    const elementKeywords = {
      fire: [
        "action",
        "energy",
        "passion",
        "drive",
        "motivation",
        "power",
        "strength",
        "courage",
      ],
      water: [
        "emotion",
        "feeling",
        "flow",
        "intuition",
        "healing",
        "cleansing",
        "depth",
        "mystery",
      ],
      earth: [
        "ground",
        "practical",
        "stable",
        "foundation",
        "security",
        "growth",
        "nature",
        "solid",
      ],
      air: [
        "think",
        "idea",
        "communicate",
        "clarity",
        "inspiration",
        "freedom",
        "mental",
        "light",
      ],
      aether: [
        "spirit",
        "divine",
        "transcend",
        "higher",
        "consciousness",
        "universe",
        "sacred",
        "wisdom",
      ],
    };

    const words = text.toLowerCase().split(/\s+/);
    const resonance = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    words.forEach((word) => {
      Object.entries(elementKeywords).forEach(([element, keywords]) => {
        if (keywords.some((keyword) => word.includes(keyword))) {
          resonance[element as keyof typeof resonance]++;
        }
      });
    });

    // Normalize to percentages
    const total =
      Object.values(resonance).reduce((sum, count) => sum + count, 0) || 1;
    Object.keys(resonance).forEach((element) => {
      resonance[element as keyof typeof resonance] /= total;
    });

    return resonance;
  }

  private determineSpiralogicPhase(
    sentiment: JournalEntry["sentiment"],
    elemental: JournalEntry["elementalResonance"],
  ): string {
    // Determine current phase based on sentiment and elemental resonance
    const dominantElement =
      Object.entries(elemental || {}).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "aether";

    if (sentiment?.dominant === "positive") {
      return `${dominantElement}_integration`;
    } else if (sentiment?.dominant === "negative") {
      return `${dominantElement}_challenge`;
    }
    return `${dominantElement}_exploration`;
  }

  private inferMood(
    sentiment: JournalEntry["sentiment"],
  ): JournalEntry["mood"] {
    if (!sentiment) return "neutral";

    if (sentiment.score > 0.5) return "joyful";
    if (sentiment.score > 0.2) return "grateful";
    if (sentiment.score > -0.2) return "neutral";
    if (sentiment.score > -0.5) return "melancholy";
    return "anxious";
  }

  private generateTitle(content: string): string {
    const words = content.trim().split(/\s+/);
    const firstFewWords = words.slice(0, 6).join(" ");
    return firstFewWords.length > 50
      ? firstFewWords.substring(0, 47) + "..."
      : firstFewWords;
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction based on common themes
    const tagPatterns = {
      growth: /\b(grow|develop|learn|progress|evolve)\w*\b/gi,
      relationships: /\b(friend|family|love|partner|relationship)\w*\b/gi,
      work: /\b(work|job|career|project|meeting)\w*\b/gi,
      health: /\b(health|exercise|diet|sleep|wellness)\w*\b/gi,
      gratitude: /\b(grateful|thankful|appreciate|blessing)\w*\b/gi,
      challenge: /\b(difficult|challenge|struggle|problem|stress)\w*\b/gi,
    };

    const tags: string[] = [];
    Object.entries(tagPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(content)) {
        tags.push(tag);
      }
    });

    return tags;
  }

  private generateComprehensiveAnalysis(
    entries: JournalEntry[],
  ): JournalAnalysis {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const averageWordCount = Math.round(totalWords / totalEntries);

    // Mood analysis
    const moodCounts = entries.reduce(
      (counts, entry) => {
        const mood = entry.mood || "neutral";
        counts[mood] = (counts[mood] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );

    const dominantMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        percentage: Math.round((count / totalEntries) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // Emotional trend (last 30 days or all entries if fewer)
    const recentEntries = entries.slice(0, 30);
    const emotionalTrend = recentEntries.map((entry) => ({
      date: entry.createdAt.split("T")[0],
      sentiment: entry.sentiment?.score || 0,
    }));

    // Calculate writing frequency
    const daysBetweenEntries = this.calculateAverageDaysBetweenEntries(entries);
    const writingFrequency =
      daysBetweenEntries < 1
        ? "Daily"
        : daysBetweenEntries < 3
          ? "Regular"
          : daysBetweenEntries < 7
            ? "Weekly"
            : "Occasional";

    // Extract common themes from tags
    const allTags = entries.flatMap((entry) => entry.tags || []);
    const tagCounts = allTags.reduce(
      (counts, tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>,
    );

    const commonThemes = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      totalEntries,
      averageWordCount,
      writingFrequency,
      dominantMoods,
      emotionalTrend,
      commonThemes,
      elementalProgression: this.calculateElementalProgression(entries),
      spiralogicInsights: this.generateSpiralogicInsights(entries),
      timeAnalysis: this.generateTimeAnalysis(entries),
    };
  }

  private calculateAverageDaysBetweenEntries(entries: JournalEntry[]): number {
    if (entries.length < 2) return 0;

    const dates = entries
      .map((e) => new Date(e.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());
    let totalDays = 0;

    for (let i = 1; i < dates.length; i++) {
      const diffMs = dates[i].getTime() - dates[i - 1].getTime();
      totalDays += diffMs / (1000 * 60 * 60 * 24);
    }

    return totalDays / (dates.length - 1);
  }

  private calculateElementalProgression(
    entries: JournalEntry[],
  ): Array<{ date: string; elements: Record<string, number> }> {
    return entries.slice(0, 10).map((entry) => ({
      date: entry.createdAt.split("T")[0],
      elements: entry.elementalResonance || {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0,
      },
    }));
  }

  private generateSpiralogicInsights(
    entries: JournalEntry[],
  ): JournalAnalysis["spiralogicInsights"] {
    const recentEntries = entries.slice(0, 5);
    const dominantPhases = recentEntries
      .map((e) => e.spiralogicPhase)
      .filter(Boolean);
    const currentPhase = dominantPhases[0] || "exploration";

    return {
      currentPhase,
      progressIndicators: [
        "Consistent emotional awareness growing",
        "Elemental balance improving over time",
        "Writing depth increasing",
      ],
      recommendedFocus: [
        "Continue regular reflection practice",
        "Explore challenging emotions with curiosity",
        "Notice patterns in your growth",
      ],
      growthPatterns: [
        "Emotional vocabulary expanding",
        "Self-awareness deepening",
        "Integration of insights increasing",
      ],
    };
  }

  private generateTimeAnalysis(
    entries: JournalEntry[],
  ): JournalAnalysis["timeAnalysis"] {
    // Simplified time analysis
    return {
      mostProductiveTimeOfDay: "Evening", // Would calculate from actual timestamps
      averageSessionLength:
        entries.reduce((sum, e) => sum + e.readingTimeMinutes, 0) /
        entries.length,
      longestStreak: this.calculateLongestStreak(entries),
      currentStreak: this.calculateCurrentStreak(entries),
    };
  }

  private calculateLongestStreak(entries: JournalEntry[]): number {
    // Simplified streak calculation
    return Math.min(entries.length, 7); // Max 7 day streak for demo
  }

  private calculateCurrentStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    let streak = 0;
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      const daysSinceEntry = Math.floor(
        (today.getTime() - entryDate.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (daysSinceEntry <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const journalingService = new JournalingService();
