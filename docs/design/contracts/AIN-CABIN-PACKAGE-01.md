# AIN-CABIN-PACKAGE-01 — Standalone Runtime Witness

**Status:** witnessed; packaging seam implemented
**Base:** `b2e1929f5`
**Purpose:** prove that the canonical Soullab Next application can be assembled as a local loopback runtime for MAIA Desktop.

## What was built

The canonical repository already uses Next standalone output. A real `next build` was run with:

```text
MAIA_CABIN_MODE=offline
MAIA_CABIN_ORIGIN=http://127.0.0.1:43121
```

The build completed successfully and produced:

```text
.next/standalone/server.js
.next/standalone/...
.next/static/...
public/...
```

The Desktop packaging script now assembles those outputs into the future packaged resource:

```text
Resources/cabin-runtime/
```

The generated ~800 MB runtime is intentionally **not committed to Git**. Packaging reconstructs it from the root standalone build.

## Real runtime witness

The generated standalone server was launched directly with:

```text
MAIA_CABIN_MODE=offline
HOSTNAME=127.0.0.1
PORT=43127
```

Observed:

- `GET /api/cabin/health` → HTTP 200
- response: `{"status":"ready","mode":"offline",...}`
- `GET /maia` → HTTP 200
- a local `/_next/static/...css` asset → HTTP 200
- no `https://soullab.life` references in the rendered `/maia` HTML after Cabin metadata hardening
- process terminated cleanly after the witness

## Important finding

The standalone server still initializes existing platform infrastructure that assumes PostgreSQL. The runtime witness printed the existing schema-check and PostgreSQL memory initialization messages.

This is **not** being treated as evidence that the Cabin is already offline.

It proves something narrower and useful:

> The complete Soullab web runtime can now be physically hosted inside the Desktop as a loopback process. The remaining sovereignty gap is the data/identity layer that runtime calls.

## Current boundary

```text
Electron host
      ↓
Utility Process
      ↓
Next standalone
      ↓
127.0.0.1
      ↓
House / MAIA / Writer's Studio surfaces
      ↓
[CURRENT GAP]
PostgreSQL-backed member state
```

## Next act

`AIN-CABIN-DATA-01` must replace the PostgreSQL-dependent paths needed by the Cabin's first inhabited surfaces:

1. local member identity;
2. local Work declarations;
3. local manuscripts;
4. local House preferences;
5. local MAIA conversation state;
6. local memory / Grokker state.

The existing online platform remains the connected mode and is not redefined by this act.
