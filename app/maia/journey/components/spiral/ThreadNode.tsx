/**
 * ThreadNode Component - Journey Page Phase 3
 *
 * Renders an interactive sphere representing a narrative thread.
 * Positioned along the spiral, colored by element type, scaled by coherence.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreadPosition } from '../../lib/spiralLayout';

export interface ThreadNodeProps {
  threadPosition: ThreadPosition;
  onClick?: (threadId: number) => void;
  onHover?: (threadId: number | null) => void;
  isSelected?: boolean;
}

/**
 * ThreadNode Component
 *
 * Renders a single thread as a sphere with:
 * - Color based on element type
 * - Scale based on coherence
 * - Hover/click interactions
 * - Smooth animation
 *
 * @example
 * ```tsx
 * <ThreadNode
 *   threadPosition={position}
 *   onClick={(id) => console.log('Clicked:', id)}
 *   onHover={(id) => setHoveredThread(id)}
 * />
 * ```
 */
export function ThreadNode({
  threadPosition,
  onClick,
  onHover,
  isSelected = false,
}: ThreadNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animated scale for hover effect
  const targetScale = hovered || isSelected ? threadPosition.scale * 1.3 : threadPosition.scale;

  // Smooth scale animation
  useFrame(() => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      meshRef.current.scale.setScalar(newScale);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(threadPosition.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    onClick?.(threadPosition.id);
  };

  return (
    <mesh
      ref={meshRef}
      position={threadPosition.position}
      quaternion={threadPosition.rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Sphere geometry */}
      <sphereGeometry args={[1, 32, 32]} />

      {/* Material with element color */}
      <meshStandardMaterial
        color={threadPosition.color}
        emissive={threadPosition.color}
        emissiveIntensity={hovered || isSelected ? 0.4 : 0.2}
        roughness={0.3}
        metalness={0.1}
      />

      {/* Glow effect when selected */}
      {(hovered || isSelected) && (
        <mesh scale={1.2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={threadPosition.color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </mesh>
  );
}
