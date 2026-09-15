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
#            pinned blobs, read OUT OF A NAMED GIT REF and verified by hash
#            rather than by being "copied"
#   REMOTE   the running image's /app/database/migrations listing   (ls)
#            the protected ledger                                   (SELECT)
#
# ⛔ Both remote reads are read-only: a directory listing, and a SELECT inside
# `BEGIN READ ONLY`. ⛔ Nothing is written, deployed, migrated or repaired.
#
# ── ⭐ §0 READS A REF, NOT THE WORKING TREE (repaired 2026-09-15) ──────────
#
# The first protected run of this gate REFUSED at §0 reporting all five pins
# `MISSING`. The pins were sound; the instrument was not. It hashed
# `database/migrations/<name>` RELATIVE TO THE CALLER'S CWD out of the WORKING
# TREE, and it was invoked from a driver worktree that carries no such path.
# Two defects, and the second is the worse one:
#
#   1. it depended on where it was run from, and on what happened to be
#      checked out — a dirty edit would have moved a pin;
#   2. ⛔ it reported "the file is not here" and "the bytes differ" AS THE SAME
#      FINDING. A location problem and a content problem are not the same
#      finding and must never be reported as one.
#
# ⭐ Repaired: `git rev-parse <ref>:database/migrations/<name>` — root-relative
# by git's own path grammar, so cwd cannot move it, and it is a custody
# statement about a COMMIT rather than about somebody's checkout. ABSENT,
# MISMATCH and UNKNOWN REF are now three distinct refusals.
#
# ── USAGE ─────────────────────────────────────────────────────────────────
#
#     bash scripts/witness/w5-landing-02-gate-a.sh [landing-base-ref] [source-ref]
#
# default landing base: origin/clean-main-no-secrets  (the production branch)
# default source ref  : HEAD  (the commit you are standing on)
#
# ⚠️ If the five are not on HEAD, NAME the ref that carries them. The gate will
# not go looking on its own — but on an ABSENT refusal it does REPORT which
# local refs carry all five, as candidates for you to choose between. Reporting
# is not selecting.
#
# ⚠️ ⛔ DO NOT pass `claude/w4-2-schema-design`. That branch carries later
# architecture and is NOT the landing carrier; comparing the protected ledger
# against it wholesale would describe a deploy nobody proposed.
set -u

BASE="${1:-origin/clean-main-no-secrets}"
SOURCE="${2:-HEAD}"
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
MANIFEST="$TMP/manifest"; : > "$MANIFEST"
if [ -n "${GATE_A_CARRIER:-}" ] && [ -n "${GATE_A_IMAGE:-}" ] && [ -n "${GATE_A_LEDGER:-}" ]; then
  SYNTHETIC=1
  sort -u "$GATE_A_CARRIER" > "$CARRIER"
  sort -u "$GATE_A_IMAGE"   > "$IMAGE"
  sort -u "$GATE_A_LEDGER"  > "$LEDGER"
  # ⛔ The manifest is a FOURTH input, deliberately separate. A seal that omits
  # it exercises the UNCLASSIFIED path — which is a real state, not an error.
  [ -n "${GATE_A_MANIFEST:-}" ] && sort -u "$GATE_A_MANIFEST" > "$MANIFEST"
fi

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " W5-LANDING-02 · GATE A — FULL PENDING-ORDER CENSUS — READ ONLY"
echo "══════════════════════════════════════════════════════════════════"
[ "$SYNTHETIC" = 1 ] && echo " ⚠️  SYNTHETIC INPUTS — classifier exercise. NO PROTECTED READ."
echo ""

if [ "$SYNTHETIC" = 0 ]; then
  # ⭐ cwd independence, established before anything is judged.
  TOP="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  [ -n "$TOP" ] || {
    echo "⛔ REFUSED — not inside a git repository. Gate A reads its pins from a"
    echo "   git ref; it cannot be run from /tmp or an unrelated directory."
    echo "   ⭐ This is a LOCATION refusal. NO PIN WAS JUDGED."
    exit 2; }
  cd "$TOP" || exit 2

  echo "── 0 · THE FIVE PINNED BLOBS · read from a git ref ────────────────"
  echo "   repository   $TOP"
  echo "   source ref   $SOURCE"
  git rev-parse --verify --quiet "$SOURCE^{commit}" >/dev/null || {
    echo "   ⛔ REFUSED — unknown ref: $SOURCE"
    echo "   ⭐ A LOCATION refusal. NO PIN WAS JUDGED — this says nothing"
    echo "      whatever about whether the five blobs are correct."
    exit 2; }
  echo "   resolved     $(git rev-parse --short "$SOURCE^{commit}")"
  echo ""

  # ⛔ THREE OUTCOMES, COUNTED SEPARATELY. Collapsing them is the defect this
  #    section was repaired for.
  absent=0; mismatch=0; verified=0
  while read -r want name; do
    [ -n "$name" ] || continue
    # `<rev>:<path>` is root-relative by git's path grammar — cwd cannot move it.
    if ! git cat-file -e "$SOURCE:database/migrations/$name" 2>/dev/null; then
      printf "   ⛔ ABSENT    %s\n" "$name"
      printf "      no such path at %s\n" "$SOURCE:database/migrations/$name"
      absent=$((absent+1)); continue
    fi
    got="$(git rev-parse "$SOURCE:database/migrations/$name")"
    if [ "$got" = "$want" ]; then
      printf "   ok          %s\n" "$name"; verified=$((verified+1))
    else
      printf "   ⛔ MISMATCH  %s\n      want %s\n      got  %s\n" "$name" "$want" "$got"
      mismatch=$((mismatch+1))
    fi
  done <<< "$PINS"
  echo ""
  echo "   verified $verified · absent $absent · mismatched $mismatch"

  # MISMATCH is reported first: it is the graver finding, and an ABSENT count
  # alongside it must not soften it into "we were probably in the wrong place".
  if [ "$mismatch" != 0 ]; then
    echo "   ⛔ REFUSED — $mismatch pinned blob(s) DIFFER at $SOURCE."
    echo "   ⭐⭐ A CONTENT finding: this ref carries a different migration than"
    echo "      the one the founder pinned. ⛔ Do not re-pin to make it pass —"
    echo "      the pin is the authority and the ref is the claim."
    exit 2
  fi
  if [ "$absent" != 0 ]; then
    echo "   ⛔ REFUSED — $absent pinned file(s) are NOT PRESENT at $SOURCE."
    echo "   ⭐ A LOCATION finding, NOT a pin mismatch."
    echo "      $absent blob(s) were never compared, so nothing whatever is"
    echo "      known about their content."
    echo ""
    echo "   Refs that carry ALL FIVE pinned blobs, byte-identical:"
    # ⚠️ A repo here carries ~1,500 refs. Five `rev-parse` calls each is 7,500
    # processes; one `cat-file --batch-check` over the FIRST pin narrows it to a
    # handful, and only those are then verified against all five. The narrowing
    # is a performance step ONLY — a ref survives it and is still checked in
    # full; nothing is reported on the strength of one blob.
    fw="$(echo "$PINS" | head -1 | cut -d' ' -f1)"
    fn="$(echo "$PINS" | head -1 | cut -d' ' -f2)"
    git for-each-ref --format='%(refname)' refs/heads refs/remotes > "$TMP/refs"
    sed "s|\$|:database/migrations/$fn|" "$TMP/refs" \
      | git cat-file --batch-check 2>/dev/null \
      | paste -d' ' - "$TMP/refs" \
      | awk -v want="$fw" '$1==want {print $NF}' > "$TMP/cand"
    found=0
    while read -r r; do
      [ -n "$r" ] || continue
      all=1
      while read -r w n; do
        [ -n "$n" ] || continue
        g="$(git rev-parse --verify --quiet "$r:database/migrations/$n" || echo -)"
        [ "$g" = "$w" ] || { all=0; break; }
      done <<< "$PINS"
      [ "$all" = 1 ] && { echo "     $r"; found=$((found+1)); }
    done < "$TMP/cand"
    [ "$found" = 0 ] && echo "     (none — no local or remote-tracking ref carries the five)"
    echo ""
    echo "   ⛔ The gate does not choose for you. Name one:"
    echo "     bash scripts/witness/w5-landing-02-gate-a.sh $BASE <source-ref>"
    exit 2
  fi

  # ⭐ A DECLARED SEAM: verify the pins and stop. §1 onward needs the protected
  # host, and the seal must be able to falsify §0 without going near it.
  if [ -n "${GATE_A_PINS_ONLY:-}" ]; then
    echo ""
    echo "   ⚠️  PINS-ONLY — §0 only. NO CARRIER READ, NO PROTECTED READ,"
    echo "      NO VERDICT. This is not a Gate A result."
    exit 0
  fi

  echo ""
  echo "── 1 · THE LANDING CARRIER (local) ───────────────────────────────"
  echo "   base: $BASE"
  git rev-parse --verify --quiet "$BASE" >/dev/null || {
    echo "   ⛔ REFUSED — unknown ref: $BASE"; exit 2; }
  git ls-tree -r --full-tree --name-only "$BASE" database/migrations/ \
    | grep '\.sql$' | sed 's|.*/||' > "$TMP/base"
  { cat "$TMP/base"; echo "$FIVE"; } | sort -u > "$CARRIER"
  echo "   base migrations          $(wc -l < "$TMP/base" | tr -d ' ')"
  echo "   carrier = base + five    $(wc -l < "$CARRIER" | tr -d ' ')"
  added="$(comm -13 <(sort -u "$TMP/base") <(echo "$FIVE" | sort -u) | wc -l | tr -d ' ')"
  echo "   files the five ADD       $added"
  [ "$added" = 5 ] || echo "   ⚠️  not 5 — some pinned file is ALREADY on the base"

  echo ""
  echo "── 1b · THE BASELINE MANIFEST(S) ON THE CARRIER ──────────────────"
  echo "   ⭐ THE LAW THIS SECTION EXISTS FOR (founder, 2026-09-15):"
  echo "      a migration may stay in schema_migrations after its source file"
  echo "      leaves the active tree. capture-baseline.sh preserves that as a"
  echo "      LEDGER FACT on purpose. ⛔ It is NOT drift."
  MANS="$(git ls-tree -r --full-tree --name-only "$BASE" database/baseline/ 2>/dev/null \
          | grep '\.manifest$' || true)"
  if [ -n "$MANS" ]; then
    while read -r m; do
      [ -n "$m" ] || continue
      git cat-file blob "$BASE:$m"
    done <<< "$MANS" | grep -v '^[[:space:]]*#' | grep '\.sql$' | sort -u > "$MANIFEST"
    echo "$MANS" | sed 's|^|   manifest   |'
    echo "   subsumed ledger entries  $(wc -l < "$MANIFEST" | tr -d ' ')"
  else
    echo "   ⛔ NO baseline manifest on $BASE."
    echo "   ⛔ Ledger-only names therefore CANNOT be classified. They will be"
    echo "      reported UNCLASSIFIED — never silently lawful, never drift."
  fi

  echo ""
  echo "── 2 · THE PROTECTED IMAGE AND LEDGER (read only) ────────────────"
  echo "   ⭐ IDENTITY FIRST. No reading is accepted from a database that has"
  echo "      not said who it is."
  IDENT="$(ssh "$HOST" "docker exec -i $DB psql -U $DBUSER -d $DBNAME -X -q -t -A -F'|'" \
    <<< "BEGIN READ ONLY; SELECT current_database(), current_user, current_setting('transaction_read_only'), current_setting('server_version'), pg_is_in_recovery(); COMMIT;" 2>/dev/null \
    | grep '|' | head -1)"
  [ -n "$IDENT" ] || { echo "   ⛔ REFUSED — the database did not identify itself."; exit 2; }
  I_DB="$(echo "$IDENT" | cut -d'|' -f1)"; I_USER="$(echo "$IDENT" | cut -d'|' -f2)"
  I_RO="$(echo "$IDENT" | cut -d'|' -f3)"; I_VER="$(echo "$IDENT" | cut -d'|' -f4)"
  I_REC="$(echo "$IDENT" | cut -d'|' -f5)"
  printf "   %-12s %s\n" "db" "$I_DB" "role" "$I_USER" "read_only" "$I_RO" \
                          "server" "$I_VER" "in_recovery" "$I_REC"
  [ "$I_DB" = "$DBNAME" ] || {
    echo "   ⛔ REFUSED — asked for '$DBNAME', answered '$I_DB'. Wrong database."; exit 2; }
  [ "$I_RO" = "on" ] || {
    echo "   ⛔ REFUSED — the read membrane is not on (transaction_read_only=$I_RO)."; exit 2; }

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
echo "── 4 · LEDGERED BUT NO FILE · THREE CLASSES, NEVER ONE ───────────"
echo "   ⛔ THE DEFECT THIS SECTION WAS REPAIRED FOR (founder, 2026-09-15):"
echo "      it called every ledger-only name DRIFT. That is not this"
echo "      repository's rule. capture-baseline.sh deliberately preserves a"
echo "      ledger row after its source file leaves the tree."
echo ""
echo "      BASELINE-SUBSUMED      in a baseline manifest   → lawful history"
echo "      APPLIED-OUTSIDE-CARRIER post-baseline, no file  → ⚠️ a FINDING"
echo "      UNCLASSIFIED            no manifest to judge by → ⛔ not measurable"
GHOST="$TMP/ghost"; SUBSUMED="$TMP/subsumed"; OUTSIDE_CARRIER="$TMP/outside_carrier"
comm -13 "$IMAGE" "$LEDGER" > "$GHOST"
: > "$SUBSUMED"; : > "$OUTSIDE_CARRIER"
UNCLASSIFIED=0
if [ ! -s "$GHOST" ]; then
  echo ""
  echo "   ⭐ none — every ledgered migration has a file in the image."
elif [ ! -s "$MANIFEST" ]; then
  UNCLASSIFIED=$(wc -l < "$GHOST" | tr -d ' ')
  echo ""
  echo "   ⛔ $UNCLASSIFIED ledger-only name(s), and NO manifest to classify them."
  echo "   ⛔ NOT MEASURABLE. ⛔ Not translated into lawful, not into drift."
  sed 's/^/     /' "$GHOST"
else
  comm -12 "$GHOST" "$MANIFEST" > "$SUBSUMED"
  comm -23 "$GHOST" "$MANIFEST" > "$OUTSIDE_CARRIER"
  echo ""
  echo "   BASELINE-SUBSUMED        $(wc -l < "$SUBSUMED" | tr -d ' ')  ⭐ lawful — the baseline records them"
  echo "   APPLIED-OUTSIDE-CARRIER  $(wc -l < "$OUTSIDE_CARRIER" | tr -d ' ')"
  if [ -s "$OUTSIDE_CARRIER" ]; then
    echo ""
    echo "   ⚠️⚠️ APPLIED OUTSIDE THE CARRIER — ledgered in production, no file"
    echo "      in the image, and NOT subsumed by any baseline:"
    while read -r g; do
      [ -n "$g" ] || continue
      if grep -qxF "$g" "$CARRIER"; then oncar="on carrier"; else oncar="NOT on carrier"; fi
      printf "     %-58s %s\n" "$g" "$oncar"
    done < "$OUTSIDE_CARRIER"
    echo ""
    echo "   ⛔ A SEPARATE CUSTODY FINDING, owed its own reconciliation record."
    echo "   ⛔ It is NOT a migration the next deploy would attempt — it is"
    echo "      already applied — and must never be reported as one."
  fi
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

if [ "$UNCLASSIFIED" != 0 ]; then
  echo "   ⛔ GATE A FAILS — $UNCLASSIFIED ledger-only name(s) could not be"
  echo "      classified: the carrier carries no baseline manifest (§4)."
  verdict=1
elif [ -s "$CUR_PENDING" ]; then
  echo "   ⛔ GATE A FAILS — the RUNNING image already has $(wc -l < "$CUR_PENDING" | tr -d ' ') pending"
  echo "      migration(s) before any merge (§3). ⛔ Each needs disposition"
  echo "      before a carrier can be proposed: a deploy would attempt them"
  echo "      whether or not W5 lands."
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

# ⭐⭐ THE EXIT CODE ANSWERS THE ORDER QUESTION. It is tri-valued precisely so
# that a PASS can never be read as "and nothing else was found": a standing
# custody finding raises 0 to 3 rather than being folded into the verdict or
# quietly dropped.
#   0  order PASS, no standing finding
#   3  order PASS, and a custody finding stands
#   1  order FAIL
#   2  refused before measuring
if [ -s "$OUTSIDE_CARRIER" ]; then
  echo ""
  echo "   ⚠️  AND $(wc -l < "$OUTSIDE_CARRIER" | tr -d ' ') CUSTODY FINDING(S) STAND (§4, applied outside the"
  echo "      carrier). ⛔ The order verdict above does not dispose of them."
  [ "$verdict" = 0 ] && verdict=3
fi

echo ""
echo "── 7 · WHAT THIS RUN DOES NOT AUTHORIZE ──────────────────────────"
echo "   protected read            ✅ this (listing + SELECT, read only)"
echo "   Gate B carrier            ⛔ only if Gate A passes, and by founder act"
echo "   migration execution       ⛔"
echo "   canonical merge           ⛔"
echo "   deployment                ⛔"
echo "   data repair               ⛔"
if [ -s "$OUTSIDE_CARRIER" ]; then
  echo "   §4 custody reconciliation ⛔ OWED — reported here, disposed nowhere"
fi
[ "$SYNTHETIC" = 1 ] && echo "   ⚠️  SYNTHETIC RUN — this was not a protected reading."
echo ""
exit "$verdict"
