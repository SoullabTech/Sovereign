#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# DESKTOP-SOVEREIGN-TTS-01 — Kokoro substrate probe
# ═══════════════════════════════════════════════════════════════════════════════
# Six probes, run BEFORE any application code is touched. They answer one
# question and no other: does the witness stack actually present MAIA with the
# sovereign voice substrate?
#
#   1. Kokoro container healthy
#   2. MAIA sees MAIA_LOCAL_VOICE_ENABLED=1
#   3. MAIA sees MAIA_TTS_PROVIDER=kokoro
#   4. KOKORO_TTS_URL resolves internally
#   5. Direct /v1/audio/speech probe produces non-empty audio
#   6. No OpenAI key and no MAIA_ALLOW_CLOUD_VOICE
#
# ⛔ WHAT A FULL PASS DOES NOT PROVE. Six green probes are SUBSTRATE evidence.
#    They say the sovereign path is present and can produce audio bytes. They say
#    nothing about whether Kelly hears MAIA. Audible speech on the Desktop device
#    is a separate leg, and UNWITNESSED is not a pass.
#
# Probes 4 and 5 run from INSIDE the MAIA container, over the real service name,
# because a probe from the host proves the host can reach Kokoro — which is not
# the claim. The claim is that MAIA can.
#
# Containers are resolved by compose LABEL, not by `docker compose ps`, so the
# probe needs no -f chain and no COMPOSE_FILE — which matters here because the
# witness chain lives partly in /tmp.
#
# Usage:
#   scripts/witness/kokoro-substrate-probe.sh -p witness-<id>
#   scripts/witness/kokoro-substrate-probe.sh -p <p> -m <maia-svc> -k <kokoro-svc>
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

PROJECT=""
MAIA_SVC="maia"
KOKORO_SVC="kokoro-tts"

while getopts "p:m:k:h" opt; do
  case "$opt" in
    p) PROJECT="$OPTARG" ;;
    m) MAIA_SVC="$OPTARG" ;;
    k) KOKORO_SVC="$OPTARG" ;;
    h) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "usage: $0 -p <project> [-m maia-svc] [-k kokoro-svc]" >&2; exit 2 ;;
  esac
done

if [[ -z "$PROJECT" ]]; then
  echo "FATAL: -p <witness-compose-project> is required." >&2
  echo "       The probe must name the stack it is interrogating. Guessing which" >&2
  echo "       containers to read is how a witness ends up describing production." >&2
  exit 2
fi

PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); printf '  \033[31mFAIL\033[0m  %s\n' "$1"; }
note() { printf '        %s\n' "$1"; }

echo
echo "DESKTOP-SOVEREIGN-TTS-01 — Kokoro substrate probe"
echo "project: $PROJECT   maia: $MAIA_SVC   kokoro: $KOKORO_SVC"
echo "─────────────────────────────────────────────────────────────────────"

# ── Production guard, BEFORE resolution ───────────────────────────────────────
# `maia-sovereign` is the production compose project on this daemon. A probe
# that reads it would produce a confident PASS describing the wrong stack.
if [[ "$PROJECT" == "maia-sovereign" ]]; then
  echo "FATAL: '$PROJECT' is the production project." >&2
  echo "       This probe is witness-only and must never read production." >&2
  exit 2
fi

# ── Container resolution, by compose LABEL ────────────────────────────────────
# Deliberately NOT `docker compose -p ... ps`: that form needs the project's full
# -f chain (or COMPOSE_FILE) to resolve, and the witness chain lives partly in
# /tmp. Every compose-managed container already carries its project and service
# as labels, so the running stack can answer for itself without being told how it
# was assembled. This is also the more truthful reading — it reports what IS
# running, not what a set of files says should be.
compose_id() {
  docker ps -q \
    --filter "label=com.docker.compose.project=$PROJECT" \
    --filter "label=com.docker.compose.service=$1" | head -1
}

MAIA_ID="$(compose_id "$MAIA_SVC")"
KOKORO_ID="$(compose_id "$KOKORO_SVC")"

if [[ -z "$MAIA_ID" || -z "$KOKORO_ID" ]]; then
  echo "FATAL: could not resolve both services in project '$PROJECT'." >&2
  echo "       maia=${MAIA_ID:-<none>}  kokoro=${KOKORO_ID:-<none>}" >&2
  echo >&2
  echo "       Projects and services currently running:" >&2
  docker ps --format '{{.Label "com.docker.compose.project"}}\t{{.Label "com.docker.compose.service"}}\t{{.Names}}' \
    | grep -v '^\s' | sort | sed 's/^/         /' >&2
  echo >&2
  echo "       If kokoro-tts is absent, bring it up with the overlay appended LAST:" >&2
  echo "         docker compose -p $PROJECT <the witness -f chain> \\" >&2
  echo "           -f docker-compose.witness-kokoro.yml up -d kokoro-tts maia" >&2
  exit 2
fi

# A container literally named maia-sovereign / maia-kokoro-tts is production's:
# container names are unique per daemon. Belt as well as braces.
for id in "$MAIA_ID" "$KOKORO_ID"; do
  name="$(docker inspect -f '{{.Name}}' "$id" | sed 's#^/##')"
  case "$name" in
    maia-sovereign|maia-kokoro-tts)
      echo "FATAL: resolved PRODUCTION container '$name'." >&2
      echo "       This probe is witness-only and must never read production." >&2
      exit 2 ;;
  esac
done

MAIA_NAME="$(docker inspect -f '{{.Name}}' "$MAIA_ID" | sed 's#^/##')"
KOKORO_NAME="$(docker inspect -f '{{.Name}}' "$KOKORO_ID" | sed 's#^/##')"
note "maia   → $MAIA_NAME"
note "kokoro → $KOKORO_NAME"
echo

# Read an env var as the CONTAINER sees it, not as compose intended it.
# `docker inspect` shows the declared config; `printenv` shows the process view.
# The Desktop witness failure was a gap between those two, so read the process.
maia_env() { docker exec "$MAIA_ID" printenv "$1" 2>/dev/null; }

# ── Probe 1 — Kokoro container healthy ────────────────────────────────────────
echo "1. Kokoro container healthy"
K_STATUS="$(docker inspect -f '{{.State.Status}}' "$KOKORO_ID" 2>/dev/null)"
K_HEALTH="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}<none>{{end}}' "$KOKORO_ID" 2>/dev/null)"
if [[ "$K_STATUS" == "running" && "$K_HEALTH" == "healthy" ]]; then
  ok "kokoro running + healthcheck healthy"
else
  bad "kokoro status=$K_STATUS health=$K_HEALTH (want running/healthy)"
  note "healthcheck start_period is 60s — a 'starting' result may just be early"
fi
echo

# ── Probe 2 — MAIA sees MAIA_LOCAL_VOICE_ENABLED=1 ────────────────────────────
echo "2. MAIA sees MAIA_LOCAL_VOICE_ENABLED=1"
LVE="$(maia_env MAIA_LOCAL_VOICE_ENABLED)"
if [[ "$LVE" == "1" ]]; then
  ok "MAIA_LOCAL_VOICE_ENABLED=1"
else
  bad "MAIA_LOCAL_VOICE_ENABLED=${LVE:-<unset>} (want exactly \"1\")"
  note "ttsRouter.ts:143 tests === '1'. \"true\" and \"yes\" are false here."
  note "This alone sends an 'auto' provider to openai_primary — the witness error."
fi
echo

# ── Probe 3 — MAIA sees MAIA_TTS_PROVIDER=kokoro ──────────────────────────────
echo "3. MAIA sees MAIA_TTS_PROVIDER=kokoro"
PROV="$(maia_env MAIA_TTS_PROVIDER)"
if [[ "$PROV" == "kokoro" ]]; then
  ok "MAIA_TTS_PROVIDER=kokoro"
else
  bad "MAIA_TTS_PROVIDER=${PROV:-<unset>} (want \"kokoro\")"
  note "ttsRouter.ts:185 — explicit 'kokoro' makes primary kokoro unconditionally,"
  note "so the sovereign path does not depend on 'auto' resolving as hoped."
fi
echo

# ── Probe 4 — KOKORO_TTS_URL resolves internally ──────────────────────────────
echo "4. KOKORO_TTS_URL resolves from inside MAIA"
KURL="$(maia_env KOKORO_TTS_URL)"
if [[ -z "$KURL" ]]; then
  bad "KOKORO_TTS_URL unset"
  note "kokoro.ts:19 would fall back to http://localhost:8880 — inside the MAIA"
  note "container that is MAIA itself, which fails in a confusing way."
else
  RESOLVE="$(docker exec "$MAIA_ID" node -e '
    const u = new URL(process.env.KOKORO_TTS_URL);
    require("dns").lookup(u.hostname, (e, addr) => {
      if (e) { console.log("ERR " + e.code); process.exit(0); }
      console.log("OK " + addr + " " + (u.port || "80"));
    });
  ' 2>&1 | tail -1)"
  case "$RESOLVE" in
    OK\ *) ok "$KURL → ${RESOLVE#OK }" ;;
    *)     bad "$KURL did not resolve ($RESOLVE)"
           note "service name resolves only if both containers share a network" ;;
  esac
fi
echo

# ── Probe 5 — direct /v1/audio/speech produces non-empty audio ────────────────
# Run over the real URL from the real caller. Assert BYTES and FORMAT, not
# HTTP 200: a 200 carrying an empty or JSON body is not audio, and "the endpoint
# answered" is not the claim being made.
echo "5. /v1/audio/speech produces non-empty audio (MAIA → Kokoro)"
if [[ -z "$KURL" ]]; then
  bad "skipped — KOKORO_TTS_URL unset"
else
  SPEECH="$(docker exec "$MAIA_ID" node -e '
    (async () => {
      const url = process.env.KOKORO_TTS_URL + "/v1/audio/speech";
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: "Sovereign substrate probe.",
            voice: "af_kore", model: "kokoro", response_format: "mp3", speed: 1.0,
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (!r.ok) { console.log("HTTP " + r.status); return; }
        const b = Buffer.from(await r.arrayBuffer());
        const mp3 = b.length > 2 && (b[0] === 0xff || b.subarray(0,3).toString() === "ID3");
        console.log("BYTES " + b.length + " " + (mp3 ? "mp3" : "not-mp3:" + b.subarray(0,16).toString("hex")));
      } catch (e) { console.log("ERR " + (e.message || e)); }
    })();
  ' 2>&1 | tail -1)"
  case "$SPEECH" in
    BYTES\ *\ mp3)
      BYTES="$(echo "$SPEECH" | awk '{print $2}')"
      if [[ "$BYTES" -gt 1024 ]]; then
        ok "non-empty mp3, ${BYTES} bytes, af_kore"
      else
        bad "mp3 header but only ${BYTES} bytes — too small to be speech"
      fi ;;
    BYTES\ *) bad "response was not mp3 — $SPEECH" ;;
    *)        bad "$SPEECH" ;;
  esac
fi
echo

# ── Probe 6 — no cloud voice permission, no OpenAI key ────────────────────────
# Both must be ABSENT. If either is present, a downstream audible PASS cannot be
# attributed to sovereign synthesis, because a cloud path was available to serve
# it. This probe protects the meaning of every other probe.
echo "6. No OpenAI key, no MAIA_ALLOW_CLOUD_VOICE"
ACV="$(maia_env MAIA_ALLOW_CLOUD_VOICE)"
OAK="$(maia_env OPENAI_API_KEY)"
CLEAN=1
if [[ -n "$ACV" ]]; then
  CLEAN=0
  bad "MAIA_ALLOW_CLOUD_VOICE=$ACV is set (want ABSENT)"
  note "cloudVoicePolicy.ts treats absent and \"0\" alike, but the canon is that"
  note "the sovereign default needs no keeper. Setting it at all is a signal."
fi
if [[ -n "$OAK" ]]; then
  CLEAN=0
  bad "OPENAI_API_KEY present (${#OAK} chars) — want ABSENT in the witness"
  note "likely injected by an env_file. A cloud key present means an audible PASS"
  note "cannot be attributed to Kokoro with certainty."
fi
[[ "$CLEAN" == "1" ]] && ok "no cloud voice permission, no OpenAI key"
echo

# ── Verdict ───────────────────────────────────────────────────────────────────
echo "─────────────────────────────────────────────────────────────────────"
printf '%d passed · %d failed\n' "$PASS" "$FAIL"
echo
if [[ "$FAIL" -eq 0 ]]; then
  cat <<'EOF'
SUBSTRATE PASS — evidence class SUBSTRATE/SOURCE.

  The sovereign voice path is present in the witness stack and Kokoro produces
  audio bytes when MAIA asks it to.

⛔ This is NOT the acceptance criterion. The lane closes when Kelly audibly hears
   MAIA speak on the Desktop device. Take the one device witness now:

     member speaks → Faster-Whisper → local Ollama → Kokoro → audible MAIA

   If Kokoro generates valid audio here but Desktop stays silent, STOP.
   The next boundary is PLAYBACK, not synthesis, and it is a different unit.
EOF
  exit 0
else
  cat <<'EOF'
SUBSTRATE FAIL — do not touch application code yet.

  A failing probe here means the Desktop witness was measuring an environment,
  not a defect in the TTS path. Repair the substrate and re-run before any code
  is read as broken.
EOF
  exit 1
fi
