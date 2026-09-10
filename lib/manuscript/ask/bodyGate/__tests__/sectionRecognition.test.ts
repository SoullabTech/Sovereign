/**
 * S3 · P1 · step 4 — recognition metadata, and the boundary it must not cross.
 *
 *   ⭐ What the writer saw helps them RECOGNIZE the section.
 *     What the server authorizes is determined INDEPENDENTLY.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { labelFor } from '../sectionRecognition';
import { __parseAuthorizeActForTest } from '@/app/api/sovereign/manuscripts/[id]/ask/route';

describe('heading and label stay separate', () => {
  it('⭐ an authored title is carried into the label BESIDE its place, never as the whole of it', () => {
    /* F1 · 2026-09-10. The title comes from the structure lane and names a
       DIVISION; sections are finer than divisions, so the title alone cannot
       identify a section. The place is added, and is not authored text. */
    expect(labelFor('The Lighthouse Keeper', 3)).toBe('The Lighthouse Keeper — Section 4');
  });

  it('⛔ no authored heading → a generated label, and heading stays null upstream', () => {
    /* A generated "Section 4" is NOT authored text. The caller keeps `heading`
       null so a member-facing field never silently mixes authored prose with a
       generated string. */
    expect(labelFor(null, 3)).toBe('Section 4');
  });

  it('position is 0-based in the substrate and 1-based to a reader', () => {
    expect(labelFor(null, 0)).toBe('Section 1');
  });

  it('⛔ a whitespace-only title is not a heading', () => {
    expect(labelFor('   ', 6)).toBe('Section 7');
  });

  it('⛔ a label is never a UUID', () => {
    const label = labelFor(null, 11);
    expect(label).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
  });
});

/**
 * ⭐⭐ F1 — EVERY DISTINCT SECTION OFFERED FOR AUTHORIZATION IS DISTINGUISHABLE.
 *
 * Step 7 walk 7e: two sections inside one structure unit were both offered as
 * "Before the water". The repair qualifies the label by canonical position.
 * These are the obligations that make the repair falsifiable — a "fix" that
 * merely renamed something, or that disambiguated only sometimes, fails them.
 */
describe('F1 · sections sharing one authored title stay distinguishable', () => {
  it('⭐⭐ two sections of the SAME unit produce two different labels', () => {
    const a = labelFor('Before the water', 0);
    const b = labelFor('Before the water', 1);
    expect(a).not.toBe(b);
    expect([a, b]).toEqual(['Before the water — Section 1', 'Before the water — Section 2']);
  });

  it('⭐⭐ every section of one unit is distinguishable, however many there are', () => {
    const labels = [0, 1, 2, 3, 4, 5, 6, 7].map((p) => labelFor('One Long Part', p));
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('⭐ the label is STABLE — a pure function of (heading, position)', () => {
    /* ⛔ NOT "qualified only when this request happens to contain a collision".
       A section whose name depends on its company does not have a name. */
    expect(labelFor('Before the water', 1)).toBe(labelFor('Before the water', 1));
    expect(labelFor('Before the water', 1)).toBe('Before the water — Section 2');
  });

  it('⛔ the authored title is not altered, invented, or absorbed', () => {
    /* `heading` stays authored-or-null upstream; the label CONTAINS the title
       exactly as written, and adds only text that is visibly not a title. */
    expect(labelFor('Before the water', 6)).toContain('Before the water');
    expect(labelFor(null, 6)).toBe('Section 7');
    expect(labelFor(null, 6)).not.toContain('—');
  });

  it('⭐ distinctness rests on the database, not on luck', () => {
    /* manuscript_draft_sections holds UNIQUE (draft_id, position), so two
       sections of one draft cannot yield one label. Asserted here as the
       reason the property holds, not merely that it happens to. */
    const MIG = readFileSync(
      join(__dirname, '..', '..', '..', '..', '..', 'database', 'migrations',
        '20260830000001_manuscript_draft_sections.sql'), 'utf8');
    expect(MIG).toMatch(/UNIQUE\s*\(\s*draft_id\s*,\s*position\s*\)/i);
  });
});

/**
 * ⛔ A PROPOSED TITLE IS NOT THE MEMBER'S WORD FOR THEIR OWN DIVISION.
 *
 * `manuscript_structure_units` admits `origin = 'proposed'` so that adopting a
 * proposal later is an INSERT with provenance rather than a migration — and that
 * table's own rule is that proposed rows cannot render as the Work's structure.
 * A section whose ONLY unit is proposed therefore has no authored heading, and
 * MAIA's suggestion must not be handed back to the writer as though they had
 * named it themselves.
 *
 * ⭐ The exclusion is on the JOIN, not in a WHERE clause. This asserts the
 * consequence of that choice: the SECTION survives with a positional label,
 * rather than disappearing from a response the member is being asked to act on.
 */
describe('a proposed structure title never becomes a heading', () => {
  const RECOGNITION = readFileSync(
    join(__dirname, '..', 'sectionRecognition.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it("⛔ the query excludes proposed units, and does so on the JOIN", () => {
    expect(RECOGNITION).toMatch(/LEFT JOIN manuscript_structure_units[\s\S]{0,80}origin <> 'proposed'/);
    /* ⛔ If this moved into a WHERE clause the section itself would vanish. */
    expect(RECOGNITION).not.toMatch(/WHERE[\s\S]{0,120}origin <> 'proposed'/);
  });

  it("⭐ a section with no authored title still gets a positional label", () => {
    /* The heading is null; the label is never absent and never a UUID. */
    expect(labelFor(null, 3)).toBe('Section 4');
  });

  it('⛔ recognition never selects section text', () => {
    expect(RECOGNITION).not.toMatch(/SELECT[\s\S]{0,200}s\.text/);
  });
});

/**
 * ⭐⭐ F2 — THE ORDER SHOWN IS THE WORK'S ORDER.
 *
 * Step 7 walk 6c: two required sections were presented in the order of their
 * UUIDs. The query already ordered by `s.position ASC`; the result was then
 * rebuilt by walking the INPUT array, which is `[...required].sort()` — a
 * lexicographic sort of identifiers the writer never sees — and the ordering
 * was lost between the database and the member.
 *
 * ⛔ These assertions must fail against the pre-repair implementation. The
 * shape they forbid is `sectionIds.map(...)` as the RESULT builder: it is the
 * exact construction that discarded the order.
 */
describe('F2 · the displayed order comes from the Work, not from the ids', () => {
  const SRC = readFileSync(join(__dirname, '..', 'sectionRecognition.ts'), 'utf8');
  const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('⭐ the query orders by canonical position', () => {
    expect(CODE).toMatch(/ORDER BY s\.position ASC/);
  });

  it('⭐⭐ the recognized rows are built by walking the QUERY result, in its order', () => {
    /* r.rows.filter(...).map(...) — the database's order survives to the caller. */
    expect(CODE).toMatch(/r\.rows[\s\S]{0,200}\.map\(/);
  });

  it('⛔ the recognized set is NOT rebuilt by walking the input id array', () => {
    /* The pre-repair line was `return sectionIds.map((sectionId, i) => {`, with
       `found.get(sectionId)` inside it. The input may decide MEMBERSHIP; it may
       not decide ORDER. */
    expect(CODE).not.toMatch(/return sectionIds\.map\([\s\S]{0,300}found\.get/);
    expect(CODE).not.toMatch(/found\.get/);
  });

  it('⛔⭐ NO label anywhere asserts a canonical position derived from an input ordinal', () => {
    /* `Section ${i + 1}` is the ordinal of a section within the REQUESTED SET,
       which is not its place in the Work. It may appear only where the label
       also says the section was not recognized. This caught the fallback branch
       — the same defect as F2, in the path nobody looks at. */
    const ordinalLabels = [...CODE.matchAll(/`Section \$\{i \+ 1\}([^`]*)`/g)].map((m) => m[1]);
    expect(ordinalLabels.length).toBeGreaterThan(0);
    for (const tail of ordinalLabels) expect(tail).toBe(' (unrecognized)');
  });

  it('⭐ the input is used for membership only', () => {
    expect(CODE).toMatch(/new Set\(sectionIds\)/);
    expect(CODE).toMatch(/asked\.has\(row\.section_id\)/);
  });

  it('⛔ a section with no known position is never given one', () => {
    /* It cannot be placed in the Work's order, so it is named as unrecognized
       rather than mislabelled with a number that means nothing. */
    expect(CODE).toMatch(/\(unrecognized\)/);
  });
});

/**
 * ⭐⭐ THE FALSIFIER THE RULING ASKED FOR.
 *
 * A client returns manipulated display strings alongside a genuine `sectionId`.
 * The resumed Ask must behave identically — and it does so for the strongest
 * available reason: ACT 3 does not accept those strings AT ALL. There is no
 * field to manipulate, so there is no code path in which a forged heading could
 * influence what is authorized.
 */
describe('display metadata can never become authorization input', () => {
  const ACT_ID = 'act-11111111-2222-3333-4444-555555555555';
  const base = {
    act: 'authorize_sections_and_resume',
    pendingAskRef: 'pending-ref-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    /* ⭐ The act's identity, supplied by the surface that watched the press.
       Act identity, ⛔ never authority: possessing it permits nothing. */
    actId: ACT_ID,
    authorizes: ['section-S'],
  };

  it('⭐ a genuine act parses to the pending identity, the act identity, and section identities — nothing else', () => {
    const parsed = __parseAuthorizeActForTest(base);
    expect(parsed).toEqual({ pendingAskRef: base.pendingAskRef, actId: ACT_ID, authorizes: ['section-S'] });
    expect(Object.keys(parsed!).sort()).toEqual(['actId', 'authorizes', 'pendingAskRef']);
  });

  it('⛔ an act without an act identity is not an act', () => {
    const { actId, ...withoutAct } = base;
    expect(__parseAuthorizeActForTest(withoutAct)).toBeNull();
  });

  it('⛔ manipulated headings and labels are not carried into the act', () => {
    const forged = {
      ...base,
      sections: [{ sectionId: 'section-S', heading: 'Chapter One', label: 'Chapter One' }],
      heading: 'a heading the client invented',
      label: 'a label the client invented',
    };
    const parsed = __parseAuthorizeActForTest(forged);
    /* The act is unchanged: same pendingAskRef, same act identity, same section
       identities, and no trace of the forged strings in what the server acts on. */
    expect(parsed).toEqual({ pendingAskRef: base.pendingAskRef, actId: ACT_ID, authorizes: ['section-S'] });
    expect(JSON.stringify(parsed)).not.toContain('Chapter One');
    expect(JSON.stringify(parsed)).not.toContain('invented');
  });

  it('⛔ a section OBJECT is not a section identity', () => {
    /* A client that returned ACT 2's `sections` array verbatim must not have it
       read as authorization: those are display objects, not identities. */
    expect(__parseAuthorizeActForTest({
      ...base, authorizes: [{ sectionId: 'section-S', label: 'Chapter One' }],
    })).toBeNull();
  });
});
