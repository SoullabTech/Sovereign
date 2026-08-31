# Corpus Gate — Production Verification Record

**Date:** 2026-08-03
**Runtime SHA:** `95b21ce42` (provenance-verified at deploy: *"Running container provenance
verified: GIT_COMMIT=95b21ce42 == asserted 95b21ce42"*)
**Status:** ⏸️ **PARTIAL — the negative half is NOT EVALUABLE against production.**

---

## What was verified

| # | Check | Result |
|---|---|---|
| 1 | Running container reports the deployed SHA | ✅ `GIT_COMMIT=95b21ce42` |
| 2 | Gate source present in the **running image** | ✅ `corpusIsComposable()` → `return false` |
| 3 | Gate guards **both** composition sites in the shipped source | ✅ room path + live path |

Read directly from the running container
(`docker exec maia-sovereign … /app/lib/practiceField/practiceFieldService.ts`), not from the repo.

---

## 🔴 What could NOT be verified, and why

### Negative half — NOT EVALUABLE

> *"corpus material does not appear in MAIA composition context"*

**Production contains no corpus to withhold.**

```
field_slug      | corpus_len | identity_len
----------------+------------+-------------
(null)          |     (null) |          446
now-what-demo   |     (null) |          512
```

`active_field_content` is NULL on **both** rows — zeroed by the 2026-08-03 containment, before the
gate was deployed. Observing *"corpus absent from composed context"* here would be **vacuous**: it
cannot distinguish

```text
the gate withheld it        from        there was nothing to withhold
```

⛔ **This is a NOT-EVALUABLE, not a pass.** Recording it as a pass would be the exact failure this
project keeps catching — an empty measurement read as a demonstrated absence.
[[feedback-empty-measurement-is-not-absence]]

### Positive half — NOT OBSERVED

> *"identity / practice layers still compose"*

`about_practice` exists (512 chars on `now-what-demo`), so the path is exercisable — but **zero
composition events appear in 6h of container logs**. The container was recreated minutes ago and no
traffic has resolved that slug since. Absence of log lines is not evidence of silence; it is
evidence of **no traffic**.

---

## What a valid two-sided proof requires

A fixture in the **pre-condition** — corpus present — which production deliberately no longer has.

**Proposed (not yet authorized):** restore the preserved 63,861-char corpus
(`sha256:e0c494ba…d9b2c304`, `practice_field_revisions` rev 1) into a **non-production** environment
running SHA `95b21ce42`, then assert both halves:

```text
negative   corpus present in the row  →  absent from the composed context
positive   identity fields            →  present in the composed context
```

⛔ **Do NOT introduce corpus content into production to make the test possible.** That would mutate
the object of study and re-open the exposure the containment closed.

⚠️ ⛔ Not the shared dev DB — ~100 worktrees share it, which breaks repeatable evidence.

---

## Honest summary

```text
runtime SHA          95b21ce42                       ✅ verified
gate in running image corpusIsComposable → false     ✅ verified, both sites
negative half        corpus absent from context      ⏸️ NOT EVALUABLE (no corpus in prod)
positive half        identity layers compose         ⏸️ NOT OBSERVED (no traffic)
result               boundary is DEPLOYED;
                     boundary is not yet BEHAVIOURALLY PROVEN in production
```

**Deployed ≠ behaviourally proven.** The unit suite proves both halves at 8/8 with three adversarial
controls, including one showing that 5/7 of the pre-existing tests pass while the system goes
silent. That proof stands — it is simply not the same claim as *"verified in the running system."*
