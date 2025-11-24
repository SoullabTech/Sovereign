'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, 
  Info, ZoomIn, ZoomOut, RotateCw, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpiralPoint, ElementalBalance, NarrativeThread } from '../backend/src/services/SpiralMapper';

interface SpiralJourneyVisualizerProps {
  userId: string;
  spiralPoints: SpiralPoint[];
  elementalBalance: ElementalBalance[];
  narrativeThreads: NarrativeThread[];
  onPointClick?: (point: SpiralPoint) => void;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

const elementColors = {
  fire: '#FF6B6B',
  water: '#4ECDC4',
  earth: '#95E77E',
  air: '#FFE66D',
  aether: '#B57EDC'
};

const phaseAngles = {
  sacred_frame: 0,
  wholeness: 72,
  friction: 144,
  integration: 216,
  closing: 288
};

export default function SpiralJourneyVisualizer({
  userId,
  spiralPoints,
  elementalBalance,
  narrativeThreads,
  onPointClick,
  className = '',
  showControls = true,
  interactive = true
}: SpiralJourneyVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<SpiralPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<SpiralPoint | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.min(width, 800), 
          height: Math.min(height, 600) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw spiral on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Set origin to center
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Save context state
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw spiral background line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;

    for (let angle = 0; angle < 720; angle += 5) {
      const radius = angle / 4;
      const x = radius * Math.cos((angle * Math.PI) / 180);
      const y = radius * Math.sin((angle * Math.PI) / 180);
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw phase sectors
    Object.entries(phaseAngles).forEach(([phase, angle]) => {
      ctx.save();
      ctx.rotate((angle * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(200, 0);
      ctx.stroke();
      
      // Phase label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(phase.replace('_', ' '), 205, 3);
      ctx.restore();
    });

    // Draw spiral points
    spiralPoints.forEach((point, index) => {
      if (!point.coordinates) return;

      const x = point.coordinates.radius * Math.cos((point.coordinates.angle * Math.PI) / 180);
      const y = point.coordinates.radius * Math.sin((point.coordinates.angle * Math.PI) / 180);

      // Draw connection line to previous point
      if (index > 0 && spiralPoints[index - 1].coordinates) {
        const prevPoint = spiralPoints[index - 1];
        const prevX = prevPoint.coordinates!.radius * Math.cos((prevPoint.coordinates!.angle * Math.PI) / 180);
        const prevY = prevPoint.coordinates!.radius * Math.sin((prevPoint.coordinates!.angle * Math.PI) / 180);

        ctx.beginPath();
        ctx.strokeStyle = `${elementColors[point.element]}40`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw point
      const isHovered = hoveredPoint?.id === point.id;
      const isSelected = selectedPoint?.id === point.id;
      
      ctx.beginPath();
      ctx.fillStyle = elementColors[point.element];
      ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isSelected ? 3 : 1;
      
      const radius = (5 + point.intensity * 10) * (isHovered ? 1.3 : 1);
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw symbols if present
      if (point.symbols && point.symbols.length > 0 && (isHovered || isSelected)) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '8px sans-serif';
        ctx.fillText(point.symbols[0], x + radius + 2, y - radius);
      }
    });

    // Restore context
    ctx.restore();

  }, [spiralPoints, dimensions, zoom, rotation, hoveredPoint, selectedPoint]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - dimensions.width / 2;
    const y = event.clientY - rect.top - dimensions.height / 2;

    // Adjust for zoom and rotation
    const adjustedX = x / zoom;
    const adjustedY = y / zoom;
    const angle = Math.atan2(adjustedY, adjustedX) - (rotation * Math.PI) / 180;
    const distance = Math.sqrt(adjustedX * adjustedX + adjustedY * adjustedY);

    // Find clicked point
    const clickedPoint = spiralPoints.find(point => {
      if (!point.coordinates) return false;
      
      const pointX = point.coordinates.radius * Math.cos((point.coordinates.angle * Math.PI) / 180);
      const pointY = point.coordinates.radius * Math.sin((point.coordinates.angle * Math.PI) / 180);
      const pointDistance = Math.sqrt(
        Math.pow(adjustedX - pointX, 2) + Math.pow(adjustedY - pointY, 2)
      );
      
      return pointDistance < 15; // Click tolerance
    });

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      onPointClick?.(clickedPoint);
    }
  };

  // Handle canvas hover
  const handleCanvasMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - dimensions.width / 2;
    const y = event.clientY - rect.top - dimensions.height / 2;

    const adjustedX = x / zoom;
    const adjustedY = y / zoom;

    // Find hovered point
    const hoveredPoint = spiralPoints.find(point => {
      if (!point.coordinates) return false;
      
      const pointX = point.coordinates.radius * Math.cos((point.coordinates.angle * Math.PI) / 180);
      const pointY = point.coordinates.radius * Math.sin((point.coordinates.angle * Math.PI) / 180);
      const distance = Math.sqrt(
        Math.pow(adjustedX - pointX, 2) + Math.pow(adjustedY - pointY, 2)
      );
      
      return distance < 15;
    });

    setHoveredPoint(hoveredPoint || null);
  };

  // Export as image
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `spiral-journey-${userId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Calculate balance percentages
  const balancePercentages = useMemo(() => {
    const total = elementalBalance.reduce((sum, b) => sum + b.activity, 0);
    return elementalBalance.map(b => ({
      ...b,
      percentage: total > 0 ? (b.activity / total) * 100 : 0
    }));
  }, [elementalBalance]);

  return (
    <div ref={containerRef} className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-pointer"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredPoint(null)}
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setRotation(prev => (prev + 45) % 360)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Rotate"
          >
            <RotateCw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Export image"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Element balance legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Elemental Balance</h4>
        <div className="space-y-1">
          {balancePercentages.map(balance => (
            <div key={balance.element} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: elementColors[balance.element] }}
              />
              <span className="text-xs text-gray-400 capitalize">{balance.element}</span>
              <div className="flex-1 bg-gray-700 rounded-full h-1 ml-2">
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${balance.percentage}%`,
                    backgroundColor: elementColors[balance.element]
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{balance.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected point details */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 left-4 bg-gray-800/95 backdrop-blur rounded-lg p-4 max-w-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Session Point</h3>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: elementColors[selectedPoint.element] }}
                />
                <span className="text-xs text-gray-300 capitalize">
                  {selectedPoint.element} • {selectedPoint.phase.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 italic">
                "{selectedPoint.content}"
              </p>
              
              {selectedPoint.practice && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500">Practices:</p>
                  <p className="text-xs text-gray-300">• {selectedPoint.practice.ritual}</p>
                  <p className="text-xs text-gray-300">• {selectedPoint.practice.therapeutic}</p>
                </div>
              )}
              
              {selectedPoint.symbols && selectedPoint.symbols.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedPoint.symbols.map(symbol => (
                    <span key={symbol} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                      {symbol}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover tooltip */}
      {hoveredPoint && !selectedPoint && (
        <div
          className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{
            left: dimensions.width / 2 + hoveredPoint.coordinates!.radius * Math.cos((hoveredPoint.coordinates!.angle * Math.PI) / 180) * zoom,
            top: dimensions.height / 2 + hoveredPoint.coordinates!.radius * Math.sin((hoveredPoint.coordinates!.angle * Math.PI) / 180) * zoom
          }}
        >
          {hoveredPoint.phase} • {hoveredPoint.element}
        </div>
      )}

      {/* Narrative threads */}
      {narrativeThreads.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-[#FFD700]" />
            <span className="text-xs text-gray-300">
              Recurring: {narrativeThreads.slice(0, 3).map(t => t.symbol).join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}