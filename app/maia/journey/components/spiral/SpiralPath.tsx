/**
 * SpiralPath Component - Journey Page Phase 3
 *
 * Renders a glowing tube following the spiral's path.
 * Provides visual guidance through the journey timeline.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { generateSpiralCurve, type SpiralConfig } from '../../lib/spiralLayout';

export interface SpiralPathProps {
  config?: Partial<SpiralConfig>;
  color?: string;
  opacity?: number;
  glowIntensity?: number;
}

/**
 * SpiralPath Component
 *
 * Renders the spiral's curve as a glowing tube.
 *
 * @example
 * ```tsx
 * <SpiralPath
 *   color="#A46FF0"
 *   opacity={0.3}
 *   glowIntensity={0.5}
 * />
 * ```
 */
export function SpiralPath({
  config = {},
  color = '#A46FF0',
  opacity = 0.15,
  glowIntensity = 0.3,
}: SpiralPathProps) {
  // Generate spiral curve
  const curve = useMemo(() => generateSpiralCurve(config, 200), [config]);

  // Generate tube geometry from curve
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 200, 0.05, 8, false),
    [curve]
  );

  return (
    <group>
      {/* Main tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Glowing outer tube */}
      <mesh geometry={tubeGeometry} scale={1.5}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * glowIntensity}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
