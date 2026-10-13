import {beforeEach,describe,expect,it,jest} from '@jest/globals';
const mockQuery=jest.fn<(...args:unknown[])=>Promise<any>>();
const mockHistory=jest.fn<(...args:unknown[])=>Promise<any>>();
jest.mock('@/lib/db/postgres',()=>({query:(...args:unknown[])=>mockQuery(...args)}));
jest.mock('@/lib/ganesha/personalFieldContinuity',()=>({
  readPersonalFieldContinuity:(...args:unknown[])=>mockHistory(...args),
}));
import {
  composeVerifiedPersonalField,readVerifiedPersonalField,
  NATIVE_EVENTS_SQL,LEGACY_EVENTS_SQL,NATIVE_PEOPLE_SQL,LEGACY_PEOPLE_SQL,
  PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL,
} from '../personalFieldIntegration';
import {MEMBER_NOTES_READ_SQL,MEMBER_ATTENTION_READ_SQL} from '../memberFieldAuthoring';

const MEMBER='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const PERSONAL='33333333-3333-4333-8333-333333333333';
const DATE='2026-10-13T12:00:00Z';
const context=(status:'none'|'active'|'ambiguous'|'unavailable'='none')=>({
  memberId:MEMBER,legacyPersonalStatus:status,
  legacyPersonalPractitionerId:status==='active'?PERSONAL:null,
});
const history=(extras:Record<string,unknown>={})=>({
  owner:'member',access:'bounded_read_only',coverage:'personal_records_with_verified_provenance_only',
  legacyPersonal:{status:'none',referenced:false},
  records:{notes:[],attention:[],decisions:[],changes:[],processItems:[],...extras},
});
const note=(id:string,body='my note',createdAt=DATE)=>({id,body,section:'alive',createdAt});
const person=(id:string,name='I named someone',createdAt=DATE)=>({id,name,note:null,createdAt});
const event=(id:string,title='I added an event',eventAt=DATE)=>({id,title,eventAt,createdAt:DATE});
const attention=(id:string,label='My important note',position=0)=>({
  id,field:'important',kind:'note',label,createdAt:DATE,position,
});
function compose(input:Record<string,unknown>={}){
  return composeVerifiedPersonalField({
    legacyStatus:'none',history:history(),nativeNotes:[],nativeAttention:[],
    nativeEvents:[],nativePeople:[],legacyEvents:[],legacyPeople:[],...input,
  } as any);
}
beforeEach(()=>{
  mockQuery.mockReset();mockHistory.mockReset();
  mockHistory.mockResolvedValue(history());
  mockQuery.mockImplementation(async sql=>{
    if(sql===PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL)return {rows:[{ready:true}]};
    return {rows:[]};
  });
});
describe('G2-3D view composition preserves individual authorship',()=>{
  it('has no implied professional grant or interpretive ranking',()=>{
    const r=compose();
    expect(r).toMatchObject({owner:'member',personalOnly:true,
      access:'source_held_read_only',completeHistory:false,authoredRanking:'none',
      authoringEnabled:false});
  });
  it('combines different provenance without replacing original primary keys',()=>{
    const r=compose({legacyStatus:'active',history:history({notes:[note(OTHER,'historic')]}),
      nativeNotes:[note(MEMBER,'new')]});
    expect(r.notes.map(n=>n.id)).toEqual([OTHER,MEMBER]); // deterministic source-qualified tie
    expect(new Set(r.notes.map(n=>n.key)).size).toBe(2);
    expect(r.notes.map(n=>n.origin).sort()).toEqual(['historical-personal','member-native']);
    expect(r.notes.every(n=>n.editable===false)).toBe(true);
  });
  it('refuses improperly selected ambiguous or suspended history',()=>{
    for(const s of ['none','ambiguous','unavailable'] as const)
      expect(()=>compose({legacyStatus:s,history:history({notes:[note(OTHER)]})}))
        .toThrow(/not safely attributable/);
  });
  it('keeps personal native history even if historical identity is ambiguous',()=>{
    const r=compose({legacyStatus:'ambiguous',nativeNotes:[note(MEMBER)]});
    expect(r.notes).toHaveLength(1);
    expect(r.legacyStatus).toBe('ambiguous');
  });
  it('does not silently merge duplicate row IDs from conflicting custody',()=>{
    expect(()=>compose({legacyStatus:'active',nativeNotes:[note(MEMBER)],
      history:history({notes:[note(MEMBER,'conflict')]})})).toThrow(/ambiguous history/);
  });
  it('does not invent a unified human importance order across storage lineages',()=>{
    const r=compose({legacyStatus:'active',history:history({
      attention:[attention('legacy-first','First'),attention('legacy-second','Second')]}),
      nativeAttention:[attention(MEMBER,'Native-first',3),attention(OTHER,'Native-second',-2)]});
    expect(r.attention.memberNative.map(i=>i.label)).toEqual(['Native-second','Native-first']);
    expect(r.attention.historical.map(i=>i.label)).toEqual(['First','Second']);
    expect(r.attention.ordering).toBe('author_order_within_each_source_only');
  });
  it('neutralizes a revoked reference without leaking cached text',()=>{
    const r=compose({nativeAttention:[{...attention(MEMBER,'Old secret'),gone:true}]});
    expect(r.attention.memberNative[0].label).toBe('Reference unavailable');
    expect(JSON.stringify(r)).not.toContain('Old secret');
  });
  it('presents Events without falsely asserting server-local Today',()=>{
    const r=compose({legacyStatus:'active',
      nativeEvents:[event(MEMBER,'Tomorrow','2026-10-14T12:00:00Z')],
      legacyEvents:[event(OTHER,'Yesterday','2026-10-12T12:00:00Z')]});
    expect(r.events.map(e=>e.title)).toEqual(['Yesterday','Tomorrow']);
    expect(r.events[0].eventAt).toBe('2026-10-12T12:00:00.000Z');
    expect('today' in r).toBe(false);
  });
  it('People are explicitly member-authored, not inferred contacts',()=>{
    const r=compose({nativePeople:[person(MEMBER)]});
    expect(r.people[0].name).toBe('I named someone');
    expect(r.people[0].origin).toBe('member-native');
    expect('relationshipScore' in r.people[0]).toBe(false);
  });
  it('rejects invalid dates and duplicate historic IDs instead of hiding drift',()=>{
    expect(()=>compose({nativeEvents:[event(MEMBER,'broken','not-a-date')]}))
      .toThrow(/timestamp unavailable/);
    expect(()=>compose({nativePeople:[person(MEMBER),person(MEMBER)]}))
      .toThrow(/ambiguous history/);
  });
});
describe('G2-3D SQL and schema ownership',()=>{
  it('requires all four member-owner columns, nullable legacy IDs, FKs and owner constraints',()=>{
    expect(PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL).toContain('= 4');
    for(const name of ['field_notes','field_attention','field_events','field_people']){
      expect(PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL).toContain(name+'_personal_member_fk');
      expect(PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL).toContain(name+'_exactly_one_owner_ck');
    }
  });
  it('native Events and People require direct member ownership, not a practitioner',()=>{
    for(const sql of [NATIVE_EVENTS_SQL,NATIVE_PEOPLE_SQL]){
      expect(sql).toContain('personal_member_id = $1::uuid');
      expect(sql).toContain('practitioner_id IS NULL');
      expect(sql).toContain('team_id IS NULL');
    }
  });
  it('historical Events and People recheck exact active Personal Studio identity',()=>{
    for(const sql of [LEGACY_EVENTS_SQL,LEGACY_PEOPLE_SQL]){
      expect(sql).toContain('member_id = $1::uuid');
      expect(sql).toContain('= $2::uuid');
      expect(sql).toContain("portal_type = 'personal'");
      expect(sql).toContain("status = 'active'");
      expect(sql).toContain('team_id IS NULL');
    }
  });
  it('member with no historical Personal Studio never queries legacy stores',async()=>{
    await readVerifiedPersonalField(context());
    expect(mockQuery.mock.calls.filter(c=>
      c[0]===LEGACY_EVENTS_SQL || c[0]===LEGACY_PEOPLE_SQL)).toHaveLength(0);
    expect(mockQuery.mock.calls.find(c=>c[0]===NATIVE_EVENTS_SQL)?.[1])
      .toEqual([MEMBER,25]);
    expect(mockHistory).toHaveBeenCalledWith(context());
  });
  it('a valid historical reference is passed only to exact owner-scoped statements',async()=>{
    await readVerifiedPersonalField(context('active'));
    expect(mockQuery.mock.calls.find(c=>c[0]===LEGACY_EVENTS_SQL)?.[1])
      .toEqual([MEMBER,PERSONAL,25]);
    expect(mockQuery.mock.calls.find(c=>c[0]===LEGACY_PEOPLE_SQL)?.[1])
      .toEqual([MEMBER,PERSONAL,25]);
  });
  it('incompatible/missing installed schema refuses before history or content reads',async()=>{
    mockQuery.mockResolvedValueOnce({rows:[{ready:false}]});
    await expect(readVerifiedPersonalField(context())).rejects.toThrow(/schema unavailable/);
    expect(mockHistory).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
  it('a database failure is not silently turned into an empty personal view',async()=>{
    mockQuery.mockRejectedValueOnce(new Error('private db message'));
    await expect(readVerifiedPersonalField(context())).rejects.toThrow();
    expect(mockHistory).not.toHaveBeenCalled();
  });
});
