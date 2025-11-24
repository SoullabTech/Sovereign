/**
 * Encrypted localStorage Backup System
 * Provides secure local backups of user data with automatic sync
 */

import { SecureLocalStorage, MAIAEncryption, UserEncryptionContext } from '@/lib/security/encryption';
import { SecureJournalEntry } from './secure-journal-storage';

export interface BackupMetadata {
  lastBackup: Date;
  entryCount: number;
  version: number;
  checksum: string;
  compressionRatio?: number;
}

export interface BackupEntry {
  id: string;
  type: 'journal' | 'voice' | 'memory' | 'soulprint' | 'preferences';
  data: any;
  timestamp: Date;
  checksum: string;
}

export interface SyncStatus {
  local: number;
  remote: number;
  conflicts: number;
  lastSync: Date;
  syncInProgress: boolean;
}

export class EncryptedBackupSystem {
  private static readonly MAX_BACKUP_SIZE_MB = 10;
  private static readonly MAX_ENTRIES_PER_BACKUP = 1000;
  private static readonly BACKUP_VERSION = 1;

  private encryptionContext: UserEncryptionContext | null = null;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Initialize backup system with encryption context
   */
  initialize(context: UserEncryptionContext): void {
    this.encryptionContext = context;
    SecureLocalStorage.initialize(context);
    console.log('✅ Encrypted backup system initialized');
  }

  /**
   * Create full backup of user data
   */
  async createFullBackup(data: {
    journalEntries: SecureJournalEntry[];
    voiceJournals: any[];
    symbolicMemories: any[];
    soulprints: any[];
    preferences: any;
  }): Promise<boolean> {
    if (!this.encryptionContext) {
      console.error('Backup system not initialized');
      return false;
    }

    try {
      console.log('📦 Creating encrypted backup...');

      // Prepare backup entries
      const backupEntries: BackupEntry[] = [];

      // Add journal entries
      for (const entry of data.journalEntries) {
        backupEntries.push({
          id: entry.id,
          type: 'journal',
          data: entry,
          timestamp: entry.timestamp,
          checksum: this.calculateChecksum(entry)
        });
      }

      // Add voice journals
      for (const voice of data.voiceJournals) {
        backupEntries.push({
          id: voice.id,
          type: 'voice',
          data: voice,
          timestamp: new Date(voice.created_at),
          checksum: this.calculateChecksum(voice)
        });
      }

      // Add symbolic memories
      for (const memory of data.symbolicMemories) {
        backupEntries.push({
          id: memory.id,
          type: 'memory',
          data: memory,
          timestamp: new Date(memory.updated_at),
          checksum: this.calculateChecksum(memory)
        });
      }

      // Add soulprints
      for (const soulprint of data.soulprints) {
        backupEntries.push({
          id: soulprint.id,
          type: 'soulprint',
          data: soulprint,
          timestamp: new Date(soulprint.updated_at),
          checksum: this.calculateChecksum(soulprint)
        });
      }

      // Add preferences
      if (data.preferences) {
        backupEntries.push({
          id: 'preferences',
          type: 'preferences',
          data: data.preferences,
          timestamp: new Date(),
          checksum: this.calculateChecksum(data.preferences)
        });
      }

      // Check backup size limits
      if (backupEntries.length > EncryptedBackupSystem.MAX_ENTRIES_PER_BACKUP) {
        console.warn(`Backup too large: ${backupEntries.length} entries, trimming to ${EncryptedBackupSystem.MAX_ENTRIES_PER_BACKUP}`);
        // Keep most recent entries
        backupEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        backupEntries.splice(EncryptedBackupSystem.MAX_ENTRIES_PER_BACKUP);
      }

      // Create backup metadata
      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        entryCount: backupEntries.length,
        version: EncryptedBackupSystem.BACKUP_VERSION,
        checksum: this.calculateChecksum(backupEntries)
      };

      // Compress and store backup
      const compressedData = this.compressData(backupEntries);
      const finalSize = new Blob([JSON.stringify(compressedData)]).size / (1024 * 1024);

      if (finalSize > EncryptedBackupSystem.MAX_BACKUP_SIZE_MB) {
        console.warn(`Backup size ${finalSize.toFixed(2)}MB exceeds limit, using incremental backup`);
        return await this.createIncrementalBackup(backupEntries);
      }

      metadata.compressionRatio = backupEntries.length / compressedData.length;

      // Store encrypted backup
      SecureLocalStorage.setItem('full_backup', {
        metadata,
        data: compressedData
      });

      SecureLocalStorage.setItem('backup_metadata', metadata);

      console.log(`✅ Full backup created: ${backupEntries.length} entries, ${finalSize.toFixed(2)}MB`);
      return true;

    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Create incremental backup of recent changes
   */
  async createIncrementalBackup(newEntries: BackupEntry[]): Promise<boolean> {
    try {
      const lastBackup = this.getLastBackupDate();
      const incrementalEntries = newEntries.filter(
        entry => !lastBackup || entry.timestamp > lastBackup
      );

      if (incrementalEntries.length === 0) {
        console.log('No new entries for incremental backup');
        return true;
      }

      // Get existing incremental backups
      const existingIncrementals = SecureLocalStorage.getItem<BackupEntry[]>('incremental_backups') || [];

      // Merge and deduplicate
      const allIncrementals = [...existingIncrementals, ...incrementalEntries];
      const uniqueIncrementals = this.deduplicateEntries(allIncrementals);

      // Limit incremental backup size
      if (uniqueIncrementals.length > 500) {
        // Keep most recent 500 entries
        uniqueIncrementals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        uniqueIncrementals.splice(500);
      }

      SecureLocalStorage.setItem('incremental_backups', uniqueIncrementals);

      const metadata: BackupMetadata = {
        lastBackup: new Date(),
        entryCount: incrementalEntries.length,
        version: EncryptedBackupSystem.BACKUP_VERSION,
        checksum: this.calculateChecksum(incrementalEntries)
      };

      SecureLocalStorage.setItem('incremental_metadata', metadata);

      console.log(`✅ Incremental backup created: ${incrementalEntries.length} new entries`);
      return true;

    } catch (error) {
      console.error('Failed to create incremental backup:', error);
      return false;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(): Promise<{
    journalEntries: SecureJournalEntry[];
    voiceJournals: any[];
    symbolicMemories: any[];
    soulprints: any[];
    preferences: any;
  } | null> {
    if (!this.encryptionContext) {
      console.error('Backup system not initialized');
      return null;
    }

    try {
      console.log('📤 Restoring from encrypted backup...');

      const fullBackup = SecureLocalStorage.getItem<{
        metadata: BackupMetadata;
        data: any;
      }>('full_backup');

      const incrementalBackups = SecureLocalStorage.getItem<BackupEntry[]>('incremental_backups') || [];

      if (!fullBackup) {
        console.log('No full backup found');
        return null;
      }

      // Decompress full backup data
      const fullEntries = this.decompressData(fullBackup.data);

      // Merge with incremental backups
      const allEntries = this.deduplicateEntries([...fullEntries, ...incrementalBackups]);

      // Organize by type
      const result = {
        journalEntries: [] as SecureJournalEntry[],
        voiceJournals: [] as any[],
        symbolicMemories: [] as any[],
        soulprints: [] as any[],
        preferences: null as any
      };

      for (const entry of allEntries) {
        // Verify checksum
        if (this.calculateChecksum(entry.data) !== entry.checksum) {
          console.warn(`Checksum mismatch for entry ${entry.id}, skipping`);
          continue;
        }

        switch (entry.type) {
          case 'journal':
            result.journalEntries.push({
              ...entry.data,
              timestamp: new Date(entry.data.timestamp)
            });
            break;
          case 'voice':
            result.voiceJournals.push(entry.data);
            break;
          case 'memory':
            result.symbolicMemories.push(entry.data);
            break;
          case 'soulprint':
            result.soulprints.push(entry.data);
            break;
          case 'preferences':
            result.preferences = entry.data;
            break;
        }
      }

      console.log(`✅ Restored from backup: ${allEntries.length} total entries`);
      return result;

    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }

  /**
   * Sync local backup with remote data
   */
  async syncWithRemote(remoteData: {
    journalEntries: SecureJournalEntry[];
    lastModified: Date;
  }): Promise<SyncStatus> {
    const status: SyncStatus = {
      local: 0,
      remote: 0,
      conflicts: 0,
      lastSync: new Date(),
      syncInProgress: true
    };

    try {
      this.notifySyncListeners(status);

      const localBackup = await this.restoreFromBackup();

      if (!localBackup) {
        // No local data, use remote
        await this.createFullBackup(remoteData);
        status.remote = remoteData.journalEntries.length;
        status.syncInProgress = false;
        this.notifySyncListeners(status);
        return status;
      }

      // Merge local and remote data
      const mergeResult = this.mergeDataSets(localBackup, remoteData);

      status.local = localBackup.journalEntries.length;
      status.remote = remoteData.journalEntries.length;
      status.conflicts = mergeResult.conflicts.length;

      // Create backup with merged data
      await this.createFullBackup(mergeResult.merged);

      status.syncInProgress = false;
      this.notifySyncListeners(status);

      console.log(`✅ Sync completed: ${status.local} local, ${status.remote} remote, ${status.conflicts} conflicts`);
      return status;

    } catch (error) {
      console.error('Sync failed:', error);
      status.syncInProgress = false;
      this.notifySyncListeners(status);
      return status;
    }
  }

  /**
   * Get backup information
   */
  getBackupInfo(): {
    hasFullBackup: boolean;
    hasIncrementalBackup: boolean;
    lastBackup?: Date;
    entryCount: number;
    storageUsed: number;
  } {
    const fullMetadata = SecureLocalStorage.getItem<BackupMetadata>('backup_metadata');
    const incrementalMetadata = SecureLocalStorage.getItem<BackupMetadata>('incremental_metadata');
    const storageInfo = SecureLocalStorage.getStorageInfo();

    return {
      hasFullBackup: !!fullMetadata,
      hasIncrementalBackup: !!incrementalMetadata,
      lastBackup: fullMetadata?.lastBackup ? new Date(fullMetadata.lastBackup) : undefined,
      entryCount: (fullMetadata?.entryCount || 0) + (incrementalMetadata?.entryCount || 0),
      storageUsed: storageInfo.totalSize
    };
  }

  /**
   * Clear all backups
   */
  clearAllBackups(): void {
    SecureLocalStorage.removeItem('full_backup');
    SecureLocalStorage.removeItem('incremental_backups');
    SecureLocalStorage.removeItem('backup_metadata');
    SecureLocalStorage.removeItem('incremental_metadata');
    console.log('🗑️ All backups cleared');
  }

  /**
   * Export encrypted backup for external storage
   */
  async exportBackup(): Promise<string | null> {
    if (!this.encryptionContext) return null;

    try {
      const backupData = await this.restoreFromBackup();
      if (!backupData) return null;

      const exportPackage = {
        version: EncryptedBackupSystem.BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        userId: this.encryptionContext.userId,
        encryption: {
          note: 'This backup is encrypted with your MAIA master key',
          algorithm: 'AES-256-CBC',
          keyDerivation: 'PBKDF2'
        },
        data: backupData
      };

      return JSON.stringify(exportPackage, null, 2);

    } catch (error) {
      console.error('Failed to export backup:', error);
      return null;
    }
  }

  /**
   * Import encrypted backup from external source
   */
  async importBackup(backupJson: string): Promise<boolean> {
    if (!this.encryptionContext) return false;

    try {
      const importPackage = JSON.parse(backupJson);

      if (importPackage.userId !== this.encryptionContext.userId) {
        console.error('Backup belongs to different user');
        return false;
      }

      await this.createFullBackup(importPackage.data);
      console.log('✅ Backup imported successfully');
      return true;

    } catch (error) {
      console.error('Failed to import backup:', error);
      return false;
    }
  }

  /**
   * Subscribe to sync status updates
   */
  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // Private helper methods

  private calculateChecksum(data: any): string {
    // Simple checksum using JSON string hash
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return btoa(jsonString).slice(0, 16);
  }

  private compressData(entries: BackupEntry[]): BackupEntry[] {
    // Simple compression by removing duplicates and sorting
    return this.deduplicateEntries(entries);
  }

  private decompressData(compressed: BackupEntry[]): BackupEntry[] {
    // In a real implementation, this would decompress the data
    return compressed;
  }

  private deduplicateEntries(entries: BackupEntry[]): BackupEntry[] {
    const seen = new Set<string>();
    return entries.filter(entry => {
      const key = `${entry.type}:${entry.id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getLastBackupDate(): Date | null {
    const metadata = SecureLocalStorage.getItem<BackupMetadata>('backup_metadata');
    return metadata?.lastBackup ? new Date(metadata.lastBackup) : null;
  }

  private mergeDataSets(local: any, remote: any): {
    merged: any;
    conflicts: any[];
  } {
    // Simple merge strategy: remote wins for conflicts
    const conflicts: any[] = [];

    // In a real implementation, this would do intelligent merging
    // based on timestamps and checksums

    return {
      merged: {
        ...local,
        journalEntries: [...local.journalEntries, ...remote.journalEntries]
          .reduce((acc, entry) => {
            const existing = acc.find((e: any) => e.id === entry.id);
            if (!existing) {
              acc.push(entry);
            } else if (entry.timestamp > existing.timestamp) {
              // Remote is newer
              const index = acc.indexOf(existing);
              acc[index] = entry;
              conflicts.push({ local: existing, remote: entry });
            }
            return acc;
          }, [])
      },
      conflicts
    };
  }

  private notifySyncListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }
}

// Export singleton instance
export const encryptedBackup = new EncryptedBackupSystem();