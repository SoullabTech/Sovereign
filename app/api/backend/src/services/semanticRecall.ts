import { supabase } from "../lib/supabase";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function semanticSearch(query: string, userId: string, limit = 5) {
  try {
    const embeddingResp = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryVector = embeddingResp.data[0].embedding;

    const { data, error } = await supabase.rpc("match_embeddings", {
      query_embedding: queryVector,
      match_threshold: 0.75,
      match_count: limit,
      user_id: userId,
    });

    if (error) {
      console.error("[SEMANTIC] Search error:", error);
      return [];
    }

    console.log(
      `[SEMANTIC] Search for "${query.slice(0, 50)}..." returned ${data?.length || 0} results`
    );

    return data || [];
  } catch (error) {
    console.error("[SEMANTIC] Failed to generate embedding:", error);
    return [];
  }
}

export async function getRelevantMemories(
  transcript: string,
  userId: string,
  threshold = 0.78
): Promise<{ context: string; debug: any[] }> {
  try {
    const memories = await semanticSearch(transcript, userId, 3);
    
    // Prepare debug info for all retrieved memories
    const debugInfo = memories.map(m => ({
      id: m.id || `memory-${Date.now()}`,
      content: m.content,
      similarity: m.similarity,
      element: m.element || m.metadata?.element,
      phase: m.phase || m.metadata?.phase,
      injected: m.similarity >= threshold
    }));
    
    const relevantMemories = memories.filter(m => m.similarity >= threshold);
    
    if (!relevantMemories.length) {
      console.log("[SEMANTIC] No memories above threshold", threshold);
      return { context: "", debug: debugInfo };
    }

    const memoryContext = relevantMemories
      .map(m => {
        const similarity = (m.similarity * 100).toFixed(0);
        const preview = m.content.length > 100 
          ? m.content.slice(0, 100) + "..." 
          : m.content;
        
        return `[${similarity}% match, ${m.element || 'unknown'} element, ${m.phase || 'unknown'} phase]: "${preview}"`;
      })
      .join("\n\n");

    console.log(`[SEMANTIC] Injecting ${relevantMemories.length} memories into context`);
    
    const contextString = `\n🌀 Relevant past reflections from the user's journal:\n${memoryContext}\n`;
    
    return { context: contextString, debug: debugInfo };
  } catch (error) {
    console.error("[SEMANTIC] Failed to get relevant memories:", error);
    return { context: "", debug: [] };
  }
}