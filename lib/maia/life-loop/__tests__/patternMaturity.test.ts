import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/pattern-maturity/PatternMaturityWitnessClient.tsx',
  ),
  'utf8',
)
const derivation = fs.readFileSync(
  path.join(root, 'lib/maia/life-loop/patternMaturity.ts'),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/pattern-maturity/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03C lived-evidence maturity witness', () => {
  it('preserves five distinct evidence events with source/context/independence standing', () => {
    for (const id of ['event-1', 'event-2', 'event-3', 'event-4', 'event-5']) {
      expect(client).toContain(`id: '${id}'`)
    }
    expect(client).toContain('sourceStanding:')
    expect(client).toContain('contextGroup:')
    expect(client).toContain('independenceKey:')
    expect(client).toContain('data-evidence-event')
  })

  it('weakens the broad proposition when contradiction arrives', () => {
    expect(derivation).toContain(
      'The broad proposition is now contradicted by relevant lived evidence.',
    )
    expect(derivation).toContain(
      'Do not preserve the broad claim merely because it came first.',
    )
  })

  it('permits a narrower context-bounded proposition without preserving the broad claim', () => {
    expect(client).toContain(
      'Some chapter transitions create continuity friction even when the core idea is clear.',
    )
    expect(derivation).toContain(
      'The broader “core idea is lost” claim has been weakened and replaced by a narrower working proposition.',
    )
  })

  it('keeps the Event 4 counterexample first-class after later support appears', () => {
    expect(client).toContain("relations: ['counterexample_narrow']")
    expect(derivation).toContain('The counterexample limits scope; it is not decorative.')
    expect(client).toContain(
      'Event 4 remains visible even after a provisional narrower pattern appears.',
    )
  })

  it('uses proposition maturity states without turning them into member levels', () => {
    for (const state of [
      'SINGLE_OBSERVATION',
      'RECURRENCE_CANDIDATE',
      'CONTESTED_RECURRENCE',
      'CONTEXT_BOUNDED_RECURRENCE',
      'PROVISIONAL_PATTERN',
      'UNRESOLVED',
    ]) {
      expect(derivation).toContain(state)
    }
    expect(client).toContain('proposition state · not a member level')
  })

  it('contains no fixed-count promotion rule', () => {
    expect(client).toContain('No magic count')
    expect(client).toContain('no number promotes evidence automatically')
    expect(derivation).not.toContain('events.length >= 5')
    expect(derivation).not.toContain('events.length === 5')
    expect(derivation).toContain('narrowContextGroups.size >= 2')
    expect(derivation).toContain('narrowIndependentObservations.size >= 2')
  })

  it('lets the member decline the pattern while preserving the events', () => {
    expect(client).toContain('Decline this pattern')
    expect(client).toContain('Do not keep this as a pattern for me.')
    expect(client).toContain(
      'The events remain evidence. The proposed pattern does not gain personal standing.',
    )
  })

  it('permits unresolved as a complete outcome', () => {
    expect(client).toContain('Leave the larger pattern unresolved.')
    expect(client).toContain(
      'Evidence can remain accumulated without being forced into a broader claim.',
    )
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
