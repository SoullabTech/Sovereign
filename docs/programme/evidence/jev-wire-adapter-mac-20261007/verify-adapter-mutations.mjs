/** Independent completeness accounting for the committed adapter defeat candidates; loopback tests only. */
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const repo=resolve(process.argv[2]),out=resolve(process.argv[3]);
const src=readFileSync(join(repo,'scripts/builder/__tests__/jev-wire-http-adapter-v1-matrix.mjs'),'utf8');
const box={};vm.runInNewContext(src.slice(src.indexOf('const BAIL_DESTROY'),src.indexOf('\nfunction run(edits)'))+'\nglobalThis.candidates=CANDIDATES;',box,{timeout:1000});
const candidates=box.candidates;const results=[];let next=0;
const baseEnv=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','HOME','TMPDIR','LANG','LC_ALL','SHELL'].includes(k)));
async function one([name,expected,edits]){
 const started=new Date().toISOString();let text='',errors='',timedOut=false;
 const args=['scripts/builder/__tests__/jev-wire-http-adapter-v1-proof.mjs'];
 const child=spawn(process.execPath,args,{cwd:repo,env:{...baseEnv,JEV_AD_EDITS:JSON.stringify(edits)},detached:true});
 child.stdout.on('data',b=>text+=b);child.stderr.on('data',b=>errors+=b);
 const timer=setTimeout(()=>{timedOut=true;try{process.kill(-child.pid,'SIGTERM');}catch{}},45000);
 const [status,signal]=await new Promise((r,j)=>{child.on('close',(c,s)=>r([c,s]));child.on('error',j);});clearTimeout(timer);
 const checks=[...text.matchAll(/^(PASS|FAIL)  (\S+)/gm)];const summary=[...text.matchAll(/^(\d+) passed · (\d+) failed$/gm)].at(-1);
 const complete=checks.length===15&&new Set(checks.map(c=>c[2])).size===15&&!!summary&&(Number(summary[1])+Number(summary[2])===15);
 const named=checks.some(c=>c[1]==='FAIL'&&c[2].startsWith(expected+'-'));
 const accepted=status===1&&!signal&&!timedOut&&complete&&named;
 const finished=new Date().toISOString();
 const log='COMMAND='+process.execPath+' '+args.join(' ')+'\nHEAD=76fe39b2300a1e7d18bc953893c80f42c195c15c\nSTARTED_AT='+started+'\n'+text+errors+'\nEXIT_CODE='+status+'\nSIGNAL='+signal+'\nTIMED_OUT='+timedOut+'\nFINISHED_AT='+finished+'\n';
 writeFileSync(join(out,name+'.log'),log,{mode:0o600});
 const row={name,expected,edits,exit_code:status,signal,timed_out:timedOut,checks_completed:checks.length,complete,named_failure:named,accepted,started_at:started,finished_at:finished,log_sha256:createHash('sha256').update(log).digest('hex')};results.push(row);console.log(JSON.stringify({name,status,checks:checks.length,complete,named,accepted}));
}
await Promise.all(Array.from({length:3},async()=>{while(next<candidates.length){const i=next++;await one(candidates[i]);}}));
results.sort((a,b)=>candidates.findIndex(c=>c[0]===a.name)-candidates.findIndex(c=>c[0]===b.name));
writeFileSync(join(out,'adapter-mutation-completeness.json'),JSON.stringify({head:'76fe39b2300a1e7d18bc953893c80f42c195c15c',expected_candidates:18,all_complete_and_named:results.length===18&&results.every(r=>r.accepted),results},null,2)+'\n',{mode:0o600});
process.exit(results.length===18&&results.every(r=>r.accepted)?0:1);
