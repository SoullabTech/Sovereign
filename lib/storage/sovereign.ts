// Stub: sovereign storage module
// TODO: Implement full sovereignty storage

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
}

export async function saveQuickJournal(
  content: string,
  options: QuickJournalOptions
): Promise<QuickJournalResult> {
  // Stub - save to localStorage for now
  const id = `journal_${options.userId}_${Date.now()}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(id, JSON.stringify({ content, ...options, timestamp: new Date().toISOString() }));
  }
  return { success: true, id, local: true, server: false };
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
