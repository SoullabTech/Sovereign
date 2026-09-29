import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/cross-surface-identity/CrossSurfaceIdentityWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/cross-surface-identity/page.tsx'),
  'utf8',
)

describe('MAIA-SOUL-SERVICE-02R3 cross-surface identity witness', () => {
  it('uses one stable living-object identity across all surfaces', () => {
    expect(client).toContain("livingObjectId: 'work:elemental-alchemy'")
    expect(client).toContain("viewTransitionName: 'living-object-elemental-alchemy'")
    expect(client).toContain('Same governed identity')
  })

  it('distinguishes surface projection from source identity', () => {
    expect(client).toContain("living_field: 'Living Field'")
    expect(client).toContain("grokker: 'Grokker'")
    expect(client).toContain('writers_studio: "Writer\'s Studio"')
    expect(client).toContain("maia: 'MAIA'")
    expect(client).toContain('Surface changes what you can do with the object. It does not create a new object.')
  })

  it('advances source version only through the Writer witness mutation', () => {
    expect(client).toContain("sourceVersion: 'ea:v2'")
    expect(client).toContain('Apply witness edit → ea:v2')
    expect(client).toContain('Writer projection · authorized source mutation')
  })

  it('captures a source-version witness in the Return Envelope', () => {
    expect(client).toContain('sourceVersionWitnessed: object.sourceVersion')
    expect(client).toContain("returnPolicy: 'restore_orientation_reconcile_truth_clear_transient'")
    expect(client).toContain('movementIntent')
  })

  it('reconciles current source truth and exposes v1 → v2 delta on return', () => {
    expect(client).toContain('currentEnvelope.sourceVersionWitnessed !== object.sourceVersion')
    expect(client).toContain('beforeVersion: currentEnvelope.sourceVersionWitnessed')
    expect(client).toContain('nowVersion: object.sourceVersion')
    expect(client).toContain('Changed while you were elsewhere')
  })

  it('keeps MAIA aperture state temporary and clears it on return', () => {
    expect(client).toContain('temporaryMaiaLens')
    expect(client).toContain('setTemporaryMaiaLens(null)')
    expect(client).toContain('temporary MAIA aperture · not identity')
    expect(client).not.toContain('localStorage')
    expect(client).not.toContain('sessionStorage')
  })

  it('clears the Return Envelope after truthful return', () => {
    expect(client).toContain('setEnvelope(null)')
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
