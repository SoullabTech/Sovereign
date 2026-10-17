#!/usr/bin/env node
/**
 * Writer's Studio: one-source launch corridor audit.
 *
 * READ ONLY. No SQL, member files, website requests, keys, provider calls,
 * real author invitations or production writes. A green *source-convergence*
 * check is NEVER an operational release approval.
 *
 * --audit: 0 when expected source identities are intact, still HOLD.
 * --release-gate: 2 while legacy routes/unmounted protection or any external
 *                 release gate remains unresolved; 3 on source drift.
 *
 * This may not issue a GO. That requires a separately governed,
 * independently verified real-member/device/image/custody decision.
 */
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspect as inspectLegacy} from './wsBetaR47LegacyWriteInventory.mjs';
import {inspectR52} from './wsBetaR52LegacyIngressReleaseGate.mjs';

export const CHECKS=Object.freeze([
 {file:'app/writers-studio/page.tsx',must:['P4R1StudioHost','defaultMode="home"'],label:'canonical_studio_page'},
 {file:'app/dev/writers-studio-p4r1/P4R1StudioHost.tsx',
  must:['P4R1WriteEditController','P4R1DevelopController','P4R1ReviewController','ListenPilot'],
  label:'canonical_writer_develop_review_listen'},
 {file:'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
  must:['adoptBoundEditorialVersion(','/api/writers-studio/editorial/undo',
    '/api/sovereign/manuscripts/'],
  label:'current_editor_uses_legacy_editing'},
 {file:'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx',
  must:['P4R1Pc3WriteEditView'],label:'real_writer_edit_view'},
 {file:'app/api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness/route.ts',
  must:['verifyWriterReadinessScope(request,manuscriptId)',
   'protected_writer_not_yet_qualified','canSave:false,canApply:false,canUndo:false',
   'releaseApproved:false'],
  label:'real_authenticated_read_only_work_readiness'},
 {file:'lib/writersStudio/release/verifyWriterReadinessScope.ts',
  must:['getMemberIdFromSessionToken','living_work_expressions',
   "e.expression_type='manuscript'",'e.declared_by=$2','w.member_id=$2',
   'declaredLivingWorkIds','mayWrite:false'],
  label:'request_session_and_explicit_living_work_relationships'},
 {file:'lib/writersStudio/release/heldLegacyWriterFenceR52.ts',
  must:['R52_REAL_LEGACY_PILOT_FENCE_ENABLED=false as const'],
  label:'legacy_writer_ingress_guards_default_off'},
 {file:'lib/writersStudio/recovery/heldSourceDraftBridgeR42.ts',
  must:['R42_REAL_SOURCE_DRAFT_ENABLED=false'],label:'source_to_draft_held'},
 {file:'lib/writersStudio/recovery/heldDurableSignedApplyR46.ts',
  must:['R46_REAL_DURABLE_SIGNED_APPLY_ENABLED=false'],label:'durable_apply_held'},
 {file:'lib/writersStudio/recovery/heldDurableUndoR47.ts',
  must:['R47_REAL_DURABLE_UNDO_ENABLED=false'],label:'durable_undo_held'},
 {file:'lib/writersStudio/recovery/heldPrivateEditorialReviewR47.ts',
  must:['R47_REAL_PRIVATE_EDITORIAL_ENABLED=false'],label:'encrypted_proposal_held'},
 {file:'lib/writersStudio/recovery/heldEditorialRecoveryJoinR48.ts',
  must:['R48_REAL_EDITORIAL_JOIN_ENABLED=false'],label:'recovered_editorial_choice_held'},
 {file:'lib/writersStudio/recovery/heldVaultInventoryR49.ts',
  must:['R49_'],label:'read_only_orphan_inventory'},
 {file:'lib/writersStudio/recovery/heldRecoveryVerdictR51.ts',
  must:['R51_'],label:'bounded_recovery_verdict'},
 {file:'scripts/ops/wsBetaR49WholeWorkPG16.py',
  must:['fictional-only'],label:'single_work_physical_rehearsal'},
 {file:'scripts/ops/wsBetaR44CanonicalShellBrowser.cjs',
  must:['R44_CANONICAL_BROWSER_FIXTURE'],label:'canonical_browser_rehearsal'},
]);

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const PROTECTED_IMPORT_NAMES=Object.freeze([
 'heldSourceDraftBridgeR42','heldDurableSignedApplyR46',
 'heldDurableUndoR47','heldPrivateEditorialReviewR47',
 'heldEditorialRecoveryJoinR48',
]);
function walkRoutes(directory){
 if(!existsSync(directory))return [];
 const result=[];
 for(const entry of readdirSync(directory,{withFileTypes:true})){
  if(entry.name==='node_modules'||entry.name==='__tests__')continue;
  const f=join(directory,entry.name);
  if(entry.isDirectory())result.push(...walkRoutes(f));
  else if(entry.isFile()&&(entry.name==='route.ts'||entry.name==='route.tsx'))
   result.push(f);
 }
 return result;
}
export function inspectCandidate(root=ROOT,options={}){
 const base=resolve(root);
 const read=options.readText??(file=>readFileSync(file,'utf8'));
 const legacy=options.legacyReport??inspectLegacy(base);
 const ingress=options.legacyIngressReport??inspectR52(base);
 const ingressValid=ingress.status==='R52_DEFAULT_OFF_LEGACY_RELEASE_HOLD'&&
   ingress.legacyWriterRoutes===12&&ingress.guardedWriteMethods===13&&
   ingress.releaseApproved===false&&!ingress.failures?.length;
 const seen=[],changed=[];
 for(const item of CHECKS){
  const file=join(base,item.file);
  let contents;
  try{contents=read(file);}catch{contents='';}
  const missing=item.must.filter(m=>!contents.includes(m));
  seen.push({label:item.label,found:missing.length===0});
  if(missing.length)changed.push({
   file:item.file,missingMarkers:missing.length,
  });
 }
 const routeBindings=[];
 for(const file of walkRoutes(join(base,'app/api'))){
  let code='';
  try{code=read(file);}catch{continue;}
  if(PROTECTED_IMPORT_NAMES.some(symbol=>code.includes(symbol)))
   routeBindings.push(relative(base,file).split('\\').join('/'));
 }
 routeBindings.sort();
 const listed=Number(legacy.reconstructiveWriterCount)||0;
 const adjacent=Number(legacy.additionalCustodySurfaceCount)||0;
 const drift=changed.length>0||
  legacy.status==='INVENTORY_DRIFT_HOLD'||
  !Array.isArray(legacy.knownRoutes)||
  listed<12||adjacent<2||Array.isArray(legacy.missing)&&legacy.missing.length>0||
  Array.isArray(legacy.unlisted)&&legacy.unlisted.length>0||
  Array.isArray(legacy.drift)&&legacy.drift.length>0||
  !ingressValid;
 const unmet=[
  ...(listed>0?['unfenced_legacy_manuscript_writes']:[]),
  ...(routeBindings.length<PROTECTED_IMPORT_NAMES.length?
   ['actual_authenticated_writer_routes_not_protected']:[]),
  'real_member_consent_and_observed_author_choice_unverified',
  'independent_key_deletion_commit_fence_unverified',
  'old_plaintext_sql_wal_backup_reader_migration_unverified',
  'offsite_original_draft_private_review_and_key_restore_unverified',
  'enforced_shipping_build_signed_image_and_rollback_unverified',
  'real_mac_and_physical_iphone_safari_unverified',
  'independent_class_a_and_founder_individual_admission_unverified',
 ];
 return {
  protocol:'soullab.ws.beta.one-source-release-corridor.v1',
  sourceOnly:true,readOnly:true,memberDataTouched:false,
  codeContract:drift?'SOURCE_DRIFT_HOLD':'SOURCE_CONVERGED_HOLD',
  candidateRelease:'HOLD',releaseApproved:false,
  operatorOverrideAvailable:false,productionChanged:false,
  canonicalSourceCheckCount:seen.length,
  canonicalSourceChecksPassed:seen.filter(x=>x.found).length,
  realReadOnlyWorkReadinessPresent:
   seen.some(x=>x.label==='real_authenticated_read_only_work_readiness'&&x.found),
  explicitMemberWorkRelationshipVerifierPresent:
   seen.some(x=>x.label==='request_session_and_explicit_living_work_relationships'&&x.found),
  defaultOffLegacyIngressGuardsPresent:ingressValid,
  guardedLegacyWriteMethods:ingress.guardedWriteMethods??0,
  changedContracts:changed,
  knownLegacyWriterRoutes:listed,
  additionalCustodySurfaces:adjacent,
  activeProtectedRouteBindings:routeBindings,
  outstandingReleaseGates:unmet,
  caveat:'Source identity is not an operational authorization, independent trust witness, whole production build or beta admission.',
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2]??'--audit';
 if(!['--audit','--release-gate'].includes(mode)){
  process.stderr.write('Expected --audit or --release-gate\n');
  process.exit(64);
 }
 const result=inspectCandidate();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.codeContract==='SOURCE_DRIFT_HOLD')process.exitCode=3;
 else if(mode==='--release-gate')process.exitCode=2;
}
