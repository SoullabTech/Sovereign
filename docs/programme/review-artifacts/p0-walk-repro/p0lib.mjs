import { chromium } from 'playwright';
import fs from 'node:fs'; import { execSync } from 'node:child_process';
export const BASE='http://localhost:3111';
export const MS=fs.readFileSync('/home/user/walkstate/manuscript.id','utf8').trim();
export const sql=q=>execSync('psql -X -q -At -h 127.0.0.1 -p 54329 -U fictional -d walk_fictional -c "'+q.replace(/"/g,'\\"')+'"').toString().trim();
export const log=o=>console.log(JSON.stringify(o));
export async function start(vw={width:1440,height:980}){
  const b=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:vw}); const p=await ctx.newPage(); return {b,ctx,p};
}
export async function login(p,u='bwriter'){
  await p.goto(BASE+'/signin',{waitUntil:'domcontentloaded'});
  await p.fill('input[placeholder="Email or username"]',u); await p.fill('input[type="password"]','walkpass');
  await p.getByRole('button',{name:'Sign in',exact:true}).click(); await p.waitForTimeout(7000);
}
export const dev=(extra='')=>BASE+'/writers-studio?mode=develop&m='+MS+extra;
export async function snap(p,label,out='/home/user/probe/cand',shot=false){
  fs.mkdirSync(out,{recursive:true});
  const s=await p.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.opacity!=='0';};
    const q=new URLSearchParams(location.search), t=document.body.innerText;
    const sel=[...document.querySelectorAll('select')].find(s=>[...s.options].map(o=>o.text).join('|')==='Quiet|Balanced|All tools');
    const ch=document.querySelector('[data-develop-chapter-select="true"]');
    const art=document.querySelector('[data-develop-chapter],[data-lens-chapter]');
    const act=document.activeElement;
    return { stage:!!document.querySelector('[data-develop-stage="true"]'), r:q.get('r'), field:q.get('developField'),
      view:sel?sel.options[sel.selectedIndex].text:null, chapterSelect:ch?ch.options[ch.selectedIndex]?.text:null,
      chapterTextShown:/woke slowly/.test(t), chapterPane:!!art, chapterScroll:art?art.scrollTop:null,
      selection:(getSelection()||'').toString().slice(0,60),
      withThisObservation:/With this observation/.test(t),
      obsTextShown:/harbour appears here and returns|prose moves from a wide view|letter is mentioned before/.test(t),
      indexShown:!!document.querySelector('[data-develop-observation-index]'),
      readyOffer:!!document.querySelector('[data-develop-reading-offer]'),
      focus:act?(act.tagName+':'+(act.getAttribute('aria-label')||act.id||'').slice(0,30)):null,
      textareas:[...document.querySelectorAll('textarea')].filter(vis).map(x=>x.value.slice(0,40)),
      controls:[...document.querySelectorAll('button,[role=button],a[href],select,input:not([type=hidden]),summary,textarea')].filter(vis).length,
      overflowX:document.documentElement.scrollWidth>window.innerWidth+1 }; });
  if(shot) await p.screenshot({path:out+'/'+label+'.png',fullPage:true});
  log({step:label,...s}); return s;
}
export const counts=()=>({ readings:sql('SELECT count(*) FROM developmental_readings'), decisions:sql('SELECT count(*) FROM writer_decision_events'),
  scope:sql('SELECT count(*) FROM work_reading_scope_events'), plans:sql('SELECT count(*) FROM development_plans'),
  ms:sql("SELECT md5(string_agg(body,'|' ORDER BY position)) FROM manuscript_sections WHERE manuscript_id='"+MS+"'") });
