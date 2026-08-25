# WS-01 — Source Custody + Freeze Release · Unit Definition

> **Scope established. Not implemented.** Per §26 of the master brief and the founder's WS-01
> step 8: *"Do not implement that repair until its scope is established."*

| Field | Value |
|---|---|
| **Canonical SHA** | `dde034483` (`origin/clean-main-no-secrets`, 2026-08-24) |
| **Objective** | Make **P0 — Source custody** satisfiable, so the frozen acceptance walk becomes executable. Nothing else. |
| **Binding rulings** | Master brief §4–§7 · Phase 3A contract + Amendment 1 (A1.1 two witnesses, A1.2 legacy not source, A1.3 coordinates, A1.4 snapshot-before-restore) · walk specification **Frozen v1.0** P0 |
| **Gate state** | P0 = `FAIL` (evidence record 001). Freeze **remains**. |

---

## 1. Premise-changing finding — the arrival has three paths, not one

The remedy scope of 2026-08-24 assumed one import path. Reading the client flow shows three,
with **different capture points and different honest provenance**. Reported per §27; it does not
invalidate WS-01, it sizes it.

```text
1. .docx / .pdf    → POST /api/sovereign/manuscripts/ingest   (server sees the artifact bytes)
                     → returns { text } · NOTHING PERSISTED

2. .txt / .md      → read in the BROWSER (app/press/manuscript/page.tsx:369)
                     → the artifact never reaches the server at all

3. paste / typing  → no artifact exists
```

All three then converge:

```text
draftText  (a member-EDITABLE textarea)
   → POST /manuscripts { title, text }   → returns segmented preview · NOTHING PERSISTED
   → member edits the cuts in the confirm-cuts UI
   → POST /manuscripts { title, sections } → FIRST AND ONLY WRITE
```

**Three consequences:**

1. **The true arrival exists only in the ingest request.** Anything the client sends afterwards
   may legitimately have been edited by the member. A later capture is not "what arrived."
2. **Paths 2 and 3 have no server-visible artifact.** For them the honest arrival witness is the
   text the member submitted — which satisfies P0 (there was no extraction step to lose
   anything), but **cannot** support A1.1's *"run a better extractor against the original."*
3. **Two provenance classes are required**, and conflating them would manufacture provenance:

   | Class | Meaning |
   |---|---|
   | `artifact_extraction` | Artifact captured; extractor named; source text is its output |
   | `member_supplied_text` | No artifact captured; source text is what the member submitted |

---

## 2. The repair

Four parts, each independently revertible.

### 2.1 Persist the arrival before interpretation runs

- **Path 1**: the ingest route persists the arrival at the moment it extracts — artifact
  provenance (+ bytes, pending §5) and the extracted text — and returns an identifier.
- **Paths 2–3**: the arrival is persisted at the first `POST /manuscripts { text }` call, before
  `segment()` is invoked, classed `member_supplied_text`.
- The save step **links** the created manuscript to its already-persisted arrival. It does not
  create one, because by then the text has passed through two editable surfaces.

### 2.2 Make the arrival → sections path lossless

Root cause, confirmed: the discard exists to satisfy a schema constraint.

```sql
body text NOT NULL CHECK (length(body) > 0)   -- manuscript_sections
```

A heading followed immediately by another heading yields an empty body, which the schema
forbids — so `segment()` and the save path skip the row, taking the heading with it. **An orphan
heading has nowhere lawful to go.** The repair carries it into the following section's body.
**No schema change**: the `CHECK` stays, because empty bodies stop being produced.

### 2.3 Omission detection

A verification that reassembles what the member is given and compares it against the persisted
arrival, reporting divergence. This is the artifact the walk cites for P0 — and per §28 it must
be shown capable of **failing**: it has to detect an introduced omission, not merely agree with
a correct pipeline.

### 2.4 Legacy provenance, labelled honestly

Existing manuscripts are marked interpreted-import of unknown fidelity — **never source**
(A1.2). Nothing offers "original restored" for them. This includes the manuscript in production,
whose dropped lines are unrecoverable.

---

## 3. File scope

**Allowed:**

| File | Change |
|---|---|
| `database/migrations/<new>_source_custody.sql` | New tables/columns for arrivals; **additive only** |
| `app/api/sovereign/manuscripts/ingest/route.ts` | Persist the arrival for path 1; return its identifier |
| `app/api/sovereign/manuscripts/route.ts` | Persist the arrival for paths 2–3 on the preview call; link it on save; carry orphan headings forward |
| `lib/manuscript/ingest/segment.ts` | Carry orphan headings forward instead of dropping them |
| `lib/manuscript/ingest/` *(new module)* | Arrival hashing, provenance classing, omission comparison |
| `app/press/manuscript/page.tsx` | Thread the arrival identifier from ingest → preview → save. **No UX change** |
| `__tests__` beside each of the above | The controls in §4 |

**Prohibited** (unchanged from the brief): PR #995 · `Worktable.tsx` · the drawer spine ·
`components/canvas/**` · `app/writers-studio/canvas/**` · `/book-studio/**` · Structure ·
publication UX · any rename · any Studio UX change.

⚠️ `app/press/manuscript/page.tsx` is on the allowed list **for identifier threading only**. It
is a member-facing surface; any visible change there would pull the design-canon gate and the
Manuscript Room contract into a substrate unit. If the threading cannot be done invisibly, stop
and report.

---

## 4. Acceptance controls

Pre-registered before implementation, per §28 — each phrased so a wrong implementation fails it.

| # | Control | Fails on the known-bad baseline? |
|---|---|---|
| 1 | Importing persists the arrival **before** any segmentation runs | Yes — nothing is persisted today |
| 2 | The persisted arrival is byte-identical to the extractor's output | Yes |
| 3 | `sourceArtifactHash` and `sourceTextHash` are recorded and **distinct** | Yes — neither exists |
| 4 | Extractor identity and version are recorded | Yes |
| 5 | A fixture with consecutive heading lines (capitalised front matter) loses **no** line | **Yes — this is the reproduction of the live defect** |
| 6 | The omission check reports zero divergence for a clean import | No — weak alone |
| 7 | The omission check **detects** an artificially introduced omission | **Yes — this is what makes 6 meaningful** |
| 8 | A `member_supplied_text` arrival is never labelled `artifact_extraction` | Yes |
| 9 | Existing manuscripts are labelled interpreted-import and are not presented as source | Yes |
| 10 | No existing draft's text changes as a result of this unit | — regression guard |
| 11 | `manuscript_sections` remains immutable after creation | — regression guard |

---

## 5. Migration implications

- **Additive only.** New tables/columns. No `ALTER` of `manuscript_sections`, no backfill that
  invents provenance, no destructive step. The `CHECK (length(body) > 0)` is **not** relaxed.
- **Idempotent**, per the repository's migration convention (`IF NOT EXISTS`), and it must pass
  the migration-idempotency lane that PR #559 established.
- **No PHI surface change** — manuscripts are already member-scoped by credential; the new rows
  inherit the same scoping and `ON DELETE CASCADE` from `member_manuscripts`.
- **Legacy rows are labelled, not rewritten.** No existing row's content is modified.
- **Storage** — see §6. If artifact bytes are stored, the migration carries a `bytea` or an
  external-blob reference and the disk implications are real (25 MB ceiling per upload).
- **Co-Lab release gate** (`verify-colab-boundaries.ts`, 31/31) is triggered by any migration
  touching member-scoped tables — it must pass in production before any tester wave.

## 6. The open question, still unanswered

**Are the original artifact's bytes stored, or only its hash and provenance?**

P0 passes either way. Without the bytes, A1.1's purpose — *"a better extractor can later be run
against the immutable artifact"* — is unavailable, and A1.2's *"re-import from the original
file"* remedy is unreachable even for future imports. **Recommendation: store them.** It is far
cheaper now than as a retrofit.

Note that path 2 (`.txt`/`.md`, read in the browser) would additionally need to be routed
through the server for its artifact to be capturable at all. That is a behaviour change to a
deliberate current property (*"read in the browser (unchanged, transparent)"*) and is **not**
proposed here — for those paths the submitted text is the lawful arrival witness.

## 7. Rollback

| Part | Rollback |
|---|---|
| Migration | Additive — drop the new tables/columns; nothing else references them |
| Ingest / save persistence | Revert the route commits; the pipeline returns to its current behaviour |
| Orphan-heading carry-forward | Single-function revert in `segment.ts`; affects future imports only, never stored rows |
| Omission check | Verification only; removing it changes no behaviour |
| Client threading | Revert; the identifier is optional on the wire until the save path requires it |

No part of this unit rewrites existing rows, so rollback never needs to restore data.

## 8. Stop conditions specific to WS-01

Stop and report if: the arrival cannot be persisted at ingest without a visible change to the
import surface · the orphan-heading repair would require relaxing the `CHECK` · a control in §4
cannot be made to fail on the known-bad baseline · the founder's §6 ruling is needed and absent ·
the work would touch any prohibited surface to proceed.

---

## WS-01 Founder re-pin — 2026-08-25

> Appended, not rewritten. The historical `Gate state | P0 = FAIL (evidence record 001)`
> row above stands exactly as recorded and is **not** revised by this entry.

```text
WS-01 FOUNDER RE-PIN — 2026-08-25

P0-D has NOT RUN. No P0-D failure has occurred, and the Master
Operating Brief's repaired-candidate restart rule — "a repaired
candidate restarts the walk at A" (referenced there as §9, under
the "8–10. The frozen walk" heading) — is not triggered.

Acceptance candidate re-pinned before P0-D execution:

FROM
e92f532396705daaf6cd346445276a08a5957904
feature/ws-01-source-custody-v2

TO
4a551d3d13a27ec442252be7822865e0f2d31978
feature/ws-01-source-custody-v3

Basis:
- WS-01 custody mechanism is byte-identical between v2 and v3.
- migration is byte-identical.
- ingest route is byte-identical.
- P0/P0-D acceptance text is identical apart from lineage-specific seal identity.
- v3 is the deployed candidate.
- redeploying v2 would regress unrelated later production work.

This is an explicit candidate-identity correction, not acceptance,
not a silent substitution, and not modification of the frozen candidate.

CURRENT STATE
P0-D       NOT RUN
A–H        NOT REACHED
BUILD MODE CLOSED
```
