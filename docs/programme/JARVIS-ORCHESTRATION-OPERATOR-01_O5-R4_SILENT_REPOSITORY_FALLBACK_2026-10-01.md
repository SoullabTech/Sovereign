# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R4 — Silent Repository Fallback

**Date:** 2026-10-01  
**Opened by founder act:** “continue” after O5-R3 admission  
**Base:** `b19004cd5c1babbc20e83681bb8dad944c22f9bf` · O5-R3 ADMITTED  
**Standing:** ADMITTED · CLOSED · production untouched

## 1. Law

> Desktop must never silently acquire grant-store authority from `~/MAIA-SOVEREIGN` merely because explicit runtime binding is absent.

A repository may become the authority-bearing Desktop substrate only through an explicit source:

1. valid `JARVIS_REPO_ROOT`;
2. valid persisted Preferences selection;
3. unpackaged dev launch whose upward marker walk resolves the checkout containing that running source.

A hard-coded candidate may be **suggested** to the founder. It may not become `currentRoot()` until the founder explicitly chooses it.

## 2. Census

The admitted O5-R3 base still contains a packaged resolver branch in `jarvis-desktop/src/main.js`:

```text
if (isValidRepoRoot('/Users/soullab/MAIA-SOVEREIGN'))
  return root=/Users/soullab/MAIA-SOVEREIGN, resolution=DEFAULT
```

`currentRoot()` then feeds Builder mechanism, Work Unit control, canonical routing and E1 grant paths. Therefore `DEFAULT` is not merely presentational degradation; it can become authority-bearing substrate.

Existing provenance correctly labels `implicit-default` as DEGRADED and not self-bound. That is useful evidence but does not prevent the root from being used.

## 3. Required behavior

When no explicit binding exists:

- active root = `null`;
- resolution = `unresolved`;
- the known default candidate may be returned separately as `suggested_repo_root` if it verifies;
- Home/Preferences may invite the founder to choose it;
- read/write/execution paths that require `currentRoot()` remain unavailable;
- choosing the suggestion through Preferences converts it into an explicit config binding.

An invalid or missing saved config must never silently fall through into authority from the default candidate.

## 4. Falsifiers

- **SF-1** no env + no config + valid hard-coded candidate must remain UNBOUND.
- **SF-2** invalid saved config + valid hard-coded candidate must remain UNBOUND and retain the config problem.
- **SF-3** invalid env + no config + valid hard-coded candidate must remain UNBOUND and name the env defect.
- **SF-4** suggested candidate must be informational only; `root` remains null.
- **SF-5** valid explicit env binding still resolves ENV.
- **SF-6** valid explicit config binding still resolves CONFIG.
- **SF-7** dev upward walk still outranks the packaged ladder.
- **SF-8** failed dev walk may use explicit env/config, but not the suggested default candidate.

## 5. Defeat cases

The matrix must kill implementations that:

- preserve the existing default binding;
- treat DEGRADED as sufficient authority;
- silently use the suggestion when config is invalid;
- silently use the suggestion when env is invalid;
- remove valid ENV or CONFIG resolution while fixing fallback;
- break the explicit dev-walk precedence.

## 6. Admission boundary

O5-R4 can close only when:

- pure resolver matrix is lethal and discriminating;
- real Desktop wiring proves `currentRoot()` cannot receive `implicit-default`;
- Preferences/first-run still expose a usable explicit choice path;
- authority-bearing IPC refuses while unbound;
- existing O5-R3 runtime-binding and writer-lease freezes remain intact.

No production, provider execution, grant issuance, or delegation-home mutation is authorized by O5-R4.


## 7. Implementation

The authority-bearing resolver is now split from repository suggestion.

`resolvePackagedMode()` admits only:
- valid explicit environment binding;
- valid persisted Preferences binding.

If neither exists, it returns:
- `root: null`;
- `resolution: unresolved`;
- the verified historical candidate, when present, as `suggestedRepoRoot` only.

Dev mode still gives present-tense launch context first authority through its upward marker walk. If that walk fails, it consults the same explicit ENV → CONFIG resolver. A suggested default is never promoted by dev fallback.

The first-run packaged prompt now offers **Choose Repository…** or **Continue Unbound**. Preferences displays any suggested repository on a separate row with the explicit statement that JARVIS remains unbound until the founder chooses one.

Both canonical Work Unit IPC and the governed run-work-unit path continue to fail closed when `currentRoot()` is null.

## 8. Evidence

Focused behavior:
- `npm run test:jarvis-o5-r4` — **14/14 PASS**.
- `npm run matrix:jarvis-o5-r4` — **LETHAL + DISCRIMINATING · WIRING INTACT**.
- SF-1…SF-8 all pass against the real resolver.
- DC-SF1…DC-SF8 are all killed.
- SF-W1…SF-W10 all pass.

Real-filesystem witness, preserved at `~/o5r4-real-fallback-witness.json`:
- `/Users/soullab/MAIA-SOVEREIGN` actually carries all canonical markers;
- no explicit config was supplied to the witness;
- `active_root = null`;
- `resolution = unresolved`;
- `suggested_repo_root = /Users/soullab/MAIA-SOVEREIGN`;
- `authority_binding_absent = true`.

The O5-R4 falsifier family is frozen by blob identity in `tests/constitutional/jarvis-o5-r4-silent-fallback/FREEZE.json`.
`npm run verify:jarvis-o5-r4-freeze` reports **FREEZE INTACT**.

## 9. Predecessor regression standing

All O5-R3 writer, recovery, runtime-binding, pre-write, transition, readiness, event-purity, gesture, and local-capacity suites remain green on the O5-R4 implementation.

`verify:jarvis-o5-r3-rb-freeze` remains **FREEZE INTACT**.

The historical Alpha Floor proof is **96 PASS / 1 unrelated stale failure**. The remaining failure is its old exclusion assertion that no Desktop-local runtime/pipeline/verifier implementation files exist; the current admitted Desktop architecture already contains the named governed modules. O5-R4 did not create that debt and does not reinterpret or waive it.

## 10. Closure

> **O5-R4 — ADMITTED.** JARVIS Desktop no longer obtains an authority-bearing repository merely because a hard-coded checkout exists. A valid historical candidate may be surfaced to the founder as a suggestion, but the Desktop remains unbound until an explicit environment binding, persisted Preferences choice, or explicit dev launch context establishes the substrate.

This admission adds no provider, grant, merge, deploy, production, or repository-selection authority. It narrows implicit authority.

Production is untouched.
