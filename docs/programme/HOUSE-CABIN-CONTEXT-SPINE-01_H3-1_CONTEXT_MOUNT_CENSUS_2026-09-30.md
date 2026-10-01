# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.1 — Cabin Context Mount Census

## Gate question

How does a validated portable Context Package become available to the local
Cabin runtime without becoming a second persistent authority?

## Existing runtime boundary

The Desktop already has:

- a supervised local Next runtime;
- a durable local Cabin data path;
- loopback-only operation;
- fail-closed offline cognition;
- a local SQLite authority for Identity, House, Work, Manuscript, turns, and
  developmental memory.

What it does **not** have is a runtime mount for a validated Context Package.

## Ruling

The Context Package should enter the Cabin as a **read-only runtime mount**.

It is not:

- a database;
- a browser/session state;
- a currentWork field;
- a memory store;
- a new permission system;
- a sync protocol.

The mount is ephemeral runtime state. The package remains the portable artifact;
the canonical source domains remain the authorities.

## Mount law

A mount MUST:

1. accept only a package that passes the H2.5 strict custody parser;
2. hold a defensive copy;
3. expose only the package's governed projections;
4. preserve item-level provenance and permission;
5. preserve memory recall standing;
6. never write to CabinLocalStore;
7. never write browser storage;
8. never call the network;
9. disappear when the mount is cleared or the runtime ends;
10. allow an empty package;
11. never derive current Work, Question, Transition, or graph edges.

## Falsifiers

### F1 — invalid package admission

**Defeat candidate:** mount malformed or schema-invalid JSON.

**Death:** mount becomes ready.

### F2 — persistence leakage

**Defeat candidate:** mount writes the package into local source tables.

**Death:** CabinLocalStore changes.

### F3 — browser leakage

**Defeat candidate:** mount stores package in localStorage/sessionStorage.

**Death:** browser storage is touched.

### F4 — network leakage

**Defeat candidate:** mount resolves package data from a URL or online API.

**Death:** network access is required.

### F5 — authority collapse

**Defeat candidate:** mount exposes a currentWork/currentMemory/currentRelationship
field.

**Death:** a hidden "current" object appears.

### F6 — source mutation

**Defeat candidate:** caller mutation changes the mounted package.

**Death:** source or mount state changes through shared references.

### F7 — lifecycle leakage

**Defeat candidate:** a fresh mount instance inherits the previous package.

**Death:** state survives without an explicit package input.

## Acceptance

H3.1 passes when the mount is validated, defensive, ephemeral, offline, and
source-read-only.

## Implementation witness

Implemented as:

- `lib/cabin/contextMount.ts`
- `lib/cabin/__tests__/contextMount.test.ts`
- `docs/design/contracts/cabin-context-mount.md`

Focused H3.1 suite: **10/10 PASS**.

The mount admits only packages accepted by the H2.5 custody parser, keeps a
defensive runtime copy, and has no browser, network, database, or lifecycle
persistence seam.

Combined H2.1–H3.1 focused tests: **62/62 PASS**.

Project typehealth remains at **223 errors against a 239-error baseline** with
the same unrelated Stripe diagnostic at `lib/stripe/config.ts:23`. No H3.1
diagnostic is reported.

**H3.1 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

**Boundary:** no Desktop wiring, no API route, no MAIA cognition, no UI, no
sync, no persistence.
