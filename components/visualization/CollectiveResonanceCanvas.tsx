// @ts-nocheck
/**
 * Collective Resonance Canvas
 * Community-wide visualization showing anonymized spiritual harmony patterns
 *
 * Displays global Soullab community resonance as dynamic sacred geometry
 * where individual souls contribute light nodes to a collective mandala
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Collective resonance data structures
interface CommunityNode {
  id: string;
  position: THREE.Vector3;
  elementalSignature: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  virtueCoherence: number;
  spiritualPhase: 'initiation' | 'grounding' | 'collaboration' | 'transformation' | 'completion';
  lastActive: Date;
  anonymizedRegion: string;
}

interface CollectivePatterns {
  globalHarmony: number;
  dominantElement: keyof CommunityNode['elementalSignature'];
  phaseDistribution: Record<CommunityNode['spiritualPhase'], number>;
  virtueField: {
    compassion: number;
    wisdom: number;
    courage: number;
    temperance: number;
    justice: number;
  };
  resonanceWaves: Array<{
    origin: THREE.Vector3;
    amplitude: number;
    frequency: number;
    element: string;
    timestamp: Date;
  }>;
}

interface CollectiveVisualizationData {
  activeNodes: CommunityNode[];
  patterns: CollectivePatterns;
  fieldsCoherence: number;
  temporalRhythm: {
    currentPhase: number; // 0-1 through daily cycle
    seasonalInfluence: number;
    lunarInfluence: number;
  };
}

// Sacred geometry for community nodes
const SoulNode: React.FC<{
  node: CommunityNode;
  globalHarmony: number;
  onClick?: () => void;
}> = ({ node, globalHarmony, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Calculate dominant element for coloring
  const dominantElement = Object.entries(node.elementalSignature)
    .reduce((a, b) => node.elementalSignature[a[0] as keyof typeof node.elementalSignature] >
                      node.elementalSignature[b[0] as keyof typeof node.elementalSignature] ? a : b)[0];

  const elementColors = {
    fire: '#FF6B35',
    water: '#4A90E2',
    earth: '#8B4513',
    air: '#87CEEB',
    aether: '#9370DB'
  };

  const nodeColor = elementColors[dominantElement as keyof typeof elementColors];

  // Calculate size based on virtue coherence and activity
  const baseSize = 0.1 + (node.virtueCoherence * 0.3);
  const activityMultiplier = Math.max(0.5, 1 - (Date.now() - node.lastActive.getTime()) / (1000 * 60 * 60 * 24)); // Fade over 24h

  useFrame((state) => {
    if (meshRef.current && lightRef.current) {
      const time = state.clock.elapsedTime;

      // Gentle pulsing based on virtue coherence
      const pulse = 1 + Math.sin(time * 2 + node.virtueCoherence * 10) * 0.2 * node.virtueCoherence;
      meshRef.current.scale.setScalar(pulse * activityMultiplier);

      // Light intensity varies with global harmony
      lightRef.current.intensity = node.virtueCoherence * globalHarmony * 2;

      // Phase-based rotation
      const phaseSpeed = {
        initiation: 0.05,
        grounding: 0.02,
        collaboration: 0.03,
        transformation: 0.08,
        completion: 0.01
      };

      meshRef.current.rotation.y += phaseSpeed[node.spiritualPhase];
    }
  });

  return (
    <group position={node.position}>
      <mesh ref={meshRef} onClick={onClick} scale={baseSize}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.7 + node.virtueCoherence * 0.3}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={nodeColor}
        intensity={node.virtueCoherence * globalHarmony * 2}
        distance={5}
      />

      {/* Connection lines to nearby nodes with similar elemental signatures */}
      {/* Rendered by parent component to avoid duplication */}
    </group>
  );
};

// Sacred geometric field showing virtue resonance
const VirtueField: React.FC<{
  virtueField: CollectivePatterns['virtueField'];
  radius: number;
}> = ({ virtueField, radius }) => {
  const fieldRef = useRef<THREE.Group>(null);

  // Create pentagonal virtue arrangement
  const virtuePositions = {
    compassion: new THREE.Vector3(0, radius * 0.8, 0), // Top
    wisdom: new THREE.Vector3(radius * 0.6, radius * 0.2, 0), // Upper right
    justice: new THREE.Vector3(radius * 0.4, -radius * 0.6, 0), // Lower right
    temperance: new THREE.Vector3(-radius * 0.4, -radius * 0.6, 0), // Lower left
    courage: new THREE.Vector3(-radius * 0.6, radius * 0.2, 0) // Upper left
  };

  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.z += 0.001; // Very slow rotation
    }
  });

  return (
    <group ref={fieldRef}>
      {/* Virtue nodes */}
      {Object.entries(virtueField).map(([virtue, strength], index) => (
        <group key={virtue} position={virtuePositions[virtue as keyof typeof virtuePositions]}>
          <mesh scale={0.5 + strength * 0.5}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial
              color={`hsl(${index * 72}, 70%, ${40 + strength * 30}%)`}
              transparent
              opacity={0.6 + strength * 0.4}
            />
          </mesh>

          {/* Virtue label */}
          <Html distanceFactor={10}>
            <div className="text-white text-xs font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
              {virtue}: {Math.round(strength * 100)}%
            </div>
          </Html>
        </group>
      ))}

      {/* Pentagon connecting lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={10}
            array={new Float32Array([
              // Pentagon outline
              ...virtuePositions.compassion.toArray(),
              ...virtuePositions.wisdom.toArray(),
              ...virtuePositions.wisdom.toArray(),
              ...virtuePositions.justice.toArray(),
              ...virtuePositions.justice.toArray(),
              ...virtuePositions.temperance.toArray(),
              ...virtuePositions.temperance.toArray(),
              ...virtuePositions.courage.toArray(),
              ...virtuePositions.courage.toArray(),
              ...virtuePositions.compassion.toArray(),
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
};

// Resonance waves emanating from community interactions
const ResonanceWaves: React.FC<{
  waves: CollectivePatterns['resonanceWaves'];
}> = ({ waves }) => {
  const waveRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const currentTime = Date.now();

    waveRefs.current.forEach((waveGroup, index) => {
      if (waveGroup && waves[index]) {
        const wave = waves[index];
        const age = (currentTime - wave.timestamp.getTime()) / 1000; // Age in seconds
        const maxAge = 30; // Waves last 30 seconds

        if (age < maxAge) {
          const progress = age / maxAge;
          const scale = progress * wave.amplitude * 10;
          const opacity = (1 - progress) * 0.8;

          waveGroup.scale.setScalar(scale);

          // Update material opacity
          waveGroup.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = opacity;
            }
          });
        } else {
          // Hide expired waves
          waveGroup.visible = false;
        }
      }
    });
  });

  return (
    <>
      {waves.map((wave, index) => (
        <group
          key={`${wave.timestamp.getTime()}-${index}`}
          ref={(el) => { if (el) waveRefs.current[index] = el; }}
          position={wave.origin}
        >
          <mesh>
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshBasicMaterial
              color={wave.element === 'fire' ? '#FF6B35' :
                    wave.element === 'water' ? '#4A90E2' :
                    wave.element === 'earth' ? '#8B4513' :
                    wave.element === 'air' ? '#87CEEB' : '#9370DB'}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  );
};

// Connection lines between resonant souls
const SoulConnections: React.FC<{
  nodes: CommunityNode[];
  maxConnections?: number;
}> = ({ nodes, maxConnections = 50 }) => {
  const connections = useCallback(() => {
    const lines: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      strength: number;
      element: string;
    }> = [];

    // Find connections between nodes with similar elemental signatures
    for (let i = 0; i < nodes.length && lines.length < maxConnections; i++) {
      for (let j = i + 1; j < nodes.length && lines.length < maxConnections; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        // Calculate elemental similarity
        const similarity = Object.keys(nodeA.elementalSignature).reduce((sum, element) => {
          const key = element as keyof typeof nodeA.elementalSignature;
          return sum + Math.min(nodeA.elementalSignature[key], nodeB.elementalSignature[key]);
        }, 0) / 5;

        // Only connect nodes with high similarity and distance constraints
        const distance = nodeA.position.distanceTo(nodeB.position);
        if (similarity > 0.6 && distance < 8 && distance > 1) {
          const dominantElementA = Object.entries(nodeA.elementalSignature)
            .reduce((a, b) => nodeA.elementalSignature[a[0] as keyof typeof nodeA.elementalSignature] >
                              nodeA.elementalSignature[b[0] as keyof typeof nodeA.elementalSignature] ? a : b)[0];

          lines.push({
            start: nodeA.position,
            end: nodeB.position,
            strength: similarity,
            element: dominantElementA
          });
        }
      }
    }

    return lines;
  }, [nodes, maxConnections]);

  const connectionLines = connections();

  if (connectionLines.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={connectionLines.length * 2}
          array={new Float32Array(
            connectionLines.flatMap(line => [
              ...line.start.toArray(),
              ...line.end.toArray()
            ])
          )}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={connectionLines.length * 2}
          array={new Float32Array(
            connectionLines.flatMap(line => {
              const color = new THREE.Color(
                line.element === 'fire' ? '#FF6B35' :
                line.element === 'water' ? '#4A90E2' :
                line.element === 'earth' ? '#8B4513' :
                line.element === 'air' ? '#87CEEB' : '#9370DB'
              );
              return [...color.toArray(), ...color.toArray()];
            })
          )}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.4} />
    </lineSegments>
  );
};

// Main Collective Resonance Canvas component
export const CollectiveResonanceCanvas: React.FC<{
  data: CollectiveVisualizationData;
  className?: string;
  onNodeClick?: (node: CommunityNode) => void;
}> = ({ data, className, onNodeClick }) => {
  const [selectedNode, setSelectedNode] = useState<CommunityNode | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [showVirtueField, setShowVirtueField] = useState(true);

  const handleNodeClick = useCallback((node: CommunityNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  return (
    <div className={`collective-resonance-canvas relative w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        style={{
          background: 'radial-gradient(circle, #000022 0%, #000000 100%)'
        }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />

        {/* Community soul nodes */}
        {data.activeNodes.map((node) => (
          <SoulNode
            key={node.id}
            node={node}
            globalHarmony={data.patterns.globalHarmony}
            onClick={() => handleNodeClick(node)}
          />
        ))}

        {/* Soul connections */}
        {showConnections && (
          <SoulConnections nodes={data.activeNodes} />
        )}

        {/* Virtue field pentagon */}
        {showVirtueField && (
          <VirtueField
            virtueField={data.patterns.virtueField}
            radius={8}
          />
        )}

        {/* Resonance waves */}
        <ResonanceWaves waves={data.patterns.resonanceWaves} />

        {/* Central harmony sphere */}
        <mesh scale={data.patterns.globalHarmony * 2}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={data.patterns.globalHarmony * 0.3}
          />
        </mesh>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={30}
          minDistance={5}
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white space-y-2 font-mono text-sm bg-black bg-opacity-70 p-4 rounded max-w-xs">
        <div className="text-purple-300 font-semibold">Collective Resonance Field</div>
        <div>Active Souls: <span className="text-cyan-300">{data.activeNodes.length}</span></div>
        <div>Global Harmony: <span className="text-yellow-300">{Math.round(data.patterns.globalHarmony * 100)}%</span></div>
        <div>Field Coherence: <span className="text-green-300">{Math.round(data.fieldsCoherence * 100)}%</span></div>
        <div>Dominant Element: <span className={`text-${
          data.patterns.dominantElement === 'fire' ? 'orange' :
          data.patterns.dominantElement === 'water' ? 'blue' :
          data.patterns.dominantElement === 'earth' ? 'green' :
          data.patterns.dominantElement === 'air' ? 'sky' : 'purple'
        }-300`}>
          {data.patterns.dominantElement}
        </span></div>

        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-purple-200 text-xs mb-2">Phase Distribution</div>
          {Object.entries(data.patterns.phaseDistribution).map(([phase, count]) => (
            <div key={phase} className="text-xs">
              {phase}: <span className="text-cyan-200">{count}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-purple-200 text-xs mb-2">Temporal Rhythm</div>
          <div className="text-xs">Daily Phase: <span className="text-yellow-200">{Math.round(data.temporalRhythm.currentPhase * 100)}%</span></div>
          <div className="text-xs">Seasonal: <span className="text-green-200">{Math.round(data.temporalRhythm.seasonalInfluence * 100)}%</span></div>
          <div className="text-xs">Lunar: <span className="text-blue-200">{Math.round(data.temporalRhythm.lunarInfluence * 100)}%</span></div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          onClick={() => setShowConnections(!showConnections)}
          className={`px-3 py-2 rounded text-sm ${
            showConnections ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
          } text-white`}
        >
          {showConnections ? 'Hide' : 'Show'} Connections
        </button>
        <button
          onClick={() => setShowVirtueField(!showVirtueField)}
          className={`px-3 py-2 rounded text-sm ${
            showVirtueField ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 hover:bg-gray-500'
          } text-white`}
        >
          {showVirtueField ? 'Hide' : 'Show'} Virtue Field
        </button>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded max-w-xs">
          <div className="text-cyan-300 font-semibold mb-2">Soul Node Details</div>
          <div className="text-sm space-y-1">
            <div>Region: <span className="text-gray-300">{selectedNode.anonymizedRegion}</span></div>
            <div>Phase: <span className="text-yellow-300">{selectedNode.spiritualPhase}</span></div>
            <div>Coherence: <span className="text-green-300">{Math.round(selectedNode.virtueCoherence * 100)}%</span></div>
            <div className="mt-2">
              <div className="text-purple-200 text-xs">Elemental Signature:</div>
              {Object.entries(selectedNode.elementalSignature).map(([element, value]) => (
                <div key={element} className="text-xs">
                  {element}: <span className="text-cyan-200">{Math.round(value * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Hook for fetching collective resonance data
export const useCollectiveResonanceData = (): CollectiveVisualizationData => {
  const [data, setData] = useState<CollectiveVisualizationData>({
    activeNodes: [],
    patterns: {
      globalHarmony: 0.7,
      dominantElement: 'water',
      phaseDistribution: {
        initiation: 5,
        grounding: 12,
        collaboration: 18,
        transformation: 8,
        completion: 3
      },
      virtueField: {
        compassion: 0.75,
        wisdom: 0.68,
        courage: 0.62,
        temperance: 0.71,
        justice: 0.65
      },
      resonanceWaves: []
    },
    fieldsCoherence: 0.73,
    temporalRhythm: {
      currentPhase: 0.6,
      seasonalInfluence: 0.4,
      lunarInfluence: 0.3
    }
  });

  useEffect(() => {
    const generateMockNodes = (): CommunityNode[] => {
      const nodes: CommunityNode[] = [];
      const nodeCount = 25 + Math.floor(Math.random() * 25);

      for (let i = 0; i < nodeCount; i++) {
        // Generate positions in a rough spherical distribution
        const radius = 3 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const position = new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );

        // Generate elemental signature with some randomness
        const elements = ['fire', 'water', 'earth', 'air', 'aether'];
        const dominantIndex = Math.floor(Math.random() * elements.length);

        const elementalSignature = {
          fire: dominantIndex === 0 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4,
          water: dominantIndex === 1 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4,
          earth: dominantIndex === 2 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4,
          air: dominantIndex === 3 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4,
          aether: dominantIndex === 4 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.4,
        };

        const phases: CommunityNode['spiritualPhase'][] = ['initiation', 'grounding', 'collaboration', 'transformation', 'completion'];

        nodes.push({
          id: `soul_${i}`,
          position,
          elementalSignature,
          virtueCoherence: Math.random() * 0.4 + 0.6,
          spiritualPhase: phases[Math.floor(Math.random() * phases.length)],
          lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
          anonymizedRegion: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'][Math.floor(Math.random() * 6)]
        });
      }

      return nodes;
    };

    const generateResonanceWaves = (): CollectiveVisualizationData['patterns']['resonanceWaves'] => {
      const waves = [];
      const waveCount = Math.floor(Math.random() * 5) + 2;

      for (let i = 0; i < waveCount; i++) {
        waves.push({
          origin: new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          ),
          amplitude: Math.random() * 0.5 + 0.3,
          frequency: Math.random() * 2 + 0.5,
          element: ['fire', 'water', 'earth', 'air', 'aether'][Math.floor(Math.random() * 5)],
          timestamp: new Date(Date.now() - Math.random() * 30000) // Last 30 seconds
        });
      }

      return waves;
    };

    const updateData = () => {
      setData(prevData => ({
        ...prevData,
        activeNodes: generateMockNodes(),
        patterns: {
          ...prevData.patterns,
          resonanceWaves: generateResonanceWaves(),
          globalHarmony: 0.6 + Math.random() * 0.3,
        },
        fieldsCoherence: 0.6 + Math.random() * 0.3,
        temporalRhythm: {
          currentPhase: (Date.now() / (24 * 60 * 60 * 1000)) % 1, // Daily cycle
          seasonalInfluence: Math.random() * 0.2 + 0.3,
          lunarInfluence: Math.random() * 0.2 + 0.2,
        }
      }));
    };

    // Initial load
    updateData();

    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

export type {
  CommunityNode,
  CollectivePatterns,
  CollectiveVisualizationData
};