#!/bin/sh
# PT-3 §IX.8 — post-cutover acceptance witness. PRODUCTION-SAFE.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §IX.8, §X, §XI.
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-post-cutover-witness.sh
#
# ⚠️ THIS WITNESS NEVER WRITES. It performs no INSERT, UPDATE or DELETE, creates no fixture, and
# runs no adversarial mutation against member data. §IX.8: "Structural role/grant inspection is
# sufficient for destructive refusal evidence in production; the destructive falsifier has already
# been proven against disposable infrastructure."
#
# So refusal is proven here from the CATALOGUE — privileges, ownership, trigger presence — and
# lawful capability is proven from privileges plus read-only queries. The one thing it will not do
# is demonstrate ordinary draft work by performing it: that would write to a member's draft.
# Instead it verifies the privileges draft work requires are present, and says so.
#
# Exit: 0 READY · 1 DEFECT (a §X abort condition) · 2 INCONCLUSIVE (nothing observed).

set -u
defects=0; observed=0
ok()     { observed=$((observed+1)); printf 'OK      %s\n        %s\n' "$1" "$2"; }
bad()    { observed=$((observed+1)); defects=$((defects+1)); printf 'DEFECT  %s\n        %s\n' "$1" "$2"; }
note()   { printf '        %s\n' "$1"; }

if ! docker ps >/dev/null 2>&1; then
  echo "INCONCLUSIVE — no reachable Docker daemon. Run this on the production host."; exit 2
fi
if ! docker ps --format '{{.Names}}' | grep -qx maia-postgres; then
  echo "INCONCLUSIVE — maia-postgres is not running."; exit 2
fi

q() { docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc "$1" 2>/dev/null || true; }

# ⭐ SOURCE-CURRENCY INVARIANTS live in one shared file, because the disposable regression must ask
# the SAME question this witness asks. A re-typed invariant drifts, and drift is how the wrong I4/I6
# survived review in the first place.
PT3_LIB="${PT3_LIB:-$(dirname "$0")}"
for lib in pt3-currency-invariants.sh pt3-compose.sh; do
  if [ ! -r "$PT3_LIB/$lib" ]; then
    echo "INCONCLUSIVE — $PT3_LIB/$lib not found."
    echo "Run this witness from the materialized snapshot (the orchestrator does), not by piping it"
    echo "over ssh: a witness missing its own definitions cannot pronounce on anything."
    exit 2
  fi
done
# shellcheck source=/dev/null
. "$PT3_LIB/pt3-currency-invariants.sh"
# ⭐ B45 — THE MIGRATION EXEMPTION IS DEFINED ONCE. Repair 7 narrowed it from the `*migrate*` name
# substring to the Compose service identity, but this witness kept its own copy of the old rule —
# so an ordinary container merely NAMED `maia-migrate-helper` could hold owner material and vanish
# from the final constitutional census by substring. Same defect class as B41, in the exemption
# instead of the invariant: one rule, one executable definition. pt3_is_exempt() is that rule.
# shellcheck source=/dev/null
. "$PT3_LIB/pt3-compose.sh"

echo "════════ 1. RUNTIME OPERATES AS THE CONSTRAINED ROLE (§XI · B38) ════════"
#
# ⭐ DISCOVERED, NOT ASSUMED. An earlier version asked about a hardcoded list of four services —
# which is how three database-using workers (embed, summary, media) stayed out of the cutover set
# until the compose audit found them.
#
# ⭐ B38 — AND OWNER AUTHORITY IS NOT ONE VARIABLE NAME. Asking only about DATABASE_URL missed two
# things at once: POSTGRES_PASSWORD is by itself sufficient to authenticate as the owner, and
# maia-caddy — deliberately left UP through the outage so it can serve a refusal rather than a
# black hole — never rereads .env.production, so it carries whatever it was created with. The
# question is possession of owner MATERIAL, in any form, by any ordinary running container.
#
# Variable NAMES are printed. Values never are.
OWNER_ROLE=$(q "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'")
[ -n "$OWNER_ROLE" ] || OWNER_ROLE='soullab'

owner_material() {   # container → names of owner-bearing variables, one per line
  docker exec "$1" env 2>/dev/null | awk -F= -v owner="$OWNER_ROLE" '
    $1 == "DATABASE_URL"         && length($2) { print $1; next }
    $1 == "MIGRATE_DATABASE_URL" && length($2) { print $1; next }
    $1 == "POSTGRES_PASSWORD"    && length($2) { print $1; next }
    $0 ~ ("=postgres(ql)?://" owner ":")       { print $1; next }
  ' | sort -u | tr '\n' ',' | sed 's/,$//'
}

checked=0
for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
  # B45 — postgres and the GOVERNED MIGRATION SERVICE, by Compose service identity. Never by name.
  pt3_is_exempt "$c" && continue
  app=$(docker exec "$c" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
  own=$(owner_material "$c")
  # In scope: anything that touches the database at all, or holds owner material for any reason.
  [ -n "$app" ] || [ -n "$own" ] || continue
  checked=$((checked+1))
  app_role=$(printf '%s' "$app" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  if [ -n "$own" ]; then
    bad "$c still possesses owner material" "variables: $own — §X abort condition (B38: recreate it)"
  elif [ "$app_role" = "maia_app" ]; then
    ok "$c runs as maia_app and holds no owner material" "MAIA_APP_DATABASE_URL role=maia_app"
  else
    bad "$c does not run as maia_app" "MAIA_APP_DATABASE_URL role=${app_role:-<absent>} — §X abort condition"
  fi
done
[ "$checked" -gt 0 ] || bad "no database-using container was observed" "cannot pronounce on a runtime it cannot see"
note "$checked container(s) discovered and checked for owner material of any form"

# ⭐ §XI — ACTUAL CONNECTIONS, NOT VARIABLE NAMES. Everything above reads configuration; a pool can
# still reconnect around its configuration, which is exactly the B23/B34 failure mode a grant census
# cannot see. So ask the database who is actually connected. A TCP client (client_addr NOT NULL) is
# another container; this witness's own psql arrives over the unix socket and is excluded by that
# same test rather than by naming it.
FOREIGN=$(q "SELECT count(*) FROM pg_stat_activity
              WHERE datname = current_database() AND backend_type = 'client backend'
                AND client_addr IS NOT NULL AND usename <> 'maia_app'")
APPCONN=$(q "SELECT count(DISTINCT client_addr) FROM pg_stat_activity
              WHERE datname = current_database() AND backend_type = 'client backend'
                AND client_addr IS NOT NULL AND usename = 'maia_app'")
if [ "$FOREIGN" = "0" ]; then
  ok "every live application connection authenticates as maia_app" "0 client backends on any other role"
else
  ROLES=$(q "SELECT string_agg(DISTINCT usename, ',') FROM pg_stat_activity
              WHERE datname = current_database() AND backend_type = 'client backend'
                AND client_addr IS NOT NULL AND usename <> 'maia_app'")
  bad "$FOREIGN live application connection(s) are not maia_app" "role(s): ${ROLES:-?} — §X abort condition"
fi
if [ -n "$APPCONN" ] && [ "$APPCONN" -gt 0 ] 2>/dev/null; then
  ok "the application is actually connected as maia_app" "$APPCONN distinct client address(es)"
else
  bad "no application connection as maia_app was observed" \
      "configuration may be right and the runtime still not connected — absence of observation is not evidence of compliance"
fi

# ⭐ B34 — BOTH production runtimes, proven by name. maia-api is a separate image built from
# apps/api/Dockerfile; proving the main runtime and assuming the API is how a second production
# database client stays outside the census.
for c in maia-sovereign maia-api; do
  docker ps --format '{{.Names}}' | grep -qx "$c" || { bad "$c is not running" "the transition did not bring it back"; continue; }
  sha=$(docker exec "$c" printenv GIT_COMMIT 2>/dev/null || echo '')
  case "$sha" in
    ''|unknown) bad "$c cannot state which commit it is" "GIT_COMMIT=${sha:-<absent>} — §XIV (B34): an unstamped image cannot join an immutable-SHA transition" ;;
    *)          ok "$c reports its build commit" "GIT_COMMIT=$(printf '%s' "$sha" | cut -c1-12)" ;;
  esac
done
if [ -n "${PT3_ACCEPTED_SHA:-}" ]; then
  for c in maia-sovereign maia-api; do
    sha=$(docker exec "$c" printenv GIT_COMMIT 2>/dev/null || echo '')
    [ "$sha" = "$PT3_ACCEPTED_SHA" ] \
      && ok "$c is the accepted commit" "$(printf '%s' "$sha" | cut -c1-12)" \
      || bad "$c is not the accepted commit" "running $(printf '%s' "${sha:-<absent>}" | cut -c1-12), expected $(printf '%s' "$PT3_ACCEPTED_SHA" | cut -c1-12) — §X abort condition"
  done
else
  note "PT3_ACCEPTED_SHA not set — image identity reported, not compared against the authorized commit"
fi

echo
echo "════════ 2. PROTECTED SOURCE CANNOT BE MUTATED BY ORDINARY AUTHORITY (§XI) ════════"
# Structural, not adversarial: read the grants themselves.
for tbl in manuscript_sections manuscript_source_arrivals; do
  bad_privs=$(q "SELECT string_agg(privilege_type, ',') FROM information_schema.role_table_grants
                  WHERE grantee='maia_app' AND table_name='$tbl'
                    AND privilege_type IN ('UPDATE','DELETE')")
  colgrants=$(q "SELECT string_agg(column_name||':'||privilege_type, ' ')
                   FROM information_schema.column_privileges
                  WHERE grantee='maia_app' AND table_name='$tbl' AND privilege_type='UPDATE'")
  case "$tbl" in
    manuscript_sections)
      ins=$(q "SELECT count(*) FROM information_schema.role_table_grants
                WHERE grantee='maia_app' AND table_name='$tbl' AND privilege_type='INSERT'")
      if [ -z "$bad_privs" ] && [ "$ins" = "0" ]; then
        ok "maia_app holds no INSERT/UPDATE/DELETE on $tbl" "representation creation is behind the seam"
      else
        bad "maia_app can write $tbl" "table-level: ${bad_privs:-none}, INSERT count=$ins — §X abort condition"
      fi ;;
    manuscript_source_arrivals)
      if [ -z "$bad_privs" ]; then
        ok "maia_app holds no table-level UPDATE/DELETE on $tbl" "column grants: ${colgrants:-none}"
        case "$colgrants" in
          *source_text*|*artifact*) bad "bookkeeping grant reaches Source content" "$colgrants — §X abort condition" ;;
          *manuscript_id:UPDATE*)   ok "bookkeeping is column-bounded to manuscript_id" "claimArrival remains lawful" ;;
          *)                        note "no column UPDATE grant found — claimArrival would fail; verify step 8 behaviour" ;;
        esac
      else
        bad "maia_app can mutate $tbl" "table-level: $bad_privs — §X abort condition"
      fi ;;
  esac
done

esc=$(q "SELECT rolsuper::text FROM pg_roles WHERE rolname='maia_app'")
[ "$esc" = "f" ] && ok "maia_app is not a superuser" "no privilege bypass" \
                 || bad "maia_app is a superuser or missing" "rolsuper=${esc:-<absent>} — §X: maia_app can escalate"

mem=$(q "SELECT count(*) FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.roleid
          JOIN pg_roles g ON g.oid=m.member WHERE g.rolname='maia_app'")
[ "$mem" = "0" ] && ok "maia_app is a member of no other role" "cannot SET ROLE to owner" \
                 || bad "maia_app inherits another role" "memberships=$mem — §X: escalation path exists"

own=$(q "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'")
[ "$own" != "maia_app" ] && ok "protected tiers owned by custody authority" "owner=$own" \
                         || bad "protected tiers owned by the app role" "the refusal triggers would be disableable"

trg=$(q "SELECT count(*) FROM pg_trigger WHERE tgname IN ('pt3_sections_refuse','pt3_arrivals_refuse') AND NOT tgisinternal")
[ "$trg" = "2" ] && ok "both defence-in-depth refusal triggers are installed" "pt3_sections_refuse, pt3_arrivals_refuse" \
                 || bad "refusal triggers missing" "found $trg of 2"

echo
echo "════════ 3. GOVERNED LIFECYCLE REMAINS SEPARATELY AVAILABLE (§XI) ════════"
seam=$(q "SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname IN
           ('source_extract','source_re_extract','source_replace_lineage',
            'source_withdraw_representation','source_commission_erasure',
            'source_operative_representation','source_operative_arrival')")
[ "$seam" = "7" ] && ok "all seven seam functions exist" "lifecycle acts remain possible through the seam" \
                  || bad "seam incomplete" "found $seam of 7"
exec_ok=$(q "SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
              WHERE n.nspname='public' AND p.proname='source_commission_erasure'
                AND has_function_privilege('maia_app', p.oid, 'EXECUTE')")
[ "$exec_ok" = "1" ] && ok "maia_app may commission erasure through the seam" "member-directed erasure still works" \
                     || bad "maia_app cannot reach the erasure seam" "member erasure would break"

echo
echo "════════ 4. THE BACKFILL HOLDS AS AN INVARIANT (§X · B32) ════════"
#
# ⭐ B32 — INVARIANTS, NOT FROZEN PRODUCTION TOTALS.
#
# An earlier version of this block compared LIVE totals against the accepted census
# ("representations created … 11"). That comparison is sound exactly once — while the runtime is
# quiesced and no member can write. This witness runs AFTER release, so one lawful member import
# moves those numbers and a perfectly correct system would report a §X abort condition. A gate
# that fires on lawful use is not a gate; it is a future excuse to weaken the boundary.
#
# The exact counts are therefore proved where they are deterministic and nowhere else:
#   scripts/witness/pt3-verify-backfill.sh — run inside the cutover, under quiescence,
#   BEFORE the single release act. If the backfill was wrong, the runtime never reopens.
#
# Here the same facts are tested as properties that must hold forever. Two classes, and the
# distinction is the point:
#
#   LIVE   — grows with lawful member use. Tested by structure and by floor, never by equality.
#   SEALED — produced by the migration backfill and by NOTHING else (every seam act writes
#            provenance='member_act' with an actor; source_extract writes 'source_custodied';
#            only the migration writes reconciliation rows). For these, equality IS the invariant:
#            a change means something other than the migration manufactured legacy history.
SEALED_LEGACY_REPRESENTATIONS=5     # legacy_interpreted_import  — migration-produced, constant
SEALED_LEGACY_ACTS=17               # provenance='migration_legacy' — migration-produced, constant
SEALED_RECON_MULTI_ARRIVAL=0        # census: production has zero multi-arrival Works
FLOOR_REPRESENTATIONS=11            # append-only: may grow, may never fall below the backfill
FLOOR_ACTS=17

inv() {  # label · actual-count-that-must-be-zero · what a non-zero means
  if [ "$2" = "0" ]; then ok "$1" "0 violations"
  else bad "$1" "$2 violation(s) — $3 — §X abort condition"; fi
}
sealed() {  # label · actual · sealed value
  if [ "$2" = "$3" ]; then ok "$1" "$2 (sealed — only the migration produces these)"
  else bad "$1" "got $2, the migration produced $3 — something other than the backfill has manufactured legacy history — §X abort condition"; fi
}
floor() {  # label · actual · floor
  if [ -n "$2" ] && [ "$2" -ge "$3" ] 2>/dev/null; then ok "$1" "$2 (≥ $3; the record is append-only and may grow)"
  else bad "$1" "got ${2:-<none>}, below the backfill floor $3 — the lifecycle record has LOST rows — §X abort condition"; fi
}

# ── SEALED ────────────────────────────────────────────────────────────────────────────────────
sealed "legacy_interpreted_import representations" \
  "$(q "SELECT count(*) FROM manuscript_source_representations WHERE custody='legacy_interpreted_import'")" \
  "$SEALED_LEGACY_REPRESENTATIONS"
sealed "acts attributed to the migration, not to a member" \
  "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='migration_legacy'")" \
  "$SEALED_LEGACY_ACTS"
sealed "multi-arrival reconciliation rows" \
  "$(q "SELECT count(*) FROM source_lifecycle_reconciliation WHERE kind='multiple_legacy_arrivals'")" \
  "$SEALED_RECON_MULTI_ARRIVAL"

# ── LIVE, tested as floors ────────────────────────────────────────────────────────────────────
floor "representations in the lineage" \
  "$(q "SELECT count(*) FROM manuscript_source_representations")" "$FLOOR_REPRESENTATIONS"
floor "lifecycle acts recorded" \
  "$(q "SELECT count(*) FROM source_lifecycle_acts")" "$FLOOR_ACTS"

# ── LIVE, tested as structure ─────────────────────────────────────────────────────────────────
#
# THE LAUNDERING INVARIANT (§V). The one this lane got wrong first and must never get wrong again:
# a migration-attributed act may never carry a member actor, because the earlier system's inference
# is not the member's declaration.
inv "no migration-attributed act carries a member actor" \
    "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='migration_legacy' AND actor_member_id IS NOT NULL")" \
    "legacy inference has been laundered into member authorship"

inv "every member act names its actor" \
    "$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='member_act' AND actor_member_id IS NULL")" \
    "an unattributed act is presented as a member's own"

inv "custody is the presence of the arrival, not a word beside it" \
    "$(q "SELECT count(*) FROM manuscript_source_representations WHERE (custody='source_custodied') <> (arrival_id IS NOT NULL)")" \
    "a representation claims custody it cannot evidence"

# ⭐ I4, REPLACED. It used to assert "every Work with sections has an operative representation" —
# false as constitutional law, and the disposable rehearsal proved it: the migration deliberately
# creates NO currency act for a Work with several Historical Arrivals, recording the ambiguity
# instead of manufacturing an answer. The old invariant convicted that refusal.
#
#   NO CURRENCY IS NOT THE SAME THING AS MISSING CURRENCY.
#
# Three lawful shapes: OPERATIVE · AMBIGUOUS LEGACY (open, recorded) · WITHDRAWN (governed member
# act). Anything else is an unexplained loss of Source authority and is still a defect.
inv "no Work has lost Source currency unexplainably" \
    "$(q "$PT3_INV_UNEXPLAINED_ABSENCE")" \
    "a Work's Source currency is gone with no recorded ambiguity and no governed withdrawal"

inv "no section is orphaned from the lineage" \
    "$(q "SELECT count(*) FROM manuscript_sections s WHERE s.representation_id IS NULL
            OR NOT EXISTS (SELECT 1 FROM manuscript_source_representations r WHERE r.id = s.representation_id)")" \
    "Source exists outside the custody record"

# ⭐ I6, REPLACED, for the same reason: the ambiguous representation has no act ON PURPOSE. An
# unacted representation is permissible only where the system recorded WHY it refused to infer one.
inv "every unacted representation is accounted for by a recorded ambiguity" \
    "$(q "$PT3_INV_UNRECORDED_REPRESENTATION")" \
    "a representation entered the lineage with neither an act nor a recorded reason for its absence"

# RECONCILIATION IS COMPLETE — expressed as a condition, never as a count. The accepted census
# said five; if production had held fifty, the correct behaviour would be fifty rows, not a defect.
inv "every arrival-less legacy representation is reconciliation-flagged" \
    "$(q "SELECT count(*) FROM manuscript_source_representations r
           WHERE r.arrival_id IS NULL
             AND NOT EXISTS (SELECT 1 FROM source_lifecycle_reconciliation c
                              WHERE c.manuscript_id = r.manuscript_id
                                AND c.kind = 'representation_without_arrival')")" \
    "an unevidenced legacy representation is not flagged for founder reconciliation"

# ⛔ §VII — THE EXCEPTION IS NOT AN ESCAPE HATCH. Excluding reconciliation rows from the two
# invariants above would let any absence be excused by writing a reconciliation row. So the record
# itself is tested: it may only excuse a Work that really is ambiguous and really has no currency.
#   Unresolved ambiguity is a valid state. Unrecorded ambiguity is a defect.
inv "every open ambiguity record describes a genuinely multi-arrival Work" \
    "$(q "$PT3_INV_AMBIGUITY_IS_REAL")" \
    "a reconciliation row excuses a Work that has at most one arrival — an escape hatch, not a record"

inv "every open ambiguity record describes a Work with no governed currency" \
    "$(q "$PT3_INV_AMBIGUITY_HAS_NO_CURRENCY")" \
    "currency was established through the seam and the record was never resolved"

inv "no arrival claims a Work that does not exist" \
    "$(q "SELECT count(*) FROM manuscript_source_arrivals a WHERE a.manuscript_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = a.manuscript_id)")" \
    "a claim is untruthful"

echo
echo "════════ 5. ORDINARY LAWFUL WORK REMAINS POSSIBLE (§IX.8) ════════"
#
# Also B32: these four lines used to print live totals through unconditional ok(...) calls — the
# B27 defect, surviving in the block nobody re-read. Each is now a gate.
works=$(q "SELECT count(*) FROM member_manuscripts")
secs=$(q "SELECT count(*) FROM manuscript_sections")
if [ -n "$works" ] && [ -n "$secs" ] && [ "$works" -gt 0 ] && [ "$secs" -gt 0 ] 2>/dev/null; then
  ok "member Works and their Source are intact" "$works Works, $secs sections   (census recorded 13 and 1137)"
else
  bad "the Source tier is empty or unreadable" "works=${works:-?} sections=${secs:-?} — §X abort condition"
fi

# ⭐ B41 — THE OLD I4 LIVED ON HERE, IN DIFFERENT WORDS. This block used to require
# `resolved == with_secs` under the label "every Work with Source resolves through the seam" — the
# invariant block 4 had just replaced, restated a dozen lines later and still convicting both lawful
# absences: the multi-arrival Work the migration refused to decide, and a Work the member withdrew.
# The witness contradicted itself, PASS in block 4 and DEFECT here.
#
#   ⛔ ONE LAW, ONE EXECUTABLE DEFINITION.
#
# That is the entire reason pt3-currency-invariants.sh exists — so the same invariant cannot survive
# elsewhere under different wording. The gate is deleted, not rewritten. Block 4 owns the
# constitutional question. What remains here is a CENSUS: it reports the shape of the lineage and
# decides nothing about which absence is lawful.
with_secs=$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id FROM manuscript_sections) t")
operative=$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id AS m FROM manuscript_sections) w
                WHERE source_operative_representation(w.m) IS NOT NULL")
explained=$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id AS m FROM manuscript_sections) w
                WHERE source_operative_representation(w.m) IS NULL
                  AND ($PT3_OPEN_AMBIGUITY OR $PT3_WITHDRAWN)")
note "Works carrying Source: ${with_secs:-?} · operative: ${operative:-?} · explained non-operative: ${explained:-?}"
note "(informational — lawfulness of any absence is decided by block 4 alone)"

# A Work that never had Source must not have acquired one from a migration.
inv "the backfill fabricated no Source for a Work that had none" \
    "$(q "SELECT count(*) FROM member_manuscripts m
           WHERE NOT EXISTS (SELECT 1 FROM manuscript_sections s WHERE s.manuscript_id = m.id)
             AND EXISTS (SELECT 1 FROM manuscript_source_representations r WHERE r.manuscript_id = m.id)")" \
    "a blank Work was given a representation it never earned"
note "$(q "SELECT count(*) FROM member_manuscripts m WHERE NOT EXISTS (SELECT 1 FROM manuscript_sections s WHERE s.manuscript_id=m.id)") blank Work(s) carry no Source and were untouched"

# Draft work is proven by PRIVILEGE, not by writing to a member's draft.
draftp=$(q "SELECT count(DISTINCT table_name) FROM information_schema.role_table_grants
             WHERE grantee='maia_app' AND privilege_type IN ('INSERT','UPDATE')
               AND table_name IN ('manuscript_working_drafts','manuscript_draft_sections','working_draft_revisions')")
[ "$draftp" = "3" ] && ok "ordinary draft work retains its privileges" "INSERT/UPDATE on all three descendant tables — verified by grant, never by writing to a member's draft" \
                    || bad "draft work would be refused" "only $draftp of 3 descendant tables writable — custody must not become paralysis"

echo
echo "════════ 6. THE SCHEMA ACT IS ATTRIBUTABLE (§VIII, §X) ════════"
attr=$(q "SELECT coalesce(applied_by_commit,'<null>')||' / '||coalesce(applied_run_id,'<null>')||' / '||coalesce(applied_by_authority,'<null>')||' / '||coalesce(left(checksum,12),'<null>')
           FROM schema_migrations WHERE filename='20260908000001_pt3_source_custody_enforcement.sql'")
case "$attr" in
  ""|*"<null>"*) bad "the PT-3 migration is not fully attributed" "commit/run/authority/checksum = ${attr:-<not recorded>} — §X abort condition" ;;
  *unknown*)     bad "the PT-3 migration recorded commit=unknown" "$attr — the attribution passthrough did not reach the migrate container" ;;
  *)             ok "the PT-3 migration is attributable" "$attr" ;;
esac

exp=$(q "SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'writer_experience%'")
[ "$exp" = "0" ] && ok "no Experience table was applied" "§XII respected — Experience deployment stays held" \
                 || bad "Experience tables exist in production" "$exp table(s) — §XII does not authorize Experience deployment"

echo
echo "════════ 7. THE BOUNDARY SURVIVES THE ORDINARY DEPLOY PATH (§VII / B12) ════════"
#
# Detection is not prevention. This block asks whether the boundary is a property of the
# configuration every deploy loads, or of something an ordinary deploy can omit.
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
if [ -r "$PROJECT/.env.production" ]; then
  # B38 — every form of owner material, not one variable name.
  LEFTOVER=$(grep -oE '^(DATABASE_URL|POSTGRES_PASSWORD|MIGRATE_DATABASE_URL)=' "$PROJECT/.env.production" | tr -d '=' | tr '\n' ',' | sed 's/,$//')
  if [ -n "$LEFTOVER" ]; then
    bad "owner material is still in .env.production" \
        "$LEFTOVER — every service loads this file, so runtime possesses owner authority by configuration"
  else
    ok "no owner material remains in .env.production" \
       "every ordinary service loses owner authority by loading the file it always loaded"
  fi
  for f in .env.postgres .env.migrate; do
    if [ -s "$PROJECT/$f" ]; then
      ok "$f holds its service's owner credential" "mode $(stat -c '%a' "$PROJECT/$f" 2>/dev/null || echo '?')"
    else
      bad "$f is missing or empty" "a required env_file — postgres or migrate would lose authority"
    fi
  done
  if grep -qE '^MAIA_APP_DATABASE_URL=' "$PROJECT/.env.production"; then
    ok "the constrained credential is in .env.production" "no optional file is required to supply it"
  else
    bad "the constrained credential is not in .env.production" "runtime would have no database access"
  fi
else
  note ".env.production not readable from this shell — durability unverified"
fi
if ls "$PROJECT"/docker-compose.*cutover*.yml >/dev/null 2>&1; then
  bad "an optional cutover overlay is present" \
      "§VII — a boundary that depends on remembering a second -f flag is not durable"
else
  ok "no optional overlay exists" "an ordinary deploy cannot restore owner authority by omitting a file"
fi

echo
echo "════════ VERDICT ════════"
if [ "$observed" -eq 0 ]; then
  echo "INCONCLUSIVE — nothing observed."; exit 2
elif [ "$defects" -gt 0 ]; then
  echo "DEFECT — $defects §X abort condition(s). PT-3 is NOT structurally enforced in production."
  echo "Do not solve an unexpected production state by weakening the constitutional boundary."
  exit 1
else
  echo "READY — PT-3 is structurally enforced in production ($observed observations, 0 defects)."
  exit 0
fi
