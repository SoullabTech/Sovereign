import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CAPACITY_AFFORDANCES,
  capacityStateAfterMemberChoice,
  capacityStateAfterPatternRetirement,
  patternShouldGuideAttention,
} from '../capacityReorganization'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/capacity-reorganization/CapacityReorganizationWitnessClient.tsx'),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/capacity-reorganization/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03F capacity reorganization', () => {
  it('keeps capacity available after pattern retirement', () => {
    expect(capacityStateAfterPatternRetirement()).toBe('CAPACITY_AVAILABLE')
  })

  it('marks use as member-initiated after explicit choice', () => {
    expect(capacityStateAfterMemberChoice()).toBe('MEMBER_INITIATED')
  })

  it('prevents a retired pattern from guiding attention by default', () => {
    expect(patternShouldGuideAttention({
      patternRetired: true,
      memberExplicitlyReopenedHistoricalPattern: false,
    })).toBe(false)
  })

  it('allows historical inspection only after explicit reopening', () => {
    expect(patternShouldGuideAttention({
      patternRetired: true,
      memberExplicitlyReopenedHistoricalPattern: true,
    })).toBe(true)
  })

  it('uses general capacity questions rather than renamed pattern prompts', () => {
    expect(CAPACITY_AFFORDANCES.inspect_continuity.question).toContain('hold together')
    expect(CAPACITY_AFFORDANCES.seek_counterevidence.question).toContain('complicate')
    expect(Object.values(CAPACITY_AFFORDANCES).some((x) => x.question.includes('chapter transition'))).toBe(false)
  })

  it('keeps the retired pattern retired when capacity is chosen', () => {
    expect(client).toContain('The retired pattern remains retired.')
    expect(client).toContain('reconfirm the old proposition')
  })

  it('allows no tool at all', () => {
    expect(client).toContain('You can also use no tool at all.')
  })

  it('keeps history inspectable', () => {
    expect(client).toContain('Inspect historical pattern')
    expect(client).toContain('Historical pattern · no current prospective authority')
  })

  it('keeps the witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
