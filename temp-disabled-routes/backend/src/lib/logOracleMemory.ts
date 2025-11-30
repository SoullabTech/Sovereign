import { supabase } from "./supabaseClient";

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
  const { userId, ...rest } = input;

  const { error } = await supabase.from("oracle_memories").insert([
    {
      user_id: userId,
      ...rest,
    },
  ]);

  if (error) {
    console.error("🛑 Failed to log Oracle memory:", error);
  } else {
    console.log("✅ Oracle memory logged successfully");
  }
}
