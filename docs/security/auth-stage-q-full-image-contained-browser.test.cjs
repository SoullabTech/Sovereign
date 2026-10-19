/**
 * Rendered Linux Playwright WebKit running INSIDE Caddy's private Docker
 * network namespace. No published host ports, no real member or SaaS traffic.
 * Docker itself blocks egress through --internal; browser additionally aborts
 * any HTTP(S) request whose origin isn't exactly https://localhost.
 *
 * Source-attested full image loaded separately. This file only drives WebKit
 * and checks real, fictional PostgreSQL session rows over the internal bridge.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const {webkit}=require('playwright');
const {Client}=require('pg');

const ORIGIN='https://localhost';
const PASSWORD='stageq-fictional-rendered-webkit-credential';
const USERNAME='stageq_full_fixture';
const USER_ID='11111111-1111-4111-8111-111111111111';
const NAME='stageq_full_image_fictional';
const USER='stageq_full_image_fixture';
let db=null,browser=null;

const pgHost=process.env.STAGE_Q_PG_CONTAINER_IP||'';
if(process.env.STAGE_Q_BROWSER_FIXTURE!=='stageq-contained-webkit-fictional-only'||
 process.env.GITHUB_ACTIONS!=='true'||
 process.env.PGDATABASE!==NAME||
 process.env.PGUSER!==USER||
 process.env.PGPORT!=='5432'||
 !/^(172\.(1[6-9]|2[0-9]|3[01])\.|10\.|192\.168\.)/.test(pgHost)||
 process.env.ATTESTED_IMAGE_ID!=='sha256:ee8ea174a90dc7465921a3cd6db801321cfe82a0f35633d94ed8371eba63b6e9'){
 throw Error('Refusing non-fixture browser namespace or SQL credentials');
}
async function pageWithGuard(){
 const context=await browser.newContext({ignoreHTTPSErrors:true,serviceWorkers:'block'});
 const blocked=[];
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin===ORIGIN)return route.continue();
  blocked.push(url.hostname+url.pathname);
  return route.abort('blockedbyclient');
 });
 const page=await context.newPage();
 await page.goto(ORIGIN+'/signin',{waitUntil:'domcontentloaded',timeout:35000});
 await page.getByPlaceholder('Email or username').waitFor({state:'visible',timeout:45000});
 await page.getByPlaceholder('Password').waitFor({state:'visible',timeout:45000});
 return{context,page,blocked};
}
async function nSessions(where){
 const r=await db.query('SELECT count(*)::int AS n FROM auth_sessions WHERE '+where);
 return r.rows[0].n;
}
test.before(async()=>{
 db=new Client({host:pgHost,port:5432,database:NAME,user:USER,
  password:process.env.PGPASSWORD,connectionTimeoutMillis:6000});
 await db.connect();
 const r=await db.query('SELECT current_database() AS database,current_user AS usr');
 assert.equal(r.rows[0].database,NAME);
 assert.equal(r.rows[0].usr,USER);
 browser=await webkit.launch({headless:true});
});
test.after(async()=>{
 if(browser)await browser.close();
 if(db)await db.end();
});

test('full immutable app actually renders sign-in with a safe same-origin API target',async()=>{
 const {context,page,blocked}=await pageWithGuard();
 try{
  const base=await page.evaluate(()=>window.__apiBase);
  assert.equal(base,'','Browser API must remain same-origin under localhost');
  assert.equal(await page.locator('input[type=password]').count(),1);
  assert.equal(await page.getByRole('button',{name:'Sign in',exact:true}).count(),1);
  assert.equal(await nSessions('revoked = FALSE AND expires_at > NOW()'),0);
  assert.equal(blocked.some(p=>p.startsWith('soullab.life/api/')),false);
 }finally{await context.close()}
});

test('rendered form refuses incorrect fictional bcrypt password without a SQL session',async()=>{
 const {context,page,blocked}=await pageWithGuard();
 try{
  await page.getByPlaceholder('Email or username').fill(USERNAME);
  await page.getByPlaceholder('Password').fill('incorrect-fictional-password');
  const responsePromise=page.waitForResponse(r=>
   r.url()===ORIGIN+'/api/members/signin'&&r.request().method()==='POST',
   {timeout:30000});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const response=await responsePromise;
  assert.equal(response.status(),401);
  await page.getByText('Invalid username or password').waitFor({state:'visible',timeout:20000});
  assert.equal(await nSessions('revoked = FALSE AND expires_at > NOW()'),0);
  assert.equal((await context.cookies(ORIGIN)).some(c=>c.name==='maia_session'),false);
  assert.equal(blocked.some(p=>p.startsWith('soullab.life/api/')),false);
 }finally{await context.close()}
});

test('rendered successful login issues HttpOnly cookie; logout revokes real SQL and denies replay',async()=>{
 const {context,page,blocked}=await pageWithGuard();
 try{
  await page.getByPlaceholder('Email or username').fill(USERNAME);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  const responsePromise=page.waitForResponse(r=>
   r.url()===ORIGIN+'/api/members/signin'&&r.request().method()==='POST',
   {timeout:35000});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  const response=await responsePromise;
  assert.equal(response.status(),200);
  const data=await response.json();
  assert.equal(data.success,true);
  assert.equal(data.memberId,USER_ID);
  assert.match(data.session?.token,/^[0-9a-f]{64}$/);
  await page.waitForFunction(()=>localStorage.getItem('maia_session_token')!==null,
   null,{timeout:25000});
  const session=(await context.cookies(ORIGIN)).find(c=>c.name==='maia_session');
  assert.ok(session,'Actual WebKit must store the session');
  assert.equal(session.secure,true);
  assert.equal(session.httpOnly,true);
  assert.equal(await nSessions('revoked = FALSE AND expires_at > NOW()'),1);
  const out=await context.request.post(ORIGIN+'/api/members/signout',{
   headers:{Origin:ORIGIN,'Sec-Fetch-Site':'same-origin'},
   failOnStatusCode:false,timeout:12000,
  });
  assert.equal(out.status(),200);
  assert.equal((await out.json()).serverSessionRevoked,true);
  assert.equal((await context.cookies(ORIGIN)).some(c=>c.name==='maia_session'),false);
  assert.equal(await nSessions('revoked = TRUE'),1);
  const replay=await context.request.get(ORIGIN+'/api/auth/whoami',{
   headers:{'x-session-token':data.session.token},
   failOnStatusCode:false,timeout:12000,
  });
  assert.equal(replay.status(),200);
  assert.equal((await replay.json()).authed,false);
  assert.equal(blocked.some(p=>p.startsWith('soullab.life/api/')),false);
 }finally{await context.close()}
});