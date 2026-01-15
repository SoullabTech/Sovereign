/**
 * App Update Service
 *
 * Detects when new versions are deployed and manages update notifications.
 * Works with Capacitor webview loading from remote server.
 */

export interface VersionInfo {
  version: string;
  major: number;
  minor: number;
  patch: number;
  commit: string;
  timestamp: string;
  buildDate: string | null;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  forcedUpdate: boolean; // Major version change requires immediate update
  currentVersion: string;
  currentCommit: string;
  serverVersion: string;
  serverCommit: string;
}

const CHECK_INTERVAL = 90 * 60 * 1000; // 90 minutes
const STORAGE_KEY = "maia_app_version";
let checkTimer: ReturnType<typeof setInterval> | null = null;
let updateCallbacks: Array<(result: UpdateCheckResult) => void> = [];

/**
 * Get stored version from localStorage
 */
function getStoredVersion(): VersionInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save version to localStorage
 */
function saveStoredVersion(version: VersionInfo): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(version));
  } catch {
    console.warn("[AppUpdate] Failed to save version to localStorage");
  }
}

/**
 * Clear stored version (used before refresh)
 */
export function clearStoredVersion(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Check for updates by comparing stored version with server
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const defaultResult: UpdateCheckResult = {
    updateAvailable: false,
    forcedUpdate: false,
    currentVersion: "unknown",
    currentCommit: "unknown",
    serverVersion: "unknown",
    serverCommit: "unknown",
  };

  try {
    const response = await fetch("/api/version", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      console.warn("[AppUpdate] Version check failed:", response.status);
      return defaultResult;
    }

    const server: VersionInfo = await response.json();
    const stored = getStoredVersion();

    // First launch - save version and return no update
    if (!stored) {
      saveStoredVersion(server);
      return {
        ...defaultResult,
        currentVersion: server.version,
        currentCommit: server.commit,
        serverVersion: server.version,
        serverCommit: server.commit,
      };
    }

    // Compare versions
    const updateAvailable = stored.commit !== server.commit;
    const forcedUpdate = stored.major < server.major;

    return {
      updateAvailable,
      forcedUpdate,
      currentVersion: stored.version,
      currentCommit: stored.commit,
      serverVersion: server.version,
      serverCommit: server.commit,
    };
  } catch (error) {
    console.error("[AppUpdate] Check failed:", error);
    return defaultResult;
  }
}

/**
 * Start periodic update checks
 */
export function startPeriodicChecks(
  onUpdate: (result: UpdateCheckResult) => void
): void {
  // Add callback
  updateCallbacks.push(onUpdate);

  // Don't start multiple timers
  if (checkTimer) return;

  // Initial check after short delay (let app settle)
  setTimeout(async () => {
    const result = await checkForUpdate();
    if (result.updateAvailable) {
      updateCallbacks.forEach((cb) => cb(result));
    }
  }, 5000);

  // Periodic checks
  checkTimer = setInterval(async () => {
    const result = await checkForUpdate();
    if (result.updateAvailable) {
      updateCallbacks.forEach((cb) => cb(result));
    }
  }, CHECK_INTERVAL);
}

/**
 * Stop periodic update checks
 */
export function stopPeriodicChecks(): void {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
  updateCallbacks = [];
}

/**
 * Apply update by refreshing the page
 */
export function applyUpdate(forced: boolean = false): void {
  // Clear stored version so new version gets saved on load
  clearStoredVersion();

  if (forced) {
    // Force cache bypass with timestamp
    const url = new URL(window.location.href);
    url.searchParams.set("_v", Date.now().toString());
    window.location.href = url.toString();
  } else {
    // Standard reload
    window.location.reload();
  }
}

/**
 * Get current version info (for display in UI)
 */
export function getCurrentVersionInfo(): VersionInfo | null {
  return getStoredVersion();
}

/**
 * Manually trigger version save (useful after manual refresh)
 */
export async function syncVersionOnLoad(): Promise<void> {
  try {
    const response = await fetch("/api/version", { cache: "no-store" });
    if (response.ok) {
      const version: VersionInfo = await response.json();
      saveStoredVersion(version);
    }
  } catch {
    // Silently fail - not critical
  }
}
