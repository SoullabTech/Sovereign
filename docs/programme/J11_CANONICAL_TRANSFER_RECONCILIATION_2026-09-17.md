# J11 — CANONICAL TRANSFER RECONCILIATION

**Status:** ✅ ANCESTRY RECONCILED · ⛔ TRANSFER BLOCKED ON ONE DOCUMENTARY CORRECTION
**Class:** documentary custody / ancestry only · ⛔ NOT A BUILD · ⛔ NOT A REPAIR
**Canonical base inspected:** `2e82ca9f10128c034956c974f4c6501f811035e7`
**Historical J10 anchor:** `59043c3e0640b6c372e9c65feaf2027c825412d1`
**Historical J11 head:** `c6028851e3cd28693473d489cc67aa1050bba0b8`

This record exists because J11 correctly prohibited opening a pull request from its raw historical lineage. The purpose here is narrower: determine which historical commits are true semantic prerequisites, which are only evidence/history, which claims require time-scoping against current canonical, and whether J11 is accurate enough to transfer.

No historical branch is merged, rebased, cherry-picked, or rewritten by this act.

---

## 1. Exact divergent ancestry

The J11 lineage from the common ancestor is:

```text
97c7d946  common ancestor
  ↓
2c5ff877  Maven founder rulings + T1-A charter + Member Manual v1
  ↓
7e8eee16  Maven custody / Keep-semantics reconciliation
  ↓
d577d1b0  J8-R3 retrieval contract + candidate AIN Representation Law
  ↓
d7bc229a  J9 founder adjudication + Representation Authority Law ratified
  ↓
59043c3e  J10 authority-plane census + SELECTIVE refinement
  ↓
c6028851  J11 grant/effect boundary falsification
```

At reconciliation, current canonical `2e82ca9f` and J11 remain divergent from merge-base `97c7d946`. Therefore the raw branch remains ineligible for a canonical PR.

---

## 2. Ancestry classification

| Commit | Subject | Transfer standing | Reason |
|---|---|---|---|
| `2c5ff877` | Maven rulings, Member Manual, T1-A charter | ⛔ **DO NOT CARRY AS J11 ANCESTRY** | Broad independent subject. J11 may depend on facts first investigated there, but those files are not semantic prerequisites of the J11 result. |
| `7e8eee16` | Maven custody / Keep-semantics reconciliation | ⛔ **DO NOT CARRY AS J11 ANCESTRY** | Evidence/custody record. May be cited by immutable SHA where needed; not required to make the later constitutional documents intelligible. |
| `d577d1b0` | J8-R3 candidate retrieval contract + candidate law | ⛔ **DO NOT TRANSFER WHOLESALE** | Candidate law was superseded by J9; several runtime-state statements are historical. The final law must be transferred from its later final blob, not by importing this candidate ancestry. |
| `d7bc229a` | J9 adjudication + ratified Representation Authority Law | ✅ **SEMANTIC PREDECESSOR** | Establishes the founder ruling and constitutional law J10/J11 explicitly govern under. Runtime-state statements inside the J9 record are historical and must not be read as current production standing. |
| `59043c3e` | J10 bounded authority-plane census + law refinement | ✅ **DIRECT EVIDENCE PREDECESSOR** | J11 names this exact SHA as its evidence anchor. J10 also corrects J9's claim that an authority mechanism is absent: it exists on the Library path and is bypassed by `RetrievalService`. |
| `c6028851` | J11 first falsification | ⚠️ **TARGET, NOT YET TRANSFERABLE** | One evidence sentence in §5 materially overstates what `lib/corpus/admission.ts` checks. Correction required before canonical transfer. |

### Result

The raw six-commit chain is **not** the transfer unit.

The bounded semantic chain is:

```text
final Representation Authority Law
        +
J9 founder adjudication
        ↓
J10 bounded census
        ↓
corrected J11 falsification
```

The preceding Maven/member-manual/custody/J8-candidate commits remain historical evidence, not inherited transfer payload.

---

## 3. Current-canonical revalidation

The constitutional/documentary chain was tested against current canonical `2e82ca9f` before any transfer decision.

### 3.1 Retrieval bypass — still observable on current canonical

`lib/ain/knowledge/RetrievalService.ts` still:

- imports `query`, `generateLocalEmbedding`, and `toPgVectorLiteral`;
- reads directly from `ain_knowledge_chunks`;
- requires `embedding IS NOT NULL`;
- may filter by `domain` and `categories`;
- applies a similarity threshold;
- does **not** consume corpus admission, `globalRetrievalAuthority`, or `LibraryService`.

Therefore the J10 distinction still exists on current canonical: one retrieval path consumes governed source authority and this AIN reader does not.

### 3.2 Governed Library authority — still observable on current canonical

`lib/corpus/admission.ts` remains declaration-based and fail-closed. `lib/library/globalRetrievalAuthority.ts` derives global retrieval keys from admitted source paths and SHA-256 values, and fails closed with `AND FALSE` when no governed keys exist. `LibraryService` consumes that authority in both semantic and full-text global retrieval queries.

Therefore J10's correction of J9 remains materially valid: the repository does contain a governed authority mechanism; the issue is bypass/consumption on a separate path, not total absence.

### 3.3 Keep grant — still observable on current canonical

`lib/consciousness/keepIntent.ts` still carries the explicit founder contract:

```text
UNDERSTAND  recognize Keep intent
FACILITATE  surface/open the member-controlled gesture
COMMIT      member confirmation only
```

The module remains a deterministic recognition classifier with no persistence authority.

### 3.4 Capability cell — time-scoped

The capability declaration file `lib/maia/capabilities.ts` is present on current canonical and still declares the registry surface. This reconciliation does **not** newly claim a current repository-wide `0 consumers / 0 callers / 0 emissions` census. J11 states that result as evidence **at the J10 anchor**, and it must remain time-scoped that way unless separately re-witnessed.

---

## 4. Documentary defect found in J11 §5

J11 §5 currently states that `decideAdmission(...)`:

> denies identity, path, domain, entity-type, and applicable page-range mismatches

That is not the contract implemented by `lib/corpus/admission.ts` at the exact J10 anchor, and it is not the contract on current canonical.

### What the code actually governs

At `59043c3e`, `decideAdmission(...)` fails closed through the following checks:

1. **no matching declaration rule** → excluded;
2. **classification is not one of the admitting classes** → excluded;
3. **structured authority basis missing/incomplete** → excluded;
4. **authority kind incompatible with classification** → excluded;
5. for `rights_holder_authorized`, missing rights-holder identity, governed evidence source, or exact subject SHA-256 → excluded;
6. candidate symlink or unreadable candidate → excluded;
7. exact subject bytes do not match the authorized SHA-256 where required → excluded;
8. governed authority evidence escapes the corpus-authority namespace, is a symlink, is unreadable, lacks its marker, fails to name the rights holder, or fails to bind the subject digest → excluded;
9. declared material carrying a human-record signal → **REFUSED**;
10. only after all applicable checks pass is the candidate admitted.

There are **no `domain`, `entity-type`, or page-range predicates** in this admission function.

### Disposition

The incorrect predicate list is a **documentary evidence error**, not a failure of the J11 candidate invariant.

The healthy-control conclusion still survives:

> storage/location alone does not grant corpus authority; absent or insufficient declaration/authority fails closed; a candidate is admitted only after the applicable declared authority checks pass.

But `c6028851` must **not** be transferred verbatim as canonical history while §5 contains the inaccurate list.

---

## 5. Historical production-state claims are not current standing

J9 and J10 contain statements such as:

```text
PRODUCTION 0 rows · EA ingestion CLOSED
```

Those statements describe the evidence state at their historical anchors. They are not to be reasserted as current production facts during transfer.

A clean transfer must preserve them as **time-scoped historical evidence**, while this reconciliation records that later governed corpus work has advanced beyond that state.

Likewise, open PR `#1344` is a separate current J8 repair candidate based on canonical `2e82ca9f`. It is **not** an ancestor of this documentary chain. If it merges before the constitutional transfer, the retrieval cell must be re-witnessed against the new canonical head before merge of the transfer PR.

---

## 6. Clean-transfer set — after the correction gate

No raw-history merge is permitted. After J11 §5 is corrected, the smallest intended transfer set is:

1. `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`
   - final historical blob at J10: `5b058a46a62c4131c486f8d191d34d9610a01fd8`
2. `docs/programme/J9_REPRESENTATION_AUTHORITY_ADJUDICATION_2026-09-17.md`
   - historical blob: `7d9ac157e7b9ecc807354bd692ccc502b40bb673`
3. `docs/programme/J10_AUTHORITY_PLANE_CENSUS_2026-09-17.md`
   - historical blob: `4f06b774b3d26c848d8dc31812a3589d10b30f2f`
4. `docs/programme/J11_GRANT_EFFECT_BOUNDARY_FALSIFICATION_2026-09-17.md`
   - **corrected successor required; `1fecadce…` is not eligible as-is**
5. this reconciliation record.

Explicitly excluded from the transfer payload:

- Maven founder-adjudication / Member Manual ancestry;
- Maven custody reconciliation;
- J8-R3 candidate law / candidate retrieval-contract ancestry;
- source/runtime/schema/test changes;
- any open-PR implementation from #1344, #1345, or #1346.

---

## 7. Freshness gate before a later transfer PR

Immediately before opening or updating the eventual transfer PR:

1. resolve current `clean-main-no-secrets` head;
2. if canonical moved beyond `2e82ca9f`, compare the touched evidence seams;
3. if retrieval behavior changed — especially if #1344 landed — rerun the retrieval falsification cell against the new head;
4. verify no target documentation path now exists with a conflicting canonical version;
5. verify the transfer branch contains only the bounded documentation set;
6. stop on any semantic collision rather than silently choosing a version.

---

## Standing

```text
RAW J11 LINEAGE                    ⛔ NOT A TRANSFER UNIT
2c5ff877 / 7e8eee16               evidence/history only · do not carry
 d577d1b0                          superseded candidate + historical runtime evidence · do not carry wholesale
 d7bc229a                          required semantic predecessor
59043c3e                           required direct evidence predecessor
c6028851                           target with one documentary defect

CURRENT CANONICAL                  2e82ca9f
retrieval bypass                   ✅ re-observed
Library authority path             ✅ re-observed
Keep narrow grant                  ✅ re-observed
capability 0-consumer claim        ⚠️ historical at J10 anchor; not newly re-witnessed here

J11 candidate invariant            ✅ not defeated by the documentary correction
J11 §5 evidence wording            ⛔ CORRECTION REQUIRED
canonical transfer                 ⛔ BLOCKED UNTIL CORRECTED
implementation / repair            ⛔ CLOSED
runtime / production               ⛔ UNTOUCHED
```

**Next discrete act:** correct J11 §5 in documentary custody, then construct the bounded transfer from the current canonical head and rerun the freshness gate before opening its PR.
