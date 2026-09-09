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

# ⛔ REAL MEMBER TEXT IS ABOUT TO EXIST ON DISK. Restrict it to this user before
# a single byte is written — not after, when the window has already been open.
umask 077

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

# ⛔ AN EMPTY EXPORT IS A FAILURE, NOT A COPY. The first version printed
# "witness copy taken" over five header-only files and exited 0, because it
# counted rows without ever asking whether there were any. It would have handed
# the witness a runtime containing no book — and the §4b observer would have
# been left to discover that a manuscript id matched nothing by finding an empty
# Canvas. An instrument that cannot fail cannot be trusted when it passes.
# ⛔ `wc -l` COUNTS LINES, AND A MANUSCRIPT IS FULL OF NEWLINES. The first
# version reported row counts as `wc -l` minus one. Bodies contain newlines
# inside quoted CSV fields, so one record spans many lines: a Work with 262
# sections was reported as 3952. The export was correct; the number was a
# fabrication produced by counting the wrong thing.
#
#   A value must not say more than it knows.
#
# Counts now come from the database itself, in the same read-only session that
# produced the copy — authoritative, and about the same rows.
COUNTS="$(psql "$DATABASE_URL" -tA -F'|' -c "
  $RO
  SELECT (SELECT count(*) FROM member_manuscripts WHERE id = '$MID'),
         (SELECT count(*) FROM manuscript_sections WHERE manuscript_id = '$MID'),
         (SELECT count(*) FROM manuscript_working_drafts WHERE manuscript_id = '$MID'),
         (SELECT count(*) FROM manuscript_draft_sections s
            JOIN manuscript_working_drafts d ON d.id = s.draft_id
           WHERE d.manuscript_id = '$MID'),
         (SELECT count(*) FROM working_draft_revisions r
            JOIN manuscript_working_drafts d ON d.id = r.draft_id
           WHERE d.manuscript_id = '$MID')")"
IFS='|' read -r ROWS_MS C_SRC C_DR C_DS C_REV <<EOC
$COUNTS
EOC

echo "── witness copy ──"
printf '  %-16s %s rows\n' manuscript "$ROWS_MS" source_sections "$C_SRC" \
       draft "$C_DR" draft_sections "$C_DS" revisions "$C_REV"

if [ "$ROWS_MS" -lt 1 ]; then
  echo
  echo "⛔ NO SUCH WORK: manuscript_id $MID matched no row in member_manuscripts."
  echo "   Nothing was exported. This is not a copy and must not be witnessed."
  echo
  echo "   Find the right id (read-only):"
  echo "     SELECT m.id, m.title, m.created_at,"
  echo "            (SELECT count(*) FROM manuscript_draft_sections ds"
  echo "               JOIN manuscript_working_drafts d ON d.id = ds.draft_id"
  echo "              WHERE d.manuscript_id = m.id) AS addressable_sections,"
  echo "            (SELECT d.section_addressable_at IS NOT NULL"
  echo "               FROM manuscript_working_drafts d"
  echo "              WHERE d.manuscript_id = m.id) AS is_addressable"
  echo "       FROM member_manuscripts m ORDER BY m.created_at;"
  rm -rf "$OUT"
  exit 1
fi

DS="$C_DS"
if [ "$DS" -lt 1 ]; then
  echo
  echo "⛔ The Work exists but has NO addressable draft sections."
  echo "   Whole Manuscript cannot mount, so §4b cannot be performed on it."
  echo "   Nothing here converts it — that would be witnessing something the"
  echo "   member never had."
  rm -rf "$OUT"
  exit 1
fi
# ⭐ THE CUSTODY MARKER. The witness runtime TAKES CUSTODY of this directory and
# deletes the original, so that "Ctrl-C destroys the copy" is true rather than
# merely claimed. A script that deletes a directory the caller named must never
# hold generic `rm -rf "$IN"` authority over an arbitrary path — so it deletes
# only a directory carrying this marker, written by this script, here.
{
  echo "wm-witness-export"
  echo "manuscript_id=$MID"
  echo "exported_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "draft_sections=$DS"
} > "$OUT/.wm-witness-export"

echo "  ✓ $DS addressable sections — this is a witnessable Work"
echo
echo "⛔ This directory now holds real member text, readable only by you."
echo "   The witness runtime will TAKE CUSTODY of it and delete this original,"
echo "   so the copy dies when the witness ends. Until then it persists here:"
echo "     $OUT"
echo
echo "⛔ This copy contains real member text. Keep it off shared storage, and"
echo "   delete it when the witness is finished."
