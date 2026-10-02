'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Force,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import {
  GROUP_BY_ID,
  GROUP_GEOMETRY,
  NODE_BY_ID,
  PHYSICS_GROUPS,
  PHYSICS_NODES,
  PHYSICS_RELATIONS,
  relatedNodeIds,
  relatedRelations,
  type PhysicsNodeDatum,
  type PhysicsRelation,
} from './physicsFieldData'

type SimNode = SimulationNodeDatum &
  PhysicsNodeDatum & {
    r: number
    anchorX: number
    anchorY: number
  }

type SimLink = SimulationLinkDatum<SimNode> & {
  relation: PhysicsRelation
}

const WIDTH = 1000
const HEIGHT = 720

function makeNodes(): SimNode[] {
  const groupCounts = new Map<string, number>()

  return PHYSICS_NODES.map((datum) => {
    const groupIndex = groupCounts.get(datum.group) ?? 0
    groupCounts.set(datum.group, groupIndex + 1)

    const group = GROUP_GEOMETRY[datum.group]
    const angle = (-Math.PI / 2) + groupIndex * (Math.PI * 2 / 4)
    const anchorDistance = 72

    return {
      ...datum,
      r: datum.label.length > 17 ? 31 : 27,
      x: group.x + Math.cos(angle) * anchorDistance,
      y: group.y + Math.sin(angle) * anchorDistance,
      anchorX: group.x + Math.cos(angle) * anchorDistance,
      anchorY: group.y + Math.sin(angle) * anchorDistance,
    }
  })
}

function makeLinks(): SimLink[] {
  return PHYSICS_RELATIONS.map((relation) => ({
    source: relation.source,
    target: relation.target,
    relation,
  }))
}

function circularContainment(): Force<SimNode, undefined> {
  let nodes: SimNode[] = []

  const force = ((alpha: number) => {
    for (const node of nodes) {
      const group = GROUP_GEOMETRY[node.group]
      const dx = (node.x ?? group.x) - group.x
      const dy = (node.y ?? group.y) - group.y
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      const maxDistance = group.r - node.r - 10

      if (distance > maxDistance) {
        const overflow = distance - maxDistance
        const pull = overflow * 0.22 * alpha
        node.vx = (node.vx ?? 0) - (dx / distance) * pull
        node.vy = (node.vy ?? 0) - (dy / distance) * pull
      }
    }
  }) as Force<SimNode, undefined>

  force.initialize = (next: SimNode[]) => {
    nodes = next
  }

  return force
}

function endpointId(endpoint: string | number | SimNode) {
  return typeof endpoint === 'object' ? endpoint.id : String(endpoint)
}

export function D3HybridPhysicsPrototype() {
  const [nodes] = useState<SimNode[]>(() => makeNodes())
  const [links] = useState<SimLink[]>(() => makeLinks())
  const [, setFrame] = useState(0)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('calling')
  const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const draggingRef = useRef<string | null>(null)

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const activeNodeId = hoveredNodeId ?? selectedNodeId
  const activeNeighborhood = activeNodeId ? relatedNodeIds(activeNodeId) : null
  const activeNode = activeNodeId ? NODE_BY_ID.get(activeNodeId) ?? null : null
  const activeRelations = activeNodeId
    ? relatedRelations(activeNodeId).sort((a, b) => b.strength - a.strength).slice(0, 4)
    : []
  const hoveredRelation = hoveredRelationId
    ? PHYSICS_RELATIONS.find((relation) => relation.id === hoveredRelationId) ?? null
    : null

  useEffect(() => {
    const simulation = forceSimulation<SimNode>(nodes)
      .alpha(0.9)
      .alphaDecay(0.045)
      .velocityDecay(0.34)
      .force('charge', forceManyBody<SimNode>().strength(-115).distanceMax(210))
      .force('collision', forceCollide<SimNode>().radius((node) => node.r + 8).strength(0.95).iterations(2))
      .force('anchor-x', forceX<SimNode>((node) => node.anchorX).strength(0.085))
      .force('anchor-y', forceY<SimNode>((node) => node.anchorY).strength(0.085))
      .force(
        'links',
        forceLink<SimNode, SimLink>(links)
          .id((node) => node.id)
          .distance((link) => link.relation.distance)
          .strength((link) => Math.min(0.18, 0.06 + link.relation.strength * 0.08)),
      )
      .force('containment', circularContainment())
      .on('tick', () => setFrame((frame) => frame + 1))

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, [links, nodes])

  const reheat = () => {
    simulationRef.current?.alpha(0.55).restart()
  }

  const reset = () => {
    const counts = new Map<string, number>()
    for (const node of nodes) {
      const index = counts.get(node.group) ?? 0
      counts.set(node.group, index + 1)
      const group = GROUP_GEOMETRY[node.group]
      const angle = (-Math.PI / 2) + index * (Math.PI * 2 / 4)
      node.x = group.x + Math.cos(angle) * 72
      node.y = group.y + Math.sin(angle) * 72
      node.vx = 0
      node.vy = 0
      node.fx = null
      node.fy = null
    }
    setSelectedNodeId('calling')
    setHoveredNodeId(null)
    simulationRef.current?.alpha(0.8).restart()
  }

  const pointFromPointer = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    }
  }

  const dragStart = (node: SimNode, clientX: number, clientY: number) => {
    const point = pointFromPointer(clientX, clientY)
    if (!point) return

    draggingRef.current = node.id
    node.fx = point.x
    node.fy = point.y
    simulationRef.current?.alphaTarget(0.22).restart()
  }

  const dragMove = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return
    const node = nodeById.get(draggingRef.current)
    const point = pointFromPointer(clientX, clientY)
    if (!node || !point) return

    node.fx = point.x
    node.fy = point.y
  }

  const dragEnd = () => {
    if (!draggingRef.current) return
    const node = nodeById.get(draggingRef.current)
    if (node) {
      node.fx = null
      node.fy = null
    }
    draggingRef.current = null
    simulationRef.current?.alphaTarget(0)
  }

  const edgeIsActive = (relation: PhysicsRelation) => {
    if (hoveredRelationId === relation.id) return true
    if (!activeNodeId) return false
    return relation.source === activeNodeId || relation.target === activeNodeId
  }

  const nodeOpacity = (nodeId: string) => {
    if (!activeNeighborhood) return 1
    return activeNeighborhood.has(nodeId) ? 1 : 0.18
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-800 bg-[#11100f]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800/80 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">A · Nested Force</p>
          <h2 className="mt-1 text-xl font-medium text-stone-100">Grokker containment + constrained physics</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Hover reveals the local neighborhood. Drag a node and watch its relations respond while the containing world holds.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reheat}
            className="rounded-full border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-amber-800/60"
          >
            Let it breathe
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-stone-800 px-3 py-2 text-sm text-stone-500 hover:text-stone-200"
          >
            Reset
          </button>
        </div>
      </header>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full touch-none bg-[radial-gradient(circle_at_50%_44%,rgba(113,83,50,0.11),rgba(10,10,10,0.2)_55%,rgba(5,5,5,0.82)_100%)]"
          onPointerMove={(event) => dragMove(event.clientX, event.clientY)}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
          onPointerLeave={() => {
            if (!draggingRef.current) setHoveredNodeId(null)
          }}
        >
          <circle cx="500" cy="360" r="345" fill="none" stroke="rgba(115,95,76,0.38)" strokeWidth="1.4" />

          {PHYSICS_GROUPS.map((group) => {
            const geometry = GROUP_GEOMETRY[group.id]
            return (
              <g key={group.id}>
                <circle
                  cx={geometry.x}
                  cy={geometry.y}
                  r={geometry.r}
                  fill="rgba(34,31,28,0.22)"
                  stroke="rgba(118,103,89,0.48)"
                  strokeWidth="1.4"
                />
                <text
                  x={geometry.x}
                  y={geometry.y - geometry.r + 23}
                  textAnchor="middle"
                  fill="#b8afa6"
                  fontSize="15"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {group.label}
                </text>
              </g>
            )
          })}

          {links.map((link) => {
            const relation = link.relation
            const source = nodeById.get(endpointId(link.source))
            const target = nodeById.get(endpointId(link.target))
            if (!source || !target) return null

            const active = edgeIsActive(relation)
            const dim = activeNodeId && !active

            return (
              <g key={relation.id} data-relation-id={relation.id}>
                <line
                  x1={source.x ?? 0}
                  y1={source.y ?? 0}
                  x2={target.x ?? 0}
                  y2={target.y ?? 0}
                  stroke={active ? 'rgba(209,139,61,0.8)' : 'rgba(122,111,100,0.24)'}
                  strokeWidth={active ? 2.4 : 1.15}
                  opacity={dim ? 0.06 : 1}
                  pointerEvents="none"
                />
                <line
                  x1={source.x ?? 0}
                  y1={source.y ?? 0}
                  x2={target.x ?? 0}
                  y2={target.y ?? 0}
                  stroke="transparent"
                  strokeWidth="14"
                  onPointerEnter={() => setHoveredRelationId(relation.id)}
                  onPointerLeave={() => setHoveredRelationId(null)}
                />
              </g>
            )
          })}

          {nodes.map((node) => {
            const active = activeNodeId === node.id
            const opacity = nodeOpacity(node.id)

            return (
              <g
                key={node.id}
                data-node-id={node.id}
                transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                opacity={opacity}
                onPointerEnter={() => setHoveredNodeId(node.id)}
                onPointerLeave={() => {
                  if (!draggingRef.current) setHoveredNodeId(null)
                }}
                onClick={() => setSelectedNodeId(node.id)}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  dragStart(node, event.clientX, event.clientY)
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <circle
                  r={node.r}
                  fill={active ? 'rgba(77,53,31,0.96)' : 'rgba(27,25,23,0.96)'}
                  stroke={active ? 'rgba(222,148,66,0.96)' : 'rgba(126,113,101,0.72)'}
                  strokeWidth={active ? 2.3 : 1.3}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={active ? '#fff3df' : '#e7e5e4'}
                  fontSize={node.label.length > 17 ? 10.5 : 12}
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {node.label.length > 18 ? node.label.replace(' ', '\n') : node.label}
                </text>
              </g>
            )
          })}
        </svg>

        <aside className="absolute right-4 top-4 w-[280px] rounded-2xl border border-stone-800/90 bg-stone-950/90 p-4 shadow-2xl backdrop-blur-md">
          {hoveredRelation ? (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">Connection</p>
              <p className="mt-2 text-base text-stone-100">
                {NODE_BY_ID.get(hoveredRelation.source)?.label} <span className="text-amber-500">{hoveredRelation.verb}</span>{' '}
                {NODE_BY_ID.get(hoveredRelation.target)?.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-400">{hoveredRelation.rationale}</p>
              <p className="mt-3 text-xs text-stone-600">{hoveredRelation.standing} relation · prototype witness</p>
            </>
          ) : activeNode ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700/80">Cursor insight</p>
                <span className="text-xs text-stone-600">{GROUP_BY_ID.get(activeNode.group)?.label}</span>
              </div>
              <h3 className="mt-2 text-xl text-stone-100">{activeNode.label}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">{activeNode.inquiry}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">{activeNode.essence}</p>
              <div className="mt-4 border-t border-stone-800 pt-3">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-600">Nearby</p>
                <div className="mt-2 space-y-2">
                  {activeRelations.map((relation) => {
                    const otherId = relation.source === activeNode.id ? relation.target : relation.source
                    return (
                      <div key={relation.id} className="text-sm text-stone-400">
                        <span className="text-stone-200">{NODE_BY_ID.get(otherId)?.label}</span>
                        <span className="mx-2 text-stone-700">·</span>
                        <span>{relation.verb}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-stone-500">Hover a node to reveal its immediate relational field.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
