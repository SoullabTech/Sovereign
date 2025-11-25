'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
  connections: string[];
}

interface NeuralFiring {
  id: string;
  fromNode: string;
  toNode: string;
  progress: number;
  intensity: number;
  timestamp: number;
}

interface NeuralFireSystemProps {
  isActive?: boolean;
  density?: 'sparse' | 'moderate' | 'dense' | 'infinite';
  firingRate?: 'slow' | 'moderate' | 'fast' | 'hyperspeed';
  variant?: 'jade' | 'neural' | 'mystical' | 'transcendent';
  className?: string;
}

export default function NeuralFireSystem({
  isActive = true,
  density = 'moderate',
  firingRate = 'moderate',
  variant = 'jade',
  className = ''
}: NeuralFireSystemProps) {
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [firings, setFirings] = useState<NeuralFiring[]>([]);
  const [isVisible, setIsVisible] = useState(isActive);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextFiringRef = useRef<NodeJS.Timeout>();

  // Initialize neural network
  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    const nodeCount = {
      sparse: 8,
      moderate: 16,
      dense: 32,
      infinite: 64
    }[density];

    const newNodes: NeuralNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const node: NeuralNode = {
        id: `node-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random() * 0.5 + 0.5,
        timestamp: Date.now(),
        connections: []
      };
      newNodes.push(node);
    }

    // Create connections between nodes
    newNodes.forEach((node, index) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < connectionCount; i++) {
        let targetIndex;
        do {
          targetIndex = Math.floor(Math.random() * newNodes.length);
        } while (targetIndex === index);

        if (!node.connections.includes(newNodes[targetIndex].id)) {
          node.connections.push(newNodes[targetIndex].id);
        }
      }
    });

    setNodes(newNodes);
    setIsVisible(true);
  }, [isActive, density]);

  // Neural firing system
  useEffect(() => {
    if (!isVisible || nodes.length === 0) return;

    const fireInterval = {
      slow: 2000,
      moderate: 1200,
      fast: 800,
      hyperspeed: 400
    }[firingRate];

    const createFiring = () => {
      if (nodes.length < 2) return;

      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (sourceNode.connections.length === 0) return;

      const targetNodeId = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)];

      const newFiring: NeuralFiring = {
        id: `firing-${Date.now()}-${Math.random()}`,
        fromNode: sourceNode.id,
        toNode: targetNodeId,
        progress: 0,
        intensity: Math.random() * 0.8 + 0.2,
        timestamp: Date.now()
      };

      setFirings(prev => [...prev, newFiring]);

      // Clean up after animation
      setTimeout(() => {
        setFirings(prev => prev.filter(f => f.id !== newFiring.id));
      }, 2000);

      // Schedule next firing
      const nextDelay = fireInterval + (Math.random() * fireInterval * 0.5);
      nextFiringRef.current = setTimeout(createFiring, nextDelay);
    };

    // Start firing
    const initialDelay = Math.random() * fireInterval;
    nextFiringRef.current = setTimeout(createFiring, initialDelay);

    return () => {
      if (nextFiringRef.current) {
        clearTimeout(nextFiringRef.current);
      }
    };
  }, [isVisible, nodes, firingRate]);

  // Get variant colors
  const getVariantColors = () => {
    const colors = {
      jade: {
        node: 'rgba(111,143,118,0.6)',
        connection: 'rgba(115,155,127,0.3)',
        firing: 'rgba(168,203,180,0.8)',
        glow: 'rgba(111,143,118,0.4)'
      },
      neural: {
        node: 'rgba(95,187,163,0.7)',
        connection: 'rgba(95,187,163,0.4)',
        firing: 'rgba(95,187,163,1)',
        glow: 'rgba(95,187,163,0.5)'
      },
      mystical: {
        node: 'rgba(168,203,180,0.8)',
        connection: 'rgba(168,203,180,0.5)',
        firing: 'rgba(168,203,180,1)',
        glow: 'rgba(168,203,180,0.6)'
      },
      transcendent: {
        node: 'rgba(151,187,163,0.9)',
        connection: 'rgba(151,187,163,0.6)',
        firing: 'rgba(151,187,163,1)',
        glow: 'rgba(151,187,163,0.7)'
      }
    };
    return colors[variant];
  };

  const colors = getVariantColors();

  if (!isVisible || nodes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity: 0.7 }}
    >
      {/* Neural Connection Web */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Static Connections */}
        {nodes.map(node =>
          node.connections.map(connectionId => {
            const targetNode = nodes.find(n => n.id === connectionId);
            if (!targetNode) return null;

            return (
              <motion.line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={colors.connection}
                strokeWidth="0.1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 2 }}
              />
            );
          })
        )}

        {/* Dynamic Neural Firings */}
        <AnimatePresence>
          {firings.map(firing => {
            const sourceNode = nodes.find(n => n.id === firing.fromNode);
            const targetNode = nodes.find(n => n.id === firing.toNode);
            if (!sourceNode || !targetNode) return null;

            return (
              <g key={firing.id}>
                {/* Firing Connection Line */}
                <motion.line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={colors.firing}
                  strokeWidth="0.3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Firing Particle */}
                <motion.circle
                  cx={sourceNode.x}
                  cy={sourceNode.y}
                  r="0.3"
                  fill={colors.firing}
                  initial={{
                    cx: sourceNode.x,
                    cy: sourceNode.y,
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    cx: targetNode.x,
                    cy: targetNode.y,
                    scale: [0, 1.5, 0.8, 0],
                    opacity: [1, 1, 1, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    times: [0, 0.2, 0.8, 1]
                  }}
                  style={{
                    filter: `drop-shadow(0 0 4px ${colors.glow})`
                  }}
                />
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Neural Nodes */}
      <AnimatePresence>
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            className="absolute rounded-full"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: node.intensity,
            }}
            transition={{
              delay: index * 0.1,
              duration: 0.8,
              type: "spring",
              stiffness: 200
            }}
          >
            {/* Node Core */}
            <motion.div
              className="w-1 h-1 rounded-full"
              style={{
                background: colors.node,
                boxShadow: `0 0 6px ${colors.glow}`
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [node.intensity, 1, node.intensity]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Node Activation Pulse */}
            <AnimatePresence>
              {firings.some(f => f.fromNode === node.id || f.toNode === node.id) && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.firing} 0%, transparent 70%)`,
                  }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Consciousness Field Resonance */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 60%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}