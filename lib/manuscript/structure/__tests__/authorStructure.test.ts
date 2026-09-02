/**
 * WS2-06A — the two acceptance gates from the adversarial review of the
 * superseded server implementation (7f5acfa9b), proven mechanically.
 *
 * Acceptance instrument: docs/programme/WS2-06A_PUSHED_BRANCH_ADVERSARIAL_REVIEW_2026-09-02.md §6
 * That review says how this command can be falsified. It is not the 6A
 * specification and confers no design authority.
 *
 * These run without a database on purpose. The command is split so that every
 * refusal is decided by a pure function; if the gates needed a live Postgres to
 * demonstrate, the refusal logic would still be entangled with the write path,
 * which is the entanglement that produced the defect.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  planAuthoredStructure, STRUCTURAL_REFUSALS,
  type AuthoredUnitPlan,
} from '../authorStructure';
import type { ReviewedStructure, ReviewedUnit, OrderedSection } from '../review';

const sections: OrderedSection[] = Array.from({ length: 12 }, (_, i) => ({
  id: `s${i}`, position: i,
}));
const sid = (i: number) => `s${i}`;

const unit = (
  id: string, from: number, to: number, children: ReviewedUnit[] = [],
): ReviewedUnit => ({
  id, title: `unit ${id}`, kind: null,
  fromSectionId: sid(from), toSectionId: sid(to), children,
});

const reviewed = (units: ReviewedUnit[]): ReviewedStructure => ({ units });

const flat = (units: readonly AuthoredUnitPlan[]): AuthoredUnitPlan[] =>
  units.flatMap((u) => [u, ...flat(u.children)]);

/* ── GATE 1 ─────────────────────────────────────────────────────────────────
 *
 * A refusal that is only discovered after a valid unit has been processed must
 * still leave nothing written. The specimen returned such a refusal from inside
 * the insert loop, and `transaction()` COMMITs on a normal return.
 */
describe('GATE 1 — a refusal writes nothing', () => {
  it('refuses a tree whose SECOND unit is invalid, after a first unit that would have been written', () => {
    /* The failure lands after a unit that is valid on its own — the shape the
       gate requires. A refusal decided up front (bad revision, wrong owner,
       topology mismatch) would not exercise this at all. */
    const r = planAuthoredStructure(
      reviewed([unit('p1', 0, 3), { ...unit('p2', 4, 5), fromSectionId: 'ghost' }]),
      sections);

    expect(r.status).toBe('refused');
    if (r.status === 'refused') expect(r.refusal).toBe('unknown_section');
  });

  it('is decided by a pure function, so no write can have happened when it refuses', () => {
    const r = planAuthoredStructure(
      { units: [unit('p1', 0, 3), { ...unit('p2', 4, 5), fromSectionId: 'ghost' }] },
      sections);
    /* There is no plan to write, and the planner touches no client. The
       structural half of this claim is the next test. */
    expect(r).not.toHaveProperty('plan');
  });

  it('STRUCTURAL — every refusal in the command precedes the first INSERT', () => {
    const src = readFileSync(join(__dirname, '..', 'authorStructure.ts'), 'utf8');
    const firstInsert = src.indexOf('INSERT INTO manuscript_structure_units');
    expect(firstInsert).toBeGreaterThan(0);

    /* `writePlan` is declared before the command, so the first INSERT appears
       earlier in the file than the command's refusals. Judge the command body
       instead: after its last refusal, nothing may write; before its first
       write, nothing may refuse. */
    const cmd = src.slice(src.indexOf('export async function authorStructureFromProposal'));
    const lastRefusal = Math.max(cmd.lastIndexOf('return refuse('), cmd.lastIndexOf('return planned;'));
    const firstWrite = Math.min(
      ...['await writePlan(', 'UPDATE manuscript_structure_proposals']
        .map((s) => cmd.indexOf(s))
        .filter((i) => i >= 0));

    expect(lastRefusal).toBeGreaterThan(0);
    expect(firstWrite).toBeGreaterThan(0);
    expect(lastRefusal).toBeLessThan(firstWrite);
  });

  it('STRUCTURAL — the write half has no refusal path at all', () => {
    const src = readFileSync(join(__dirname, '..', 'authorStructure.ts'), 'utf8');
    const start = src.indexOf('async function writePlan(');
    const end = src.indexOf('export async function authorStructureFromProposal');
    expect(start).toBeGreaterThan(0);
    const body = src.slice(start, end);

    expect(body).toContain('Promise<void>');
    expect(body).not.toContain('refuse(');
    expect(body).not.toContain('status: \'refused\'');
  });

  it('does not rely on a deferred database constraint to abort', () => {
    /* The contiguity trigger and the sibling-order constraint fire at COMMIT.
       A plan that reached them would already have written. Nothing in the
       command defers a decision to them. */
    const src = readFileSync(join(__dirname, '..', 'authorStructure.ts'), 'utf8');
    expect(src).not.toContain('SET CONSTRAINTS');
    expect(src).not.toMatch(/catch\s*\([^)]*\)\s*{[^}]*contiguity/i);
  });
});

/* ── GATE 2 ─────────────────────────────────────────────────────────────────
 *
 * The whole reviewed tree is validated against current sections before the
 * first insert, and each structural failure surfaces as itself.
 */
describe('GATE 2 — the whole tree is validated before any write', () => {
  const cases: { name: (typeof STRUCTURAL_REFUSALS)[number]; units: ReviewedUnit[] }[] = [
    { name: 'unknown_section', units: [{ ...unit('p1', 0, 2), toSectionId: 'ghost' }] },
    { name: 'inverted_range', units: [{ ...unit('p1', 0, 0), fromSectionId: sid(5), toSectionId: sid(2) }] },
    { name: 'overlapping_siblings', units: [unit('p1', 0, 4), unit('p2', 3, 7)] },
    { name: 'child_outside_parent', units: [unit('p1', 0, 3, [unit('p2', 2, 6)])] },
    { name: 'duplicate_unit_id', units: [unit('p1', 0, 2), unit('p1', 3, 5)] },
  ];

  it.each(cases)('refuses $name as a typed refusal', ({ name, units }) => {
    const r = planAuthoredStructure({ units }, sections);
    expect(r.status).toBe('refused');
    if (r.status === 'refused') expect(r.refusal).toBe(name);
  });

  it('covers every refusal the command declares structural', () => {
    expect(cases.map((c) => c.name).sort()).toEqual([...STRUCTURAL_REFUSALS].sort());
  });

  it('REGRESSION — an inverted range is refused, never silently reversed', () => {
    /* sectionRun in the specimen normalised `i <= j ? [i,j] : [j,i]`, so a
       reversed unit was accepted as its own mirror image. */
    const r = planAuthoredStructure(
      { units: [{ ...unit('p1', 0, 0), fromSectionId: sid(5), toSectionId: sid(2) }] },
      sections);
    expect(r.status).toBe('refused');
    if (r.status === 'refused') expect(r.refusal).toBe('inverted_range');
  });

  it('a structural refusal never becomes a 500 — it is a value, not a throw', () => {
    for (const c of cases) {
      expect(() => planAuthoredStructure({ units: c.units }, sections)).not.toThrow();
    }
  });
});

/* ── the act itself ───────────────────────────────────────────────────────── */
describe('planning a valid reading', () => {
  it('refuses a reading with no divisions rather than inventing one', () => {
    for (const empty of [null, undefined, { units: [] }]) {
      const r = planAuthoredStructure(empty as ReviewedStructure | null, sections);
      expect(r.status).toBe('refused');
      if (r.status === 'refused') expect(r.refusal).toBe('nothing_to_adopt');
    }
  });

  it('carries the reviewed unit key onto every planned division', () => {
    const r = planAuthoredStructure(
      { units: [unit('p1', 0, 5, [unit('p2', 0, 2), unit('p3', 3, 5)]), unit('p4', 6, 11)] },
      sections);
    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(flat(r.plan.units).map((u) => u.reviewUnitKey)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('numbers siblings from zero within each parent', () => {
    const r = planAuthoredStructure(
      { units: [unit('p1', 0, 5, [unit('p2', 0, 2), unit('p3', 3, 5)]), unit('p4', 6, 11)] },
      sections);
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.plan.units.map((u) => u.position)).toEqual([0, 1]);
    expect(r.plan.units[0].children.map((u) => u.position)).toEqual([0, 1]);
  });

  it('counts distinct sections, not writes — a child re-places part of its parent', () => {
    const r = planAuthoredStructure(
      { units: [unit('p1', 0, 5, [unit('p2', 0, 2), unit('p3', 3, 5)])] },
      sections);
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.plan.unitCount).toBe(3);
    /* 6 sections, placed by the parent and re-placed by two children. Summing
       writes would report 12. */
    expect(r.plan.sectionCount).toBe(6);
  });

  it('leaves sections outside every division unplaced rather than inventing a home', () => {
    const r = planAuthoredStructure({ units: [unit('p1', 2, 4)] }, sections);
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.plan.sectionCount).toBe(3);
  });
});
