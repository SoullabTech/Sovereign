/**
 * Real Writer's Studio: internal owner-scoped, READ-ONLY census of the
 * original encrypted Source → separately-keyed initial Draft metadata chain.
 *
 * This is NOT encryption/decryption verification, not a key grant, not
 * independent revocation, and not authority to edit. R32/R35/R42 DDL is
 * review-only and currently NOT a production migration. A missing table,
 * unverifiable link or unavailable database must remain HELD, with NO
 * plaintext fallback and no source text/filename/key material selected.
 */
import {query} from '@/lib/db/postgres';

export const WS_REAL_ENCRYPTED_WRITES_ENABLED=false as const;
export const WS_CUSTODY_METADATA_PROTOCOL=
 'soullab.ws.verified-source-draft-metadata.hold.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export type CustodyMetadataResult=
 | {readonly kind:'held_only';
    readonly reason:'invalid_scope'|'missing_or_inconsistent_link'|
      'metadata_store_unavailable';
    readonly keyGrantVerified:false;readonly mayWrite:false;
    readonly releaseApproved:false;}
 | {readonly kind:'encrypted_lineage_metadata_observed_only';
    readonly initialGeneration:1;readonly headGeneration:number;
    readonly independentKeyGrantVerified:false;
    readonly ciphertextPhysicallyOpened:false;
    readonly keyGrantVerified:false;readonly mayWrite:false;
    readonly releaseApproved:false;};

const held=(reason:Extract<CustodyMetadataResult,{kind:'held_only'}>['reason']):
 CustodyMetadataResult=>({
  kind:'held_only',reason,keyGrantVerified:false,mayWrite:false,
  releaseApproved:false,
 });

/**
 * All relations are checked in ONE PostgreSQL SELECT snapshot, matching
 * member + exact manuscript ID, immutable R32 original, R42 intention and
 * first Draft link, R35 first encrypted manifest and CURRENT head manifest.
 *
 * R35 work_id means manuscript UUID; an optional Living Work declaration
 * has a separate UUID and NEVER determines an encryption-key scope.
 * SQL returns counts and generation ONLY, no ciphertext hashes or refs.
 */
export async function inspectProtectedManifestLineage(input:{
 readonly verifiedMemberId:string;readonly manuscriptId:string;
}):Promise<CustodyMetadataResult>{
 if(!input||!UUID.test(input.verifiedMemberId||'')||
    !UUID.test(input.manuscriptId||''))
  return held('invalid_scope');
 try{
  const checked=await query<{
   chain_count:number;head_generation:number;
  }>(`
    SELECT count(*)::int AS chain_count,
       coalesce(max(h.generation),0)::int AS head_generation
    FROM member_manuscripts m
    JOIN writers_studio_r42_held_start_intents i
      ON i.work_id=m.id AND i.member_id=m.member_id
    JOIN writers_studio_r42_held_start_links l
      ON l.work_id=i.work_id AND l.member_id=i.member_id
     AND l.arrival_id=i.arrival_id
     AND l.source_manifest_id=i.source_manifest_id
     AND l.source_pair_sha256=i.source_pair_sha256
     AND l.draft_plan_hmac=i.draft_plan_hmac
     AND l.draft_generation=1
    JOIN writers_studio_r32_held_originals s
      ON s.id=i.source_manifest_id
     AND s.member_id=i.member_id
     AND s.manuscript_id=i.work_id
     AND s.arrival_id=i.arrival_id
     AND s.pair_sha256=i.source_pair_sha256
     AND s.work_generation=1 AND s.state='held_only'
    JOIN writers_studio_r35_draft_heads h
      ON h.work_id=i.work_id AND h.member_id=i.member_id
    JOIN writers_studio_r35_draft_versions first_draft
      ON first_draft.work_id=i.work_id
     AND first_draft.member_id=i.member_id
     AND first_draft.generation=1
     AND first_draft.action='start'
     AND first_draft.checkpoint_count=0
     AND first_draft.key_id=i.draft_key_id
     AND first_draft.cipher_sha256=l.draft_cipher_sha256
    JOIN writers_studio_r35_draft_versions head_draft
      ON head_draft.work_id=h.work_id
     AND head_draft.member_id=h.member_id
     AND head_draft.generation=h.generation
     AND head_draft.checkpoint_count=h.checkpoint_count
    WHERE m.id=$1 AND m.member_id=$2
      AND i.draft_key_id<>s.key_id
      AND h.generation>=1
   `,[input.manuscriptId,input.verifiedMemberId]);
  if(checked.rows.length!==1)return held('missing_or_inconsistent_link');
  const result=checked.rows[0];
  if(result?.chain_count!==1||
    !Number.isSafeInteger(result.head_generation)||
    result.head_generation<1)
   return held('missing_or_inconsistent_link');
  return {
   kind:'encrypted_lineage_metadata_observed_only',
   initialGeneration:1,headGeneration:result.head_generation,
   independentKeyGrantVerified:false,
   ciphertextPhysicallyOpened:false,
   keyGrantVerified:false,mayWrite:false,releaseApproved:false,
  };
 }catch{
  // Required source/draft metadata tables are NOT operational migrations.
  // Their absence/outage cannot become presumed custody or a plaintext fallback.
  return held('metadata_store_unavailable');
 }
}
