'use client';

/**
 * CALDAV CONNECT SECTION
 *
 * Configuration UI for CalDAV calendar connections.
 * Supports provider presets (Proton, Nextcloud, Fastmail, iCloud)
 * with auto-filled URLs and per-provider help text.
 */

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

const PRESETS: Record<string, { url: string; help: string }> = {
  proton: { url: 'https://calendar.proton.me/api/calendars', help: 'Requires Proton Bridge running locally.' },
  nextcloud: { url: '', help: 'Use your server URL + /remote.php/dav' },
  fastmail: { url: 'https://caldav.fastmail.com/dav', help: 'Use an app-specific password from Settings > Privacy & Security.' },
  icloud: { url: 'https://caldav.icloud.com', help: 'Use an app-specific password from appleid.apple.com.' },
  other: { url: '', help: 'Enter your CalDAV server URL.' },
};

const PROVIDER_LABELS: Record<string, string> = {
  proton: 'Proton Calendar',
  nextcloud: 'Nextcloud',
  fastmail: 'Fastmail',
  icloud: 'iCloud',
  other: 'Other CalDAV Server',
};

interface CalDAVStatus {
  connected: boolean;
  config: {
    provider: string;
    serverUrl: string;
    username: string;
    defaultCalendarUrl: string | null;
  } | null;
  metadata: {
    calendars?: Array<{ url: string; displayName: string; color?: string }>;
    lastVerifiedAt?: string;
    health?: string;
  } | null;
  lastUsedAt: string | null;
}

interface CalDAVConnectSectionProps {
  userId: string;
}

export function CalDAVConnectSection({ userId }: CalDAVConnectSectionProps) {
  const [status, setStatus] = useState<CalDAVStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [provider, setProvider] = useState('proton');
  const [serverUrl, setServerUrl] = useState(PRESETS.proton.url);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [defaultCalendarUrl, setDefaultCalendarUrl] = useState<string | null>(null);
  const [discoveredCalendars, setDiscoveredCalendars] = useState<Array<{ url: string; displayName: string }>>([]);

  useEffect(() => { checkStatus(); }, [userId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/connectors/caldav/status?userId=${encodeURIComponent(userId)}`);
      const data: CalDAVStatus = await res.json();
      setStatus(data);

      if (data.connected && data.config) {
        setProvider(data.config.provider || 'other');
        setServerUrl(data.config.serverUrl);
        setUsername(data.config.username);
        setDefaultCalendarUrl(data.config.defaultCalendarUrl);
        if (data.metadata?.calendars) {
          setDiscoveredCalendars(data.metadata.calendars);
        }
      }
    } catch {
      setError('Failed to check CalDAV status');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const preset = PRESETS[newProvider];
    if (preset?.url) setServerUrl(preset.url);
    else setServerUrl('');
  };

  const handleTest = async () => {
    if (!serverUrl || !username || !password) {
      setError('All fields are required');
      return;
    }
    try {
      setTesting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/connectors/caldav/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverUrl, username, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(`Connection successful${data.displayName ? `: ${data.displayName}` : ''}`);
      } else {
        setError(data.error || 'Connection test failed');
      }
    } catch {
      setError('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!serverUrl || !username || !password) {
      setError('All fields are required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/connectors/caldav/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, provider, serverUrl, username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }

      setSuccess(data.message || 'CalDAV connected');
      setDiscoveredCalendars(data.calendars || []);
      setIsEditing(false);
      setPassword(''); // clear password from UI
      await checkStatus();
    } catch {
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (calUrl: string) => {
    try {
      const res = await fetch('/api/connectors/caldav/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, calendarUrl: calUrl }),
      });
      if (res.ok) {
        setDefaultCalendarUrl(calUrl);
        setSuccess('Default calendar updated');
      }
    } catch {
      setError('Failed to set default calendar');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect CalDAV? Your calendar data will not be deleted.')) return;
    try {
      setLoading(true);
      await fetch('/api/connectors/caldav/configure', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setStatus({ connected: false, config: null, metadata: null, lastUsedAt: null });
      setPassword('');
      setDiscoveredCalendars([]);
      setIsEditing(false);
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
        <span className="text-sm">Checking CalDAV connection...</span>
      </div>
    );
  }

  const isConnected = status?.connected ?? false;
  const preset = PRESETS[provider];

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-stone-200">CalDAV Calendar</h4>
            <p className="text-xs text-stone-500">
              {isConnected
                ? `${PROVIDER_LABELS[status?.config?.provider ?? 'other'] ?? 'CalDAV'} — ${status?.config?.username}`
                : 'Proton, Nextcloud, Fastmail, iCloud, or any CalDAV server.'}
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

      {/* Capability tags */}
      {isConnected && (
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-blue-600/10 text-blue-300/70 rounded-full">
            Create events
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-blue-600/10 text-blue-300/70 rounded-full">
            Read calendar
          </span>
        </div>
      )}

      {/* Connected: show calendars + actions */}
      {isConnected && !isEditing && (
        <div className="space-y-2">
          {/* Calendar list */}
          {discoveredCalendars.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">Calendars</p>
              {discoveredCalendars.map((cal) => (
                <div key={cal.url} className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {cal.displayName}
                  </span>
                  {cal.url === defaultCalendarUrl ? (
                    <span className="text-[10px] text-emerald-400">default</span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(cal.url)}
                      className="text-[10px] text-stone-600 hover:text-stone-400"
                    >
                      set default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {status?.metadata?.lastVerifiedAt && (
            <p className="text-[10px] text-stone-600">
              Verified: {new Date(status.metadata.lastVerifiedAt).toLocaleDateString()}
              {status.lastUsedAt && ` · Last used: ${new Date(status.lastUsedAt).toLocaleDateString()}`}
            </p>
          )}

          <div className="flex gap-2">
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

      {/* Config form */}
      {(!isConnected || isEditing) && (
        <div className="space-y-3">
          {/* Provider selector */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Calendar Service</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm focus:border-blue-500/50 focus:outline-none
                         appearance-none cursor-pointer"
            >
              {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Provider-specific help */}
          {preset?.help && (
            <p className="text-[10px] text-amber-300/60 bg-amber-600/10 px-2 py-1 rounded">
              {preset.help}
            </p>
          )}

          {/* Server URL */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Server URL</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://caldav.example.com"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm placeholder-stone-600
                         focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm placeholder-stone-600
                         focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-stone-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isConnected ? '••••••••' : 'App-specific password'}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-stone-200 text-sm placeholder-stone-600
                         focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={testing || !serverUrl || !username || !password}
              className="flex-1 px-3 py-2 text-sm text-blue-200 bg-blue-600/20
                         hover:bg-blue-600/30 rounded-lg transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Test
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !serverUrl || !username || !password}
              className="flex-1 px-3 py-2 text-sm text-amber-100 bg-amber-600/30
                         hover:bg-amber-600/50 rounded-lg transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {isConnected ? 'Save' : 'Connect'}
            </button>
          </div>

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setPassword('');
                if (status?.config) {
                  setProvider(status.config.provider || 'other');
                  setServerUrl(status.config.serverUrl);
                  setUsername(status.config.username);
                }
              }}
              className="w-full px-3 py-1.5 text-xs text-stone-500 hover:text-stone-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">{success}</p>}
    </div>
  );
}

export default CalDAVConnectSection;
