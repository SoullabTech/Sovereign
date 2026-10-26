'use strict';
/**
 * R106 ONLY: a short-lived, independent, automatic timer that launches
 * the existing standalone vault-erasure CLI (not a member HTTP request).
 * This is a disposable *test scheduler*, never a production scheduler.
 */
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const db=process.env.DATABASE_URL||'';
const vault=process.env.FILE_STORAGE_PATH||'';
const ok=process.env.WS_R106_ERASURE_FIXTURE==='fictional-only'&&
 process.env.NODE_ENV==='test'&&
 /^postgresql:\/\/ws_r106_eraser@127\.0\.0\.1:\d{2,5}\/ws_r106$/.test(db)&&
 /^\/private\/tmp\/ws-r106-fictional-[a-f0-9]{8}\/vault$/.test(vault)&&
 process.argv.length===2&&
 fs.existsSync(path.join(vault,'..','R106_FICTIONAL_ONLY.marker'));
if(!ok){
 process.stderr.write('R106_SCHEDULER_REFUSED_DEFAULT_OFF\n');
 process.exitCode=3;
}else{
 let stopped=false,attempt=0;
 const finish=(code,tag)=>{
  if(stopped)return;
  stopped=true;
  process.stdout.write(tag+'\n');
  process.exitCode=code;
 };
 async function tick(){
  if(stopped)return;
  if(attempt++>25)return finish(2,'R106_FICTIONAL_BOUNDED_TIMEOUT');
  const cmd=path.join(root,'node_modules/.bin/tsx');
  const p=spawn(cmd,['scripts/ops/sweep-vault-erasure-queue.ts','--quiet'],{
   cwd:root,env:process.env,stdio:['ignore','ignore','ignore'],
  });
  let code;
  try{
   code=await new Promise(resolve=>{
    p.once('exit',v=>resolve(v));
    p.once('error',()=>resolve(2));
   });
  }catch{code=2;}
  if(stopped)return;
  if(code===0)return finish(0,'R106_FICTIONAL_AUTONOMOUS_CLEAR');
  if(code===1){
   process.stdout.write('R106_FICTIONAL_ERASURE_STILL_OWED\n');
   setTimeout(tick,550);
  }else finish(2,'R106_FICTIONAL_SCHEDULER_DRIVER_FAILED');
 }
 process.on('SIGTERM',()=>{stopped=true;process.exit(4);});
 tick();
}
