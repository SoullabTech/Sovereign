/**
 * WS-WORKDRAWER-01 — the ambiguous state must not hide its own remedy.
 *
 * Founder ruling 2026-09-07. A manuscript declared in two Works reached a
 * drawer whose only offer was to declare it in a third, while the `undeclare`
 * gesture that resolves it rendered in a branch an ambiguous manuscript never
 * reaches. The member always had the authority; the surface hid it.
 *
 * The six cases below are the founder's, pinned as written.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { declarationState, worksDeclaring } from '../workDeclarations';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

const work = (id: string, declares: string[] = []): LivingWork => ({
  id,
  title: `Work ${id}`,
  purpose: null,
  form: null,
  stage: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  expressions: declares.map((expressionId) => ({
    expressionType: 'manuscript',
    expressionId,
    declaredAt: '2026-01-01T00:00:00Z',
  })),
  materials: [],
});

describe('which Works declare this manuscript', () => {
  it('1 · zero declarations — unclaimed', () => {
    const works = [work('a'), work('b')];
    expect(worksDeclaring('m1', works)).toEqual([]);
    expect(declarationState(worksDeclaring('m1', works))).toBe('unclaimed');
  });

  it('2 · one declaration — single', () => {
    const works = [work('a', ['m1']), work('b')];
    expect(worksDeclaring('m1', works).map((w) => w.id)).toEqual(['a']);
    expect(declarationState(worksDeclaring('m1', works))).toBe('single');
  });

  it('3 · two declarations — both Works are visible', () => {
    const works = [work('a', ['m1']), work('b', ['m1']), work('c')];
    expect(worksDeclaring('m1', works).map((w) => w.id)).toEqual(['a', 'b']);
    expect(declarationState(worksDeclaring('m1', works))).toBe('ambiguous');
  });

  it('5 · undeclaring one of two resolves to the remaining Work', () => {
    /* The state the repair exists to make reachable: after the member withdraws
       one declaration, the manuscript has a single Work again and MAIA's
       context becomes carryable. */
    const after = [work('a'), work('b', ['m1'])];
    expect(declarationState(worksDeclaring('m1', after))).toBe('single');
    expect(worksDeclaring('m1', after).map((w) => w.id)).toEqual(['b']);
  });

  it('6 · reads only declarations, and only of this manuscript', () => {
    /* Nothing else is altered or even consulted: another manuscript's
       declaration in the same Work is not this manuscript's business. */
    const works = [work('a', ['m2']), work('b', ['m1', 'm2'])];
    expect(worksDeclaring('m1', works).map((w) => w.id)).toEqual(['b']);
  });

  it('a non-manuscript expression is not a declaration of this manuscript', () => {
    /* expression_type is open by design — a workbook, a course, a retreat. An
       id collision across types must not read as a declaration. */
    const w = work('a');
    w.expressions.push({ expressionType: 'course', expressionId: 'm1', declaredAt: 'x' });
    expect(worksDeclaring('m1', [w])).toEqual([]);
  });

  it('no manuscript on the table declares nothing', () => {
    expect(worksDeclaring(null, [work('a', ['m1'])])).toEqual([]);
  });
});

describe('4 · the ambiguous state offers the remedy, not another declaration', () => {
  const drawer = readFileSync(
    join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'canvas', 'WorkDrawer.tsx'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  it('⛔ does not offer to create a third declaration as the only way out', () => {
    /* The ambiguous branch renders the declaring Works with `undeclare` and
       must NOT render ShapeGesture — offering to add a third Work to resolve
       a two-Work ambiguity is the defect, stated exactly. */
    const ambiguous = drawer.slice(
      drawer.indexOf("state === 'ambiguous'"),
      drawer.indexOf("// Several works, none united"),
    );
    expect(ambiguous.length).toBeGreaterThan(0);
    expect(ambiguous).toContain('undeclare');
    expect(ambiguous).not.toContain('ShapeGesture');
    expect(ambiguous).not.toContain('Which one is this a form of');
    /* Founder ruling 2026-09-07 — the interface softens, the ontology does
       not. The operation underneath is still `undeclare`; what the writer
       reads is a sentence about their writing. */
    expect(ambiguous).toContain('Remove from this Work');
    expect(ambiguous).toContain('does not delete the writing');
    expect(ambiguous).not.toContain('no longer a form of');
  });

  it('the unclaimed state still offers the declaration gesture', () => {
    /* The repair splits a fused branch; it does not remove the case that
       branch was originally written for. */
    expect(drawer).toContain('ShapeGesture');
    expect(drawer).toContain('Which one is this a form of');
  });
});
