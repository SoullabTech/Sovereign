/**
 * MEMORY PERMISSION GATE
 *
 * Centralized logic for resolving memoryMode permissions.
 * This is the single source of truth for "can this user write to long-term memory?"
 *
 * Used by:
 * - maiaOrchestrator.ts (main conversation flow)
 * - /api/consciousness/memory/integrate route (direct API access)
 * - ConsciousnessMemoryLattice.ts (defense-in-depth)
 *
 * Permission chain:
 * 1. Client signals intent (memoryMode)
 * 2. Server checks env flag + allowlist
 * 3. Only 'longterm' if BOTH conditions pass
 *
 * Env vars:
 * - MAIA_LONGTERM_WRITEBACK: '1' to enable feature globally
 * - MAIA_LONGTERM_WRITEBACK_ALLOWLIST: comma-separated userIds
 */

export type MemoryMode = 'ephemeral' | 'continuity' | 'longterm';

export interface MemoryModeResolution {
  /** The server-approved effective mode */
  effective: MemoryMode;
  /** Whether longterm is allowed for this user */
  allowLongterm: boolean;
  /** The mode that was requested (before server override) */
  requested: MemoryMode;
  /** Whether the request was downgraded */
  wasDowngraded: boolean;
}

/**
 * Resolve the effective memoryMode for a user.
 *
 * Client can request any mode, but server enforces:
 * - 'longterm' only if env + allowlist permit
 * - 'ephemeral' always allowed
 * - 'continuity' is the safe default
 */
export function resolveMemoryMode(
  userId: string,
  requested?: MemoryMode | string | null
): MemoryModeResolution {
  const requestedMode: MemoryMode =
    (requested as MemoryMode) || 'continuity';

  // Check if longterm is allowed for this user
  const envEnabled = process.env.MAIA_LONGTERM_WRITEBACK === '1';
  const allowlistRaw = process.env.MAIA_LONGTERM_WRITEBACK_ALLOWLIST || '';
  const allowlist = new Set(
    allowlistRaw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  );
  const allowLongterm = envEnabled && allowlist.has(userId);

  // Determine effective mode
  const effective: MemoryMode =
    requestedMode === 'longterm' && allowLongterm
      ? 'longterm'
      : requestedMode === 'ephemeral'
        ? 'ephemeral'
        : 'continuity';

  const wasDowngraded = requestedMode === 'longterm' && effective !== 'longterm';

  return {
    effective,
    allowLongterm,
    requested: requestedMode,
    wasDowngraded,
  };
}

/**
 * Log a denial when longterm was requested but not permitted.
 * Call this after resolveMemoryMode if wasDowngraded is true.
 */
export function logMemoryGateDenial(
  context: string,
  userId: string,
  resolution: MemoryModeResolution
): void {
  if (resolution.wasDowngraded) {
    console.warn(`🛡️ [MemoryGate] ${context}: longterm requested but denied`, {
      userId,
      requested: resolution.requested,
      effective: resolution.effective,
      allowLongterm: resolution.allowLongterm,
    });
  }
}
