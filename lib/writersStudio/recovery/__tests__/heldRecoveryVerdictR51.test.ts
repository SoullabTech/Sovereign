import {classifyHeldRecoveryR51,R51_REAL_RECOVERY_ACTIONS_ENABLED} from '../heldRecoveryVerdictR51';
import type {R48Evidence} from '../heldSpentApplyEvidenceR48';
import type {R49Verdict,R49Counts} from '../heldVaultInventoryR49';

const counts:R49Counts={heads:1,versionRows:3,observedFiles:3,
 referencedValid:3,unreferencedCiphertext:0,missingCiphertext:0,
 corruptCiphertext:0,invalidManifest:0,brokenChains:0,
 headDisagreements:0,unsafeOrUnreadableFiles:0};
const vault:R49Verdict={
 protocol:'soullab.ws.r49.held-encrypted-vault-inventory.v1',
 kind:'FICTIONAL_CONSISTENT_SNAPSHOT_HOLD',counts,
 canDelete:false,canRelink:false,canPublish:false,
 canAdmitRealWriter:false,releaseApproved:false};
const confirmed:R48Evidence={
 protocol:'soullab.ws.r48.fictional-spent-apply-proof.v1',
 kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',action:'apply',
 generation:2,cipherSHA256:'a'.repeat(64),
 priorDraftVersionVerified:true,unchangedSectionIds:[],
 retryAuthorized:false,releaseApproved:false};
const unresolved:R48Evidence={
 protocol:'soullab.ws.r48.fictional-spent-apply-proof.v1',
 kind:'held_only',reason:'HELD_SPENT_WITHOUT_MATCHING_RECEIPT',
 retryAuthorized:false,releaseApproved:false};
const previous=process.env.R51_RECOVERY_JOIN_FIXTURE;
const classify=(apply:R48Evidence,overrides:Partial<R49Counts>={},
 kind:R49Verdict['kind']='FICTIONAL_CONSISTENT_SNAPSHOT_HOLD')=>
 classifyHeldRecoveryR51({apply,inventory:{
  ...vault,kind,counts:{...counts,...overrides},
 }});
const assertReadOnly=(r:ReturnType<typeof classify>)=>{
 expect(r).toMatchObject({canRetry:false,canRestore:false,
 canDelete:false,canRelink:false,canPublish:false,
 canAdmitRealWriter:false,releaseApproved:false});
};
beforeEach(()=>process.env.R51_RECOVERY_JOIN_FIXTURE='fictional-only');
afterAll(()=>previous===undefined?delete process.env.R51_RECOVERY_JOIN_FIXTURE:
 process.env.R51_RECOVERY_JOIN_FIXTURE=previous);

describe('R51 bounded encrypted recovery verdict',()=>{
 it('is compiled off and refuses without explicit fictional opt-in',()=>{
  expect(R51_REAL_RECOVERY_ACTIONS_ENABLED).toBe(false);
  delete process.env.R51_RECOVERY_JOIN_FIXTURE;
  const r=classify(confirmed);
  expect(r.status).toBe('HELD_UNVERIFIED_EVIDENCE');
  assertReadOnly(r);
 });
 it('a confirmed Apply plus consistent vault is still a HOLD',()=>{
  const r=classify(confirmed);
  expect(r.status).toBe('FICTIONAL_APPLY_CONFIRMED_WITH_BOUNDED_VAULT_HOLD');
  expect(r.applyObservation).toBe('confirmed');
  assertReadOnly(r);
 });
 it('spent but unproven Apply remains unresolved',()=>{
  const r=classify(unresolved);
  expect(r.status).toBe('HELD_SPENT_APPLY_UNRESOLVED');
  assertReadOnly(r);
 });
 it('a prior encrypted Apply never conceals an orphan',()=>{
  const r=classify(confirmed,{unreferencedCiphertext:1,observedFiles:4},
   'FICTIONAL_CUSTODY_REVIEW_REQUIRED');
  expect(r.status).toBe('HELD_ORPHAN_OR_UNSAFE_CIPHERTEXT');
  assertReadOnly(r);
 });
 it('missing or corrupt referenced ciphertext outranks orphan classification',()=>{
  for(const field of ['missingCiphertext','corruptCiphertext'] as const){
   const r=classify(confirmed,{[field]:1,referencedValid:2,
    unreferencedCiphertext:1},'FICTIONAL_CUSTODY_REVIEW_REQUIRED');
   expect(r.status).toBe('HELD_REFERENCED_CIPHERTEXT_MISSING_OR_CORRUPT');
   assertReadOnly(r);
  }
 });
 it('unsafe entries and broken history cannot be treated as clean',()=>{
  const cases=[
   [{unsafeOrUnreadableFiles:1},'HELD_ORPHAN_OR_UNSAFE_CIPHERTEXT'],
   [{brokenChains:1},'HELD_MANIFEST_OR_HISTORY_INCONSISTENT'],
   [{headDisagreements:1},'HELD_MANIFEST_OR_HISTORY_INCONSISTENT'],
   [{invalidManifest:1},'HELD_MANIFEST_OR_HISTORY_INCONSISTENT'],
  ] as const;
  for(const [change,status] of cases){
   const r=classify(confirmed,change,'FICTIONAL_CUSTODY_REVIEW_REQUIRED');
   expect(r.status).toBe(status);
   assertReadOnly(r);
  }
 });
 it('empty, negative or impossible inventory counts fail closed',()=>{
  for(const change of [{heads:0},{versionRows:0},
   {referencedValid:10},{corruptCiphertext:-1}]){
   const r=classify(confirmed,change);
   expect(r.status).toBe('HELD_UNVERIFIED_EVIDENCE');
  }
 });
 it('invalid release capability or falsified proof fails closed',()=>{
  const cases=[
   {apply:confirmed,inventory:{...vault,canDelete:true as false}},
   {apply:{...confirmed,cipherSHA256:'invalid'},
    inventory:vault},
   {apply:{...confirmed,priorDraftVersionVerified:false},
    inventory:vault},
   {apply:{...confirmed,protocol:'forged' as never},inventory:vault},
  ];
  for(const fixture of cases){
   const r=classifyHeldRecoveryR51({
    apply:fixture.apply as R48Evidence,
    inventory:fixture.inventory,
   });
   expect(r.status).toBe('HELD_UNVERIFIED_EVIDENCE');
   assertReadOnly(r);
  }
 });
 it('result includes only aggregated counts, never source locator details',()=>{
  const result=JSON.stringify(classify(confirmed));
  for(const forbidden of ['cipherSHA256','memberId','workId',
   'approvalToken','cipher_ref','/tmp/'])
   expect(result).not.toContain(forbidden);
 });
});
