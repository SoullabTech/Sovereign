// @ts-nocheck
/**
 * Sacred Visualization Layer (SVL)
 * Dynamic Spiralogic UI Engine for Consciousness Computing
 *
 * Translates real-time Field Learning Algorithm data into interactive sacred geometry
 * where consciousness unfolds as archetypal visuals, elemental colors, and spiral motion
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Text, OrbitControls, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

// Sacred geometry and visualization types
interface ElementalState {
  fire: number;    // 0-1: Inspiration, transformation
  water: number;   // 0-1: Compassion, flow
  earth: number;   // 0-1: Grounding, embodiment
  air: number;     // 0-1: Wisdom, clarity
  aether: number;  // 0-1: Union, transcendence
}

interface SpiralPhase {
  current: 'initiation' | 'grounding' | 'collaboration' | 'transformation' | 'completion';
  completion: number; // 0-1
  transition: boolean;
}

interface CollectiveResonance {
  globalHarmony: number;
  activeUsers: number;
  dominantElement: keyof ElementalState;
  coherenceLevel: number;
}

interface VisualizationData {
  elemental: ElementalState;
  spiral: SpiralPhase;
  collective: CollectiveResonance;
  emotionalTone: string;
  biometrics?: {
    heartRateVariability: number;
    breathCoherence: number;
  };
}

// Sacred color palettes for each element
const ELEMENTAL_COLORS = {
  fire: {
    primary: '#FF6B35',    // Amber-gold flame
    secondary: '#FFD700',  // Bright gold
    tertiary: '#FF4500'    // Deep orange
  },
  water: {
    primary: '#4A90E2',    // Ocean blue
    secondary: '#40E0D0',  // Turquoise flow
    tertiary: '#1E3A8A'    // Deep indigo
  },
  earth: {
    primary: '#8B4513',    // Rich brown
    secondary: '#228B22',  // Forest green
    tertiary: '#556B2F'    // Olive earth
  },
  air: {
    primary: '#87CEEB',    // Sky blue
    secondary: '#C0C0C0',  // Silver clarity
    tertiary: '#ADD8E6'    // Light blue
  },
  aether: {
    primary: '#9370DB',    // Violet transcendence
    secondary: '#FFFFFF',  // Pure white
    tertiary: '#E6E6FA'    // Lavender
  }
};

// Spiral phase geometries and motion patterns
const SPIRAL_CONFIGS = {
  initiation: {
    geometry: 'spark',
    motion: 'burst',
    scale: 0.3,
    speed: 2.0
  },
  grounding: {
    geometry: 'root_spiral',
    motion: 'expanding_fractal',
    scale: 0.7,
    speed: 0.5
  },
  collaboration: {
    geometry: 'harmonic_wave',
    motion: 'synchronized_rotation',
    scale: 1.0,
    speed: 1.0
  },
  transformation: {
    geometry: 'dynamic_tornado',
    motion: 'morphing_spiral',
    scale: 1.2,
    speed: 1.5
  },
  completion: {
    geometry: 'radiant_sphere',
    motion: 'still_pulsation',
    scale: 0.8,
    speed: 0.2
  }
};

// Elemental Geometry Component - renders individual element visualizations
const ElementalGeometry: React.FC<{
  element: keyof ElementalState;
  intensity: number;
  position: [number, number, number];
}> = ({ element, intensity, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const colors = ELEMENTAL_COLORS[element];

  const { scale, rotationSpeed } = useSpring({
    scale: 0.5 + (intensity * 1.5),
    rotationSpeed: intensity * 0.02,
    config: { tension: 300, friction: 30 }
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed.get() * delta;
      meshRef.current.rotation.y += rotationSpeed.get() * delta * 0.7;
    }

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const getElementGeometry = () => {
    switch (element) {
      case 'fire':
        return <coneGeometry args={[0.5, 1.2, 6]} />;
      case 'water':
        return <sphereGeometry args={[0.6, 16, 16]} />;
      case 'earth':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'air':
        return <octahedronGeometry args={[0.7]} />;
      case 'aether':
        return <icosahedronGeometry args={[0.8]} />;
      default:
        return <sphereGeometry args={[0.5]} />;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <animated.mesh ref={meshRef} scale={scale}>
        {getElementGeometry()}
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.secondary}
          emissiveIntensity={intensity * 0.3}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7 + (intensity * 0.3)}
        />
      </animated.mesh>

      {/* Particle effects for high intensity */}
      {intensity > 0.7 && (
        <pointLight
          color={colors.primary}
          intensity={intensity}
          distance={5}
          position={[0, 0, 0]}
        />
      )}
    </group>
  );
};

// Spiral Phase Renderer - core sacred spiral geometry
const SpiralPhaseRenderer: React.FC<{
  phase: SpiralPhase;
  elementalState: ElementalState;
  biometrics?: VisualizationData['biometrics'];
}> = ({ phase, elementalState, biometrics }) => {
  const spiralRef = useRef<THREE.Group>(null);
  const config = SPIRAL_CONFIGS[phase.current];

  // Calculate dominant element for primary coloring
  const dominantElement = Object.entries(elementalState)
    .reduce((a, b) => elementalState[a[0] as keyof ElementalState] > elementalState[b[0] as keyof ElementalState] ? a : b)[0] as keyof ElementalState;

  const colors = ELEMENTAL_COLORS[dominantElement];

  // Animate based on heart rate variability if available
  const breathSync = biometrics?.breathCoherence || 0.5;
  const heartSync = biometrics?.heartRateVariability || 0.5;

  const { spiralScale, glowIntensity } = useSpring({
    spiralScale: config.scale * (0.8 + breathSync * 0.4),
    glowIntensity: heartSync,
    config: { tension: 200, friction: 50 }
  });

  useFrame((state, delta) => {
    if (spiralRef.current) {
      const time = state.clock.elapsedTime;

      // Synchronized rotation based on phase
      spiralRef.current.rotation.z += config.speed * delta * 0.1;

      // Breathing synchronization
      const breathScale = 1 + Math.sin(time * 2 * Math.PI * breathSync) * 0.1;
      spiralRef.current.scale.setScalar(breathScale);

      // Phase-specific animations
      switch (phase.current) {
        case 'initiation':
          spiralRef.current.scale.setScalar(
            1 + Math.sin(time * 10) * 0.3 // Rapid pulsing
          );
          break;
        case 'transformation':
          spiralRef.current.rotation.y += delta * 2; // Rapid spinning
          break;
        case 'completion':
          // Gentle, slow pulsation
          spiralRef.current.scale.setScalar(
            1 + Math.sin(time * 0.5) * 0.1
          );
          break;
      }
    }
  });

  return (
    <animated.group ref={spiralRef} scale={spiralScale}>
      {/* Main spiral geometry */}
      <mesh>
        <torusKnotGeometry
          args={[2, 0.3, 150, 20, 2, 3]}
        />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.secondary}
          emissiveIntensity={glowIntensity.to(g => g * 0.4)}
          metalness={0.8}
          roughness={0.2}
          wireframe={phase.current === 'transformation'}
        />
      </mesh>

      {/* Phase completion indicator */}
      <mesh position={[0, 0, 0]} scale={phase.completion}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={colors.tertiary} transparent opacity={0.8} />
      </mesh>

      {/* Central light source */}
      <pointLight
        color={colors.primary}
        intensity={2}
        distance={10}
      />
    </animated.group>
  );
};

// Collective Resonance Visualization - shows community harmony
const CollectiveResonanceField: React.FC<{
  collective: CollectiveResonance;
}> = ({ collective }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.min(collective.activeUsers * 10, 1000);

  // Create particle positions based on collective harmony
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const dominantColor = new THREE.Color(ELEMENTAL_COLORS[collective.dominantElement].primary);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Spherical distribution with harmony affecting clustering
    const radius = 8 + (Math.random() - 0.5) * 4 * (1 - collective.coherenceLevel);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Color variation based on harmony
    const colorVariation = (Math.random() - 0.5) * (1 - collective.coherenceLevel) * 0.3;
    colors[i3] = Math.max(0, dominantColor.r + colorVariation);
    colors[i3 + 1] = Math.max(0, dominantColor.g + colorVariation);
    colors[i3 + 2] = Math.max(0, dominantColor.b + colorVariation);
  }

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1 * collective.coherenceLevel;

      // Gentle pulsing based on global harmony
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1 * collective.globalHarmony;
      particlesRef.current.scale.setScalar(scale);
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Main Sacred Visualization Layer Component
const SacredVisualizationLayer: React.FC<{
  data: VisualizationData;
  className?: string;
}> = ({ data, className }) => {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 8]);
  const [showUI, setShowUI] = useState(true);

  // Calculate elemental positions in pentagram formation
  const elementPositions: Record<keyof ElementalState, [number, number, number]> = {
    fire: [0, 3, 0],        // Top
    air: [2.5, 1, 0],       // Upper right
    earth: [1.5, -2, 0],    // Lower right
    water: [-1.5, -2, 0],   // Lower left
    aether: [-2.5, 1, 0]    // Upper left
  };

  return (
    <div className={`sacred-visualization-layer relative w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{
          background: 'radial-gradient(circle, #000011 0%, #000000 100%)'
        }}
      >
        <ambientLight intensity={0.3} color="#ffffff" />

        {/* Elemental geometries in pentagram formation */}
        {Object.entries(data.elemental).map(([element, intensity]) => (
          <ElementalGeometry
            key={element}
            element={element as keyof ElementalState}
            intensity={intensity}
            position={elementPositions[element as keyof ElementalState]}
          />
        ))}

        {/* Central spiral representing current phase */}
        <SpiralPhaseRenderer
          phase={data.spiral}
          elementalState={data.elemental}
          biometrics={data.biometrics}
        />

        {/* Collective resonance field */}
        <CollectiveResonanceField collective={data.collective} />

        {/* Sacred geometry connections */}
        <mesh>
          <ringGeometry args={[4, 4.1, 5]} />
          <meshBasicMaterial
            color={ELEMENTAL_COLORS[data.collective.dominantElement].primary}
            transparent
            opacity={0.3}
          />
        </mesh>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={15}
          minDistance={3}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Sacred UI Overlay */}
      {showUI && (
        <div className="absolute top-4 left-4 text-white space-y-2 font-mono text-sm bg-black bg-opacity-50 p-4 rounded">
          <div className="text-purple-300 font-semibold">Sacred Visualization Layer</div>
          <div>Phase: <span className="text-gold">{data.spiral.current}</span></div>
          <div>Completion: <span className="text-green-300">{Math.round(data.spiral.completion * 100)}%</span></div>
          <div>Dominant: <span className={`text-${data.collective.dominantElement === 'fire' ? 'orange' : data.collective.dominantElement === 'water' ? 'blue' : data.collective.dominantElement === 'earth' ? 'green' : data.collective.dominantElement === 'air' ? 'sky' : 'purple'}-300`}>
            {data.collective.dominantElement}
          </span></div>
          <div>Community: <span className="text-cyan-300">{data.collective.activeUsers} souls</span></div>
          <div>Coherence: <span className="text-yellow-300">{Math.round(data.collective.coherenceLevel * 100)}%</span></div>

          {data.biometrics && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-purple-200 text-xs">Biometric Sync</div>
              <div>HRV: <span className="text-red-300">{Math.round(data.biometrics.heartRateVariability * 100)}%</span></div>
              <div>Breath: <span className="text-blue-300">{Math.round(data.biometrics.breathCoherence * 100)}%</span></div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          onClick={() => setShowUI(!showUI)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm"
        >
          {showUI ? 'Hide' : 'Show'} Info
        </button>
        <button
          onClick={() => setCameraPosition([0, 0, 12])}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};

// Hook for connecting to Field Learning Algorithm data
export const useVisualizationData = (userId?: string): VisualizationData => {
  const [data, setData] = useState<VisualizationData>({
    elemental: {
      fire: 0.6,
      water: 0.8,
      earth: 0.4,
      air: 0.7,
      aether: 0.3
    },
    spiral: {
      current: 'collaboration',
      completion: 0.65,
      transition: false
    },
    collective: {
      globalHarmony: 0.72,
      activeUsers: 42,
      dominantElement: 'water',
      coherenceLevel: 0.68
    },
    emotionalTone: 'peaceful_contemplation'
  });

  useEffect(() => {
    // TODO: Replace with actual API integration
    const updateVisualizationData = async () => {
      try {
        // Simulate API calls to Navigator, AIN, and Field Learning systems
        // const navigatorData = await fetch(`/api/navigator/status/${userId}`);
        // const ainData = await fetch(`/api/ain/memory/${userId}`);
        // const fieldData = await fetch(`/api/field-learning/collective`);

        // For now, simulate dynamic data
        const newData: VisualizationData = {
          elemental: {
            fire: Math.random() * 0.4 + 0.4,
            water: Math.random() * 0.4 + 0.5,
            earth: Math.random() * 0.4 + 0.3,
            air: Math.random() * 0.4 + 0.6,
            aether: Math.random() * 0.4 + 0.2
          },
          spiral: {
            current: (['initiation', 'grounding', 'collaboration', 'transformation', 'completion'] as const)[
              Math.floor(Math.random() * 5)
            ],
            completion: Math.random(),
            transition: Math.random() > 0.8
          },
          collective: {
            globalHarmony: Math.random() * 0.3 + 0.6,
            activeUsers: Math.floor(Math.random() * 50) + 20,
            dominantElement: (['fire', 'water', 'earth', 'air', 'aether'] as const)[
              Math.floor(Math.random() * 5)
            ],
            coherenceLevel: Math.random() * 0.4 + 0.5
          },
          emotionalTone: 'dynamic_growth',
          biometrics: {
            heartRateVariability: Math.random() * 0.4 + 0.5,
            breathCoherence: Math.random() * 0.4 + 0.6
          }
        };

        setData(newData);
      } catch (error) {
        console.error('Failed to update visualization data:', error);
      }
    };

    // Update every 2 minutes or on user interaction
    const interval = setInterval(updateVisualizationData, 120000);
    updateVisualizationData(); // Initial load

    return () => clearInterval(interval);
  }, [userId]);

  return data;
};

export default SacredVisualizationLayer;
export type { VisualizationData, ElementalState, SpiralPhase, CollectiveResonance };