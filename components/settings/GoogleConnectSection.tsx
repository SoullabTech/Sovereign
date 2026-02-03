'use client';

import { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  email: string | null;
  calendars?: Array<{ id: string; summary: string; primary?: boolean }>;
}

interface GoogleConnectSectionProps {
  userId: string;
}

export function GoogleConnectSection({ userId }: GoogleConnectSectionProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check Gmail/Calendar connection
      const response = await fetch(`/api/auth/google/status?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();

      setStatus({
        connected: data.connected,
        email: data.email,
        calendars: data.calendars,
      });
    } catch (err) {
      console.error('Failed to check Google status:', err);
      setError('Failed to check connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/auth/google/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Failed to start Google connect:', err);
      setError('Failed to connect to Google');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google? You won\'t be able to send emails or create calendar events until you reconnect.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setStatus({ connected: false, email: null });
      } else {
        setError('Failed to disconnect');
      }
    } catch (err) {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-amber-200/60">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status?.connected ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-sm text-amber-100">
            {status?.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        {status?.connected && status.email && (
          <span className="text-xs text-amber-200/60">{status.email}</span>
        )}
      </div>

      {/* Features enabled when connected */}
      {status?.connected && (
        <div className="flex gap-4 text-xs text-amber-200/60">
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span>Send emails</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Create events</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Connect/Disconnect button */}
      {status?.connected ? (
        <button
          onClick={handleDisconnect}
          className="w-full px-3 py-2 text-sm text-amber-200/80 bg-stone-800/50
                     hover:bg-stone-700/50 rounded-lg transition-colors"
        >
          Disconnect Google
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full px-3 py-2 text-sm text-amber-100 bg-amber-600/30
                     hover:bg-amber-600/50 rounded-lg transition-colors
                     flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect Google Account
            </>
          )}
        </button>
      )}

      {/* Privacy note */}
      {!status?.connected && (
        <p className="text-xs text-amber-200/40 text-center">
          Enables sending emails and creating calendar events directly from MAIA
        </p>
      )}
    </div>
  );
}
