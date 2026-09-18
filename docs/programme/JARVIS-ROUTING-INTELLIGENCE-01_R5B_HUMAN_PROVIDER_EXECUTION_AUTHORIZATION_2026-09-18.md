# JARVIS-ROUTING-INTELLIGENCE-01 / R5B — Human Provider Execution Authorization

**Date:** 2026-09-18
**Status:** IMPLEMENTED LOCALLY · FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION
**Exact authorized base:** `caddb904c7cfddcec0da0888a98bfb8795ae23d2`
**Branch:** `feature/jarvis-routing-intelligence-r5b-20260918`
**Authority:** Founder authorization for R5B implementation/falsification only
**Stop boundary:** no real provider call, external network use, provider spend, repository disclosure, merge, deployment, or production mutation.

## 1. Governing law

R5B implements one distinction:

```text
routing recommendation
    != human authorization
    != execution
```

The bounded flow is:

```text
Human creates / selects Work Unit
        ↓
JARVIS plans route
        ↓
R5A binds exact route
route_digest + canonical SHA
        ↓
R4 evaluates execution admission
        ↓
HELD_FOR_AUTHORITY
        ↓
human reviews exact provider/model/evidence/authority facts
        ↓
AUTHORIZE THIS EXECUTION ONCE
        ↓
append-only Human Provider Execution Grant
        ↓
R4 re-evaluates
        ↓
ADMITTED
        ↓
CONFIRM EXECUTE
        ↓
immediate route + grant + evidence + R4 recheck
        ↓
credentials may be consulted
        ↓
provider execution
        ↓
durable attempt/evidence recording
        ↓
grant CONSUMED
        ↓
independent evaluation / adjudication
```

R5B does not make routing executable. The persisted R5A binding continues to carry:

```text
execution_connected = false
```

The legacy `run-provider` action remains blocked for route-bound Work Units.

## 2. Human Provider Execution Grant

Added:

- `scripts/builder/human-provider-execution-grant.mjs`
- `scripts/builder/human-provider-execution-grant-store.mjs`

The pure grant law binds a one-shot grant to:

- Work Unit identity;
- Work Unit execution fingerprint;
- exact provider id;
- exact provider/model reference;
- immutable R5A route digest;
- route version;
- bound canonical SHA;
- route role;
- route position;
- exact evidence membrane;
- evidence-membrane digest;
- exact R4 required authority;
- exact human grant scope;
- attempt population at issuance;
- immutable grant digest.

A grant cannot create:

- repository read authority;
- repository write authority;
- test authority;
- production read/write;
- deploy;
- merge;
- authority change;
- constitutional closure;
- Founder adjudication.

Provider execution authority is exact:

```text
provider.execute:<provider-id>
```

and is never inherited from route selection.

## 3. Routed Work Unit authority posture

R5B preserves routed Work Units with:

```text
authorized_acts = [repo.read]
provider_strategy = []
execution_connected = false
```

Execution-specific external authority is neither silently granted nor pre-emptively denied on a routed Work Unit. It remains absent until the separate R5B human act.

This is required because R4 distinguishes:

```text
missing authority  -> HELD_FOR_AUTHORITY
explicit denial    -> REFUSED
```

R5B does not alter R4. It makes the route-bound Work Unit truthful about the difference between **not yet authorized** and **forbidden**.

Write, production, deployment, and authority-change acts remain explicitly denied.

## 4. Append-only grant ledger

Human grant state is stored separately from the immutable Work Unit packet:

```text
<AIN_DELEGATION_HOME>/execution-grants/<work-unit-id>.jsonl
```

Events are append-only:

```text
ISSUED
  ↓
ACTIVE
  ↓
CLAIMED
  ↓
CONSUMED
```

Alternative terminal event:

```text
ACTIVE -> REVOKED
ACTIVE/CLAIMED -> INVALIDATED
```

The grant ledger never rewrites the Work Unit packet.

A corrupt ledger fails closed rather than silently skipping malformed evidence.

## 5. One-shot law

Immediately before provider execution, JARVIS verifies that the grant still matches:

- Work Unit;
- Work Unit execution fingerprint;
- provider;
- model;
- route version;
- route digest;
- canonical SHA;
- route role/position;
- evidence membrane;
- exact required authority;
- exact granted scope;
- attempt count.

Any intervening attempt invalidates the old authorization population.

Therefore:

```text
retry != inherited authorization
```

A later provider attempt requires a distinct human grant.

Before the provider child is launched, the grant is synchronously moved from:

```text
ACTIVE -> CLAIMED
```

so a double gesture cannot reuse it.

After the attempted execution path returns, it becomes:

```text
CLAIMED -> CONSUMED
```

even when the provider attempt fails, because one-shot authority has already been spent.

## 6. Credential ordering

R5B's execution path deliberately orders:

```text
human grant exists
        ↓
grant still exact
        ↓
fresh R4 evaluation
        ↓
ADMITTED
        ↓
provider registry resolution without credential lookup
        ↓
credential presence check
        ↓
CLAIM grant
        ↓
provider child
```

The R5B preview and **Authorize this execution once** gesture do not inspect credentials.

The credential value is never loaded into the renderer and remains under the existing provider/delegate custody law.

## 7. Desktop authority plane

No new preload or IPC channel was added.

R5B extends the already-ratified:

`jarvis:work-unit-action`

with four bounded verbs:

- `execution-auth-preview`
- `authorize-execution-once`
- `confirm-execute`
- `revoke-execution-grant`

The renderer may submit only bounded identities.

For `confirm-execute`, it supplies:

- Work Unit id;
- grant id.

It cannot submit:

- raw authority;
- route record;
- route digest;
- provider id;
- model id;
- evidence membrane;
- canonical SHA;
- filesystem path;
- shell command;
- credential;
- network grant;
- spend grant.

MAIN reloads and recomputes those facts.

## 8. Founder-facing flow

The Work Unit cockpit now surfaces, for each bound provider act:

- exact provider;
- exact model;
- route role;
- why the route selected it;
- local vs external;
- exact evidence membrane;
- exact evidence refs;
- network requirement;
- provider-spend requirement;
- disclosure boundary;
- route digest;
- authority that remains denied.

The gestures are deliberately separate:

```text
Review execution
        ↓
Authorize this execution once
        ↓
Confirm Execute
```

The UI explicitly states:

> Authorize is not Execute.

## 9. Falsification evidence

### Pure R5B grant law

```text
15 / 15 PASS
```

Proves, among other things:

- route selection alone remains held;
- grant exactness;
- no write/production/deploy/merge/Founder authority creation;
- local R4 admission only after the exact human grant;
- external network/spend/disclosure are exact and bounded;
- explicit Work Unit denial cannot be silently overridden;
- route-digest tamper invalidates;
- model change invalidates;
- evidence-bundle change invalidates;
- intervening attempt invalidates;
- absent local substrate refuses;
- admission projection does not mutate Work Unit core;
- grant-digest tamper is detected.

### Append-only grant store

```text
8 / 8 PASS
```

Proves:

- first issuance becomes ACTIVE;
- duplicate active grant is refused;
- CLAIMED cannot be reused;
- CONSUMED cannot become active again;
- a later separately authorized attempt gets a distinct grant;
- unused grant can be revoked;
- Work Unit packet is not rewritten;
- corrupt ledger fails closed.

### Desktop R5B integration

Dedicated execution-order tests:

```text
2 / 2 PASS
```

Proves:

- preview does not touch credentials;
- Authorize once does not touch credentials;
- Confirm Execute reaches credential presence only after fresh R4 ADMITTED;
- the provider executor is not reached on stale Work Unit facts;
- material Work Unit change invalidates the grant before credential lookup.

### Desktop regression

```text
177 total
168 PASS
0 FAIL
9 intentional SKIP
```

### Preload authority

```text
97 / 97 PASS
13 ratified preload channels unchanged
1 ratified push channel unchanged
```

### TypeScript no-regression

```text
program files  4379  (baseline 3965)
diagnostics     229  (baseline 239)
regressions       0
PASS
```

### Full canonical regressions

```text
W1   22 / 22
W2   27 / 27
W3   28 / 28
W4   31 / 31
W5   22 / 22
R2   20 / 20
R3    8 /  8
R4   24 / 24
R5A  20 / 20
J6   15 / 15
provider governance 44 / 44
alpha/preload floor 97 / 97
```

`npm run jarvis:proof` also remains green across its nine constituent suites.

## 10. Non-events

No R5B implementation/falsification action performed:

- real provider inference;
- external network request;
- provider spend;
- repository disclosure to an external provider;
- member/client/PHI/production disclosure;
- production read/write;
- deployment;
- merge.

All execution-order tests used injected local stubs.

## 11. Standing

R5B implementation and deterministic falsification are locally complete.

This record does **not** merge or deploy R5B.

The next act is exact-candidate Founder adjudication only.
