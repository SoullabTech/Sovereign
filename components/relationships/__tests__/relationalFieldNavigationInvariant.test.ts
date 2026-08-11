import fs from 'fs';
import path from 'path';

/**
 * Navigation / attachment invariant for the Relational Field surface.
 *
 * Founder-framed rule (2026-08-11):
 *   - List page → a specific relationship's room: stays inside the field.
 *   - Room → back to list: stays inside the field.
 *   - Inline MAIA conversation on the list page (no relationship picked yet)
 *     → stays inside the field, on the list page.
 *   - Only the small, unbranded "Home" back-arrow leaves for the general
 *     MAIA/House surface, and it must never compete in emphasis with
 *     relational work in progress.
 *
 * The half of this that carries provenance risk — and the half a future edit
 * is most likely to break silently — is that the list page's inline
 * conversation (RelationalFieldConversation.tsx) must NEVER send an explicit
 * `relationshipId`. There is no picked relationship to attach to on that
 * surface; sending one (even by accident, e.g. copy-pasted from
 * RelationshipConversation.tsx, the individual room's component) would let
 * the server's explicit-attachment path (`resolveExplicitRelationshipId`)
 * silently file list-page material under an arbitrary relationship. The
 * individual room must keep doing the opposite: always pass its
 * relationshipId through, so Article III / actionability-floor / verdict
 * detection continue to apply exactly as they do today.
 *
 * This is a static-source guard, not a DOM/behavior test: jest here runs in
 * a `node` test environment (see jest.config.js) with no React-DOM harness
 * wired for `.tsx` component mounting, and standing one up is out of scope
 * for this change. The behavior itself was cross-checked with a live manual
 * walk in the browser preview (both surfaces, both directions) — see the
 * session report that shipped this file and the header comment in
 * RelationalFieldConversation.tsx.
 */

function read(relPath: string): string {
  return fs.readFileSync(path.join(__dirname, '../../..', relPath), 'utf8');
}

describe('Relational Field — navigation & attachment invariant', () => {
  it('list-page inline conversation posts to the shared conversation route but never sends relationshipId', () => {
    const src = read('components/relationships/RelationalFieldConversation.tsx');

    expect(src).toMatch(/\/api\/sovereign\/app\/maia/);

    const ctxMatch = src.match(/consciousnessContext:\s*\{([^}]*)\}/);
    expect(ctxMatch).not.toBeNull();
    // The whole point: no relationshipId key anywhere in this object.
    expect(ctxMatch![1]).not.toMatch(/relationshipId/);
  });

  it('individual room conversation still threads its relationshipId through, unchanged', () => {
    const src = read('components/relationships/RelationshipConversation.tsx');

    expect(src).toMatch(/\/api\/sovereign\/app\/maia/);

    const ctxMatch = src.match(/consciousnessContext:\s*\{([^}]*)\}/);
    expect(ctxMatch).not.toBeNull();
    expect(ctxMatch![1]).toMatch(/relationshipId/);
  });

  it('the list page keeps an explicit exit, but no longer phrases it as a competing MAIA invitation', () => {
    const src = read('app/relationships/page.tsx');

    // The exit still exists — this is additive, not a removal of navigation.
    expect(src).toMatch(/router\.push\('\/maia'\)/);
    // But it must not render as a second, competing "go talk to MAIA" CTA
    // next to the inline conversation that now lives on this page. Checked
    // against the rendered label text specifically (`>text<`), not the file
    // as a whole — the design-history comment above the button is allowed to
    // keep saying what the old label used to be.
    const rendered = src.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rendered).not.toMatch(/Back to MAIA/);
  });

  it('the list page wires the inline conversation component in, for members with existing relationships', () => {
    const src = read('app/relationships/page.tsx');

    expect(src).toMatch(/RelationalFieldConversation/);
    expect(src).toMatch(/from '@\/components\/relationships\/RelationalFieldConversation'/);
  });
});
