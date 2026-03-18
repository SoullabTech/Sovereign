# MAIA Voice Latency Audit
## M4 Mac Studio vs MinisForum Linux — Comparison Plan
**Date**: 2026-03-14
**Branch**: `claude/elastic-villani`
**Status**: Internal — engineering

---

## 1. Architecture Summary: Voice Turn Path

A complete voice turn has the following boundary sequence. Each boundary is now instrumented.

```
iPhone Safari PWA
  │
  ├─ [voice:silence_detected]     ContinuousConversation.tsx
  │   User stops speaking, silence threshold (8s) fires
  │
  ├─ [voice:transcript_submitted] ContinuousConversation.tsx
  │   onTranscript() called — control passes to OracleConversation
  │
  ├─ [voice:turn_start]           useStreamingVoice.ts
  │   turn ID minted, turnStart timestamp recorded
  │
  ├─ [voice:submission_fired]     useStreamingVoice.ts
  │   apiFetch() called to /api/voice/stream-conversation
  │   Header: x-voice-turn-id: <uuid>
  │
  │   ──── NETWORK ────
  │
  ├─ [voice] request_received +0ms   stream-conversation/route.ts
  │   Server receives request, timer starts
  │
  ├─ [voice] relational_decision      Server: governance gate (session + mode)
  ├─ [voice] wisdom_retrieved         Server: memory fetch (if member)
  ├─ [voice] threshold_checked        Server: fast-path check
  ├─ [voice] llm_starting             Server: LLM call begins (if not threshold)
  ├─ [voice] llm_first_chunk          Server: first token from Claude
  ├─ [voice:first_segment_fast_path]  Server: clause-level cut fired (words=N chars=N)
  ├─ [voice] text_0_emitted           Server: first speakable segment yielded (sentence OR clause)
  ├─ [voice] tts_0_requested          Server: TTS call started for first segment
  ├─ [voice] tts_0_done               Server: first audio chunk synthesized
  ├─ [voice] audio_0_emitted          Server: first audio SSE event emitted
  ├─ [voice] llm_done                 Server: LLM stream complete
  ├─ [voice] all_tts_done             Server: all TTS chunks synthesized
  │
  │   ──── NETWORK ────
  │
  ├─ [voice:response_received]    useStreamingVoice.ts
  │   First bytes of SSE stream received (connected event)
  │
  ├─ [voice:first_audio]          useStreamingVoice.ts
  │   First audio SSE event parsed and queued
  │
  ├─ [voice:playback_start]       useStreamingVoice.ts
  │   audio.play() resolved — user hears MAIA speaking
  │
  ├─ [voice:playback_end]         useStreamingVoice.ts
  │   Last audio chunk onended
  │
  ├─ [voice:mic_resume_requested] useStreamingVoice.ts
  │   maya-voice-end dispatched (500ms after last chunk ends)
  │
  └─ [voice:server_timing]        useStreamingVoice.ts
      Backend timing summary logged to browser console
      Format: host=<MAIA_HOST_ID> timing=request_received:0ms | relational_decision:2ms | ...
```

**Key latency metric**: `submission_fired` → `playback_start`

This is the gap the user feels as "MAIA's thinking time." Everything in between is the target of the audit.

---

## 2. Instrumented Files

| File | What was added |
|------|---------------|
| `lib/threshold/index.ts` | `createVoiceTimer()` now accepts `{ turnId, host }` — includes both in every `[voice]` log line |
| `app/api/voice/stream-conversation/route.ts` | Reads `x-voice-turn-id` header (or generates one); reads `MAIA_HOST_ID` env; passes both to timer; includes `turnId` and `host` in all `complete` SSE events |
| `hooks/useStreamingVoice.ts` | Generates `turnId` per turn; sends `x-voice-turn-id` header; logs `turn_start`, `submission_fired`, `response_received`, `first_audio`, `playback_start`, `playback_end`, `mic_resume_requested`, `server_timing` |
| `components/voice/ContinuousConversation.tsx` | Logs `silence_detected` and `transcript_submitted` |
| `docker-compose.production.yml` | Added `MAIA_HOST_ID: "minisforum"` to `maia` service |

---

## 3. Event Schema

All events share a consistent prefix: `[voice:EVENT_NAME:TURN_ID_SHORT]`

**Frontend events** (browser console):
```
[voice:turn_start:abc12345]          chars=47 ts=1710000000000
[voice:submission_fired:abc12345]    elapsed=0ms
[voice:response_received:abc12345]   elapsed=312ms
[voice:first_audio:abc12345]         elapsed=2840ms
[voice:playback_start:abc12345]      elapsed=2901ms
[voice:playback_end:abc12345]        elapsed=6200ms
[voice:mic_resume_requested:abc12345] elapsed=6700ms
[voice:server_timing:abc12345]       host=minisforum client_elapsed=6200ms request_received:0ms | relational_decision:12ms | wisdom_retrieved:340ms | threshold_checked:342ms | llm_starting:342ms | llm_first_chunk:1820ms | text_0_emitted:1820ms | tts_0_done:2510ms | audio_0_emitted:2511ms | llm_done:3100ms | all_tts_done:3890ms
```

**Frontend events without turn correlation** (ContinuousConversation):
```
[voice:silence_detected]    chars=47 threshold=8000ms ts=1710000000000
[voice:transcript_submitted] chars=47 ts=1710000000001
```

**Backend events** (server logs / Docker logs):
```
[voice] turn=abc12345 host=minisforum request_received +0ms
[voice] turn=abc12345 host=minisforum relational_decision +12ms
[voice] turn=abc12345 host=minisforum wisdom_retrieved +340ms
[voice] turn=abc12345 host=minisforum llm_first_chunk +1820ms
[voice] turn=abc12345 host=minisforum tts_0_done +2510ms
[voice] turn=abc12345 host=minisforum all_tts_done +3890ms
```

---

## 4. A/B Test Protocol: MinisForum vs M4

### Constraints — do not vary these between runs

| Constraint | Value |
|------------|-------|
| Device | Same iPhone |
| Browser | Safari PWA (not native app, not Chrome) |
| Network | Same WiFi connection for both hosts |
| Voice mode | Talk mode |
| Member account | Same logged-in member |
| Warm-up | 3 throw-away turns before recording begins |

If any of these vary, the comparison is invalid.

### Prompt set

Use exactly these prompts in this order for every host, every session. Do not vary wording.

**Short turns** (10 runs — likely threshold path or fast LLM, ~1 sentence response):
> "How are you today?"

**Medium turns** (10 runs — LLM path, 2–3 sentence response):
> "I've been feeling a bit disconnected from myself lately."

**Long reflective turns** (5 runs — deeper LLM path, 4+ sentences):
> "Can you help me understand why I keep repeating the same patterns in relationships?"

Total: 25 recorded turns per host. Run all short first, then medium, then long. Each turn: speak the prompt, wait for full playback to complete, record the `[voice:server_timing]` line, wait 5 seconds, next turn.

### Metrics to record per turn

From the `[voice:server_timing:*]` line in the browser console:

```
[voice:server_timing:abc12345] host=minisforum client_elapsed=2900ms
  request_received:0ms | relational_decision:12ms | wisdom_retrieved:340ms |
  llm_first_chunk:1820ms | tts_0_done:2510ms | all_tts_done:3890ms
```

Record these fields into a table or spreadsheet:

| Field | How to read |
|-------|-------------|
| `client_elapsed` | Total felt latency to last client event — primary metric |
| `wisdom_retrieved` mark | DB/memory fetch time — flags PostgreSQL or I/O issues |
| `llm_first_chunk` mark | Time from request start to first Claude token — flags network or model |
| `tts_0_done` mark | Time from request start to first audio chunk ready — flags TTS path |
| `all_tts_done` mark | Full server pipeline time |
| Gap: `playback_start - first_audio` | Browser audio decode + play() delay — flags iOS-side issues |

Also record, once per session (not per turn):
- `[voice:playback_start:*]` elapsed vs `[voice:first_audio:*]` elapsed — the gap is iOS audio decode latency

### Per-run recording format

```
host         prompt  client_elapsed  llm_first_chunk  tts_0_done  all_tts_done  anomaly?
────────────────────────────────────────────────────────────────────────────────────────
minisforum   short   2320ms          1650ms           2200ms      3400ms
minisforum   short   2280ms          1610ms           2190ms      3380ms
...
mac-studio   short   2100ms          1480ms           2040ms      3100ms
...
```

After 25 turns per host, compute median and p95 for each column separately. **Do not average — use median.** A single slow turn caused by model load spike will skew an average; the median is stable.

### Switching between hosts

**MinisForum** (current default in production):
- `MAIA_HOST_ID: "minisforum"` in `docker-compose.production.yml` (already set)
- URL: `https://soullab.life`

**M4 Mac Studio**:
- Set `MAIA_HOST_ID: "mac-studio"` in docker-compose, rebuild
- Run the stack on M4; expose it to the iPhone via one of:
  - Same-LAN IP (cleanest — no extra hops): `http://192.168.x.x:3000`
  - Tailscale (adds ~5–20ms but works from anywhere)
  - Caddy on M4 with self-signed cert (same HTTPS path as production)
- Record the host from `host=` in the server_timing log — this confirms which stack served the turn

### Decision thresholds

For a relational voice system, average latency is necessary but not sufficient. Jitter — inconsistency across turns — often matters more than raw average. A host with 2.5s median but occasional 6s turns feels broken even if the average is acceptable.

**Triggers for treating MinisForum as the cause of degradation** (any one is enough):

| Signal | Threshold |
|--------|-----------|
| Median `client_elapsed` worse on MinisForum | > 300ms delta |
| Median `llm_first_chunk` worse on MinisForum | > 250ms delta |
| p95 `client_elapsed` worse on MinisForum | > 600ms delta |
| p95 `llm_first_chunk` worse on MinisForum | > 500ms delta |
| `tts_0_done` significantly more variable (max/median > 2.5×) | Jitter in TTS path |
| More than 2 recovery events (`[voice:playback_end]` missing or timeout) in 25 turns | Stability, not just latency |

If MinisForum passes all of these: the issue is not the host. Investigate client-side audio handling and iOS-specific behaviour instead.

### What to do with the result

```
MinisForum clearly worse (any threshold above):
  → Route live voice back to M4 temporarily
  → Run 8.1–8.3 from the MinisForum to diagnose whether the cause
    is network path to Anthropic/OpenAI or host load

MinisForum within thresholds:
  → The server move is not the cause of perceived degradation
  → Investigate: client-side jitter, iOS audio session handling,
    gap between first_audio and playback_start (§10 below)

Both hosts degrade on long reflective turns:
  → This is a structural pipeline problem, not host-specific
  → This is the case for Phase 3 (OpenAI Realtime/WebRTC)
```

### 4.5 Stage-by-stage delay interpretation

Use this when you have `[voice:server_timing:*]` logs from both hosts and want to isolate which segment is responsible for a delta.

**`relational_decision` (in-process)**
- Expected: 5–20ms
- No external calls; pure JavaScript. If > 50ms on one host, Node.js is paused (GC, cold start, or CPU contention).

**`wisdom_retrieved` — compare across hosts**
- = PostgreSQL query time + memory assembly
- Similar on both hosts → database I/O is not host-specific
- Worse on MinisForum → check disk I/O via `docker stats` (Section 8.3)

**`llm_first_chunk` — compare with curl ttfb to api.anthropic.com**

Primary two-path rule:
- `llm_first_chunk` delta ≈ curl ttfb delta (within ~100ms) → **network path is the bottleneck**, not the server
- Similar curl ttfb but worse `llm_first_chunk` on MinisForum → **host load**: CPU pressure during prompt assembly, or Node.js pauses

**`tts_0_done` — compare with curl ttfb to api.openai.com**

Same logic:
- `tts_0_done` delta ≈ curl ttfb delta to OpenAI → outbound TTS path
- Similar curl but worse `tts_0_done` → CPU-side (PersonaPlex in path, or JSON encoding overhead)

**`first_audio` → `playback_start` gap**
- iOS-specific. Gap > 200ms = AudioContext was not unlocked before playback.
- Not host-related. Both hosts produce the same gap if iOS audio session handling is unchanged.

**Jitter framing**
- Single-turn numbers are less useful than the spread.
- If `p95 - median > 1000ms`: something is occasionally stalling (DNS TTL miss, container GC, LLM queue spike).
- Compare worst-case turns between hosts before optimizing averages.

**Primary interpretation summary**:

```
If: similar wisdom_retrieved, worse llm_first_chunk, worse curl ttfb to Anthropic/OpenAI
→ Outbound provider path. MinisForum has a longer or less stable route to the API.
  Fix: check ISP, DNS, routing. Consider Tailscale exit node closer to API PoP.

If: similar curl ttfb, but worse client_elapsed, or slower playback_start / mic_resume
→ Host performance or client-side. Not provider network.
  Fix: check container resource limits, CPU pressure. Check if PersonaPlex is in hot path.
```

---

## 5. MinisForum Latency Sources — Analysis

The request path for a voice turn is:

```
iPhone Safari PWA
  → TLS/Caddy (MinisForum port 443)
  → maia-sovereign container (Docker internal port 3000)
  → Anthropic API (outbound HTTPS from MinisForum)
  → OpenAI TTS API (outbound HTTPS from MinisForum)
  → PostgreSQL (Docker internal, same host)
```

### Likely sources of additional latency on MinisForum vs M4

**1. Outbound internet path to Anthropic/OpenAI**

The dominant cost in any voice turn is the LLM call (Claude) and TTS call (OpenAI). Both require outbound HTTPS from the server to a cloud API.

If the MinisForum is:
- On the same LAN as the M4 → same internet path, negligible difference
- On a different network connection → different route, potentially higher latency
- Behind VPN or Tailscale → adds 20–80ms depending on VPN server location

**Check**: `ping api.anthropic.com` and `ping api.openai.com` from both machines. Compare RTT.

**2. CPU performance for TTS**

OpenAI TTS is cloud-side, so CPU doesn't matter for it. But if PersonaPlex (local PCM synthesis) is in use, the MinisForum's CPU relative to the M4's performance cores matters. Check: is PersonaPlex actually enabled on production?

**3. Docker network overhead**

Both machines run the same Docker stack. Docker bridge networking adds ~0.5ms per hop — not significant.

**4. PostgreSQL memory fetch (`wisdom_retrieved` mark)**

If the MinisForum has slower disk I/O (e.g., spinning HDD, slower NVMe), the memory retrieval step will be slower. Check: `wisdom_retrieved` mark — if it's > 500ms consistently, this is a contributor.

**5. Cold container starts**

Containers that aren't warmed up will be slower on first request. For comparison tests, run 3–5 warm-up turns before collecting measurements.

### Verdict: likely contributors

| Source | Likely impact | Evidence needed |
|--------|--------------|-----------------|
| Internet path difference to Anthropic/OpenAI | **High if different ISP/network** | ping comparison |
| PersonaPlex local synthesis (if enabled) | Medium — CPU dependent | Check `source=personaplex` in server logs |
| Memory retrieval (PostgreSQL I/O) | Low-medium | Compare `wisdom_retrieved` mark |
| Docker networking | Negligible | — |
| TLS termination (Caddy) | Negligible (< 2ms) | — |

**Bottom line**: If the MinisForum has a slower or longer internet path to Anthropic's API, every voice turn will feel worse. This is the most likely cause of perceived degradation. It's a network topology question, not a code quality question.

---

## 6. Grep Commands for Analysis

After running test turns, use these to extract timing data from logs:

**Backend (Docker logs)**:
```bash
# All voice timing marks for a specific turn
docker logs maia-sovereign 2>&1 | grep "voice.*turn=abc12345"

# All turns on current host
docker logs maia-sovereign 2>&1 | grep "\[voice\].*host=minisforum"

# LLM latency across all turns
docker logs maia-sovereign 2>&1 | grep "llm_first_chunk"
```

**Frontend (browser console copy-paste)**:
```
Filter: [voice:
Look for: [voice:server_timing:] lines — these contain the full breakdown
```

**Comparing two hosts**:
```bash
# From Docker logs — compare llm_first_chunk across hosts
docker logs maia-sovereign 2>&1 | grep -E "host=(minisforum|mac-studio).*llm_first_chunk"
```

---

## 7. Recommended Next Actions (Ranked by Impact)

1. **Run the ping comparison first** (5 minutes)
   ```bash
   # From MinisForum:
   ping -c 20 api.anthropic.com
   ping -c 20 api.openai.com
   # From M4 Mac Studio:
   ping -c 20 api.anthropic.com
   ping -c 20 api.openai.com
   ```
   If MinisForum RTT to Anthropic/OpenAI is > 50ms higher than M4, that's your answer.

2. **Deploy this branch and collect 5 turns of timing data** from iPhone Safari PWA
   - Focus on `server_timing` lines in browser console
   - Note the `client_elapsed` value — this is felt latency

3. **Compare `wisdom_retrieved` mark** across turns
   - If consistently > 400ms, database I/O is a contributor
   - Fix: add index on member memory queries, or move to faster disk

4. **Check if PersonaPlex is in the hot path**
   - In server logs: `grep "PersonaPlex OK"` — if this appears, it's being used
   - PersonaPlex adds PCM synthesis time that OpenAI TTS does not
   - Disable for comparison: set TTS to OpenAI only (`TTS_OPENAI_FALLBACK=true`, no PersonaPlex config)

5. **Only after network/IO comparison**: investigate Phase 2 Voice Session Mode for felt continuity improvements independent of server location

---

## 8. Infrastructure Measurement Runbook: MinisForum vs M4

Run this on **both machines** before touching any code. Each section is independent; do them in order. Takes roughly 15 minutes per host.

---

### 8.1 Ping — ICMP baseline

**Purpose**: Establish raw RTT and packet-loss baseline to each API host. Fast to run, gives immediate signal.

```bash
# Run on each machine. 20 packets is enough for reliable avg/stddev.
ping -c 20 api.anthropic.com
ping -c 20 api.openai.com
```

**What to record** from the summary line (`min/avg/max/stddev ms`):
- `avg` — baseline round-trip
- `max - min` — jitter range. > 50ms spread is a problem.
- Packet loss — any loss at all is significant

**Threshold — meaningful degradation**:

| Condition | Verdict |
|-----------|---------|
| MinisForum avg > M4 avg + 30ms | Network path is a real contributor |
| MinisForum max > 300ms on either host | High jitter — voice will stall unpredictably |
| Any packet loss | Investigate routing immediately |

**Note**: ICMP is sometimes rate-limited or deprioritised by cloud providers. If `ping` drops packets but `curl` succeeds, treat ping loss as noise.

**Note — OpenAI blocks ICMP**:
- `ping -c 20 api.openai.com` returns 100% packet loss (OpenAI does not respond to ICMP — `api.openai.com` resolves to a sink address for ICMP)
- This is by design. It does not indicate a network problem.
- **Do not use ping to test OpenAI. Use curl -w (Section 8.2) only.**

**Confirmed M4 baseline (2026-03-14)**:
- `ping -c 20 api.anthropic.com` from M4 Mac Studio:
  - Run 1: avg 7.571ms, stddev 0.571ms, 0% loss
  - Run 2: avg 7.488ms, stddev 0.491ms, 0% loss
- Excellent result: low RTT, near-zero jitter. M4 → Anthropic network path is not a bottleneck.
- Use these as the reference baseline. MinisForum within +30ms avg and similar stddev = equivalent path.

---

### 8.2 HTTPS Timing — `curl -w`

**Purpose**: Measure the full HTTPS stack (DNS → TCP connect → TLS handshake → first byte) without consuming API quota. This isolates the network + TLS overhead from actual API processing time.

**Format string** (save this as `/tmp/curl-fmt.txt` on each machine for reuse):

```bash
cat > /tmp/curl-fmt.txt << 'EOF'
dns=%{time_namelookup}s  connect=%{time_connect}s  tls=%{time_appconnect}s  ttfb=%{time_starttransfer}s  total=%{time_total}s  http=%{http_code}
EOF
```

**Run — Anthropic API** (10 repetitions):

```bash
for i in $(seq 1 10); do
  curl -o /dev/null -s \
    -w "$(cat /tmp/curl-fmt.txt)\n" \
    https://api.anthropic.com/
  sleep 1
done
```

**Run — OpenAI API** (10 repetitions):

```bash
for i in $(seq 1 10); do
  curl -o /dev/null -s \
    -w "$(cat /tmp/curl-fmt.txt)\n" \
    https://api.openai.com/
  sleep 1
done
```

The `sleep 1` between requests prevents connection reuse from masking cold-connect cost. Each request is an independent TLS handshake.

**What each field measures**:

| Field | What it captures |
|-------|-----------------|
| `dns` | DNS resolution time. Usually < 5ms. Higher = DNS resolver lag or TTL miss. |
| `connect` | TCP handshake complete. Reflects geographic distance + routing. |
| `tls` | TLS handshake complete (cumulative from request start). Adds ~50–150ms on first connection. |
| `ttfb` | First byte of response received (cumulative). **Most important field.** This is the minimum per-call overhead before any data arrives. |
| `total` | Full response received. For a bare index page: usually same as `ttfb` + a few ms. |
| `http` | HTTP status code (401 or 200 — both are fine for this test; we just want the TCP/TLS numbers). |

**What to record** (median of 10 runs for each field):

```
                   dns      connect    tls      ttfb     total
MinisForum → Anthropic:
MinisForum → OpenAI:
M4 → Anthropic:
M4 → OpenAI:
```

**Threshold — meaningful degradation**:

| Condition | Verdict |
|-----------|---------|
| MinisForum `ttfb` > M4 `ttfb` + 50ms for Anthropic | Every `llm_first_chunk` mark will be ~50ms worse, minimum |
| MinisForum `ttfb` > M4 `ttfb` + 50ms for OpenAI | Every `tts_0_done` mark will be ~50ms worse |
| `tls` > 400ms on either host | TLS handshake is slow — likely routing to distant PoP |
| High variance across 10 runs (max/min > 2×) | Jitter — will cause erratic voice turn timing even if avg is acceptable |

**Quick analysis after the run**:

```bash
# Paste your 10 ttfb values and get median:
echo "0.210 0.195 0.220 0.198 0.205 0.212 0.199 0.207 0.214 0.201" \
  | tr ' ' '\n' | sort -n | awk 'NR==5||NR==6{sum+=$1; n++} END{print sum/n "s median"}'
```

---

### 8.3 Host Pressure Snapshot

**Purpose**: Rule out CPU saturation, memory pressure, and disk contention on the MinisForum as contributors to `wisdom_retrieved` latency or TTS generation slowness.

Run this **during a voice session** (immediately after triggering a voice turn, while the server is processing):

```bash
# All four in sequence — takes < 5 seconds total
echo "=== docker stats ===" && \
docker stats --no-stream --format \
  "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" && \
echo "" && \
echo "=== memory ===" && free -h && \
echo "" && \
echo "=== load ===" && uptime && \
echo "" && \
echo "=== disk ===" && df -h / && \
echo "" && \
echo "=== top processes ===" && top -b -n 1 | head -40
```

Run this **once at idle** (no active voice session) and **once under load** (during or immediately after a voice turn). Compare the two snapshots.

**What to look for**:

| Signal | Concern |
|--------|---------|
| `maia-sovereign` CPU% > 80% during a turn | Node.js is CPU-bound — likely PCM conversion (PersonaPlex) or JSON parsing overhead |
| `maia-sovereign` MemUsage approaching container limit | Memory pressure → GC pauses → latency spikes |
| Load average (1-min) > number of CPU cores | System is overloaded — everything will be slower |
| `BlockIO` on `maia-postgres` > 10MB per snapshot | Disk I/O is high during memory fetch — slow storage |
| `df -h /` > 85% full | I/O may be slow due to fragmentation or near-full filesystem |

**Expected values on a healthy host under a single voice turn**:
- `maia-sovereign` CPU: 10–40% during LLM streaming, < 5% otherwise
- `maia-sovereign` memory: stable (not growing)
- Load avg: < 1.0 on a 4-core machine during a single turn
- Postgres block I/O: minimal (memory queries are fast when data is cached)

---

### 8.4 Correlating Infrastructure Measurements with `[voice:server_timing:*]` Logs

This is the key step. Once you have curl TTFB numbers and server timing logs, the mapping is direct:

**LLM latency (Anthropic)**

```
voice server mark: llm_first_chunk - llm_starting
= (Anthropic API processing time) + (network RTT to api.anthropic.com)

Expected: ≈ curl ttfb to api.anthropic.com + model think time (400–1200ms for short prompts)
```

If `(llm_first_chunk - llm_starting)` >> `curl ttfb` by more than ~200ms consistently, the model is the bottleneck, not the network. If it tracks closely with curl ttfb, the network path is dominating.

**TTS latency (OpenAI)**

```
voice server mark: tts_0_done - text_0_emitted
= (OpenAI TTS processing time) + (network RTT to api.openai.com)

Expected: ≈ curl ttfb to api.openai.com + TTS model time (200–600ms for a sentence)
```

**Memory / DB latency**

```
voice server mark: wisdom_retrieved - relational_decision
= PostgreSQL query time + memory assembly time

Expected: < 150ms on warm cache, < 500ms on cold
```

If this is high and docker stats shows low Postgres I/O, the query itself is slow (missing index). If I/O is high, disk is the bottleneck.

**Full comparison table to fill in**:

```
Metric                          MinisForum    M4       Delta    Source
─────────────────────────────────────────────────────────────────────
curl ttfb → api.anthropic.com   ___ms         ___ms    ___ms    curl -w
curl ttfb → api.openai.com      ___ms         ___ms    ___ms    curl -w
ping avg → api.anthropic.com    ___ms         ___ms    ___ms    ping -c 20
ping avg → api.openai.com       ___ms         ___ms    ___ms    ping -c 20
─────────────────────────────────────────────────────────────────────
llm_first_chunk (server log)    ___ms         ___ms    ___ms    voice server_timing
tts_0_done (server log)         ___ms         ___ms    ___ms    voice server_timing
wisdom_retrieved (server log)   ___ms         ___ms    ___ms    voice server_timing
─────────────────────────────────────────────────────────────────────
playback_start - submission_fired  ___ms      ___ms    ___ms    browser console
  (FELT LATENCY — primary metric)
─────────────────────────────────────────────────────────────────────
Load avg during turn            ___           ___               uptime
maia-sovereign CPU% during turn ___%          ___%              docker stats
```

**Decision rule**:

```
If (curl ttfb delta > 50ms) AND (llm_first_chunk delta ≈ curl ttfb delta):
  → Network path is the cause. MinisForum has a worse route to Anthropic/OpenAI.
  Action: Check ISP, DNS, routing. Consider Tailscale exit node closer to API PoP.

If (curl ttfb delta < 30ms) BUT (llm_first_chunk delta is large):
  → Server processing is the cause. Check CPU and memory.
  Action: Check for PersonaPlex in hot path. Check container memory limits.

If (wisdom_retrieved > 400ms) AND (docker stats Postgres I/O is high):
  → Database I/O is a contributor.
  Action: Add index on member memory queries, or move Postgres data dir to faster storage.

If all deltas are small (< 30ms) but voice still feels worse on MinisForum:
  → Client-side or network jitter, not server-side latency.
  Action: Check ping max/stddev (jitter), check if MinisForum connection has higher packet loss.
```

---

### 8.5 Minimum Viable Comparison (5 minutes)

If you only have time for one thing before making a deployment decision:

```bash
# Run on MinisForum
for i in $(seq 1 10); do
  curl -o /dev/null -s \
    -w "anthropic ttfb=%{time_starttransfer}s\n" \
    https://api.anthropic.com/
  sleep 1
done

# Run on M4
for i in $(seq 1 10); do
  curl -o /dev/null -s \
    -w "anthropic ttfb=%{time_starttransfer}s\n" \
    https://api.anthropic.com/
  sleep 1
done
```

Take the median of each set. If MinisForum median is > 50ms higher than M4: the network path to Anthropic is the primary cause of degradation. No code change will fix it — it requires either a network routing change, moving the server back to M4, or moving to OpenAI Realtime (which moves the LLM call server-side at OpenAI and eliminates this round-trip entirely).

---

*Continue to Section 9 for first-audio fast path. Section 10 for instrumentation limitations.*

---

## 9. First-Audio Fast Path (Implemented 2026-03-14)

### What was changed

**`lib/services/ClaudeService.ts`** — `generateOracleResponseStreaming()`

Before this change, sentence segmentation only fired at `.`, `!`, `?`. The LLM had to generate a complete sentence before TTS could start. On longer first sentences, that gap was 500–1200ms of silence.

After this change: for the **first chunk only** (before any sentence has been yielded), the segmenter also checks for clause boundaries (`, ` `;` ` — ` ` – `). If the text before the boundary is 4–20 words and contains no metadata contamination, it is yielded immediately as chunk 0, and TTS fires while the rest of the sentence continues generating.

Subsequent chunks are unaffected — they use normal sentence-boundary detection.

**`app/api/voice/stream-conversation/route.ts`**

Added `tts_0_requested` timer mark immediately before the first TTS call, making TTS synthesis time explicit:
```
text_0_emitted → tts_0_requested = text processing overhead (should be < 5ms)
tts_0_requested → tts_0_done    = OpenAI TTS synthesis + network (200–600ms)
```

### New log event

```
[voice:first_segment_fast_path] words=N chars=N
```

Appears in server logs when a clause-level cut fired. If absent, the first chunk was a full sentence (fast path not needed or not triggered).

### Expected improvement

| Scenario | Before | After |
|----------|--------|-------|
| First sentence starts with a long clause ("I want to slow this down for a moment, because...") | Wait for full sentence | TTS starts at "I want to slow this down for a moment" |
| First sentence is already short ("Yes, I can feel that.") | No change needed | No change (fast path doesn't fire; sentence lands normally) |
| First sentence has no clause boundary | No change | No change (fast path doesn't fire; sentence lands normally) |

**Target felt improvement**: 200–600ms reduction in silence before first word, on turns where Claude starts with a multi-clause sentence.

### Risks and tradeoffs

- **Split mid-clause**: The remaining buffer after the clause cut continues as a subsequent chunk. If the rest of the clause would have changed the meaning of what was already spoken, it could feel slightly disconnected. Mitigated by requiring `>= 4 words` (too-short fragments aren't sent) and `<= 20 words` (overly long clauses aren't split).
- **Prosody applied per chunk**: `applyProsodyHintsToText()` runs on each chunk independently. The clause fragment will have prosody applied, which is correct.
- **Ordering**: Chunk 0 (clause) and chunk 1 (rest of sentence) are emitted in order by index. The existing `audioQueueRef.sort()` on the frontend ensures correct playback even if chunk 1 TTS completes before chunk 0 playback ends.
- **No impact on threshold path**: The threshold fast-path in the route bypasses ClaudeService entirely, so this change doesn't affect threshold responses.

### Validation

Look for this pattern in server logs after a turn:
```
[voice] llm_first_chunk +Nms
[voice:first_segment_fast_path] words=6 chars=34
[voice] text_0_emitted +Nms   ← fires earlier than before
[voice] tts_0_requested +Nms
[voice] tts_0_done +Nms
```

If `first_segment_fast_path` is absent, the first chunk was a complete sentence and the fast path didn't trigger. Both are valid paths.

---

## 10. What This Instrumentation Does NOT Tell You

- **Audio codec decode time on iPhone** — from first audio byte received to first sound heard, there is a short decode + buffering step (typically 50–150ms). Not instrumented here.
- **Safari autoplay delay on iOS** — if `play()` is delayed by the browser, the gap between `first_audio` and `playback_start` will be > 100ms. This is iOS-specific, not server-related.
- **Jitter vs average latency** — run multiple turns and look at variance, not just average. A server with high jitter (inconsistent LLM response time) feels worse than a slower but consistent one.

---

*Run alongside `voice-experience-review-2026-03.md` and `voice-implementation-plan-2026-03.md`.*
