# MAIA System Integrity Checklist

**Purpose:** A post-outage and post-deploy verification runbook that prevents *apparent* recovery from being mistaken for *verified* recovery.

**Core principle:**

> Integrity means each layer can prove its own liveness without borrowing authority from another layer.

**Governance rule:**

> Every claim must name its substrate. No layer's health may be inferred from another layer's signal.

---

## Why this checklist exists

The 2026-05-27/28 power-outage recovery revealed a class of failures that look like application-layer regressions but are actually coordination failures at the perimeter:

- MAIA appeared catastrophically down
- Containers were healthy internally
- LAN was healthy
- WAN ingress was dead because Omada port-forwarding still targeted a stale DHCP-assigned IP

The mismatch *between* layers was invisible from any single layer's perspective. This runbook makes the cross-layer evidence chain explicit so it can be verified in order rather than inferred from feelings of "things look ok."

**Substrate-survival chain demonstrated in that recovery** (preserve as evidence of resilience class):

```
deploy → outage → reboot → SSH recovery → DHCP drift
→ WAN failure → router correction → authenticated live usage
→ prompt_block_layers.conversational still true under load
```

That sequence is what *layered verification* enables a system to survive without losing the repaired substrate.

---

## Layer 1 — Infrastructure integrity

**Claim:** the machine stays reachable on its expected IPs.

**Hardening (do once):**

- Static IP via netplan on minisforum (matches CLAUDE.md's `192.168.0.104`), OR DHCP reservation in Omada admin (bind MAC `38:05:25:34:e9:87` → `.104`)
- Port-forward rules in Omada checked against the static IP
- Tailscale fallback access (out-of-band recovery during ingress failure)
- UPS battery backup (clean shutdown during outage)
- BIOS: "Restore on AC Power Loss" → ON
- External uptime monitor (UptimeRobot, Healthchecks.io) — detection latency under 5 min

**Per-event verification:**

```bash
# From Mac Studio
ping -c 2 -W 2000 192.168.0.104
ssh soullab@minisforum 'hostname && uptime && ip addr show enp1s0 | grep "inet "'
```

**Pass criteria:** ping returns under 2ms, SSH connects, hostname is `soullab`, `inet 192.168.0.104/...` shown.

**Fail mode:** "Operation timed out" / "Host is down" / no route. Halt and inspect physical layer + Omada DHCP lease table before proceeding.

---

## Layer 2 — Runtime integrity

**Claim:** containers are actually running and healthy, not just present.

**Per-event verification:**

```bash
ssh soullab@minisforum 'docker ps --format "{{.Names}} | {{.Status}}" | head -10'
ssh soullab@minisforum 'docker inspect maia-sovereign --format "started={{.State.StartedAt}} | status={{.State.Status}} | restarts={{.RestartCount}}"'
ssh soullab@minisforum 'curl -s --max-time 3 http://localhost:3000/api/health | head -c 200'
```

**Pass criteria:**
- All 6 containers show `Up X minutes (healthy)` where applicable
- `maia-sovereign.State.Status: running`
- `localhost:3000/api/health` returns `{"health":"ok",...}`

**Fail mode:** Container exited or unhealthy → check `docker logs maia-sovereign --tail 50`. Restart count climbing → underlying crash loop, investigate.

---

## Layer 3 — Data integrity

**Claim:** the database and memory substrate survive events.

**Hardening (do once):**

- Nightly `pg_dump` to an off-host location (different disk or remote)
- Migration tracking via `migrations` table (audit which migrations have run vs are pending)
- Schema-drift CI check on each deploy

**Per-event verification:**

```bash
# Critical column survival (e.g., is_breakthrough migration)
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT column_name FROM information_schema.columns WHERE table_name='member_memory_atoms' AND column_name LIKE '%breakthrough%' ORDER BY column_name;\""

# Row counts on critical tables
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT 'member_memory_atoms' AS t, count(*) FROM member_memory_atoms UNION ALL SELECT 'runtime_events', count(*) FROM runtime_events UNION ALL SELECT 'members', count(*) FROM members;\""
```

**Pass criteria:** expected columns present, row counts within sane range (no zeros where there should be data).

**Fail mode:** column missing → migration regressed; restore from latest pg_dump and replay migrations.

---

## Layer 4 — Application integrity

**Claim:** the actual MAIA conversational pathway still works end-to-end under authenticated load.

**Per-event verification (requires one authenticated turn through `/maia`):**

```bash
# After sending one short turn through https://soullab.life/maia
ssh soullab@minisforum 'docker logs maia-sovereign --since 5m 2>&1 | grep -B1 -A8 "conversational-block"'

ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"SELECT built_at, route_id, provider_model, prompt_block_chars, prompt_block_layers->>'conversational' AS conv, prompt_block_layers->>'atoms' AS atoms, memory_layers->>'semantic' AS sem FROM runtime_events WHERE built_at > NOW() - INTERVAL '10 minutes' ORDER BY built_at DESC LIMIT 3;\""
```

**Pass criteria (Stage 4 for CORE):**
- New `runtime_events` row with current timestamp
- `route_id: sovereign/app/maia/list`
- `prompt_block_layers.conversational: true`
- `prompt_block_layers.atoms: true`
- `memory_layers.semantic: ok`
- `[MAIA] conversational-block { emitted: true, surfacedCount: N }` in logs

**Fail mode:** Row missing → traffic not reaching route; check Caddy upstream + WAN curl. `conv: false` → §V addenda channel regression; check `appendAllContextAddenda` helper extraction.

---

## Layer 5 — Path-specific integrity (no inference)

**Claim:** each routing path actually works. Different paths require separate evidence.

**Rule:** evidence for one path does NOT verify another path. `CORE: ok` ≠ `DEEP: ok` ≠ `voice: ok` ≠ `mobile: ok`.

**Per-path verification:**

| Path | Evidence needed |
|---|---|
| FAST | `runtime_events` row + log line with FAST-tier signature |
| CORE | `prompt_block_chars` ~5K–10K, `claude-sonnet-4-5` model, `conv: true` |
| DEEP | `runtime_events` row via `buildMaiaComprehensivePrompt` path + `conv: true` on DEEP row (§V Option A under DEEP load) |
| Voice (TTS) | `Audio blob received` in console + `[TTS] Playback path check` success |
| Memory atoms | `atoms loaded: { count: N }` log line + atom IDs in runtime_events |
| Session room | dedicated session-room route hit + state persisted |
| Mobile / Capacitor | mobile build artifacts + auth flow tested separately |

**Critical discipline:**

> **No evidence → no claim.**
>
> If DEEP has not been observed in `runtime_events` or logs, you may NOT claim DEEP works — regardless of how depth-engaged the conversation feels. Felt depth is not routing evidence.

---

## Layer 6 — Governance integrity

**Claim:** the system does not "feel verified" before it is.

**Substrate-per-claim table:**

| Claim | Required substrate |
|---|---|
| "MAIA is online" | external HTTPS curl returns 200 + JSON |
| "Memory is working" | `runtime_events` row + DB query showing rows in `member_memory_atoms` |
| "Conversational layer works" | `prompt_block_layers.conversational: true` on a fresh `runtime_events` row |
| "Atoms surface to prompt" | `prompt_block_layers.atoms: true` + `[MAIA/sovereign] atoms loaded` log marker |
| "DEEP works" | runtime evidence specifically of a turn that routed through DEEP, with `conv: true` on that row |
| "Voice works" | TTS audio blob received + played |
| "Ingress is healthy" | external curl returns 200 + Caddy logs show ACME success |
| "System recovered" | every claim above independently passes |

**Anti-pattern to refuse:**

- *"It feels deep, therefore DEEP routed"* → infers routing from phenomenology
- *"The dashboard says green"* → infers substrate from indicator
- *"Memory must be working because the response was contextual"* → infers DB state from response quality
- *"It's been running for hours, so it must be stable"* → infers correctness from uptime
- *"The container is up, so the app is fine"* → infers application state from container state

Each of these is the same shape: **representation inheriting authority from the appearance of grounding.**

**Case study — Save-as-Journal:**

The suggestion banner and `handleSaveAsJournal` handler in `components/OracleConversation.tsx` posted to `POST /api/journal/save-conversation`, but that route never existed and no essence extractor was wired. The UI presented a continuity claim with no substrate behind it. For a period in May 2026 the affordance was hidden on iOS behind an `isNativePlatform` gate while the PWA continued to surface the banner and 404.

Resolution (commit `719361222`, 2026-05-29): despite the commit title ("hide unsupported journal-save affordance on native"), the affordance was removed entirely — banner JSX, `handleSaveAsJournal` callback, breakthrough-trigger effect, and journal-related state declarations were deleted. The typed "save as journal" command was redirected to `handleCaptureSpirit`, converging on `/api/capsules/from-chat-window` (already wired and working). Capture-the-Spirit → Capsule is now the single continuity gesture.

The principle ("every UI claim must name its substrate") admits two valid resolution paths:

- Build the missing substrate so the UI claim becomes honest.
- If no distinct lifecycle justifies the second affordance, collapse it into the working one rather than build a parallel substrate.

This case took the second path.

---

## Post-event quick checklists

### Post-outage (in this order — perimeter inward)

1. **Public health** — `curl -k -s --max-time 8 -w "HTTP %{http_code}\n" https://soullab.life/api/health`
2. **Caddy reachable on LAN** — port 80/443 OPEN on minisforum's actual current IP
3. **Container status** — `docker ps`, all expected containers `(healthy)`
4. **Local health endpoint** — `curl http://localhost:3000/api/health` from minisforum
5. **DB schema** — critical columns + row counts
6. **One authenticated turn** — Layer 4 verification
7. **Per-path verification** — only for paths actively claimed
8. **External monitor confirms green** — UptimeRobot / Healthchecks.io

### Post-deploy (in this order — bottom up)

1. **Container image SHA matches expected** — `docker inspect maia-sovereign --format "{{.Image}}"`
2. **Container started after deploy timestamp** — `started > deploy_command_run_at`
3. **Migration audit** — any new migrations declared but not yet applied?
4. **Layer 4 verification** — one authenticated turn produces expected runtime evidence
5. **Per-path verification** — for any path the deploy touched
6. **External monitor still green** — no regression in detection signal

---

## Diagnostic inversion (when symptoms match: internal healthy, external dead, post-power-event)

**Invert the usual top-down debugging order.** Diagnose perimeter-inward:

1. Public DNS resolving to current WAN IP?
2. Router WAN IP unchanged from pre-event?
3. Router port-forward rule targets the *current* LAN IP of minisforum (not a stale one)?
4. Minisforum's NIC link up?
5. Caddy responding internally at the host IP?
6. Container DNS within Docker network resolving?
7. App responding at `localhost:3000/api/health`?
8. Logs showing request handling?

**Why perimeter-first:** after a power-class event, the highest-probability failure surface shifts upward into NAT / forwarding / DHCP / WAN renegotiation — not application code or DB state. Application-layer debugging while a router rule is stale wastes time.

---

## Three reusable framings (preserve when crystallizing)

1. **Infrastructure altitude:** Public ingress continuity depends on static alignment between DHCP lease assignment and Omada forwarding targets. Any DHCP drift fractures WAN reachability while leaving application-layer health intact.

2. **Diagnostic altitude:** Diagnose from the perimeter inward when the symptom is "internal healthy, external dead, after a power-class event."

3. **Product / ontology altitude:** The artifact must not exceed the substrate it claims to represent.

All three are instances of one parent invariant:

> *Representation must remain proportionate to verified substrate.*

The dangerous mechanism this invariant prevents:

> *Representation detaching from grounding while continuing to inherit authority from the appearance of grounding.*

---

## What this checklist is NOT

- **Not aspirational principles.** Every check has a concrete command and pass criteria.
- **Not a substitute for monitoring.** This is for human use post-event; continuous monitoring belongs in external monitors + alerts.
- **Not a closure declaration.** Running the checklist successfully proves the layers *checked* are operational; layers *not checked* remain unclaimed.

---

## File update discipline

When CLAUDE.md, infrastructure topology, or DB schema changes:

1. Update this checklist to reflect new state (IPs, ports, table names, migration columns)
2. Note the change in commit message
3. Verify the updated checklist actually runs cleanly before merging

A stale integrity checklist is worse than no checklist — it inherits the authority of a runbook while pointing at substrate that no longer exists.
