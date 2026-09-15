# ER-R4.1 · STRUCTURED-PROVENANCE RECONCILIATION

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` · **Authorized** founder, 2026-09-15.

```
5 / 5 blobs == the governed acts       ⭐
lib/ai/structured                       60 / 60
all editorial + writers-studio suites  340 / 340
ER-F1 … ER-F8                           green · 7/7 killed
targeted typecheck                      exit 0
```

⛔ **NOT a redesign, and not ER changing a shared seam for its own convenience.**
A carry-forward of an amendment that was already ruled and closed.

---

## 1 · The prior acts, verified rather than accepted

```
35d0f81d1  2026-09-08  feat(seam): record what answered, not only what was asked
23b630373  2026-09-08  fix(seam): move the governed baseline, and stop
                       overstating the origin check
⛔ neither is an ancestor of canonical
```

⭐ **And the reconciliation is unusually clean — confirmed here independently:**

- `lib/ai/structured/policy.ts` and `router.ts` at `HEAD` are **byte-identical**
  to their blobs at `35d0f81d1`, so the governed baseline for those files is
  already in place and ⛔ neither was touched.
- canonical's `types.ts` and `anthropicStructuredAdapter.ts` are
  **byte-identical to the PARENT of `35d0f81d1`**.

> ***The repair was lost from this lineage. It was not superseded by a different
> implementation.*** That distinction is what makes a carry-forward lawful here
> rather than a re-decision.

### Manifest — five blobs, transplanted, every one re-hashed

```
lib/ai/structured/types.ts                              50f8fd091 → 1b0a91dee
lib/ai/structured/anthropicStructuredAdapter.ts         3e666f5f0 → 396419650
lib/ai/structured/__tests__/requestEquivalence.test.ts  56fc674ad → 2a68e2352
lib/ai/structured/__tests__/nonFallbackable.test.ts     db88dff99 → 00f877068
lib/ai/structured/__tests__/seamIsolation.test.ts       2226ec59c → cd45480bb
```

⛔ The surrounding branches were not merged and no other file was touched.

---

## 2 · ⭐ My R4 finding was right about the conflict and wrong about the fix

I reported the adapter's `model: req.model` as opposed to the provenance law,
and it is — but I framed the remedy as *persist the serving model instead*. The
prior ruling is sharper, and it keeps both facts:

```
model            requested and SENT        ⛔ existing meaning, unchanged
reportedModel    what the provider SAYS answered
modelAgreement   agreed | differs | unreported
```

⛔ **`model` is not redefined.** The founder's own earlier R4 phrasing —
*"persist the actual model instead of the configured model"* — was corrected by
them as too coarse, and this record keeps the correction rather than the phrase.

---

## 3 · ⭐⭐ The Writer's Studio acceptance rule

The shared seam **reports** the three facts. ⛔ It does not judge them, and it
should not: another caller may lawfully tolerate a substitution.

**This capability does not.**

```
reportedModel === null        → REFUSE   model_unattributable
modelAgreement !== 'agreed'   → REFUSE   model_unattributable

⛔ no admission · ⛔ no MAIA turn · ⛔ no Direction · ⛔ no ProposalVersion
```

⭐ The check runs **before admission**, so a substituted model's envelope is
never even parsed. *A durable MAIA turn is an attribution of authorship, and an
editorial act attributed to a model the provider did not name — or named
differently — is an attribution nobody can stand behind.*

All three facts are persisted on the MAIA turn's `answer_provenance`.

---

## 4 · The witness, amended

The stub now reports back the **requested** model by default, so the ordinary
cases satisfy the acceptance rule. Added:

```
A9  ⭐⭐ all three provenance facts durable, `model` keeping its governed meaning
M1  ⭐⭐ a provider-reported model that DIFFERS is refused
M2  ⭐⭐ and mints NOTHING — refused BEFORE admission
M3  ⛔ the wording it offered exists nowhere
```

⛔ Still **NOT RUN** — it is blocked on a route-minted identity, which is ER-R5.
`NOT RUN` remains a first-class result.

---

## 5 · The unrelated RED, recorded not repaired

`lib/manuscript/development/__tests__/evidenceCannotAct.test.ts` →
*"adds no migration"* fails on canonical because
`20260913000002_disclosure_boundary_developmental_ask.sql` — an **S3-lane**
migration already on `53cd18524` — matches a `/develop|evidence|reading|
observation/i` filename guard written about the *evidence* substrate.

```
ER-R4 / R5 blocker      NO
known unrelated RED     YES
repair inside ER lane   ⛔ NO      ⛔ and not whitelisted opportunistically
```

---

## 6 · Standing

```
ER-R1 · R2 · R3          ✅
ER-R4 implementation     ✅ · provenance law corrected
ER-R4.1                  ✅ CLOSED · 5/5 blobs · 60/60 seam
ER-R4 evidence           ⏸ OPEN — needs the route

ER-R5 thin route         🟢 NEXT
UI · Adopt · production  ⛔
```

> ***The seam records what answered as well as what was asked. Writer's Studio
> then refuses to sign an editorial act in a name the provider did not give.***
