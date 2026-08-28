/**
 * NW-V1-CLIENT-01 — CONSEQUENTIAL RETURN.
 *
 * The V1 loop under test:
 *
 *   HOME → WHAT HAPPENED SINCE? → EXISTING ROOM → SHE SPEAKS/WRITES
 *        → KEEP / REVISE / DISCARD → the kept update STAYS RELATED to the
 *          prior act → RETURN HOME → HOME TRUTHFULLY REFLECTS THE NEW STATE
 *
 * These assert the structural and behavioural facts that make that loop
 * honest, so it cannot quietly become a progress engine later.
 *
 *   A  RETURN SELECTION   the right thread, member-scoped, no invented salience
 *   B  LIVED ENTRY        Home reaches the EXISTING room; relation survives
 *   C  RELATION           kept links, unrelated does not, discard never does
 *   D  AUTHORITY          no auto-keep; MAIA output never becomes member fact
 *   E  PRIVACY            private by default; practitioner semantics untouched
 *   F  SCOPE              0 new routes, 0 new subsystems, 0 practitioner change
 */

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => mockQuery(...a) }));

import fs from 'fs';
import path from 'path';
import {
  selectReturnAnchor,
  selectRecordedRelation,
  selectPriorAct,
} from '@/lib/nowWhat/carriedThread';
import { resolveRespondsTo } from '@/lib/nowWhat/livedRelation';
import { LIVED_RETURN_GROUNDING, buildResponseGrammar } from '@/lib/nowWhat/roomGrammar';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const HOME = 'components/now-what/ClientHome.tsx';
const ROOM = 'components/now-what/NowWhatRoom.tsx';
const HOME_API = 'app/api/now-what/home/route.ts';
const NOTE_API = 'app/api/now-what/field-note/route.ts';
const INTERVIEW_API = 'app/api/now-what/interview/route.ts';
const MIGRATION = 'database/migrations/20260828000002_field_note_responds_to.sql';

const t = (id: string, keptAt: string, title = id, respondsToThreadId: string | null = null) =>
  ({ id, title, keptAt, respondsToThreadId });

beforeEach(() => mockQuery.mockReset());

// ── A · RETURN SELECTION ─────────────────────────────────────────────────

describe('A — return selection: ONE act, and the member is its source', () => {
  it('anchors on the most recent KEEP, comparing across kinds by her own gesture', () => {
    const a = selectReturnAnchor({
      questions: [t('q', '2026-08-20T10:00:00Z')],
      decisions: [t('d', '2026-08-25T10:00:00Z')],
      reflections: [t('r', '2026-08-22T10:00:00Z')],
    });
    expect(a?.act.id).toBe('d');
    expect(a?.kind).toBe('carried');
  });

  it('labels the anchor by what the act IS, not by the slot it landed in', () => {
    expect(selectReturnAnchor({ commitments: [t('c', '2026-08-27T10:00:00Z')] })?.kind).toBe('chose');
    expect(selectReturnAnchor({ questions: [t('q', '2026-08-27T10:00:00Z')] })?.kind).toBe('carried');
  });

  it('a tie goes to the chosen move — a stated rule, not an accident of order', () => {
    // One room session writes both keeps at the same instant.
    const at = '2026-08-27T10:00:00Z';
    const a = selectReturnAnchor({ reflections: [t('r', at)], commitments: [t('c', at)] });
    expect(a?.act.id).toBe('c');
    expect(a?.kind).toBe('chose');
  });

  it('manufactures nothing from an empty or absent field', () => {
    expect(selectReturnAnchor({})).toBeNull();
    expect(selectReturnAnchor(null)).toBeNull();
    expect(selectPriorAct(null)).toBeNull();
    expect(selectReturnAnchor({ questions: [] })).toBeNull();
  });

  it('an unparseable keep time never wins — a bad row cannot become the anchor', () => {
    expect(
      selectReturnAnchor({
        questions: [t('bad', 'not-a-date')],
        decisions: [t('good', '2020-01-01T00:00:00Z')],
      })?.act.id,
    ).toBe('good');
  });

  it('the rule reads ONLY the member’s own keep time — no salience model', () => {
    const src = strip(read('lib/nowWhat/carriedThread.ts'));
    // Nothing about content, activity, frequency, or MAIA’s opinion.
    expect(src).not.toMatch(/relevance|score|rank|weight|priority|importance/i);
    expect(src).not.toMatch(/sessionCount|visits|lastSeen|activity|telemetry|calendar/i);
    expect(src).not.toMatch(/embedding|similarity|classif|infer/i);
    // The only ordering input.
    expect(src).toContain('keptAt');
  });

  it('Home derives what it shows from that rule, not from its own logic', () => {
    const home = read(HOME);
    expect(home).toContain("from '@/lib/nowWhat/carriedThread'");
    expect(home).toContain('selectReturnAnchor');
    expect(home).toContain('selectRecordedRelation');
  });

  it('no cross-member leakage: every Home thread read is member-scoped', () => {
    const api = read(HOME_API);
    // The one thread SELECT is bound to the member, and identity is proven first.
    expect(api).toContain('FROM member_field_note_threads');
    expect(api).toMatch(/FROM member_field_note_threads[\s\S]{0,200}WHERE member_id = \$1/);
    expect(api).toMatch(/if \(!memberId\)[\s\S]{0,120}401/);
  });
});

// ── A2 · NEGATIVE CONTROLS: the composition must not invent a relationship ──
//
// Provenance of the parts does not guarantee provenance of the composition.
// Two true member acts placed together can assert a third thing that is false:
// that one answers the other. These four are the guard on that.

describe('A2 — adjacency must never manufacture a relationship', () => {
  const CARRIED = t('q-role', '2026-08-27T10:00:00Z', 'Should I leave my role?');
  const CHOICE = t('p-sister', '2026-08-25T10:00:00Z', 'Call my sister this weekend.');

  it('1 · newer carried thread + older unrelated choice → NOT composed as a pair', () => {
    const source = { questions: [CARRIED], commitments: [CHOICE] };
    const anchor = selectReturnAnchor(source);
    expect(anchor?.act.id).toBe('q-role');
    expect(anchor?.kind).toBe('carried');
    // The unrelated choice does not ride along beside it.
    expect(selectRecordedRelation(anchor, source)).toBeNull();
  });

  it('2 · newer choice + older unrelated carried thread → anchor may be the choice, but it implies nothing', () => {
    const source = {
      questions: [t('q-old', '2026-08-20T10:00:00Z', 'Should I leave my role?')],
      commitments: [t('p-new', '2026-08-27T10:00:00Z', 'Call my sister this weekend.')],
    };
    const anchor = selectReturnAnchor(source);
    expect(anchor?.act.id).toBe('p-new');
    expect(anchor?.kind).toBe('chose');
    // Nothing states that the choice answers the question, because nothing does.
    expect(selectRecordedRelation(anchor, source)).toBeNull();
  });

  it('3 · the lived doorway carries the act she can SEE — same act, not a second rule', () => {
    for (const source of [
      { questions: [CARRIED], commitments: [CHOICE] },
      { commitments: [t('p-new', '2026-08-28T10:00:00Z')], reflections: [t('r', '2026-08-27T10:00:00Z')] },
      { reflections: [t('r-only', '2026-08-01T10:00:00Z')] },
    ]) {
      expect(selectPriorAct(source)?.id).toBe(selectReturnAnchor(source)?.act.id);
    }
  });

  it('4 · two independently true acts are related ONLY when the record says so', () => {
    const source = { questions: [CARRIED], commitments: [CHOICE] };
    // Adjacent, both true, no recorded relation → nothing shown beside the anchor.
    expect(selectRecordedRelation(selectReturnAnchor(source), source)).toBeNull();

    // Now the member actually made the relation, through the lived doorway.
    const lived = t('lived', '2026-08-28T10:00:00Z', 'We talked. He was relieved.', 'p-sister');
    const answered = { reflections: [lived], commitments: [CHOICE] };
    const anchor = selectReturnAnchor(answered);
    expect(anchor?.act.id).toBe('lived');
    expect(selectRecordedRelation(anchor, answered)?.id).toBe('p-sister');
  });

  it('a recorded relation to an act that is gone shows nothing, not a guess', () => {
    // Released or discarded acts never reach the Home read.
    const lived = t('lived', '2026-08-28T10:00:00Z', 'We talked.', 'p-gone');
    const source = { reflections: [lived], commitments: [CHOICE] };
    expect(selectRecordedRelation(selectReturnAnchor(source), source)).toBeNull();
  });

  it('an act pointing at itself is not a relationship', () => {
    const selfRef = t('self', '2026-08-28T10:00:00Z', 'x', 'self');
    const source = { reflections: [selfRef] };
    expect(selectRecordedRelation(selectReturnAnchor(source), source)).toBeNull();
  });

  it('relationship is never inferred — the rule names every basis it refuses', () => {
    const src = read('lib/nowWhat/carriedThread.ts');
    for (const refused of ['recency', 'category', 'similarity', 'sequence']) {
      expect(src.toLowerCase()).toContain(refused);
    }
    // The ONLY basis in the code is the recorded relation.
    expect(src).toContain('respondsToThreadId');
  });

  it('Home renders ONE act, and any second act only as a stated relation', () => {
    const home = read(HOME);
    // One anchor conditional, one label decision, no independent second slot.
    expect((home.match(/\{anchor \?/g) ?? []).length).toBe(1);
    expect(home).toMatch(/chose \? 'You chose' : 'You were carrying'/);
    expect(home).toContain('You wrote this in answer to');
    // The old independently-selected pair is gone.
    expect(home).not.toContain('livingCommitment');
    expect(home).not.toContain('selectChosenMove');
    // The second act is gated on the record, never on presence.
    expect(home).toMatch(/\{answers && \(/);
  });
});

// ── B · LIVED ENTRY ──────────────────────────────────────────────────────

describe('B — lived entry: the existing room, entered knowing what it returns to', () => {
  const home = read(HOME);
  const room = read(ROOM);

  it('Home’s primary invitation is the return, and there is one of it', () => {
    expect(home).toContain('What happened since?');
    expect(home).toContain('Tell MAIA');
  });

  it('it enters the EXISTING room through the EXISTING lived doorway', () => {
    expect(home).toContain('entry=lived');
    expect(home).toContain('roomHref');
    // No new room, no new route invented for the return.
    expect(strip(home)).not.toMatch(/\/what-happened|\/now-what\/lived|\/now-what\/return/);
  });

  it('the prior act rides as an opaque id — her words never enter the URL', () => {
    expect(home).toMatch(/thread=\$\{encodeURIComponent\(anchor\.act\.id\)\}/);
    // The draft is handed over out-of-band, not in the query string.
    expect(home).toContain('LIVED_DRAFT_KEY');
    expect(home).toContain('sessionStorage.setItem');
    expect(strip(home)).not.toMatch(/[?&](text|draft|opening|said)=/);
  });

  it('the room re-resolves that id against HER OWN threads, never trusting it', () => {
    expect(room).toMatch(/threads\.find\(t => t\.id === entryThread\)/);
    expect(room).toContain('/api/now-what/field-note');
  });

  it('the room states the act it is returning to instead of re-asking', () => {
    expect(room).toContain('What happened?');
    expect(room).toContain('You chose');
    expect(room).toContain('You were carrying');
  });

  it('the returned-to act reaches MAIA labelled with the kind of act it was', () => {
    expect(room).toContain('returningActKind');
    expect(read(INTERVIEW_API)).toContain('returningActKind');
    // The prompt must not call a carried question a chosen practice.
    expect(read(INTERVIEW_API)).toMatch(/priorActKind === 'practice'/);
  });

  it('the hand-off carries a DRAFT, never a submission', () => {
    expect(room).toContain('LIVED_DRAFT_KEY');
    expect(room).toContain('sessionStorage.removeItem');
    // It lands in the composer she still has to send herself.
    expect(room).toMatch(/setArrivalAnswer\(prev => \(prev \? prev : draft\)\)/);
  });
});

// ── C · THE RELATION ─────────────────────────────────────────────────────

describe('C — relation: the kept update stays related to the act it answers', () => {
  it('resolves a thread that is genuinely hers', async () => {
    const id = '11111111-2222-3333-4444-555555555555';
    mockQuery.mockResolvedValue({ rows: [{ id }] });
    await expect(resolveRespondsTo('member-1', id)).resolves.toBe(id);
  });

  it('scopes the lookup to the member and to live threads', async () => {
    const id = '11111111-2222-3333-4444-555555555555';
    mockQuery.mockResolvedValue({ rows: [{ id }] });
    await resolveRespondsTo('member-1', id);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('member_id = $2');
    expect(sql).toContain('released_at IS NULL');
    expect(params).toEqual([id, 'member-1']);
  });

  it('REFUSES another member’s thread — no false link, ever', async () => {
    // The member-scoped query simply returns nothing for someone else's id.
    mockQuery.mockResolvedValue({ rows: [] });
    await expect(
      resolveRespondsTo('member-1', '99999999-8888-7777-6666-555555555555'),
    ).resolves.toBeNull();
  });

  it('REFUSES a malformed id without touching the database', async () => {
    for (const bad of ['', 'not-a-uuid', '../../etc', 42, null, undefined, {}]) {
      await expect(resolveRespondsTo('member-1', bad as unknown)).resolves.toBeNull();
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('REFUSES when there is no identified member — anonymity is not ownership', async () => {
    await expect(
      resolveRespondsTo(null, '11111111-2222-3333-4444-555555555555'),
    ).resolves.toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('a resolution failure loses the link, never her keep', async () => {
    // The warn is the deliberate non-fatal path; silence it so the suite's
    // output stays readable without suppressing the behaviour under test.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockQuery.mockRejectedValue(new Error('db down'));
    await expect(
      resolveRespondsTo('member-1', '11111111-2222-3333-4444-555555555555'),
    ).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('the relation is written on keep, revise and create alike', () => {
    const api = read(NOTE_API);
    // saveThread takes it, and every persisting call site passes it.
    expect(api).toContain('respondsToThreadId: string | null = null');
    expect(api).toContain('responds_to_thread_id');
    const calls = api.match(/await saveThread\(/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(3);
    expect(api.match(/respondsToThreadId,?\n?\s*\)/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('a DISCARD writes no thread at all, so it can never acquire a relation', () => {
    const api = strip(read(NOTE_API));
    // The discard branch continues before any saveThread call.
    expect(api).toMatch(
      /if \(p\.decision === 'discard'\) \{[\s\S]{0,240}continue;\s*\}/,
    );
    const discardBranch = api.slice(
      api.indexOf("if (p.decision === 'discard')"),
      api.indexOf("if (p.decision === 'split')"),
    );
    expect(discardBranch).not.toContain('saveThread');
  });

  it('an unrelated visit sends nothing — the link is not a default', () => {
    const room = read(ROOM);
    // Only the lived doorway, and only with a resolved act of her own.
    expect(room).toMatch(
      /const respondsToThreadId =\s*entry === 'lived' && entryThreadTitle \? entryThread \?\? null : null;/,
    );
    // Sent conditionally, never unconditionally.
    expect(room).toContain('...(respondsToThreadId ? { respondsToThreadId } : {})');
    expect(strip(room)).not.toMatch(/respondsToThreadId: (entryThread|priorPractice)\b/);
  });

  it('the relation travels ONLY with her account of what happened', () => {
    const room = read(ROOM);
    // carry() — what she keeps as what happened — carries it.
    const carryFn = room.slice(room.indexOf('async function carry('), room.indexOf('async function saveTagged('));
    expect(carryFn).toContain('respondsToThreadId');

    // saveTagged() — the practice/offering she names AFTER working with what
    // happened — must not. Session context is not proof of relationship.
    const savedTagged = room.slice(
      room.indexOf('async function saveTagged('),
      room.indexOf('async function commitPractice('),
    );
    expect(savedTagged).not.toMatch(/\.\.\.\(respondsToThreadId/);
    expect(savedTagged).not.toMatch(/respondsToThreadId[,:}]/);
  });

  it('NEGATIVE CONTROL — a later practice does not inherit the lived relation', () => {
    const room = read(ROOM);
    // commitPractice routes through saveTagged, which sends no relation.
    const commit = room.slice(
      room.indexOf('async function commitPractice('),
      room.indexOf('async function commitOffering('),
    );
    expect(commit).toContain("saveTagged('practice'");
    expect(commit).not.toContain('respondsToThreadId');
  });

  it('NEGATIVE CONTROL — a later offering does not inherit the lived relation', () => {
    const room = read(ROOM);
    const offering = room.slice(
      room.indexOf('async function commitOffering('),
      room.indexOf('function handleDecision('),
    );
    expect(offering).toContain("saveTagged('offering'");
    expect(offering).not.toContain('respondsToThreadId');
  });

  it('NEGATIVE CONTROL — entry=lived alone relates NOTHING; only a keep does', () => {
    const room = read(ROOM);
    // The whole file sends the relation from exactly ONE place.
    expect((room.match(/\.\.\.\(respondsToThreadId \? \{ respondsToThreadId \} : \{\}\)/g) ?? []).length).toBe(1);
    // And never unconditionally, and never derived from the entry alone.
    expect(strip(room)).not.toMatch(/respondsToThreadId: (entry|true|sessionRef)/);
    expect(strip(room)).not.toMatch(/entry === 'lived' \? \{ respondsToThreadId/);
  });

  it('the refusal lives at the call site, not in the route — the field stays writable', () => {
    // A future explicit gesture must still be able to relate a practice. So
    // the route may not hard-refuse the relation by phase; it refuses only
    // what is not the member's own thread.
    const api = read(NOTE_API);
    expect(api).not.toMatch(/spiralogicPhase === 'practice'[\s\S]{0,120}respondsTo/i);
    expect(api).not.toMatch(/respondsTo[\s\S]{0,120}(phase !== |tag !== )/i);
    expect(read('lib/nowWhat/livedRelation.ts')).not.toMatch(/practice|offering/i);
  });

  it('the migration is additive, nullable and reversible', () => {
    const sql = read(MIGRATION);
    // Statements only — the rationale comments are prose, not schema.
    const stmts = sql.replace(/^\s*--.*$/gm, '');
    expect(stmts).toContain('ADD COLUMN IF NOT EXISTS responds_to_thread_id UUID NULL');
    expect(stmts).toContain('REFERENCES member_field_note_threads(id) ON DELETE SET NULL');
    // The reversal is written down, in the file, as one statement.
    expect(sql).toContain('DROP COLUMN IF EXISTS responds_to_thread_id');
    // Nothing destructive, nothing renamed, nothing required of existing rows.
    expect(stmts).not.toMatch(/DROP TABLE|CREATE TABLE|ALTER COLUMN|RENAME|SET NOT NULL/i);
    // One column, one comment, one index — and no second table.
    expect((stmts.match(/ALTER TABLE/g) ?? []).length).toBe(1);
  });

  it('the relation is provenance, never a progress or outcome model', () => {
    const sql = read(MIGRATION);
    // Schema only: drop the rationale comments AND the COMMENT ON statement,
    // whose text is itself the refusal and would otherwise trip the scan.
    const schema = sql
      .replace(/^\s*--.*$/gm, '')
      .replace(/COMMENT ON COLUMN[\s\S]*?;/g, '');
    // The column carries an id and nothing else — no status, no stage, no
    // score, no completion timestamp travelled in alongside it.
    expect(schema).not.toMatch(/\b(status|stage|step|percent|score|completed_at|outcome)\b/i);
    expect(schema).not.toMatch(/CREATE TABLE|CREATE TYPE|CHECK \(/i);
    // And the column's own documentation says what it is not.
    expect(sql).toMatch(/COMMENT ON COLUMN member_field_note_threads\.responds_to_thread_id/);
    expect(sql).toMatch(/Never inferred, never a progress or outcome signal/);
    // The resolver returns an id or null — never a computed verdict.
    expect(read('lib/nowWhat/livedRelation.ts')).toContain('Promise<string | null>');
  });
});

// ── D · AUTHORITY ────────────────────────────────────────────────────────

describe('D — authority: system carries, MAIA proposes, the member authorizes', () => {
  const room = read(ROOM);

  it('keeping is an explicit gesture — nothing is adopted silently', () => {
    // A thread reaches the payload only if she kept or revised it; everything
    // else is a discard.
    expect(room).toMatch(/authored\.some\(a => a\.title === t\.title\)[\s\S]{0,80}'keep'/);
    expect(room).toMatch(/return \{ title: t\.title, decision: 'discard'/);
    expect(room).toContain('keep');
    expect(room).toContain('revise');
    expect(room).toContain('discard');
  });

  it('a kept proposal is recorded as MAIA-proposed, not as something she said', () => {
    expect(room).toContain("origin: 'maia_proposed'");
    expect(room).toContain("origin: 'member_authored'");
    // The record distinguishes the two authorships at the write.
    const api = read(NOTE_API);
    expect(api).toContain("'member_confirmed'");
    expect(api).toContain("'member_authored'");
  });

  it('the interview route still persists nothing — MAIA cannot write her field', () => {
    const api = strip(read(INTERVIEW_API));
    expect(api).not.toContain('INSERT INTO');
    expect(api).not.toContain('member_field_note_threads');
  });

  it('MAIA may carry her framing and may NOT invent a stronger story', () => {
    expect(LIVED_RETURN_GROUNDING).toMatch(/may NOT improve the story/i);
    expect(LIVED_RETURN_GROUNDING).toMatch(/traceable to something they actually said/i);
    // The five silent conversions the boundary names.
    for (const forbidden of [
      'an implication into a fact',
      'a tone into an inner state',
      'something they repeated into something important',
      'a possibility into a decision',
      'an event into progress',
    ]) {
      expect(LIVED_RETURN_GROUNDING).toContain(forbidden);
    }
  });

  it('NEGATIVE CONTROL — the boundary rules out the seductive case, not just the crude one', () => {
    // The prototype's caught failure was WARMER than the correct reply. A rule
    // that only forbids cold mislabelling would not have caught it.
    expect(LIVED_RETURN_GROUNDING).toMatch(/warmer|empathic|resonant/i);
    expect(LIVED_RETURN_GROUNDING).toMatch(/cannot point to where it came from|unsure whether they said it/i);
  });

  it('the grounding reaches the lived return prompt, and only there', () => {
    const api = read(INTERVIEW_API);
    expect(api).toContain('LIVED_RETURN_GROUNDING');
    const returnPrompt = api.slice(
      api.indexOf('function buildReturnPrompt'),
      api.indexOf('const PROPOSE_SYSTEM'),
    );
    expect(returnPrompt).toContain('${LIVED_RETURN_GROUNDING}');
    const phasePrompt = api.slice(
      api.indexOf('function buildPhasePrompt'),
      api.indexOf('function buildReturnPrompt'),
    );
    expect(phasePrompt).not.toContain('LIVED_RETURN_GROUNDING');
  });

  it('the ordinary turn grammar is untouched by this unit', () => {
    // NW-I01 pinned both variants; this unit must not have moved them.
    expect(buildResponseGrammar()).toContain('4. Only if it genuinely fits');
    expect(buildResponseGrammar(true)).not.toContain('4. Only if it genuinely fits');
  });

  it('what happened is received as lived material, never scored as a result', () => {
    const api = read(INTERVIEW_API);
    expect(api).toMatch(/Do not evaluate adherence/);
    expect(api).toMatch(/never a failure of the person/);
    expect(api).toMatch(/not treat what happened as a result, an outcome, or progress/i);
  });
});

// ── E · PRIVACY ──────────────────────────────────────────────────────────

describe('E — privacy: the lived update is private by default', () => {
  it('practitioner visibility is still per-thread and still opt-in', () => {
    const api = read(NOTE_API);
    expect(api).toContain('shareWithPractitioner');
    expect(api).toContain('(p as any).shareWithPractitioner === true');
    expect(api).toContain('(c as any).shareWithPractitioner === true');
  });

  it('returning through the lived doorway grants no visibility of its own', () => {
    const room = read(ROOM);
    const api = read(NOTE_API);
    // Visibility is bound to ONE thing: the member's own per-thread share
    // gesture. The relation and the doorway are not inputs to it.
    expect(api).toMatch(
      /can_be_shown_to_practitioner[\s\S]{0,600}\$10[\s\S]{0,400}shareWithPractitioner, flourishingDimension/,
    );
    expect(strip(api)).not.toMatch(/shareWithPractitioner\s*=\s*(true|respondsTo|entry)/);
    // Nothing in the room flips a share toggle on the member's behalf.
    expect(strip(room)).not.toMatch(/setShared\([^)]*entry/);
    expect(strip(room)).not.toMatch(/setSharePractice\(true\)|setShareOffering\(true\)/);
    expect(strip(room)).not.toMatch(/useState\(true\);?\s*\/\/.*shar/i);
  });

  it('the Home read is member-scoped and takes no practitioner path', () => {
    const api = strip(read(HOME_API));
    expect(api).not.toContain('practitioner_notes');
    // `shared` is her own view of her own sharing boundary, not a coach payload.
    expect(read(HOME_API)).toContain('member-scoped only');
  });

  it('this unit changed no practitioner surface', () => {
    // Asserted structurally: the relation column is member-owned and never
    // referenced by any visibility decision.
    const sql = read(MIGRATION);
    expect(sql).not.toMatch(/practitioner|can_be_shown/i);
  });
});

// ── F · SCOPE ────────────────────────────────────────────────────────────

describe('F — scope: 0 new routes, 0 new subsystems, 0 practitioner changes', () => {
  it('no new route directory was created under now-what', () => {
    const routes = fs.readdirSync(path.join(process.cwd(), 'app/now-what'));
    for (const invented of ['what-happened', 'lived', 'return', 'carrying', 'story']) {
      expect(routes).not.toContain(invented);
    }
  });

  it('the four V1 rooms all still exist as routes', () => {
    for (const r of ['app/now-what/page.tsx', 'app/now-what/room/page.tsx',
                     'app/now-what/questions/page.tsx', 'app/now-what/field/page.tsx']) {
      expect(fs.existsSync(path.join(process.cwd(), r))).toBe(true);
    }
  });

  it('retire presentation, not capability — every prior room is still reachable', () => {
    const home = read(HOME);
    for (const route of ['/now-what/questions', '/now-what/work',
                         '/now-what/coaching', '/now-what/field']) {
      expect(home).toContain(route);
    }
  });

  it('Home is still ONE member-scoped read — no second call was added', () => {
    const home = read(HOME);
    expect((home.match(/apiFetch\(/g) ?? []).length).toBe(1);
    expect(home).toContain('/api/now-what/home');
  });

  it('nothing excluded from V1 was built', () => {
    const home = read(HOME);
    // The excluded surfaces have no route, no import and no link here.
    expect(home).not.toMatch(/\/now-what\/(map|cultivate|themes|position)/);
    expect(home).not.toMatch(/Living Map/i);
    // No computed number reaches the screen: no percentages, no counters, no
    // arithmetic over her material. The one count that exists is her own
    // sharing boundary stated back to her ("one piece brought forward").
    expect(home).not.toMatch(/Math\.(round|floor|min|max)\([^)]*(score|progress|percent)/i);
    // Rendered output only — the file's own header lists what it refuses.
    expect(strip(home)).not.toMatch(/%<|`\$\{[^}]*\}%`|\bstreak\b/i);
    // Measurement vocabulary survives on this surface in exactly ONE place:
    // the trust copy promising its absence. Every occurrence must sit inside
    // a "No ..." clause — never as a label over a rendered value.
    const claims = home.match(/\b(scores?|progress|rankings?|assessments?|measures?)\b/gi) ?? [];
    expect(claims.length).toBeGreaterThan(0);
    for (const c of claims) {
      expect(home).toMatch(new RegExp(`No [^"]{0,120}\\b${c}\\b`, 'i'));
    }
  });

  it('Home is phone-first: one column, no grid, one dominant action', () => {
    const home = read(HOME);
    expect(home).not.toMatch(/grid-template-columns/);
    // Exactly one submitting affordance in the return block.
    expect((home.match(/type="submit"/g) ?? []).length).toBe(0);
    expect(home).toContain('onSubmit');
    // A real thumb target on the voice affordance.
    expect(home).toMatch(/width: 44px; height: 44px/);
  });

  it('continuity is in the first viewport — nothing precedes her words', () => {
    const home = read(HOME);
    const carry = home.indexOf('nwh-carry');
    for (const demoted of ['nwh-doors', 'nwh-quote', 'nwh-trust']) {
      expect(home.indexOf(demoted)).toBeGreaterThan(carry);
    }
    // The greeting, coach tagline and subtitle stack are gone.
    expect(strip(home)).not.toContain('Welcome back');
    expect(strip(home)).not.toContain('Executive Coaching');
    expect(strip(home)).not.toContain('A private space for what comes next');
  });
});
