"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface PetalData {
  name: string;
  value: number; // 0-1 scale
  angle: number; // degrees
  color: string;
  essence?: string;
  keywords?: string[];
}

interface OracleWedge {
  element: "fire" | "water" | "earth" | "air" | "aether";
  stage: 1 | 2 | 3;
}

interface HoloflowerVizProps {
  onPetalChange?: (petals: Record<string, number>) => void;
  oracleWedge?: OracleWedge | null;
  mergedSynthesis?: string;
  width?: number;
  height?: number;
  breathingState?: 'calm' | 'active' | 'tense' | 'transcendent';
  coherence?: number; // 0-1, affects breathing rhythm
}

const PETALS: PetalData[] = [
  { name: "creativity", value: 0, angle: 0, color: "#FF6B6B", essence: "Creative Expression", keywords: ["innovation", "art", "flow"] },
  { name: "intuition", value: 0, angle: 30, color: "#4ECDC4", essence: "Inner Knowing", keywords: ["wisdom", "insight", "trust"] },
  { name: "courage", value: 0, angle: 60, color: "#FFD93D", essence: "Bold Action", keywords: ["bravery", "risk", "leadership"] },
  { name: "love", value: 0, angle: 90, color: "#FF6BCB", essence: "Heart Connection", keywords: ["compassion", "empathy", "unity"] },
  { name: "wisdom", value: 0, angle: 120, color: "#6BCB77", essence: "Deep Understanding", keywords: ["knowledge", "experience", "clarity"] },
  { name: "vision", value: 0, angle: 150, color: "#4D96FF", essence: "Future Sight", keywords: ["dreams", "goals", "possibility"] },
  { name: "grounding", value: 0, angle: 180, color: "#8B4513", essence: "Earth Connection", keywords: ["stability", "presence", "roots"] },
  { name: "flow", value: 0, angle: 210, color: "#00CED1", essence: "Adaptive Movement", keywords: ["flexibility", "grace", "change"] },
  { name: "power", value: 0, angle: 240, color: "#FF4500", essence: "Personal Authority", keywords: ["strength", "will", "impact"] },
  { name: "healing", value: 0, angle: 270, color: "#90EE90", essence: "Restoration", keywords: ["recovery", "wholeness", "peace"] },
  { name: "mystery", value: 0, angle: 300, color: "#9370DB", essence: "Unknown Depths", keywords: ["shadow", "secrets", "transformation"] },
  { name: "joy", value: 0, angle: 330, color: "#FFD700", essence: "Pure Delight", keywords: ["play", "laughter", "celebration"] },
];

// Map elements to wedge angles (30° each wedge, 3 stages per element)
const ELEMENT_WEDGES = {
  fire: { start: 0, stages: [0, 30, 60] },    // 0°-90°
  water: { start: 90, stages: [90, 120, 150] }, // 90°-180°
  earth: { start: 180, stages: [180, 210, 240] }, // 180°-270°
  air: { start: 270, stages: [270, 300, 330] }   // 270°-360°
};

export default function HoloflowerViz({
  onPetalChange,
  oracleWedge,
  mergedSynthesis,
  width = 600,
  height = 600,
  breathingState = 'calm',
  coherence = 0.5
}: HoloflowerVizProps) {
  const [petals, setPetals] = useState(PETALS);
  const [draggedPetal, setDraggedPetal] = useState<string | null>(null);
  const [hoveredPetal, setHoveredPetal] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.35;

  // Handle petal dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedPetal || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const distance = Math.sqrt(x * x + y * y);
    const value = Math.min(1, distance / maxRadius);

    setPetals(prev => prev.map(p => 
      p.name === draggedPetal ? { ...p, value } : p
    ));
  }, [draggedPetal, centerX, centerY, maxRadius]);

  const handleMouseUp = useCallback(() => {
    if (draggedPetal && onPetalChange) {
      const petalValues = petals.reduce((acc, p) => ({
        ...acc,
        [p.name]: p.value
      }), {});
      onPetalChange(petalValues);
    }
    setDraggedPetal(null);
  }, [draggedPetal, petals, onPetalChange]);

  useEffect(() => {
    if (draggedPetal) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedPetal, handleMouseMove, handleMouseUp]);

  // Calculate wedge path for oracle highlight
  const getWedgePath = (element: string, stage: number) => {
    const wedgeData = ELEMENT_WEDGES[element as keyof typeof ELEMENT_WEDGES];
    if (!wedgeData) return "";
    
    const startAngle = wedgeData.stages[stage - 1];
    const endAngle = startAngle + 30;
    const innerRadius = maxRadius * 0.2;
    const outerRadius = maxRadius * 1.1;

    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`;
  };

  // Calculate breathing rhythm based on coherence and state
  const getBreathingStyle = () => {
    const baseSpeed = 4; // seconds
    const coherenceMultiplier = 1 - (coherence * 0.5); // Lower coherence = slower breathing
    const speed = baseSpeed * coherenceMultiplier;
    
    const stateModifiers = {
      calm: { scale: 1.02, opacity: 0.7, speed: speed },
      active: { scale: 1.05, opacity: 0.85, speed: speed * 0.7 },
      tense: { scale: 1.03, opacity: 0.6, speed: speed * 1.5 },
      transcendent: { scale: 1.08, opacity: 0.9, speed: speed * 0.5 }
    };
    
    return stateModifiers[breathingState];
  };

  const breathingStyle = getBreathingStyle();

  return (
    <div className="relative">
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="select-none"
        style={{ cursor: draggedPetal ? "grabbing" : "default" }}
      >
        {/* Background circles with breathing animation */}
        <g>
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={maxRadius} 
            fill="none" 
            stroke="#2a2a2a" 
            strokeWidth="1" 
            opacity="0.3"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              animation: `breathe-outer ${breathingStyle.speed}s ease-in-out infinite`
            }}
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={maxRadius * 0.75} 
            fill="none" 
            stroke="#2a2a2a" 
            strokeWidth="1" 
            opacity="0.2"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              animation: `breathe-mid ${breathingStyle.speed}s ease-in-out infinite 0.2s`
            }}
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={maxRadius * 0.5} 
            fill="none" 
            stroke="#2a2a2a" 
            strokeWidth="1" 
            opacity="0.2"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              animation: `breathe-inner ${breathingStyle.speed}s ease-in-out infinite 0.4s`
            }}
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={maxRadius * 0.25} 
            fill="none" 
            stroke="#2a2a2a" 
            strokeWidth="1" 
            opacity="0.2"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              animation: `breathe-core ${breathingStyle.speed}s ease-in-out infinite 0.6s`
            }}
          />
        </g>

        {/* Oracle wedge highlight for elements OR Aether center pulse */}
        {oracleWedge && (
          oracleWedge.element === "aether" ? (
            <>
              {/* Aether center pulse effect */}
              <circle 
                cx={centerX} 
                cy={centerY} 
                r={maxRadius * 0.15}
                fill="none"
                stroke="#E5E4E2"
                strokeWidth="2"
                opacity="0.8"
                className="animate-pulse"
              />
              <circle 
                cx={centerX} 
                cy={centerY} 
                r={maxRadius * 0.25}
                fill="none"
                stroke="#E5E4E2"
                strokeWidth="1.5"
                opacity="0.5"
                className="animate-pulse"
              />
              <circle 
                cx={centerX} 
                cy={centerY} 
                r={maxRadius * 0.35}
                fill="none"
                stroke="#E5E4E2"
                strokeWidth="1"
                opacity="0.3"
                className="animate-pulse"
              />
              {/* Aether glow gradient */}
              <radialGradient id="aetherGlow">
                <stop offset="0%" stopColor="#E5E4E2" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#E5E4E2" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#E5E4E2" stopOpacity="0"/>
              </radialGradient>
              <circle 
                cx={centerX} 
                cy={centerY} 
                r={maxRadius * 0.4}
                fill="url(#aetherGlow)"
                className="animate-pulse"
              />
            </>
          ) : (
            <path
              d={getWedgePath(oracleWedge.element, oracleWedge.stage)}
              fill={oracleWedge.element === "fire" ? "#FF6B6B" : 
                    oracleWedge.element === "water" ? "#4ECDC4" :
                    oracleWedge.element === "earth" ? "#8B4513" : "#87CEEB"}
              opacity="0.3"
              className="animate-pulse"
            />
          )
        )}

        {/* Petal lines and dots */}
        {petals.map((petal) => {
          const angleRad = (petal.angle - 90) * Math.PI / 180;
          const petalRadius = petal.value * maxRadius;
          const x = centerX + petalRadius * Math.cos(angleRad);
          const y = centerY + petalRadius * Math.sin(angleRad);
          const labelX = centerX + (maxRadius + 30) * Math.cos(angleRad);
          const labelY = centerY + (maxRadius + 30) * Math.sin(angleRad);

          return (
            <g key={petal.name}>
              {/* Petal line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={petal.color}
                strokeWidth={petal.value > 0.3 ? 3 : 2}
                opacity={petal.value > 0 ? 0.8 : 0.2}
              />
              
              {/* Petal dot (draggable) */}
              <circle
                cx={x}
                cy={y}
                r={hoveredPetal === petal.name ? 10 : 8}
                fill={petal.color}
                stroke="white"
                strokeWidth="2"
                cursor="grab"
                opacity={petal.value > 0 ? 1 : 0.5}
                onMouseDown={() => setDraggedPetal(petal.name)}
                onMouseEnter={() => setHoveredPetal(petal.name)}
                onMouseLeave={() => setHoveredPetal(null)}
              />
              
              {/* Petal label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={petal.value > 0.3 ? petal.color : "#666"}
                fontSize="12"
                fontWeight={petal.value > 0.3 ? "bold" : "normal"}
              >
                {petal.name}
              </text>
            </g>
          );
        })}

        {/* Center circle with breathing */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r="5" 
          fill="#FFD700"
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            animation: `breathe-center ${breathingStyle.speed}s ease-in-out infinite`,
            opacity: breathingStyle.opacity
          }}
        />
        
        {/* Synthesis text */}
        {mergedSynthesis && (
          <text
            x={centerX}
            y={height - 20}
            textAnchor="middle"
            fill="#FFD700"
            fontSize="14"
            fontStyle="italic"
            className="animate-pulse"
          >
            {mergedSynthesis}
          </text>
        )}
        
        {/* CSS Animation Definitions */}
        <defs>
          <style>{`
            @keyframes breathe-outer {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(${breathingStyle.scale}); opacity: ${breathingStyle.opacity * 0.5}; }
            }
            @keyframes breathe-mid {
              0%, 100% { transform: scale(1); opacity: 0.2; }
              50% { transform: scale(${breathingStyle.scale * 1.02}); opacity: ${breathingStyle.opacity * 0.4}; }
            }
            @keyframes breathe-inner {
              0%, 100% { transform: scale(1); opacity: 0.2; }
              50% { transform: scale(${breathingStyle.scale * 1.04}); opacity: ${breathingStyle.opacity * 0.3}; }
            }
            @keyframes breathe-core {
              0%, 100% { transform: scale(1); opacity: 0.2; }
              50% { transform: scale(${breathingStyle.scale * 1.06}); opacity: ${breathingStyle.opacity * 0.6}; }
            }
            @keyframes breathe-center {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(${breathingStyle.scale * 0.5}); }
            }
          `}</style>
        </defs>
      </svg>

      {/* Petal meanings display */}
      {hoveredPetal && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-xs">
          {(() => {
            const petal = petals.find(p => p.name === hoveredPetal);
            return petal ? (
              <>
                <h3 className="font-bold text-lg" style={{ color: petal.color }}>
                  {petal.essence}
                </h3>
                <p className="text-sm mt-1">
                  {petal.keywords?.join(" • ")}
                </p>
                <p className="text-xs mt-2 opacity-70">
                  Strength: {Math.round(petal.value * 100)}%
                </p>
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}