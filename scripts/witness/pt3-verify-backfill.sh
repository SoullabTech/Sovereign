#!/bin/sh
# PT-3 §XI (B32) — deterministic backfill assertions. RUN WHILE SOURCE WRITES ARE QUIESCED.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §XI.
#
# ⭐ WHY TIMING IS THE POINT. These counts are deterministic ONLY because no member can write. Run
# after release, a single lawful member act would make the platform healthier and this witness call
# it a defect. B27 correctly turned commentary into assertions; B32 puts those assertions where they
# are true. Everything that can lawfully change once writes reopen is tested by the post-cutover
# witness as an INVARIANT instead.
#
# Read-only. Values are the accepted production census: 13 Works, 11 with sections, 6 with an
# arrival, 5 without, 2 blank, 2 unclaimed, zero multi-arrival.

set -u
DB="${PT3_DB:-maia_consciousness}"
fail=0
q() { docker exec maia-postgres psql -U soullab -d "$DB" -tAc "$1" 2>/dev/null || echo '?'; }
expect() {
  if [ "$2" = "$3" ]; then printf 'OK    %-52s %s\n' "$1" "$2"
  else printf 'FAIL  %-52s got %s, census predicts %s\n' "$1" "$2" "$3"; fail=$((fail+1)); fi
}

# ⭐ THE TIMING CLAIM IS ITSELF CHECKED. Everything above is a comment, and a comment is not a
# falsifier — the same defect this lane has corrected three times. So the precondition is verified:
# quiescence must be RECORDED and the application must actually be stopped. Run at any other moment
# these counts prove nothing, and an OK line would misrepresent when it was true.
RECORD="${PT3_QUIESCE_STATE:-$HOME/.pt3-cutover/quiesced-services}"
if [ ! -s "$RECORD" ]; then
  echo "REFUSED — no quiescence record at $RECORD (set PT3_QUIESCE_STATE to override)."
  echo "These counts are deterministic only while Source writes are stopped. Nothing is asserted."
  exit 2
fi
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx maia-sovereign; then
  echo "REFUSED — maia-sovereign is running. The runtime is not quiesced."
  echo "Asserting a frozen count against a live platform would be true only by luck."
  exit 2
fi
echo "── quiescence confirmed ($(wc -l < "$RECORD" | tr -d ' ') service(s) recorded stopped) ──"
echo "── deterministic backfill, asserted under quiescence ──"
expect "representations created"                "$(q "SELECT count(*) FROM manuscript_source_representations")" "11"
expect "  of which custodied"                   "$(q "SELECT count(*) FROM manuscript_source_representations WHERE custody='source_custodied'")" "6"
expect "  of which legacy_interpreted_import"   "$(q "SELECT count(*) FROM manuscript_source_representations WHERE custody='legacy_interpreted_import'")" "5"
expect "lifecycle acts recorded"                "$(q "SELECT count(*) FROM source_lifecycle_acts")" "17"
expect "  all attributed to the migration"      "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='migration_legacy'")" "17"
expect "  none carrying a member actor"         "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='migration_legacy' AND actor_member_id IS NOT NULL")" "0"
expect "multi-arrival reconciliation rows"      "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE kind='multiple_legacy_arrivals'")" "0"
expect "representation_without_arrival rows"    "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE kind='representation_without_arrival'")" "5"
expect "sections carrying a representation"     "$(q "SELECT count(*) FROM manuscript_sections WHERE representation_id IS NULL")" "0"
expect "Works with sections but no operative"   "$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id m FROM manuscript_sections) t WHERE source_operative_representation(t.m) IS NULL")" "0"
expect "unclaimed arrivals, still unclaimed"    "$(q "SELECT count(*) FROM manuscript_source_arrivals WHERE manuscript_id IS NULL")" "2"

echo
[ "$fail" -eq 0 ] && { echo "BACKFILL ACCEPTED — every deterministic fact matches the census."; exit 0; }
echo "BACKFILL REJECTED — $fail deviation(s). §X: a data shape inconsistent with the census."
echo "Stay quiesced. Do not release. Do not restart the old runtime against the migrated schema."
exit 1
