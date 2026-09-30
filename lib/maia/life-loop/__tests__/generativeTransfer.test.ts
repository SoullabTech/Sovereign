import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  shouldImportHistoricalPattern,
  transferableCapacity,
  transferStateAfterReshaping,
  transferStateAfterSelection,
} from '../generativeTransfer'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/generative-transfer/GenerativeTransferWitnessClient.tsx'),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/generative-transfer/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03G generative capacity transfer', () => {
  it('transfers capacity form without source context or pattern', () => {
    expect(transferableCapacity('inspect_continuity')).toMatchObject({
      capacityId: 'inspect_continuity',
      sourceContextImported: false,
      patternImported: false,
    })
  })

  it('requires member selection before transfer state changes', () => {
    expect(transferStateAfterSelection()).toBe('MEMBER_SELECTED')
  })

  it('recognizes member reshaping as a later transfer state', () => {
    expect(transferStateAfterReshaping()).toBe('MEMBER_RESHAPED')
  })

  it('does not import historical pattern unless explicitly requested', () => {
    expect(shouldImportHistoricalPattern({ memberExplicitlyRequestsHistoricalPattern: false })).toBe(false)
    expect(shouldImportHistoricalPattern({ memberExplicitlyRequestsHistoricalPattern: true })).toBe(true)
  })

  it('presents the novel context before any old pattern is applied', () => {
    expect(client.indexOf('Novel context · teaching sequence')).toBeLessThan(
      client.indexOf('Inspect original learning context'),
    )
  })

  it('requires explicit member initiation to open the capacity palette', () => {
    expect(client).toContain('Use a capacity I already know')
    expect(client).toContain('Member-opened capacity palette')
  })

  it('allows member-authored reshaping', () => {
    expect(client).toContain('Use my wording here')
    expect(client).toContain('Member-shaped capacity expression · current context')
    expect(client).toContain('Your wording belongs to this')
    expect(client).toContain('use, not to a global skill taxonomy.')
  })

  it('keeps original pattern explicitly historical and unimported', () => {
    expect(client).toContain('Historical only · retired pattern')
    expect(client).toContain('was not used to interpret the teaching sequence')
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
