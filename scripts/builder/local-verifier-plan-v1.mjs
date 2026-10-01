/**
 * EC1-R13 — pure structured verifier-plan contract.
 * No filesystem, shell, child process, network, environment, clock, or execution.
 */
import crypto from 'node:crypto';

export const VERIFIER_PLAN_VERSION='EC1-VERIFY.v1';
export const EFFECT_CLASSES=Object.freeze(['INSPECT','PROJECT_EXECUTION']);
export const KINDS=Object.freeze({
  'git.diff_check':Object.freeze({effect_class:'INSPECT',args:Object.freeze([])}),
  'git.status_short':Object.freeze({effect_class:'INSPECT',args:Object.freeze([])}),
  'file.exists':Object.freeze({effect_class:'INSPECT',args:Object.freeze(['path'])}),
  'text.contains':Object.freeze({effect_class:'INSPECT',args:Object.freeze(['path','literal'])}),
  'project.test':Object.freeze({effect_class:'PROJECT_EXECUTION',args:Object.freeze(['runner','argv'])}),
});
function deepFreeze(v){if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.freeze(v);for(const x of Object.values(v))deepFreeze(x);return v;}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v??null);}
function digest(v){return 'sha256:'+crypto.createHash('sha256').update(canonical(v)).digest('hex');}
function fail(reason,path=null){return deepFreeze({ok:false,status:'REFUSED',reason,path,plan:null,digest:null,executable:false});}
function safeRelPath(v){return typeof v==='string'&&v.length>0&&!v.startsWith('/')&&!v.startsWith('../')&&!v.includes('/../')&&!v.includes('\\');}
function exactKeys(obj,allowed){return obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).every(k=>allowed.includes(k));}

export function validateVerifierPlanV1(input){
  if(!exactKeys(input,['version','operations']))return fail('VERIFIER_PLAN_SHAPE_REFUSED','plan');
  if(input.version!==VERIFIER_PLAN_VERSION)return fail('VERIFIER_PLAN_VERSION_REFUSED','version');
  if(!Array.isArray(input.operations)||input.operations.length===0)return fail('VERIFIER_OPERATIONS_REQUIRED','operations');
  const ops=[];
  for(let i=0;i<input.operations.length;i++){
    const op=input.operations[i];const p='operations['+i+']';
    if(!exactKeys(op,['operation_id','kind','effect_class','args']))return fail('VERIFIER_OPERATION_SHAPE_REFUSED',p);
    if(typeof op.operation_id!=='string'||!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(op.operation_id))return fail('VERIFIER_OPERATION_ID_REFUSED',p+'.operation_id');
    const spec=KINDS[op.kind];if(!spec)return fail('VERIFIER_KIND_UNRECOGNIZED',p+'.kind');
    if(op.effect_class!==spec.effect_class)return fail('VERIFIER_EFFECT_CLASS_MISMATCH',p+'.effect_class');
    if(!exactKeys(op.args,spec.args))return fail('VERIFIER_ARGS_SHAPE_REFUSED',p+'.args');
    if(Object.keys(op.args).some(k=>!spec.args.includes(k))||spec.args.some(k=>!(k in op.args)))return fail('VERIFIER_ARGS_MISMATCH',p+'.args');
    if(op.kind==='file.exists'&&!safeRelPath(op.args.path))return fail('VERIFIER_PATH_REFUSED',p+'.args.path');
    if(op.kind==='text.contains'&&(!safeRelPath(op.args.path)||typeof op.args.literal!=='string'||op.args.literal.length===0))return fail('VERIFIER_TEXT_CONTAINS_ARGS_REFUSED',p+'.args');
    if(op.kind==='project.test'){
      if(typeof op.args.runner!=='string'||op.args.runner.length===0||!Array.isArray(op.args.argv)||op.args.argv.some(x=>typeof x!=='string'))return fail('VERIFIER_PROJECT_TEST_ARGS_REFUSED',p+'.args');
    }
    ops.push({operation_id:op.operation_id,kind:op.kind,effect_class:op.effect_class,args:JSON.parse(JSON.stringify(op.args))});
  }
  const ids=new Set(ops.map(o=>o.operation_id));if(ids.size!==ops.length)return fail('VERIFIER_OPERATION_ID_DUPLICATE','operations');
  const plan=deepFreeze({version:VERIFIER_PLAN_VERSION,operations:ops});
  const held=ops.some(o=>o.effect_class==='PROJECT_EXECUTION');
  return deepFreeze({ok:true,status:held?'HELD_FOR_EFFECT_CONTAINMENT':'INSPECTION_PLAN_ADMITTED',reason:null,plan,digest:digest(plan),executable:!held});
}

export function verifierPlanDigestV1(plan){const r=validateVerifierPlanV1(plan);return r.ok?r.digest:null;}
