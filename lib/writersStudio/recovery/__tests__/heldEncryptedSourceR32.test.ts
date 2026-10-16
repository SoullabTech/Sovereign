import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,randomUUID} from 'node:crypto';
import {R11_CLASSIFIED_FIELDS,openWorkSnapshot,sealWorkSnapshot} from '../workEnvelopeV1';
import {
 R32_REAL_SOURCE_IMPORT_ENABLED,R32_HELD_SOURCE_NAMESPACE,
 R32_PRIVATE_ORIGINAL_PROTOCOL,
 importHeldEncryptedSourceR32,reopenHeldEncryptedSourceR32,
} from '../heldEncryptedSourceR32';
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('R32_TEST_MUST_NOT_QUERY')}),
 transaction:jest.fn(()=>{throw Error('R32_TEST_MUST_NOT_BEGIN_TRANSACTION')}),
}));
jest.mock('@/lib/storage/fileVault',()=>({
 writeDurableVaultBytes:jest.fn(()=>{throw Error('R32_TEST_MUST_NOT_WRITE_VAULT')}),
 readVaultBytes:jest.fn(()=>{throw Error('R32_TEST_MUST_NOT_READ_VAULT')}),
}));
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const old=process.env.R32_ENCRYPTED_SOURCE_FIXTURE;
const KEY={keyId:randomUUID(),keyBytes:randomBytes(32)};
const fixture={
 subject:{memberId:MEMBER,assertedBy:'server_verified_member_session' as const},
 workId:WORK,
 originalBytes:Buffer.from('PK fictional original'),
 extractedSourceText:Buffer.from('fictional manuscript source'),
 privateMetadata:{originalFilename:'secret-book.docx',format:'DOCX' as const,
  mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  extractor:'reviewed-demo',extractorVersion:'1.0'},
 custody:{key:KEY,signed:null,signer:null,independent:null},
};
afterAll(()=>{
 if(old===undefined)delete process.env.R32_ENCRYPTED_SOURCE_FIXTURE;
 else process.env.R32_ENCRYPTED_SOURCE_FIXTURE=old;
});
describe('R32 encrypted first Source admission remains fixture-only',()=>{
 it('real member source import is compiled OFF',()=>{
  expect(R32_REAL_SOURCE_IMPORT_ENABLED).toBe(false);
  expect(R32_HELD_SOURCE_NAMESPACE).toBe('ws-beta-r32-held-source');
 });
 it('requires fixture-only gate before database, vault or keys',async()=>{
  delete process.env.R32_ENCRYPTED_SOURCE_FIXTURE;
  await expect(importHeldEncryptedSourceR32(fixture))
    .rejects.toMatchObject({code:'r32_real_source_import_disabled'});
  await expect(reopenHeldEncryptedSourceR32({
    subject:fixture.subject,workId:WORK,custody:fixture.custody,
  })).rejects.toMatchObject({code:'r32_real_source_reopen_disabled'});
 });
 it('refuses a structurally untrusted client identity',async()=>{
  process.env.R32_ENCRYPTED_SOURCE_FIXTURE='fictional-only';
  await expect(importHeldEncryptedSourceR32({...fixture,
    subject:{memberId:MEMBER,assertedBy:'client_claimed' as never},
  })).rejects.toMatchObject({code:'r32_server_verified_identity_required'});
 });
 it('requires independent deletion authority even in fictitious mode',async()=>{
  process.env.R32_ENCRYPTED_SOURCE_FIXTURE='fictional-only';
  await expect(importHeldEncryptedSourceR32(fixture))
    .rejects.toMatchObject({code:'r32_independent_custody_required'});
 });
 it('provenance remains inside the existing R11 encrypted original field',()=>{
  expect(R11_CLASSIFIED_FIELDS).toHaveLength(11);
  expect(R11_CLASSIFIED_FIELDS).toContain('original_source.bytes');
  expect(R11_CLASSIFIED_FIELDS).not.toContain('original_source.private_metadata.v1');
  const recordId=randomUUID();
  const packet=Buffer.from(JSON.stringify({
    protocol:R32_PRIVATE_ORIGINAL_PROTOCOL,
    originalBase64:fixture.originalBytes.toString('base64'),
    privateMetadata:fixture.privateMetadata,
  }));
  const encrypted=sealWorkSnapshot({memberId:MEMBER,workId:WORK,generation:1},
    [{field:'original_source.bytes',recordId,value:packet}],KEY);
  expect(JSON.stringify(encrypted)).not.toContain('secret-book.docx');
  expect(openWorkSnapshot({memberId:MEMBER,workId:WORK,generation:1},
    encrypted,KEY)[0].value).toEqual(packet);
 });
 it('review-only table stores ONLY encrypted references and digests',()=>{
  const sql=readFileSync(join(process.cwd(),
   'docs/ops/WS_R32_ENCRYPTED_SOURCE_REVIEW_ONLY.sql'),'utf8');
  const definition=sql.split('CREATE TABLE writers_studio_r32_held_sources (')[1].split(');')[0];
  for(const sensitive of ['source_text','original_filename','original_bytes',
    'extraction_method','mime_type','proposed_text','body jsonb']){
   expect(definition).not.toMatch(new RegExp('\\b'+sensitive+'\\b','i'));
  }
  expect(definition).toContain('cipher_digest');
  expect(definition).toContain('cipher_ref');
  expect(definition).toContain('UNIQUE(member_id,work_id)');
 });
 it('does not install review-only table as a live migration or API route',()=>{
  const src=readFileSync(join(process.cwd(),
   'lib/writersStudio/recovery/heldEncryptedSourceR32.ts'),'utf8');
  expect(src).toContain("R32_REAL_SOURCE_IMPORT_ENABLED=false");
  expect(src).toContain("R32_ENCRYPTED_SOURCE_FIXTURE!=='fictional-only'");
  expect(src).not.toContain('INSERT INTO manuscript_source_arrivals');
  expect(src).not.toContain('UPDATE manuscript_sections');
 });
});
