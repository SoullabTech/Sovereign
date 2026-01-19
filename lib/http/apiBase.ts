/**
 * API Base URL Helper
 *
 * For web: uses relative paths (e.g., /api/journal/quick)
 * For Capacitor/mobile: uses hosted backend URL
 *
 * Set NEXT_PUBLIC_API_BASE_URL for mobile builds:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-domain.com CAPACITOR_BUILD=1 npm run build
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// [ios-debug] Log the resolved API_BASE at module load
if (typeof window !== 'undefined') {
  console.log('[ios-debug] API_BASE resolved:', API_BASE || '(empty - using relative paths)');
}

/**
 * Convert a relative API path to full URL for mobile apps
 * @param path - API path like "/api/journal/quick/list"
 * @returns Full URL if API_BASE is set, otherwise the original path
 */
export function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

/**
 * Ping health endpoint to test connectivity (iOS debugging)
 * Call from console: window.__pingHealth?.()
 */
export async function pingHealth(): Promise<void> {
  const url = apiUrl('/api/health');
  console.log('[ios-debug] pinging health endpoint:', url);
  try {
    const r = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'include' });
    const t = await r.text();
    console.log('[ios-debug] health response:', r.status, t.slice(0, 200));
    alert(`Health ${r.status}: ${t.slice(0, 200)}`);
  } catch (err) {
    console.error('[ios-debug] health ping failed:', err);
    alert(`Health FAILED: ${String(err)}`);
  }
}

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).__pingHealth = pingHealth;
  (window as any).__apiBase = API_BASE;
}
