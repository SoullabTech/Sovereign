import {NextRequest} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {query} from '@/lib/db/postgres';
import {POST} from '../route';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
const current=getMemberIdFromRequest as jest.Mock;
const db=query as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
function request(body:unknown):NextRequest{
  return new NextRequest('http://127.0.0.1:38016/api/maia/session/start',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(body),
  });
}
const row={id:'fiction-session-1',started_at:new Date().toISOString(),status:'active'};

describe('MAIA session-start — R5c server-owned member and collision authority',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    current.mockResolvedValue(null);
    db.mockResolvedValue({rows:[row]});
  });
  it('refuses a member claim with no verified session, before any write',async()=>{
    const response=await POST(request({sessionId:'fiction-session-1',memberId:A}));
    expect(response.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
  });
  it('refuses an authenticated A cookie with a B member claim',async()=>{
    current.mockResolvedValue(A);
    const response=await POST(request({sessionId:'fiction-session-1',memberId:B}));
    expect(response.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
  });
  it('uses only verified A as durable owner when A is claimed',async()=>{
    current.mockResolvedValue(A);
    const response=await POST(request({sessionId:'fiction-session-1',memberId:A,anonId:'untrusted-guest'}));
    expect(response.status).toBe(200);
    const [sql,params]=db.mock.calls[0] as [string,unknown[]];
    expect(params[1]).toBe(A);
    expect(params[2]).toBeNull();
    expect(sql).toContain('maia_sessions.member_id IS NOT DISTINCT FROM EXCLUDED.member_id');
    expect(sql).not.toContain('member_id = COALESCE');
  });
  it('uses verified A even when caller omitted body memberId',async()=>{
    current.mockResolvedValue(A);
    const response=await POST(request({sessionId:'fiction-session-1'}));
    expect(response.status).toBe(200);
    expect(db.mock.calls[0][1][1]).toBe(A);
  });
  it('supports anonymous guest session without creating a member link',async()=>{
    const response=await POST(request({sessionId:'guest-fiction',anonId:'guest-fiction-1'}));
    expect(response.status).toBe(200);
    expect(db.mock.calls[0][1][1]).toBeNull();
    expect(db.mock.calls[0][1][2]).toBe('guest-fiction-1');
  });
  it('refuses an existing session ID whose member/guest owner did not match',async()=>{
    current.mockResolvedValue(A);
    db.mockResolvedValue({rows:[]});
    const response=await POST(request({sessionId:'shared-fiction',memberId:A}));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toBe('Session ownership conflict');
  });
  it('keeps guest session ID collision fail closed, not adopting new guest anonId',async()=>{
    db.mockResolvedValue({rows:[]});
    const response=await POST(request({sessionId:'guest-existing-id',anonId:'another-guest'}));
    expect(response.status).toBe(409);
  });
  it('refuses invalid member claim, guest ID and overlong session ID',async()=>{
    expect((await POST(request({sessionId:'fixture',memberId:{id:A}}))).status).toBe(400);
    expect((await POST(request({sessionId:'fixture',anonId:99}))).status).toBe(400);
    expect((await POST(request({sessionId:'x'.repeat(101),memberId:A}))).status).toBe(400);
    expect(db).not.toHaveBeenCalled();
  });
  it('refuses DB/session lookup failure rather than minting a guest member claim',async()=>{
    current.mockRejectedValue(new Error('fictional server auth failure'));
    const response=await POST(request({sessionId:'fixture',memberId:A}));
    expect(response.status).toBe(500);
    expect(db).not.toHaveBeenCalled();
  });
});
