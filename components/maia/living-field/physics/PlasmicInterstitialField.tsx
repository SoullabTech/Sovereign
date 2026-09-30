'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = {
  radius: number
  color: string
  glow: string
  opacity?: number
  position?: [number, number, number]
  flatten?: number
  phase?: number
}

const vertexShader = `
  varying vec3 vLocal;
  varying vec3 vNormal;

  void main() {
    vLocal = normalize(position);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uGlow;
  varying vec3 vLocal;
  varying vec3 vNormal;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    float n = hash21(p);
    return vec2(n, hash21(p + n + 17.17));
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = turn * p * 2.03 + 11.7;
      amplitude *= 0.5;
    }
    return value;
  }
  float cellularEdge(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    float first = 10.0;
    float second = 10.0;

    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 point = hash22(cell + offset);
        point = 0.5 + 0.42 * sin(uTime * 0.12 + 6.2831 * point);
        float d = length(offset + point - f);

        if (d < first) {
          second = first;
          first = d;
        } else if (d < second) {
          second = d;
        }
      }
    }

    float edge = second - first;
    return 1.0 - smoothstep(0.02, 0.15, edge);
  }
  void main() {
    vec2 p = vLocal.xy;
    float radial = length(p);
    float fade = 1.0 - smoothstep(0.58, 1.02, radial);

    vec2 flow = vec2(
      fbm(p * 1.05 + vec2(uTime * 0.018, -uTime * 0.011)),
      fbm(p * 1.05 + vec2(-uTime * 0.013, uTime * 0.016) + 7.1)
    );

    vec2 warped = p * 1.92 + (flow - 0.5) * 1.28;
    mat2 drift = mat2(0.78, -0.63, 0.63, 0.78);

    float fieldA = fbm(warped * 1.55 + vec2(uTime * 0.014, 0.0));
    float fieldB = fbm(
      drift * warped * 1.95 + vec2(-uTime * 0.011, uTime * 0.009) + 3.7
    );

    float strandA = 1.0 - smoothstep(0.024, 0.115, abs(fieldA - 0.515));
    float strandB = 1.0 - smoothstep(0.028, 0.13, abs(fieldB - 0.535));
    float web = max(strandA, strandB * 0.7);

    float cellularGhost = cellularEdge(warped * 0.74) * 0.17;
    web = max(web, cellularGhost);

    float mist = fbm(p * 1.45 + (flow - 0.5) * 0.52);
    float pulse = 0.86 + 0.14 * sin(uTime * 0.18 + mist * 6.2831);

    float fresnel = pow(
      1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))),
      2.15
    );
    float filament = pow(web, 1.7) * pulse;
    float vapor = smoothstep(0.32, 0.8, mist) * 0.15;
    float alpha = fade * uOpacity * (
      0.13 +
      filament * 0.72 +
      vapor +
      fresnel * 0.46
    );

    vec3 body = mix(uColor, uGlow, clamp(filament * 0.9 + fresnel * 0.55, 0.0, 1.0));
    body += uGlow * filament * 0.24;

    gl_FragColor = vec4(body, alpha);
  }
`

export function PlasmicInterstitialField({
  radius,
  color,
  glow,
  opacity = 0.22,
  position = [0, 0, 0],
  flatten = 0.14,
  phase = 0,
}: Props) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: phase },
    uOpacity: { value: opacity },
    uColor: { value: new THREE.Color(color) },
    uGlow: { value: new THREE.Color(glow) },
  }), [color, glow, opacity, phase])

  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = clock.elapsedTime + phase
    material.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.current.uniforms.uOpacity.value,
      opacity,
      0.035,
    )
  })

  return (
    <mesh
      position={position}
      scale={[1, 1, flatten]}
      raycast={() => null}
      renderOrder={-1}
    >
      <sphereGeometry args={[radius, 44, 24]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
