"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OscillatorState {
  phase: number;
  frequency: number;
  amplitude: number;
  elementalResonance: number;
}

interface CouplingKernel {
  innerRing: { distance: number; strength: number };
  middleRing: { distance: number; strength: number };
  outerRing: { distance: number; strength: number };
  elementType: string;
}

interface ConsciousnessOscillatorProps {
  width: number;
  height: number;
  userInteractions: {[key: number]: {dwellTime: number, interactions: number}};
  currentElement: string;
  resonantElement?: {element: string; color: string} | null;
  isActive: boolean;
}

export function ConsciousnessOscillator({
  width,
  height,
  userInteractions,
  currentElement,
  resonantElement,
  isActive
}: ConsciousnessOscillatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const oscillatorsRef = useRef<OscillatorState[][]>([]);
  const timeRef = useRef(0);

  // Grid dimensions - smaller for performance
  const gridSize = 32;

  // Initialize oscillator grid
  useEffect(() => {
    oscillatorsRef.current = Array(gridSize).fill(null).map((_, x) =>
      Array(gridSize).fill(null).map((_, y) => ({
        phase: Math.random() * Math.PI * 2,
        frequency: 0.02 + Math.random() * 0.01,
        amplitude: 0.5 + Math.random() * 0.3,
        elementalResonance: 0.5
      }))
    );
  }, []);

  // Create elemental coupling kernels
  const createCouplingKernel = (element: string): CouplingKernel => {
    switch (element) {
      case 'fire':
        return {
          innerRing: { distance: 1.2, strength: 0.8 },
          middleRing: { distance: 3.0, strength: -0.3 },
          outerRing: { distance: 6.0, strength: 0.4 },
          elementType: 'fire'
        };
      case 'water':
        return {
          innerRing: { distance: 1.8, strength: 0.6 },
          middleRing: { distance: 4.0, strength: 0.3 },
          outerRing: { distance: 8.0, strength: 0.2 },
          elementType: 'water'
        };
      case 'earth':
        return {
          innerRing: { distance: 1.0, strength: 0.9 },
          middleRing: { distance: 2.5, strength: 0.4 },
          outerRing: { distance: 5.0, strength: 0.1 },
          elementType: 'earth'
        };
      case 'air':
        return {
          innerRing: { distance: 2.0, strength: 0.4 },
          middleRing: { distance: 5.0, strength: -0.2 },
          outerRing: { distance: 10.0, strength: 0.3 },
          elementType: 'air'
        };
      case 'aether':
        return {
          innerRing: { distance: 1.5, strength: 0.7 },
          middleRing: { distance: 4.0, strength: 0.5 },
          outerRing: { distance: 8.0, strength: 0.6 },
          elementType: 'aether'
        };
      default:
        return {
          innerRing: { distance: 1.5, strength: 0.5 },
          middleRing: { distance: 3.0, strength: 0.3 },
          outerRing: { distance: 6.0, strength: 0.2 },
          elementType: 'neutral'
        };
    }
  };

  // Calculate coupling force between oscillators
  const calculateCoupling = (
    x1: number, y1: number,
    x2: number, y2: number,
    phase1: number, phase2: number,
    kernel: CouplingKernel
  ): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let coupling = 0;

    // Apply coupling based on kernel rings
    if (distance <= kernel.innerRing.distance) {
      coupling = kernel.innerRing.strength;
    } else if (distance <= kernel.middleRing.distance) {
      coupling = kernel.middleRing.strength;
    } else if (distance <= kernel.outerRing.distance) {
      coupling = kernel.outerRing.strength;
    }

    // Phase difference influences coupling
    const phaseDiff = Math.sin(phase2 - phase1);
    return coupling * phaseDiff;
  };

  // Update oscillator dynamics
  const updateOscillators = (dt: number) => {
    const kernel = createCouplingKernel(resonantElement?.element || currentElement);
    const grid = oscillatorsRef.current;

    // Calculate total interaction intensity for frequency modulation
    const totalInteractions = Object.values(userInteractions).reduce(
      (sum, data) => sum + data.interactions, 0
    );
    const interactionMultiplier = 1 + (totalInteractions * 0.1);

    // Create new grid with updated states
    const newGrid = grid.map((row, x) =>
      row.map((oscillator, y) => {
        let couplingForce = 0;
        let neighborCount = 0;

        // Calculate coupling from all neighbors within range
        for (let nx = Math.max(0, x - 3); nx < Math.min(gridSize, x + 4); nx++) {
          for (let ny = Math.max(0, y - 3); ny < Math.min(gridSize, y + 4); ny++) {
            if (nx === x && ny === y) continue;

            const neighbor = grid[nx][ny];
            const coupling = calculateCoupling(
              x, y, nx, ny,
              oscillator.phase, neighbor.phase,
              kernel
            );

            couplingForce += coupling;
            neighborCount++;
          }
        }

        // Average coupling force
        if (neighborCount > 0) {
          couplingForce /= neighborCount;
        }

        // Update phase with natural frequency + coupling + interaction influence
        const newPhase = oscillator.phase +
          (oscillator.frequency * interactionMultiplier + couplingForce * 0.1) * dt;

        return {
          ...oscillator,
          phase: newPhase % (Math.PI * 2),
          elementalResonance: Math.min(1, oscillator.elementalResonance + couplingForce * 0.001)
        };
      })
    );

    oscillatorsRef.current = newGrid;
  };

  // Render oscillators to canvas
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Get elemental color scheme
    const getElementalColor = (phase: number, amplitude: number, resonance: number) => {
      const element = resonantElement?.element || currentElement;
      let baseColor: [number, number, number];

      switch (element) {
        case 'fire':
          baseColor = [255, 140, 0]; // Orange
          break;
        case 'water':
          baseColor = [0, 150, 255]; // Blue
          break;
        case 'earth':
          baseColor = [100, 200, 100]; // Green
          break;
        case 'air':
          baseColor = [200, 200, 200]; // Light gray
          break;
        case 'aether':
          baseColor = [255, 215, 0]; // Gold
          break;
        default:
          baseColor = [150, 150, 150]; // Neutral
      }

      const intensity = (Math.sin(phase) + 1) * 0.5 * amplitude * resonance;
      const alpha = 0.3 + intensity * 0.4;

      return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
    };

    // Render oscillator field
    oscillatorsRef.current.forEach((row, x) => {
      row.forEach((oscillator, y) => {
        const centerX = x * cellWidth + cellWidth / 2;
        const centerY = y * cellHeight + cellHeight / 2;

        // Draw oscillator as colored circle
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          2 + oscillator.amplitude * 3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = getElementalColor(
          oscillator.phase,
          oscillator.amplitude,
          oscillator.elementalResonance
        );
        ctx.fill();

        // Add coupling visualization for high-resonance oscillators
        if (oscillator.elementalResonance > 0.8) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
          ctx.strokeStyle = getElementalColor(oscillator.phase, 0.3, 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
  };

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      const currentTime = Date.now();
      const dt = currentTime - timeRef.current;
      timeRef.current = currentTime;

      updateOscillators(Math.min(dt * 0.001, 0.016)); // Cap at 60fps
      render();

      animationRef.current = requestAnimationFrame(animate);
    };

    timeRef.current = Date.now();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, currentElement, resonantElement, userInteractions, width, height]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 mix-blend-multiply"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Consciousness field overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/5 to-transparent" />
    </motion.div>
  );
}