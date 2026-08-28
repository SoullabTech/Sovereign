// Stub: sovereign storage module
// TODO: Implement full sovereignty storage

import { apiFetch } from '@/lib/http/apiBase';
import { getAccountSettings, updateAccountSetting } from '@/lib/settings/accountSettings';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StorageMode = 'local' | 'cloud' | 'hybrid' | 'local_only' | 'both' | 'server_only';
export type DataType = 'conversations' | 'memories' | 'preferences' | 'journal' | 'journals' | 'audio' | 'insights';

export interface StorageDecision {
  allowServerStorage: boolean;
  allowLocalStorage: boolean;
  consentTimestamp?: string;
  // Aliases for components that use these names
  saveServer?: boolean;
  saveLocal?: boolean;
}

export interface DataTypeDetail {
  saveLocal: boolean;
  saveServer: boolean;
}

export interface ConsentSummary {
  mode: StorageMode;
  autoSync: boolean;
  sanctuaryDefault: boolean;
  dataTypes: Record<DataType, boolean>;
  // Extended fields for AccountSettings
  details?: Record<DataType, DataTypeDetail>;
  localEnabled?: boolean;
  serverEnabled?: boolean;
  // Per-type local/server flags
  conversationsLocal?: boolean;
  conversationsServer?: boolean;
  memoriesLocal?: boolean;
  memoriesServer?: boolean;
  preferencesLocal?: boolean;
  preferencesServer?: boolean;
  journalLocal?: boolean;
  journalServer?: boolean;
  journalsLocal?: boolean;
  journalsServer?: boolean;
  audioLocal?: boolean;
  audioServer?: boolean;
  insightsLocal?: boolean;
  insightsServer?: boolean;
}

export interface SyncState {
  lastSync: string | null;
  pending: number;
  syncing: boolean;
  error: string | null;
  // Extended for AccountSettings
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingCount: number;
}

export interface SyncCounts {
  local: number;
  server: number;
  pending: number;
}

// Extended defaults with local/server per-type flags for AccountSettings compatibility
export const DEFAULT_STORAGE_CONSENT: ConsentSummary = {
  mode: 'local',
  autoSync: false,
  sanctuaryDefault: false,
  dataTypes: {
    conversations: true,
    memories: true,
    preferences: true,
    journal: true,
    journals: true,
    audio: true,
    insights: true,
  },
  // Per-type local/server defaults
  conversationsLocal: true,
  conversationsServer: false,
  memoriesLocal: true,
  memoriesServer: false,
  preferencesLocal: true,
  preferencesServer: false,
  journalLocal: true,
  journalServer: false,
  journalsLocal: true,
  journalsServer: false,
  audioLocal: true,
  audioServer: false,
  insightsLocal: true,
  insightsServer: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage Mode & Consent Functions (Stubs)
// ─────────────────────────────────────────────────────────────────────────────

export function setStorageMode(mode: StorageMode): void {
  // Stub - will persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('maia_storage_mode', mode);
  }
}

export function setAutoSync(enabled: boolean): void {
  // Stub
  if (typeof window !== 'undefined') {
    localStorage.setItem('maia_auto_sync', String(enabled));
  }
}

export function setDataTypeConsent(dataType: DataType, saveLocal: boolean, saveServer?: boolean): void {
  // Stub
  if (typeof window !== 'undefined') {
    const key = `maia_consent_${dataType}`;
    localStorage.setItem(key, String(saveLocal));
    if (saveServer !== undefined) {
      localStorage.setItem(`${key}_server`, String(saveServer));
    }
  }
}

const LEGACY_SANCTUARY_DEFAULT_KEY = 'maia_sanctuary_default';

// The Sanctuary default has exactly one home: `maia_account_settings`'s
// `defaultMemoryMode`. It used to have two — this module's own
// `maia_sanctuary_default` key behind the Data & Privacy toggle, and
// `defaultMemoryMode` behind MAIA Settings' memory-mode picker — which the
// member saw as one setting in two places, free to disagree. Both surfaces now
// read and write the same value.

export function setSanctuaryDefault(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  updateAccountSetting('defaultMemoryMode', enabled ? 'sanctuary' : 'continuity');
  // Retire the legacy key so a stale `true` can never resurrect the divergence.
  localStorage.removeItem(LEGACY_SANCTUARY_DEFAULT_KEY);
}

/**
 * Read the Sanctuary default, honouring a legacy `maia_sanctuary_default=true`
 * once and migrating it forward. The migration only ever moves toward
 * Sanctuary: an old opt-in must survive the merge, and a member who never set
 * the legacy key keeps whatever `defaultMemoryMode` already says.
 */
function readSanctuaryDefault(): boolean {
  const fromAccount = getAccountSettings().defaultMemoryMode === 'sanctuary';
  if (fromAccount) return true;

  if (localStorage.getItem(LEGACY_SANCTUARY_DEFAULT_KEY) === 'true') {
    updateAccountSetting('defaultMemoryMode', 'sanctuary');
    localStorage.removeItem(LEGACY_SANCTUARY_DEFAULT_KEY);
    return true;
  }

  localStorage.removeItem(LEGACY_SANCTUARY_DEFAULT_KEY);
  return false;
}


export function getConsentSummary(): ConsentSummary {
  if (typeof window === 'undefined') return { ...DEFAULT_STORAGE_CONSENT };

  const mode = (localStorage.getItem('maia_storage_mode') as StorageMode) || DEFAULT_STORAGE_CONSENT.mode;
  const autoSync = localStorage.getItem('maia_auto_sync') === 'true';
  const sanctuaryDefault = readSanctuaryDefault();

  const dataTypes: Record<DataType, boolean> = {
    conversations: localStorage.getItem('maia_consent_conversations') !== 'false',
    memories: localStorage.getItem('maia_consent_memories') !== 'false',
    preferences: localStorage.getItem('maia_consent_preferences') !== 'false',
    journal: localStorage.getItem('maia_consent_journal') !== 'false',
    journals: localStorage.getItem('maia_consent_journals') !== 'false',
    audio: localStorage.getItem('maia_consent_audio') !== 'false',
    insights: localStorage.getItem('maia_consent_insights') !== 'false',
  };

  return { mode, autoSync, sanctuaryDefault, dataTypes };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync State Functions (Stubs)
// ─────────────────────────────────────────────────────────────────────────────

const defaultSyncState: SyncState = {
  lastSync: null,
  pending: 0,
  syncing: false,
  error: null,
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
};

export function getSyncState(): SyncState {
  return { ...defaultSyncState };
}

export function getSyncStatus(memberId?: string): SyncCounts {
  return { local: 0, server: 0, pending: 0 };
}

export function subscribeSyncState(callback: (state: SyncState) => void): () => void {
  // Call immediately with current state, then return unsubscribe
  callback(getSyncState());
  return () => {};
}

export async function triggerSync(userId?: string): Promise<{ success: boolean }> {
  // Stub
  return { success: true };
}

export async function getStorageDecision(dataTypeOrUserId: DataType | string): Promise<StorageDecision | null> {
  // Default to local-only storage
  return {
    allowServerStorage: false,
    allowLocalStorage: true,
    saveServer: false,
    saveLocal: true,
  };
}

export interface QuickJournalOptions {
  userId: string;
  entryType?: 'dream' | 'day' | 'handwriting';
  source?: 'quick_sheet' | 'voice' | 'scan' | 'handwriting_ocr' | 'handwriting_paste';
  tags?: string[];
  meta?: Record<string, unknown>;
  audioBlob?: Blob;
  audioDurationMs?: number;
}

export interface QuickJournalResult {
  success: boolean;
  id?: string;
  local?: boolean;
  server?: boolean;
  error?: string;
  pendingSync?: boolean; // True if saved locally but server sync is pending
}

export async function saveQuickJournal(
  content: string,
  options: QuickJournalOptions
): Promise<QuickJournalResult> {
  const localId = `journal_${options.userId}_${Date.now()}`;
  let serverSuccess = false;
  let serverId: string | undefined;
  let localSuccess = false;
  let serverError: string | undefined;

  // Validate userId - don't save with placeholder IDs
  if (!options.userId || options.userId === 'guest' || options.userId.startsWith('guest_')) {
    console.warn('[sovereign] Cannot save journal - no valid userId. User may not be signed in.');
    return {
      success: false,
      id: localId,
      local: false,
      server: false,
      error: 'Please sign in to save your entries. They will be preserved across all your devices.',
    };
  }

  // Always try to save to server (PostgreSQL) for cross-device sync and data durability
  try {
    // apiFetch (not raw fetch): the server derives the owning member from the
    // verified session, so the request must carry session credentials. The
    // previous raw relative fetch sent none, and under Capacitor resolved
    // against the local bundle instead of the API host.
    //
    // `userId` stays in the body for older deployed clients reading this shape,
    // but the server ignores it — it no longer selects the row owner.
    const response = await apiFetch('/api/journal/quick/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: options.userId,
        entryType: options.entryType || 'day',
        content,
        tags: options.tags || [],
        source: options.source || 'quick_sheet',
        meta: options.meta,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.entryId) {
        serverSuccess = true;
        serverId = data.entryId;
        console.log(`✅ [sovereign] ${options.entryType || 'journal'} saved to server:`, serverId);
      } else {
        serverError = data.error || 'Server returned unsuccessful response';
        console.warn('[sovereign] Server response indicated failure:', data);
      }
    } else {
      serverError = `Server returned ${response.status}: ${response.statusText}`;
      console.warn('[sovereign] Server save failed with status:', response.status);
    }
  } catch (err) {
    serverError = err instanceof Error ? err.message : 'Network error';
    console.warn('[sovereign] Server save failed, falling back to local:', err);
  }

  // Also save to localStorage for offline access / quick retrieval
  if (typeof window !== 'undefined') {
    try {
      const localEntry = {
        id: serverId || localId,
        content,
        ...options,
        timestamp: new Date().toISOString(),
        synced: serverSuccess,
        pendingSync: !serverSuccess, // Mark for later sync if server failed
      };
      localStorage.setItem(`qj_${serverId || localId}`, JSON.stringify(localEntry));
      localSuccess = true;

      // Also maintain an index of pending syncs
      if (!serverSuccess) {
        const pendingList = JSON.parse(localStorage.getItem('qj_pending_sync') || '[]');
        pendingList.push(serverId || localId);
        localStorage.setItem('qj_pending_sync', JSON.stringify(pendingList));
        console.log('[sovereign] Entry added to pending sync queue');
      }
    } catch (localErr) {
      console.error('[sovereign] localStorage save failed:', localErr);
    }
  }

  // Success requires EITHER server save OR local save
  // But we report accurately about what actually succeeded
  const overallSuccess = serverSuccess || localSuccess;

  return {
    success: overallSuccess,
    id: serverId || localId,
    local: localSuccess,
    server: serverSuccess,
    error: !overallSuccess ? (serverError || 'Both server and local storage failed') : undefined,
    pendingSync: localSuccess && !serverSuccess,
  };
}

export async function updateStorageConsent(
  userId: string,
  consent: Partial<StorageDecision>
): Promise<void> {
  // Stub
  console.log('Storage consent updated:', userId, consent);
}

export async function requestDataDeletion(userId: string): Promise<{ success: boolean }> {
  // Stub
  console.log('Data deletion requested:', userId);
  return { success: true };
}

export async function getStorageUsage(userId: string): Promise<{
  serverBytes: number;
  localBytes: number;
}> {
  return { serverBytes: 0, localBytes: 0 };
}
