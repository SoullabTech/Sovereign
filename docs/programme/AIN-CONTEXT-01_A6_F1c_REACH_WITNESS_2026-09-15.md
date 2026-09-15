# `AIN-CONTEXT-01` · A6 · F1c — SERVING-PATH REACH WITNESS

**Date:** 2026-09-15 · **Verdict: 6 passed · 0 failed — reach WITNESSED for the paths the router exercised**
**Authority:** founder adjudication 2026-09-15, R6 items 2, 3, 4
**Instrument:** `tests/constitutional/ain-context/f1c-a6-serving-reach.ts`

---

## 1. Method — a stub at the wire, nothing else replaced

A loopback HTTP server implements Ollama's `POST /api/chat` and records every payload.
`OLLAMA_BASE_URL` points at it; `MAIA_TEXT_PROVIDER=local` selects that branch.

⛔ **No source modified. No provider called.** Real `getMaiaResponse`, real router, real
tier functions, real prompt assembly — only the transport is replaced, downstream of
everything A6 touches. Same containment the S3 lane used.

Fixture: **200 completed exchanges in ONE active session**, disposable UTF8 shadow.

---

## 2. Result

```text
probe=short   profile=FAST   wireCalls=3   expectedDepth=200  a6Delivered=true   depth=200 represented=3 absent=197
probe=simple  profile=FAST   wireCalls=2   expectedDepth=201  a6Delivered=true   depth=201 represented=3 absent=198
probe=deep    profile=DEEP   wireCalls=10  expectedDepth=202  a6Delivered=false

F1c: 6 passed · 0 failed
```

### 2.1 ⭐⭐ R6-2 — A6 REACHES FAST. Witnessed.

The block arrived at the wire on the tier ACT 1 established serves most turns, carrying:

- **depth 200 / 201** — the authoritative count. ⛔ A window-derived value could not exceed
  11; F1a's saturation is gone on a real serving path, not just in a unit harness.
- **represented 3** — the FAST aperture (`slice(-3)`), ⛔ not the 10-exchange server read.
  R1 satisfied on the live path.
- **absent 197 / 198** — `depth − represented`, exactly.

### 2.2 ⭐ R6-4 — `getMaiaResponse` threads the carrier. Witnessed.

An authoritative depth of 200 at the wire is reachable **only** through
`durableCompletedExchanges`, read in `getMaiaResponse` and passed to the tier function.
⭐ The number at the wire is itself the proof of the thread — nothing else could have
produced it.

⭐ And the depth **advances across probes** (200 → 201 → 202) because each served turn
persists its own exchange. The carrier is live, not a constant.

### 2.3 ⛔⛔ R6-3 — DEEP primary does NOT receive A6. Witnessed, not assumed.

The router selected DEEP for the third probe. **Ten wire calls; none carried the block.**

This **confirms by measurement** the static reading in the adjudication (§2 there):
`ConsciousnessContext` has no addenda carrier (§II.C divergence), and DEEP's
`sessionMetadata.turnCount` is declared and never read.

⛔ **Not repaired.** Per R5 this is recorded and routed out, not absorbed under A6's
authority.

---

## 3. ⚠️ The instrument was wrong first, again — and the failure was informative

The first F1c run reported `depth=201 expected=200` and scored it a FAIL.

**201 was correct.** `getMaiaResponse` persists the exchange it serves, so depth advances
with every probe; the instrument was comparing against the seed constant. Corrected to
read the durable count before each probe.

⭐ ⚠️ **This is the third instrument defect in this act** (two in F1b, one here) against
**one** product defect. ⛔ Worth stating plainly rather than burying: *every one of them
would have produced a wrong verdict in the permissive direction had the check been
written slightly differently.* The F1b nonexistence probe would have failed a correct
product; this one did fail a correct product. The discipline that keeps catching them is
refusing to accept a result whose fixture has not been independently established.

---

## 4. Scope — what this does and does not establish

**Witnessed:** FAST delivery at the wire with true numbers · threading · DEEP primary
non-delivery · the router's real selections.

**Not exercised:** CORE was not selected by the router on these probes. ⛔ Reported as
NOT EXERCISED — it is not evidence either way here, though F1b witnessed the CORE
contract directly. DEEP's *repair* path was not triggered.

⛔ Per R3: this witness proves delivery to the wire. It does not prove compilation of
untouched files, nor behaviour of paths the router did not select.

---

## 5. Acceptance ledger after F1c

```text
1  project type/build gate        ✅ PASS — see §5.1
2  A6 reaches FAST                ✅ WITNESSED
3  actual DEEP standing           ⛔ WITNESSED AS NOT REACHED (primary path)
4  getMaiaResponse threading      ✅ WITNESSED
```

### 5.1 ⭐ Project gate — RUN AND PASSED

Full `node_modules` was installed in this container, so the real gate ran:

```text
npm run typecheck
TypeScript no-regression gate — tsconfig.ship.json
  program files : 4281 (baseline 3965)
  errors        : 229 (baseline 239)
✨  10 error(s) fixed since the baseline
✅  No TypeScript regressions.
exit 0
```

⭐ This supersedes the acceptance record's "project typecheck gate OWED". ⚠️ It is the
**no-regression** gate, not proof that everything typechecks — 229 pre-existing
diagnostics remain, as `CLAUDE.md` describes. ⛔ The baseline was NOT re-recorded: the
10 fixes are incidental to program-membership changes, and re-baselining is a governed
act this lane has no authority to perform.

---

⭐ Item 3 is **discharged as a witness** — the founder asked for the *actual standing*,
and the actual standing is non-delivery. ⛔ It is not discharged as *coverage*: A6's
accepted coverage must state FAST and CORE, and exclude DEEP primary.

---

## 6. Standing

```text
F1c                    6 passed · 0 failed
FAST                   A6 DELIVERED · witnessed at the wire
CORE                   witnessed by F1b · not exercised by this router run
DEEP primary           ⛔ A6 NOT DELIVERED · witnessed · ⛔ NOT REPAIRED · routed out
DEEP repair path       not exercised
Instrument defects     3 across the act · all recorded · none silent
Shadow                 DESTROYED
Production             UNTOUCHED
```
