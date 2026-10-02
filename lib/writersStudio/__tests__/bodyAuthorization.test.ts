/**
 * S3 · P1 · step 5 — the helper tells the truth, or it fails here.
 *
 *   ⭐ `DisclosureFact` exists so copy can be REQUIRED to carry a fact rather
 *     than trusted to have been written kindly.
 *
 * ⛔ THE HELPER IS PRESENTATION ONLY. These tests also hold it to that: it mints
 * nothing, fetches nothing, and holds no interaction state.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { viewFor, nameSections, authorizeRequest, type BodyProtocolOutcome } from '../bodyAuthorization';

const S = { sectionId: 'sec-1', heading: 'The Lighthouse Keeper', label: 'The Lighthouse Keeper' };
const T = { sectionId: 'sec-2', heading: null, label: 'Section 7' };

describe('every outcome the route can produce has a view', () => {
  const all: BodyProtocolOutcome[] = [
    { kind: 'BODY_AUTHORITY_REQUIRED', sections: [S], pendingAskRef: 'p' },
    { kind: 'BODY_SCOPE_INCOMPLETE', outstanding: [T], pendingAskRef: 'p' },
    { kind: 'DISCLOSURE_UNAVAILABLE', actSpent: true, sections: [S] },
    { kind: 'BODY_UNVERIFIABLE' },
    { kind: 'ACT_ALREADY_PROCESSED', completion: 'completed' },
    { kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' },
    { kind: 'ALREADY_CONSUMED', completion: 'incomplete' },
    { kind: 'PENDING_EXPIRED' },
    { kind: 'PENDING_UNKNOWN' },
    { kind: 'PENDING_MISMATCH' },
    { kind: 'PENDING_UNAVAILABLE' },
    { kind: 'DECLINED' },
    { kind: 'BODY_AUTHORIZED' },
  ];

  it('⭐ nothing renders empty except the successful continuation', () => {
    for (const o of all) {
      const v = viewFor(o);
      if (o.kind === 'BODY_AUTHORIZED') { expect(v.message).toBe(''); continue; }
      expect(v.message.length).toBeGreaterThan(20);
    }
  });

  it('⛔ no view ever says "passage"', () => {
    for (const o of all) expect(viewFor(o).message.toLowerCase()).not.toContain('passage');
  });

  it('⛔ no view ever renders a UUID', () => {
    for (const o of all) {
      expect(viewFor(o).message).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
    }
  });
});

describe('the states that must never blur', () => {
  it('⭐⭐ DISCLOSURE_UNAVAILABLE carries all three facts', () => {
    const v = viewFor({ kind: 'DISCLOSURE_UNAVAILABLE', actSpent: true, sections: [S] });
    expect(v.facts).toEqual(
      expect.arrayContaining(['authorization_happened', 'nothing_was_read', 'new_act_required']));
    /* ⛔ Reporting only the failure would leave the writer believing their
       authorization still stands. */
    expect(v.message).toMatch(/nothing from your writing was read/i);
    expect(v.message).toMatch(/needs a new one/i);
  });

  it('⭐ BODY_UNVERIFIABLE says permission held and recovery failed', () => {
    const v = viewFor({ kind: 'BODY_UNVERIFIABLE' });
    expect(v.facts).toEqual(['permission_established', 'evidence_unverifiable']);
    expect(v.message).toMatch(/you allowed the reading/i);
  });

  it('⛔ the two do not share copy', () => {
    const a = viewFor({ kind: 'DISCLOSURE_UNAVAILABLE', actSpent: true, sections: [S] }).message;
    const b = viewFor({ kind: 'BODY_UNVERIFIABLE' }).message;
    expect(a).not.toEqual(b);
    expect(a.toLowerCase()).not.toContain('verify');
    expect(b.toLowerCase()).not.toContain('boundary');
  });

  it('⭐⭐ ACT_ALREADY_PROCESSED never implies the Ask succeeded or failed by kind alone', () => {
    const done = viewFor({ kind: 'ACT_ALREADY_PROCESSED', completion: 'completed' });
    const notDone = viewFor({ kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' });
    /* Same kind, different completion → different copy. The kind alone says
       only that the act was recognised. */
    expect(done.message).not.toEqual(notDone.message);
    expect(done.message).toMatch(/already has it/i);
    expect(notDone.message).toMatch(/didn't finish/i);
  });

  it('⛔ the same press is never described as reusing a spent permission', () => {
    const v = viewFor({ kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' });
    expect(v.message).toMatch(/the same permission you just gave/i);
    expect(v.message.toLowerCase()).not.toContain('already been used');
  });
});

describe('retry_same and reauthorize are different offers', () => {
  it('⭐ a spent act offers REAUTHORIZE', () => {
    expect(viewFor({ kind: 'DISCLOSURE_UNAVAILABLE', actSpent: true, sections: [S] }).act)
      .toBe('reauthorize');
  });
  it('⭐ an un-openable resume offers RETRY_SAME', () => {
    expect(viewFor({ kind: 'PENDING_UNAVAILABLE' }).act).toBe('retry_same');
  });
});

describe('sections are named, never identified', () => {
  it('uses the label, not the id', () => {
    expect(nameSections([S])).toBe('The Lighthouse Keeper');
    expect(nameSections([S, T])).toBe('The Lighthouse Keeper and Section 7');
  });
  it('⭐ a section with no authored heading is still nameable', () => {
    expect(nameSections([T])).toBe('Section 7');
  });
});

describe('the helper is presentation only', () => {
  const SRC = readFileSync(join(__dirname, '..', 'bodyAuthorization.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('⛔ it mints no identity', () => {
    expect(SRC).not.toMatch(/randomUUID|crypto\.|Math\.random|nanoid/);
  });
  it('⛔ it makes no network call', () => {
    expect(SRC).not.toMatch(/fetch\(|apiFetch\(/);
  });
  it('⛔ it holds no interaction state', () => {
    expect(SRC).not.toMatch(/useState|useRef|useEffect/);
  });
});

describe('the ACT 3 request', () => {
  it('⭐ carries the actId it was GIVEN, and section identities only', () => {
    const body = authorizeRequest({
      pendingAskRef: 'p-1', sectionIds: [S.sectionId], actId: 'act-abcdefgh', question: 'why?',
    });
    expect(body).toEqual({
      act: 'authorize_sections_and_resume', pendingAskRef: 'p-1',
      actId: 'act-abcdefgh', authorizes: ['sec-1'], question: 'why?',
    });
  });

  it('⛔ no heading or label reaches the wire', () => {
    const body = authorizeRequest({
      pendingAskRef: 'p-1', sectionIds: [S.sectionId], actId: 'act-abcdefgh', question: 'why?',
    });
    expect(JSON.stringify(body)).not.toContain('Lighthouse');
  });

  it('⭐⭐ the SAME inputs build the SAME act — a retry is not a new act', () => {
    const once = authorizeRequest({ pendingAskRef: 'p', sectionIds: ['s'], actId: 'act-abcdefgh', question: 'q' });
    const twice = authorizeRequest({ pendingAskRef: 'p', sectionIds: ['s'], actId: 'act-abcdefgh', question: 'q' });
    expect(once).toEqual(twice);
  });
});
