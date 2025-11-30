// oracle-backend/src/types/session.ts

import type { Metadata } from "./metadata";
import { supabase } from "../lib/supabaseClient";

/**
 * Represents a symbolic tag emitted during processing
 */
export interface SymbolicTag {
  symbol: string;
  agent: string;
  element?: string;
  facet?: string;
  phase?: string;
  timestamp?: string;
  confidence?: number;
}

/**
 * Represents a session of a user interacting with the system
 */
export interface Session {
  id: string;
  clientId: string;
  startTime: string;
  meta: Metadata;
  status: "active" | "completed";
  endTime?: string;
}

/**
 * Represents the statistics for user sessions
 */
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  lastSessionTime: string;
  clientId: string;
}

/**
 * Starts a new session for a user and stores session details.
 */
export async function startSession(
  clientId: string,
  metadata: Metadata,
): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        clientId,
        startTime: new Date().toISOString(),
        meta: metadata,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to start session");
  }

  return {
    id: data.id,
    clientId,
    startTime: data.startTime,
    meta: data.meta,
    status: data.status,
  };
}

/**
 * Ends an active session for a user and updates session status.
 */
export async function endSession(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .update({ status: "completed", endTime: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to end session");
  }

  return {
    id: data.id,
    clientId: data.clientId,
    startTime: data.startTime,
    meta: data.meta,
    status: data.status,
    endTime: data.endTime,
  };
}

/**
 * Retrieves session statistics, such as total active/completed sessions.
 */
export async function getSessionStats(clientId: string): Promise<SessionStats> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("clientId", clientId);

  if (error) {
    throw new Error(error?.message || "Failed to retrieve session stats");
  }

  const totalSessions = data.length;
  const activeSessions = data.filter(
    (session) => session.status === "active",
  ).length;
  const completedSessions = totalSessions - activeSessions;
  const lastSessionTime = data[totalSessions - 1]?.startTime || "";

  return {
    totalSessions,
    activeSessions,
    completedSessions,
    lastSessionTime,
    clientId,
  };
}
