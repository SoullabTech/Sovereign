import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PROVISIONAL_PATTERN,
  PROSPECTIVE_RELATION_GRAMMAR,
  governedProspectiveRelation,
} from '../prospectivePattern'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/nonconfirmatory-attention/NonconfirmatoryAttentionWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/nonconfirmatory-attention/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03D non-confirmatory attention', () => {
  it('governs a relation vocabulary that includes outside-scope and insufficient evidence', () => {
    expect(Object.keys(PROSPECTIVE_RELATION_GRAMMAR)).toEqual([
      'supports',
      'contradicts',
      'complicates',
      'outside_scope',
      'insufficient',
    ])
  })

  it('keeps support from auto-promoting a provisional pattern', () => {
    const support = governedProspectiveRelation('supports')
    expect(support.effect).toContain('Do not promote the pattern automatically')
    expect(support.effect).toContain('re-evaluate maturity with all evidence')
  })

  it('allows direct contradiction to weaken or abandon the proposition', () => {
    const contradiction = governedProspectiveRelation('contradicts')
    expect(contradiction.statement).toContain('directly counts against')
    expect(contradiction.effect).toContain('weakening')
    expect(contradiction.effect).toContain('abandonment')
  })

  it('keeps relevant but non-pattern evidence outside scope', () => {
    const outside = governedProspectiveRelation('outside_scope')
    expect(outside.statement).toContain('does not bear on')
    expect(outside.effect).toContain('without forcing it into this pattern')
  })

  it('has distinct open and explicit-test attention modes', () => {
    expect(client).toContain("type AttentionMode = 'open' | 'explicit_test'")
    expect(client).toContain('Open encounter · default')
    expect(client).toContain('Deliberate pattern test')
    expect(client).toContain('data-open-capture')
    expect(client).toContain('data-explicit-test')
  })

  it('explicit test mode names support, disconfirmation, and outside-scope conditions', () => {
    expect(client).toContain('Would support')
    expect(client).toContain('Would count against')
    expect(client).toContain('Could be outside scope')
    expect(client).toContain('record anything else that')
    expect(client).toContain('materially affects comprehension')
  })

  it('compares the governed provisional pattern only after a report is captured', () => {
    expect(client).toContain('Returned lived report · captured before comparison')
    expect(client).toContain('Compare only after capture')
    expect(client).toContain('data-pattern-comparison')
    expect(client).toContain('{PROVISIONAL_PATTERN}')
    expect(PROVISIONAL_PATTERN).toContain('chapter transitions create continuity friction')
  })

  it('declares hidden reranking impermissible', () => {
    expect(client).toContain('Hidden reranking')
    expect(client).toContain('Not allowed.')
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
