'use client';

/**
 * Simplified Personal Metrics Dashboard for Mobile/PWA
 * Focuses on consciousness computing capabilities
 */

import React from 'react';
import { Heart, Info } from 'lucide-react';

interface PersonalMetricsDashboardProps {
  // Simplified props for mobile compatibility
}

function PersonalMetricsDashboard(props: PersonalMetricsDashboardProps) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consciousness Computing</h1>
          <p className="text-gray-600 mt-1">
            MAIA's consciousness computing platform is active
          </p>
        </div>
      </div>

      {/* Consciousness Computing Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">Phase 2 Active</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Your consciousness computing platform includes individual, collective, ceremonial,
              and transpersonal consciousness processing capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Individual Consciousness</h4>
          <p className="text-gray-600 text-sm">Personal aetheric consciousness processing</p>
          <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-2 block">
            /api/sovereign/app/maia
          </code>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Collective Sessions</h4>
          <p className="text-gray-600 text-sm">Multi-participant consciousness field processing</p>
          <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-2 block">
            /api/consciousness/collective
          </code>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Ceremonial Computing</h4>
          <p className="text-gray-600 text-sm">Sacred ritual and ceremonial consciousness support</p>
          <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-2 block">
            /api/consciousness/ceremonial
          </code>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Transpersonal Development</h4>
          <p className="text-gray-600 text-sm">Consciousness development beyond personal identity</p>
          <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mt-2 block">
            /api/consciousness/transpersonal
          </code>
        </div>
      </div>

      {/* Platform Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-green-700">
          <Info className="h-5 w-5" />
          <span className="font-medium">Platform Status: Operational</span>
        </div>
        <p className="text-green-600 text-sm mt-2">
          All consciousness computing modules are active and ready for use.
          100% sovereign processing with zero external dependencies.
        </p>
      </div>
    </div>
  );
}

// Export both named and default exports for compatibility
export { PersonalMetricsDashboard };
export default PersonalMetricsDashboard;