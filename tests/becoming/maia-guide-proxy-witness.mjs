import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';

const previewPort=3799;
const upstreamPort=4597;
const output='.becoming-guide-preview';
await mkdir(output,{recursive:true});
const received=[];

const upstream=createServer(async(req,res)=>{
  let raw='';
  for await(const chunk of req) raw+=chunk.toString('utf8');
  received.push({headers:req.headers,body:JSON.parse(raw||'{}')});
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({message:'Synthetic upstream MAIA'}));
});
await new Promise(resolve=>upstream.listen(upstreamPort,'127.0.0.1',resolve));

const child=spawn(process.execPath,['scripts/becoming/preview.mjs'],{
  cwd:process.cwd(),
  env:{...process.env,BECOMING_PREVIEW_PORT:String(previewPort),BECOMING_MAIA_PORT:String(upstreamPort)},
  stdio:['ignore','pipe','pipe'],
});
let stdout='',stderr='';
child.stdout.on('data',chunk=>stdout+=chunk.toString());
child.stderr.on('data',chunk=>stderr+=chunk.toString());
const deadline=Date.now()+10000;
while(!stdout.includes('"localPreview"')&&Date.now()<deadline) await new Promise(resolve=>setTimeout(resolve,50));
if(!stdout.includes('"localPreview"')) throw new Error('Preview did not start: '+stderr);

const base=`http://localhost:${previewPort}`;
const valid={
  message:'Current-journey guide envelope',
  sessionId:'becoming-guide-11111111-1111-4111-8111-111111111111-22222222-2222-4222-8222-222222222222',
  journeyId:'11111111-1111-4111-8111-111111111111',
  conversationHistory:[],
};

const noHeader=await fetch(base+'/api/maia-guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});
assert.equal(noHeader.status,403);
assert.equal(received.length,0);

const guide=await fetch(base+'/api/maia-guide',{
  method:'POST',
  headers:{'Content-Type':'application/json','X-Becoming-Guide':'1','Cookie':'maia_session=synthetic-cookie'},
  body:JSON.stringify(valid),
});
assert.equal(guide.status,200);
assert.equal(received.length,1);
const guideUpstream=received[0];
assert.equal(guideUpstream.body.sanctuary,true);
assert.equal(guideUpstream.body.meta.memoryMode,'ephemeral');
assert.deepEqual(guideUpstream.body.conversationHistory,[]);
assert.equal(guideUpstream.headers.cookie,'maia_session=synthetic-cookie');

const smuggled=await fetch(base+'/api/maia-guide',{
  method:'POST',
  headers:{'Content-Type':'application/json','X-Becoming-Guide':'1'},
  body:JSON.stringify({...valid,conversationHistory:[{role:'user',content:'old conversation'}]}),
});
assert.equal(smuggled.status,400);
assert.equal(received.length,1);

const postReturn=await fetch(base+'/api/maia',{
  method:'POST',
  headers:{'Content-Type':'application/json','X-Becoming-Explicit-Handoff':'1'},
  body:JSON.stringify({
    ...valid,
    sessionId:'becoming-11111111-1111-4111-8111-111111111111-22222222-2222-4222-8222-222222222222',
    conversationHistory:[{role:'assistant',content:'post-return continuity'}],
  }),
});
assert.equal(postReturn.status,200);
assert.equal(received.length,2);
assert.equal(received[1].body.sanctuary,false);
assert.equal(received[1].body.meta.memoryMode,'continuity');
assert.equal(received[1].body.conversationHistory.length,1);
const evidence={
  guideNoHeaderStatus:noHeader.status,
  guideStatus:guide.status,
  guideUpstream:{
    sanctuary:guideUpstream.body.sanctuary,
    memoryMode:guideUpstream.body.meta.memoryMode,
    conversationHistory:guideUpstream.body.conversationHistory,
    cookieForwarded:Boolean(guideUpstream.headers.cookie),
  },
  historySmuggleStatus:smuggled.status,
  postReturn:{
    status:postReturn.status,
    sanctuary:received[1].body.sanctuary,
    memoryMode:received[1].body.meta.memoryMode,
    conversationHistoryCount:received[1].body.conversationHistory.length,
  },
};
console.log(JSON.stringify(evidence,null,2));
await writeFile(output+'/proxy-witness.json',JSON.stringify(evidence,null,2)+'\n');

child.kill('SIGTERM');
await new Promise(resolve=>child.once('exit',resolve));
await new Promise(resolve=>upstream.close(resolve));
