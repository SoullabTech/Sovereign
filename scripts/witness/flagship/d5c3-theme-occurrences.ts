/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C3
 * Durable Themes occurrence witness. Disposable Writer's Studio DB only.
 * No provider/model call and no manuscript prose persistence.
 */
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import {
  governMaiaThemeCandidate,
  governWorkTheme,
  listWorkThemeOccurrences,
} from '@/lib/writersStudio/themes/store';

const DSN = process.env.DATABASE_URL ?? '';
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5C3 requires disposable ws_d4r1_witness_* DB');
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

const M = randomUUID(), OTHER = randomUUID(), WK = randomUUID(), RID = randomUUID();
const OID = `dobs_${randomUUID()}`;
const DRAFT = randomUUID(), S1 = randomUUID(), S2 = randomUUID();
const LABEL = 'Crossing and staying';
const OBS = 'The crossing recurs in both sections read.';

async function seed() {
  for (const [id, key] of [[M,'owner'],[OTHER,'other']] as const) {
    await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
      VALUES ($1,$2,$3,'x',$4,true,'complete',true)`,
      [id,`SOULLAB-D5C3-${key}-${id.slice(0,6)}`,`d5c3-${key}-${id.slice(0,6)}`,`D5C3 ${key}`]);
  }
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'Occurrence witness manuscript')`,[WK,M]);
  const readState = {
    draftId:DRAFT, revisionNumber:3, revisionDigest:sha('occurrence-revision'),
    sectionTopology:[S1,S2],
    sections:{
      [S1]:{ revisionNumber:3, range:{start:0,end:80}, digest:sha('s1') },
      [S2]:{ revisionNumber:3, range:{start:80,end:160}, digest:sha('s2') },
    },
    inputFingerprint:sha('occurrence-input'),
  };
  const observation = {
    key:'o1', observationId:OID, admissionIndex:0, basisFingerprint:sha('occurrence-basis'),
    position:{sectionPosition:0,codePointStart:4}, lens:'themes', themeLabel:LABEL,
    evidenceRefs:[
      {kind:'section',sectionId:S1},
      {kind:'passage',sectionId:S1,range:{start:4,end:17}},
      {kind:'section',sectionId:S2},
    ],
    observation:OBS,
    doesNotEstablish:['author-intent','editorial-consequence'],
    structureDependency:{kind:'independent'},
  };
  await q(`INSERT INTO developmental_readings
    (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,
     scope,read_state,coverage,input_fingerprint,outcome,observations,
     reader_provenance,classifier_provenance,frozen_at)
    VALUES ($1,$2,$3,$4,3,'themes',$5,$6,$7,$8,'reading',$9,$10,$11,NOW())`,[
    RID,WK,M,DRAFT,
    JSON.stringify({commissionedLens:'themes',bodyScope:[S1,S2],withStructure:false}),
    JSON.stringify(readState), JSON.stringify({sections:{[S1]:'body',[S2]:'body'}}),
    readState.inputFingerprint, JSON.stringify([observation]),
    JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('prompt'),readerVersion:'DEVELOPMENTAL-READER-07'}),
    JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('classifier'),classifierVersion:'DEVELOPMENTAL-PHENOMENON-04'}),
  ]);
}

async function main() {
  await pg.connect();
  const [who] = await q('select current_database() d,current_user u');
  if (!String(who?.d).startsWith('ws_d4r1_witness_') || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB ${who?.d}/${who?.u}`);
  }
  const [migration] = await q(`SELECT count(*)::int n FROM schema_migrations
    WHERE filename='20260926000003_writer_studio_theme_occurrences.sql'`);
  if (Number(migration?.n) !== 1) throw new Error('D5C3 migration not admitted exactly once');
  await seed();
  console.log('\n── D5C3 THEME OCCURRENCE WITNESS ──\n');

  check('D5C3-01 frozen MAIA candidate has no Work-theme occurrences before member governance',
    (await listWorkThemeOccurrences(M,WK)).length === 0);

  const accepted = await governMaiaThemeCandidate({
    memberId:M, manuscriptId:WK, readingId:RID, observationId:OID, action:'accept',
  });
  check('D5C3-02 Accept materializes occurrence evidence with the governed theme', accepted.ok);
  if (!accepted.ok) throw new Error(accepted.refusal);

  let occ = await listWorkThemeOccurrences(M,WK,accepted.themeId);
  check('D5C3-03 exact frozen evidence yields two section occurrences, not a prose copy', occ.length === 2, `occurrences=${occ.length}`);
  const first = occ.find((o)=>o.sectionId===S1);
  const second = occ.find((o)=>o.sectionId===S2);
  check('D5C3-04 precise passage supersedes coarse section evidence at the same section',
    first?.range?.start===4 && first?.range?.end===17);
  check('D5C3-05 whole-section evidence stays whole-section when no passage was cited', second?.range===null);
  check('D5C3-06 every occurrence retains source reading, observation and frozen revision',
    occ.every((o)=>o.sourceReadingId===RID && o.sourceObservationId===OID && o.sourceRevisionNumber===3 && o.provenance==='maia-observation'));

  const columns = await q(`SELECT column_name FROM information_schema.columns
    WHERE table_name='writer_studio_work_theme_occurrences' ORDER BY ordinal_position`);
  const names = columns.map((r)=>String(r.column_name));
  check('D5C3-07 occurrence store has no manuscript prose column',
    !names.some((name)=>/text|body|content|excerpt|quote|prose/i.test(name)), names.join(','));

  const renamed = await governMaiaThemeCandidate({
    memberId:M, manuscriptId:WK, readingId:RID, observationId:OID,
    action:'rename', label:'Crossing as dwelling',
  });
  occ = await listWorkThemeOccurrences(M,WK,accepted.themeId);
  check('D5C3-08 repeated governance reuses occurrence identity instead of duplicating evidence',
    renamed.ok && renamed.themeId===accepted.themeId && occ.length===2, `occurrences=${occ.length}`);

  const rejected = await governWorkTheme({memberId:M,manuscriptId:WK,themeId:accepted.themeId,action:'reject'});
  check('D5C3-09 Reject changes standing, not historical occurrence evidence',
    rejected.ok && (await listWorkThemeOccurrences(M,WK,accepted.themeId)).length===2);

  check('D5C3-10 another member cannot read these occurrence addresses',
    (await listWorkThemeOccurrences(OTHER,WK,accepted.themeId)).length===0);

  let immutable = false;
  try {
    await q(`UPDATE writer_studio_work_theme_occurrences SET source_revision_number=4 WHERE theme_id=$1`,[accepted.themeId]);
  } catch { immutable = true; }
  check('D5C3-11 admitted occurrence coordinates cannot be edited in place', immutable);

  const frozen = await q(`SELECT observations->0->>'observation' observation,
    observations->0->>'themeLabel' label FROM developmental_readings WHERE id=$1`,[RID]);
  check('D5C3-12 occurrence admission never rewrites the frozen MAIA reading',
    frozen[0]?.observation===OBS && frozen[0]?.label===LABEL);

  console.log(`\nD5C3 RESULT — ${pass} passed · ${fail} failed\n`);
  await pg.end();
  process.exit(fail===0?0:1);
}
main().catch(async(e)=>{ console.error(e); await pg.end().catch(()=>{}); process.exit(2); });
