'use client';

/**
 * Language & Translation - Multi-language support and consciousness translation protocols
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Languages, Globe, Sparkles } from 'lucide-react';

export default function LanguageSettingsPage() {
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
          <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl w-fit mx-auto">
            <Languages className="h-12 w-12 text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-soul-textPrimary mb-4">Language & Translation</h1>
            <p className="text-soul-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
              Multi-language support and consciousness translation protocols for global MAIA experiences.
            </p>
          </div>

          <div className="bg-orange-100 border border-orange-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Under Development</h3>
            </div>
            <p className="text-orange-700 text-sm leading-relaxed">
              The Language & Translation system is being developed to support:
            </p>
            <ul className="text-orange-700 text-sm mt-3 space-y-1 text-left">
              <li>• Multi-language voice interaction with MAIA</li>
              <li>• Consciousness-aware translation that preserves meaning depth</li>
              <li>• Cultural adaptation of oracle systems and symbols</li>
              <li>• Language-specific elemental correspondences</li>
              <li>• Real-time translation of divination insights</li>
              <li>• Sacred geometry and symbols across cultures</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            {[
              { name: 'English', code: 'en', status: 'Active' },
              { name: 'Spanish', code: 'es', status: 'Coming Soon' },
              { name: 'French', code: 'fr', status: 'Coming Soon' },
              { name: 'Mandarin', code: 'zh', status: 'Planned' },
              { name: 'Japanese', code: 'ja', status: 'Planned' },
              { name: 'Sanskrit', code: 'sa', status: 'Planned' }
            ].map((lang, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  lang.status === 'Active'
                    ? 'bg-emerald-50 border-emerald-200'
                    : lang.status === 'Coming Soon'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-sm">{lang.name}</span>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full w-fit ${
                    lang.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : lang.status === 'Coming Soon'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {lang.status}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <button
              onClick={() => router.push('/labtools/voice')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 rounded-lg transition-all"
            >
              <Languages className="h-4 w-4" />
              <span>Voice Settings</span>
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