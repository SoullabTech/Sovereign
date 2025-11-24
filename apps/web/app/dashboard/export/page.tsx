import React from 'react';
import { Download, FileText, Calendar, Shield } from 'lucide-react';

export default function ExportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Export Data
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Download your Soullab data in various formats
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Conversation Export */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Conversation History
            </h3>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Export all your conversations with Maya, including voice transcripts and responses.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Date Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
                <option>Custom range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Format
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>JSON</option>
                <option>CSV</option>
                <option>Plain Text</option>
              </select>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2
                             bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                             transition-colors duration-200">
              <Download className="w-4 h-4" />
              Export Conversations
            </button>
          </div>
        </div>

        {/* Analytics Export */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Usage Analytics
            </h3>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Export your usage patterns, session durations, and interaction metrics.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Metrics Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>All metrics</option>
                <option>Session data only</option>
                <option>Voice interactions only</option>
                <option>Performance metrics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Format
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
                               rounded-lg bg-white dark:bg-neutral-700
                               text-neutral-800 dark:text-neutral-200">
                <option>CSV</option>
                <option>JSON</option>
                <option>Excel</option>
              </select>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2
                             bg-green-600 hover:bg-green-700 text-white rounded-lg
                             transition-colors duration-200">
              <Download className="w-4 h-4" />
              Export Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Data Privacy & Security
            </h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <p>• All exported data is encrypted and anonymous</p>
              <p>• Personal identifiers are removed or hashed</p>
              <p>• Exports are available for 24 hours after generation</p>
              <p>• Downloaded files are automatically deleted from our servers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
          Recent Exports
        </h3>

        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No recent exports. Create your first export above.
          </p>
        </div>
      </div>
    </div>
  );
}