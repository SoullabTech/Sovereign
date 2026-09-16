#!/usr/bin/env bash
# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · STAGE 2 — EDITORIAL ACTIVATION CUSTODY.
#
# ⭐⭐ THE WHOLE ACT, AS ONE SENTENCE, MADE EXECUTABLE:
#
#     Turn WRITERS_STUDIO_EDITORIAL_ENABLED from OFF to ON without changing the
#     running application artifact.
#
# ⛔ THIS RUNS ON MINISFORUM, NOT THE MAC STUDIO — the deploy-lane lock lives on
# the production host, and a wrapper that took no lock would be the very gap
# Stage 2 exists to close. Invoke it WITHOUT touching the shared checkout:
#
#     ssh soullab@minisforum 'bash -s' < scripts/witness/ws-stage2-activation.sh
#
# ⭐ Piping over stdin runs the PINNED script from the Mac worktree while the
# lock, docker and .env.production stay where they belong. ⛔ Never `git checkout`
# a branch in the shared production checkout to run this.
#
# ── ⛔ WHAT STAGE 1 EXPOSED, AND WHY THIS FILE EXISTS ─────────────────────────
#
# The bare `docker compose ... up -d --no-deps maia` is NOT the custody model.
# It happened safely on 2026-09-15 and again on 2026-09-07, and both times it
# took NO LANE LOCK and made NO INDEPENDENT PROVENANCE ASSERTION. Safe twice is
# not a guarantee; it is two absences of collision.
#
# ── ⭐ THE DISTINCTION THIS WRAPPER TURNS ON ─────────────────────────────────
#
#     the CONTAINER ID **WILL** CHANGE — recreation is how an env change lands
#     the IMAGE ID **MUST NOT** — that is what "same application artifact" means
#
# Conflating those two would either forbid the act entirely or let a rebuild pass
# as an activation. The container is replaced; the artifact it runs is not.
#
# ⛔ NO BUILD, STRUCTURALLY: the act passes `--no-build`, so a compose file that
# wanted to rebuild fails rather than quietly producing a new image.
#
# ── ⛔ IT REFUSES; IT DOES NOT FIX ───────────────────────────────────────────
#
# Every PRE-condition failure exits having changed NOTHING. A POST-condition
# failure leaves the flag applied and STOPS LOUDLY with the exact reversal
# command printed — ⛔ it does not run it. Auto-reverting would be this wrapper
# deciding, on its own, what a half-applied production state should become.
set -uo pipefail

RELEASE_SHA="${RELEASE_SHA:-ae27205d9}"
PROJECT_DIR="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
COMPOSE="$PROJECT_DIR/docker-compose.production.yml"
ENVFILE="$PROJECT_DIR/.env.production"
FLAG=WRITERS_STUDIO_EDITORIAL_ENABLED
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

say()  { printf '  %-26s %s\n' "$1" "$2"; }
die()  { echo; echo "⛔⛔ STOP — $1"; echo "   Nothing was changed by this run."; exit 1; }
post() { echo; echo "⛔⛔ ACTIVATION FAILED — $1"; echo
         echo "   ⚠️ THE FLAG IS APPLIED AND THE STATE IS NOT VERIFIED."
         echo "   ⛔ This wrapper refuses to decide what that should become. To reverse:"
         echo "       cp '$ENVFILE.pre-stage2.$STAMP' '$ENVFILE'"
         echo "       cd '$PROJECT_DIR' && docker compose -f '$COMPOSE' up -d --no-deps --no-build maia"
         exit 1; }

echo "══════════════════════════════════════════════════════════════"
echo " STAGE 2 · EDITORIAL ACTIVATION CUSTODY   release $RELEASE_SHA"
echo "══════════════════════════════════════════════════════════════"
echo
# ⚠️⚠️ THIS GUARD WAS WRONG, AND IT PRODUCED A FALSE STOP ON 2026-09-15.
# It read `[ "$(hostname)" = minisforum ]` — but `minisforum` is the SSH HOST
# ALIAS, and the machine's own hostname is `soullab`. The wrapper refused a
# lawful run and reported the production host as the wrong machine.
#
# ⭐ The guard behaved correctly in the one way that mattered — it refused rather
# than proceeded, and changed nothing — but ⛔ a guard that stops the right act
# for a false reason is still a defect, and one more false stop teaches people to
# pass a flag to skip it.
#
# ⛔ `MAIA_HOST_ID` is NOT the fix either, tempting as it looks: it is a literal
# in docker-compose.production.yml, so a Mac Studio running the same compose
# would also answer `minisforum`. It is REPORTED below as a fact, never gated on.
#
# ⭐ THE HOST IS IDENTIFIED BY WHAT IT CARRIES, NOT BY WHAT IT IS CALLED: the
# production stack must actually be here. The decisive protections remain P1's —
# GIT_COMMIT must equal the pinned release and the image must be :current — which
# no other stack can satisfy by accident.
[ -f "$COMPOSE" ]  || die "compose file not found: $COMPOSE — this is not the production host"
[ -f "$ENVFILE" ]  || die "env file not found: $ENVFILE — this is not the production host"
docker inspect maia-sovereign >/dev/null 2>&1 || die "no maia-sovereign container here"
docker inspect maia-postgres  >/dev/null 2>&1 || die "no maia-postgres container here"
say "hostname"     "$(hostname)   (reported, not gated — see the note above)"
say "MAIA_HOST_ID" "$(docker exec maia-sovereign printenv MAIA_HOST_ID 2>/dev/null | tr -d '\r')   (reported, not gated)"

# ═══ PHASE 1 · PIN THE BEFORE STATE ══════════════════════════════════════════
echo "── PHASE 1 · PIN ─────────────────────────────────────────────"
B_IMAGE=$(docker inspect maia-sovereign --format '{{.Image}}' 2>/dev/null)
B_CID=$(docker inspect maia-sovereign --format '{{.Id}}' 2>/dev/null)
B_SHA=$(docker exec maia-sovereign printenv GIT_COMMIT 2>/dev/null | tr -d '\r')
B_LANE=$(docker exec maia-sovereign printenv DEPLOY_LANE 2>/dev/null | tr -d '\r')
B_FLAG=$(docker exec maia-sovereign printenv $FLAG 2>/dev/null | tr -d '\r')
B_CURRENT=$(docker image inspect maia-sovereign:current --format '{{.Id}}' 2>/dev/null)
B_HEALTH=$(docker inspect maia-sovereign --format '{{.State.Health.Status}}' 2>/dev/null)

say "container GIT_COMMIT" "$B_SHA"
say "container image"      "${B_IMAGE:0:19}…"
say "image :current"       "${B_CURRENT:0:19}…"
say "DEPLOY_LANE"          "$B_LANE"
say "health"               "$B_HEALTH"
say "flag"                 "${B_FLAG:-(absent)}"

[ "$B_SHA" = "$RELEASE_SHA" ]   || die "production is $B_SHA, not the pinned release $RELEASE_SHA"
[ "$B_IMAGE" = "$B_CURRENT" ]   || die "the running container's image is not :current — provenance is ambiguous"
[ "$B_HEALTH" = healthy ]       || die "service is '$B_HEALTH', not healthy, before activation"
[ "$B_FLAG" != "1" ]            || die "the flag is ALREADY ON — this is not the state Stage 2 was ruled for"

MIGS=$(docker exec maia-postgres psql -qtAX -U soullab maia_consciousness -c "
  SELECT count(*) FROM schema_migrations WHERE filename IN (
   '20260914000001_proposal_succession.sql','20260914000002_manuscript_revision_offers.sql',
   '20260914000003_proposal_chains_member_identity.sql',
   '20260914000004_manuscript_revision_authorizations.sql',
   '20260914000005_editorial_ontology.sql',
   '20260915000001_ask_threads_subject_preparation.sql',
   '20260915000002_editorial_turn_bindings.sql');" 2>/dev/null | tr -d '[:space:]')
say "migrations" "$MIGS"
[ "$MIGS" = "7" ] || die "migration state is $MIGS, not 7"

# ⭐ THE WHOLE STACK, so "only MAIA changed" is PROVED rather than assumed.
# Stage 1's full deploy recreated TEN containers; this act must recreate one.
BEFORE_STACK=$(docker ps -a --format '{{.Names}} {{.ID}} {{.CreatedAt}}' | grep -v '^maia-sovereign ' | sort)
say "other containers pinned" "$(echo "$BEFORE_STACK" | wc -l | tr -d ' ')"

# ═══ PHASE 2 · TAKE THE LANE LOCK ════════════════════════════════════════════
echo
echo "── PHASE 2 · LANE LOCK ───────────────────────────────────────"
export PROJECT_DIR
# shellcheck disable=SC1090
source "$PROJECT_DIR/scripts/deploy-lock.sh" || die "could not source the deploy lane lock"
acquire_deploy_lock "ws-stage2-activation" "$RELEASE_SHA" \
  || die "the deploy lane is held by someone else (see the holder record above)"

# ═══ PHASE 3 · PROVE COMPOSE WOULD SELECT THE SAME IMAGE ═════════════════════
echo
echo "── PHASE 3 · WOULD COMPOSE CHANGE THE ARTIFACT? ──────────────"
# ⭐ Asked BEFORE the act, so a compose file that would pull, rebuild or select a
# different tag is refused while the running container is still untouched.
WANT=$(cd "$PROJECT_DIR" && docker compose -f "$COMPOSE" config --images 2>/dev/null \
        | grep -m1 '^maia-sovereign' || true)
say "compose selects" "${WANT:-(unresolved)}"
[ -n "$WANT" ] || die "could not resolve the image compose would select for maia"
WANT_ID=$(docker image inspect "$WANT" --format '{{.Id}}' 2>/dev/null)
[ "$WANT_ID" = "$B_IMAGE" ] \
  || die "compose would select a DIFFERENT image (${WANT_ID:0:19}…) than the one running"
say "→ same artifact" "yes"

# ═══ PHASE 4 · THE ACT, AND ONLY THE ACT ═════════════════════════════════════
echo
echo "── PHASE 4 · ACTIVATE ────────────────────────────────────────"
cp -p "$ENVFILE" "$ENVFILE.pre-stage2.$STAMP" || die "could not back up $ENVFILE"
say "backup" "$ENVFILE.pre-stage2.$STAMP"
if grep -q "^$FLAG=" "$ENVFILE"; then
  sed -i "s/^$FLAG=.*/$FLAG=1/" "$ENVFILE"
else
  printf '\n# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 Stage 2 · %s\n%s=1\n' "$STAMP" "$FLAG" >> "$ENVFILE"
fi
grep -q "^$FLAG=1$" "$ENVFILE" || post "the flag did not land in $ENVFILE"
say "env file" "$FLAG=1"

# ⛔ --no-deps: this act touches maia and nothing beneath it.
# ⛔ --no-build: a build here would be a NEW ARTIFACT, which is the one thing
#    Stage 2 may not produce. The flag makes that structural, not careful.
( cd "$PROJECT_DIR" && docker compose -f "$COMPOSE" up -d --no-deps --no-build maia ) \
  || post "compose refused the recreation (a requested build is a STOP, not a retry)"

echo "   waiting for health…"
for _ in $(seq 1 60); do
  [ "$(docker inspect maia-sovereign --format '{{.State.Health.Status}}' 2>/dev/null)" = healthy ] && break
  sleep 2
done

# ═══ PHASE 5 · PROVE THE ARTIFACT DID NOT CHANGE ═════════════════════════════
echo
echo "── PHASE 5 · VERIFY ──────────────────────────────────────────"
A_IMAGE=$(docker inspect maia-sovereign --format '{{.Image}}' 2>/dev/null)
A_CID=$(docker inspect maia-sovereign --format '{{.Id}}' 2>/dev/null)
A_SHA=$(docker exec maia-sovereign printenv GIT_COMMIT 2>/dev/null | tr -d '\r')
A_FLAG=$(docker exec maia-sovereign printenv $FLAG 2>/dev/null | tr -d '\r')
A_HEALTH=$(docker inspect maia-sovereign --format '{{.State.Health.Status}}' 2>/dev/null)
A_CURRENT=$(docker image inspect maia-sovereign:current --format '{{.Id}}' 2>/dev/null)

say "container GIT_COMMIT" "$A_SHA"
say "container image"      "${A_IMAGE:0:19}…"
say "health"               "$A_HEALTH"
say "flag"                 "${A_FLAG:-(absent)}"

[ "$A_SHA" = "$RELEASE_SHA" ] || post "GIT_COMMIT changed: $B_SHA → $A_SHA"
[ "$A_IMAGE" = "$B_IMAGE" ]   || post "THE IMAGE CHANGED — this was a rebuild, not an activation"
[ "$A_CURRENT" = "$B_CURRENT" ] || post ":current moved — rollback custody was disturbed"
[ "$A_HEALTH" = healthy ]     || post "service is '$A_HEALTH' after activation"
[ "$A_FLAG" = "1" ]           || post "the flag is '${A_FLAG:-absent}' in the container, not 1"

# ⭐ The container ID MUST have changed — otherwise the env never reloaded and a
# green flag reading would be from a process that never saw it.
[ "$A_CID" != "$B_CID" ] \
  || post "the container was NOT recreated, so the running process predates the flag"
say "container recreated" "${B_CID:0:12}… → ${A_CID:0:12}…  (expected)"

# ⚠️⚠️ THIS ASKED A WEAKER QUESTION THAN THE PRE-CHECK, AND ON 2026-09-16 IT
# ANSWERED `30`. The pre-check counts THE SEVEN BY NAME; this counted every
# 2026-09 migration, so it could not have distinguished the seven being present
# from the seven being gone and thirty others remaining.
#
# ⛔ It never failed, because it was never compared to anything — an unscored
# number printed beside scored ones reads as evidence and is not. Repaired to ask
# the SAME question as P1, and to STOP on a mismatch like every other clause.
A_MIGS=$(docker exec maia-postgres psql -qtAX -U soullab maia_consciousness -c "
  SELECT count(*) FROM schema_migrations WHERE filename IN (
   '20260914000001_proposal_succession.sql','20260914000002_manuscript_revision_offers.sql',
   '20260914000003_proposal_chains_member_identity.sql',
   '20260914000004_manuscript_revision_authorizations.sql',
   '20260914000005_editorial_ontology.sql',
   '20260915000001_ask_threads_subject_preparation.sql',
   '20260915000002_editorial_turn_bindings.sql');" 2>/dev/null | tr -d '[:space:]')
say "migrations (the seven)" "$A_MIGS"
[ "$A_MIGS" = "7" ] || post "migration state is $A_MIGS, not 7, after activation"

# ⭐⭐ ONLY MAIA. Stage 1's deploy recreated ten containers; this must recreate one.
AFTER_STACK=$(docker ps -a --format '{{.Names}} {{.ID}} {{.CreatedAt}}' | grep -v '^maia-sovereign ' | sort)
if [ "$BEFORE_STACK" = "$AFTER_STACK" ]; then
  say "other containers" "UNTOUCHED ✅"
else
  echo; echo "   ⛔ OTHER CONTAINERS CHANGED:"; diff <(echo "$BEFORE_STACK") <(echo "$AFTER_STACK") | sed 's/^/     /'
  post "the act was not confined to maia-sovereign"
fi

echo
echo "✅ STAGE 2 ACTIVATION VERIFIED"
echo "   the flag is ON and the application artifact is unchanged."
echo "⛔ NO SMOKE, NO CHAPTER 10. Run ws-stage2-smoke.sh next; the walk is a separate act."
