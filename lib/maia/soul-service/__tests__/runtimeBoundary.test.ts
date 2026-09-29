import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const route = fs.readFileSync(
  path.join(root, 'app/api/maia/soul-service/frame-pilot/route.ts'),
  'utf8',
)

describe('Soul-Service frame pilot runtime boundary', () => {
  it('is production closed', () => {
    expect(route).toContain("process.env.NODE_ENV === 'production'")
    expect(route).toContain("error: 'NOT_AVAILABLE'")
  })

  it('uses the local model seam and no durable conversation/memory stores', () => {
    expect(route).toContain("generateWithLocalModel")
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
      'recordConsentState',
      'getMaiaResponse',
    ]) {
      expect(route).not.toContain(forbidden)
    }
  })

  it('declares no persistence in both request metadata and response', () => {
    expect(route).toContain("persistence: 'none'")
    expect(route).toContain("memory: 'none'")
  })
})
