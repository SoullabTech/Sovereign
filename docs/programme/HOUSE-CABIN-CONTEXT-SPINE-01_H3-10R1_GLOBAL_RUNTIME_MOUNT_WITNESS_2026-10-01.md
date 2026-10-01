# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.10-R1 — Shared Runtime Mount Witness

## Finding

The H3.10 bridge was semantically correct but its first implementation stored the ephemeral mount in module-local variables.

Next server bundles can instantiate the runtime module separately for an API route and a server-rendered experience. A mount initialized by one module instance was therefore invisible to another module instance.

The consequence was a false unavailable experience even when the Cabin health witness reported mounted.

## Repair

The ephemeral runtime holder now lives on a process-local globalThis slot:

    process
      └── globalThis
           └── Cabin runtime mount

This is still ephemeral runtime state.

It is not:

- persistent storage;
- browser storage;
- a database;
- a cache;
- a synchronization layer.

The artifact remains the durable portable source and H2.5 remains custody authority.

## Falsifier

F10 loads a second runtime module instance after the first module has already been loaded, initializes the mount through the second instance, and proves that the H3.10 experience bridge sees the same mounted field.

## Evidence

- H3.10 experience suite: **9/9 PASS**
- runtime suite: **11/11 PASS**
- combined Cabin suite: **116/116 PASS**
- design canon: **PASS**
- typehealth: **223 errors vs 239 baseline**; same unrelated Stripe diagnostic
- no artifact/database/browser/network write introduced

## Standing

**H3.10-R1 IMPLEMENTATION COMPLETE · CROSS-BUNDLE RUNTIME WITNESS COMPLETE.**

This repair is required before a real Cabin experience can consume the mounted field in the Next runtime.

No production deployment is authorized by this record.