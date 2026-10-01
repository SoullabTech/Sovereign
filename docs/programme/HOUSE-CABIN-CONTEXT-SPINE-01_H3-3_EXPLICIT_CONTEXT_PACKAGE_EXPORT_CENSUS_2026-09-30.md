# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.3 — Explicit Context Package Export

## Gate question

Can an explicit export write a portable Context Package artifact from already-governed
projections without creating a synchronization mechanism or a second authority?

## Ruling

H3.3 opens one narrow write boundary:

governed projections
      ↓
H2.4 composition
      ↓
explicit export call
      ↓
atomic package artifact
      ↓
next Cabin runtime start / explicit remount

The writer does not discover, infer, enrich, synchronize, or reinterpret source
domains.

It receives projections that have already passed their own H2.1/H2.2/H2.3
contracts.

## Export law

The writer MUST:

1. accept only an absolute artifact path;
2. accept only projections accepted by H2.4 composition;
3. permit an empty package;
4. serialize deterministic ordinary JSON;
5. write with owner-only permissions;
6. replace the artifact atomically within its directory;
7. leave the prior artifact untouched if validation or staging fails;
8. never write CabinLocalStore;
9. never write browser storage;
10. never call the network;
11. never inject member/session identity;
12. never add timestamps, package ids, relevance, questions, transitions, or graph edges;
13. never watch the artifact or auto-refresh the runtime mount;
14. require an explicit export invocation.

The writer is an **export seam**, not a sync protocol.

## Falsifiers

### F1 — path ambiguity

Relative paths are rejected.

### F2 — projection bypass

Malformed or ungoverned projections are rejected before any target write.

### F3 — identity smuggling

Member/session/browser identity cannot appear in the serialized package.

### F4 — nondeterminism

Identical projections produce byte-identical package JSON.

### F5 — partial-write exposure

A failed staging operation cannot replace the existing artifact.

### F6 — authority creation

The writer cannot create Work, Relationship, or Memory objects of its own.

### F7 — persistence leakage

The writer has no database or browser-storage seam.

### F8 — automatic synchronization

There is no watcher, timer, network pull, or runtime refresh triggered by export.

## Acceptance

H3.3 passes when the export writes a valid H2.5 package, invalid input cannot
replace an existing artifact, output is deterministic and owner-readable, and
the writer remains offline, explicit, and source-authority-neutral.

## Implementation witness

Implemented as:

- `lib/cabin/contextPackageWriter.ts`
- `lib/cabin/__tests__/contextPackageWriter.test.ts`

The writer composes only already-governed projections through H2.4. It writes
ordinary versioned JSON to an explicitly supplied absolute path, using a
same-directory staging file and atomic rename. Staging uses owner-readable
permissions (`0600`).

Focused H3.3 suite: **12/12 PASS**.

Combined H2.1–H3.3 focused Cabin tests: **83/83 PASS**.

The focused suite includes a direct H3.2 custody witness: a package written by
H3.3 is mounted by the H3.2 runtime and returns the exact same governed Work
projection.

The writer also proves:

- malformed projections cannot replace an existing artifact;
- identical projections produce byte-identical JSON;
- package artifacts contain no member/session/browser identity;
- failed staging leaves the prior target intact;
- no CabinLocalStore, browser-storage, network, watcher, timer, or automatic
  remount seam exists;
- an explicitly empty package is valid.

No production file, database, or deployment target was touched.

**H3.3 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

## Stop boundary

Do not add:

- automatic sync;
- filesystem watching;
- connected-network retrieval;
- scheduled export;
- identity transfer;
- MAIA cognition;
- Grokker ingestion;
- Question or Transition;
- graph synthesis;
- automatic runtime remount;
- production deployment.


## H3.3 implementation witness

Implemented as:

- `lib/cabin/contextPackageWriter.ts`
- `lib/cabin/__tests__/contextPackageWriter.test.ts`
- `docs/design/contracts/cabin-context-export.md`

The writer:

- requires one absolute package artifact path;
- accepts only projections accepted by H2.4 composition;
- permits an explicitly empty package;
- produces deterministic package bytes;
- stages the complete JSON artifact with owner-only permissions;
- replaces the target through a same-directory rename;
- leaves an existing target untouched when validation fails;
- removes a failed staging file when replacement cannot complete;
- has no database, browser, network, watcher, timer, or runtime-remount seam.

Focused H3.3 suite: **12/12 PASS**.

The end-to-end local witness writes a package containing a governed Work reference
and then consumes that exact artifact through the H3.2 runtime mount.

Combined `lib/cabin/__tests__` suite: **83/83 PASS**.

Existing local-authority witnesses remain **16/16 PASS**.

## Standing

**H3.3 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

No automatic synchronization, MAIA cognition, Grokker ingestion, Question,
Transition, graph synthesis, or production deployment is opened by this slice.
