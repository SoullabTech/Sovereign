/**
 * Air/Aether Shader Materials - Journey Page Phase 3
 *
 * GLSL shader materials blending Air (blue shimmer) and Aether (violet aurora)
 * for atmospheric background effects in the spiral visualization.
 *
 * Phase: 4.4-C Phase 3 (Spiral Visualization)
 * Created: December 23, 2024
 */

import * as THREE from 'three';

// ============================================================================
// Color Constants (Spiralogic Palette)
// ============================================================================

/** Air - Fremen blue shimmer (#DDE9F3) */
export const AIR_COLOR = new THREE.Color('#DDE9F3');

/** Aether - Navigator purple aurora (#C6A0E8) */
export const AETHER_COLOR = new THREE.Color('#C6A0E8');

// ============================================================================
// Shader Uniforms Interface
// ============================================================================

export type AirAetherUniforms = {
  /** Animation time (seconds) */
  u_time: THREE.IUniform<number>;

  /** Air layer color (blue shimmer) */
  u_airColor: THREE.IUniform<THREE.Color>;

  /** Aether layer color (violet aurora) */
  u_aetherColor: THREE.IUniform<THREE.Color>;

  /** Global coherence modulation (0-1) */
  u_coherence: THREE.IUniform<number>;

  /** Shimmer speed */
  u_speed: THREE.IUniform<number>;

  /** Wave intensity */
  u_intensity: THREE.IUniform<number>;
};

// ============================================================================
// Vertex Shader
// ============================================================================

export const airAetherVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ============================================================================
// Fragment Shader
// ============================================================================

export const airAetherFragmentShader = /* glsl */ `
  uniform float u_time;
  uniform vec3 u_airColor;
  uniform vec3 u_aetherColor;
  uniform float u_coherence;
  uniform float u_speed;
  uniform float u_intensity;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Simplex noise approximation (faster than true noise)
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Smooth noise using neighboring samples
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion (layered noise)
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    // Animated UV coordinates
    vec2 animatedUv = vUv;
    animatedUv.x += u_time * u_speed * 0.05;
    animatedUv.y += sin(u_time * u_speed * 0.1 + vUv.x * 3.14159) * 0.1;

    // Generate noise patterns
    float noise1 = fbm(animatedUv * 2.0 + u_time * u_speed * 0.1);
    float noise2 = fbm(animatedUv * 3.0 - u_time * u_speed * 0.15);

    // Combine noise for shimmer effect
    float shimmer = (noise1 + noise2) * 0.5;

    // Breathing wave (slow sine wave modulation)
    float breathe = sin(u_time * u_speed * 0.5) * 0.5 + 0.5;

    // Mix Air and Aether colors based on noise and breathing
    vec3 color = mix(u_airColor, u_aetherColor, shimmer);

    // Apply coherence modulation
    float coherenceGlow = u_coherence * u_intensity;
    color += vec3(coherenceGlow * breathe * 0.3);

    // Vignette effect (darker at edges)
    float vignette = 1.0 - length(vUv - 0.5) * 0.8;
    color *= vignette;

    // Radial gradient from center
    float radialGradient = 1.0 - length(vPosition.xy) * 0.1;
    color *= radialGradient;

    // Final alpha (semi-transparent)
    float alpha = 0.3 + (shimmer * 0.2) + (breathe * 0.1);

    gl_FragColor = vec4(color, alpha * u_coherence);
  }
`;

// ============================================================================
// Shader Material Factory
// ============================================================================

/**
 * Create Air/Aether shader material with default uniforms
 *
 * @param options - Optional uniform overrides
 * @returns THREE.ShaderMaterial configured for Air/Aether effects
 */
export function createAirAetherMaterial(
  options: Partial<{
    airColor: THREE.Color;
    aetherColor: THREE.Color;
    coherence: number;
    speed: number;
    intensity: number;
  }> = {}
): THREE.ShaderMaterial {
  const uniforms: AirAetherUniforms = {
    u_time: { value: 0 },
    u_airColor: { value: options.airColor || AIR_COLOR.clone() },
    u_aetherColor: { value: options.aetherColor || AETHER_COLOR.clone() },
    u_coherence: { value: options.coherence ?? 0.7 },
    u_speed: { value: options.speed ?? 1.0 },
    u_intensity: { value: options.intensity ?? 0.5 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: airAetherVertexShader,
    fragmentShader: airAetherFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

// ============================================================================
// Animation Helper
// ============================================================================

/**
 * Update shader material time uniform (call in animation loop)
 *
 * @param material - Shader material to update
 * @param deltaTime - Time since last frame (seconds)
 */
export function updateAirAetherTime(
  material: THREE.ShaderMaterial,
  deltaTime: number
): void {
  if (material.uniforms.u_time) {
    material.uniforms.u_time.value += deltaTime;
  }
}

/**
 * Update coherence uniform based on collective coherence data
 *
 * @param material - Shader material to update
 * @param coherence - Coherence value (0-1)
 */
export function updateAirAetherCoherence(
  material: THREE.ShaderMaterial,
  coherence: number
): void {
  if (material.uniforms.u_coherence) {
    material.uniforms.u_coherence.value = THREE.MathUtils.clamp(coherence, 0, 1);
  }
}

// ============================================================================
// Exports
// ============================================================================

export const airAetherShader = {
  createMaterial: createAirAetherMaterial,
  updateTime: updateAirAetherTime,
  updateCoherence: updateAirAetherCoherence,
  vertexShader: airAetherVertexShader,
  fragmentShader: airAetherFragmentShader,
  AIR_COLOR,
  AETHER_COLOR,
};
