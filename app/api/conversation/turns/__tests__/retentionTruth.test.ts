import {NextRequest} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {query} from '@/lib/db/postgres';
import {TurnsStore} from '@/lib/memory/stores/TurnsStore';
import {GET,POST} from '../route';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/memory/stores/TurnsStore',()=>({TurnsStore:{addAuditedExchange:jest.fn()}}));

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const who=getMemberIdFromRequest as jest.Mock;
const db=query as jest.Mock;
const add=TurnsStore.addAuditedExchange as jest.Mock;
const get=(user=A)=>new NextRequest(
  'http://127.0.0.1:38030/api/conversation/turns?sessionId=fiction-A&userId='+user);
const post=(body:Record<string,unknown>)=>new NextRequest(
  'http://127.0.0.1:38030/api/conversation/turns',{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),
  });
const normal={userId:A,sessionId:'fiction-A',userMessage:'fiction input',assistantMessage:'fiction reply'};

describe('R5e MAIA turn storage truth, account scope and no-cache contract',()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
    who.mockResolvedValue(A);
    db.mockResolvedValue({rows:[]});
    add.mockResolvedValue(undefined);
  });
  it('GET missing table refuses false empty-history success',async()=>{
    db.mockRejectedValue(new Error('relation "conversation_turns" does not exist'));
    const r=await GET(get());
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({success:false,error:'Conversation history unavailable'});
    expect(r.headers.get('cache-control')).toContain('private');
    expect(r.headers.get('cache-control')).toContain('no-store');
    expect(r.headers.get('vary')).toContain('Cookie');
  });
  it('POST missing table refuses false durable-save success',async()=>{
    add.mockRejectedValue(new Error('relation "conversation_turns" does not exist'));
    const r=await POST(post(normal));
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({success:false,error:'Conversation was not saved'});
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('normal member history response is private no-store',async()=>{
    // R4F's protected-origin lookup runs before the member-scoped turn query.
    db.mockImplementation(async (sql:string)=>{
      if (sql.includes('AS protected WHERE protected.session_id')) return {rows:[]};
      return {rows:[{id:'fiction-turn',content:'FICTION'}]};
    });
    const r=await GET(get());
    expect(r.status).toBe(200);
    expect((await r.json()).messages).toHaveLength(1);
    expect(r.headers.get('cache-control')).toContain('private');
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('never permits A to claim member B on GET or POST',async()=>{
    expect((await GET(get(B))).status).toBe(403);
    expect((await POST(post({...normal,userId:B}))).status).toBe(403);
    expect(db).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });
  it('refuses unauthenticated history and persistence before database',async()=>{
    who.mockResolvedValue(null);
    expect((await GET(get())).status).toBe(401);
    expect((await POST(post(normal))).status).toBe(401);
    expect(db).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });
  it('Sanctuary response is private and does not write turns',async()=>{
    const r=await POST(post({...normal,isSanctuary:true}));
    expect(r.status).toBe(200);
    expect((await r.json()).sanctuary).toBe(true);
    expect(r.headers.get('cache-control')).toContain('no-store');
    expect(add).not.toHaveBeenCalled();
  });
  it('successful normal write is returned with private no-store headers',async()=>{
    const r=await POST(post(normal));
    expect(r.status).toBe(200);
    expect((await r.json()).success).toBe(true);
    expect(r.headers.get('cache-control')).toContain('no-store');
    expect(add).toHaveBeenCalledTimes(1);
  });
});
