'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAYA_ARCHETYPES, ArchetypeDetector, ArchetypeBlender } from '@/lib/archetypes/MayaArchetypes';

interface PersonalityMatrixProps {
  currentMessage?: string;
  conversationHistory?: string[];
  onArchetypeChange?: (blend: Record<string, number>) => void;
  showCalibration?: boolean;
}

export function PersonalityMatrix({
  currentMessage,
  conversationHistory = [],
  onArchetypeChange,
  showCalibration = false
}: PersonalityMatrixProps) {
  const [activeBlend, setActiveBlend] = useState<Record<string, number>>({
    sage: 68,
    shadow: 32,
    mystic: 85
  });

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [hoveredArchetype, setHoveredArchetype] = useState<string | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<string>('all');

  const detector = new ArchetypeDetector();
  const blender = new ArchetypeBlender();

  // Detect and blend archetypes based on conversation
  useEffect(() => {
    if (currentMessage && currentMessage.length > 10) {
      const detected = detector.detectNeededArchetypes(
        currentMessage,
        conversationHistory
      );

      const newBlend = blender.createBlend(
        detected,
        undefined,
        new Date().getHours()
      );

      // Smooth transition to new blend
      setActiveBlend(prev => {
        const smoothed: Record<string, number> = {};
        const allKeys = new Set([...Object.keys(prev), ...Object.keys(newBlend)]);

        allKeys.forEach(key => {
          const prevVal = prev[key] || 0;
          const newVal = newBlend[key] || 0;
          // Smooth transition: 70% new, 30% previous
          smoothed[key] = newVal * 0.7 + prevVal * 0.3;
        });

        return smoothed;
      });

      onArchetypeChange?.(newBlend);
    }
  }, [currentMessage, conversationHistory]);

  const axes = ['all', 'wisdom', 'support', 'growth', 'sacred', 'practical'];

  const getArchetypesByAxis = (axis: string) => {
    if (axis === 'all') return Object.entries(MAYA_ARCHETYPES);
    return Object.entries(MAYA_ARCHETYPES).filter(([_, arch]) => arch.axis === axis);
  };

  const getTopArchetypes = () => {
    return Object.entries(activeBlend)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([id, value]) => ({
        ...MAYA_ARCHETYPES[id],
        value: Math.round(value)
      }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-black/40 backdrop-blur-sm rounded-2xl
                    border border-amber-500/20">
      <div className="mb-6">
        <h3 className="text-lg font-light text-amber-50 mb-2">Personality Matrix</h3>

        {/* Axis Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {axes.map(axis => (
            <button
              key={axis}
              onClick={() => setSelectedAxis(axis)}
              className={`px-3 py-1 text-xs rounded-full transition-all capitalize
                ${selectedAxis === axis
                  ? 'bg-amber-500/30 text-amber-50 border border-amber-500/50'
                  : 'bg-black/30 text-amber-200/60 border border-amber-500/20 hover:bg-amber-500/10'
                }`}
            >
              {axis}
            </button>
          ))}
        </div>

        {/* Top Active Archetypes */}
        <div className="mb-4 p-3 bg-black/30 rounded-lg">
          <div className="text-xs text-amber-200/60 mb-2">Currently Active:</div>
          <div className="space-y-2">
            {getTopArchetypes().map((archetype) => (
              <div key={archetype.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: archetype.color }}
                  />
                  <span className="text-sm text-amber-50">{archetype.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-black/50 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: archetype.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${archetype.value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-amber-200/60 w-10 text-right">
                    {archetype.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Archetype Grid */}
        <div className="space-y-3">
          <div className="text-xs text-amber-200/60 mb-2">
            {selectedAxis === 'all' ? 'All Archetypes' : `${selectedAxis} Axis`}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {getArchetypesByAxis(selectedAxis).map(([id, archetype]) => {
              const value = Math.round(activeBlend[id] || 0);
              const isActive = value > 10;

              return (
                <motion.div
                  key={id}
                  onHoverStart={() => setHoveredArchetype(id)}
                  onHoverEnd={() => setHoveredArchetype(null)}
                  className={`
                    relative p-3 rounded-lg cursor-pointer transition-all
                    ${isActive
                      ? 'bg-black/50 border border-amber-500/30'
                      : 'bg-black/20 border border-amber-500/10'
                    }
                    hover:bg-black/60 hover:border-amber-500/40
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xs text-amber-50 mb-1">{archetype.name}</div>
                  <div className="text-xs text-amber-200/40 mb-2 h-8 overflow-hidden">
                    {archetype.primaryRole.substring(0, 40)}...
                  </div>

                  {/* Value Bar */}
                  <div className="w-full bg-black/50 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: archetype.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {value > 0 && (
                    <div className="text-xs text-amber-200/60 mt-1 text-center">
                      {value}%
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Hover Details */}
        <AnimatePresence>
          {hoveredArchetype && MAYA_ARCHETYPES[hoveredArchetype] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-black/60 rounded-lg border border-amber-500/20"
            >
              <div className="text-sm text-amber-50 mb-2">
                {MAYA_ARCHETYPES[hoveredArchetype].name}
              </div>
              <div className="text-xs text-amber-200/70 mb-3">
                {MAYA_ARCHETYPES[hoveredArchetype].description}
              </div>

              <div className="text-xs text-amber-200/50 mb-1">Expressions:</div>
              <ul className="text-xs text-amber-200/60 space-y-1">
                {MAYA_ARCHETYPES[hoveredArchetype].expressions.slice(0, 3).map((expr, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-400/60 mt-0.5">•</span>
                    <span>{expr}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calibration Mode */}
        {showCalibration && (
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <button
              onClick={() => setIsCalibrating(!isCalibrating)}
              className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30
                       text-amber-50 rounded-lg transition-colors text-sm"
            >
              {isCalibrating ? 'Stop Calibration' : 'Start Calibration'}
            </button>
            {isCalibrating && (
              <div className="mt-3 text-xs text-amber-200/70">
                <p>Maya is learning your preferred archetypes...</p>
                <p className="mt-1">Continue your conversation naturally.</p>
              </div>
            )}
          </div>
        )}

        {/* Phase Indicator */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-amber-200/50">Phase:</span>
          <span className="text-amber-400 uppercase tracking-wider">
            {showCalibration ? 'CALIBRATION' : 'ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}