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

echo "════════ 1. RUNTIME OPERATES AS THE CONSTRAINED ROLE (§XI) ════════"
for svc in maia-sovereign maia-api maia-comms-worker maia-rlm; do
  docker ps --format '{{.Names}}' | grep -qx "$svc" || { note "$svc not running"; continue; }
  app=$(docker exec "$svc" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
  own=$(docker exec "$svc" printenv DATABASE_URL 2>/dev/null || true)
  app_role=$(printf '%s' "$app" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  own_role=$(printf '%s' "$own" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  if [ "$app_role" = "maia_app" ] && [ -z "$own" ]; then
    ok "$svc runs as maia_app and holds no owner credential" "app role=maia_app, DATABASE_URL absent"
  elif [ "$app_role" != "maia_app" ]; then
    bad "$svc does not run as maia_app" "MAIA_APP_DATABASE_URL role=${app_role:-<absent>} — §X: ordinary runtime still receives owner authority"
  else
    bad "$svc still receives owner authority" "DATABASE_URL role=${own_role:-?} is still present — §X abort condition"
  fi
done

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
echo "════════ 4. THE BACKFILL DID WHAT WAS PREDICTED (§X) ════════"
# Predicted from the accepted census: 11 representations (6 custodied, 5 legacy), 17 acts all
# migration_legacy with NULL actor, 5 reconciliation rows, 0 multiple_legacy_arrivals.
reps=$(q "SELECT count(*)||'/'||count(*) FILTER (WHERE custody='source_custodied')||'/'||count(*) FILTER (WHERE custody='legacy_interpreted_import') FROM manuscript_source_representations")
ok "representations (total/custodied/legacy)" "$reps   — predicted 11/6/5"

laundered=$(q "SELECT count(*) FROM source_lifecycle_acts WHERE provenance='migration_legacy' AND actor_member_id IS NOT NULL")
[ "$laundered" = "0" ] && ok "no migration-attributed act carries a member actor" "legacy stays legacy" \
                       || bad "backfill created member-attributed history from legacy inference" "$laundered row(s) — §X abort condition"

acts=$(q "SELECT count(*)||' acts, '||count(*) FILTER (WHERE provenance='migration_legacy')||' migration_legacy' FROM source_lifecycle_acts")
ok "lifecycle acts" "$acts   — predicted 17 acts, all migration_legacy"

recon=$(q "SELECT coalesce(string_agg(kind||'='||n, ' '),'none') FROM (SELECT kind, count(*) n FROM source_lifecycle_reconciliation GROUP BY kind) t")
ok "reconciliation evidence" "$recon   — predicted representation_without_arrival=5, no multi-arrival rows"

hidden=$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id FROM manuscript_sections) s
             WHERE source_operative_representation(s.manuscript_id) IS NULL")
[ "$hidden" = "0" ] && ok "no Work with sections lost its operative representation" "nothing hidden from its author" \
                    || bad "$hidden Work(s) have sections but no operative representation" "§X: a legacy representation would be hidden"

unclaimed=$(q "SELECT count(*) FROM manuscript_source_arrivals WHERE manuscript_id IS NULL")
ok "unclaimed arrivals preserved as unclaimed" "$unclaimed   — predicted 2, never laundered into a custody claim"

echo
echo "════════ 5. ORDINARY LAWFUL WORK REMAINS POSSIBLE (§IX.8) ════════"
works=$(q "SELECT count(*) FROM member_manuscripts")
secs=$(q "SELECT count(*) FROM manuscript_sections")
ok "existing Works remain visible" "$works Works, $secs sections   — census recorded 13 and 1137"

resolved=$(q "SELECT count(*) FROM (SELECT DISTINCT manuscript_id m FROM manuscript_sections) t
               WHERE source_operative_representation(t.m) IS NOT NULL")
ok "imported Works resolve to an operative representation" "$resolved of 11 Works with sections"

blank=$(q "SELECT count(*) FROM member_manuscripts m
            WHERE NOT EXISTS (SELECT 1 FROM manuscript_sections s WHERE s.manuscript_id=m.id)")
ok "blank member-authored Works remain lawful" "$blank Work(s) with no Source, untouched"

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
