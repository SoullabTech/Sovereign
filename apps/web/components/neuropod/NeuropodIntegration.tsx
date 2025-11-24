"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FrequencyLayer {
  name: string;
  range: string;
  bodyRegion: string;
  speakers: string;
  color: string;
  brainwave: string;
}

interface NeuropodVisualizerProps {
  currentElement: string;
  userInteractions: {[key: number]: {dwellTime: number, interactions: number}};
  isActive: boolean;
}

const frequencyLayers: FrequencyLayer[] = [
  {
    name: 'Delta',
    range: '0.5-4Hz',
    bodyRegion: 'Root/Pelvis',
    speakers: 'Subwoofer',
    color: '#8B0000', // Deep red
    brainwave: 'Deep Sleep/Healing'
  },
  {
    name: 'Theta',
    range: '4-8Hz',
    bodyRegion: 'Sacral/Lower Torso',
    speakers: 'Bass',
    color: '#FF4500', // Orange red
    brainwave: 'Deep Meditation/Memory'
  },
  {
    name: 'Alpha',
    range: '8-13Hz',
    bodyRegion: 'Solar Plexus/Heart',
    speakers: 'Mid-Range',
    color: '#FFD700', // Gold
    brainwave: 'Relaxed Awareness/Flow'
  },
  {
    name: 'Beta',
    range: '13-30Hz',
    bodyRegion: 'Throat/Neck',
    speakers: 'High-Mid',
    color: '#00CED1', // Turquoise
    brainwave: 'Active Thinking/Focus'
  },
  {
    name: 'Gamma',
    range: '30-100Hz+',
    bodyRegion: 'Head/Crown',
    speakers: 'Treble',
    color: '#9370DB', // Purple
    brainwave: 'Expanded Awareness/Unity'
  }
];

export function NeuropodVisualizer({ currentElement, userInteractions, isActive }: NeuropodVisualizerProps) {
  const [activeLayers, setActiveLayers] = useState<{[key: string]: number}>({});
  const [dominantFrequency, setDominantFrequency] = useState<string>('Alpha');
  const animationRef = useRef<number>();

  // Map elemental states to frequency activations
  useEffect(() => {
    const elementalFrequencyMapping = {
      fire: { dominant: 'Gamma', secondary: ['Beta', 'Alpha'] },
      water: { dominant: 'Theta', secondary: ['Alpha', 'Delta'] },
      earth: { dominant: 'Delta', secondary: ['Theta', 'Alpha'] },
      air: { dominant: 'Beta', secondary: ['Alpha', 'Gamma'] },
      aether: { dominant: 'Alpha', secondary: ['Theta', 'Beta', 'Gamma', 'Delta'] }
    };

    const mapping = elementalFrequencyMapping[currentElement as keyof typeof elementalFrequencyMapping] ||
                   elementalFrequencyMapping.aether;

    setDominantFrequency(mapping.dominant);

    // Calculate interaction intensity to drive frequency activation
    const totalInteractions = Object.values(userInteractions).reduce(
      (sum, data) => sum + data.interactions, 0
    );
    const interactionIntensity = Math.min(1, totalInteractions / 10);

    // Set primary frequency activation
    const newActiveLayers = {
      [mapping.dominant]: 0.8 + (interactionIntensity * 0.2)
    };

    // Activate secondary frequencies based on interaction patterns
    mapping.secondary.forEach((freq, index) => {
      const activation = (interactionIntensity * 0.6) - (index * 0.15);
      if (activation > 0.1) {
        newActiveLayers[freq] = activation;
      }
    });

    setActiveLayers(newActiveLayers);
  }, [currentElement, userInteractions]);

  // Animate frequency waves
  useEffect(() => {
    if (!isActive) return;

    const animate = (timestamp: number) => {
      // This would drive real-time frequency visualization
      // and sync with audio/haptic systems
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-30"
    >
      {/* Neuropod Frequency Stack Visualization */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-80">
        <div className="text-center mb-4">
          <h3 className="text-white font-medium text-sm mb-1">Neuropod Frequency Field</h3>
          <p className="text-white/60 text-xs">Brainwave-Body-Audio Synthesis</p>
        </div>

        {/* Body-Frequency Mapping */}
        <div className="space-y-3">
          {frequencyLayers.map((layer, index) => {
            const activation = activeLayers[layer.name] || 0;
            const isDominant = layer.name === dominantFrequency;

            return (
              <motion.div
                key={layer.name}
                className="relative"
                animate={{
                  scale: isDominant ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isDominant ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {/* Frequency Bar */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <div className="text-xs font-medium text-white">{layer.name}</div>
                    <div className="text-[10px] text-white/60">{layer.range}</div>
                  </div>

                  {/* Activation Bar */}
                  <div className="flex-1 h-8 bg-white/10 rounded-lg overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-lg"
                      style={{ backgroundColor: layer.color }}
                      animate={{
                        width: `${activation * 100}%`,
                        opacity: 0.3 + (activation * 0.7),
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />

                    {/* Pulsing effect for active frequencies */}
                    {activation > 0.3 && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ backgroundColor: layer.color }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 60 / parseFloat(layer.range.split('-')[1]),
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Body region label */}
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] text-white/80 font-medium">
                        {layer.bodyRegion}
                      </span>
                    </div>
                  </div>

                  <div className="w-20 text-left">
                    <div className="text-[10px] text-white/60">{layer.speakers}</div>
                  </div>
                </div>

                {/* Brainwave State */}
                <div className="mt-1 text-[10px] text-white/50 text-center">
                  {layer.brainwave}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Field Effect Indicator */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Field Coherence</span>
            <motion.span
              className="text-amber-400 font-mono"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {(Object.values(activeLayers).reduce((sum, val) => sum + val, 0) / 5 * 100).toFixed(1)}%
            </motion.span>
          </div>

          {/* Dominant Element Display */}
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-white/60">Dominant Element</span>
            <span className="text-white capitalize">{currentElement}</span>
          </div>
        </div>

        {/* Future Neuropod Integration Status */}
        <div className="mt-3 p-2 bg-amber-400/10 rounded-lg border border-amber-400/20">
          <div className="text-[10px] text-amber-400 text-center">
            🚀 Neuropod Integration Ready
          </div>
          <div className="text-[9px] text-amber-300/80 text-center mt-1">
            Frequency → Audio → Haptic → Visual Synthesis
          </div>
        </div>
      </div>
    </motion.div>
  );
}