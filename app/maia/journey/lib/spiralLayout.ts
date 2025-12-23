/**
 * Spiral Layout Utilities - Journey Page Phase 3
 *
 * Calculates 3D positions for threads along a sacred geometry spiral.
 * Based on Fibonacci/golden ratio principles for natural, organic layouts.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

import * as THREE from 'three';
import type { Thread } from '../types';

// ============================================================================
// Constants
// ============================================================================

/** Golden ratio (φ) - fundamental to spiral geometry */
const PHI = (1 + Math.sqrt(5)) / 2;

/** Default spiral parameters */
const DEFAULT_SPIRAL_CONFIG = {
  /** Number of turns in the spiral */
  turns: 3,

  /** Radius at the spiral's starting point */
  startRadius: 2,

  /** Radius at the spiral's ending point */
  endRadius: 8,

  /** Vertical height span of the spiral */
  height: 6,

  /** Tightness of the spiral (higher = tighter) */
  tightness: 1.2,

  /** Rotation offset (radians) */
  rotation: 0,
};

export type SpiralConfig = typeof DEFAULT_SPIRAL_CONFIG;

// ============================================================================
// Thread Position Calculation
// ============================================================================

export interface ThreadPosition {
  /** Thread ID */
  id: number;

  /** 3D position along spiral */
  position: THREE.Vector3;

  /** Node size based on coherence */
  scale: number;

  /** Color based on element type */
  color: string;

  /** Rotation quaternion for node orientation */
  rotation: THREE.Quaternion;

  /** Original thread data */
  thread: Thread;
}

/**
 * Calculate 3D position along spiral for a given thread
 *
 * Uses logarithmic spiral formula: r(θ) = a * e^(b*θ)
 * where a = startRadius, b = growth rate
 *
 * @param thread - Thread data
 * @param index - Thread index in sequence
 * @param total - Total number of threads
 * @param config - Spiral configuration
 * @returns ThreadPosition with 3D coordinates and metadata
 */
export function calculateThreadPosition(
  thread: Thread,
  index: number,
  total: number,
  config: Partial<SpiralConfig> = {}
): ThreadPosition {
  const cfg = { ...DEFAULT_SPIRAL_CONFIG, ...config };

  // Calculate normalized position (0-1) along spiral
  const t = index / (total - 1 || 1);

  // Calculate angle (θ) in radians
  const theta = t * cfg.turns * 2 * Math.PI + cfg.rotation;

  // Logarithmic spiral radius
  const growthRate = Math.log(cfg.endRadius / cfg.startRadius) / (cfg.turns * 2 * Math.PI);
  const radius = cfg.startRadius * Math.exp(growthRate * theta);

  // Calculate x, y, z coordinates
  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  const y = (t - 0.5) * cfg.height; // Center vertically

  // Calculate node scale based on coherence
  const baseScale = 0.3;
  const coherenceScale = 0.2;
  const scale = baseScale + (thread.coherence * coherenceScale);

  // Get color based on element type
  const color = getElementColor(thread.elementType);

  // Calculate rotation to face outward from spiral center
  const rotation = new THREE.Quaternion();
  rotation.setFromEuler(new THREE.Euler(0, theta + Math.PI / 2, 0));

  return {
    id: thread.id,
    position: new THREE.Vector3(x, y, z),
    scale,
    color,
    rotation,
    thread,
  };
}

/**
 * Calculate positions for all threads
 *
 * @param threads - Array of threads
 * @param config - Spiral configuration
 * @returns Array of ThreadPosition objects
 */
export function calculateSpiralLayout(
  threads: Thread[],
  config: Partial<SpiralConfig> = {}
): ThreadPosition[] {
  return threads.map((thread, index) =>
    calculateThreadPosition(thread, index, threads.length, config)
  );
}

// ============================================================================
// Element Colors (Sacred Geometry Palette)
// ============================================================================

const ELEMENT_COLORS: Record<string, string> = {
  // 💧 Water - Caladan teal
  water: '#2C7873',

  // 🔥 Fire - Spice orange
  fire: '#FF8C42',

  // 🫀 Earth - Desert sand
  earth: '#D4A574',

  // 🌬️ Air - Fremen blue
  air: '#4A7BA7',

  // ✨ Aether - Navigator purple
  aether: '#A46FF0',
};

/**
 * Get color for element type
 *
 * @param elementType - Element identifier
 * @returns Hex color string
 */
export function getElementColor(elementType: string): string {
  return ELEMENT_COLORS[elementType] || '#8B6F47'; // Default to deep sand
}

// ============================================================================
// Spiral Curve Generation (for rendering spiral path)
// ============================================================================

/**
 * Generate Three.js curve representing the spiral path
 *
 * Useful for rendering the spiral's wireframe or glow effect
 *
 * @param config - Spiral configuration
 * @param segments - Number of curve segments (higher = smoother)
 * @returns THREE.CatmullRomCurve3
 */
export function generateSpiralCurve(
  config: Partial<SpiralConfig> = {},
  segments: number = 100
): THREE.CatmullRomCurve3 {
  const cfg = { ...DEFAULT_SPIRAL_CONFIG, ...config };
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = t * cfg.turns * 2 * Math.PI + cfg.rotation;

    const growthRate = Math.log(cfg.endRadius / cfg.startRadius) / (cfg.turns * 2 * Math.PI);
    const radius = cfg.startRadius * Math.exp(growthRate * theta);

    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = (t - 0.5) * cfg.height;

    points.push(new THREE.Vector3(x, y, z));
  }

  return new THREE.CatmullRomCurve3(points);
}

// ============================================================================
// Camera Positioning
// ============================================================================

/**
 * Calculate optimal camera position for viewing the spiral
 *
 * @param config - Spiral configuration
 * @returns Camera position and lookAt target
 */
export function calculateCameraPosition(config: Partial<SpiralConfig> = {}) {
  const cfg = { ...DEFAULT_SPIRAL_CONFIG, ...config };

  // Camera positioned to view spiral from slight angle
  const avgRadius = (cfg.startRadius + cfg.endRadius) / 2;
  const distance = avgRadius * 2.5;

  const position = new THREE.Vector3(
    distance * 0.8,  // Slightly offset x
    cfg.height * 0.3, // Slight upward angle
    distance          // Main viewing distance
  );

  const lookAt = new THREE.Vector3(0, 0, 0); // Look at spiral center

  return { position, lookAt };
}

// ============================================================================
// Interaction Helpers
// ============================================================================

/**
 * Find thread node closest to a ray intersection
 *
 * @param ray - Raycaster ray
 * @param threadPositions - Array of thread positions
 * @param maxDistance - Maximum distance to consider
 * @returns Closest ThreadPosition or null
 */
export function findClosestThread(
  ray: THREE.Ray,
  threadPositions: ThreadPosition[],
  maxDistance: number = 1
): ThreadPosition | null {
  let closest: ThreadPosition | null = null;
  let closestDistance = maxDistance;

  for (const tp of threadPositions) {
    const point = new THREE.Vector3();
    ray.closestPointToPoint(tp.position, point);
    const distance = point.distanceTo(tp.position);

    if (distance < closestDistance) {
      closest = tp;
      closestDistance = distance;
    }
  }

  return closest;
}

// ============================================================================
// Animation Helpers
// ============================================================================

/**
 * Calculate spiral rotation animation
 *
 * @param time - Current time (seconds)
 * @param speed - Rotation speed (radians/second)
 * @returns Rotation quaternion
 */
export function calculateSpiralRotation(time: number, speed: number = 0.1): THREE.Quaternion {
  const rotation = new THREE.Quaternion();
  rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
  return rotation;
}

/**
 * Interpolate between two thread positions (for smooth transitions)
 *
 * @param from - Start position
 * @param to - End position
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated position
 */
export function interpolateThreadPosition(
  from: ThreadPosition,
  to: ThreadPosition,
  t: number
): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(from.position, to.position, t);
}

// ============================================================================
// Exports
// ============================================================================

export const spiralLayout = {
  calculateThreadPosition,
  calculateSpiralLayout,
  generateSpiralCurve,
  calculateCameraPosition,
  getElementColor,
  findClosestThread,
  calculateSpiralRotation,
  interpolateThreadPosition,
  PHI,
  DEFAULT_SPIRAL_CONFIG,
};
