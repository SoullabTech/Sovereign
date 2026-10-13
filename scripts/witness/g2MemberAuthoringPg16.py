#!/usr/bin/env python3
"""G2-3C source-exact member Field synthetic PostgreSQL witness, never prod.

Starts a disposable Docker postgres:16-alpine with --network none, --rm,
no mounts and fictional IDs only. Tests exact route SQL, not a rephrasing.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import time

ROOT=Path(__file__).resolve().parents[2]
IMAGE="postgres:16-alpine"
NAME="g2-3c-member-authored-fixture-20261013"
SQL_PATH=ROOT/"scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql"
SQL_SHA="f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465"
A="11111111-1111-4111-8111-111111111111"
B="22222222-2222-4222-8222-222222222222"
PA="33333333-3333-4333-8333-333333333333"
PB="44444444-4444-4444-8444-444444444444"
TEAM="55555555-5555-4555-8555-555555555555"
CLIENT="66666666-6666-4666-8666-666666666666"
def idn(n): return f"90000000-0000-4000-8000-{n:012d}"
def q(x):
    return "NULL" if x is None else "'"+str(x).replace("'","''")+"'"
def run(args,input=None,check=True):
    r=subprocess.run(args,input=input,text=True,capture_output=True)
    if check and r.returncode:
        raise RuntimeError(f"fixture call {args[:3]} failed: {r.stderr[-1000:]}")
    return r
def exec_sql(s,check=True):
    return run(["docker","exec","-i",NAME,"psql","-X","-A","-q","-t","-F","|",
       "-v","ON_ERROR_STOP=1","-U","fixture","-d","fixturedb"],input=s,check=check)
def rows(s):
    x=exec_sql(s).stdout.strip()
    return [r.split("|") for r in x.splitlines() if r.strip()]
def prepared(name,types,params,source,allow_failure=False):
    typed=f" ({','.join(types)})" if types else ""
    statement=f"PREPARE {name}{typed} AS {source};\n"
    actuals=f" ({','.join(q(x) for x in params)})" if params else ""
    statement+=f"EXECUTE {name}{actuals};\n"
    statement+=f"DEALLOCATE {name};\n"
    r=exec_sql(statement,check=not allow_failure)
    return (r.returncode, [line.split("|") for line in r.stdout.strip().splitlines() if line.strip()],r.stderr)
def insert(table,cols,values):
    return f"INSERT INTO {table} ({','.join(cols)}) VALUES\n" + ",\n".join(
        "("+",".join(q(x) for x in row)+")" for row in values)+";\n"
assert hashlib.sha256(SQL_PATH.read_bytes()).hexdigest()==SQL_SHA
if run(["docker","image","inspect",IMAGE],check=False).returncode:
    raise SystemExit("HOLD: no cached PG16 image, do not pull")
if run(["docker","ps","-a","--filter","name=^"+NAME+"$","--format","{{.Names}}"]).stdout.strip():
    raise SystemExit("HOLD: fixture container name collision")
source=json.loads(run([str(ROOT/"node_modules/.bin/tsx"),
                       str(ROOT/"scripts/witness/g2MemberAuthoringSql.ts")]).stdout)
assert len(source)==8 and all(isinstance(v,str) for v in source.values())
started=False
try:
    run(["docker","run","-d","--rm","--pull=never","--network","none",
      "--name",NAME,"-e","POSTGRES_USER=fixture",
      "-e","POSTGRES_PASSWORD=synthetic-only","-e","POSTGRES_DB=fixturedb",IMAGE])
    started=True
    for _ in range(65):
        ping=run(["docker","exec",NAME,"psql","-X","-q","-A","-t","-U","fixture",
          "-d","fixturedb","-c","SELECT 1"],check=False)
        if ping.returncode==0 and ping.stdout.strip()=="1":
            time.sleep(1)
            again=run(["docker","exec",NAME,"psql","-X","-q","-A","-t","-U","fixture",
              "-d","fixturedb","-c","SELECT 1"],check=False)
            if again.returncode==0 and again.stdout.strip()=="1":break
        time.sleep(.25)
    else: raise RuntimeError("ephemeral Postgres never stable")

    ddl="""
CREATE TABLE members (id uuid PRIMARY KEY);
CREATE TABLE practitioners(id uuid PRIMARY KEY, member_id uuid REFERENCES members(id));
CREATE TABLE studio_teams(id uuid PRIMARY KEY);
CREATE TABLE studio_decisions(
 id uuid PRIMARY KEY, practitioner_id uuid,personal_member_id uuid,
 client_id uuid,team_id uuid,decision_scope text,title text not null);
CREATE TABLE studio_changes(
 id uuid PRIMARY KEY, practitioner_id uuid,member_id uuid,
 client_id uuid,team_id uuid,title text not null);
CREATE TABLE field_notes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
 section text NOT NULL CHECK(section IN ('alive','asking','emerging','tending')),
 body text NOT NULL CHECK(length(btrim(body))>0),
 created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE field_attention(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,
 field text NOT NULL CHECK(field IN ('important','attention','emerging')),
 kind text NOT NULL CHECK(kind IN ('note','change','decision')),
 ref_id uuid,label text NOT NULL CHECK(length(btrim(label))>0),
 position integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((kind='note' AND ref_id IS NULL) OR
        (kind IN ('change','decision') AND ref_id IS NOT NULL)));
CREATE UNIQUE INDEX uniq_field_attention_ref ON field_attention(practitioner_id,field,kind,ref_id)
 WHERE ref_id IS NOT NULL;
CREATE TABLE field_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,title text NOT NULL,event_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE field_people(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
 team_id uuid REFERENCES studio_teams(id) ON DELETE SET NULL,name text NOT NULL,note text,
 created_at timestamptz NOT NULL DEFAULT now());
"""
    ddl += insert("members",["id"],[(A,),(B,)])
    ddl += insert("practitioners",["id","member_id"],[(PA,A),(PB,B)])
    ddl += insert("studio_teams",["id"],[(TEAM,)])
    ddl += insert("studio_decisions",
      ["id","practitioner_id","personal_member_id","client_id","team_id","decision_scope","title"],
      [(idn(1),None,A,None,None,"personal","A own Decision"),
       (idn(2),None,B,None,None,"personal","B private Decision"),
       (idn(3),PA,None,None,None,"practice","A professional Decision"),
       (idn(4),None,A,CLIENT,None,"personal","A client Decision"),
       (idn(5),None,A,None,TEAM,"personal","A team Decision")])
    ddl += insert("studio_changes",
      ["id","practitioner_id","member_id","client_id","team_id","title"],
      [(idn(11),None,A,None,None,"A own Change"),
       (idn(12),None,B,None,None,"B private Change"),
       (idn(13),PA,A,None,None,"A legacy Change"),
       (idn(14),None,A,CLIENT,None,"A client Change"),
       (idn(15),None,A,None,TEAM,"A team Change")])
    ddl += insert("field_notes",["id","practitioner_id","section","body"],
      [(idn(21),PA,"alive","A legacy practitioner note"),
       (idn(22),PB,"alive","B legacy practitioner note")])
    ddl += insert("field_attention",["id","practitioner_id","field","kind","label"],
      [(idn(23),PA,"important","note","A practitioner attention")])
    exec_sql(ddl)
    before=prepared("r0",[],[],source["schema"])[1]
    assert before==[['f']],before
    exec_sql(SQL_PATH.read_text())
    exec_sql(SQL_PATH.read_text())
    assert prepared("r1",[],[],source["schema"])[1]==[['t']]
    print("PASS 01 G2-3A archived SQL twice; exact runtime schema guard FALSE before/TRUE after")
    assert rows("SELECT count(*) FROM field_notes WHERE practitioner_id IS NOT NULL")==[['2']]
    rc,note,_=prepared("ncreate",["uuid","text","text"],[A,"alive","A authored note"],source["notesCreate"])
    assert rc==0 and len(note)==1 and note[0][1:3]==["alive","A authored note"],note
    newnote=note[0][0]
    a=prepared("nread",["uuid","integer"],[A,25],source["notesRead"])[1]
    b=prepared("nreadb",["uuid","integer"],[B,25],source["notesRead"])[1]
    assert [r[0] for r in a]==[newnote] and b==[],(a,b)
    assert all(idn(i) not in str(a) for i in (21,22))
    print("PASS 02 A member-native note writable/readable, B and historical practitioner notes excluded")
    update=prepared("nupdate",["uuid","uuid","text","text"],[A,newnote,"asking","Updated A note"],source["notesUpdate"])[1]
    wrong=prepared("nforeign",["uuid","uuid","text","text"],[B,newnote,"tending","stolen"],source["notesUpdate"])[1]
    assert len(update)==1 and update[0][1:3]==["asking","Updated A note"] and wrong==[]
    assert prepared("nread2",["uuid","integer"],[A,25],source["notesRead"])[1][0][2]=="Updated A note"
    print("PASS 03 UPDATE is scoped to session member, no cross-member mutation")
    assert prepared("nunknown",["uuid","text","text"],
       ["99999999-9999-4999-8999-999999999999","alive","forged"],
       source["notesCreate"])[1]==[]
    print("PASS 04 unknown/fabricated member ID does not mint personal note")
    pos=prepared("pos1",["uuid","text"],[A,"important"],source["attentionPosition"])[1]
    assert pos==[["-1"]],pos
    owned=prepared("attowned",["uuid","text","text","uuid","text","integer"],
      [A,"important","decision",idn(1),None,-1],source["attentionCreate"])[1]
    assert len(owned)==1 and owned[0][4]=="A own Decision",owned
    attid=owned[0][0]
    print("PASS 05 owned personal Decision reference is stored with verified current title")
    scenarios=[
       ("decision",idn(2)),("decision",idn(3)),("decision",idn(4)),
       ("decision",idn(5)),("change",idn(12)),("change",idn(13)),
       ("change",idn(14)),("change",idn(15)),
    ]
    for i,(kind,ref) in enumerate(scenarios,1):
      denied=prepared("deny"+str(i),["uuid","text","text","uuid","text","integer"],
        [A,"important",kind,ref,None,-i-2],source["attentionCreate"])[1]
      assert denied==[],(kind,ref,denied)
    print("PASS 06 eight foreign/professional/team/client/legacy reference cases denied atomically")
    ownchange=prepared("acreate",["uuid","text","text","uuid","text","integer"],
      [A,"emerging","change",idn(11),None,-1],source["attentionCreate"])[1]
    assert len(ownchange)==1 and ownchange[0][4]=="A own Change"
    free=prepared("free",["uuid","text","text","uuid","text","integer"],
      [A,"attention","note",None,"My chosen focus",-1],source["attentionCreate"])[1]
    assert len(free)==1 and free[0][4]=="My chosen focus"
    print("PASS 07 member-native Change and authored free Attention notes remain available")
    rc,_,err=prepared("dup",["uuid","text","text","uuid","text","integer"],
      [A,"important","decision",idn(1),None,-13],source["attentionCreate"],allow_failure=True)
    assert rc!=0 and "duplicate key" in err
    print("PASS 08 independently owned source uniqueness enforced by migration index")
    att=prepared("aread",["uuid","integer"],[A,25],source["attentionRead"])[1]
    assert any(r[0]==attid and r[5]=="A own Decision" and r[6]=='f' and r[7]==idn(1) for r in att),att
    assert prepared("bread",["uuid","integer"],[B,25],source["attentionRead"])[1]==[]
    moved=prepared("amove",["uuid","uuid","text","integer"],[A,attid,"attention",5],
      source["attentionMove"])[1]
    denied=prepared("bmove",["uuid","uuid","text","integer"],[B,attid,"emerging",6],
      source["attentionMove"])[1]
    assert len(moved)==1 and moved[0][1:3]==["attention","5"] and denied==[]
    print("PASS 09 Attention GET + reposition require exact signed-in member")
    exec_sql(f"UPDATE studio_decisions SET personal_member_id='{B}' WHERE id='{idn(1)}';")
    after=prepared("revoke",["uuid","integer"],[A,25],source["attentionRead"])[1]
    invalid=[r for r in after if r[0]==attid]
    assert len(invalid)==1 and invalid[0][5]=='' and invalid[0][6]=='t' and invalid[0][7]=='',invalid
    print("PASS 10 revoked source returns no title or foreign ref without erasing attention custody")
    exec_sql(insert("field_attention",
      ["id","personal_member_id","field","kind","ref_id","label"],
      [(idn(31),A,"emerging","decision",idn(2),"cached B confidential")]))
    leak=prepared("leak",["uuid","integer"],[A,25],source["attentionRead"])[1]
    blocked=next(r for r in leak if r[0]==idn(31))
    assert blocked[5]=='' and blocked[6]=='t' and blocked[7]=='',blocked
    print("PASS 11 foreign cached labels are not returned by owned Attention query")
    rc,_,err=prepared("badowner",["uuid","text","text"],
      [A,"alive","permitted"],source["notesCreate"],allow_failure=False)
    # no background mutation of deployed or member content; all fixture-only
    assert rc==0
    print("PASS 12 direct member-only authoring requires no practitioner compatibility row")
    print("PASS G2-3C exact SQL on disconnected PG16, no installed migration or member-data operations")
finally:
    if started:
      run(["docker","stop",NAME],check=False)
      left=run(["docker","ps","-a","--filter","name=^"+NAME+"$","--format","{{.Names}}"],check=False)
      assert not left.stdout.strip(),"fixture cleanup incomplete"
      print("PASS synthetic PG16 container removed")
