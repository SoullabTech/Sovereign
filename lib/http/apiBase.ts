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

/**
 * Convert a relative API path to full URL for mobile apps
 * @param path - API path like "/api/journal/quick"
 * @returns Full URL if API_BASE is set, otherwise the original path
 */
export function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}
