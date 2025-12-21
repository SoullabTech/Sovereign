"use client";

/**
 * LIVE SPIRAL MAP WITH BIOSIGNAL OVERLAY
 * Phase 4.4-C: Neuropod Bridge — Real-Time Visualization
 *
 * Purpose:
 * - Extends SpiralMap component with live biosignal data
 * - WebSocket client connects to biomarker ingestion service
 * - Animated glow/pulse effects for active biomarker signals
 * - Real-time correlation insights displayed as tooltips
 *
 * Features:
 * - Live HRV/EEG/GSR/Breath overlays on facet circles
 * - Color-coded signal strength indicators
 * - Animated transitions when biomarker spikes detected
 * - Connection status indicator
 * - Configurable update rate and signal filters
 */

import React, { useEffect, useState, useRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

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

interface BiomarkerPacket {
  source: string;
  signal_type: string;
  value: number;
  units?: string;
  channel?: string;
  quality?: number;
  timestamp?: string;
}

interface LiveBiomarker {
  signalType: string;
  value: number;
  units: string;
  quality: number;
  timestamp: Date;
  delta: number; // % change from previous value
}

// ============================================================================
// ELEMENT COLORS (same as SpiralMap)
// ============================================================================

const ELEMENT_COLORS = {
  Fire: "#ff6b6b",
  Water: "#4ecdc4",
  Earth: "#95e1d3",
  Air: "#6dd5ed",
  Aether: "#c44cff",
  Unknown: "#95a5a6",
};

// ============================================================================
// FACET ORDERING (same as SpiralMap)
// ============================================================================

const FACET_ORDER: Record<string, number> = {
  F1: 1, F2: 2, F3: 3,
  W1: 4, W2: 5, W3: 6,
  E1: 7, E2: 8, E3: 9,
  A1: 10, A2: 11, A3: 12,
  "Æ1": 13, "Æ2": 14, "Æ3": 15,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SpiralMapLive() {
  const [data, setData] = useState<FacetAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [biomarkers, setBiomarkers] = useState<Map<string, LiveBiomarker>>(new Map());
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ============================================================================
  // FACET ANALYTICS (static data from API)
  // ============================================================================

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

  // ============================================================================
  // WEBSOCKET CONNECTION (live biosignal data)
  // ============================================================================

  useEffect(() => {
    // Connect to biomarker ingestion service (port 8765)
    const ws = new WebSocket("ws://localhost:8765");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[SpiralMapLive] WebSocket connected");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const packet = JSON.parse(event.data) as BiomarkerPacket;

        // Ignore server status messages
        if ("status" in packet) return;

        // Update biomarker state
        setBiomarkers((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(packet.signal_type);
          const delta = existing
            ? ((packet.value - existing.value) / existing.value) * 100
            : 0;

          newMap.set(packet.signal_type, {
            signalType: packet.signal_type,
            value: packet.value,
            units: packet.units || "",
            quality: packet.quality || 1.0,
            timestamp: new Date(),
            delta,
          });

          return newMap;
        });
      } catch (err) {
        console.error("[SpiralMapLive] Parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("[SpiralMapLive] WebSocket disconnected");
      setWsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("[SpiralMapLive] WebSocket error:", error);
      setWsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading live spiral map...</div>
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

  // ============================================================================
  // BIOSIGNAL HELPERS
  // ============================================================================

  const getSignalIntensity = (signalType: string): number => {
    const bio = biomarkers.get(signalType);
    if (!bio) return 0;
    return Math.abs(bio.delta) / 100; // Normalize to 0-1
  };

  const getSignalColor = (signalType: string): string => {
    const bio = biomarkers.get(signalType);
    if (!bio) return "#999";

    // Color by signal type
    const colors: Record<string, string> = {
      EEG: "#9b59b6",     // Purple
      HRV: "#e74c3c",     // Red
      GSR: "#f39c12",     // Orange
      Breath: "#3498db",  // Blue
    };

    return colors[signalType] || "#999";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Connection status indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              wsConnected ? "bg-green-500" : "bg-red-500"
            } animate-pulse`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {wsConnected ? "Live biosignal feed active" : "Biosignal feed disconnected"}
          </span>
        </div>

        {/* Active signals count */}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {biomarkers.size} active signals
        </span>
      </div>

      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg"
      >
        {/* Background spiral guide */}
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

        {/* Facet data points with live biosignal overlays */}
        {data.map((facet) => {
          const seq = FACET_ORDER[facet.facetCode] || 0;
          if (seq === 0) return null;

          const angle = (seq / 15) * 2 * Math.PI - Math.PI / 2;
          const r = baseRadius + seq * spiralGrowth;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);

          const minRadius = 6;
          const maxRadius = 25;
          const radius = minRadius + Math.log1p(facet.traceCount) * 2.5;
          const finalRadius = Math.min(radius, maxRadius);

          const color = ELEMENT_COLORS[facet.element] || ELEMENT_COLORS.Unknown;
          const opacity = 0.4 + facet.avgConfidence * 0.6;

          // Live biosignal overlay (HRV intensity for Water facets as example)
          const hrvIntensity = facet.element === "Water" ? getSignalIntensity("HRV") : 0;
          const eegIntensity = facet.element === "Fire" ? getSignalIntensity("EEG") : 0;

          const hasLiveSignal = hrvIntensity > 0.1 || eegIntensity > 0.1;

          return (
            <g key={facet.facetCode}>
              {/* Glow effect for high activity */}
              {facet.traceCount > 50 && (
                <circle
                  cx={x}
                  cy={y}
                  r={finalRadius + 8}
                  fill={color}
                  opacity="0.15"
                />
              )}

              {/* Live biosignal pulse overlay */}
              {hasLiveSignal && (
                <circle
                  cx={x}
                  cy={y}
                  r={finalRadius + 12}
                  fill={hrvIntensity > 0 ? getSignalColor("HRV") : getSignalColor("EEG")}
                  opacity={Math.max(hrvIntensity, eegIntensity) * 0.4}
                  className="animate-pulse"
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
                    `Last: ${new Date(facet.lastTraceAt).toLocaleString()}\n\n` +
                    `Live Signals:\n` +
                    (biomarkers.size > 0
                      ? Array.from(biomarkers.values())
                          .map(
                            (b) =>
                              `${b.signalType}: ${b.value.toFixed(2)} ${b.units} (${
                                b.delta > 0 ? "+" : ""
                              }${b.delta.toFixed(1)}%)`
                          )
                          .join("\n")
                      : "No live data")}
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

      {/* Stats summary with live biosignals */}
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

      {/* Live biosignal readings */}
      {biomarkers.size > 0 && (
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Live Biosignals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(biomarkers.values()).map((bio) => (
              <div
                key={bio.signalType}
                className="bg-white dark:bg-gray-700 rounded p-3"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {bio.signalType}
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {bio.value.toFixed(2)}
                  <span className="text-sm font-normal ml-1">{bio.units}</span>
                </div>
                <div
                  className={`text-xs mt-1 ${
                    bio.delta > 0
                      ? "text-green-600"
                      : bio.delta < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {bio.delta > 0 ? "↑" : bio.delta < 0 ? "↓" : "="}{" "}
                  {Math.abs(bio.delta).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
