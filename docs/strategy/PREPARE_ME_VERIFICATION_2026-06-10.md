# PREPARE ME — END-TO-END VERIFICATION (read-only)

**Date**: 2026-06-10
**Type**: Verification pass only — *no code changed, no PR, no enhancement.* Read-only static trace + read-only production queries (aggregate counts / null-checks only, no client PII).
**Question**: Not "does Prepare Me exist?" (it does — live in #401) but **"does it work for a real practitioner preparing for a real session?"**
**Companion**: [`PRACTITIONER_ADOPTION_ROADMAP.md`](./PRACTITIONER_ADOPTION_ROADMAP.md) item 1.

---

## Verdict

**Prepare Me is LIVE and correctly WIRED — but NOT working in use.** Two independent reasons, **neither a code bug**:

1. **No upcoming bookings exist.** All 32 `sessions` rows are in the past → `nextBooking` resolves to `null` for everyone → every practitioner currently sees the empty stub ("When you have a session coming up, you'll prepare for it here…"). `SessionBriefingCard` never mounts.
2. **The brief's data source is empty.** Even with a future booking, the briefing's substance (last session, themes, recurring patterns, totals) reads `practitioner_sessions` = **0 rows**. The real session data — **69 rows — lives in `scribe_sessions`**, which the briefing engine does **not** read.

→ The real gap is **connection + data**, not UI and not the feature. This is the "reveal → connect → validate" phase exactly: the capability is *revealed* and *wired*; what's missing is *connecting it to live data* (and getting bookings to flow).

---

## Evidence (production, read-only)

Row counts: `sessions` = 32 · `practitioner_sessions` = **0** · `practitioner_clients` = 8 · `practice_sessions` = 0 · **`scribe_sessions` = 69**.

Funnel (all read-only counts):
| Check | Count |
|---|---|
| Upcoming sessions (`scheduled_start >= NOW()`) | **0** |
| …with `client_id` set | 0 |
| …whose `client_id` resolves to `practitioner_clients` | 0 |
| `sessions.practitioner_id` ∈ `practitioners(id)` | 32 / 32 ✓ |
| `practitioner_clients.practitioner_id` ∈ `practitioners(id)` | 8 / 8 ✓ |
| `practitioner_clients.practitioner_id` ∈ `members(id)` | 0 / 8 |

---

## The six questions

1. **Does `nextBooking` resolve correctly on `/studio`?** Logic is correct (`/api/studio/bookings`: `SELECT … FROM sessions WHERE practitioner_id=$1 AND scheduled_start >= NOW() ORDER BY scheduled_start ASC`, takes earliest). **But it resolves to `null` today** — 0 upcoming bookings. *Latent caveat*: **no status filter** — a future `cancelled`/`no_show` session would still surface as `nextBooking`.

2. **Does Prepare Me render for that booking?** With `nextBooking = null`, the card renders the **empty stub** for all practitioners. The booking branch + `SessionBriefingCard` do not mount.

3. **Does `SessionBriefingCard` receive real data?** Not exercised today (nothing mounts it). If it were: the **client seam is sound** (`sessions.client_id → practitioner_clients.id`; both practitioners-space, 8/8). But the briefing object it would receive is **empty of history**, because…

4. **Does the briefing contain meaningful content (not empty placeholders)?** **No.** `getSessionPrep` reads `practitioner_sessions` (0 rows) for last-session / themes / recurring / totals → every brief renders the *"first session — no prior history"* placeholder (+ at most safety flags from `client_emergency_info`). Substance is structurally empty. The 69 real sessions in `scribe_sessions` are never read.

5. **Trace the seam; silent-empty conditions.**
   - **Client seam: SOUND** — `sessions.client_id → practitioner_clients.id`, unified on `practitioners` space.
   - **History seam: BROKEN-BY-EMPTINESS / WRONG-TABLE** — brief reads `practitioner_sessions` (0); data is in `scribe_sessions` (69).
   - **Practitioner-id**: `sessions` and `practitioner_clients` both `practitioners`-space (✓). The trace flagged `practitioner_sessions.practitioner_id → members(id)` divergence — **unverifiable** while that table is empty; **latent** if data ever lands there.
   - **Silent-empty conditions (current reality):** (a) no upcoming booking → stub [current state]; (b) booking with `client_id` NULL → card renders **nothing** (400 "No client linked" → `return null`); (c) booking with client → brief renders but **empty** (history table empty).

6. **Wired / actual-rendered / failure modes.**
   - **Wired**: YES (verified in code; #401 reveal).
   - **Actual rendered (now)**: the **empty stub** for everyone — no practitioner is currently seeing a brief at all.
   - **Failure modes**: (1) no upcoming bookings [flow/data]; (2) data-connection gap [brief reads empty `practitioner_sessions`; data in `scribe_sessions`]; (3) NULL `client_id` → silent null; (4) no-status-filter latent bug; (5) latent practitioner-id divergence.

---

## What this reframes (no build authorized)

The "real gap" for Prepare Me is **not** UI, and **not** the after-session hook. It is, in order:
1. **Why are there 0 upcoming bookings?** Is there a live booking flow producing future `sessions` rows? (Without bookings, the card can never show substance.)
2. **The data-connection gap**: confirm whether `scribe_sessions` (69) is the intended source the brief should read (or should write through into `practitioner_sessions`). This is a *connect/validate* problem.

Both are **investigation/verification** questions — not builds. Each should be its own grounding pass before any code.
