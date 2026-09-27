import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base=process.env.BECOMING_GUIDE_BASE ?? 'http://localhost:3798';
const output='.becoming-guide-preview';
await mkdir(output+'/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[], requests=[], errors=[];
const pass=(id,detail)=>{results.push({id,status:'PASS',detail});console.log('PASS',id);};
let failure;

try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'America/New_York'});
  const page=await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror',e=>errors.push(e.message));
  let count=0;
  await page.route('**/api/maia-guide',async route=>{
    const payload=JSON.parse(route.request().postData()||'{}');
    requests.push(payload);
    count+=1;
    await new Promise(resolve=>setTimeout(resolve,120));
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({message:`Synthetic live guide ${count}: one invitation only.`})});
  });
  await page.goto(base+'/becoming');
  await page.getByRole('button',{name:'Begin the journey',exact:true}).click();
  await page.getByRole('button',{name:/Let something emerge/}).click();
  await page.getByRole('button',{name:'Journey with MAIA',exact:true}).click();
  await page.getByRole('status').filter({hasText:'MAIA is attending to this moment'}).waitFor();
  await page.getByText('Synthetic live guide 1: one invitation only.',{exact:true}).waitFor();
  assert.equal(requests.length,1);
  assert.match(requests[0].message,/CURRENT MOVEMENT: ARRIVE/);
  assert.match(requests[0].message,/Do not retrieve, mention, or infer from prior conversations, memories, profiles/);
  assert.deepEqual(requests[0].conversationHistory,[]);
  pass('G01','Live MAIA is opt-in and receives a current-journey-only guide envelope.');

  await page.getByLabel('What feels most present right now?').fill('I feel a creative future beginning to take shape.');
  await page.getByRole('button',{name:'Let some time pass →',exact:true}).click();
  await page.getByText('Synthetic live guide 2: one invitation only.',{exact:true}).waitFor();
  assert.equal(await page.getByText('Synthetic live guide 1: one invitation only.',{exact:true}).count(),0);
  assert.match(requests[1].message,/CURRENT MOVEMENT: OPEN/);
  assert.match(requests[1].message,/I feel a creative future beginning to take shape/);
  pass('G02','Movement changes produce one new invitation and replace, rather than stack, the prior guide prompt.');
  await page.getByLabel('Give this possibility a few words').fill('A living creative practice');
  await page.getByRole('button',{name:'Enter this possibility →',exact:true}).click();
  await page.getByText('Synthetic live guide 3: one invitation only.',{exact:true}).waitFor();
  await page.getByLabel('What do you notice first?').fill('A bright studio, open windows, people arriving to learn.');

  const doors=page.locator('.elemental-entry-choices[aria-label="Choose an elemental doorway"]');
  assert.deepEqual(await doors.getByRole('button').allTextContents(),['Earth','Water','Air','Fire','Aether']);
  await doors.getByRole('button',{name:'Fire',exact:true}).click();
  await page.getByText('Synthetic live guide 4: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[3].message,/ACTIVE ELEMENT: FIRE/);
  assert.match(requests[3].message,/A bright studio, open windows, people arriving to learn/);
  pass('G03','The elemental field is non-linear: Fire can be entered first and MAIA follows the chosen element.');

  await page.getByLabel('What is alive in you here?').fill('Teaching and making feel effortless and devoted.');
  await page.getByRole('button',{name:'Ask MAIA to deepen',exact:true}).click();
  await page.getByText('Synthetic live guide 5: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[4].message,/Teaching and making feel effortless and devoted/);
  assert.match(requests[4].message,/YOUR PREVIOUS INVITATION IN THIS JOURNEY/);
  pass('G04','Deepening uses the member’s newest words and the prior invitation without importing ambient history.');
  const trace=page.locator('.elemental-trace[aria-label="Elemental immersion"]');
  await trace.getByRole('button',{name:'Earth',exact:true}).click();
  await page.getByText('Synthetic live guide 6: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[5].message,/ACTIVE ELEMENT: EARTH/);
  await page.getByLabel('What is physically here?').fill('Warm floorboards, coffee, sunlight, a relaxed body.');

  await trace.getByRole('button',{name:'Aether',exact:true}).click();
  await page.getByText('Synthetic live guide 7: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[6].message,/ACTIVE ELEMENT: AETHER/);
  assert.match(requests[6].message,/Aether gathers the whole field/);
  await page.getByLabel('When you stop explaining it, what seems quietly true here?').fill('The work and the life are no longer fighting each other.');
  await page.screenshot({path:output+'/screenshots/live-guide-aether.png',fullPage:true});
  pass('G05','Element changes remain freely selectable and Aether is governed as gathering, not revelation.');

  await page.getByRole('button',{name:'Reflect on what this revealed →',exact:true}).click();
  await page.getByText('Synthetic live guide 8: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[7].message,/CURRENT MOVEMENT: DISCERN/);
  await page.getByLabel('What stayed with you most?').fill('The sense of integration.');
  await page.getByRole('button',{name:'Return to today →',exact:true}).click();
  await page.getByText('Synthetic live guide 9: one invitation only.',{exact:true}).waitFor();
  assert.match(requests[8].message,/CURRENT MOVEMENT: RETURN/);
  await page.getByLabel('What, if anything, do you want to bring back with you?').fill('Trust the integration.');
  const beforeReturn=requests.length;
  await page.getByRole('button',{name:'Return to now',exact:true}).click();
  await page.getByText('The guided encounter has completed. Post-Return MAIA is available inside the journey itself.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Talk with MAIA about this journey',exact:true}).waitFor();
  await page.waitForTimeout(250);
  assert.equal(requests.length,beforeReturn);
  pass('G06','Explicit Return ends the ephemeral guide phase and exposes the separate post-Return MAIA relationship.');

  assert.equal(errors.length,0,errors.join('\n'));
} catch (error) {
  failure=error;
  console.error('MAIA_GUIDE_BROWSER_WITNESS_FAILED',error.message);
} finally {
  await browser.close();
  await writeFile(output+'/browser-witness.json',JSON.stringify({recordedAt:new Date().toISOString(),results,requests,failure:failure?String(failure.message):null,errors},null,2));
}
if(failure)process.exitCode=1;
