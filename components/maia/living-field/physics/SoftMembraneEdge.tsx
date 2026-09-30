'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = {
  radius: number
  glow: string
  opacity?: number
  phase?: number
  position?: [number, number, number]
}

const vertexShader = `
  varying vec2 vLocal;

  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uGlow;
  uniform float uPhase;
  varying vec2 vLocal;

  float softPulse(float x, float width) {
    return exp(-pow(x / width, 2.0));
  }

  void main() {
    float radius = length(vLocal);
    float angle = atan(vLocal.y, vLocal.x);

    float wobble =
      sin(angle * 3.0 + uTime * 0.13 + uPhase) * 0.012 +
      sin(angle * 7.0 - uTime * 0.09 + uPhase * 1.7) * 0.008 +
      sin(angle * 11.0 + uTime * 0.047) * 0.004;

    float membraneRadius = 0.952 + wobble;
    float closeEdge = softPulse(radius - membraneRadius, 0.034) * 0.62;
    float auraEdge = softPulse(radius - membraneRadius, 0.092) * 0.34;
    float inside = smoothstep(0.7, membraneRadius, radius) * 0.11;
    float pulse = 0.88 + sin(uTime * 0.31 + angle * 2.0 + uPhase) * 0.12;

    float alpha = (closeEdge + auraEdge + inside) * uOpacity * pulse;
    vec3 color = uGlow * (0.48 + closeEdge * 0.38);

    gl_FragColor = vec4(color, alpha);
  }
`

export function SoftMembraneEdge({
  radius,
  glow,
  opacity = 0.5,
  phase = 0,
  position = [0, 0, 0],
}: Props) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime: { value: phase },
    uOpacity: { value: opacity },
    uGlow: { value: new THREE.Color(glow) },
    uPhase: { value: phase },
  }), [glow, opacity, phase])
  useFrame(({ clock }) => {
    if (!material.current) return
    material.current.uniforms.uTime.value = clock.elapsedTime + phase
    material.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.current.uniforms.uOpacity.value,
      opacity,
      0.04,
    )
  })

  return (
    <mesh position={position} scale={[radius, radius, 1]} raycast={() => null}>
      <circleGeometry args={[1.05, 160]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
