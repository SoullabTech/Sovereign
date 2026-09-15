#!/usr/bin/env bash
# W5-LANDING-02 · GATE A — FULL PENDING-ORDER CENSUS. READ ONLY.
#
# ⭐⭐ THE QUESTION GATE A EXISTS FOR:
#
#     not "are our five pending?" — W5-LANDING-01 answered that — but
#     WHAT WOULD THE NEXT ORDINARY MIGRATION RUN ACTUALLY ATTEMPT?
#
# ⛔ THE CUSTODY LESSON, ONE LEVEL UP FROM 2026-09-07:
#
#     A narrow git diff is not a narrow database act if the migration runner
#     sees a wider pending set.
#
# The runner does not execute a conceptual lane. It executes EVERY FILE IN THE
# DIRECTORY THE LEDGER DOES NOT YET NAME, in filename order. So the deployment
# unit is not "our five files" until a full directory/ledger comparison proves
# that it is.
#
# ── WHAT IT READS, AND HOW ────────────────────────────────────────────────
#
#   LOCAL    the landing base's migration filenames, from git — and the five
#            pinned blobs, verified by hash rather than by being "copied"
#   REMOTE   the running image's /app/database/migrations listing   (ls)
#            the protected ledger                                   (SELECT)
#
# ⛔ Both remote reads are read-only: a directory listing, and a SELECT inside
# `BEGIN READ ONLY`. ⛔ Nothing is written, deployed, migrated or repaired.
#
# ── USAGE ─────────────────────────────────────────────────────────────────
#
#     bash scripts/witness/w5-landing-02-gate-a.sh [landing-base-ref]
#
# default landing base: origin/clean-main-no-secrets  (the production branch)
#
# ⚠️ ⛔ DO NOT pass `claude/w4-2-schema-design`. That branch carries later
# architecture and is NOT the landing carrier; comparing the protected ledger
# against it wholesale would describe a deploy nobody proposed.
set -u

BASE="${1:-origin/clean-main-no-secrets}"
HOST="${W5_HOST:-soullab@minisforum}"
APP="${W5_APP_CONTAINER:-maia-sovereign}"
DB="${W5_DB_CONTAINER:-maia-postgres}"
DBNAME="${W5_DBNAME:-maia_consciousness}"
DBUSER="${W5_DBUSER:-soullab}"

FIVE="20260914000001_proposal_succession.sql
20260914000002_manuscript_revision_offers.sql
20260914000003_proposal_chains_member_identity.sql
20260914000004_manuscript_revision_authorizations.sql
20260914000005_editorial_ontology.sql"

# The founder's pins. ⛔ Asserted, never assumed.
PINS="45b7578d88a1990d82fbb7e575734c0a48e69eca 20260914000001_proposal_succession.sql
df200edfb66fde4aecfe8d57ddc6d439c2ec4274 20260914000002_manuscript_revision_offers.sql
44ae7019e102677aaaf083b970eb4d893731f9e8 20260914000003_proposal_chains_member_identity.sql
beb02f67ad837dfc802dad413f0839d2e95607f0 20260914000004_manuscript_revision_authorizations.sql
7215e1bb59314e4d1302069373faf01c988abe9e 20260914000005_editorial_ontology.sql"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
CARRIER="$TMP/carrier"; IMAGE="$TMP/image"; LEDGER="$TMP/ledger"

# ⭐ THE TEST SEAM, NAMED. When all three inputs are supplied as files the
# gathering is skipped entirely and the CLASSIFIER is exercised on synthetic
# states. ⛔ In that mode it performs NO protected read — and says so — so a
# seal run can never be mistaken for a protected reading.
SYNTHETIC=0
if [ -n "${GATE_A_CARRIER:-}" ] && [ -n "${GATE_A_IMAGE:-}" ] && [ -n "${GATE_A_LEDGER:-}" ]; then
  SYNTHETIC=1
  sort -u "$GATE_A_CARRIER" > "$CARRIER"
  sort -u "$GATE_A_IMAGE"   > "$IMAGE"
  sort -u "$GATE_A_LEDGER"  > "$LEDGER"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W5-LANDING-02 · GATE A — FULL PENDING-ORDER CENSUS — READ ONLY"
echo "══════════════════════════════════════════════════════════════════"
[ "$SYNTHETIC" = 1 ] && echo " ⚠️  SYNTHETIC INPUTS — classifier exercise. NO PROTECTED READ."
echo ""

if [ "$SYNTHETIC" = 0 ]; then
  echo "── 0 · THE FIVE PINNED BLOBS ─────────────────────────────────────"
  pinfail=0
  while read -r want name; do
    [ -n "$name" ] || continue
    got="$(git hash-object "database/migrations/$name" 2>/dev/null || echo MISSING)"
    if [ "$got" = "$want" ]; then printf "   ok      %s\n" "$name"
    else printf "   ⛔ PIN  %s\n      want %s\n      got  %s\n" "$name" "$want" "$got"; pinfail=1; fi
  done <<< "$PINS"
  [ "$pinfail" = 0 ] || { echo "   ⛔ REFUSED — a pin does not match. Gate A stops."; exit 2; }

  echo ""
  echo "── 1 · THE LANDING CARRIER (local) ───────────────────────────────"
  echo "   base: $BASE"
  git rev-parse --verify --quiet "$BASE" >/dev/null || {
    echo "   ⛔ REFUSED — unknown ref: $BASE"; exit 2; }
  git ls-tree -r --name-only "$BASE" database/migrations/ \
    | grep '\.sql$' | sed 's|.*/||' > "$TMP/base"
  { cat "$TMP/base"; echo "$FIVE"; } | sort -u > "$CARRIER"
  echo "   base migrations          $(wc -l < "$TMP/base" | tr -d ' ')"
  echo "   carrier = base + five    $(wc -l < "$CARRIER" | tr -d ' ')"
  added="$(comm -13 <(sort -u "$TMP/base") <(echo "$FIVE" | sort -u) | wc -l | tr -d ' ')"
  echo "   files the five ADD       $added"
  [ "$added" = 5 ] || echo "   ⚠️  not 5 — some pinned file is ALREADY on the base"

  echo ""
  echo "── 2 · THE PROTECTED IMAGE AND LEDGER (read only) ────────────────"
  ssh "$HOST" "docker exec $APP ls -1 /app/database/migrations" 2>/dev/null \
    | grep '\.sql$' | sort -u > "$IMAGE" || true
  [ -s "$IMAGE" ] || { echo "   ⛔ REFUSED — could not list $APP:/app/database/migrations"; exit 2; }
  ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X -q -t -A" \
    <<< "BEGIN READ ONLY; SELECT filename FROM schema_migrations; COMMIT;" 2>/dev/null \
    | grep '\.sql$' | sort -u > "$LEDGER" || true
  [ -s "$LEDGER" ] || { echo "   ⛔ REFUSED — could not read schema_migrations"; exit 2; }
  echo "   image files              $(wc -l < "$IMAGE" | tr -d ' ')"
  echo "   ledger rows              $(wc -l < "$LEDGER" | tr -d ' ')"
fi

echo ""
echo "── 3 · THE CURRENT IMAGE · latent pending, independent of W5 ─────"
echo "   ⭐ What the RUNNING production image would attempt today, with no"
echo "      merge at all. This matters whether or not W5 ever lands."
CUR_PENDING="$TMP/cur_pending"
comm -23 "$IMAGE" "$LEDGER" > "$CUR_PENDING"
if [ -s "$CUR_PENDING" ]; then
  echo "   ⚠️⚠️ $(wc -l < "$CUR_PENDING" | tr -d ' ') PENDING IN THE CURRENT IMAGE:"
  nl -ba -w4 -s'  ' "$CUR_PENDING" | sed 's/^/     /'
else
  echo "   ⭐ none — the running image is fully applied."
fi

echo ""
echo "── 4 · LEDGERED BUT FILE ABSENT · drift ──────────────────────────"
GHOST="$TMP/ghost"
comm -13 "$IMAGE" "$LEDGER" > "$GHOST"
if [ -s "$GHOST" ]; then
  echo "   ⚠️⚠️ $(wc -l < "$GHOST" | tr -d ' ') ledgered with NO FILE in the image:"
  sed 's/^/     /' "$GHOST"
  echo "   ⛔ The ledger names migrations the image does not carry. A finding."
else
  echo "   ⭐ none — every ledgered migration has a file in the image."
fi

echo ""
echo "── 5 · WHAT THE NEXT DEPLOY OF THE CARRIER WOULD ATTEMPT ─────────"
echo "   ⛔ NO HIDDEN FILTERING. Every carrier file the ledger does not"
echo "      name, in the runner's filename order."
PENDING="$TMP/pending"
comm -23 "$CARRIER" "$LEDGER" > "$PENDING"
n=$(wc -l < "$PENDING" | tr -d ' ')
if [ "$n" = 0 ]; then
  echo "   (nothing — the carrier is fully applied)"
else
  i=0
  while read -r f; do
    i=$((i+1))
    if echo "$FIVE" | grep -qxF "$f"; then tag="W5 package"; else tag="⚠️ OUTSIDE W5"; fi
    printf "   %3d  %-56s %s\n" "$i" "$f" "$tag"
  done < "$PENDING"
fi

echo ""
echo "── 6 · GATE A VERDICT ────────────────────────────────────────────"
OUTSIDE="$TMP/outside"
comm -23 "$PENDING" <(echo "$FIVE" | sort -u) > "$OUTSIDE"
no=$(wc -l < "$OUTSIDE" | tr -d ' ')
missing=$(comm -13 "$PENDING" <(echo "$FIVE" | sort -u) | wc -l | tr -d ' ')

if [ -s "$GHOST" ]; then
  echo "   ⛔ GATE A FAILS — the ledger names files the image lacks (§4)."
  verdict=1
elif [ "$no" != 0 ]; then
  echo "   ⛔ GATE A FAILS — $no migration(s) pending OUTSIDE the W5 package:"
  sed 's/^/        /' "$OUTSIDE"
  echo ""
  echo "   ⛔ NOT automatically a permanent blocker. Each must be DISPOSED:"
  echo "        must precede W5 · independent but would co-deploy ·"
  echo "        superseded/retired · should already have landed · unsafe/unknown"
  echo "   ⛔ No landing package is earned until every one is classified."
  verdict=1
elif [ "$missing" != 0 ]; then
  echo "   ⛔ GATE A FAILS — $missing of the five are NOT pending against this"
  echo "      carrier. The package does not describe this deploy."
  verdict=1
else
  echo "   ⭐ GATE A PASSES — the complete pending set is EXACTLY the five,"
  echo "      in order, with nothing else and nothing missing."
  verdict=0
fi

echo ""
echo "── 7 · WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────"
echo "   protected read            ✅ this (listing + SELECT, read only)"
echo "   Gate B carrier            ⛔ only if Gate A passes, and by founder act"
echo "   migration execution       ⛔"
echo "   canonical merge           ⛔"
echo "   deployment                ⛔"
echo "   data repair               ⛔"
[ "$SYNTHETIC" = 1 ] && echo "   ⚠️  SYNTHETIC RUN — this was not a protected reading."
echo ""
exit "$verdict"
