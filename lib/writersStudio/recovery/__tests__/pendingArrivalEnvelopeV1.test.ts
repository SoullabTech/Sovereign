import { randomBytes, randomUUID } from 'node:crypto';
import { sealPendingArrival, openPendingArrival, type PendingSourceV1 } from '../pendingArrivalEnvelopeV1';
import { openWorkSnapshot, type WorkEncryptionKey } from '../workEnvelopeV1';

const memberId = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const otherMember = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const arrivalId = '306902ed-21a9-4c01-aa15-984755598218';
const otherArrival = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const context = { memberId, arrivalId, generation: 4 };
const key = (): WorkEncryptionKey => ({ keyId:randomUUID(), keyBytes:randomBytes(32) });
const original = Buffer.from([0x50,0x4b,0x03,0x04,0,0xff,0x80,0x01]);
const text = Buffer.from('Fictional passage\r\ncafé\u0301\0\n','utf8');
const file: PendingSourceV1 = {kind:'artifact_extraction',sourceText:text,
  originalBytes:original, originalFilename:'my privately named book.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const pasted: PendingSourceV1 = {kind:'member_supplied_text',
  sourceText:Buffer.from('A fictional pasted paragraph.\n'),originalBytes:null,originalFilename:null,mimeType:null};
const refuses = (run:()=>unknown,code:string)=>expect(run).toThrow(expect.objectContaining({code}));

describe('R12 pending arrivals have their own encrypted identity before manuscript claim',()=>{
  it('roundtrips every source byte and private filename inside encrypted payload',()=>{
    const k=key(),box=sealPendingArrival(context,file,k);
    expect(openPendingArrival(context,box,k)).toEqual(file);
    expect(Object.keys(box).sort()).toEqual(['ciphertext','iv','keyId','protocol','tag']);
    expect(JSON.stringify(box)).not.toContain('my privately named book');
    expect(JSON.stringify(box)).not.toContain(memberId);
    expect(JSON.stringify(box)).not.toContain(arrivalId);
    expect(JSON.stringify(box)).not.toContain('Fictional passage');
  });
  it('holds a paste without manufacturing an original Source file',()=>{
    const k=key(),box=sealPendingArrival(context,pasted,k);
    expect(openPendingArrival(context,box,k)).toEqual(pasted);
  });
  it('refuses identity substitution (member/arrival/generation)',()=>{
    const k=key(),box=sealPendingArrival(context,file,k);
    for(const changed of [
      {...context, memberId:otherMember},
      {...context, arrivalId:otherArrival},
      {...context, generation:3},
      {...context, generation:5},
    ])refuses(()=>openPendingArrival(changed,box,k),'pending_authentication_failed');
  });
  it('refuses an incorrect key, a reused key ID with different material, and malformed identity',()=>{
    const k=key(),box=sealPendingArrival(context,file,k);
    refuses(()=>openPendingArrival(context,box,key()),'wrong_pending_key_id');
    refuses(()=>openPendingArrival(context,box,{...k,keyBytes:randomBytes(32)}),'pending_authentication_failed');
    refuses(()=>sealPendingArrival({...context,arrivalId:'unverified-client-value'},file,k),'invalid_pending_identity');
    refuses(()=>sealPendingArrival(context,file,{...k,keyBytes:Buffer.alloc(12)}),'invalid_pending_key');
  });
  it('refuses mutated ciphertext and tag rather than returning partial text',()=>{
    const k=key(),box=sealPendingArrival(context,file,k);
    const flip=(v:string)=>{const b=Buffer.from(v,'base64');b[0]^=1;return b.toString('base64')};
    refuses(()=>openPendingArrival(context,{...box,ciphertext:flip(box.ciphertext)},k),'pending_authentication_failed');
    refuses(()=>openPendingArrival(context,{...box,tag:flip(box.tag)},k),'pending_authentication_failed');
    refuses(()=>openPendingArrival(context,{...box,iv:'?'},k),'invalid_pending_encoding');
  });
  it('refuses an artifact whose original is missing or whose private filename is invalid',()=>{
    const k=key();
    refuses(()=>sealPendingArrival(context,{...file,originalBytes:null},k),'missing_pending_original_bytes');
    refuses(()=>sealPendingArrival(context,{...file,originalFilename:null},k),'invalid_pending_original_filename');
  });
  it('refuses a paste with invented artifact or metadata provenance',()=>{
    const k=key();
    refuses(()=>sealPendingArrival(context,{...pasted,originalBytes:Buffer.from('fake')},k),
      'invented_pending_file_provenance');
    refuses(()=>sealPendingArrival(context,{...pasted,originalFilename:'guessed.docx'},k),
      'invented_pending_file_provenance');
  });
  it('does not permit pending ciphertext to be reinterpreted as an existing Work snapshot',()=>{
    const k=key(),box=sealPendingArrival(context,file,k);
    refuses(()=>openWorkSnapshot({memberId,workId:otherArrival,generation:4},
      box as unknown as Parameters<typeof openWorkSnapshot>[1],k),'unsupported_work_envelope');
  });
  it('refuses oversized arrivals; never silently truncates original or text',()=>{
    const k=key();
    refuses(()=>sealPendingArrival(context,{...file,originalBytes:Buffer.alloc(13*1024*1024)},k),
      'pending_snapshot_too_large');
    refuses(()=>sealPendingArrival(context,{...pasted,sourceText:Buffer.alloc(17*1024*1024)},k),
      'invalid_pending_source_text');
  });
  it('uses new random nonces for repeated encryption of same pending Source',()=>{
    const k=key(),a=sealPendingArrival(context,file,k),b=sealPendingArrival(context,file,k);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });
});
