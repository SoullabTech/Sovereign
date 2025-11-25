/**
 * Call MAIA Imaginal API with Streaming
 *
 * Sends conversation history to MAIA and receives streaming response
 * for natural, breathing conversation
 */

import type { ChatMessage, PlanetPlacement } from '@/types/astrology';

export async function callMaiaImaginal(
  messages: ChatMessage[],
  placements: PlanetPlacement[],
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log('[callMaiaImaginal] POST /api/imaginal/session (streaming)');

  const response = await fetch('/api/imaginal/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      placements,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MAIA API error: ${response.status} ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }

  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      // Optional: Call chunk callback for live typing effect
      if (onChunk) {
        onChunk(chunk);
      }
    }
  } finally {
    reader.releaseLock();
  }

  console.log(`[callMaiaImaginal] Stream complete (${fullText.length} chars)`);
  return fullText.trim();
}
