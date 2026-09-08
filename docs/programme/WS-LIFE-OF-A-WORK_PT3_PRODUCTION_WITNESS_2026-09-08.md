# PT-3 — production read-only witness · §VII return

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §VI–VII. Read-only production witness authorized.
**Status:** ⛔ **THE PRODUCTION WITNESS COULD NOT BE RUN FROM THIS SESSION.** Nothing was read from,
or written to, production.

---

## 0. Why, stated plainly

This session is a remote cloud container. Production is **minisforum**, a LAN host reached by
`ssh soullab@minisforum` from the Mac Studio. Three routes were tried, none available:

| Route | Result |
|---|---|
| `ssh soullab@minisforum` | **no `ssh` binary in this environment** |
| TCP to `192.168.0.104:22` | no route — the LAN is not reachable from a cloud container |
| `https://soullab.life/api/health` | connection failed (`000`) |

⚠️ **I am not reporting an empty run as a clean one** (§V). The census and host inspection remain
**unobserved**, and §VII items 1, 2, 3, 4, 5, 7 and 8 are therefore **UNANSWERED**. Item 6 is
answered below, because it needs no production reading.

**What this return contains instead:** the two instruments, corrected against §VI, so the founder's
run is one command each and its adjudication is already decided rather than invented after the data
is seen.

---

## 1. §VI corrections made to the instruments

### 1.a The host verifier no longer calls the pre-cutover state a failure

§VI: *"If runtime is still using owner authority, report that fact. If `MAIA_APP_DATABASE_URL` is
absent, report that fact. Neither is a failure of this readiness package."*

The verifier printed both as `FAIL`. It now separates three kinds of line:

| | Meaning |
|---|---|
| **TOPOLOGY** | what is there — which service holds which authority. Facts, not verdicts. |
| **PRE-CUTOVER** | true today and expected: runtime as owner, `MAIA_APP_DATABASE_URL` absent, `maia_app` not yet created. |
| **DEFECT** | wrong regardless of cutover: `maia_app` a superuser, protected tiers owned by it, both authorities in one universally-loaded env file. |

Verdicts: `INCONCLUSIVE` (nothing observed) · `DEFECTS PRESENT` · `NOT YET CUT OVER` (the expected
pre-cutover reading, exit 0) · `READY`. **It reports roles, never connection strings** — a role name
is a fact; a URL is a secret.

### 1.b The census preserves multi-arrival cases individually

§VI: *"preserve the cases individually rather than summarizing away ambiguity."* Two sections added:

- **3b** — **every arrival of every multi-arrival Work, one row each**: id, timestamp, source kind,
  text hash, length, filename, and `would_have_been_selected` marking the row the old runtime's
  `ORDER BY created_at ASC` would have read. A count would have hidden which candidates the ordering
  was choosing between, and the candidates are the finding.
- **3c** — a **predeclared disposition**, written before any data is read so the reading cannot
  invent it:

> **IDENTICAL** — every arrival carries the same `source_text_hash`. The ordering chose among copies
> of one text; no authorial question is at stake → **deterministic migration**.
>
> **DIVERGENT** — the arrivals differ. The old ordering silently preferred one text over another;
> only the member can say which is their Source → **§VII.8 founder/member reconciliation**.

- **9** — six production shapes the simulation has **not** exercised (orphan sections, cross-member
  claims, empty bodies, very large Works, duplicate positions, refs without hashes). §VII.7 is
  answered by whether any returns non-zero: *a non-zero count does not condemn the backfill; it names
  what must be simulated before cutover.*

Both instruments were exercised end to end against a disposable database carrying the seeded legacy
shapes, and the census's read-only transaction was verified to refuse a write.

## 2. §VII.6 — the exact bounded configuration changes for cutover

Answerable without production, and deliberately small. **None of these is made.**

1. **Apply the PT-3 migration** to production, through the ordinary migrate path so it is attributed
   (`applied_by_authority`, `applied_by_commit`, `applied_run_id`). Creates `maia_app` **with no
   password** — deliberate; a credential minted in a migration file is a credential in version
   control.
2. **Set `maia_app`'s password out of band**, on the host, never in the repository.
3. **Create a runtime-only env file** — e.g. `.env.production.runtime` — containing
   `MAIA_APP_DATABASE_URL` and nothing else.
4. **Give runtime services that file in addition to `.env.production`**, and **remove `DATABASE_URL`
   from them.** `migrate` keeps `.env.production` and does **not** receive the runtime file.
   ⚠️ The app credential must not be added to `.env.production`: every service loads it, and two
   authorities in one universal environment is what §VIII.A refuses.
5. **Restart runtime services** (not a rebuild — an env change).
6. **Re-run the host verifier**; require `READY`.

Code-side prerequisites are already landed and inert: all three pool sites read
`MAIA_APP_DATABASE_URL || DATABASE_URL`, so cutover is a deployment variable rather than a code
change made under pressure.

## 3. What the founder's run needs

```bash
# §VII.1, 2, 7, 8 — the census (read-only; SET TRANSACTION READ ONLY, ends in ROLLBACK)
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' \
  < scripts/witness/pt3-production-legacy-census.sql

# §VII.3, 4, 5 — host inspection (reads container env and catalogues; changes nothing)
ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-cutover-readiness.sh
```

Expected pre-cutover reading: **`NOT YET CUT OVER`**, with `maia_app does not exist` and runtime
running as owner. That is the correct answer today, not a fault.

## 4. Standing

**PT-3 is enforced in code and not in production**, and remains so until runtime executes as the
constrained role. Production mutation, cutover and deployment remain **HELD**. Encounter remains
**HELD** behind this gate. §VII items 1–5 and 7–8 are **owed on the founder's run**, and this return
does not pretend to have answered them.
