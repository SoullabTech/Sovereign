/**
 * EC1-R14 — inspection-only verifier executor.
 * Executes only the INSPECT subset admitted by EC1-VERIFY.v1.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { validateVerifierPlanV1 } from './local-verifier-plan-v1.mjs';

export const INSPECTION_EXECUTOR_VERSION='EC1-VERIFY-INSPECT.v1';
const MAX_TEXT_BYTES=2*1024*1024;
const MAX_OUTPUT_CHARS=20000;
function fail(reason,detail=null){return{ok:false,status:'REFUSED',reason,detail,executor_version:INSPECTION_EXECUTOR_VERSION,results:[]};}
function inside(root,target){const rel=path.relative(root,target);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
function realRoot(worktree){if(typeof worktree!=='string'||!path.isAbsolute(worktree)||!existsSync(worktree))throw new Error('HOST_WORKTREE_REQUIRED');return realpathSync(worktree);}
function containedExisting(root,rel){const lexical=path.resolve(root,rel);if(!inside(root,lexical))throw new Error('VERIFIER_PATH_OUTSIDE_WORKTREE');if(!existsSync(lexical))return{exists:false,path:lexical};const real=realpathSync(lexical);if(!inside(root,real))throw new Error('VERIFIER_REALPATH_OUTSIDE_WORKTREE');return{exists:true,path:real};}
function runGit(root,args){return execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000,maxBuffer:1024*1024});}
function trimOutput(v){const s=String(v||'');return s.length>MAX_OUTPUT_CHARS?s.slice(0,MAX_OUTPUT_CHARS):s;}

export function executeInspectionVerifierPlanV1(plan,{worktree}={}){
  const admitted=validateVerifierPlanV1(plan);
  if(!admitted.ok)return fail(admitted.reason,admitted.path);
  if(!admitted.executable)return fail('PROJECT_EXECUTION_NOT_ADMITTED');
  let root;try{root=realRoot(worktree);}catch(e){return fail(e.message);}
  const results=[];
  for(const op of admitted.plan.operations){
    if(op.effect_class!=='INSPECT')return fail('NON_INSPECTION_OPERATION_REFUSED',op.operation_id);
    try{
      if(op.kind==='git.diff_check'){
        const out=runGit(root,['diff','--check']);
        results.push({operation_id:op.operation_id,kind:op.kind,status:'PASS',evidence:trimOutput(out)});
      } else if(op.kind==='git.status_short'){
        const out=runGit(root,['status','--short']);
        results.push({operation_id:op.operation_id,kind:op.kind,status:'PASS',evidence:trimOutput(out)});
      } else if(op.kind==='file.exists'){
        const target=containedExisting(root,op.args.path);
        results.push({operation_id:op.operation_id,kind:op.kind,status:target.exists?'PASS':'FAIL',evidence:op.args.path});
      } else if(op.kind==='text.contains'){
        const target=containedExisting(root,op.args.path);
        if(!target.exists){results.push({operation_id:op.operation_id,kind:op.kind,status:'FAIL',evidence:'missing:'+op.args.path});continue;}
        const st=statSync(target.path);if(!st.isFile())throw new Error('VERIFIER_TEXT_TARGET_NOT_FILE');if(st.size>MAX_TEXT_BYTES)throw new Error('VERIFIER_TEXT_TARGET_TOO_LARGE');
        const body=readFileSync(target.path,'utf8');
        results.push({operation_id:op.operation_id,kind:op.kind,status:body.includes(op.args.literal)?'PASS':'FAIL',evidence:op.args.path});
      } else return fail('VERIFIER_KIND_NOT_EXECUTABLE',op.kind);
    }catch(e){results.push({operation_id:op.operation_id,kind:op.kind,status:'ERROR',evidence:trimOutput(e.stderr||e.message||e)});}
  }
  const ok=results.every(r=>r.status==='PASS');
  return{ok,status:ok?'PASS':'FAIL',reason:ok?null:'INSPECTION_VERIFICATION_FAILED',executor_version:INSPECTION_EXECUTOR_VERSION,plan_digest:admitted.digest,results};
}
