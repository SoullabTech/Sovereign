#!/usr/bin/env python3
"""Prove exact G2-2 read-only query predicates against disconnected synthetic PG.

No real member records are read. Docker has --network none, --rm, no mounts,
no real credentials or member ids, and is stopped in finally.
"""
from pathlib import Path
import re
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / "lib/ganesha/personalFieldContinuity.ts").read_text()
IMAGE = "postgres:16-alpine"
CONTAINER = "ganesha-g2-2-synthetic-20261012"

def run(*args, input_text=None, check=True):
    result = subprocess.run(args, input=input_text, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            check=False)
    if check and result.returncode:
        raise RuntimeError(f"fixture command failed ({result.returncode}): "
                           f"{args[0]} {args[1]} — {result.stderr[-1300:]}")
    return result

def block(name):
    pattern = rf"export const {re.escape(name)} = `([\s\S]*?)`;"
    match = re.search(pattern, SOURCE)
    if not match:
        raise RuntimeError(f"Missing exact source SQL block: {name}")
    return match.group(1)

scope = block("PERSONAL_CHANGES_SCOPE")
def exact_sql(name):
    return block(name).replace("${PERSONAL_CHANGES_SCOPE}", scope).strip()

A = "11111111-1111-4111-8111-111111111111"
B = "22222222-2222-4222-8222-222222222222"
PA = "33333333-3333-4333-8333-333333333333"
PB = "44444444-4444-4444-8444-444444444444"
PRO = "55555555-5555-4555-8555-555555555555"
TEAM = "66666666-6666-4666-8666-666666666666"
CLIENT = "77777777-7777-4777-8777-777777777777"

def uuid(n):
    return f"aaa00000-0000-4000-8000-{n:012d}"

def quote(v):
    return "NULL" if v is None else "'" + str(v) + "'"

DDL = """
CREATE TABLE practitioners (
  id UUID PRIMARY KEY, member_id UUID, portal_type TEXT, status TEXT
);
CREATE TABLE studio_decisions (
  id UUID PRIMARY KEY, title TEXT, status TEXT, created_at timestamptz,
  decision_scope TEXT, personal_member_id UUID, practitioner_id UUID,
  client_id UUID, team_id UUID
);
CREATE TABLE process_items (
  id UUID PRIMARY KEY, member_id UUID, practitioner_id UUID,
  title TEXT, type TEXT, status TEXT, created_at timestamptz
);
CREATE TABLE studio_changes (
  id UUID PRIMARY KEY, member_id UUID, practitioner_id UUID,
  client_id UUID, team_id UUID, title TEXT, status TEXT, created_at timestamptz
);
CREATE TABLE field_notes (
  id UUID PRIMARY KEY, practitioner_id UUID, team_id UUID,
  section TEXT, body TEXT, created_at timestamptz
);
CREATE TABLE field_attention (
  id UUID PRIMARY KEY, practitioner_id UUID, team_id UUID,
  field TEXT, kind TEXT, ref_id UUID, label TEXT, created_at timestamptz
);
"""

def insert(table, columns, *rows):
    quoted = ",\n".join("(" + ",".join(quote(v) for v in row) + ")" for row in rows)
    return f"INSERT INTO {table} ({','.join(columns)}) VALUES\n{quoted};\n"

ts = "2026-10-12T00:00:00+00"
sql = DDL
sql += insert("practitioners", ["id","member_id","portal_type","status"],
  (PA,A,"personal","active"),
  (PB,B,"personal","active"),
  (PRO,A,"generalist","active"))
sql += insert("studio_decisions",
  ["id","title","status","created_at","decision_scope","personal_member_id","practitioner_id","client_id","team_id"],
  (uuid(1),"A private decision","draft",ts,"personal",A,None,None,None),
  (uuid(2),"A team decision","draft",ts,"team",None,PA,None,TEAM),
  (uuid(3),"B private decision","draft",ts,"personal",B,None,None,None),
  (uuid(4),"A professional decision","draft",ts,"practice",None,PRO,CLIENT,None))
sql += insert("process_items",
  ["id","member_id","practitioner_id","title","type","status","created_at"],
  (uuid(11),A,None,"A member only","change","alive",ts),
  (uuid(12),A,PA,"A old personal","change","alive",ts),
  (uuid(13),A,PRO,"A professional item","change","alive",ts),
  (uuid(14),B,PB,"B item","change","alive",ts))
sql += insert("studio_changes",
  ["id","member_id","practitioner_id","client_id","team_id","title","status","created_at"],
  (uuid(21),A,None,None,None,"A member change","naming",ts),
  (uuid(22),A,PA,None,None,"A member+personal change","naming",ts),
  (uuid(23),A,PRO,None,None,"A professional change","naming",ts),
  (uuid(24),B,PB,None,None,"B change","naming",ts),
  (uuid(25),None,PA,None,None,"A old personal change","naming",ts),
  (uuid(26),None,PB,None,None,"B old change","naming",ts),
  (uuid(27),A,PA,None,TEAM,"A team change","naming",ts),
  (uuid(28),A,PA,CLIENT,None,"A client change","naming",ts),
  (uuid(29),B,PA,None,None,"Contradictory member owner","naming",ts))
sql += insert("field_notes",
  ["id","practitioner_id","team_id","section","body","created_at"],
  (uuid(31),PA,None,"alive","A private note",ts),
  (uuid(32),PRO,None,"alive","Professional private note",ts),
  (uuid(33),PB,None,"alive","B private note",ts),
  (uuid(34),PA,TEAM,"alive","A team note",ts))
sql += insert("field_attention",
  ["id","practitioner_id","team_id","field","kind","ref_id","label","created_at"],
  (uuid(41),PA,None,"important","note",None,"A attention",ts),
  (uuid(42),PA,None,"important","decision",uuid(1),"Cached old title",ts),
  (uuid(43),PA,None,"attention","change",uuid(25),"Cached old title",ts),
  (uuid(44),PA,None,"important","decision",uuid(3),"Cached B private decision",ts),
  (uuid(45),PA,None,"attention","decision",uuid(4),"Cached practice decision",ts),
  (uuid(46),PA,None,"attention","change",uuid(23),"Cached professional change",ts),
  (uuid(47),PA,TEAM,"important","note",None,"A team attention",ts),
  (uuid(48),PB,None,"important","note",None,"B note",ts))

cases = [
 ("PERSONAL_DECISIONS_SQL", ("uuid","integer"), (A,25), [uuid(1)]),
 ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(11),uuid(12)]),
 ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (A,None,25), [uuid(11)]),
 ("PERSONAL_CHANGES_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(21),uuid(22),uuid(25)]),
 ("PERSONAL_CHANGES_SQL", ("uuid","uuid","integer"), (A,None,25), [uuid(21)]),
 ("PERSONAL_LEGACY_NOTES_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(31)]),
 ("PERSONAL_LEGACY_ATTENTION_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(41),uuid(42),uuid(43)]),
 ("PERSONAL_DECISIONS_SQL", ("uuid","integer"), (B,25), [uuid(3)]),
 ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (B,PB,25), [uuid(14)]),
 ("PERSONAL_CHANGES_SQL", ("uuid","uuid","integer"), (B,PB,25), [uuid(24),uuid(26)]),
 ("PERSONAL_LEGACY_NOTES_SQL", ("uuid","uuid","integer"), (B,PB,25), [uuid(33)]),
 ("PERSONAL_LEGACY_ATTENTION_SQL", ("uuid","uuid","integer"), (B,PB,25), [uuid(48)]),
 # A forged legacy ID for another member is blocked again by the SQL.
 ("PERSONAL_LEGACY_NOTES_SQL", ("uuid","uuid","integer"), (A,PB,25), []),
 ("PERSONAL_LEGACY_ATTENTION_SQL", ("uuid","uuid","integer"), (A,PB,25), []),
 ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (A,PB,25), [uuid(11)]),
 ("PERSONAL_CHANGES_SQL", ("uuid","uuid","integer"), (A,PB,25), [uuid(21)]),
 # An owned professional row cannot be substituted as personal legacy.
 ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (A,PRO,25), [uuid(11)]),
 ("PERSONAL_LEGACY_NOTES_SQL", ("uuid","uuid","integer"), (A,PRO,25), []),
]

if run("docker","ps","-a","--filter",f"name=^{CONTAINER}$","--format","{{.Names}}").stdout.strip():
    raise SystemExit(f"HOLD: preexisting {CONTAINER} — no overwrite")

started = False
try:
    r = run("docker","run","-d","--rm","--pull=never","--network","none",
       "--name",CONTAINER,"-e","POSTGRES_USER=fixture","-e","POSTGRES_PASSWORD=synthetic_only",
       "-e","POSTGRES_DB=synthetic_fixture",IMAGE)
    started = True
    # Docker's Postgres entrypoint briefly starts a temporary init server and
    # stops it again before the final service; pg_isready alone races shutdown.
    for _ in range(50):
        ready = run("docker","exec",CONTAINER,"psql","-X","-A","-t","-q",
                    "-U","fixture","-d","synthetic_fixture","-c","SELECT 1",
                    check=False)
        if ready.returncode == 0 and ready.stdout.strip() == "1":
            time.sleep(1.25)
            stable = run("docker","exec",CONTAINER,"psql","-X","-A","-t","-q",
                         "-U","fixture","-d","synthetic_fixture","-c","SELECT 1",
                         check=False)
            if stable.returncode == 0 and stable.stdout.strip() == "1":
                break
        time.sleep(0.25)
    else: raise RuntimeError("Synthetic PG final server did not become stable")

    def psql(text):
        return run("docker","exec","-i",CONTAINER,"psql","-X","-q","-A","-t",
                   "-v","ON_ERROR_STOP=1","-U","fixture","-d","synthetic_fixture",
                   input_text=text)
    psql(sql)
    for i,(name,types,params,expected) in enumerate(cases,1):
        command=f"PREPARE audit_{i} ({','.join(types)}) AS {exact_sql(name)};\n"
        command+=f"EXECUTE audit_{i} ({','.join(quote(p) for p in params)});\n"
        command+=f"DEALLOCATE audit_{i};\n"
        out=psql(command).stdout.strip()
        rows=[line.split("|") for line in out.splitlines() if line.strip()]
        got=sorted(row[0] for row in rows)
        if got!=sorted(expected):
            raise AssertionError(f"case {i} {name}: expected {sorted(expected)}, got {got}")
        if name=="PERSONAL_LEGACY_ATTENTION_SQL" and params[0]==A and params[1]==PA:
            labels=[row[3] for row in rows]
            if "A private decision" not in labels or "A old personal change" not in labels:
                raise AssertionError("Attention did not resolve verified current source title")
            if any("Cached" in label for label in labels):
                raise AssertionError("Attention exposed unverified cached title")
        print(f"PASS {i:02} {name} parameters={'NULL legacy' if None in params else 'exact IDs'} row_count={len(rows)}")
    # Simulate practitioner suspension AFTER G2-1 has resolved a previously
    # valid reference. Each SQL statement must refuse to use a stale ID.
    psql(f"UPDATE practitioners SET status='suspended' WHERE id='{PA}';")
    revoked = [
       ("PERSONAL_PROCESS_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(11)]),
       ("PERSONAL_CHANGES_SQL", ("uuid","uuid","integer"), (A,PA,25), [uuid(21)]),
       ("PERSONAL_LEGACY_NOTES_SQL", ("uuid","uuid","integer"), (A,PA,25), []),
       ("PERSONAL_LEGACY_ATTENTION_SQL", ("uuid","uuid","integer"), (A,PA,25), []),
    ]
    for j,(name,types,params,expected) in enumerate(revoked,1):
        statement = (f"PREPARE revoked_{j} ({','.join(types)}) AS {exact_sql(name)};\n"
                     f"EXECUTE revoked_{j} ({','.join(quote(p) for p in params)});\n"
                     f"DEALLOCATE revoked_{j};\n")
        rows = [line.split("|") for line in psql(statement).stdout.strip().splitlines() if line.strip()]
        ids = sorted(row[0] for row in rows)
        if ids != sorted(expected):
            raise AssertionError(f"Revocation case {j}: expected {sorted(expected)}, got {ids}")
        print(f"PASS REVOKED-{j:02} {name} stale Personal ID denied, member-only still valid")
    print(f"PASS disconnected synthetic PostgreSQL, exact source SQL, "
          f"{len(cases)+len(revoked)} cases, zero production data")
finally:
    if started:
        run("docker","stop",CONTAINER,check=False)
        remaining=run("docker","ps","-a","--filter",f"name=^{CONTAINER}$","--format","{{.Names}}",check=False)
        if remaining.stdout.strip():
            print("WARNING: synthetic test container remains; operator cleanup required")
            raise SystemExit(8)
        print("Synthetic test container absent after cleanup")
