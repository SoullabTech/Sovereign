'use client';

// Animated Holoflower for Oracle Interface
// Sacred geometry that evolves with consciousness levels and elemental signatures

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Ring, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ConsciousnessLevel } from '@/lib/consciousness/level-detector';
import { ElementalSignature } from '@/lib/consciousness/adaptive-language';

export interface HoloflowerProps {
  stage: 'dormant' | 'awakening' | 'processing' | 'blooming' | 'complete';
  consciousnessLevel?: ConsciousnessLevel;
  elementalSignature?: ElementalSignature;
  cringeScore?: number;
  className?: string;
}

// Sacred geometry configurations for each consciousness level
const LEVEL_CONFIGS = {
  1: {
    petals: 3,
    complexity: 1,
    color: new THREE.Color('#8B4513'), // Earth brown - grounded
    innerColor: new THREE.Color('#D4AF37'), // Gold
    pulseSpeed: 0.5,
    rotationSpeed: 0.2
  },
  2: {
    petals: 5,
    complexity: 1.5,
    color: new THREE.Color('#228B22'), // Forest green - growth
    innerColor: new THREE.Color('#32CD32'), // Lime
    pulseSpeed: 0.7,
    rotationSpeed: 0.3
  },
  3: {
    petals: 7,
    complexity: 2,
    color: new THREE.Color('#4169E1'), // Royal blue - learning
    innerColor: new THREE.Color('#00BFFF'), // Deep sky blue
    pulseSpeed: 0.9,
    rotationSpeed: 0.4
  },
  4: {
    petals: 9,
    complexity: 2.5,
    color: new THREE.Color('#8A2BE2'), // Blue violet - integration
    innerColor: new THREE.Color('#DDA0DD'), // Plum
    pulseSpeed: 1.1,
    rotationSpeed: 0.5
  },
  5: {
    petals: 12,
    complexity: 3,
    color: new THREE.Color('#FFD700'), // Gold - mastery
    innerColor: new THREE.Color('#FFF8DC'), // Cornsilk
    pulseSpeed: 1.3,
    rotationSpeed: 0.6
  }
};

// Elemental color modifiers
const ELEMENTAL_COLORS = {
  fire: new THREE.Color('#FF4500'),    // Orange red
  water: new THREE.Color('#0077BE'),   // Ocean blue
  earth: new THREE.Color('#8B4513'),   // Saddle brown
  air: new THREE.Color('#E6E6FA'),     // Lavender
  aether: new THREE.Color('#9400D3')   // Violet
};

function HoloflowerCore({ stage, consciousnessLevel = 1, elementalSignature, cringeScore = 0 }: HoloflowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const petalsRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const config = LEVEL_CONFIGS[consciousnessLevel];

  // Calculate dominant element
  const dominantElement = useMemo(() => {
    if (!elementalSignature) return 'aether';

    const elements = [
      { name: 'fire', value: elementalSignature.fire },
      { name: 'water', value: elementalSignature.water },
      { name: 'earth', value: elementalSignature.earth },
      { name: 'air', value: elementalSignature.air },
      { name: 'aether', value: elementalSignature.aether }
    ] as const;

    return elements.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    ).name;
  }, [elementalSignature]);

  // Blend base color with elemental influence
  const blendedColor = useMemo(() => {
    const baseColor = config.color.clone();
    const elementalColor = ELEMENTAL_COLORS[dominantElement];
    return baseColor.lerp(elementalColor, 0.3);
  }, [config.color, dominantElement]);

  // Stage-based animations
  const stageProgress = useMemo(() => {
    switch (stage) {
      case 'dormant': return 0;
      case 'awakening': return 0.2;
      case 'processing': return 0.6;
      case 'blooming': return 0.9;
      case 'complete': return 1;
      default: return 0;
    }
  }, [stage]);

  // Cringe filter visual effect
  const purityFactor = useMemo(() => {
    return Math.max(0, (10 - cringeScore) / 10); // Higher purity = less cringe
  }, [cringeScore]);

  useFrame((state) => {
    if (!groupRef.current || !petalsRef.current || !coreRef.current) return;

    const time = state.clock.elapsedTime;

    // Main rotation
    groupRef.current.rotation.y = time * config.rotationSpeed * stageProgress;

    // Petal animation
    petalsRef.current.children.forEach((petal, index) => {
      const petalMesh = petal as THREE.Mesh;
      const offset = (index / config.petals) * Math.PI * 2;

      // Breathing pulse
      const pulse = 1 + Math.sin(time * config.pulseSpeed + offset) * 0.1 * stageProgress;
      petalMesh.scale.setScalar(pulse * stageProgress);

      // Purity shimmer
      const shimmer = 0.8 + Math.sin(time * 2 + offset) * 0.2 * purityFactor;
      if (petalMesh.material instanceof THREE.MeshStandardMaterial) {
        petalMesh.material.opacity = shimmer * stageProgress;
      }
    });

    // Core pulsing
    const corePulse = 1 + Math.sin(time * config.pulseSpeed * 1.5) * 0.15 * stageProgress;
    coreRef.current.scale.setScalar(corePulse);

    // Core color intensity based on purity
    if (coreRef.current.material instanceof THREE.MeshStandardMaterial) {
      coreRef.current.material.emissiveIntensity = purityFactor * 0.5 * stageProgress;
    }
  });

  // Generate petals
  const petals = useMemo(() => {
    return Array.from({ length: config.petals }, (_, i) => {
      const angle = (i / config.petals) * Math.PI * 2;
      const x = Math.cos(angle) * 1.5;
      const z = Math.sin(angle) * 1.5;
      const petalRotation = angle + Math.PI / 2;

      return (
        <group key={i} position={[x, 0, z]} rotation={[0, petalRotation, 0]}>
          {/* Petal geometry - sacred leaf shape */}
          <mesh>
            <planeGeometry args={[0.8, 1.6, 8, 16]} />
            <meshStandardMaterial
              color={blendedColor}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              emissive={config.innerColor}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Petal outline for sacred geometry definition */}
          <Ring
            args={[0.3, 0.4, 16]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={config.innerColor}
              transparent
              opacity={0.6}
              emissive={config.innerColor}
              emissiveIntensity={0.3}
            />
          </Ring>
        </group>
      );
    });
  }, [config.petals, blendedColor, config.innerColor]);

  return (
    <group ref={groupRef}>
      {/* Petals */}
      <group ref={petalsRef}>
        {petals}
      </group>

      {/* Core sphere */}
      <Sphere ref={coreRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={config.innerColor}
          emissive={blendedColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Inner geometry rings for complexity */}
      {Array.from({ length: Math.floor(config.complexity) }, (_, i) => (
        <Ring
          key={i}
          args={[0.5 + i * 0.3, 0.6 + i * 0.3, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color={blendedColor}
            transparent
            opacity={0.4 - i * 0.1}
            emissive={config.innerColor}
            emissiveIntensity={0.1}
          />
        </Ring>
      ))}

      {/* Consciousness level indicator */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color={config.color}
        anchorX="center"
        anchorY="middle"
      >
        Level {consciousnessLevel}
      </Text>
    </group>
  );
}

export function Holoflower(props: HoloflowerProps) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting setup for sacred geometry */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.6}
          castShadow
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={0.5}
          color="#ffffff"
        />

        {/* The holoflower itself */}
        <HoloflowerCore {...props} />
      </Canvas>

      {/* Stage indicator overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 font-mono">
        {props.stage.toUpperCase()}
        {props.cringeScore !== undefined && (
          <span className="ml-2">
            Purity: {Math.max(0, (10 - props.cringeScore) * 10)}%
          </span>
        )}
      </div>
    </div>
  );
}