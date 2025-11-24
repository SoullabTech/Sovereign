// src/services/sessionService.ts

import { createClient } from "@supabase/supabase-js";
import { config } from "../../config/index";

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

export class SessionService {
  // Create a new session
  async createSession(userId: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.from("sessions").insert([
      {
        user_id: userId,
        started_at: new Date().toISOString(),
        status: "active",
        metadata: metadata || {},
      },
    ]);

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  // End an existing session
  async endSession(sessionId: string, userId: string) {
    const { data, error } = await supabase
      .from("sessions")
      .update({
        ended_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to end session: ${error.message}`);
    }

    return data;
  }

  // Get session stats for a user
  async getSessionStats(userId: string, startDate?: Date, endDate?: Date) {
    let query = supabase.from("sessions").select("*").eq("user_id", userId);

    if (startDate) {
      query = query.gte("started_at", startDate.toISOString());
    }

    if (endDate) {
      query = query.lte("started_at", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get session stats: ${error.message}`);
    }

    const totalSessions = data.length;
    const activeSessions = data.filter(
      (session) => session.status === "active",
    ).length;
    const completedSessions = data.filter(
      (session) => session.status === "completed",
    ).length;
    const lastSessionTime =
      data.length > 0 ? data[data.length - 1].started_at : null;

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      lastSessionTime,
    };
  }
}
