// backend: app/api/ready/route.ts
import { NextResponse } from 'next/server';

/**
 * Readiness Check - Are critical dependencies available?
 * Used for deployment health checks, load balancer routing
 * Returns 503 if critical dependencies are offline
 */

/**
 * Reliable timeout wrapper for fetch
 * AbortSignal.timeout() can be weird in some Node/Next runtimes
 * Use explicit AbortController instead
 */
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

export async function GET() {
  const ready: any = {
    ready: true,
    timestamp: new Date().toISOString(),
    dependencies: {},
    critical: [],
    warnings: [],
  };

  // Check Ollama (LLM) - CRITICAL for non-fallback operation
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

    const response = await fetchWithTimeout(`${ollamaUrl}/api/version`, 1500);

    if (response.ok) {
      // Verify model exists
      const tagsResponse = await fetchWithTimeout(`${ollamaUrl}/api/tags`, 1500);

      if (tagsResponse.ok) {
        const data = await tagsResponse.json();
        const models = data.models || [];
        const modelExists = models.some((m: any) => m.name === ollamaModel || m.name.startsWith(ollamaModel));

        ready.dependencies.ollama = {
          status: modelExists ? 'ready' : 'missing-model',
          endpoint: ollamaUrl,
          model: ollamaModel,
          modelExists,
        };

        if (!modelExists) {
          ready.critical.push(`Ollama model '${ollamaModel}' not found - will fall back to consciousness engine`);
          ready.ready = false;
        }
      } else {
        ready.dependencies.ollama = {
          status: 'degraded',
          endpoint: ollamaUrl,
          error: 'Could not list models'
        };
        ready.warnings.push('Could not verify Ollama models - may still work');
      }
    } else {
      ready.dependencies.ollama = {
        status: 'unreachable',
        endpoint: ollamaUrl,
        error: 'Ollama not responding'
      };
      ready.critical.push('Ollama unreachable - will fall back to consciousness engine');
      ready.ready = false;
    }
  } catch (err) {
    ready.dependencies.ollama = {
      status: 'offline',
      endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      error: String(err)
    };
    ready.critical.push('Ollama offline - will fall back to consciousness engine');
    ready.ready = false;
  }

  // Database/Memory - Not critical (session-only fallback works)
  const memoryProvider = process.env.MEMORY_PROVIDER || 'session-only';
  ready.dependencies.memory = {
    status: 'available',
    provider: memoryProvider,
    persistent: memoryProvider !== 'session-only'
  };

  if (memoryProvider === 'session-only') {
    ready.warnings.push('Memory is session-only (not persistent)');
  }

  return NextResponse.json(ready, {
    status: ready.ready ? 200 : 503
  });
}
