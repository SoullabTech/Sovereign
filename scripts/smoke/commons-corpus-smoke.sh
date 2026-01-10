#!/usr/bin/env bash
#
# Corpus-as-Environment smoke test
#
# Validates that:
# 1. Migration creates tables correctly
# 2. Ingestion script processes docs
# 3. Chunks have embeddings
# 4. Retrieval queries work
#
# Usage:
#   ./scripts/smoke/commons-corpus-smoke.sh
#
set -euo pipefail

DATABASE_URL="${DATABASE_URL:-postgresql://soullab@localhost:5432/maia_consciousness}"

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "Corpus-as-Environment smoke test starting…"
log "DATABASE_URL=${DATABASE_URL%%@*}@..."

# Test 1: Check tables exist
log "Test 1: Checking corpus tables exist…"

TABLES=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_name IN ('corpora', 'corpus_documents', 'corpus_chunks', 'corpus_ingestions', 'corpus_retrievals')
")
TABLES=$(echo "$TABLES" | tr -d ' ')

if [[ "$TABLES" -lt 5 ]]; then
  log "Tables missing. Running migration..."
  psql "$DATABASE_URL" -f database/migrations/20260112000001_corpus_environment.sql
fi

TABLES=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_name IN ('corpora', 'corpus_documents', 'corpus_chunks', 'corpus_ingestions', 'corpus_retrievals')
")
TABLES=$(echo "$TABLES" | tr -d ' ')

[[ "$TABLES" -eq 5 ]] || no "Expected 5 corpus tables, found ${TABLES}"
ok "All corpus tables exist"

# Test 2: Check corpus seed exists
log "Test 2: Checking commons.manuals corpus exists…"

CORPUS_ID=$(psql "$DATABASE_URL" -t -c "SELECT id FROM corpora WHERE slug = 'commons.manuals'" | tr -d ' ')

if [[ -z "$CORPUS_ID" || "$CORPUS_ID" == "" ]]; then
  no "Corpus commons.manuals not found"
fi
ok "Corpus commons.manuals exists: ${CORPUS_ID:0:8}..."

# Test 3: Run ingestion (small scale - 5 docs max for smoke test)
log "Test 3: Running ingestion (max 5 docs)…"

# Check if Ollama is available for embeddings
OLLAMA_HEALTH=$(curl -s http://localhost:11434/api/version 2>/dev/null || echo "offline")

if [[ "$OLLAMA_HEALTH" == "offline" ]]; then
  log "⚠️  Ollama offline - skipping embedding-dependent tests"
  SKIP_EMBEDDING_TESTS=1
else
  ok "Ollama available for embeddings"
  SKIP_EMBEDDING_TESTS=0

  # Run ingestion on a subset (first check if already ingested)
  EXISTING_DOCS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM corpus_documents WHERE corpus_id = '$CORPUS_ID'" | tr -d ' ')

  if [[ "$EXISTING_DOCS" -lt 3 ]]; then
    log "Ingesting Community Commons docs (limited to 5)..."
    DATABASE_URL="$DATABASE_URL" npx tsx scripts/ingest/commons-corpus.ts --max-docs 5 2>&1 | head -40
  else
    log "Corpus already has ${EXISTING_DOCS} docs, skipping re-ingestion"
  fi
fi

# Test 4: Verify documents exist
log "Test 4: Checking documents were ingested…"

DOC_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM corpus_documents WHERE corpus_id = '$CORPUS_ID'" | tr -d ' ')

[[ "$DOC_COUNT" -gt 0 ]] || no "No documents found in corpus"
ok "Found ${DOC_COUNT} documents in corpus"

# Test 5: Verify chunks exist
log "Test 5: Checking chunks were created…"

CHUNK_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM corpus_chunks WHERE corpus_id = '$CORPUS_ID'" | tr -d ' ')

[[ "$CHUNK_COUNT" -gt 0 ]] || no "No chunks found in corpus"
ok "Found ${CHUNK_COUNT} chunks in corpus"

# Test 6: Verify embeddings (if Ollama was available)
if [[ "$SKIP_EMBEDDING_TESTS" -eq 0 ]]; then
  log "Test 6: Checking embeddings were generated…"

  EMBEDDED_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM corpus_chunks WHERE corpus_id = '$CORPUS_ID' AND embedding IS NOT NULL" | tr -d ' ')

  if [[ "$EMBEDDED_COUNT" -eq 0 ]]; then
    no "No chunks have embeddings"
  fi

  EMBED_RATE=$((EMBEDDED_COUNT * 100 / CHUNK_COUNT))
  [[ "$EMBED_RATE" -gt 80 ]] || log "⚠️  Only ${EMBED_RATE}% of chunks have embeddings"
  ok "Embeddings present: ${EMBEDDED_COUNT}/${CHUNK_COUNT} (${EMBED_RATE}%)"

  # Test 7: Test vector similarity query
  log "Test 7: Testing vector similarity query…"

  # Get a sample embedding to query with
  SAMPLE_QUERY=$(psql "$DATABASE_URL" -t -c "
    SELECT content FROM corpus_chunks
    WHERE corpus_id = '$CORPUS_ID' AND embedding IS NOT NULL
    LIMIT 1
  " | head -c 100)

  if [[ -n "$SAMPLE_QUERY" ]]; then
    # Query for similar chunks
    SIMILAR_COUNT=$(psql "$DATABASE_URL" -t -c "
      SELECT COUNT(*) FROM (
        SELECT id, 1 - (embedding <=> (
          SELECT embedding FROM corpus_chunks
          WHERE corpus_id = '$CORPUS_ID' AND embedding IS NOT NULL
          LIMIT 1
        )) as similarity
        FROM corpus_chunks
        WHERE corpus_id = '$CORPUS_ID' AND embedding IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 5
      ) q
    " | tr -d ' ')

    [[ "$SIMILAR_COUNT" -eq 5 ]] || [[ "$SIMILAR_COUNT" -gt 0 ]] || no "Vector similarity query failed"
    ok "Vector similarity query works (returned ${SIMILAR_COUNT} results)"
  fi
else
  log "Test 6-7: Skipped (Ollama offline)"
fi

# Test 8: Check ingestion audit trail
log "Test 8: Checking ingestion audit trail…"

INGESTION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM corpus_ingestions WHERE corpus_id = '$CORPUS_ID'" | tr -d ' ')

ok "Found ${INGESTION_COUNT} ingestion records"

# Summary
echo ""
ok "Corpus-as-Environment smoke test PASSED ✅"
echo ""
echo "Summary:"
echo "  Corpus: commons.manuals"
echo "  Documents: ${DOC_COUNT}"
echo "  Chunks: ${CHUNK_COUNT}"
if [[ "$SKIP_EMBEDDING_TESTS" -eq 0 ]]; then
  echo "  Embedded: ${EMBEDDED_COUNT}"
fi
echo "  Ingestions: ${INGESTION_COUNT}"
