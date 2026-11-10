#!/bin/bash
# Full clean reset of the fictional walk environment (harness, long chapter, kept version, second writer, stub).
set -e; . /home/user/env.sh; cd /home/user/p0-cand
export PGBIN=/home/user/pgshim PSQL_BIN=/usr/bin/psql WS_WALK_STATE=/home/user/walkstate
bash scripts/witness/ws-continuity-walk.sh down 2>&1 | grep -v setlocale | tail -1 || true
pkill -f stub2.mjs 2>/dev/null || true; pkill -f "postgresql/16/bin/postgres" 2>/dev/null || true; sleep 2; rm -rf /home/user/walkstate
timeout 1700 bash scripts/witness/ws-continuity-walk.sh up 2>&1 | grep -v setlocale | tail -1
/home/user/swapstub.sh ${1:-25000}
MS=$(cat /home/user/walkstate/manuscript.id); P="psql -X -q -At -h 127.0.0.1 -p 54329 -U fictional -d walk_fictional"
python3 - <<PY
import subprocess
paras=[f"Paragraph {k}. The letter sat on the sill through the whole of March, and nobody in the house said what it was. Marta moved it twice and read the address on the front each time, as though the street might have changed since the morning." for k in range(1,41)]
body="The letter came in March, folded small, and she carried it for a week before she opened it.\n\n"+"\n\n".join(paras); q=lambda x:x.replace("'","''")
sql=f"""UPDATE manuscript_sections SET body='{q(body)}' WHERE manuscript_id='$MS' AND heading='The Letter';
UPDATE manuscript_draft_sections s SET text='The Letter'||chr(10)||chr(10)||'{q(body)}' FROM manuscript_sections ms WHERE s.source_section_id=ms.id AND ms.manuscript_id='$MS' AND ms.heading='The Letter';
UPDATE manuscript_working_drafts SET content=(SELECT string_agg(heading||E'\\\\n\\\\n'||body,'' ORDER BY position) FROM manuscript_sections WHERE manuscript_id='$MS') WHERE manuscript_id='$MS';"""
r=subprocess.run(['psql','-X','-q','-h','127.0.0.1','-p','54329','-U','fictional','-d','walk_fictional','-v','ON_ERROR_STOP=1','-c',sql],capture_output=True,text=True); print('lengthened:',r.returncode==0,r.stderr[:120])
PY
node keep.mjs 2>&1 | tail -1
HASH=$($P -c "SELECT password_hash FROM members WHERE username='bwriter'")
M2=$($P -c "INSERT INTO members(passkey,username,password_hash,name,onboarded,onboarding_step) VALUES ('walk-passkey-2','cwriter','$HASH','Second Fictional Writer',true,'complete') RETURNING id" | head -1)
$P -c "INSERT INTO ops_contacts (name, member_id, contact_type, pipeline_stage, metadata) VALUES ('Second Fictional Writer (walk)', '$M2', 'beta_tester', 'active', '{\"writers_studio_beta\": true}'::jsonb)" >/dev/null 2>&1
BK=$($P <<SQL | tail -1
WITH w AS (INSERT INTO living_works(member_id,title,purpose) VALUES ('$M2','The Quiet Orchard','A second fictional novel.') RETURNING id,member_id),
ms AS (INSERT INTO member_manuscripts(member_id,title) SELECT member_id,'The Quiet Orchard' FROM w RETURNING id,member_id),
e AS (INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) SELECT w.id,'manuscript',ms.id,w.member_id FROM w,ms RETURNING 1),
d AS (INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) SELECT id,member_id,'','h' FROM ms RETURNING id)
SELECT (SELECT id FROM ms)||'|'||(SELECT id FROM d);
SQL
)
MS2=${BK%%|*}; DR2=${BK##*|}; T='The orchard held its breath before the frost, and nobody on the hill spoke of it.'
$P -c "WITH src AS (INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ('$MS2',1,'Orchard','$T') RETURNING id) INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) SELECT '$DR2',1,'Orchard'||chr(10)||chr(10)||'$T',id FROM src" >/dev/null
$P -c "UPDATE manuscript_working_drafts SET content='Orchard'||chr(10)||chr(10)||'$T', section_addressable_at=NOW() WHERE id='$DR2'" >/dev/null
echo "$MS2" > /home/user/walkstate/ms2.id; echo "RESET COMPLETE · readings=$($P -c 'SELECT count(*) FROM developmental_readings') revisions=$($P -c 'SELECT count(*) FROM working_draft_revisions')"
