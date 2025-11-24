"use client";

import React from "react";

interface MiniHoloflowerProps {
  checkin?: Record<string, number>; // petal intensities
  oracle?: {
    element: "fire" | "water" | "earth" | "air" | "aether";
    stage: 1 | 2 | 3;
  };
  size?: number;
  onClick?: () => void;
  timestamp?: string;
  synthesis?: string;
  isHighlight?: boolean; // for breakthrough moments
}

const PETAL_MAP = [
  { name: "creativity", angle: 0, color: "#FF6B6B", element: "fire", stage: 1 },
  { name: "intuition", angle: 30, color: "#4ECDC4", element: "fire", stage: 2 },
  { name: "courage", angle: 60, color: "#FFD93D", element: "fire", stage: 3 },
  { name: "love", angle: 90, color: "#FF6BCB", element: "water", stage: 1 },
  { name: "wisdom", angle: 120, color: "#6BCB77", element: "water", stage: 2 },
  { name: "vision", angle: 150, color: "#4D96FF", element: "water", stage: 3 },
  { name: "grounding", angle: 180, color: "#8B4513", element: "earth", stage: 1 },
  { name: "flow", angle: 210, color: "#00CED1", element: "earth", stage: 2 },
  { name: "power", angle: 240, color: "#FF4500", element: "earth", stage: 3 },
  { name: "healing", angle: 270, color: "#90EE90", element: "air", stage: 1 },
  { name: "mystery", angle: 300, color: "#9370DB", element: "air", stage: 2 },
  { name: "joy", angle: 330, color: "#FFD700", element: "air", stage: 3 },
];

export default function MiniHoloflower({
  checkin = {},
  oracle,
  size = 80,
  onClick,
  timestamp,
  synthesis,
  isHighlight = false
}: MiniHoloflowerProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.35;

  // Get oracle petal if not Aether
  const oraclePetal = oracle && oracle.element !== "aether" 
    ? PETAL_MAP.find(p => p.element === oracle.element && p.stage === oracle.stage)
    : null;

  return (
    <div 
      className={`relative cursor-pointer transition-transform hover:scale-110 ${
        isHighlight ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black rounded-full" : ""
      }`}
      onClick={onClick}
      title={synthesis || timestamp}
    >
      <svg width={size} height={size} className="select-none">
        {/* Background circle */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={maxRadius} 
          fill="rgba(0,0,0,0.3)" 
          stroke="#333" 
          strokeWidth="0.5" 
        />

        {/* Aether center glow if active */}
        {oracle?.element === "aether" && (
          <>
            <radialGradient id={`aether-mini-${timestamp}`}>
              <stop offset="0%" stopColor="#E5E4E2" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#E5E4E2" stopOpacity="0"/>
            </radialGradient>
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={maxRadius * 0.6}
              fill={`url(#aether-mini-${timestamp})`}
              className="animate-pulse"
            />
          </>
        )}

        {/* Petals */}
        {PETAL_MAP.map((petal) => {
          const angleRad = (petal.angle - 90) * Math.PI / 180;
          const intensity = checkin[petal.name] || 0;
          const petalRadius = intensity * maxRadius * 0.8;
          const x = centerX + petalRadius * Math.cos(angleRad);
          const y = centerY + petalRadius * Math.sin(angleRad);
          
          // Check if this is the oracle petal
          const isOraclePetal = oraclePetal?.name === petal.name;
          
          return (
            <g key={petal.name}>
              {/* Petal line */}
              {intensity > 0.1 && (
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={petal.color}
                  strokeWidth={isOraclePetal ? 2 : 1}
                  opacity={intensity}
                />
              )}
              
              {/* Oracle highlight ring */}
              {isOraclePetal && (
                <circle
                  cx={centerX + maxRadius * 0.7 * Math.cos(angleRad)}
                  cy={centerY + maxRadius * 0.7 * Math.sin(angleRad)}
                  r="3"
                  fill="none"
                  stroke={petal.color}
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              )}
              
              {/* Petal dot */}
              {intensity > 0.3 && (
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill={petal.color}
                  opacity={intensity}
                />
              )}
            </g>
          );
        })}

        {/* Center dot */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="2" 
          fill={oracle?.element === "aether" ? "#E5E4E2" : "#FFD700"} 
        />
      </svg>

      {/* Optional timestamp label */}
      {timestamp && (
        <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500">
          {new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}