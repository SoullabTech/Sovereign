/**
 * An erasure surface may not report an outcome it did not produce.
 *
 * F5 REPAIR — MEMBER-VISIBLE TRUTH (founder act, 2026-09-20). Sibling of
 * accountDeletionHonesty.test.ts, which covers /api/members/delete-account.
 * This file covers the three surfaces that adjudication left telling members
 * something untrue:
 *
 *   1. POST /api/sovereignty/delete-my-memory — its catch branch returned
 *      { success: true, ... 'your request has been queued' }. Nothing was
 *      queued by that branch, and the five tables it targeted are absent from
 *      the deployed migration path.
 *   2. components/account/AccountSettings.tsx — branched on res.ok alone, so
 *      the server's governed 409 refusal never reached the member (F5 §4).
 *   3. lib/storage/sovereign.ts requestDataDeletion() — logged and returned
 *      { success: true } without requesting anything.
 *
 * The governing requirement, from the adjudication §4:
 *
 *   > An erasure refusal is not complete merely because the server knows why
 *   > it refused. The member must receive the governed reason and an
 *   > unambiguous statement of whether anything changed.
 *
 * WHAT THIS PROVES: none of these three surfaces can report a deletion that
 * did not happen, and a refusal reaches the member with its reason.
 * WHAT IT DOES NOT PROVE: that erasure works. It does not.
 * F5 ERASURE CONFORMANCE remains FAIL / STOP
 * (docs/programme/F5_ERASURE_TRACE_ADJUDICATION_2026-09-17.md).
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const root = (rel: string) => path.resolve(__dirname, '../../..', rel);
/** Comments describe the old behaviour verbatim; strip them before asserting. */
const stripped = (rel: string) =>
  readFileSync(root(rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

// ---------------------------------------------------------------------------
// 1. The memory-erasure route

const MEMORY_ROUTE = 'app/api/sovereignty/delete-my-memory/route.ts';

describe('delete-my-memory claims nothing it did not do', () => {
  const code = stripped(MEMORY_ROUTE);

  it('never returns a true success flag', () => {
    expect(code).not.toMatch(/success:\s*true/);
  });

  it('never claims a request was queued', () => {
    expect(code).not.toMatch(/queued/i);
  });

  it('no longer reaches the Express-era deletion service', () => {
    expect(code).not.toMatch(/delete-memory-api/);
  });

  it('does not name the five tables absent from the deployed migration path', () => {
    for (const t of [
      'elemental_evolution',
      'wisdom_moments',
      'ain_consciousness_memory',
      'elemental_personalities',
      'maia_adaptations',
    ]) {
      expect({ table: t, referenced: code.includes(t) }).toEqual({
        table: t,
        referenced: false,
      });
    }
  });

  it('refuses truthfully, stating that nothing changed', async () => {
    const { POST } = await import('@/app/api/sovereignty/delete-my-memory/route');
    const res = await POST({ json: async () => ({}), headers: new Headers() } as any);

    expect(res.status).toBe(503);
    const body: any = await res.json();
    expect({
      success: body.success,
      accountChanged: body.accountChanged,
      deleted: body.deleted,
      hasNextStep: typeof body.nextStep === 'string' && body.nextStep.length > 0,
      saysNothingChanged: /nothing has been changed|not been changed/i.test(body.message),
    }).toEqual({
      success: false,
      accountChanged: false,
      deleted: false,
      hasNextStep: true,
      saysNothingChanged: true,
    });
  });

  it('ignores the confirmation phrase rather than implying it authorizes anything', () => {
    expect(code).not.toMatch(/DELETE ALL MY CONSCIOUSNESS DATA/);
  });
});

// ---------------------------------------------------------------------------
// 2. The member-facing client

const SETTINGS = 'components/account/AccountSettings.tsx';

describe('Account Settings renders the governed refusal', () => {
  const code = stripped(SETTINGS);

  it('reads the response body on a non-ok deletion, not res.ok alone', () => {
    // The handler must surface something to the member on refusal.
    expect(code).toMatch(/setDeleteNotice\(/);
  });

  it('renders the retained content classes the server names', () => {
    expect(code).toMatch(/deleteNotice\.retained/);
  });

  it('states plainly when nothing changed', () => {
    expect(code).toMatch(/Nothing has been changed or removed/);
  });

  it('treats only an explicit accountChanged: true as a change', () => {
    expect(code).toMatch(/accountChanged\s*===\s*true/);
  });

  it('distinguishes "nothing changed" from "we cannot tell"', () => {
    // A transport failure must not render as a confident no-op: that is the
    // same false certainty this lane removed, pointed the other way.
    expect(code).toMatch(/changed:\s*'unknown'/);
    expect(code).toMatch(/can't confirm whether anything changed/);
  });

  it('clears a stale notice when a new attempt begins', () => {
    expect(code).toMatch(/setDeleteNotice\(null\)/);
  });

  it('no longer promises to delete all associated data', () => {
    expect(code).not.toMatch(/all associated data/i);
  });
});

// ---------------------------------------------------------------------------
// 3. The client-side stub

describe('requestDataDeletion cannot report a success it never requested', () => {
  it('throws rather than returning a success flag', async () => {
    const mod = await import('@/lib/storage/sovereign');
    await expect(mod.requestDataDeletion('member-1')).rejects.toThrow(/not implemented/i);
  });
});
