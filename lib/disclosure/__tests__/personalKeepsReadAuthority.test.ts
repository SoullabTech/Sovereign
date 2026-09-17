/**
 * J5-3 — request authority + one receipt per Personal Keep object.
 *
 * No Keep content crosses here. This seam may establish authority and return
 * receipt-backed Keep identities only; projection/cognition belongs to J5-4.
 */
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { MintOutcome } from '../contextDisclosureReceipt';
import { authorizePersonalKeepsRead } from '../personalKeepsReadAuthority';

const normal = TurnPosture.resolve({ sanctuary: false });
const sanctuary = TurnPosture.resolve({ sanctuary: true });

function deps(over: Record<string, unknown> = {}) {
  let n = 0;
  return {
    requireConsent: jest.fn(async () => ({ kind: 'ready', requestId: 'req-1' } as const)),
    selectRefs: jest.fn(async () => [
      { id: 'keep-1', kept_at: new Date('2026-09-03T00:00:00Z') },
      { id: 'keep-2', kept_at: new Date('2026-09-02T00:00:00Z') },
    ]),
    mintReceipt: jest.fn(async (attempt: any) => ({ kind: 'minted', id: `r-${String(attempt.disclosureId).split('-').pop()}`, disclosureId: attempt.disclosureId } as MintOutcome)),
    makeDisclosureId: jest.fn(() => `d-${++n}`),
    ...over,
  } as any;
}

const input = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', memberId: 'member-1', sessionId: 'session-1',
  posture: normal, filterText: null as string | null, ...over,
});

describe('authority before selection', () => {
  it('refuses Sanctuary before selector or receipt activity', async () => {
    const d = deps();
    const out = await authorizePersonalKeepsRead(input({ posture: sanctuary }), d);
    expect(out.kind).toBe('sanctuary_refused');
    expect(d.requireConsent).not.toHaveBeenCalled();
    expect(d.selectRefs).not.toHaveBeenCalled();
    expect(d.mintReceipt).not.toHaveBeenCalled();
  });

  it('a missing consent precondition means selector never runs', async () => {
    const d = deps({ requireConsent: jest.fn(async () => ({ kind: 'unavailable', reason: 'down' } as const)) });
    const out = await authorizePersonalKeepsRead(input(), d);
    expect(out.kind).toBe('consent_refused');
    expect(d.selectRefs).not.toHaveBeenCalled();
    expect(d.mintReceipt).not.toHaveBeenCalled();
  });

  it('uses the same request/member/session/posture at the awaited consent precondition', async () => {
    const d = deps();
    await authorizePersonalKeepsRead(input(), d);
    expect(d.requireConsent).toHaveBeenCalledWith({
      requestId: 'req-1', memberId: 'member-1', sessionId: 'session-1', posture: normal,
    });
  });
});

describe('one receipt per admitted Keep identity', () => {
  it('selects only after consent and passes the member-authored filter', async () => {
    const order: string[] = [];
    const d = deps({
      requireConsent: jest.fn(async () => { order.push('consent'); return { kind: 'ready', requestId: 'req-1' } as const; }),
      selectRefs: jest.fn(async () => { order.push('select'); return [{ id: 'keep-1', kept_at: new Date() }]; }),
      mintReceipt: jest.fn(async () => { order.push('mint'); return { kind: 'minted', id: 'r-1', disclosureId: 'd-1' } as MintOutcome; }),
    });
    await authorizePersonalKeepsRead(input({ filterText: 'grief' }), d);
    expect(order).toEqual(['consent', 'select', 'mint']);
    expect(d.selectRefs).toHaveBeenCalledWith({ memberId: 'member-1', text: 'grief', limit: 5 });
  });

  it('mints no receipt for an empty qualifying set', async () => {
    const d = deps({ selectRefs: jest.fn(async () => []) });
    const out = await authorizePersonalKeepsRead(input(), d);
    expect(out).toEqual({ kind: 'authorized_empty', requestId: 'req-1' });
    expect(d.mintReceipt).not.toHaveBeenCalled();
  });

  it('mints one object receipt per Keep ref — never one batch receipt', async () => {
    const d = deps();
    const out = await authorizePersonalKeepsRead(input(), d);
    expect(out.kind).toBe('authorized');
    expect(d.mintReceipt).toHaveBeenCalledTimes(2);
    expect(d.mintReceipt.mock.calls.map((c: any[]) => c[0])).toEqual([
      expect.objectContaining({
        disclosureId: 'd-1', memberId: 'member-1', requestRef: 'req-1',
        boundary: 'maia.personal_keeps_read->maia_cognition', sourceClass: 'keep',
        participationBasis: 'member_invoked', sourceRef: 'keep-1', scopeKind: 'object',
        gesture: 'read_personal_keeps',
      }),
      expect.objectContaining({
        disclosureId: 'd-2', memberId: 'member-1', requestRef: 'req-1',
        boundary: 'maia.personal_keeps_read->maia_cognition', sourceClass: 'keep',
        participationBasis: 'member_invoked', sourceRef: 'keep-2', scopeKind: 'object',
        gesture: 'read_personal_keeps',
      }),
    ]);
    for (const [attempt] of d.mintReceipt.mock.calls as any) {
      expect(attempt.sectionRef).toBeUndefined();
      expect(JSON.stringify(attempt)).not.toMatch(/title|body|filter|grief/i);
    }
  });

  it('any receipt refusal stops the act and leaves already-minted attempts visible', async () => {
    let call = 0;
    const d = deps({ mintReceipt: jest.fn(async () => {
      call += 1;
      return call === 1
        ? ({ kind: 'minted', id: 'r-1', disclosureId: 'd-1' } as MintOutcome)
        : ({ kind: 'unavailable' } as MintOutcome);
    }) });
    const out = await authorizePersonalKeepsRead(input(), d);
    expect(out).toEqual(expect.objectContaining({
      kind: 'receipt_refused',
      attempted: [{ keepRef: 'keep-1', disclosureId: 'd-1', receiptId: 'r-1' }],
      failedKeepRef: 'keep-2',
    }));
  });

  it('returns receipt-backed identities only — no Keep projection/content', async () => {
    const d = deps();
    const out = await authorizePersonalKeepsRead(input(), d);
    expect(out).toEqual({
      kind: 'authorized', requestId: 'req-1',
      authorized: [
        { keepRef: 'keep-1', disclosureId: 'd-1', receiptId: 'r-1' },
        { keepRef: 'keep-2', disclosureId: 'd-2', receiptId: 'r-2' },
      ],
    });
    expect(JSON.stringify(out)).not.toMatch(/title|body|sourceType|snippet/i);
  });
});


describe('J5-3 containment — authority is not cognition', () => {
  it('does not resolve Keep projection or confirm a crossing', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', 'personalKeepsReadAuthority.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/resolvePersonalKeep|getMaiaResponse|confirmDisclosureCrossed/);
    expect(code).not.toMatch(/\.title|bodySnippet|sourceType/);
  });

  it('is not wired into the live MAIA route before J5-4', () => {
    const fs = require('fs');
    const path = require('path');
    const route = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'app/api/sovereign/app/maia/list/route.ts'),
      'utf8',
    );
    expect(route).not.toMatch(/personalKeepsReadAuthority|authorizePersonalKeepsRead/);
  });
});
