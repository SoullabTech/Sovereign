/**
 * Export exports the CURRENT DRAFT.
 *
 * Founder ruling 2026-09-07. This route read `manuscript_sections` — the
 * Source — so a writer could revise a chapter in WRITE, export a .docx, and
 * receive the pre-revision text. The export succeeded and nothing refused.
 *
 *   Export is not keeping. Keeping is not exporting.
 *   Export the writer's characters before beautifying the writer's structure.
 *
 * ⚠️ Comments are stripped before scanning: this route documents the very
 * things it must not do (Source reads, derived headings), and a raw scan finds
 * the banned shape inside the sentence banning it — Circles C21.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const RAW = readFileSync(join(__dirname, '..', 'route.ts'), 'utf8');
const CODE = RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('the current draft is the manuscript', () => {
  it('reads the live draft, not the Source, when a draft exists', () => {
    expect(CODE).toContain('FROM manuscript_draft_sections ds');
    expect(CODE).toContain('FROM manuscript_working_drafts wd');
  });

  it('⛔ takes the version and the text in ONE statement, never two', () => {
    /* The defect this forbids: `SELECT version` then `SELECT text` makes the
       settle guard a PRECHECK, and a save landing between them exports
       characters the caller never acknowledged while the version check says it
       did. Circles FR-18, one layer over: the authority is the READ.

       Asserted structurally — the draft-section text is only ever reachable as
       a subquery of the draft read, so there is no second statement to race. */
    expect(CODE.match(/FROM manuscript_working_drafts/g) ?? []).toHaveLength(1);
    expect(CODE.match(/FROM manuscript_draft_sections/g) ?? []).toHaveLength(1);
    expect(CODE).toMatch(/json_agg\(ds\.text ORDER BY ds\.position ASC\)/);
    /* and the aggregate is INSIDE the draft statement, not beside it */
    const draftRead = CODE.indexOf('FROM manuscript_working_drafts');
    const sectionRead = CODE.indexOf('FROM manuscript_draft_sections');
    expect(sectionRead).toBeGreaterThan(-1);
    expect(sectionRead).toBeLessThan(draftRead);
    /* manuscript · draft (version + text together) · Source fallback · member
       name. Four reads, and the draft is exactly one of them. */
    expect(CODE.match(/await query</g) ?? []).toHaveLength(4);
  });

  it('falls back to the Source ONLY when no draft has ever existed', () => {
    /* Not a stale fallback: with no draft, the Source IS the current state. */
    const sourceRead = CODE.indexOf('FROM manuscript_sections');
    const elseBranch = CODE.indexOf('} else {');
    expect(sourceRead).toBeGreaterThan(-1);
    expect(elseBranch).toBeGreaterThan(-1);
    expect(sourceRead).toBeGreaterThan(elseBranch);
  });

  it('a continuous draft exports as one span, not cut into invented sections', () => {
    expect(CODE).toMatch(/sections = \[\{ heading: null, body: live\.content \}\]/);
  });
});

describe('⛔ the writer’s characters, whole', () => {
  it('never prepends a derived heading — heading is null for every draft section', () => {
    /* The silent failure this pins: write-state's heading is a PREFIX MATCH
       against the Source, so using it as a field beside the text prints every
       chapter title twice — once from the renderer's `# `, once from the
       writer's own characters. */
    expect(CODE).toMatch(/section_texts\.map\(\(text\) => \(\{ heading: null, body: text \}\)\)/);

    /* Enumerated rather than banned. An earlier draft of this test asserted
       `not.toMatch(/heading: (?!null)/)` and failed the file for its own
       legitimate Source fallback — a ban broad enough to forbid the one place
       a heading is genuinely the member's. What must hold is narrower and
       checkable: every heading in this route is accounted for, and no NEW
       source of one can appear without turning this list red. */
    const headingFields = (CODE.match(/heading:\s*[^,;\n}]+/g) ?? []).map((s) => s.trim());
    expect(headingFields).toEqual([
      'heading: null', // addressable draft sections — the ruling
      'heading: null', // continuous draft, exported as one span
      'heading: string | null', // the Source row type: a declaration, not a heading
      'heading: r.heading', // Source fallback only, and the Source's own heading verbatim
    ]);
  });

  it('⛔ strips nothing from the draft text', () => {
    /* The other half of the fork, and the destructive one: a mismatched strip
       eats a chapter's first line, invisibly. */
    for (const banned of ['replace(', 'slice(', 'substring(', 'trimStart', 'split(']) {
      const nearText = new RegExp(`body: text[^;\\n]*${banned.replace('(', '\\(')}`);
      expect(`text is mutated by ${banned}: ${nearText.test(CODE)}`).toBe(
        `text is mutated by ${banned}: false`,
      );
    }
  });

  it('the round trip is the whole point: text in, body out, nothing between', () => {
    /* If this ever becomes `body: something(r.text)`, every EvidenceRef offset
       and the exported book stop describing the same characters. */
    expect(CODE).toMatch(/body: text/);
  });
});

describe('export is not keeping', () => {
  it('⛔ mints no revision, no checkpoint, no kept version', () => {
    /* A version the writer did not choose to keep is still not a kept
       version — so export must never obtain a frozen revision by making one. */
    for (const banned of ['working_draft_revisions', 'checkpoint', 'revision_count']) {
      expect(`route names ${banned}: ${CODE.includes(banned)}`).toBe(`route names ${banned}: false`);
    }
    expect(CODE).not.toMatch(/INSERT INTO working_draft/);
  });

  it('⛔ refuses to export a draft at all without a settle claim', () => {
    /* The reachability defect this closes: the claim was optional and
       "enforced when present", and the only caller posted `{ format }` — so
       the guard protected nothing. A guard nothing is obliged to reach is not
       a weaker guard, it is an absent one. */
    expect(CODE).toMatch(/live && claimedVersion === undefined/);
    expect(CODE).toMatch(/settle_required[\s\S]{0,200}409/);
  });

  it('refuses when a caller’s settled version disagrees with the draft', () => {
    /* The server cannot flush a client's autosave; it can decline to disagree
       with one. A caller that has been overtaken is refused rather than handed
       a state nobody was looking at. */
    expect(CODE).toMatch(/live && claimedVersion !== live\.version/);
    expect(CODE).toMatch(/unsettled_draft[\s\S]{0,200}409/);
  });

  it('the never-drafted Source needs no claim — and refuses a false one', () => {
    expect(CODE).toMatch(/!live && claimedVersion !== undefined/);
  });

  it('⛔ every refusal returns BEFORE anything is rendered or recorded', () => {
    /* A 409 that still wrote a provenance row would record an export that
       never happened; a 409 that still rendered would burn 60–120s of pandoc
       for a file nobody receives. Both are prevented by position, so position
       is what is asserted. */
    const lastRefusal = CODE.lastIndexOf('status: 409');
    expect(lastRefusal).toBeGreaterThan(-1);
    expect(CODE.indexOf('renderMemberBook(sections')).toBeGreaterThan(lastRefusal);
    expect(CODE.indexOf('INSERT INTO manuscript_renders')).toBeGreaterThan(lastRefusal);
  });

  it('the comment strip is load-bearing, not decorative', () => {
    /* Proven: the route explains that it must not read the Source or prepend a
       derived heading, so a raw scan finds both phrases and would fail the
       file for documenting its own compliance. */
    expect(RAW).toContain('SOURCE');
    expect(RAW.toLowerCase()).toContain('derived heading');
    expect(CODE.toLowerCase()).not.toContain('derived heading');
  });
});
