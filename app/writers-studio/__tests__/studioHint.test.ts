/**
 * FR-D step 3 — the obligations that keep StudioHint from becoming a help system.
 *
 * These are module-graph and source assertions rather than render tests,
 * following the pattern the Develop room's gates already use: the dangerous
 * states here are ABOUT WHERE THE COMPONENT IS USED and about which inputs can
 * reach it, and both are decidable statically.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
/** Comments document the bans; scanning them would match the ban as the thing banned. */
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const HINT = 'studio/StudioHint.tsx';

describe('FR-D — input independence is structural, not styling', () => {
  const src = code(HINT);

  it('does not gate disclosure on a CSS hover rule', () => {
    /* :hover is reachable by exactly one input. The walk EVIDENCED hover; it
       did not RULE hover-only, and a writer on iPhone is owed the same
       meaning. */
    expect(src).not.toMatch(/:hover/);
  });

  it('opens on pointer, on focus, and on an explicit press', () => {
    expect(src).toMatch(/onPointerEnter/);
    expect(src).toMatch(/onFocus/);
    expect(src).toMatch(/onClick/);
  });

  it('closes on Escape and on acting elsewhere', () => {
    expect(src).toMatch(/'Escape'/);
    expect(src).toMatch(/pointerdown/);
  });

  it('exposes the relationship to assistive technology', () => {
    expect(src).toMatch(/aria-expanded/);
    expect(src).toMatch(/aria-describedby/);
    expect(src).toMatch(/aria-label/);
  });

  it('gives the trigger a thumb-reachable target', () => {
    expect(src).toMatch(/width: 24/);
    expect(src).toMatch(/height: 24/);
  });
});

describe('FR-D — help is not state', () => {
  /**
   * ⛔ The constitutional line. Availability, consent, refusal and consequence
   * must be perceptible without being requested. A writer may never have to
   * ask a control whether it is allowed to act.
   */
  it('carries no availability language in any hint body', () => {
    const users = ['canvas/page.tsx', 'canvas/Worktable.tsx', 'canvas/SectionWritingSurface.tsx'];
    for (const f of users) {
      const src = code(f);
      const bodies = [...src.matchAll(/<StudioHint[\s\S]*?<\/StudioHint>/g)].map((m) => m[0]);
      for (const b of bodies) {
        expect(b.toLowerCase()).not.toMatch(/not available|coming soon|unavailable|no access|permission/);
      }
    }
  });
});

describe('FR-D — the census exclusions hold', () => {
  /**
   * The census marked these NO CHANGE: they are already understood, and help
   * there is the clutter the ruling forbids. This is the anti-overbuild test
   * (flow §10) made executable — the failure mode is a later contributor
   * adding "just one more" hint to a control nobody was confused by.
   */
  it('is used only at controls the census actually named', () => {
    const users = ['canvas/page.tsx', 'canvas/Worktable.tsx', 'canvas/SectionWritingSurface.tsx'];
    const labels = users.flatMap((f) =>
      [...code(f).matchAll(/label="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((l) => /This work|keeping a version/.test(l)),
    );
    expect(labels.length).toBeGreaterThan(0);

    /* No hint anywhere in the rail or the mode bar: every rail destination the
       census examined was either NO CHANGE or answered by FR-C state. */
    expect(code('studio/StudioRail.tsx')).not.toMatch(/StudioHint/);
    expect(code('studio/StudioModeBar.tsx')).not.toMatch(/StudioHint/);
  });

  it('did not become a help framework', () => {
    /* ⚠️ `code`, not `read`. The first version of this assertion scanned the
       raw source and failed on StudioHint's own doc comment, which says "no
       registry, no ontology, no provider, no tour" — prose documenting the
       ban, matched as evidence of the ban.

       That is the C21 false positive, already ratified in this repository on
       2026-09-07: *a prose ban must never read as the banned behavior
       returning — an instrument that scans prose can fail on a file precisely
       because that file documents its own compliance.* Comments are stripped
       here for the same reason, and the token set is not weakened. */
    const src = code(HINT);
    /* R-1 was falsified by the census and the founder accepted the finding.
       A registry, a provider or a tour would reintroduce it by the back door. */
    expect(src).not.toMatch(/createContext|Provider|registry|HELP_TOPICS|useHelp/);
  });
});
