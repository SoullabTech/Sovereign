# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.5 — Explicit Connected Export Command

## Gate question

Can one explicit connected export command join H3.4 source assembly to the
H3.3 artifact writer without opening a second write path, automatic behavior,
or hidden selection?

## Ruling

H3.4 produces a governed in-memory Context Package.

H3.3 writes a governed Context Package artifact.

H3.5 may compose those two acts into one explicit command:

    member choice
        ↓
    H3.4 connected assembly
        ↓
    H2.4 package
        ↓
    H3.3 writer
        ↓
    context-package.json

The command is an orchestration seam only.

It does not change either authority.

## Command law

The command MUST:

1. require a member id;
2. require explicit Work, Relationship, and Memory selections;
3. assemble through H3.4;
4. write through H3.3;
5. perform no direct filesystem write;
6. perform no source mutation;
7. perform no discovery;
8. perform no ranking or synthesis;
9. perform no identity transfer;
10. perform no network or synchronization;
11. fail before writing if H3.4 rejects the selection;
12. require an explicit invocation.

The command MAY return the H3.3 writer result so callers can observe the
artifact path, byte count, and governed package.

## Falsifiers

### F1 — writer bypass

**Defeat candidate:** H3.5 writes the file itself.

**Death:** filesystem write primitives appear in the command.

### F2 — assembly bypass

**Defeat candidate:** H3.5 calls H3.3 with caller-created arbitrary projections.

**Death:** H3.4 is not the source of the package.

### F3 — partial export

**Defeat candidate:** one invalid selected item still causes a package write.

**Death:** writer is invoked after H3.4 rejects.

### F4 — hidden selection

**Defeat candidate:** H3.5 changes an empty selection into discovered content.

**Death:** assembly receives exactly the caller's explicit selection.

### F5 — identity leakage

**Defeat candidate:** member/session identity is added to the package or writer
input.

**Death:** H3.5 changes the H2.4 package shape or adds identity fields.

### F6 — repeated write path

**Defeat candidate:** H3.5 adds another serializer or artifact format.

**Death:** H3.3 is not the only writer dependency.

### F7 — automatic behavior

**Defeat candidate:** H3.5 is called from a watcher, timer, startup hook, or
runtime refresh.

**Death:** the command itself contains or registers any automatic trigger.

## Acceptance

H3.5 passes when:

- one explicit invocation produces one H3.3 artifact;
- H3.4 is the only source assembly path;
- H3.3 is the only artifact writer;
- invalid selection produces no artifact change;
- empty selection produces a valid empty package;
- no new authority, synchronization, or cognition seam exists.

## Implementation witness

Implemented as:

- `lib/cabin/connectedContextExport.ts`
- `lib/cabin/__tests__/connectedContextExport.test.ts`
- `docs/design/contracts/cabin-explicit-connected-export.md`

The command performs exactly two architectural acts:

1. H3.4 assembles the package from explicit connected source selections;
2. H3.3 writes that package to the explicitly supplied artifact path.

The command itself contains no source query, filesystem primitive, network call,
timer, watcher, serializer, or identity transfer.

Failure ordering is structural: H3.4 must resolve before H3.3 is invoked.

Focused H3.5 suite: **6/6 PASS**.

Combined H2.1–H3.5 focused Cabin suite: **100/100 PASS**.

The focused suite includes a real H3.4 → H3.3 round trip for an explicitly
selected Work and verifies the resulting artifact is an ordinary valid H2.4
package with no member identity.

No UI, automatic trigger, synchronization, MAIA cognition, Grokker ingestion,
or production deployment is introduced.

**H3.5 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

## Stop boundary

Do not add:

- UI;
- automatic export;
- scheduled export;
- filesystem watching;
- runtime auto-remount;
- sync;
- MAIA cognition;
- Grokker ingestion;
- production deployment.
