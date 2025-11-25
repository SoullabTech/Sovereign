'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TorusFieldProps {
  children?: React.ReactNode;
  showLabels?: boolean;
  animate?: boolean;
  size?: number;
}

/**
 * Nested Torus Field - The fractal structure of consciousness
 *
 * Three nested tori representing:
 * - Inner (Apple): Personal consciousness field
 * - Middle (Tree): Collective/family/community field
 * - Outer (Universe): Cosmic/universal field
 *
 * Golden flow descends (experience → form)
 * Blue flow ascends (matter → spirit)
 */
function AnimatedTorusField({ animate = true }: { animate?: boolean }) {
  const outerTorusRef = useRef<THREE.Mesh>(null);
  const middleTorusRef = useRef<THREE.Mesh>(null);
  const innerTorusRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Breathing animation
  useFrame(({ clock }) => {
    if (!animate) return;

    const t = clock.getElapsedTime();
    const breathe = Math.sin(t * 0.5) * 0.05 + 1;

    // Outer torus (universe) - slow rotation
    if (outerTorusRef.current) {
      outerTorusRef.current.rotation.x = t * 0.05;
      outerTorusRef.current.rotation.z = t * 0.03;
      outerTorusRef.current.scale.setScalar(breathe * 0.9);
    }

    // Middle torus (tree/collective) - medium rotation
    if (middleTorusRef.current) {
      middleTorusRef.current.rotation.x = t * 0.08;
      middleTorusRef.current.rotation.z = -t * 0.05;
      middleTorusRef.current.scale.setScalar(breathe);
    }

    // Inner torus (apple/personal) - faster rotation
    if (innerTorusRef.current) {
      innerTorusRef.current.rotation.x = t * 0.1;
      innerTorusRef.current.rotation.z = t * 0.07;
      innerTorusRef.current.scale.setScalar(breathe * 1.1);
    }

    // Particle field rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.1;
    }
  });

  // Create particle field around the torus
  const particleCount = 1000;
  const particles = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 2;

    particles[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    particles[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    particles[i * 3 + 2] = r * Math.cos(theta);
  }

  return (
    <group>
      {/* Particle field - the consciousness field itself */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#C1A880"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Outer torus (Universe) - cool sepia - BARELY VISIBLE */}
      <mesh ref={outerTorusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.15, 16, 100]} />
        <meshBasicMaterial
          color="#988C7C"
          transparent
          opacity={0.03}
          wireframe={false}
        />
      </mesh>

      {/* Middle torus (Tree/Collective) - mid sepia - BARELY VISIBLE */}
      <mesh ref={middleTorusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.2, 16, 100]} />
        <meshBasicMaterial
          color="#A89D8E"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Inner torus (Apple/Personal) - warm sepia - BARELY VISIBLE */}
      <mesh ref={innerTorusRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.25, 16, 100]} />
        <meshBasicMaterial
          color="#C9B896"
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Central sphere removed - actual consciousness map will be here */}
    </group>
  );
}

/**
 * Consciousness Field with Torus
 *
 * Wraps the consciousness map (12-house wheel) in the torus field
 * showing it as emerging from the center of the torus vortex
 */
export default function ConsciousnessFieldWithTorus({
  children,
  showLabels = true,
  animate = true,
  size = 600
}: TorusFieldProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(245,240,232,0.95)'
        }}
      >
        <div style={{ color: '#8B7D6B', fontFamily: 'serif', fontStyle: 'italic' }}>
          Loading consciousness field...
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* 3D Torus field background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0
      }}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <AnimatedTorusField animate={animate} />
        </Canvas>
      </div>

      {/* Consciousness map in the center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: '98%',
          height: '98%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>

      {/* Labels for the fractal levels */}
      {showLabels && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {/* Universe label */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#8B7D6B',
              fontSize: '12px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.65,
              textShadow: '0 0 8px rgba(139,125,107,0.3)'
            }}
          >
            Universe (Cosmic Torus)
          </div>

          {/* Tree/Collective label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 20,
              transform: 'translateY(-50%)',
              color: '#9B8A76',
              fontSize: '11px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.65,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              textShadow: '0 0 8px rgba(155,138,118,0.3)'
            }}
          >
            Collective (Tree)
          </div>

          {/* Personal label */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#A89D8E',
              fontSize: '10px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.65,
              textShadow: '0 0 8px rgba(168,157,142,0.3)'
            }}
          >
            Personal (Apple)
          </div>

          {/* Fractal note */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              color: '#8B7D6B',
              fontSize: '9px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.5,
              maxWidth: 200
            }}
          >
            "As above, so below"<br />
            Each torus contains the pattern
          </div>
        </div>
      )}

      {/* Flow direction indicators */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none'
        }}
      >
        {/* Descending (golden) */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            color: '#C1A880',
            fontSize: '10px',
            fontFamily: 'serif',
            fontStyle: 'italic',
            opacity: 0.6
          }}
        >
          ↓ Experience → Form
        </div>

        {/* Ascending (blue) */}
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            color: '#A89D8E',
            fontSize: '10px',
            fontFamily: 'serif',
            fontStyle: 'italic',
            opacity: 0.6
          }}
        >
          Matter → Spirit ↑
        </div>
      </div>
    </div>
  );
}

/**
 * CSS-only fallback for systems without WebGL
 */
export function ConsciousnessFieldFallback({
  children,
  showLabels = true,
  size = 600
}: TorusFieldProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(232,223,208,0.95), rgba(245,240,232,0.98))',
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    >
      {/* Concentric rings representing tori */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            border: '2px solid rgba(152,140,124,0.25)',
            boxShadow: '0 0 20px rgba(152,140,124,0.2)'
          }}
        />

        {/* Middle ring */}
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            border: '3px solid rgba(168,157,142,0.4)',
            boxShadow: '0 0 20px rgba(168,157,142,0.35)'
          }}
        />

        {/* Inner ring */}
        <div
          style={{
            position: 'absolute',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            border: '4px solid rgba(201,184,150,0.55)',
            boxShadow: '0 0 20px rgba(201,184,150,0.5)'
          }}
        />
      </div>

      {/* Content in center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: '60%',
          height: '60%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#8B7D6B',
              fontSize: '12px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.65
            }}
          >
            Universe
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              color: '#8B7D6B',
              fontSize: '9px',
              fontFamily: 'serif',
              fontStyle: 'italic',
              opacity: 0.5
            }}
          >
            Fractal consciousness
          </div>
        </>
      )}
    </div>
  );
}
