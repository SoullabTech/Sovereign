import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const route = fs.readFileSync(
  path.join(
    root,
    'app/api/maia/soul-service/reality-veto-pilot/route.ts',
  ),
  'utf8',
)

describe('Soul-Service 03B runtime boundary', () => {
  it('is production closed', () => {
    expect(route).toContain("process.env.NODE_ENV === 'production'")
    expect(route).toContain("error: 'NOT_AVAILABLE'")
  })

  it('uses local generation without conversation or memory stores', () => {
    expect(route).toContain('generateWithLocalModel')
    for (const forbidden of [
      'TurnsStore',
      'pool.query',
      'INSERT INTO',
      'UPDATE ',
      'conversation_turns',
      'memoryBundle',
      'memoryContext',
      'observeRelationalContent',
      'persistDetectedSignal',
      'getMaiaResponse',
    ]) {
      expect(route).not.toContain(forbidden)
    }
  })

  it('declares no persistence or memory in request metadata', () => {
    expect(route).toContain("persistence: 'none'")
    expect(route).toContain("memory: 'none'")
  })

  it('accepts only expectation and consequence as cognitive input', () => {
    expect(route).toContain("body?.expectation")
    expect(route).toContain("body?.consequence")
    expect(route).not.toContain('memberId')
    expect(route).not.toContain('sessionId')
  })
})
