import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  GOVERNED_CAPACITY_CHORDS,
  composeCapacities,
  compositionAfterMemberCompose,
  compositionAfterRelease,
  compositionAfterReshape,
  reshapeComposition,
} from '../capacityComposition'

describe('SOUL-SERVICE-03I capacity composition', () => {
  it('requires two distinct capacities', () => {
    expect(() => composeCapacities('compare_versions', 'compare_versions')).toThrow(
      'CAPACITY_COMPOSITION_REQUIRES_DISTINCT_CAPACITIES',
    )
  })

  it('preserves each capacity identity inside the chord', () => {
    const chord = composeCapacities('compare_versions', 'seek_counterevidence')
    expect(chord.capacityIds).toEqual(['compare_versions', 'seek_counterevidence'])
    expect(chord.capacities[0].id).toBe('compare_versions')
    expect(chord.capacities[1].id).toBe('seek_counterevidence')
    expect(chord.standing).toBe('MEMBER_COMPOSED')
  })

  it('allows one capacity to be replaced while preserving the other', () => {
    const chord = composeCapacities('compare_versions', 'seek_counterevidence')
    const reshaped = reshapeComposition(chord, 'change_scale', 1)
    expect(reshaped.capacityIds).toEqual(['compare_versions', 'change_scale'])
  })

  it('tracks composition state without creating a developmental rank', () => {
    expect(compositionAfterMemberCompose()).toBe('MEMBER_COMPOSED')
    expect(compositionAfterReshape()).toBe('MEMBER_RESHAPED')
    expect(compositionAfterRelease(1)).toBe('SINGLE_CAPACITY')
    expect(compositionAfterRelease(0)).toBe('NO_COMPOSITION')
  })

  it('keeps the governed MAIA menu bounded', () => {
    expect(GOVERNED_CAPACITY_CHORDS).toHaveLength(3)
    expect(GOVERNED_CAPACITY_CHORDS.map((x) => x.label)).toEqual([
      'Compare + complicate',
      'Widen + leave open',
      'Continuity + exception',
    ])
  })
})

describe('03I witness boundary', () => {
  const root = process.cwd()
  const client = fs.readFileSync(
    path.join(
      root,
      'app/dev/maia-soul-service/capacity-composition/CapacityCompositionWitnessClient.tsx',
    ),
    'utf8',
  )
  const page = fs.readFileSync(
    path.join(root, 'app/dev/maia-soul-service/capacity-composition/page.tsx'),
    'utf8',
  )

  it('keeps no support first-class and MAIA invitation explicit', () => {
    expect(client).toContain('No support active.')
    expect(client).toContain('Ask MAIA what combinations are available')
    expect(client).toContain('None right now')
  })

  it('keeps both composed capacities individually visible and releasable', () => {
    expect(client).toContain('data-active-capacity={capacity.id}')
    expect(client).toContain('Release only this capacity')
    expect(client).toContain('Both questions remain active at once.')
  })

  it('does not use checklist progression language', () => {
    expect(client).not.toContain('Step 2')
    expect(client).not.toContain('next step')
    expect(client).not.toContain('best combination')
    expect(client).not.toContain('recommended combination')
  })

  it('keeps MAIA offers non-ranked and bounded', () => {
    expect(client).toContain('None is the correct one, and more support is not better.')
    expect(client).toContain('data-capacity-composition-offer')
  })

  it('allows reshaping and full dissolution', () => {
    expect(client).toContain('Replace one capacity while keeping the other.')
    expect(client).toContain('Dissolve the composition completely')
  })

  it('keeps composition local and non-persistent', () => {
    expect(client).not.toContain('localStorage')
    expect(client).not.toContain('sessionStorage')
    expect(client).toContain('persistence')
    expect(client).toContain('none')
  })

  it('keeps the dev witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
