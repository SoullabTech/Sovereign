#!/usr/bin/env python3
"""G2-3E: temporary local Unix-socket PostgreSQL authentication/ownership witness.
Fictional identities ONLY. Never contacts production, installs migration or opens a TCP listener.
Source G2 release gate remains FALSE; only the Jest test fixture mocks admission.
"""
import os
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import quote
import hashlib

ROOT = Path(__file__).resolve().parents[2]
MIGRATION = ROOT / 'scripts/witness/fixtures/G2_3A_PROPOSED_SCHEMA_UNAPPLIED.sql'
EXPECTED_SHA = 'f46b12d808e14a4fabe273666d7358e7a59df24e4c633505f7ceeef2d0337465'
GATE = ROOT / 'lib/ganesha/g2MemberAuthoringRelease.ts'
TEST = 'lib/ganesha/__tests__/g2EAuthenticatedPg.test.ts'
PORT = 58471

def run(args, input=None, env=None, timeout=120):
    r = subprocess.run([str(a) for a in args], input=input, text=True,
                       capture_output=True, cwd=ROOT, env=env, timeout=timeout)
    if r.returncode:
        raise RuntimeError('Fixture command failed: ' + str(args[:2]) + ' ' +
                           (r.stderr or r.stdout)[-1800:])
    return r.stdout

assert hashlib.sha256(MIGRATION.read_bytes()).hexdigest() == EXPECTED_SHA
assert 'return false;' in GATE.read_text(), 'Actual source-level release gate must remain held'
A = '11111111-1111-4111-8111-111111111111'
B = '22222222-2222-4222-8222-222222222222'
P = '33333333-3333-4333-8333-333333333333'
PRO = '44444444-4444-4444-8444-444444444444'
AN = '55555555-5555-4555-8555-555555555555'
BN = '66666666-6666-4666-8666-666666666666'
HIST = '77777777-7777-4777-8777-777777777777'
DEC_A = '88888888-8888-4888-8888-888888888888'
DEC_B = '99999999-9999-4999-8999-999999999999'
ATT_A = 'a0000000-0000-4000-8000-000000000001'
ATT_B = 'a0000000-0000-4000-8000-000000000002'
ATT_H = 'a0000000-0000-4000-8000-000000000003'

# All identifiers and credentials below are deliberately fictional fixture-only constants.
SQL = f"""
CREATE TABLE members(id UUID PRIMARY KEY);
CREATE TABLE auth_sessions(
  session_token text PRIMARY KEY, member_id UUID NOT NULL REFERENCES members(id),
  revoked boolean NOT NULL DEFAULT false, expires_at timestamptz NOT NULL
);
CREATE TABLE practitioners(
  id UUID PRIMARY KEY, member_id UUID NOT NULL REFERENCES members(id),
  portal_type text, status text NOT NULL
);
CREATE TABLE studio_decisions(
  id UUID PRIMARY KEY, title text, status text, decision_scope text,
  personal_member_id UUID, practitioner_id UUID, client_id UUID, team_id UUID,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE studio_changes(
  id UUID PRIMARY KEY, title text, status text, member_id UUID,
  practitioner_id UUID, client_id UUID, team_id UUID,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE process_items(
  id UUID PRIMARY KEY, title text, type text, status text,
  member_id UUID, practitioner_id UUID, created_at timestamptz DEFAULT now()
);
CREATE TABLE field_notes(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID, section text, body text, created_at timestamptz DEFAULT now()
);
CREATE TABLE field_attention(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID, field text, kind text, ref_id UUID, label text,
  position integer DEFAULT 0, created_at timestamptz DEFAULT now()
);
CREATE TABLE field_events(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID, title text, event_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE field_people(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  team_id UUID, name text, note text, created_at timestamptz DEFAULT now()
);
INSERT INTO members(id) VALUES ('{A}'),('{B}');
INSERT INTO auth_sessions VALUES
 ('g2e-session-A','{A}',false,'2099-01-01T00:00:00Z'),
 ('g2e-session-A2','{A}',false,'2099-01-01T00:00:00Z'),
 ('g2e-session-B','{B}',false,'2099-01-01T00:00:00Z'),
 ('g2e-session-expired','{A}',false,'2000-01-01T00:00:00Z'),
 ('g2e-session-revoked','{A}',true,'2099-01-01T00:00:00Z');
INSERT INTO practitioners VALUES
 ('{P}','{B}','personal','active'),
 ('{PRO}','{B}','generalist','active');
INSERT INTO studio_decisions(id,title,status,decision_scope,personal_member_id) VALUES
 ('{DEC_A}','A private decision','open','personal','{A}'),
 ('{DEC_B}','B private decision','open','personal','{B}');
INSERT INTO field_notes(id,practitioner_id,section,body) VALUES
 ('{HIST}','{P}','alive','B historic private note'),
 ('e0000000-0000-4000-8000-000000000001','{PRO}','alive','B professional private note');
INSERT INTO field_attention(id,practitioner_id,field,kind,ref_id,label) VALUES
 ('{ATT_H}','{P}','important','note',NULL,'B historical attention'),
 ('e0000000-0000-4000-8000-000000000002','{PRO}','important','note',NULL,'B professional attention');
INSERT INTO field_events(id,practitioner_id,title,event_at) VALUES
 ('b0000000-0000-4000-8000-000000000001','{P}','B historical event', '2026-10-20T11:00:00Z'),
 ('b0000000-0000-4000-8000-000000000002','{PRO}','B professional event','2026-10-20T11:00:00Z');
INSERT INTO field_people(id,practitioner_id,name,note) VALUES
 ('c0000000-0000-4000-8000-000000000001','{P}','B historical person','B own'),
 ('c0000000-0000-4000-8000-000000000002','{PRO}','B professional person','Pro only');
"""
NATIVE = f"""
INSERT INTO field_notes(id,personal_member_id,practitioner_id,team_id,section,body) VALUES
 ('{AN}','{A}',NULL,NULL,'alive','A own native note'),
 ('{BN}','{B}',NULL,NULL,'asking','B own native note');
INSERT INTO field_attention(id,personal_member_id,practitioner_id,team_id,field,kind,ref_id,label,position) VALUES
 ('{ATT_A}','{A}',NULL,NULL,'important','note',NULL,'A chosen attention',1),
 ('{ATT_B}','{B}',NULL,NULL,'important','note',NULL,'B chosen attention',1);
INSERT INTO field_events(id,personal_member_id,practitioner_id,title,event_at) VALUES
 ('d0000000-0000-4000-8000-000000000001','{A}',NULL,'A native event','2026-10-20T12:00:00Z'),
 ('d0000000-0000-4000-8000-000000000002','{B}',NULL,'B native event','2026-10-20T12:00:00Z');
INSERT INTO field_people(id,personal_member_id,practitioner_id,name,note) VALUES
 ('f0000000-0000-4000-8000-000000000001','{A}',NULL,'A fictional friend','A own'),
 ('f0000000-0000-4000-8000-000000000002','{B}',NULL,'B fictional friend','B own');
"""

with tempfile.TemporaryDirectory(prefix='g2e_auth_', dir='/tmp') as tmp:
    data = Path(tmp)/'data'
    sock = Path(tmp)/'sock'
    sock.mkdir(mode=0o700)
    started = False
    env = os.environ.copy()
    env['PGHOST'] = str(sock)
    env['PGPORT'] = str(PORT)
    env['PGUSER'] = 'fixture'
    env['PGDATABASE'] = 'postgres'
    env['DATABASE_URL'] = ('postgresql://fixture@localhost/postgres?host='
                           + quote(str(sock), safe='') + '&port=' + str(PORT))
    env['G2E_DISCONNECTED_FIXTURE'] = 'yes'
    try:
        run(['initdb', '-D', data, '-U', 'fixture', '--auth-local=trust',
             '--auth-host=reject', '--encoding=UTF8', '--no-sync'])
        run(['pg_ctl', '-D', data, '-l', Path(tmp)/'postgres.log', '-w',
             '-o', "-p "+str(PORT)+" -h '' -k "+str(sock)+" -F", 'start'], timeout=45)
        started = True
        psql = ['psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-h', sock,
                '-p', PORT, '-U', 'fixture', '-d', 'postgres']
        run(psql, SQL)
        run(psql + ['-f', MIGRATION])
        run(psql, NATIVE)
        print('G2-3E FICTIONAL PG14 READY: temporary Unix-socket-only server, no TCP listener, no production credentials', flush=True)
        test = subprocess.run([str(ROOT/'node_modules/.bin/jest'), '--config',
            'jest.config.js', '--runInBand', '--silent', '--no-cache', TEST],
            cwd=ROOT, env=env, text=True, capture_output=True, timeout=150)
        if test.returncode:
            raise RuntimeError('G2-3E Jest failed: ' + test.stderr[-3000:])
        for line in test.stderr.splitlines():
            if line.strip().startswith(('PASS ', 'Test Suites:', 'Tests:', 'Snapshots:', 'Time:')):
                print(line.strip(), flush=True)
        print('G2_3E_SESSION_BACKED_PG_FIXTURE_PASS', flush=True)
    finally:
        if started:
            run(['pg_ctl', '-D', data, '-w', '-m', 'immediate', 'stop'], timeout=45)
            print('G2-3E fixture server stopped; temporary database scheduled for removal', flush=True)
print('G2-3E temporary fixture removed', flush=True)
