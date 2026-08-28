# Keep / Sanctuary — Runtime Acceptance Protocol

**Candidate:** `22c9a98` · `2f42cca` · `4b5f122` (branch `claude/keep-bookmark-icon-missing-nfd9ve`)
**Status at time of writing:** SOURCE/TEST PASS · branch only · **NOT production-accepted**
**Closes:** live Sanctuary persistence breach on `clean-main-no-secrets`

---

## Why this document exists

The session that wrote the repair runs in a cloud container with **no route to
minisforum** — no `ssh` binary, no LAN route to `192.168.0.104`, no keys. Deploy,
provenance verification, and runtime acceptance are therefore structurally
impossible from there and must be run from the Mac Studio (or any host with
`ssh soullab@minisforum`).

Nothing below has been executed. Every leg is unrun until someone records a
result against it.

**Evidence rule (Kelly, 2026-08-28):** *use DB/runtime evidence where
persistence/non-persistence is being claimed. Logs alone do not prove absence of
writes.* Every leg that asserts "nothing was written" carries a SQL check, not a
log grep. A log line proves a code path ran; only the table proves what landed.

### Where each marker actually appears — read this before grepping

The Keep flow emits to **three different places**, and greppping the wrong one
returns an empty result that looks exactly like a failure:

| Instrument | How to read it | Markers |
|---|---|---|
| **Server log** | `docker logs maia-sovereign` on minisforum | `[API] Distilling … (preview — no write)` · `[API] Prepared Keep draft …` · `[API] Keep confirmed — capsule …` |
| **Browser console** | devtools on the member's own tab — **never reaches the server** | `✨ [Capsule] handleCaptureSpirit called` · `🛡️ [Capsule] Capture refused: Sanctuary session` · `🔖 [Keep] explicit open command` · `🔖 [Keep] doorway attached` · `🛡️ [Keep] intent recognized but refused · Sanctuary` · `[Analytics] keep_panel_opened` |
| **Database** | `docker exec maia-postgres psql` | `reflection_capsules` rows — the only proof of what persisted |

`trackEvent()` is a placeholder (`lib/analytics/track.ts`) that only
`console.log`s in the browser. `keep_panel_opened` will **never** appear in
`docker logs`. So will none of the client-side Sanctuary refusals: they are
proof for the operator sitting at the browser, not for anyone reading the host.

Keep devtools open on the member's tab for the whole run.

---

## What is being repaired

Until this candidate, `/api/capsules/from-chat-window` distilled the last 16
turns **and** called `createCapsule()` in the same request. The Keep panel calls
it on OPEN. So a `reflection_capsules` row landed before the member had seen,
edited, or confirmed anything — and four callers reached that handler without a
Sanctuary check (the `open_reflection` doorway card, the Lab drawer action, the
`labAction` window event, and `detectJournalCommand()` on typed input).

That is a live breach of Sanctuary invariant 6: nothing from a Sanctuary session
may be saved *"under any circumstances, including by user request during the
session."*

---

## Step 1 — Deploy

Canonical must first carry the merged candidate. Then, from the Mac Studio:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

Quick `maia`-only rebuild is sufficient: **this candidate contains no migration**
(`git diff --name-only` shows zero files under `database/migrations/`). If you
prefer a rollback point, use the full path instead:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && scripts/deploy-production.sh deploy <SHA>'
```

## Step 2 — Verify provenance from the running artifact

```bash
# Must equal the SHA you deployed — never "unknown"
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
# Must be under a minute old
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'
# Must be 192.168.0.104 (router port-forward target)
ssh soullab@minisforum 'hostname -I'
```

`GIT_COMMIT=unknown` means the deploy bypassed the provenance chain — do not
proceed to acceptance. Re-deploy through the gate.

---

## Runtime witness

Run as an authenticated member at `https://soullab.life/maia`.

### Baseline — take the count before you start

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -t -c \
  "SELECT count(*) FROM reflection_capsules WHERE user_id = '\''<MEMBER_UUID>'\'';"'
```

Record this as `N0`. Every leg below compares against it.

---

### Leg A · Safe opening (outside Sanctuary)

Confirm Sanctuary is **OFF** (no green pill).

Say: **"MAIA, open Keep."**

Expected:
- [ ] MAIA responds normally — she is not made mute by the recognition
- [ ] the Keep panel opens
- [ ] telemetry reports the opening, not a capture

Server side — the prepare ran and announced that it wrote nothing:

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 5m 2>&1 | grep -E "Prepared Keep draft|preview — no write"'
```

Browser console — the open was tracked as an open:

```
🔖 [Keep] explicit open command
✨ [Capsule] handleCaptureSpirit called
[Analytics] keep_panel_opened { persisted: false }
```

- [ ] `spirit_captured` appears nowhere — that name on the open path was the
      old misreport of the member's consent gesture

**Persistence check — the load-bearing one:**

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -t -c \
  "SELECT count(*) FROM reflection_capsules WHERE user_id = '\''<MEMBER_UUID>'\'';"'
```

- [ ] count still equals `N0` — **zero rows created by opening**

Now **close/cancel the panel** without confirming. Re-run the count.

- [ ] count still equals `N0` — the abandoned attempt left nothing behind

---

### Leg B · Explicit confirmation

Open Keep again. Review the preview. **Confirm it as the member.**

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT id, title, draft, created_at FROM reflection_capsules WHERE user_id = '\''<MEMBER_UUID>'\'' ORDER BY created_at DESC LIMIT 2;"'
```

- [ ] count is now `N0 + 1` — exactly the authorized persistence, no more
- [ ] `title` and `summary` match the preview the member approved on screen
- [ ] no second distillation changed the content between preview and commit

Content correspondence is the point of this leg, not just the count. Compare the
row against what was on screen:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT title, summary, gold_lines FROM reflection_capsules WHERE user_id = '\''<MEMBER_UUID>'\'' ORDER BY created_at DESC LIMIT 1;"'
```

- [ ] confirm the write emitted the confirm marker, not a second prepare:

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 5m 2>&1 | grep -E "Keep confirmed — capsule"'
```

The member reference in that line is a `memberRef()` hash, not a readable id —
correlatable across the prepare and confirm lines for the same member, without
the identifier being present.

---

### Leg C · Natural Keep intent

Say: **"Can we keep this?"**

- [ ] MAIA still answers the utterance — it is not swallowed
- [ ] the member-controlled Keep doorway appears, reading "You asked to keep this."
- [ ] MAIA does **not** claim anything has already been saved
- [ ] count still equals `N0 + 1` — surfacing a doorway persists nothing

Then the false friend. Say: **"Keep going."**

- [ ] no Keep affordance appears
- [ ] count unchanged

---

### Leg D · Sanctuary

Turn Sanctuary **ON** and visually confirm the green pill.

Record the count as `N1`. Then say both:

**"Can we keep this?"** and **"MAIA, open Keep."**

Expected:
- [ ] no Keep doorway
- [ ] no Keep panel
- [ ] MAIA accurately explains Keep is unavailable while Sanctuary is active,
      without treating it as a malfunction

Server side — **no prepare and no confirm may appear for this window.** This
grep must return nothing:

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 5m 2>&1 | grep -E "Prepared Keep draft|Keep confirmed — capsule|Distilling .* chat messages"'
```

Browser console — the refusals SHOULD appear. These are client-side and will
never show up in `docker logs`; read them in devtools:

```
🛡️ [Keep] intent recognized but refused · Sanctuary   ← from "Can we keep this?"
🛡️ [Capsule] Capture refused: Sanctuary session       ← from "MAIA, open Keep."
```

- [ ] both refusals observed in the browser console
- [ ] the server grep above returned **nothing**

**Persistence check (the claim that actually matters):**

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -t -c \
  "SELECT count(*) FROM reflection_capsules WHERE user_id = '\''<MEMBER_UUID>'\'';"'
```

- [ ] count still equals `N1` — **no row from a Sanctuary session, by either path**

---

## Acceptance

The production Keep/Sanctuary breach may be declared closed **only** when every
box in legs A–D is checked against a running container whose `GIT_COMMIT` equals
the deployed SHA.

Until then the honest status line is:

```
SANCTUARY KEEP LEAK   REPAIRED ON BRANCH · STILL LIVE IN PRODUCTION
```

Do not let a green test suite promote itself into a production claim. Source and
test evidence establishes that the code no longer contains the defect; only this
protocol establishes that production no longer runs it.

---

## Held for after acceptance

`HOUSE-ACTION-AUTHORITY-AUDIT-01` — the read-only census of every member-facing
House action (Journal, Ideas, Decisions, Journey, Settings, Astrology, every
`intentRouter` doorway, every Lab drawer action, every window event capable of
invoking a House function), classified across SURFACE / OPEN / READ /
PREPARE-DERIVE / PERSIST / DELETE / EXTERNAL-SIDE-EFFECT authority, Sanctuary
behavior, member confirmation point, and whether MAIA activation is currently
possible.

Target invariant: *a navigation or presentation act must not silently exercise
persistence, disclosure, deletion, publication, payment, communication, or other
member-governed authority.*

Census first. Classify before repairing. Nominate the smallest first repair only
once the evidence is complete.
