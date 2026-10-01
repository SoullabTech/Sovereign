

## Implementation witness

Implemented as:

- `jarvis-desktop/src/cabin-export-request.js`
- `jarvis-desktop/test/cabin-export-request.test.mjs`
- `docs/design/contracts/jarvis-cabin-explicit-export-request.md`

The request envelope:

- derives a host-bound actor id;
- requires an absolute target path;
- accepts only Work, Relationship, and Memory id arrays;
- canonicalizes and deduplicates the explicit selection;
- contains no source content;
- produces a deterministic SHA-256 request digest;
- is deeply bounded/immutable at the request surface;
- distinguishes `PREPARED_NOT_EXECUTED` from execution;
- requires exact digest replay for a later execution act;
- refuses changed selection under an old digest;
- has no filesystem, network, watcher, IPC, H3.3, or H3.4 dependency.

Focused H3.7 suite: **10/10 PASS**.

JARVIS O0/O1/O2/O3/O4/operator regression witness: **178/178 PASS**.

## Standing

**H3.7 IMPLEMENTATION COMPLETE · REQUEST-ONLY BOUNDARY COMPLETE.**

The export has **not** been executed.

No new IPC channel was added. No artifact was written. H3.3 remains the sole
writer and H3.4 remains the sole connected source assembly path.

## Next boundary

The next act is deliberately separate:

**H3.8 — Explicit Export Execution Bridge**

It must establish a stable runtime bridge from JARVIS's request envelope to the
canonical H3.5 implementation without duplicating H3.3/H3.4 or smuggling
authority through the renderer.

That bridge should be solved before adding a UI button or automatic behavior.
