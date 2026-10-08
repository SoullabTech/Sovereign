/** @jest-environment node */
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db/postgres';
import { reserveSourceCustody, markSourceCustodyWriting, markSourceCustodyCommitted, SourceCustodyReservationRefused } from '../sourceCustodyReservations';
import type { SourceCustodyIntent } from '../sourceCustodyFiles';
jest.mock('@/lib/db/postgres',()=>({pool:{connect:jest.fn()}}));
const connect=pool!.connect as jest.Mock;
const intent:SourceCustodyIntent={version:1, operationId:'11111111-1111-4111-8111-111111111111',memberId:'22222222-2222-4222-8222-222222222222',uploadId:'33333333-3333-4333-8333-333333333333'};
const req=()=>new NextRequest('http://localhost/api/writers-studio/sources',{headers:{'x-session-token':'test-session-fixture'}});
let client:any;
beforeEach(()=>{jest.clearAllMocks();client={release:jest.fn(),query:jest.fn(async(sql:string)=>({rows:sql.includes('FROM auth_sessions')?[{id:'44444444-4444-4444-8444-444444444444'}]:sql.includes('RETURNING operation_id')||sql.includes('RETURNING op.operation_id')?[{operation_id:intent.operationId}]:[]}))};connect.mockResolvedValue(client);});
test('reservation serializes on session and commits intent before any other work',async()=>{
 await reserveSourceCustody(req(),intent.memberId,intent);
 expect(client.query.mock.calls.map(([sql]:[string])=>sql.trim().split(/\s+/)[0])).toEqual(['BEGIN','SELECT','INSERT','COMMIT']);
 expect(client.query.mock.calls[1][0]).toContain('FOR UPDATE NOWAIT');
 expect(client.query.mock.calls[2][1]).toEqual([intent.operationId,'44444444-4444-4444-8444-444444444444',intent.memberId,intent.uploadId]);
 expect(client.release).toHaveBeenCalledTimes(1);
});
test('missing authenticated session refuses and rolls back before reservation insert',async()=>{
 client.query.mockImplementation(async(sql:string)=>({rows:[]}));
 await expect(reserveSourceCustody(req(),intent.memberId,intent)).rejects.toBeInstanceOf(SourceCustodyReservationRefused);
 expect(client.query.mock.calls.map(([sql]:[string])=>sql.trim().split(/\s+/)[0])).toEqual(['BEGIN','SELECT','ROLLBACK']);
});
test('forged identity and malformed upload IDs refuse without DB access',async()=>{
 await expect(reserveSourceCustody(req(),'55555555-5555-4555-8555-555555555555',intent)).rejects.toBeInstanceOf(SourceCustodyReservationRefused);
 await expect(reserveSourceCustody(req(),intent.memberId,{...intent,uploadId:'../evil'})).rejects.toBeInstanceOf(SourceCustodyReservationRefused);
 expect(connect).not.toHaveBeenCalled();
});
test('reservation SQL failure cannot leave a successful apparent reservation',async()=>{
 client.query.mockImplementation(async(sql:string)=>{
   if(sql.includes('FROM auth_sessions'))return {rows:[{id:'44444444-4444-4444-8444-444444444444'}]};
   if(sql.includes('INSERT'))throw Object.assign(new Error('posture refused'),{code:'23514'});
   return {rows:[]};
 });
 await expect(reserveSourceCustody(req(),intent.memberId,intent)).rejects.toMatchObject({code:'23514'});
 expect(client.query.mock.calls.at(-1)[0]).toBe('ROLLBACK');
 expect(client.release).toHaveBeenCalledTimes(1);
});
test('staging and commitment use the supplied transaction client',async()=>{
 await markSourceCustodyWriting(client,intent);
 await markSourceCustodyCommitted(client,intent);
 expect(client.query).toHaveBeenCalledTimes(2);
 expect(client.query.mock.calls[1][0]).toContain('FROM workbench_uploads u');
 expect(client.query.mock.calls[1][0]).toContain('transcription_status IN');
});
test('missing committed source refuses before fake successful finalization',async()=>{
 client.query.mockResolvedValue({rows:[]});
 await expect(markSourceCustodyCommitted(client,intent)).rejects.toBeInstanceOf(SourceCustodyReservationRefused);
});
