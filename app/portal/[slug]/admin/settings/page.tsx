"use client";

/**
 * PRACTITIONER ADMIN SETTINGS
 *
 * Portal configuration including:
 * - Portal status (draft/live)
 * - Brand settings (future)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
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

export default function AdminSettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { practitionerId, practitioner } = usePractitionerAuth();

  const [portalStatus, setPortalStatus] = useState<'draft' | 'live'>('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortalStatus();
  }, [practitionerId]);

  const fetchPortalStatus = async () => {
    if (!practitionerId) return;

    try {
      const response = await fetch(`/api/portal/${slug}/config`);
      if (response.ok) {
        const data = await response.json();
        const config = data.data?.config || data.config;
        setPortalStatus(config.portal_status || 'draft');
      }
    } catch (err) {
      console.error('[Settings] Failed to fetch portal status:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePortalStatus = async (newStatus: 'draft' | 'live') => {
    if (!practitionerId) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/portal/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitioner_id: practitionerId,
          portal_status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update portal status');
      }

      setPortalStatus(newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[Settings] Failed to update portal status:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-48 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl lg:text-3xl font-display"
          style={{ color: colors.starlight }}
        >
          Portal Settings
        </h1>
        <p className="mt-1" style={{ color: colors.muted }}>
          Configure your client-facing portal
        </p>
      </motion.div>

      {/* Portal Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl p-6"
        style={{
          backgroundColor: `${colors.nebula}80`,
          border: `1px solid ${colors.stardust}`,
        }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.violet}20 100%)`,
              }}
            >
              <Globe className="w-6 h-6" style={{ color: colors.gold }} />
            </div>
            <div>
              <h2 className="text-lg font-medium" style={{ color: colors.starlight }}>
                Portal Visibility
              </h2>
              <p className="text-sm" style={{ color: colors.muted }}>
                Control who can see your portal
              </p>
            </div>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: `${colors.success}20`, color: colors.success }}
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </motion.div>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg flex items-center space-x-2"
            style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Draft Option */}
          <button
            onClick={() => updatePortalStatus('draft')}
            disabled={saving}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
            style={{
              backgroundColor: portalStatus === 'draft' ? `${colors.gold}15` : `${colors.stardust}50`,
              border: `1px solid ${portalStatus === 'draft' ? colors.gold : colors.stardust}`,
            }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: portalStatus === 'draft' ? `${colors.gold}20` : `${colors.stardust}`,
                }}
              >
                <EyeOff
                  className="w-5 h-5"
                  style={{ color: portalStatus === 'draft' ? colors.gold : colors.dim }}
                />
              </div>
              <div className="text-left">
                <p
                  className="font-medium"
                  style={{ color: portalStatus === 'draft' ? colors.gold : colors.starlight }}
                >
                  Draft (Private Preview)
                </p>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Only visible to you. Shows a "Private Preview" banner.
                </p>
              </div>
            </div>
            {portalStatus === 'draft' && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.gold }}
              >
                <Check className="w-4 h-4" style={{ color: colors.void }} />
              </div>
            )}
          </button>

          {/* Live Option */}
          <button
            onClick={() => updatePortalStatus('live')}
            disabled={saving}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
            style={{
              backgroundColor: portalStatus === 'live' ? `${colors.success}15` : `${colors.stardust}50`,
              border: `1px solid ${portalStatus === 'live' ? colors.success : colors.stardust}`,
            }}
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: portalStatus === 'live' ? `${colors.success}20` : `${colors.stardust}`,
                }}
              >
                <Eye
                  className="w-5 h-5"
                  style={{ color: portalStatus === 'live' ? colors.success : colors.dim }}
                />
              </div>
              <div className="text-left">
                <p
                  className="font-medium"
                  style={{ color: portalStatus === 'live' ? colors.success : colors.starlight }}
                >
                  Live (Public)
                </p>
                <p className="text-sm" style={{ color: colors.muted }}>
                  Visible to everyone. Your portal is live and discoverable.
                </p>
              </div>
            </div>
            {portalStatus === 'live' && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.success }}
              >
                <Check className="w-4 h-4" style={{ color: colors.void }} />
              </div>
            )}
          </button>
        </div>

        {saving && (
          <div className="mt-4 flex items-center justify-center space-x-2" style={{ color: colors.muted }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}

        {/* Current Portal URL */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.stardust }}>
          <p className="text-xs mb-2" style={{ color: colors.dim }}>
            Your portal URL
          </p>
          <a
            href={`https://${slug}.soullab.life`}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline hover:no-underline"
            style={{ color: colors.violet }}
          >
            https://{slug}.soullab.life
          </a>
        </div>
      </motion.div>
    </div>
  );
}
