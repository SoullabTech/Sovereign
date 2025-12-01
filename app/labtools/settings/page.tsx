'use client';

/**
 * LabTools Settings - Configure preferences, privacy settings, and tool behaviors
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Shield,
  Eye,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  Save
} from 'lucide-react';

export default function LabToolsSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    privacy: {
      saveReadings: true,
      shareAnalytics: false,
      localProcessing: true,
      dataRetention: '30days'
    },
    display: {
      theme: 'auto',
      animations: true,
      soundEffects: true,
      notifications: true
    },
    tools: {
      autoSaveJournal: true,
      defaultOracleSystem: 'iching',
      voiceProvider: 'openai',
      showBetaFeatures: false
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('labtools_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
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
    if (confirm('Are you sure you want to clear all LabTools data? This action cannot be undone.')) {
      localStorage.removeItem('labtools_settings');
      localStorage.removeItem('oracle_readings');
      localStorage.removeItem('journal_entries');
      localStorage.removeItem('voice_settings');
      alert('All LabTools data has been cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/labtools')}
              className="flex items-center space-x-2 text-soul-textSecondary hover:text-soul-textPrimary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to LabTools</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-soul-textPrimary">LabTools Settings</h1>
                <p className="text-soul-textSecondary text-sm">Configure preferences and privacy</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Privacy & Security */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-soul-textPrimary">Privacy & Security</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Save Oracle Readings</h3>
                  <p className="text-sm text-soul-textSecondary">Keep history of divination sessions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.saveReadings}
                    onChange={(e) => updateSetting('privacy', 'saveReadings', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Local Processing</h3>
                  <p className="text-sm text-soul-textSecondary">Process data locally when possible</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.localProcessing}
                    onChange={(e) => updateSetting('privacy', 'localProcessing', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Data Retention</h3>
                  <p className="text-sm text-soul-textSecondary">How long to keep personal data</p>
                </div>
                <select
                  value={settings.privacy.dataRetention}
                  onChange={(e) => updateSetting('privacy', 'dataRetention', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="7days">7 days</option>
                  <option value="30days">30 days</option>
                  <option value="90days">90 days</option>
                  <option value="1year">1 year</option>
                  <option value="forever">Keep forever</option>
                </select>
              </div>
            </div>
          </div>

          {/* Display & Interface */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-soul-textPrimary">Display & Interface</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Theme</h3>
                  <p className="text-sm text-soul-textSecondary">Interface appearance</p>
                </div>
                <select
                  value={settings.display.theme}
                  onChange={(e) => updateSetting('display', 'theme', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Animations</h3>
                  <p className="text-sm text-soul-textSecondary">Enable interface animations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.display.animations}
                    onChange={(e) => updateSetting('display', 'animations', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Sound Effects</h3>
                  <p className="text-sm text-soul-textSecondary">Audio feedback for interactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.display.soundEffects}
                    onChange={(e) => updateSetting('display', 'soundEffects', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Tool Defaults */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-soul-textPrimary">Tool Defaults</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Default Oracle System</h3>
                  <p className="text-sm text-soul-textSecondary">Primary divination method</p>
                </div>
                <select
                  value={settings.tools.defaultOracleSystem}
                  onChange={(e) => updateSetting('tools', 'defaultOracleSystem', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="iching">I-Ching</option>
                  <option value="tarot">Tarot</option>
                  <option value="consciousness">Consciousness Oracle</option>
                  <option value="holoflower">Holoflower</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Auto-Save Journal</h3>
                  <p className="text-sm text-soul-textSecondary">Automatically save journal entries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.tools.autoSaveJournal}
                    onChange={(e) => updateSetting('tools', 'autoSaveJournal', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Show Beta Features</h3>
                  <p className="text-sm text-soul-textSecondary">Access experimental tools</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.tools.showBetaFeatures}
                    onChange={(e) => updateSetting('tools', 'showBetaFeatures', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-soul-textPrimary">Data Management</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Export Settings & Data</h3>
                  <p className="text-sm text-soul-textSecondary">Download your LabTools configuration and data</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 rounded-lg transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-soul-textPrimary">Clear All Data</h3>
                  <p className="text-sm text-soul-textSecondary">Delete all LabTools data from this device</p>
                </div>
                <button
                  onClick={handleClearData}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-soul-textSecondary text-sm">
          <p>
            Settings are saved locally on your device.
            <br />
            Export your data regularly to prevent loss.
          </p>
        </div>
      </div>
    </div>
  );
}