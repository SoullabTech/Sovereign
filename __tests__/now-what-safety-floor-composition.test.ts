/**
 * NW-I01 — witness tests for the constitutional floor.
 *
 * NW-S01 found three bypass classes on the Now What? conversational path. These
 * tests pin the two this unit repaired, so neither can silently reopen:
 *
 *   Bypass 1 — `mode === 'propose'` skipped composition entirely.
 *   Bypass 2 — `!presenceEnabled && !fieldBlock` returned the room prompt alone.
 *
 * They also pin that the suppressible symbolic register (risk class G) leaves
 * the ORDINARY turn byte-identical — a safety switch that quietly changes every
 * normal conversation would be a worse defect than the one it fixes.
 *
 * SCOPE: these assert STRUCTURE, not clinical meaning. The floor's safety
 * content does not exist yet and is blocked on qualified review; asserting what
 * it should say is not this unit's business.
 */

import { composeConstitutionalFloor } from '@/lib/maia/roomComposition';
import { MAIA_RUNTIME_PROMPT } from '@/lib/consciousness/MAIA_RUNTIME_PROMPT';
import { buildResponseGrammar } from '@/lib/nowWhat/roomGrammar';

describe('NW-I01 — constitutional floor composition', () => {
  const ROOM = 'ROOM_PROMPT_SENTINEL';

  it('composes the floor above the room prompt', () => {
    const out = composeConstitutionalFloor(ROOM);
    expect(out).toContain(MAIA_RUNTIME_PROMPT);
    expect(out).toContain(ROOM);
  });

  it('puts the floor FIRST and the room grammar LAST', () => {
    const out = composeConstitutionalFloor(ROOM);
    expect(out.indexOf(MAIA_RUNTIME_PROMPT)).toBeLessThan(out.indexOf(ROOM));
    // The room's own standing hard limits must keep the final word.
    expect(out.trimEnd().endsWith(ROOM)).toBe(true);
  });

  it('never returns the room prompt alone (bypass 1 + 2 regression guard)', () => {
    const out = composeConstitutionalFloor(ROOM);
    expect(out).not.toBe(ROOM);
    expect(out.length).toBeGreaterThan(ROOM.length);
  });

  it('is not empty-floor safe by accident — the floor has real content', () => {
    expect(MAIA_RUNTIME_PROMPT.trim().length).toBeGreaterThan(100);
  });
});

describe('NW-I01 — suppressible symbolic register (risk class G)', () => {
  const SYMBOLIC_MARKERS = ['elemental', 'Spiralogic'];

  it('DEFAULT turn keeps the symbolic touch — unchanged behavior', () => {
    const grammar = buildResponseGrammar();
    expect(grammar).toContain('light elemental or Spiralogic touch');
  });

  it('default and explicit-false are identical (no silent drift)', () => {
    expect(buildResponseGrammar()).toBe(buildResponseGrammar(false));
  });

  it('SUPPRESSED turn removes the symbolic register entirely', () => {
    const grammar = buildResponseGrammar(true);
    for (const marker of SYMBOLIC_MARKERS) {
      expect(grammar).not.toContain(marker);
    }
  });

  it('suppression removes ONLY the register — the load-bearing grammar survives', () => {
    const grammar = buildResponseGrammar(true);
    // Steps 1-3 and the understanding-repair override are what keep the turn
    // grounded in the person's actual words. Suppressing the register must not
    // cost them.
    expect(grammar).toContain('Reflect what they actually said');
    expect(grammar).toContain('Understanding repair');
    expect(grammar).toContain('impossible to send unchanged to a different person');
  });

  it('both variants are well-formed prose (no collapsed or doubled breaks)', () => {
    for (const grammar of [buildResponseGrammar(false), buildResponseGrammar(true)]) {
      expect(grammar).not.toMatch(/\n{3,}/);
      expect(grammar.trim()).toBe(grammar);
    }
  });

  it('pins the exact text of both variants (drift guard)', () => {
    // Byte-identity of the DEFAULT variant against the pre-NW-I01 constant was
    // proven at the time of the change; these snapshots carry that forward, so
    // any future edit to the grammar is a visible, reviewed diff rather than an
    // accident of the suppression refactor.
    expect(buildResponseGrammar(false)).toMatchSnapshot('default (symbolic register present)');
    expect(buildResponseGrammar(true)).toMatchSnapshot('suppressed (risk class G)');
  });

  it('suppression is available but NOT wired to any trigger', () => {
    // NW-I01 builds the mechanism only. Deciding WHEN to suppress is clinical
    // meaning and is blocked on qualified review. If this test starts failing
    // because a caller passes `true`, that caller needs the review first.
    const fs = require('fs');
    const path = require('path');
    const sources = [
      'app/api/now-what/interview/route.ts',
      'lib/nowWhat/roomGrammar.ts',
    ].map((f) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')).join('\n');
    expect(sources).not.toMatch(/buildResponseGrammar\(\s*true\s*\)/);
    expect(sources).not.toMatch(/buildPhasePrompt\([^)]*,\s*true\s*\)/);
    expect(sources).not.toMatch(/suppressSymbolicRegister:\s*true/);
  });
});
