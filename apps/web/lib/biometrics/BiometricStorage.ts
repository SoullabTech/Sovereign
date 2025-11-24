/**
 * Biometric Storage (IndexedDB)
 *
 * Privacy-first: All biometric data stored locally in browser
 * Never sent to server unless user explicitly opts into Field contribution
 */

import type { ParsedHealthData, HRVReading } from './HealthDataImporter';

const DB_NAME = 'MAIA_Biometrics';
const DB_VERSION = 1;
const STORE_NAME = 'healthData';

export class BiometricStorage {
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB (idempotent - safe to call multiple times)
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side rendering guard

    // If already initialized, return immediately
    if (this.isInitialized && this.db) {
      return Promise.resolve();
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start new initialization
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.initPromise = null;
        console.log('✅ Biometric storage initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for health data
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Indexes for querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });

          console.log('🔧 Created biometric data store');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store parsed health data
   */
  async storeHealthData(data: ParsedHealthData): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Store metadata
    const entry = {
      timestamp: new Date(),
      type: 'apple_health_import',
      data: data,
      recordCount: {
        hrv: data.hrv.length,
        heartRate: data.heartRate.length,
        sleep: data.sleep.length,
        respiratory: data.respiratory.length
      }
    };

    return new Promise((resolve, reject) => {
      const request = store.add(entry);

      request.onsuccess = () => {
        console.log('✅ Health data stored locally:', entry.recordCount);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to store health data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get most recent health data import
   */
  async getLatestHealthData(): Promise<ParsedHealthData | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const transaction = this.db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Reverse order (newest first)

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const entry = cursor.value;
          if (entry.type === 'apple_health_import') {
            resolve(entry.data);
          } else {
            cursor.continue();
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Failed to retrieve health data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get most recent HRV reading
   */
  async getLatestHRV(): Promise<HRVReading | null> {
    const data = await this.getLatestHealthData();
    if (!data || data.hrv.length === 0) return null;

    return data.hrv[0]; // Already sorted newest first
  }

  /**
   * Clear all biometric data (privacy control)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ All biometric data cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Check if user has imported health data
   */
  async hasHealthData(): Promise<boolean> {
    const data = await this.getLatestHealthData();
    return data !== null && data.hrv.length > 0;
  }
}

// Singleton instance
export const biometricStorage = new BiometricStorage();
