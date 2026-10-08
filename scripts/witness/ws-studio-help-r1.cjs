/** Studio Help live witness. Local production build + disposable database only.
 * No real Work is read or changed. Model matching is tested separately and bounded.
 */
const {Client}=require('pg');
const {chromium}=require('playwright');
const {randomUUID,createHash}=require('crypto');
const fs=require('fs');const assert=require('node:assert/strict');
const base=process.env.WITNESS_BASE||'http://127.0.0.1:3753';
const out=process.env.WITNESS_OUTPUT||'/tmp/ws-help-r1-20261008';
async function main(){
  assert.equal(new URL(base).hostname,'127.0.0.1');
  const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
  assert.match((await db.query('select current_database() n')).rows[0].n,/_witness_/);
  const member=randomUUID(),other=randomUUID(),token='witness-'+randomUUID(),token2='witness-'+randomUUID();
  let manuscript=null,browser=null;
  const results={};
  try{
    for(const [id,credential] of [[member,token],[other,token2]]){
      await db.query('INSERT INTO members(id,passkey,username,password_hash,name) VALUES($1,$2,$3,$4,$5)',[id,'help-'+id,'help-'+id,'not-a-login-password','TEST ONLY Help writer']);
      await db.query("INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES($1,$2,now()+interval '2 hours')",[id,credential]);
    }
    await db.query("INSERT INTO ops_contacts(name,contact_type,pipeline_stage,member_id) VALUES($1,'beta_tester','active',$2)",['TEST ONLY Help pilot',member]);
    const api=async(method,path,body,credential=token)=>{
      const r=await fetch(base+path,{method,headers:{'content-type':'application/json','origin':base,...(credential?{'x-session-token':credential}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
      return {status:r.status,body:await r.json().catch(()=>null)};
    };
    const source='An original passage stays on the table.\n\nThe neighboring paragraph remains unchanged.';
    const made=await api('POST','/api/sovereign/manuscripts',{title:'TEST ONLY — Studio Help',sections:[{heading:'First section',body:source},{heading:'Next section',body:'The next section remains intact.'}]});
    assert.equal(made.status,201);manuscript=made.body.id;
    assert.ok([200,201].includes((await api('POST',`/api/sovereign/manuscripts/${manuscript}/draft`,{})).status));
    const baseline=(await api('GET',`/api/writers-studio/rebuild/context?manuscriptId=${manuscript}`)).body;
    const section=baseline.sections[0].draftSectionId;
    browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
    const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    await ctx.addCookies([{name:'maia_session',value:token,url:base}]);
    await ctx.addInitScript(()=>{if(!localStorage.getItem('maia_settings'))localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false}));});
    // Do not send synthetic credentials or browser requests outside the witness origin.
    const blocked=[];await ctx.route('**/*',route=>{const url=new URL(route.request().url());if(['data:','blob:'].includes(url.protocol)||url.origin===base)return route.continue();blocked.push(url.origin);return route.abort();});
    const page=await ctx.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith(base+'/api/'))requests.push({path:new URL(r.url()).pathname,method:r.method(),body:r.postData()});});
    await page.goto(`${base}/writers-studio?mode=develop&developCraft=1&m=${manuscript}&s=${section}`,{waitUntil:'domcontentloaded'});
    try { await page.locator('[data-craftsmans-table-r1]').waitFor({timeout:30000}); } catch(error) { await page.screenshot({path:out+'/startup-failure.png'});fs.writeFileSync(out+'/startup-failure.json',JSON.stringify({url:page.url(),text:await page.locator('body').innerText(),errors,requests},null,2));throw error; }
    await page.getByRole('button',{name:'Choose passage',exact:true}).click();
    await page.getByRole('button',{name:'Focus whole section',exact:true}).click();
    await page.getByRole('button',{name:'Write here',exact:true}).click();
    const editor=page.getByRole('textbox',{name:'Edit your working passage',exact:true});
    const unfinished='UNFINISHED PRIVATE TEST DRAFT — never attach this to Help. 🜂\n\nKeep the exact line breaks.  ';
    await editor.fill(unfinished);
    const composer=page.getByRole('textbox',{name:'Talk with MAIA about the writing',exact:true});
    await composer.fill('Unsent editorial conversation stays here.');
    await page.waitForTimeout(250);
    const before=await page.evaluate(()=>({url:location.href,scroll:document.querySelector('.p4r1-craft-r1-scroll')?.scrollTop,settings:localStorage.getItem('maia_settings'),view:document.querySelector('[aria-label="Craft view"] [aria-pressed="true"]')?.textContent?.trim()}));
    const table=await page.locator('[data-craftsmans-table-r1]').elementHandle();
    const start=requests.length;
    const help=page.getByRole('dialog',{name:'Help with Writer’s Studio',exact:true});
    const openHelp=async()=>{await page.getByRole('button',{name:'Help',exact:true}).click();await help.waitFor();await page.waitForFunction(()=>!document.querySelector('#studio-help-question')?.disabled);};
    await openHelp();
    await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).fill('Why is this word still crossed out?');
    await help.getByRole('button',{name:'Ask MAIA about Studio',exact:true}).click();
    await help.getByText('From the Studio guide · no model request',{exact:true}).waitFor();
    await help.getByRole('heading',{name:'Why is a word still crossed out?',exact:true}).waitFor();
    assert.equal(requests.slice(start).filter(r=>r.method==='POST').length,0);
    results.commonAnswerWithoutModel=true;
    results.correctCraftContext=await help.getByText('Your table is showing '+before.view+'.',{exact:false}).count()>0;assert.equal(results.correctCraftContext,true);
    await page.screenshot({path:out+'/help-markup.png'});
    const downloadEvent=page.waitForEvent('download');await help.getByRole('button',{name:'Illustrated handbook PDF',exact:true}).click();const download=await downloadEvent;await download.saveAs(out+'/downloaded-handbook.pdf');
    results.handbookExact=createHash('sha256').update(fs.readFileSync(out+'/downloaded-handbook.pdf')).digest('hex')===createHash('sha256').update(fs.readFileSync('data/writers-studio/help/handbook-review-0.9.pdf')).digest('hex');
    const quickDownloadEvent=page.waitForEvent('download');await help.getByRole('button',{name:'Quick-start PDF',exact:true}).click();const quickDownload=await quickDownloadEvent;await quickDownload.saveAs(out+'/downloaded-quick-start.pdf');
    results.quickStartPdfExact=createHash('sha256').update(fs.readFileSync(out+'/downloaded-quick-start.pdf')).digest('hex')===createHash('sha256').update(fs.readFileSync('data/writers-studio/help/quick-start-review-0.9.pdf')).digest('hex');
    await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).focus();
    for(let i=0;i<24;i++){await page.keyboard.press('Tab');assert.equal(await help.evaluate(el=>el.contains(document.activeElement)),true,'Keyboard focus must stay inside the modal Help sheet');}
    results.keyboardFocusContained=true;
    await page.keyboard.press('Escape');await help.waitFor({state:'hidden'});
    assert.equal(await editor.inputValue(),unfinished);assert.equal(await composer.inputValue(),'Unsent editorial conversation stays here.');
    assert.equal(await table.evaluate(el=>el.isConnected),true);
    const after=await page.evaluate(()=>({url:location.href,scroll:document.querySelector('.p4r1-craft-r1-scroll')?.scrollTop,settings:localStorage.getItem('maia_settings'),view:document.querySelector('[aria-label="Craft view"] [aria-pressed="true"]')?.textContent?.trim()}));
    assert.deepEqual(after,before);results.draftFocusScrollAndConversationPreserved=true;
    assert.equal(await page.getByRole('button',{name:'Help',exact:true}).evaluate(el=>document.activeElement===el),true);results.escapeRestoresFocus=true;
    await openHelp();assert.equal(await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).inputValue(),'Why is this word still crossed out?');results.helpDraftRetainedWithinOwner=true;
    await help.getByRole('button',{name:'Topics',exact:true}).click();await help.getByRole('textbox',{name:'Find a help topic',exact:true}).fill('layout');await help.getByRole('button',{name:/Balanced, Passage wide/}).click();
    await help.getByRole('heading',{name:'Balanced, Passage wide, MAIA wide or Stacked?',exact:true}).waitFor();results.searchableTopics=true;
    await help.getByRole('button',{name:'Quick start',exact:true}).click();await help.getByRole('heading',{name:'Your first useful session'}).waitFor();results.quickStartAvailable=true;
    await help.getByRole('button',{name:'Ask MAIA',exact:true}).click();
    await page.evaluate(()=>localStorage.setItem('maia_settings',JSON.stringify({sanctuary:true})));
    const beforePrivate=requests.length;
    await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).fill('What is this little typographical sign doing?');await help.getByRole('button',{name:'Ask MAIA about Studio',exact:true}).click();
    await help.getByText('I’m staying with the guide',{exact:false}).waitFor();
    assert.equal(requests.slice(beforePrivate).filter(r=>r.method==='POST').length,0);results.sanctuaryNoDispatch=true;
    await page.evaluate(()=>localStorage.setItem('maia_settings',JSON.stringify({sanctuary:false})));
    await page.route('**/api/writers-studio/help',route=>route.request().method()==='POST'?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({refusal:'guide_match_unavailable'})}):route.fallback());
    await help.getByRole('button',{name:'Ask MAIA about Studio',exact:true}).click();await help.getByText('MAIA could not match that question just now.',{exact:false}).waitFor();
    await help.getByRole('button',{name:'Topics',exact:true}).click();results.outageKeepsTopics=await help.getByRole('textbox',{name:'Find a help topic',exact:true}).isVisible();
    await page.unroute('**/api/writers-studio/help');
    // Geometry and keyboard checks use the same real sheet, not a separate mock.
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:out+'/help-mobile.png'});
    results.mobileNoHorizontalOverflow=await help.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.querySelector('.studio-help-content').scrollWidth<=el.querySelector('.studio-help-content').clientWidth+1);
    await page.keyboard.press('Escape');const entry=await page.getByRole('button',{name:'Help',exact:true}).boundingBox();results.mobileEntryReachable=Boolean(entry&&entry.x>=0&&entry.x+entry.width<=390);await openHelp();
    await page.setViewportSize({width:760,height:1000});const initialFont=await help.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));await page.evaluate(()=>document.documentElement.style.fontSize='200%');results.textActuallyEnlarged=await help.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=initialFont*1.9;
    await help.getByRole('button',{name:'Quick start',exact:true}).click();await help.getByRole('heading',{name:'Your first useful session'}).scrollIntoViewIfNeeded();
    results.enlargedAnswerReachable=await help.getByRole('heading',{name:'Your first useful session'}).isVisible();
    await page.screenshot({path:out+'/help-enlarged.png'});results.enlargedNoHorizontalOverflow=await help.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.querySelector('.studio-help-content').scrollWidth<=el.querySelector('.studio-help-content').clientWidth+1);
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1440,height:1000});await page.keyboard.press('Escape');
    // Same browser, different account: no earlier Help question or answer survives.
    await ctx.clearCookies();await ctx.addCookies([{name:'maia_session',value:token2,url:base}]);await openHelp();await help.getByRole('button',{name:'Ask MAIA',exact:true}).click();
    assert.equal(await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).inputValue(),'');results.accountChangeClearsHelp=true;
    assert.equal((await api('POST','/api/writers-studio/help',{release:'studio-help-r1-20261008',question:'Where is my version?',context:{surface:'craft',view:'unknown',focused:true,controls:[]},sanctuary:false},token2)).status,403);
    assert.equal((await api('GET','/api/writers-studio/help/guide?document=handbook',undefined,token2)).status,403);
    assert.equal((await api('POST','/api/writers-studio/help',{},null)).status,401);results.nonPilotAndSignedOutDenied=true;
    await page.keyboard.press('Escape');await ctx.clearCookies();await ctx.addCookies([{name:'maia_session',value:token,url:base}]);
    // Every primary mode has the same persistent Help entry. Do not type into direct Write.
    results.modes={};for(const mode of ['home','write','develop','review']){
      await page.goto(`${base}/writers-studio?mode=${mode}&m=${manuscript}&s=${section}`,{waitUntil:'domcontentloaded'});
      // Help is available even during loading; unknown is then correct. This
      // assertion concerns a rendered mode, not the mode merely requested in a URL.
      await page.locator(`.fr-shell[data-mode="${mode}"], [data-room="writers-studio"][data-mode="${mode}"]`).first().waitFor({timeout:30000});
      await page.getByRole('button',{name:'Help',exact:true}).waitFor({timeout:30000});await openHelp();results.modes[mode]=await help.isVisible();const label={home:'Studio Home',write:'Write',develop:'Develop',review:'Review'}[mode];assert.equal(await help.locator('.studio-help-header p').innerText().then(t=>t.startsWith(label)),true,'Help must identify the rendered '+mode+' surface');await page.keyboard.press('Escape');
    }
    const current=(await api('GET',`/api/writers-studio/rebuild/context?manuscriptId=${manuscript}`)).body;
    results.canonicalUnchanged=JSON.stringify(current.sections)===JSON.stringify(baseline.sections)&&current.version===baseline.version;
    results.noManuscriptDisclosure=requests.filter(r=>r.path==='/api/writers-studio/help'&&r.method==='POST').every(r=>!r.body?.includes('UNFINISHED PRIVATE')&&!r.body?.includes(manuscript));
    results.pageErrors=errors;results.externalOriginsBlocked=[...new Set(blocked)];
    fs.writeFileSync(out+'/browser-results-current.json',JSON.stringify(results,null,2));
    assert.equal(results.canonicalUnchanged,true);assert.equal(results.noManuscriptDisclosure,true);assert.equal(results.handbookExact,true);assert.equal(results.quickStartPdfExact,true);assert.equal(results.pageErrors.length,0);assert.equal(results.mobileEntryReachable,true,'Mobile Help entry must be reachable');assert.equal(results.enlargedAnswerReachable,true,'Enlarged text must leave the answer reachable');assert.equal(results.textActuallyEnlarged,true,'Help text must actually enlarge');assert.equal(results.enlargedNoHorizontalOverflow,true,'Enlarged Help must not overflow horizontally');
    fs.writeFileSync(out+'/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
    // A bounded live match through the visible Help question box and real route.
    if(process.env.LIVE_HELP_MATCH==='1'){
      await openHelp();await help.getByRole('button',{name:'Ask MAIA',exact:true}).click();
      const q='Can you distinguish between preserving my alternative and replacing what a reader would see?';
      await help.getByRole('textbox',{name:'What would you like help with?',exact:true}).fill(q);
      const result=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/writers-studio/help' && r.request().method()==='POST',{timeout:30000});
      await help.getByRole('button',{name:'Ask MAIA about Studio',exact:true}).click();
      const r=await result,b=await r.json();
      const evidence={status:r.status(),topicIds:b.topicIds??[],refusal:b.refusal??null,throughVisibleComposer:true};
      fs.writeFileSync(out+'/live-model-match.json',JSON.stringify(evidence,null,2));console.log('LIVE_HELP_MATCH',JSON.stringify(evidence));
      assert.equal(r.status(),200,'Live Help matching must succeed before marking its UI path passed');
      await help.getByText('MAIA matched your question to this Studio guide.',{exact:true}).waitFor();
      await help.locator('.studio-help-answer h3').first().scrollIntoViewIfNeeded();
      await page.screenshot({path:out+'/help-live-answer.png'});
      const payload=JSON.parse(r.request().postData());assert.deepEqual(Object.keys(payload).sort(),['context','question','release','sanctuary']);
      assert.equal(JSON.stringify(payload).includes('UNFINISHED PRIVATE'),false);assert.equal(JSON.stringify(payload).includes(manuscript),false);
      results.liveVisibleHelpAnswer=true;
      fs.writeFileSync(out+'/browser-results.json',JSON.stringify(results,null,2));
    }
  }finally{
    if(browser)await browser.close();
    if(manuscript){const r=await fetch(base+`/api/sovereign/manuscripts/${manuscript}`,{method:'DELETE',headers:{'x-session-token':token}});console.log('FIXTURE_DELETE_STATUS',r.status);}
    await db.query('DELETE FROM ops_contacts WHERE member_id = ANY($1::uuid[]) AND name=$2',[[member,other],'TEST ONLY Help pilot']);
    await db.query('DELETE FROM auth_sessions WHERE member_id=ANY($1::uuid[])',[[member,other]]);
    await db.query('DELETE FROM members WHERE id=ANY($1::uuid[])',[[member,other]]);
    await db.end();
  }
}
main().catch(e=>{console.error(e);process.exitCode=1});
