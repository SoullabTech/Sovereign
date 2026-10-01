export const REFERENCE = Object.freeze({
  canonicalAuthority() {
    return { repo_read:true, repo_write:'worktree', shell:'bounded_write', network:false, spend:false, merge:false, deploy:false };
  },
  packetAuthority(canonical) {
    return { repo_read:canonical.repo_read, repo_write:canonical.repo_write, shell:canonical.shell,
      network:canonical.network, spend:canonical.spend, merge:canonical.merge, deploy:canonical.deploy };
  },
  authorize(effect, canonical, packet) {
    const need = effect === 'local_candidate'
      ? canonical.repo_read && canonical.repo_write==='worktree' && canonical.shell==='bounded_write'
      : false;
    return need && JSON.stringify(packet)===JSON.stringify(this.packetAuthority(canonical));
  },
  grantStanding(phase) {
    return phase==='authorized'?'ACTIVE':phase==='dispatch'?'CLAIMED':phase==='effect_witnessed'?'CLAIMED':'CONSUMED';
  },
  mayDispatch({grantStanding, packetMatches, currentAuthority}) {
    return grantStanding==='CLAIMED' && packetMatches===true && currentAuthority===true;
  },
  claimPoint() { return 'IMMEDIATELY_BEFORE_LEGACY_DISPATCH'; },
  canonicalProviderDispatch() { return false; },
  historicalProjectionAllowed() { return false; },
});

const out=(id,f)=>({id,pass:f.length===0,failures:f});
export const FALSIFIERS=Object.freeze({
  A1:d=>{const f=[];const c=d.canonicalAuthority();const p=d.packetAuthority(c);if(!d.authorize('local_candidate',c,p))f.push('lawful local candidate not authorized');return out('A1',f)},
  A2:d=>{const f=[];const c=d.canonicalAuthority();const p=d.packetAuthority(c);for(const k of ['repo_write','shell','network','spend','merge','deploy']){let bad;if(k==='repo_write')bad=p[k]==='worktree'?'none':'worktree';else if(k==='shell')bad=p[k]==='bounded_write'?'none':'bounded_write';else bad=!p[k];const x={...p,[k]:bad};if(d.authorize('local_candidate',c,x))f.push('packet authority divergence admitted: '+k)}return out('A2',f)},
  A3:d=>{const f=[];if(d.grantStanding('authorized')!=='ACTIVE')f.push('authorization mislabeled');if(d.grantStanding('dispatch')!=='CLAIMED')f.push('dispatch not CLAIMED');if(d.grantStanding('effect_witnessed')!=='CLAIMED')f.push('witness prematurely settled');if(d.grantStanding('ledgered')!=='CONSUMED')f.push('ledgered not consumed');return out('A3',f)},
  A4:d=>{const f=[];if(d.claimPoint()!=='IMMEDIATELY_BEFORE_LEGACY_DISPATCH')f.push('claim point not last-mile');return out('A4',f)},
  A5:d=>{const f=[];const cases=[
    [{grantStanding:'ACTIVE',packetMatches:true,currentAuthority:true},false],
    [{grantStanding:'CLAIMED',packetMatches:false,currentAuthority:true},false],
    [{grantStanding:'CLAIMED',packetMatches:true,currentAuthority:false},false],
    [{grantStanding:'CLAIMED',packetMatches:true,currentAuthority:true},true],
  ];for(const [x,want] of cases)if(d.mayDispatch(x)!==want)f.push('dispatch gate wrong for '+JSON.stringify(x));return out('A5',f)},
  A6:d=>{const f=[];if(d.canonicalProviderDispatch()!==false)f.push('canonical provider may also dispatch');return out('A6',f)},
  A7:d=>{const f=[];const c=d.canonicalAuthority();if(c.network||c.spend||c.merge||c.deploy)f.push('local authority widened externally');return out('A7',f)},
  A8:d=>{const f=[];if(d.historicalProjectionAllowed()!==false)f.push('historical legacy effect retroactively assigned canonical authority');return out('A8',f)},
});

const make=(id,named,overrides,collateral={})=>({id,named,decisions:Object.freeze({...REFERENCE,...overrides}),collateral:Object.freeze(collateral)});
export const CANDIDATES=Object.freeze([
  make('DC-A1','A1',{canonicalAuthority:()=>({repo_read:true,repo_write:'none',shell:'none',network:false,spend:false,merge:false,deploy:false})}),
  make('DC-A2','A2',{authorize:()=>true}),
  make('DC-A3','A3',{grantStanding:(phase)=>phase==='ledgered'?'CONSUMED':'ACTIVE'}),
  make('DC-A4','A4',{claimPoint:()=> 'AT_CREATION'}),
  make('DC-A5','A5',{mayDispatch:({grantStanding})=>['ACTIVE','CLAIMED'].includes(grantStanding)}),
  make('DC-A6','A6',{canonicalProviderDispatch:()=>true}),
  make('DC-A7','A7',{canonicalAuthority:()=>({repo_read:true,repo_write:'worktree',shell:'bounded_write',network:true,spend:true,merge:false,deploy:false})}),
  make('DC-A8','A8',{historicalProjectionAllowed:()=>true}),
]);
