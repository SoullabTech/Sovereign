# Author Studio Authenticated Writing Walk — Acceptance Design & Verification Plan

**Status: DRAFT proposal — planning-only. Nothing here is fixed criteria.**
Authorized 2026-07-31 for *acceptance-design and verification planning only*. No
implementation, execution, or completion is authorized. Awaiting founder ratification
before any of this becomes binding.

---

## 0. Scope guard

- This document **designs** what the walk must show and **plans** how it would be verified.
  It collects no evidence and runs no walk.
- Per the 07-30 ruled sequence ("A stands"), the authenticated writing walk is **Kelly's
  act, not Claude's**. This plan therefore describes a walk the *founder* performs; my role
  ends at design + facilitation.
- Execution is a **separate authorization event** and must resolve the open questions in §5.
- This document has its own proper silence: it may propose candidate acceptance evidence,
  but it may not establish acceptance criteria, collect evidence, or interpret results.

## 1. Governance anchors (compose with; do not replace)

1. **One ruled walk vocabulary** — the four-way classification is the *only* one
   (Kelly, 07-30): **Observed · Substrate · Governance · Unknown**. The competing
   two-class "Experience / Substrate / Constitutional" scheme was **withdrawn**. The
   experience/system orientation offered 07-31 is honored as **aliases**, not a new scheme:
   *Experience → Observed*, *System → Substrate*, *Constitutional → Governance*.
2. **"Not observed" must never later read as passed or failed.** Every entry gets exactly
   one class; interpretation is **left blank during the walk**, authored later under the
   selected instrument (Q1).
3. **Existing protocol is canonical:** `docs/reviews/AUTHOR_WRITING_WALK_2026-07-30.md`
   (PR #827, merge `394a57297`). This plan extends it to the *authenticated writing cycle*;
   it does not restate or override it.
4. **Pre-walk provenance:** pull the canonical files before walking (a pasted copy is not
   the artifact).
5. **Evidence-status ruling:** browser-walk observations are *reported context*, not
   established evidence, until a durable repository source exists.

## 2. Verified substrate constraints (observed in this checkout, 2026-07-31)

- **Auth gate** — `requireFounder()` at `app/book-studio/page.tsx:89`. The workbench is
  founder-only; `/press` is public. → **Q1 ("find the room naturally") is unanswerable from
  the founder seat** (Governance, not a pass); it needs a non-founder walker (not authorized).
- **C1** — imported source is *not stored*: `import-docx` → `os.tmpdir()`, convert, delete in
  `finally`.
- **C2 (dominant risk)** — drafts persist to the **container filesystem**
  (`docs/book-studio/drafts/<slug>.md`, `fs.writeFile` under `process.cwd()`), **not Postgres**.
  A deploy between save and return erases them → the most damaging possible false finding
  ("the room forgot me"). The verification plan MUST record deploy state around the walk.
- **C3** — one workbench, no chooser (`ORDER BY updated_at DESC LIMIT 1`).
- **No recovery / restore / autosave surface exists** (grep: none). "Recovery behaves as
  designed" has **nothing to test** → Substrate/Governance, never an Observed pass.
- **Source/render** — `render/epub` reads a **pinned** file
  (`docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`), separate from the draft store.
  "Source preserved" must be defined against this, not assumed to mean the draft store.

## 3. Candidate acceptance evidence (in the ruled vocabulary)

*Candidate* — not proposed, not authorized, not ratified. These have not become the
acceptance criteria. Each candidate names the walk moment and the class it would land in.
**None is pre-marked pass/fail.** Substrate evidence may explain an observation. It may
never substitute for one.

### Experience lens → Observed class
- **A1 Open the book** — the author reaches the workbench and their book is present.
- **A2 Write naturally** — text can be composed in the Working Draft without fighting the tool.
- **A3 Save & return with continuity** — after leaving and returning, the work is intact.
  *(Interpretation bounded by C2 — see V4.)*
- **A4 Feels like writing a book, not operating software** — subjective, recorded as Observed
  (expectation / surprise / friction), interpreted later.

### System lens → Substrate class (support, do not substitute)
- **S1 Authentication succeeds** — `requireFounder()` admits the founder seat.
- **S2 Persistence locus & survival** — which file the draft wrote to, and whether it survived
  (paired with the deploy check, C2).
- **S3 Source preservation** — defined against the pinned-file render path, not the draft store.
- **S4 Recovery** — **no mechanism exists**; recorded as Substrate/Governance (a gap to name,
  not a test to pass).
- **S5 DB state / no unintended mutations** — enumerate what the writing cycle actually touches.
  Drafts are filesystem, not DB, so "DB state matches model" is largely **N/A for drafts** and
  must be stated as such rather than fabricated.

## 4. Verification plan (how the walk would produce this — NOT executed)

- **Seat matrix** — mark each question by the seat that can answer it. Q1 (find-the-room) is
  **Governance-blocked** from the founder seat; defer to a separately authorized non-founder.
- **V0 Provenance** — pull canonical `docs/reviews/AUTHOR_WRITING_WALK_2026-07-30.md` +
  book-studio routes first; record the production SHA and canonical HEAD.
- **V-deploy guard (C2)** — record deploy state **before** and **after** the walk. A deploy
  between A2 (save) and A3 (return) **invalidates** the continuity observation; note it rather
  than reading it as "forgot me."
- **Step sequence (author journey):** authenticate → open workbench (A1/S1) → compose (A2) →
  save (record S2 path) → leave → *(elapse / new session)* → return (A3, under deploy guard) →
  attempt source/render (S3) → observe recovery affordances (S4 = absent) → note DB touch (S5).
- For each step record: **what was experienced** (Observed), **the substrate fact** that may
  explain it (Substrate), leaving **interpretation blank** during the walk.

## 5. Open questions the execution-authorization must resolve (NOT decided here)

1. **Who is the authenticated author for execution?** Founder seat answers most of A1–A4/S1–S5;
   **Q1 needs a non-founder** — authorize a walker, or record Q1 as permanently Governance-blocked
   for this pass.
2. **May execution write real draft data to production** (persists to the prod container FS)?
3. **Cleanup policy** for any walk artifacts — mirrors the still-paused synthetic-identity
   decision; decide before, not after.
4. **Prerequisite?** The open **Declared/Enforced middleware + `config/accessMatrix.ts` sweep**
   is unfinished — is it a gate on this walk or parallel?
5. **Instrument (Q1)** — which governing experience instrument applies remains **unruled**; the
   spec is not evolved until after the walk selects it.

## 6. Explicit non-actions (this document)

No criteria fixed · no evidence collected · no walk run · no code changed · no deploy · no
cleanup performed. This is a proposal for your sign-off, composing with existing canon.
