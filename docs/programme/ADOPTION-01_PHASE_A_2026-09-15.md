# ADOPTION-01 · PHASE A — READ-ONLY CUSTODY

**Canonical** `a8095aa18`. ⛔ No route, no control, no execution, no semantic
change, no migration, no deploy.

> **The governing law:** the UI may express the existing authorization contract
> in human language; ⛔ it may not weaken, bypass or reinterpret that contract to
> make adoption easier.

---

## 1 · The chain as it actually exists

| function | question it answers | requires | may refuse | writes |
|---|---|---|---|---|
| `resolveGuard` *(pure)* | did the authorizing act really read the Work? | chain + `WorkStateReading` | `work_mismatch` · `draft_mismatch` · `section_mismatch` · `expected_text_absent` · `expected_text_ambiguous` · `malformed` | — |
| `authorizeVersion` | **what exactly has Kelly chosen?** | `memberId` · `chainId` · `versionId` | `chain_unknown` · `version_unknown` · `version_foreign_to_chain` · `already_accepted` · `guard_stale` · `expected_text_absent` · `expected_text_ambiguous` · `malformed` | one `manuscript_revision_authorizations` row |
| `evaluateExecutionFit` *(pure)* | **is that choice still safe to apply?** | `ExecutionBinding` + `WorkStateReading` | `stale_base` · `different_place` · `expected_text_absent` · `expected_text_ambiguous` | — |
| `readAuthorizationStatus` | what may the surface say right now? | `memberId` · `authorizationId` | — (returns a state) | — |
| `executeAuthorization` | **may the authorized change enter the manuscript?** | `memberId` · `authorizationId` | `authorization_unknown` · `already_spent` · `version_unreadable` · `draft_not_found` · `section_not_found` · `section_not_projectable` · fit reasons · `write_refused` | the section, then the receipt |

⭐ **Four things the reading establishes that a UI must not undo:**

1. **The version is named, never derived.** `authorizeVersion` has *"no ORDER BY,
   no LIMIT 1, no head lookup anywhere in this function"* — a writer may
   authorize MAIA's v2 after abandoning her own v4, and the record must say so.
2. **`expectedText` is what authorizes; the version is a second thing that may
   refuse.** `evaluateExecutionFit` says so explicitly — *"defence in depth, not
   the law"* — so neither may be the only check.
3. ⭐⭐ **The permission is single-use and re-authorizing RECOVERS rather than
   mints.** For one member, one exact version, one current bound Work version
   there is at most one unspent authorization; and the lookup deliberately comes
   *after* the Work is read, so a stale unspent permission at v41 cannot defeat a
   legitimate new one at v42. ⛔ And no caller-supplied idempotency token: *"the
   permission already HAS a natural identity; we look it up rather than letting
   anyone name it."*
4. **The receipt is whole or absent by type** — `{acceptedAt, resultingVersion}`
   is a union, so a half-written receipt is unrepresentable.

⚠️ **Concurrency is already settled and must not be re-solved in a route.**
`readWorkAtTarget` takes `FOR UPDATE` on the draft row and holds it; execution
locks **authorization → draft** in that order, and the comment warns that adding
the reverse order elsewhere would build a lock-order cycle.

---

## 2 · Exposure today

```
routes exposing any of this          0
UI importing any of this             0
real callers of authorizeVersion     0   (two files MENTION it, in prose only)
real callers of executeAuthorization 0
migration in canonical               ✅ 20260914000004_manuscript_revision_authorizations.sql
```

⭐ So the census's headline holds precisely: **the machinery and its table exist;
the member-facing act does not.**

⚠️ **And one consequence worth naming now, not later:** the migration is already
in canonical, and the 2026-09-07 finding says merge-to-canonical is latent
schema-deploy authorization. ⛔ Whether that table is in production is **not
established from here** and must not be assumed either way.

---

## 3 · The facts required at the member gesture

⭐ **She names two things. Everything else is derived server-side.**

```
the member names       chainId · versionId          ← that is all
derived from the chain workId · draftId · targetSectionId · expectedText
derived from the Work  current version · textAtTarget   (under FOR UPDATE)
minted by the act      baseVersion — THIS reading's, ⛔ never the chain's
```

⛔ **`baseVersion` is the stale-execution token, and it is minted, not passed.**
`resolveGuard` sets `binding.baseVersion = reading.version` and nothing else.
A caller that supplied it would be asserting the state of a Work it had not read.

⛔ The frozen opening passage (`chain.locus.expectedText`) is **not** what
authorizes. The binding's `expectedText` comes from the reading at authorization
time. Those can differ, and conflating them would let a permission be bound to
text that is no longer there.

---

## 4 · What the member is actually authorizing

⭐⭐ **`readAuthorizationStatus` already assembles the answer.** It returns a
`ChangeLocator`: `sectionLabel` · `sectionId` · `range: {space:
'projected_section_body', start, end}` · `operation` · `changeCount: 1` — and the
range is **server-derived in code points**, with the comment *"the browser must
not search the Work to manufacture it; that would make the surface a second
authority on where the change is."*

So the confirmation can be built entirely from existing facts:

| the question | the fact |
|---|---|
| **where in her book?** | `locator.sectionLabel` + `range` |
| **what text changes?** | `guard.expectedText` → the version's `replacementText` |
| **which version?** | `proposalVersionId`, its `author` and its position in the lineage |
| **has the manuscript moved since?** | the status **state** — `executable` vs `no_longer_fits` |
| **what if it can't execute safely?** | the fit reason, in her language (§5) |

⛔ **The UI must not compute the range.** It is already computed, and computing it
again would make the surface a second authority.

---

## 5 · Every refusal, in her language

⭐ Derived from what each refusal *means about the Work* — ⛔ no softening that
changes meaning.

| refusal | what it means | her sentence |
|---|---|---|
| `stale_base` | the draft advanced past the bound version | *You've written here since this version was made.* |
| `different_place` | the binding names another Work/draft/section | *This passage isn't where it was.* |
| `expected_text_absent` | those characters are gone | *The sentence this answers is no longer in the chapter.* |
| `expected_text_ambiguous` | they occur more than once | *That sentence now appears more than once here, so there is no one place to change.* |
| `already_accepted` / `already_spent` | single-use, already spent | *You've already adopted this one.* |
| `guard_stale` | the permission's Work state moved | *This choice was made against an earlier state of the chapter.* |
| `chain_unknown` · `version_unknown` · `version_foreign_to_chain` | ⛔ **not member-facing** — a surface cannot reach these without inventing ids | — |
| `section_not_projectable` · `write_refused` · `version_unreadable` · `malformed` | ⛔ **system conditions, not statements about her book** | a single honest *"couldn't be applied just now; nothing changed"* |

⚠️ **The split matters.** Some refusals are true statements about her manuscript;
others are the system failing. ⛔ Dressing the second group as the first would be
the same defect this programme just repaired at the conversion door — a surface
saying something about the Work that is really something about the machinery.

---

## 6 · Are the four acts legally one?

⛔ **No — and the substrate proves it.**

```
COMPARE    inspect            ✅ exists (UI-03), no authority
CHOOSE     identify           ✅ exists (the comparison target)
AUTHORIZE  permit             authorizeVersion  — reads the Work, mints a binding
EXECUTE    apply if still fit executeAuthorization — re-reads, re-checks, writes
```

⭐ `executeAuthorization` **re-reads the Work and re-runs `evaluateExecutionFit`**
rather than trusting the authorization. That re-check only means something if the
Work can move between the two — which is exactly why they are two.

⚠️ **They MAY be presented as one gesture, but only if the surface can truthfully
report an authorize-then-refuse-to-execute outcome.** A single button that hid
that case would collapse the acts in the member's understanding while leaving
them separate in fact, and the honest sentence — *"You've written here since this
version was made"* — would have nowhere to appear.

⛔ Phase A does not choose the gesture shape. It establishes that collapsing them
silently is not available.

---

## 7 · What Phase B would need — ⛔ none authorized

1. a **read** seam for the status + locator (a confirmation cannot be drawn
   without it);
2. an **authorize** seam and an **execute** seam — separate, because the
   substrate's re-check is meaningless if they are one;
3. the refusal→sentence mapping of §5, with the system/Work split intact;
4. a witness in which the Work **moves between authorize and execute**, since
   that is the case the whole design exists for.

⚠️ And one question Phase A cannot answer: **is that table in production?** ⛔ Not
knowable from here, and not to be assumed.

---

## 8 · Standing

**ADOPTION-01 · PHASE A COMPLETE · READ-ONLY · ⛔ NOTHING BUILT · HOLDING FOR
FOUNDER READING.**

⭐ The contract is stronger than the census suggested: it already refuses head
lookups, already recovers rather than re-mints permissions, already derives the
change's location server-side, and already re-checks at execution. **Phase B's
entire job is to say what it does, in her words, without loosening any of it.**
