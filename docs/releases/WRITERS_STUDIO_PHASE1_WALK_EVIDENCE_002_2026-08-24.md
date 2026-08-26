# Writer's Studio Phase 1 — Walk Evidence Record 002

> **Standing, as of the v1.1 amendment (founder, 2026-08-24).** This run was judged against
> specification **v1.0**, where P0 was a single criterion, and its findings stand exactly as
> recorded — §3.3 judges a run against the version frozen before it began, and this record is not
> re-judged. Under **v1.1** the verdict below reads as **P0-M PASS** (mechanism). **P0-D**, the
> deployed-candidate witness, is owed, and **P0 as a whole is therefore not yet closed.** Nothing
> in this record is withdrawn; what it did not prove is now named rather than assumed.

> **This is the evidence record, not the specification and not an acceptance decision.**
> It supersedes nothing in record 001; 001 recorded P0 against canonical, this records P0
> against an assembled candidate. It authorizes nothing.

## Run identity

| Field | Value |
|---|---|
| Specification version | **1.0**, frozen 2026-08-24; freezing commit `75570b46b71c4c7c676b7941f4ba34be63106122`, sealed by `49f5a8af8` |
| Run | 002 |
| Date | 2026-08-24 |

### Release candidate — assembled

| Field | Value |
|---|---|
| **Candidate SHA** | `151fe794582fb2099de8a498d58c6886ff5f20ed` — the WS-01 implementation commit, which is the tree this run judged. This record and the v1.1 amendment follow it on the branch; a record never names its own commit. |
| Branch | `feature/ws-01-source-custody-v2` |
| Base | `9be736aa2258556c8aac955729e85f3de9bcdcdc` (canonical, incl. PR #1076) |
| What it assembles | Four transplanted commits: frozen spec · seal · master brief + WS-01 unit definition · WS-01 implementation |
| Assembled by | Fresh branch from the canonical base, commit-by-commit. The historical R&D branch was **not** rebased and **not** merged |

### Candidate gate — PASS

The cumulative diff against the base contains **none** of the prohibited surfaces:
`app/writers-studio/canvas/**` (Worktable, StructureRail, page, manuscriptMap, WritingSurface) ·
`components/canvas/**` · `app/book-studio/**` · any PR #995 implementation. Fourteen files, all
within WS-01's declared scope.

### Fixture baseline

A disposable fixture member, created and destroyed inside the witness run. **No real member's
manuscript was used.** Baseline recorded before any write: the fixture did not exist.
Environment: local PostgreSQL 16.13 + a local file vault, not production.

---

## Verdicts

| Step | Verdict | Notes |
|---|---|---|
| **P0 — Source custody** | **`PASS`** | 26 controls, all passed. See below |
| A–H | `NOT REACHED` | The human walk has not been executed |
| G1 · final felt criterion | `NOT REACHED` | Founder gates |

---

## P0 — the evidence

Migration `20260824000001` applied to a real PostgreSQL 16 database, then **applied a second
time and completed cleanly** — idempotent, as the repository's migration convention requires.

### File-backed leg

| # | Control | Result |
|---|---|---|
| 3 | Source arrival row exists | PASS |
| 4 | Persisted with artifact custody, before any interpretation | PASS |
| 6 | `SHA-256(recovered from vault) === SHA-256(arrived)` | PASS |
| 6b | Recovered bytes byte-for-byte identical | PASS |
| 7 | Source text stored independently, with its own hash | PASS |
| 7b | For a plain-text artifact the two hashes coincide — evidence the decode/encode round-trips with **no silent normalization** | PASS |
| 7c | For a non-identity extraction the two hashes **diverge**, so a changed extraction stays distinguishable from a changed artifact | PASS |
| 8 | Extractor identity and version recorded | PASS |
| 9 | Manuscript claims the correct arrival; labelled `source_custodied` | PASS |
| 10 | `verifyCustody` → PASS (`artifact_recovered`) | PASS |

### The negative leg — what makes the ruling load-bearing

The stored artifact was deleted while every database column was left intact.

| Control | Result |
|---|---|
| `verifyCustody` → **FAIL** (`artifact_missing`) | PASS |
| The hash was still in the database, so the refusal was not incidental | PASS |

**A hash without recoverable bytes is not accepted as source custody.** Verification reads the
bytes back and re-hashes them; it does not take the row's word.

### Pasted leg

`source_kind = member_supplied_text` · `artifact_ref`, `artifact_hash`, `artifact_size`,
`original_filename` all NULL · source text exactly as confirmed · custody PASS. And an attempt to
give a paste artifact provenance was **refused by the database** (`manuscript_source_arrivals_kind_fields`),
not merely by convention.

### Omission witness

Fixture `TITLE / SUBTITLE / AUTHOR NAME / First real paragraph.` — the shape that made the
known-bad implementation drop consecutive headings.

```text
arrived lines    4
accounted lines  4
lossless         true
```

The stored source witness still contains every arriving line.

### Reproducibility

`scripts/verify-ws01-source-custody.ts`, guarded behind `WS01_WITNESS_CONFIRM=1`.

---

## Scope of this verdict — what P0 PASS does and does not mean

**Proven:** the mechanism, against a real PostgreSQL and a real filesystem vault, through the
real migration and the real code paths, including the negative leg.

**Not proven, and not claimed:**

- **Not the production deployment.** Nothing was deployed or migrated on minisforum. This
  container has no route to it.
- **Not through the member's HTTP path.** The witness calls the library functions directly. The
  member-facing import path is walk act **C**, and remains `NOT REACHED`.
- **Not on a real manuscript.** *Elemental Alchemy* is deliberately not the first fixture; it
  becomes a later real-manuscript witness once the mechanism is proven in place.

---

## One base defect found, outside WS-01

The typecheck no-regression gate **fails on the canonical base itself**, at
`9be736aa2`, with two diagnostics in `app/api/studio/personal/enter/route.ts` (from PR #1076's
identity-resolver merge). Verified by running the gate on the bare base with the candidate
checked out nowhere near it. **The candidate introduces no new diagnostics** — it is exactly as
green as its base, and its base is red. That file is outside WS-01's allowed scope, so it was
not touched; per §31 it is reported rather than routed around.

---

## State after this run

```text
WALK SPECIFICATION     FROZEN v1.0
CANDIDATE              151fe794582fb2099de8a498d58c6886ff5f20ed
CANDIDATE GATE         PASS
P0 SOURCE CUSTODY      PASS  (mechanism; production and member path still owed)
MEMBER WALK A–H        NOT REACHED
G1 / FINAL CRITERION   NOT REACHED
FOUNDER ACCEPTANCE     UNAVAILABLE
CANVAS FREEZE          REMAINS — P0 opens the human walk; it does not lift the freeze
BASE TYPECHECK GATE    RED, pre-existing, outside WS-01
```
