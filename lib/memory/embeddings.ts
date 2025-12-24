/**
 * LOCAL EMBEDDINGS VIA OLLAMA
 *
 * Sovereignty-compliant embedding generation using local Ollama.
 * Used for semantic memory search and contextual retrieval.
 *
 * Model: nomic-embed-text (efficient, fast, local)
 */

export async function generateLocalEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',  // Efficient local embedding model
        prompt: text.substring(0, 8000),  // Limit context length
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('[SOVEREIGNTY] Local embedding error:', error);
    console.warn('[SOVEREIGNTY] Falling back to zero vector (semantic search disabled)');
    return [];  // Graceful degradation - semantic search won't work but system continues
  }
}
