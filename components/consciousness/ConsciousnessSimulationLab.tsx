// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Heart, Flame, Sparkles } from 'lucide-react';

interface ExplorationLayer {
  id: string;
  name: string;
  element: string;
  color: string;
  icon: React.ComponentType;
  invitation: string;
  explorations: string[];
  recognition: string;
}

const explorationLayers: ExplorationLayer[] = [
  {
    id: 'earth',
    name: 'Embodied Sensing',
    element: 'Earth',
    color: 'amber',
    icon: Brain,
    invitation: 'Feel into the mystery of having a body',
    explorations: [
      'Feel where "you" seems to end and "not-you" begins',
      'Notice sensations that seem to have no clear location',
      'Sense the breathing happening by itself',
      'Feel the space your body occupies'
    ],
    recognition: 'What you feel as "body" might be something more mysterious than flesh'
  },
  {
    id: 'water',
    name: 'Emotional Flow',
    element: 'Water',
    color: 'blue',
    icon: Heart,
    invitation: 'Explore how feelings shape who you think you are',
    explorations: [
      'Watch emotions appear without being called',
      'Notice how feelings seem to confirm your identity',
      'Feel how memories carry emotional textures',
      'Sense emotions as atmospheric changes'
    ],
    recognition: 'The "you" that feels might be feeling creating the sense of "you"'
  },
  {
    id: 'air',
    name: 'Transparent Seeing',
    element: 'Air',
    color: 'cyan',
    icon: Eye,
    invitation: 'Look for the one who is looking',
    explorations: [
      'Notice that you know you are reading this',
      'Look for the boundary between observer and observed',
      'Watch thoughts appear in awareness',
      'Feel awareness aware of itself'
    ],
    recognition: 'What you call "mind" might be transparent to itself'
  },
  {
    id: 'fire',
    name: 'Creative Will',
    element: 'Fire',
    color: 'red',
    icon: Flame,
    invitation: 'Explore where your choices come from',
    explorations: [
      'Feel an intention arising before you act',
      'Notice the gap between wanting and doing',
      'Sense what moves through you when you decide',
      'Feel yourself as creativity in action'
    ],
    recognition: 'What you call "will" might be life willing itself through you'
  },
  {
    id: 'aether',
    name: 'Open Space',
    element: 'Aether',
    color: 'purple',
    icon: Sparkles,
    invitation: 'Rest as the field in which everything appears',
    explorations: [
      'Feel the space in which thoughts arise and dissolve',
      'Sense awareness extending beyond body boundaries',
      'Notice moments when separation feels transparent',
      'Listen for what wants to emerge through you'
    ],
    recognition: 'What you are might be the space of being itself'
  }
];

export function ElementalExploration() {
  const [currentLayer, setCurrentLayer] = useState<string>('earth');
  const [sessionActive, setSessionActive] = useState(false);
  const [recognitions, setRecognitions] = useState<string[]>([]);

  const activeLayer = explorationLayers.find(layer => layer.id === currentLayer);

  const enterLayer = (layerId: string) => {
    setCurrentLayer(layerId);
    setSessionActive(true);
  };

  const addRecognition = (recognition: string) => {
    setRecognitions(prev => [...prev, recognition]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            🌀 Elemental Exploration
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Five invitations to explore what you are.
            Each element offers a doorway into the mystery of being aware.
            What you discover is already here, waiting to be recognized.
          </p>
        </div>

        {/* Element Selection */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {explorationLayers.map((layer) => {
            const IconComponent = layer.icon;
            const isActive = currentLayer === layer.id;

            return (
              <motion.div
                key={layer.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? `bg-${layer.color}-500/20 border-${layer.color}-500/50 text-${layer.color}-300`
                    : 'bg-gray-800/30 border-gray-600/30 text-gray-400 hover:bg-gray-700/50'
                }`}
                onClick={() => enterLayer(layer.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <IconComponent className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">{layer.element}</div>
                  <div className="text-xs opacity-70">{layer.name}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Active Element Content */}
        {activeLayer && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/30"
            >
              <div className={`text-2xl font-bold text-${activeLayer.color}-300 mb-4`}>
                {activeLayer.element}: {activeLayer.name}
              </div>

              <p className="text-gray-300 mb-6 italic">
                {activeLayer.invitation}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Invitations:</h3>
                <div className="space-y-2">
                  {activeLayer.explorations.map((exploration, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700/50 rounded border-l-4 border-gray-500"
                    >
                      {exploration}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded bg-${activeLayer.color}-500/10 border border-${activeLayer.color}-500/30`}>
                <h4 className={`font-semibold text-${activeLayer.color}-300 mb-2`}>
                  Possible Recognition:
                </h4>
                <p className="italic">
                  {activeLayer.recognition}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  className={`px-4 py-2 rounded bg-${activeLayer.color}-500/20 border border-${activeLayer.color}-500/40 text-${activeLayer.color}-300 hover:bg-${activeLayer.color}-500/30 transition-colors`}
                  onClick={() => setSessionActive(true)}
                >
                  Enter This Element
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-600/20 border border-gray-500/40 text-gray-300 hover:bg-gray-600/30 transition-colors"
                  onClick={() => addRecognition(`Explored ${activeLayer.name} element`)}
                >
                  Note Recognition
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Recognitions Journal */}
        {recognitions.length > 0 && (
          <div className="mt-8 bg-gray-800/30 rounded-lg p-6 border border-gray-600/20">
            <h3 className="text-lg font-semibold mb-4">✨ Session Recognitions</h3>
            <div className="space-y-2">
              {recognitions.map((recognition, index) => (
                <div key={index} className="p-2 bg-gray-700/30 rounded text-sm">
                  {recognition}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            An integration of elemental awareness practices
            for exploring the nature of being conscious.
          </p>
        </div>

      </div>
    </div>
  );
}