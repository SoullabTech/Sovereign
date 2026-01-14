// Stub: sovereign storage module
// TODO: Implement full sovereignty storage

export interface StorageDecision {
  allowServerStorage: boolean;
  allowLocalStorage: boolean;
  consentTimestamp?: string;
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
