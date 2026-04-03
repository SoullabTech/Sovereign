'use client';

/**
 * OBSIDIAN CONNECT SECTION
 *
 * Configuration UI for the Obsidian vault connector.
 * Manages vault path, export folder, auto-export toggle, and test connection.
 */

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, AlertCircle, Loader2, FolderOpen, FileCheck } from 'lucide-react';
import type { ConnectorStatus } from '@/lib/connectors/types';

interface ObsidianConnectSectionProps {
  userId: string;
}

interface ObsidianStatus {
  connected: boolean;
  config: {
    vaultPath: string;
    exportFolder: string;
    autoExport: boolean;
  } | null;
  lastUsedAt: string | null;
  metadata: Record<string, unknown> | null;
}

export function ObsidianConnectSection({ userId }: ObsidianConnectSectionProps) {
  const [status, setStatus] = useState<ObsidianStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [vaultPath, setVaultPath] = useState('');
  const [exportFolder, setExportFolder] = useState('MAIA');
  const [autoExport, setAutoExport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/connectors/obsidian/status?userId=${encodeURIComponent(userId)}`);
      const data: ObsidianStatus = await res.json();
      setStatus(data);

      if (data.connected && data.config) {
        setVaultPath(data.config.vaultPath);
        setExportFolder(data.config.exportFolder);
        setAutoExport(data.config.autoExport);
      }
    } catch {
      setError('Failed to check Obsidian status');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!vaultPath.trim()) {
      setError('Vault path is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/connectors/obsidian/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vaultPath: vaultPath.trim(), exportFolder, autoExport }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save configuration');
        return;
      }

      setSuccess('Obsidian vault connected');
      setIsEditing(false);
      await checkStatus();
    } catch {
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/connectors/obsidian/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Test failed');
        return;
      }

      setSuccess(`Test file written: ${data.fileName}`);
    } catch {
      setError('Test connection failed');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Obsidian? Your vault files will not be deleted.')) return;

    try {
      setLoading(true);
      const res = await fetch('/api/connectors/obsidian/configure', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setStatus({ connected: false, config: null, lastUsedAt: null, metadata: null });
        setVaultPath('');
        setExportFolder('MAIA');
        setAutoExport(false);
        setIsEditing(false);
        setSuccess(null);
      }
    } catch {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-amber-200/60 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking Obsidian connection...</span>
      </div>
    );
  }

  const isConnected = status?.connected ?? false;

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-stone-200">Obsidian Vault</h4>
            <p className="text-xs text-stone-500">
              Export reflections, journal entries, and session notes as markdown.
            </p>
          </div>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <AlertCircle className="w-3 h-3" /> Not connected
          </span>
        )}
      </div>

      {/* Capability tags when connected */}
      {isConnected && (
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-purple-600/10 text-purple-300/70 rounded-full">
            Export markdown
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-purple-600/10 text-purple-300/70 rounded-full">
            Export transcripts
          </span>
        </div>
      )}

      {/* Connected view */}
      {isConnected && !isEditing && (
        <div className="space-y-2">
          <div className="text-xs text-stone-400 space-y-1">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3 h-3" />
              <span>{status?.config?.vaultPath}/{status?.config?.exportFolder}</span>
            </div>
            {autoExport && (
              <div className="flex items-center gap-2">
                <FileCheck className="w-3 h-3" />
                <span>Auto-export after sessions</span>
              </div>
            )}
            {status?.metadata?.exportCount != null && (
              <p className="text-[10px] text-stone-600">
                {String(status.metadata.exportCount)} exports
                {status.lastUsedAt && ` · Last: ${new Date(status.lastUsedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 px-3 py-2 text-sm text-purple-200 bg-purple-600/20
                         hover:bg-purple-600/30 rounded-lg transition-colors disabled:opacity-50
                         flex items-center justify-center gap-1"
            >
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Test
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-3 py-2 text-sm text-stone-300 bg-stone-800/50
                         hover:bg-stone-700/50 rounded-lg transition-colors"
            >
              Settings
            </button>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full px-3 py-1.5 text-xs text-stone-500 hover:text-stone-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Config form (new setup or editing) */}
      {(!isConnected || isEditing) && (
        <div className="space-y-3">
          {/* Vault path */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Vault Path</label>
            <input
              type="text"
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              placeholder="/Users/you/ObsidianVault"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm placeholder-stone-600
                         focus:border-purple-500/50 focus:outline-none"
            />
            <p className="text-[10px] text-stone-600 mt-1">
              Absolute path to your Obsidian vault folder.
            </p>
          </div>

          {/* Export folder */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Export Folder</label>
            <input
              type="text"
              value={exportFolder}
              onChange={(e) => setExportFolder(e.target.value)}
              placeholder="MAIA"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm placeholder-stone-600
                         focus:border-purple-500/50 focus:outline-none"
            />
            <p className="text-[10px] text-stone-600 mt-1">
              Subfolder within the vault for MAIA exports.
            </p>
          </div>

          {/* Auto-export toggle */}
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-sm text-stone-300">Auto-export after sessions</span>
              <p className="text-[10px] text-stone-600">
                Automatically write a summary to your vault after each conversation.
              </p>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${
                autoExport ? 'bg-purple-600' : 'bg-stone-700'
              }`}
              onClick={() => setAutoExport(!autoExport)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoExport ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !vaultPath.trim()}
              className="flex-1 px-3 py-2 text-sm text-amber-100 bg-amber-600/30
                         hover:bg-amber-600/50 rounded-lg transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {isConnected ? 'Save' : 'Connect'}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (status?.config) {
                    setVaultPath(status.config.vaultPath);
                    setExportFolder(status.config.exportFolder);
                    setAutoExport(status.config.autoExport);
                  }
                }}
                className="px-3 py-2 text-sm text-stone-400 bg-stone-800/50
                           hover:bg-stone-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">{success}</p>}

      {/* Privacy note */}
      {!isConnected && !isEditing && (
        <p className="text-xs text-stone-600 text-center">
          Write-only: MAIA exports to your vault. No files are read or synced back.
        </p>
      )}
    </div>
  );
}

export default ObsidianConnectSection;
