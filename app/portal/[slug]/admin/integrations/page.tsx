"use client";

/**
 * PRACTITIONER INTEGRATIONS PAGE
 *
 * Email integration configuration:
 * - Managed by Soullab (default)
 * - Bring your own Resend API key
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';

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
  warning: '#E5A858',
  error: '#D98B8B',
};

interface EmailIntegration {
  provider: 'managed' | 'resend';
  status: 'disconnected' | 'connected' | 'error';
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  apiKeyMasked?: string;
  lastError?: string | null;
}

export default function IntegrationsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();

  const [integration, setIntegration] = useState<EmailIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for BYO mode
  const [mode, setMode] = useState<'managed' | 'resend'>('managed');
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (authLoading || !practitionerId) return;
    fetchIntegration();
  }, [practitionerId, authLoading]);

  const fetchIntegration = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stellium/integrations/email');
      if (!response.ok) throw new Error('Failed to fetch integration');
      const data = await response.json();
      setIntegration(data.integration);

      // Populate form with existing config
      if (data.integration) {
        setMode(data.integration.provider);
        if (data.integration.provider === 'resend') {
          setFromEmail(data.integration.fromEmail || '');
          setFromName(data.integration.fromName || '');
          setReplyTo(data.integration.replyTo || '');
        }
      }
    } catch (err) {
      console.error('[Integrations] Error:', err);
      setError('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const body: Record<string, string | undefined> = { mode };

      if (mode === 'resend') {
        // Only include apiKey if user provided a new one
        if (apiKey) {
          body.apiKey = apiKey;
        } else if (!integration?.apiKeyMasked) {
          setError('API key is required');
          setSaving(false);
          return;
        }
        body.fromEmail = fromEmail;
        body.fromName = fromName || undefined;
        body.replyTo = replyTo || undefined;
      }

      const response = await fetch('/api/stellium/integrations/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save integration');
      }

      setIntegration(data.integration);
      setSuccess(data.message);
      setApiKey(''); // Clear API key after successful save
    } catch (err) {
      console.error('[Integrations] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Resend integration? Emails will be sent via Soullab.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/stellium/integrations/email', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      setIntegration(data.integration);
      setMode('managed');
      setApiKey('');
      setFromEmail('');
      setFromName('');
      setReplyTo('');
      setSuccess('Integration disconnected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-64 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl lg:text-3xl font-display"
          style={{ color: colors.starlight }}
        >
          Integrations
        </h1>
        <p className="mt-1" style={{ color: colors.muted }}>
          Configure how your portal communicates with clients
        </p>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl flex items-center space-x-3"
          style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />
          <p style={{ color: colors.error }}>{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl flex items-center space-x-3"
          style={{ backgroundColor: `${colors.success}20`, border: `1px solid ${colors.success}40` }}
        >
          <Check className="w-5 h-5" style={{ color: colors.success }} />
          <p style={{ color: colors.success }}>{success}</p>
        </motion.div>
      )}

      {/* Email Integration Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: `${colors.nebula}80`,
          border: `1px solid ${colors.stardust}`,
        }}
      >
        {/* Card Header */}
        <div
          className="p-6 border-b"
          style={{ borderColor: colors.stardust }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.violet}20 100%)`,
                }}
              >
                <Mail className="w-6 h-6" style={{ color: colors.gold }} />
              </div>
              <div>
                <h2 className="text-lg font-medium" style={{ color: colors.starlight }}>
                  Email Delivery
                </h2>
                <p className="text-sm" style={{ color: colors.muted }}>
                  How booking confirmations and notifications are sent
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  integration?.status === 'connected' ? 'animate-pulse' : ''
                }`}
                style={{
                  backgroundColor:
                    integration?.status === 'connected'
                      ? colors.success
                      : integration?.status === 'error'
                      ? colors.error
                      : colors.dim,
                }}
              />
              <span className="text-sm" style={{ color: colors.muted }}>
                {integration?.status === 'connected'
                  ? 'Active'
                  : integration?.status === 'error'
                  ? 'Error'
                  : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium" style={{ color: colors.muted }}>
              Email Provider
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Managed Option */}
              <button
                onClick={() => setMode('managed')}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: mode === 'managed' ? `${colors.gold}15` : `${colors.cosmos}80`,
                  border: `1px solid ${mode === 'managed' ? colors.gold : colors.stardust}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: colors.starlight }}>
                    Managed by Soullab
                  </span>
                  {mode === 'managed' && (
                    <Check className="w-4 h-4" style={{ color: colors.gold }} />
                  )}
                </div>
                <p className="text-sm" style={{ color: colors.dim }}>
                  We handle email delivery for you. Emails sent from bookings@soullab.life
                </p>
              </button>

              {/* BYO Resend Option */}
              <button
                onClick={() => setMode('resend')}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: mode === 'resend' ? `${colors.gold}15` : `${colors.cosmos}80`,
                  border: `1px solid ${mode === 'resend' ? colors.gold : colors.stardust}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: colors.starlight }}>
                    Your Own Domain
                  </span>
                  {mode === 'resend' && (
                    <Check className="w-4 h-4" style={{ color: colors.gold }} />
                  )}
                </div>
                <p className="text-sm" style={{ color: colors.dim }}>
                  Use your Resend API key to send from your own domain
                </p>
              </button>
            </div>
          </div>

          {/* BYO Resend Configuration */}
          {mode === 'resend' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4 border-t"
              style={{ borderColor: colors.stardust }}
            >
              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: colors.muted }}>
                    Resend API Key
                  </label>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center space-x-1 hover:underline"
                    style={{ color: colors.gold }}
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={integration?.apiKeyMasked || 're_xxxx...'}
                    className="w-full px-4 py-3 rounded-lg text-sm pr-10"
                    style={{
                      backgroundColor: colors.cosmos,
                      border: `1px solid ${colors.stardust}`,
                      color: colors.starlight,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.dim }}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {integration?.apiKeyMasked && !apiKey && (
                  <p className="text-xs" style={{ color: colors.dim }}>
                    Current key: {integration.apiKeyMasked} (leave blank to keep)
                  </p>
                )}
              </div>

              {/* From Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: colors.muted }}>
                  From Email *
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="hello@yourdomain.com"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.cosmos,
                    border: `1px solid ${colors.stardust}`,
                    color: colors.starlight,
                  }}
                />
                <p className="text-xs" style={{ color: colors.dim }}>
                  Must be from a domain verified in your Resend account
                </p>
              </div>

              {/* From Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: colors.muted }}>
                  From Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.cosmos,
                    border: `1px solid ${colors.stardust}`,
                    color: colors.starlight,
                  }}
                />
              </div>

              {/* Reply-To */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: colors.muted }}>
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="Optional - defaults to from email"
                  className="w-full px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: colors.cosmos,
                    border: `1px solid ${colors.stardust}`,
                    color: colors.starlight,
                  }}
                />
              </div>

              {/* Error Display */}
              {integration?.lastError && (
                <div
                  className="p-3 rounded-lg flex items-start space-x-2"
                  style={{ backgroundColor: `${colors.error}20` }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: colors.error }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.error }}>
                      Last Error
                    </p>
                    <p className="text-xs" style={{ color: colors.error }}>
                      {integration.lastError}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Card Footer */}
        <div
          className="p-6 border-t flex items-center justify-between"
          style={{ borderColor: colors.stardust }}
        >
          <div className="flex items-center space-x-2">
            {integration?.provider === 'resend' && mode === 'managed' && (
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80"
                style={{
                  backgroundColor: `${colors.error}20`,
                  color: colors.error,
                }}
              >
                Disconnect Resend
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchIntegration}
              disabled={saving}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: colors.dim }}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (mode === 'resend' && !fromEmail && !integration?.fromEmail)}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
              style={{
                backgroundColor: colors.gold,
                color: colors.void,
                opacity: saving || (mode === 'resend' && !fromEmail && !integration?.fromEmail) ? 0.5 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: `${colors.violet}10`,
          border: `1px solid ${colors.violet}30`,
        }}
      >
        <p className="text-sm" style={{ color: colors.violet }}>
          <strong>Note:</strong> Email integration affects booking confirmations, appointment reminders,
          and inquiry notifications sent to your clients. Your own admin notifications always come from Soullab.
        </p>
      </div>
    </div>
  );
}
