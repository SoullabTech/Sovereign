export const REFERENCE=Object.freeze({
  makeAuthority({shell='none',test_execution=false}={}){return{repository_read:true,repository_write:'worktree',shell,test_execution,network_external:false,provider_spend:false,merge:false,deploy:false}},
  executeChecks(a){return a.test_execution===true},
  packetActs(a){const acts=['repo.read','repo.write:worktree'];if(a.test_execution===true)acts.push('tests.run');return acts},
  localCandidateAllowed(a){return a.repository_read===true&&a.repository_write==='worktree'&&a.test_execution===true},
  externalSafe(a){return !a.network_external&&!a.provider_spend&&!a.merge&&!a.deploy},
  inferTestFromShell(){return false},
});
const out=(id,f)=>({id,pass:f.length===0,failures:f});
export const FALSIFIERS=Object.freeze({
  T1:d=>{const f=[];const a=d.makeAuthority({shell:'bounded_write',test_execution:false});if(d.executeChecks(a)!==false)f.push('bounded shell implied test execution');return out('T1',f)},
  T2:d=>{const f=[];const a=d.makeAuthority({shell:'none',test_execution:true});if(d.executeChecks(a)!==true)f.push('explicit test authority was lost');return out('T2',f)},
  T3:d=>{const f=[];let a=d.makeAuthority({test_execution:false});if(d.packetActs(a).includes('tests.run'))f.push('packet gained tests.run without authority');a=d.makeAuthority({test_execution:true});if(!d.packetActs(a).includes('tests.run'))f.push('packet lost tests.run despite authority');return out('T3',f)},
  T4:d=>{const f=[];if(d.localCandidateAllowed(d.makeAuthority({test_execution:false})))f.push('local candidate allowed without test authority');if(!d.localCandidateAllowed(d.makeAuthority({test_execution:true})))f.push('lawful local candidate refused');return out('T4',f)},
  T5:d=>{const f=[];if(!d.externalSafe(d.makeAuthority({shell:'bounded_write',test_execution:true})))f.push('test authority widened external/merge/deploy authority');return out('T5',f)},
  T6:d=>{const f=[];if(d.inferTestFromShell()!==false)f.push('test authority inferred from shell');return out('T6',f)},
});
const make=(id,named,overrides,collateral={})=>({id,named,decisions:Object.freeze({...REFERENCE,...overrides}),collateral:Object.freeze(collateral)});
export const CANDIDATES=Object.freeze([
  make('DC-T1','T1',{executeChecks:(a)=>a.shell==='bounded_write'||a.test_execution===true}),
  make('DC-T2','T2',{executeChecks:()=>false}),
  make('DC-T3','T3',{packetActs:()=>['repo.read','repo.write:worktree','tests.run']}),
  make('DC-T4','T4',{localCandidateAllowed:(a)=>a.repository_read===true&&a.repository_write==='worktree'}),
  make('DC-T5','T5',{makeAuthority:({shell='none',test_execution=false}={})=>({repository_read:true,repository_write:'worktree',shell,test_execution,network_external:test_execution===true,provider_spend:false,merge:false,deploy:false})}),
  make('DC-T6','T6',{inferTestFromShell:()=>true}),
]);
