/**
 * LIVING-FIELD-PAGE-IDENTITY-AUTHORITY-01
 *
 * The member-facing Living Field must resolve runtime identity from the
 * verified server session, not from browser storage.
 */
import fs from 'node:fs'
import path from 'node:path'

const PAGE = path.join(process.cwd(), 'app/maia/living-field/page.tsx')
const source = fs.readFileSync(PAGE, 'utf8')

describe('LIVING-FIELD-PAGE-IDENTITY-AUTHORITY-01', () => {
  it('does not use the local-storage member helper as identity authority', () => {
    expect(source).not.toContain('getValidMemberId')
    expect(source).toContain('verifyServerIdentity')
  })

  it('uses the server-verified member id as the page admission identity', () => {
    expect(source).toContain('const verifiedMemberId = identity.serverMemberId')
    expect(source).toContain('setMemberId(verifiedMemberId)')
    expect(source).not.toContain('memberId={memberId}')
  })

  it('aligns a stale compatibility claim only after server verification', () => {
    const serverProof = source.indexOf('const verifiedMemberId = identity.serverMemberId')
    const alignment = source.indexOf("localStorage.setItem('memberId', verifiedMemberId)")
    const fieldFetch = source.indexOf("apiFetch('/api/maia/living-field')")
    expect(serverProof).toBeGreaterThan(-1)
    expect(alignment).toBeGreaterThan(serverProof)
    expect(fieldFetch).toBeGreaterThan(alignment)
  })

  it('does not treat an unreachable identity authority as signed-out', () => {
    expect(source).toContain("identity.parity === 'unknown'")
    expect(source).toContain('setIdentityUnavailable(true)')
    expect(source.indexOf('if (identityUnavailable')).toBeLessThan(
      source.indexOf('if (!memberId)')
    )
  })
})
