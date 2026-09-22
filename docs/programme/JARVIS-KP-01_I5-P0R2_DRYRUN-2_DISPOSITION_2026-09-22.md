# JARVIS-KP-01 / I5-P0R2 — DRY RUN 2 DISPOSITION + CEILING REPAIR

STATUS: RECORD (⛔ not an authorization)
**Date**: 2026-09-22
**Disposition**: `I5-P0R2 DRY RUN 2 · INSTRUMENT OBSERVABILITY PASS · BLOCKED_AT_DOCKER_INSPECT · HOST DOCKER CONTROL-PLANE STATE UNKNOWN · PROPERTY WITNESS UNSPENT`

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. What dry run 2 established

| Step | Result |
|---|---|
| authorization record accepted | PASS |
| draft guard | PASS |
| instrument resolved from `/tmp` | PASS |
| `seam-identity.mjs` blob | PASS |
| `seam-identity-container.mjs` blob | PASS |
| Phase 1 entered | PASS |
| **`docker inspect maia-sovereign`** | **STALLED** |

Not run: `docker exec GIT_COMMIT` · canonical fetch · git-side binding check ·
container-side seam witness · B1/B2. Nothing mutated.

⭐ **The observability repair did its job**: the block is localized to a specific
external call rather than to "somewhere in Phase 1".

## 2. ⭐⭐ The distinction that governs what happens next

**A stalled Docker control plane is not a dead production service.** Request
traffic reaches MAIA through published ports and iptables — **never through
dockerd's API socket** — so `maia-sovereign` can be serving members normally while
`docker inspect` hangs indefinitely.

⛔ **Therefore: no Docker restart, no container restart, no recreate, nothing
touched.** A witness that could not read a *label* is not evidence that the
*service* is unwell, and restarting production to satisfy an instrument would
invert the entire order of authority.

Production application runtime: **NOT ASSESSED** by this run.

## 3. Ceiling repair — the instrument may no longer hang

Dry run 2 waited forever. An instrument that waits forever reports nothing, so the
operator cannot distinguish a stalled management plane from a slow one — and the
*absence* of output carries no information, which is this project's own standing
law about absence.

- All **13** `docker` invocations now route through a `dk()` wrapper with a
  ceiling (`I5_CALL_TIMEOUT_S`, default 15s). A breach is a named STOP,
  `DOCKER_CONTROL_PLANE_TIMEOUT`, whose text states explicitly that it says
  nothing about whether MAIA is serving traffic.
- The authorized §IV reload keeps its **exact** Compose form, with a 300s ceiling.
- ⭐ **Exactly one cause is reported.** `dk()` breaches inside a command
  substitution, which cannot terminate the parent shell, so the caller's generic
  handler fired too and printed a second, vaguer reason. A cause marker now
  suppresses the secondary message.

⚠️ **The ceiling test caught a defect in the repair itself**: the first version
wrote the marker *before* printing, so `stop()` suppressed the very message the
marker existed to preserve — a timeout produced **no STOP line at all**. Repaired
by ordering print-then-mark. *Proven against a genuinely hanging `docker` stub:
one STOP, correctly named, prompt returned; and a non-timeout failure still names
its own reason.*

⛔ No check was added, removed, weakened or reordered. Same phases, same stop
conditions, **same digests**.

## 4. Host plane probe landed — READ ONLY

`scripts/witness/i5-host-plane-probe.sh`, committed so the diagnosis is reviewable
rather than pasted.

- **Part A** — the founder's bounded Docker probe (context · version · ps ·
  inspect), every call ceilinged so the probe cannot itself become the ambiguous
  hang it exists to diagnose.
- **Part B** — ⭐ the **Docker-independent** half Part A cannot supply: Caddy
  health/version/ready over the local socket carrying the public `Host` header,
  the app process in the host PID namespace, and listening ports.

⚠️ Part B deliberately does **not** probe `https://soullab.life` from minisforum:
consumer routers usually disable hairpin NAT, so an external-name probe from
inside the LAN returns HTTP 000 and is **misleading** — the trap already recorded
in `CLAUDE.md`.

### Cross-reading, which is the point

| Part A | Part B | Incident |
|---|---|---|
| broken | healthy | **management plane only** — MAIA is serving; ⛔ do not restart anything |
| broken | broken | a real service incident, which **outranks I5 entirely** |
| healthy | broken | serving-path incident with a readable control plane |

⛔ The probe authorizes no recovery act.

## 5. Standing

instrument logic changed **NO** · binding checks changed **NO** · digests changed
**NO** (`195b16bc…` / `a63cf931…`) · refusal law changed **NO** · B1 repaired
**NO** · B2 repaired **NO** · production application runtime **NOT ASSESSED** ·
production mutation **NONE** · container restart **NONE** · Docker restart
**NONE** · `I5-P0R2` **UNSPENT** · instrument **NOT FROZEN** · ⛔ I5-P1 NOT
OPENED.

⭐ *Three instrument repairs now — reachability, delivery, and a ceiling. Not one
has been a repair to a check.*
