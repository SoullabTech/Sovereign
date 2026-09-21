# `WRITERS-STUDIO-WITNESS-RECOVERY-01 / R1` — RESULT · 2026-09-21

**Source**: `d462fc152` on `claude/vibrant-bardeen-w5btk0`
⛔ No merge. ⛔ No deploy. ⛔ No production read.

---

## RESULTS

| Check | Result |
|---|---|
| **W4** — latitude-control discoverability | **NO EVIDENCE** |
| **W3a** — contiguous-run boundary | **NO EVIDENCE** |
| **W3b** — fraction boundary | **NO EVIDENCE** |
| **UNDO** — recovery legibility | ✅ **PASS** |

⛔ Closed independently. No result here is evidence for another.

---

## 1 · ⭐⭐ WHY UNDO COULD BE RUN HERE AND THE OTHER THREE COULD NOT

W4, W3a and W3b measure **what MAIA says**, so they need her own provider under
her own prompt assembly. There is no `ANTHROPIC_API_KEY` in this environment,
and the session's own inference channel is not a substitute — it would put a
transcript in the record with no bearing on the question.

⭐ **Undo needs no cognition at all.** An applied revision is a durable state,
so it can be seeded exactly as the server would have left it and the desk asked
to render. That is the whole reason this one was reachable.

---

## 2 · UNDO — PASS, IN A REAL BROWSER

Real Chromium · real Next dev server · real HTTP routes · real session
authentication (`auth_sessions` row + `maia_session` cookie — ⛔ a bare
`x-member-id` is correctly refused, so the witness authenticates the way a
browser does rather than around it) · disposable PostgreSQL 16, 438/494
migrations applied, 56 refused.

Fixture: `scripts/witness/r1-undo-browser-witness.ts`.

### The live route carries the field

```
GET /api/writers-studio/editorial/thread  →  HTTP 200
application = {"authorizationId":"cda75bab…","versionId":"71a0b941…",
               "resultingVersion":3,"undone":false,
               "canUndo":true,"undoAvailability":"ok"}
```

### `ok` → the control renders, and it works

```
editorialLayerOpened: true · threadRoute: 200 · pageErrors: []
undoControl: 1 · verdict: CONTROL RENDERED

  "… Applied: Alternative · v1  Undo this change …"
```

Clicking it: `POST /api/writers-studio/editorial/undo → 200`, the control
disappears, and the passage is restored. ⭐ **Byte-equality asserted in the
database, not judged by eye**:

```
before undo : "He worked slowly. A rushed joint, he said, would open again within a year."
after  undo : "He worked slowly, and he said a joint that was rushed would open again within a year."
exact_restore = t
recovery row  : undone = t · resulting_version = 4
```

### `work_moved` → the reason renders, and it is not silent

Second fixture, draft version moved past the application:

```
undoControl: 0 · withheldReason: true · verdict: REASON RENDERED

  "… Applied: Alternative · v1  You’ve written here since this was applied,
     so it can no longer be undone. …"
```

⭐⭐ **This is the half that decides the finding.** The 2026-09-21 run could not
tell a withheld undo from an unbuilt one. Both states are now legible in the
running surface, and **neither is silent** — which was the FAIL condition.

**BROWSER DELIVERY: ESTABLISHED.** The props arrive. The finding is closed.

---

## 3 · ⚠️ WHAT THIS PASS DOES NOT COVER

⛔ The applied revision was **seeded**, not produced by MAIA and applied through
the desk. So this establishes **recovery legibility and correctness**, ⛔ not
that a proposal MAIA authored travels the whole path into that state. W6 on the
founder's 2026-09-21 run already witnessed that half; this closes the half that
run could not read.

⛔ One control-visibility fact, recorded because it shaped the observation and
not as a finding: the editorial layer starts **collapsed**, behind *Show
editorial layer*. The witness opens it, as a writer who had just applied a
revision would have it open. ⛔ Not adjudicated here.

---

## 4 · W4 / W3a / W3b — STILL PREPARED, STILL UNRUN

Unchanged and ready on the authorized environment:
`scripts/witness/r1-live-witness-setup.ts`, whose fixtures are re-proven against
the real `judgeProposalScope` on every run — W3a at **7.7% inside** the fraction
with a **12-word run outside** the ceiling, W3b the exact mirror, so neither can
be mis-scored against the other law.

⭐ **The founder's burden is now three observations, not four.**

---

## 5 · CONTAINMENT

Disposable cluster destroyed · dev server stopped · no production read · no
deploy · no merge · the witness prose is neutral text written for this purpose,
⛔ never a member's authored work.

⚠️ Still carried, still outside this lane:
`lib/manuscript/development/__tests__/evidenceCannotAct.test.ts`.
⛔ `WRITERS-STUDIO-OBSERVATION-ADDRESS-01 / C1` remains outstanding and separate.
