// oracle-backend/src/types/memory.ts

import type { Metadata } from "./metadata";

/**
 * Represents a stored memory item, either user query or agent response.
 */
export interface MemoryItem {
  id: string;
  user_id: string;
  content: string;
  response?: string; // Added for backward compatibility
  element?: string;
  source_agent?: string;
  confidence?: number;
  metadata?: Record<string, any>; // You may substitute with Metadata if strongly typed
  timestamp: string;
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
