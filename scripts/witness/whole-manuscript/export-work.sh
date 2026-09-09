#!/usr/bin/env bash
# WS-WHOLE-MANUSCRIPT-01 · §4b — take a READ-ONLY witness copy of one Work.
#
# ⛔ THIS SCRIPT NEVER WRITES. Every statement is a SELECT rendered through
# \copy. It opens the source database in a read-only transaction and would fail
# on any attempted write. It is safe to run against production BECAUSE it cannot
# change production — but see the ruling below: the WITNESS never runs there.
#
#   The witness needs the real book. It does not need the real database.
#
# The founder runs this against the source; everything downstream runs against
# the file it produces. Usage:
#
#   DATABASE_URL=<source> bash export-work.sh <manuscript_id> <out_dir>
#
# ⚠️ WHICH Work: two records named ELEMENTAL_ALCHEMY exist and their identity
# question is UNRESOLVED. This script therefore takes an explicit id and will
# not guess. Resolving which is which is a separate, still-open task, and
# nothing here deletes, merges or judges either one.

set -Eeuo pipefail
MID="${1:?manuscript_id required — this script will not guess which Work}"
OUT="${2:?output directory required}"
: "${DATABASE_URL:?DATABASE_URL (source) required}"
mkdir -p "$OUT"

# Read-only for the whole session. A write would abort rather than proceed.
RO='SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;'

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<SQL
$RO
\copy (SELECT id, member_id, title, provenance, source_custody, created_at FROM member_manuscripts WHERE id = '$MID') TO '$OUT/manuscript.csv' CSV HEADER
\copy (SELECT id, manuscript_id, position, heading, body FROM manuscript_sections WHERE manuscript_id = '$MID' ORDER BY position) TO '$OUT/source_sections.csv' CSV HEADER
\copy (SELECT id, manuscript_id, member_id, content, base_source_hash, revision_count, version, section_addressable_at FROM manuscript_working_drafts WHERE manuscript_id = '$MID') TO '$OUT/draft.csv' CSV HEADER
\copy (SELECT s.id, s.draft_id, s.position, s.text, s.source_section_id FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id WHERE d.manuscript_id = '$MID' ORDER BY s.position) TO '$OUT/draft_sections.csv' CSV HEADER
\copy (SELECT r.draft_id, r.revision_number, r.content, r.saved_by, r.note, r.created_at FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id = r.draft_id WHERE d.manuscript_id = '$MID' ORDER BY r.revision_number) TO '$OUT/revisions.csv' CSV HEADER
SQL

echo "── witness copy taken (read-only) ──"
for f in manuscript source_sections draft draft_sections revisions; do
  printf '  %-16s %s rows\n' "$f" "$(( $(wc -l < "$OUT/$f.csv") - 1 ))"
done
echo
echo "⛔ This copy contains real member text. Keep it off shared storage, and"
echo "   delete it when the witness is finished."
