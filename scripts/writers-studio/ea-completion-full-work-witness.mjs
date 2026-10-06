import { chromium } from 'playwright';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;
const BASE = process.env.EA_BASE_URL || 'http://127.0.0.1:3738';
const DB = process.env.EA_DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
const CURRENT_REAL = 'c81925d1-9df3-46e7-a69c-7e257326f284';
const EARLIER_REAL = '8f9cc472-35fc-4ac6-99d3-1de6e41728bd';

const db = new Client({ connectionString: DB });
let browser;
let fixture;

const pass = (name, detail='') => console.log('PASS', name, detail ? '— '+detail : '');
const fail = (name, detail='') => { throw new Error('FAIL '+name+(detail ? ' — '+detail : '')); };
const tab = (page, name) => page.locator('[aria-label="Review view"] button').filter({ hasText: name }).first();

async function cleanup() {
  await browser?.close().catch(()=>{});
  if (fixture) {
    const { member, current, earlier, work, token } = fixture;
    await db.query('DELETE FROM auth_sessions WHERE session_token=$1',[token]).catch(()=>{});
    await db.query('DELETE FROM living_works WHERE id=$1',[work]).catch(()=>{});
    await db.query('DELETE FROM member_manuscripts WHERE id=ANY($1::uuid[])',[[current,earlier]]).catch(()=>{});
    await db.query('DELETE FROM members WHERE id=$1',[member]).catch(()=>{});
  }
  await db.end().catch(()=>{});
}

async function cloneManuscript(realId, member, title, withRealDraft) {
  const manuscript = randomUUID();
  await db.query(
    `INSERT INTO member_manuscripts(id,member_id,title,provenance)
     VALUES($1,$2,$3,'member_uploaded')`,
    [manuscript,member,title],
  );

  const sourceRows = (await db.query(
    `SELECT id,position,heading,body,heading_depth,heading_signal
       FROM manuscript_sections WHERE manuscript_id=$1 ORDER BY position`,
    [realId],
  )).rows;
  const sourceMap = new Map();
  for (const row of sourceRows) {
    const id=randomUUID(); sourceMap.set(row.id,id);
    await db.query(
      `INSERT INTO manuscript_sections
       (id,manuscript_id,position,heading,body,heading_depth,heading_signal)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [id,manuscript,row.position,row.heading,row.body,row.heading_depth,row.heading_signal],
    );
  }

  const draft=randomUUID();
  await db.query(
    `INSERT INTO manuscript_working_drafts
     (id,manuscript_id,member_id,content,base_source_hash,revision_count)
     VALUES($1,$2,$3,'','ea-completion-full-work-witness',1)`,
    [draft,manuscript,member],
  );

  let draftRows=[];
  if (withRealDraft) {
    draftRows=(await db.query(
      `SELECT ds.position,ds.text,ds.source_section_id
         FROM manuscript_draft_sections ds
         JOIN manuscript_working_drafts d ON d.id=ds.draft_id
        WHERE d.manuscript_id=$1 ORDER BY ds.position`,
      [realId],
    )).rows;
  }
  if (!draftRows.length) {
    draftRows=sourceRows.map((row)=>({
      position:row.position,
      source_section_id:row.id,
      text:[row.heading,row.body].filter(Boolean).join('\n'),
    }));
  }

  const draftSectionIds=[];
  for (const row of draftRows) {
    const id=randomUUID(); draftSectionIds.push(id);
    const sourceId=sourceMap.get(row.source_section_id) ?? null;
    await db.query(
      `INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id)
       VALUES($1,$2,$3,$4,$5)`,
      [id,draft,row.position,row.text,sourceId],
    );
  }
  await db.query(
    `UPDATE manuscript_working_drafts SET
       content=(SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                FROM manuscript_draft_sections WHERE draft_id=$1),
       section_addressable_at=NOW()
      WHERE id=$1`,[draft],
  );
  return { manuscript, draft, draftSectionIds };
}

async function seed() {
  const member=randomUUID(), work=randomUUID(), token='ea-completion-'+randomUUID();
  await db.query(
    `INSERT INTO members(id,passkey,username,password_hash,name,tester)
     VALUES($1,$2,$3,'!NO-LOGIN!','EA Completion Witness',true)`,
    [member,'EA-COMP-'+member, 'ea_completion_'+member.slice(0,8)],
  );
  const current=await cloneManuscript(CURRENT_REAL,member,'Elemental Alchemy — completion witness',true);
  const earlier=await cloneManuscript(EARLIER_REAL,member,'Elemental Alchemy — earlier/root witness',false);

  // Real historical Kelly material that was later softened/removed. Add it only
  // to the disposable earlier/root clone so Recovery has genuine Lost Gold to surface.
  // Re-open the disposable draft before altering its section set; re-seal only after
  // its flattened content has been recomputed.
  await db.query(
    'UPDATE manuscript_working_drafts SET section_addressable_at=NULL WHERE id=$1',
    [earlier.draft],
  );
  const lostGoldSource=randomUUID(), lostGoldDraft=randomUUID();
  const lostGoldText=[
    'A Message to My Fellow Healers, Mystics, and Cultural Revolutionaries',
    '',
    'Many of you have worked tirelessly to integrate this work into mainstream treatments, therapies, and interventions. You have made a significant impact in a culture that resisted this work with fervent opposition, overcoming the odds by making your work accessible in clinics, schools, and insurable practices. The exponential growth in this field underscores its importance and the need in our society, which battles against massive change, depersonalization, and a growing sense of isolation. How we think, intuit, feel, and sense profoundly matters. These elements shape the world we live in and engage with.',
  ].join('\n');
  await db.query(
    `INSERT INTO manuscript_sections(id,manuscript_id,position,heading,body,heading_depth,heading_signal)
     VALUES($1,$2,999,$3,$4,1,NULL)`,
    [lostGoldSource,earlier.manuscript,'A Message to My Fellow Healers, Mystics, and Cultural Revolutionaries',
      lostGoldText.split('\n\n').slice(1).join('\n\n')],
  );
  await db.query(
    `INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id)
     VALUES($1,$2,999,$3,$4)`,
    [lostGoldDraft,earlier.draft,lostGoldText,lostGoldSource],
  );
  await db.query(
    `UPDATE manuscript_working_drafts SET
       content=(SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                FROM manuscript_draft_sections WHERE draft_id=$1),
       section_addressable_at=NOW()
      WHERE id=$1`,[earlier.draft],
  );

  await db.query(`INSERT INTO living_works(id,member_id,title,purpose) VALUES($1,$2,$3,$4)`,
    [work,member,'Elemental Alchemy — completion witness','Full Writer Studio completion witness']);
  await db.query(
    `INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by)
     VALUES($1,'manuscript',$2,$4),($1,'manuscript',$3,$4)`,
    [work,current.manuscript,earlier.manuscript,member],
  );
  await db.query(`INSERT INTO auth_sessions(member_id,session_token,expires_at)
    VALUES($1,$2,NOW()+INTERVAL '60 minutes')`,[member,token]);
  fixture={member,work,token,current:current.manuscript,earlier:earlier.manuscript,
    currentSection:current.draftSectionIds[0], currentCount:current.draftSectionIds.length};
}

async function main(){
  await db.connect(); await seed();
  browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const ctx=await browser.newContext({viewport:{width:1600,height:1200},extraHTTPHeaders:{'x-session-token':fixture.token}});
  await ctx.addCookies([{name:'maia_session',value:fixture.token,url:BASE}]);
  await ctx.addInitScript(()=>localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false})));
  const page=await ctx.newPage();
  const url=`${BASE}/writers-studio?mode=review&m=${fixture.current}&s=${fixture.currentSection}`;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('[aria-label="Review view"]',{timeout:60000});
  const tabs=await page.locator('[aria-label="Review view"] button').allTextContents();
  for (const expected of ['Review','Recovery','Completeness','Sources','Proof','Ready the Work']) {
    if (!tabs.some(t=>t.trim()===expected)) fail('review-tab-'+expected,tabs.join('|'));
  }
  pass('review-convergence-tabs',tabs.map(t=>t.trim()).join(' · '));

  await tab(page,'Recovery').click({force:true});
  await page.waitForSelector('[data-review-recovery]',{timeout:30000});
  const opts=await page.locator('[data-review-recovery] select').first().locator('option').allTextContents();
  if (!opts.some(t=>t.includes('earlier/root'))) fail('recovery-source-visible',opts.join('|'));
  pass('recovery-source-visible',opts.join(' | '));
  await page.getByRole('button',{name:'Look for Lost Gold'}).click();
  await page.waitForSelector('.p4r1-recovery-method',{timeout:60000});
  const candidateCount=await page.locator('[data-recovery-candidate]').count();
  if (candidateCount < 1) fail('lost-gold-candidates','0 candidates');
  pass('lost-gold-candidates',String(candidateCount));

  await tab(page,'Completeness').click({force:true});
  await page.getByText('What may be missing?',{exact:true}).waitFor({timeout:20000});
  await page.getByRole('button',{name:'Check this Work with MAIA'}).click();
  await page.waitForSelector('[data-review-work-conversation]',{timeout:20000});
  const pageText=await page.locator('[data-review-work-conversation] textarea[placeholder="Ask MAIA about this work…"]').inputValue();
  if (!pageText.includes('Review this current Work for completeness')) fail('completeness-handoff',pageText.slice(0,180));
  pass('completeness-handoff');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('[aria-label="Review view"]');

  await tab(page,'Sources').click({force:true});
  await page.getByText('What still needs verification?',{exact:true}).waitFor({timeout:20000});
  await page.getByRole('button',{name:'Check this Work with MAIA'}).click();
  await page.waitForSelector('[data-review-work-conversation]',{timeout:20000});
  const sourceText=await page.locator('[data-review-work-conversation] textarea[placeholder="Ask MAIA about this work…"]').inputValue();
  if (!sourceText.includes('quotation and source provenance')) fail('source-audit-handoff',sourceText.slice(0,180));
  pass('source-audit-handoff');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('[aria-label="Review view"]');

  await tab(page,'Ready the Work').click({force:true});
  await page.waitForSelector('[data-ready-work]',{timeout:20000});
  const dims=await page.locator('[data-completion-dimension]').count();
  if (dims!==8) fail('ready-dimensions',String(dims));
  const state=(await page.locator('[data-completion-state]').innerText()).trim();
  if (!state.includes('IN PROGRESS')) fail('ready-in-progress',state);
  pass('ready-work-state',state+' · '+dims+' dimensions');
  const first=page.locator('[data-completion-dimension="editorial-integrity"]');
  await first.getByRole('button',{name:'Checked'}).click();
  await page.waitForTimeout(500);
  if (!(await first.innerText()).toLowerCase().includes('clear')) fail('ready-adjudication-persisted');
  pass('ready-adjudication-persisted');

  await tab(page,'Proof').click({force:true});
  await page.getByRole('button',{name:'Make proof'}).waitFor({timeout:30000});
  await page.getByRole('button',{name:'Make proof'}).click();
  await page.waitForSelector('[data-proof-provenance]',{timeout:240000});
  const provenance=await page.locator('[data-proof-provenance]').innerText();
  const mappedMatch=provenance.match(/(\d+) page-addressed sections/);
  if (!mappedMatch || Number(mappedMatch[1]) < 100) fail('proof-page-address-map',provenance);
  pass('proof-page-address-map',provenance.replace(/\n/g,' · '));
  const pageCountText=await page.locator('.p4r1-proof-toolbar').innerText();
  pass('proof-rendered',pageCountText.replace(/\n/g,' · '));

  const issue=page.locator('[data-proof-page-issue]');
  await issue.locator('input[type=number]').fill('6');
  await issue.locator('textarea').fill('The model is too small and sits too high on the page.');
  await issue.getByRole('button',{name:'Work on this with MAIA'}).click();
  await page.waitForSelector('[data-review-work-conversation]',{timeout:20000});
  const issueText=await page.locator('[data-review-work-conversation] textarea[placeholder="Ask MAIA about this work…"]').inputValue();
  if (!issueText.includes('rendered page 6') || !issueText.includes('Treat the page issue as my observation')) {
    fail('page-issue-return-address',issueText.slice(0,220));
  }
  pass('page-issue-return-address');

  console.log('EA COMPLETION FULL-WORK WITNESS · PASS',
    JSON.stringify({sections:fixture.currentCount,recoveryCandidates:candidateCount}));
}

main().then(cleanup).catch(async e=>{console.error(e.stack||e); await cleanup(); process.exit(1);});
