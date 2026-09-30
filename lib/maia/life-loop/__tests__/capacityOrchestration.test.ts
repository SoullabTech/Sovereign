import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SMALL_CAPACITY_OFFERS,
  limitCapacityOffers,
  orchestrationAfterMemberSelection,
  orchestrationAfterSecondMemberChoice,
  orchestrationWithoutSupport,
} from '../capacityOrchestration'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/capacity-orchestration/CapacityOrchestrationWitnessClient.tsx'),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/capacity-orchestration/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03H capacity orchestration', () => {
  it('supports no-support orchestration as a first-class mode', () => {
    expect(orchestrationWithoutSupport()).toBe('NO_SUPPORT')
  })

  it('marks direct member choice without MAIA ownership', () => {
    expect(orchestrationAfterMemberSelection()).toBe('MEMBER_SELECTED')
  })

  it('supports later sequencing without a checklist state', () => {
    expect(orchestrationAfterSecondMemberChoice()).toBe('MEMBER_SEQUENCED')
  })

  it('bounds MAIA offers to a small set', () => {
    expect(limitCapacityOffers(SMALL_CAPACITY_OFFERS, 3)).toHaveLength(3)
    expect(limitCapacityOffers([...SMALL_CAPACITY_OFFERS, ...SMALL_CAPACITY_OFFERS], 3)).toHaveLength(3)
  })

  it('keeps offers non-ranked in member-facing language', () => {
    expect(client).toContain('invited capacity menu · non-ranked')
    expect(client).toContain('None is the correct one.')
    expect(client).not.toContain('best capacity')
  })

  it('keeps none/right-now available in both direct and MAIA-assisted paths', () => {
    expect(client).toContain('Stay with this without a tool')
    expect(client).toContain('None right now')
  })

  it('does not frame sequential capacity use as a mandatory step', () => {
    expect(client).toContain('There is no next step.')
    expect(client).not.toContain('Step 2')
  })

  it('clears rejected MAIA offer standing', () => {
    expect(client).toContain("MAIA's offered set has no standing after rejection.")
  })

  it('shows no hidden ranking or developmental score', () => {
    expect(client).toContain('Hidden ranking')
    expect(client).toContain('Developmental score')
    expect(client).toContain('None.')
  })

  it('keeps the witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
