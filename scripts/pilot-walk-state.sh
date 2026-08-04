#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pilot walk — capture the state a walk was performed against.
#
# Run this at the START of any walk session and paste the output into the walk
# notes. A finding is only interpretable against the tree and fixture state that
# produced it: on 2026-08-03 a gate result went stale within hours because the
# audit named a SHA that predated the surface it was describing.
#
#   ⛔ This script MUTATES NOTHING. It reads and prints.
#
# For the credential the walk needs, see scripts/seed-now-what-pilot.sql --
# it owns the demo member's password so that no one has to edit members.
# password_hash by hand again (2026-08-03: I did, without capturing the
# original first, and it is gone).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

DB="${PGDATABASE:-maia_consciousness}"
USER="${PGUSER:-soullab}"
Q() { psql -U "$USER" -d "$DB" -tAc "$1" 2>/dev/null; }

echo "── walk state ─────────────────────────────────────────────────────────"
echo "captured        : $(date -u '+%Y-%m-%dT%H:%M:%SZ') UTC"
echo "branch          : $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
echo "tree SHA        : $(git rev-parse --short HEAD 2>/dev/null)"
echo "worktree        : $(git rev-parse --show-toplevel 2>/dev/null)"
DIRTY="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
echo "uncommitted     : ${DIRTY} file(s)$([ "$DIRTY" != "0" ] && echo '  ⚠️ findings are not reproducible from the SHA alone')"

echo
echo "── deployed referent (what production is actually running) ────────────"
echo "⚠️  a local tree is NOT the deployed referent — check separately:"
echo "    ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'"

echo
echo "── fixture state ──────────────────────────────────────────────────────"
printf 'practice field  : %s\n' "$(Q "SELECT COALESCE(string_agg(field_slug, ', '), 'NONE') FROM practice_fields WHERE field_slug IS NOT NULL")"
printf 'positions       : %s\n' "$(Q "SELECT COALESCE(string_agg(field_slug || '/' || program_slug, ', '), 'NONE') FROM field_program_positions")"
printf 'member material : %s row(s)\n' "$(Q "SELECT count(*) FROM member_field_note_threads")"
printf 'invitations     : %s open, %s seeded\n' \
  "$(Q "SELECT count(*) FROM field_invitations WHERE withdrawn_at IS NULL")" \
  "$(Q "SELECT count(*) FROM field_invitations WHERE body LIKE '[SEED]%'")"

RESP="$(Q "SELECT count(*) FROM field_invitation_responses")"
printf 'responses       : %s' "$RESP"
if [ "$RESP" != "0" ]; then
  echo "  ⛔ NOT ZERO — a staged gesture contaminates the one moment the walk exists to observe."
  echo "                  reset with: DELETE FROM field_invitation_responses;"
else
  echo "  ✅ nothing staged"
fi

echo
echo "── known fixture ambiguity (pre-participant hygiene) ──────────────────"
MEMBER="$(Q "SELECT m.name FROM field_program_positions p JOIN members m ON m.id = p.member_id LIMIT 1")"
AUTHOR="$(Q "SELECT m.name FROM field_invitations i JOIN members m ON m.id = i.authored_by_practitioner_id LIMIT 1")"
echo "member holding position : ${MEMBER:-<none>}"
echo "invitation author       : ${AUTHOR:-<none>}"
echo "⚠️  cosmetic only — NOT a relationship or authority inversion. A human does"
echo "    not see database roles, they see people. Fix before a real participant."
echo "───────────────────────────────────────────────────────────────────────"
