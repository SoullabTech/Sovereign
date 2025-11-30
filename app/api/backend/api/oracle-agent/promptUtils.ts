import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { SpiralogicPhase } from "./phaseRecognition";
import { PromptLoggingService } from "./promptLoggingService";

interface PromptWithMetadata {
  id?: string;
  prompt: string;
  phase: SpiralogicPhase;
  elemental_voice?: string;
  context_tags?: string[];
  source?: "file" | "database";
}

export class PromptManager {
  private supabase;
  private loggingService: PromptLoggingService;
  private cache: Map<string, PromptWithMetadata[]> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.loggingService = new PromptLoggingService(supabaseUrl, supabaseKey);
  }

  /**
   * Get prompts for a phase from file or database
   */
  async getPromptsForPhase(
    phase: SpiralogicPhase,
    options?: {
      preferDatabase?: boolean;
      includeMetadata?: boolean;
      userId?: string;
      avoidRecent?: boolean;
    },
  ): Promise<PromptWithMetadata[]> {
    const {
      preferDatabase = true,
      includeMetadata = true,
      userId,
      avoidRecent = false,
    } = options || {};

    // Check cache first
    const cacheKey = `${phase}-${preferDatabase}`;
    if (
      this.cache.has(cacheKey) &&
      Date.now() - this.lastCacheUpdate < this.cacheExpiry
    ) {
      return this.cache.get(cacheKey)!;
    }

    let prompts: PromptWithMetadata[] = [];

    if (preferDatabase) {
      prompts = await this.getPromptsFromDatabase(phase);
      if (prompts.length === 0) {
        // Fallback to file if database is empty
        prompts = await this.getPromptsFromFile(phase);
      }
    } else {
      prompts = await this.getPromptsFromFile(phase);
    }

    // Filter out recently seen prompts if requested
    if (userId && avoidRecent) {
      const unseenPrompts = await this.loggingService.getUnseenPrompts(
        userId,
        phase,
      );
      prompts = prompts.filter((p) => unseenPrompts.includes(p.prompt));
    }

    // Update cache
    this.cache.set(cacheKey, prompts);
    this.lastCacheUpdate = Date.now();

    return includeMetadata
      ? prompts
      : prompts.map((p) => ({ prompt: p.prompt, phase, source: p.source }));
  }

  /**
   * Get prompts from Supabase database
   */
  private async getPromptsFromDatabase(
    phase: SpiralogicPhase,
  ): Promise<PromptWithMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from("spiralogic_prompts")
        .select("*")
        .eq("phase", phase)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch prompts from database:", error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.id,
        prompt: item.prompt,
        phase: item.phase,
        elemental_voice: item.elemental_voice,
        context_tags: item.context_tags,
        source: "database" as const,
      }));
    } catch (error) {
      console.error("Error fetching from database:", error);
      return [];
    }
  }

  /**
   * Get prompts from JSON file
   */
  private async getPromptsFromFile(
    phase: SpiralogicPhase,
  ): Promise<PromptWithMetadata[]> {
    try {
      const filePath = path.resolve(
        __dirname,
        "prompts",
        `${phase.toLowerCase()}.json`,
      );
      const data = await fs.readFile(filePath, "utf-8");
      const prompts = JSON.parse(data);

      return prompts.map((prompt: string) => ({
        prompt,
        phase,
        source: "file" as const,
      }));
    } catch (error) {
      console.error(
        `Failed to read prompts from file for phase ${phase}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Get a random prompt for a phase and log its usage
   */
  async getRandomPromptAndLog(
    phase: SpiralogicPhase,
    userId: string,
    sessionId?: string,
    options?: {
      avoidRecent?: boolean;
      elementalVoice?: string;
      contextTags?: string[];
    },
  ): Promise<PromptWithMetadata | null> {
    const prompts = await this.getPromptsForPhase(phase, {
      userId,
      avoidRecent: options?.avoidRecent,
    });

    if (prompts.length === 0) return null;

    // Filter by elemental voice or tags if specified
    let filteredPrompts = prompts;
    if (options?.elementalVoice) {
      filteredPrompts = prompts.filter(
        (p) => p.elemental_voice === options.elementalVoice,
      );
    }
    if (options?.contextTags && options.contextTags.length > 0) {
      filteredPrompts = filteredPrompts.filter((p) =>
        p.context_tags?.some((tag) => options.contextTags!.includes(tag)),
      );
    }

    // Fallback to all prompts if filters are too restrictive
    if (filteredPrompts.length === 0) {
      filteredPrompts = prompts;
    }

    // Select random prompt
    const selectedPrompt =
      filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];

    // Log the usage
    await this.loggingService.logPromptUsage({
      user_id: userId,
      prompt_id: selectedPrompt.id,
      prompt_text: selectedPrompt.prompt,
      phase,
      elemental_voice:
        selectedPrompt.elemental_voice || options?.elementalVoice,
      session_id: sessionId,
      context_tags: selectedPrompt.context_tags || options?.contextTags,
    });

    return selectedPrompt;
  }

  /**
   * Search prompts by keywords or tags
   */
  async searchPrompts(
    query: string,
    phase?: SpiralogicPhase,
  ): Promise<PromptWithMetadata[]> {
    let dbQuery = this.supabase.from("spiralogic_prompts").select("*");

    // Search in prompt text
    dbQuery = dbQuery.textSearch("prompt", query);

    if (phase) {
      dbQuery = dbQuery.eq("phase", phase);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Failed to search prompts:", error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      prompt: item.prompt,
      phase: item.phase,
      elemental_voice: item.elemental_voice,
      context_tags: item.context_tags,
      source: "database" as const,
    }));
  }

  /**
   * Get analytics for prompts
   */
  async getPromptAnalytics(phase?: SpiralogicPhase) {
    return this.loggingService.getPromptAnalytics(phase);
  }

  /**
   * Get trending prompts
   */
  async getTrendingPrompts(hours = 24) {
    return this.loggingService.getTrendingPrompts(hours);
  }
}

// Legacy function for backward compatibility
export async function getPromptForPhase(
  phase: SpiralogicPhase,
): Promise<string[]> {
  const filePath = path.resolve(
    __dirname,
    "prompts",
    `${phase.toLowerCase()}.json`,
  );
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}
