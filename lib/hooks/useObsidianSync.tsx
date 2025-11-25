'use client';

import { useState, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';

interface ObsidianSyncState {
  isConnected: boolean;
  lastSync: DateTime | null;
  totalSessions: number;
  pendingExports: number;
  vaultPath: string;
  status: 'idle' | 'syncing' | 'error' | 'success';
  error?: string;
}

interface ExportResult {
  success: boolean;
  sessionCount: number;
  exportedAt: string;
  error?: string;
}

export function useObsidianSync() {
  const [syncState, setSyncState] = useState<ObsidianSyncState>({
    isConnected: false,
    lastSync: null,
    totalSessions: 0,
    pendingExports: 0,
    vaultPath: '',
    status: 'idle'
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  // Check vault status on mount
  useEffect(() => {
    checkVaultStatus();

    // Set up auto-sync if enabled
    if (autoSyncEnabled) {
      const interval = setInterval(() => {
        syncRecentSessions();
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoSyncEnabled]);

  // Check if vault is initialized and get status
  const checkVaultStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/export/obsidian?action=vault_status');
      const data = await response.json();

      setSyncState(prev => ({
        ...prev,
        isConnected: data.vault_exists,
        totalSessions: data.statistics?.total_sessions || 0,
        vaultPath: data.vault_path,
        status: data.vault_exists ? 'idle' : 'error',
        error: data.vault_exists ? undefined : 'Vault not initialized'
      }));

      return data;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error',
        error: error.message
      }));
      throw error;
    }
  }, []);

  // Initialize the Obsidian vault
  const initializeVault = useCallback(async () => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));

    try {
      const response = await fetch('/api/export/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize_vault' })
      });

      const result = await response.json();

      if (result.success) {
        setSyncState(prev => ({
          ...prev,
          isConnected: true,
          status: 'success',
          error: undefined
        }));
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));
      throw error;
    }
  }, []);

  // Export a single session
  const exportSession = useCallback(async (sessionData: any): Promise<ExportResult> => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));

    try {
      const response = await fetch('/api/export/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_session',
          session_data: sessionData
        })
      });

      const result = await response.json();

      if (result.success) {
        setSyncState(prev => ({
          ...prev,
          status: 'success',
          totalSessions: prev.totalSessions + 1,
          lastSync: DateTime.now(),
          error: undefined
        }));

        return {
          success: true,
          sessionCount: 1,
          exportedAt: result.exported_at
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));

      return {
        success: false,
        sessionCount: 0,
        exportedAt: DateTime.now().toISO(),
        error: error.message
      };
    }
  }, []);

  // Sync recent sessions from database
  const syncRecentSessions = useCallback(async (sinceDate?: string): Promise<ExportResult> => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));

    try {
      const response = await fetch('/api/export/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_recent',
          since_date: sinceDate || DateTime.now().minus({ hours: 24 }).toISO()
        })
      });

      const result = await response.json();

      if (result.success) {
        setSyncState(prev => ({
          ...prev,
          status: 'success',
          totalSessions: prev.totalSessions + result.stats.successful_exports,
          lastSync: DateTime.now(),
          error: undefined
        }));

        return {
          success: true,
          sessionCount: result.stats.successful_exports,
          exportedAt: result.exported_at
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));

      return {
        success: false,
        sessionCount: 0,
        exportedAt: DateTime.now().toISO(),
        error: error.message
      };
    }
  }, []);

  // Batch export multiple sessions
  const batchExportSessions = useCallback(async (sessions: any[]): Promise<ExportResult> => {
    setSyncState(prev => ({ ...prev, status: 'syncing' }));

    try {
      const response = await fetch('/api/export/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_export',
          sessions
        })
      });

      const result = await response.json();

      if (result.success) {
        setSyncState(prev => ({
          ...prev,
          status: 'success',
          totalSessions: prev.totalSessions + result.stats.successful_exports,
          lastSync: DateTime.now(),
          error: undefined
        }));

        return {
          success: true,
          sessionCount: result.stats.successful_exports,
          exportedAt: result.exported_at
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));

      return {
        success: false,
        sessionCount: 0,
        exportedAt: DateTime.now().toISO(),
        error: error.message
      };
    }
  }, []);

  // Get export history
  const getExportHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/export/obsidian?action=export_history');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      return null;
    }
  }, []);

  // Auto-export hook for session completion
  const autoExportSession = useCallback(async (sessionData: any) => {
    if (!autoSyncEnabled || !syncState.isConnected) {
      return;
    }

    try {
      await exportSession(sessionData);
    } catch (error) {
      console.error('Auto-export failed:', error);
      // Don't throw - auto-export failures shouldn't break the main flow
    }
  }, [autoSyncEnabled, syncState.isConnected, exportSession]);

  return {
    // State
    syncState,
    autoSyncEnabled,

    // Actions
    checkVaultStatus,
    initializeVault,
    exportSession,
    syncRecentSessions,
    batchExportSessions,
    getExportHistory,
    autoExportSession,
    setAutoSyncEnabled,

    // Computed values
    isReady: syncState.isConnected && syncState.status !== 'error',
    isSyncing: syncState.status === 'syncing',
    hasError: syncState.status === 'error',
    lastSyncText: syncState.lastSync?.toRelative() || 'Never'
  };
}

// Higher-order component for automatic session export
export function withObsidianExport<T extends { sessionData?: any }>(
  Component: React.ComponentType<T>
) {
  return function ObsidianExportWrapper(props: T) {
    const { autoExportSession } = useObsidianSync();

    useEffect(() => {
      if (props.sessionData) {
        autoExportSession(props.sessionData);
      }
    }, [props.sessionData, autoExportSession]);

    return <Component {...props} />;
  };
}

// Custom hook for session-specific export status
export function useSessionExport(sessionId: string) {
  const [exportStatus, setExportStatus] = useState<{
    exported: boolean;
    exportedAt?: string;
    error?: string;
  }>({ exported: false });

  const { exportSession } = useObsidianSync();

  const exportThisSession = useCallback(async (sessionData: any) => {
    try {
      const result = await exportSession(sessionData);
      setExportStatus({
        exported: result.success,
        exportedAt: result.exportedAt,
        error: result.error
      });
      return result;
    } catch (error) {
      setExportStatus({
        exported: false,
        error: error.message
      });
      throw error;
    }
  }, [exportSession]);

  return {
    exportStatus,
    exportThisSession
  };
}