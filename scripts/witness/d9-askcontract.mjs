import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/ch4-working.html'); await p.waitForTimeout(300);
const on=()=>p.locator('#frameAsk').isVisible();
const sel=async n=>{await p.evaluate(i=>{const a=document.querySelector('#s'+i+' .body');
  const r=document.createRange();r.setStart(a.firstChild,0);r.setEnd(a.firstChild,120);
  const s=getSelection();s.removeAllRanges();s.addRange(r);document.dispatchEvent(new Event('selectionchange'));},n);
  await p.waitForTimeout(200);};
const ok=(n,v)=>console.log(`${v?'PASS':'FAIL'}  ${n}`);
await sel(0);                       ok('1  select a passage → appears', await on());
await p.click('#q');                ok('2  click composer, no submit → remains', await on());
await p.click('#clearFocus');       ok('3  release frame → disappears', !(await on()));
await sel(1);                       ok('4  select another passage → appears again', await on());
await p.locator('#s3 h2').scrollIntoViewIfNeeded(); await p.locator('#s3 h2').click(); await p.waitForTimeout(220);
                                    ok('5  click a heading → appears', await on());
// 6 drag: no churn during, armed on settle
const hb=await p.locator('#frame .h.bot').boundingBox();
await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2); await p.mouse.down();
let churn=true;
for(const dy of [60,160,260]){ await p.mouse.move(hb.x+hb.width/2,hb.y+dy,{steps:4});
  if(await on()===false) churn=false; }
await p.mouse.up(); await p.waitForTimeout(220);
ok('6  dragend → armed for the new aperture', await on());
await p.locator('#ask').click(); await p.waitForTimeout(220);
ok('7  invoke → disappears and MAIA engages',
   !(await on()) && /first read of|Starting from/.test(await p.locator('#say').innerText()));
await sel(5); await p.click('#q'); await p.fill('#q','does this hold?'); await p.press('#q','Enter'); await p.waitForTimeout(200);
ok('8  submit instead → consumed, conversation begins', !(await on()));
await sel(6);                       ok('9  change focus after → reappears', await on());
const src=await p.content();
ok('   no timers / no hover dependency', !/setTimeout|:hover[^{]*\{[^}]*display/.test(src));
await b.close();
