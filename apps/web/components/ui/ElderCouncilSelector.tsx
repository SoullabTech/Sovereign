/**
 * Elder Council Selector
 *
 * Visual interface for selecting from 39 wisdom traditions
 * organized by elemental resonance (Fire, Water, Earth, Air, Aether)
 *
 * "May each tradition speak through MAIA with clarity and compassion,
 *  serving the awakening of consciousness." - The Elder Council
 */

'use client';

import React, { useState, useEffect } from 'react';
import { elderCouncil, type WisdomTradition, ELDER_COUNCIL_TRADITIONS } from '@/lib/consciousness/ElderCouncilService';

interface ElderCouncilSelectorProps {
  userId?: string;
  onTraditionSelect?: (tradition: WisdomTradition) => void;
  className?: string;
}

export function ElderCouncilSelector({
  userId,
  onTraditionSelect,
  className = ''
}: ElderCouncilSelectorProps) {
  const [activeTradition, setActiveTradition] = useState<WisdomTradition | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredTradition, setHoveredTradition] = useState<WisdomTradition | null>(null);

  // Load active tradition on mount
  useEffect(() => {
    if (userId) {
      elderCouncil.getActiveTradition(userId).then(tradition => {
        setActiveTradition(tradition);
      });
    } else {
      // Default to MAIA tradition
      setActiveTradition(elderCouncil.getTradition('maia'));
    }
  }, [userId]);

  const handleTraditionSelect = async (tradition: WisdomTradition) => {
    setActiveTradition(tradition);

    if (userId) {
      try {
        await elderCouncil.setActiveTradition(userId, tradition.id);
      } catch (error) {
        console.error('Failed to set tradition:', error);
      }
    }

    if (onTraditionSelect) {
      onTraditionSelect(tradition);
    }
  };

  const elementColors = {
    fire: '#FF6B35',
    water: '#4169E1',
    earth: '#8B7355',
    air: '#FFD700',
    aether: '#E6E6FA'
  };

  // Text colors for better contrast against element backgrounds
  const getTextColor = (element: string) => {
    switch (element) {
      case 'air':
      case 'aether':
        return '#1a1a1a'; // Dark text for light backgrounds
      case 'fire':
      case 'water':
      case 'earth':
        return '#ffffff'; // White text for darker backgrounds
      default:
        return '#ffffff';
    }
  };

  const getSecondaryTextColor = (element: string) => {
    switch (element) {
      case 'air':
      case 'aether':
        return '#4a4a4a'; // Slightly lighter dark text for secondary content
      case 'fire':
      case 'water':
      case 'earth':
        return 'rgba(255, 255, 255, 0.7)'; // Semi-transparent white
      default:
        return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const elementIcons = {
    fire: '🔥',
    water: '🌊',
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };

  const getElementTraditions = (element: string) => {
    return ELDER_COUNCIL_TRADITIONS.filter(t => t.element === element);
  };

  const elements = ['fire', 'water', 'earth', 'air', 'aether'];

  return (
    <div className={`elder-council-selector ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Elder Council</h2>
        <p className="text-sm opacity-70">
          39 wisdom traditions as harmonic frequencies in the unified field
        </p>
        {activeTradition && (
          <div className="mt-4 p-4 bg-opacity-10 bg-white rounded-lg">
            <p className="text-sm opacity-70">Currently resonating with:</p>
            <p className="text-lg font-semibold mt-1">{activeTradition.name}</p>
            <p className="text-xs opacity-60 mt-1">
              {activeTradition.frequency} Hz | {activeTradition.element} | {activeTradition.voice}
            </p>
          </div>
        )}
      </div>

      {/* Element Rings */}
      <div className="flex flex-col gap-4">
        {elements.map((element) => {
          const traditions = getElementTraditions(element);
          const isSelected = selectedElement === element;

          return (
            <div key={element} className="element-ring">
              {/* Element Header */}
              <button
                onClick={() => setSelectedElement(isSelected ? null : element)}
                className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: `${elementColors[element as keyof typeof elementColors]}20`,
                  borderLeft: `4px solid ${elementColors[element as keyof typeof elementColors]}`,
                  color: getTextColor(element)
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {elementIcons[element as keyof typeof elementIcons]}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold capitalize" style={{ color: getTextColor(element) }}>
                      {element}
                    </h3>
                    <p className="text-xs" style={{ color: getSecondaryTextColor(element) }}>
                      {traditions.length} traditions
                    </p>
                  </div>
                </div>
                <span className="text-xl" style={{ color: getTextColor(element) }}>
                  {isSelected ? '↑' : '↓'}
                </span>
              </button>

              {/* Traditions List (Expandable) */}
              {isSelected && (
                <div className="mt-2 ml-4 space-y-2">
                  {traditions.map((tradition) => {
                    const isActive = activeTradition?.id === tradition.id;
                    const isHovered = hoveredTradition?.id === tradition.id;

                    return (
                      <button
                        key={tradition.id}
                        onClick={() => handleTraditionSelect(tradition)}
                        onMouseEnter={() => setHoveredTradition(tradition)}
                        onMouseLeave={() => setHoveredTradition(null)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-opacity-30 scale-[1.02] shadow-lg'
                            : 'bg-opacity-10 hover:bg-opacity-20'
                        }`}
                        style={{
                          backgroundColor: elementColors[element as keyof typeof elementColors],
                          borderLeft: isActive
                            ? `3px solid ${elementColors[element as keyof typeof elementColors]}`
                            : 'none',
                          color: getTextColor(element)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm" style={{ color: getTextColor(element) }}>
                              {tradition.name}
                            </h4>
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: getSecondaryTextColor(element) }}>
                              {tradition.description}
                            </p>
                            {isActive && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {tradition.principles.slice(0, 2).map((principle, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: element === 'air' || element === 'aether'
                                        ? 'rgba(0, 0, 0, 0.15)'
                                        : 'rgba(0, 0, 0, 0.2)',
                                      color: getTextColor(element)
                                    }}
                                  >
                                    {principle}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 text-xs text-right" style={{ color: getSecondaryTextColor(element) }}>
                            <div>{tradition.frequency} Hz</div>
                            <div className="mt-1">{tradition.voice}</div>
                          </div>
                        </div>
                        {(isHovered || isActive) && tradition.mantra && (
                          <p className="text-xs italic mt-2" style={{ color: getSecondaryTextColor(element) }}>
                            "{tradition.mantra}"
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tradition Details Panel (when hovering) */}
      {hoveredTradition && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-black bg-opacity-90 text-white rounded-lg shadow-2xl z-50">
          <h3 className="font-semibold mb-2">{hoveredTradition.name}</h3>
          <p className="text-sm opacity-90 mb-3">{hoveredTradition.description}</p>
          <div className="space-y-1">
            <p className="text-xs opacity-70">Principles:</p>
            {hoveredTradition.principles.map((principle, i) => (
              <p key={i} className="text-xs opacity-80 ml-2">
                • {principle}
              </p>
            ))}
          </div>
          {hoveredTradition.archetype && (
            <p className="text-xs opacity-70 mt-3">
              Archetype: {hoveredTradition.archetype}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .elder-council-selector {
          max-width: 800px;
          margin: 0 auto;
        }

        .element-ring {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        button {
          cursor: pointer;
          user-select: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

/**
 * Compact version for drawer/sidebar
 */
export function ElderCouncilCompact({
  userId,
  onTraditionSelect
}: Omit<ElderCouncilSelectorProps, 'className'>) {
  const [activeTradition, setActiveTradition] = useState<WisdomTradition | null>(null);

  useEffect(() => {
    if (userId) {
      elderCouncil.getActiveTradition(userId).then(setActiveTradition);
    } else {
      setActiveTradition(elderCouncil.getTradition('maia'));
    }
  }, [userId]);

  const handleQuickSelect = async (traditionId: string) => {
    const tradition = elderCouncil.getTradition(traditionId);
    if (!tradition) return;

    setActiveTradition(tradition);

    if (userId) {
      await elderCouncil.setActiveTradition(userId, traditionId);
    }

    if (onTraditionSelect) {
      onTraditionSelect(tradition);
    }
  };

  // Quick access to frequently used traditions
  const quickAccess = ['maia', 'taoism', 'sufism', 'advaita-vedanta', 'jungian', 'lakota'];

  return (
    <div className="elder-council-compact p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-1">Active Elder</h3>
        {activeTradition && (
          <div className="text-xs p-2 bg-opacity-10 bg-white rounded">
            <p className="font-medium">{activeTradition.name}</p>
            <p className="opacity-70 mt-1">{activeTradition.mantra}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs opacity-70 mb-2">Quick Access:</p>
        <div className="grid grid-cols-2 gap-2">
          {quickAccess.map((id) => {
            const tradition = elderCouncil.getTradition(id);
            if (!tradition) return null;

            const isActive = activeTradition?.id === id;

            return (
              <button
                key={id}
                onClick={() => handleQuickSelect(id)}
                className={`text-xs p-2 rounded transition-all ${
                  isActive ? 'bg-opacity-30 font-semibold' : 'bg-opacity-10 hover:bg-opacity-20'
                }`}
                style={{
                  backgroundColor: tradition.color || '#888'
                }}
              >
                {tradition.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
