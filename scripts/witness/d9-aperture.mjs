/* F-ORBIT / APERTURE
   OPENING AN ORBIT MAY NOT: reflow the writer to a different place in the Work ·
   cover readable manuscript text · change scroll position · make the Focus inaccessible.
   IT MAY: reduce the field around the Work · gently recenter it in the remaining aperture. */
import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
let pass=0,fail=0;
const ok=(n,c,x='')=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${n}${x?'   '+x:''}`)};

/* does any manuscript text lie underneath an open orbit? measured on real text rects. */
const overlap=p=>p.evaluate(()=>{
  const worst=[];
  for(const id of ['structure','maiaPanel']){
    const el=document.getElementById(id); if(el.hidden)continue;
    const pr=el.getBoundingClientRect();
    for(const body of document.querySelectorAll('.sec .body')){
      const r=document.createRange(); r.selectNodeContents(body);
      for(const t of r.getClientRects()){
        if(t.bottom<0||t.top>innerHeight||!t.width)continue;      // not on screen
        const ox=Math.min(t.right,pr.right)-Math.max(t.left,pr.left);
        const oy=Math.min(t.bottom,pr.bottom)-Math.max(t.top,pr.top);
        if(ox>0.5&&oy>0.5)worst.push({id,px:Math.round(ox)});
      }
    }
  }
  return worst;
});
const place=p=>p.evaluate(()=>{
  const s=document.querySelector('#s3 .body'); const r=s.getBoundingClientRect();
  return {scrollY:Math.round(scrollY),top:Math.round(r.top),w:Math.round(r.width),
          text:s.textContent.slice(0,60)};
});

for(const vp of [{width:1440,height:900},{width:1180,height:820}]){
  const p=await b.newPage({viewport:vp});
  await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
  console.log(`\n=== viewport ${vp.width}x${vp.height} ===`);
  await p.evaluate(()=>document.getElementById('s3').scrollIntoView({block:'center'}));
  await p.waitForTimeout(150);
  const before=await place(p);

  await p.click('#bMaia'); await p.waitForTimeout(250);
  ok('MAIA open — no manuscript text under the orbit', (await overlap(p)).length===0,
     JSON.stringify((await overlap(p)).slice(0,1)));
  let now=await place(p);
  ok('MAIA open — same words still on screen', now.text===before.text);
  ok('MAIA open — same place in the Work (±2px)', Math.abs(now.top-before.top)<=2,
     `Δtop=${now.top-before.top}`);

  await p.click('#bStructure'); await p.waitForTimeout(250);
  ok('Structure + MAIA — no manuscript text under either', (await overlap(p)).length===0,
     JSON.stringify((await overlap(p)).slice(0,1)));
  now=await place(p);
  ok('Structure + MAIA — same place in the Work (±2px)', Math.abs(now.top-before.top)<=2,
     `Δtop=${now.top-before.top}`);

  await p.click('#bStructure'); await p.click('#bMaia'); await p.waitForTimeout(250);
  now=await place(p);
  ok('closing both — the Work is exactly as it was', now.top===before.top&&now.w===before.w&&now.scrollY===before.scrollY,
     `Δtop=${now.top-before.top} Δw=${now.w-before.w} ΔY=${now.scrollY-before.scrollY}`);
  await p.close();
}

/* the Focus must stay reachable and visible while an orbit is open */
{
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
  await p.evaluate(()=>{const a=document.querySelector('#s3 .body');
    const r=document.createRange();r.setStart(a,0);r.setEnd(a,a.childNodes.length);
    const s=getSelection();s.removeAllRanges();s.addRange(r);
    document.dispatchEvent(new Event('selectionchange'));
    document.getElementById('s3').scrollIntoView({block:'center'});});
  await p.waitForTimeout(250);
  const fb=await p.evaluate(()=>document.getElementById('frame').getBoundingClientRect().top);
  await p.click('#bMaia'); await p.waitForTimeout(300);
  console.log('\n=== focus survives the aperture ===');
  ok('no manuscript text under MAIA while focused', (await overlap(p)).length===0);
  ok('the focus frame is still drawn', await p.evaluate(()=>!document.getElementById('frame').hidden));
  const fa=await p.evaluate(()=>document.getElementById('frame').getBoundingClientRect().top);
  ok('the focus stays on the same line of the viewport (±2px)', Math.abs(fa-fb)<=2, `Δ=${Math.round(fa-fb)}`);
  ok('the focus frame is not underneath the orbit', await p.evaluate(()=>{
    const f=document.getElementById('frame').getBoundingClientRect();
    const m=document.getElementById('maiaPanel').getBoundingClientRect();
    return f.right<=m.left+0.5;}));
  ok('the focus strip stops where the Work stops', await p.evaluate(()=>{
    const f=document.getElementById('focusbar').getBoundingClientRect();
    const m=document.getElementById('maiaPanel').getBoundingClientRect();
    return f.right<=m.left+0.5;}));
  await p.close();
}
await b.close();
console.log(`\naperture  ${pass} passed · ${fail} failed`);
process.exit(fail?1:0);
