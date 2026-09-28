import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { config as loadDotEnv } from 'dotenv';
import pg from 'pg';

loadDotEnv({ path: '.env.local', quiet: true });
loadDotEnv({ path: '.env.development.local', quiet: true });
loadDotEnv({ path: '.env', quiet: true });

const base = process.env.BECOMING_HOUSE_BASE ?? 'http://localhost:3801';
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL_NOT_LOADED');
const parsed = new URL(dbUrl);
if (!['localhost','127.0.0.1','::1'].includes(parsed.hostname)) {
  throw new Error('REFUSED_NON_LOOPBACK_DB:' + parsed.hostname);
}

const memberId = randomUUID();
const suffix = memberId.slice(0,8);
const token = randomBytes(32).toString('hex');
const client = new pg.Client({ connectionString: dbUrl });
const results = [];
const errors = [];
const maia = { guide: [], continuity: [], temporal: [] };
const pass = (id, detail) => { results.push({ id, status:'PASS', detail }); console.log('PASS', id, detail); };
async function seed() {
  await client.connect();
  await client.query(
    "INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,$4,$5)",
    [memberId, 'HOUSE-BECOMING-' + suffix, 'house-becoming-' + suffix, 'x'.repeat(64), 'Becoming Witness'],
  );
  await client.query(
    "INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '1 hour')",
    [memberId, token],
  );
}

async function cleanup() {
  try { await client.query('DELETE FROM house_member_preferences WHERE member_id=$1',[memberId]); } catch {}
  try { await client.query('DELETE FROM auth_sessions WHERE member_id=$1',[memberId]); } catch {}
  try { await client.query('DELETE FROM members WHERE id=$1',[memberId]); } catch {}
  try { await client.end(); } catch {}
}

const browser = await chromium.launch({ headless:true });
let failure;
try {
  await seed();
  const context = await browser.newContext({ viewport:{width:1440,height:1000}, timezoneId:'America/New_York', reducedMotion:'reduce' });
  await context.addCookies([{ name:'maia_session', value:token, url:base }]);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push(error.message));

  await page.route('**/api/becoming/guide', async route => {
    const req = route.request();
    const body = JSON.parse(req.postData() || '{}');
    maia.guide.push({ body, headers:req.headers() });
    await new Promise(r => setTimeout(r,80));
    await route.fulfill({
      status:200, contentType:'application/json',
      body:JSON.stringify({ message:'Synthetic guide: stay with what is most alive in this element.' }),
    });
  });
  await page.route('**/api/becoming/conversation', async route => {
    const req = route.request();
    const body = JSON.parse(req.postData() || '{}');
    maia.continuity.push({ body, headers:req.headers() });
    await route.fulfill({
      status:200, contentType:'application/json',
      body:JSON.stringify({ message:'Synthetic synthesis: the future scene keeps vitality and spaciousness together. What feels most true about that?' }),
    });
  });
  await page.route('**/api/becoming/temporal', async route => {
    const req = route.request();
    const body = JSON.parse(req.postData() || '{}');
    maia.temporal.push({ body, headers:req.headers() });
    await route.fulfill({
      status:200, contentType:'application/json',
      body:JSON.stringify({ message:'Synthetic Across Time: the selected journey and present note may share a concern with spacious contribution. Does that relation fit?' }),
    });
  });

  await page.goto(base + '/house');
  await page.getByRole('heading',{name:/Welcome home/}).waitFor();
  const becomingCard = page.locator('article').filter({ has:page.getByRole('heading',{name:'Becoming',exact:true}) });
  await becomingCard.waitFor();
  const becomingOpen = becomingCard.getByRole('link',{name:'Open',exact:true});
  await becomingOpen.waitFor();
  pass('H01','Becoming is discoverable in the authenticated House directory.');

  await becomingCard.getByRole('button',{name:'Add to Here · Now',exact:true}).click();
  const arrange = page.getByRole('dialog',{name:'What would you like to keep close?'});
  await arrange.waitFor();
  if (!(await arrange.getByLabel('Here Now: Becoming').isChecked())) throw new Error('BECOMING_SHORTCUT_DRAFT_NOT_SELECTED');
  await arrange.getByRole('button',{name:'Save House choices',exact:true}).click();
  await becomingCard.getByRole('button',{name:'In Here · Now',exact:true}).waitFor();
  await page.reload();
  await page.getByRole('heading',{name:/Welcome home/}).waitFor();
  await page.getByRole('link',{name:'Becoming',exact:true}).waitFor();
  pass('H02','Local preference schema accepts Becoming in Here · Now and survives reload.');
  const cardAfterReload = page.locator('article').filter({ has:page.getByRole('heading',{name:'Becoming',exact:true}) });
  await cardAfterReload.getByRole('link',{name:'Open',exact:true}).click();
  await page.waitForURL('**/becoming**');
  await page.getByRole('heading',{name:'Becoming',level:1}).waitFor();
  if (await page.getByLabel('Open your conversation with MAIA').count()) throw new Error('AMBIENT_MAIA_HANDLE_VISIBLE');
  pass('H03','House opens /becoming in-app and the ambient House MAIA handle is suppressed.');

  await page.getByRole('button',{name:'Begin the journey',exact:true}).click();
  await page.getByRole('button',{name:/Let something emerge/}).click();
  await page.getByLabel('What feels most present right now?').fill('Synthetic House witness: I want contribution with spaciousness.');
  await page.getByRole('button',{name:'Let some time pass →',exact:true}).click();
  await page.getByLabel('Give this possibility a few words').fill('Spacious contribution');
  await page.getByRole('button',{name:'Enter this possibility →',exact:true}).click();
  await page.getByLabel('What do you notice first?').fill('A sunlit studio with open windows and enough room to think.');
  const doors = page.locator('.elemental-entry-choices[aria-label="Choose an elemental doorway"]');
  await doors.getByRole('button',{name:'Fire',exact:true}).click();
  await page.getByLabel('What is alive in you here?').fill('Teaching, writing, and making from desire rather than urgency.');
  await page.getByRole('button',{name:'Journey with MAIA',exact:true}).click();
  await page.getByText(/Synthetic guide:/).waitFor();
  if (maia.guide.length !== 1) throw new Error('GUIDE_CALL_COUNT');
  const guideReq = maia.guide[0];
  if (guideReq.headers['x-becoming-guide'] !== '1') throw new Error('GUIDE_HEADER_MISSING');
  if (guideReq.body.conversationHistory.length !== 0) throw new Error('GUIDE_HISTORY_NOT_EMPTY');
  if (!/ACTIVE ELEMENT: FIRE/.test(guideReq.body.message)) throw new Error('GUIDE_FIRE_CONTEXT_MISSING');
  if (!/Do not retrieve, mention, or infer from prior conversations/.test(guideReq.body.message)) throw new Error('GUIDE_MEMORY_LAW_MISSING');
  pass('H04','In-journey MAIA receives only current journey/element context through its explicit guide act.');

  const trace = page.locator('.elemental-trace[aria-label="Elemental immersion"]');
  await page.waitForTimeout(250);
  await trace.getByRole('button',{name:'Aether',exact:true}).click();
  await page.getByLabel('When you stop explaining it, what seems quietly true here?').fill('The work and the life do not have to fight each other.');
  await page.getByRole('button',{name:'Reflect on what this revealed →',exact:true}).click();
  await page.getByLabel('What stayed with you most?').fill('Vitality without urgency.');
  await page.getByLabel('What feels meaningful about it?').fill('I can contribute without making availability the proof of care.');
  await page.getByRole('button',{name:'Return to today →',exact:true}).click();
  await page.getByLabel('What, if anything, do you want to bring back with you?').fill('Make room before saying yes.');
  await page.getByLabel('Name this journey').fill('Spacious contribution');
  await page.getByRole('button',{name:'Return to now',exact:true}).click();
  await page.getByRole('button',{name:'Talk with MAIA about this journey',exact:true}).click();
  await page.getByText(/Synthetic synthesis:/).waitFor();
  if (maia.continuity.length !== 1) throw new Error('CONTINUITY_CALL_COUNT');
  const continuityReq = maia.continuity[0];
  if (continuityReq.headers['x-becoming-explicit-handoff'] !== '1') throw new Error('CONTINUITY_HEADER_MISSING');
  if (!/Please do not ask me to repeat/.test(continuityReq.body.message)) throw new Error('WHOLE_JOURNEY_HANDOFF_MISSING');
  if (!/Teaching, writing, and making/.test(continuityReq.body.message)) throw new Error('ELEMENTAL_HANDOFF_MISSING');
  if (new URL(page.url()).pathname !== '/becoming') throw new Error('POST_RETURN_LEFT_BECOMING');
  pass('H05','Post-Return MAIA receives the whole journey and conversation remains inside Becoming.');

  await page.getByRole('button',{name:'Keep this journey',exact:true}).click();
  await page.getByRole('status').filter({hasText:'revision 1'}).waitFor();
  await page.getByRole('button',{name:'Across time',exact:true}).click();
  await page.getByRole('heading',{name:'What does this journey touch?'}).waitFor();
  const source = page.locator('.source-check').filter({hasText:'Spacious contribution'});
  await source.locator('input').check();
  await page.getByLabel('What feels true in your life today?').fill('I want to protect room around meaningful work.');
  await page.getByLabel('A connection I notice').fill('Space and contribution may support one another.');
  await page.getByRole('button',{name:'Ask MAIA what it notices',exact:true}).click();
  await page.getByText(/Synthetic Across Time:/).waitFor();
  if (maia.temporal.length !== 1) throw new Error('TEMPORAL_CALL_COUNT');
  const temporalReq = maia.temporal[0];
  if (temporalReq.headers['x-becoming-temporal'] !== '1') throw new Error('TEMPORAL_HEADER_MISSING');
  if (!/one relational gestalt without collapsing the facets/.test(temporalReq.body.message)) throw new Error('CRYSTAL_CENTER_LAW_MISSING');
  if (!/preserve every item’s source and epistemic distinction/.test(temporalReq.body.message)) throw new Error('PROVENANCE_LAW_MISSING');
  pass('H06','Across Time uses the dedicated selected-context MAIA lane and carries the differentiated-gestalt law.');

  await page.screenshot({path:'.becoming-house-evidence-across-time.png',fullPage:true});
  await page.getByRole('link',{name:/SOULLAB/}).first().click();
  const temporalGuard = page.getByRole('dialog',{name:'Leave these Across Time notes?'});
  await temporalGuard.waitFor();
  await temporalGuard.getByRole('button',{name:'Discard notes and leave',exact:true}).click();
  await page.waitForURL('**/house');
  await page.getByRole('heading',{name:/Welcome home/}).waitFor();
  pass('H07','Across Time protects unsaved notes, then returns cleanly to the House after explicit discard.');

  if (errors.length) throw new Error('PAGE_ERRORS:'+errors.join(' | '));
  await context.close();
} catch (error) {
  failure = error;
  console.error('BECOMING_HOUSE_WITNESS_FAILED', error instanceof Error ? error.message : String(error));
} finally {
  await browser.close();
  await cleanup();
  await writeFile('.becoming-house-browser-witness.json', JSON.stringify({
    observedAt:new Date().toISOString(),
    base,
    syntheticMember:true,
    providerCalls:0,
    results,
    errors,
    calls:{guide:maia.guide.length,continuity:maia.continuity.length,temporal:maia.temporal.length},
    failure:failure instanceof Error ? failure.message : failure ? String(failure) : null,
  },null,2)+'\n');
}
if (failure) process.exitCode = 1;
