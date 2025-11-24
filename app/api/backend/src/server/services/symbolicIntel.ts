// 📁 File: src/lib/symbolicIntel.ts

import { supabase } from "./supabaseClient";
import { parseEmotions } from "./emotionParser";
import { matchSymbolsFromText } from "./symbolMatcher";

/**
 * Fetch symbolic motifs from a user's recent memory content.
 */
export async function fetchUserSymbols(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("memories")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    const allText = data.map((entry) => entry.content).join(" ");
    return matchSymbolsFromText(allText);
  } catch (err) {
    console.error("[SymbolicIntel] Error fetching symbols:", err);
    return [];
  }
}

/**
 * Fetch emotional tone based on user's memory content.
 */
export async function fetchEmotionalTone(
  userId: string,
): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("memories")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    const combinedText = data.map((entry) => entry.content).join(" ");
    return parseEmotions(combinedText);
  } catch (err) {
    console.error("[SymbolicIntel] Error parsing emotions:", err);
    return {};
  }
}
