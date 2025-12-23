/**
 * AtmosphereBackground Component - Journey Page Phase 3
 *
 * Renders an animated Air/Aether shader as a background sphere,
 * creating a living, breathing atmosphere for the spiral visualization.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createAirAetherMaterial, updateAirAetherTime } from '../../shaders/airAetherShader';
import { useCollective } from '../../hooks/useCollective';

export interface AtmosphereBackgroundProps {
  /** Sphere radius */
  radius?: number;

  /** Animation speed multiplier */
  speed?: number;

  /** Effect intensity */
  intensity?: number;

  /** Enable coherence-driven modulation */
  useCoherence?: boolean;
}

/**
 * AtmosphereBackground Component
 *
 * Renders a large sphere with Air/Aether shader material,
 * creating an animated atmospheric background.
 *
 * @example
 * ```tsx
 * <AtmosphereBackground
 *   radius={50}
 *   speed={1.0}
 *   intensity={0.5}
 *   useCoherence={true}
 * />
 * ```
 */
export function AtmosphereBackground({
  radius = 50,
  speed = 1.0,
  intensity = 0.5,
  useCoherence = true,
}: AtmosphereBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Fetch collective coherence (if enabled)
  const { coherence } = useCollective({
    enabled: useCoherence,
    refetchInterval: 60000, // Update every minute
  });

  // Create shader material
  const material = useMemo(
    () =>
      createAirAetherMaterial({
        coherence: coherence?.groupCoherence ?? 0.7,
        speed,
        intensity,
      }),
    [coherence?.groupCoherence, speed, intensity]
  );

  // Animate shader time uniform
  useFrame((state) => {
    if (meshRef.current?.material instanceof THREE.ShaderMaterial) {
      updateAirAetherTime(meshRef.current.material, state.clock.getDelta());

      // Update coherence if available
      if (useCoherence && coherence?.groupCoherence !== undefined) {
        meshRef.current.material.uniforms.u_coherence.value = coherence.groupCoherence;
      }
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      {/* Inside-out sphere (camera is at center) */}
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
