#!/usr/bin/env python3
"""G2-3D exact Event/People SQL in temporary, fully disconnected PG16.
No production database, network, mounts, paid calls, member/client records,
keychain access, authoring, migration installation or source changes.
"""
from pathlib import Path
import hashlib,json,subprocess,time
ROOT=Path(__file__).resolve().parents[2]
IMAGE='postgres:16-alpine'
NAME='g2-3d-events-people-fixture-20261013'
A='11111111-1111-4111-8111-111111111111'
B='22222222-2222-4222-8222-222222222222'
P='33333333-3333-4333-8333-333333333333'
P2='44444444-4444-4444-8444-444444444444'
PRO='55555555-5555-4555-8555-555555555555'
TEAM='66666666-6666-4666-8666-666666666666'
SQL_SHA='f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465'
def idn(n):return f'90000000-0000-4000-8000-{n:012d}'
def q(x):return 'NULL' if x is None else "'"+str(x).replace("'","''")+"'"
def run(args,inp=None,check=True):
    r=subprocess.run(args,input=inp,text=True,capture_output=True)
    if check and r.returncode:
        raise RuntimeError(f"PG16 fixture command {args[:3]} failed: {r.stderr[-1100:]}")
    return r
def sql(txt):
    return run(['docker','exec','-i',NAME,'psql','-X','-q','-A','-t','-F','|',
                '-v','ON_ERROR_STOP=1','-U','fixture','-d','fixturedb'],txt).stdout.strip()
def prepared(name,types,params,source):
    t=' ('+','.join(types)+')' if types else ''
    v=' ('+','.join(q(p) for p in params)+')' if params else ''
    text=f'PREPARE {name}{t} AS {source};\nEXECUTE {name}{v};\nDEALLOCATE {name};'
    out=sql(text)
    return [line.split('|') for line in out.splitlines() if line.strip()]
def insert(table,cols,items):
    return ('INSERT INTO '+table+' ('+','.join(cols)+') VALUES\n'+
      ',\n'.join('('+','.join(q(v) for v in row)+')' for row in items)+';\n')
path=ROOT/'scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql'
assert path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==SQL_SHA
sources=json.loads(run([str(ROOT/'node_modules/.bin/tsx'),
                        str(ROOT/'scripts/witness/g2FieldIntegratedSql.ts')]).stdout)
assert len(sources)==5
if run(['docker','image','inspect',IMAGE],check=False).returncode:raise RuntimeError('preinstalled image missing')
if run(['docker','ps','-a','--filter','name=^'+NAME+'$','--format','{{.Names}}']).stdout.strip():
    raise RuntimeError('fixture container already exists')
started=False
try:
    run(['docker','run','-d','--rm','--pull=never','--network','none','--name',NAME,
         '-e','POSTGRES_USER=fixture','-e','POSTGRES_PASSWORD=fictional-only',
         '-e','POSTGRES_DB=fixturedb',IMAGE])
    started=True
    for _ in range(55):
        r=run(['docker','exec',NAME,'psql','-X','-q','-t','-A','-U','fixture','-d','fixturedb','-c','SELECT 1'],
              check=False)
        if r.returncode==0 and r.stdout.strip()=='1':
            time.sleep(1)
            r=run(['docker','exec',NAME,'psql','-X','-q','-t','-A','-U','fixture','-d','fixturedb','-c','SELECT 1'],
                  check=False)
            if r.returncode==0 and r.stdout.strip()=='1':break
        time.sleep(.25)
    else:raise RuntimeError('no stable synthetic PG16')
    fixture="""
CREATE TABLE members(id UUID PRIMARY KEY);
CREATE TABLE practitioners(id UUID PRIMARY KEY,member_id UUID NOT NULL,
  portal_type text NOT NULL,status text NOT NULL);
CREATE TABLE studio_teams(id UUID PRIMARY KEY);
CREATE TABLE field_notes(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID,section text,body text,created_at timestamptz DEFAULT now());
CREATE TABLE field_attention(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID,field text,kind text,ref_id uuid,label text,
  position integer DEFAULT 0,created_at timestamptz DEFAULT now());
CREATE TABLE field_events(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID,title text,event_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE field_people(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID,name text,note text,created_at timestamptz DEFAULT now());
"""
    fixture+=insert('members',['id'],[(A,),(B,)])
    fixture+=insert('practitioners',['id','member_id','portal_type','status'],[
      (P,A,'personal','active'),(P2,B,'personal','active'),(PRO,A,'generalist','active')])
    fixture+=insert('studio_teams',['id'],[(TEAM,)])
    fixture+=insert('field_events',['id','practitioner_id','team_id','title','event_at','created_at'],[
      (idn(11),P,None,'A historic event','2026-10-18T12:00:00Z','2026-10-12T00:00:00Z'),
      (idn(12),P2,None,'B historic event','2026-10-18T12:00:00Z','2026-10-12T00:00:00Z'),
      (idn(13),PRO,None,'A professional event','2026-10-18T12:00:00Z','2026-10-12T00:00:00Z'),
      (idn(14),P,TEAM,'A team event','2026-10-18T12:00:00Z','2026-10-12T00:00:00Z'),
    ])
    fixture+=insert('field_people',['id','practitioner_id','team_id','name','note','created_at'],[
      (idn(21),P,None,'A historic person','I named them','2026-10-12T00:00:00Z'),
      (idn(22),P2,None,'B historic person','private','2026-10-12T00:00:00Z'),
      (idn(23),PRO,None,'A professional contact','client context','2026-10-12T00:00:00Z'),
      (idn(24),P,TEAM,'A team contact',None,'2026-10-12T00:00:00Z'),
    ])
    sql(fixture)
    assert prepared('c0',[],[],sources['schema'])==[['f']]
    sql(path.read_text());sql(path.read_text())
    assert prepared('c1',[],[],sources['schema'])==[['t']]
    print('PASS 01 exact G2-3A schema absent/present capability witnessed')
    sql(insert('field_events',['id','personal_member_id','team_id','title','event_at','created_at'],[
      (idn(15),A,None,'A native event','2026-10-20T12:00:00Z','2026-10-13T00:00:00Z'),
      (idn(16),B,None,'B native event','2026-10-20T12:00:00Z','2026-10-13T00:00:00Z'),
    ]))
    sql(insert('field_people',['id','personal_member_id','team_id','name','note','created_at'],[
      (idn(25),A,None,'A native person','authored','2026-10-13T00:00:00Z'),
      (idn(26),B,None,'B native person','confidential','2026-10-13T00:00:00Z'),
    ]))
    for table,keys in [('nativeEvents','event'),('nativePeople','person')]:
      rr=prepared('n_'+table,['uuid','integer'],[A,25],sources[table])
      assert len(rr)==1 and rr[0][0]==idn(15 if keys=='event' else 25),rr
      assert B not in str(rr)
    print('PASS 02 exact native reads return A only without any practitioner row')
    for table,key in [('legacyEvents',11),('legacyPeople',21)]:
      rr=prepared('l_'+table,['uuid','uuid','integer'],[A,P,25],sources[table])
      assert len(rr)==1 and rr[0][0]==idn(key),rr
      assert prepared('lwrong_'+table,['uuid','uuid','integer'],[A,P2,25],sources[table])==[]
      assert prepared('lpro_'+table,['uuid','uuid','integer'],[A,PRO,25],sources[table])==[]
    print('PASS 03 exact historical reads revalidate unique personal member, status, portal type')
    sql(f"UPDATE practitioners SET status='suspended' WHERE id='{P}';")
    assert prepared('rev_event',['uuid','uuid','integer'],[A,P,25],sources['legacyEvents'])==[]
    assert prepared('rev_people',['uuid','uuid','integer'],[A,P,25],sources['legacyPeople'])==[]
    assert len(prepared('n_after',['uuid','integer'],[A,25],sources['nativePeople']))==1
    print('PASS 04 suspended historical adapter denies old rows; member-native survives')
    sql(f"UPDATE practitioners SET status='active',member_id='{B}' WHERE id='{P}';")
    assert prepared('rel_event',['uuid','uuid','integer'],[A,P,25],sources['legacyEvents'])==[]
    assert prepared('rel_people',['uuid','uuid','integer'],[A,P,25],sources['legacyPeople'])==[]
    print('PASS 05 historical custody reassignment invalidates old member reference')
    print('SOURCE_EXACT_G2_3D_PG16_PASS')
finally:
    if started:
      run(['docker','stop',NAME],check=False)
      leftovers=run(['docker','ps','-a','--filter','name=^'+NAME+'$','--format','{{.Names}}'],check=False)
      assert not leftovers.stdout.strip(),'test container remains'
      print('PASS disconnected PG16 fixture removed')
