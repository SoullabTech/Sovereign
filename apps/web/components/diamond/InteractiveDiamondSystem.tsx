'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Facet {
  id: string;
  name: string;
  icon: string;
  element?: string;
  title: string;
  description: string;
  color: string;
  position: { x: number; y: number };
}

const facets: Facet[] = [
  {
    id: 'engage',
    name: 'Engage',
    icon: '🔥',
    element: 'Fire',
    title: 'Voice Chat with MAIA',
    description: 'Real-time conversations that ignite presence and spark emergence',
    color: '#ff6b35',
    position: { x: 50, y: 10 },
  },
  {
    id: 'deepen',
    name: 'Deepen',
    icon: '💧',
    element: 'Water',
    title: 'Voice Journaling',
    description: 'Dive beneath the surface in 5 sacred modes',
    color: '#4a90e2',
    position: { x: 80, y: 30 },
  },
  {
    id: 'listen',
    name: 'Listen',
    icon: '💨',
    element: 'Air',
    title: 'Pattern Recognition',
    description: 'Your symbols tracked, patterns witnessed, clarity emerging',
    color: '#e8d5a0',
    position: { x: 80, y: 70 },
  },
  {
    id: 'reflect',
    name: 'Reflect',
    icon: '🪞',
    element: 'Aether',
    title: "MAIA's Sacred Mirror",
    description: 'Your history woven into each moment—context that honors your arc',
    color: '#d4b896',
    position: { x: 50, y: 90 },
  },
  {
    id: 'guide',
    name: 'Guide',
    icon: '🌱',
    element: 'Earth',
    title: 'Elemental Alchemy',
    description: 'Elemental wisdom grounds your transformation in the real',
    color: '#7cb342',
    position: { x: 20, y: 70 },
  },
  {
    id: 'spiral',
    name: 'Spiral',
    icon: '🌀',
    title: 'Non-Linear Growth',
    description: 'Return to themes at deeper levels—growth honored as spiral',
    color: '#9b59b6',
    position: { x: 20, y: 30 },
  },
  {
    id: 'evolve',
    name: 'Evolve',
    icon: '🧬',
    title: 'Collective Intelligence',
    description: 'Your breakthroughs train the AI—individual wisdom becomes collective',
    color: '#e91e63',
    position: { x: 50, y: 50 },
  },
];

export default function InteractiveDiamondSystem() {
  const [activeFacet, setActiveFacet] = useState<Facet | null>(null);
  const [hoveredFacet, setHoveredFacet] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light text-[#d4b896] mb-4 tracking-wider uppercase"
        >
          The Spiralogic Diamond
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          Seven facets of elemental alchemy for your becoming
        </motion.p>
      </div>

      {/* Diamond Visualization */}
      <div className="relative aspect-square max-w-2xl mx-auto mb-12">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#d4b896]/10 via-transparent to-transparent blur-3xl" />

        {/* Diamond container */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(212, 184, 150, 0.3))' }}
        >
          {/* Connection lines */}
          <g opacity="0.2">
            {facets.map((facet, i) =>
              facets.slice(i + 1).map((other, j) => (
                <line
                  key={`line-${i}-${j}`}
                  x1={facet.position.x}
                  y1={facet.position.y}
                  x2={other.position.x}
                  y2={other.position.y}
                  stroke="#d4b896"
                  strokeWidth="0.1"
                  className="transition-opacity duration-300"
                  opacity={
                    hoveredFacet === facet.id || hoveredFacet === other.id
                      ? 0.5
                      : 0.2
                  }
                />
              ))
            )}
          </g>

          {/* Facet points */}
          {facets.map((facet) => (
            <g key={facet.id}>
              {/* Glow effect */}
              <circle
                cx={facet.position.x}
                cy={facet.position.y}
                r={hoveredFacet === facet.id ? 8 : 5}
                fill={facet.color}
                opacity={hoveredFacet === facet.id ? 0.3 : 0}
                className="transition-all duration-300"
              />

              {/* Main point */}
              <circle
                cx={facet.position.x}
                cy={facet.position.y}
                r={hoveredFacet === facet.id ? 2.5 : 1.5}
                fill={facet.color}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredFacet(facet.id)}
                onMouseLeave={() => setHoveredFacet(null)}
                onClick={() =>
                  setActiveFacet(activeFacet?.id === facet.id ? null : facet)
                }
              />
            </g>
          ))}
        </svg>

        {/* Facet labels */}
        {facets.map((facet) => (
          <motion.div
            key={`label-${facet.id}`}
            className="absolute cursor-pointer"
            style={{
              left: `${facet.position.x}%`,
              top: `${facet.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => setHoveredFacet(facet.id)}
            onMouseLeave={() => setHoveredFacet(null)}
            onClick={() =>
              setActiveFacet(activeFacet?.id === facet.id ? null : facet)
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`
                flex flex-col items-center gap-1 p-3 rounded-lg
                transition-all duration-300
                ${
                  hoveredFacet === facet.id || activeFacet?.id === facet.id
                    ? 'bg-black/60 backdrop-blur-md border border-[#d4b896]/30'
                    : 'bg-black/30'
                }
              `}
            >
              <div className="text-2xl">{facet.icon}</div>
              <div
                className={`
                  text-xs font-medium tracking-wider uppercase whitespace-nowrap
                  transition-colors duration-300
                  ${
                    hoveredFacet === facet.id || activeFacet?.id === facet.id
                      ? 'text-[#d4b896]'
                      : 'text-gray-400'
                  }
                `}
              >
                {facet.name}
              </div>
              {facet.element && (
                <div className="text-[10px] text-gray-500 whitespace-nowrap">
                  {facet.element}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active facet details */}
      <AnimatePresence mode="wait">
        {activeFacet && (
          <motion.div
            key={activeFacet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md border border-[#d4b896]/20 rounded-lg p-8 max-w-2xl mx-auto"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{activeFacet.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-light text-[#d4b896] tracking-wide">
                    {activeFacet.name}
                  </h3>
                  {activeFacet.element && (
                    <span className="text-sm text-gray-500 px-2 py-1 border border-gray-700 rounded">
                      {activeFacet.element}
                    </span>
                  )}
                </div>
                <h4 className="text-lg text-gray-300 mb-3">
                  {activeFacet.title}
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {activeFacet.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveFacet(null)}
              className="mt-4 text-sm text-[#d4b896]/60 hover:text-[#d4b896] transition-colors"
            >
              Click to close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!activeFacet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm"
        >
          Hover or click on any facet to learn more
        </motion.div>
      )}

      {/* Footer text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mt-12 text-[#d4b896]/60 text-sm tracking-wide"
      >
        Every facet serves your wholeness. Nothing is isolated. All work
        together.
      </motion.div>
    </div>
  );
}