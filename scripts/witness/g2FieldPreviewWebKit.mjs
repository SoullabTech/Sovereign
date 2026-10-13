/** Static WebKit contract: fictional output only, no app or member session. */
import {webkit} from 'playwright';
const browser=await webkit.launch({headless:true});
try {
 for(const [type,width,height] of [['mobile',390,844],['desktop',1365,900]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.route('**/*',route=>route.request().url().startsWith('file:')
      ?route.continue():route.abort('blockedbyclient'));
  await page.goto('file:///tmp/ganesha-g2d-preview.html',{waitUntil:'load'});
  const state=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth,viewport:innerWidth,
    heading:document.querySelector('h1')?.textContent||'',
    listItems:document.querySelectorAll('li').length,
    interactive:document.querySelectorAll('button,form,[role=button]').length,
    sections:document.querySelectorAll('main section').length,
    fiction:document.body.textContent?.includes('fictional friend')||false,
  }));
  if(state.width>state.viewport+2)throw Error(type+' horizontal overflow '+JSON.stringify(state));
  if(state.heading!=='Your living field'||state.interactive!==0||state.sections<5||!state.fiction)
    throw Error(type+' invalid presentation '+JSON.stringify(state));
  const contrast=await page.evaluate(()=>{
    const main=document.querySelector('main');
    const note=[...document.querySelectorAll('p')].find(p=>
      p.textContent?.includes('A walk by the river helped me notice'));
    if(!main||!note)throw new Error('Fixture note contrast sample unavailable');
    const rgb=s=>s.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(v=>{
      const c=v/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
    });
    const luminance=v=>v[0]*0.2126+v[1]*0.7152+v[2]*0.0722;
    const fg=luminance(rgb(getComputedStyle(note).color));
    const bg=luminance(rgb(getComputedStyle(main).backgroundColor));
    return {ratio:(Math.max(fg,bg)+0.05)/(Math.min(fg,bg)+0.05)};
  });
  if(contrast.ratio<4.5)throw Error(type+' insufficient note contrast '+JSON.stringify(contrast));
  await page.screenshot({path:'/tmp/ganesha-g2d-'+type+'.png',fullPage:true});
  console.log('PASS G2D '+type+' static fictional WebKit',JSON.stringify({...state,noteContrast:contrast.ratio.toFixed(2)}));
  await page.close();
 }
 console.log('PASS G2D synthetic WebKit visual contract; no live/authenticated members');
} finally { await browser.close(); }
