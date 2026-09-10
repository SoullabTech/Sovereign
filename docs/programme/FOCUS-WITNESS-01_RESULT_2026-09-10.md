# FOCUS-WITNESS-01 · RESULT

```text
SUBJECT     cbbb53dc694d298e97873d95c139cd3ec9253c2e   ⛔ UNALTERED
DISPOSITION (i) — founder, 2026-09-10 · run W0–W3 · W4/P10 deferred
RESULT      TECHNICAL CROSSING PASS · PHENOMENOLOGY DEFERRED — SUBJECT HAS NO SURFACE
            15 passed · 0 failed
```

⛔ **NOT A FULL PASS, and must never be recorded as one.**

---

## The run, verbatim

```text
PASS  W0.1    the member owns exactly one addressable seeded Work
PASS  W0.2    3 draft sections seeded
PASS  W0.3    no pre-existing Focus crossing for this member
PASS  W1.1    the Focus route is reachable in the witness environment
PASS  W1.2    the authenticated identity resolved through the real seam
PASS  W1.3    HTTP 200
        §3a state: "crossed_accounted"
PASS  W2.1    1 receipt(s) for this act
PASS  W3.1    boundary=manuscript_prose->maia_cognition
PASS  W3.2    source=work/3c5dfa52-60a2-482c-9100-d649ea65e55b
PASS  W3.3    scope=section sectionRef=the section that crossed
PASS  W3.4    state=crossed
PASS  W3.5    authorized_by=member gesture=work_with_this
PASS  W3.6    the receipt names a real consent-state row
PASS  W3.7    the receipt is content-free
PASS  W3.8    an ungoverned DELETE of this receipt is refused
15 passed · 0 failed
✅ FOCUS-WITNESS-01 · TECHNICAL CROSSING PASS · PHENOMENOLOGY DEFERRED — SUBJECT HAS NO SURFACE
```

---

## Independent read of the durable evidence

Not the witness reporting on itself — the receipt, read directly from DB-B:

```text
disclosure_id  ed52a3da…      boundary  manuscript_prose->maia_cognition
scope_kind     section        section_ref  present
state          crossed        authorized_by  member
gesture        work_with_this
```

---

## What was proved, exactly

```text
W1 PROVES        authenticated application request → real identity seam
                 → real disclosure boundary → real capability
                 → real capability-bound assembler → governed custody
                 → truthful durable evidence

W1 DOES NOT      how a writer encounters Focus
PROVE            whether Focus feels native to WRITE
                 whether navigation / orientation is preserved
```

⭐ The application caused the crossing. The witness called no assembler, minted no
authority, and inserted no receipt.

⭐ **W3.8 asserts the guard rather than trusting the script**: it attempts an
ungoverned DELETE of its own receipt and requires the refusal. The refusal came
from `context_disclosure_receipt_governed_delete()`, in the database.

---

## ⚠️ THE FIRST ATTEMPT FAILED, AND THE FAILURE IS PART OF THE RECORD

```text
FAIL  W1.3    HTTP 400
FAIL  W2.1    0 receipt(s) for this act
```

The candidate requires a client-supplied `actId` — **F1k, ratified**: only the
surface that watched the writer press the button knows whether a request is that
press again or a new one, so the boundary must not infer it. The walk omitted it.

⛔ **That was an INSTRUMENT defect, not a candidate defect** — the same staleness
the assembler gate had, a walk written against an older request contract. The
instrument was corrected; **the subject was not touched.** The correction and its
reason are recorded in the script itself, not silently overwritten.

⭐ *A witness that had "passed" by relaxing the route's requirement would have
proved the opposite of what it came to prove.*

---

## ⛔ W4 / P10 · DEFERRED, NOT WAIVED

No member-reachable Focus surface exists at `cbbb53dc6`; every non-test reference
to `/api/writers-studio/focus` is the server describing itself. Asking a human
whether Focus *felt like remaining with the Work* would have produced an answer
about reading JSON.

```text
W4   NOT ANSWERABLE ON THIS SUBJECT
P10  TRANSFERRED to D9-PHENOMENOLOGY-WITNESS-01
```

**The claim "the writer remains with the Work" still has to lose or survive
later.** This result does not touch it.

---

## Environment

```text
DB-B    disposable PostgreSQL 16.13 · schema from repository truth
        (baseline 634 tables + full migration ledger) · seeded Work · seeded
        credential · destroyed after the run
APP     the candidate's own runtime — `git diff cbbb53dc6 --name-only` touches
        only docs/ and scripts/witness/; no lib/, no app/, no component
FLAG    WRITERS_STUDIO_FOCUS_ENABLED=1 in the witness environment ONLY
```

⛔ **No runtime-generated refusal or audit output is staged or committed as part
of this record**, per the witness evidence rule. The receipt exists in DB-B and
died with it.

⚠️ The witness session token was printed to the operating transcript by the
fixture. It was scoped to DB-B, granted nothing outside it, and died with the
database — the same disposal this lane applied when a credential last reached a
transcript.

---

## Standing

```text
FOCUS-WITNESS-01     SPENT · W0–W3 · TECHNICAL CROSSING PASS
                     PHENOMENOLOGY DEFERRED
CANDIDATE            cbbb53dc694d298e97873d95c139cd3ec9253c2e · UNALTERED
D9-PHENOMENOLOGY-WITNESS-01   UNRUN · now carries W4/P10

MERGE                NOT AUTHORIZED
DEPLOY               NOT AUTHORIZED
PHASE 4 UI           PAUSED · 4be90954e preserved
PRODUCTION           5f65038d2 · Focus OFF · untouched
```
