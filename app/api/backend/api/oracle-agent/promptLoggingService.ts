import { createClient } from "@supabase/supabase-js";
import { SpiralogicPhase } from "./phaseRecognition";

interface PromptLogEntry {
  user_id: string;
  prompt_id?: string;
  prompt_text: string;
  phase: SpiralogicPhase;
  elemental_voice?: string;
  session_id?: string;
  context_tags?: string[];
}

interface PromptUsageStats {
  promptId: string;
  totalUses: number;
  uniqueUsers: number;
  avgQuality?: number;
  lastUsed: Date;
}

export class PromptLoggingService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Log when a prompt is served to a user
   */
  async logPromptUsage(entry: PromptLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from("prompt_insight_log").insert({
        user_id: entry.user_id,
        prompt_id: entry.prompt_id,
        prompt_text: entry.prompt_text,
        phase: entry.phase,
        elemental_voice: entry.elemental_voice,
        session_id: entry.session_id,
        context_tags: entry.context_tags,
        served_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Failed to log prompt usage:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in logPromptUsage:", error);
      // Don't throw - logging shouldn't break the main flow
    }
  }

  /**
   * Get user's prompt history for personalization
   */
  async getUserPromptHistory(userId: string, limit = 20): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("prompt_insight_log")
      .select("*")
      .eq("user_id", userId)
      .order("served_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch user prompt history:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get prompts that haven't been shown to a user recently
   */
  async getUnseenPrompts(
    userId: string,
    phase: SpiralogicPhase,
    days = 7,
  ): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get recently seen prompt IDs
    const { data: recentLogs } = await this.supabase
      .from("prompt_insight_log")
      .select("prompt_id")
      .eq("user_id", userId)
      .eq("phase", phase)
      .gte("served_at", cutoffDate.toISOString())
      .not("prompt_id", "is", null);

    const seenPromptIds = recentLogs?.map((log) => log.prompt_id) || [];

    // Get all prompts for this phase that haven't been seen
    const { data: unseenPrompts } = await this.supabase
      .from("spiralogic_prompts")
      .select("id, prompt")
      .eq("phase", phase)
      .not("id", "in", `(${seenPromptIds.join(",")})`);

    return unseenPrompts?.map((p) => p.prompt) || [];
  }

  /**
   * Record user feedback on prompt quality
   */
  async recordPromptFeedback(
    userId: string,
    promptLogId: string,
    quality: number,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("prompt_insight_log")
      .update({ response_quality: quality })
      .eq("id", promptLogId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to record prompt feedback:", error);
      throw error;
    }
  }

  /**
   * Get analytics on prompt usage
   */
  async getPromptAnalytics(phase?: SpiralogicPhase): Promise<any[]> {
    let query = this.supabase
      .from("prompt_usage_analytics")
      .select("*")
      .order("total_uses", { ascending: false });

    if (phase) {
      query = query.eq("phase", phase);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch prompt analytics:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get trending prompts based on recent usage and quality
   */
  async getTrendingPrompts(hours = 24, minQuality = 3.5): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const { data, error } = await this.supabase
      .from("prompt_insight_log")
      .select(
        `
        prompt_id,
        prompt_text,
        phase,
        elemental_voice,
        count:prompt_id.count(),
        avg_quality:response_quality.avg()
      `,
      )
      .gte("served_at", cutoffDate.toISOString())
      .gte("response_quality", minQuality)
      .group("prompt_id, prompt_text, phase, elemental_voice")
      .order("count", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch trending prompts:", error);
      return [];
    }

    return data || [];
  }
}
