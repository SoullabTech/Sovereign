import { Request } from "express";
import type { Metadata } from "./metadata";

// Export AgentResponse
export { AgentResponse } from "./agentResponse";

/**
 * Represents the authentication request payload
 */
export interface AuthRequest {
  email: string;
  password: string;
}

/**
 * Represents the authentication response including tokens and user information
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

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
 * Represents a stored memory item, either user query or agent response
 */
export interface MemoryItem {
  id: string;
  content: string;
  timestamp: number | string;
  clientId?: string;
  metadata?: Metadata & {
    symbols?: SymbolicTag[];
  };
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
 * User interface for interaction with authentication systems and memory tracking
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
}

/**
 * Represents the structure of the authenticated request
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Agent response type for oracle system - compatible with AIResponse
 */


// Optional re-exports
export * from "./auth";
export * from "./memory";
export * from "./session";
