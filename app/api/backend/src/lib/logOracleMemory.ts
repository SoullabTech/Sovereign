/**
 * Oracle Memory Logger - Stub
 *
 * NOTE: Supabase has been removed per project rules (CLAUDE.md).
 * Memory persistence now happens via /api/consciousness/memory/store
 * which writes to the conversation_turns table.
 */

interface OracleMemoryInput {
  userId: string;
  content: string;
  archetype?: string;
  element?: string;
  tone?: string;
  symbol?: string;
  card?: string;
  type:
    | "archetype"
    | "reflection"
    | "ritual"
    | "initiation"
    | "dream"
    | "message";
  tag?: string;
  emotion?: string;
  metadata?: Record<string, any>;
}

export async function logOracleMemory(input: OracleMemoryInput) {
  // Stub: Oracle memory logging is now handled by the consciousness memory system
  console.log("[logOracleMemory] Stub - memory logged (no-op):", {
    userId: input.userId,
    type: input.type,
    archetype: input.archetype,
  });
}
