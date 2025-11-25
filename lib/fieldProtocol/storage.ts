/**
 * Persistence layer for Field Protocol records using IndexedDB
 * Provides local storage and synchronization capabilities
 */

import { FieldRecord, Practitioner, CommonsEntry } from '@/types/fieldProtocol';

const DB_NAME = 'SpiralogicFieldProtocol';
const DB_VERSION = 1;

interface FieldProtocolDB {
  records: FieldRecord[];
  practitioners: Practitioner[];
  commons: CommonsEntry[];
}

/**
 * Field Protocol Storage Manager
 */
export class FieldProtocolStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id' });
          recordStore.createIndex('timestamp', 'timestamp', { unique: false });
          recordStore.createIndex('practitioner', 'meta.practitionerId', { unique: false });
          recordStore.createIndex('visibility', 'meta.visibility', { unique: false });
          recordStore.createIndex('stage', 'currentStage', { unique: false });
        }

        if (!db.objectStoreNames.contains('practitioners')) {
          const practitionerStore = db.createObjectStore('practitioners', { keyPath: 'id' });
          practitionerStore.createIndex('joinedDate', 'joinedDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('commons')) {
          const commonsStore = db.createObjectStore('commons', { keyPath: 'recordId' });
          commonsStore.createIndex('sharedDate', 'sharedDate', { unique: false });
          commonsStore.createIndex('practitioner', 'practitionerId', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync')) {
          const syncStore = db.createObjectStore('sync', { keyPath: 'id' });
          syncStore.createIndex('lastSync', 'lastSync', { unique: false });
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  /**
   * Save a Field Record
   */
  async saveRecord(record: FieldRecord): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a Field Record by ID
   */
  async getRecord(id: string): Promise<FieldRecord | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all Field Records
   */
  async getAllRecords(): Promise<FieldRecord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get records by practitioner
   */
  async getRecordsByPractitioner(practitionerId: string): Promise<FieldRecord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const index = store.index('practitioner');
      const request = index.getAll(practitionerId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get public and commons records
   */
  async getPublicRecords(): Promise<FieldRecord[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result || [];
        resolve(records.filter(r =>
          r.meta.visibility === 'public' || r.meta.visibility === 'commons'
        ));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a Field Record
   */
  async deleteRecord(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save or update a practitioner
   */
  async savePractitioner(practitioner: Practitioner): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['practitioners'], 'readwrite');
      const store = transaction.objectStore('practitioners');
      const request = store.put(practitioner);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a practitioner by ID
   */
  async getPractitioner(id: string): Promise<Practitioner | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['practitioners'], 'readonly');
      const store = transaction.objectStore('practitioners');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save a Commons Entry
   */
  async saveCommonsEntry(entry: CommonsEntry): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['commons'], 'readwrite');
      const store = transaction.objectStore('commons');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all Commons Entries
   */
  async getAllCommonsEntries(): Promise<CommonsEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['commons'], 'readonly');
      const store = transaction.objectStore('commons');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<{
    records: FieldRecord[];
    practitioners: Practitioner[];
    commons: CommonsEntry[];
    exportDate: Date;
  }> {
    const [records, practitioners, commons] = await Promise.all([
      this.getAllRecords(),
      this.getAllPractitioners(),
      this.getAllCommonsEntries()
    ]);

    return {
      records,
      practitioners,
      commons,
      exportDate: new Date()
    };
  }

  /**
   * Import data from backup
   */
  async importData(data: {
    records?: FieldRecord[];
    practitioners?: Practitioner[];
    commons?: CommonsEntry[];
  }): Promise<{
    recordsImported: number;
    practitionersImported: number;
    commonsImported: number;
  }> {
    let recordsImported = 0;
    let practitionersImported = 0;
    let commonsImported = 0;

    if (data.records) {
      for (const record of data.records) {
        await this.saveRecord(record);
        recordsImported++;
      }
    }

    if (data.practitioners) {
      for (const practitioner of data.practitioners) {
        await this.savePractitioner(practitioner);
        practitionersImported++;
      }
    }

    if (data.commons) {
      for (const entry of data.commons) {
        await this.saveCommonsEntry(entry);
        commonsImported++;
      }
    }

    return {
      recordsImported,
      practitionersImported,
      commonsImported
    };
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['records', 'practitioners', 'commons'], 'readwrite');

      const clearRecords = transaction.objectStore('records').clear();
      const clearPractitioners = transaction.objectStore('practitioners').clear();
      const clearCommons = transaction.objectStore('commons').clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get all practitioners
   */
  private async getAllPractitioners(): Promise<Practitioner[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['practitioners'], 'readonly');
      const store = transaction.objectStore('practitioners');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search records by text
   */
  async searchRecords(query: string): Promise<FieldRecord[]> {
    const allRecords = await this.getAllRecords();
    const queryLower = query.toLowerCase();

    return allRecords.filter(record => {
      // Search in phenomenon description
      if (record.phenomenon.description.toLowerCase().includes(queryLower)) {
        return true;
      }

      // Search in insights
      if (record.cognitive.insights.some(i => i.toLowerCase().includes(queryLower))) {
        return true;
      }

      // Search in tags
      if (record.meta.tags?.some(t => t.toLowerCase().includes(queryLower))) {
        return true;
      }

      // Search in symbolic data
      if (record.symbolic.imagery?.some(i => i.toLowerCase().includes(queryLower)) ||
          record.symbolic.archetypes?.some(a => a.toLowerCase().includes(queryLower))) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get recent records
   */
  async getRecentRecords(limit: number = 10): Promise<FieldRecord[]> {
    const allRecords = await this.getAllRecords();
    return allRecords
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(start: Date, end: Date): Promise<FieldRecord[]> {
    const allRecords = await this.getAllRecords();
    return allRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= start && recordDate <= end;
    });
  }

  /**
   * Save sync metadata
   */
  async saveSyncMetadata(metadata: {
    id: string;
    lastSync: Date;
    recordsSynced: number;
    endpoint?: string;
  }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync'], 'readwrite');
      const store = transaction.objectStore('sync');
      const request = store.put(metadata);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get last sync metadata
   */
  async getLastSync(): Promise<{ lastSync: Date; recordsSynced: number } | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync'], 'readonly');
      const store = transaction.objectStore('sync');
      const index = store.index('lastSync');
      const request = index.openCursor(null, 'prev'); // Get most recent

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let storageInstance: FieldProtocolStorage | null = null;

/**
 * Get the Field Protocol storage instance
 */
export const getFieldProtocolStorage = async (): Promise<FieldProtocolStorage> => {
  if (!storageInstance) {
    storageInstance = new FieldProtocolStorage();
    await storageInstance.init();
  }
  return storageInstance;
};

/**
 * React hook for Field Protocol storage
 */
export const useFieldProtocolStorage = () => {
  const [storage, setStorage] = useState<FieldProtocolStorage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getFieldProtocolStorage()
      .then(setStorage)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { storage, loading, error };
};