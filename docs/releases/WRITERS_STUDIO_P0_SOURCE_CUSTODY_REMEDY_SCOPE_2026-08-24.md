# P0 Source Custody — remedy scope

> **Scope proposal. No implementation.** The smallest unit that makes P0 *satisfiable*, so the
> frozen walk becomes runnable. It is **not** authorization to implement the Phase 3A
> architecture, merge #995, build Structure, extend `Worktable`, or redesign the Studio.
>
> Requested by the founder, 2026-08-24: *"Return with the smallest possible source-custody
> remedy required to make P0 satisfiable; no implementation yet."*

---

## The root cause, which is smaller than it looked

The discard is not carelessness. It exists to satisfy a schema constraint:

```sql
body text NOT NULL CHECK (length(body) > 0)   -- manuscript_sections
```

A heading line followed immediately by another heading line produces a section with an empty
body, which the schema forbids — so both `segment()` and the save path skip it, taking the
heading with it:

```js
if (body.trim().length === 0) continue;
```

**Naming the cause narrows the remedy.** Nothing needs to be re-architected to stop the loss;
an orphan heading needs somewhere lawful to go.

---

## The unit

Four parts. Each is independently revertible.

### 1. Persist the arrival, before interpretation runs

One new row per arrival, written by the import path **before** `segment()` is called:

| Held | Why |
|---|---|
| The extracted text, verbatim | The lossless arrival witness P0 admits |
| `sourceTextHash` | Makes omission detectable |
| Extractor identity + version | Distinguishes a changed extraction from a changed structure (A1.1) |
| Artifact provenance — filename, media type, byte size, `sourceArtifactHash` | Names what arrived, and lets a future re-import be checked against it |

This is the only migration in the unit.

### 2. Make the arrival → draft path lossless

An orphan heading is carried into the following section's body rather than dropped, so no
arriving line can vanish. **No schema change** — the `CHECK` stays, because there are no longer
empty bodies to store.

*(Alternative considered and not recommended: initialise the draft directly from the source
text. It is architecturally purer and is where Phase 3A eventually goes, but it would put page
furniture — `-- 1 of 216 --`, bare page numbers — into every new draft, making acts **C** and
**D** of the walk materially worse at the moment we are trying to pass them. Furniture
suppression is Phase 3A work and is not authorized here.)*

### 3. Omission detection

A verification that reassembles what the member is given and compares it against the persisted
source text, reporting any divergence. This is what turns P0 from an assertion into evidence,
and it is the artifact the walk will cite.

### 4. Legacy provenance, labelled honestly

Per Amendment A1.2, existing manuscripts **cannot** be retrospectively certified. They are
marked as interpreted imports of unknown fidelity — never as source — and nothing offers
"original restored" for them.

> **This includes the manuscript presently in production.** Its dropped lines are unrecoverable
> from `manuscript_sections`. If the original file still exists, the lawful path is re-import
> through the repaired pipeline; if it does not, the honest path is to keep what exists and say
> what it is.

---

## Pre-registered acceptance criteria for this unit

Registered **before** implementation, so this unit does not repeat the failure that produced
the freeze — criteria written after the thing they judge.

1. Importing a manuscript persists the arrival **before** any segmentation runs.
2. The persisted arrival is byte-identical to the extractor's output.
3. `sourceTextHash` and `sourceArtifactHash` are recorded and distinct from each other.
4. The extractor's identity and version are recorded.
5. A manuscript whose text contains consecutive heading lines loses **no** line — verified
   against a fixture built from the shape that currently fails (capitalised front matter).
6. The omission check reports **zero divergence** for a newly imported manuscript.
7. The omission check **detects** an artificially introduced omission — a check that cannot
   fail is not evidence.
8. Existing manuscripts are labelled interpreted-import and are **not** presented as source.
9. No existing draft's text changes as a result of this unit.
10. `manuscript_sections` remains immutable after creation; this unit adds a layer beside it
    and does not repurpose it.

---

## Explicitly out of scope

The Interpretation layer · candidates and their acceptance · Work Structure · anchors and
drift · re-cut and its member acts · furniture suppression · the Structure workspace ·
Navigator changes · #995 · `Worktable` · `/book-studio/canvas` · any Studio UX change · any
rename.

---

## The one question this scope cannot settle

**Are the original artifact's bytes stored, or only its hash and provenance?**

| | Minimum for P0 | Amendment A1.1's intent |
|---|---|---|
| Source text + hashes + provenance | ✅ satisfies *"equivalent lossless arrival witness"* | partial |
| \+ the artifact bytes | not required | ✅ lets a better extractor later run against what actually arrived |

P0 passes either way. But without the bytes, A1.1's stated purpose — *"a better extractor can
later be run against the immutable artifact without pretending the previous extraction was
original truth"* — is unavailable, and it is much cheaper to store them now than to retrofit
later. Against that: uploads run to 25 MB, and storing member manuscripts in full is a custody
decision with its own weight.

**Recommendation: store the bytes**, because A1.2's legacy remedy (*re-import from the original
file where it exists*) is only reachable for future imports if the original is kept. Flagged
rather than assumed — this is the one place where "smallest possible" and the ratified
amendment pull in different directions.
