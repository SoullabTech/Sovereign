import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/enactive-life-loop/EnactiveLifeLoopWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/enactive-life-loop/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03 enactive life loop witness', () => {
  it('keeps the action explicitly member-authored', () => {
    expect(client).toContain('Member-authored action')
    expect(client).toContain('The action is yours.')
    expect(client).toContain('Action authorship')
    expect(client).toContain('member-authored')
  })

  it('separates expectation from returned consequence', () => {
    expect(client).toContain('What I expect')
    expect(client).toContain('Expected')
    expect(client).toContain('Observed')
    expect(client).toContain('member report · new evidence')
  })

  it('defines materially distinct confirming, disconfirming, and ambiguous outcomes', () => {
    expect(client).toContain("confirming:")
    expect(client).toContain("disconfirming:")
    expect(client).toContain("ambiguous:")
    expect(client).toContain('Current frame still plausible')
    expect(client).toContain('Prior frame weakened')
    expect(client).toContain('Not enough evidence')
  })

  it('allows life to weaken the prior frame', () => {
    expect(client).toContain(
      'The expectation that another revision was required before sharing is weakened by what actually happened.',
    )
  })

  it('preserves uncertainty when the return is ambiguous', () => {
    expect(client).toContain(
      'The return does not meaningfully confirm or disconfirm the readiness frame.',
    )
    expect(client).toContain(
      'The evidence needed to evaluate the central uncertainty has not yet arrived.',
    )
  })

  it('does not automatically label outcomes as growth or success', () => {
    expect(client).toContain(
      'No outcome is automatically called growth, success, healing, or progress.',
    )
  })

  it('keeps member meaning optional after revision', () => {
    expect(client).toContain('My revised question or meaning · optional')
    expect(client).toContain('Leave this blank if the meaning is not ready yet.')
  })

  it('keeps the witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
