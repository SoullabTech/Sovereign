import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  SacredHoloflower,
  HoloflowerHouse,
  HoloflowerState,
} from "../core/SacredHoloflower";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

interface HoloflowerVisualizationProps {
  userId?: string;
  groupId?: string;
  onHouseClick?: (house: HoloflowerHouse) => void;
  onStateChange?: (state: HoloflowerState) => void;
  realTimeUpdates?: boolean;
  showGroupPattern?: boolean;
}

export const HoloflowerVisualization: React.FC<
  HoloflowerVisualizationProps
> = ({
  userId,
  groupId,
  onHouseClick,
  onStateChange,
  realTimeUpdates = true,
  showGroupPattern = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [holoflower] = useState(() => new SacredHoloflower());
  const [state, setState] = useState(holoflower.getState());
  const [selectedHouse, setSelectedHouse] = useState<HoloflowerHouse | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<HoloflowerHouse | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<HoloflowerHouse | null>(
    null,
  );
  const [showShadows, setShowShadows] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;

  useEffect(() => {
    if (realTimeUpdates && userId) {
      const ws = new WebSocket(`ws://localhost:5001/holoflower/${userId}`);

      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        if (update.type === "state-update") {
          handleExternalStateUpdate(update.state);
        }
      };

      return () => ws.close();
    }
  }, [userId, realTimeUpdates]);

  const handleExternalStateUpdate = useCallback(
    (newState: Partial<HoloflowerState>) => {
      Object.entries(newState).forEach(([key, value]) => {
        if (key === "houses" && Array.isArray(value)) {
          value.forEach((houseUpdate: any) => {
            holoflower.updateHouseIntensity(
              houseUpdate.id,
              houseUpdate.intensity,
            );
          });
        }
      });

      const updatedState = holoflower.getState();
      setState(updatedState);
      onStateChange?.(updatedState);
    },
    [holoflower, onStateChange],
  );

  const renderHouse = (house: HoloflowerHouse) => {
    const x = centerX + Math.cos(house.angle) * house.radius;
    const y = centerY + Math.sin(house.angle) * house.radius;
    const size = house.intensity * 40 + 20;

    const isSelected = selectedHouse?.id === house.id;
    const isHovered = hoveredHouse?.id === house.id;

    return (
      <motion.g
        key={house.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.5 * animationSpeed,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {showShadows && house.shadowAspect && (
          <motion.circle
            cx={x}
            cy={y}
            r={size * 1.5}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={2}
            strokeDasharray="5,5"
            opacity={0.3}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 / animationSpeed,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        <motion.polygon
          points={getPolygonPoints(x, y, size, getShapeForPhase(house.phase))}
          fill={house.color}
          fillOpacity={house.intensity}
          stroke={isSelected ? "#FFD700" : isHovered ? "#FFFFFF" : house.color}
          strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHoveredHouse(house)}
          onMouseLeave={() => setHoveredHouse(null)}
          onClick={() => handleHouseClick(house)}
          onMouseDown={() => startDrag(house)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />

        <text
          x={x}
          y={y}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          style={{ pointerEvents: "none" }}
        >
          {house.jungianMapping}
        </text>

        {house.transformationVector && (
          <motion.line
            x1={x}
            y1={y}
            x2={x + house.transformationVector.x * 10}
            y2={y + house.transformationVector.y * 10}
            stroke="#FFD700"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 * animationSpeed }}
          />
        )}
      </motion.g>
    );
  };

  const getShapeForPhase = (phase: string): number => {
    switch (phase) {
      case "cardinal":
        return 4; // Square
      case "fixed":
        return 6; // Hexagon
      case "mutable":
        return 3; // Triangle
      default:
        return 5;
    }
  };

  const getPolygonPoints = (
    cx: number,
    cy: number,
    radius: number,
    sides: number,
  ): string => {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const handleHouseClick = (house: HoloflowerHouse) => {
    setSelectedHouse(house);
    onHouseClick?.(house);
  };

  const startDrag = (house: HoloflowerHouse) => {
    setIsDragging(true);
    setDragTarget(house);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragTarget || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const intensity = Math.min(1, Math.max(0, (distance - 50) / 150));

      holoflower.updateHouseIntensity(dragTarget.id, intensity);
      setState(holoflower.getState());
    },
    [isDragging, dragTarget, holoflower, centerX, centerY],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
    onStateChange?.(holoflower.getState());
  };

  const renderAetherCenter = () => {
    const pulseScale = 0.8 + state.centerIntegration * 0.4;

    return (
      <motion.g>
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={50}
          fill="url(#aetherGradient)"
          fillOpacity={0.3}
          animate={{
            scale: [pulseScale, pulseScale + 0.1, pulseScale],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3 / animationSpeed,
            repeat: Infinity,
          }}
        />

        <motion.path
          d={createSacredGeometryPath(centerX, centerY, 40)}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2}
          opacity={state.centerIntegration}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60 / animationSpeed,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#FFD700"
          fontSize="16"
          fontWeight="bold"
        >
          Aether
        </text>

        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          fill="#FFD700"
          fontSize="12"
        >
          {Math.round(state.centerIntegration * 100)}%
        </text>
      </motion.g>
    );
  };

  const createSacredGeometryPath = (
    cx: number,
    cy: number,
    radius: number,
  ): string => {
    const points = 12;
    const path = [];

    for (let i = 0; i < points; i++) {
      const angle1 = (i * 2 * Math.PI) / points;
      const angle2 = ((i + 4) * 2 * Math.PI) / points;

      const x1 = cx + radius * Math.cos(angle1);
      const y1 = cy + radius * Math.sin(angle1);
      const x2 = cx + radius * Math.cos(angle2);
      const y2 = cy + radius * Math.sin(angle2);

      if (i === 0) {
        path.push(`M ${x1} ${y1}`);
      }
      path.push(`L ${x2} ${y2}`);
    }

    return path.join(" ") + " Z";
  };

  const renderConnections = () => {
    return state.activeTransformations.map((transformation, index) => {
      const [fromId, toId] = transformation.split("->");
      const fromHouse = state.houses.find((h) => h.id === fromId);
      const toHouse = state.houses.find((h) => h.id === toId);

      if (!fromHouse || !toHouse) return null;

      const x1 = centerX + Math.cos(fromHouse.angle) * fromHouse.radius;
      const y1 = centerY + Math.sin(fromHouse.angle) * fromHouse.radius;
      const x2 = centerX + Math.cos(toHouse.angle) * toHouse.radius;
      const y2 = centerY + Math.sin(toHouse.angle) * toHouse.radius;

      return (
        <motion.line
          key={transformation}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#FFD700"
          strokeWidth={2}
          strokeDasharray="5,5"
          opacity={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2 * animationSpeed,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      );
    });
  };

  return (
    <div className="holoflower-container">
      <div className="controls">
        <button onClick={() => setShowShadows(!showShadows)}>
          {showShadows ? "Hide" : "Show"} Shadows
        </button>
        <button onClick={() => holoflower.integrateAether()}>
          Integrate Aether
        </button>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
        />
        <span>Speed: {animationSpeed}x</span>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          background:
            "radial-gradient(circle at center, #1a1a2e 0%, #0f0f1e 100%)",
          borderRadius: "50%",
        }}
      >
        <defs>
          <radialGradient id="aetherGradient">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6347" />
          </radialGradient>

          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#FFD700" />
          </marker>
        </defs>

        {renderConnections()}
        {renderAetherCenter()}
        {state.houses.map(renderHouse)}
      </svg>

      {selectedHouse && (
        <div className="house-details">
          <h3>
            {selectedHouse.element} - {selectedHouse.phase}
          </h3>
          <p>Function: {selectedHouse.jungianMapping}</p>
          <p>Intensity: {Math.round(selectedHouse.intensity * 100)}%</p>
          {selectedHouse.shadowAspect && (
            <p>Shadow: {selectedHouse.shadowAspect}</p>
          )}
        </div>
      )}

      <style jsx>{`
        .holoflower-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #0a0a0f;
          color: white;
        }

        .controls {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          align-items: center;
        }

        .controls button {
          padding: 8px 16px;
          background: #2a2a3e;
          border: 1px solid #ffd700;
          color: #ffd700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .controls button:hover {
          background: #3a3a4e;
          transform: translateY(-2px);
        }

        .house-details {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(42, 42, 62, 0.9);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ffd700;
          min-width: 200px;
        }

        .house-details h3 {
          margin: 0 0 10px 0;
          color: #ffd700;
          text-transform: capitalize;
        }

        .house-details p {
          margin: 5px 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
