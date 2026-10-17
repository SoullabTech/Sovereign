/**
 * R51 fictional-only, pure recovery evidence combination.
 * This takes TWO independently generated read-only structural reports.
 * It does no I/O and grants no permission to write, restore, retry,
 * relink, delete, publish, or admit a real author.
 *
 * PostgreSQL and filesystem observations are NOT an atomic snapshot.
 */
import type {R48Evidence} from './heldSpentApplyEvidenceR48';
import type {R49Counts,R49Verdict} from './heldVaultInventoryR49';

export const R51_REAL_RECOVERY_ACTIONS_ENABLED=false as const;
export const R51_PROTOCOL='soullab.ws.r51.bounded-evidence-verdict.v1' as const;
export type R51Status=
 |'HELD_UNVERIFIED_EVIDENCE'
 |'HELD_REFERENCED_CIPHERTEXT_MISSING_OR_CORRUPT'
 |'HELD_ORPHAN_OR_UNSAFE_CIPHERTEXT'
 |'HELD_MANIFEST_OR_HISTORY_INCONSISTENT'
 |'HELD_SPENT_APPLY_UNRESOLVED'
 |'HELD_APPLY_NOT_CONFIRMED'
 |'FICTIONAL_APPLY_CONFIRMED_WITH_BOUNDED_VAULT_HOLD';
type ApplyState='confirmed'|'spent_unresolved'|'unverified';
type VaultState='bounded_consistent'|'orphan_or_unsafe'|
 'missing_or_corrupt'|'manifest_inconsistent'|'unverified';
export type R51Verdict={
 protocol:typeof R51_PROTOCOL;status:R51Status;
 applyObservation:ApplyState;vaultObservation:VaultState;
 counts:R49Counts|null;
 canRetry:false;canRestore:false;canDelete:false;canRelink:false;
 canPublish:false;canAdmitRealWriter:false;releaseApproved:false;
};
const hold=(status:R51Status,applyObservation:ApplyState,
 vaultObservation:VaultState,counts:R49Counts|null):R51Verdict=>({
 protocol:R51_PROTOCOL,status,applyObservation,vaultObservation,counts,
 canRetry:false,canRestore:false,canDelete:false,canRelink:false,
 canPublish:false,canAdmitRealWriter:false,releaseApproved:false,
});
/** Only number/counts, not file names, member/Work identifiers or passages. */
export function classifyHeldRecoveryR51(input:{
 apply:R48Evidence;inventory:R49Verdict;
}):R51Verdict{
 if(R51_REAL_RECOVERY_ACTIONS_ENABLED!==false ||
  process.env.R51_RECOVERY_JOIN_FIXTURE!=='fictional-only')
  return hold('HELD_UNVERIFIED_EVIDENCE','unverified','unverified',null);
 const {apply,inventory}=input||{};
 if(!apply||!inventory||
  apply.protocol!=='soullab.ws.r48.fictional-spent-apply-proof.v1'||
  inventory.protocol!=='soullab.ws.r49.held-encrypted-vault-inventory.v1'||
  !['held_only','FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED'].includes(apply.kind)||
  !['FICTIONAL_CONSISTENT_SNAPSHOT_HOLD',
    'FICTIONAL_CUSTODY_REVIEW_REQUIRED'].includes(inventory.kind)||
  apply.releaseApproved!==false||apply.retryAuthorized!==false||
  inventory.releaseApproved!==false||inventory.canDelete!==false||
  inventory.canRelink!==false||inventory.canPublish!==false||
  inventory.canAdmitRealWriter!==false)
  return hold('HELD_UNVERIFIED_EVIDENCE','unverified','unverified',null);
 if(apply.kind==='FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED'&&
   (!Number.isSafeInteger(apply.generation)||apply.generation<2||
    !/^[a-f0-9]{64}$/.test(apply.cipherSHA256)||
    apply.priorDraftVersionVerified!==true))
  return hold('HELD_UNVERIFIED_EVIDENCE','unverified','unverified',null);
 const c=inventory.counts;
 if(!c||!Object.values(c).every(v=>Number.isSafeInteger(v)&&v>=0)||
  c.heads<1||c.versionRows<1||c.observedFiles<1||
  c.referencedValid>c.versionRows)
  return hold('HELD_UNVERIFIED_EVIDENCE','unverified','unverified',null);
 const a:ApplyState=apply.kind==='FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED'
  ?'confirmed':apply.reason==='HELD_SPENT_WITHOUT_MATCHING_RECEIPT'
  ?'spent_unresolved':'unverified';
 // Broad storage evidence overrides a narrower, correctly observed edit.
 if(c.missingCiphertext||c.corruptCiphertext)
  return hold('HELD_REFERENCED_CIPHERTEXT_MISSING_OR_CORRUPT',
   a,'missing_or_corrupt',c);
 if(c.unreferencedCiphertext||c.unsafeOrUnreadableFiles)
  return hold('HELD_ORPHAN_OR_UNSAFE_CIPHERTEXT',a,'orphan_or_unsafe',c);
 if(c.invalidManifest||c.brokenChains||c.headDisagreements||
  c.referencedValid!==c.versionRows||
  inventory.kind!=='FICTIONAL_CONSISTENT_SNAPSHOT_HOLD')
  return hold('HELD_MANIFEST_OR_HISTORY_INCONSISTENT',
   a,'manifest_inconsistent',c);
 if(a==='spent_unresolved')
  return hold('HELD_SPENT_APPLY_UNRESOLVED',a,'bounded_consistent',c);
 if(a!=='confirmed')
  return hold('HELD_APPLY_NOT_CONFIRMED',a,'bounded_consistent',c);
 return hold('FICTIONAL_APPLY_CONFIRMED_WITH_BOUNDED_VAULT_HOLD',
  a,'bounded_consistent',c);
}
