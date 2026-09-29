import { describe, expect, it } from 'vitest'
import {
  buildRealityVetoSystemPrompt,
  grammarForRealityRelation,
  validateRealityVetoOutput,
} from '../realityVeto'

describe('Soul-Service 03B reality-veto contract', () => {
  it('limits MAIA to a four-value evidence relationship', () => {
    const prompt = buildRealityVetoSystemPrompt()
    expect(prompt).toContain('supports')
    expect(prompt).toContain('complicates')
    expect(prompt).toContain('contradicts')
    expect(prompt).toContain('insufficient')
    expect(prompt).toContain('Do not generate prose')
    expect(prompt).toContain('Do not rescue a contradicted expectation')
    expect(prompt).toContain('exact central proposition')
    expect(prompt).toContain('different local problem is NOT partial support')
  })

  it('accepts a governed contradiction relation', () => {
    expect(
      validateRealityVetoOutput(
        JSON.stringify({ relation: 'contradicts' }),
      ),
    ).toBe('contradicts')
  })

  it('rejects model-authored interpretations', () => {
    expect(() =>
      validateRealityVetoOutput(
        JSON.stringify({
          relation: 'growth',
          explanation: 'The member learned something.',
        }),
      ),
    ).toThrow('REALITY_VETO_RELATION_INVALID')
  })

  it('renders member-facing language from server grammar', () => {
    const comparison = grammarForRealityRelation('contradicts')
    expect(comparison.label).toBe('Contradicts as stated')
    expect(comparison.statement).toContain('does not support')
    expect(comparison.implication).toContain('weakening')
    expect(comparison.standing).toBe('MAIA_EVIDENCE_COMPARISON')
  })

  it('does not let a contradiction become a general law', () => {
    const comparison = grammarForRealityRelation('contradicts')
    expect(comparison.statement).not.toContain('always')
    expect(comparison.statement).not.toContain('proves')
  })
})
