import { acknowledgeLocalManuscriptRemoval } from './pendingErasureAcknowledgement';

describe('R20-R8 fail-closed member erasure acknowledgements', () => {
  it.each([true, false])(
    'never certifies permanent erasure when local Source sweep=%s',
    (sweptAll) => {
      const result = acknowledgeLocalManuscriptRemoval(sweptAll);
      expect(result).toEqual({
        removed: true,
        erasureStatus: 'pending',
        vaultSweepCompleted: sweptAll,
        historicalCopiesVerified: false,
        independentSignerCertified: false,
        permanentErasureCertified: false,
      });
      expect(Object.isFrozen(result)).toBe(true);
    },
  );

  it('rejects untyped or invented evidence rather than returning completion', () => {
    for (const bad of [undefined, null, 'true', { success: true }, 1]) {
      expect(() => acknowledgeLocalManuscriptRemoval(bad as unknown as boolean)).toThrow(
        'R20 erasure acknowledgment refused',
      );
    }
  });

  it('has no completion switch triggered by release-shaped environment flags', () => {
    const original = process.env.R20_ERASURE_COMPLETE;
    process.env.R20_ERASURE_COMPLETE = 'true';
    try {
      const result = acknowledgeLocalManuscriptRemoval(true);
      expect(result.erasureStatus).toBe('pending');
      expect(result.permanentErasureCertified).toBe(false);
    } finally {
      if (original === undefined) delete process.env.R20_ERASURE_COMPLETE;
      else process.env.R20_ERASURE_COMPLETE = original;
    }
  });
});

describe('R20-R8 route-binding refusal boundary', () => {
  it('online manuscript DELETE only acknowledges 202 pending, not completed erasure', () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const route = readFileSync(resolve(process.cwd(), 'app/api/sovereign/manuscripts/[id]/route.ts'), 'utf8');
    const online = route.slice(route.indexOf('const outcome = await eraseManuscript'));
    expect(online).toContain('acknowledgeLocalManuscriptRemoval(outcome.sweptAll)');
    expect(online).toMatch(/acknowledgeLocalManuscriptRemoval\(outcome\.sweptAll\),\s*\{ status: 202 \}/);
    expect(online).not.toContain('return NextResponse.json({ removed: true });');
  });

  it('does not claim archived member data is gone in routine deletion logs', () => {
    const { readFileSync } = require('node:fs');
    const { resolve } = require('node:path');
    const route = readFileSync(resolve(process.cwd(), 'app/api/sovereign/manuscripts/[id]/route.ts'), 'utf8');
    const online = route.slice(route.indexOf('const outcome = await eraseManuscript'));
    expect(online).toContain('backupErasureStatus: pending');
    expect(online).not.toContain('manuscript erased');
    expect(online).not.toContain('memberRef(memberId)');
  });
});
