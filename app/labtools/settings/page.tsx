'use client';

/**
 * LabTools Settings - Control Room
 *
 * Configure preferences, privacy settings, and tool behaviors.
 * Uses sovereign amber/dark Cathedral aesthetic.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Shield,
  Palette,
  Database,
  Download,
  Trash2,
  Save,
  Sparkles,
  Eye,
  Volume2,
  Moon,
  Zap,
} from 'lucide-react';
import {
  PageShell,
  PortalHeader,
  SectionCard,
  ToggleSwitch,
  ActionButton,
  Divider,
} from '@/components/ui/portal';

interface LabToolsSettings {
  privacy: {
    saveReadings: boolean;
    shareAnalytics: boolean;
    localProcessing: boolean;
    dataRetention: string;
  };
  display: {
    theme: string;
    animations: boolean;
    soundEffects: boolean;
    notifications: boolean;
  };
  tools: {
    autoSaveJournal: boolean;
    defaultOracleSystem: string;
    voiceProvider: string;
    showBetaFeatures: boolean;
  };
}

export default function LabToolsSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<LabToolsSettings>({
    privacy: {
      saveReadings: true,
      shareAnalytics: false,
      localProcessing: true,
      dataRetention: '30days',
    },
    display: {
      theme: 'dark',
      animations: true,
      soundEffects: true,
      notifications: true,
    },
    tools: {
      autoSaveJournal: true,
      defaultOracleSystem: 'iching',
      voiceProvider: 'sovereign',
      showBetaFeatures: false,
    },
  });
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('labtools_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const updateSetting = <K extends keyof LabToolsSettings>(
    category: K,
    key: keyof LabToolsSettings[K],
    value: LabToolsSettings[K][keyof LabToolsSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('labtools_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maia-labtools-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all LabTools data? This cannot be undone.')) {
      localStorage.removeItem('labtools_settings');
      localStorage.removeItem('oracle_readings');
      localStorage.removeItem('journal_entries');
      localStorage.removeItem('voice_settings');
      setSettings({
        privacy: {
          saveReadings: true,
          shareAnalytics: false,
          localProcessing: true,
          dataRetention: '30days',
        },
        display: {
          theme: 'dark',
          animations: true,
          soundEffects: true,
          notifications: true,
        },
        tools: {
          autoSaveJournal: true,
          defaultOracleSystem: 'iching',
          voiceProvider: 'sovereign',
          showBetaFeatures: false,
        },
      });
    }
  };

  return (
    <PageShell maxWidth="4xl">
      <PortalHeader
        title="Settings"
        subtitle="Configure your LabTools experience"
        backPath="/labtools"
        backLabel="Back to LabTools"
        icon={<Settings className="w-6 h-6 text-orange-500" />}
        actions={
          <ActionButton
            onClick={handleSaveSettings}
            icon={<Save className="w-4 h-4" />}
            iconPosition="left"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </ActionButton>
        }
      />

      <div className="space-y-6">
        {/* Privacy & Security */}
        <SectionCard
          title="Privacy & Security"
          subtitle="Control how your data is handled"
          icon={<Shield className="w-5 h-5" />}
          variant="emerald"
          delay={0.1}
        >
          <div className="space-y-6">
            <ToggleSwitch
              checked={settings.privacy.saveReadings}
              onChange={(v) => updateSetting('privacy', 'saveReadings', v)}
              label="Save Oracle Readings"
              description="Keep history of divination sessions"
            />

            <ToggleSwitch
              checked={settings.privacy.localProcessing}
              onChange={(v) => updateSetting('privacy', 'localProcessing', v)}
              label="Local Processing"
              description="Process data locally when possible"
            />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Data Retention</div>
                <div className="text-xs text-white/50 mt-0.5">
                  How long to keep personal data
                </div>
              </div>
              <select
                value={settings.privacy.dataRetention}
                onChange={(e) => updateSetting('privacy', 'dataRetention', e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
              >
                <option value="7days">7 days</option>
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="forever">Keep forever</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Display & Interface */}
        <SectionCard
          title="Display & Interface"
          subtitle="Customize your visual experience"
          icon={<Palette className="w-5 h-5" />}
          variant="violet"
          delay={0.2}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-white/50" />
                <div>
                  <div className="text-sm font-medium text-white">Theme</div>
                  <div className="text-xs text-white/50 mt-0.5">Interface appearance</div>
                </div>
              </div>
              <select
                value={settings.display.theme}
                onChange={(e) => updateSetting('display', 'theme', e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
              >
                <option value="dark">Dark (Recommended)</option>
                <option value="light">Light</option>
                <option value="auto">System</option>
              </select>
            </div>

            <ToggleSwitch
              checked={settings.display.animations}
              onChange={(v) => updateSetting('display', 'animations', v)}
              label="Animations"
              description="Enable interface animations"
            />

            <ToggleSwitch
              checked={settings.display.soundEffects}
              onChange={(v) => updateSetting('display', 'soundEffects', v)}
              label="Sound Effects"
              description="Audio feedback for interactions"
            />

            <ToggleSwitch
              checked={settings.display.notifications}
              onChange={(v) => updateSetting('display', 'notifications', v)}
              label="Notifications"
              description="Receive alerts and reminders"
            />
          </div>
        </SectionCard>

        {/* Tool Defaults */}
        <SectionCard
          title="Tool Defaults"
          subtitle="Configure default behaviors"
          icon={<Zap className="w-5 h-5" />}
          variant="amber"
          delay={0.3}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Default Oracle System</div>
                <div className="text-xs text-white/50 mt-0.5">Primary divination method</div>
              </div>
              <select
                value={settings.tools.defaultOracleSystem}
                onChange={(e) => updateSetting('tools', 'defaultOracleSystem', e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
              >
                <option value="iching">I-Ching</option>
                <option value="tarot">Tarot</option>
                <option value="consciousness">Consciousness Oracle</option>
                <option value="holoflower">Holoflower</option>
              </select>
            </div>

            <ToggleSwitch
              checked={settings.tools.autoSaveJournal}
              onChange={(v) => updateSetting('tools', 'autoSaveJournal', v)}
              label="Auto-Save Journal"
              description="Automatically save journal entries"
            />

            <ToggleSwitch
              checked={settings.tools.showBetaFeatures}
              onChange={(v) => updateSetting('tools', 'showBetaFeatures', v)}
              label="Show Beta Features"
              description="Access experimental tools"
            />
          </div>
        </SectionCard>

        <Divider label="Data" />

        {/* Data Management */}
        <SectionCard
          title="Data Management"
          subtitle="Export or clear your data"
          icon={<Database className="w-5 h-5" />}
          variant="subtle"
          delay={0.4}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
              <div>
                <div className="text-sm font-medium text-white">Export Settings & Data</div>
                <div className="text-xs text-white/50 mt-0.5">
                  Download your LabTools configuration
                </div>
              </div>
              <ActionButton
                onClick={handleExportData}
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </ActionButton>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <div>
                <div className="text-sm font-medium text-white">Clear All Data</div>
                <div className="text-xs text-rose-300/60 mt-0.5">
                  Delete all LabTools data from this device
                </div>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30
                         border border-rose-500/30 text-rose-300 rounded-lg transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-xs text-amber-300/40">
          Settings are saved locally on your device.
          <br />
          Export your data regularly to prevent loss.
        </p>
      </footer>
    </PageShell>
  );
}
