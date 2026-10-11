/**
 * Disposable test of DOCX Source custody → import confirmation → return to Work.
 * No real user, manuscript, public service, or provider data may be used.
 */
'use strict';
const assert=require('node:assert/strict');
const {Client}=require('pg');
const {chromium}=require('playwright');
const {randomUUID,createHash}=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const DSN=process.env.DATABASE_URL,BASE='http://127.0.0.1:3762';
const DIR='/tmp/ws-jondi-import-e2e-20261011';
const FILE='/tmp/ws-jondi-import-fixture-20261011.docx';
let db,browser;
async function main(){
 const u=new URL(DSN);
 assert.equal(u.hostname,'127.0.0.1');assert.equal(u.port,'55629');
 assert.equal(u.pathname,'/ws_jondi_witness_20261011');
 fs.mkdirSync(DIR,{recursive:true});
 if(!fs.existsSync(FILE)) {
   const built=spawnSync('python3',['scripts/witness/ws-jondi-import-fixture.py',FILE],{cwd:process.cwd(),encoding:'utf8'});
   assert.equal(built.status,0,'cannot build a synthetic DOCX fixture: '+built.stderr);
 }
 db=new Client({connectionString:DSN}); await db.connect();
 assert.equal((await db.query('SELECT current_database() n')).rows[0].n,'ws_jondi_witness_20261011');
 const q=async(sql,args=[]) =>(await db.query(sql,args)).rows;
 const M=randomUUID(),TOKEN='witness-'+randomUUID();
 await q("INSERT INTO members(id,passkey,username,password_hash,name) VALUES($1,$2,$3,'test-only','TEST ONLY — Import Return')",[M,'WS-IMPORT-'+M.slice(0,6),'ws-import-'+M.slice(0,6)]);
 await q("INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES($1,$2,NOW()+INTERVAL '2 hours')",[M,TOKEN]);
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const ctx=await browser.newContext({viewport:{width:1512,height:1000},acceptDownloads:true,serviceWorkers:'block'});
 await ctx.addCookies([{name:'maia_session',value:TOKEN,url:BASE}]);
 await ctx.addInitScript(()=>localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false})));
 await ctx.route('**/*',r=>{
  const u=new URL(r.request().url());
  return u.origin===BASE||u.protocol==='data:'||u.protocol==='blob:'?r.continue():r.abort();
 });
 const page=await ctx.newPage(),issues=[];
 page.on('pageerror',e=>issues.push({kind:'js',message:e.message}));
 page.on('response',r=>{
   const u=new URL(r.url());
   if(u.origin===BASE&&u.pathname.startsWith('/api/')&&r.status()>=400
     &&!(r.status()===404&&u.pathname==='/api/writers-studio/relationships'))
      issues.push({kind:'api',path:u.pathname,status:r.status()});
 });
 await page.goto(BASE+'/press/manuscript?import=1',{waitUntil:'domcontentloaded',timeout:90000});
 await page.getByRole('heading',{name:'Import a manuscript'}).waitFor({timeout:40000});
 console.log('IMPORT_ROOM_OPEN');
 await page.locator('input[placeholder="Title of your manuscript"]').fill('TEST ONLY — Imported Book Return');
 await page.locator('input[type="file"]').setInputFiles(FILE);
 await page.waitForFunction(()=>document.querySelector('textarea')?.value?.includes('The writer returns to a Work'),{},{timeout:65000});
 const extracted=await page.locator('textarea').inputValue();
 assert.ok(extracted.length>40000,'full synthetic text not extracted');
 console.log('DOCX_EXTRACTED',extracted.length);
 const originalBytes=fs.readFileSync(FILE);
 const SHA=()=>createHash('sha256').update(originalBytes).digest('hex');
 const arrivals=await q('SELECT id,artifact_ref,artifact_hash,artifact_size FROM manuscript_source_arrivals WHERE member_id=$1',[M]);
 assert.equal(arrivals.length,1);
 assert.equal(arrivals[0].artifact_hash,SHA());
 const artifact=path.join('/tmp/ws-jondi-beta-vault-20261011',arrivals[0].artifact_ref);
 assert.equal(createHash('sha256').update(fs.readFileSync(artifact)).digest('hex'),SHA());
 console.log('SOURCE_CUSTODY_SHA256_CONFIRMED',originalBytes.length);
 await page.screenshot({path:DIR+'/01-source-extracted.png'});
 await page.getByRole('button',{name:'Import into Author Studio'}).click();
 await page.getByRole('button',{name:'Save manuscript'}).waitFor({timeout:45000});
 console.log('SECTION_CONFIRM_PRESENT');
 await page.screenshot({path:DIR+'/02-confirm-boundaries.png'});
 await page.getByRole('button',{name:'Save manuscript'}).click();
 await page.waitForURL(/writers-studio\?mode=write&m=/,{timeout:85000});
 const w=(await q('SELECT id FROM member_manuscripts WHERE member_id=$1',[M]))[0]?.id;
 assert.ok(w,'no imported manuscript');
 const s=(await q('SELECT COUNT(*)::int n FROM manuscript_sections WHERE manuscript_id=$1',[w]))[0].n;
 assert.ok(s>=160&&s<=200,'wrong section count '+s);
 const attached=(await q('SELECT manuscript_id FROM manuscript_source_arrivals WHERE member_id=$1',[M]))[0].manuscript_id;
 assert.equal(attached,w);
 await page.waitForFunction(()=>document.body.innerText.length>600 && document.body.innerText.includes('The writer returns to a Work'),{},{timeout:65000});
 const body=await page.locator('body').innerText();
 console.log('BODY_AFTER_IMPORT',body.length,body.slice(0,160).replace(/\n/g,' '));
 assert.ok(body.length>500&&!body.includes('Something Went Wrong'),'black canvas after import');
 console.log('WORK_WRITE_OPENED_AFTER_IMPORT',JSON.stringify({sections:s,bodyChars:body.length}));
 await page.screenshot({path:DIR+'/03-write-after-import.png'});
 const work=randomUUID();
 await q("INSERT INTO living_works(id,member_id,title) VALUES($1,$2,'TEST ONLY — Imported Book Return')",[work,M]);
 await q("INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) VALUES($1,'manuscript',$2,$3)",[work,w,M]);
 const draft=(await q('SELECT id,content FROM manuscript_working_drafts WHERE manuscript_id=$1',[w]))[0];
 assert.ok(draft,'no draft after opening imported document');
 const baseRev=(await q('SELECT content FROM working_draft_revisions WHERE draft_id=$1 AND revision_number=1',[draft.id]))[0];
 assert.ok(baseRev,'no revision1 baseline');
 await q('BEGIN');
 // The authored continuation is inside Chapter 1, not on the cover page.
 const first=(await q("SELECT id,text FROM manuscript_draft_sections WHERE draft_id=$1 ORDER BY position ASC OFFSET 1 LIMIT 1",[draft.id]))[0];
 const marked=first.text+'\nTEST ONLY — the member returned and added this single note.\n';
 await q('UPDATE manuscript_draft_sections SET text=$2 WHERE id=$1',[first.id,marked]);
 await q("UPDATE manuscript_working_drafts SET content=(SELECT string_agg(text,'' ORDER BY position) FROM manuscript_draft_sections WHERE draft_id=$1),version=version+1,updated_at=NOW()+INTERVAL '1 second' WHERE id=$1",[draft.id]);
 await q('COMMIT');
 const revised=(await q('SELECT content FROM manuscript_working_drafts WHERE id=$1',[draft.id]))[0].content;
 assert.notEqual(revised,baseRev.content);
 await page.goto(BASE+'/writers-studio?mode=home',{waitUntil:'domcontentloaded',timeout:90000});
 const returnBtn=page.getByRole('button',{name:/return to this work/i});
 await returnBtn.waitFor({timeout:75000});
 console.log('RETURN_TO_WORK_AVAILABLE');
 await page.screenshot({path:DIR+'/04-home-return.png'});
 await returnBtn.click();
 await page.waitForURL(/mode=write/,{timeout:50000});
 await page.waitForFunction(()=>document.body.innerText.includes('TEST ONLY') && document.body.innerText.length>800,{},{timeout:60000});
 const afterReturn=(await q('SELECT content FROM manuscript_working_drafts WHERE id=$1',[draft.id]))[0].content;
 assert.equal(afterReturn,revised,'return navigation mutated manuscript');
 assert.deepEqual(issues.filter(x=>x.kind==='js'),[],JSON.stringify(issues));
 assert.deepEqual(issues.filter(x=>x.kind==='api'),[],JSON.stringify(issues));
 await page.screenshot({path:DIR+'/05-write-returned.png'});
 console.log('JONDI_IMPORT_RETURN_WITNESS_PASSED',JSON.stringify({sourceCustody:true,sections:s,issues:issues.length}));
 fs.writeFileSync(DIR+'/result.json',JSON.stringify({passed:true,sourceCustody:true,sections:s,issues},null,2));
}
main().catch(e=>{console.error('IMPORT_RETURN_WITNESS_FAILED',e.stack||e);process.exitCode=1;})
.finally(async()=>{await browser?.close().catch(()=>{});await db?.end().catch(()=>{})});
