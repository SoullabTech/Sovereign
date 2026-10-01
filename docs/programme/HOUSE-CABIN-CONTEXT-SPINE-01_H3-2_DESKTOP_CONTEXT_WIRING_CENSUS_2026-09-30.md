# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.2 — Desktop Context Wiring

## Gate question

Can the Desktop carry an explicit Cabin Context Package into the local runtime,
let the Cabin validate and mount it, and let the runtime read only the governed
Work / Relationship / Memory projections without creating a new authority?

## Authorized boundary

H3.2 is the narrow bridge:

Desktop
  ↓
explicit package artifact path
  ↓
Cabin runtime
  ↓
H2.5 strict custody parser
  ↓
ephemeral H3.1 mount
  ↓
read-only context surface

This cut does not open MAIA or Grokker cognition.

It does not open Question or Transition, synchronization, a new store, a new
provider, an event log, identity inference, current-Work inference, persistence,
or graph/synthesis behavior.

## Package ownership

The portable package remains an artifact, not a database authority.

Desktop owns only the runtime launch configuration: the explicit package path
passed to the local process. The Cabin owns the ephemeral runtime mount.

The package itself remains governed by H2.4/H2.5. No Desktop code constructs,
interprets, enriches, or rewrites Work / Relationship / Memory projections.

## Runtime identity boundary

The package contains no member id, session id, browser state, or vendor handle.
Cabin identity remains established by the local Cabin session boundary. Desktop
does not inject connected-mode identity into the local runtime.

This preserves identity authority rather than creating a second identity claim.
## Falsifiers

### F1 — package-path ambiguity

Defeat candidate: Desktop supplies a relative, malformed, or silently
substituted package path.

Death: runtime launches with an unintended artifact location or path.

### F2 — invalid-package admission

Defeat candidate: malformed or schema-invalid package reaches the mounted
runtime state.

Death: H3.2 reports a mounted context for a package rejected by H2.5.

### F3 — Desktop authority expansion

Defeat candidate: Desktop injects member identity, session identity, or
cognition state alongside the package path.

Death: those values cross the Desktop → Cabin environment boundary.

### F4 — runtime read bypass

Defeat candidate: the runtime reads arbitrary JSON rather than the strict
H2.5 package parser.

Death: context becomes available without passing custody validation.

### F5 — source mutation / persistence

Defeat candidate: mounting or reading the package writes CabinLocalStore,
browser storage, or the package artifact.

Death: any source or persistent Cabin state changes because of the mount.

### F6 — authority collapse

Defeat candidate: the runtime exposes currentWork, currentMemory,
currentRelationship, Question, Transition, graph edges, relevance, or
synthesis not present in the governed package.

Death: any such derived state appears at the Cabin context boundary.

### F7 — lifecycle leakage

Defeat candidate: a fresh runtime/mount inherits the previous package.

Death: context survives without a valid package input in the new runtime.

### F8 — connected-identity smuggling

Defeat candidate: connected-mode member identity is copied into the local
package or runtime as a second authority.

Death: package or Desktop environment contains member/session/browser
identity that the Cabin did not resolve itself.

## Acceptance

H3.2 passes only when:

1. Desktop resolves one explicit absolute package path and passes it to the
   supervised local runtime;
2. the runtime admits context only through the H2.5 parser;
3. invalid packages fail closed;
4. a valid package is readable through the Cabin context surface;
5. Work / Relationship / Memory projections retain their governed shapes;
6. empty context remains truthful and valid;
7. no source, browser, network, or database mutation occurs;
8. fresh runtime state does not inherit a previous package;
9. connected identity is not smuggled into the local authority boundary;
10. no MAIA/Grokker cognition, Question/Transition, sync, provider, store, or
    event-log behavior is introduced.

## Implementation witness

Current H3.2 candidate surfaces are:

- maia-desktop/src/cabin-runtime-policy.js
- maia-desktop/src/main.js
- app/api/cabin/health/route.ts
- app/api/cabin/context/route.ts
- lib/cabin/contextRuntime.ts

The first four runtime tests already establish the pre-existing Desktop
lifecycle boundary. H3.2 adds package-path propagation and the local runtime
read/mount seam.

No production deployment is authorized by this record.
## Explicit stop boundary

Do not add:

- a package writer or sync protocol;
- a second Context Package store;
- member-id transfer through Desktop;
- browser/localStorage/sessionStorage persistence;
- network retrieval;
- MAIA cognition or prompt conditioning;
- Grokker ingestion;
- Question or Transition objects;
- currentWork/currentMemory/currentRelationship state;
- graph edges or generated relevance;
- PostgreSQL fallback;
- production deployment.

The next boundary after H3.2 must be separately governed. H3.2 proves only
that the already-governed package can cross the Desktop/runtime boundary and
remain governed there.
