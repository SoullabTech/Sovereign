import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  APPLICABILITY_GRAMMAR,
  applicabilityAfterRevalidation,
  applicabilityAfterSourceChange,
} from '../patternAging'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/pattern-aging/PatternAgingWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/pattern-aging/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03E pattern aging and revalidation', () => {
  it('requires revalidation when the implicated region changes across source versions', () => {
    expect(
      applicabilityAfterSourceChange({
        patternSourceVersion: 'ea:v1',
        currentSourceVersion: 'ea:v2',
        implicatedRegionChanged: true,
      }),
    ).toBe('REVALIDATION_REQUIRED')
  })

  it('does not require revalidation solely because an unrelated source region changed', () => {
    expect(
      applicabilityAfterSourceChange({
        patternSourceVersion: 'ea:v1',
        currentSourceVersion: 'ea:v2',
        implicatedRegionChanged: false,
      }),
    ).toBe('CURRENT_PROVISIONAL')
  })

  it('revalidates support only to provisional standing', () => {
    expect(applicabilityAfterRevalidation('supports')).toBe('REVALIDATED_PROVISIONAL')
    expect(APPLICABILITY_GRAMMAR.REVALIDATED_PROVISIONAL.statement).toContain(
      'remains provisional',
    )
  })

  it('lets current contradiction contest applicability without deleting historical evidence', () => {
    expect(applicabilityAfterRevalidation('contradicts')).toBe('CURRENT_CONTESTED')
  })

  it('keeps outside-scope and insufficient evidence from forcing an applicability update', () => {
    expect(applicabilityAfterRevalidation('outside_scope')).toBe('REVALIDATION_REQUIRED')
    expect(applicabilityAfterRevalidation('insufficient')).toBe('REVALIDATION_REQUIRED')
  })

  it('offers dormancy and retirement without deleting history', () => {
    expect(client).toContain('Let this pattern rest')
    expect(client).toContain('Retire from current use')
    expect(client).toContain('Historical evidence remains')
    expect(client).toContain('Historical evidence and provenance remain')
  })

  it('keeps work identity separate from source-version and pattern-applicability state', () => {
    expect(client).toContain('work:elemental-alchemy')
    expect(client).toContain('ea:v1')
    expect(client).toContain('ea:v2')
    expect(client).toContain('Current applicability')
  })

  it('keeps the witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
