import {appendHeldRevisionR21,readHeldRevisionR21,
 R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED} from '../heldEncryptedHistoryR21';
import type {R21HeldWriter,Trust} from '../heldEncryptedHistoryR21';

jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(()=>{throw Error('R21_TEST_MUST_NOT_CONNECT_TO_DB')}),
 transaction:jest.fn(()=>{throw Error('R21_TEST_MUST_NOT_TRANSACTION')}),
}));

const member='11111111-1111-4111-8111-111111111111';
const work='33333333-3333-4333-8333-333333333333';
const writer:R21HeldWriter={kind:'held_only',
 origin:'https://soullab.life',subject:{memberId:member,
 assertedBy:'server_verified_member_session'}};
const trust:Trust={signed:null,signer:null,independent:null};
const saved=process.env.R21_FICTIONAL_ENCRYPTED_HISTORY;

describe('R21 fictional-only encrypted history source fence',()=>{
 afterAll(()=>{
  if(saved===undefined)delete process.env.R21_FICTIONAL_ENCRYPTED_HISTORY;
  else process.env.R21_FICTIONAL_ENCRYPTED_HISTORY=saved;
 });
 it('keeps real member storage statically disabled',()=>{
  expect(R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED).toBe(false);
 });
 it('normal runtime refuses before any database, key or writing',async()=>{
  delete process.env.R21_FICTIONAL_ENCRYPTED_HISTORY;
  await expect(appendHeldRevisionR21({writer,workId:work,
   generation:1,records:[],key:null as never,trust}))
   .rejects.toMatchObject({code:'r21_fixture_only'});
  await expect(readHeldRevisionR21({writer,workId:work,
   generation:1,key:null as never,trust}))
   .rejects.toMatchObject({code:'r21_fixture_only'});
 });
 it('even synthetic opt-in refuses missing independent deletion trust',async()=>{
  process.env.R21_FICTIONAL_ENCRYPTED_HISTORY='fictional-only';
  await expect(appendHeldRevisionR21({writer,workId:work,
   generation:1,records:[],key:{keyId:'44444444-4444-4444-8444-444444444444',
     keyBytes:Buffer.alloc(32)},trust}))
   .rejects.toMatchObject({code:'untrusted_deletion_checkpoint'});
 });
 it('synthetic opt-in does not accept claimed writer without held verified shape',async()=>{
  process.env.R21_FICTIONAL_ENCRYPTED_HISTORY='fictional-only';
  await expect(appendHeldRevisionR21({writer:{...writer,origin:'https://beta.soullab.life'} as never,
   workId:work,generation:1,records:[],key:null as never,trust}))
   .rejects.toMatchObject({code:'r21_unverified_preflight'});
 });
});
