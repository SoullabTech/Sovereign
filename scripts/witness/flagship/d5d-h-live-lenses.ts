/**
 * D5D–D5H — live flagship Develop reading-lens family witness.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { chromium } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3618');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d5d-h');
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5D-H requires disposable ws_d4r1_witness_* DB');
  process.exit(2);
}
const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) =>
  (await pg.query(sql, params)).rows as Record<string, unknown>[];
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};
const LENSES = [
  ['development', 'Where ideas grow', 'movement', 'The central question is introduced here and developed again at the crossing.'],
  ['arc', 'How it moves', 'movement', 'The work moves from waiting toward crossing across these sections.'],
  ['continuity', 'Whether the thread holds', 'recurrence', 'The river image carries from the opening into the crossing.'],
  ['coherence', 'Whether it stays consistent', 'movement', 'The river and the crossing remain connected across these sections.'],
  ['voice', 'How it sounds', 'register-shift', 'The sentences shift from longer description toward shorter declarative phrasing.'],
  ['reader', 'How it might land', 'positional-asymmetry', 'A reader might meet the crossing as a change in pace.'],
] as const;
type Lens = typeof LENSES[number][0];

const M=randomUUID(), LW=randomUUID(), WK=randomUUID(), DR=randomUUID();
const S1=randomUUID(), S2=randomUUID(), S3=randomUUID();
const D1=randomUUID(), D2=randomUUID(), D3=randomUUID();
const TOKEN=`d5dh-${randomUUID()}`;
const T1='Chapter 1\n\nThe river waits at the edge of the field before Clara moves.';
const T2='The crossing\n\nClara crosses. The river follows in sound.';
const T3='Afterward\n\nInside the house, the sentences become spare.';
const CONTENT=T1+T2+T3;
const readingIds = new Map<Lens,string>();

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
    VALUES ($1,$2,$3,'x','D5D-H witness',true,'complete',true)`,
    [M,`SOULLAB-D5DH-${M.slice(0,8)}`,`d5dh-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
    VALUES ($1,$2,NOW()+INTERVAL '2 hours','d5dh-witness')`,[M,TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title,form) VALUES ($1,$2,'The River Between','book')`,[LW,M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`,[WK,M]);
  await q(`INSERT INTO living_work_expressions
    (living_work_id,expression_type,expression_id,declared_by)
    VALUES ($1,'manuscript',$2,$3)`,[LW,WK,M]);
  await q(`INSERT INTO manuscript_sections
    (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
    VALUES ($1,$2,1,'Chapter 1',1,'chapter',$3),
           ($4,$2,2,'The crossing',2,'markdown',$5),
           ($6,$2,3,'Afterward',2,'markdown',$7)`,[S1,WK,T1,S2,T2,S3,T3]);
  await q(`INSERT INTO manuscript_working_drafts
    (id,manuscript_id,member_id,content,base_source_hash,revision_count)
    VALUES ($1,$2,$3,$4,'sha-d5dh',1)`,[DR,WK,M,CONTENT]);
  await q(`INSERT INTO manuscript_draft_sections
    (id,draft_id,position,text,source_section_id)
    VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7),($8,$2,3,$9,$10)`,
    [D1,DR,T1,S1,D2,T2,S2,D3,T3,S3]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1`,[DR]);
  const lengths=[...T1,...T2,...T3];
  const l1=[...T1].length,l2=[...T2].length,l3=[...T3].length;
  const readState={
    draftId:DR,revisionNumber:1,revisionDigest:sha(CONTENT),
    sectionTopology:[D1,D2,D3],
    sections:{
      [D1]:{revisionNumber:1,range:{start:0,end:l1},digest:sha(T1)},
      [D2]:{revisionNumber:1,range:{start:l1,end:l1+l2},digest:sha(T2)},
      [D3]:{revisionNumber:1,range:{start:l1+l2,end:l1+l2+l3},digest:sha(T3)},
    },
    inputFingerprint:sha('d5dh-input'),
  };
  void lengths;
  for (const [index,[lens,,phenomenon,text]] of LENSES.entries()) {
    const id=randomUUID(); readingIds.set(lens,id);
    const oid=`dobs_${randomUUID()}`;
    const limits=lens==='reader'
      ? ['reader-effect','author-intent','editorial-consequence']
      : ['author-intent','editorial-consequence'];
    const observation={
      key:'o1',observationId:oid,admissionIndex:0,basisFingerprint:sha(`basis-${lens}`),
      position:{sectionPosition:index%2,codePointStart:2},lens,phenomenon,
      evidenceRefs:[
        {kind:'passage',sectionId:D1,range:{start:2,end:12}},
        {kind:'passage',sectionId:D2,range:{start:2,end:14}},
      ],
      observation:text,doesNotEstablish:limits,structureDependency:{kind:'independent'},
    };
    await q(`INSERT INTO developmental_readings
      (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,
       scope,read_state,coverage,input_fingerprint,outcome,observations,
       reader_provenance,classifier_provenance,frozen_at)
      VALUES ($1,$2,$3,$4,1,$5,$6,$7,$8,$9,'reading',$10,$11,$12,NOW()-($13||' minutes')::interval)`,[
      id,WK,M,DR,lens,
      JSON.stringify({commissionedLens:lens,bodyScope:[D1,D2,D3],withStructure:false}),
      JSON.stringify(readState),
      JSON.stringify({sections:{[D1]:'body',[D2]:'body',[D3]:'body'}}),
      readState.inputFingerprint,JSON.stringify([observation]),
      JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('prompt'),readerVersion:'DEVELOPMENTAL-READER-07'}),
      JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('classifier'),classifierVersion:'DEVELOPMENTAL-PHENOMENON-04'}),
      String(index),
    ]);
  }
}

async function main(){
  mkdirSync(OUT,{recursive:true});
  await pg.connect();
  const [who]=await q('select current_database() d,current_user u');
  if(!String(who?.d).startsWith('ws_d4r1_witness_')||who?.u!=='maia_test_user') throw new Error('wrong DB');
  await seed();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  await ctx.addCookies([{name:'maia_session',value:TOKEN,url:`http://127.0.0.1:${PORT}`}]);
  const page=await ctx.newPage();
  let readingPosts=0;
  page.on('request',(req)=>{if(req.method()==='POST'&&/\/readings(?:\?|$)/.test(req.url())) readingPosts+=1;});
  try{
    console.log('\n── D5D–D5H LIVE DEVELOP LENS FAMILY ──\n');
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/develop?m=${WK}&s=${D1}`,
      {waitUntil:'domcontentloaded',timeout:240000});
    await page.waitForSelector('[data-studio-mode="develop"] [data-stage="develop"]',{timeout:240000});
    check('D5DH-01 all eight developmental lenses are live controls',
      await page.locator('.fs-modetabs button[role="tab"]').count()===9
      && await page.locator('.fs-modetabs [aria-disabled="true"]').count()===0);
    const initialPosts=readingPosts;
    let exactReturns=0;
    for(const [lens,label] of LENSES){
      await page.getByRole('tab',{name:label}).click();
      await page.waitForFunction((l)=>new URL(location.href).searchParams.get('lens')===l,lens);
      await page.waitForSelector(`[data-develop-view="${lens}"] .fs-readingchoice`);
      check(`D5DH-${lens}-choice explicit before render`,
        await page.locator('[data-source-reading]').count()===0);
      const beforeChoice=readingPosts;
      await page.locator('[data-develop-view] .fs-readingchoice').first().click();
      await page.waitForFunction((rid)=>new URL(location.href).searchParams.get('reading')===rid,readingIds.get(lens)!);
      await page.waitForSelector(`[data-source-reading="${readingIds.get(lens)}"]`);
      check(`D5DH-${lens}-selected exact durable reading`,
        new URL(page.url()).searchParams.get('reading')===readingIds.get(lens)
        && readingPosts===beforeChoice);
      const returns=await page.locator(`[data-develop-view="${lens}"] a[data-return-to]`).count();
      exactReturns+=returns;
      check(`D5DH-${lens}-evidence returns into Write`,returns===1,
        `returns=${returns}`);
      await page.getByRole('button',{name:'Choose another reading'}).click();
      await page.waitForFunction(()=>!new URL(location.href).searchParams.has('reading'));
    }
    check('D5DH-02 navigation and saved-reading selection commission no cognition',
      readingPosts===initialPosts,`reading POST delta=${readingPosts-initialPosts}`);
    check('D5DH-03 six reading-driven lenses expose six exact current returns',
      exactReturns===6,`returns=${exactReturns}`);
    await page.waitForSelector('[data-develop-view="reader"] .fs-readingchoice');
    check('D5DH-04 commissioning remains a separate deliberate act',
      await page.locator('[data-develop-view="reader"] button').filter({hasText:'Read for reader perspective'}).count()===1);
    await page.getByRole('tab',{name:'How it sounds'}).click();
    await page.waitForSelector('[data-develop-view="voice"] .fs-readingchoice');
    await page.locator('[data-develop-view="voice"] .fs-readingchoice').first().click();
    await page.waitForSelector(`[data-source-reading="${readingIds.get('voice')}"]`);
    await page.screenshot({path:join(OUT,'01-voice-live.png'),fullPage:false});
    const visual=await page.locator('.fs-root').evaluate((node)=>{
      const style=getComputedStyle(node);
      return {display:style.display,columns:style.gridTemplateColumns,background:style.backgroundColor};
    });
    check('D5DH-05 flagship visual system remains live across shared lens surface',
      visual.display==='grid'&&visual.columns.split(' ').length>=2,JSON.stringify(visual));

    const voiceUrl=page.url();
    await page.reload({waitUntil:'domcontentloaded',timeout:240000});
    await page.waitForSelector(`[data-source-reading="${readingIds.get('voice')}"]`,{timeout:240000});
    check('D6-01 refresh restores exact Develop lens and explicit reading identity',
      page.url()===voiceUrl);

    const returnLink=page.locator('[data-develop-view="voice"] a[data-return-to]').first();
    const returnSection=await returnLink.getAttribute('data-return-to');
    await returnLink.click();
    await page.waitForURL(/\/writers-studio\/rebuild\?/,{timeout:240000});
    const writeUrl=new URL(page.url());
    check('D6-02 exact evidence return opens Write at the same manuscript section',
      writeUrl.searchParams.get('m')===WK&&writeUrl.searchParams.get('s')===returnSection,
      page.url());
    await page.goBack({waitUntil:'domcontentloaded'});
    await page.waitForSelector(`[data-source-reading="${readingIds.get('voice')}"]`,{timeout:240000});
    check('D6-03 browser Back restores the exact Develop reading, not merely the room',
      page.url()===voiceUrl);

    await page.setViewportSize({width:1180,height:820});
    const laptop=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth,
      tabs:(document.querySelector('.fs-modetabs') as HTMLElement | null)?.scrollWidth??0,
      tabClient:(document.querySelector('.fs-modetabs') as HTMLElement | null)?.clientWidth??0}));
    check('D6-04 laptop has no page-level horizontal overflow',laptop.sw<=laptop.w+1,JSON.stringify(laptop));

    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(100);
    const mobile=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth,
      rail:getComputedStyle(document.querySelector('.fs-rail')!).display,
      mobileNav:getComputedStyle(document.querySelector('.fs-mobilenav')!).display}));
    check('D6-05 mobile collapses the rail into mobile navigation without page overflow',
      mobile.rail==='none'&&mobile.mobileNav==='flex'&&mobile.sw<=mobile.w+1,JSON.stringify(mobile));
    await page.screenshot({path:join(OUT,'02-voice-mobile.png'),fullPage:false});

    const chooseAnother=page.getByRole('button',{name:'Choose another reading'});
    await chooseAnother.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!new URL(location.href).searchParams.has('reading'));
    await page.waitForSelector('[data-develop-view="voice"] .fs-readingchoice');
    const choice=page.locator('[data-develop-view="voice"] .fs-readingchoice').first();
    await choice.focus(); await page.keyboard.press('Enter');
    await page.waitForSelector(`[data-source-reading="${readingIds.get('voice')}"]`);
    check('D6-06 saved-reading chooser is operable by keyboard alone',
      new URL(page.url()).searchParams.get('reading')===readingIds.get('voice'));
  }finally{
    await browser.close(); await pg.end();
  }
  console.log(`\nD5D–D5H RESULT — ${pass} passed · ${fail} failed · screenshot ${OUT}\n`);
  process.exit(fail===0?0:1);
}
main().catch(async(e)=>{console.error(e);await pg.end().catch(()=>{});process.exit(2);});
