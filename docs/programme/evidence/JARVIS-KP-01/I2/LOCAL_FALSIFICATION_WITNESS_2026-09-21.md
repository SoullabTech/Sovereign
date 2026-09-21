# JARVIS-KP-01 / I2 — Local Falsification Witness

**Act:** I2 — Pure Constitutional Epistemic Join Evaluator  
**Date:** 2026-09-21  
**Founder-authorized base:** `981b741b24924af7fc7e82d73a158be58fbff7d3`  
**Actual reconciled canonical base:** `d0b51f1fb754b97b2f45cab955a978c85853b14b`  
**Implementation head witnessed before evidence records:** `054b0356517a65656c6e3ad5bf92ba4771bf48f6`

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

## 1. Freshness reconciliation

At execution time, `clean-main-no-secrets` had advanced **7 commits** beyond the Founder-authorized base.

The intervening canonical delta did **not** touch:

- `lib/ain/epistemic-join/`
- `tests/constitutional/epistemic-join/`

The authorized I2 semantics were therefore preserved while rebasing the implementation act onto the actual current canonical head:

`d0b51f1fb754b97b2f45cab955a978c85853b14b`

No I2 law was widened, narrowed, or reinterpreted by the freshness reconciliation.

## 2. Bounded implementation

The executable surface before evidence records consisted of exactly:

1. `lib/ain/epistemic-join/types.ts`
2. `lib/ain/epistemic-join/evaluate.ts`
3. `tests/constitutional/epistemic-join/i2-matrix.ts`

The evaluator is an in-memory pure function over explicit inputs.

It contains no persistence adapter, runtime call site, provider call, graph write, member-memory write, prompt integration, projection integration, route integration, filesystem dependency, network dependency, clock dependency, or randomness dependency.

The output fixes:

`downstreamRepresentationAuthorized: false`

for all I2 evaluations.

## 3. Constitutional falsification matrix

Executed:

`npx -y -p tsx@4.21.0 tsx tests/constitutional/epistemic-join/i2-matrix.ts`

Result:

`17/17 PASS`

The matrix established the required falsifiers:

1. relation with no warrant fails closed;
2. mere reference does not become reliance;
3. support set does not become a composite warrant;
4. jurisdiction mismatch fails closed;
5. member confirmation cannot establish an external fact;
6. member confirmation can elevate a member-authoritative component;
7. causal claim requires causal warrant;
8. motive attribution requires motive warrant;
9. diagnostic claim requires diagnostic warrant;
10. scientific claim outside warrant jurisdiction fails;
11. composite warrant without dependence assumptions fails;
12. uncertainty/boundary loss blocks standing elevation;
13. warrant licenses only its declared relation semantics;
14. failed promotion remains available as lower-standing hypothesis;
15. current standing is derived from append-only acts rather than a mutable field;
16. successful admission does not create downstream representation authority;
17. identical inputs are deterministic and the evaluator does not mutate them.

Witness footer:

```text
RESULT: 17/17 PASS
DOWNSTREAM AUTHORITY: CLOSED
PERSISTENCE: NONE
PROVIDER/MODEL CALLS: NONE
```

## 4. Isolated TypeScript compile

Executed only against the new evaluator contract and implementation:

`npx -y -p typescript@5.6.3 tsc --noEmit --strict --skipLibCheck --target ES2020 --module commonjs --moduleResolution node lib/ain/epistemic-join/types.ts lib/ain/epistemic-join/evaluate.ts`

Result:

**PASS — exit 0**

## 5. Prohibited dependency scan

The I2 implementation boundary was scanned for imports/requires of:

- PostgreSQL / Prisma;
- OpenAI / Anthropic SDKs;
- filesystem;
- HTTP / HTTPS;
- network;
- child-process execution.

Result:

**CLEAN**

No prohibited import was found.

## 6. Non-mutation witness

The temporary test checkout was clean after execution:

`git status --short` → no output.

The evaluator's determinism case separately compares input serialization before and after evaluation and compares repeated outputs byte-for-byte by JSON serialization.

## 7. Preserved constitutional seams

The I2 candidate changes no file beneath:

- `database/migrations/`;
- Relational Practice Ledger;
- Wisdom Graph;
- Member Memory;
- Living Constellation;
- MAIA prompt/context;
- runtime routing;
- provider/model configuration;
- `.ain/epistemic-ledger.jsonl`.

No `crossing_allowed` constraint is touched or lifted.

No production call site exercises I2.

## 8. What this witness establishes

This witness supports the following bounded disposition:

> **The epistemic-join constitution is executable as a pure deterministic function without granting persistence, representation, or runtime authority.**

It does **not** establish:

- persistence;
- schema fitness;
- production integration;
- shadow operation;
- runtime admission;
- member-memory authority;
- Living Constellation relation display;
- deployment.

Those remain closed behind later separately authorized gates I3 through I7.
