# J11 — GRANT / EFFECT BOUNDARY FALSIFICATION

**Status:** ✅ **CANDIDATE SURVIVES FIRST FALSIFICATION — BOUNDED, NOT CANONIZED**
**Class:** documentary falsification only · ⛔ NOT A BUILD · ⛔ NOT A REPAIR
**Evidence anchor:** `59043c3e0640b6c372e9c65feaf2027c825412d1` — J10 bounded authority-plane census
**Predecessor:** `docs/programme/J10_AUTHORITY_PLANE_CENSUS_2026-09-17.md`
**Governing:** `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`

⛔ **This record does not establish a universal implementation primitive.** It tests whether one constitutional invariant can describe four substitutions without changing the meaning of its terms.

---

## §0 — Question carried from J10

J10 withdrew the earlier synthesis:

> six lanes → one missing authority layer

The repository instead showed three different failure shapes and one healthy control:

1. **Retrieval:** an authority mechanism exists, but one governed retrieval effect bypasses it.
2. **Capability:** a declaration exists, but no governed effect consumes it; declaration alone is not availability or authority.
3. **Keep:** a genuine bounded grant exists and the governed effect can exceed the grant's interpretive scope.
4. **Admission:** explicit declaration, bounded checks, default exclusion, and fail-closed behavior form a healthy control.

J10 therefore left one narrower question open:

> Can the same grant/effect invariant survive these substitutions without changing what **grant**, **effect**, or **scope** mean?

That is the only question adjudicated here.

---

## §1 — Candidate under falsification

> **CANDIDATE LAW — GRANT / EFFECT BOUNDARY**
>
> No governed effect may acquire more authority than has been explicitly granted to that effect.
>
> A grant with no operative governed effect is inert.
>
> An operative effect without sufficient grant is unauthorized.
>
> An operative effect exceeding the scope of its grant is an overrun.

### Refinement required by the capability control

**A declaration is not automatically a grant.**

The capability seam would falsify the candidate if the word *grant* had to be stretched to mean any declaration or registry entry. It does not. `CAPABILITY_REGISTRY` is presently declarative and unreached; no governed effect follows from the declaration itself. Therefore capability is not classified as an unauthorized effect and is not used as evidence that a grant exists.

This refinement keeps the terms stable rather than expanding the candidate to fit the evidence.

---

## §2 — Falsification cell A: Retrieval — bypass substitution

### Hold constant

- stored/indexed material;
- requested material;
- retrieval operation;
- the existing admission and global retrieval-authority machinery.

### Substitute

Change only whether the material has standing in the existing authority plane.

### Repository evidence at the J10 anchor

- `lib/corpus/admission.ts` declares admission and defaults to exclusion when no declaration exists.
- `lib/library/globalRetrievalAuthority.ts` binds admitted repository path to the current SHA-256 and fails closed.
- `lib/library/LibraryService.ts` consumes that authority before canonical cross-corpus retrieval.
- `lib/ain/knowledge/RetrievalService.ts` performs retrieval without consuming admission, global retrieval authority, or `LibraryService`.

### Result

✅ **SURVIVES.** A governed retrieval effect can occur on the bypassing path even when the existing authority mechanism would exclude the material on the authority-bearing path.

The defect is therefore not *authority does not exist*. It is:

> **the governed effect does not consume the authority that would bound it.**

This is an **effect without sufficient consumed grant** on that path.

⛔ No retrieval repair is authorized here.

---

## §3 — Falsification cell B: Capability — declaration/effect substitution

### Hold constant

The declared capability surface.

### Ask

Does any mechanically observable governed behavior become available merely because the capability is declared?

### Repository evidence at the J10 anchor

J10 found `CAPABILITY_REGISTRY` with **0 consumers · 0 callers · 0 emissions**. The capability declaration surface is therefore presently unreached. The adjacent temporary voice-navigation transport operates without consuming this declaration.

### Result

✅ **SURVIVES, WITH THE §1 REFINEMENT.**

The seam does **not** demonstrate an unauthorized governed effect produced by the declaration. It demonstrates something more precise:

> **declaration ≠ grant ≠ operative effect.**

A declaration with no consumer is inert as governance. It neither proves authority nor produces a governed effect.

This cell defeats any candidate formulation that silently equates *declared* with *authorized and operative*.

⛔ No capability activation or intended authority class is decided here.

---

## §4 — Falsification cell C: Keep — scope substitution

### Hold constant

The existing founder grant recorded by J10:

- `UNDERSTAND` — recognize that Keep intent was expressed;
- `FACILITATE` — surface the member gesture;
- `COMMIT` — member only.

### Substitute

Hold that grant fixed while changing the downstream interpretation between two distinct member acts:

- **KEEP** — preserve material;
- **CONTINUE / KEEP OPEN** — leave a question, conversation, or inquiry open.

### Repository evidence at the J10 anchor

`lib/consciousness/keepIntent.ts` is a recognition classifier and fails closed when no match is present. J10 established that the grant authorizes recognition that Keep intent was expressed and facilitation of the gesture, but does **not** authorize the system to collapse two different acts into one. J10 also recorded the witnessed false-friend case in which *keep this question open* could be read as `keep_material` without an attestation failing on that distinction.

### Result

✅ **SURVIVES.** With grant held constant, changing the interpretation can change the governed affordance. The defect is therefore not absence of governance; it is:

> **an effect deciding beyond the scope of the grant.**

That is a **scope overrun**.

⛔ No Keep matcher repair and no widening of the grant is authorized here.

---

## §5 — Falsification cell D: Admission — healthy control

### Hold constant

Directory/table/storage membership.

### Substitute

1. remove or omit the exact declared admission standing;
2. then restore a valid declaration for the exact eligible item and rerun the decision.

### Repository evidence at the J10 anchor

`lib/corpus/admission.ts` states that membership must be **DECLARED and CHECKED, never INHERITED from where a thing happens to sit**. `decideAdmission(...)`:

- denies when no declaration row exists (`fail-closed-no-declaration`);
- denies when the row is not explicitly eligible;
- denies identity, path, domain, entity-type, and applicable page-range mismatches;
- admits only after the declared conditions pass.

### Result

✅ **SURVIVES AS HEALTHY CONTROL.** Storage presence alone does not authorize the effect. With no sufficient declaration the item is excluded; with the exact valid declaration it becomes eligible only within the declared conditions.

The candidate therefore describes a healthy implementation, not only three failure taxonomies.

⛔ No admission change is authorized or required by this lane.

---

## §6 — Falsification result

The same terms survive all four substitutions without semantic drift:

| Question | Retrieval | Capability | Keep | Admission |
|---|---|---|---|---|
| **Does authority/grant exist?** | ✅ on the authority-bearing path | ⛔ not established by declaration alone | ✅ bounded founder grant | ✅ explicit declaration/authority chain |
| **Does a governed effect exist?** | ✅ | ⛔ not from the declaration | ✅ | ✅ |
| **Does the effect consume sufficient authority?** | ⛔ bypass path does not | n/a | ✅ authority is consumed, but see scope | ✅ |
| **Does the effect remain inside scope?** | ⛔ not bounded on bypass path | n/a | ⛔ scope overrun | ✅ |
| **Failure / control** | grant not consumed | inert declaration | grant exceeded | healthy control |

### First-falsification finding

> **Authority existence ≠ authority consumption ≠ authority sufficiency.**

The evidence therefore supports, at this bounded stage:

> **one constitutional invariant + domain-specific enforcement**

and does **not** support:

> one shared missing implementation layer.

The remedies remain legitimately different:

- Retrieval may need to consume an existing domain authority plane.
- Capability would first need an explicit decision about intended class and an operative consumer before availability can be governed.
- Keep may need a narrower interpretation boundary or a separately adjudicated grant.
- Admission presently demonstrates the healthy relation and may require no change.

A constitution can unify **what must be true** without forcing every subsystem to use the same mechanism.

---

## §7 — Defeater retained

Outcome (3) remains live as a defeater.

If a later seam can be made to fit this candidate only by changing the meaning of **grant**, **effect**, or **scope**, then the apparent common invariant is another rhyme rather than a law.

In that case this candidate must be narrowed or rejected.

Four seams do **not** establish universality.

---

## §8 — Explicit stop boundary

This lane authorizes **none** of the following:

- ⛔ generic `AuthorityService`;
- ⛔ shared authority middleware;
- ⛔ generalized authority registry;
- ⛔ schema or migration changes;
- ⛔ `RetrievalService` repair;
- ⛔ Keep matcher repair;
- ⛔ capability activation;
- ⛔ runtime or production opening;
- ⛔ expansion or amendment of `REPRESENTATION_AUTHORITY_LAW.md`;
- ⛔ claim that these four seams prove universality.

**Repair remains unopened.**

---

## §9 — Repository-lineage containment

This record is intentionally authored from the exact J10 evidence anchor `59043c3e` rather than appended to the later #1342 line.

At inspection on 2026-09-17, current canonical `clean-main-no-secrets` was `2e82ca9f10128c034956c974f4c6501f811035e7`. Comparing canonical to the J10 anchor showed the histories had diverged from merge-base `97c7d946`: the J10 lineage was **5 commits ahead and 7 behind**.

Therefore:

> ⛔ **DO NOT OPEN A PR FROM THIS RAW LINEAGE TO CANONICAL.**

Before any PR, the documentary act must receive an ancestry/diff reconciliation that prevents unrelated historical commits from being carried into canonical merely because this evidence branch preserves J10 custody.

This is a containment rule, not authorization to rebase, cherry-pick, merge, or reconstruct prior records in this lane.

---

## Standing

```text
J9 J4                         ✅ CLOSED @ d7bc229a
J10 AUTHORITY-PLANE CENSUS    ✅ CLOSED @ 59043c3e
"one missing layer"           ⛔ WITHDRAWN

J11 candidate                 ✅ SURVIVES FIRST FALSIFICATION
standing                      BOUNDED · NOT CANONIZED

retrieval                     effect bypasses existing authority consumption
capability                    declaration exists · governed effect not established
Keep                          bounded grant exists · scope overrun
admission                     healthy control · explicit declaration · fails closed

candidate invariant           one constitutional invariant
                              + domain-specific enforcement
universality                  ⛔ NOT ESTABLISHED
outcome (3) defeater          ✅ RETAINED

shared implementation         ⛔ UNAUTHORIZED
repair                         ⛔ UNOPENED
runtime / production           ⛔ UNOPENED
Representation Authority Law  ⛔ UNCHANGED

raw-lineage PR                ⛔ PROHIBITED pending ancestry/diff reconciliation
```

**Returned for founder adjudication.**
