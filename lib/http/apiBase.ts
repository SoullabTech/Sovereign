// API Base URL utilities
// Provides URL construction and member ID management

const MEMBER_ID_KEY = 'maia_member_id';

/**
 * Get the base API URL
 * In production this may need to point to a different server
 */
export function getApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
}

/**
 * Construct a full API URL from a path
 */
export function apiUrl(path: string): string {
  const base = getApiBase();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Get the current member ID from storage
 */
export function getValidMemberId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try localStorage first
    const stored = localStorage.getItem(MEMBER_ID_KEY);
    if (stored) return stored;

    // Fall back to sessionStorage
    return sessionStorage.getItem(MEMBER_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Store the member ID
 */
export function setMemberId(memberId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(MEMBER_ID_KEY, memberId);
    sessionStorage.setItem(MEMBER_ID_KEY, memberId);
  } catch {
    // Storage may be unavailable
  }
}

/**
 * Clear the stored member ID
 */
export function clearMemberId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(MEMBER_ID_KEY);
    sessionStorage.removeItem(MEMBER_ID_KEY);
  } catch {
    // Storage may be unavailable
  }
}

export default {
  getApiBase,
  apiUrl,
  getValidMemberId,
  setMemberId,
  clearMemberId,
};
