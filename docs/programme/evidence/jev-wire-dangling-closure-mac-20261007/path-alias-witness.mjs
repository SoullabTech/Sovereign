/** Independent C2 path guard measurements. Creates only new disposable files; no transport. */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, lstatSync, readlinkSync, symlinkSync, linkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const repo=resolve(process.argv[2]); const out=resolve(process.argv[3]);
const W=await import(pathToFileURL(join(repo,'scripts/builder/jev-wire-v1.mjs')));
const CK=await import(pathToFileURL(join(repo,'scripts/builder/jev-wire-checkpoint-v1.mjs')));
const sha=b=>createHash('sha256').update(b).digest('hex');
const root=mkdtempSync(join(tmpdir(),'jev-C2-ALIAS-SYNTHETIC-'));
function snapshot(path){const rows=[];function walk(p,rel=''){for(const n of readdirSync(p).sort()){const f=join(p,n),r=join(rel,n),s=lstatSync(f);if(s.isSymbolicLink())rows.push([r,'link',readlinkSync(f)]);else if(s.isDirectory()){rows.push([r,'dir']);walk(f,r);}else rows.push([r,'file',sha(readFileSync(f))]);}}walk(path);return JSON.stringify(rows);}
const cases=['exact','temp-is-ledger','checkpoint-is-lock','checkpoint-is-pair-lock','symlink-parent','file-symlink','hard-link','case-alias','dangling-temp-to-future-ledger','dangling-ledger-to-future-temp','collision-added-after-construction'];
const rows=[];
for(const name of cases){
 const d=join(root,name);mkdirSync(d);mkdirSync(join(d,'a'));mkdirSync(join(d,'b'));writeFileSync(join(d,'sentinel'),'preserve this synthetic sentinel');
 let L=join(d,'a','ledger.jsonl'),C=join(d,'b','anchor.json');
 if(name==='exact')C=L;
 if(name==='temp-is-ledger'){C=join(d,'a','anchor.json');L=C+'.tmp';}
 if(name==='checkpoint-is-lock')C=L+'.lock';
 if(name==='checkpoint-is-pair-lock')C=L+'.pair.lock';
 if(name==='symlink-parent'){symlinkSync(join(d,'a'),join(d,'b','alias'),'dir');C=join(d,'b','alias','ledger.jsonl');}
 if(name==='file-symlink'){writeFileSync(L,'existing sentinel ledger');symlinkSync(L,C);}
 if(name==='hard-link'){writeFileSync(L,'existing sentinel ledger');linkSync(L,C);}
 if(name==='case-alias')C=join(d,'a','LEDGER.JSONL');
 if(name==='dangling-temp-to-future-ledger')symlinkSync(L,C+'.tmp');
 if(name==='dangling-ledger-to-future-temp')symlinkSync(C+'.tmp',L);
 let pair;let failure=null;let phase='construction';
 if(name==='collision-added-after-construction'){pair=CK.createCheckpointedLedger(W.createLedger(L),C);writeFileSync(L,'later sentinel ledger');symlinkSync(L,C);}
 const before=snapshot(d);
 try{if(!pair)pair=CK.createCheckpointedLedger(W.createLedger(L),C);phase='initialization';pair.initialize();}catch(e){failure=e.message;}
 const after=snapshot(d);let valid=false;let ledgerError=null;
 try{W.createLedger(L).read();valid=true;}catch(e){ledgerError=e.message;}
 const row={name,phase,error:failure,returned_success:failure===null,tree_unchanged:before===after,ledger_exists:existsSync(L),ledger_valid:valid,ledger_error:ledgerError,no_clobber_refusal:failure==='PAIR_PATH_COLLISION'&&before===after};
 rows.push(row);console.log(JSON.stringify(row));
}
const result={head:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),created_at:new Date().toISOString(),synthetic_root:root,transport_calls:0,source_edited:false,rows};
writeFileSync(join(out,'path-alias-results.json'),JSON.stringify(result,null,2)+'\n',{mode:0o600});
console.log('MEASUREMENT_COMPLETE; exit 0 is not an acceptance verdict; inspect no_clobber_refusal.');