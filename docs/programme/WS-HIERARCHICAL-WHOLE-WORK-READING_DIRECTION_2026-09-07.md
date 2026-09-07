# Hierarchical Whole-Work Reading — founder architecture, 2026-09-07

**Direction, not a lane.** ⛔ Nothing built. Recorded so the ceiling debate stops being the
question and the real one starts.

> **Whole-work understanding is composed from bounded, complete, provenance-preserving readings;
> context-window size may bound a reading unit, but must not bound the Work.**

---

## 0 · What this supersedes, including something I just shipped

The question was *what should `DEVELOPMENTAL_READ_CEILING_CODE_POINTS` be?* It is now *what is the
maximum size of one bounded reading UNIT, and how does MAIA compose complete coverage from many?*

⚠️ **`b223dadd0` raised that constant 60,000 → 650,000, and under this architecture that is the
wrong shape.** The founder ruling is explicit: *do not solve long manuscripts with an ever-larger
ceiling.* The raise is a **bridge** and must be recorded as one — it lets an ordinary book be read
at all today, when no composition exists. When units arrive, the constant becomes a **unit** ceiling
and **650,000 is far too large for a unit**: a chapter is the bounded thing.

⛔ Do not cite 650,000 later as a settled reading budget. It is the size of the gap this
architecture closes.

## 1 · The parts, and what already exists for each

| the architecture asks for | substrate today | gap |
|---|---|---|
| break by the writer's structure | `manuscript_structure_units` + members; RECONCILE proved subtree resolution | ⛔ no chunker; no fallback for unstructured works |
| freeze the reading subject | **BUILD-07A `readState`** — revision, digest, per-section code-point ranges, `inputFingerprint` | ✅ this is exactly it |
| every chunk carries provenance | `EvidenceRef` (section · passage · section-run · structure-unit) + `BoundEvidence` | ✅ built, unused at this scale |
| coverage may not lie | `DevelopmentalCoverage` — every section `body \| position` | ⛔ per-reading only; no ledger across units |
| structured reading per chunk | `DevelopmentalReading` + observations with evidence refs | ✅ the artifact already has this shape |
| synthesize upward | — | ⛔ **nothing** |
| cross-work relational pass | — | ⛔ **nothing** |
| invalidation on edit | revision store + digests; `computeStaleness` five dimensions | ✅ the mechanism exists |

**Most of the hard substrate is built.** What is missing is composition, the ledger, and the
epistemic distinction below.

## 2 · ⛔ The constitutional problem, and why the three levels are load-bearing

The reader's own non-conclusion rules already forbid, by name:

> *a whole-Work pattern asserted from partial coverage*

A naive composition **breaks the reader's existing law**. A synthesis over 37 unit readings that
speaks as if it read the book is precisely the laundering `outside-coverage` exists to refuse.

The founder's three levels are the resolution, and they must be **representable in the contract, not
described in a prompt** — a distinction that lives only in wording is one the model can drop:

```text
DIRECT            MAIA read these manuscript sections.
COMPOSED          MAIA synthesised findings from readings covering these sections.
VERIFIED RELATION MAIA proposed a relationship in synthesis, then returned to
                  the source passages and checked it.
```

⚠️ **Today `coverage` is `body | position` — a two-state fact about reading.** These three are a
different axis: not *how deeply was it read* but *how did MAIA come to say this*. Collapsing them
into coverage would make "composed" indistinguishable from "read", which is the whole failure.

**The AI-telephone guard is already in the repo.** BUILD-07A's `EvidenceRef` + digest verification
means a level-3 synthesis can be forced to name source anchors that still verify. A composed claim
that cannot produce a verifying ref is not upgradable to VERIFIED — that is a mechanical test, not a
matter of trust.

## 3 · The coverage ledger, as a refusal

```text
262 total · 262 covered · 0 omitted · 28 units · 4 part syntheses · 1 whole-work
```

and the case that matters:

```text
259 / 262 covered · 3 unread · WHOLE-WORK CLAIM NOT PERMITTED
```

**No green check because most of it was probably enough.** This is FR-14's coverage law in a new
place: *an instrument can satisfy all of its remaining questions by forgetting to ask the difficult
ones.* The ledger is the object that cannot forget.

## 4 · Two engineering notes the architecture will need

**Chunking must be reproducible, or invalidation is meaningless.** The unit boundaries have to be a
pure function of (frozen structure, unit ceiling) — the same book must chunk identically twice, or
"invalidate Chapter 7's reading" cannot find the reading it invalidated. Same discipline as the
scope resolver: a pure function over a supplied topology.

**Invalidation cascades upward and must be conservative.** A changed chapter invalidates its own
reading, its Part synthesis, the whole-work synthesis, **and every cross-part relationship naming
it**. The last is the one that will be missed — a relationship between Ch.7 and Ch.31 is invalidated
by a change to either end, and nothing in the current staleness dimensions tracks a relation's
dependencies.

## 5 · The writer never meets any of this

For an ordinary book and for an 800-page one, the act is the same: **Read the whole work.** Progress
may be visible; the mechanism is not. *A long book is not an exception in a Writer's Studio.*

## 6 · Standing

⛔ Not a lane. Nothing authorised, nothing built, no unit ceiling proposed — that number wants
measurement against real chapters, not derivation from a context window.

Open: does the whole-work synthesis become a `DevelopmentalReading` of its own kind, or a new
object? It carries observations that are COMPOSED rather than DIRECT, and the existing type has no
place to say so.
