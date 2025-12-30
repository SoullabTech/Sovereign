"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupHoloflowerVisualization = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const HoloflowerVisualization_1 = require("./HoloflowerVisualization");
const framer_motion_1 = require("framer-motion");
const GroupHoloflowerVisualization = ({
  groupId,
  participantIds,
  showIndividuals = true,
  showResonance = true,
}) => {
  const [groupPattern, setGroupPattern] = (0, react_1.useState)(null);
  const [selectedParticipant, setSelectedParticipant] = (0, react_1.useState)(
    null,
  );
  const [resonanceView, setResonanceView] = (0, react_1.useState)(&quot;circle&quot;);
  (0, react_1.useEffect)(() => {
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
    return (0, jsx_runtime_1.jsx)("div", {
      className: "participant-grid",
      children: participantIds.map((userId, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const isSelected = selectedParticipant === userId;
        return (0, jsx_runtime_1.jsxs)(
          framer_motion_1.motion.div,
          {
            className: "participant-cell",
            style: {
              position: "absolute",
              left: col * (cellSize + 20),
              top: row * (cellSize + 20),
              width: cellSize,
              height: cellSize,
            },
            initial: { scale: 0, opacity: 0 },
            animate: {
              scale: isSelected ? 1.1 : 0.3,
              opacity: isSelected ? 1 : 0.6,
            },
            whileHover: { scale: 0.35 },
            onClick: () => setSelectedParticipant(userId),
            children: [
              (0, jsx_runtime_1.jsx)(
                HoloflowerVisualization_1.HoloflowerVisualization,
                {
                  userId: userId,
                  realTimeUpdates: true,
                  onStateChange: () => {},
                },
              ),
              (0, jsx_runtime_1.jsxs)("div", {
                className: "participant-label",
                children: ["Participant ", index + 1],
              }),
            ],
          },
          userId,
        );
      }),
    });
  };
  const renderCircularArrangement = () => {
    const radius = 300;
    const centerX = 400;
    const centerY = 400;
    return (0, jsx_runtime_1.jsxs)("svg", {
      width: 800,
      height: 800,
      className: "circular-arrangement",
      children: [
        (0, jsx_runtime_1.jsx)("defs", {
          children: (0, jsx_runtime_1.jsxs)("radialGradient", {
            id: "resonanceGradient",
            children: [
              (0, jsx_runtime_1.jsx)("stop", {
                offset: "0%",
                stopColor: "#FFD700",
                stopOpacity: 0.3,
              }),
              (0, jsx_runtime_1.jsx)("stop", {
                offset: "100%",
                stopColor: "#FF6347",
                stopOpacity: 0.1,
              }),
            ],
          }),
        }),
        showResonance &&
          groupPattern &&
          (0, jsx_runtime_1.jsx)(framer_motion_1.motion.circle, {
            cx: centerX,
            cy: centerY,
            r: radius * 1.2,
            fill: "url(#resonanceGradient)",
            initial: { r: 0 },
            animate: { r: radius * 1.2 },
            transition: { duration: 1 },
          }),
        participantIds.map((userId, index) => {
          const angle = (index * 2 * Math.PI) / participantIds.length;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return (0, jsx_runtime_1.jsxs)(
            "g",
            {
              transform: `translate(${x}, ${y})`,
              children: [
                (0, jsx_runtime_1.jsx)("foreignObject", {
                  x: -60,
                  y: -60,
                  width: 120,
                  height: 120,
                  style: { overflow: "visible" },
                  children: (0, jsx_runtime_1.jsx)("div", {
                    style: { transform: "scale(0.15)" },
                    children: (0, jsx_runtime_1.jsx)(
                      HoloflowerVisualization_1.HoloflowerVisualization,
                      {
                        userId: userId,
                        realTimeUpdates: true,
                        onStateChange: () => {},
                      },
                    ),
                  }),
                }),
                showResonance &&
                  index < participantIds.length - 1 &&
                  (0, jsx_runtime_1.jsx)(framer_motion_1.motion.line, {
                    x1: 0,
                    y1: 0,
                    x2:
                      Math.cos(angle + (2 * Math.PI) / participantIds.length) *
                      radius,
                    y2:
                      Math.sin(angle + (2 * Math.PI) / participantIds.length) *
                      radius,
                    stroke: "#FFD700",
                    strokeWidth: 2,
                    strokeOpacity: 0.3,
                    initial: { pathLength: 0 },
                    animate: { pathLength: 1 },
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }),
              ],
            },
            userId,
          );
        }),
        (0, jsx_runtime_1.jsx)("g", {
          transform: `translate(${centerX}, ${centerY})`,
          children: (0, jsx_runtime_1.jsx)("foreignObject", {
            x: -100,
            y: -100,
            width: 200,
            height: 200,
            children: (0, jsx_runtime_1.jsxs)("div", {
              className: "collective-center",
              children: [
                (0, jsx_runtime_1.jsx)("h3", { children: "Collective Field" }),
                groupPattern &&
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "field-metrics",
                    children: [
                      (0, jsx_runtime_1.jsxs)("div", {
                        children: [
                          "Integration: ",
                          Math.round(
                            groupPattern.collectiveState.centerIntegration *
                              100,
                          ),
                          "%",
                        ],
                      }),
                      (0, jsx_runtime_1.jsxs)("div", {
                        children: [
                          "Balance: ",
                          Math.round(
                            groupPattern.collectiveState.overallBalance * 100,
                          ),
                          "%",
                        ],
                      }),
                    ],
                  }),
              ],
            }),
          }),
        }),
      ],
    });
  };
  const renderSpiralArrangement = () => {
    const centerX = 400;
    const centerY = 400;
    const spiralTurns = 2;
    return (0, jsx_runtime_1.jsxs)(&quot;svg", {
      width: 800,
      height: 800,
      className: "spiral-arrangement",
      children: [
        participantIds.map((userId, index) => {
          const t = index / participantIds.length;
          const angle = t * spiralTurns * 2 * Math.PI;
          const radius = 50 + t * 250;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const scale = 0.1 + t * 0.15;
          return (0, jsx_runtime_1.jsx)(
            framer_motion_1.motion.g,
            {
              transform: `translate(${x}, ${y})`,
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: index * 0.1 },
              children: (0, jsx_runtime_1.jsx)("foreignObject", {
                x: -60 * scale,
                y: -60 * scale,
                width: 120 * scale,
                height: 120 * scale,
                style: { overflow: "visible" },
                children: (0, jsx_runtime_1.jsx)("div", {
                  style: { transform: `scale(${scale * 0.15})` },
                  children: (0, jsx_runtime_1.jsx)(
                    HoloflowerVisualization_1.HoloflowerVisualization,
                    {
                      userId: userId,
                      realTimeUpdates: true,
                      onStateChange: () => {},
                    },
                  ),
                }),
              }),
            },
            userId,
          );
        }),
        (0, jsx_runtime_1.jsx)(framer_motion_1.motion.path, {
          d: generateSpiralPath(
            centerX,
            centerY,
            spiralTurns,
            participantIds.length,
          ),
          fill: "none",
          stroke: "#FFD700",
          strokeWidth: 2,
          strokeOpacity: 0.3,
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 3 },
        }),
      ],
    });
  };
  const generateSpiralPath = (cx, cy, turns, points) => {
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
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "resonance-metrics",
      children: [
        (0, jsx_runtime_1.jsx)("h3", { children: "Collective Resonance" }),
        (0, jsx_runtime_1.jsx)("div", {
          className: "metrics-grid",
          children: Array.from(groupPattern.resonancePatterns.entries()).map(
            ([key, value]) =>
              (0, jsx_runtime_1.jsxs)(
                "div",
                {
                  className: "metric",
                  children: [
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "metric-label",
                      children: key,
                    }),
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "metric-bar",
                      children: (0, jsx_runtime_1.jsx)(
                        framer_motion_1.motion.div,
                        {
                          className: "metric-fill",
                          initial: { width: 0 },
                          animate: { width: `${value * 100}%` },
                          transition: { duration: 1 },
                          style: { backgroundColor: getColorForMetric(key) },
                        },
                      ),
                    }),
                    (0, jsx_runtime_1.jsxs)("div", {
                      className: "metric-value",
                      children: [Math.round(value * 100), "%"],
                    }),
                  ],
                },
                key,
              ),
          ),
        }),
        groupPattern.emergentQualities.length > 0 &&
          (0, jsx_runtime_1.jsxs)("div", {
            className: "emergent-qualities",
            children: [
              (0, jsx_runtime_1.jsx)("h4", { children: "Emergent Qualities" }),
              (0, jsx_runtime_1.jsx)("div", {
                className: "qualities-list",
                children: groupPattern.emergentQualities.map((quality, index) =>
                  (0, jsx_runtime_1.jsx)(
                    framer_motion_1.motion.div,
                    {
                      className: "quality-badge",
                      initial: { scale: 0 },
                      animate: { scale: 1 },
                      transition: { delay: index * 0.1 },
                      children: quality,
                    },
                    quality,
                  ),
                ),
              }),
            ],
          }),
      ],
    });
  };
  const getColorForMetric = (metric) => {
    const colors = {
      harmony: "#87CEEB",
      synergy: "#FFD700",
      coherence: "#FF6B6B",
    };
    return colors[metric] || "#FFFFFF";
  };
  return (0, jsx_runtime_1.jsxs)("div", {
    className: "group-holoflower-container",
    children: [
      (0, jsx_runtime_1.jsxs)("div", {
        className: "view-controls",
        children: [
          (0, jsx_runtime_1.jsx)("button", {
            className: resonanceView === "grid" ? "active" : "",
            onClick: () => setResonanceView("grid"),
            children: "Grid View",
          }),
          (0, jsx_runtime_1.jsx)("button", {
            className: resonanceView === "circle" ? "active" : "",
            onClick: () => setResonanceView("circle"),
            children: "Circle View",
          }),
          (0, jsx_runtime_1.jsx)("button", {
            className: resonanceView === "spiral" ? "active" : "",
            onClick: () => setResonanceView("spiral"),
            children: "Spiral View",
          }),
        ],
      }),
      (0, jsx_runtime_1.jsxs)("div", {
        className: "visualization-area",
        children: [
          resonanceView === "grid" && renderParticipantGrid(),
          resonanceView === "circle" && renderCircularArrangement(),
          resonanceView === "spiral" && renderSpiralArrangement(),
        ],
      }),
      renderResonanceMetrics(),
      (0, jsx_runtime_1.jsx)("style", {
        jsx: true,
        children: `
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
          border: 1px solid #FFD700;
          color: #FFD700;
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
          color: #FFD700;
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
          border: 2px solid #FFD700;
          text-align: center;
        }

        .collective-center h3 {
          margin: 0 0 10px 0;
          color: #FFD700;
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
          border: 1px solid #FFD700;
        }

        .resonance-metrics h3 {
          margin: 0 0 20px 0;
          color: #FFD700;
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
          color: #FFD700;
        }

        .qualities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .quality-badge {
          padding: 5px 15px;
          background: #3a3a4e;
          border: 1px solid #FFD700;
          border-radius: 20px;
          font-size: 14px;
          color: #FFD700;
        }
      `,
      }),
    ],
  });
};
exports.GroupHoloflowerVisualization = GroupHoloflowerVisualization;
