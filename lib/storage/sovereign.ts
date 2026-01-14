// Stub: sovereign storage module
// TODO: Implement full sovereignty storage

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StorageMode = 'local' | 'cloud' | 'hybrid';
export type DataType = 'conversations' | 'memories' | 'preferences' | 'journal';

export interface StorageDecision {
  allowServerStorage: boolean;
  allowLocalStorage: boolean;
  consentTimestamp?: string;
}

export interface ConsentSummary {
  mode: StorageMode;
  autoSync: boolean;
  sanctuaryDefault: boolean;
  dataTypes: Record<DataType, boolean>;
}

export interface SyncState {
  lastSync: string | null;
  pending: number;
  syncing: boolean;
  error: string | null;
}

export const DEFAULT_STORAGE_CONSENT: ConsentSummary = {
  mode: 'local',
  autoSync: false,
  sanctuaryDefault: false,
  dataTypes: {
    conversations: true,
    memories: true,
    preferences: true,
    journal: true,
  },
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

export function setDataTypeConsent(dataType: DataType, allowed: boolean): void {
  // Stub
  if (typeof window !== 'undefined') {
    const key = `maia_consent_${dataType}`;
    localStorage.setItem(key, String(allowed));
  }
}

export function setSanctuaryDefault(enabled: boolean): void {
  // Stub
  if (typeof window !== 'undefined') {
    localStorage.setItem('maia_sanctuary_default', String(enabled));
  }
}

export function getConsentSummary(): ConsentSummary {
  if (typeof window === 'undefined') return { ...DEFAULT_STORAGE_CONSENT };

  const mode = (localStorage.getItem('maia_storage_mode') as StorageMode) || DEFAULT_STORAGE_CONSENT.mode;
  const autoSync = localStorage.getItem('maia_auto_sync') === 'true';
  const sanctuaryDefault = localStorage.getItem('maia_sanctuary_default') === 'true';

  const dataTypes: Record<DataType, boolean> = {
    conversations: localStorage.getItem('maia_consent_conversations') !== 'false',
    memories: localStorage.getItem('maia_consent_memories') !== 'false',
    preferences: localStorage.getItem('maia_consent_preferences') !== 'false',
    journal: localStorage.getItem('maia_consent_journal') !== 'false',
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
};

export function getSyncState(): SyncState {
  return { ...defaultSyncState };
}

export function getSyncStatus(): { status: 'idle' | 'syncing' | 'error'; message?: string } {
  return { status: 'idle' };
}

export function subscribeSyncState(callback: (state: SyncState) => void): () => void {
  // Call immediately with current state, then return unsubscribe
  callback(getSyncState());
  return () => {};
}

export async function triggerSync(): Promise<{ success: boolean }> {
  // Stub
  return { success: true };
}

export async function getStorageDecision(userId: string): Promise<StorageDecision | null> {
  // Default to local-only storage
  return {
    allowServerStorage: false,
    allowLocalStorage: true,
  };
}

export async function saveQuickJournal(data: {
  userId: string;
  content: string;
  timestamp: string;
}): Promise<{ success: boolean }> {
  // Stub - save to localStorage for now
  if (typeof window !== 'undefined') {
    const key = `journal_${data.userId}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
  }
  return { success: true };
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
