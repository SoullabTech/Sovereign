# The Evidence Scope Rule — candidate method instrument

**Status: CANDIDATE.** ⛔ Not ratified. A **method rule**, not a constitutional principle. Recorded
at founder direction 2026-08-06 as a general discipline rather than a publishing-lane note, because
the failure mode it names is not specific to this project.

> ⭐⭐⭐ **PROVENANCE OF AUTHORITY — cite it this way, ⛔ never as a general principle.**
> *"This review method emerged from two measured failures in the practitioner publishing lane
> (2026-08-06): measuring the wrong referent, and measuring the wrong scope."*
>
> ⛔ It was **not** derived, reasoned to, or generalized from theory. Its authority is **earned by
> the failures in §3 and extends no further than they do.** ⛔ Do not clean the failures out of this
> document to leave only the rule — without them the rule reads as a clever abstraction, and a
> future reader will treat it as optional. ⭐ **The origin is part of the authority.**

---

## The rule

> ⭐⭐⭐ **An absence claim is incomplete until it states the scope in which the absence was measured.**

"Not found" is a fact about a **search**, ⛔ never about the world. Until the scope is named, the two
are indistinguishable — and they fail in opposite directions:

| | |
|---|---|
| **A true absence** | forces design |
| **An absence artifact** | ⭐ invites you to rebuild something that already exists, works, and decides something |

## The scope a claim must name

| Dimension | The question it answers |
|---|---|
| **Branch / ref** | which working tree was searched, and how current is it? |
| **Deployment** | which environment — and is it the one that matters? |
| **Commit** | what is actually running, as opposed to what is checked out? |
| **Database** | which database, and is it the primary? |
| **Search scope** | which paths, which patterns, which file types — and what did the pattern structurally exclude? |
| **Time** | when was it measured? |

## Why this is not pedantry

Twice in one lane, the same failure produced opposite kinds of error:

1. ⚠️ **Schema read from migration files.** Three `CREATE TABLE IF NOT EXISTS practitioner_clients`
   declarations were read as *"three competing definitions, one arbitrarily wins."* Production held
   **one governed table** with the union of all three plus coherence constraints. The files were a
   record of *intent over time*, ⛔ not a description of the database.
2. ⚠️ **Substrate read as absent.** `coach_client_shared_items` was reported as having no defining
   migration and no code references. It has both — a 116-line migration, a service, a PHI accessor,
   and **two verifiers** — on `origin/clean-main-no-secrets` and in the deployed commit. The search
   ran against a working tree whose local trunk was **402 commits behind origin**.

⭐ The second was the more dangerous by far: it very nearly produced a recommendation to build on top
of a substrate that **already governs** how member material crosses a field boundary.

## The discipline

1. ⭐ **Measure against the deployed commit and the primary database** whenever the claim will be
   relied on. `git rev-parse` on a local branch is not evidence about production.
2. **State the scope in the claim itself**, not in a footnote — *"absent from `origin/<trunk>` as of
   `<sha>`"*, never bare *"absent."*
3. ⭐ **A schema file describes an intention. A database describes a state.** ⛔ Never infer the
   second from the first — `IF NOT EXISTS`, later `ALTER`s, reverted branches, and out-of-band
   applications all break the correspondence.
4. **Name what the search structurally could not find.** A pattern that only matches `CREATE TABLE`
   cannot see a column added by `ALTER`.
5. ⛔ **Never let a negative result become a premise** without re-checking it at the moment it starts
   carrying weight. An absence that was true when measured may not be the absence being relied on.

## Relation to other instruments

- Feeds [`SUBSTRATE_DISPOSITION_TEST`](SUBSTRATE_DISPOSITION_TEST_2026-08-06.md): ⛔ you cannot
  classify something as **absent** without satisfying this rule first, and *absent* is the state
  most often reached in error.
- Consistent with the standing evidence discipline in this project — **[O]** observed vs **[I]**
  inferred. ⭐ This rule adds the scope qualifier that makes an **[O]** about an *absence* mean
  anything at all: an observation of nothing is only as good as where you looked.
