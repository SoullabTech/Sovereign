/**
 * LOCAL EMBEDDINGS VIA OLLAMA
 *
 * Sovereignty-compliant embedding generation using local Ollama.
 * Used for semantic memory search and contextual retrieval.
 *
 * Model: nomic-embed-text (efficient, fast, local)
 */

export async function generateLocalEmbedding(text: string): Promise<number[]> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const timeoutMs = Number(process.env.OLLAMA_EMBED_TIMEOUT_MS || 30000);

  try {
    const response = await fetch(`${ollamaUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',  // Efficient local embedding model
        prompt: text.substring(0, 8000),  // Limit context length
      }),
      signal: AbortSignal.timeout(timeoutMs),
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
