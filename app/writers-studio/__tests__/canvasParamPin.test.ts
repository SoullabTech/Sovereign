/**
 * The Canvas manuscript parameter — no longer pinned by reading source.
 *
 * ── WHY THIS FILE CHANGED SHAPE AT WS2-03B ─────────────────────────────────
 *
 * The original guard existed because the Canvas could not be edited by the
 * lane that found the defect: Home shipped `?id=` while the Canvas read `?m`,
 * so the Canvas ignored the identity it was sent and silently fell back to
 * `manuscripts[0]`. Unable to fix the room, that lane read its SOURCE and
 * asserted the two strings matched. Its own closing note said what to do when
 * the room could finally be changed:
 *
 *   "When the Writer Canvas contract is installed, the Canvas should import
 *    canvasIdentity directly and this source-reading guard can be deleted."
 *
 * WS2-03B installs it. The room now imports `requestedManuscriptId` and
 * `canvasForManuscript` from this module instead of inlining `'m'`, so the two
 * sides cannot drift: there is one definition and both call it.
 *
 * One assertion here is DELETED rather than migrated, and deliberately named:
 *
 *   it('the Canvas still falls back — which is why a mismatch was silent')
 *
 * That test pinned the fallback in place. It was honest about hating it —
 * "recorded, not celebrated" — but a passing test is a specification, and this
 * one specified the substitution the founder later caught in runtime. It is
 * replaced by its inverse, which now lives in shellProjection.test.ts: the
 * room must NOT contain `manuscripts[0]`, and an unresolvable identity must
 * fail visibly.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CANVAS_MANUSCRIPT_PARAM,
  canvasForManuscript,
  requestedManuscriptId,
  resolveManuscript,
} from '../canvasIdentity';
import { CANVAS_HREF } from '../studioMap';

const canvasSource = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
/** The room's comments explain the defect and therefore quote it. Assertions
 *  about what the CODE does must read the code, not the history beside it. */
const canvasCode = canvasSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*/g, '');

describe('Canvas manuscript parameter — one definition, imported by both sides', () => {
  it('the room reads the parameter through the shared module, not a literal', () => {
    expect(canvasSource).toContain('requestedManuscriptId');
    expect(canvasSource).toMatch(/from '\.\.\/canvasIdentity'/);
    // The inlined string is what allowed the drift in the first place.
    expect(canvasCode).not.toMatch(/URLSearchParams\([^)]*\)\s*\.get\(\s*'m'\s*\)/);
  });

  it('the href Home renders round-trips through the reader the Canvas uses', () => {
    const href = canvasForManuscript(CANVAS_HREF, 'ms-alchemy');
    expect(requestedManuscriptId(href.slice(href.indexOf('?')))).toBe('ms-alchemy');
    expect(href).toContain(`${CANVAS_MANUSCRIPT_PARAM}=ms-alchemy`);
  });

  it('the Canvas no longer falls back — a mismatch can never be silent again', () => {
    // The replacement for the deleted fallback pin. A parameter the room
    // cannot resolve is now a refusal, and a refusal is visible by definition.
    expect(canvasCode).not.toMatch(/manuscripts\[0\]/);
    expect(resolveManuscript('ms-missing', [{ id: 'ms-other' }]).kind).toBe('unresolved');
  });

  it('pins an unnamed arrival into the URL so a reload resolves the same book', () => {
    expect(canvasSource).toContain('window.history.replaceState');
    expect(canvasSource).toContain('canvasForManuscript(');
  });
});
