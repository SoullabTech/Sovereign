/** Real read-only Source→Draft lineage SQL; all rows are invented. */
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
import {query} from '@/lib/db/postgres';
import {
 inspectProtectedManifestLineage,WS_REAL_ENCRYPTED_WRITES_ENABLED,
} from '../inspectProtectedManifestLineage';

const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const OTHER='44444444-4444-4444-8444-444444444444';
const pg=query as jest.Mock;
const check=(memberId=MEMBER,manuscriptId=WORK)=>
 inspectProtectedManifestLineage({verifiedMemberId:memberId,manuscriptId});

beforeEach(()=>{
 jest.resetAllMocks();
 pg.mockResolvedValue({rows:[{chain_count:1,head_generation:3}]});
});

describe('real Source→Draft metadata-only custody observation',()=>{
 it('matches exact member/manuscript and the R32→R42→R35 chain, never raw content',async()=>{
  expect(WS_REAL_ENCRYPTED_WRITES_ENABLED).toBe(false);
  const result=await check();
  expect(result).toEqual({
   kind:'encrypted_lineage_metadata_observed_only',
   initialGeneration:1,headGeneration:3,
   ciphertextPhysicallyOpened:false,
   independentKeyGrantVerified:false,keyGrantVerified:false,
   mayWrite:false,releaseApproved:false,
  });
  expect(pg).toHaveBeenCalledTimes(1);
  expect(pg.mock.calls[0][1]).toEqual([WORK,MEMBER]);
  const sql=String(pg.mock.calls[0][0]);
  for(const required of [
   'FROM member_manuscripts m',
   'JOIN writers_studio_r42_held_start_intents i',
   'JOIN writers_studio_r42_held_start_links l',
   'JOIN writers_studio_r32_held_originals s',
   'JOIN writers_studio_r35_draft_heads h',
   'JOIN writers_studio_r35_draft_versions first_draft',
   'JOIN writers_studio_r35_draft_versions head_draft',
   'm.id=$1 AND m.member_id=$2',
   'i.draft_key_id<>s.key_id',
   'first_draft.cipher_sha256=l.draft_cipher_sha256',
   'head_draft.checkpoint_count=h.checkpoint_count',
  ])expect(sql).toContain(required);
  expect(sql).not.toMatch(/\\b(?:INSERT|UPDATE|DELETE|RETURNING)\\b/);
  for(const forbidden of ['source_text','original_filename',
   'section.body','verbatim_text','raw_key','key_bytes'])
   expect(sql.toLowerCase()).not.toContain(forbidden);
 });
 it('invalid or foreign caller scope is never a grant',async()=>{
  const bad=await check('not-a-real-member',WORK);
  expect(bad).toMatchObject({kind:'held_only',
   reason:'invalid_scope',mayWrite:false,releaseApproved:false});
  expect(pg).not.toHaveBeenCalled();
  pg.mockResolvedValueOnce({rows:[{chain_count:0,head_generation:0}]});
  expect(await check(MEMBER,OTHER)).toMatchObject({
   kind:'held_only',reason:'missing_or_inconsistent_link',
   keyGrantVerified:false,mayWrite:false,releaseApproved:false,
  });
 });
 it('missing Source, intent, Draft or linked first version remains HELD',async()=>{
  pg.mockResolvedValue({rows:[{chain_count:0,head_generation:0}]});
  expect(await check()).toMatchObject({kind:'held_only',
   reason:'missing_or_inconsistent_link'});
 });
 it('duplicate/ambiguous linked manifests cannot authorize editing',async()=>{
  pg.mockResolvedValue({rows:[{chain_count:2,head_generation:3}]});
  expect(await check()).toMatchObject({kind:'held_only',
   reason:'missing_or_inconsistent_link',releaseApproved:false});
 });
 it('moved generation, malformed shape, incorrect type or missing row refuses',async()=>{
  for(const record of [
   {chain_count:1,head_generation:0},
   {chain_count:1,head_generation:'3'},
   {chain_count:1,head_generation:1.5},
   {chain_count:'1',head_generation:3},
  ]){
   pg.mockResolvedValueOnce({rows:[record]});
   expect(await check()).toMatchObject({kind:'held_only',
    reason:'missing_or_inconsistent_link',mayWrite:false});
  }
  pg.mockResolvedValueOnce({rows:[]});
  expect(await check()).toMatchObject({kind:'held_only',
   reason:'missing_or_inconsistent_link'});
 });
 it('missing review-only tables or PostgreSQL outage cannot downgrade to legacy plaintext',async()=>{
  pg.mockRejectedValueOnce(Error('fictional-only table not deployed'));
  const r=await check();
  expect(r).toEqual({
   kind:'held_only',reason:'metadata_store_unavailable',
   keyGrantVerified:false,mayWrite:false,releaseApproved:false,
  });
  expect(JSON.stringify(r)).not.toContain('fictional-only table');
 });
});
