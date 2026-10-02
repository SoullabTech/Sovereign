# JARVIS-ROUTING-INTELLIGENCE-01 · J2-R1 · J1R4-F1
## Defeat-Candidate + Falsifier Suite — Falsification Witness

**Date:** 2026-09-22 · **Act:** founder authorization `J1R4-F1` (suite construction + execution only)
**Status:** ⭐ **MATRIX LETHAL + DISCRIMINATING** · ⛔ **J1R4 REMAINS CANDIDATE, NOT RATIFIED** ·
⛔ **J2 REMAINS SHUT**

> This witness says only what was actually demonstrated. Where a gate did not run, it says
> NOT RUN. Where an earlier run was invalid, it is recorded and excluded, not deleted.

---

## 1 · §VII PINS — verified by the instrument before the matrix ran

| Pin | Expected | Result |
|---|---|---|
| J1R4 contract blob | `98eb6cf16223b83b4768e46e1ae253e7881ae5f5` | ✅ match |
| J0 blob (canonical) | `494cd61973ed02c4453067716657631f3f9143e9` | ✅ match |
| TaskShape substrate blob (canonical) | `e840d705c9c1059667379d321cc7b5c802045754` | ✅ match |

⭐ A pin mismatch exits **2 = STALE / NO EVIDENCE**, deliberately distinct from **1 = failed
constitutional test**. No mismatch occurred.

**§I opening integrity.** Canonical at act start `32e677d30b15bc9c28b32bb7dbbb8c322bcf7a6c`;
it had advanced from `0691cd36…` by a four-file Teaching Applications A2 population with
⛔ **no overlap** with J0, the J5 routing source, JEV, or the suite paths. ⛔ J1R4 was not
edited during F1.

## 2 · EXACT SUITE POPULATION — file blob identities

| Path | Blob |
|---|---|
| `tests/constitutional/jarvis-jev-j1/contract-model.ts` | `f8d50789329d02e87574c4ce1020e366a4cd5837` |
| `tests/constitutional/jarvis-jev-j1/falsifiers.ts` | `f4bb51b46ee80e46523ada093ac688ad7d0d9365` |
| `tests/constitutional/jarvis-jev-j1/candidates.ts` | `2696a6e32fa409a1b728fed451223b33567d01ce` |
| `tests/constitutional/jarvis-jev-j1/matrix.ts` | `a76ed1d973aea92eed2b12be904c2f6ce48be7c6` |
| `tsconfig.jarvis-jev-j1.json` | `2fd52a305287392c7b7c706c5ba941a73af3e538` |

⛔ No runtime source, adapter, provider, routing implementation, capability table, J0/J1
document, schema, migration, deployment or production file was written. ⛔ No `package.json`
change.

## 3 · RESULT

```text
REFERENCE        conforming model passes all 46 falsifiers        ✅
LETHALITY        46/46 candidates die on their NAMED falsifier    ✅
DISCRIMINATION   70 collateral kills, 0 unclassified              ✅
STALE-COLLATERAL 0 declared collateral that stopped firing        ✅
SURVIVOR LAW     0 survivors                                      ✅

typecheck  exit 0
matrix     exit 0
```

⭐ Falsifiers assert the **identity** of the required outcome, never "something failed" —
e.g. a forged `TIMEOUT` must become host `OUT_OF_RANGE`; overflow must yield **no**
representation with `providerConsulted = false` and authority unchanged; `Q_RISK=false` must
leave guard state **exactly** unchanged.

## 4 · §VI SEAM DISCRIMINATION — demonstrated

| Seam | Demonstrated by |
|---|---|
| class grammar ≠ packet schema | `DC-CORRELATION-HANDLE` — asserts the parent class **still permits** a well-formed opaque id, **and** that it is not a packet member |
| provider response ≠ admitted host record | `DC-UNION-COLLAPSE` |
| Abstain-shaped ≠ lawful `ProviderAbstain` | `DC-FORGERY-AS-UNKNOWN-SHAPE` |
| structural shape ≠ enum/value validity | `DC-MODEL-FORGES-HOST-REASON`, `DC-FORGERY-AS-UNKNOWN-SHAPE` |
| construction failure ≠ abstention | `DC-FAILURE-AS-ABSTENTION` |
| advice ≠ authority | `DC-ADVICE-FEEDS-AUTHORITY`, `DC-CONFIDENCE-TOUCHES-AUTHORITY` |
| agreement evidence ≠ review discharge | `DC-AGREEMENT-AS-AUTHORITY`, `DC-AGREEMENT-IS-STANDING` |
| question selector ≠ prompt channel | `DC-QUESTION-TEXT`, `DC-PROSE-IN-REPRESENTATION`, `DC-VARYING-INSTRUCTION` |
| host-local correlation ≠ outbound correlation handle | `DC-CORRELATION-HANDLE` |

⭐⭐ **The `opaque fixed-width id` ruling is now proved rather than argued.**
`DC-CORRELATION-HANDLE` uses a **perfectly well-formed** 32-hex opaque identifier. The
falsifier first requires `classShapeEligible` to **accept** it — so a candidate that narrowed
the parent `repository_derived_metadata` grammar would fail — and then requires it to be
absent from the exact packet. ⭐ *Class-shape-legal and J1-packet-illegal at the same time,
demonstrated in one executable case.*

⭐ Its collateral on `DC-EXTRA-MEMBER` fired and is classified (founder-ruled legitimate).
⭐ It **also** fired `DC-VARYING-INSTRUCTION`, which was not anticipated and is informative:
**a work-unit identifier is a special case of work-unit-varying content.**

## 5 · COLLATERAL — 70 kills, all classified

Classified families, each with the mechanism that makes it **irreducible** (removing it would
require the candidate to cease embodying its error):

- **overflow family (42)** — all seven §5 laws assert the same required outcome for
  `OVERFLOW_STATE`: *no representation constructed*. Any candidate that constructs trips all
  siblings.
- **forgery family (14)** — five candidates perturb the **same single decision**: what the
  host does with a provider-originated `HostFailureReason`.
- **member family (9)** — work-unit-varying wording and correlation handles can only reach
  the wire as content, and content outside the six members is an extra member.
- **authority (3)** — count-conditioned agreement necessarily differs between one judgment
  and three, which is exactly what the accumulation law measures.
- **abstention rejection (2)** — refusing lawful abstentions necessarily breaks every
  abstention-dependent law.

## 6 · §IX INSTRUMENT SELF-WITNESS — three valid mutations

Each: mutation verified present → typecheck still **exit 0** (so the kill is **semantic**,
not a syntax failure) → matrix **RED on the named seam** → baseline restored **byte-exact**
(`sha256sum -c`, 5/5 OK) → typecheck + full matrix green again.

| # | Mutation | Expected seam | Observed |
|---|---|---|---|
| 1 | reference permits Jev to remove an authorized act | A7 / I1 | RED — `DC-REMOVES-AUTHORIZED-ACT`: *available authorized act set must be IDENTICAL* |
| 2 | reference trusts a provider-originated `HostFailureReason` | provenance | RED ×3 — `DC-MODEL-FORGES-HOST-REASON` (*admitted as TIMEOUT; required OUT_OF_RANGE*), `DC-HOST-REASON-PASSTHROUGH`, `DC-FORGERY-DISCARDED` |
| 3 | reference clamps an unrepresentable `file_count` | exact representation | RED ×7 — the whole §5 overflow family, `DC-CLAMP-ON-OVERFLOW` naming the clamp exactly |

⭐ All three went red **at the REFERENCE stage**, which is the strongest available form: the
conforming model itself stopped conforming.

## 7 · ⚠️ INVALID PRELIMINARY RUNS — recorded and EXCLUDED

⛔ Neither is counted as evidence.

1. **First matrix run — 170 collateral, 164 unclassified.** An **instrument defect**, not a
   finding: candidates overrode `constructPacket`/`admit` wholesale and so broke unrelated
   laws, violating §IV's *differ only as much as needed*. Repaired by delegating each
   candidate to the reference and perturbing one path.
2. **Second run — one survivor, `DC-VARYING-INSTRUCTION`.** ⭐ Isolated **too far**: varying
   wording was made a function of the packet, which does not vary with the work unit, so the
   candidate no longer embodied its error. Repaired per **SURVIVOR LAW** by fixing the
   **SUITE**, ⛔ never by weakening the falsifier.

⚠️ **A finding about the falsifiers themselves, recorded because it shaped the suite:** several
authority falsifiers originally asserted whole-state equality. That manufactured systematic
collateral — *every* authority-mutating candidate tripped *every* authority law. Each was
narrowed to the property it **owns** (I4 → authority must not vary with confidence; I5 → N
repeats must equal one; I2 → authority must not vary with advice value). ⭐ *A falsifier that
asserts more than its own law does not become stricter; it becomes less discriminating.*

## 8 · ⚠️ NOT RUN — stated as such, ⛔ not as a pass

- ⛔ **The repo toolchain was NOT resolvable.** There is no project `node_modules` in this
  container and no local `typescript`/`tsx`. The suite was run with **TypeScript 5.6.3 and
  tsx 4.23.15 installed into a scratchpad**, against the project's own
  `tsconfig.jarvis-jev-j1.json`. ⭐ The suite imports nothing from the project (only
  `node:child_process`), so the scratchpad toolchain exercises the same code — ⚠️ **but it is
  not the repo toolchain, and the founder's own run remains the evidence of record**, as in
  this programme's prior instrument lanes.
- ⛔ `npm run typecheck` / `check:no-supabase` / the Co-Lab release gate — **NOT RUN**
  (no `node_modules`). The population is test-only TypeScript plus one tsconfig; ⛔ that is a
  statement about scope, not a substitute for running them.
- ⛔ **No provider or network execution of any kind.** No Jev/TypeSafe call, no external
  inference, no provider spend. The suite consults only local git for the §VII pins.

## 9 · §X HONEST NEGATIVE RESULTS

⭐ **None of the 46 obligations proved unfalsifiable.** All 46 are paired with an executable
defeat candidate that dies on its named falsifier.

⚠️ **Two obligations had to be made falsifiable by exposing model accessors**, recorded because
the first drafting could not have killed them: `DC-TASKSHAPE-DRIFT` and `DC-SELF-STANDING`
originally asserted over module **constants**, which no candidate can override. `taskShapes()`
and `questionIds()` were added to the model interface so the errors are embodiable. ⛔ Without
that, both would have been **UNFALSIFIABLE BY THIS INSTRUMENT** and must have been recorded
as such rather than counted.

⭐ **No contradiction in J1R4 was exposed**, so ⛔ no contract return is owed from F1. Had one
appeared, the act required returning the contract rather than teaching the harness to choose
a meaning.

## 10 · COMMANDS

```text
npx tsc -p tsconfig.jarvis-jev-j1.json          → exit 0   (scratchpad tsc 5.6.3)
npx tsx tests/constitutional/jarvis-jev-j1/matrix.ts → exit 0   (scratchpad tsx 4.23.15)
```

## 11 · §XII STOP BOUNDARY — nothing beyond this act

⛔ No J1 ratification · ⛔ no J2 opening · ⛔ no J0 mutation · ⛔ no capability-table mutation ·
⛔ no provider registration · ⛔ no Jev/TypeSafe call · ⛔ no adapter construction · ⛔ no
routing-runtime integration · ⛔ no PR · ⛔ no merge · ⛔ no deploy · ⛔ no production mutation ·
⛔ **no suite freeze**.

⛔ The 2026-09-20 dev-lane interim hold remains operative, both lift conditions undischarged.
⛔ Jev remains external, advisory-only, the automatic fast path withdrawn.

## 12 · STANDING

```text
J0 Constitution      RATIFIED · CANONICAL · IMMUTABLE @ blob 494cd619
J1R1 · J1R2 · J1R3   RETURNED · historical
J1R4                 CANDIDATE · NOT RATIFIED @ blob 98eb6cf1
F1 suite             LETHAL + DISCRIMINATING · 46/46 · 0 survivors · ⛔ NOT FROZEN
J2                   NOT OPEN
ADAPTER              NOT AUTHORIZED
PROVIDER EXECUTION   NOT OPENED
```

**Next boundary:** founder adjudication of exact J1R4 `98eb6cf1…` together with this F1
lethality evidence.

⭐ *The suite proves the candidates die. It does not prove the contract is right — only that
the contract now says something definite enough to be wrong about.*
