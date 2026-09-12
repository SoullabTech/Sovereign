import * as fs from 'fs';
import * as path from 'path';

/**
 * WS-FOCUS-DRAFT-01 — N1–N12, predeclared by the founder BEFORE implementation.
 *
 * ⭐⭐ THE RULING:
 *
 *   FOCUS reads the current, section-addressable WORKING DRAFT at one explicit
 *   draft version. `manuscript_sections` — the Source — is NOT the Focus body
 *   authority.
 *
 * ⛔ AND NOT BY A TABLE-NAME SWAP. `manuscript_draft_sections.text` is the
 * STORED representation and begins with the heading prefix; the writing surface
 * derives the editable body through `splitStoredSection`. Reading the column
 * would have shifted every passage offset by the heading's length — silently,
 * and only for sections that have one.
 *
 *   MAIA reads exactly the same current section body the writer is seeing.
 *   One source of truth for Canvas and Focus.
 *
 * ⭐ ONE ACT, ONE VERSION. Every authorized body comes from ONE call, so a
 * mixed-version read is not refused — it is unrepresentable.
 */

const calls: { sql: string; params: unknown[] }[] = [];
let draftRow: { id: string; version: string; section_addressable_at: Date | null } | null = null;
let sectionRows: { id: string; position: number; text: string; heading: string | null }[] = [];
let throwOnSections = false;

const run = async (sql: string, params: unknown[] = []) => {
  calls.push({ sql, params });
  if (/FROM manuscript_working_drafts/.test(sql)) {
    return { rows: draftRow ? [draftRow] : [], rowCount: draftRow ? 1 : 0 };
  }
  if (/FROM manuscript_draft_sections/.test(sql)) {
    if (throwOnSections) throw new Error('substrate down');
    const only = params[1] as string[] | null;
    const rows = only ? sectionRows.filter((r) => only.includes(r.id)) : sectionRows;
    return { rows, rowCount: rows.length };
  }
  return { rows: [], rowCount: 0 };
};
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(run), transaction: jest.fn() }));

import { bodyOfMember, readCurrentDraft } from '../currentDraftRead';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const lib = (...p: string[]) => strip(fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8'));
const readerSrc = lib('currentDraftRead.ts');
const crossingSrc = lib('focusCrossing.ts');
const presenceSrc = lib('focusPresence.ts');

const D = 'dddddddd-0000-4000-8000-000000000001';
const S1 = 'aaaaaaaa-0000-4000-8000-000000000001';
const S2 = 'aaaaaaaa-0000-4000-8000-000000000002';
const NOT_EDITABLE = 'aaaaaaaa-0000-4000-8000-000000000009';

/** The stored form: heading prefix, blank line, then the member's body. */
const stored = (heading: string, body: string) => `${heading}\n\n${body}`;
const BODY1 = 'The fire was already lit when we came down the path.';
const BODY2 = 'Someone had banked it. 🜂 Nobody said whose watch it had been.';

beforeEach(() => {
  calls.length = 0;
  throwOnSections = false;
  draftRow = { id: D, version: '37', section_addressable_at: new Date() };
  sectionRows = [
    { id: S1, position: 0, text: stored('THE PRESENT MOMENT', BODY1), heading: 'THE PRESENT MOMENT' },
    { id: S2, position: 1, text: stored('SUSTAINING THE FIRE', BODY2), heading: 'SUSTAINING THE FIRE' },
    { id: NOT_EDITABLE, position: 2, text: 'a slice this cut cannot split', heading: 'A DIFFERENT HEADING' },
  ];
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const read = (ids: string[] = [S1, S2]) =>
  readCurrentDraft({ memberId: 'm-1', workRef: 'w-1', sectionRefs: ids });

/* ══ N1 · N2 — draft identity resolves; Source absence is irrelevant ═══════ */

describe('N1 — a real Focus member id from manuscript_draft_sections resolves', () => {
  it('reads the draft, at its version, and finds the members', async () => {
    const r = await read();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.draftId).toBe(D);
    expect(r.snapshot.version).toBe(37);
    expect(r.snapshot.sections.get(S1)?.id).toBe(S1);
  });

  it('⭐ the body is the WRITER’S body — the heading prefix is not in it', async () => {
    const r = await read();
    if (!r.ok) return;
    expect(bodyOfMember(r.snapshot, S1)).toEqual({ ok: true, body: BODY1 });
    /* ⛔ The stored column would have carried the heading. A table-name swap
       would have passed a "reads the draft" test and failed this one. */
    expect(bodyOfMember(r.snapshot, S1)).not.toEqual({ ok: true, body: stored('THE PRESENT MOMENT', BODY1) });
  });
});

describe('N2 — the same id absent from manuscript_sections still resolves', () => {
  it('nothing on the path queries the Source section table', async () => {
    await read();
    for (const c of calls) {
      expect(c.sql).not.toMatch(/FROM manuscript_sections\b/);
    }
    /* The heading arrives by LEFT JOIN for the split only, never as the body. */
    expect(calls.some((c) => /FROM manuscript_draft_sections/.test(c.sql))).toBe(true);
  });
});

/* ══ N3 — ownership through the draft ═════════════════════════════════════ */

describe('N3 — ownership is proven inside the read', () => {
  it('the draft is found by (manuscript_id, member_id), not by id alone', async () => {
    await read();
    const draftQ = calls.find((c) => /FROM manuscript_working_drafts/.test(c.sql))!;
    expect(draftQ.sql).toMatch(/manuscript_id = \$1 AND member_id = \$2/);
    expect(draftQ.params).toEqual(['w-1', 'm-1']);
  });

  it('and the sections are scoped to THAT draft', async () => {
    await read();
    const secQ = calls.find((c) => /FROM manuscript_draft_sections/.test(c.sql))!;
    expect(secQ.sql).toMatch(/s\.draft_id = \$1/);
    expect(secQ.params[0]).toBe(D);
  });
});

/* ══ N4 · N5 — the Source is never the body; one projection ═══════════════ */

describe('N4 — Source body is never used as Focus content', () => {
  it('the retired assembler is gone from the tree', () => {
    expect(fs.existsSync(path.join(__dirname, '..', 'assembleFocus.ts'))).toBe(false);
  });

  it('⛔ neither the reader nor the crossing names the Source table', () => {
    expect(readerSrc).not.toMatch(/FROM manuscript_sections\b/);
    expect(crossingSrc).not.toMatch(/manuscript_sections/);
    expect(presenceSrc).not.toMatch(/FROM manuscript_sections\b/);
  });

  it('⛔ and no `.body` column is selected anywhere on the path', () => {
    expect(readerSrc).not.toMatch(/SELECT[^;]*\bbody\b/i);
    expect(presenceSrc).not.toMatch(/SELECT[^;]*\bbody\b/i);
  });
});

describe('N5 — the body comes through the writing surface’s own projection', () => {
  it('the reader delegates to loadEditableSections, and implements no split of its own', () => {
    expect(readerSrc).toMatch(/loadEditableSections\(/);
    expect(readerSrc).not.toMatch(/splitStoredSection|headingPrefix|indexOf\('\\n\\n'\)/);
  });

  it('⭐ the same function serves the Canvas — one source of truth', () => {
    const save = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', 'manuscript', 'sections', 'saveSection.ts'), 'utf8'));
    // resolveDraftWriteState is what /write-state answers the Canvas with.
    expect(save).toMatch(/resolveDraftWriteState[\s\S]*loadEditableSections\(/);
  });

  it('a section this cut cannot project is refused, never handed over raw', async () => {
    const r = await read([NOT_EDITABLE]);
    if (!r.ok) return;
    expect(bodyOfMember(r.snapshot, NOT_EDITABLE))
      .toEqual({ ok: false, failure: 'section_not_projectable' });
  });
});

/* ══ N6 · N7 — one act, one version ══════════════════════════════════════ */

describe('N6 — every readable member in one act carries one draft and version', () => {
  it('one call yields one snapshot for all of them', async () => {
    const r = await read([S1, S2]);
    if (!r.ok) return;
    expect(r.snapshot.version).toBe(37);
    expect([...r.snapshot.sections.keys()].sort()).toEqual([S1, S2].sort());
    // ⭐ ONE draft row read, ONE section read. Not one per member.
    expect(calls.filter((c) => /FROM manuscript_working_drafts/.test(c.sql))).toHaveLength(1);
    expect(calls.filter((c) => /FROM manuscript_draft_sections/.test(c.sql))).toHaveLength(1);
  });

  it('only the authorized ids are selected — a withheld body is never loaded', async () => {
    await read([S1]);
    const secQ = calls.find((c) => /FROM manuscript_draft_sections/.test(c.sql))!;
    expect(secQ.params[1]).toEqual([S1]);
  });
});

describe('N7 — a mixed-version Focus read is unrepresentable', () => {
  it('the crossing reads the draft exactly once, before any participation', () => {
    const body = crossingSrc.slice(crossingSrc.indexOf('export async function performFocusCrossing'));
    expect(body.match(/deps\.readDraft\(/g) ?? []).toHaveLength(1);
    expect(body.indexOf('deps.readDraft(')).toBeLessThan(body.indexOf('focusParticipation({'));
  });

  it('⛔ there is no per-member body read left on the path', () => {
    expect(crossingSrc).not.toMatch(/deps\.assemble|FocusAssembler/);
    expect(crossingSrc).toMatch(/bodyOfMember\(snapshot\.snapshot/);
  });

  it('the version the bodies came from is what reaches the act record', () => {
    expect(crossingSrc).toMatch(/workingDraftVersion: snapshot\.snapshot\.version/);
    expect(crossingSrc).toMatch(/workingDraftId: snapshot\.snapshot\.draftId/);
  });
});

/* ══ N8 — presence moves with it ═════════════════════════════════════════ */

describe('N8 — FocusPresence resolves draft-section identity', () => {
  it('it probes the draft namespace, through the draft’s own custody', () => {
    expect(presenceSrc).toMatch(/FROM manuscript_draft_sections/);
    expect(presenceSrc).toMatch(/JOIN manuscript_working_drafts/);
    expect(presenceSrc).toMatch(/d\.manuscript_id = \$1 AND d\.member_id = \$2/);
  });

  it('⛔ and its P13 law is unchanged — ids only', () => {
    expect(presenceSrc).toMatch(/SELECT s\.id FROM/);
    expect(presenceSrc).not.toMatch(/heading|text\b|content/i);
  });
});

/* ══ N9 · N10 — an empty lookup is not a database error ══════════════════ */

describe('N9 — an empty result produces a typed, observable refusal', () => {
  it('no draft at all is `no_draft`', async () => {
    draftRow = null;
    expect(await read()).toEqual({ ok: false, failure: 'no_draft' });
  });

  it('a draft that is not section-addressable says so', async () => {
    draftRow = { id: D, version: '37', section_addressable_at: null };
    expect(await read()).toEqual({ ok: false, failure: 'draft_not_section_addressable' });
  });

  it('a member absent from the draft is `section_not_found`', async () => {
    const r = await read([S1]);
    if (!r.ok) return;
    expect(bodyOfMember(r.snapshot, 'no-such-section'))
      .toEqual({ ok: false, failure: 'section_not_found' });
  });

  it('⛔ and the crossing LOGS the cause — the witness had to query receipts by hand', () => {
    expect(crossingSrc).toMatch(/\[FOCUS\] the current Work could not be read/);
    expect(crossingSrc).toMatch(/failure: snapshot\.failure/);
    expect(crossingSrc).toMatch(/no readable member/);
    expect(crossingSrc).toMatch(/readonly failure: CrossingFailure \| null/);
  });

  it('every distinct failure has its own name', () => {
    const named = new Set(
      [...crossingSrc.matchAll(/failure: '([a-z_]+)'/g)].map((m) => m[1]),
    );
    for (const f of [
      'boundary_refused', 'no_readable_members', 'participation_unconstructable',
      'act_contradiction', 'act_unrecordable', 'handoff_not_prepared', 'handoff_failed',
    ]) expect(named).toContain(f);
  });
});

describe('N10 — a thrown DB error and an empty lookup remain distinguishable', () => {
  it('a throw is `read_failed`, never `section_not_found`', async () => {
    throwOnSections = true;
    expect(await read()).toEqual({ ok: false, failure: 'read_failed' });
  });

  it('⛔ and the empty case never reports a failure it did not have', async () => {
    draftRow = null;
    const r = await read();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).not.toBe('read_failed');
  });
});

/* ══ N11 · N12 — the act records what it read ════════════════════════════ */

describe('N11 — act provenance records the draft version actually read', () => {
  const migration = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'database', 'migrations',
      '20260912000002_focus_act_draft_provenance.sql'), 'utf8');

  it('the schema carries the draft and the version, and nothing else new', () => {
    expect(migration).toMatch(/working_draft_id\s+uuid/);
    expect(migration).toMatch(/working_draft_version\s+integer/);
    /* ⛔ Content-free, like every other column on this table. */
    const decl = migration.replace(/--.*/g, '');
    expect(decl).not.toMatch(/\b(body|text|content|quote|summary|excerpt|diff|jsonb?)\b/i);
  });

  it('a draft without its version cannot exist', () => {
    expect(migration).toMatch(/\(working_draft_id IS NULL\) = \(working_draft_version IS NULL\)/);
  });

  it('the store writes and reads them both', () => {
    const act = lib('focusCrossingAct.ts');
    expect(act).toMatch(/working_draft_id, working_draft_version/);
    expect(act).toMatch(/workingDraftVersion/);
  });
});

describe('N12 — the next Ask after an edit reads the newer version', () => {
  it('a later version is a NEW act, not a retry of the old one', () => {
    const act = lib('focusCrossingAct.ts');
    /* ⭐ The same actId arriving with a different version is a CONTRADICTION:
       MAIA would be reasoning from prose the first attempt never saw. */
    expect(act).toMatch(/a new version is a new act/);
    expect(act).toMatch(/stored\.workingDraftVersion !== input\.workingDraftVersion/);
  });

  it('and the reader always takes the version from the draft row, never a cache', async () => {
    const first = await read();
    draftRow = { id: D, version: '38', section_addressable_at: new Date() };
    calls.length = 0;
    const second = await read();
    if (!first.ok || !second.ok) return;
    expect(first.snapshot.version).toBe(37);
    expect(second.snapshot.version).toBe(38);
    expect(calls.filter((c) => /FROM manuscript_working_drafts/.test(c.sql))).toHaveLength(1);
  });
});

/* ══ ⭐ code points, which is how the offsets were always specified ═══════ */

describe('the passage range is resolved in code points, not code units', () => {
  it('a range spanning an astral character lands on whole characters', async () => {
    const r = await read([S2]);
    if (!r.ok) return;
    expect([...BODY2].length).not.toBe(BODY2.length);
    /* ⭐ WS-FOCUS-PASSAGE-01 — the range now NAMES ITS SPACE. These offsets are
       stored-section coordinates, as every developmental anchor is, so the
       span they denote is body 0–30 after the 21-code-point prefix. The
       obligation is unchanged: whole characters, never code units. */
    const got = bodyOfMember(r.snapshot, S2, { space: 'stored_section_text', start: 21, end: 51 });
    expect(got).toEqual({ ok: true, body: [...BODY2].slice(0, 30).join('') });
    /* ⛔ The code-unit implementation would have cut here instead. */
    expect(got).not.toEqual({ ok: true, body: BODY2.slice(0, 30) });
  });

  it('an out-of-bounds range REFUSES and is never clamped', async () => {
    const r = await read([S1]);
    if (!r.ok) return;
    expect(bodyOfMember(r.snapshot, S1, { space: 'stored_section_text', start: 30, end: 99999 }))
      .toEqual({ ok: false, failure: 'range_out_of_bounds' });
    expect(bodyOfMember(r.snapshot, S1, { space: 'stored_section_text', start: 29, end: 29 }))
      .toEqual({ ok: false, failure: 'range_out_of_bounds' });
    /* ⛔ And a range that begins inside the heading prefix is refused rather
       than nudged to the start of the body. */
    expect(bodyOfMember(r.snapshot, S1, { space: 'stored_section_text', start: 10, end: 99 }))
      .toEqual({ ok: false, failure: 'range_precedes_body' });
  });

  it('a whole-section member takes the whole current body', async () => {
    const r = await read([S1]);
    if (!r.ok) return;
    expect(bodyOfMember(r.snapshot, S1)).toEqual({ ok: true, body: BODY1 });
  });
});
