/**
 * EW-F1a · INSPECTION-ONLY IS A PROPERTY OF THE PROPOSAL, NOT A PROMISE.
 *
 * ⭐⭐ THE INCIDENT THIS PINS. Twice on 2026-09-13 a proposal staged for
 * inspection was accepted and the manuscript moved — v34→v35, then v35→v36.
 * The second has NO corresponding authorial act anywhere in the record. The
 * founder's classification: system acceptance record REAL, authorial
 * ratification UNRESOLVED.
 *
 * ⛔ THE FINDING IS ARCHITECTURAL. Every other constraint in this lane is
 * structural — the write flag, the staging script's refusal to touch a database
 * without `witness` in its name, the exactly-once guard, the one-live-proposal
 * guard. "This one is for inspection only" was the single constraint held by
 * discipline alone, and it is the one that gave way. A rule that exists only in
 * a conversation is not a constraint.
 *
 * THREE INDEPENDENT REFUSALS, and the tests below keep them independent:
 *   1  the control is ABSENT in the panel
 *   2  `acceptRevision` refuses at the boundary that writes
 *   3  the schema makes an accepted inspection-only row UNREPRESENTABLE
 *
 * A UI that hides a button is a courtesy. Only 2 and 3 are constraints, and
 * `mayCrossIntoTheWork` is what 1 and 2 both ask.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mayCrossIntoTheWork } from '../contract';

const CODE = (p: string) =>
  readFileSync(join(__dirname, '..', p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const STORE = CODE('store.ts');
const PANEL = readFileSync(
  join(__dirname, '..', '..', '..', '..', 'app', 'writers-studio', 'ProposedChange.tsx'),
  'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const MIGRATION = readFileSync(
  join(__dirname, '..', '..', '..', '..', 'database', 'migrations',
       '20260913000003_revision_proposal_execution_authority.sql'), 'utf8')
  .replace(/^--.*$/gm, '');

describe('the predicate both refusals ask', () => {
  it('only member_acceptance may cross into the Work', () => {
    expect(mayCrossIntoTheWork('member_acceptance')).toBe(true);
    expect(mayCrossIntoTheWork('inspection_only')).toBe(false);
  });
});

describe('refusal 2 · the boundary that writes', () => {
  it('acceptRevision refuses inspection_only', () => {
    expect(STORE).toMatch(/!mayCrossIntoTheWork\(proposal\.executionAuthority\)/);
    expect(STORE).toMatch(/refuse\('inspection_only'\)/);
  });

  it('⭐ and refuses it BEFORE asking anything about the Work', () => {
    /* A refusal that depended on the manuscript would leak facts about the
       manuscript, and would go quiet the moment the Work happened to line up.
       This must precede already_accepted, stale_base and the text guard. */
    /* ⚠️ Scoped to the function BODY. The first draft compared indices across
       the whole file and was decided by the import line, where
       `applyExactlyOnce` happens to be listed before `mayCrossIntoTheWork` —
       an ordering assertion answered by an alphabetised import is not an
       ordering assertion. */
    const body = STORE.slice(STORE.indexOf('export async function acceptRevision'));
    const authority = body.indexOf('mayCrossIntoTheWork');
    expect(authority).toBeGreaterThan(-1);
    for (const later of ['already_accepted', 'stale_base', 'applyExactlyOnce']) {
      expect(body.indexOf(later)).toBeGreaterThan(authority);
    }
  });

  it('⛔ and the authority is read from the row, never from the caller', () => {
    expect(STORE).toContain('execution_authority');
    /* No route, no request, no argument may say what a proposal is allowed to
       do — that was fixed when it was created. */
    expect(STORE).not.toMatch(/executionAuthority\s*[:=]\s*(input|req|body|params)/);
  });
});

describe('creation · fail safe', () => {
  it('an absent authority is the one that cannot write', () => {
    expect(STORE).toMatch(/input\.executionAuthority \?\? 'inspection_only'/);
  });
});

describe('refusal 1 · the control is absent, not disabled', () => {
  it('mayAccept asks the authority, not only whether the change fits', () => {
    expect(PANEL).toMatch(/executionAuthority === 'member_acceptance'/);
  });

  it('⛔ ACCEPT CHANGES is rendered conditionally, never merely greyed out', () => {
    /* A disabled control keeps its place, still draws the eye, and is one
       defect away from live. The gesture that cannot be performed does not
       appear. */
    expect(PANEL).toMatch(/\{mayAccept\(preview\) && \([\s\S]{0,400}ACCEPT CHANGES/);
    expect(PANEL).not.toMatch(/disabled=\{!mayAccept/);
  });

  it('and the panel says what the proposal IS FOR', () => {
    expect(PANEL).toMatch(/isInspectionOnly\(preview\)/);
    expect(PANEL).toMatch(/for inspection/i);
  });
});

describe('refusal 3 · the schema', () => {
  it('an accepted inspection-only row is unrepresentable', () => {
    expect(MIGRATION).toMatch(
      /CHECK \(accepted_at IS NULL OR execution_authority = 'member_acceptance'\)/);
  });

  it('the vocabulary is closed', () => {
    expect(MIGRATION).toMatch(
      /CHECK \(execution_authority IN \('inspection_only', 'member_acceptance'\)\)/);
  });

  it('⭐ the default is the safe one', () => {
    expect(MIGRATION).toMatch(/SET DEFAULT 'inspection_only'/);
  });

  it('⭐⭐ and it cannot be promoted in place', () => {
    /* If the editorial idea should become executable that is a NEW proposal in
       a recorded relationship to this one — never the quiet relabelling of an
       authority the member never granted. */
    expect(MIGRATION).toMatch(/IS DISTINCT FROM OLD\.execution_authority/);
    expect(MIGRATION).toMatch(/RAISE EXCEPTION/);
    expect(MIGRATION).toMatch(/BEFORE UPDATE ON manuscript_revision_proposals/);
  });

  it('⛔ existing rows are backfilled honestly, not flatteringly', () => {
    /* Two of them were accepted. Recording them as inspection_only would make
       the record claim a protection that did not exist — and would contradict
       their own accepted_at, which the CHECK above would then reject. */
    expect(MIGRATION).toMatch(/SET execution_authority = 'member_acceptance'\s*WHERE execution_authority IS NULL/);
  });
});
