import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const panel = fs.readFileSync(
  path.join(root, 'components/maia/living-constellation/LivingConstellationPanel.tsx'),
  'utf8',
)
const witness = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/living-field-aperture/TruthfulReturnWitnessClient.tsx',
  ),
  'utf8',
)

describe('Living Field truthful return — 02R2', () => {
  it('captures source truth at entry and compares against current truth at return', () => {
    expect(panel).toContain('interface ReturnSourceSnapshot')
    expect(panel).toContain('returnSourceSnapshot(node)')
    expect(panel).toContain('computeReturnDelta(snapshot.source, currentNode)')
    expect(panel).toContain("changedFields.push('excerpt')")
    expect(panel).toContain("changedFields.push('updatedAt')")
  })

  it('makes a material delta inspectable without narrating meaning', () => {
    expect(panel).toContain('Updated while you were inside')
    expect(panel).toContain('Before')
    expect(panel).toContain('Now')
    expect(panel).toContain('Same presence · source changed · no explanation inferred.')
    expect(panel).not.toContain('This means you')
    expect(panel).not.toContain('because you')
  })

  it('keeps the truthful-return delta local and clears it on the next entry', () => {
    expect(panel).toContain('const [returnDelta, setReturnDelta]')
    expect(panel).toContain('setReturnDelta(null)')
    expect(panel).toContain('enableTruthfulReturnDeltaPilot = false')
    expect(panel).not.toContain('localStorage')
    expect(panel).not.toContain('sessionStorage')
  })

  it('uses the current projection node rather than replaying the entry snapshot', () => {
    expect(panel).toContain('const currentNode = snapshot')
    expect(panel).toContain('grouped.living_field.find')
    expect(panel).toContain('setReturnDelta(delta)')
  })

  it('witnesses a stable identity with a legitimate source A → B update', () => {
    expect(witness).toContain("projectionId: 'witness:question'")
    expect(witness).toContain('const BEFORE =')
    expect(witness).toContain('const AFTER =')
    expect(witness).toContain("updatedAt: '2026-09-29T20:05:00.000Z'")
    expect(witness).toContain('Simulate member-authored source update')
  })

  it('keeps the witness local-only and explicitly enables truthful-return behavior', () => {
    expect(witness).toContain('enableTruthfulReturnDeltaPilot')
    expect(witness).toContain('projectionOverrideForWitness={projection}')
    expect(witness).toContain('synthetic_witness')
  })
})
