#!/usr/bin/env python3
"""Proof harness for the Co-Lab gate v2.

A synthetic, shape-compatible database in a local throwaway Postgres (container ws-local-pg).
  * BASELINE has positive controls: legitimate colab atoms/files/sessions/DMs on ACTIVE teams (must PASS)
    and retained rows on LEGACY anchors (must stay INFO, never FAIL). So a gate that fails on any scoped
    row, or that drops the active-team filter, cannot pass the baseline.
  * DEFEAT fixtures each break one boundary; the gate must exit non-zero WITH the named label
    (or exit 3 for precondition cases). Data is fully reset between cases (no revert drift).
  * POSITIVE fixtures must still PASS (the gate must not fail for the wrong reason).
  * GATE MUTANTS: the gate source itself is weakened; the baseline must then fail.
Output records the gate path, its sha256 and the git commit (when available)."""
import subprocess, sys, re, os, hashlib

CONT = "ws-local-pg"
env_out = subprocess.run(["docker","inspect",CONT,"--format","{{range .Config.Env}}{{println .}}{{end}}"],capture_output=True,text=True).stdout
PW = re.search(r"^POSTGRES_PASSWORD=(.*)$", env_out, re.M).group(1)
DB = "colab_gate_test"
GATE = sys.argv[1] if len(sys.argv) > 1 else "scripts/verify-constitution-colab.ts"
EXPECTED_BASELINE = "29 passed · 0 failed · 0 warned"

def psql(sql, db=DB, check=True):
    r = subprocess.run(["docker","exec","-i","-e","PGPASSWORD="+PW,CONT,"psql","-U","postgres","-d",db,"-v","ON_ERROR_STOP=1","-q","-At"],input=sql,capture_output=True,text=True)
    if check and r.returncode != 0: raise RuntimeError(r.stderr[:500])
    return r.stdout

SCHEMA = """
CREATE TABLE members(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), username text UNIQUE NOT NULL);
CREATE TABLE studio_teams(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text, is_admin_workspace boolean NOT NULL DEFAULT false);
CREATE TABLE studio_team_members(team_id uuid REFERENCES studio_teams(id), member_id uuid REFERENCES members(id), role text, invited_by uuid);
CREATE TABLE practitioners(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid REFERENCES members(id));
CREATE TABLE practitioner_files(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), practitioner_id uuid, file_scope text, team_id uuid);
CREATE TABLE member_memory_atoms(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid REFERENCES members(id), memory_scope text, team_id uuid);
CREATE TABLE sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), practitioner_id uuid, team_id uuid);
CREATE TABLE team_dm_threads(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid);
CREATE TABLE team_dm_members(dm_thread_id uuid, member_id uuid REFERENCES members(id));
CREATE TABLE team_channels(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid REFERENCES studio_teams(id));
CREATE TABLE team_channel_members(channel_id uuid REFERENCES team_channels(id), member_id uuid REFERENCES members(id));
CREATE TABLE practitioner_clients(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), practitioner_id uuid REFERENCES practitioners(id));
CREATE TABLE practitioner_client_notes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), practitioner_id uuid REFERENCES practitioners(id), client_id uuid REFERENCES practitioner_clients(id), content_enc bytea, content_enc_meta jsonb);
"""
TABLES = "practitioner_client_notes,practitioner_clients,team_channel_members,team_channels,team_dm_members,team_dm_threads,sessions,member_memory_atoms,practitioner_files,practitioners,studio_team_members,studio_teams,members"

LEG = "'Legacy anchor retained after founder-authorized Co-Lab reboot; not an active workspace.'"
BASE = f"""
INSERT INTO members(username) VALUES ('Kelly'),('Jondi'),('Pat'),('info');
INSERT INTO studio_teams(name,description,is_admin_workspace) VALUES
 ('Team Soullab',NULL,true),('Soullab Founding Circle',NULL,false),('Jondi''s Co-Lab',NULL,false),
 ('[Legacy 2026-10-21] Old A · 1',{LEG},false),('[Legacy 2026-10-21] Old B · 2',{LEG},false);
INSERT INTO studio_team_members(team_id,member_id,role)
 SELECT t.id,m.id,'owner' FROM studio_teams t, members m WHERE m.username='Kelly' AND t.name IN ('Team Soullab','Soullab Founding Circle');
INSERT INTO studio_team_members(team_id,member_id,role)
 SELECT t.id,m.id,'owner' FROM studio_teams t, members m WHERE m.username='Jondi' AND t.name='Jondi''s Co-Lab';
INSERT INTO studio_team_members(team_id,member_id,role)
 SELECT t.id,m.id,'member' FROM studio_teams t, members m WHERE m.username IN ('Jondi','Pat') AND t.name='Soullab Founding Circle';
INSERT INTO practitioners(member_id) SELECT id FROM members WHERE username IN ('Kelly','Jondi');
INSERT INTO team_channels(team_id) SELECT id FROM studio_teams WHERE name IN ('Team Soullab','Soullab Founding Circle');
INSERT INTO team_channel_members(channel_id,member_id) SELECT c.id,m.id FROM team_channels c JOIN studio_teams t ON t.id=c.team_id, members m WHERE t.name='Soullab Founding Circle' AND m.username IN ('Kelly','Jondi','Pat');
INSERT INTO practitioner_clients(practitioner_id) SELECT id FROM practitioners LIMIT 1;
INSERT INTO practitioner_client_notes(practitioner_id,client_id,content_enc,content_enc_meta) SELECT c.practitioner_id,c.id,'\\x00'::bytea,'{{}}'::jsonb FROM practitioner_clients c;
-- positive controls on ACTIVE teams (must PASS)
INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'personal',NULL FROM members m WHERE m.username='Kelly';
INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'colab',t.id FROM members m, studio_teams t WHERE m.username='Kelly' AND t.name='Team Soullab';
INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT p.id,'colab',t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Jondi' AND t.name='Jondi''s Co-Lab';
INSERT INTO sessions(practitioner_id,team_id) SELECT p.id,t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Kelly' AND t.name='Team Soullab';
INSERT INTO team_dm_threads(team_id) SELECT id FROM studio_teams WHERE name='Jondi''s Co-Lab';
INSERT INTO team_dm_members(dm_thread_id,member_id) SELECT d.id,m.id FROM team_dm_threads d, members m WHERE m.username='Jondi';
-- retained rows on LEGACY anchors (must stay INFO, never FAIL)
INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'colab',t.id FROM members m, studio_teams t WHERE m.username='Pat' AND t.name LIKE '%Old A%';
INSERT INTO sessions(practitioner_id,team_id) SELECT p.id,t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Kelly' AND t.name LIKE '%Old A%';
INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT p.id,'colab',t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Jondi' AND t.name LIKE '%Old B%';
"""

def reset():
    psql(f"TRUNCATE {TABLES} CASCADE;"); psql(BASE)

def run_gate(gate=None):
    env = dict(os.environ, DATABASE_URL=f"postgresql://postgres:{PW}@127.0.0.1:5544/{DB}")
    r = subprocess.run(["npx","tsx",gate or GATE],capture_output=True,text=True,env=env,timeout=180)
    return r.returncode, r.stdout + r.stderr

PAT = "SELECT t.id,m.id,'%s' FROM studio_teams t, members m WHERE t.name='%s' AND m.username='Pat'"
# (name, mutation SQL, expected exit, label substring)
DEFEATS = [
 ("D1 Jondi owns no active Co-Lab (the exact failure seen in production)",
  "DELETE FROM studio_team_members WHERE role='owner' AND member_id=(SELECT id FROM members WHERE username='Jondi');", 3, "PRECONDITION UNMET"),
 ("D2 Kelly's owned teams are all legacy anchors",
  f"UPDATE studio_teams SET name='[Legacy 2026-10-21] x', description={LEG} WHERE name IN ('Team Soullab','Soullab Founding Circle');", 3, "PRECONDITION UNMET"),
 ("D3 two admin workspaces", "UPDATE studio_teams SET is_admin_workspace=true WHERE name='Soullab Founding Circle';", 1, "Expected exactly one admin workspace"),
 ("D4 no admin workspace", "UPDATE studio_teams SET is_admin_workspace=false;", 1, "Expected exactly one admin workspace"),
 ("D5 admin workspace not owned by Kelly",
  "UPDATE studio_teams SET is_admin_workspace=true WHERE name='Jondi''s Co-Lab'; UPDATE studio_teams SET is_admin_workspace=false WHERE name='Team Soullab';", 1, "admin workspace is not owned by Kelly"),
 ("D6 legacy anchor flagged as admin", "UPDATE studio_teams SET is_admin_workspace=true WHERE name LIKE '%Old A%';", 1, "legacy anchor(s) flagged as admin workspace"),
 ("D7 a retired Co-Lab has a live member",
  "INSERT INTO studio_team_members(team_id,member_id,role) SELECT t.id,m.id,'member' FROM studio_teams t, members m WHERE t.name LIKE '%Old A%' AND m.username='Pat';", 1, "legacy anchor(s) hold memberships"),
 ("D8 Kelly and Jondi co-own a Co-Lab",
  "INSERT INTO studio_team_members(team_id,member_id,role) SELECT t.id,m.id,'owner' FROM studio_teams t, members m WHERE t.name='Soullab Founding Circle' AND m.username='Jondi';", 1, "co-owned by two principals"),
 ("D9 Jondi is over-privileged in Kelly's Co-Lab",
  "UPDATE studio_team_members SET role='admin' WHERE member_id=(SELECT id FROM members WHERE username='Jondi') AND team_id=(SELECT id FROM studio_teams WHERE name='Soullab Founding Circle');", 1, "non-member role in Kelly's Co-Lab"),
 ("D10 colab atom on an active team by a non-member",
  "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'colab',t.id FROM members m, studio_teams t WHERE m.username='Pat' AND t.name='Jondi''s Co-Lab';", 1, "colab-scope atom(s) sit on an active Co-Lab"),
 ("D11 colab file on an active team by a non-member practitioner",
  "INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT p.id,'colab',t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Kelly' AND t.name='Jondi''s Co-Lab';", 1, "colab-scope file(s) sit on an active Co-Lab"),
 ("D12 session on an active team by a non-member practitioner",
  "INSERT INTO sessions(practitioner_id,team_id) SELECT p.id,t.id FROM practitioners p JOIN members m ON m.id=p.member_id, studio_teams t WHERE m.username='Kelly' AND t.name='Jondi''s Co-Lab';", 1, "session(s) sit on an active Co-Lab"),
 ("D13 DM participant outside the thread's team",
  "INSERT INTO team_dm_members(dm_thread_id,member_id) SELECT d.id,m.id FROM team_dm_threads d, members m WHERE m.username='Pat';", 1, "DM participant(s) are not members"),
 ("D14 channel member outside the channel's team",
  "INSERT INTO team_channel_members(channel_id,member_id) SELECT c.id,m.id FROM team_channels c JOIN studio_teams t ON t.id=c.team_id, members m WHERE t.name='Team Soullab' AND m.username='Pat';", 1, "channel member(s) are not members"),
 ("D15 a live channel hangs off a legacy anchor", "INSERT INTO team_channels(team_id) SELECT id FROM studio_teams WHERE name LIKE '%Old A%';", 1, "channel(s) hang off a legacy anchor"),
 ("D16 personal atom carries a team_id",
  "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'personal',t.id FROM members m, studio_teams t WHERE m.username='Kelly' AND t.name='Team Soullab';", 1, "personal atom(s) have team_id set"),
 ("D17 personal file carries a team_id",
  "INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT p.id,'personal',t.id FROM practitioners p, studio_teams t WHERE t.name='Team Soullab' LIMIT 1;", 1, "personal file(s) have team_id set"),
 ("D18 client note attached to another practitioner's client",
  "UPDATE practitioner_client_notes SET practitioner_id=(SELECT id FROM practitioners WHERE id <> (SELECT practitioner_id FROM practitioner_clients LIMIT 1) LIMIT 1);", 1, "attached to another practitioner's client"),
 ("D19 unencrypted client note", "UPDATE practitioner_client_notes SET content_enc=NULL;", 1, "missing ciphertext or encryption metadata"),
 # --- added after independent review (F1, F3, F4) ---
 ("D20 a second owner on Jondi's Co-Lab",
  "INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("owner","Jondi''s Co-Lab") + ";", 1, "zero or several owners"),
 ("D21 a non-principal holds 'admin' in the Founding Circle",
  "UPDATE studio_team_members SET role='admin' WHERE member_id=(SELECT id FROM members WHERE username='Pat') AND team_id=(SELECT id FROM studio_teams WHERE name='Soullab Founding Circle');", 1, "Unexpected or NULL membership role"),
 ("D22 a plain member sits in the admin workspace (the stranded-in-the-commons case)",
  "INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("member","Team Soullab") + ";", 1, "other than the declared owner(s) is in the admin workspace"),
 ("D23 a non-principal owns the admin workspace",
  "INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("owner","Team Soullab") + ";", 1, "other than the declared owner(s) is in the admin workspace"),
 ("D24 a DM thread hangs off a legacy anchor", "INSERT INTO team_dm_threads(team_id) SELECT id FROM studio_teams WHERE name LIKE '%Old A%';", 1, "DM thread(s) hang off a legacy anchor"),
 ("D25 a memory atom with an unknown scope", "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT id,'shared',NULL FROM members WHERE username='Kelly';", 1, "memory atom(s) have an unknown or NULL scope"),
 ("D26 a file with an unknown scope", "INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT id,'team',NULL FROM practitioners LIMIT 1;", 1, "file(s) have an unknown or NULL scope"),
 ("D27 a colab atom with no team", "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT id,'colab',NULL FROM members WHERE username='Kelly';", 1, "colab-scope row(s) carry no team_id"),
 ("D28 a DM thread with no team", "INSERT INTO team_dm_threads(team_id) VALUES (NULL);", 1, "DM thread(s) carry no team_id"),
 ("D29 a team session with no practitioner", "INSERT INTO sessions(practitioner_id,team_id) SELECT NULL,id FROM studio_teams WHERE name='Team Soullab';", 1, "team-scoped session(s) have no practitioner"),
 # --- added after the second independent review (N3, N4, residual F4) ---
 ("D30 an active Co-Lab with no owner (a member only)",
  "INSERT INTO studio_teams(name) VALUES ('Pat''s Co-Lab'); INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("member","Pat''s Co-Lab") + ";", 1, "zero or several owners"),
 ("D31 a membership with a NULL role",
  "INSERT INTO studio_team_members(team_id,member_id,role) SELECT t.id,m.id,NULL FROM studio_teams t, members m WHERE t.name='Jondi''s Co-Lab' AND m.username='Pat';", 1, "Unexpected or NULL membership role"),
 ("D32 a colab atom naming a Co-Lab that does not exist",
  "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT id,'colab',gen_random_uuid() FROM members WHERE username='Kelly';", 1, "name a Co-Lab that does not exist"),
 ("D33 a colab file with no practitioner",
  "INSERT INTO practitioner_files(practitioner_id,file_scope,team_id) SELECT NULL,'colab',id FROM studio_teams WHERE name='Team Soullab';", 1, "colab-scope file(s) have no practitioner"),
 ("D34 a DM participant whose thread does not exist",
  "INSERT INTO team_dm_members(dm_thread_id,member_id) SELECT gen_random_uuid(),id FROM members WHERE username='Pat';", 1, "belong to no thread"),
 ("D35 a session naming a Co-Lab that does not exist",
  "INSERT INTO sessions(practitioner_id,team_id) SELECT id,gen_random_uuid() FROM practitioners LIMIT 1;", 1, "name a Co-Lab that does not exist"),
 # --- departure semantics (documented, decision held): content left behind after a member leaves FAILS ---
 ("D36 DEPARTURE: Pat leaves the Founding Circle but a colab atom of Pat's remains there",
  "INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'colab',t.id FROM members m, studio_teams t WHERE m.username='Pat' AND t.name='Soullab Founding Circle'; DELETE FROM studio_team_members WHERE member_id=(SELECT id FROM members WHERE username='Pat') AND team_id=(SELECT id FROM studio_teams WHERE name='Soullab Founding Circle');", 1, "colab-scope atom(s) sit on an active Co-Lab"),
 ("D37 DEPARTURE: Pat leaves the Founding Circle but remains a channel member there",
  "DELETE FROM studio_team_members WHERE member_id=(SELECT id FROM members WHERE username='Pat') AND team_id=(SELECT id FROM studio_teams WHERE name='Soullab Founding Circle');", 1, "channel member(s) are not members"),
]
# Positive fixtures: must still PASS (the gate must not fail for the wrong reason)
POSITIVES = [
 ("P1 an active team renamed with only the name marker is NOT hidden as legacy (AND-form)",
  "UPDATE studio_teams SET name='[Legacy 2026-10-21] looks old' WHERE name='Soullab Founding Circle';"),
 ("P3 a new tester who owns their own Co-Lab (the sanctioned onboarding shape) must NOT block the gate",
  "INSERT INTO members(username) VALUES ('Tess'); INSERT INTO studio_teams(name) VALUES ('Tess''s Co-Lab'); INSERT INTO studio_team_members(team_id,member_id,role) SELECT t.id,m.id,'owner' FROM studio_teams t, members m WHERE t.name='Tess''s Co-Lab' AND m.username='Tess'; INSERT INTO member_memory_atoms(member_id,memory_scope,team_id) SELECT m.id,'colab',t.id FROM members m, studio_teams t WHERE m.username='Tess' AND t.name='Tess''s Co-Lab';"),
 ("P2 more retained session rows on a legacy anchor stay informational",
  "INSERT INTO sessions(practitioner_id,team_id) SELECT p.id,t.id FROM practitioners p, studio_teams t WHERE t.name LIKE '%Old B%' LIMIT 1;"),
]
# Gate mutants: weaken the gate source; the BASELINE must then fail (killed by the positive controls)
MUTANTS = [
 ("M1 drop the active-team filter (treat legacy as active)", "const ACTIVE = `NOT ${LEGACY}`;", "const ACTIVE = `TRUE`;", None),
 ("M2 fail on any colab atom (drop the membership predicate)",
  "NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = a.team_id AND x.member_id = a.member_id)", "TRUE", None),
 ("M3 fail on any session (drop the practitioner-membership predicate)",
  "NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = s.team_id AND x.member_id = pr.member_id)", "TRUE", None),
 ("M7 fail on any colab file (drop the membership predicate)",
  "NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = f.team_id AND x.member_id = pr.member_id)", "TRUE", None),
 ("M8 fail on any DM participant (drop the membership predicate)",
  "NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = dt.team_id AND x.member_id = dm.member_id)", "TRUE", None),
 ("M9 fail on any channel member (drop the membership predicate)",
  "NOT EXISTS (SELECT 1 FROM studio_team_members x WHERE x.team_id = c.team_id AND x.member_id = cm.member_id)", "TRUE", None),
 # Fixture mutants: remove a check; the fixture built to catch it must then PASS (so it genuinely depends on that check).
 ("M4 drop the admin-workspace intruder check  [fixture D22 must then pass]",
  "const intruders = adminMembers.filter(r => !(r.role === 'owner' && ADMIN_WORKSPACE_OWNERS.includes(r.username)));", "const intruders: typeof adminMembers = [];",
  "INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("member","Team Soullab") + ";"),
 ("M5 drop the DM-on-legacy-anchor check  [fixture D24 must then pass]",
  "if (dmLegacy === 0) pass('No DM thread hangs off a legacy anchor'); else fail(`${dmLegacy} DM thread(s) hang off a legacy anchor`);", "pass('removed');",
  "INSERT INTO team_dm_threads(team_id) SELECT id FROM studio_teams WHERE name LIKE '%Old A%';"),
 ("M6 drop the exactly-one-owner check  [fixture D20 must then pass]",
  "if (ownerCounts.length === 0) pass('Every active Co-Lab has exactly one owner');\n  else fail('Active Co-Lab(s) with zero or several owners', ownerCounts.map(r => `${r.name}:${r.n}`).join(', '));", "pass('removed');",
  "INSERT INTO studio_team_members(team_id,member_id,role) " + PAT % ("owner","Jondi''s Co-Lab") + ";"),
]

psql(f"DROP DATABASE IF EXISTS {DB};", db="postgres", check=False)
psql(f"CREATE DATABASE {DB};", db="postgres")
psql(SCHEMA)
gate_bytes = open(GATE,'rb').read()
sha = hashlib.sha256(gate_bytes).hexdigest()
git = subprocess.run(["git","rev-parse","--short","HEAD"],capture_output=True,text=True).stdout.strip() or "n/a"
print(f"GATE: {GATE}  sha256={sha}  git={git}")

reset(); code, out = run_gate()
summary = re.search(r"Results: (\d+ passed · \d+ failed · \d+ warned)", out)
base_ok = code == 0 and summary and summary.group(1) == EXPECTED_BASELINE
print(f"BASELINE: exit {code}  {summary.group(1) if summary else 'no summary'}  {'GOOD' if base_ok else 'BAD'}")
if not base_ok: print(out[-2500:]); sys.exit(2)

bad = 0
for name, mut, exp_code, label in DEFEATS:
    reset(); psql(mut); code, out = run_gate()
    ok = code == exp_code and label in out
    bad += 0 if ok else 1
    print(f"{'KILLED' if ok else 'SURVIVED/WRONG':14} {name}  [exit {code}, want {exp_code}]")
for name, mut in POSITIVES:
    reset(); psql(mut); code, out = run_gate()
    ok = code == 0 and "0 failed" in out
    bad += 0 if ok else 1
    print(f"{'PASSES' if ok else 'WRONGLY-FAILS':14} {name}  [exit {code}]")
reset()
for name, a, b, fixture in MUTANTS:
    src = gate_bytes.decode()
    if src.count(a) < 1:
        print(f"{'ANCHOR-MISSING':14} {name}"); bad += 1; continue
    mp = os.path.join(os.path.dirname(GATE) or ".", "__mutant_gate.ts")
    open(mp,"w").write(src.replace(a,b))
    try:
        reset()
        if fixture: psql(fixture)
        code, out = run_gate(mp)
    finally:
        if os.path.exists(mp): os.remove(mp)
    if fixture:
        ok = code == 0          # with the check removed the fixture goes undetected => the fixture depends on the check
        print(f"{'FIXTURE-DEPENDS' if ok else 'FIXTURE-INERT':14} {name}  [mutant gate exit {code}]")
    else:
        ok = code != 0 and "❌ FAIL" in out and "Verification error" not in out   # a genuine FAIL, not a crash
        print(f"{'MUTANT-KILLED' if ok else 'MUTANT-SURVIVED':14} {name}  [baseline exit {code}]")
    bad += 0 if ok else 1
print(f"\n{len(DEFEATS)} defeat fixtures · {len(POSITIVES)} positive fixtures · {len(MUTANTS)} gate mutants; {bad} not as expected")
sys.exit(1 if bad else 0)
