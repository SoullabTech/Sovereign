/**
 * R1-0 — DB-BACKED READ-ONLY REAL-READER WITNESS.
 *
 * DATABASE_URL=<disposable witness DB> npm run witness:flagship-r1-readonly
 *
 * All readings are seeded BEFORE the measured window. The measured window
 * imports/calls GET route handlers only, maps their payload through the pure
 * R1-0 adapter, and compares a member-scoped DB-state digest before/after.
 */
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { query, closePool } from '@/lib/db/postgres';
import { GET as listReadingsGet } from '@/app/api/sovereign/manuscripts/[id]/readings/route';
import { GET as oneReadingGet } from '@/app/api/sovereign/manuscripts/[id]/readings/[readingId]/route';
import { mapRealReview, type ReviewHostFacts } from '@/lib/writersStudio/studio/realReview';

const DSN = process.env.DATABASE_URL ?? '';
const MEMBER = randomUUID();
const TOKEN = randomBytes(32).toString('hex');
const CURRENT = { manuscript: randomUUID(), draft: randomUUID(), source: randomUUID(), section: randomUUID(), reading: randomUUID() };
const NONE = { manuscript: randomUUID(), draft: randomUUID(), source: randomUUID(), section: randomUUID(), reading: randomUUID() };
const STALE = { manuscript: randomUUID(), draft: randomUUID(), source: randomUUID(), section: randomUUID(), reading: randomUUID() };
const EMPTY = { manuscript: randomUUID(), draft: randomUUID(), source: randomUUID(), section: randomUUID() };
const MISSING_READING = randomUUID();
const CURRENT_TEXT = 'The river returns here as a place of movement.';
const NONE_TEXT = 'Nothing unusual happens in this short section.';
const STALE_OLD = 'The original sentence stood here.';
const STALE_NOW = 'The sentence has changed since the reading.';
const log: string[] = [];
const note = (s: string) => log.push(s);
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const cp = (s: string) => [...s].length;

const get = (url: string) => new NextRequest(url, { method: 'GET', headers: { 'x-session-token': TOKEN } });
const listCtx = (id: string) => ({ params: Promise.resolve({ id }) });
const oneCtx = (id: string, readingId: string) => ({ params: Promise.resolve({ id, readingId }) });
const reply = async (res: Response) => ({ status: res.status, json: await res.json().catch(() => ({})) as any });

async function seedWork(x: { manuscript: string; draft: string; source: string; section: string }, title: string, text: string) {
  await query(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [x.manuscript, MEMBER, title]);
  await query(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body) VALUES ($1,$2,0,$3,$4)`, [x.source, x.manuscript, title, text]);
  await query(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','r1-source',1)`, [x.draft, x.manuscript, MEMBER]);
  await query(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,0,$3,$4)`, [x.section, x.draft, text, x.source]);
  await query(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [x.draft, text]);
}

function stateFor(draft: string, section: string, text: string) {
  return {
    draftId: draft, revisionNumber: 1, revisionDigest: sha(text), sectionTopology: [section],
    sections: { [section]: { revisionNumber: 1, range: { start: 0, end: cp(text) }, digest: sha(text) } },
    inputFingerprint: sha(`r1-0:${draft}:${section}:${text}`),
  };
}
const coverageFor = (section: string) => ({ sections: { [section]: 'body' } });
const reader = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-0', readerVersion: 'DEVELOPMENTAL-READER-01' };
const classifier = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-0', classifierVersion: 'CLASSIFIER-01' };

async function seedReading(args: { manuscript: string; draft: string; section: string; reading: string; frozenText: string; outcome: 'reading'|'none'; frozenAt: string }) {
  const obs = args.outcome === 'reading' ? [{
    key: 'o1', observationId: `dobs_${args.reading}`, admissionIndex: 0, basisFingerprint: sha(`basis:${args.reading}`),
    position: { sectionPosition: 0, codePointStart: 0 }, lens: 'continuity', phenomenon: 'recurrence',
    evidenceRefs: [{ kind: 'section', sectionId: args.section }],
    observation: 'The river returns here as a place of movement.',
    doesNotEstablish: ['author-intent','editorial-consequence'], structureDependency: { kind: 'independent' },
  }] : [];
  const scope = { commissionedLens: 'continuity', bodyScope: [args.section], withStructure: false };
  const readState = stateFor(args.draft, args.section, args.frozenText);
  await query(`INSERT INTO developmental_readings
    (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
    VALUES ($1,$2,$3,$4,1,'continuity',$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
    args.reading,args.manuscript,MEMBER,args.draft,JSON.stringify(scope),JSON.stringify(readState),JSON.stringify(coverageFor(args.section)),
    readState.inputFingerprint,args.outcome,JSON.stringify(obs),JSON.stringify(reader),args.outcome === 'reading' ? JSON.stringify(classifier) : null,args.frozenAt,
  ]);
}

async function memberStateDigest() {
  const r = await query<{ digest: string }>(`WITH rows AS (
    SELECT 'member' k, id::text i, to_jsonb(m) d FROM members m WHERE id=$1
    UNION ALL SELECT 'session', id::text, to_jsonb(s) FROM auth_sessions s WHERE member_id=$1
    UNION ALL SELECT 'manuscript', id::text, to_jsonb(m) FROM member_manuscripts m WHERE member_id=$1
    UNION ALL SELECT 'draft', id::text, to_jsonb(d) FROM manuscript_working_drafts d WHERE member_id=$1
    UNION ALL SELECT 'draft-section', s.id::text, to_jsonb(s) FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id=s.draft_id WHERE d.member_id=$1
    UNION ALL SELECT 'revision', r.id::text, to_jsonb(r) FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id=r.draft_id WHERE d.member_id=$1
    UNION ALL SELECT 'reading', id::text, to_jsonb(r) FROM developmental_readings r WHERE member_id=$1
    UNION ALL SELECT 'standing', id::text, to_jsonb(e) FROM developmental_observation_standing_events e WHERE member_id=$1
    UNION ALL SELECT 'keep', id::text, to_jsonb(k) FROM manuscript_keeps k WHERE member_id=$1
  ) SELECT md5(COALESCE(jsonb_agg(jsonb_build_object('k',k,'i',i,'d',d) ORDER BY k,i)::text,'[]')) digest FROM rows`, [MEMBER]);
  return r.rows[0]!.digest;
}

const host = (manuscriptId: string, sectionId: string, text: string, title: string): ReviewHostFacts => ({
  manuscriptId, work: title, kind: 'manuscript', scope: { kind: 'work' },
  context: { chapterLabel: 'Current manuscript', chapterTitle: title, page: '', paragraphs: [{ id: sectionId, text }] },
});

beforeAll(async () => {
  if (!DSN || !/witness/.test(DSN)) throw new Error('REFUSED — R1-0 witness requires DATABASE_URL containing witness');
  if (/soullab\.life|minisforum|192\.168\.|maia_consciousness/.test(DSN)) throw new Error('REFUSED — production-looking DATABASE_URL');
  await query(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','R1-0 witness')`, [MEMBER, `R10-${MEMBER}`, `r10-${MEMBER}`]);
  await query(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '2 hours')`, [MEMBER,TOKEN]);
  await seedWork(CURRENT,'Current reading',CURRENT_TEXT);
  await seedWork(NONE,'Read nothing',NONE_TEXT);
  await seedWork(STALE,'Stale reading',STALE_NOW);
  await seedWork(EMPTY,'No reading', 'No reading has been commissioned here.');
  await seedReading({ ...CURRENT, frozenText: CURRENT_TEXT, outcome:'reading', frozenAt:'2026-09-22T12:00:00.000Z' });
  await seedReading({ ...NONE, frozenText: NONE_TEXT, outcome:'none', frozenAt:'2026-09-22T13:00:00.000Z' });
  await seedReading({ ...STALE, frozenText: STALE_OLD, outcome:'reading', frozenAt:'2026-09-22T14:00:00.000Z' });
  note(`seeded member=${MEMBER} current=${CURRENT.manuscript} none=${NONE.manuscript} stale=${STALE.manuscript} empty=${EMPTY.manuscript}`);
});

afterAll(async () => {
  try { await query(`DELETE FROM member_manuscripts WHERE member_id=$1`, [MEMBER]); } catch {}
  try { await query(`DELETE FROM auth_sessions WHERE member_id=$1`, [MEMBER]); } catch {}
  try { await query(`DELETE FROM members WHERE id=$1`, [MEMBER]); } catch {}
  await closePool();
  process.stdout.write(['','── R1-0 READ-ONLY REAL-READER WITNESS ──',...log.map((x)=>`  ${x}`),''].join('\n')+'\n');
});

describe('R1-0 real GET seams are read-only', () => {
  let before = '';
  it('W0 captures the exact member-scoped DB state before measured GETs', async () => {
    before = await memberStateDigest(); note(`W0 before=${before}`); expect(before).toMatch(/^[0-9a-f]{32}$/);
  });

  it('W1 GET list returns the existing current reading only for that Work', async () => {
    const r = await reply(await listReadingsGet(get(`http://localhost/api/sovereign/manuscripts/${CURRENT.manuscript}/readings`), listCtx(CURRENT.manuscript)));
    note(`W1 list status=${r.status} readings=${r.json.readings?.length}`);
    expect(r.status).toBe(200); expect(r.json.readings).toHaveLength(1); expect(r.json.readings[0].id).toBe(CURRENT.reading);
  });

  it('W2 GET one returns exact identity + current assessment + labels; mapper is ready', async () => {
    const list = await reply(await listReadingsGet(get(`http://localhost/api/sovereign/manuscripts/${CURRENT.manuscript}/readings`), listCtx(CURRENT.manuscript)));
    const one = await reply(await oneReadingGet(get(`http://localhost/api/sovereign/manuscripts/${CURRENT.manuscript}/readings/${CURRENT.reading}`), oneCtx(CURRENT.manuscript,CURRENT.reading)));
    expect(one.status).toBe(200); expect(one.json.reading.id).toBe(CURRENT.reading); expect(one.json.reading.observations[0].observationId).toBe(`dobs_${CURRENT.reading}`);
    expect(one.json.assessment.reading).toEqual({ state:'current' }); expect(one.json.sections[0]).toMatchObject({ id:CURRENT.section, heading:'Current reading' });
    const mapped = mapRealReview({ summaries:list.json.readings, selectedReadingId:CURRENT.reading, payload:one.json, host:host(CURRENT.manuscript,CURRENT.section,CURRENT_TEXT,'Current reading') });
    expect(mapped.kind).toBe('ready');
    if (mapped.kind === 'ready') {
      expect(mapped.view.findings.map((f)=>f.id)).toEqual([`dobs_${CURRENT.reading}`]);
      expect(mapped.durable[`dobs_${CURRENT.reading}`]?.address).toMatchObject({ readingId:CURRENT.reading, observationKey:'o1' });
      expect(mapped.durable[`dobs_${CURRENT.reading}`]?.limits).toEqual(['author-intent','editorial-consequence']);
    }
    note(`W2 one status=${one.status} assessment=${one.json.assessment.reading.state} mapped=${mapped.kind}`);
  });

  it('W3 no reading is distinct from a complete none reading', async () => {
    const emptyList = await reply(await listReadingsGet(get(`http://localhost/api/sovereign/manuscripts/${EMPTY.manuscript}/readings`), listCtx(EMPTY.manuscript)));
    expect(emptyList.status).toBe(200); expect(emptyList.json.readings).toEqual([]);
    const absent = mapRealReview({ summaries:[], selectedReadingId:null, payload:null, host:host(EMPTY.manuscript,EMPTY.section,'No reading has been commissioned here.','No reading') });
    expect(absent).toEqual({ kind:'no-reading' });
    const list = await reply(await listReadingsGet(get(`http://localhost/api/sovereign/manuscripts/${NONE.manuscript}/readings`), listCtx(NONE.manuscript)));
    const one = await reply(await oneReadingGet(get(`http://localhost/api/sovereign/manuscripts/${NONE.manuscript}/readings/${NONE.reading}`), oneCtx(NONE.manuscript,NONE.reading)));
    const mapped = mapRealReview({ summaries:list.json.readings, selectedReadingId:NONE.reading, payload:one.json, host:host(NONE.manuscript,NONE.section,NONE_TEXT,'Read nothing') });
    expect(mapped.kind).toBe('ready'); if (mapped.kind==='ready') { expect(mapped.view.findings).toEqual([]); expect(mapped.view.lenses[0]?.availability.kind).toBe('read-nothing-noticed'); }
    note(`W3 no-reading=${absent.kind} none=${mapped.kind}`);
  });

  it('W4 not-found and wrong-Work remain 404; malformed payload refuses in mapper', async () => {
    const missing = await oneReadingGet(get(`http://localhost/api/sovereign/manuscripts/${CURRENT.manuscript}/readings/${MISSING_READING}`), oneCtx(CURRENT.manuscript,MISSING_READING));
    const wrong = await oneReadingGet(get(`http://localhost/api/sovereign/manuscripts/${EMPTY.manuscript}/readings/${CURRENT.reading}`), oneCtx(EMPTY.manuscript,CURRENT.reading));
    expect(missing.status).toBe(404); expect(wrong.status).toBe(404);
    const malformed = mapRealReview({ summaries:[{ id:CURRENT.reading,outcome:'reading',commissionedLens:'continuity',frozenAt:'x',observationCount:1 }], selectedReadingId:CURRENT.reading, payload:{ reading:{ id:CURRENT.reading } }, host:host(CURRENT.manuscript,CURRENT.section,CURRENT_TEXT,'Current reading') });
    expect(malformed).toMatchObject({ kind:'unavailable', reason:'malformed_payload' });
    note(`W4 missing=${missing.status} wrongWork=${wrong.status} malformed=${malformed.kind}`);
  });

  it('W5 stale GET reports supersession and mapper refuses to fabricate frozen prose', async () => {
    const list = await reply(await listReadingsGet(get(`http://localhost/api/sovereign/manuscripts/${STALE.manuscript}/readings`), listCtx(STALE.manuscript)));
    const one = await reply(await oneReadingGet(get(`http://localhost/api/sovereign/manuscripts/${STALE.manuscript}/readings/${STALE.reading}`), oneCtx(STALE.manuscript,STALE.reading)));
    expect(one.status).toBe(200); expect(one.json.assessment.reading.state).toBe('superseded');
    const mapped = mapRealReview({ summaries:list.json.readings, selectedReadingId:STALE.reading, payload:one.json, host:host(STALE.manuscript,STALE.section,STALE_NOW,'Stale reading') });
    expect(mapped).toMatchObject({ kind:'unavailable', reason:'frozen_citation_text_unavailable' });
    note(`W5 assessment=${one.json.assessment.reading.state} mapped=${mapped.kind==='unavailable'?mapped.reason:mapped.kind}`);
  });

  it('W6 exact member-scoped DB state is byte-identical after all measured GETs', async () => {
    const after = await memberStateDigest(); note(`W6 after=${after} unchanged=${after===before}`); expect(after).toBe(before);
  });
});
