/**
 * R105 offline-only Compose witness. Do not drop erasure worker's vault mount
 * until a separate, scheduled, independently authorized erasure consumer passes.
 */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT=process.cwd();
const F=join(ROOT,'scripts/ops/fixtures/r104');
const BASE=['base.synthetic.yml','observed-risk.synthetic.yml'];
const HELD='candidate-media-isolation.synthetic.yml';
const PROPOSED='candidate-erasure-preserving-isolation.synthetic.yml';
function stop(kind:string):never{
 process.stdout.write(JSON.stringify({status:'REFUSED_R105_SOURCE_OR_MOUNT_LAW',
  reason:kind,releaseApproved:false})+'\n');process.exit(3);
}
function render(files:string[]):any{
 const args=['compose'];
 for(const f of files){
  if(!/^[a-z0-9.-]+\.synthetic\.yml$/.test(f))stop('invalid_fixture');
  const source=readFileSync(join(F,f),'utf8');
  if(source.includes('env_file:')||source.includes('/home/soullab/'))
   stop('production_reference');
  args.push('-f',join(F,f));
 }
 args.push('config','--format','json');
 const r=spawnSync('docker',args,{cwd:F,timeout:25000,encoding:'utf8',
  env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin',
   HOME:process.env.HOME||'/tmp'}});
 if(r.status!==0||r.error||r.stdout.length>120000)
  stop('compose_render_failed');
 try{return JSON.parse(r.stdout);}catch{stop('invalid_rendered_json');}
}
function mounts(input:any){
 const vols=input?.services?.['maia-media-worker']?.volumes;
 if(!Array.isArray(vols))stop('no_worker_volume_set');
 return vols.map((v:{target:string})=>v.target).sort();
}
const media='/app/data/media',vault='/app/data/vault';
const authority='/app/r20-authority',key='/run/secrets/soullab-r20/ledger.key';
const worker=readFileSync(join(ROOT,'scripts/run-media-worker.ts'),'utf8');
const independent=readFileSync(join(ROOT,
 'scripts/ops/sweep-vault-erasure-queue.ts'),'utf8');
if(!worker.includes('await runVaultErasureStep()')||
   !worker.includes('VAULT_ERASURE_EVERY_N_LOOPS')||
   !independent.includes('sweepVaultErasureQueue()'))
 stop('erasure_consumer_source_unverified');
const before=mounts(render(BASE));
const unsafe=mounts(render([...BASE,HELD]));
const transitional=mounts(render([...BASE,PROPOSED]));
if(JSON.stringify(before)!==JSON.stringify(
 [media,vault,authority,key].sort())||
   JSON.stringify(unsafe)!==JSON.stringify([media])||
   JSON.stringify(transitional)!==JSON.stringify([media,vault].sort()))
 stop('expected_mount_semantics_not_proven');
process.stdout.write(JSON.stringify({
 protocol:'soullab.ws.r105.erasure-liveness-transitional-compose.v1',
 status:'PASS_SYNTHETIC_ERASURE_PRESERVING_REDUCTION_BETA_HOLD',
 beforeMountCount:4,unsafePrematureRemovalMountCount:1,
 transitionalMountCount:2,
 existingMediaWorkerOwnsErasureDuty:true,
 independentlyScheduledReplacementProven:false,
 removesR20KeyAndAuthorityButRetainsVaultInSyntheticModel:true,
 productionR20SignerIndependent:false,
 workerSqlPrivilegesExternallyReviewed:false,
 workerMediaAndErasureFunctionalityTested:false,
 productionChange:false,releaseApproved:false,betaApproved:false,
})+'\n');
