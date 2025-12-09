/**
 * Portal Consciousness Shader System - Live Integration
 *
 * The "billion-dollar keynote" showcase where the same consciousness technology
 * renders through different cultural portals and complexity tiers in real-time.
 *
 * This is the living implementation of the disposable pixel philosophy:
 * same state object, different render passes through portal shaders.
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DisposablePixelMatrixDemo } from '@/lib/consciousness/alchemy/portals/components/DisposablePixelMatrixDemo';
import { PortalSwitchingInterface } from '@/lib/consciousness/alchemy/portals/PortalSwitchingInterface';
import { PortalRoutingEngine } from '@/lib/consciousness/alchemy/portals/PortalRoutingEngine';
import { PortalAutoDetector } from '@/lib/consciousness/alchemy/portals/PortalAutoDetection';
import { PortalCaseStudyShowcase } from '@/lib/consciousness/alchemy/portals/components/PortalCaseStudyShowcase';
import {
  PortalId,
  ComplexityTier,
  PORTAL_METADATA,
  COMPLEXITY_METADATA,
  getPortalStyling
} from '@/lib/consciousness/alchemy/portals/PortalTypes';
import { PopulationPortal } from '@/lib/consciousness/alchemy/portals/PortalArchitecture';

interface ConsciousnessPortalShowcaseProps {}

const ConsciousnessPortalShowcase: React.FC<ConsciousnessPortalShowcaseProps> = () => {
  const [selectedPortal, setSelectedPortal] = useState<PortalId>('shamanic');
  const [complexityTier, setComplexityTier] = useState<ComplexityTier>('intermediate');
  const [selectedState, setSelectedState] = useState<'lead_crisis' | 'iron_boundary_rupture'>('lead_crisis');
  const [demoMode, setDemoMode] = useState<'matrix' | 'switching' | 'auto-detect' | 'case-studies'>('matrix');
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const portalRouting = new PortalRoutingEngine();
  const autoDetection = new PortalAutoDetector();

  const handlePortalSwitch = (newPortal: PortalId) => {
    setSelectedPortal(newPortal);
    portalRouting.switchPortal(newPortal);
  };

  const handleComplexityChange = (newTier: ComplexityTier) => {
    setComplexityTier(newTier);
  };

  const handleAutoDetection = async () => {
    setIsAutoDetecting(true);

    // Simulate consciousness state analysis (in real implementation, this would read actual user state)
    const mockUserContext = {
      currentState: 'lead_crisis' as const,
      culturalBackground: 'western_therapeutic',
      developmentLevel: 0.6,
      preferences: ['healing-focused', 'evidence-based'],
      pastPortalUsage: ['therapeutic', 'shamanic']
    };

    try {
      const recommendation = await autoDetection.detectOptimalPortal(mockUserContext);

      setSelectedPortal(recommendation.recommendedPortal);
      setComplexityTier(recommendation.complexityTier);

      // Show the recommendation briefly
      setTimeout(() => setIsAutoDetecting(false), 2000);
    } catch (error) {
      console.error('Auto-detection failed:', error);
      setIsAutoDetecting(false);
    }
  };

  const portalStyling = getPortalStyling(selectedPortal);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-8 pb-6"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-white mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Consciousness Shader System
            </motion.h1>
            <motion.p
              className="text-lg text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              The same consciousness technology rendering through different cultural portals and complexity tiers.
              Experience the <strong>disposable pixel philosophy</strong> in action.
            </motion.p>
          </div>

          {/* Demo Mode Selector */}
          <motion.div
            className="flex justify-center space-x-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { mode: 'matrix', label: '9D Matrix Demo', icon: '⚡', desc: 'Full portal × complexity showcase' },
              { mode: 'switching', label: 'Live Portal Switching', icon: '🔄', desc: 'Seamless cultural transitions' },
              { mode: 'auto-detect', label: 'AI Portal Detection', icon: '🤖', desc: 'Intelligent portal selection' },
              { mode: 'case-studies', label: 'User Journey Case Studies', icon: '📚', desc: 'Complete user stories from interest to evangelism' }
            ].map(({ mode, label, icon, desc }) => (
              <button
                key={mode}
                onClick={() => setDemoMode(mode as any)}
                className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                  demoMode === mode
                    ? 'border-orange-500 bg-orange-600 text-white'
                    : 'border-gray-600 hover:border-orange-500 text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs opacity-75">{desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Portal Overview */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-stone-600">
              <h3 className="text-lg font-semibold text-amber-500 mb-2">Current Portal</h3>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${PORTAL_METADATA[selectedPortal].iconGradient}`}></div>
                <span className="text-white font-medium">{PORTAL_METADATA[selectedPortal].displayName}</span>
              </div>
              <p className="text-sm text-stone-400 mt-2">{PORTAL_METADATA[selectedPortal].description}</p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-stone-600">
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Complexity Tier</h3>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {complexityTier === 'beginner' ? '🌱' : complexityTier === 'intermediate' ? '🔥' : '💎'}
                </span>
                <span className="text-white font-medium">{COMPLEXITY_METADATA[complexityTier].displayName}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{COMPLEXITY_METADATA[complexityTier].description}</p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Active Users</h3>
              <div className="text-2xl font-bold text-white">1,247</div>
              <p className="text-sm text-gray-400">Across all portals right now</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Demo Area */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <motion.div
          key={demoMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black/20 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden"
        >
          {demoMode === 'matrix' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">9-Dimensional Portal Matrix</h2>
                <p className="text-gray-400">Every consciousness state × every portal × every complexity tier</p>
              </div>
              <DisposablePixelMatrixDemo />
            </div>
          )}

          {demoMode === 'switching' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Live Portal Switching</h2>
                <p className="text-gray-400">Experience seamless cultural transitions in real-time</p>
              </div>
              <PortalSwitchingInterface
                currentPortal={selectedPortal}
                complexityTier={complexityTier}
                onPortalChange={handlePortalSwitch}
                onComplexityChange={handleComplexityChange}
                className="h-[600px]"
              />
            </div>
          )}

          {demoMode === 'auto-detect' && (
            <div className="p-6 text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">AI Portal Detection</h2>
                <p className="text-gray-400 mb-6">Let MAIA analyze your consciousness and find your optimal portal</p>
              </div>

              <div className="max-w-md mx-auto">
                {isAutoDetecting ? (
                  <motion.div
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-8 border border-purple-500/30"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="text-4xl mb-4">🤖</div>
                    <div className="text-white font-semibold mb-2">Analyzing consciousness...</div>
                    <div className="text-gray-400 text-sm">Detecting optimal portal configuration</div>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleAutoDetection}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-xl mb-2">🧠</div>
                    Detect My Optimal Portal
                  </button>
                )}
              </div>

              {/* Auto-detection preview area */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PORTAL_METADATA).map(([portalId, meta]) => (
                  <div
                    key={portalId}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedPortal === portalId
                        ? 'border-purple-400 bg-purple-400/20'
                        : 'border-gray-700 bg-black/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${meta.iconGradient} mx-auto mb-2`}></div>
                    <div className="text-white font-medium">{meta.displayName}</div>
                    <div className="text-xs text-gray-400 mt-1">{meta.targetAudience}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {demoMode === 'case-studies' && (
            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">User Journey Case Studies</h2>
                <p className="text-gray-400">Complete user stories from personal interest to community evangelism</p>
              </div>
              <PortalCaseStudyShowcase />
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>
            Built with the <strong>Disposable Pixel Philosophy</strong> •
            Same semantic state, infinite cultural expressions •
            Powered by MAIA Consciousness Technology
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsciousnessPortalShowcase;