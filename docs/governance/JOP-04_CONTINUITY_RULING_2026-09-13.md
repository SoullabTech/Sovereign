# JOP-04 — Continuity Ruling

**Date:** 2026-09-13 · **Authority:** founder ruling · **Status:** RATIFIED · **Mode:** continuation
**Predecessors bound:** `JOP-00` · `JOP-01` · `JOP-02` · `JOP-03` · `JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16`

---

## Disposition

```text
JOP-04
CONTINUATION — NOT SUPERSESSION
```

This work continues the existing JARVIS Operator Programme as **JOP-04**. It is not a new
programme, and it does not supersede one.

The reason is architectural, not procedural: a new programme would rename already-ratified
objects, reopen settled jurisdiction, and make Desktop custody negotiable again — when none of
those things are actually changing.

## Inherited without reopening

| Inherited | Source |
|---|---|
| JARVIS Living Spiral jurisdiction | `docs/governance/JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16.md` (RATIFIED) |
| JARVIS Desktop as primary / operator custody surface | same, R1 |
| A member is never an inferred node | same, R2 |
| MAIA exclusion boundary | same, R1 (*"It does not live inside MAIA"*) |
| Refusal of shared elemental operator vocabulary | same, disposition table |
| Deterministic capability gateway | `scripts/builder/deterministic.mjs` (merged, security-accepted) |
| Governance gate · packet guard · runtime store · context router | `scripts/builder/jarvis-*.mjs` (PR #1043) |
| Prior security proof and zero-LLM proof | `docs/ops/JARVIS_ROUTE_A_CUSTODY_ADOPTION_PROOF_2026-08-11.md` · `…_LIVE_ZERO_LLM_PROOF_2026-08-11.md` |

## Not re-authored

```text
DOES NOT RE-AUTHOR
  Living Work Model          — the Living Spiral already is it
  operator jurisdiction      — ratified 2026-08-16
  custody                    — Desktop, ratified
  read capability substrate  — merged and proven
```

⛔ **JOP-04 does not build a Sovereign Action Gateway from zero.** The read-class gateway is
already merged and security-proven. An earlier framing in this lane proposed building one; that
framing is **struck**.

## Subject

> **JOP-04 is the transition from a proven read-only sovereign operator to a governed
> effect-bearing operator.**

The architecture question is no longer *"Can Jarvis safely execute capabilities?"* — that is proven
for read-class work. It is:

> **"Under what conditions may Jarvis cause state in the world to change?"**

Its subject is therefore the admission, authorization, execution, recovery, receipt, and
distribution laws for effect-bearing capabilities.

## JOP-01's owed distribution closure — an inherited gate, correctly scoped

`docs/ops/JOP-01_CLOSURE_LEDGER_2026-08-16.md`: **SOURCE CLOSURE ESTABLISHED · DISTRIBUTION CLOSURE OWED.**

```text
JOP-04 census / design / specification / disposable testing
        │
        │ ALLOWED — closure does not gate authoring
        ▼
effect model · capability contract · authority model
receipts · defeat candidates · shadow tests
        │
        ▼
──────────────────────────────────────────────
DISTRIBUTION BOUNDARY
JOP-01 DISTRIBUTION CLOSURE OWED
──────────────────────────────────────────────
        │
        X  no mutating authority crosses into
           distributed / operator use until
           closure is satisfied
```

**JOP-01 distribution closure is an inherited deployment/distribution gate, not an authoring gate.**

Otherwise an old packaging debt would prevent designing the thing needed next; but ignoring that
debt when mutation begins would be equally wrong. Those are different gates and are ruled
separately.

## Effect taxonomy — CANDIDATE, not ratified

A candidate family is recorded for falsification, **explicitly not ruled**:

```text
READ                 observes state
DRAFT                creates proposed state with no external force
MUTATE               changes recoverable internal state
IRREVERSIBLE_MUTATE  deletes / destroys / overwrites without guaranteed restoration
EXTERNALIZE          causes information or state to cross a custody boundary
COMMIT               creates a consequential external obligation
```

The governing observation: **one linear enum is too weak for this problem.** `send`, `delete`,
`publish` and `spend` are not peers of `read`/`mutate`; they differ along reversibility,
externality, financial consequence, audience, custody crossing, authorization duration, and
required confirmation. Concrete acts should acquire **properties**, not one fuzzy label.

⛔ **Names not ruled. To be falsified before any taxonomy is frozen.**

## First write specimen

**GitHub / Git** — for a precise reason, not convenience: `git.*` READ capabilities already exist
and are proven, so Git offers the **smallest possible delta from observation to effect** without
introducing a new domain model.

```text
git.rev_parse        READ                          already proven
git.log              READ                          already proven
repo.grep            READ                          already proven
        ↓ frontier
git.create_branch    MUTATING
git.apply_patch      MUTATING
git.commit           MUTATING
github.open_pr       EXTERNALIZING
github.merge_pr      HIGHER-AUTHORITY MUTATION
```

⛔ The first mutating specimen must be **deliberately reversible and low consequence**. `merge`,
`delete`, `publish`, email-send and spending are **not** eligible as the first write.

## Consciousness wrappers — no salvage by renaming

The six `lib/mcp/integrations/*ConsciousnessIntegration.ts` wrappers are **not** JOP substrate.
Incorporating them because they contain "integration machinery" would cross the ratified
jurisdictional boundary the Living Spiral ruling exists to prevent.

```text
transport pattern        maybe reusable — only after depsychologization
retry pattern            maybe reusable — only after depsychologization
adapter lifecycle        maybe reusable — only after depsychologization

psychological authority  NOT JOP substrate
member inference         NOT JOP substrate
consciousness ontology   NOT JOP substrate
MAIA semantics           NOT JOP substrate
```

## Standing

```text
JOP-04 OPENED                        ✓ (this ruling)
NEXT ACT                             JOP-04 Effect-Bearing Capability Substrate Census
EFFECT TAXONOMY                      CANDIDATE — not ruled
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED — outside jurisdiction
CODE CHANGED BY THIS RULING          none
```
