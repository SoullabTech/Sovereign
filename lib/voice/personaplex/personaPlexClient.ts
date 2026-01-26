/**
 * PersonaPlex Voice Client
 *
 * Thin client for calling PersonaPlex MLX voice rendering service.
 * This replaces OpenAI TTS with local, sovereign voice generation.
 *
 * ARCHITECTURE:
 * - MAIA-SOVEREIGN orchestrates (wisdom retrieval, sanctuary gates)
 * - PersonaPlex renders (voice generation from pre-built context)
 *
 * The client receives wisdom_directive from MaiaWisdomProvider.formatForPersonaPlex()
 * and passes it to PersonaPlex. PersonaPlex does NOT build its own wisdom.
 */

import type { VoiceContextPayload } from '../wisdom/MaiaWisdomProvider';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

/** Brevity guidance from relational stack */
export type PersonaPlexBrevity = 'brief' | 'moderate' | 'expansive';

export interface PersonaPlexRenderRequest {
  /** Text to render as speech */
  text: string;

  /** Pre-built persona directive from MaiaWisdomProvider.formatForPersonaPlex() (optional) */
  wisdomDirective?: string;

  /** MAIA voice mode (affects prosody) */
  mode: 'talk' | 'care' | 'note';

  /** Elemental context (for metadata) */
  element?: string | null;

  /** Sanctuary mode (no logging content) */
  sanctuary: boolean;

  /** Speed multiplier (0.5 - 2.0) */
  speed?: number;

  /** Brevity guidance from relational stack (shapes content cadence) */
  brevity?: PersonaPlexBrevity;
}

export interface PersonaPlexAudioChunk {
  /** Base64-encoded PCM audio (float32, 24kHz) */
  audioB64: string;

  /** Chunk index for ordering */
  index: number;

  /** Partial transcript (what's been said so far) */
  transcript?: string;

  /** Frame count for timing */
  frameCount?: number;
}

export interface PersonaPlexRenderResult {
  /** All audio chunks */
  chunks: PersonaPlexAudioChunk[];

  /** Full transcript */
  transcript: string;

  /** Response metadata */
  metadata: {
    mode: string;
    element?: string;
    sanctuary: boolean;
    totalFrames: number;
    durationMs: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

// PersonaPlex service URL (local Mac Studio or Docker container)
const PERSONAPLEX_URL = process.env.PERSONAPLEX_URL || 'http://localhost:8765';

// Timeout for render requests (voice generation can take time)
const RENDER_TIMEOUT_MS = 30000;

// ═══════════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════════

/**
 * Render text to speech using PersonaPlex.
 *
 * Returns audio chunks as they're generated (streaming).
 *
 * @param req Render request with text and wisdom context
 * @yields Audio chunks with base64-encoded PCM
 */
export async function* renderWithPersonaPlex(
  req: PersonaPlexRenderRequest
): AsyncGenerator<PersonaPlexAudioChunk> {
  // ── BREVITY DIRECTIVE ──
  // Shapes content cadence based on relational guidance.
  // Note: brief ≠ clipped. Brief = warm, low-pressure, orienting.
  const brevity = req.brevity ?? 'moderate';
  const brevityDirective =
    brevity === 'brief'
      ? 'Keep it to 1–2 short sentences. Ground first, then one gentle question.'
      : brevity === 'expansive'
      ? 'Allow 4–7 sentences if needed. Stay cohesive and spacious; avoid rushing.'
      : 'Use 2–4 sentences. Reflect, orient, then offer a next step.';

  // Combine wisdom + brevity directives (both optional, brevity always present)
  const personaDirective = [
    req.wisdomDirective?.trim(),
    brevityDirective,
  ].filter(Boolean).join('\n');

  // Build request payload for PersonaPlex service
  const payload: Record<string, unknown> = {
    text: req.text,
    voice_mode: req.mode,
    element: req.element,
    sanctuary: req.sanctuary,
    speed: req.speed ?? 1.0,
  };

  // Include combined persona directive (wisdom + brevity)
  if (personaDirective) {
    payload.wisdom_directive = personaDirective;
  }

  // If sanctuary, log minimal info only
  if (req.sanctuary) {
    console.log(`🎤 [PersonaPlex] Rendering (sanctuary mode, ${req.mode})`);
  } else {
    console.log(`🎤 [PersonaPlex] Rendering: ${req.text.substring(0, 50)}... (${req.mode})`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);

    const response = await fetch(`${PERSONAPLEX_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PersonaPlex render failed: ${response.status} - ${error}`);
    }

    // Check if streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      // SSE streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let chunkIndex = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.audio) {
              yield {
                audioB64: data.audio,
                index: chunkIndex++,
                transcript: data.transcript,
                frameCount: data.frame_count,
              };
            }
          }
        }
      }
    } else {
      // Non-streaming JSON response (batch)
      const result: PersonaPlexRenderResult = await response.json();

      for (const chunk of result.chunks) {
        yield chunk;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`PersonaPlex render timed out after ${RENDER_TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * Render text to speech synchronously (non-streaming).
 *
 * Use this when you need all audio at once.
 */
export async function renderWithPersonaPlexSync(
  req: PersonaPlexRenderRequest
): Promise<PersonaPlexRenderResult> {
  const chunks: PersonaPlexAudioChunk[] = [];
  let transcript = '';

  for await (const chunk of renderWithPersonaPlex(req)) {
    chunks.push(chunk);
    if (chunk.transcript) {
      transcript = chunk.transcript;
    }
  }

  return {
    chunks,
    transcript,
    metadata: {
      mode: req.mode,
      element: req.element || undefined,
      sanctuary: req.sanctuary,
      totalFrames: chunks.reduce((sum, c) => sum + (c.frameCount || 1), 0),
      durationMs: chunks.length * 80, // ~80ms per frame at 12.5 fps
    },
  };
}

/**
 * Check if PersonaPlex service is available.
 */
export async function checkPersonaPlexHealth(): Promise<{
  available: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const response = await fetch(`${PERSONAPLEX_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return {
        available: true,
        latencyMs: Date.now() - start,
      };
    }

    return {
      available: false,
      error: `Health check failed: ${response.status}`,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert VoiceContextPayload to PersonaPlexRenderRequest.
 *
 * This is the bridge between MaiaWisdomProvider and PersonaPlex.
 * wisdomDirective is optional - PersonaPlex will use legacy mode if not provided.
 */
export function createRenderRequest(
  text: string,
  payload: VoiceContextPayload | null,
  wisdomDirective?: string,
  options?: { speed?: number; mode?: 'talk' | 'care' | 'note'; element?: string | null; sanctuary?: boolean }
): PersonaPlexRenderRequest {
  return {
    text,
    wisdomDirective: wisdomDirective || undefined,
    mode: payload?.mode ?? options?.mode ?? 'talk',
    element: payload?.element ?? options?.element,
    sanctuary: payload?.sanctuary ?? options?.sanctuary ?? false,
    speed: options?.speed,
  };
}
