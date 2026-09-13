/**
 * EDITORIAL-WRITE-01 — EW-1 … EW-16, predeclared by the founder BEFORE the build.
 *
 *   The proposal supplies AUTHORITY. The existing section writer supplies
 *   MUTATION. One transaction binds them, and neither impersonates the other.
 *
 * ⭐ THE FAKE ROLLS BACK FOR REAL. `transaction()` snapshots every table and
 * restores it on a throw, so EW-12 — a failed write leaves the proposal
 * unaccepted — is a measurement rather than a claim.
 *
 * ⛔ AND THE FAKE ENFORCES NOTHING THE CODE SHOULD ENFORCE. Five times in this
 * programme a fixture has quietly done the implementation's job and reported it
 * as a pass. Version comparison, the expected-text guard and single-use
 * acceptance all live in the code; this only stores rows and returns them.
 */

import * as fs from 'fs';
import * as path from 'path';

type Tables = {
  drafts: Record<string, unknown>[];
  sections: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  proposals: Record<string, unknown>[];
};
let db: Tables;
/** ⭐ EW-8/EW-14 · every statement, so writes are counted not assumed. */
let statements: string[] = [];
let failNextSectionUpdate = false;

const clone = (t: Tables): Tables => JSON.parse(JSON.stringify(t));

const run = async (sql: string, params: unknown[] = []) => {
  statements.push(sql);

  if (/SELECT id, version, section_addressable_at/.test(sql)) {
    const [manuscriptId, memberId] = params as string[];
    const d = db.drafts.find((x) => x.manuscript_id === manuscriptId && x.member_id === memberId);
    return d ? { rows: [d], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  /* ⛔ ORDER MATTERS, AND THE FIRST DRAFT GOT IT WRONG. A generic
     `/FROM manuscript_working_drafts/` branch placed above this one swallowed
     `saveSectionInTransaction`'s OWN draft query — which takes different
     parameters — so the happy path refused as `draft_not_found` and five tests
     failed for a reason that had nothing to do with the law. The specific
     statement is matched first. */
  if (/FROM manuscript_working_drafts/.test(sql)) {
    const [id, manuscriptId, memberId] = params as string[];
    const d = db.drafts.find((x) => x.id === id && x.manuscript_id === manuscriptId
      && x.member_id === memberId);
    return d ? { rows: [d], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (/FROM manuscript_draft_sections s/.test(sql)) {
    const [sid, did] = params as string[];
    const s = db.sections.find((x) => x.id === sid && x.draft_id === did);
    if (!s) return { rows: [], rowCount: 0 };
    const src = db.sources.find((x) => x.id === s.source_section_id);
    return { rows: [{ ...s, heading: src ? src.heading : null }], rowCount: 1 };
  }
  if (/UPDATE manuscript_draft_sections/.test(sql)) {
    if (failNextSectionUpdate) { failNextSectionUpdate = false; throw new Error('section write failed'); }
    const [id, text] = params as string[];
    const s = db.sections.find((x) => x.id === id);
    if (s) s.text = text;
    return { rows: [], rowCount: 1 };
  }
  if (/UPDATE manuscript_working_drafts/.test(sql)) {
    const [id] = params as string[];
    const d = db.drafts.find((x) => x.id === id);
    if (d) d.version = Number(d.version) + 1;
    return { rows: [{ version: d ? d.version : 0 }], rowCount: 1 };
  }
  if (/INSERT INTO manuscript_revision_proposals/.test(sql)) {
    const [memberId, workId, draftId, baseVersion, targetSectionId,
      expected, replacement, chain] = params as never[];
    const row = {
      id: `p-${db.proposals.length + 1}`, member_id: memberId, work_id: workId,
      draft_id: draftId, base_version: baseVersion, operation: 'delete_exact_text',
      target_section_id: targetSectionId, expected_text: expected,
      replacement_text: replacement, decision_chain_id: chain,
      created_at: new Date('2026-09-13T13:00:00Z'), accepted_at: null, resulting_version: null,
    };
    db.proposals.push(row);
    return { rows: [row], rowCount: 1 };
  }
  if (/UPDATE manuscript_revision_proposals/.test(sql)) {
    const [id, memberId, version] = params as never[];
    const p = db.proposals.find((x) => x.id === id && x.member_id === memberId
      && x.accepted_at === null);
    if (!p) return { rows: [], rowCount: 0 };
    /* ⭐ The CHECK, modelled: both together or the row is invalid. */
    p.accepted_at = new Date('2026-09-13T13:05:00Z'); p.resulting_version = version;
    return { rows: [p], rowCount: 1 };
  }
  if (/FROM manuscript_revision_proposals/.test(sql)) {
    const [id, memberId] = params as string[];
    const p = db.proposals.find((x) => x.id === id && x.member_id === memberId);
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  return { rows: [], rowCount: 0 };
};

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn((sql: string, params?: unknown[]) => run(sql, params)),
  /** ⭐ A REAL ROLLBACK — the snapshot is restored on any throw. */
  transaction: jest.fn(async (cb: (tx: { query: typeof run }) => Promise<unknown>) => {
    const snapshot = clone(db);
    try { return await cb({ query: run }); } catch (e) { db = snapshot; throw e; }
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const store = require('../store');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { previewProposal, mayAccept } = require('../preview');
import { applyExactlyOnce, occurrences } from '../contract';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*--.*$/gm, '').replace(/^\s*\/\/.*$/gm, '');
const MIGRATION = fs.readFileSync(path.join(process.cwd(),
  'database/migrations/20260913000002_manuscript_revision_proposals.sql'), 'utf8');

const M = 'aaaaaaaa-0000-4000-8000-00000000000a';
const W = 'bbbbbbbb-0000-4000-8000-00000000000b';
const DRAFT = 'cccccccc-0000-4000-8000-00000000000c';
const S23 = 'dddddddd-0000-4000-8000-00000000000d';
const SRC23 = 'eeeeeeee-0000-4000-8000-00000000000e';
const HEADING = 'THE SPIRALING PATH OF PERSONAL DEVELOPMENT';
const TOKEN = 'WITNESS-ALPHA';
const BODY = `Some authored prose about the spiral.\n\nCHAPTER 3\n\n${TOKEN}\n`;
const STORED = `${HEADING}\n\n${BODY}`;

const seed = (body = BODY) => {
  db = {
    drafts: [{ id: DRAFT, manuscript_id: W, member_id: M, version: 34,
      section_addressable_at: '2026-01-01' }],
    sections: [{ id: S23, draft_id: DRAFT, position: 22, text: `${HEADING}\n\n${body}`,
      source_section_id: SRC23 }],
    sources: [{ id: SRC23, heading: HEADING }],
    proposals: [],
  };
  statements = []; failNextSectionUpdate = false;
};

const propose = () => store.proposeRevision(M, {
  workId: W, draftId: DRAFT, baseVersion: 34, targetSectionId: S23,
  expectedText: TOKEN, replacementText: '',
});

const sectionText = () => db.sections[0].text as string;
const version = () => Number(db.drafts[0].version);

beforeEach(() => seed());

/* ══ EW-1 · EW-2 — before acceptance ═══════════════════════════════════ */

describe('EW-1 — before acceptance nothing has moved', () => {
  it('the Work is v34 and the token is still present', async () => {
    await propose();
    expect(version()).toBe(34);
    expect(sectionText()).toContain(TOKEN);
  });
});

describe('EW-2 — a proposal is visible and NON-EXECUTABLE', () => {
  it('⭐ preparing and reading one changes not a character', async () => {
    const before = sectionText();
    const p = await propose();
    const read = await store.readProposal(M, p.id);
    expect(read.id).toBe(p.id);
    expect(read.acceptedAt).toBeNull();
    expect(read.resultingVersion).toBeNull();
    expect(sectionText()).toBe(before);
    expect(version()).toBe(34);
  });
});

/* ══ EW-3 · EW-4 · EW-5 — the guards ═══════════════════════════════════ */

describe('EW-3 — a Work that moved past the base REFUSES', () => {
  it('stale_base, and nothing is written', async () => {
    const p = await propose();
    db.drafts[0].version = 35;
    const r = await store.acceptRevision(M, p.id);
    expect(r).toEqual({ outcome: 'refused', reason: 'stale_base' });
    expect(db.proposals[0].accepted_at).toBeNull();
  });
});

describe('EW-4 — ⭐ the version alone never authorizes the write', () => {
  it('the token gone at an UNCHANGED version still REFUSES', async () => {
    const p = await propose();
    /* v34 exactly as proposed — only the characters are gone. */
    db.sections[0].text = `${HEADING}\n\nSome authored prose about the spiral.\n`;
    expect(version()).toBe(34);
    const r = await store.acceptRevision(M, p.id);
    expect(r).toEqual({ outcome: 'refused', reason: 'expected_text_absent' });
    expect(db.proposals[0].accepted_at).toBeNull();
  });
});

describe('EW-5 — ⭐⭐ text occurring twice is AMBIGUOUS, not "the first one"', () => {
  it('two occurrences refuse and write nothing', async () => {
    seed(`${BODY}\nand again ${TOKEN}\n`);
    const p = await propose();
    const before = sectionText();
    const r = await store.acceptRevision(M, p.id);
    expect(r).toEqual({ outcome: 'refused', reason: 'expected_text_ambiguous' });
    expect(sectionText()).toBe(before);
    expect(version()).toBe(34);
  });

  it('the guard is pure and counts without overlap', () => {
    expect(occurrences('aaaa', 'aa')).toBe(2);
    expect(applyExactlyOnce('x', 'q', '')).toEqual({ ok: false, reason: 'expected_text_absent' });
    expect(applyExactlyOnce('q q', 'q', '')).toEqual({ ok: false, reason: 'expected_text_ambiguous' });
    expect(applyExactlyOnce('a q b', 'q', '')).toEqual({ ok: true, applied: 'a  b' });
  });
});

/* ══ EW-6 · EW-7 · EW-8 · EW-13 — the accepted change ══════════════════ */

describe('EW-6 · EW-7 · EW-13 — the change, and ONLY the change', () => {
  it('⭐⭐ v35, the token absent, and every other character identical', async () => {
    const before = sectionText();
    const p = await propose();
    const r = await store.acceptRevision(M, p.id);

    expect(r.outcome).toBe('accepted');
    expect(version()).toBe(35);
    expect(sectionText()).not.toContain(TOKEN);
    /* ⭐ EW-7 · the rest of the manuscript, character for character. */
    expect(sectionText()).toBe(before.replace(TOKEN, ''));
    /* ⭐ EW-13 · o26 can now be re-evaluated: the token is simply not there. */
    expect(occurrences(sectionText(), TOKEN)).toBe(0);
  });

  it('⛔ the heading is untouched — the writer never asked for it to change', async () => {
    const p = await propose();
    await store.acceptRevision(M, p.id);
    expect(sectionText().startsWith(`${HEADING}\n\n`)).toBe(true);
  });

  it('EW-8 · exactly ONE section write and ONE version advance occurred', async () => {
    const p = await propose();
    statements = [];
    await store.acceptRevision(M, p.id);
    expect(statements.filter((s) => /UPDATE manuscript_draft_sections/.test(s))).toHaveLength(1);
    expect(statements.filter((s) => /UPDATE manuscript_working_drafts/.test(s))).toHaveLength(1);
  });
});

/* ══ EW-9 · EW-10 — single use, scoped ════════════════════════════════ */

describe('EW-9 — a proposal authorizes one change, ONCE', () => {
  it('⭐ a second acceptance refuses and the Work does not move again', async () => {
    const p = await propose();
    await store.acceptRevision(M, p.id);
    const after = sectionText();
    const again = await store.acceptRevision(M, p.id);
    expect(again).toEqual({ outcome: 'refused', reason: 'already_accepted' });
    expect(version()).toBe(35);
    expect(sectionText()).toBe(after);
  });
});

describe('EW-10 — another member’s proposal is indistinguishable from absent', () => {
  it('both refuse identically', async () => {
    const p = await propose();
    const other = await store.acceptRevision('ffffffff-0000-4000-8000-00000000000f', p.id);
    const absent = await store.acceptRevision(M, 'p-nope');
    expect(other).toEqual({ outcome: 'refused', reason: 'proposal_unknown' });
    expect(other).toEqual(absent);
  });
});

/* ══ EW-11 · EW-15 — one mutation, one seam ═══════════════════════════ */

describe('EW-11 — no second manuscript write path is added', () => {
  it('⛔ the store issues no UPDATE against manuscript_draft_sections', () => {
    const src = CODE('lib/manuscript/revisionProposal/store.ts');
    expect(src).not.toMatch(/UPDATE manuscript_draft_sections/);
    expect(src).not.toMatch(/UPDATE manuscript_working_drafts/);
  });
});

describe('EW-15 — acceptance and mutation share ONE TransactionClient', () => {
  it('⭐⭐ it calls the transaction-aware seam, never the public wrapper', () => {
    const src = CODE('lib/manuscript/revisionProposal/store.ts');
    expect(src).toMatch(/saveSectionInTransaction\(\s*tx,/);
    /* ⛔ The public `saveSection` opens its OWN transaction on a second pool
       client — the write would land outside this BEGIN and a rollback could
       not undo it. */
    expect(src).not.toMatch(/[^a-zA-Z]saveSection\(/);
  });

  it('⛔ and the section writer was not taught about proposals', () => {
    const src = CODE('lib/manuscript/sections/saveSection.ts');
    for (const f of [/expected_text|expectedText/, /proposal/i, /accepted_at|acceptedAt/]) {
      expect(src).not.toMatch(f);
    }
  });
});

/* ══ EW-12 · EW-16 — no claimed-but-not-written state ═════════════════ */

describe('EW-12 — the lock and the write are ONE transaction', () => {
  it('⭐⭐ a failed section write leaves the proposal UNACCEPTED and the Work whole', async () => {
    const before = sectionText();
    const p = await propose();
    failNextSectionUpdate = true;
    const r = await store.acceptRevision(M, p.id);
    expect(r.outcome).toBe('refused');
    expect(db.proposals[0].accepted_at).toBeNull();
    expect(db.proposals[0].resulting_version).toBeNull();
    expect(sectionText()).toBe(before);
    expect(version()).toBe(34);
  });
});

describe('EW-16 — accepted_at and resulting_version become non-null TOGETHER', () => {
  it('⭐ there is no durable claimed-but-unwritten state', async () => {
    const p = await propose();
    expect(db.proposals[0].accepted_at).toBeNull();
    expect(db.proposals[0].resulting_version).toBeNull();
    await store.acceptRevision(M, p.id);
    expect(db.proposals[0].accepted_at).not.toBeNull();
    expect(db.proposals[0].resulting_version).toBe(35);
  });

  it('⛔ the schema forbids the half state, and a CHECK is not deferred', () => {
    expect(MIGRATION).toMatch(/\(accepted_at IS NULL\) = \(resulting_version IS NULL\)/);
  });

  it('⛔ the store writes them in ONE statement, after the mutation', () => {
    const src = CODE('lib/manuscript/revisionProposal/store.ts');
    expect(src).toMatch(/SET accepted_at = now\(\), resulting_version = \$3/);
    const save = src.indexOf('saveSectionInTransaction');
    const accept = src.indexOf('SET accepted_at');
    expect(save).toBeGreaterThan(-1);
    expect(accept).toBeGreaterThan(save);
  });
});

/* ══ EW-14 — the boundaries stay separate ═════════════════════════════ */

describe('EW-14 — a proposal writes no standing and no decision', () => {
  it('⭐ neither table is touched by proposing or accepting', async () => {
    const p = await propose();
    await store.acceptRevision(M, p.id);
    const touched = statements.filter((s) =>
      /developmental_observation_standing_events|editorial_decision_events/.test(s));
    expect(touched).toEqual([]);
  });

  it('⛔ and the module imports neither', () => {
    const src = CODE('lib/manuscript/revisionProposal/store.ts');
    expect(src).not.toMatch(/standing|editorialDecision/);
  });
});

/* ══ the specimen ═════════════════════════════════════════════════════ */

describe('o26 — the first lawful manuscript change', () => {
  it('⭐ thirteen characters, and nothing else in the Work', async () => {
    const before = sectionText();
    const p = await propose();
    await store.acceptRevision(M, p.id);
    expect(before.length - sectionText().length).toBe(TOKEN.length);
    expect(version()).toBe(35);
  });
});

/* ══ CS-3 · CS-4 · CS-5 · CS-6 — the consent surface, behaviourally ═════ */

describe('CS-3 — the preview and the acceptance consume the SAME guard', () => {
  it('⭐⭐ the surface cannot advertise acceptable where acceptance refuses', async () => {
    /* Two occurrences: acceptance refuses as ambiguous, so the preview must
       refuse identically. FOCUS-W3 was exactly this defect one layer up — a
       panel saying five places were ready while the crossing could read four. */
    seed(`${BODY}\nand again ${TOKEN}\n`);
    const p = await propose();
    const preview = await previewProposal(M, p.id);
    const accept = await store.acceptRevision(M, p.id);
    expect(preview.state).toBe('no_longer_matches');
    expect(preview.reason).toBe('expected_text_ambiguous');
    expect(accept).toEqual({ outcome: 'refused', reason: 'expected_text_ambiguous' });
  });

  it('⛔ the preview does not re-implement the guard', () => {
    const src = CODE('lib/manuscript/revisionProposal/preview.ts');
    expect(src).toMatch(/applyExactlyOnce\(/);
    expect(src).not.toMatch(/indexOf\(proposal\.expectedText\)\s*===\s*-1/);
    expect(src).not.toMatch(/occurrences\(/);
  });
});

describe('CS-4 — a proposal that no longer matches offers NO gesture', () => {
  it('a moved Work previews as no_longer_matches, and mayAccept is false', async () => {
    const p = await propose();
    db.drafts[0].version = 35;
    const preview = await previewProposal(M, p.id);
    expect(preview).toEqual({ state: 'no_longer_matches', proposalId: p.id, reason: 'stale_base' });
    expect(mayAccept(preview)).toBe(false);
  });

  it('⭐ and the token gone at an UNCHANGED version is still no gesture', async () => {
    const p = await propose();
    db.sections[0].text = `${HEADING}\n\nprose with no token\n`;
    const preview = await previewProposal(M, p.id);
    expect(preview.reason).toBe('expected_text_absent');
    expect(mayAccept(preview)).toBe(false);
  });
});

describe('CS-5 — ⛔ the preview NEVER computes an alternative', () => {
  it('a mismatch yields a refusal and nothing resembling a change', async () => {
    const p = await propose();
    db.drafts[0].version = 35;
    const preview = await previewProposal(M, p.id);
    expect(preview).not.toHaveProperty('change');
    expect(JSON.stringify(preview)).not.toContain(TOKEN);
  });

  it('⛔ nothing in the preview relocates, widens or regenerates', () => {
    const src = CODE('lib/manuscript/revisionProposal/preview.ts');
    for (const f of [/replace\(/, /RegExp/, /trim\(\)\.includes/, /fuzzy/i, /nearest/i]) {
      expect(src).not.toMatch(f);
    }
  });
});

describe('CS-6 — an accepted proposal previews as accepted, not acceptable', () => {
  it('⭐ the gesture is gone once it has been used', async () => {
    const p = await propose();
    await store.acceptRevision(M, p.id);
    const preview = await previewProposal(M, p.id);
    expect(preview.state).toBe('already_accepted');
    expect(preview.resultingVersion).toBe(35);
    expect(mayAccept(preview)).toBe(false);
  });
});

describe('CS-9 — an unknown proposal is indistinguishable from another member’s', () => {
  it('both preview as unknown', async () => {
    const p = await propose();
    expect(await previewProposal('ffffffff-0000-4000-8000-00000000000f', p.id))
      .toEqual({ state: 'unknown' });
    expect(await previewProposal(M, 'p-nope')).toEqual({ state: 'unknown' });
  });
});

describe('the staged diff shows the member their own Work', () => {
  it('⭐ names the place in the writer’s vocabulary and frames the removal', async () => {
    const p = await propose();
    const preview = await previewProposal(M, p.id);
    expect(preview.state).toBe('acceptable');
    expect(preview.change.sectionLabel).toBe(`Section 23 · \u201c${HEADING}\u201d`);
    expect(preview.change.removed).toBe(TOKEN);
    expect(preview.change.changeCount).toBe(1);
    /* ⛔ The frame is the member's own prose, not a description of it. */
    expect(preview.change.contextBefore).toContain('CHAPTER 3');
  });
});
