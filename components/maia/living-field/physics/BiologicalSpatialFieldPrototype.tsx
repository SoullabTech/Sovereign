'use client'

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  GROUP_BY_ID,
  GROUP_GEOMETRY,
  NODE_BY_ID,
  PHYSICS_GROUPS,
  PHYSICS_NODES,
  type PhysicsGroupKey,
} from './physicsFieldData'
import { R2C_RELATIONS, relationResolution } from './livingFieldRelationResolution'
import {
  fieldNodeForPhysicsNode,
  type FieldDatum,
} from '../livingFieldHierarchy'
import { RecursiveMembraneWorld } from './RecursiveMembraneWorld'
import { PlasmicInterstitialField } from './PlasmicInterstitialField'
import { recursivePathOffset } from './recursiveFieldLayout'
import {
  navigationPlanForFieldKey,
  resolveNavigationNodes,
} from './livingFieldNavigation'
import {
  buildRelationBundles,
  condensationModeForScale,
  type CondensationMode,
  type RelationBundle,
} from './livingFieldSemanticCondensation'

const SCALE = 50
const WORLD_R = 155 / SCALE

const STYLE: Record<PhysicsGroupKey, { body: string; glow: string }> = {
  fire: { body: '#9d4d1c', glow: '#f0a05a' },
  water: { body: '#205f74', glow: '#70bfd2' },
  earth: { body: '#66653a', glow: '#c2bd7a' },
  air: { body: '#555685', glow: '#b0afe2' },
  aether: { body: '#69435f', glow: '#c99abb' },
}

type Body = {
  id: string
  label: string
  group: PhysicsGroupKey
  r: number
  home: THREE.Vector3
  pos: THREE.Vector3
  vel: THREE.Vector3
  hovered: boolean
}

type RelationBody = {
  id: string
  source: string
  target: string
  rest: number
  stiffness: number
  kind: ReturnType<typeof relationResolution>['kind']
}

type DebugBridge = {
  snapshot: () => Record<string, { x: number; y: number; z: number; vx: number; vy: number }>
  impulse: (id: string, x: number, y: number) => void
  condensation: () => {
    mode: CondensationMode
    bridgeIds: string[]
    unresolvedBridgeIds: string[]
    relationIdsByBridge: Record<string, string[]>
    visibleSpecificRelationIds: string[]
  }
}

type RecursiveChildBody = {
  node: FieldDatum
  r: number
  home: THREE.Vector3
  pos: THREE.Vector3
  vel: THREE.Vector3
}

function scenePoint(x: number, y: number, z = 0.72) {
  return new THREE.Vector3((x - 500) / SCALE, -(y - 360) / SCALE, z)
}

function buildBodies() {
  const counts = new Map<PhysicsGroupKey, number>()
  const out = new Map<string, Body>()

  for (const node of PHYSICS_NODES) {
    const index = counts.get(node.group) ?? 0
    counts.set(node.group, index + 1)
    const group = GROUP_GEOMETRY[node.group]
    const angle = -Math.PI / 2 + index * Math.PI / 2
    const home = scenePoint(
      group.x + Math.cos(angle) * 72,
      group.y + Math.sin(angle) * 72,
    )
    out.set(node.id, {
      id: node.id,
      label: node.label,
      group: node.group,
      r: (node.label.length > 17 ? 30 : 27) / SCALE,
      home,
      pos: home.clone(),
      vel: new THREE.Vector3(),
      hovered: false,
    })
  }
  return out
}

function buildRelations(bodies: Map<string, Body>): RelationBody[] {
  return R2C_RELATIONS.flatMap((relation) => {
    const a = bodies.get(relation.source)
    const b = bodies.get(relation.target)
    if (!a || !b) return []
    const meta = relationResolution(relation)
    const distance = a.home.distanceTo(b.home)
    return [{
      id: relation.id,
      source: relation.source,
      target: relation.target,
      rest: meta.kind === 'tension' ? distance * 1.06 : distance,
      stiffness: meta.kind === 'resonance' ? 0.9 : meta.kind === 'tension' ? 0.5 : 0.7,
      kind: meta.kind,
    }]
  })
}

function CameraRig({
  focusBody,
  recursivePath,
  panRef,
  zoom,
}: {
  focusBody: Body | null
  recursivePath: FieldDatum[]
  panRef: React.MutableRefObject<THREE.Vector2>
  zoom: number
}) {
  const { camera, pointer } = useThree()
  const recursiveOffset = useMemo(
    () => recursivePathOffset(recursivePath),
    [recursivePath],
  )

  useFrame(() => {
    const baseX = focusBody ? focusBody.pos.x + recursiveOffset.x : 0
    const baseY = focusBody ? focusBody.pos.y + recursiveOffset.y : 0
    const targetX = baseX + panRef.current.x
    const targetY = baseY + panRef.current.y
    const parallaxX = pointer.x * (focusBody ? 0.08 : 0.38)
    const parallaxY = pointer.y * (focusBody ? 0.055 : 0.24)
    const targetZ = (focusBody ? 17.5 : 28) / zoom

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      targetX + parallaxX,
      0.055,
    )
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY + parallaxY,
      0.055,
    )
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.045)
    camera.lookAt(targetX, targetY, 0)
  })

  return null
}

function PanSurface({
  panRef,
  enabled,
}: {
  panRef: React.MutableRefObject<THREE.Vector2>
  enabled: boolean
}) {
  const { camera, size, viewport } = useThree()
  const panning = useRef(false)
  const target = useRef(new THREE.Vector3())

  return (
    <mesh
      position={[0, 0, -4.8]}
      onPointerDown={(event) => {
        if (!enabled) return
        event.stopPropagation()
        panning.current = true
        ;(event.target as Element).setPointerCapture?.(event.pointerId)
        document.body.style.cursor = 'grabbing'
      }}
      onPointerMove={(event) => {
        if (!enabled || !panning.current) return
        event.stopPropagation()

        target.current.set(camera.position.x, camera.position.y, 0)
        const visible = viewport.getCurrentViewport(camera, target.current)
        const unitsPerPixelX = visible.width / Math.max(size.width, 1)
        const unitsPerPixelY = visible.height / Math.max(size.height, 1)
        const native = event.nativeEvent

        panRef.current.x -= native.movementX * unitsPerPixelX
        panRef.current.y += native.movementY * unitsPerPixelY
      }}
      onPointerUp={(event) => {
        if (!panning.current) return
        event.stopPropagation()
        panning.current = false
        ;(event.target as Element).releasePointerCapture?.(event.pointerId)
        document.body.style.cursor = enabled ? 'grab' : 'default'
      }}
      onPointerCancel={() => {
        panning.current = false
        document.body.style.cursor = 'default'
      }}
      onPointerOver={() => {
        if (enabled && !panning.current) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        if (!panning.current) document.body.style.cursor = 'default'
      }}
    >
      <planeGeometry args={[90, 70]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function WorldMembrane({
  group,
  pressure,
}: {
  group: PhysicsGroupKey
  pressure: React.MutableRefObject<Record<PhysicsGroupKey, number>>
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const rim = useRef<THREE.Mesh>(null)
  const g = GROUP_GEOMETRY[group]
  const p = scenePoint(g.x, g.y, -0.9)
  const style = STYLE[group]
  const phase = PHYSICS_GROUPS.findIndex((item) => item.id === group) * 1.17

  useFrame(({ clock }) => {
    const breath = Math.sin(clock.elapsedTime * 0.37 + phase) * 0.012
    const load = pressure.current[group] ?? 0
    const target = 1 + breath + Math.min(0.05, load * 0.04)
    if (mesh.current) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.07)
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, target, 0.07)
      mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 0.15 + load * 0.025, 0.06)
    }
    if (rim.current) rim.current.scale.setScalar(THREE.MathUtils.lerp(rim.current.scale.x, target, 0.07))
  })

  return (
    <group>
      <mesh ref={mesh} position={p} scale={[1, 1, 0.15]}>
        <sphereGeometry args={[WORLD_R, 48, 24]} />
        <meshPhysicalMaterial
          color={style.body}
          emissive={style.body}
          emissiveIntensity={0.16}
          transparent
          opacity={0.2}
          roughness={0.34}
          clearcoat={0.55}
          clearcoatRoughness={0.42}
          depthWrite={false}
        />
      </mesh>

      <PlasmicInterstitialField
        radius={WORLD_R * 0.94}
        color={style.body}
        glow={style.glow}
        opacity={0.19}
        position={[p.x, p.y, -0.18]}
        flatten={0.12}
        phase={phase}
      />

      <mesh ref={rim} position={[p.x, p.y, -0.45]}>
        <ringGeometry args={[WORLD_R * 0.988, WORLD_R * 1.008, 96]} />
        <meshBasicMaterial color={style.glow} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <Html position={[p.x, p.y + WORLD_R * 0.73, 0.1]} center style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap text-center">
          <div className="text-sm font-semibold text-stone-300">{GROUP_BY_ID.get(group)?.label}</div>
          <div className="text-[9px] tracking-[0.04em] text-stone-600">{GROUP_BY_ID.get(group)?.essence}</div>
        </div>
      </Html>
    </group>
  )
}

function RelationLine({
  relation,
  bodies,
}: {
  relation: RelationBody
  bodies: Map<string, Body>
}) {
  const positions = useMemo(() => new Float32Array(15), [])
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])
  const color = relation.kind === 'tension'
    ? '#d6ad69'
    : relation.kind === 'resonance'
      ? '#9eb7c9'
      : '#8d8781'
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32, depthWrite: false }),
    [color],
  )
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  useFrame(() => {
    const a = bodies.get(relation.source)
    const b = bodies.get(relation.target)
    if (!a || !b) return

    const stretch = a.pos.distanceTo(b.pos) / Math.max(relation.rest, 0.001)
    const arch = 0.08 + Math.min(0.5, Math.abs(stretch - 1) * 0.72)

    for (let i = 0; i < 5; i += 1) {
      const t = i / 4
      positions[i * 3] = THREE.MathUtils.lerp(a.pos.x, b.pos.x, t)
      positions[i * 3 + 1] = THREE.MathUtils.lerp(a.pos.y, b.pos.y, t)
      positions[i * 3 + 2] =
        THREE.MathUtils.lerp(a.pos.z, b.pos.z, t) + Math.sin(Math.PI * t) * arch
    }

    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    attr.needsUpdate = true
    geometry.computeBoundingSphere()

    material.opacity = relation.kind === 'tension'
      ? 0.58
      : Math.min(0.58, 0.24 + Math.abs(stretch - 1) * 0.55)
  })

  return <primitive object={line} />
}

function CondensedRelationBridge({
  bundle,
  mode,
}: {
  bundle: RelationBundle
  mode: CondensationMode
}) {
  const geometries = useMemo(() => {
    const source = GROUP_GEOMETRY[bundle.sourceGroup]
    const target = GROUP_GEOMETRY[bundle.targetGroup]
    const start = scenePoint(source.x, source.y, -0.2)
    const end = scenePoint(target.x, target.y, -0.2)
    const midpoint = start.clone().lerp(end, 0.5)
    const control = midpoint.clone()
    control.z += 0.42 + Math.min(0.42, start.distanceTo(end) * 0.035)

    const curve = new THREE.QuadraticBezierCurve3(start, control, end)
    const radius =
      0.014 +
      Math.min(0.035, bundle.relationCount * (mode === 'bundle' ? 0.006 : 0.0045))

    return {
      core: new THREE.TubeGeometry(curve, 42, radius, 8, false),
      halo: new THREE.TubeGeometry(curve, 42, radius * 2.35, 8, false),
    }
  }, [
    bundle.relationCount,
    bundle.sourceGroup,
    bundle.targetGroup,
    mode,
  ])

  const midpoint = useMemo(() => {
    const source = GROUP_GEOMETRY[bundle.sourceGroup]
    const target = GROUP_GEOMETRY[bundle.targetGroup]
    return scenePoint(
      (source.x + target.x) / 2,
      (source.y + target.y) / 2,
      0.48,
    )
  }, [bundle.sourceGroup, bundle.targetGroup])

  useEffect(() => () => {
    geometries.core.dispose()
    geometries.halo.dispose()
  }, [geometries])

  const color = bundle.unresolved ? '#c59b60' : '#887b69'
  const opacity =
    mode === 'pattern' ? 0.13 :
    mode === 'bridge' ? 0.22 :
    0.3

  const showLabel =
    bundle.unresolved ||
    (mode === 'bundle' && bundle.relationCount > 1)

  return (
    <group>
      <mesh geometry={geometries.halo} raycast={() => null}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh geometry={geometries.core} raycast={() => null}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh position={midpoint} raycast={() => null}>
        <sphereGeometry args={[
          0.035 + Math.min(0.055, bundle.relationCount * 0.012),
          20,
          12,
        ]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={bundle.unresolved ? 0.28 : 0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {showLabel ? (
        <Html position={midpoint} center style={{ pointerEvents: 'none' }}>
          <div
            data-condensed-bridge-label={bundle.id}
            className={
              'translate-y-[-15px] whitespace-nowrap rounded-full border bg-black/55 px-1.5 py-0.5 text-[8px] backdrop-blur-md ' +
              (bundle.unresolved
                ? 'border-amber-800/35 text-amber-300/75'
                : 'border-stone-800/55 text-stone-600')
            }
          >
            ×{bundle.relationCount}
            {bundle.unresolved ? ' · tension held' : ''}
          </div>
        </Html>
      ) : null}
    </group>
  )
}

function relationCrossesWorlds(relation: RelationBody) {
  const source = NODE_BY_ID.get(relation.source)
  const target = NODE_BY_ID.get(relation.target)
  return Boolean(source && target && source.group !== target.group)
}

function Cell({
  body,
  activeId,
  draggingId,
  entered,
  canEnter,
  semanticMode,
  setActiveId,
  setDraggingId,
  onEnter,
}: {
  body: Body
  activeId: string | null
  draggingId: string | null
  entered: boolean
  canEnter: boolean
  semanticMode: CondensationMode
  setActiveId: (id: string | null) => void
  setDraggingId: (id: string | null) => void
  onEnter: (id: string) => void
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const corona = useRef<THREE.Mesh>(null)
  const style = STYLE[body.group]
  const active = activeId === body.id
  const dragging = draggingId === body.id
  const patternQuiet = semanticMode === 'pattern' && !active

  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.position.copy(body.pos)

    const breath = 1 + Math.sin(clock.elapsedTime * 1.05 + body.home.x * 0.7) * 0.025

    if (halo.current) {
      halo.current.position.copy(body.pos)
      const target = (
        entered ? 1.48 :
        dragging ? 1.36 :
        active || body.hovered ? 1.16 :
        1
      ) * breath

      halo.current.scale.setScalar(
        THREE.MathUtils.lerp(halo.current.scale.x, target, 0.095),
      )
      const mat = halo.current.material as THREE.MeshBasicMaterial
      const opacity =
        entered ? 0.2 :
        dragging ? 0.3 :
        active || body.hovered ? 0.17 :
        patternQuiet ? 0.028 :
        0.075

      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opacity, 0.09)
    }

    if (corona.current) {
      corona.current.position.copy(body.pos)
      const target = (
        entered ? 1.28 :
        dragging ? 1.18 :
        active || body.hovered ? 1.1 :
        1
      ) * (1 + Math.sin(clock.elapsedTime * 0.72 + body.home.y * 0.6) * 0.035)

      corona.current.scale.setScalar(
        THREE.MathUtils.lerp(corona.current.scale.x, target, 0.065),
      )
      const mat = corona.current.material as THREE.MeshBasicMaterial
      const opacity =
        entered ? 0.085 :
        dragging ? 0.11 :
        active || body.hovered ? 0.075 :
        patternQuiet ? 0.012 :
        0.032

      mat.opacity = THREE.MathUtils.lerp(mat.opacity, opacity, 0.06)
    }
  })

  const activate = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    body.hovered = true
    setActiveId(body.id)
  }

  return (
    <group data-recursive-ready={body.id}>
      <mesh ref={corona} position={body.pos} raycast={() => null} renderOrder={-0.5}>
        <sphereGeometry args={[body.r * 1.82, 32, 20]} />
        <meshBasicMaterial
          color={style.glow}
          transparent
          opacity={0.032}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={halo} position={body.pos} raycast={() => null}>
        <sphereGeometry args={[body.r * 1.38, 32, 20]} />
        <meshBasicMaterial
          color={style.glow}
          transparent
          opacity={0.075}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={mesh}
        position={body.pos}
        onPointerOver={(event) => {
          activate(event)
          document.body.style.cursor = dragging ? 'grabbing' : 'grab'
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          if (!dragging) body.hovered = false
          document.body.style.cursor = 'default'
        }}
        onPointerDown={(event) => {
          activate(event)
          setDraggingId(body.id)
          document.body.style.cursor = 'grabbing'
        }}
        onPointerUp={(event) => {
          event.stopPropagation()
          setDraggingId(null)
          document.body.style.cursor = canEnter ? 'zoom-in' : 'grab'
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (canEnter) onEnter(body.id)
        }}
      >
        <sphereGeometry args={[body.r, 36, 22]} />
        <meshPhysicalMaterial
          color={style.body}
          emissive={style.body}
          emissiveIntensity={entered ? 0.7 : active ? 0.52 : patternQuiet ? 0.12 : 0.25}
          roughness={0.24}
          clearcoat={0.72}
          clearcoatRoughness={0.34}
          transparent
          opacity={patternQuiet ? 0.34 : 0.8}
        />
      </mesh>

      {active && (
        <group position={body.pos} raycast={() => null}>
          <mesh scale={0.56}>
            <sphereGeometry args={[body.r, 28, 18]} />
            <meshBasicMaterial color={style.glow} transparent opacity={0.06} wireframe />
          </mesh>
          <mesh position={[body.r * 0.22, -body.r * 0.08, body.r * 0.16]} scale={0.14}>
            <sphereGeometry args={[body.r, 20, 12]} />
            <meshBasicMaterial color={style.glow} transparent opacity={0.22} />
          </mesh>
          <mesh position={[-body.r * 0.18, body.r * 0.12, body.r * 0.1]} scale={0.11}>
            <sphereGeometry args={[body.r, 20, 12]} />
            <meshBasicMaterial color={style.glow} transparent opacity={0.18} />
          </mesh>
        </group>
      )}

      <Html position={body.pos} center distanceFactor={7.2} style={{ pointerEvents: 'none' }}>
        <div
          data-bio-node-label={body.id}
          data-semantic-visibility={patternQuiet ? 'latent' : 'visible'}
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] backdrop-blur-[2px] transition-all ${
            active
              ? 'border-stone-500/50 bg-black/72 text-stone-50 shadow-[0_0_18px_rgba(255,255,255,0.08)]'
              : patternQuiet
                ? 'border-transparent bg-transparent text-transparent opacity-0'
                : 'border-stone-800/45 bg-black/42 text-stone-300'
          }`}
        >
          {body.label}
          {canEnter ? <span className="ml-1 text-stone-500">···</span> : null}
        </div>
      </Html>
    </group>
  )
}

function Physics({
  bodies,
  relations,
  draggingId,
  enteredId,
  pressure,
}: {
  bodies: Map<string, Body>
  relations: RelationBody[]
  draggingId: string | null
  enteredId: string | null
  pressure: React.MutableRefObject<Record<PhysicsGroupKey, number>>
}) {
  const { pointer, camera, raycaster } = useThree()
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.9))
  const dragPoint = useRef(new THREE.Vector3())

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    const list = [...bodies.values()]
    const forces = new Map<string, THREE.Vector3>()
    for (const body of list) forces.set(body.id, new THREE.Vector3())

    if (draggingId) {
      raycaster.setFromCamera(pointer, camera)
      raycaster.ray.intersectPlane(dragPlane.current, dragPoint.current)
    }

    for (const relation of relations) {
      const a = bodies.get(relation.source)
      const b = bodies.get(relation.target)
      if (!a || !b) continue
      const delta = b.pos.clone().sub(a.pos)
      const len = Math.max(delta.length(), 0.001)
      const spring = delta.multiplyScalar(1 / len).multiplyScalar((len - relation.rest) * relation.stiffness)
      forces.get(a.id)?.add(spring)
      forces.get(b.id)?.sub(spring)
    }

    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i]
        const b = list[j]
        if (a.group !== b.group) continue
        const delta = b.pos.clone().sub(a.pos)
        delta.z = 0
        const len = Math.max(delta.length(), 0.001)
        const min = a.r + b.r + 0.16
        if (len < min) {
          const push = delta.multiplyScalar((min - len) * 1.7 / len)
          forces.get(a.id)?.addScaledVector(push, -1)
          forces.get(b.id)?.add(push)
        }
      }
    }

    const nextPressure: Record<PhysicsGroupKey, number> = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0,
    }

    const entered = enteredId ? bodies.get(enteredId) ?? null : null

    if (entered) {
      for (const body of list) {
        if (body.id === entered.id) continue
        const delta = body.pos.clone().sub(entered.pos)
        delta.z = 0
        const distance = Math.max(delta.length(), 0.001)
        const clearance = 4.7
        if (distance < clearance) {
          const oilDisplacement = delta
            .multiplyScalar(1 / distance)
            .multiplyScalar((clearance - distance) * 0.24)
          forces.get(body.id)?.add(oilDisplacement)
          forces.get(entered.id)?.addScaledVector(oilDisplacement, -0.08)
        }
      }
    }

    for (const body of list) {
      const force = forces.get(body.id) ?? new THREE.Vector3()
      const dragging = draggingId === body.id && enteredId !== body.id
      const group = GROUP_GEOMETRY[body.group]
      const center = scenePoint(group.x, group.y, body.pos.z)
      const radial = body.pos.clone().sub(center)
      radial.z = 0
      const radialLen = radial.length()
      const maxRadius = WORLD_R - body.r - 0.14

      const anchorStrength = enteredId === body.id ? 2.4 : dragging ? 0.34 : 1.12
      force.add(body.home.clone().sub(body.pos).multiplyScalar(anchorStrength))

      if (dragging) {
        force.add(
          new THREE.Vector3(dragPoint.current.x, dragPoint.current.y, 2.0)
            .sub(body.pos)
            .multiplyScalar(8.4),
        )
      }

      if (radialLen > maxRadius) {
        const overflow = radialLen - maxRadius
        force.add(radial.normalize().multiplyScalar(-overflow * 18))
      }

      const load = Math.max(
        dragging ? 0.36 : 0,
        Math.max(0, radialLen / Math.max(maxRadius, 0.001) - 0.7),
      )
      nextPressure[body.group] = Math.max(nextPressure[body.group], load)

      const targetZ = dragging ? 2.0 : body.hovered ? 1.28 : 0.72
      force.z += (targetZ - body.pos.z) * (dragging ? 11 : 5)

      body.vel.addScaledVector(force, dt)
      body.vel.multiplyScalar(Math.pow(dragging ? 0.885 : 0.938, dt * 60))
      body.pos.addScaledVector(body.vel, dt)
    }

    pressure.current = nextPressure
  })

  return null
}

function Scene({
  activeId,
  draggingId,
  recursiveRootId,
  recursivePath,
  panRef,
  zoom,
  setActiveId,
  setDraggingId,
  onEnterRoot,
  onEnterChild,
  onLeaf,
}: {
  activeId: string | null
  draggingId: string | null
  recursiveRootId: string | null
  recursivePath: FieldDatum[]
  panRef: React.MutableRefObject<THREE.Vector2>
  zoom: number
  setActiveId: (id: string | null) => void
  setDraggingId: (id: string | null) => void
  onEnterRoot: (id: string) => void
  onEnterChild: (node: FieldDatum) => void
  onLeaf: (node: FieldDatum) => void
}) {
  const bodies = useMemo(() => buildBodies(), [])
  const relations = useMemo(() => buildRelations(bodies), [bodies])
  const relationBundles = useMemo(() => buildRelationBundles(), [])
  const condensationMode = condensationModeForScale(zoom)
  const pressure = useRef<Record<PhysicsGroupKey, number>>({
    fire: 0, water: 0, earth: 0, air: 0, aether: 0,
  })
  const recursiveRoot = recursiveRootId ? bodies.get(recursiveRootId) ?? null : null

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const w = window as Window & { __soullabBiology?: DebugBridge }
    w.__soullabBiology = {
      snapshot: () => Object.fromEntries(
        [...bodies.entries()].map(([id, body]) => [id, {
          x: body.pos.x,
          y: body.pos.y,
          z: body.pos.z,
          vx: body.vel.x,
          vy: body.vel.y,
        }]),
      ),
      impulse: (id, x, y) => {
        const body = bodies.get(id)
        if (!body) return
        body.vel.x += x
        body.vel.y += y
      },
      condensation: () => ({
        mode: condensationMode,
        bridgeIds: relationBundles.map((bundle) => bundle.id),
        unresolvedBridgeIds: relationBundles
          .filter((bundle) => bundle.unresolved)
          .map((bundle) => bundle.id),
        relationIdsByBridge: Object.fromEntries(
          relationBundles.map((bundle) => [bundle.id, bundle.relationIds]),
        ),
        visibleSpecificRelationIds: relations
          .filter((relation) =>
            condensationMode !== 'pattern' &&
            (!relationCrossesWorlds(relation) || condensationMode === 'specific'),
          )
          .map((relation) => relation.id),
      }),
    }
    return () => {
      delete w.__soullabBiology
    }
  }, [bodies, condensationMode, relationBundles])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 28]} fov={42} />
      <CameraRig
        focusBody={recursiveRoot}
        recursivePath={recursivePath}
        panRef={panRef}
        zoom={zoom}
      />
      <PanSurface panRef={panRef} enabled={draggingId === null} />
      <ambientLight intensity={0.88} />
      <directionalLight position={[-8, 10, 16]} intensity={1.3} color="#f4e8d8" />
      <pointLight position={[7, -4, 10]} intensity={32} distance={28} color="#cf9e68" />

      <Physics
        bodies={bodies}
        relations={relations}
        draggingId={draggingId}
        enteredId={recursiveRootId}
        pressure={pressure}
      />

      {PHYSICS_GROUPS.map((group) => (
        <WorldMembrane key={group.id} group={group.id} pressure={pressure} />
      ))}

      {relations
        .filter((relation) =>
          condensationMode !== 'pattern' &&
          (!relationCrossesWorlds(relation) || condensationMode === 'specific'),
        )
        .map((relation) => (
          <RelationLine key={relation.id} relation={relation} bodies={bodies} />
        ))}

      {condensationMode !== 'specific'
        ? relationBundles.map((bundle) => (
            <CondensedRelationBridge
              key={bundle.id}
              bundle={bundle}
              mode={condensationMode}
            />
          ))
        : null}

      {[...bodies.values()].map((body) => {
        const fieldNode = fieldNodeForPhysicsNode(body.id)
        return (
          <Cell
            key={body.id}
            body={body}
            activeId={activeId}
            draggingId={draggingId}
            entered={recursiveRootId === body.id}
            canEnter={Boolean(fieldNode?.children?.length)}
            semanticMode={condensationMode}
            setActiveId={setActiveId}
            setDraggingId={setDraggingId}
            onEnter={onEnterRoot}
          />
        )
      })}

      {recursiveRoot && recursivePath.length > 0 && (
        <RecursiveMembraneWorld
          parentPosition={recursiveRoot.pos}
          path={recursivePath}
          depth={1}
          color={STYLE[recursiveRoot.group].body}
          glow={STYLE[recursiveRoot.group].glow}
          onEnter={onEnterChild}
          onLeaf={onLeaf}
        />
      )}
    </>
  )
}

export type BiologicalFieldSemanticState = {
  selectedKey: string | null
  recursivePathKeys: string[]
}

export type BiologicalFieldNavigationRequest = {
  key: string
  token: number
}

export function BiologicalSpatialFieldPrototype({
  embedded = false,
  navigationRequest = null,
  onSemanticStateChange,
}: {
  embedded?: boolean
  navigationRequest?: BiologicalFieldNavigationRequest | null
  onSemanticStateChange?: (state: BiologicalFieldSemanticState) => void
} = {}) {
  const [activeId, setActiveId] = useState<string | null>('calling')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [recursiveRootId, setRecursiveRootId] = useState<string | null>(null)
  const [recursivePath, setRecursivePath] = useState<FieldDatum[]>([])
  const [recursiveLeaf, setRecursiveLeaf] = useState<FieldDatum | null>(null)
  const wholeZoom = embedded ? 1.32 : 1
  const [zoom, setZoom] = useState(wholeZoom)
  const panRef = useRef(new THREE.Vector2())
  const semanticScaleIntentRef = useRef({ amount: 0, lastAt: 0 })

  const active = activeId ? NODE_BY_ID.get(activeId) ?? null : null
  const activeFieldNode = activeId ? fieldNodeForPhysicsNode(activeId) : null
  const recursiveCurrent = recursivePath[recursivePath.length - 1] ?? null
  const selectedSemanticKey =
    recursiveLeaf?.key ??
    recursiveCurrent?.key ??
    activeFieldNode?.key ??
    null

  useEffect(() => {
    onSemanticStateChange?.({
      selectedKey: selectedSemanticKey,
      recursivePathKeys: recursivePath.map((node) => node.key),
    })
  }, [onSemanticStateChange, recursivePath, selectedSemanticKey])

  useEffect(() => {
    if (!navigationRequest) return

    const plan = navigationPlanForFieldKey(navigationRequest.key)
    if (!plan) return

    const resolved = resolveNavigationNodes(plan)

    setDraggingId(null)
    panRef.current.set(0, 0)
    setActiveId(plan.rootPhysicsNodeId)

    if (resolved.recursivePath.length > 0) {
      setZoom(1.05)
      setRecursiveRootId(plan.rootPhysicsNodeId)
      setRecursivePath(resolved.recursivePath)
      setRecursiveLeaf(resolved.leaf)
      return
    }

    setZoom(1.12)
    setRecursiveRootId(null)
    setRecursivePath([])
    setRecursiveLeaf(resolved.leaf)
  }, [navigationRequest?.token])

  const resetSemanticScaleIntent = () => {
    semanticScaleIntentRef.current.amount = 0
    semanticScaleIntentRef.current.lastAt = 0
  }

  const enterRoot = (id: string) => {
    resetSemanticScaleIntent()
    const node = fieldNodeForPhysicsNode(id)
    if (!node?.children?.length) return
    setActiveId(id)
    setDraggingId(null)
    panRef.current.set(0, 0)
    setZoom(1.05)
    setRecursiveRootId(id)
    setRecursivePath([node])
    setRecursiveLeaf(null)
  }

  const enterChild = (node: FieldDatum) => {
    resetSemanticScaleIntent()
    if (!node.children?.length) return
    panRef.current.set(0, 0)
    setZoom(1.05)
    setRecursivePath((path) => [...path, node])
    setRecursiveLeaf(null)
  }

  const widen = () => {
    resetSemanticScaleIntent()
    panRef.current.set(0, 0)
    setRecursiveLeaf(null)
    setRecursivePath((path) => {
      if (path.length > 1) {
        setZoom(1.05)
        return path.slice(0, -1)
      }
      setRecursiveRootId(null)
      setZoom(wholeZoom)
      return []
    })
  }

  const centerView = () => {
    panRef.current.set(0, 0)
  }

  const whole = () => {
    resetSemanticScaleIntent()
    panRef.current.set(0, 0)
    setRecursiveLeaf(null)
    setRecursivePath([])
    setRecursiveRootId(null)
    setZoom(wholeZoom)
  }

  return (
    <section
      className={
        embedded
          ? 'h-full overflow-hidden bg-[#080909]'
          : 'overflow-hidden rounded-[32px] border border-stone-800 bg-[#080909]'
      }
    >
      {!embedded && (
        <header className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">Living Field · R2D2</p>
          <h2 className="mt-1 text-2xl font-light text-stone-100">Touch a bubble. Let the world inside it open.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Drag still has the same viscous physics. Click a bubble marked ··· to enter it. The membrane yields, the surrounding field makes room, and its actual inner ecology emerges without leaving the field.
          </p>
        </header>
      )}

      <div
        className={
          embedded
            ? 'relative h-full min-h-[640px] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_46%,rgba(68,52,37,0.17),rgba(9,8,7,0.98)_66%)]'
            : 'relative h-[760px] min-h-[620px] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_46%,rgba(56,49,43,0.22),rgba(8,9,9,0.96)_64%)]'
        }
        onPointerUp={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
        onWheel={(event) => {
          const factor = Math.exp(-event.deltaY * 0.0011)
          const nextZoom = THREE.MathUtils.clamp(zoom * factor, 0.78, 1.7)
          setZoom(nextZoom)

          if (recursivePath.length === 0) {
            resetSemanticScaleIntent()
            return
          }

          const now = performance.now()
          const intent = semanticScaleIntentRef.current
          const outward = event.deltaY > 4
          const nearSemanticBoundary = nextZoom <= 0.88

          if (!outward || !nearSemanticBoundary) {
            if (now - intent.lastAt > 260 || event.deltaY < -4) {
              resetSemanticScaleIntent()
            }
            return
          }

          if (now - intent.lastAt > 420) {
            intent.amount = 0
          }

          intent.lastAt = now
          intent.amount += Math.min(Math.abs(event.deltaY), 72)

          if (intent.amount >= 190) {
            widen()
          }
        }}
      >
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setActiveId(null)}
        >
          <Scene
            activeId={activeId}
            draggingId={draggingId}
            recursiveRootId={recursiveRootId}
            recursivePath={recursivePath}
            panRef={panRef}
            zoom={zoom}
            setActiveId={setActiveId}
            setDraggingId={setDraggingId}
            onEnterRoot={enterRoot}
            onEnterChild={enterChild}
            onLeaf={setRecursiveLeaf}
          />
        </Canvas>

        {!embedded && (
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-stone-800/80 bg-black/45 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
            {recursiveCurrent ? `depth ${recursivePath.length}` : active ? GROUP_BY_ID.get(active.group)?.label : 'Living Field'}
          </p>
          <p className="mt-1 text-sm text-stone-200">
            {recursiveLeaf?.label ?? recursiveCurrent?.label ?? active?.label ?? 'Move through the field'}
          </p>
          <p className="mt-1 max-w-[350px] text-xs leading-5 text-stone-500">
            {recursiveLeaf?.inquiry ?? recursiveCurrent?.inquiry ?? active?.essence ?? 'Each cell remains part of the larger ecology at every scale.'}
          </p>
        </div>
        )}

        {!embedded && recursivePath.length > 0 && (
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-800/80 bg-black/55 px-2 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={widen}
              className="rounded-full px-3 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800/70 hover:text-stone-50"
            >
              Wider
            </button>
            <div className="max-w-[420px] truncate px-2 text-[11px] text-stone-600">
              {recursivePath.map((node) => node.label).join(' · ')}
            </div>
            <button
              type="button"
              onClick={whole}
              className="rounded-full px-3 py-1.5 text-xs text-stone-300 transition hover:bg-stone-800/70 hover:text-stone-50"
            >
              Whole
            </button>
          </div>
        )}

        {!embedded && (
          <div className="pointer-events-none absolute right-4 top-4 max-w-[295px] rounded-2xl border border-stone-800/70 bg-black/38 px-4 py-3 text-xs leading-5 text-stone-600 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">Scale physics</p>
            <p className="mt-2">Click → membrane yield → viscous expansion → inner ecology → settle.</p>
            <p className="mt-2 text-stone-700">Scroll / pinch inward magnifies. Pull outward far enough and the current membrane returns into its parent — like lowering magnification on a microscope. Wider remains a fallback; Whole restores the ecology.</p>
          </div>
        )}

        {embedded && (
          <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[rgba(217,187,142,.3)] bg-[rgba(14,11,9,.92)] px-2.5 py-2 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setZoom((value) => THREE.MathUtils.clamp(value / 1.14, 0.78, 1.7))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#9f8c73] transition hover:bg-[rgba(203,169,116,.08)] hover:text-[#ead9bf]"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[54px] text-center text-[11px] tabular-nums text-[#7e6f5d]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((value) => THREE.MathUtils.clamp(value * 1.14, 0.78, 1.7))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#9f8c73] transition hover:bg-[rgba(203,169,116,.08)] hover:text-[#ead9bf]"
              aria-label="Zoom in"
            >
              +
            </button>
            <div className="mx-1 h-4 w-px bg-[rgba(217,187,142,.16)]" />
            <button
              type="button"
              onClick={centerView}
              className="rounded-full px-3 py-1.5 text-xs text-[#9f8c73] transition hover:bg-[rgba(203,169,116,.08)] hover:text-[#ead9bf]"
            >
              Center
            </button>
            {recursivePath.length > 0 && (
              <button
                type="button"
                onClick={widen}
                className="rounded-full px-3 py-1.5 text-xs text-[#9f8c73] transition hover:bg-[rgba(203,169,116,.08)] hover:text-[#ead9bf]"
              >
                Wider
              </button>
            )}
            <button
              type="button"
              onClick={whole}
              className="rounded-full px-3 py-1.5 text-xs text-[#c7b59c] transition hover:bg-[rgba(203,169,116,.08)] hover:text-[#f0e3d0]"
            >
              Whole
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
