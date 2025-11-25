/**
 * LOCAL-FIRST ENCRYPTED MEMORY SYSTEM
 *
 * Privacy-first architecture:
 * 1. All data stored locally on device (IndexedDB + encrypted)
 * 2. Optional encrypted sync to Supabase (user choice)
 * 3. End-to-end encryption - only user can decrypt
 * 4. Zero-knowledge: Server never sees plaintext
 *
 * Soul data stays with the soul 💫
 */

import type { RelationshipEssence } from './RelationshipAnamnesis';
import type { ConversationMessage } from './ConversationPersistence';

// ===================================================================
// ENCRYPTION UTILITIES (Web Crypto API - built-in, secure)
// ===================================================================

/**
 * Generate encryption key from user passphrase
 * Uses PBKDF2 for key derivation
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
async function encryptData(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

/**
 * Decrypt data using AES-GCM
 */
async function decryptData(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encryptedBytes
  );

  return decoder.decode(decrypted);
}

// ===================================================================
// INDEXEDDB STORAGE (Local-first database)
// ===================================================================

const DB_NAME = 'MAIA_SoulMemory';
const DB_VERSION = 1;
const STORE_CONVERSATIONS = 'conversations';
const STORE_ESSENCE = 'relationship_essence';
const STORE_METADATA = 'metadata';

interface EncryptedData {
  id: string;
  encrypted: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
  syncedToCloud?: boolean;
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Conversations store
        if (!db.objectStoreNames.contains(STORE_CONVERSATIONS)) {
          const conversationsStore = db.createObjectStore(STORE_CONVERSATIONS, { keyPath: 'id' });
          conversationsStore.createIndex('userId', 'userId', { unique: false });
          conversationsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Relationship essence store
        if (!db.objectStoreNames.contains(STORE_ESSENCE)) {
          const essenceStore = db.createObjectStore(STORE_ESSENCE, { keyPath: 'id' });
          essenceStore.createIndex('userId', 'userId', { unique: false });
        }

        // Metadata store (sync status, etc.)
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };
    });
  }

  async save(storeName: string, data: EncryptedData): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, id: string): Promise<EncryptedData | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll(storeName: string): Promise<EncryptedData[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const localDB = new IndexedDBStorage();

// ===================================================================
// LOCAL-FIRST CONVERSATION STORAGE
// ===================================================================

export interface LocalConversationData {
  sessionId: string;
  userId: string;
  messages: ConversationMessage[];
  consciousnessType: 'maia' | 'kairos' | 'unified';
  startedAt: Date;
  updatedAt: Date;
}

/**
 * Save conversation to LOCAL device storage (encrypted)
 * No cloud upload unless user explicitly enables sync
 */
export async function saveConversationLocally(
  conversation: LocalConversationData,
  userEncryptionKey?: CryptoKey
): Promise<void> {
  try {
    const data = JSON.stringify(conversation);

    let encrypted: string;
    let iv: string;

    if (userEncryptionKey) {
      // Encrypt if user has enabled encryption
      const result = await encryptData(data, userEncryptionKey);
      encrypted = result.encrypted;
      iv = result.iv;
    } else {
      // Store unencrypted locally (still private, just not encrypted)
      encrypted = btoa(data);
      iv = '';
    }

    await localDB.save(STORE_CONVERSATIONS, {
      id: conversation.sessionId,
      encrypted,
      iv,
      createdAt: conversation.startedAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      syncedToCloud: false
    });

    console.log(`💾 [LOCAL] Conversation saved to device (${conversation.messages.length} messages)`);
  } catch (error) {
    console.error('❌ [LOCAL] Failed to save conversation:', error);
  }
}

/**
 * Load conversation from LOCAL device storage
 */
export async function loadConversationLocally(
  sessionId: string,
  userEncryptionKey?: CryptoKey
): Promise<LocalConversationData | null> {
  try {
    const stored = await localDB.get(STORE_CONVERSATIONS, sessionId);
    if (!stored) return null;

    let decrypted: string;

    if (stored.iv && userEncryptionKey) {
      // Decrypt if encrypted
      decrypted = await decryptData(stored.encrypted, stored.iv, userEncryptionKey);
    } else {
      // Decode if unencrypted
      decrypted = atob(stored.encrypted);
    }

    const conversation = JSON.parse(decrypted);

    // Convert ISO strings back to Dates
    conversation.startedAt = new Date(conversation.startedAt);
    conversation.updatedAt = new Date(conversation.updatedAt);
    conversation.messages = conversation.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    console.log(`💬 [LOCAL] Loaded conversation from device (${conversation.messages.length} messages)`);
    return conversation;
  } catch (error) {
    console.error('❌ [LOCAL] Failed to load conversation:', error);
    return null;
  }
}

// ===================================================================
// LOCAL-FIRST RELATIONSHIP ESSENCE STORAGE
// ===================================================================

/**
 * Save relationship essence to LOCAL device storage
 */
export async function saveEssenceLocally(
  essence: RelationshipEssence,
  userEncryptionKey?: CryptoKey
): Promise<void> {
  try {
    const data = JSON.stringify(essence);

    let encrypted: string;
    let iv: string;

    if (userEncryptionKey) {
      const result = await encryptData(data, userEncryptionKey);
      encrypted = result.encrypted;
      iv = result.iv;
    } else {
      encrypted = btoa(data);
      iv = '';
    }

    await localDB.save(STORE_ESSENCE, {
      id: essence.soulSignature,
      encrypted,
      iv,
      createdAt: essence.firstEncounter.toISOString(),
      updatedAt: essence.lastEncounter.toISOString(),
      syncedToCloud: false
    });

    console.log(`💫 [LOCAL] Essence saved to device (encounter ${essence.encounterCount})`);
  } catch (error) {
    console.error('❌ [LOCAL] Failed to save essence:', error);
  }
}

/**
 * Load relationship essence from LOCAL device storage
 */
export async function loadEssenceLocally(
  soulSignature: string,
  userEncryptionKey?: CryptoKey
): Promise<RelationshipEssence | null> {
  try {
    const stored = await localDB.get(STORE_ESSENCE, soulSignature);
    if (!stored) return null;

    let decrypted: string;

    if (stored.iv && userEncryptionKey) {
      decrypted = await decryptData(stored.encrypted, stored.iv, userEncryptionKey);
    } else {
      decrypted = atob(stored.encrypted);
    }

    const essence = JSON.parse(decrypted);

    // Convert ISO strings back to Dates
    essence.firstEncounter = new Date(essence.firstEncounter);
    essence.lastEncounter = new Date(essence.lastEncounter);

    console.log(`💫 [LOCAL] Loaded essence from device (${essence.encounterCount} encounters)`);
    return essence;
  } catch (error) {
    console.error('❌ [LOCAL] Failed to load essence:', error);
    return null;
  }
}

// ===================================================================
// ENCRYPTION KEY MANAGEMENT
// ===================================================================

/**
 * Generate and store user encryption key (derived from device + optional passphrase)
 * Key never leaves device
 */
export async function initializeUserEncryption(passphrase?: string): Promise<CryptoKey> {
  // Use device fingerprint + optional passphrase for key derivation
  const deviceId = localStorage.getItem('maia_device_id') || crypto.randomUUID();
  localStorage.setItem('maia_device_id', deviceId);

  const keyMaterial = passphrase || deviceId;
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  // Store salt in localStorage (it's not secret)
  localStorage.setItem('maia_key_salt', btoa(String.fromCharCode(...salt)));

  return deriveKey(keyMaterial, salt);
}

/**
 * Get user encryption key (for decryption)
 */
export async function getUserEncryptionKey(passphrase?: string): Promise<CryptoKey | null> {
  const deviceId = localStorage.getItem('maia_device_id');
  const saltStr = localStorage.getItem('maia_key_salt');

  if (!deviceId || !saltStr) return null;

  const keyMaterial = passphrase || deviceId;
  const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0));

  return deriveKey(keyMaterial, salt);
}

// ===================================================================
// STORAGE PREFERENCE MANAGEMENT
// ===================================================================

export interface StoragePreferences {
  localOnly: boolean; // Store only on device
  encryptLocal: boolean; // Encrypt local storage
  enableCloudBackup: boolean; // Optional encrypted backup to Supabase
  autoSync: boolean; // Auto-sync to cloud when online
}

export function getStoragePreferences(): StoragePreferences {
  const prefs = localStorage.getItem('maia_storage_prefs');
  if (!prefs) {
    // Defaults: Local-first, encrypted, no cloud
    return {
      localOnly: true,
      encryptLocal: true,
      enableCloudBackup: false,
      autoSync: false
    };
  }
  return JSON.parse(prefs);
}

export function setStoragePreferences(prefs: StoragePreferences): void {
  localStorage.setItem('maia_storage_prefs', JSON.stringify(prefs));
  console.log('🔒 [STORAGE] Preferences updated:', prefs);
}

// ===================================================================
// EXPORT/IMPORT (User data portability)
// ===================================================================

/**
 * Export all local data for backup or migration
 */
export async function exportAllLocalData(): Promise<Blob> {
  const conversations = await localDB.getAll(STORE_CONVERSATIONS);
  const essences = await localDB.getAll(STORE_ESSENCE);

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    conversations,
    essences
  };

  const json = JSON.stringify(exportData, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Import data from backup
 */
export async function importLocalData(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);

  for (const conv of data.conversations) {
    await localDB.save(STORE_CONVERSATIONS, conv);
  }

  for (const ess of data.essences) {
    await localDB.save(STORE_ESSENCE, ess);
  }

  console.log('✅ [IMPORT] Data restored from backup');
}
