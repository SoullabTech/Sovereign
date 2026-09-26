#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
DB="ws_a25r2_pre_successor_20260925"
URL="postgresql://soullab@localhost:5432/$DB"
TMP_MIG="$(mktemp -d -t ws-a25r2-migs.XXXXXX)"
cleanup() {
  dropdb --if-exists "$DB" >/dev/null 2>&1 || true
  rm -rf "$TMP_MIG"
}
trap cleanup EXIT

dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"

for f in database/migrations/*.sql; do
  name="$(basename "$f")"
  if [ "$name" = "20260925000006_writer_editorial_scope_identity_successor.sql" ]; then
    continue
  fi
  ln -s "$(pwd)/$f" "$TMP_MIG/$name"
done

DATABASE_URL="$URL" MIG_DIR="$TMP_MIG" bash scripts/bootstrap-database.sh >/tmp/a25r2-pre-boot.log 2>&1
DATABASE_URL="$URL" MIG_DIR="$TMP_MIG" bash scripts/apply-migrations.sh >/tmp/a25r2-pre-migrate.log 2>&1
psql "$URL" -X -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO members (id,passkey,username,password_hash)
VALUES ('11111111-1111-4111-8111-111111111111','A25R2-PRE','a25r2-pre','x');

INSERT INTO living_works (id,member_id,title)
VALUES ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Pre-successor');

INSERT INTO member_manuscripts (id,member_id,title)
VALUES ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Pre-successor');

INSERT INTO living_work_expressions (id,living_work_id,expression_type,expression_id,declared_by)
VALUES (
  '44444444-4444-4444-8444-444444444444',
  '22222222-2222-4222-8222-222222222222',
  'manuscript',
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO writer_editorial_relationships
  (id,member_id,living_work_id,manuscript_id,creation_expression_id,contract_version)
VALUES (
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  'A2-1'
);
INSERT INTO writer_editorial_relationship_episodes
  (relationship_id,sequence,child_kind,requested_scope,executed_scope,
   temporal_posture,history_policy,continuation_authorized,authority_class,carry_policy,
   review_thread_id,review_maia_turn_index,review_authorization_id,review_reading_id,review_observation_key)
VALUES (
  '55555555-5555-4555-8555-555555555555',
  1,
  'REVIEW_DISCUSS',
  'passage',
  'passage',
  'AS_READ',
  'NONE',
  FALSE,
  'R2_DISCLOSURE',
  'PRESENTATION_ONLY',
  gen_random_uuid(),
  1,
  gen_random_uuid(),
  gen_random_uuid(),
  'pre-successor'
);
SQL

set +e
psql "$URL" -X -v ON_ERROR_STOP=1   -f database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql   >/tmp/a25r2-refusal.log 2>&1
RC=$?
set -e

if [ "$RC" -eq 0 ]; then
  echo "FAIL migration accepted pre-successor A2 episode"
  exit 1
fi
ROW_COUNT="$(psql "$URL" -X -t -A -c "SELECT count(*) FROM writer_editorial_relationship_episodes")"
OLD_SCOPE="$(psql "$URL" -X -t -A -c "SELECT count(*) FROM information_schema.columns WHERE table_name='writer_editorial_relationship_episodes' AND column_name='requested_scope'")"
NEW_SCOPE="$(psql "$URL" -X -t -A -c "SELECT count(*) FROM information_schema.columns WHERE table_name='writer_editorial_relationship_episodes' AND column_name='manuscript_scope_requested'")"
CHAIN_SCOPE="$(psql "$URL" -X -t -A -c "SELECT count(*) FROM information_schema.columns WHERE table_name='proposal_chains' AND column_name='locus_scope_kind'")"

if [ "$ROW_COUNT" != "1" ] || [ "$OLD_SCOPE" != "1" ] || [ "$NEW_SCOPE" != "0" ] || [ "$CHAIN_SCOPE" != "0" ]; then
  echo "FAIL refusal did not roll back schema/data atomically"
  echo "rows=$ROW_COUNT old_scope=$OLD_SCOPE new_scope=$NEW_SCOPE chain_scope=$CHAIN_SCOPE"
  exit 1
fi

if ! grep -q "pre-successor A2 episode rows exist" /tmp/a25r2-refusal.log; then
  echo "FAIL expected refusal reason not observed"
  exit 1
fi

echo "PASS pre-successor A2 episode causes fail-closed migration refusal"
echo "PASS refusal preserves old columns, absence of new discriminator, and existing row"
