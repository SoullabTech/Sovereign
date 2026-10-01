export const REFERENCE = Object.freeze({
  mint(objective, nowMs) {
    const slug=String(objective||'work').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,34)||'work';
    return (`work-${slug}-${Number(nowMs).toString(36).slice(-8)}`).slice(0,63).replace(/-+$/g,'');
  },
  legacyId(sharedId) { return sharedId; },
  canonicalId(sharedId) { return sharedId; },
  historicalMatch() { return null; },
  bridgeStore() { return null; },
  equivalent(a,b) {
    return a.id===b.id && a.objective===b.objective && a.base===b.base
      && JSON.stringify([...a.paths].sort())===JSON.stringify([...b.paths].sort());
  },
  runnable(a,b) { return this.equivalent(a,b); },
});

const result=(id,f)=>({id,pass:f.length===0,failures:f});
export const FALSIFIERS=Object.freeze({
  'I1': d=>{const f=[];const id=d.mint('Repair voice',123456);if(d.legacyId(id)!==d.canonicalId(id))f.push('representations do not share one id');return result('I1',f)},
  'I2': d=>{const f=[];const id=d.mint('Repair voice',123456);if(d.legacyId(id)!==id||d.canonicalId(id)!==id)f.push('constructor reminted identity');return result('I2',f)},
  'I3': d=>{const f=[];if(d.historicalMatch({objective:'same',base:'a'})!==null)f.push('historical work was heuristically matched');return result('I3',f)},
  'I4': d=>{const f=[];if(d.bridgeStore()!==null)f.push('second identity/crosswalk store introduced');return result('I4',f)},
  'I5': d=>{const f=[];const a={id:'w1',objective:'x',base:'a',paths:['p']};const b={...a,id:'w2'};if(d.equivalent(a,b))f.push('different ids treated as same Work');return result('I5',f)},
  'I6': d=>{const f=[];const a={id:'w1',objective:'x',base:'a',paths:['p']};for(const b of [{...a,objective:'y'},{...a,base:'b'},{...a,paths:['q']}])if(d.equivalent(a,b))f.push('semantic-core mismatch admitted');return result('I6',f)},
  'I7': d=>{const f=[];const a={id:'w1',objective:'x',base:'a',paths:['p']};if(!d.runnable(a,{...a}))f.push('lawful dual representation not runnable');if(d.runnable(a,{...a,base:'b'}))f.push('mismatched dual representation became runnable');return result('I7',f)},
});

const make=(id,named,overrides,collateral={})=>({id,named,decisions:Object.freeze({...REFERENCE,...overrides}),collateral:Object.freeze(collateral)});
export const CANDIDATES=Object.freeze([
  make('DC-I1','I1',{canonicalId:(id)=>'v2-'+id},{I2:'a constructor that changes the canonical id necessarily remints instead of preserving the shared id'}),
  make('DC-I2','I2',{legacyId:(id)=>'desktop-'+id},{I1:'a constructor that remints necessarily breaks one-id identity unity'}),
  make('DC-I3','I3',{historicalMatch:()=>({legacy:'desktop-x',canonical:'v2-x'})}),
  make('DC-I4','I4',{bridgeStore:()=>'/identity-crosswalk.json'}),
  make('DC-I5','I5',{equivalent:(a,b)=>a.objective===b.objective&&a.base===b.base},{I6:'ignoring identity also leaves path scope outside the semantic-core equivalence relation'}),
  make('DC-I6','I6',{equivalent:(a,b)=>a.id===b.id},{I7:'if equivalence ignores semantic core, runnable necessarily admits a same-id mismatched pair'}),
  make('DC-I7','I7',{runnable:()=>true}),
]);
