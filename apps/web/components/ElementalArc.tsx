"use client";

import React, { useMemo } from "react";
import { Session } from "./SessionHistory";

interface ElementalArcProps {
  sessions: Session[];
  height?: number;
}

export default function ElementalArc({ sessions, height = 200 }: ElementalArcProps) {
  // Process sessions into time series data
  const arcData = useMemo(() => {
    return sessions.map((session, idx) => {
      // Calculate elemental intensities from check-in
      const elements = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0
      };

      // Map petals to elements
      const petalElementMap: Record<string, string> = {
        creativity: "fire", intuition: "fire", courage: "fire",
        love: "water", wisdom: "water", vision: "water",
        grounding: "earth", flow: "earth", power: "earth",
        healing: "air", mystery: "air", joy: "air"
      };

      // Sum up petal intensities by element
      if (session.checkin) {
        Object.entries(session.checkin).forEach(([petal, intensity]) => {
          const element = petalElementMap[petal];
          if (element && element in elements) {
            elements[element as keyof typeof elements] += intensity / 3; // Average per element
          }
        });
      }

      // Boost oracle element
      const oracleElement = session.oracleReading?.spiralStage?.element;
      if (oracleElement && oracleElement in elements) {
        elements[oracleElement] = Math.min(1, elements[oracleElement] + 0.3);
      }

      return {
        index: idx,
        timestamp: session.timestamp,
        ...elements,
        dominant: Object.entries(elements).reduce((a, b) => 
          elements[a as keyof typeof elements] > b[1] ? a : b[0]
        ) as string
      };
    });
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-500">
        No journey data yet. Complete some sessions to see your elemental arc.
      </div>
    );
  }

  const width = Math.max(600, sessions.length * 60);
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Create stacked area paths
  const createPath = (element: keyof typeof arcData[0], offset: number = 0) => {
    const points = arcData.map((d, i) => {
      const x = (i / (arcData.length - 1)) * graphWidth;
      const value = d[element] as number;
      const y = graphHeight - (value * graphHeight) - offset;
      return `${x},${y}`;
    });
    
    // Create area path
    const firstX = 0;
    const lastX = graphWidth;
    return `M ${firstX},${graphHeight - offset} L ${points.join(" L ")} L ${lastX},${graphHeight - offset} Z`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] p-4 bg-black/30 rounded-lg">
        <h3 className="text-sm font-medium text-amber-300 mb-3">Elemental Arc Journey</h3>
        
        <svg width={width} height={height} className="overflow-visible">
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(tick => (
              <line
                key={tick}
                x1={0}
                y1={graphHeight - tick * graphHeight}
                x2={graphWidth}
                y2={graphHeight - tick * graphHeight}
                stroke="#333"
                strokeWidth="0.5"
                strokeDasharray={tick === 0 ? "0" : "2,2"}
              />
            ))}

            {/* Stacked areas */}
            <path
              d={createPath("aether", 0)}
              fill="url(#aetherGradient)"
              opacity="0.6"
            />
            <path
              d={createPath("air", 0)}
              fill="#87CEEB"
              opacity="0.6"
            />
            <path
              d={createPath("earth", 0)}
              fill="#8B4513"
              opacity="0.6"
            />
            <path
              d={createPath("water", 0)}
              fill="#4ECDC4"
              opacity="0.6"
            />
            <path
              d={createPath("fire", 0)}
              fill="#FF6B6B"
              opacity="0.6"
            />

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="aetherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E5E4E2" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#E5E4E2" stopOpacity="0.2"/>
              </linearGradient>
            </defs>

            {/* Session markers */}
            {arcData.map((d, i) => {
              const x = (i / (arcData.length - 1)) * graphWidth;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={0}
                    y2={graphHeight}
                    stroke="#666"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <circle
                    cx={x}
                    cy={graphHeight}
                    r="3"
                    fill={
                      d.dominant === "fire" ? "#FF6B6B" :
                      d.dominant === "water" ? "#4ECDC4" :
                      d.dominant === "earth" ? "#8B4513" :
                      d.dominant === "air" ? "#87CEEB" :
                      "#E5E4E2"
                    }
                  />
                  <text
                    x={x}
                    y={graphHeight + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                  >
                    {new Date(d.timestamp).toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric' 
                    })}
                  </text>
                </g>
              );
            })}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map(tick => (
              <text
                key={tick}
                x={-10}
                y={graphHeight - tick * graphHeight + 4}
                textAnchor="end"
                fontSize="10"
                fill="#666"
              >
                {Math.round(tick * 100)}%
              </text>
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex gap-4 mt-4 justify-center text-xs">
          {[
            { name: "Fire", color: "#FF6B6B", symbol: "🔥" },
            { name: "Water", color: "#4ECDC4", symbol: "💧" },
            { name: "Earth", color: "#8B4513", symbol: "🌍" },
            { name: "Air", color: "#87CEEB", symbol: "🌬️" },
            { name: "Aether", color: "#E5E4E2", symbol: "✨" }
          ].map(elem => (
            <div key={elem.name} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: elem.color }}
              />
              <span className="text-gray-400">
                {elem.symbol} {elem.name}
              </span>
            </div>
          ))}
        </div>

        {/* Pattern Detection */}
        <div className="mt-4 p-3 bg-amber-900/20 rounded-lg">
          <h4 className="text-xs font-medium text-amber-300 mb-2">Detected Patterns:</h4>
          <div className="text-xs text-gray-400 space-y-1">
            {(() => {
              const dominantCounts = arcData.reduce((acc, d) => {
                acc[d.dominant] = (acc[d.dominant] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const mostCommon = Object.entries(dominantCounts)
                .sort((a, b) => b[1] - a[1])[0];
              
              const transitions = arcData.slice(1).map((d, i) => 
                `${arcData[i].dominant}→${d.dominant}`
              ).filter((t, i, arr) => arr.indexOf(t) === i);

              return (
                <>
                  <div>• Primary element: {mostCommon[0]} ({Math.round(mostCommon[1] / arcData.length * 100)}%)</div>
                  <div>• Unique transitions: {transitions.slice(0, 3).join(", ")}</div>
                  <div>• Journey span: {arcData.length} sessions over {
                    Math.ceil((new Date(arcData[arcData.length - 1].timestamp).getTime() - 
                               new Date(arcData[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
                  } days</div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}