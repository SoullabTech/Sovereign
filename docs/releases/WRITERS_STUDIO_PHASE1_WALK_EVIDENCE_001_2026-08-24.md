# Writer's Studio Phase 1 — Walk Evidence Record 001

> **This is the evidence record, not the specification and not an acceptance decision.**
> It records what was observed when the frozen specification was applied. It authorizes
> nothing.

## Run identity

| Field | Value |
|---|---|
| Specification version judged against | **1.0**, frozen 2026-08-24, freezing commit `31cea0e41323b6a19dbc8412cfa3710d034fe0a0` |
| Run | 001 |
| Date | 2026-08-24 |
| Executed by | Claude, under founder instruction: *"Record current canonical as P0 FAIL from already-admissible evidence. Do not execute A–H."* |

### Release candidate — none assembled

⛔ **No release candidate was assembled for this run.** §4 requires the walk to evaluate one
named assembled object; the founder directed that P0 be evaluated against current canonical
before any candidate is built, precisely because a failing P0 makes candidate assembly
premature.

| Field | Value |
|---|---|
| Object evaluated | `origin/clean-main-no-secrets` @ **`dde034483`** (2026-08-24) |
| What it assembles | Nothing — it is the canonical tip, not an assembled candidate |
| Consequence | This run **cannot** produce an acceptance outcome for any candidate. It records one precondition verdict and nothing else |

### Fixture baseline — not applicable

No fixture was selected and none was mutated. P0 is a static precondition evaluated against
the substrate; no member act was performed, so §5's baseline-before-mutation rule was not
engaged. Nothing in this run touched member data.

---

## Verdicts

| Step | Verdict | Evidence | Notes |
|---|---|---|---|
| **P0 — Source custody** | **`FAIL`** | See below | Blocking |
| A — Arrive | `NOT REACHED` | — | Not attempted |
| B — Begin | `NOT REACHED` | — | Not attempted |
| C — Bring in | `NOT REACHED` | — | Not attempted |
| D — Work | `NOT REACHED` | — | Not attempted |
| E — Leave and return | `NOT REACHED` | — | Not attempted |
| F — Save for later | `NOT REACHED` | — | Not attempted |
| G — Keep in my Field | `NOT REACHED` | — | Not attempted |
| H — History and restoration | `NOT REACHED` | — | Not attempted |
| G1 — Felt grammar | `NOT REACHED` | — | Founder gate; follows A–H |
| Final felt criterion | `NOT REACHED` | — | Founder gate |

> `NOT REACHED` is not `PENDING`. These acts were not attempted; they are unknown, not
> outstanding. (§7)

---

## P0 — the failure, with its evidence

**P0 requires:** the candidate preserves what actually arrived independently of any
segmentation or interpretation, and no arriving text may be silently discarded before the
member begins working.

**Both halves fail on `dde034483`.**

### (a) The arrival is not preserved independently of interpretation

| Finding | Evidence |
|---|---|
| The raw import is never persisted | `app/api/sovereign/manuscripts/ingest/route.ts` — *"Extraction only… Nothing is stored here."* The extracted text is returned to the client and never written |
| The only persisted artifact is already an interpretation | `manuscript_sections (manuscript_id, position, heading, body)` — `heading` is regex output from `lib/manuscript/ingest/segment.ts`; `body` is the text that fell between two regex hits. Source and interpretation are one row |
| The draft's provenance hash names the interpretation | `manuscript_working_drafts.base_source_hash` is computed over the **sections**, so it binds the draft to a particular cut rather than to the document |

### (b) Arriving text can be silently discarded before the member begins

`lib/manuscript/ingest/segment.ts`, and again in the save path of
`app/api/sovereign/manuscripts/route.ts`:

```js
if (body.trim().length === 0) continue;
```

A heading line immediately followed by another heading line is dropped **entirely, heading
and all**, before the member ever opens the Work. This is not hypothetical for the manuscript
presently in production: a print-ready export whose front matter is a stack of capitalised
lines is exactly the shape that triggers it.

**No algorithmic operation can recover those characters from `manuscript_sections`.** They are
not there.

### Admissibility

Every item above is **admissible under P0**: substrate facts established by reading canonical
code and schema, evidencing a substrate property. None of it is offered as evidence about a
member's experience, and none of the inadmissible classes were relied on — the verdict does
not rest on `manuscript_sections` being immutable, on a UI label, on section counts, on HTTP
responses, or on the absence of `UPDATE`s.

**This is a correction to the evidence for a founder criterion that existed from the
beginning** — *bring material in, preserve the original source, create a working draft* — not
a criterion invented after the implementation. The earlier reading treated "zero writers to
`manuscript_sections`" as proof of source immutability; Phase 3A established that this was the
wrong referent.

---

## State after this run

```text
WALK SPECIFICATION     FROZEN  v1.0
P0 SOURCE CUSTODY      FAIL
MEMBER WALK A–H        NOT REACHED
G1                     NOT REACHED
FINAL FELT CRITERION   NOT REACHED
FOUNDER ACCEPTANCE     UNAVAILABLE
FREEZE                 REMAINS
```

**The next engineering act is no longer "rerun the walk."** It is a bounded substrate unit
that repairs source custody only, sufficiently for P0 to become runnable — the minimum repair
necessary to make the gate's own criterion satisfiable. That is not authorization to implement
the Phase 3A architecture, merge #995, build Structure, or redesign the Studio.

Scope proposal: `docs/releases/WRITERS_STUDIO_P0_SOURCE_CUSTODY_REMEDY_SCOPE_2026-08-24.md`.
