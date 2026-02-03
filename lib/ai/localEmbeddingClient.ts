/**
 * LOCAL EMBEDDING CLIENT (Ollama)
 *
 * Generates embeddings using local Ollama instance.
 * Default model: nomic-embed-text (768 dimensions)
 */

export async function embedWithOllama(params: {
  text: string;
  model?: string;
  baseUrl?: string;
}): Promise<{ embedding: number[]; model: string }> {
  const baseUrl = params.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = params.model || process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

  const res = await fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: params.text }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Ollama embeddings failed (${res.status}): ${t}`);
  }

  const data = await res.json();
  const embedding = data?.embedding as number[] | undefined;

  if (!embedding?.length) {
    throw new Error('Ollama embeddings response missing embedding');
  }

  return { embedding, model };
}

/**
 * Batch embed multiple texts (sequential for now)
 */
export async function embedBatchWithOllama(params: {
  texts: string[];
  model?: string;
  baseUrl?: string;
}): Promise<{ embeddings: number[][]; model: string }> {
  const results: number[][] = [];
  let usedModel = '';

  for (const text of params.texts) {
    const { embedding, model } = await embedWithOllama({
      text,
      model: params.model,
      baseUrl: params.baseUrl,
    });
    results.push(embedding);
    usedModel = model;
  }

  return { embeddings: results, model: usedModel };
}
