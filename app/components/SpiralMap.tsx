"use client";

/**
 * SPIRAL MAP VISUALIZATION
 * Phase 4.4-B: Analytics Dashboard Frontend
 *
 * Renders a polar spiral visualization of facet analytics.
 * Each facet is positioned on a spiral based on its sequential order (1-15),
 * with size representing trace count and color representing element.
 */

import React, { useEffect, useState } from "react";

interface FacetAnalytics {
  facetCode: string;
  element: "Fire" | "Water" | "Earth" | "Air" | "Aether" | "Unknown";
  phase: 1 | 2 | 3 | null;
  traceCount: number;
  avgConfidence: number;
  avgLatencyMs: number;
  lastTraceAt: string;
  firstTraceAt: string;
}

/**
 * Element color palette (consciousness-computing theme)
 */
const ELEMENT_COLORS = {
  Fire: "#ff6b6b",     // Red-orange (passion, will, vision)
  Water: "#4ecdc4",    // Turquoise (emotion, intuition, flow)
  Earth: "#95e1d3",    // Green (grounding, structure, abundance)
  Air: "#6dd5ed",      // Sky blue (thought, communication, wisdom)
  Aether: "#c44cff",   // Purple (transpersonal, mystical, creative)
  Unknown: "#95a5a6",  // Gray
};

/**
 * Facet position on 12-point spiral (sequential 1-15)
 * Maps facet codes to their spiral position
 */
const FACET_ORDER: Record<string, number> = {
  F1: 1, F2: 2, F3: 3,
  W1: 4, W2: 5, W3: 6,
  E1: 7, E2: 8, E3: 9,
  A1: 10, A2: 11, A3: 12,
  "Æ1": 13, "Æ2": 14, "Æ3": 15,
};

export default function SpiralMap() {
  const [data, setData] = useState<FacetAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/facets")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((analytics: FacetAnalytics[]) => {
        setData(analytics);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading spiral map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">
          No traces yet. Start a consciousness session to see data.
        </div>
      </div>
    );
  }

  const centerX = 250;
  const centerY = 250;
  const baseRadius = 80;
  const spiralGrowth = 12;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg"
      >
        {/* Background spiral guide (15 points) */}
        <g opacity="0.1" stroke="#666" fill="none" strokeWidth="1">
          {Array.from({ length: 15 }, (_, i) => {
            const seq = i + 1;
            const angle = (seq / 15) * 2 * Math.PI - Math.PI / 2;
            const r = baseRadius + seq * spiralGrowth;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            return (
              <circle key={`guide-${seq}`} cx={x} cy={y} r="3" fill="#999" />
            );
          })}
        </g>

        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="5" fill="#333" opacity="0.5" />
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
        >
          Origin
        </text>

        {/* Facet data points */}
        {data.map((facet) => {
          const seq = FACET_ORDER[facet.facetCode] || 0;
          if (seq === 0) return null; // Skip unknown facets

          const angle = (seq / 15) * 2 * Math.PI - Math.PI / 2;
          const r = baseRadius + seq * spiralGrowth;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);

          // Size based on trace count (log scale for better visualization)
          const minRadius = 6;
          const maxRadius = 25;
          const radius =
            minRadius + Math.log1p(facet.traceCount) * 2.5;
          const finalRadius = Math.min(radius, maxRadius);

          // Color based on element
          const color = ELEMENT_COLORS[facet.element] || ELEMENT_COLORS.Unknown;

          // Opacity based on confidence (higher confidence = more opaque)
          const opacity = 0.4 + facet.avgConfidence * 0.6;

          return (
            <g key={facet.facetCode}>
              {/* Glow effect for high-activity facets */}
              {facet.traceCount > 50 && (
                <circle
                  cx={x}
                  cy={y}
                  r={finalRadius + 8}
                  fill={color}
                  opacity="0.15"
                />
              )}

              {/* Main facet circle */}
              <circle
                cx={x}
                cy={y}
                r={finalRadius}
                fill={color}
                opacity={opacity}
                stroke="#fff"
                strokeWidth="1.5"
                className="hover:stroke-black hover:stroke-2 transition-all cursor-pointer"
              >
                <title>
                  {`${facet.facetCode} • ${facet.element} Phase ${facet.phase}\n` +
                    `Traces: ${facet.traceCount}\n` +
                    `Confidence: ${(facet.avgConfidence * 100).toFixed(1)}%\n` +
                    `Avg Latency: ${facet.avgLatencyMs.toFixed(0)}ms\n` +
                    `Last: ${new Date(facet.lastTraceAt).toLocaleString()}`}
                </title>
              </circle>

              {/* Facet label */}
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#fff"
                className="pointer-events-none"
              >
                {facet.facetCode}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(20, 420)">
          <text fontSize="12" fontWeight="bold" fill="#333" y="0">
            Elements
          </text>
          {Object.entries(ELEMENT_COLORS)
            .filter(([el]) => el !== "Unknown")
            .map(([element, color], i) => (
              <g key={element} transform={`translate(${i * 80}, 15)`}>
                <circle cx="8" cy="0" r="6" fill={color} opacity="0.8" />
                <text x="18" y="4" fontSize="10" fill="#666">
                  {element}
                </text>
              </g>
            ))}
        </g>
      </svg>

      {/* Stats summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {data.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Active Facets</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {data.reduce((sum, f) => sum + f.traceCount, 0)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Total Traces</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {(
              (data.reduce((sum, f) => sum + f.avgConfidence, 0) / data.length) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-gray-600 dark:text-gray-400">Avg Confidence</div>
        </div>
      </div>
    </div>
  );
}
