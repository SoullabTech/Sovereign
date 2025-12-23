/**
 * SymbolCloud - Air Layer Component
 *
 * 🌬️ Interactive D3.js force-directed graph of archetypal symbols.
 * Overlays the center spiral canvas, allowing filtering by symbol/archetype.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder (Static bubbles, D3.js in Phase 3)
 * Created: December 23, 2024
 */

'use client';

import { motion } from 'framer-motion';
import type { SymbolCloudProps } from '../../types';

export function SymbolCloud({
  symbols,
  activeSymbol,
  onSymbolClick,
}: SymbolCloudProps) {
  // Phase 1: Static positioned symbols
  // Phase 3: Replace with D3.js force simulation

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Phase 1 Placeholder: Static symbol bubbles */}
      <div className="relative w-full h-full">
        {symbols.length > 0 ? (
          symbols.map((symbol, index) => (
            <SymbolBubble
              key={symbol.id}
              symbol={symbol}
              isActive={activeSymbol === symbol.id}
              onClick={() => onSymbolClick(symbol.id)}
              // Phase 1: Static grid layout
              style={{
                left: `${20 + (index % 5) * 15}%`,
                top: `${20 + Math.floor(index / 5) * 15}%`,
              }}
            />
          ))
        ) : (
          <PlaceholderSymbols onSymbolClick={onSymbolClick} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: SymbolBubble
// ============================================================================

interface SymbolBubbleProps {
  symbol: {
    id: string;
    label: string;
    frequency: number;
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}

function SymbolBubble({ symbol, isActive, onClick, style }: SymbolBubbleProps) {
  const size = 40 + symbol.frequency * 20; // Scale by frequency

  return (
    <motion.button
      onClick={onClick}
      style={style}
      className="absolute pointer-events-auto rounded-full
                 flex items-center justify-center
                 border-2 transition-all duration-200
                 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
      animate={{
        scale: isActive ? 1.2 : 1,
        borderColor: isActive ? '#3B82F6' : symbol.color,
        backgroundColor: isActive ? '#DBEAFE' : `${symbol.color}20`,
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      style={{
        ...style,
        width: size,
        height: size,
      }}
    >
      <span
        className={`text-xs font-air font-medium ${
          isActive ? 'text-blue-700' : 'text-gray-700'
        }`}
      >
        {symbol.label}
      </span>
    </motion.button>
  );
}

// ============================================================================
// Placeholder: Mock Symbols (Phase 1)
// ============================================================================

function PlaceholderSymbols({ onSymbolClick }: { onSymbolClick: (id: string) => void }) {
  const mockSymbols = [
    { id: 'renewal', label: 'Renewal', frequency: 0.8, color: '#10B981' },
    { id: 'shadow', label: 'Shadow', frequency: 0.6, color: '#8B5CF6' },
    { id: 'integration', label: 'Integration', frequency: 0.7, color: '#F59E0B' },
    { id: 'threshold', label: 'Threshold', frequency: 0.5, color: '#EF4444' },
    { id: 'emergence', label: 'Emergence', frequency: 0.9, color: '#06B6D4' },
  ];

  return (
    <>
      {mockSymbols.map((symbol, index) => (
        <SymbolBubble
          key={symbol.id}
          symbol={symbol}
          isActive={false}
          onClick={() => onSymbolClick(symbol.id)}
          style={{
            left: `${25 + (index % 3) * 20}%`,
            top: `${25 + Math.floor(index / 3) * 20}%`,
          }}
        />
      ))}

      {/* Phase 1 indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                      text-xs text-gray-400 italic bg-white/80 px-3 py-1 rounded-full
                      pointer-events-auto">
        Phase 1 Placeholder • D3.js force layout in Phase 3
      </div>
    </>
  );
}
