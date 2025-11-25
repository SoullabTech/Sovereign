"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TRANSLATION PORTAL
 *
 * "The doorsill where the two worlds touch. The door is round and open."
 *
 * This is the interface where users experience the Rosetta Stone magic -
 * translating between different consciousness languages seamlessly.
 */

interface TranslationPortalProps {
  className?: string;
}

type SystemType =
  | 'astrology'
  | 'alchemy'
  | 'psychology'
  | 'spiral'
  | 'somatic'
  | 'mythology'
  | 'energy'
  | 'archetypal';

interface ArchetypalPattern {
  id: string;
  name: string;
  essence?: string;
  description?: string;
}

// Mock translation engine for demonstration
const mockTranslate = (patternId: string, fromSystem: SystemType, toSystem: SystemType) => {
  const translations = {
    'astrology_to_alchemy': {
      warrior: {
        element: 'fire',
        stage: 'rubedo',
        operation: 'calcination',
        metal: 'iron'
      },
      lover: {
        element: 'water',
        stage: 'albedo',
        operation: 'conjunction',
        metal: 'copper'
      },
      magician: {
        element: 'air',
        stage: 'citrinitas',
        operation: 'sublimation',
        metal: 'mercury'
      },
      sage: {
        element: 'earth',
        stage: 'nigredo',
        operation: 'coagulation',
        metal: 'gold'
      }
    },
    'alchemy_to_psychology': {
      warrior: {
        jungianFunction: 'thinking',
        attitude: 'extraversion',
        archetype: 'Hero',
        enneagramType: 8
      },
      lover: {
        jungianFunction: 'feeling',
        attitude: 'extraversion',
        archetype: 'Lover',
        enneagramType: 2
      }
    }
  };

  const key = `${fromSystem}_to_${toSystem}` as keyof typeof translations;
  const systemTranslations = translations[key];

  if (systemTranslations && systemTranslations[patternId as keyof typeof systemTranslations]) {
    return {
      originalPattern: { id: patternId, name: patternId.charAt(0).toUpperCase() + patternId.slice(1) },
      targetSystem: toSystem,
      translation: systemTranslations[patternId as keyof typeof systemTranslations],
      confidence: 0.85,
      notes: `Translation from ${fromSystem} to ${toSystem} based on universal archetypal signature`
    };
  }

  return null;
};

export default function TranslationPortal({ className = "" }: TranslationPortalProps) {
  const [sourceSystem, setSourceSystem] = useState<SystemType>('astrology');
  const [targetSystem, setTargetSystem] = useState<SystemType>('alchemy');
  const [selectedPattern, setSelectedPattern] = useState<string>('warrior');
  const [translation, setTranslation] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [availablePatterns, setAvailablePatterns] = useState<ArchetypalPattern[]>([]);

  // Available systems for translation
  const systems: { type: SystemType; name: string; icon: string; color: string }[] = [
    { type: 'astrology', name: 'Astrology', icon: '⭐', color: 'from-purple-500 to-indigo-600' },
    { type: 'alchemy', name: 'Alchemy', icon: '🜃', color: 'from-amber-500 to-orange-600' },
    { type: 'psychology', name: 'Psychology', icon: '🧠', color: 'from-green-500 to-teal-600' },
    { type: 'spiral', name: 'Spiral', icon: '🌀', color: 'from-blue-500 to-cyan-600' },
    { type: 'somatic', name: 'Somatic', icon: '🫀', color: 'from-pink-500 to-rose-600' },
    { type: 'mythology', name: 'Mythology', icon: '⚡', color: 'from-violet-500 to-purple-600' },
    { type: 'energy', name: 'Energy', icon: '💫', color: 'from-teal-500 to-emerald-600' },
    { type: 'archetypal', name: 'Archetypal', icon: '🗿', color: 'from-stone-500 to-gray-600' }
  ];

  useEffect(() => {
    // Load available patterns
    loadPatterns();
  }, []);

  const loadPatterns = () => {
    // Get patterns from the consciousness engine
    const patterns = [
      { id: 'warrior', name: 'The Warrior', essence: 'Active courage and protective power' },
      { id: 'lover', name: 'The Lover', essence: 'Receptive connection and emotional wisdom' },
      { id: 'magician', name: 'The Magician', essence: 'Transformative knowledge and creative power' },
      { id: 'sage', name: 'The Sage', essence: 'Receptive wisdom and understanding' }
    ];
    setAvailablePatterns(patterns);
  };

  const handleTranslation = async () => {
    setIsTranslating(true);

    // Simulate translation process
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = mockTranslate(selectedPattern, sourceSystem, targetSystem);
    setTranslation(result);
    setIsTranslating(false);
  };

  const getSystemInfo = (systemType: SystemType) => {
    return systems.find(s => s.type === systemType);
  };

  const swapSystems = () => {
    const temp = sourceSystem;
    setSourceSystem(targetSystem);
    setTargetSystem(temp);
    setTranslation(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Portal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2F1]/30 via-[#B2DFDB]/20 to-[#80CBC4]/30 rounded-3xl backdrop-blur-sm" />

      {/* Main Portal Interface */}
      <div className="relative p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-[#004D40] mb-3">
            Translation Portal
          </h2>
          <p className="text-[#00695C]/80 text-sm font-light">
            "The doorsill where the two worlds touch"
          </p>
        </div>

        {/* System Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Source System */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#004D40] text-center">From</h3>
            <div className="space-y-2">
              {systems.map((system) => (
                <motion.button
                  key={system.type}
                  onClick={() => {
                    setSourceSystem(system.type);
                    setTranslation(null);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 ${
                    sourceSystem === system.type
                      ? `bg-gradient-to-r ${system.color} text-white shadow-lg`
                      : 'bg-white/50 text-[#004D40] hover:bg-white/70'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">{system.icon}</span>
                  <span className="font-medium">{system.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Translation Arrow & Button */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <motion.button
              onClick={swapSystems}
              className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-[#004D40] hover:bg-white transition-colors shadow-md"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              ⇄
            </motion.button>

            <motion.button
              onClick={handleTranslation}
              disabled={isTranslating || !selectedPattern}
              className="px-6 py-3 bg-gradient-to-r from-[#26A69A] to-[#4DB6AC] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isTranslating ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Translating...</span>
                </div>
              ) : (
                'Translate'
              )}
            </motion.button>
          </div>

          {/* Target System */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#004D40] text-center">To</h3>
            <div className="space-y-2">
              {systems.map((system) => (
                <motion.button
                  key={system.type}
                  onClick={() => {
                    setTargetSystem(system.type);
                    setTranslation(null);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 ${
                    targetSystem === system.type
                      ? `bg-gradient-to-r ${system.color} text-white shadow-lg`
                      : 'bg-white/50 text-[#004D40] hover:bg-white/70'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">{system.icon}</span>
                  <span className="font-medium">{system.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#004D40] mb-4 text-center">Select Archetypal Pattern</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availablePatterns.map((pattern) => (
              <motion.button
                key={pattern.id}
                onClick={() => {
                  setSelectedPattern(pattern.id);
                  setTranslation(null);
                }}
                className={`p-4 rounded-2xl text-left transition-all duration-300 ${
                  selectedPattern === pattern.id
                    ? 'bg-gradient-to-br from-[#26A69A] to-[#4DB6AC] text-white shadow-lg'
                    : 'bg-white/50 text-[#004D40] hover:bg-white/70'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium mb-2">{pattern.name}</div>
                <div className="text-xs opacity-80">
                  {pattern.essence || pattern.description}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Translation Result */}
        <AnimatePresence mode="wait">
          {translation && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white/70 rounded-3xl p-6 backdrop-blur-sm shadow-lg"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-[#004D40] mb-2">
                  Translation Result
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm text-[#00695C]">
                  <span className="flex items-center space-x-1">
                    <span>{getSystemInfo(sourceSystem)?.icon}</span>
                    <span>{getSystemInfo(sourceSystem)?.name}</span>
                  </span>
                  <span>→</span>
                  <span className="flex items-center space-x-1">
                    <span>{getSystemInfo(targetSystem)?.icon}</span>
                    <span>{getSystemInfo(targetSystem)?.name}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/50 rounded-2xl p-4">
                  <h4 className="font-medium text-[#004D40] mb-2">Pattern: {translation.originalPattern?.name}</h4>
                  <p className="text-sm text-[#00695C]/80">
                    {availablePatterns.find(p => p.id === selectedPattern)?.essence}
                  </p>
                </div>

                <div className="bg-white/50 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-[#004D40]">
                      Translation to {getSystemInfo(targetSystem)?.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-[#00695C]/60">Confidence:</span>
                      <div className="bg-[#E0F2F1] rounded-full px-2 py-1 text-xs font-medium text-[#004D40]">
                        {Math.round((translation.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>

                  {translation.translation && (
                    <div className="space-y-2 text-sm text-[#00695C]">
                      {Object.entries(translation.translation).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize font-medium">{key}:</span>
                          <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {translation.notes && (
                    <div className="mt-3 pt-3 border-t border-[#B2DFDB]/30">
                      <p className="text-xs text-[#00695C]/70 italic">
                        {translation.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portal Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-center mt-8"
        >
          <p className="text-[#00695C]/60 text-sm italic">
            "Don't go back to sleep. The breeze at dawn has secrets to tell you."
          </p>
        </motion.div>
      </div>
    </div>
  );
}