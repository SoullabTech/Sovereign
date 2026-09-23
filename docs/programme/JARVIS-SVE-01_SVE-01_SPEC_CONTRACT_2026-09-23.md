# JARVIS-SVE-01 / SVE-01 — MACHINE-READABLE SPEC CONTRACT + PURE WITNESS

**Date:** 2026-09-23 · founder authorization *SVE-01 — MACHINE-READABLE SPEC CONTRACT + PURE WITNESS ONLY*
**Canonical base:** `clean-main-no-secrets @ d0261b9392514ed7be098acf5fb8e95a0fa8ec5c` (live at opening; SVE constitution blob `be8ca60ceb9fac37b5f7433dea9ab0c0748b8f51` verified at that base)
**Branch:** `chore/sve-01-spec-contract-20260923` (policy-compliant `chore/*`; hook absent in the build environment, so `scripts/check-branch-allowed.sh COMMIT` was run explicitly → allowed)

```text
Standing: SVE-01 CANDIDATE — built and witnessed · ⛔ NOT ADJUDICATED · ⛔ NOT CANONICAL
Population: exactly three paths (below)
Runtime effect: ZERO — nothing imports the contract except its own test
Gate: STOP for Founder adjudication
```

## 1 · Population

| Path | Role |
|---|---|
| `jarvis-desktop/src/sve-spec-contract.js` | the pure S1 contract |
| `jarvis-desktop/test/sve-spec-contract.test.mjs` | the witness suite (S1-F1…F18 + defeat + purity) |
| `docs/programme/JARVIS-SVE-01_SVE-01_SPEC_CONTRACT_2026-09-23.md` | this record |

Not modified, verified by the base→candidate diff: `operator-intent-contract.js` (`d46b63f6…`), `operator-work-unit.js` (`50fd41df…`), `canonical-work-unit-v2.js` (`3a94ee52…`), `work-unit-v2.mjs` (`3413381b…`), `main.js`, UI, `package.json`, `CLAUDE.md`, routing, providers, lifecycle, execution adapters.

## 2 · Contract identity and vocabulary

`SVE_SPEC_VERSION = "sve.spec.v1"`, carried on every admitted record. An input carrying any other `version` is refused (`VERSION_MISMATCH`); historical versions are never reinterpreted as v1.

An admitted record contains exactly, in canonical order:

```text
version · spec_id · intent · current_state · target_state · scope · exclusions ·
authority_basis · inputs · expected_outputs · success_criteria · failure_criteria ·
stop_conditions · checkpoint
```

| Field | Kind | Rule |
|---|---|---|
| `spec_id` | text | opaque, caller-supplied; no clock, randomness or environment access |
| `intent` · `current_state` · `target_state` · `checkpoint` | text | required, non-empty after trim; never inferred |
| `scope` · `exclusions` · `authority_basis` · `success_criteria` · `failure_criteria` · `stop_conditions` | list of strings | required, **at least one explicit entry**; no default |
| `inputs` · `expected_outputs` | list of strings | required to be present; **may be explicitly empty** (an empty list is a statement, not a default) |

**Normalization defined:** leading/trailing whitespace is trimmed on every string. Nothing else. Internal wording is verbatim; there is no rewriting, casing, deduplication or reordering of human text.

**Refusal codes:** `INVALID_INPUT · VERSION_MISMATCH · MISSING_<FIELD> (×13) · INVALID_FIELD_TYPE · AUTHORITY_GRANT_FIELD · LATER_STAGE_FIELD · UNKNOWN_FIELD`. All blockers are **collected, not first-failed**, so a refusal names every violated law (see §5, defeat discipline).

## 3 · Authority-empty boundary

- `authority_basis` is a list of opaque references (a Founder authorization id, a constitutional provision, a governance act). It records the basis under which the specification was authored. **It is not a grant.**
- The record has no `grants` field and no mechanism to derive one. Any of `grants · authority_grants · authorized_acts · write_permission · merge_permission · deploy_permission · production_permission · provider_permission · network_permission` at top level refuses with `AUTHORITY_GRANT_FIELD` — its own code, not the generic unknown-field code, so the witness proves the authority law and not a neighbour.
- A specification may say *"the requested result is a canonical merge"* and admits; it still exposes no grant (S1-F11). This preserves the O1 distinction: *intent may name desired action without granting permission.*

## 4 · Stage separation (unknown-field law)

The contract fails closed on any undeclared top-level field. Fields belonging to later stages refuse with `LATER_STAGE_FIELD` and name the stage:

| Stage | Refused at S1 |
|---|---|
| SVE-02 verification | `success_evidence · falsifiers · invariants · world_state_evidence · critic · critic_requirement · independent_review · abort_law · repair_boundary · verifier_results` |
| SVE-03 environment | `canonical · canonical_sha · branch · worktree · model(s) · provider(s) · tools · runtime · external_systems · environment` |
| SVE-04 orchestration | `route · routing · execution · lifecycle · orchestration · witness · adjudication` |
| C0 / L0 | `merge · deploy · production · canonicalization · learning` |

Anything else undeclared refuses with `UNKNOWN_FIELD`. S1 scope is **semantic** scope; canonical SHA, branch and worktree binding are SVE-03's and cannot enter here.

## 5 · Relation to existing substrate

- **O1 intent contract** (`operator-intent-contract.js`, unchanged): O1 turns an utterance into an authority-empty intent record with a requested level. S1 takes *explicit structured* meaning, not an utterance, and adds no level, no authority mentions, no inference of any kind. S1 does not import O1; the seam is a data seam (`intent` may be authored from an O1 objective by a human or a later stage, never by this contract).
- **W0.v2 Work Unit** (`work-unit-v2.mjs`, `canonical-work-unit-v2.js`, `operator-work-unit.js`, all unchanged): W0.v2 already governs identity, canonical base, bounded repository paths, authority, acceptance, falsification, stop conditions, provenance and lifecycle. S1 is **not** a competing Work Unit schema: it carries none of canonical base, repository path binding, authority, lifecycle or provenance. No `specToWorkUnit()`, `executeSpec()`, `routeSpec()`, `bindSpecEnvironment()` or `verifySpec()` exists.

## 6 · Purity and immutability

The contract is a UMD module with no `require`, no dynamic `import`, no `process`, `Date`, `Math.random`, `fetch`, `fs`, `child_process`, `crypto`, `document`, `window` or timers. The suite's `S1-PURITY` witness scans the comment-stripped source for each of these. The contract never inspects the world to decide whether `current_state` is true; that belongs to SVE-06.

Admitted results and their `spec` are deep-frozen. Assignment, push and property addition throw `TypeError` under strict mode; mutating the caller's input after admission does not reach the record (S1-F17). `serializeSpec()` gives a canonical-order JSON form so identical meaning serializes identically regardless of input key order (S1-F18).

## 7 · Witness matrix

Each refusal witness asserts the **exact** blocker set (`deepEqual(codes, [INTENDED])`), so a fixture that died under a different or earlier rule fails the test instead of being counted as proof of the named law.

| Witness | Fixture | Expected | Result |
|---|---|---|---|
| S1-F1 | complete explicit spec | `ok:true`, `sve.spec.v1`, exact 14-field key set | PASS |
| S1-F1b | `version:"sve.spec.v0"` | `VERSION_MISMATCH` only | PASS |
| S1-F2 | intent `""` / whitespace / absent | `MISSING_INTENT` only | PASS |
| S1-F3 | current_state absent / empty | `MISSING_CURRENT_STATE` only | PASS |
| S1-F4 | target_state absent | `MISSING_TARGET_STATE` only | PASS |
| S1-F5 | scope absent / `[]` | `MISSING_SCOPE` only | PASS |
| S1-F6 | exclusions absent / `[]`; `["none beyond stated scope"]` admits | `MISSING_EXCLUSIONS` only; then ok | PASS |
| S1-F7 | success_criteria `[]` / absent | `MISSING_SUCCESS_CRITERIA` only | PASS |
| S1-F8 | failure_criteria `[]` | `MISSING_FAILURE_CRITERIA` only | PASS |
| S1-F9 | stop_conditions `[]` / absent | `MISSING_STOP_CONDITIONS` only | PASS |
| S1-F10 | checkpoint absent / whitespace | `MISSING_CHECKPOINT` only | PASS |
| S1-F10b | authority_basis absent / `[]` | `MISSING_AUTHORITY_BASIS` only | PASS |
| S1-F11 | Founder auth + canonical-merge objective; then `authority_grants`, `merge_permission` | admits with no grant field; `AUTHORITY_GRANT_FIELD` only | PASS |
| S1-F12 | `notes` | `UNKNOWN_FIELD` only | PASS |
| S1-F13 | `execution` | `LATER_STAGE_FIELD` naming SVE-04 | PASS |
| S1-F14 | `canonical_sha · branch · worktree · model · provider` | `LATER_STAGE_FIELD` naming SVE-03 | PASS |
| S1-F15 | `falsifiers · critic_requirement · world_state_evidence · verifier_results` | `LATER_STAGE_FIELD` naming SVE-02 | PASS |
| S1-F16 | plain intent, empty inputs/outputs | verbatim text (trim only); no deploy/production/merge/grant/level words; exact key set | PASS |
| S1-F16b | object intent, string scope, numeric criterion, null, array | `INVALID_FIELD_TYPE` / `INVALID_INPUT` only | PASS |
| S1-F17 | mutate record and caller input | `TypeError`; record unchanged | PASS |
| S1-F18 | reversed key order, repeated refusal | `deepEqual`; identical serialization | PASS |
| S1-DEFEAT | intent `""` + scope `[]` + `canonical_sha` + `authority_grants` | all four laws reported | PASS |
| S1-PURITY | comment-stripped source scan | no forbidden API | PASS |

## 8 · Exact checks run

```text
node --check jarvis-desktop/src/sve-spec-contract.js            → exit 0
node -e "require('./jarvis-desktop/src/sve-spec-contract.js')"  → loads, 13 exports
node --check jarvis-desktop/test/sve-spec-contract.test.mjs     → exit 0
node --test jarvis-desktop/test/sve-spec-contract.test.mjs      → 23 tests · 23 pass · 0 fail · exit 0
git grep sve-spec-contract (outside the three paths)             → no importer
scripts/check-branch-allowed.sh COMMIT chore/sve-01-…            → allowed
```

Node `v22.22.2`. No project-wide test, lint or typecheck was run: `jarvis-desktop` has no lint or tsconfig scope, and `tsconfig.ship.json` does not include it. Only the checks above are claimed.

Test list, verbatim from `node --test`:
```text
      ok 1 - S1-F1 — complete explicit specification admits with exact sve.spec.v1 standing
      ok 2 - S1-F1b — an explicit matching version is accepted; a historical version is not reinterpreted
      ok 3 - S1-F2 — empty intent refuses; the contract does not invent purpose
      ok 4 - S1-F3 — missing current state refuses; the starting premise must be explicit
      ok 5 - S1-F4 — missing target state refuses
      ok 6 - S1-F5 — missing or empty scope refuses; no unbounded specification
      ok 7 - S1-F6 — exclusions required; absence is not "everything else is allowed"
      ok 8 - S1-F7 — success criteria required; no default completion criterion
      ok 9 - S1-F8 — failure criteria required; failure must be representable before execution
      ok 10 - S1-F9 — stop conditions required; no default continuation
      ok 11 - S1-F10 — checkpoint required; no autonomous continuation inferred from silence
      ok 12 - S1-F10b — authority basis required and opaque; the contract does not supply one
      ok 13 - S1-F11 — authority basis does not grant authority
      ok 14 - S1-F12 — unknown top-level field refuses (fail closed)
      ok 15 - S1-F13 — execution field refuses and is attributed to its stage
      ok 16 - S1-F14 — environment-binding fields refuse; canonical_sha, branch, worktree are SVE-03
      ok 17 - S1-F15 — verification-contract fields refuse; falsifiers and critic_requirement are SVE-02
      ok 18 - S1-F16 — human wording is preserved, not semantically enlarged
      ok 19 - S1-F16b — non-string content refuses rather than being coerced into meaning
      ok 20 - S1-F17 — admitted record is deeply immutable
      ok 21 - S1-F18 — deterministic equality independent of key order, process state or time
      ok 22 - S1-DEFEAT — a multiply-broken fixture reports every violated law, so a single-law witness cannot be satisfied by an earlier rule
      ok 23 - S1-PURITY — the contract module reaches no filesystem, shell, network, clock, randomness or DOM API
```

## 9 · Decisions taken inside the authorization, flagged for adjudication

1. **`inputs` and `expected_outputs` may be explicitly empty.** §IX's no-default list names intent, target, scope, exclusions, success, failure, stop, checkpoint and authority basis, and omits these two. They must still be *present* as arrays; an empty array is an explicit statement. If the founder wants them non-empty, the change is one flag per field and one test each.
2. **Later-stage vocabulary is a fixed list**, wider than the minimum named in §X (it also names `invariants`, `independent_review`, `tools`, `runtime`, `witness`, `adjudication`, `learning`, etc., from the constitution's own S1/V0/E0/§XIX vocabulary). A name not on the list still refuses, as `UNKNOWN_FIELD`. The list only improves the attribution in the refusal; it never widens what is admitted.
3. **All blockers are collected** rather than first-failed. This is what makes the defeat discipline mechanical: a single-law witness cannot be satisfied by an earlier rule masking the intended one.
4. **Trim is the only normalization.** Internal whitespace and newlines are preserved so that human wording is never rewritten.

## 10 · What does not exist

No executor wiring. No import of this contract from `main.js`, `operator-work-unit.js`, `canonical-work-unit-v2.js`, Builder, or any provider or execution surface. No adapter to a Work Unit. No environment binding. No verification binding. No dogfood target. The schema has zero runtime effect until separately authorized.

## 11 · Standing

```text
SVE-00 Constitution         ✅ CANONICAL · RATIFIED · ADMITTED (d0261b93…)
SVE-01 Spec Contract        🔶 CANDIDATE BUILT · WITNESSED 23/23 · ⛔ NOT ADJUDICATED · ⛔ NOT CANONICAL
SVE-02 … SVE-07             ⛔ NOT OPENED
Dogfood experiment          ⛔ NOT OPENED
Production                  ✅ UNTOUCHED
```

Candidate commit: recorded in the branch history for this act (the commit that adds this record).
