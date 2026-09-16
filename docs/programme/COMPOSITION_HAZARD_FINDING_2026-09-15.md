# Composition Hazard — a finding from `SOURCE-CUSTODY-PII-01` ACT 4

**Status:** Finding. Recorded 2026-09-15, preserved as a lesson **distinct from**
the ACT 4 repair it arose in. ⛔ No lane opened.

---

## The finding

```
fail-closed component A
        +
destructive assumption in component B
        ≠
fail-closed system
```

> **Individual guards can each be correct while their composition creates a new
> hazard that neither contains.**

---

## What actually happened

**Component A** — corpus admission (`lib/corpus/admission.ts`) was made
fail-closed: undeclared material is excluded, and the shipped declaration holds
736 unclassified legacy files closed. Correct in isolation, and its own mutant
test proves it bites.

**Component B** — `scripts/embed-ain-knowledge.ts --force` ran
`TRUNCATE ain_knowledge_chunks` **before** consulting the chunk count. Correct
under its own long-standing assumption: *a rebuild produces a corpus.*

**The composition** — with A in place, B's assumption became false. `--force`
would have emptied MAIA's production knowledge corpus, embedded nothing, and
exited reporting *"All sources already embedded."*

⚠️ **A's own test suite could not have caught this.** The zero-admission mutant
tested the admission boundary and passed correctly. Nothing tested what
*consumed* that boundary's output. The defect lived in the seam.

⭐ It was found by asking a question about the **interaction** — *does the
embedding pipeline delete before inserting?* — which no test of either component
would have asked.

Repaired at `56b4481d9`: `--force` with zero admitted chunks refuses, exits
non-zero, deletes nothing. Structural, not a runbook warning.

---

## Why this is preserved separately

Three reasons it is worth more than the bug it describes:

1. **It is a general failure mode of adding guards.** Every fail-closed boundary
   changes the output distribution of whatever it filters. Any downstream
   component holding an assumption about that distribution — *non-empty*,
   *monotonic*, *at least as large as last time* — inherits a new failure case
   at the moment the guard lands.

2. **It inverts the usual review instinct.** A new guard reads as strictly
   safer, so it attracts less scrutiny than a feature. This one was strictly
   safer in isolation and strictly more dangerous in composition.

3. **⭐ It bears directly on Sovereign Verdict.** That architecture is a chain of
   guards — Disclosure Compiler → carrier → deterministic witnesses → verdict
   engine → ledger — each individually sound. This finding says the verdict
   engine must ask what *changed* in its inputs, not only whether each input is
   valid. A carrier that correctly admits nothing, handed to a witness that
   assumes non-empty input, produces a confident verdict about nothing.

---

## The design question this leaves

> When a fail-closed guard is added, **which downstream consumers hold an
> assumption about the shape of what it now filters?**

That question has no mechanical answer here yet. Naming it is not solving it.

⚠️ Candidate obligation, ⛔ **not adopted**: a new boundary ships with a test of
its *empty case as consumed*, not only of its own refusal. The refusal test
proves the guard works; the consumption test proves the system survives it
working.

---

---

## Merge gate — verified 2026-09-15

Before merging ACT 4, the founder required establishing that ordinary
application deployment does not invoke the corpus machinery. If a deploy ran
`build-ain-corpus` or `embed-ain-knowledge`, the fail-closed admission guard
would become a deployment-blocking condition rather than a held one.

⭐ **This is the composition question turned on the guard itself** — the same
question that found the `--force` hazard, asked before merge instead of after.

**Verified, read-only:**

| Surface | Invokes corpus scripts? |
|---|---|
| `scripts/deploy-production.sh` | **no** |
| `scripts/pre-deploy-gate.sh` | **no** |
| `scripts/entrypoint.sh` | **no** — runs only `exec node server.js` |
| `scripts/ensure-migrations.sh` | **no** |
| `Dockerfile` · `docker-compose.production.yml` | **no** |
| `package.json` scripts (incl. `build`) | **no reference at all** |
| `.github/workflows/**` | **no** |

**Call graph of the guarded function.** `processAllSources` has exactly **one**
invocation in the repository: `scripts/embed-ain-knowledge.ts:93`.
`lib/ain/knowledge/index.ts` only re-exports it through a barrel;
`lib/library/spiralogicTagger.ts` merely names `ChunkingService` in a comment.
**No runtime route reaches it.**

**Conclusion:**

```
application deploy     ✅ may proceed — cannot trigger corpus ingestion
corpus rebuild/embed   ⛔ remains separately held, manual invocation only
```

The ACT 4 guard is therefore **not a reason to hold the security repair**. The
hold is real and it is narrow: it binds two manually-run scripts, nothing that a
deploy can reach.

---

## Relationship to the declared-membership candidate

Distinct, and should not be merged.
[`DECLARED_MEMBERSHIP_CANDIDATE_2026-09-15.md`](../canon/DECLARED_MEMBERSHIP_CANDIDATE_2026-09-15.md)
governs **how membership is established**. This finding governs **what happens
downstream when membership is correctly refused**. The first is about authority;
the second is about composition.
