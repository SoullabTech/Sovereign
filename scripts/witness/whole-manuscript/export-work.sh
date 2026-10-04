#!/usr/bin/env bash
# WS-WHOLE-MANUSCRIPT-01 · §4b — take a READ-ONLY witness copy of one Work.
#
# ⛔ THIS SCRIPT NEVER WRITES to the source. Every statement is a SELECT, inside
# an explicitly READ ONLY transaction. It is safe to run against production
# BECAUSE it cannot change production — but the WITNESS never runs there.
#
#   The witness needs the real book. It does not need the real database.
#
# ⚠️ WHICH Work: more than one record shares the title ELEMENTAL_ALCHEMY and the
# duplicate question is UNRESOLVED. This script takes an explicit id and will
# not guess. Nothing here deletes, merges, or adjudicates any record.

set -Eeuo pipefail

# ⛔ REAL MEMBER TEXT IS ABOUT TO EXIST ON DISK. Restrict it to this user before
# a single byte is written — not after, when the window has already been open.
umask 077

MID="${1:?manuscript_id required — this script will not guess which Work}"
OUT="${2:?output directory required}"
: "${DATABASE_URL:?DATABASE_URL (source) required}"
mkdir -p "$OUT"

# ⭐ ONE TRANSACTION, ONE SNAPSHOT, ONE TRUTH.
#
# The five exports and the manifest that describes them run inside a single
# REPEATABLE READ READ ONLY transaction. Two reasons, and the second is the one
# that matters for a Class A copy:
#
#   · A live source could change between files. Five separately-read tables are
#     five moments; a witness copy assembled from five moments is not a copy of
#     anything that ever existed.
#   · The counts must describe THE COPY. Counting in a second connection
#     describes the database at a later instant and merely resembles the copy.
#
# ⛔ The manifest is written INSIDE the transaction for exactly that reason. An
# earlier version counted in a separate psql invocation while claiming the
# counts came from "the same read-only session that produced the copy" — a
# sentence the code did not keep.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<SQL
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;

\copy (SELECT id, member_id, title, provenance, source_custody, created_at FROM member_manuscripts WHERE id = '$MID') TO '$OUT/manuscript.csv' CSV HEADER
\copy (SELECT id, manuscript_id, position, heading, body FROM manuscript_sections WHERE manuscript_id = '$MID' ORDER BY position) TO '$OUT/source_sections.csv' CSV HEADER
\copy (SELECT id, manuscript_id, member_id, content, base_source_hash, revision_count, version, section_addressable_at FROM manuscript_working_drafts WHERE manuscript_id = '$MID') TO '$OUT/draft.csv' CSV HEADER
\copy (SELECT s.id, s.draft_id, s.position, s.text, s.source_section_id FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id WHERE d.manuscript_id = '$MID' ORDER BY s.position) TO '$OUT/draft_sections.csv' CSV HEADER
\copy (SELECT r.draft_id, r.revision_number, r.content, r.saved_by, r.note, r.created_at FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id = r.draft_id WHERE d.manuscript_id = '$MID' ORDER BY r.revision_number) TO '$OUT/revisions.csv' CSV HEADER

-- The manifest: counts of the very rows just written, from the same snapshot.
-- ⛔ NOT \`wc -l\`. Manuscript bodies carry newlines inside quoted CSV fields, so
-- one record spans many file lines: counting lines reported a 262-section Work
-- as 3952 addressable sections, and printed a check mark over it.
--   A value must not say more than it knows.
\copy (SELECT (SELECT count(*) FROM member_manuscripts WHERE id = '$MID') AS manuscript, (SELECT count(*) FROM manuscript_sections WHERE manuscript_id = '$MID') AS source_sections, (SELECT count(*) FROM manuscript_working_drafts WHERE manuscript_id = '$MID') AS draft, (SELECT count(*) FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id = s.draft_id WHERE d.manuscript_id = '$MID') AS draft_sections, (SELECT count(*) FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id = r.draft_id WHERE d.manuscript_id = '$MID') AS revisions, coalesce((SELECT d.section_addressable_at IS NOT NULL FROM manuscript_working_drafts d WHERE d.manuscript_id = '$MID'), false) AS addressable) TO '$OUT/manifest.csv' CSV HEADER

COMMIT;
SQL

# The manifest has no embedded newlines, so its second line is its one record.
IFS=',' read -r ROWS_MS C_SRC C_DR C_DS C_REV ADDRESSABLE < <(tail -n +2 "$OUT/manifest.csv")

# ⛔ A GUARD THAT FAILS OPEN IS WORSE THAN NO GUARD. An earlier version put the
# read-only SET inside the counts query, so psql emitted "SET" as its first
# result line and the counts landed one field over. `[ "$ROWS_MS" -lt 1 ]` then
# errored with "integer expression expected" — and because bash exempts `if`
# conditions from `set -e`, AN ERRORING TEST READS AS FALSE. The refusal did not
# fire and a check mark was printed over an empty count. Every number is now
# proven to be a number BEFORE any comparison depends on it.
for v in ROWS_MS C_SRC C_DR C_DS C_REV; do
  case "${!v}" in
    ''|*[!0-9]*)
      echo "⛔ could not read row counts from the manifest (${v}='${!v}')."
      echo "   Refusing rather than guessing: a count that is not a number"
      echo "   cannot establish that anything was exported."
      rm -rf "$OUT"; exit 1 ;;
  esac
done

echo "── witness copy ──"
printf '  %-16s %s\n' manuscript "$ROWS_MS" source_sections "$C_SRC" \
       draft "$C_DR" draft_sections "$C_DS" revisions "$C_REV" addressable "$ADDRESSABLE"

# ⛔ AN EMPTY EXPORT IS A FAILURE, NOT A COPY. The first version printed
# "witness copy taken" over five header-only files and exited 0. It would have
# handed the witness a runtime containing no book, leaving the §4b observer to
# discover a wrong id by finding an empty Canvas — an observation about the
# harness, mistaken for an observation about the book.
#   An instrument that cannot fail cannot be trusted when it passes.
if [ "$ROWS_MS" -lt 1 ]; then
  echo
  echo "⛔ NO SUCH WORK: manuscript_id $MID matched no row in member_manuscripts."
  echo "   Nothing was exported. This is not a copy and must not be witnessed."
  echo
  echo "   Find the right id (read-only):"
  echo "     SELECT m.id, m.title, m.created_at,"
  echo "            (SELECT count(*) FROM manuscript_draft_sections ds"
  echo "               JOIN manuscript_working_drafts d ON d.id = ds.draft_id"
  echo "              WHERE d.manuscript_id = m.id) AS addressable_sections"
  echo "       FROM member_manuscripts m ORDER BY m.created_at;"
  rm -rf "$OUT"; exit 1
fi

if [ "$C_DS" -lt 1 ] || [ "$ADDRESSABLE" != "t" ]; then
  echo
  echo "⛔ The Work exists but is not section-addressable (draft_sections=$C_DS,"
  echo "   addressable=$ADDRESSABLE). Whole Manuscript cannot mount, so §4b"
  echo "   cannot be performed on it. Nothing here converts it — that would be"
  echo "   witnessing something the member never had."
  rm -rf "$OUT"; exit 1
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
  echo "draft_sections=$C_DS"
} > "$OUT/.wm-witness-export"

echo "  ✓ $C_DS addressable sections — this is a witnessable Work"
echo
echo "⛔ This directory now holds real member text, readable only by you."
echo "   The witness runtime will TAKE CUSTODY of it and delete this original,"
echo "   so the copy dies when the witness ends. Until then it persists here:"
echo "     $OUT"
