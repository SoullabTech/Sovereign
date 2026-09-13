/**
 * EDITORIAL-WRITE-01A — CS-1 · CS-2 · CS-7 · CS-8, the route and surface laws.
 *
 * ⭐⭐ THE ROUTE LAW:
 *
 *   The browser does not send the edit back. It sends an id in the path and
 *   nothing in the body. Member identity comes from the authenticated session.
 *
 * ⛔ WHY THIS IS NOT MERELY TIDY. If the client could supply
 * `proposalId + replacementText`, "accept this proposal" would quietly become
 * "write whatever this request says", and every guarantee underneath would be
 * describing a change the member never saw.
 *
 * ⛔ These read CODE, never prose — the C21 discipline. This programme has
 * matched its own comments as violations four times.
 */

import * as fs from 'fs';
import * as path from 'path';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const ACCEPT = 'app/api/writers-studio/revision-proposal/[id]/accept/route.ts';
const PREVIEW = 'app/api/writers-studio/revision-proposal/[id]/route.ts';
const SURFACE = 'app/writers-studio/ProposedChange.tsx';

describe('CS-1 — the accept request carries ONLY the id', () => {
  it('⭐⭐ the route never reads the request body', () => {
    const src = CODE(ACCEPT);
    /* Not parsed, not validated, not ignored field-by-field. There is nothing
       for a field to arrive in. */
    expect(src).not.toMatch(/request\.json\(\)|request\.text\(\)|await request\.body/);
  });

  it('⭐ and the client sends no body at all', () => {
    const src = CODE(SURFACE);
    expect(src).toMatch(/\{ method: 'POST' \}/);
    expect(src).not.toMatch(/body: JSON\.stringify/);
  });

  it('⛔ the surface holds no replacement, target or version to send', () => {
    const src = CODE(SURFACE);
    for (const f of [/replacementText/, /targetSectionId/, /baseVersion/, /expectedText/]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-2 — identity is the session’s, never the request’s', () => {
  it('both routes resolve a verified identity and use ITS member id', () => {
    for (const rel of [ACCEPT, PREVIEW]) {
      const src = CODE(rel);
      expect(src).toMatch(/resolveCanonicalIdentity\(request\)/);
      expect(src).toMatch(/identity\.status !== 'verified'/);
      expect(src).toMatch(/identity\.memberId/);
      /* ⛔ No memberId may be taken from anywhere else. */
      expect(src).not.toMatch(/memberId\s*=\s*(body|params|searchParams)/);
    }
  });
});

describe('CS-7 — the surface does not exist until it is constituted', () => {
  it('both routes 404 when the flag is off, and 401 without identity', () => {
    for (const rel of [ACCEPT, PREVIEW]) {
      const src = CODE(rel);
      expect(src).toMatch(/WRITERS_STUDIO_WRITE_ENABLED === '1'/);
      expect(src).toMatch(/status: 404/);
      expect(src).toMatch(/status: 401/);
    }
  });

  it('⛔ an unknown proposal is a 404, indistinguishable from another member’s', () => {
    expect(CODE(ACCEPT)).toMatch(/proposal_unknown' \? 404 : 409/);
  });

  it('⛔ the accept response echoes no prose — only a version', () => {
    const src = CODE(ACCEPT);
    expect(src).toMatch(/resultingVersion/);
    for (const f of [/\btext\b\s*:/, /body\s*:\s*outcome/, /sectionText/]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-8 — the gesture exists in exactly one state', () => {
  it('⭐ ACCEPT CHANGES is disabled unless the preview is acceptable', () => {
    const src = CODE(SURFACE);
    expect(src).toMatch(/const mayAccept = \(p: ProposalPreview\) => p\.state === 'acceptable'/);
    expect(src).toMatch(/disabled=\{!mayAccept\(preview\)/);
  });

  it('⛔ and the surface offers no retry or repair when it no longer matches', () => {
    const src = CODE(SURFACE);
    for (const f of [/retry/i, /regenerat/i, /try again/i, /fix/i]) {
      expect(src).not.toMatch(f);
    }
  });

  it('⭐ `Keep unchanged` is offered as a real answer', () => {
    expect(CODE(SURFACE)).toMatch(/Keep unchanged/);
  });

  it('⛔ the write route is the ONLY place the surface can reach', () => {
    const src = CODE(SURFACE);
    const calls = src.match(/apiFetch\(\s*`?[^`)]*/g) ?? [];
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('/accept');
  });
});
