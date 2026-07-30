# Author Writing Walk — Founder, 2026-07-30

**Status**: record awaiting the walk · **Class**: observation only, no-build, doc-only
**Governs nothing.** Q1 (governing experience instrument) is unruled. This artifact does not
rule it, does not compare instruments, and confers no authority. Recommendations are
**not authorized** here — if something fails, the entry is *what happened*, not *what to change*.

---

## 0. Classification — every entry gets exactly one

Ratified by Kelly, 2026-07-30. Prevents a future reader from treating *not observed* as
*passed* or *failed*.

| Classification | Meaning |
|---|---|
| **Observed** | The experience can be judged from this walk. |
| **Substrate** | The observation is explained by a known substrate condition (C1–C3 below). |
| **Governance** | The question cannot presently be answered because of an intentional governance constraint. |
| **Unknown** | Something occurred, but there is insufficient evidence to classify it. |

An unclassified entry is not usable as evidence. **Unknown** is a legitimate result — it means
the walk raised a question it could not answer, and it is recorded as such rather than forced
into one of the other three.

---

## A. Observer constraints (verified 2026-07-30 on working tree)

Three known **SUBSTRATE** conditions. A failure traceable to one of these is **not an experience
finding** — it is a known gap. Record it as such.

| # | Condition | Evidence | Walk question it can corrupt |
|---|---|---|---|
| C1 | **Imported work is not stored.** `import-docx` writes the upload to `os.tmpdir()`, converts, deletes the temp dir in `finally`, and returns JSON. Nothing persists server-side. | `app/api/book-studio/import-docx/route.ts:58,60,80,87` | "Can you bring work into it?" |
| C2 | **Drafts persist to the container filesystem, not Postgres.** `drafts/from-idea` does `fs.mkdir` + `fs.writeFile` to a drafts dir. In Docker this is container-local — **a rebuild or redeploy erases it.** | `app/api/book-studio/drafts/from-idea/route.ts:40,57` | "Can you leave with confidence?" · "Can you return and feel reconnected?" |
| C3 | **One workbench is reachable; there is no chooser.** `findOrCreateTable` selects `ORDER BY updated_at DESC LIMIT 1`, else inserts. A second table can exist in the DB and be unreachable from the page. | `app/book-studio/workbench/page.tsx:24-40` | "Does the software become the thing you're thinking about?" |

**C2 is the one to hold in mind.** If a deploy happens between leaving and returning, the room
will appear to have forgotten you. That would be the most damaging possible false finding.
Note the time of the walk; note whether a deploy occurred between sessions.

## B. What the founder seat cannot answer

`/book-studio/workbench` calls `requireFounder()` (`app/book-studio/workbench/page.tsx:45`), and
`/press` is public while "the editorial workspace stays founder-gated at `/book-studio`"
(`config/accessMatrix.ts:56`).

So **question 1 — "Can you find the room naturally?" — is structurally unanswerable from this
seat.** The walker both knows where the room is and holds the only credential that opens it.
This is a **GOVERNANCE** constraint, not a defect and not a finding: the environment is
*intentionally* founder-gated today. Answering question 1 requires a non-founder walker, which
is not currently authorized. Do not record a pass. Do not record a fail.

Questions 2–6 are answerable from the founder seat.

## C. The record

> **The purpose of this walk is to learn whether the current experience supports the founder's
> writing practice. It is not an acceptance test, a usability review, or a design exercise.**

Kelly's six questions, verbatim. **Interpretation is left blank on purpose** — it is authored
later, under the instrument selected at Q1, not during the walk.

---

**Question 1 — *Can you find the room naturally?***
- Observation: —
- Classification: **Governance** — not observable this walk (see §B)
- Evidence: `app/book-studio/workbench/page.tsx:45` · `config/accessMatrix.ts:56`
- Interpretation: *(leave blank)*

**Question 2 — *Can you bring work into it?***
- Observation:
- Classification:
- Evidence:
- Interpretation: *(leave blank)*

**Question 3 — *Can you begin writing without hesitation?***
- Observation:
- Classification:
- Evidence:
- Interpretation: *(leave blank)*

**Question 4 — *Can you leave with confidence?***
- Observation:
- Classification:
- Evidence:
- Interpretation: *(leave blank)*

**Question 5 — *Can you return and feel reconnected?***
- Observation:
- Classification:
- Evidence:
- Interpretation: *(leave blank)*

**Question 6 — *At any point, does the software become the thing you're thinking about instead
of the work?***
- Observation:
- Classification:
- Evidence:
- Interpretation: *(leave blank)*

---

**If one fails, the next line is "What happened?" — nothing else.**

### Session log


- Walk start (date/time):
- Deploy occurred between sessions? (Y/N):
- Return session (date/time):

---

## D. Appendix — the actual route graph today (observation only)

Verified 2026-07-30 by static link analysis. **This records what exists. It proposes nothing.**

### The addresses

| Address | Gate | What it is |
|---|---|---|
| `/press` | public | Soullab Press **public landing** (`app/press/page.tsx`) |
| `/book-studio` | public | Editorial workspace index |
| `/book-studio/read` | public | Manuscript reader |
| `/book-studio/passages`, `/illustrations`, `/design-system` | public | Reference surfaces |
| `/book-studio/ready-to-write` | `requireFounder()` | |
| `/book-studio/workbench` | `requireFounder()` | |
| `/book-studio/canvas` | `requireFounder()` | |
| `/book-studio/render` | `requireFounder()` | |
| `/book-studio/drafts/*` | `requireFounder()` | |
| `/soullab-studio` | public | Public landing; practitioner app gated at `/studio` |
| `/studio` | `minTier: free` | Practitioner app — a **different** studio |

### Two facts that matter more than the diagram

**1. `/press` has zero inbound links and zero outbound links.**
Nothing in `app/`, `components/`, or `lib/` links to `/press`. `app/press/page.tsx` renders
`PublicSectionLanding` and contains no `href`. Its own source comment states its purpose:
*"the outward face a share card or deck CTA can point at."*

`/press` is **not a navigation node.** It is an OG-card destination. It is not failing to carry
a writer journey — it was never placed in the navigation graph.

**2. There is no public path to any writing surface.**
The only link from the public landing into the editorial area is
`components/landing/BookAnnouncement.tsx:55` → `/book-studio/read` — the manuscript **reader**.
Every surface where writing actually happens is `requireFounder()`.

### The real graph

```
Home ──(BookAnnouncement)──► /book-studio/read          [read Elemental Alchemy]

/press ──────────────────────► (nothing)                 [share-card landing, orphan by design]

Any writing surface ─────────► requireFounder()          [founder only]
```

**Consequence.** "Define one canonical author entry point" cannot be executed today, because
there is no authorized non-founder writing environment for it to point at. That is a
**Governance** constraint (§0), not a navigation defect. It is the same constraint that makes
Question 1 unanswerable from the founder seat.

