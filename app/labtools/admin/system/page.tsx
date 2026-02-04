'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Lock,
  RefreshCw,
  Settings,
  AlertTriangle,
  Pause,
  Bell,
  Mic,
  Brain,
  X,
  Check,
  Edit2,
} from 'lucide-react';

interface SystemSetting {
  key: string;
  value: any;
  description: string;
  updated_at: string;
  updated_by: string;
}

// Setting categories for better organization
const SETTING_CATEGORIES = {
  'System Control': ['maintenance_mode', 'global_banner'],
  'Feature Flags': ['limits_disabled', 'voice_enabled', 'memory_write_enabled', 'journal_enabled'],
};

const SETTING_ICONS: Record<string, any> = {
  maintenance_mode: Pause,
  global_banner: Bell,
  limits_disabled: AlertTriangle,
  voice_enabled: Mic,
  memory_write_enabled: Brain,
  journal_enabled: Edit2,
};

export default function SystemAdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // For editing complex settings
  const [editingBanner, setEditingBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLevel, setBannerLevel] = useState<'info' | 'warn'>('info');

  const [editingMaintenance, setEditingMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Check if already authenticated this session
  useEffect(() => {
    const token = sessionStorage.getItem('maia_admin_token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  // Load settings when authenticated
  useEffect(() => {
    if (authenticated) {
      loadSettings();
    }
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('maia_admin_token', data.token);
        setAuthenticated(true);
      } else {
        setPasswordError(data.error || 'Authentication failed');
        if (data.attemptsRemaining !== undefined) {
          setPasswordError(`${data.error}. ${data.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (error) {
      setPasswordError('Connection error. Try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);

        // Initialize edit states from loaded settings
        const banner = data.settings?.find((s: SystemSetting) => s.key === 'global_banner');
        if (banner?.value) {
          setBannerText(banner.value.text || '');
          setBannerLevel(banner.value.level || 'info');
        }

        const maint = data.settings?.find((s: SystemSetting) => s.key === 'maintenance_mode');
        if (maint?.value) {
          setMaintenanceMessage(maint.value.message || '');
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, updatedBy: 'admin' }),
      });

      if (res.ok) {
        setSettings(prev =>
          prev.map(s => (s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s))
        );
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(null);
    }
  };

  const toggleBooleanSetting = (key: string, currentValue: boolean) => {
    updateSetting(key, !currentValue);
  };

  const toggleMaintenanceMode = () => {
    const current = settings.find(s => s.key === 'maintenance_mode')?.value;
    const enabled = current?.enabled || false;

    updateSetting('maintenance_mode', {
      enabled: !enabled,
      message: maintenanceMessage || 'MAIA is taking a brief pause. Back soon.',
    });
  };

  const toggleGlobalBanner = () => {
    const current = settings.find(s => s.key === 'global_banner')?.value;
    const enabled = current?.enabled || false;

    updateSetting('global_banner', {
      enabled: !enabled,
      text: bannerText || '',
      level: bannerLevel,
      dismissible: true,
    });
  };

  const saveBannerSettings = () => {
    const current = settings.find(s => s.key === 'global_banner')?.value;
    updateSetting('global_banner', {
      ...current,
      text: bannerText,
      level: bannerLevel,
    });
    setEditingBanner(false);
  };

  const saveMaintenanceSettings = () => {
    const current = settings.find(s => s.key === 'maintenance_mode')?.value;
    updateSetting('maintenance_mode', {
      ...current,
      message: maintenanceMessage,
    });
    setEditingMaintenance(false);
  };

  const getSetting = (key: string) => settings.find(s => s.key === key);

  // Password screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl p-8 max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#D4B896]/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#D4B896]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#D4B896]">Admin Access</h1>
              <p className="text-[#D4B896]/60 text-sm">System configuration</p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-slate-800 border border-[#D4B896]/30 text-[#D4B896] rounded-lg focus:outline-none focus:border-[#D4B896] transition-colors mb-4"
              autoFocus
              disabled={loginLoading}
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-4">{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-3 bg-[#D4B896]/20 hover:bg-[#D4B896]/30 text-[#D4B896] rounded-lg transition-colors border border-[#D4B896]/30 disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Enter'}
            </button>
          </form>

          <button
            onClick={() => router.push('/labtools')}
            className="mt-4 w-full px-4 py-2 text-[#D4B896]/60 hover:text-[#D4B896] transition-colors text-sm"
          >
            Back to Lab Tools
          </button>
        </motion.div>
      </div>
    );
  }

  const maintenanceSetting = getSetting('maintenance_mode');
  const bannerSetting = getSetting('global_banner');

  // Main admin UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/labtools')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                       border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Lab Tools
            </button>
            <div className="w-px h-6 bg-[#D4B896]/30" />
            <div className="w-12 h-12 bg-[#D4B896]/20 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-[#D4B896]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#D4B896]">Admin Cockpit</h1>
              <p className="text-[#D4B896]/70">Beta testing controls</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSettings}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#D4B896]/10 hover:bg-[#D4B896]/20 text-[#D4B896] rounded-lg transition-colors border border-[#D4B896]/20 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Maintenance Mode Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`bg-slate-900/80 backdrop-blur-md border rounded-xl p-5 mb-4 ${
            maintenanceSetting?.value?.enabled
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-[#D4B896]/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                maintenanceSetting?.value?.enabled ? 'bg-red-500/20' : 'bg-[#D4B896]/10'
              }`}>
                <Pause className={`w-5 h-5 ${maintenanceSetting?.value?.enabled ? 'text-red-400' : 'text-[#D4B896]'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-[#D4B896] font-semibold">Maintenance Mode</h3>
                <p className="text-[#D4B896]/60 text-sm mt-1">
                  Block new sessions. Existing sessions can finish their current message.
                </p>

                {editingMaintenance ? (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="MAIA is taking a brief pause. Back soon."
                      className="w-full px-3 py-2 bg-slate-800 border border-[#D4B896]/30 text-[#D4B896] rounded-lg text-sm focus:outline-none focus:border-[#D4B896]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveMaintenanceSettings}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingMaintenance(false)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-[#D4B896]/60 rounded-lg text-sm border border-[#D4B896]/20"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[#D4B896]/50 text-xs">Message:</span>
                    <span className="text-[#D4B896]/80 text-sm">
                      {maintenanceSetting?.value?.message || 'MAIA is taking a brief pause. Back soon.'}
                    </span>
                    <button
                      onClick={() => setEditingMaintenance(true)}
                      className="text-[#D4B896]/40 hover:text-[#D4B896] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleMaintenanceMode}
              disabled={saving === 'maintenance_mode'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                maintenanceSetting?.value?.enabled
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
              } ${saving === 'maintenance_mode' ? 'opacity-50' : 'hover:opacity-80'}`}
            >
              {saving === 'maintenance_mode' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : maintenanceSetting?.value?.enabled ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {maintenanceSetting?.value?.enabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Global Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-slate-900/80 backdrop-blur-md border rounded-xl p-5 mb-4 ${
            bannerSetting?.value?.enabled
              ? bannerSetting?.value?.level === 'warn'
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-blue-500/50 bg-blue-500/5'
              : 'border-[#D4B896]/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                bannerSetting?.value?.enabled
                  ? bannerSetting?.value?.level === 'warn' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  : 'bg-[#D4B896]/10'
              }`}>
                <Bell className={`w-5 h-5 ${
                  bannerSetting?.value?.enabled
                    ? bannerSetting?.value?.level === 'warn' ? 'text-amber-400' : 'text-blue-400'
                    : 'text-[#D4B896]'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-[#D4B896] font-semibold">Global Banner</h3>
                <p className="text-[#D4B896]/60 text-sm mt-1">
                  Show announcement to all users at the top of the screen.
                </p>

                {editingBanner ? (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="Welcome beta testers! Report bugs via..."
                      className="w-full px-3 py-2 bg-slate-800 border border-[#D4B896]/30 text-[#D4B896] rounded-lg text-sm focus:outline-none focus:border-[#D4B896]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBannerLevel('info')}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          bannerLevel === 'info'
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                            : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
                        }`}
                      >
                        Info
                      </button>
                      <button
                        onClick={() => setBannerLevel('warn')}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          bannerLevel === 'warn'
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
                        }`}
                      >
                        Warning
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveBannerSettings}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30"
                      >
                        <Check className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingBanner(false)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-[#D4B896]/60 rounded-lg text-sm border border-[#D4B896]/20"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[#D4B896]/50 text-xs">Text:</span>
                    <span className="text-[#D4B896]/80 text-sm">
                      {bannerSetting?.value?.text || '(not set)'}
                    </span>
                    <button
                      onClick={() => setEditingBanner(true)}
                      className="text-[#D4B896]/40 hover:text-[#D4B896] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleGlobalBanner}
              disabled={saving === 'global_banner' || !bannerText}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                bannerSetting?.value?.enabled
                  ? bannerSetting?.value?.level === 'warn'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
              } ${(saving === 'global_banner' || !bannerText) ? 'opacity-50' : 'hover:opacity-80'}`}
            >
              {saving === 'global_banner' ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : bannerSetting?.value?.enabled ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {bannerSetting?.value?.enabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Feature Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl overflow-hidden mb-4"
        >
          <div className="p-4 border-b border-[#D4B896]/20">
            <h2 className="text-lg font-semibold text-[#D4B896]">Feature Flags</h2>
            <p className="text-[#D4B896]/60 text-sm">Toggle capabilities on/off</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-[#D4B896]/50 mx-auto animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-[#D4B896]/10">
              {settings
                .filter(s => typeof s.value === 'boolean')
                .map((setting) => {
                  const Icon = SETTING_ICONS[setting.key] || Settings;
                  const isActive = setting.value === true;
                  const isDanger = setting.key === 'limits_disabled';

                  return (
                    <div key={setting.key} className="p-4 hover:bg-slate-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive
                              ? isDanger ? 'bg-amber-500/20' : 'bg-green-500/20'
                              : 'bg-[#D4B896]/10'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isActive
                                ? isDanger ? 'text-amber-400' : 'text-green-400'
                                : 'text-[#D4B896]/60'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#D4B896] font-mono text-sm">{setting.key}</span>
                              {isDanger && isActive && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                                  <AlertTriangle className="w-3 h-3" />
                                  Testing
                                </span>
                              )}
                            </div>
                            <p className="text-[#D4B896]/50 text-xs mt-0.5">{setting.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleBooleanSetting(setting.key, setting.value)}
                          disabled={saving === setting.key}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${
                            isActive
                              ? isDanger
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                : 'bg-green-500/20 border-green-500/30 text-green-400'
                              : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
                          } ${saving === setting.key ? 'opacity-50' : 'hover:opacity-80'}`}
                        >
                          {saving === setting.key ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {isActive ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>

        {/* Quick Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[#D4B896]/70 text-sm">System Status</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#D4B896]/50">
              <span>
                Maintenance: {maintenanceSetting?.value?.enabled ? '🔴 ON' : '🟢 OFF'}
              </span>
              <span>
                Banner: {bannerSetting?.value?.enabled ? '🔵 ON' : '⚫ OFF'}
              </span>
              <span>
                Limits: {getSetting('limits_disabled')?.value ? '🟡 DISABLED' : '🟢 ACTIVE'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
