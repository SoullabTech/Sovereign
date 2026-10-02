# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R4 — Silent Repository Fallback

Date: 2026-10-01
Status: IMPLEMENTED CANDIDATE · TESTED · LIVE PACKAGED WITNESS OWED
Precondition: O5-R3 ADMITTED at b19004cd5c1babbc20e83681bb8dad944c22f9bf

## 1. Question

Desktop must never silently acquire authority-bearing repository state from
`~/MAIA-SOVEREIGN` merely because explicit runtime binding is absent.

The question is not whether the fallback path may remain visible. It may.
The question is whether an implicit fallback may become a source of authority.

## 2. Census finding

The defect was real.

Packaged repository resolution still contains the hard-coded candidate:

`/Users/soullab/MAIA-SOVEREIGN`

When it validates, the resolver returns:

`resolution = implicit-default`

Provenance correctly renders that state as DEGRADED and not self-binding-satisfied.
However, authority-bearing IPC paths previously consulted only `currentRoot()`.
A non-null implicit-default root therefore remained capable of feeding:

- governed Builder work execution;
- Work Unit creation and lifecycle mutation;
- transport preparation;
- one-shot provider authorization;
- Confirm Execute / revoke / evidence / adjudication / closure;
- deterministic C0 execution;
- local C1 execution;
- session-governance mutation.

Presentation had been stricter than authority.

## 3. Law

> Repository visibility is not repository authority.

A Desktop repository resolution may bear authority only when the binding is explicit:

- `explicit-env`
- `explicit-config`
- `dev-walk`

The following are not authority-bearing:

- `implicit-default`
- `unresolved`
- any future unrecognized resolution

An implicit fallback may remain visible for status, provenance, continuity search,
capability inspection and remediation. It must fail closed before a consequential
Desktop act.

The refusal vocabulary is:

`HELD_FOR_EXPLICIT_REPOSITORY_BINDING`

with the still-visible candidate root and resolution included in the result.

## 4. Implementation

`jarvis-desktop/src/repo-authority.js` owns the pure resolution-to-authority decision.

`main.js` now applies it at these authority membranes:

1. `jarvis:run-work-unit`;
2. every mutating/executing Work Unit action;
3. C0 deterministic execution after routing;
4. C1 local-model execution after routing;
5. governance mutation.

Read-only surfaces continue to use `currentRoot()`.

The C0/C1 executor uses the admitted `binding.root`, not a second repository variable.
This also removes the stale undefined `REPO_ROOT` reference from the C1 path.

External frontier reasoning remains a separate explicit act and is not made dependent
on repository fallback standing by O5-R4.

## 5. Falsification

The executable matrix requires:

- explicit env authority survives;
- explicit saved-config authority survives;
- dev-walk authority survives;
- implicit-default is visible but authority-held;
- unresolved is authority-held;
- provenance still labels implicit-default DEGRADED;
- the packaged hard-coded candidate remains visible;
- Work Unit mutation is gated;
- Builder execution is gated;
- C0/C1 execution is gated after routing;
- governance mutation is gated;
- read-only status/continuity remain available.

## 6. Regression evidence

At construction:

- `scripts/builder/__tests__/jarvis-alpha-floor-proof.mjs`: 97 / 97 PASS;
- `npm run test:jarvis-o5-r4`: 3 / 3 PASS;
- `npm run matrix:jarvis-o5-r4`: 12 / 12 PASS;
- focused canonical execution / capacity / Work Unit / operator-authority tests:
  92 / 92 PASS;
- `node --check jarvis-desktop/src/main.js`: PASS;
- `git diff --check`: PASS.

The alpha-floor filename guard was corrected to distinguish admitted O5-R3
`runtime-binding.js` (descriptive witness record) from a forbidden Desktop-local
execution runtime/pipeline/verifier copy. Its semantic prohibition remains intact.

## 7. Exclusions

O5-R4 does not:

- remove the visible fallback candidate;
- change resolver precedence;
- alter explicit env/config/dev-walk authority;
- create repository authority;
- widen Work Unit authority;
- alter grant-store or lease law;
- execute a provider;
- merge, deploy or touch production.

## 8. Admission boundary

O5-R4 is not yet closed.

One packaged-app witness is owed:

1. isolate launch state so no `JARVIS_REPO_ROOT` or explicit saved repository governs;
2. establish that the hard-coded valid checkout resolves as `implicit-default`;
3. confirm Home/System can still show the candidate and DEGRADED provenance;
4. attempt one bounded authority-bearing Desktop act;
5. require `HELD_FOR_EXPLICIT_REPOSITORY_BINDING`;
6. prove no Work Unit/grant/session/provider state changed;
7. choose the same repository explicitly;
8. repeat the bounded act and prove the O5-R4 repository-authority hold is gone
   without claiming any downstream act itself is authorized.

Only that witness may close O5-R4 as ADMITTED.
