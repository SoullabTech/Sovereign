import {TurnsStore} from '../stores/TurnsStore';
import {TurnPosture} from '@/lib/sanctuary/turnPosture';
import {query,transaction} from '@/lib/db/postgres';

jest.mock('@/lib/db/postgres',()=>({query:jest.fn(),transaction:jest.fn()}));
const db=query as jest.Mock;
const tx=transaction as jest.Mock;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const eid='77777777-7777-4777-8777-777777777777';
const posture=TurnPosture.resolve({sanctuary:false});
const call=()=>TurnsStore.addAuditedExchange(posture,A,'fiction-A','fictional user','fictional assistant',eid);

describe('R5f mandatory S5 consent and per-member turns',()=>{
  beforeEach(()=>{jest.clearAllMocks();});
  it('queries session turns using BOTH member ID and session ID',async()=>{
    db.mockResolvedValue({rows:[{role:'user',content:'A',createdAt:'now'}]});
    await TurnsStore.getSessionTurns('fiction-shared',A);
    expect(db).toHaveBeenCalledTimes(1);
    expect(db.mock.calls[0][0]).toContain('session_id = $1 AND user_id = $2');
    expect(db.mock.calls[0][1]).toEqual(['fiction-shared',A]);
  });
  it('requires an atomic transaction and verifies durable audit owner',async()=>{
    const commands:string[]=[];
    tx.mockImplementation(async callback=>callback({query:async(sql:string,params:unknown[])=>{
      commands.push(sql);
      if(sql.includes('SELECT member_id,session_id,posture FROM runtime_consent_state'))
        return {rows:[{member_id:A,session_id:'fiction-A',posture:'normal'}]};
      if(sql.startsWith('SELECT user_id,seq FROM conversation_turns'))
        return {rows:[{user_id:A,seq:0},{user_id:A,seq:1}]};
      return {rows:[]};
    }}));
    await call();
    expect(tx).toHaveBeenCalledTimes(1);
    expect(commands).toHaveLength(5);
    expect(commands[0]).toContain('INSERT INTO runtime_consent_state');
    expect(commands[1]).toContain('SELECT member_id,session_id,posture');
    expect(commands[2]).toContain('INSERT INTO conversation_turns');
    expect(commands[3]).toContain('INSERT INTO conversation_turns');
  });
  it('refuses a preexisting audit for another owner before inserting turns',async()=>{
    const statements:string[]=[];
    tx.mockImplementation(async callback=>callback({query:async(sql:string)=>{
      statements.push(sql);
      if(sql.startsWith('SELECT member_id,session_id,posture'))
        return {rows:[{member_id:B,session_id:'fiction-A',posture:'normal'}]};
      return {rows:[]};
    }}));
    await expect(call()).rejects.toThrow('consent record disagrees');
    expect(statements.filter(s=>s.includes('INSERT INTO conversation_turns'))).toHaveLength(0);
  });
  it('refuses incomplete turn pair and a swapped member owner',async()=>{
    for(const found of [[{user_id:A,seq:0}],[{user_id:B,seq:0},{user_id:B,seq:1}]]){
      tx.mockImplementation(async callback=>callback({query:async(sql:string)=>{
        if(sql.startsWith('SELECT member_id,session_id,posture'))
          return {rows:[{member_id:A,session_id:'fiction-A',posture:'normal'}]};
        if(sql.startsWith('SELECT user_id,seq FROM conversation_turns'))return {rows:found};
        return {rows:[]};
      }}));
      await expect(call()).rejects.toThrow('ownership/completeness');
    }
  });
  it('refuses sanctuary before any durable transaction',async()=>{
    const privatePosture=TurnPosture.resolve({sanctuary:true});
    await expect(TurnsStore.addAuditedExchange(privatePosture,A,'fiction-A','a','b',eid)).rejects.toThrow('posture');
    expect(tx).not.toHaveBeenCalled();
  });
});
