# AIN-CABIN-RUNTIME-02 — Local Runtime Supervisor

**Status:** implemented host boundary; runtime artifact pending  
**Base:** `05403bd1f` plus Runtime-02 changes  
**Scope:** Desktop lifecycle for a future packaged local Soullab runtime

## Governing sentence

> **A Cabin runtime is real only after the local health witness says it is ready.**

## State law

```text
idle
  ↓
starting
  ├── health witness → ready
  ├── process exit   → failed
  └── timeout        → failed

ready
  ↓
stopped
```

There is no `ready` state inferred from `spawn()` succeeding.

## Host boundary

The supervisor is Electron-free. It receives three host capabilities:

- process spawning;
- HTTP health fetch;
- timers.

The Electron composition root supplies those capabilities through the Utility Process API. This keeps the runtime lifecycle portable while leaving the actual native process mechanism in the host adapter.

## Startup

When `MAIA_CABIN_MODE=offline`:

1. Desktop resolves a bounded loopback port.
2. Desktop sets the platform perimeter to that loopback origin before loading shell policy.
3. Desktop starts the local runtime.
4. Desktop polls `/api/cabin/health`.
5. Only a successful HTTP response transitions the supervisor to `ready`.
6. If the runtime does not become healthy within the bounded startup window, Desktop fails closed rather than switching to `soullab.life`.

Connected Desktop does not start this runtime.

## Shutdown

On Desktop quit:

- the runtime receives termination;
- the supervisor waits for exit, with a bounded escalation to `SIGKILL` if required;
- only then does the application complete its quit path.

This prevents an orphaned local server from becoming a second hidden Soullab process.

## Packaging seam

`maia-desktop/cabin-runtime/` is now a packaged `extraResources` target at:

```text
Resources/cabin-runtime/
```

The directory currently contains only the placeholder. No fake server is shipped.

The next packaging act must place the real Next standalone runtime there, including its `server.js` entrypoint and traced dependencies.

## Witnesses

The supervisor has:

- pure unit tests for every state transition;
- bounded timeout/failure tests;
- duplicate-start protection;
- clean shutdown tests;
- a real loopback child-process witness that reaches `/api/cabin/health` and then terminates.

The full MAIA Desktop suite remains green after the host integration.

## Not yet claimed

This closes the **process boundary**, not the complete offline Cabin.

The next required act is `AIN-CABIN-PACKAGE-01`: produce and package the actual Next standalone runtime.

After that, `AIN-CABIN-DATA-01` must replace the PostgreSQL-dependent member/Work/memory paths required by the local surfaces.
