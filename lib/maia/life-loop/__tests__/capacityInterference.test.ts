import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  availableInterferenceResolutions,
  reportCapacityCoherence,
  shouldInferInterferenceFromBehavior,
} from '../capacityInterference'

describe('SOUL-SERVICE-03J capacity interference', () => {
  it('records coherence as member-reported encounter state', () => {
    const report = reportCapacityCoherence(
      'compare_versions',
      'change_scale',
      'TENSION_PRESENT',
      'I keep switching levels before I finish the comparison.',
    )

    expect(report.report).toBe('TENSION_PRESENT')
    expect(report.memberReason).toContain('switching levels')
    expect(report.standing).toBe('MEMBER_REPORTED')
  })

  it('preserves both capacity identities even when tension is reported', () => {
    const report = reportCapacityCoherence(
      'compare_versions',
      'change_scale',
      'TENSION_PRESENT',
    )

    expect(report.chord.capacityIds).toEqual(['compare_versions', 'change_scale'])
    expect(report.chord.capacities[0].id).toBe('compare_versions')
    expect(report.chord.capacities[1].id).toBe('change_scale')
  })

  it('exposes non-ranked structural resolutions without choosing one', () => {
    expect(availableInterferenceResolutions()).toEqual([
      'KEEP_BOTH',
      'RELEASE_FIRST',
      'RELEASE_SECOND',
      'SEQUENCE_INSTEAD',
      'DISSOLVE_SUPPORT',
    ])
  })

  it('prohibits behavioral inference of overload or interference', () => {
    expect(shouldInferInterferenceFromBehavior()).toBe(false)
  })
})

describe('03J witness boundary', () => {
  const root = process.cwd()
  const client = fs.readFileSync(
    path.join(
      root,
      'app/dev/maia-soul-service/capacity-interference/CapacityInterferenceWitnessClient.tsx',
    ),
    'utf8',
  )
  const page = fs.readFileSync(
    path.join(root, 'app/dev/maia-soul-service/capacity-interference/page.tsx'),
    'utf8',
  )

  it('asks the member about clarity instead of inferring overload', () => {
    expect(client).toContain('Can I still tell what each capacity is asking?')
    expect(client).toContain('Does holding both increase clarity—or split my attention?')
    expect(client).toContain('behavioral overload inference')
    expect(client).toContain('prohibited')
  })

  it('keeps compatibility scoring absent', () => {
    expect(client).toContain('compatibility score')
    expect(client).toContain('none')
    expect(client).not.toContain('compatibilityScore')
    expect(client).not.toContain('coherenceScore')
  })

  it('lets the member keep both despite reported tension', () => {
    expect(client).toContain('Keep both')
    expect(client).toContain('Both capacities remain valid.')
  })

  it('allows either capacity to be released independently', () => {
    expect(client).toContain('Release Compare versions')
    expect(client).toContain('Release Change scale')
  })

  it('supports sequence without progression hierarchy', () => {
    expect(client).toContain('Use one at a time')
    expect(client).toContain('No order is inherently better.')
    expect(client).toContain('Reverse which one I use first')
    expect(client).not.toContain('Step 1')
    expect(client).not.toContain('Step 2')
    expect(client).not.toContain('master')
  })

  it('keeps unsure first-class', () => {
    expect(client).toContain('I am not sure whether these help together.')
    expect(client).toContain('No decision is required.')
    expect(client).toContain('Stay with both briefly')
    expect(client).toContain('Use neither')
  })

  it('keeps no-support available without deficit language', () => {
    expect(client).toContain('Dissolve support')
    expect(client).toContain('Simplicity can serve attention without meaning anything about capacity.')
    expect(client).not.toContain('failed complexity')
    expect(client).not.toContain('too much for you')
  })

  it('keeps the local witness production closed and non-persistent', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
    expect(client).not.toContain('localStorage')
    expect(client).not.toContain('sessionStorage')
  })
})
