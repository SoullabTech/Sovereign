import { describe, expect, it } from 'vitest'
import {
  derivePatternMaturity,
  type PatternEvidence,
} from '../patternMaturity'

function event(
  id: string,
  contextGroup: string,
  independenceKey: string,
  relations: PatternEvidence['relations'],
): PatternEvidence {
  return { id, contextGroup, independenceKey, relations }
}

describe('lived-evidence pattern maturity derivation', () => {
  it('keeps one event as a single observation', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['supports_broad']),
    ])
    expect(result.state).toBe('SINGLE_OBSERVATION')
  })

  it('lets contradiction weaken the broad proposition before a narrower recurrence is earned', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['supports_broad']),
      event('e2', 'chapter-a', 'reader-2', ['contradicts_broad', 'supports_narrow']),
    ])
    expect(result.state).toBe('CONTESTED_RECURRENCE')
    expect(result.propositionKind).toBe('broad')
  })

  it('recognizes same-context independent recurrence as context bounded', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['supports_broad']),
      event('e2', 'chapter-a', 'reader-2', ['contradicts_broad', 'supports_narrow']),
      event('e3', 'chapter-a', 'reader-3', ['supports_narrow']),
    ])
    expect(result.state).toBe('CONTEXT_BOUNDED_RECURRENCE')
    expect(result.propositionKind).toBe('narrow')
  })

  it('five same-context repetitions do not become provisional merely because there are five', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['supports_narrow']),
      event('e2', 'chapter-a', 'reader-2', ['supports_narrow']),
      event('e3', 'chapter-a', 'reader-3', ['supports_narrow']),
      event('e4', 'chapter-a', 'reader-4', ['supports_narrow']),
      event('e5', 'chapter-a', 'reader-5', ['supports_narrow']),
    ])
    expect(result.state).toBe('CONTEXT_BOUNDED_RECURRENCE')
  })

  it('cross-context differentiated support can earn provisional standing with fewer total events', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['contradicts_broad', 'supports_narrow']),
      event('e2', 'chapter-b', 'reader-2', ['supports_narrow']),
      event('e3', 'chapter-a', 'reader-3', ['counterexample_narrow']),
    ])
    expect(result.state).toBe('PROVISIONAL_PATTERN')
    expect(result.propositionKind).toBe('narrow')
  })

  it('repeated reports tied to one independence key do not masquerade as independent recurrence', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'same-reader', ['supports_narrow']),
      event('e2', 'chapter-b', 'same-reader', ['supports_narrow']),
      event('e3', 'chapter-c', 'same-reader', ['supports_narrow']),
    ])
    expect(result.state).toBe('RECURRENCE_CANDIDATE')
  })

  it('preserves a first-class counterexample while allowing cross-context provisional support', () => {
    const result = derivePatternMaturity([
      event('e1', 'chapter-a', 'reader-1', ['supports_narrow']),
      event('e2', 'chapter-a', 'reader-2', ['counterexample_narrow']),
      event('e3', 'chapter-b', 'reader-3', ['supports_narrow']),
    ])
    expect(result.state).toBe('PROVISIONAL_PATTERN')
    expect(result.note).toContain('provisional')
  })

  it('returns unresolved when there is no evidence', () => {
    expect(derivePatternMaturity([]).state).toBe('UNRESOLVED')
  })
})
