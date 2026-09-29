'use client'

import { useState } from 'react'
import { LivingConstellationPanel } from '@/components/maia/living-constellation/LivingConstellationPanel'
import type { LivingConstellationProjection } from '@/lib/maia/living-constellation/types'

const BEFORE =
  'I keep asking whether to refine this further or let it enter the world.'

const AFTER =
  'I want to release this version and keep learning from what happens next.'

const baseProjection: LivingConstellationProjection = {
  memberCenter: {
    projectionId: 'member:center',
    label: 'You',
    kind: 'orientation_only',
  },
  partial: false,
  warnings: [],
  generatedAt: '2026-09-29T15:00:00.000Z',
  nodes: [
    {
      projectionId: 'witness:elemental-alchemy',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-elemental-alchemy',
      label: 'Elemental Alchemy',
      excerpt:
        'The work is becoming clearer, but I do not want to lose its soul while I make it more coherent.',
      authorship: 'member_authored',
      standing: 'active',
      privacy: 'member_private',
      createdAt: '2026-08-05T12:00:00.000Z',
      updatedAt: '2026-09-29T14:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r2',
      },
    },
    {
      projectionId: 'witness:relationship',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-relationship',
      label: 'Relationship',
      excerpt: 'I want to help someone find their way without deciding for them.',
      authorship: 'member_authored',
      standing: 'carried',
      privacy: 'member_private',
      createdAt: '2026-09-11T12:00:00.000Z',
      updatedAt: '2026-09-20T12:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r2',
      },
    },
    {
      projectionId: 'witness:becoming',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-becoming',
      label: 'Becoming',
      excerpt: 'The next chapter feels present before I know what shape it will take.',
      authorship: 'member_authored',
      standing: 'active',
      privacy: 'member_private',
      createdAt: '2026-09-18T12:00:00.000Z',
      updatedAt: '2026-09-18T12:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r2',
      },
    },
    {
      projectionId: 'witness:place',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-place',
      label: 'Place',
      excerpt: 'Home is becoming less a container and more a place I know how to return to.',
      authorship: 'member_authored',
      standing: 'contained',
      privacy: 'member_private',
      createdAt: '2026-09-12T12:00:00.000Z',
      updatedAt: '2026-09-12T12:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r2',
      },
    },
    {
      projectionId: 'witness:question',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-question',
      label: 'Current Question',
      excerpt: BEFORE,
      authorship: 'member_authored',
      standing: 'active',
      privacy: 'member_private',
      createdAt: '2026-09-10T12:00:00.000Z',
      updatedAt: '2026-09-10T12:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r2',
      },
    },
  ],
}

function updatedProjection(): LivingConstellationProjection {
  return {
    ...baseProjection,
    generatedAt: '2026-09-29T20:05:00.000Z',
    nodes: baseProjection.nodes.map((node) =>
      node.projectionId === 'witness:question'
        ? {
            ...node,
            excerpt: AFTER,
            updatedAt: '2026-09-29T20:05:00.000Z',
          }
        : node,
    ),
  }
}

export function TruthfulReturnWitnessClient() {
  const [projection, setProjection] = useState<LivingConstellationProjection>(baseProjection)
  const [changed, setChanged] = useState(false)

  function simulateUpdate() {
    setProjection(updatedProjection())
    setChanged(true)
  }

  function resetSource() {
    setProjection(baseProjection)
    setChanged(false)
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#806f60]">
            MAIA-SOUL-SERVICE-02R2 · truthful return witness
          </p>
          <p className="mt-1 text-[10px] text-[#9a8875]">
            {changed ? 'Synthetic source state B · current truth' : 'Synthetic source state A · before change'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={simulateUpdate}
            disabled={changed}
            className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4 disabled:opacity-35"
          >
            Simulate member-authored source update
          </button>
          {changed && (
            <button
              type="button"
              onClick={resetSource}
              className="text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
            >
              Reset witness source
            </button>
          )}
        </div>
      </div>

      <LivingConstellationPanel
        focus="living"
        enableSoulServiceAperturePilot
        enableTruthfulReturnDeltaPilot
        projectionOverrideForWitness={projection}
      />
    </>
  )
}
