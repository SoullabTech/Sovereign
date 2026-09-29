import { notFound } from 'next/navigation'
import { LivingConstellationPanel } from '@/components/maia/living-constellation/LivingConstellationPanel'
import type { LivingConstellationProjection } from '@/lib/maia/living-constellation/types'

const projection: LivingConstellationProjection = {
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
      excerpt: 'The work is becoming clearer, but I do not want to lose its soul while I make it more coherent.',
      authorship: 'member_authored',
      standing: 'active',
      privacy: 'member_private',
      createdAt: '2026-08-05T12:00:00.000Z',
      updatedAt: '2026-09-29T14:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r1',
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
        sourceSurface: 'maia-soul-service-02r1',
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
        sourceSurface: 'maia-soul-service-02r1',
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
        sourceSurface: 'maia-soul-service-02r1',
      },
    },
    {
      projectionId: 'witness:question',
      domain: 'living_field',
      sourceType: 'living_field_expression',
      sourceId: 'synthetic-question',
      label: 'Current Question',
      excerpt: 'I keep asking whether to refine this further or let it enter the world.',
      authorship: 'member_authored',
      standing: 'active',
      privacy: 'member_private',
      createdAt: '2026-09-10T12:00:00.000Z',
      updatedAt: '2026-09-10T12:00:00.000Z',
      source: {
        table: 'synthetic_witness',
        sourceSurface: 'maia-soul-service-02r1',
      },
    },
  ],
}

export default function LivingFieldApertureWitnessPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="min-h-screen bg-[#e8dccb] px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-6 px-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#806f60]">
            MAIA-SOUL-SERVICE-02R1 · local witness
          </p>
          <p className="text-[10px] uppercase tracking-[0.13em] text-[#9a8875]">
            synthetic source · no persistence
          </p>
        </div>
        <LivingConstellationPanel
          focus="living"
          enableSoulServiceAperturePilot
          projectionOverrideForWitness={projection}
        />
      </div>
    </main>
  )
}
