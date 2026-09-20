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
import { execSync } from 'child_process';
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

// ---------------------------------------------------------------------------
// 4. The consent surface (F5-REPAIR-02, 2026-09-20)
//
// The panel offered seven storage controls. Exactly one was enforced anywhere
// (`audioServer`, at app/api/journal/quick/audio/route.ts:176). The other six —
// three "Device" buttons carrying the local_only affordance, two non-audio
// "Server" buttons, and a "Sanctuary Mode Default" toggle promising that
// nothing would be saved — enforced nothing.
//
// A control that collects a sovereign decision the system cannot honour is the
// same defect as a success message for work that did not happen.

describe('the consent surface offers only what is enforced', () => {
  const code = stripped(SETTINGS);

  it('no longer offers device-only storage', () => {
    // The local_only affordance. No code path stores a data type on the device
    // instead of the server, or withholds a server write on its account.
    expect(code).not.toMatch(/<HardDrive[^>]*\/>\s*\n\s*Device/);
    expect(code).not.toMatch(/>\s*Device\s*</);
  });

  it('no longer offers a standing Sanctuary default', () => {
    // Per-SESSION sanctuary is real and enforced. This standing preference
    // wrote localStorage that only this panel read back, while promising
    // "no conversations, journals, transcripts, or audio saved".
    expect(code).not.toMatch(/updateSanctuaryDefault\(/);
    expect(code).not.toMatch(/Sanctuary Mode Default/);
  });

  it('keeps the one control that IS enforced', () => {
    // Removing a working consent control would reduce member sovereignty.
    expect(code).toMatch(/updateDataTypeConsent\('audio'/);
  });

  it('states what the member cannot control, rather than implying it', () => {
    expect(code).toMatch(/What you cannot control yet/);
    expect(code).toMatch(/Sanctuary works per session/);
  });

  it('does not claim deletion is complete', () => {
    expect(code).toMatch(/Deleting your account is also currently incomplete/);
  });
});

describe('updateStorageConsent cannot silently discard a consent change', () => {
  it('throws rather than resolving as though it persisted', async () => {
    const mod = await import('@/lib/storage/sovereign');
    await expect(mod.updateStorageConsent('member-1', {})).rejects.toThrow(/not implemented/i);
  });
});

describe('LocalFirstMemory stays quarantined', () => {
  it('is marked as dead code and not a capability', () => {
    const raw = readFileSync(root('lib/consciousness/LocalFirstMemory.ts'), 'utf8');
    expect(raw).toMatch(/QUARANTINED/);
    expect(raw).toMatch(/ZERO importers/);
  });

  it('has no importers — if this fails, someone wired dead code to a member path', () => {
    // The load-bearing assertion. The header comment stops a reader being
    // misled; this stops the file being used.
    const out = execSync(
      "grep -rl 'LocalFirstMemory' --include='*.ts' --include='*.tsx' lib app components 2>/dev/null || true",
      { cwd: root('.'), encoding: 'utf8' },
    )
      .split('\n')
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 0 &&
          !l.endsWith('lib/consciousness/LocalFirstMemory.ts') &&
          !l.includes('__tests__'), // this file names it in order to guard it
      );
    expect(out).toEqual([]);
  });
});
