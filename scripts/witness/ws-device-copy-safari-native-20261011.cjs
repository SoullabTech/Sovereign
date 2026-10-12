/** WRITER-DEVICE-COPY-01 · Native Safari 26.5 desktop synthetic author-copy witness.
 * Runs against a localhost-only test page; no DB, Soullab API, or member data.
 * Requires an already-started safaridriver on localhost:5656.
 * The only file it can remove is the exact synthetic download it verified.
 */
const { build } = require('esbuild');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const assert=require('node:assert/strict');

const driver='http://127.0.0.1:5656';
const site='http://127.0.0.1:5657';
const title='Soullab Safari Synthetic Copy 20261011';
const cases=[
  {format:'txt', button:0, expected:'Opening\n\nOriginal first passage.\n\nChapter Two\n\nUnsaved new ending.\nLast line.'},
  {format:'md', button:1, expected:'# Opening\n\nOriginal first passage.\n\n# Chapter Two\n\nUnsaved new ending.\nLast line.'},
  {format:'json', button:2, expected:null},
];
const pause=ms=>new Promise(r=>setTimeout(r,ms));

async function request(method,route,body,timeout=10000){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const r=await fetch(driver+route,{method,headers:{'content-type':'application/json'},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:ctrl.signal});
    let data=await r.json().catch(()=>({}));
    if(r.status>=400||data.value?.error) throw new Error(method+' '+route+' '+r.status+': '+JSON.stringify(data.value).slice(0,850));
    return data.value;
  } finally { clearTimeout(timer); }
}
async function js(sid,script,args=[]){
  return request('POST',`/session/${sid}/execute/sync`,{script,args},12000);
}
(async()=>{
  for(const item of cases) {
    const f=path.join(os.homedir(),'Downloads',title+'-writer-copy.'+item.format);
    assert(!fs.existsSync(f),'Synthetic download already exists; refusing to overwrite: '+f);
  }
  const fixture=fs.readFileSync('scripts/witness/deviceCopyBrowserFixture.tsx','utf8')
    .replace("title:'Synthetic Writer'","title:'"+title+"'");
  const compiled=await build({stdin:{contents:fixture,resolveDir:process.cwd(),sourcefile:'deviceCopyBrowserFixture.tsx',
      loader:'tsx'},bundle:true,write:false,platform:'browser',format:'iife',target:'es2022',jsx:'automatic',logLevel:'silent'});
  const requested=[];
  const server=http.createServer((req,res)=>{
    requested.push(req.method+' '+req.url);
    if(req.url!=='/'){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    res.end('<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script>'+compiled.outputFiles[0].text+'</script></body></html>');
  });
  await new Promise((resolve,reject)=>server.once('error',reject).listen(5657,'127.0.0.1',resolve));
  let sid=null;
  try {
    const sess=await request('POST','/session',{capabilities:{alwaysMatch:{browserName:'safari'}}},20000);
    sid=sess.sessionId;
    assert(sid,'Missing session ID');
    await request('POST',`/session/${sid}/url`,{url:site+'/'},15000);
    let mounted=false;
    for(let n=0;n<25;n++){
      mounted=await js(sid,"return !!document.querySelector('[data-device-copy] button');");
      if(mounted)break;await pause(250);
    }
    assert(mounted,'Safari did not mount Save a copy');
    for(const item of cases) {
      const target=path.join(os.homedir(),'Downloads',title+'-writer-copy.'+item.format);
      const menu=await js(sid,`document.querySelector('[data-device-copy] button').click();return document.querySelectorAll('.p4r1-device-copy-menu button').length;`);
      assert.equal(menu,3,'Device copy menu should show exactly three choices');
      await js(sid,`document.querySelectorAll('.p4r1-device-copy-menu button')[${item.button}].click();return true;`);
      let downloaded=false;
      for(let n=0;n<35;n++){
        if(fs.existsSync(target)&&fs.statSync(target).size>0){downloaded=true;break;}
        await pause(250);
      }
      const currentStatus=await js(sid,"return document.querySelector('[role=status]')?.textContent || ''");
      if(!downloaded){
        console.log('SAFARI_DOWNLOAD_NOT_VERIFIED',item.format,'No exact synthetic file in ~/Downloads');
        process.exitCode=2;return;
      }
      const actual=fs.readFileSync(target,'utf8');
      if(item.format==='json'){
        const data=JSON.parse(actual);
        assert.equal(data.kind,'soullab.writer-owned-manuscript-copy');
        assert.equal(data.containsUnacknowledgedStudioEdits,true);
        assert.equal(data.sections.length,2);
        assert.equal(data.sections[1].body,'Unsaved new ending.\nLast line.');
      }else assert.equal(actual,item.expected,'Downloaded '+item.format+' bytes differ');
      assert.match(currentStatus,/Studio may still be saving/);
      console.log('SAFARI_DOWNLOAD_PASS',item.format,'bytes='+Buffer.byteLength(actual),'sections=2');
      fs.unlinkSync(target);
    }
    console.log('ALL_SYNTHETIC_DOWNLOADS_CLEANED','yes');
    console.log('LOCAL_TEST_PAGE_REQUESTS',JSON.stringify(requested));
  }finally {
    if(sid){try{await request('DELETE',`/session/${sid}`,undefined,5000)}catch(err){console.log('SESSION_CLOSE_WARNING',String(err).slice(0,200))}}
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error('SAFARI_WITNESS_FAILED',String(err));process.exitCode=1});
