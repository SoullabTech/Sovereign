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

function Parallax() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.38, 0.035)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.24, 0.035)
    camera.lookAt(0, 0, 0)
  })
  return null
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

function Cell({
  body,
  activeId,
  draggingId,
  setActiveId,
  setDraggingId,
}: {
  body: Body
  activeId: string | null
  draggingId: string | null
  setActiveId: (id: string | null) => void
  setDraggingId: (id: string | null) => void
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const style = STYLE[body.group]
  const active = activeId === body.id
  const dragging = draggingId === body.id

  useFrame(() => {
    if (mesh.current) mesh.current.position.copy(body.pos)
    if (halo.current) {
      halo.current.position.copy(body.pos)
      const target = dragging ? 1.34 : active || body.hovered ? 1.13 : 0.94
      halo.current.scale.setScalar(THREE.MathUtils.lerp(halo.current.scale.x, target, 0.11))
      const mat = halo.current.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, dragging ? 0.34 : active ? 0.18 : 0.04, 0.1)
    }
  })

  const activate = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    body.hovered = true
    setActiveId(body.id)
  }

  return (
    <group data-recursive-ready={body.id}>
      <mesh ref={halo} position={body.pos} scale={0.94} raycast={() => null}>
        <sphereGeometry args={[body.r * 1.3, 28, 18]} />
        <meshBasicMaterial color={style.glow} transparent opacity={0.04} depthWrite={false} />
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
          document.body.style.cursor = 'grab'
        }}
      >
        <sphereGeometry args={[body.r, 36, 22]} />
        <meshPhysicalMaterial
          color={style.body}
          emissive={style.body}
          emissiveIntensity={active ? 0.52 : 0.25}
          roughness={0.24}
          clearcoat={0.72}
          clearcoatRoughness={0.34}
          transparent
          opacity={0.8}
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
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] backdrop-blur-[2px] transition-all ${
            active
              ? 'border-stone-500/50 bg-black/72 text-stone-50 shadow-[0_0_18px_rgba(255,255,255,0.08)]'
              : 'border-stone-800/45 bg-black/42 text-stone-300'
          }`}
        >
          {body.label}
        </div>
      </Html>
    </group>
  )
}

function Physics({
  bodies,
  relations,
  draggingId,
  pressure,
}: {
  bodies: Map<string, Body>
  relations: RelationBody[]
  draggingId: string | null
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

    for (const body of list) {
      const force = forces.get(body.id) ?? new THREE.Vector3()
      const dragging = draggingId === body.id
      const group = GROUP_GEOMETRY[body.group]
      const center = scenePoint(group.x, group.y, body.pos.z)
      const radial = body.pos.clone().sub(center)
      radial.z = 0
      const radialLen = radial.length()
      const maxRadius = WORLD_R - body.r - 0.14

      force.add(body.home.clone().sub(body.pos).multiplyScalar(dragging ? 0.34 : 1.12))

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
  setActiveId,
  setDraggingId,
}: {
  activeId: string | null
  draggingId: string | null
  setActiveId: (id: string | null) => void
  setDraggingId: (id: string | null) => void
}) {
  const bodies = useMemo(() => buildBodies(), [])
  const relations = useMemo(() => buildRelations(bodies), [bodies])
  const pressure = useRef<Record<PhysicsGroupKey, number>>({
    fire: 0, water: 0, earth: 0, air: 0, aether: 0,
  })

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
    }
    return () => {
      delete w.__soullabBiology
    }
  }, [bodies])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 28]} fov={42} />
      <Parallax />
      <ambientLight intensity={0.88} />
      <directionalLight position={[-8, 10, 16]} intensity={1.3} color="#f4e8d8" />
      <pointLight position={[7, -4, 10]} intensity={32} distance={28} color="#cf9e68" />

      <Physics bodies={bodies} relations={relations} draggingId={draggingId} pressure={pressure} />

      {PHYSICS_GROUPS.map((group) => (
        <WorldMembrane key={group.id} group={group.id} pressure={pressure} />
      ))}

      {relations.map((relation) => (
        <RelationLine key={relation.id} relation={relation} bodies={bodies} />
      ))}

      {[...bodies.values()].map((body) => (
        <Cell
          key={body.id}
          body={body}
          activeId={activeId}
          draggingId={draggingId}
          setActiveId={setActiveId}
          setDraggingId={setDraggingId}
        />
      ))}
    </>
  )
}

export function BiologicalSpatialFieldPrototype() {
  const [activeId, setActiveId] = useState<string | null>('calling')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const active = activeId ? NODE_BY_ID.get(activeId) ?? null : null

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-800 bg-[#080909]">
      <header className="border-b border-stone-800/80 px-5 py-4 sm:px-6">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">Living Field · R2D1</p>
        <h2 className="mt-1 text-2xl font-light text-stone-100">Touch the field and feel it answer.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
          Drag a cell slowly, then release it. Related cells should yield, relations stretch, the membrane carries pressure, and the field recoils and settles.
        </p>
      </header>

      <div
        className="relative h-[760px] min-h-[620px] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_46%,rgba(56,49,43,0.22),rgba(8,9,9,0.96)_64%)]"
        onPointerUp={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
      >
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setActiveId(null)}
        >
          <Scene
            activeId={activeId}
            draggingId={draggingId}
            setActiveId={setActiveId}
            setDraggingId={setDraggingId}
          />
        </Canvas>

        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-stone-800/80 bg-black/45 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">
            {active ? GROUP_BY_ID.get(active.group)?.label : 'Living Field'}
          </p>
          <p className="mt-1 text-sm text-stone-300">{active?.label ?? 'Move through the field'}</p>
          <p className="mt-1 max-w-[310px] text-xs leading-5 text-stone-600">
            {active?.essence ?? 'Each cell stays part of a larger ecology and is physically ready to become a containing world at deeper scale.'}
          </p>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 max-w-[285px] rounded-2xl border border-stone-800/70 bg-black/38 px-4 py-3 text-xs leading-5 text-stone-600 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">Physical witness</p>
          <p className="mt-2">Approach → adhesion → pull → resistance → displacement → release → recoil → settling.</p>
          <p className="mt-2 text-stone-700">Active cells reveal only latent inner membrane structure. Actual recursive child meaning remains governed by R2G.</p>
        </div>
      </div>
    </section>
  )
}
