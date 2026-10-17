/**
 * R75 isolated PG16 witness proof with NO network and NO provider call.
 * SQL tables under scripts/ops/fixtures are never production migrations.
 */
import {spawnSync} from 'node:child_process';
import {createHash,generateKeyPairSync,randomBytes,randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {selfServing,servingIdentityFor}
 from '@/lib/consciousness/servingIdentity';
import {captureCompletedProducerR75,verifyCompletedProducerR75,
 type R75Assertion} from '@/lib/writersStudio/provenance/editorialModelProducerR75';

const DIR='/Volumes/T7 Shield/ws-beta-r75-provenance-evidence-20261017';
const uuid=()=>randomUUID();
if(process.env.R75_PRODUCER_PG16_FIXTURE!=='fictional-only'||
 process.env.NODE_ENV!=='test')throw Error('R75_DISPOSABLE_TEST_OPT_IN_REQUIRED');
const name='ws-r75-producer-'+uuid().slice(0,11);
const path=join(DIR,'run-'+uuid().slice(0,11));
mkdirSync(path,{recursive:true,mode:0o700});
const checks:string[]=[];
let started=false;let disposed=false;let error:string|null=null;
function docker(args:string[],ok=true):{status:number;stdout:string;stderr:string}{
 const p=spawnSync('docker',args,{encoding:'utf8',timeout:35000});
 const status=p.status??1;
 if(ok&&status!==0)throw Error('R75_DOCKER_OPERATION_FAILED_'+args[0]+':'+status);
 return {status,stdout:p.stdout??'',stderr:p.stderr??''};
}
function sql(q:string,expectOK=true){
 const r=docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_r75','-c',q],expectOK);
 return r;
}
function check(v:unknown,label:string){
 if(!v)throw Error('R75_CHECK_FAILED_'+label);
 checks.push(label);
}
const quote=(v:unknown)=>"'"+String(v).replace(/'/g,"''")+"'";
try{
 docker(['image','inspect','postgres:16.13']);
 check(true,'cached PG16 image without pull');
 docker(['run','--pull','never','-d','--name',name,'--network','none',
  '--memory','512m','--cpus','1','--pids-limit','128',
  '--security-opt','no-new-privileges',
  '--tmpfs','/var/lib/postgresql/data:rw,nosuid,size=256m',
  '-e','POSTGRES_USER=fict','-e','POSTGRES_DB=ws_r75',
  '-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:16.13']);
 started=true;
 for(let n=0;n<35;n++){
  const result=sql('SELECT 1',false);
  if(result.status===0&&result.stdout.trim()==='1')break;
  if(n===34)throw Error('R75_PG16_NOT_READY');
  spawnSync('sleep',['0.15']);
 }
 check(sql('SHOW server_version_num').stdout.trim().startsWith('160'),
  'real PostgreSQL16');
 const cfg=JSON.parse(docker(['inspect',name,'--format','{{json .HostConfig}}']).stdout);
 check(cfg.NetworkMode==='none'&&
  (!cfg.PortBindings||Object.keys(cfg.PortBindings).length===0)&&
  (!cfg.Binds||cfg.Binds.length===0),
  'no port, network or host binds');
 check(sql('CREATE TABLE members(id uuid PRIMARY KEY)').status===0,
  'fictional member schema');
 const member='11111111-1111-4111-8111-111111111111';
 const work='22222222-2222-4222-8222-222222222222';
 const draft='33333333-3333-4333-8333-333333333333';
 const section='44444444-4444-4444-8444-444444444444';
 const chain=uuid(),maiaVersion=uuid(),memberVersion=uuid();
 sql('INSERT INTO members(id) VALUES('+quote(member)+')');
 const src='database/migrations/20260914000001_proposal_succession.sql';
 docker(['cp',src,name+':/tmp/proposal.sql']);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_r75','-f','/tmp/proposal.sql']);
 const pathSQL='scripts/ops/fixtures/wsR75FictionalProducerWitness.sql';
 docker(['cp',pathSQL,name+':/tmp/witness.sql']);
 docker(['exec',name,'psql','-XAtq','-v','ON_ERROR_STOP=1',
  '-U','fict','-d','ws_r75','-f','/tmp/witness.sql']);
 check(sql('SELECT count(*) FROM ws_r75_fixture_producer_witness')
  .stdout.trim()==='0','isolated immutable SQL witness installed');
 sql(`INSERT INTO proposal_chains(id,member_id,work_id,draft_id,
    base_version,target_section_id,expected_text)
    VALUES(${[chain,member,work,draft,3,section,'invented source'].map(quote).join(',')})`);
 sql(`INSERT INTO proposal_versions(id,chain_id,author,formulation)
    VALUES(${[memberVersion,chain,'member','first invented option'].map(quote).join(',')})`);
 sql(`INSERT INTO proposal_versions(id,chain_id,author,formulation,supersedes)
    VALUES(${[maiaVersion,chain,'maia','second invented option',memberVersion].map(quote).join(',')})`);
 check(sql('SELECT count(*) FROM proposal_versions').stdout.trim()==='2',
  'actual immutable proposal succession 2 versions');
 const secret=randomBytes(32),keys=generateKeyPairSync('ed25519');
 const response={
  text:'second invented option',provider:'ollama' as const,
  model:'qwen2.5:7b',serving:servingIdentityFor({
   intendedProvider:'anthropic',intendedModel:'claude-sonnet-4-6',
   servedProvider:'ollama',servedModel:'qwen2.5:7b',
   reason:'synthetic fallback fixture',
  }),
  metadata:{generationTime:1,stopReason:'end_turn'},
 };
 const scope={
  memberId:member,manuscriptId:work,draftId:draft,sectionId:section,
  proposalVersionId:maiaVersion,baseVersion:3,consentSequence:7,
  policySHA256:createHash('sha256').update('fiction-only policy').digest('hex'),
  instructionContractSHA256:createHash('sha256')
   .update('fiction-only instruction contract').digest('hex'),
 };
 const now=Date.now();
 const signed=captureCompletedProducerR75({
  scope,contentSecret:secret,signingKey:keys.privateKey,nowMs:now,
 },response);
 check(!!signed,'synthetic provider response captured by server signer');
 const a=signed!.assertion;
 const row=[
  a.scope.proposalVersionId,chain,a.scope.memberId,a.scope.manuscriptId,
  a.scope.draftId,a.scope.sectionId,a.scope.baseVersion,a.scope.consentSequence,
  a.scope.policySHA256,a.scope.instructionContractSHA256,
  a.serverInvocationId,a.producer.servedProvider,a.producer.servedModel,
  a.producer.intendedProvider,a.producer.intendedModel,
  a.producer.divergence,a.proposalCommitment,a.issuedAtMs,signed!.signature,
 ];
 const columns=[
  'proposal_version_id','proposal_chain_id','member_id','manuscript_id',
  'draft_id','section_id','base_version','consent_sequence',
  'policy_sha256','instruction_contract_sha256','server_invocation_id',
  'served_provider','served_model','intended_provider','intended_model',
  'divergence','proposal_commitment','signed_at_ms','signature',
 ];
 sql(`INSERT INTO ws_r75_fixture_producer_witness
 (${columns.join(',')}) VALUES(${row.map(quote).join(',')})`);
 check(sql('SELECT count(*) FROM ws_r75_fixture_producer_witness')
  .stdout.trim()==='1','one verified proposal receipt committed to PostgreSQL');
 const received=JSON.parse(sql(`SELECT row_to_json(w) FROM
 ws_r75_fixture_producer_witness w LIMIT 1`).stdout.trim()) as Record<string,unknown>;
 const recovered:R75Assertion={
  protocol:a.protocol,serverInvocationId:String(received.server_invocation_id),
  scope:{
   memberId:String(received.member_id),manuscriptId:String(received.manuscript_id),
   draftId:String(received.draft_id),sectionId:String(received.section_id),
   proposalVersionId:String(received.proposal_version_id),
   baseVersion:Number(received.base_version),
   consentSequence:Number(received.consent_sequence),
   policySHA256:String(received.policy_sha256),
   instructionContractSHA256:String(received.instruction_contract_sha256),
  },
  producer:{
   servedProvider:received.served_provider as 'ollama',
   servedModel:String(received.served_model),
   intendedProvider:received.intended_provider as 'anthropic',
   intendedModel:String(received.intended_model),
   divergence:received.divergence as 'capability',
  },
  proposalCommitment:String(received.proposal_commitment),
  issuedAtMs:Number(received.signed_at_ms),
 };
 check(verifyCompletedProducerR75({
  assertion:recovered,signature:String(received.signature),
 },{
  expectedScope:scope,expectedProposal:response.text,
  contentSecret:secret,publicKey:keys.publicKey,nowMs:now+250,
 }).kind==='r75_verified_server_producer_witness',
 'physical immutable SQL proof verifies against trusted public key');
 check(verifyCompletedProducerR75({
  assertion:recovered,signature:String(received.signature),
 },{
  expectedScope:{...scope,consentSequence:8},expectedProposal:response.text,
  contentSecret:secret,publicKey:keys.publicKey,nowMs:now+250,
 }).kind==='r75_producer_unverified','consent epoch mismatch denied');
 check(sql('UPDATE ws_r75_fixture_producer_witness SET served_model='+quote('fake'),
  false).status!==0,'immutable SQL update refused');
 check(sql('DELETE FROM ws_r75_fixture_producer_witness',
  false).status!==0,'immutable SQL delete refused');
 check(sql(`INSERT INTO ws_r75_fixture_producer_witness
 (${columns.join(',')}) VALUES(${row.map(quote).join(',')})`,
  false).status!==0,'duplicate producing witness refused');
 const wrong=[...row];wrong[0]=memberVersion;wrong[10]=uuid();
 check(sql(`INSERT INTO ws_r75_fixture_producer_witness
 (${columns.join(',')}) VALUES(${wrong.map(quote).join(',')})`,
  false).status!==0,'member authored proposal cannot gain MAIA witness');
 check(sql(`SELECT count(*) FROM ws_r75_fixture_producer_witness`)
  .stdout.trim()==='1','all failed tamper attempts leave original row unchanged');
 check(!JSON.stringify(received).includes('invented option')&&
  !JSON.stringify(received).includes('fiction-only instruction contract'),
 'database witness carries neither proposal text nor prompt');
} catch(e){
 error=e instanceof Error?e.message:'unexpected_R75_error';
} finally {
 if(started){
  disposed=docker(['rm','-f','-v',name],false).status===0;
 }
}
if(disposed)checks.push('disposable database and synthetic keys removed');
const passed=!error&&disposed&&checks.length>=16;
const receipt={
 protocol:'soullab.ws.r75.fixture-signed-producer-pg16.v1',
 sourceCommit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout?.trim(),
 status:passed?'R75_PRODUCER_WITNESS_PG16_PASS_BETA_HOLD':'R75_PRODUCER_WITNESS_PG16_HELD',
 passedChecks:checks.length,checkNames:checks,
 privateKeysLogged:false,modelCalls:0,realMembers:0,
 network:'none',dbDisposable:disposed,releaseApproved:false,error,
};
const output=join(path,'R75_PRODUCER_WITNESS_PG16.json');
writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:receipt.status,checks:checks.length,
 source:receipt.sourceCommit,clean:disposed,error,
 receipt:output}));
if(!passed)process.exitCode=2;
