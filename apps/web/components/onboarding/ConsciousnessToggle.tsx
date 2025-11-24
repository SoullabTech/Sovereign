"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Settings, Sparkles, Beaker } from 'lucide-react';
import { useConsciousnessVisualization } from '@/lib/contexts/ConsciousnessVisualizationContext';

interface ConsciousnessToggleProps {
  showSettings?: boolean;
}

export function ConsciousnessToggle({ showSettings = false }: ConsciousnessToggleProps) {
  const {
    settings,
    toggleOscillator,
    updateSetting,
    isOscillatorEnabled
  } = useConsciousnessVisualization();

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {/* Main Toggle */}
        <motion.button
          onClick={toggleOscillator}
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 ${
            isOscillatorEnabled
              ? 'bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-100'
              : 'bg-gray-800/20 text-gray-300 hover:bg-gray-700/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{
              rotate: isOscillatorEnabled ? 360 : 0,
              scale: isOscillatorEnabled ? [1, 1.2, 1] : 1
            }}
            transition={{
              rotate: { duration: 2, repeat: isOscillatorEnabled ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.6, repeat: isOscillatorEnabled ? Infinity : 0, ease: "easeInOut" }
            }}
          >
            {isOscillatorEnabled ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </motion.div>

          <div className="text-left">
            <div className="text-sm font-medium">
              Consciousness Visualization
            </div>
            <div className="text-xs opacity-75">
              {isOscillatorEnabled ? 'Dynamic Oscillators Active' : 'Classic Sacred Geometry'}
            </div>
          </div>

          {showSettings && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowAdvanced(!showAdvanced);
              }}
              className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ rotate: 90 }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </motion.button>

        {/* Advanced Settings Panel */}
        <AnimatePresence>
          {showAdvanced && showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-4 bg-white/5">
                {/* Visualization Intensity */}
                <div>
                  <label className="text-xs font-medium text-white/80 mb-2 block">
                    Visualization Intensity
                  </label>
                  <div className="flex gap-1">
                    {(['subtle', 'medium', 'intense'] as const).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => updateSetting('visualizationIntensity', intensity)}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          settings.visualizationIntensity === intensity
                            ? 'bg-amber-400/30 text-amber-100'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {intensity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Performance Mode */}
                <div>
                  <label className="text-xs font-medium text-white/80 mb-2 block">
                    Performance Mode
                  </label>
                  <div className="flex gap-1">
                    {(['auto', 'high', 'low'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateSetting('performanceMode', mode)}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          settings.performanceMode === mode
                            ? 'bg-blue-400/30 text-blue-100'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={settings.elementalVisualization}
                      onChange={(e) => updateSetting('elementalVisualization', e.target.checked)}
                      className="w-3 h-3 rounded accent-amber-400"
                    />
                    <span className="text-white/80">Elemental Visualization</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={settings.sacredGeometryDynamics}
                      onChange={(e) => updateSetting('sacredGeometryDynamics', e.target.checked)}
                      className="w-3 h-3 rounded accent-amber-400"
                    />
                    <span className="text-white/80">Sacred Geometry Dynamics</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Indicator */}
      {isOscillatorEnabled && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"
        >
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full bg-amber-400 rounded-full"
          />
        </motion.div>
      )}
    </motion.div>
  );
}