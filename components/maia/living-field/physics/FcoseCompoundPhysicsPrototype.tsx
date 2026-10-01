'use client'

import { useEffect, useRef, useState } from 'react'
import cytoscape, { type Core, type EdgeSingular, type NodeSingular } from 'cytoscape'
import fcose from 'cytoscape-fcose'
import {
  GROUP_BY_ID,
  GROUP_GEOMETRY,
  NODE_BY_ID,
  PHYSICS_GROUPS,
  PHYSICS_NODES,
  PHYSICS_RELATIONS,
  relatedRelations,
  type PhysicsRelation,
} from './physicsFieldData'

cytoscape.use(fcose)

const WIDTH = 1000
const HEIGHT = 720

function elements() {
  const root = {
    data: {
      id: 'field-root',
      label: 'Living Field',
      nodeType: 'root',
    },
  }

  const parents = PHYSICS_GROUPS.map((group) => ({
    data: {
      id: group.id,
      label: group.label,
      essence: group.essence,
      parent: 'field-root',
      nodeType: 'group',
    },
  }))

  const groupCounts = new Map<string, number>()
  const leaves = PHYSICS_NODES.map((node) => {
    const index = groupCounts.get(node.group) ?? 0
    groupCounts.set(node.group, index + 1)
    const geometry = GROUP_GEOMETRY[node.group]
    const angle = (-Math.PI / 2) + index * (Math.PI * 2 / 4)

    return {
      data: {
        id: node.id,
        label: node.label,
        inquiry: node.inquiry,
        essence: node.essence,
        parent: node.group,
        nodeType: 'leaf',
        group: node.group,
      },
      position: {
        x: geometry.x + Math.cos(angle) * 68,
        y: geometry.y + Math.sin(angle) * 68,
      },
    }
  })

  const edges = PHYSICS_RELATIONS.map((relation) => ({
    data: {
      id: relation.id,
      source: relation.source,
      target: relation.target,
      verb: relation.verb,
      rationale: relation.rationale,
      standing: relation.standing,
      strength: relation.strength,
      distance: relation.distance,
    },
  }))

  return [root, ...parents, ...leaves, ...edges]
}

function relationFromEdge(edge: EdgeSingular): PhysicsRelation | null {
  const id = edge.id()
  return PHYSICS_RELATIONS.find((relation) => relation.id === id) ?? null
}

export function FcoseCompoundPhysicsPrototype() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<Core | null>(null)
  const selectedIdRef = useRef<string | null>('calling')

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('calling')
  const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null)

  const activeNodeId = hoveredNodeId ?? selectedNodeId
  const activeNode = activeNodeId ? NODE_BY_ID.get(activeNodeId) ?? null : null
  const activeRelations = activeNodeId
    ? relatedRelations(activeNodeId).sort((a, b) => b.strength - a.strength).slice(0, 4)
    : []
  const hoveredRelation = hoveredRelationId
    ? PHYSICS_RELATIONS.find((relation) => relation.id === hoveredRelationId) ?? null
    : null

  const applyNeighborhood = (nodeId: string | null) => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().removeClass('dim hot edge-hot')

    if (!nodeId) return

    const node = cy.getElementById(nodeId)
    if (!node.length) return

    cy.elements().addClass('dim')
    const neighborhood = node.closedNeighborhood()
    neighborhood.removeClass('dim').addClass('hot')
    node.connectedEdges().removeClass('dim').addClass('edge-hot')
  }

  const runLayout = (fixedId?: string) => {
    const cy = cyRef.current
    if (!cy) return

    const fixed = fixedId
      ? [{
          nodeId: fixedId,
          position: {
            x: cy.getElementById(fixedId).position('x'),
            y: cy.getElementById(fixedId).position('y'),
          },
        }]
      : undefined

    cy.layout({
      name: 'fcose',
      quality: 'default',
      randomize: false,
      animate: true,
      animationDuration: 700,
      fit: true,
      padding: 36,
      nodeRepulsion: () => 7000,
      idealEdgeLength: (edge: EdgeSingular) => Number(edge.data('distance') ?? 120),
      edgeElasticity: (edge: EdgeSingular) => 0.28 + Number(edge.data('strength') ?? 0.7) * 0.28,
      nestingFactor: 0.16,
      gravity: 0.42,
      gravityRange: 3.5,
      gravityCompound: 1.25,
      gravityRangeCompound: 1.9,
      numIter: 1800,
      tile: false,
      fixedNodeConstraint: fixed,
    } as never).run()
  }

  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements(),
      layout: {
        name: 'preset',
        fit: true,
        padding: 24,
      },
      minZoom: 0.35,
      maxZoom: 3.3,
      wheelSensitivity: 0.18,
      boxSelectionEnabled: false,
      autoungrabify: false,
      style: [
        {
          selector: 'node[nodeType = "root"]',
          style: {
            'background-opacity': 0.02,
            'border-color': '#5f554b',
            'border-width': 1.4,
            'border-opacity': 0.65,
            'shape': 'round-rectangle',
            'padding': '46px',
            'label': 'data(label)',
            'font-size': 16,
            'font-weight': 500,
            'color': '#8f877f',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': 12,
          },
        },
        {
          selector: 'node[nodeType = "group"]',
          style: {
            'background-color': '#1f1c19',
            'background-opacity': 0.2,
            'border-color': '#756858',
            'border-width': 1.4,
            'border-opacity': 0.72,
            'shape': 'ellipse',
            'padding': '32px',
            'label': 'data(label)',
            'font-size': 16,
            'font-weight': 600,
            'color': '#c2b7ab',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': 14,
          },
        },
        {
          selector: 'node[nodeType = "leaf"]',
          style: {
            'width': 56,
            'height': 56,
            'background-color': '#1c1917',
            'background-opacity': 0.98,
            'border-color': '#75695e',
            'border-width': 1.4,
            'label': 'data(label)',
            'font-size': 11,
            'font-weight': 600,
            'color': '#e7e5e4',
            'text-wrap': 'wrap',
            'text-max-width': '82px',
            'text-valign': 'center',
            'text-halign': 'center',
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.1,
            'line-color': '#73685e',
            'line-opacity': 0.24,
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'label': '',
            'font-size': 10,
            'text-background-color': '#11100f',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'color': '#e6c18f',
            'overlay-opacity': 0,
          },
        },
        {
          selector: '.dim',
          style: {
            'opacity': 0.12,
          },
        },
        {
          selector: 'node.hot[nodeType = "leaf"]',
          style: {
            'opacity': 1,
            'border-color': '#d18b3d',
            'border-width': 2.2,
            'background-color': '#3a2a1d',
            'color': '#fff4df',
          },
        },
        {
          selector: 'edge.edge-hot',
          style: {
            'opacity': 1,
            'line-color': '#d18b3d',
            'line-opacity': 0.82,
            'width': 2.5,
            'label': 'data(verb)',
          },
        },
      ],
    })

    cyRef.current = cy

    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as { __soullabPhysicsB?: Core }).__soullabPhysicsB = cy
    }

    const initialLayout = () => {
      window.setTimeout(() => runLayout(), 80)
      window.setTimeout(() => {
        applyNeighborhood(selectedIdRef.current)
      }, 900)
    }

    cy.ready(initialLayout)

    cy.on('mouseover', 'node[nodeType = "leaf"]', (event) => {
      const node = event.target as NodeSingular
      setHoveredNodeId(node.id())
      applyNeighborhood(node.id())
    })

    cy.on('mouseout', 'node[nodeType = "leaf"]', () => {
      setHoveredNodeId(null)
      applyNeighborhood(selectedIdRef.current)
    })

    cy.on('tap', 'node[nodeType = "leaf"]', (event) => {
      const node = event.target as NodeSingular
      selectedIdRef.current = node.id()
      setSelectedNodeId(node.id())
      applyNeighborhood(node.id())
    })

    cy.on('mouseover', 'edge', (event) => {
      const edge = event.target as EdgeSingular
      setHoveredRelationId(edge.id())
      edge.addClass('edge-hot')
    })

    cy.on('mouseout', 'edge', (event) => {
      const edge = event.target as EdgeSingular
      setHoveredRelationId(null)
      if (!edge.connectedNodes().toArray().some((node) => node.id() === (hoveredNodeId ?? selectedIdRef.current))) {
        edge.removeClass('edge-hot')
      }
    })

    cy.on('dragfree', 'node[nodeType = "leaf"]', (event) => {
      const node = event.target as NodeSingular
      runLayout(node.id())
      window.setTimeout(() => applyNeighborhood(selectedIdRef.current), 760)
    })

    return () => {
      if (process.env.NODE_ENV !== 'production') {
        delete (window as unknown as { __soullabPhysicsB?: Core }).__soullabPhysicsB
      }
      cy.destroy()
      cyRef.current = null
    }
  }, [])

  const reflow = () => {
    runLayout(selectedIdRef.current ?? undefined)
    window.setTimeout(() => applyNeighborhood(selectedIdRef.current), 760)
  }

  const reset = () => {
    const cy = cyRef.current
    if (!cy) return

    selectedIdRef.current = 'calling'
    setSelectedNodeId('calling')
    setHoveredNodeId(null)
    setHoveredRelationId(null)

    const counts = new Map<string, number>()
    for (const node of PHYSICS_NODES) {
      const index = counts.get(node.group) ?? 0
      counts.set(node.group, index + 1)
      const geometry = GROUP_GEOMETRY[node.group]
      const angle = (-Math.PI / 2) + index * (Math.PI * 2 / 4)
      cy.getElementById(node.id).position({
        x: geometry.x + Math.cos(angle) * 68,
        y: geometry.y + Math.sin(angle) * 68,
      })
    }

    runLayout('calling')
    window.setTimeout(() => applyNeighborhood('calling'), 760)
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-800 bg-[#11100f]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800/80 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-700/80">B · Compound Force</p>
          <h2 className="mt-1 text-xl font-medium text-stone-100">fCoSE compound physics</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            Hover reveals the local network. Drag a node, release it, and the compound field reorganizes around the held position.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reflow}
            className="rounded-full border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-amber-800/60"
          >
            Settle field
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

      <div className="relative min-h-[720px]">
        <div ref={containerRef} className="h-[720px] w-full bg-[radial-gradient(circle_at_50%_44%,rgba(113,83,50,0.10),rgba(10,10,10,0.24)_55%,rgba(5,5,5,0.84)_100%)]" />

        <aside className="pointer-events-none absolute right-4 top-4 w-[280px] rounded-2xl border border-stone-800/90 bg-stone-950/90 p-4 shadow-2xl backdrop-blur-md">
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
