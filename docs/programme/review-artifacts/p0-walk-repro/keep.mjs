import {start,login,log,BASE,MS} from './p0lib.mjs';
const {b,p}=await start(); await login(p);
await p.goto(BASE+'/writers-studio/canvas?m='+MS,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(20000);
const k=p.locator('button:has-text("Keep a version")'); log({manuscript:MS, keepButtons:await k.count()});
if(await k.count()){ await k.first().click(); await p.waitForTimeout(9000); }
log({status:(await p.locator('body').innerText()).match(/version kept|moved somewhere|still saving|could not be kept/i)?.[0]??'no status text'});
await b.close();
