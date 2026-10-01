# AIN-CABIN-RUNTIME-01 — Local Runtime Boundary

**Status:** implementation candidate  
**Base:** `9b3ab56ca`  
**Purpose:** make MAIA Desktop capable of hosting a genuinely offline Soullab runtime without replacing the existing desktop shell.

## Governing sentence

> **The network may expand the Cabin; it must not be required for the Cabin to exist.**

## What already exists

`maia-desktop` already provides:

- the native Electron host;
- a privileged local renderer;
- a separate unprivileged platform view;
- strict platform-origin/navigation policy;
- authenticated connected mode;
- continuity/session modules;
- a packaging pipeline.

The platform policy already accepts loopback origins for local witnesses.

## What is missing

The packaged Desktop currently contains the Electron host, not the full Soullab web runtime. Its normal platform view points at `https://soullab.life`.

Therefore a true Cabin requires a local runtime process that can satisfy the existing platform-view contract.

## Runtime topology

```text
MAIA Desktop
  |
  +-- privileged Electron host
  |
  +-- local Cabin runtime
  |      |
  |      +-- packaged Next standalone
  |      +-- local member store
  |      +-- Grokker / House / Studio surfaces
  |      +-- local model adapter
  |
  +-- optional connected platform view
         |
         +-- https://soullab.life
```

The local runtime binds to loopback only.

The Electron shell remains the authority that decides whether the member is in offline Cabin mode or connected mode.

## Offline mode

Offline Cabin must:

- bind only to `127.0.0.1` / loopback;
- expose `/maia` as the canonical local entry;
- provide a local health endpoint;
- never require `MAIA_BASE_URL`;
- never send a member identity assertion from Electron;
- persist member-owned state locally;
- use local model adapters only;
- continue to function with all network interfaces unavailable.

## Data boundary

The current online platform contains PostgreSQL-backed server routes. A packaged Next runtime alone does not make those routes offline.

Therefore the Cabin migration must be explicit:

### Reusable unchanged

- visual design system;
- House/Cabin context contract;
- Writer’s Studio semantic laws;
- Grokker semantic field;
- MAIA constitutional rules;
- desktop shell security model;
- source/provenance contracts.

### Must acquire a local-first implementation

- member identity/session for offline use;
- Work and manuscript persistence;
- House preferences;
- memory;
- Source Fabric index;
- semantic field persistence;
- local MAIA conversation state.

No online PostgreSQL dependency may be silently hidden behind an offline flag.

## Storage direction

The repository already contains local-first memory work and SQLite-backed memory implementations. The Cabin should converge those efforts rather than create a third memory store.

The target is one versioned local member store capable of holding:

- identity capsule;
- Work declarations;
- manuscript metadata;
- semantic field;
- memory;
- source references;
- migration metadata.

## Model direction

The local model is an interchangeable capability.

MAIA identity does not live in the model.

The model adapter must support:

- local model available;
- local model unavailable;
- model upgrade;
- model migration.

The Cabin must remain coherent even when the underlying model changes.

## Evolution

A downloaded Cabin package has four separable update layers:

1. constitutional layer — slowest;
2. semantic/data schema — versioned migration;
3. runtime/model capability — replaceable;
4. visual/interface layer — continuously evolvable.

A new model must not create a new identity.

## Acceptance for Runtime-01

The next implementation milestone passes when:

- Desktop starts a packaged local runtime;
- local runtime binds only to loopback;
- `/maia` opens without internet;
- network interfaces can be disabled during the session;
- House → explicit Work continuity still functions;
- local Work/manuscript state persists across restart;
- Grokker state persists locally;
- local MAIA can converse through a local model;
- connected mode remains available when the member chooses it;
- the same member field can migrate between offline and connected modes without identity duplication.

## Explicit non-goal

This act does **not** claim that the full Soullab platform is already offline.

It establishes the runtime boundary required to make that possible without creating a second desktop architecture.
