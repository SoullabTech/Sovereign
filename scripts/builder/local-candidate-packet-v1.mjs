/**
 * EC1-R17 — pure projection from one AUTHORIZED W0/W2 Work into the legacy
 * local-native packet shape used by Path A. No IO, no execution, no authority minting.
 */
import crypto from 'node:crypto';
import { validateVerifierPlanV1 } from './local-verifier-plan-v1.mjs';

export const LOCAL_CANDIDATE_PACKET_VERSION='EC1-LC-PACKET.v1';
function deepFreeze(v){if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.freeze(v);for(const x of Object.values(v))deepFreeze(x);return v;}
function text(v){return typeof v==='string'?v.trim():'';}
function list(v){return Array.isArray(v)?v.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean):[];}
function digestText(v){return 'sha256:'+crypto.createHash('sha256').update(String(v)).digest('hex');}
function fail(reason,detail=null){return deepFreeze({ok:false,status:'REFUSED',reason,detail,packet:null,authorized_core_digest:null});}
function actsFromAuthority(a){
  const yes=[];const no=[];const set=(cond,act)=>{(cond?yes:no).push(act)};
  set(a.repository_read===true,'repo.read');
  set(a.repository_write==='worktree','repo.write:worktree');
  set(a.test_execution===true,'tests.run');
  set(a.network_external===true,'network.external');
  set(a.provider_spend===true,'provider.spend');
  set(a.production_read===true,'production.read');
  set(a.production_write===true,'production.write');
  set(a.deploy===true,'deploy');
  set(a.merge===true,'merge');
  no.push('authority.change');
  if(a.external_disclosure==='exact_bundle')yes.push('repo.disclose:external-readonly');
  else no.push('repo.disclose:external-readonly');
  return {authorized_acts:[...new Set(yes)],not_authorized_acts:[...new Set(no)]};
}

export function projectAuthorizedLocalCandidatePacketV1(envelope,{verification_plan}={}){
  const wu=envelope?.work_unit;const guard=envelope?.guard;
  if(!wu||!guard)return fail('AUTHORIZED_ENVELOPE_REQUIRED');
  if(wu.work_unit_version!=='W0.v2')return fail('W0_V2_REQUIRED');
  if(!['AUTHORIZED','ROUTED'].includes(wu.state?.lifecycle_state))return fail('AUTHORIZED_OR_ROUTED_STATE_REQUIRED',wu.state?.lifecycle_state??null);
  if(!text(guard.authorized_core_snapshot))return fail('AUTHORIZED_CORE_SNAPSHOT_REQUIRED');
  const a=wu.authority||{};
  if(!(a.repository_read===true&&a.repository_write==='worktree'&&a.shell==='bounded_write'&&a.test_execution===true))return fail('LOCAL_CANDIDATE_AUTHORITY_REQUIRED');
  if(a.network_external||a.provider_spend||a.production_read||a.production_write||a.deploy||a.merge||a.external_disclosure!=='none')return fail('LOCAL_CANDIDATE_AUTHORITY_TOO_BROAD');
  if(text(wu.provenance?.authorizing_act)==='')return fail('AUTHORIZING_ACT_REQUIRED');
  const plan=validateVerifierPlanV1(verification_plan);
  if(!plan.ok)return fail('STRUCTURED_VERIFIER_PLAN_REQUIRED',plan.reason);
  if(!plan.executable)return fail('STRUCTURED_VERIFIER_EFFECT_NOT_ADMITTED',plan.status);
  const allowed=list(wu.scope?.allowed_paths);
  if(allowed.length===0)return fail('BOUNDED_ALLOWED_PATHS_REQUIRED');
  const authority=actsFromAuthority(a);
  const id=text(wu.identity?.id);
  const packet={
    packet_version:LOCAL_CANDIDATE_PACKET_VERSION,
    work_unit_id:id,
    title:text(wu.identity?.objective).slice(0,96),
    objective:text(wu.identity?.objective),
    execution_lane:'local-native',
    canonical_sha:text(wu.scope?.base_ref),
    branch:`chore/ain-delegate-${id}`,
    worktree:null,
    governing_authority:text(wu.provenance.authorizing_act),
    established_facts:[],
    allowed_files:allowed,
    prohibited_files_actions:[
      'No production read/write, merge, deploy, external network, provider spend, or authority mutation.',
      'The model is toolless; JARVIS alone may admit and integrate the candidate inside the claimed worktree.',
      'Structured verifier execution is limited to the bound EC1-VERIFY.v1 inspection plan.',
    ],
    acceptance_criteria:list(wu.evaluation?.acceptance_conditions),
    verification_commands:[],
    verification_mode:'structured-v1',
    verification_plan:plan.plan,
    escalation_conditions:[...list(wu.evaluation?.falsification_conditions),...list(wu.evaluation?.stop_conditions)],
    max_attempts:1,
    expected_output:'One bounded JARVIS-authored candidate commit with NPA1 custody and structured verification evidence.',
    context_selectors:allowed,
    project:text(wu.identity?.programme),
    capability:'local-native-candidate',
    task_class:text(wu.identity?.task_shape),
    risk_class:'mechanical',
    priority:'current',dependencies:[],blockers:[],
    authorized_acts:authority.authorized_acts,
    not_authorized_acts:authority.not_authorized_acts,
    integration_actor:'jarvis',
    autonomy_ceiling:'LEVEL_2_IMPLEMENT',
  };
  return deepFreeze({ok:true,status:'PROJECTED',packet,authorized_core_digest:digestText(guard.authorized_core_snapshot),verification_plan_digest:plan.digest});
}
