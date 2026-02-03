/**
 * Health check utilities for MAIA CLI
 */

export interface HealthResult {
  healthy: boolean;
  status: number;
  latencyMs: number;
  error?: string;
  data?: Record<string, unknown>;
}

export async function checkHealth(url: string, timeoutMs: number = 5000): Promise<HealthResult> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    // Try to parse JSON response
    let data: Record<string, unknown> | undefined;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch {
      // Not JSON, that's fine
    }

    return {
      healthy: response.ok,
      status: response.status,
      latencyMs,
      data,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      healthy: false,
      status: 0,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkDomainHealth(domain: string): Promise<HealthResult> {
  // Try HTTPS first, fall back to HTTP for local dev
  const httpsUrl = `https://${domain}`;
  const httpUrl = `http://${domain}`;

  let result = await checkHealth(httpsUrl);
  if (!result.healthy && result.error?.includes('ECONNREFUSED')) {
    result = await checkHealth(httpUrl);
  }

  return result;
}

export async function checkApiHealth(baseUrl: string): Promise<HealthResult> {
  const healthEndpoint = `${baseUrl}/api/health`;
  return checkHealth(healthEndpoint);
}

export function formatHealthStatus(result: HealthResult): string {
  if (result.healthy) {
    return `healthy (${result.latencyMs}ms)`;
  }
  if (result.error) {
    return `error: ${result.error}`;
  }
  return `unhealthy (${result.status})`;
}
