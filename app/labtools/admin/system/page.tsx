'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  ToggleLeft,
  ToggleRight,
  Lock,
  RefreshCw,
  Settings,
  AlertTriangle,
} from 'lucide-react';

// Simple password check - can be changed later
const ADMIN_PASSWORD = 'Mandala21';

interface SystemSetting {
  key: string;
  value: any;
  description: string;
  updated_at: string;
  updated_by: string;
}

export default function SystemAdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Check if already authenticated this session
  useEffect(() => {
    const auth = sessionStorage.getItem('maia_admin_auth');
    if (auth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Load settings when authenticated
  useEffect(() => {
    if (authenticated) {
      loadSettings();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('maia_admin_auth', 'true');
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: string, currentValue: boolean) => {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: !currentValue,
          updatedBy: 'admin',
        }),
      });

      if (res.ok) {
        // Update local state
        setSettings(prev =>
          prev.map(s => (s.key === key ? { ...s, value: !currentValue, updated_at: new Date().toISOString() } : s))
        );
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(null);
    }
  };

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
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-4">{passwordError}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-[#D4B896]/20 hover:bg-[#D4B896]/30 text-[#D4B896] rounded-lg transition-colors border border-[#D4B896]/30"
            >
              Enter
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
              <h1 className="text-2xl font-bold text-[#D4B896]">System Admin</h1>
              <p className="text-[#D4B896]/70">Feature flags and system controls</p>
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

        {/* Settings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-[#D4B896]/20">
            <h2 className="text-lg font-semibold text-[#D4B896]">System Settings</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-[#D4B896]/50 mx-auto animate-spin" />
            </div>
          ) : settings.length === 0 ? (
            <div className="p-8 text-center">
              <Settings className="w-12 h-12 text-[#D4B896]/50 mx-auto mb-4" />
              <p className="text-[#D4B896]/70">No settings found. Run the migration to create the system_settings table.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#D4B896]/10">
              {settings.map((setting) => (
                <div key={setting.key} className="p-4 hover:bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#D4B896] font-mono text-sm">{setting.key}</span>
                        {setting.key === 'limits_disabled' && setting.value === true && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[#D4B896]/60 text-sm mt-1">{setting.description}</p>
                      {setting.updated_at && (
                        <p className="text-[#D4B896]/40 text-xs mt-1">
                          Last updated: {new Date(setting.updated_at).toLocaleString()}
                          {setting.updated_by && ` by ${setting.updated_by}`}
                        </p>
                      )}
                    </div>

                    {/* Toggle for boolean settings */}
                    {typeof setting.value === 'boolean' && (
                      <button
                        onClick={() => toggleSetting(setting.key, setting.value)}
                        disabled={saving === setting.key}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                          setting.value
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800 border-[#D4B896]/20 text-[#D4B896]/60'
                        } ${saving === setting.key ? 'opacity-50' : 'hover:opacity-80'}`}
                      >
                        {saving === setting.key ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : setting.value ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {setting.value ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Testing Mode</h3>
              <p className="text-amber-400/80 text-sm">
                When <span className="font-mono">limits_disabled</span> is ON, all usage limits are bypassed.
                This is for beta testing only. Turn it off before public launch.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
