import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/longitudinal-return/LongitudinalReturnWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/longitudinal-return/page.tsx'),
  'utf8',
)

describe('MAIA-SOUL-SERVICE-02R5 longitudinal return witness', () => {
  it('preserves stable object identity and source lineage across the interval', () => {
    expect(client).toContain("livingObjectId: 'work:elemental-alchemy'")
    expect(client).toContain("sourceVersion: 'ea:v1'")
    expect(client).toContain("sourceVersion: 'ea:v2'")
  })

  it('restores only an explicit member-kept return marker', () => {
    expect(client).toContain('You deliberately kept')
    expect(client).toContain('Return to the Chapter 10 ending before the next release pass.')
  })

  it('does not carry forward temporary MAIA lens or unsaved momentum as current', () => {
    expect(client).toContain("priorTemporaryLens: 'What does the evidence actually support?'")
    expect(client).toContain("priorUnsavedNextStep: 'Keep editing until it feels finished.'")
    expect(client).toContain('Not carried forward')
    expect(client).toContain('old urgency')
    expect(client).toContain('old salience')
  })

  it('shows current truth before inviting movement', () => {
    expect(client).toContain('Current source')
    expect(client).toContain('What is your relationship to this now?')
    expect(client).toContain('Resume from what I kept')
    expect(client).toContain('Revisit the earlier state')
    expect(client).toContain('Inspect the change')
    expect(client).toContain('Let it rest')
  })

  it('distinguishes historical revisit from current truth', () => {
    expect(client).toContain('Historical source · not treated as current.')
  })

  it('does not automatically restore unsaved next-step momentum when resuming', () => {
    expect(client).toContain('The old unsaved “keep editing” momentum was not restored.')
  })

  it('allows non-continuation as a lawful outcome', () => {
    expect(client).toContain('Nothing needs to continue right now.')
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
