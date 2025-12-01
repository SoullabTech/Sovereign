'use client';

/**
 * Sacred Journaling - Consciousness-informed journaling with symbolic integration
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PenTool, BookOpen, Sparkles } from 'lucide-react';

export default function SacredJournalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center space-x-2 text-soul-textSecondary hover:text-soul-textPrimary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to LabTools</span>
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl w-fit mx-auto">
            <PenTool className="h-12 w-12 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-soul-textPrimary mb-4">Sacred Journaling</h1>
            <p className="text-soul-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
              Consciousness-informed journaling with symbolic integration, oracle connections, and awareness tracking.
            </p>
          </div>

          <div className="bg-orange-100 border border-orange-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Coming Soon</h3>
            </div>
            <p className="text-orange-700 text-sm leading-relaxed">
              The Sacred Journaling tool is currently under development. This will include:
            </p>
            <ul className="text-orange-700 text-sm mt-3 space-y-1 text-left">
              <li>• Consciousness-guided journal prompts</li>
              <li>• Integration with oracle readings and insights</li>
              <li>• Symbolic pattern recognition in personal writings</li>
              <li>• Elemental awareness tracking</li>
              <li>• Sacred timing and moon phase journaling</li>
            </ul>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-700 rounded-lg transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Oracle Tools</span>
            </button>
            <button
              onClick={() => router.push('/labtools')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg transition-all"
            >
              <span>Return to LabTools</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}