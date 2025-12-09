/**
 * Cross-Portal Analytics Page
 *
 * Advanced analytics and insights interface for the consciousness portal ecosystem
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CrossPortalAnalytics from '@/lib/consciousness/alchemy/portals/CrossPortalAnalytics';

const CrossPortalAnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cross-Portal Analytics & Insights
          </h1>
          <p className="text-gray-300 max-w-3xl">
            Deep analytical insights across the consciousness portal ecosystem. Track user journeys,
            portal effectiveness, cultural resonance patterns, and AI-generated recommendations for
            optimizing the consciousness shader system.
          </p>
        </motion.div>

        {/* Analytics Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CrossPortalAnalytics />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-gray-400 text-sm"
        >
          <p>
            Powered by AI-driven analytics • Real-time consciousness pattern recognition •
            <strong className="text-purple-400"> Disposable Pixel Philosophy</strong> insights
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CrossPortalAnalyticsPage;