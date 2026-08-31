#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# WIC01-RUNTIME-BOUNDARY-PROBES
#
# Program:  MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01
# Lane:     runtime facts only — NO REPAIR AUTHORITY IN THIS LANE
# Purpose:  settle the UNKNOWN (runtime) rows of the Phase 1 census §6 so that
#           packet P1 (truth instrument) can be adjudicated on evidence.
#
# READ ONLY. Every statement below is a SELECT, a \dt, or a printenv. This
# script creates nothing, alters nothing, and deploys nothing. In particular it
# does NOT create semantic_memory_vectors or lattice_nodes — a query against a
# nonexistent table does not prove the table is canonical architecture; it may
# prove the query is obsolete. Adjudication is a ruling, not a migration.
#
# Run from a machine with SSH access to minisforum:
#   bash scripts/wic01-runtime-boundary-probes.sh | tee wic01-probes-$(date +%F).txt
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail
HOST="${MINISFORUM_HOST:-soullab@minisforum}"
PSQL="docker exec maia-postgres psql -U soullab maia_consciousness -t -A -F' | '"

hdr() { printf '\n═══ %s ═══\n' "$1"; }
probe() { ssh "$HOST" "$1" 2>&1 || echo "  (probe failed — record as UNKNOWN, do not guess)"; }

echo "WIC01 RUNTIME BOUNDARY PROBES — $(date -u +%FT%TZ)"
echo "host: $HOST"

# ── 1. Custody: what is actually deployed ────────────────────────────────────
# Closes the Phase 0 BIND gap. The census was performed against fc66b47, NOT
# against verified production.
hdr "1. PRODUCTION SHA + DEPLOY LANE"
probe 'docker exec maia-sovereign printenv GIT_COMMIT DEPLOY_LANE APP_VERSION 2>&1'
probe 'docker inspect maia-sovereign --format "created={{.Created}} image={{.Image}}"'

# ── 2. Model routing + fallback (census row 30) ──────────────────────────────
hdr "2. MODEL ROUTING / FALLBACK CONFIG"
probe 'docker exec maia-sovereign printenv MAIA_TEXT_PROVIDER MAIA_INFERENCE_MODE OLLAMA_BASE_URL OLLAMA_MODEL MYTHIC_ATLAS_URL 2>&1 || true'

# ── 3. Cognition tier distribution ───────────────────────────────────────────
# Decides how much the DEEP-tier memory loss (D8) actually costs members. If
# DEEP is ~0% of real turns, D8 is a correctness defect but not a lived one —
# and that changes P3's priority, not its verdict.
hdr "3. TIER DISTRIBUTION (7d)"
probe "$PSQL -c \"SELECT origin_route, processing_profile, count(*) FROM agent_runs WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1,2 ORDER BY 3 DESC;\""

# ── 4. Relational observation write liveness (census row 22 / finding D16) ───
# The write path swallows errors via .catch(). Rows present = writes landing.
hdr "4. RELATIONAL SIGNAL WRITE LIVENESS"
probe "$PSQL -c \"SELECT count(*) AS rows, max(created_at) AS newest FROM member_relational_signals;\""

# ── 5. Memory transition records (census row 23) ─────────────────────────────
hdr "5. MEMORY TRANSITION RECORDS"
probe "$PSQL -c \"SELECT to_regclass('public.memory_transition_records') AS table_exists;\""
probe "$PSQL -c \"SELECT count(*) AS rows, max(created_at) AS newest FROM memory_transition_records;\""

# ── 6. The two unmigrated stores (findings D10 / D11) ────────────────────────
# EXISTENCE ONLY. Do not create either. The result feeds the P1 adjudication
# ladder in the Phase 8 packet plan; it does not authorize a migration or a
# deletion.
hdr "6. UNMIGRATED STORES — EXISTENCE CHECK ONLY"
probe "$PSQL -c \"SELECT 'semantic_memory_vectors' AS store, to_regclass('public.semantic_memory_vectors') AS exists_in_db;\""
probe "$PSQL -c \"SELECT 'lattice_nodes' AS store, to_regclass('public.lattice_nodes') AS exists_in_db;\""

# ── 7. Memory health truthfulness (finding D1) ───────────────────────────────
# The acceptance test for P1 is that a failed dependency reports as failed.
# Today it reports 'empty', indistinguishable from a member with no history.
hdr "7. MEMORY HEALTH + LAYER MARKERS (1h)"
probe 'docker logs maia-sovereign --since 1h 2>&1 | grep -oE "memoryHealth[^}]*}" | tail -20'
probe 'docker logs maia-sovereign --since 1h 2>&1 | grep -cE "conversational-block|episodic-block|atoms loaded|developmental-block" || echo 0'

# ── 8. Corpus Callosum emission by tier ──────────────────────────────────────
hdr "8. CORPUS CALLOSUM EMISSION (24h)"
probe "$PSQL -c \"SELECT processing_profile, count(*) FROM agent_runs WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY 1 ORDER BY 2 DESC;\""

cat <<'NOTE'

═══ RECORDING DISCIPLINE ═══
Write results into the census §6 table. A probe that failed to run is UNKNOWN,
not zero and not absent. Do not infer a value the probe did not return.

This lane has no repair authority. Findings feed the P1 adjudication; they do
not authorize a fix, a migration, or a deletion.
NOTE
