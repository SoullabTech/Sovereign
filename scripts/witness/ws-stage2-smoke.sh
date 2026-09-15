#!/usr/bin/env bash
# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · STAGE 2 — NON-MUTATING PRODUCTION SMOKE.
#
# ⛔ READ ONLY, and deliberately NOT part of the activation wrapper. Stage 2 turns
# a capability on; this asks whether the room is sane with it on. Folding them
# together would make a green activation depend on a judgement about the product,
# and would put the first look at the room inside the act that changed it.
#
#     Stage 2 activation  →  THIS SMOKE  →  REAL-WORK-ACCEPTANCE-01
#
# ⛔⛔ IT CREATES NOTHING. No editorial relationship, no version, no adoption, no
# Ask thread. It proves that by COUNTING BEFORE AND AFTER — an assertion about
# rows, not a promise about intent.
#
# ⚠️ AND IT REFUSES TO SCORE WHAT IT CANNOT SEE. Three of the founder's five
# smoke obligations are about what the WRITER READS on screen, under her own
# session. This script has no session and will not manufacture one against
# production. Those are printed as observations for the founder to make, ⛔ not
# reported as passes. A smoke test that scores an unobserved surface is the
# absence-check failure this programme has already paid for twice.
set -uo pipefail
RELEASE_SHA="${RELEASE_SHA:-ae27205d9}"
WORK_ID="${WORK_ID:-55742458-be2c-406a-a158-d0438cf02892}"
H=soullab@minisforum
pass=0; fail=0
ok()  { pass=$((pass+1)); printf '  PASS  %s\n' "$1"; }
bad() { fail=$((fail+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
eq()  { [ "$2" = "$3" ] && ok "$1" || bad "$1" "want [$3] got [$2]"; }
q()   { ssh $H "docker exec maia-postgres psql -qtAX -U soullab maia_consciousness -c \"$1\"" 2>/dev/null | tr -d '[:space:]'; }

echo "════ STAGE 2 SMOKE · non-mutating ════"
echo
echo "── the artifact and the flag ──"
eq "container is the pinned release" "$(ssh $H 'docker exec maia-sovereign printenv GIT_COMMIT' 2>/dev/null | tr -d '\r')" "$RELEASE_SHA"
eq "editorial is ON"                 "$(ssh $H 'docker exec maia-sovereign printenv WRITERS_STUDIO_EDITORIAL_ENABLED' 2>/dev/null | tr -d '\r')" "1"

echo
echo "── ⛔ nothing exists that should not ──"
B_CHAINS=$(q "SELECT count(*) FROM proposal_chains;")
B_THREADS=$(q "SELECT count(*) FROM ask_threads;")
B_VERSIONS=$(q "SELECT count(*) FROM proposal_versions;")
B_AUTH=$(q "SELECT count(*) FROM manuscript_revision_authorizations;")
printf '  baseline   chains=%s threads=%s versions=%s authorizations=%s\n' \
  "$B_CHAINS" "$B_THREADS" "$B_VERSIONS" "$B_AUTH"
eq "no editorial relationship exists yet" "$B_CHAINS" "0"
eq "no authored version exists yet"       "$B_VERSIONS" "0"
eq "no adoption authorization exists yet" "$B_AUTH" "0"

echo
echo "── the doors answer, and refuse ──"
# ⭐ REACHABLE **AND** AUTHENTICATED, WITHOUT EXECUTING. An unauthenticated POST
# to the adoption route must be refused by AUTH — never by the route being absent.
# ⛔ 404 would be indistinguishable from "not deployed", so it is a FAIL here.
ADOPT=$(ssh $H "curl -s -o /dev/null -w '%{http_code}' -X POST https://soullab.life/api/writers-studio/editorial/adoption -H 'content-type: application/json' -d '{}'" 2>/dev/null)
case "$ADOPT" in
  401|403) ok "adoption route reachable and refuses the unauthenticated (HTTP $ADOPT)" ;;
  404)     bad "adoption route" "HTTP 404 — reachable and absent are not the same answer" ;;
  *)       bad "adoption route" "HTTP $ADOPT — expected an auth refusal" ;;
esac
REL=$(ssh $H "curl -s -o /dev/null -w '%{http_code}' 'https://soullab.life/api/writers-studio/editorial/relationships?sectionId=x'" 2>/dev/null)
case "$REL" in
  401|403) ok "relationships route reachable and refuses the unauthenticated (HTTP $REL)" ;;
  *)       bad "relationships route" "HTTP $REL — expected an auth refusal" ;;
esac
STUDIO=$(ssh $H "curl -s -o /dev/null -w '%{http_code}' https://soullab.life/writers-studio/canvas" 2>/dev/null)
[ "$STUDIO" = 200 ] || [ "$STUDIO" = 307 ] || [ "$STUDIO" = 302 ] \
  && ok "Writer's Studio responds (HTTP $STUDIO)" || bad "Writer's Studio" "HTTP $STUDIO"

echo
echo "── ⛔ and the doors created nothing by being knocked on ──"
eq "chains unchanged"         "$(q 'SELECT count(*) FROM proposal_chains;')"  "$B_CHAINS"
eq "ask_threads unchanged"    "$(q 'SELECT count(*) FROM ask_threads;')"      "$B_THREADS"
eq "versions unchanged"       "$(q 'SELECT count(*) FROM proposal_versions;')" "$B_VERSIONS"
eq "authorizations unchanged" "$(q 'SELECT count(*) FROM manuscript_revision_authorizations;')" "$B_AUTH"

echo
echo "── the subject is still there ──"
eq "the Work"            "$(q "SELECT count(*) FROM member_manuscripts WHERE id='$WORK_ID';")" "1"
eq "Chapter 10 scope"    "$(q "SELECT count(*) FROM manuscript_sections s JOIN manuscript_draft_sections ds ON ds.source_section_id=s.id WHERE s.manuscript_id='$WORK_ID' AND s.position BETWEEN 198 AND 221;")" "24"

echo
echo "══ ⚠️ OBSERVATIONS THE FOUNDER MUST MAKE — ⛔ NOT SCORED HERE ══"
cat <<'OBS'
  Open the room under your own session and read, rather than trust:

    1. Writer's Studio loads, and Chapter 10 is where you left it.
    2. MAIA's ordinary conversation is present — the composer, and any
       conversation you already had about this Work.
    3. "Work on an exact passage →" is now VISIBLE. It was not, before.
    4. Nothing opened by itself: you arrived, and no relationship was created.
       (The row counts above prove this for the requests THIS script made;
        only you can prove it for the room you actually opened.)

  ⛔ Do not click into an editorial relationship yet. That is Chapter 10's act.
OBS
echo
printf '  %d passed · %d failed\n\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
