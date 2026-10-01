# HOUSE-CABIN-CONTEXT-SPINE-01 · H2.5 — Package Custody Census

## Gate question

Can a serialized Cabin Context Package be accepted back into the Cabin without
trusting the file to tell the Cabin what it is?

## Ruling

The package is a portable artifact, so import must be a validation boundary.

Serialization alone is not enough.

The Cabin must:

1. parse ordinary JSON;
2. require the exact package schema;
3. require member scope;
4. require exactly the governed top-level fields;
5. require the exact shapes of Work, Relationship, and Memory projections;
6. preserve item-level provenance and permission;
7. reject unknown fields rather than silently carrying opaque material;
8. reject Question/Transition additions;
9. return a fresh package object;
10. never touch the source database.

## Why strictness matters

A portable package is a trust boundary.

If import simply accepts arbitrary JSON and passes it downstream, a future
producer could smuggle in:

- member identity;
- generated relevance;
- semantic edges;
- hidden questions;
- hidden transitions;
- vendor/model state;
- ungoverned memory.

The parser therefore acts as a custody membrane.

## Falsifiers

### F1 — schema spoofing

Wrong or missing schema is accepted.

### F2 — scope spoofing

A scope other than member is accepted.

### F3 — unknown-field smuggling

Extra top-level or nested fields survive import.

### F4 — projection spoofing

An item with the wrong projection schema or permission basis survives.

### F5 — Question/Transition smuggling

Questions or transitions appear in the imported package.

### F6 — identity smuggling

Member/session/browser identity appears in the imported package.

### F7 — graph/meaning smuggling

Generated edges, relevance, synthesis, or interpretation appear.

### F8 — source mutation

Import mutates the serialized source object or reuses mutable references.

### F9 — nondeterministic normalization

The same valid package produces different canonical JSON.

### F10 — network dependency

Parsing requires the online runtime.

## Acceptance

H2.5 passes when malformed packages are rejected, valid packages round-trip to
the same canonical JSON, and the parser is pure/offline.

## Implementation witness

Implemented by extending:

- `lib/cabin/contextPackage.ts`
- `lib/cabin/__tests__/contextPackage.test.ts`

The custody parser now:

- rejects malformed JSON;
- rejects wrong package schemas;
- rejects unknown top-level fields;
- rejects unknown nested fields;
- rejects wrong projection schemas or permission bases;
- rejects Question/Transition smuggling;
- rejects identity/relevance/graph smuggling;
- returns a fresh package object.

H2.5 focused custody suite: **20/20 PASS**.

Combined H2.1–H2.5 focused tests now total **52/52 PASS**.

Project typehealth remains at **223 errors against a 239-error baseline** with
the same unrelated Stripe diagnostic at `lib/stripe/config.ts:23`. No H2.5
diagnostic is reported.

**H2.5 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

**Boundary:** no database import, no sync, no network, no MAIA cognition, no UI.
