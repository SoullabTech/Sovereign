'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Settings as SettingsIcon, X, Check, Shield } from 'lucide-react';
import { useMaiaStore } from '@/lib/maia/state';
import { obsidianExportService } from '@/lib/maia/obsidianExport';
import PrivacySettingsPanel from '../PrivacySettingsPanel';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { entries } = useMaiaStore();
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeFrontmatter: true,
    includeReflection: true,
    includeMetadata: true
  });

  const handleExportAll = () => {
    if (entries.length === 0) {
      alert('No entries to export');
      return;
    }

    obsidianExportService.exportAll(entries, exportOptions);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Obsidian Export
            </h3>

            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeFrontmatter}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeFrontmatter: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#FFD700] focus:ring-[#FFD700]"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">Include Frontmatter</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Add YAML frontmatter with metadata (tags, date, mode)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeReflection}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeReflection: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#FFD700] focus:ring-[#FFD700]"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">Include MAIA Reflections</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Export with symbols, archetypes, and insights
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#FFD700] focus:ring-[#FFD700]"
                />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">Include Session Metadata</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Word count, duration, voice status
                  </div>
                </div>
              </label>
            </div>

            <button
              onClick={handleExportAll}
              disabled={entries.length === 0}
              className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-amber-600 text-[#0A0E27] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export All Entries ({entries.length})
            </button>

            <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <strong>Tip:</strong> Exported files will be in Markdown format with Obsidian-compatible frontmatter.
                Save them to your Obsidian vault's journal folder.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Data & Privacy
            </h3>

            <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300 mb-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300 mb-1">
                  <Check className="w-4 h-4" />
                  Local Storage
                </div>
                <p className="text-xs text-green-700 dark:text-green-400">
                  All journal entries are stored locally in your browser
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300 mb-1">
                  <Check className="w-4 h-4" />
                  AI Processing
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Entries are sent to Anthropic's Claude for reflection analysis
                </p>
              </div>

              <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 font-medium text-violet-800 dark:text-violet-300 mb-1">
                  <Check className="w-4 h-4" />
                  Memory System
                </div>
                <p className="text-xs text-violet-700 dark:text-violet-400">
                  Patterns and symbols tracked for continuity across sessions
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300 mb-1">
                  <Shield className="w-4 h-4" />
                  Cognitive Voice Analysis
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Advanced consciousness insights with privacy controls
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacySettings(true)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Manage Privacy & Permissions
            </button>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Close
        </button>
      </motion.div>

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <PrivacySettingsPanel onClose={() => setShowPrivacySettings(false)} />
      )}
    </motion.div>
  );
}