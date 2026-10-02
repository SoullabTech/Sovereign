import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const INDEX = path.join(REPO, 'jarvis-desktop', 'src', 'index.html');
const SHOTS = path.join(REPO, 'docs', 'design', 'contracts', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const status = {
  observed_at:'2026-10-01T12:30:00.000Z',
  repo_root:REPO,
  repo_root_mode:'dev',
  sessions:[],
  builder_os:{state:'AVAILABLE',detail:{active:0,limit:3,queued:0,sessions:[]}},
  route_a:{state:'AVAILABLE',detail:'12 deterministic capabilities registered'},
  local_worker:{state:'AVAILABLE',detail:'Ollama reachable'},
  claude_lane:{state:'AVAILABLE',detail:'Explicit frontier act only.'},
  frontier_reasoner:{state:'AVAILABLE',detail:'Explicit frontier act only.'},
  builder_mechanism:{state:'AVAILABLE',detail:"governed work-unit lane 'local-native' (read-only)"},
  governance_holds:[],
  desktop_runtime:{state:'AVAILABLE',detail:'browser witness'},
};

function snap(id, state, { attempts=[], verifiers=[], next_actions=[], objective=id }={}) {
  return {
    ok:true, mode:'CANONICAL_V2', work_unit_id:id,
    lifecycle:{state,transitions:[]},
    work_unit:{
      identity:{objective,task_shape:'EVIDENCE_SYNTHESIS'},
      scope:{evidence_selectors:[]},
      state:{lifecycle_state:state},
    },
    provenance:{attempts,verifier_results:verifiers},
    next_actions,
    routing:null,
  };
}
const canonicalList = {
  ok:true,status:'CANONICAL_V2_LIST',
  population:{total:3,returned:3,truncated:false,unreadable:0},
  items:[
    {work_unit_id:'needs-1',observed_mtime_ms:3,readable:true,snapshot:snap('needs-1','EVIDENCE_READY',{
      next_actions:[{action:'canonical-adjudicate',label:'Adjudicate evidence'}],
      objective:'Produce a deliberative Grokker candidate synthesis for: What have we established about memory?'
    })},
    {work_unit_id:'motion-1',observed_mtime_ms:2,readable:true,snapshot:snap('motion-1','DRAFT',{
      next_actions:[{action:'canonical-bound',label:'Bound scope'}],
      objective:'Produce a deliberative Grokker candidate synthesis for: What have we established about context release?'
    })},
    {work_unit_id:'watch-1',observed_mtime_ms:1,readable:true,snapshot:snap('watch-1','EXECUTING',{
      attempts:[{status:'failed'}],objective:'Watch this governed work'
    })},
  ],
};

async function installBridge(page) {
  await page.addInitScript(({status, canonicalList}) => {
    window.jarvis = new Proxy({
      getStatus: async () => status,
      getCapabilities: async () => ({capabilities:[]}),
      workUnitAction: async (req) => req?.action === 'canonical-list'
        ? canonicalList
        : ({ok:false,status:'REFUSED',reason:'R18 witness blocks mutation'}),
      submitTask: async () => ({status:'refused'}),
    }, {
      get(target, prop) {
        if (prop in target) return target[prop];
        return async () => ({ok:false,status:'REFUSED',reason:'R18 witness stub'});
      }
    });
  }, {status, canonicalList});
}

async function witness(viewport, filename) {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror', e => errors.push(String(e)));
  await installBridge(page);
  await page.goto(pathToFileURL(INDEX).href);
  await page.getByRole('button',{name:'Field Library'}).click();
  await page.locator('p.headline').filter({hasText:'What am I holding?'}).first().waitFor();
  await page.locator('.grokker-box h3').filter({hasText:'Unfinished threads · recovery candidates'}).first().waitFor();
  await page.locator('.grokker-box h3').filter({hasText:'Governed work'}).first().waitFor();
  assert.equal(errors.length,0,errors.join('\n'));
  assert.equal(await page.getByText('Needs Kelly',{exact:true}).count() > 0,true);
  assert.equal(await page.getByText('In motion',{exact:true}).count() > 0,true);
  assert.equal(await page.getByText('Watching',{exact:true}).count() > 0,true);
  assert.equal(await page.getByText('Reset view',{exact:true}).count(),1);

  const q=page.locator('#grokker-query');
  await q.fill('context release');
  await page.locator('#grokker-trace').click();
  await page.getByText(/strongest traces for/).waitFor();
  assert.equal(await page.locator('#grokker-packet').count(),1);

  const overflow = await page.evaluate(() => {
    const main = document.getElementById('main');
    const mainRect = main.getBoundingClientRect();
    const offenders = [...main.querySelectorAll('*')].map(el => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: el.className || '',
        id: el.id || '',
        text: (el.textContent || '').trim().slice(0,80),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      };
    }).filter(x => x.right > Math.round(mainRect.right) + 1 || x.left < Math.round(mainRect.left) - 1)
      .sort((a,b) => b.right-a.right).slice(0,12);
    return {
      width: window.innerWidth,
      body: document.body.scrollWidth,
      main: main.scrollWidth,
      mainClient: main.clientWidth,
      offenders,
      scrollOffenders:[...main.querySelectorAll('*')].map(el => ({
        tag:el.tagName, cls:el.className||'', id:el.id||'',
        text:(el.textContent||'').trim().slice(0,80),
        scroll:el.scrollWidth, client:el.clientWidth,
      })).filter(x => x.scroll > x.client + 1).sort((a,b)=>(b.scroll-b.client)-(a.scroll-a.client)).slice(0,12),
    };
  });
  assert.ok(overflow.body <= overflow.width + 2, JSON.stringify(overflow));
  assert.ok(overflow.main <= overflow.mainClient + 2, JSON.stringify(overflow));

  await page.screenshot({path:path.join(SHOTS,filename),fullPage:true});
  const result={
    viewport,
    recoveryText:await page.getByText(/unfinished threads surfaced for re-checking/).first().textContent(),
    overflow,
    screenshot:path.join(SHOTS,filename),
  };
  await browser.close();
  return result;
}

const wide=await witness({width:1440,height:1100},'kellys-world-field-library-r18-wide.png');
const narrow=await witness({width:390,height:844},'kellys-world-field-library-r18-narrow.png');
console.log(JSON.stringify({wide,narrow},null,2));
