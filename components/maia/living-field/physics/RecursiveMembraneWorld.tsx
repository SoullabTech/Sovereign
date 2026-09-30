'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { FieldDatum } from '../livingFieldHierarchy'
import { recursiveChildHome } from './recursiveFieldLayout'

type RecursiveBody = {
  node: FieldDatum
  home: THREE.Vector3
  pos: THREE.Vector3
  vel: THREE.Vector3
  r: number
}

export type RecursiveMembraneWorldProps = {
  parentPosition: THREE.Vector3
  path: FieldDatum[]
  depth: number
  color: string
  glow: string
  onEnter: (node: FieldDatum) => void
  onLeaf: (node: FieldDatum) => void
}

const MEMBRANE_R = 2.9
function buildChildren(node: FieldDatum) {
  const children = node.children ?? []

  return children.map((child): RecursiveBody => {
    const point = recursiveChildHome(node, child.key) ?? { x: 0, y: 0, z: 0.58 }
    const home = new THREE.Vector3(point.x, point.y, point.z)
    const direction = home.clone().setZ(0).normalize()

    return {
      node: child,
      home,
      pos: new THREE.Vector3(0, 0, 0.72),
      vel: direction.multiplyScalar(0.035),
      r: child.label.length > 16 ? 0.39 : 0.34,
    }
  })
}

function RecursiveChild({
  body,
  glow,
  color,
  selected,
  onEnter,
  onLeaf,
}: {
  body: RecursiveBody
  glow: string
  color: string
  selected: boolean
  onEnter: (node: FieldDatum) => void
  onLeaf: (node: FieldDatum) => void
}) {
  const group = useRef<THREE.Group>(null)
  const halo = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const canEnter = Boolean(body.node.children?.length)

  useFrame(() => {
    if (group.current) group.current.position.copy(body.pos)
    if (halo.current) {
      const target = selected ? 1.34 : hovered ? 1.26 : 1
      halo.current.scale.setScalar(
        THREE.MathUtils.lerp(halo.current.scale.x, target, 0.1),
      )
      const material = halo.current.material as THREE.MeshBasicMaterial
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        selected ? 0.08 : hovered ? 0.24 : canEnter ? 0.09 : 0.04,
        0.09,
      )
    }
  })

  return (
    <group ref={group}>
      <mesh ref={halo} raycast={() => null}>
        <sphereGeometry args={[body.r * 1.3, 24, 16]} />
        <meshBasicMaterial color={glow} transparent opacity={0.06} depthWrite={false} />
      </mesh>

      <mesh
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = canEnter ? 'zoom-in' : 'default'
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (canEnter) onEnter(body.node)
          else onLeaf(body.node)
        }}
      >
        <sphereGeometry args={[body.r, 32, 20]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.2 : hovered ? 0.62 : 0.34}
          roughness={0.22}
          clearcoat={0.78}
          clearcoatRoughness={0.28}
          transparent
          opacity={selected ? 0.16 : 0.88}
        />
      </mesh>

      {canEnter && (
        <mesh scale={0.52} raycast={() => null}>
          <sphereGeometry args={[body.r, 24, 14]} />
          <meshBasicMaterial color={glow} transparent opacity={0.14} wireframe />
        </mesh>
      )}

      <Html center distanceFactor={7.4} style={{ pointerEvents: 'none' }}>
        <div
          data-recursive-child={body.node.key}
          className={
            'whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold ' +
            'backdrop-blur-[2px] transition-opacity ' +
            (selected
              ? 'border-transparent bg-transparent text-stone-500/30 opacity-30'
              : hovered
                ? 'border-stone-500/60 bg-black/75 text-stone-50'
                : 'border-stone-700/65 bg-black/58 text-stone-100')
          }
        >
          {body.node.label}
          {canEnter ? <span className="ml-1 text-stone-500">···</span> : null}
        </div>
      </Html>
    </group>
  )
}
export function RecursiveMembraneWorld({
  parentPosition,
  path,
  depth,
  color,
  glow,
  onEnter,
  onLeaf,
}: RecursiveMembraneWorldProps) {
  const current = path[0]
  const selectedNext = path[1] ?? null
  const group = useRef<THREE.Group>(null)
  const membrane = useRef<THREE.Mesh>(null)
  const rim = useRef<THREE.Mesh>(null)
  const progress = useRef(0)
  const bodies = useMemo(() => buildChildren(current), [current.key])
  const selectedBody = selectedNext
    ? bodies.find((body) => body.node.key === selectedNext.key) ?? null
    : null
  const hasDeeperWorld = Boolean(selectedBody && path.length > 1)

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30)
    progress.current = THREE.MathUtils.lerp(progress.current, 1, 0.065)

    if (group.current) {
      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        parentPosition.x,
        0.12,
      )
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        parentPosition.y,
        0.12,
      )
      group.current.position.z = THREE.MathUtils.lerp(
        group.current.position.z,
        1.15,
        0.1,
      )
    }
    const membraneScale = THREE.MathUtils.lerp(0.18, 1, progress.current)
    if (membrane.current) {
      membrane.current.scale.x = THREE.MathUtils.lerp(
        membrane.current.scale.x,
        membraneScale,
        0.11,
      )
      membrane.current.scale.y = THREE.MathUtils.lerp(
        membrane.current.scale.y,
        membraneScale,
        0.11,
      )
      membrane.current.scale.z = THREE.MathUtils.lerp(
        membrane.current.scale.z,
        0.18,
        0.08,
      )
    }
    if (rim.current) {
      rim.current.scale.setScalar(
        THREE.MathUtils.lerp(rim.current.scale.x, membraneScale, 0.11),
      )
    }

    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i]
      const target = body.home.clone().multiplyScalar(progress.current)
      const force = target.sub(body.pos).multiplyScalar(5.8)
      body.vel.addScaledVector(force, dt)
      body.vel.multiplyScalar(Math.pow(0.91, dt * 60))
      body.pos.addScaledVector(body.vel, dt)

      for (let j = i + 1; j < bodies.length; j += 1) {
        const other = bodies[j]
        const delta = other.pos.clone().sub(body.pos)
        delta.z = 0
        const length = Math.max(delta.length(), 0.001)
        const minimum = body.r + other.r + 0.16
        if (length < minimum) {
          const push = delta.multiplyScalar((minimum - length) * 1.35 / length)
          body.vel.addScaledVector(push, -dt)
          other.vel.addScaledVector(push, dt)
        }
      }
    }
  })

  return (
    <group
      ref={group}
      position={[parentPosition.x, parentPosition.y, parentPosition.z]}
      userData={{ recursiveWorld: current.key, recursiveDepth: depth }}
    >
      <mesh ref={membrane} scale={[0.18, 0.18, 0.18]} raycast={() => null}>
        <sphereGeometry args={[MEMBRANE_R, 56, 28]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          roughness={0.3}
          clearcoat={0.66}
          clearcoatRoughness={0.34}
          transparent
          opacity={hasDeeperWorld ? 0.12 : 0.22}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={rim} scale={0.18} position={[0, 0, 0.18]} raycast={() => null}>
        <ringGeometry args={[MEMBRANE_R * 0.992, MEMBRANE_R * 1.012, 128]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={hasDeeperWorld ? 0.28 : 0.54}
          depthWrite={false}
        />
      </mesh>

      <Html position={[0, MEMBRANE_R * 0.72, 0.55]} center style={{ pointerEvents: 'none' }}>
        <div
          data-recursive-current={current.key}
          className={
            'whitespace-nowrap rounded-full border px-3 py-1.5 text-center backdrop-blur-md transition-opacity ' +
            (hasDeeperWorld
              ? 'border-stone-800/35 bg-black/35 opacity-55'
              : 'border-stone-700/45 bg-black/62 opacity-100')
          }
        >
          <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">
            depth {depth}
          </div>
          <div className="text-sm font-semibold text-stone-100">{current.label}</div>
        </div>
      </Html>

      {bodies.map((body) => (
        <RecursiveChild
          key={body.node.key}
          body={body}
          color={color}
          glow={glow}
          selected={selectedNext?.key === body.node.key}
          onEnter={onEnter}
          onLeaf={onLeaf}
        />
      ))}

      {selectedBody && path.length > 1 && (
        <RecursiveMembraneWorld
          parentPosition={selectedBody.pos}
          path={path.slice(1)}
          depth={depth + 1}
          color={color}
          glow={glow}
          onEnter={onEnter}
          onLeaf={onLeaf}
        />
      )}
    </group>
  )
}
