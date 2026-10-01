export const REFERENCE=Object.freeze({
  admitLegacyShell(){return false},
  validatePlan(plan){
    if(!plan||plan.version!=='EC1-VERIFY.v1'||!Array.isArray(plan.operations)||plan.operations.length===0)return false;
    return plan.operations.every(op=>op&&['INSPECT','PROJECT_EXECUTION'].includes(op.effect_class)&&typeof op.kind==='string'&&op.kind.length>0&&Array.isArray(op.argv)&&op.argv.every(x=>typeof x==='string'));
  },
  knownKind(kind){return ['git.diff_check','git.status_short','file.exists','text.contains','project.test'].includes(kind)},
  usesShell(op){return op.shell===true||op.eval===true||typeof op.command==='string'},
  cwdSource(){return 'HOST_BOUND_WORKTREE'},
  envSource(){return 'HOST_SANITIZED'},
  mayExecute(op){return op.effect_class==='INSPECT'&&this.knownKind(op.kind)&&!this.usesShell(op)},
  cleanGitProvesNoExternalEffect(){return false},
  decisionBindsPlan(){return true},
  legacyAutoTranslate(){return false},
});
const out=(id,f)=>({id,pass:f.length===0,failures:f});
const inspect={kind:'git.diff_check',effect_class:'INSPECT',argv:['git','diff','--check']};
const project={kind:'project.test',effect_class:'PROJECT_EXECUTION',argv:['node','--test']};
const plan=(ops=[inspect])=>({version:'EC1-VERIFY.v1',operations:ops});
export const FALSIFIERS=Object.freeze({
  V1:d=>out('V1',d.admitLegacyShell()===false?[]:['legacy shell became executable']),
  V2:d=>out('V2',d.validatePlan(plan())?[]:['lawful structured plan refused']),
  V3:d=>out('V3',d.knownKind('mystery')===false?[]:['unknown verifier kind admitted']),
  V4:d=>out('V4',d.usesShell({kind:'x',effect_class:'INSPECT',argv:['git'],command:'git status'})===true?[]:['shell command not recognized as shell']),
  V5:d=>out('V5',d.cwdSource()==='HOST_BOUND_WORKTREE'&&d.envSource()==='HOST_SANITIZED'?[]:['caller controls cwd/env']),
  V6:d=>{const f=[];if(!d.mayExecute(inspect))f.push('lawful inspection cannot execute');if(d.mayExecute(project))f.push('project-code execution admitted without effect containment');return out('V6',f)},
  V7:d=>out('V7',d.cleanGitProvesNoExternalEffect()===false?[]:['clean git misread as proof of no external effect']),
  V8:d=>out('V8',d.decisionBindsPlan()===true?[]:['host decision does not bind verifier plan']),
  V9:d=>out('V9',d.legacyAutoTranslate()===false?[]:['legacy shell auto-translated into authority']),
  V10:d=>{const f=[];if(!d.validatePlan(plan([project])))f.push('project execution cannot even be represented for later gating');return out('V10',f)},
});
const make=(id,named,overrides,collateral={})=>({id,named,decisions:Object.freeze({...REFERENCE,...overrides}),collateral:Object.freeze(collateral)});
export const CANDIDATES=Object.freeze([
  make('DC-V1','V1',{admitLegacyShell:()=>true}),
  make('DC-V2','V2',{validatePlan:()=>false},{V10:'a validator that refuses every plan also refuses representable future project-execution plans'}),
  make('DC-V3','V3',{knownKind:()=>true}),
  make('DC-V4','V4',{usesShell:()=>false}),
  make('DC-V5','V5',{cwdSource:()=> 'CALLER'}),
  make('DC-V6','V6',{mayExecute:()=>true}),
  make('DC-V7','V7',{cleanGitProvesNoExternalEffect:()=>true}),
  make('DC-V8','V8',{decisionBindsPlan:()=>false}),
  make('DC-V9','V9',{legacyAutoTranslate:()=>true}),
  make('DC-V10','V10',{validatePlan:(p)=>p.operations.every(op=>op.effect_class==='INSPECT')}),
]);
