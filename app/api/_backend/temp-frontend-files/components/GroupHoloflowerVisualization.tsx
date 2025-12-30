import React, { useEffect, useState } from "react";
import { HoloflowerVisualization } from "./HoloflowerVisualization";
import { motion } from "framer-motion";
import * as d3 from "d3";

interface GroupHoloflowerVisualizationProps {
  groupId: string;
  participantIds: string[];
  showIndividuals?: boolean;
  showResonance?: boolean;
}

interface GroupPattern {
  groupId: string;
  participants: string[];
  collectiveState: any;
  resonancePatterns: Map<string, number>;
  emergentQualities: string[];
}

export const GroupHoloflowerVisualization: React.FC<
  GroupHoloflowerVisualizationProps
> = ({
  groupId,
  participantIds,
  showIndividuals = true,
  showResonance = true,
}) => {
  const [groupPattern, setGroupPattern] = useState<GroupPattern | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null,
  );
  const [resonanceView, setResonanceView] = useState<
    "grid" | "circle" | "spiral"
  >("circle");

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5002`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "request-group-pattern",
          groupId,
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "group-pattern" && data.pattern.groupId === groupId) {
        setGroupPattern(data.pattern);
      }
    };

    return () => ws.close();
  }, [groupId]);

  const renderParticipantGrid = () => {
    const gridSize = Math.ceil(Math.sqrt(participantIds.length));
    const cellSize = 200;

    return (
      <div className="participant-grid">
        {participantIds.map((userId, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const isSelected = selectedParticipant === userId;

          return (
            <motion.div
              key={userId}
              className="participant-cell"
              style={{
                position: "absolute",
                left: col * (cellSize + 20),
                top: row * (cellSize + 20),
                width: cellSize,
                height: cellSize,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isSelected ? 1.1 : 0.3,
                opacity: isSelected ? 1 : 0.6,
              }}
              whileHover={{ scale: 0.35 }}
              onClick={() => setSelectedParticipant(userId)}
            >
              <HoloflowerVisualization
                userId={userId}
                realTimeUpdates={true}
                onStateChange={() => {}}
              />
              <div className="participant-label">Participant {index + 1}</div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderCircularArrangement = () => {
    const radius = 300;
    const centerX = 400;
    const centerY = 400;

    return (
      <svg width={800} height={800} className="circular-arrangement">
        <defs>
          <radialGradient id="resonanceGradient">
            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#FF6347" stopOpacity={0.1} />
          </radialGradient>
        </defs>

        {showResonance && groupPattern && (
          <motion.circle
            cx={centerX}
            cy={centerY}
            r={radius * 1.2}
            fill="url(#resonanceGradient)"
            initial={{ r: 0 }}
            animate={{ r: radius * 1.2 }}
            transition={{ duration: 1 }}
          />
        )}

        {participantIds.map((userId, index) => {
          const angle = (index * 2 * Math.PI) / participantIds.length;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          return (
            <g key={userId} transform={`translate(${x}, ${y})`}>
              <foreignObject
                x={-60}
                y={-60}
                width={120}
                height={120}
                style={{ overflow: "visible" }}
              >
                <div style={{ transform: "scale(0.15)" }}>
                  <HoloflowerVisualization
                    userId={userId}
                    realTimeUpdates={true}
                    onStateChange={() => {}}
                  />
                </div>
              </foreignObject>

              {showResonance && index < participantIds.length - 1 && (
                <motion.line
                  x1={0}
                  y1={0}
                  x2={
                    Math.cos(angle + (2 * Math.PI) / participantIds.length) *
                    radius
                  }
                  y2={
                    Math.sin(angle + (2 * Math.PI) / participantIds.length) *
                    radius
                  }
                  stroke="#FFD700"
                  strokeWidth={2}
                  strokeOpacity={0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              )}
            </g>
          );
        })}

        <g transform={`translate(${centerX}, ${centerY})`}>
          <foreignObject x={-100} y={-100} width={200} height={200}>
            <div className="collective-center">
              <h3>Collective Field</h3>
              {groupPattern && (
                <div className="field-metrics">
                  <div>
                    Integration:{" "}
                    {Math.round(
                      groupPattern.collectiveState.centerIntegration * 100,
                    )}
                    %
                  </div>
                  <div>
                    Balance:{" "}
                    {Math.round(
                      groupPattern.collectiveState.overallBalance * 100,
                    )}
                    %
                  </div>
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      </svg>
    );
  };

  const renderSpiralArrangement = () => {
    const centerX = 400;
    const centerY = 400;
    const spiralTurns = 2;

    return (
      <svg width={800} height={800} className="spiral-arrangement">
        {participantIds.map((userId, index) => {
          const t = index / participantIds.length;
          const angle = t * spiralTurns * 2 * Math.PI;
          const radius = 50 + t * 250;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const scale = 0.1 + t * 0.15;

          return (
            <motion.g
              key={userId}
              transform={`translate(${x}, ${y})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <foreignObject
                x={-60 * scale}
                y={-60 * scale}
                width={120 * scale}
                height={120 * scale}
                style={{ overflow: "visible" }}
              >
                <div style={{ transform: `scale(${scale * 0.15})` }}>
                  <HoloflowerVisualization
                    userId={userId}
                    realTimeUpdates={true}
                    onStateChange={() => {}}
                  />
                </div>
              </foreignObject>
            </motion.g>
          );
        })}

        <motion.path
          d={generateSpiralPath(
            centerX,
            centerY,
            spiralTurns,
            participantIds.length,
          )}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2}
          strokeOpacity={0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3 }}
        />
      </svg>
    );
  };

  const generateSpiralPath = (
    cx: number,
    cy: number,
    turns: number,
    points: number,
  ): string => {
    const path = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const angle = t * turns * 2 * Math.PI;
      const radius = 50 + t * 250;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        path.push(`M ${x} ${y}`);
      } else {
        path.push(`L ${x} ${y}`);
      }
    }
    return path.join(" ");
  };

  const renderResonanceMetrics = () => {
    if (!groupPattern) return null;

    return (
      <div className="resonance-metrics">
        <h3>Collective Resonance</h3>
        <div className="metrics-grid">
          {Array.from(groupPattern.resonancePatterns.entries()).map(
            ([key, value]) => (
              <div key={key} className="metric">
                <div className="metric-label">{key}</div>
                <div className="metric-bar">
                  <motion.div
                    className="metric-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 1 }}
                    style={{ backgroundColor: getColorForMetric(key) }}
                  />
                </div>
                <div className="metric-value">{Math.round(value * 100)}%</div>
              </div>
            ),
          )}
        </div>

        {groupPattern.emergentQualities.length > 0 && (
          <div className="emergent-qualities">
            <h4>Emergent Qualities</h4>
            <div className="qualities-list">
              {groupPattern.emergentQualities.map((quality, index) => (
                <motion.div
                  key={quality}
                  className="quality-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {quality}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getColorForMetric = (metric: string): string => {
    const colors: Record<string, string> = {
      harmony: "#87CEEB",
      synergy: "#FFD700",
      coherence: "#FF6B6B",
    };
    return colors[metric] || "#FFFFFF";
  };

  return (
    <div className="group-holoflower-container">
      <div className="view-controls">
        <button
          className={resonanceView === "grid" ? "active" : ""}
          onClick={() => setResonanceView("grid")}
        >
          Grid View
        </button>
        <button
          className={resonanceView === "circle" ? "active" : ""}
          onClick={() => setResonanceView("circle")}
        >
          Circle View
        </button>
        <button
          className={resonanceView === "spiral" ? "active" : ""}
          onClick={() => setResonanceView("spiral")}
        >
          Spiral View
        </button>
      </div>

      <div className="visualization-area">
        {resonanceView === "grid" && renderParticipantGrid()}
        {resonanceView === "circle" && renderCircularArrangement()}
        {resonanceView === "spiral" && renderSpiralArrangement()}
      </div>

      {renderResonanceMetrics()}

      <style jsx>{`
        .group-holoflower-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #0a0a0f;
          color: white;
          min-height: 100vh;
        }

        .view-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .view-controls button {
          padding: 10px 20px;
          background: #2a2a3e;
          border: 1px solid #ffd700;
          color: #ffd700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-controls button.active,
        .view-controls button:hover {
          background: #3a3a4e;
          transform: translateY(-2px);
        }

        .visualization-area {
          position: relative;
          width: 800px;
          height: 800px;
          margin-bottom: 40px;
        }

        .participant-grid {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .participant-cell {
          cursor: pointer;
          transition: all 0.3s;
        }

        .participant-label {
          text-align: center;
          margin-top: 5px;
          font-size: 12px;
          color: #ffd700;
        }

        .collective-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 200px;
          height: 200px;
          background: rgba(42, 42, 62, 0.9);
          border-radius: 50%;
          border: 2px solid #ffd700;
          text-align: center;
        }

        .collective-center h3 {
          margin: 0 0 10px 0;
          color: #ffd700;
          font-size: 16px;
        }

        .field-metrics {
          font-size: 14px;
          line-height: 1.5;
        }

        .resonance-metrics {
          width: 100%;
          max-width: 600px;
          background: rgba(42, 42, 62, 0.9);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ffd700;
        }

        .resonance-metrics h3 {
          margin: 0 0 20px 0;
          color: #ffd700;
          text-align: center;
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-label {
          width: 100px;
          text-transform: capitalize;
        }

        .metric-bar {
          flex: 1;
          height: 20px;
          background: #1a1a2e;
          border-radius: 10px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          border-radius: 10px;
        }

        .metric-value {
          width: 50px;
          text-align: right;
        }

        .emergent-qualities h4 {
          margin: 0 0 10px 0;
          color: #ffd700;
        }

        .qualities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .quality-badge {
          padding: 5px 15px;
          background: #3a3a4e;
          border: 1px solid #ffd700;
          border-radius: 20px;
          font-size: 14px;
          color: #ffd700;
        }
      `}</style>
    </div>
  );
};
