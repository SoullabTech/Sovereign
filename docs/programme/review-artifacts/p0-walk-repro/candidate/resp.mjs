import fs from 'node:fs';
import {start,login,dev,sql,log} from './p0lib.mjs';
const OUT='/home/user/probe/resp'; fs.mkdirSync(OUT,{recursive:true});
const RA=sql('SELECT id FROM developmental_readings ORDER BY frozen_at LIMIT 1');
const {b,ctx,p}=await start(); await login(p);
const probe=()=>p.evaluate(()=>{
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden';};
  const inView=e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;};
  const offer=document.querySelector('[data-develop-reading-offer]'); const pane=document.querySelector('[data-develop-lens-chapter]')||document.querySelector('[data-develop-stage] [data-develop-chapter]');
  const idx=document.querySelector('[data-develop-observation-index]');
  return { overflowX:document.documentElement.scrollWidth>innerWidth+1, stage:!!document.querySelector('[data-develop-stage="true"]'),
    offer:!!offer, offerVisible:!!offer&&vis(offer), offerInFirstScreen:!!offer&&inView(offer),
    chapterVisible:!!pane&&vis(pane), chapterInFirstScreen:!!pane&&inView(pane), index:!!idx,
    ariaLive:document.querySelectorAll('[data-develop-reading-status][aria-live="polite"]').length };
});
const tabsTo=async(sel,max=120)=>{ await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();scrollTo(0,0);});
  for(let i=1;i<=max;i++){ await p.keyboard.press('Tab'); if(await p.evaluate(s=>document.activeElement?.matches(s),sel)) return i; } return null; };
for (const [w,h] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
  await p.setViewportSize({width:w,height:h});
  await p.goto(dev(),{waitUntil:'domcontentloaded'}); await p.waitForTimeout(9000);
  const st=await probe(); const tabStage=await tabsTo('[data-develop-explore-observations]'); if(w===390||w===1440) await p.screenshot({path:`${OUT}/stage-${w}.png`,fullPage:true});
  await p.goto(dev('&developField=development&r='+RA),{waitUntil:'domcontentloaded'}); await p.waitForTimeout(9000);
  const ix=await probe(); if(w===390||w===1024) await p.screenshot({path:`${OUT}/index-${w}.png`,fullPage:true});
  log({vp:`${w}x${h}`, stage:{...st,tabsToExplore:tabStage}, lensIndex:ix});
}
await b.close();
