/**
 * Spiralogic-Herrmann Brain Model Visual Mapping Component
 * Maps the five elements to Herrmann's four quadrants of thinking preferences
 */
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ElementalBalance {
  fire: number;    // 0-1
  water: number;   // 0-1
  earth: number;   // 0-1
  air: number;     // 0-1
  aether: number;  // 0-1
}

interface HerrmannQuadrant {
  id: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  characteristics: string[];
}

interface SpiralogicHerrmannMapProps {
  elementalBalance: ElementalBalance;
  showLabels?: boolean;
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  onQuadrantClick?: (quadrant: HerrmannQuadrant) => void;
}

const HERRMANN_QUADRANTS: HerrmannQuadrant[] = [
  {
    id: 'A',
    name: 'Analytical',
    description: 'Logical, factual, critical, technical, quantitative',
    color: '#3B82F6', // Blue
    position: { x: -1, y: 1 },
    characteristics: ['Logical thinking', 'Analysis of facts', 'Processing numbers', 'Critical analysis']
  },
  {
    id: 'B',
    name: 'Sequential',
    description: 'Organized, detailed, planned, structured',
    color: '#10B981', // Green
    position: { x: -1, y: -1 },
    characteristics: ['Planning', 'Organizing', 'Detailed review', 'Sequential processing']
  },
  {
    id: 'C',
    name: 'Interpersonal',
    description: 'Kinesthetic, emotional, spiritual, sensory',
    color: '#8B5CF6', // Purple
    position: { x: 1, y: -1 },
    characteristics: ['Expressing ideas', 'Interpersonal', 'Writing', 'Teaching']
  },
  {
    id: 'D',
    name: 'Experimental',
    description: 'Holistic, intuitive, integrating, synthesizing',
    color: '#EF4444', // Red
    position: { x: 1, y: 1 },
    characteristics: ['Visual thinking', 'Holistic view', 'Innovation', 'Conceptualizing']
  }
];

const ELEMENT_TO_QUADRANT_MAPPING = {
  air: 'A',     // Air → Analytical (Upper Left)
  earth: 'B',   // Earth → Sequential (Lower Left)
  water: 'C',   // Water → Interpersonal (Lower Right)
  fire: 'D',    // Fire → Experimental (Upper Right)
  aether: null  // Aether → Center (integration of all)
};

export default function SpiralogicHerrmannMap({
  elementalBalance,
  showLabels = true,
  interactive = true,
  size = 'medium',
  onQuadrantClick
}: SpiralogicHerrmannMapProps) {
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  // Calculate quadrant strengths from elemental balance
  const quadrantStrengths = useMemo(() => {
    return {
      A: elementalBalance.air,
      B: elementalBalance.earth,
      C: elementalBalance.water,
      D: elementalBalance.fire
    };
  }, [elementalBalance]);

  // Calculate center point (Aether) strength
  const centerStrength = elementalBalance.aether;

  // Calculate overall balance score
  const balanceScore = useMemo(() => {
    const values = Object.values(quadrantStrengths);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return 1 - Math.sqrt(variance);
  }, [quadrantStrengths]);

  // Determine size dimensions
  const dimensions = {
    small: { width: 300, height: 300, padding: 40 },
    medium: { width: 500, height: 500, padding: 60 },
    large: { width: 700, height: 700, padding: 80 }
  }[size];

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) - dimensions.padding;

  // Handle quadrant click
  const handleQuadrantClick = (quadrant: HerrmannQuadrant) => {
    if (!interactive) return;
    setSelectedQuadrant(quadrant.id);
    onQuadrantClick?.(quadrant);
  };

  return (
    <Card className="p-6  from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-4">
        {/* Title and Balance Score */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Consciousness Navigation Map</h3>
          <Badge variant="outline" className="text-sm">
            Balance: {(balanceScore * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Main Visualization */}
        <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
          <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
            {/* Background circles */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300 dark:text-gray-600"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.5}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5 5"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Axis lines */}
            <line
              x1={centerX - radius}
              y1={centerY}
              x2={centerX + radius}
              y2={centerY}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 dark:text-gray-600"
            />
            <line
              x1={centerX}
              y1={centerY - radius}
              x2={centerX}
              y2={centerY + radius}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 dark:text-gray-600"
            />

            {/* Quadrant areas */}
            {HERRMANN_QUADRANTS.map(quadrant => {
              const strength = quadrantStrengths[quadrant.id];
              const angleStart = quadrant.id === 'A' ? 180 : quadrant.id === 'B' ? 90 : quadrant.id === 'C' ? 0 : 270;
              const angleEnd = angleStart + 90;
              
              const startRad = (angleStart * Math.PI) / 180;
              const endRad = (angleEnd * Math.PI) / 180;
              
              const x1 = centerX + radius * strength * Math.cos(startRad);
              const y1 = centerY + radius * strength * Math.sin(startRad);
              const x2 = centerX + radius * strength * Math.cos(endRad);
              const y2 = centerY + radius * strength * Math.sin(endRad);

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius * strength} ${radius * strength} 0 0 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              return (
                <motion.path
                  key={quadrant.id}
                  d={pathData}
                  fill={quadrant.color}
                  fillOpacity={0.3 + strength * 0.4}
                  stroke={quadrant.color}
                  strokeWidth="2"
                  className={interactive ? "cursor-pointer" : ""}
                  whileHover={interactive ? { fillOpacity: 0.8 } : {}}
                  onClick={() => handleQuadrantClick(quadrant)}
                  onMouseEnter={() => setHoveredQuadrant(quadrant.id)}
                  onMouseLeave={() => setHoveredQuadrant(null)}
                />
              );
            })}

            {/* Center Aether circle */}
            <motion.circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.15 * centerStrength}
              fill="url(#aetherGradient)"
              fillOpacity={0.6 + centerStrength * 0.4}
              stroke="white"
              strokeWidth="2"
              animate={{
                r: radius * 0.15 * centerStrength,
                fillOpacity: 0.6 + centerStrength * 0.4
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Gradient definition for Aether */}
            <defs>
              <radialGradient id="aetherGradient">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF6347" />
              </radialGradient>
            </defs>

            {/* Labels */}
            {showLabels && HERRMANN_QUADRANTS.map(quadrant => {
              const labelX = centerX + (radius * 0.7 * quadrant.position.x);
              const labelY = centerY - (radius * 0.7 * quadrant.position.y);
              
              return (
                <text
                  key={`label-${quadrant.id}`}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-current text-sm font-semibold"
                  style={{ fill: quadrant.color }}
                >
                  {quadrant.id}: {quadrant.name}
                </text>
              );
            })}

            {/* Center label */}
            {showLabels && (
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-xs font-semibold text-gray-600 dark:text-gray-300"
              >
                Aether
              </text>
            )}
          </svg>
        </div>

        {/* Elemental Mapping Legend */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {Object.entries(elementalBalance).map(([element, value]) => {
            const quadrantId = ELEMENT_TO_QUADRANT_MAPPING[element as keyof typeof ELEMENT_TO_QUADRANT_MAPPING];
            const quadrant = quadrantId ? HERRMANN_QUADRANTS.find(q => q.id === quadrantId) : null;
            
            return (
              <div key={element} className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <ElementIcon element={element as keyof ElementalBalance} />
                  <span className="text-sm font-medium capitalize">{element}</span>
                </div>
                <Progress value={value * 100} className="h-2" />
                <span className="text-xs text-gray-500">
                  {quadrant ? quadrant.name : 'Integration'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quadrant Details (shown on hover/selection) */}
        <AnimatePresence>
          {(hoveredQuadrant || selectedQuadrant) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md"
            >
              {(() => {
                const quadrantId = hoveredQuadrant || selectedQuadrant;
                const quadrant = HERRMANN_QUADRANTS.find(q => q.id === quadrantId);
                if (!quadrant) return null;

                return (
                  <>
                    <h4 className="font-semibold text-lg" style={{ color: quadrant.color }}>
                      {quadrant.name} Quadrant ({quadrant.id})
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {quadrant.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-500">Key Characteristics:</p>
                      <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {quadrant.characteristics.map((char, i) => (
                          <li key={i}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Current Strength: {(quadrantStrengths[quadrant.id] * 100).toFixed(0)}%
                      </p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// Helper component for element icons
function ElementIcon({ element }: { element: keyof ElementalBalance }) {
  const icons = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬️',
    aether: '✨'
  };
  
  return <span className="text-lg">{icons[element]}</span>;
}