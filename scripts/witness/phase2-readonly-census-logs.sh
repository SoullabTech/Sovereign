#!/usr/bin/env bash
# Phase 2 read-only production census — LOG-MARKER items (C1 C2 C5 C7 C9 C11 C14 C15 C18).
#
# Authority: docs/programme/PHASE2_READONLY_CENSUS_SPEC_2026-09-06.md (founder, RUN AUTHORIZED
# 2026-09-06 for C1–C18). DB items: scripts/witness/phase2-readonly-census.sql.
#
# BINDING TERMS (founder, verbatim):
#   READ ONLY
#   no schema mutation
#   no product mutation
#   no production writes
#   exact production SHA recorded
#   query / log window recorded
#   counts and distributions preferred over member content
#   no claim beyond what the instrument actually observes
#
# WHAT THIS SCRIPT DOES
#   docker logs maia-sovereign --since <window>  →  grep -c / sort | uniq -c on exact marker
#   strings. Every marker was verified against the source tree; the file:line of the
#   console.* call is cited beside each grep. Nothing is written to production: no docker
#   exec into postgres, no compose action, no file inside any container. The only file
#   touched is a mode-0600 scratch capture of the log stream under $TMPDIR on the host,
#   removed on exit (set CENSUS_LOG_FILE=<path> to reuse an existing capture instead).
#   Only counts and marker fragments are printed — never a full log line, never member text.
#
# WHAT IT CANNOT OBSERVE (stated, not worked around)
#   C1  any "voiceEnabled: true" consumer log — no such server-side marker exists.
#   C2  same-turn pairing — the two lines carry no shared turn id (route.ts:534 / :1746).
#   C14 the Active Patterns block has no render marker (MemberLiveContext.ts:505-512).
#   C18 the marker is a browser console.warn (components/OracleConversation.tsx:6735) —
#       it never reaches container logs.
#   Log retention: the json-file driver rotates; the EARLIEST timestamp actually present is
#   printed so the observed window is recorded as it is, not as it was requested.
#
# Run (on minisforum, as the docker-capable user):
#   bash scripts/witness/phase2-readonly-census-logs.sh
# Optional: CENSUS_SINCE=2026-08-13T00:00:00Z (default; census baseline date)
#           CENSUS_C1_SINCE=2026-08-31T00:00:00Z (spec C1 window)
#           CENSUS_C7_DAYS=30 (spec C7 window)
# Record the output verbatim in docs/programme/MAIA_WHOLE_ORGANISM_MAP/CENSUS_RESULTS_<date>.md.

set -uo pipefail   # deliberately no -e: grep -c exits 1 on zero matches, and zero is a finding

CONTAINER="${CENSUS_CONTAINER:-maia-sovereign}"
SINCE="${CENSUS_SINCE:-2026-08-13T00:00:00Z}"
C1_SINCE="${CENSUS_C1_SINCE:-2026-08-31T00:00:00Z}"
C7_DAYS="${CENSUS_C7_DAYS:-30}"
C7_SINCE="$(date -u -d "${C7_DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"${C7_DAYS}"d +%Y-%m-%dT%H:%M:%SZ)"

hr()  { printf '\n════════════════════════════════════════════════════════════════\n'; }
hdr() { hr; printf ' %s\n' "$@"; hr; }
# count of lines containing a fixed string
cnt() { grep -F -c -- "$1" "$2" || true; }
# lines in a capture at or after an RFC3339 timestamp (capture is `docker logs -t`, ts is field 1)
since_ts() { awk -v s="$1" '$1 >= s' "$2"; }

hdr 'PHASE 2 READ-ONLY CENSUS — LOG ITEMS' \
    'READ ONLY · no schema mutation · no product mutation · no production writes'

echo
echo "observed_at        : $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "host               : $(hostname)"
echo "operator           : ${USER:-unknown}"
printf 'production_sha     : '
docker exec "$CONTAINER" printenv GIT_COMMIT 2>/dev/null || echo 'UNAVAILABLE (record the reason)'
printf 'deploy_lane        : '
docker exec "$CONTAINER" printenv DEPLOY_LANE 2>/dev/null || echo '(not set — pre-tripwire image)'
printf 'container_created  : '
docker inspect "$CONTAINER" --format '{{.Created}}' 2>/dev/null || echo 'UNAVAILABLE'
echo "requested_window   : since ${SINCE} (C1 since ${C1_SINCE}; C7 since ${C7_SINCE} = last ${C7_DAYS} days)"

# ── one capture, mode 0600, removed on exit ────────────────────────────────
if [[ -n "${CENSUS_LOG_FILE:-}" ]]; then
  LOG="$CENSUS_LOG_FILE"
  echo "capture            : reusing ${LOG} (not re-pulled)"
else
  umask 077
  LOG="$(mktemp -t phase2-census-logs.XXXXXX)"
  trap 'rm -f "$LOG"' EXIT
  # -t prefixes each line with an RFC3339 timestamp (field 1) so narrower windows can be
  # applied without re-pulling. stderr is merged because Next.js console.* goes to both.
  docker logs -t --since "$SINCE" "$CONTAINER" > "$LOG" 2>&1
  echo "capture            : ${LOG} (scratch, 0600, deleted on exit)"
fi
echo "lines_captured     : $(wc -l < "$LOG")"
echo "earliest_line_ts   : $(head -n1 "$LOG" | awk '{print $1}')   ← observed window START (retention-bound)"
echo "latest_line_ts     : $(tail -n1 "$LOG" | awk '{print $1}')"

# ══════════════════════════════════════════════════════════════════════════
hdr 'C1  OpenAI TTS egress on canonical path  (A1 / X6)' \
    "    window: since ${C1_SINCE}" \
    '    counts: [openai-tts:*] by outcome vs [tts.resolve]/[tts.attempt] provider' \
    '    rule: extent only; does not decide permissibility'
C1LOG="$(mktemp -t phase2-census-c1.XXXXXX)"; trap 'rm -f "$LOG" "$C1LOG"' EXIT
since_ts "$C1_SINCE" "$LOG" > "$C1LOG"
echo
echo "[openai-tts:*] total lines                         : $(cnt '[openai-tts:' "$C1LOG")"
echo "  NOTE: the prefix names the ROUTE (app/api/voice/openai-tts/route.ts), not the provider —"
echo "        the route also serves Kokoro. Classify by outcome fragment:"
# app/api/voice/openai-tts/route.ts:134  `→ OpenAI ${voice} (skipping Kokoro)`   (archetype → cloud)
# app/api/voice/openai-tts/route.ts:155  `ARCHETYPE provider=openai`
# app/api/voice/openai-tts/route.ts:308  `FALLBACK model=`                          (local failed → cloud)
# app/api/voice/openai-tts/route.ts:323  `ok model=`                                (cloud synthesis completed)
# app/api/voice/openai-tts/route.ts:293  `Local TTS failed, falling through to OpenAI`
# app/api/voice/openai-tts/route.ts:192  `→ Kokoro ${voice}`                        (local)
# app/api/voice/openai-tts/route.ts:209  `LOCAL provider=`                          (local synthesis completed)
# app/api/voice/openai-tts/route.ts:77   `Usage blocked:`
echo "  OPENAI  → OpenAI (skipping Kokoro)                 : $(cnt '→ OpenAI' "$C1LOG")"
echo "  OPENAI  ARCHETYPE provider=openai                  : $(cnt 'ARCHETYPE provider=openai' "$C1LOG")"
echo "  OPENAI  FALLBACK model=  (local failed → cloud)    : $(cnt '] FALLBACK model=' "$C1LOG")"
echo "  OPENAI  ok model=  (cloud synthesis completed)     : $(cnt '] ok model=' "$C1LOG")"
echo "  OPENAI  Local TTS failed, falling through          : $(cnt 'Local TTS failed, falling through to OpenAI' "$C1LOG")"
echo "  LOCAL   → Kokoro                                   : $(cnt '→ Kokoro' "$C1LOG")"
echo "  LOCAL   LOCAL provider=  (local synthesis done)    : $(cnt '] LOCAL provider=' "$C1LOG")"
echo "  BLOCKED Usage blocked                              : $(cnt '] Usage blocked:' "$C1LOG")"
echo "  FAIL    status=                                    : $(cnt '] FAIL status=' "$C1LOG")"
echo
# lib/tts/ttsRouter.ts:108 console.info('[tts.resolve]', JSON) — payload keys: path, stage, provider|resolvedProvider
# app/api/voice/stream-conversation/route.ts:190 — payload keys: path, ttsProviderPref, localEnabled
# app/api/voice/preview/route.ts:97
echo "[tts.resolve] total lines                          : $(cnt '[tts.resolve]' "$C1LOG")"
echo "  by path × stage × provider/resolvedProvider (JSON fragments only):"
grep -F -- '[tts.resolve]' "$C1LOG" \
  | grep -oE '"path":"[^"]*"|"stage":"[^"]*"|"provider":"[^"]*"|"resolvedProvider":"[^"]*"|"ttsProviderPref":"[^"]*"|"localEnabled":(true|false)' \
  | sort | uniq -c | sort -rn | sed 's/^/    /'
echo
# app/api/voice/stream-conversation/route.ts:201 and app/api/voice/preview/route.ts:110-171 — {provider, reason}
echo "[tts.attempt] total lines                          : $(cnt '[tts.attempt]' "$C1LOG")"
echo "  by provider × reason:"
grep -F -- '[tts.attempt]' "$C1LOG" \
  | grep -oE '"provider":"[^"]*"|"reason":"[^"]*"' \
  | sort | uniq -c | sort -rn | sed 's/^/    /'
echo
echo "voiceEnabled: true consumer log                    : NOT RUNNABLE — no server-side console marker"
echo "  (grep of lib/ app/ for a console.* line carrying 'voiceEnabled: true' found none)."

# ══════════════════════════════════════════════════════════════════════════
hdr 'C2  Ephemeral-requested turns that still wrote  (A2 / X4)' \
    "    window: since ${SINCE}" \
    '    counts: requestedMode="ephemeral" vs [Sovereign/Writeback] Memory formed' \
    '    rule: any nonzero = breach extent'
echo
# app/api/sovereign/app/maia/list/route.ts:534  `🧠 [Route/MemoryDebug] requestedMode="${requestedMode}" resolvedMode="${memoryMode}"`
echo "[Route/MemoryDebug] requestedMode lines total       : $(cnt '[Route/MemoryDebug] requestedMode=' "$LOG")"
echo "  requestedMode × resolvedMode distribution:"
grep -F -- '[Route/MemoryDebug] requestedMode=' "$LOG" \
  | grep -oE 'requestedMode="[^"]*" resolvedMode="[^"]*"' \
  | sort | uniq -c | sort -rn | sed 's/^/    /'
# app/api/sovereign/app/maia/list/route.ts:524  `... sanctuary=${isSanctuary} ...`
echo "  [Route/MemoryDebug] sanctuary=true lines           : $(cnt 'sanctuary=true' "$LOG")"
echo
# app/api/sovereign/app/maia/list/route.ts:1746  `✅ [Sovereign/Writeback] Memory formed: ${id} (significance threshold met)`
# app/api/sovereign/app/maia/list/route.ts:1748  `📝 [Sovereign/Writeback] Skipped: ${reason}`
echo "[Sovereign/Writeback] Memory formed                : $(cnt '[Sovereign/Writeback] Memory formed' "$LOG")"
echo "[Sovereign/Writeback] Skipped                      : $(cnt '[Sovereign/Writeback] Skipped' "$LOG")"
echo "  Skipped reasons:"
grep -F -- '[Sovereign/Writeback] Skipped:' "$LOG" | sed -E 's/.*Skipped: //' | sort | uniq -c | sort -rn | sed 's/^/    /'
echo
# lib/consciousness/maiaOrchestrator.ts:437  '📦 [MemoryBundle] Skipped - ephemeral mode'   (READ side honours ephemeral)
# lib/consciousness/maiaOrchestrator.ts:411  '🛡️ [MemoryBundle] Skipped - Sanctuary mode (no cross-session recall)'
echo "[MemoryBundle] Skipped - ephemeral mode (read side): $(cnt '[MemoryBundle] Skipped - ephemeral mode' "$LOG")"
echo "[MemoryBundle] Skipped - Sanctuary mode (read side): $(cnt '[MemoryBundle] Skipped - Sanctuary mode' "$LOG")"
echo
echo "Per-day tallies (co-occurrence is NOT pairing — the lines share no turn id; the writeback"
echo "gate at route.ts:1731 tests !isSanctuary only, not memoryMode — code-read, stated as such):"
printf '    %-12s %8s %8s\n' day ephemeral formed
join -a1 -a2 -e0 -o '0,1.2,2.2' \
  <(grep -F -- 'requestedMode="ephemeral"' "$LOG" | awk '{print substr($1,1,10)}' | sort | uniq -c | awk '{print $2, $1}') \
  <(grep -F -- '[Sovereign/Writeback] Memory formed' "$LOG" | awk '{print substr($1,1,10)}' | sort | uniq -c | awk '{print $2, $1}') \
  | awk '{printf "    %-12s %8s %8s\n", $1, $2, $3}'

# ══════════════════════════════════════════════════════════════════════════
hdr 'C5  Cognitive-profile calibration lines  (A5 / X1a, rank 3) — RUN EARLY' \
    "    window: since ${SINCE}" \
    '    counts: [Router] UP-REGULATED / DOWN-REGULATED by direction and reason' \
    '    rule: ≈0 → X1a/X1b calibration inert, downgrade (DB coverage half is in the SQL script §C5)'
echo
# lib/consciousness/processingProfiles.ts:243  `🧠 [Router] DOWN-REGULATED DEEP→CORE (low cognitive altitude)`
# lib/consciousness/processingProfiles.ts:251  `🧠 [Router] DOWN-REGULATED DEEP→CORE (high ${bypassType} bypassing)`
# lib/consciousness/processingProfiles.ts:259  `🧠 [Router] UP-REGULATED FAST→CORE (high cognitive altitude + ascending)`
# lib/consciousness/processingProfiles.ts:267  `🧠 [Router] UP-REGULATED CORE→DEEP (field-safe + complex)`
echo "[Router] UP-REGULATED   total                      : $(cnt '[Router] UP-REGULATED' "$LOG")"
echo "[Router] DOWN-REGULATED total                      : $(cnt '[Router] DOWN-REGULATED' "$LOG")"
echo "  by variant:"
grep -E '\[Router\] (UP|DOWN)-REGULATED' "$LOG" | sed -E 's/.*\[Router\] //' | sort | uniq -c | sort -rn | sed 's/^/    /'

# ══════════════════════════════════════════════════════════════════════════
hdr 'C7  WisdomRouter activation  (A6 / X9)' \
    "    window: since ${C7_SINCE} (last ${C7_DAYS} days)" \
    '    counts: Wisdom agent activated by tier × agentName × patternType'
echo
# lib/sovereign/maiaService.ts:1265  `🌟 [FAST] Wisdom agent activated: ${agentName} (${patternType})`
# lib/sovereign/maiaService.ts:1881  `🌟 [CORE] Wisdom agent activated: ...`
# lib/sovereign/maiaService.ts:2108  `🌟 [DEEP] Wisdom agent activated: ...`
since_ts "$C7_SINCE" "$LOG" > "$C1LOG"
echo "Wisdom agent activated  total                      : $(cnt 'Wisdom agent activated:' "$C1LOG")"
echo "  by tier:"
grep -oE '\[(FAST|CORE|DEEP)\] Wisdom agent activated:' "$C1LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "  by tier × agentName (patternType):"
grep -oE '\[(FAST|CORE|DEEP)\] Wisdom agent activated: [^(]+\([^)]*\)' "$C1LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'

# ══════════════════════════════════════════════════════════════════════════
hdr 'C9  FAST share of turns  (rank 7 / X12)' \
    "    window: since ${SINCE}" \
    '    counts: router profile counts by tier'
echo
# lib/sovereign/maiaService.ts:3098  `🚦 Processing Profile: ${processingProfile} | Turn ${turnCount} | Length: ${input.length}`
# lib/sovereign/maiaService.ts:3907  `✅ MAIA ${processingProfile} response complete: ${ms}ms | ${chars} chars`
echo "Processing Profile: lines total                     : $(cnt 'Processing Profile:' "$LOG")"
echo "  by profile (selected at turn start):"
grep -oE 'Processing Profile: [A-Z]+' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "  by profile (response complete):"
grep -oE 'MAIA (FAST|CORE|DEEP|BETWEEN|[A-Z]+) response complete' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'

# ══════════════════════════════════════════════════════════════════════════
hdr 'C11 Bloom scaffolding lines  (X1a, X8)' \
    "    window: since ${SINCE}" \
    '    counts: [Dialectical Scaffold] by sub-marker (Atlas / default-facet halves are in the SQL script §C11)'
echo
# lib/consciousness/cognitiveEventsService.ts:108   `🧠 [Dialectical Scaffold] Cognitive turn logged: Level ${n} (${label})`
# lib/consciousness/cognitiveProfileService.ts:126  `🧠 [Dialectical Scaffold] CognitiveProfile for ${id8} | current=.. avg=.. stability=..`
# lib/consciousness/cognitiveProfileService.ts:136  `❌ [Dialectical Scaffold] Failed to build cognitive profile:`
# lib/consciousness/bloomCognition.ts:331           `[Dialectical Scaffold] Detection error:`
echo "[Dialectical Scaffold] total                       : $(cnt '[Dialectical Scaffold]' "$LOG")"
echo "  Cognitive turn logged                            : $(cnt '[Dialectical Scaffold] Cognitive turn logged' "$LOG")"
echo "    by Level:"
grep -oE 'Cognitive turn logged: Level [0-9]+ \([^)]*\)' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/      /'
echo "  CognitiveProfile built                           : $(cnt '[Dialectical Scaffold] CognitiveProfile for' "$LOG")"
echo "    stability distribution:"
grep -oE 'stability=[a-z]+' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/      /'
echo "  Failed to build cognitive profile                : $(cnt 'Failed to build cognitive profile' "$LOG")"
echo "  Detection error                                  : $(cnt '[Dialectical Scaffold] Detection error' "$LOG")"
echo "  NOTE: no marker records that a scaffold PROMPT was applied to a response; the DB column"
echo "        cognitive_turn_events.scaffolding_used (SQL §11.a) is the nearest observable."

# ══════════════════════════════════════════════════════════════════════════
hdr 'C14 Active Patterns block render marker  (X3, rank 5)' \
    '    rule: 0 rows → block latent (row counts are in the SQL script §C14)'
echo
echo "NOT RUNNABLE — lib/memory/MemberLiveContext.ts:505-512 assembles the"
echo "'Active Patterns (recurring structures in their life)' block with no console marker; no other"
echo "console.* line names pattern_ledger / member_patterns / the block. Whether the block ever"
echo "renders is not observable from logs at the production SHA above. Not worked around."

# ══════════════════════════════════════════════════════════════════════════
hdr 'C15 Decay reaching the prompt — log side  (rank 5 / TM F2)' \
    "    window: since ${SINCE}" \
    '    counts: [MemoryBundle] Built bullet-count distribution (selectionTrace itself is never logged)'
echo
# lib/memory/MemoryBundle.ts:182  `📦 [MemoryBundle] Built: ${n} bullets, ${m} recent turns (${k} cross-session)`
# lib/memory/MemoryBundle.ts:284  `[MemoryBundle] Non-vector retrieval: ${n} memories`
# lib/memory/MemoryBundle.ts:301  '[MemoryBundle] No embedding generated, returning empty'
echo "[MemoryBundle] Built lines                         : $(cnt '[MemoryBundle] Built:' "$LOG")"
echo "  bullets distribution:"
grep -oE 'Built: [0-9]+ bullets' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "  cross-session distribution:"
grep -oE '\([0-9]+ cross-session\)' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "[MemoryBundle] Non-vector retrieval lines          : $(cnt '[MemoryBundle] Non-vector retrieval:' "$LOG")"
echo "  memories-retrieved distribution (the pre-cut pool; >12 means the top-12 cut applied):"
grep -oE 'Non-vector retrieval: [0-9]+ memories' "$LOG" | sort | uniq -c | sort -rn | sed 's/^/    /'
echo "[MemoryBundle] No embedding generated              : $(cnt '[MemoryBundle] No embedding generated' "$LOG")"
echo
echo "Rendered bullets for the two F2 members: NOT RUNNABLE — selectionTrace is in-process only"
echo "(MemoryBundle.ts:164-188); emitting it is a code change and is not authorized in this census."

# ══════════════════════════════════════════════════════════════════════════
hdr 'C18 Voice feedback-prevention rejects  (05 V4)'
echo
# components/OracleConversation.tsx:6735  console.warn('🔇 [Voice Feedback Prevention] Rejecting transcript - MAIA is speaking:', ...)
echo "NOT RUNNABLE from container logs — the marker is a browser-side console.warn in a client"
echo "component (components/OracleConversation.tsx:6735; 143 React hooks in that file). It never"
echo "reaches docker logs. Server-side confirmation of absence (expected 0):"
echo "  [Voice Feedback Prevention] in container logs      : $(cnt '[Voice Feedback Prevention]' "$LOG")"

hr
echo 'Done. Read-only; scratch capture removed on exit; scope C1–C18 log items.'
