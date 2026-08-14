/**
 * RUPTURE CONTAINMENT — regression guard. Founder ruling 2026-08-13.
 *
 * Two-sided containment, both asserted here, both held at a CHOKEPOINT rather
 * than at a leaf:
 *   WRITE — `insertRelationalSignal`: an inferred rupture/strain assertion
 *           must not persist. Held here, not in the detector, so a future
 *           inferred writer is contained by default.
 *   READ  — `rowToSignal`: the assertion must not be served to any consumer.
 *           Held here, not in the card that renders it, so every surface that
 *           exists or is built later fails closed — the unsupported claim never
 *           leaves the server.
 *
 * WHY: `rupture_state` is decided by an unanchored substring match on the
 * member's message ('broken', 'divorce', 'break up' — not tokenized, not
 * negation-aware). Executed witness, 2026-08-13:
 *   "my laptop is broken, my partner said to get it fixed" -> ruptured (0.5)
 *   "I don't want to break up with my partner"             -> ruptured (0.5)
 *   "my partner and I are estranged now"                   -> ruptured (0.5)
 * A broken laptop, a refused breakup and a real estrangement are identical.
 *
 * And the row cannot be interpreted afterwards — production 2026-08-13:
 * 0/440 carry relationship_id, 0/440 carry source_turn_id, 440/440 are
 * source='maia_conversation'.
 *
 * ⚠️ THE GOVERNING INVARIANT (founder correction, 2026-08-13):
 *   Only an explicitly representable and POSITIVELY PROVEN member declaration
 *   may persist or be served as a member-declared rupture state.
 *
 * `labtool_manual` does NOT satisfy that merely by being "manual" — that is a
 * tool label, not authorship. Provenance is not authorship. The schema encodes
 * no declaration value, so nothing qualifies and both sides fail closed.
 *
 * These tests fail if either side is relaxed. Containment lifts only when the
 * schema gains a real provenance vocabulary — i.e. after RU-1.
 */
import { readFileSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(repoRoot, rel), 'utf8');

const SERVICE = 'lib/relationships/relationshipSignalService.ts';
const DETECTOR = 'lib/relationships/detectRelationalSignal.ts';

describe('rupture containment — the hazard still exists (guard is load-bearing)', () => {
  it('the detector still decides rupture by unanchored substring match', () => {
    // If this stops being true the containment may be RECONSIDERED — but
    // deliberately, not silently. This documents the precondition; it does not
    // assert the hazard is desirable.
    expect(read(DETECTOR)).toMatch(
      /RUPTURE_SIGNALS\.ruptured\.some\(\s*\(kw\)\s*=>\s*userLower\.includes\(kw\)/,
    );
  });

  it("'broken' is still a bare substring keyword", () => {
    expect(read(DETECTOR)).toMatch(/'broken'/);
  });

  it('the schema still cannot represent member declaration', () => {
    // The whole containment rests on this. If a declaration source is ever added
    // to the union, this fails and the invariant must be revisited on purpose.
    const union = read('lib/relationships/types.ts').match(/SignalSource\s*=\s*[^;]+;/)?.[0] ?? '';
    expect(union).toMatch(/maia_conversation/);
    expect(union).toMatch(/labtool_manual/);
    expect(union).not.toMatch(/member_declared|member_authored|declaration/i);
  });
});

describe('the declaration-capable set is empty — provenance is not authorship', () => {
  const src = read(SERVICE);

  it('the set exists and is EMPTY', () => {
    expect(src).toMatch(
      /const DECLARATION_CAPABLE_SOURCES:\s*ReadonlySet<string>\s*=\s*new Set\(\s*\)/,
    );
  });

  it('neither existing source is exempted — "manual" is not authorship', () => {
    const decl = src.match(/const DECLARATION_CAPABLE_SOURCES[\s\S]{0,120}/)?.[0] ?? '';
    expect(decl).not.toMatch(/labtool_manual/);
    expect(decl).not.toMatch(/maia_conversation/);
  });
});

describe('WRITE — no rupture assertion persists', () => {
  const src = read(SERVICE);

  it('insertRelationalSignal gates rupture_state on declaration capability', () => {
    expect(src).toMatch(/const ruptureState\s*=\s*DECLARATION_CAPABLE_SOURCES\.has\(source\)/);
    expect(src).toMatch(/rupture_state:\s*ruptureState,/);
    // the raw input must never reach the insert again
    expect(src).not.toMatch(/rupture_state:\s*safeRupture\(input\.ruptureState\)/);
  });
});

describe('READ — no rupture assertion is served to any consumer', () => {
  const src = read(SERVICE);

  it('rowToSignal gates ruptureState on declaration capability', () => {
    expect(src).toMatch(
      /const ruptureState\s*=\s*DECLARATION_CAPABLE_SOURCES\.has\(String\(row\.source\)\)/,
    );
  });

  it('the mapper no longer emits the stored value directly', () => {
    expect(src).not.toMatch(/ruptureState:\s*safeRupture\(row\.rupture_state\)/);
    expect(src).toMatch(/\n\s*ruptureState,\n/);
  });

  it('containment is at the chokepoint, not at a rendering component', () => {
    // rowToSignal feeds getLatestSignal, which is the only path to the API.
    // If a future change moves the gate into a UI file, this fails: the guard
    // exists to keep the boundary at the serve edge.
    expect(src).toMatch(/function rowToSignal/);
    expect(src).toMatch(/export async function getLatestSignal/);
  });
});
