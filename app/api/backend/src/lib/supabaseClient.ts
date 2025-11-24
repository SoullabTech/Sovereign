export { supabase } from "./supabase";

import { supabase } from "./supabase";
import { logger } from "../utils/logger";
// Create error helper - simplified for build fix
function createError(message: string, status: number) {
  const error = new Error(message) as any;
  error.statusCode = status;
  return error;
}

interface JournalEntry {
  userId: string;
  content: string;
  type: "dream" | "insight" | "ritual" | "journal";
  symbols: string[];
  timestamp: string;
  elementalTag?: "fire" | "water" | "earth" | "air" | "aether";
  archetypeTag?: string;
  petalSnapshot?: Record<string, number>;
}

export async function saveJournalEntry(entry: JournalEntry) {
  const payload = {
    user_id: entry.userId,
    content: entry.content,
    type: entry.type,
    symbols: entry.symbols,
    timestamp: entry.timestamp,
    elemental_tag: entry.elementalTag,
    archetype_tag: entry.archetypeTag,
    metadata: entry.petalSnapshot
      ? { petalSnapshot: entry.petalSnapshot }
      : null,
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert([payload]);

  if (error) {
    logger.error(`Failed to save journal entry: ${error.message}`);
    throw createError("Failed to save journal entry", 500);
  }

  return data;
}

export async function getJournalEntries(userId: string) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error) {
    logger.error(`Failed to fetch journal entries: ${error.message}`);
    throw createError("Failed to fetch journal entries", 500);
  }

  return data;
}

export async function getSymbolThreads(userId: string) {
  const { data, error } = await supabase
    .from("oracle_memories")
    .select("*")
    .eq("userId", userId)
    .order("timestamp", { ascending: false });

  if (error) {
    logger.error(`Failed to fetch memory threads: ${error.message}`);
    throw createError("Failed to fetch memory threads", 500);
  }

  return data;
}

export async function semanticSearch(userId: string, query: string) {
  const { data, error } = await supabase.rpc("semantic_memory_search", {
    user_id: userId,
    query_text: query,
  });

  if (error) {
    logger.error(`Semantic search failed: ${error.message}`);
    throw createError("Semantic search failed", 500);
  }

  return data;
}
