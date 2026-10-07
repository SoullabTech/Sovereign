// Independent completeness check for the five new K16 mutation runs. Fake transports only.
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync, execFileSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
const repo=resolve(process.argv[2]), out=resolve(process.argv[3]);
const src=readFileSync(join(repo,'scripts/builder/__tests__/jev-wire-checkpoint-v1-matrix.mjs'),'utf8');
const a=src.indexOf('const CANDIDATES = ')+ 'const CANDIDATES = '.length;
const b=src.indexOf('\n\nfunction run(scope, edits)',a);
assert.ok(a>20 && b>a);
const candidates=runInNewContext('('+src.slice(a,b).trim().replace(/;$/,'')+')');
const selected=candidates.filter(x=>x[1]==='K16');
assert.equal(selected.length,5);
const sha=b=>createHash('sha256').update(b).digest('hex');
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const rows=[];
for(const [name,expected,scope,edits] of selected){
 const env={...process.env};delete env.JEV_WIRE_EDITS;delete env.JEV_CK_EDITS;
 env[scope==='ck'?'JEV_CK_EDITS':'JEV_WIRE_EDITS']=JSON.stringify(edits);
 const script='scripts/builder/__tests__/jev-wire-checkpoint-v1-proof.mjs';
 const start=new Date().toISOString();
 const r=spawnSync(process.execPath,[script],{cwd:repo,env,encoding:'utf8',timeout:120000});
 const stdout=r.stdout||'';
 const checks=[...stdout.matchAll(/^(PASS|FAIL)  (\S+)/gm)];
 const namedFailure=checks.some(m=>m[1]==='FAIL'&&m[2].startsWith(expected+'-'));
 const complete=checks.length===16 && /\n\d+ passed · \d+ failed\s*$/.test(stdout);
 const accepted=r.status===1&&!r.signal&&!r.error&&complete&&namedFailure;
 const log='HEAD='+head+'\nCOMMAND='+process.execPath+' '+script+'\nMUTATION='+name+'\nEDITS='+JSON.stringify(edits)+'\nSTARTED_AT='+start+'\n'+stdout+(r.stderr||'')+'\nEXIT_CODE='+r.status+'\nSIGNAL='+r.signal+'\nERROR='+(r.error?.message||'none')+'\nFINISHED_AT='+new Date().toISOString()+'\n';
 writeFileSync(join(out,name+'.log'),log,{flag:'wx',mode:0o600});
 rows.push({name,expected,exit_code:r.status,signal:r.signal,error:r.error?.message||null,checks_completed:checks.length,complete,namedFailure,accepted,log_sha256:sha(log)});
 console.log(JSON.stringify(rows.at(-1)));
}
const summary={head,all_fake:true,rows,all_pass:rows.every(x=>x.accepted)};
writeFileSync(join(out,'new-mutation-completeness.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx',mode:0o600});
assert.ok(summary.all_pass);
