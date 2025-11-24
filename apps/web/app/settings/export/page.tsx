'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { voiceJournalingService } from '@/lib/journaling/VoiceJournalingService';
import { obsidianExporter } from '@/lib/export/ObsidianExporter';
import { Download, FileText, Settings, Check, AlertCircle, Folder } from 'lucide-react';
import Link from 'next/link';

export default function ExportSettingsPage() {
  const [sessionCount, setSessionCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportedCount, setExportedCount] = useState(0);

  const [settings, setSettings] = useState({
    includeReflection: true,
    includeSymbols: true,
    includeMetadata: true,
    folderPath: 'Journals'
  });

  useEffect(() => {
    const sessions = voiceJournalingService.getSessionHistory('beta-user');
    setSessionCount(sessions.length);

    // Load saved settings
    const saved = localStorage.getItem('export_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load export settings');
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('export_settings', JSON.stringify(settings));
    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  const handleExportAll = async () => {
    if (sessionCount === 0) {
      alert('No journal entries to export');
      return;
    }

    setExporting(true);
    setExportStatus('idle');

    try {
      const sessions = voiceJournalingService.getSessionHistory('beta-user');
      const results = obsidianExporter.exportSessions(sessions, settings);

      // Download each file
      results.forEach(result => {
        if (result.success) {
          obsidianExporter.downloadMarkdown(result.filename, result.content);
        }
      });

      setExportedCount(results.filter(r => r.success).length);
      setExportStatus('success');

      setTimeout(() => {
        setExportStatus('idle');
        setExportedCount(0);
      }, 5000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 5000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Export Settings
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Export your journal to Obsidian markdown
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                {sessionCount}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {sessionCount === 1 ? 'Entry' : 'Entries'} ready to export
              </div>
            </div>
            <FileText className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          </div>
        </motion.div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Export Options
          </h2>

          <div className="space-y-4">
            {/* Include Reflection */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeReflection}
                onChange={(e) => setSettings({ ...settings, includeReflection: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  Include MAIA's Reflections
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Export with symbolic analysis and prompts
                </div>
              </div>
            </label>

            {/* Include Symbols */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeSymbols}
                onChange={(e) => setSettings({ ...settings, includeSymbols: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  Include Symbols & Archetypes
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Add tags for symbols, archetypes, and emotional tones
                </div>
              </div>
            </label>

            {/* Include Metadata */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeMetadata}
                onChange={(e) => setSettings({ ...settings, includeMetadata: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-indigo-500 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  Include Metadata
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Add transformation scores, word counts, and durations
                </div>
              </div>
            </label>

            {/* Folder Path */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                <Folder className="w-4 h-4 inline mr-1" />
                Obsidian Folder Path
              </label>
              <input
                type="text"
                value={settings.folderPath}
                onChange={(e) => setSettings({ ...settings, folderPath: e.target.value })}
                placeholder="Journals"
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Relative path in your Obsidian vault (e.g., "Journals/MAIA")
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              {exportStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Export Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white"
        >
          <h2 className="text-xl font-bold mb-2">Export All Entries</h2>
          <p className="text-indigo-100 text-sm mb-4">
            Download all {sessionCount} {sessionCount === 1 ? 'entry' : 'entries'} as Obsidian-compatible markdown files
          </p>

          <button
            onClick={handleExportAll}
            disabled={exporting || sessionCount === 0}
            className="w-full py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Download className="w-5 h-5" />
                </motion.div>
                Exporting...
              </>
            ) : exportStatus === 'success' ? (
              <>
                <Check className="w-5 h-5" />
                Exported {exportedCount} {exportedCount === 1 ? 'file' : 'files'}!
              </>
            ) : exportStatus === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Export failed
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export All Entries
              </>
            )}
          </button>

          {exportStatus === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-indigo-100 mt-3 text-center"
            >
              Files downloaded to your Downloads folder. Move them to your Obsidian vault.
            </motion.p>
          )}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">
            💡 How to use in Obsidian
          </h3>
          <ol className="text-sm text-amber-800 dark:text-amber-400 space-y-1 list-decimal list-inside">
            <li>Create a folder in your Obsidian vault (e.g., "Journals/MAIA")</li>
            <li>Move the downloaded markdown files to that folder</li>
            <li>Open Obsidian and navigate to the folder</li>
            <li>Use tags like #River or #Seeker to explore patterns</li>
            <li>Create links between entries for deeper connections</li>
          </ol>
        </motion.div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← Back to Journal
          </Link>
        </div>
      </div>
    </div>
  );
}