/**
 * D5C2 — Work Theme durable governance witness.
 * Disposable Writer's Studio DB only. No provider/model call.
 */
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import {
  declareMemberTheme,
  governMaiaThemeCandidate,
  governWorkTheme,
  listWorkThemes,
} from '@/lib/writersStudio/themes/store';

const DSN = process.env.DATABASE_URL ?? '';
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5C2 witness requires disposable ws_d4r1_witness_* DB');
  process.exit(2);
}

const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows as Record<string, unknown>[];
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};

const M = randomUUID();
const OTHER = randomUUID();
const WK = randomUUID();
const RID = randomUUID();
const OID = `dobs_${randomUUID()}`;
const DRAFT = randomUUID();
const S1 = randomUUID();
const S2 = randomUUID();
const OBSERVATION = 'The river crossing appears in both sections, first as avoidance and later as a place Clara remains.';
const LABEL = 'Crossing and staying';

async function seed() {
  for (const [id, key] of [[M, 'owner'], [OTHER, 'other']] as const) {
    await q(`INSERT INTO members
      (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
      VALUES ($1,$2,$3,'x',$4,true,'complete',true)`,
      [id, `SOULLAB-D5C2-${key}-${id.slice(0,6)}`, `d5c2-${key}-${id.slice(0,6)}`, `D5C2 ${key}`]);
  }
  await q(`INSERT INTO member_manuscripts (id,member_id,title)
    VALUES ($1,$2,'Theme witness manuscript')`, [WK,M]);

  const readState = {
    draftId: DRAFT,
    revisionNumber: 1,
    revisionDigest: sha('theme-witness'),
    sectionTopology: [S1,S2],
    sections: {
      [S1]: { revisionNumber: 1, range: { start: 0, end: 10 }, digest: sha('section-1') },
      [S2]: { revisionNumber: 1, range: { start: 10, end: 20 }, digest: sha('section-2') },
    },
    inputFingerprint: sha('theme-input'),
  };
  const observation = {
    key: 'o1',
    observationId: OID,
    admissionIndex: 0,
    basisFingerprint: sha('theme-basis'),
    position: { sectionPosition: 0, codePointStart: 0 },
    lens: 'themes',
    themeLabel: LABEL,
    evidenceRefs: [
      { kind: 'section', sectionId: S1 },
      { kind: 'section', sectionId: S2 },
    ],
    observation: OBSERVATION,
    doesNotEstablish: ['author-intent','editorial-consequence'],
    structureDependency: { kind: 'independent' },
  };
  await q(`INSERT INTO developmental_readings
    (id, manuscript_id, member_id, draft_id, revision_number, commissioned_lens,
     scope, read_state, coverage, input_fingerprint, outcome, observations,
     reader_provenance, classifier_provenance, frozen_at)
    VALUES ($1,$2,$3,$4,1,'themes',$5,$6,$7,$8,'reading',$9,$10,$11,NOW())`,[
    RID,WK,M,DRAFT,
    JSON.stringify({ commissionedLens:'themes', bodyScope:[S1,S2], withStructure:false }),
    JSON.stringify(readState),
    JSON.stringify({ sections:{ [S1]:'body',[S2]:'body' } }),
    readState.inputFingerprint,
    JSON.stringify([observation]),
    JSON.stringify({ provider:'anthropic',model:'witness',promptHash:sha('prompt'),readerVersion:'DEVELOPMENTAL-READER-07' }),
    JSON.stringify({ provider:'anthropic',model:'witness',promptHash:sha('classifier'),classifierVersion:'DEVELOPMENTAL-PHENOMENON-04' }),
  ]);
}

async function main() {
  await pg.connect();
  const [who] = await q('select current_database() d,current_user u');
  if (!String(who?.d).startsWith('ws_d4r1_witness_') || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB ${who?.d}/${who?.u}`);
  }
  await seed();
  console.log('\n── D5C2 WORK THEME GOVERNANCE WITNESS ──\n');

  check('D5C2-01 a MAIA reading is not silently promoted into member-governed Themes',
    (await listWorkThemes(M,WK)).length === 0);

  const accepted = await governMaiaThemeCandidate({
    memberId:M, manuscriptId:WK, readingId:RID, observationId:OID, action:'accept',
  });
  check('D5C2-02 Accept mints one opaque Work Theme identity', accepted.ok);
  if (!accepted.ok) throw new Error(accepted.refusal);
  const themeId = accepted.themeId;
  let list = await listWorkThemes(M,WK);
  check('D5C2-03 accepted candidate reloads with MAIA provenance',
    list.length === 1 && list[0]?.id === themeId
      && list[0]?.provenance === 'maia-observation'
      && list[0]?.standing === 'accepted'
      && list[0]?.currentLabel === LABEL);

  const renamed = await governWorkTheme({
    memberId:M, manuscriptId:WK, themeId, action:'rename', label:'Crossing as dwelling',
  });
  list = await listWorkThemes(M,WK);
  check('D5C2-04 Rename changes current governable label after reload',
    renamed.ok && list[0]?.currentLabel === 'Crossing as dwelling' && list[0]?.initialLabel === LABEL);

  const frozenAfterRename = await q(
    `SELECT observations->0->>'observation' observation,
            observations->0->>'themeLabel' theme_label
       FROM developmental_readings WHERE id=$1`,[RID]);
  check('D5C2-05 Rename never rewrites MAIA frozen observation or candidate label',
    frozenAfterRename[0]?.observation === OBSERVATION && frozenAfterRename[0]?.theme_label === LABEL);

  const rejected = await governWorkTheme({ memberId:M, manuscriptId:WK, themeId, action:'reject' });
  list = await listWorkThemes(M,WK);
  check('D5C2-06 Not a theme in my book is durable standing, not deletion',
    rejected.ok && list[0]?.standing === 'rejected');

  const stillThere = await q(`SELECT count(*)::int n FROM developmental_readings WHERE id=$1`,[RID]);
  check('D5C2-07 Reject retains the historical source reading', Number(stillThere[0]?.n) === 1);

  const restored = await governWorkTheme({ memberId:M, manuscriptId:WK, themeId, action:'restore' });
  list = await listWorkThemes(M,WK);
  check('D5C2-08 Restore returns the same theme identity to accepted standing',
    restored.ok && list[0]?.id === themeId && list[0]?.standing === 'accepted');

  const renamedViaCandidate = await governMaiaThemeCandidate({
    memberId:M, manuscriptId:WK, readingId:RID, observationId:OID,
    action:'rename', label:'Crossing and inhabiting',
  });
  list = await listWorkThemes(M,WK);
  check('D5C2-09 repeated governance of one MAIA source reuses one identity',
    renamedViaCandidate.ok && renamedViaCandidate.themeId === themeId && list.length === 1
      && list[0]?.currentLabel === 'Crossing and inhabiting');

  const declared = await declareMemberTheme({
    memberId:M, manuscriptId:WK, label:'Homecoming',
  });
  list = await listWorkThemes(M,WK);
  check('D5C2-10 member-declared theme is immediately member-authored and accepted',
    declared.ok && list.some((t) => t.id === (declared.ok ? declared.themeId : '')
      && t.provenance === 'member-declared' && t.currentLabel === 'Homecoming' && t.standing === 'accepted'));

  const forbidden = await governWorkTheme({
    memberId:OTHER, manuscriptId:WK, themeId, action:'reject',
  });
  check('D5C2-11 another member cannot govern this Work Theme',
    !forbidden.ok && forbidden.refusal === 'not_found');

  const events = await q(`SELECT event_type,label FROM writer_studio_work_theme_events
    WHERE theme_id=$1 ORDER BY created_at,id`,[themeId]);
  check('D5C2-12 governance is append-only history',
    events.length === 5
      && events.map((e)=>e.event_type).join(',') === 'accept,rename,reject,restore,rename',
    JSON.stringify(events));

  console.log(`\nD5C2 RESULT — ${pass} passed · ${fail} failed\n`);
  await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async(e)=>{ console.error(e); await pg.end().catch(()=>{}); process.exit(2); });
