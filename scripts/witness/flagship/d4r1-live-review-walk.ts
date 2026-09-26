/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D4R1
 * Whole-Review live walk on a disposable DB + controlled provider.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { chromium } from 'playwright';
import { DEVELOPMENTAL_LENSES, type DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3618');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d4r1');
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D4R1 requires a disposable ws_d4r1_witness_* database');
  process.exit(2);
}
const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows as Record<string, unknown>[];
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const cp = (s: string) => [...s].length;
let pass=0, fail=0;
const check=(name:string,ok:boolean,detail='')=>{if(ok){pass++;console.log(`  PASS  ${name}${detail?` — ${detail}`:''}`);}else{fail++;console.log(`  FAIL  ${name}\n        ${detail}`);}};

const M=randomUUID(), LW=randomUUID(), WK=randomUUID(), DR=randomUUID();
const S1=randomUUID(), S2=randomUUID(), D1=randomUUID(), D2=randomUUID(), RUN=randomUUID();
const TOKEN=`d4r1-${randomUUID()}`;
const T1='Chapter 1\n\nThe river enters the story before Clara names what she fears.';
const T2='The crossing\n\nHer voice becomes quieter when she reaches the far bank.';
const IDS = new Map<DevelopmentalLens,string>(DEVELOPMENTAL_LENSES.map((l)=>[l,randomUUID()]));
async function seedReading(lens: DevelopmentalLens, version: number) {
  const id=IDS.get(lens)!;
  const has=lens==='continuity'||lens==='voice';
  const target=lens==='voice'?D2:D1;
  const text=lens==='voice'?T2:T1;
  const observation= lens==='voice'
    ? 'The sentence becomes quieter in its wording at the crossing.'
    : 'The river appears before the crossing and returns at the next movement.';
  const observations=has?[{
    key:'o1', observationId:`dobs_${id}`, admissionIndex:0,
    basisFingerprint:sha(`basis:${id}`),
    position:{sectionPosition:lens==='voice'?1:0,codePointStart:0},
    lens, phenomenon:lens==='voice'?'register-shift':'recurrence',
    evidenceRefs:[{kind:'section',sectionId:target}],
    observation,
    doesNotEstablish:['author-intent','editorial-consequence'],
    structureDependency:{kind:'independent'},
  }]:[];
  const content=T1+T2;
  const readState={
    draftId:DR, revisionNumber:version, revisionDigest:sha(content),
    sectionTopology:[D1,D2],
    sections:{
      [D1]:{revisionNumber:version,range:{start:0,end:cp(T1)},digest:sha(T1)},
      [D2]:{revisionNumber:version,range:{start:cp(T1),end:cp(T1)+cp(T2)},digest:sha(T2)},
    },
    inputFingerprint:sha(`d4r1:${DR}:${version}`),
  };
  const scope={commissionedLens:lens,bodyScope:[D1,D2],withStructure:false};
  const coverage={sections:{[D1]:'body',[D2]:'body'}};
  const reader={provider:'witness',model:'seeded-no-provider',promptHash:'d4r1',readerVersion:'DEVELOPMENTAL-READER-01'};
  const classifier={provider:'witness',model:'seeded-no-provider',promptHash:'d4r1',classifierVersion:'CLASSIFIER-01'};
  await q(`INSERT INTO developmental_readings
    (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())`,[
    id,WK,M,DR,version,lens,JSON.stringify(scope),JSON.stringify(readState),JSON.stringify(coverage),
    readState.inputFingerprint,has?'reading':'none',JSON.stringify(observations),JSON.stringify(reader),
    has?JSON.stringify(classifier):null,
  ]);
}
async function seed(){
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
    VALUES ($1,$2,$3,'x','D4R1 witness',true,'complete',true)`,[M,`SOULLAB-D4R1-${M.slice(0,8)}`,`d4r1-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
    VALUES ($1,$2,NOW()+INTERVAL '2 hours','d4r1-witness')`,[M,TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`,[LW,M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`,[WK,M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
    VALUES ($1,'manuscript',$2,$3)`,[LW,WK,M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
    VALUES ($1,$2,1,'Chapter 1',1,'chapter',$3),($4,$2,2,'The crossing',2,'markdown',$5)`,[S1,WK,T1,S2,T2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count)
    VALUES ($1,$2,$3,$4,'sha-d4r1',1)`,[DR,WK,M,T1+T2]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
    VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`,[D1,DR,T1,S1,D2,T2,S2]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1`,[DR]);
  const version=Number((await q(`SELECT version FROM manuscript_working_drafts WHERE id=$1`,[DR]))[0]?.version??1);
  await q(`INSERT INTO working_draft_revisions
    (draft_id,revision_number,content,saved_by,note,section_partition)
    VALUES ($1,$2,$3,$4,'D4R1 frozen witness review',$5::jsonb)`,[
      DR,version,T1+T2,M,JSON.stringify([
        {sectionId:D1,start:0,end:cp(T1)},
        {sectionId:D2,start:cp(T1),end:cp(T1)+cp(T2)},
      ]),
    ]);
  for(const lens of DEVELOPMENTAL_LENSES) await seedReading(lens,version);
  await q(`INSERT INTO writer_studio_chapter_review_runs
    (id,member_id,manuscript_id,chapter_root_section_id,section_ids,draft_revision,reading_ids,failures)
    VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,'[]'::jsonb)`,[
      RUN,M,WK,D1,JSON.stringify([D1,D2]),version,JSON.stringify(DEVELOPMENTAL_LENSES.map((l)=>IDS.get(l))),
    ]);
  return version;
}

async function main(){
  mkdirSync(OUT,{recursive:true}); await pg.connect();
  const [who]=await q('select current_database() d,current_user u');
  if(!String(who?.d).startsWith('ws_d4r1_witness_')||who?.u!=='maia_test_user') throw new Error(`wrong DB identity ${who?.d}/${who?.u}`);
  const version=await seed();
  const initialRevisionCount=Number((await q(`SELECT count(*)::int n FROM working_draft_revisions WHERE draft_id=$1`,[DR]))[0]?.n??0);
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:1440,height:950}});
  await ctx.addCookies([{name:'maia_session',value:TOKEN,url:`http://127.0.0.1:${PORT}`}]);
  const page=await ctx.newPage();
  await page.addInitScript(()=>localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false})));
  let readingPosts=0;
  page.on('request',(req)=>{if(req.method()==='POST'&&/\/readings(?:\?|$)/.test(req.url())) readingPosts++;});
  try{
    console.log(`\n── D4R1 LIVE REVIEW WALK · run=${RUN} · revision=${version} ──\n`);
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${WK}&s=${D1}&reviewRun=${RUN}`,
      {waitUntil:'domcontentloaded',timeout:240000});
    await page.waitForSelector(`[data-review-run="${RUN}"]`,{timeout:240000});
    await page.screenshot({path:join(OUT,'01-whole-review.png'),fullPage:false});
    check('D4-01 exact flagship Review run is live',await page.locator(`[data-review-run="${RUN}"] .fs-reviewgrid`).count()===1);
    check('D4-02 one saved run yields exactly two durable findings',await page.locator('[data-finding]').count()===2,
      `findings=${await page.locator('[data-finding]').count()}`);
    const tabs=await page.locator('.fs-modetab').allTextContents();
    check('D4-03 all seven canonical lenses are filters',tabs.length===8,`tabs=${tabs.length}`);
    const before=readingPosts;
    await page.getByRole('tab',{name:'How it sounds'}).click();
    await page.waitForTimeout(150);
    check('D4-04 lens filtering never commissions a reading',readingPosts===before,`POST /readings delta=${readingPosts-before}`);
    check('D4-05 voice filter shows only its existing observation',
      await page.locator('[data-finding][data-domain="voice"]').count()===1&&await page.locator('[data-finding]').count()===1);
    await page.getByRole('tab',{name:'Everything'}).click();
    const voice=page.locator('[data-finding][data-domain="voice"]');
    check('D4-06 finding carries visible evidence and exact return control',
      await voice.locator('.fs-chip').count()>0&&await voice.locator('[data-return-to]').count()>0);
    await voice.locator('a[data-return-to]').click();
    await page.waitForFunction((id)=>new URL(location.href).searchParams.get('s')===id,D2,{timeout:15000});
    await page.waitForSelector(`[data-review-run="${RUN}"]`,{timeout:15000});
    check('D4-07 passage navigation preserves exact Review-run identity',
      new URL(page.url()).searchParams.get('reviewRun')===RUN&&new URL(page.url()).searchParams.get('s')===D2,page.url());
    check('D4-08 manuscript context follows the finding',
      await page.locator('.fs-contextp[data-highlighted="true"]').filter({hasText:'quieter'}).count()===1);
    await page.screenshot({path:join(OUT,'02-passage.png'),fullPage:false});
    const voiceNow=page.locator('[data-finding][data-domain="voice"]');
    await voiceNow.locator('button[data-action="discuss"]').click();
    const ask=voiceNow.locator('textarea[aria-label="Your question about this observation"]');
    await ask.fill('What are you noticing here?');
    await voiceNow.locator('button[type="submit"]').click();
    await page.waitForSelector('[data-review-discussion="answered"]',{timeout:30000});
    check('D4-09 MAIA Discuss completes against the finding sidecar',
      (await voiceNow.locator('.fs-say').textContent())?.includes('Controlled D3 witness reply')===true);
    check('D4-10 Discuss does not commission a developmental reading',readingPosts===before,
      `POST /readings total delta=${readingPosts-before}`);
    await page.screenshot({path:join(OUT,'03-discuss.png'),fullPage:false});
    await voiceNow.getByRole('button',{name:'Close'}).click();
    check('D4-11 closing MAIA returns to the same Review and same place',
      await page.locator(`[data-review-run="${RUN}"]`).count()===1&&new URL(page.url()).searchParams.get('s')===D2);

    const revisions=await q(`SELECT count(*)::int n FROM working_draft_revisions WHERE draft_id=$1`,[DR]);
    const finalRevisionCount=Number(revisions[0]?.n??0);
    check('D4-12 entire Review walk is read-only to manuscript history',
      finalRevisionCount===initialRevisionCount,`revisions ${initialRevisionCount}->${finalRevisionCount}`);
  }finally{
    await browser.close();
    await pg.end();
  }
  console.log(`\nD4R1 RESULT — ${pass} passed · ${fail} failed · screenshots ${OUT}\n`);
  process.exit(fail===0?0:1);
}
main().catch(async(e)=>{
  console.error(e);
  await pg.end().catch(()=>{});
  process.exit(2);
});
