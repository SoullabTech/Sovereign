#!/usr/bin/env python3
"""Run exact authored Studio Attention SQL in disposable network-isolated PG16.
No member data, network, mounted volumes, migrations, production containers,
remote credentials, external LLMs, message sends, or billing operations.
"""
from pathlib import Path
import json
import subprocess
import time

ROOT=Path(__file__).resolve().parents[2]
NAME="g2-attention-owner-fixture-20261013"
IMAGE="postgres:16-alpine"
M="11111111-1111-4111-8111-111111111111"
M2="22222222-2222-4222-8222-222222222222"
P="33333333-3333-4333-8333-333333333333"
P2="44444444-4444-4444-8444-444444444444"
TEAM="55555555-5555-4555-8555-555555555555"
TEAM2="66666666-6666-4666-8666-666666666666"
CLIENT="77777777-7777-4777-8777-777777777777"
def idn(n):
    return f"90000000-0000-4000-8000-{n:012d}"
def q(x):
    return 'NULL' if x is None else "'"+str(x).replace("'","''")+"'"
def run(args, data=None, require=True):
    r=subprocess.run(args, input=data, text=True,capture_output=True)
    if require and r.returncode:
        raise RuntimeError(f"command failed {args[:3]}: {r.stderr[-1100:]}")
    return r
def psql(s):
    r=run(['docker','exec','-i',NAME,'psql','-X','-q','-A','-t','-F','|',
          '-v','ON_ERROR_STOP=1','-U','fixture','-d','fixturedb'],data=s)
    return [line.split('|') for line in r.stdout.strip().splitlines() if line.strip()]
def insert(table,cols,rows):
    return 'INSERT INTO '+table+' ('+','.join(cols)+') VALUES\n' + ',\n'.join(
      '('+','.join(q(v) for v in row)+')' for row in rows)+';\n'
def execute(name,types,params,sql):
    statement='PREPARE '+name+' ('+','.join(types)+') AS '+sql+';\n'
    statement+='EXECUTE '+name+' ('+','.join(q(p) for p in params)+');\n'
    statement+='DEALLOCATE '+name+';\n'
    return psql(statement)
if run(['docker','image','inspect',IMAGE],require=False).returncode:
    raise SystemExit("HOLD: PG16 image unavailable — do not pull")
if run(['docker','ps','-a','--filter','name=^'+NAME+'$','--format','{{.Names}}']).stdout.strip():
    raise SystemExit("HOLD: a similarly named fixture container already exists")
data=json.loads(run([str(ROOT/'node_modules/.bin/tsx'),
                     str(ROOT/'scripts/witness/attentionOwnerSourceSql.ts')]).stdout)
assert set(data)=={'readPersonal','readTeam','readMixed','create'}
started=False
try:
    run(['docker','run','--rm','-d','--pull=never','--network','none','--name',NAME,
         '-e','POSTGRES_USER=fixture','-e','POSTGRES_PASSWORD=fixture-only',
         '-e','POSTGRES_DB=fixturedb',IMAGE])
    started=True
    for _ in range(60):
        r=run(['docker','exec',NAME,'psql','-q','-X','-t','-A','-U','fixture',
               '-d','fixturedb','-c','select 1'],require=False)
        if r.returncode==0 and r.stdout.strip()=='1':
            time.sleep(1)
            again=run(['docker','exec',NAME,'psql','-q','-X','-t','-A','-U','fixture',
                       '-d','fixturedb','-c','select 1'],require=False)
            if again.returncode==0 and again.stdout.strip()=='1': break
        time.sleep(0.25)
    else: raise RuntimeError('Stable PG16 server not ready')

    ddl="""
CREATE TABLE practitioners(id UUID PRIMARY KEY, member_id UUID NOT NULL);
CREATE TABLE studio_team_members(team_id UUID NOT NULL, member_id UUID NOT NULL, role TEXT NOT NULL,
  PRIMARY KEY(team_id,member_id));
CREATE TABLE studio_changes(
  id UUID PRIMARY KEY, practitioner_id UUID,
  member_id UUID, team_id UUID, client_id UUID, title TEXT NOT NULL
);
CREATE TABLE studio_decisions(
  id UUID PRIMARY KEY, practitioner_id UUID,
  personal_member_id UUID, team_id UUID, client_id UUID,
  decision_scope TEXT NOT NULL, title TEXT NOT NULL
);
CREATE TABLE field_attention(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL,
  team_id UUID,
  field TEXT NOT NULL, kind TEXT NOT NULL,
  ref_id UUID, label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind='note' AND ref_id IS NULL) OR
        (kind IN ('decision','change') AND ref_id IS NOT NULL))
);
CREATE UNIQUE INDEX uniq_attention_owner_ref ON field_attention
(practitioner_id, field, kind, ref_id) WHERE ref_id IS NOT NULL;
"""
    ddl += insert('practitioners',['id','member_id'],[(P,M),(P2,M2)])
    ddl += insert('studio_team_members',['team_id','member_id','role'],
      [(TEAM,M,'member'),(TEAM2,M2,'member')])
    change=[
      (idn(1),P,None,None,None,'A own Change'),
      (idn(2),P2,None,None,None,'B private Change'),
      (idn(3),P,None,TEAM,None,'A team Change'),
      (idn(4),P,None,TEAM2,None,'A other team Change'),
      (idn(5),P,None,None,CLIENT,'A client Change'),
      (idn(6),P,M2,None,None,'Contradictory member Change'),
      (idn(7),None,M,None,None,'A member-only Change'),
      (idn(8),P,M,None,None,'A self-member Change'),
    ]
    ddl += insert('studio_changes',['id','practitioner_id','member_id','team_id','client_id','title'],change)
    decisions=[
      (idn(11),P,None,None,None,'practice','A practice Decision'),
      (idn(12),P2,None,None,None,'practice','B practice Decision'),
      (idn(13),P,None,TEAM,None,'team','A team Decision'),
      (idn(14),P,None,TEAM2,None,'team','A other team Decision'),
      (idn(15),P,None,None,CLIENT,'practice','A client Decision'),
      (idn(16),None,M,None,None,'personal','A personal Decision'),
      (idn(17),None,M2,None,None,'personal','B personal Decision'),
      (idn(18),None,M,TEAM,None,'team','A malformed team Decision'),
    ]
    ddl += insert('studio_decisions',
      ['id','practitioner_id','personal_member_id','team_id','client_id','decision_scope','title'], decisions)
    attention=[
      (idn(21),P,None,'important','change',idn(2),'cached B change'),
      (idn(22),P,None,'important','decision',idn(12),'cached B decision'),
      (idn(23),P,None,'important','change',idn(1),'cached A title'),
      (idn(24),P,None,'important','decision',idn(11),'cached A decision'),
      (idn(25),P,None,'attention','note',None,'A personal note'),
      (idn(26),P,None,'attention','decision',idn(17),'cached B private decision'),
      (idn(27),P,None,'attention','decision',idn(16),'cached A personal title'),
      (idn(28),P,TEAM,'emerging','change',idn(3),'cached A team Change'),
      (idn(29),P,TEAM,'emerging','decision',idn(13),'cached A team Decision'),
      (idn(30),P,TEAM,'emerging','change',idn(4),'cached A other team'),
      (idn(31),P,None,'attention','change',idn(5),'cached A client Change'),
      (idn(32),P,None,'attention','change',idn(6),'cached conflicting member Change'),
      (idn(33),P,None,'attention','decision',idn(15),'cached A client Decision'),
      (idn(34),P,None,'attention','change',idn(8),'cached A member-self Change'),
      (idn(35),P,TEAM2,'important','note',None,'A former team note'),
    ]
    ddl += insert('field_attention',['id','practitioner_id','team_id','field','kind','ref_id','label'],attention)
    psql(ddl)
    def read(sql,member=M,pract=P,team=None):
        return execute('rtest',['uuid','uuid','uuid'],[pract,team,member],sql)
    personal=read(data['readPersonal'])
    indexed={r[0]:r for r in personal}
    expected_good={idn(23):'A own Change',idn(24):'A practice Decision',
                   idn(25):'A personal note',idn(27):'A personal Decision',
                   idn(34):'A self-member Change'}
    expected_gone=[idn(21),idn(22),idn(26),idn(31),idn(32),idn(33)]
    for uid,title in expected_good.items():
        assert indexed[uid][6]==title and indexed[uid][7]=='f',('owned title incorrect',uid,indexed.get(uid))
    for uid in expected_gone:
        assert indexed[uid][6]=='' and indexed[uid][7]=='t',('FOREIGN TITLE EXPOSED',uid,indexed.get(uid))
    print('PASS 01 source-exact personal GET: verified titles only; six foreign/clinical/cache references gone')
    assert len(personal)==len(expected_good)+len(expected_gone)
    assert not any('cached B' in '|'.join(row) for row in personal)
    team=read(data['readTeam'],team=TEAM)
    tid={r[0]:r for r in team}
    assert tid[idn(28)][6]=='A team Change' and tid[idn(29)][6]=='A team Decision'
    assert tid[idn(30)][6]=='' and tid[idn(30)][7]=='t'
    print('PASS 02 source-exact team GET excludes cross-team source')
    mixed=read(data['readMixed'],team=TEAM)
    assert len(mixed)==len(personal)+len(team)
    print('PASS 03 mixed team/personal source: exact scopes')
    # POST fixture returns id,field,kind,ref_id,label,position,created_at; only matched owners insert.
    def post(n,kind,ref,member=M,pract=P,t=None,label='attacker spoofed title',field='important'):
        return execute('w'+str(n),
            ['uuid','uuid','text','text','uuid','text','integer','uuid'],
            [pract,t,field,kind,ref,label,-n,member],data['create'])
    for n,kind,ref in [
      (1,'change',idn(2)),(2,'decision',idn(12)),
      (3,'decision',idn(17)),(4,'change',idn(5)),
      (5,'change',idn(6)),(6,'decision',idn(15)),
      (7,'change',idn(7)),
    ]:
        result=post(n,kind,ref)
        assert result==[],('unauthorized write accepted',n,result)
        print(f'PASS 04.{n} POST denies foreign/member/client source {kind}')
    allowed=post(20,'change',idn(1),field='emerging')
    assert len(allowed)==1 and allowed[0][4]=='A own Change'
    print('PASS 05 POST stores current owner title rather than attacker label')
    ownpersonal=post(21,'decision',idn(16))
    assert len(ownpersonal)==1 and ownpersonal[0][4]=='A personal Decision'
    print('PASS 06 member-owned personal Decision allowed only in personal scope')
    ownteam=post(22,'change',idn(3),t=TEAM)
    assert len(ownteam)==1 and ownteam[0][4]=='A team Change'
    wrongteam=post(23,'change',idn(4),t=TEAM)
    assert wrongteam==[]
    print('PASS 07 matched team source allowed, other team rejected')
    validnote=post(24,'note',None,label='authored personal note')
    assert len(validnote)==1 and validnote[0][4]=='authored personal note'
    print('PASS 08 note authored with no source remains usable')
    # New reference with changed source is now neutralized at subsequent read.
    psql(f"UPDATE studio_changes SET practitioner_id='{P2}' WHERE id='{idn(1)}';")
    after=read(data['readPersonal'])
    arow=next(r for r in after if r[0]==idn(23))
    assert arow[6]=='' and arow[7]=='t'
    print('PASS 09 post-hoc ownership revocation removes title without deleting attention record')
    # Even a previously checked team grant can be revoked before the SQL call.
    # The second, statement-time authorization prevents use of stale grants.
    unknown_team=read(data['readTeam'],team=TEAM2)
    assert unknown_team==[],('foreigner team note exposed by guessed TEAM2',unknown_team)
    assert post(26,'change',idn(4),t=TEAM2)==[]
    print('PASS 10 foreign team ID denied at statement time for read and insert')
    psql(f"DELETE FROM studio_team_members WHERE member_id='{M}' AND team_id='{TEAM}';")
    assert read(data['readTeam'],team=TEAM)==[]
    assert post(27,'note',None,t=TEAM,label='revoked team note')==[]
    print('PASS 11 revoked team membership refuses GET and POST without stale authority')
    print('PASS exact authored SQL against disconnected PG16, no production or member data')
finally:
    if started:
        run(['docker','stop',NAME],require=False)
        remaining=run(['docker','ps','-a','--filter','name=^'+NAME+'$','--format','{{.Names}}'],require=False)
        assert not remaining.stdout.strip(),'CLEANUP_FAILED'
        print('PASS fixture container removed')
