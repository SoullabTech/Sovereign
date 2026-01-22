'use client';

/**
 * GENERATE INVITE BUTTON
 *
 * Admin component for generating a one-time invite code
 * that clients use to claim portal access.
 */

import { useState } from 'react';
import { Key, Copy, Check, RefreshCw, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  error: '#D98B8B',
};

interface Props {
  slug: string;
  clientId: string;
  clientName?: string;
  portalClaimed?: boolean;
}

export function GenerateInviteButton({ slug, clientId, clientName, portalClaimed }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setError(null);
    setCode(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/portal/${slug}/invites/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to generate invite');
        setLoading(false);
        return;
      }

      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // If already claimed, show status instead
  if (portalClaimed) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${colors.success}20` }}
          >
            <CheckCircle2 className="w-5 h-5" style={{ color: colors.success }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: colors.starlight }}>
              Portal Access Claimed
            </p>
            <p className="text-sm" style={{ color: colors.dim }}>
              {clientName || 'Client'} has access to their chart portal
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${colors.gold}20` }}
          >
            <Key className="w-5 h-5" style={{ color: colors.gold }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: colors.starlight }}>
              Portal Invite
            </p>
            <p className="text-sm" style={{ color: colors.dim }}>
              Generate a one-time code for chart access
            </p>
          </div>
        </div>

        {!code && (
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center space-x-2"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate</span>
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center space-x-2 mt-4 p-3 rounded-lg"
          style={{ backgroundColor: `${colors.error}20` }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.error }} />
          <span className="text-sm" style={{ color: colors.error }}>{error}</span>
        </div>
      )}

      {/* Code display */}
      {code && (
        <div className="mt-4 space-y-3">
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: `${colors.stardust}50` }}
          >
            <code
              className="font-mono text-lg tracking-wider"
              style={{ color: colors.gold }}
            >
              {code}
            </code>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg transition-colors flex items-center space-x-1"
              style={{
                backgroundColor: copied ? `${colors.success}20` : `${colors.violet}20`,
                color: copied ? colors.success : colors.violet,
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>

          {expiresAt && (
            <div className="flex items-center space-x-2 text-xs" style={{ color: colors.dim }}>
              <Clock className="w-3.5 h-3.5" />
              <span>Expires: {new Date(expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}</span>
            </div>
          )}

          <p className="text-xs" style={{ color: colors.muted }}>
            Share this code with {clientName || 'your client'}. They'll use it at{' '}
            <code className="px-1 py-0.5 rounded" style={{ backgroundColor: `${colors.stardust}50` }}>
              /portal/{slug}/claim
            </code>{' '}
            to set up their access.
          </p>

          <button
            onClick={generate}
            className="text-sm underline hover:no-underline"
            style={{ color: colors.violet }}
          >
            Generate new code (revokes this one)
          </button>
        </div>
      )}
    </div>
  );
}
