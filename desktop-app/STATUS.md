# desktop-app/ — STATUS: LEGACY / NON-CANONICAL

**Founder ruling R2, 2026-08-25 (MAIA Desktop Companion programme).**

```
STATUS:              LEGACY / NON-CANONICAL
NEW FEATURE WORK:    ⛔ NONE
RELEASE AUTHORITY:   ⛔ NONE
PACKAGING AUTHORITY: ⛔ NONE
DELETION:            ⛔ NOT YET — preserved for extraction / history
```

## What this tree is

An early MAIA desktop prototype: `appId com.soullab.maia`, `productName "MAIA - Sacred Mirror"`,
two source files (`src/main.js`, `src/preload.js`), plus icons and a mac entitlements plist.
No unit record, no tests, and `mac.identity: null` — explicitly unsigned.

## Why it is not the base for MAIA Desktop

Its `build.extraResources` copies `../.next` and `../public` **into the app bundle**:

```json
"extraResources": [
  { "from": "../.next",  "to": "app/.next"  },
  { "from": "../public", "to": "app/public" }
]
```

That ships **a copy of the application** rather than connecting a client to the same server-side
MAIA continuity. It is the architecture the programme's continuity invariant forbids:

> ONE PERSON · ONE MAIA CONTINUITY · MANY SURFACES

Reusing this tree would import that assumption along with the code.

## Where the canonical work lives

| Tree | Role |
|---|---|
| `maia-desktop/` *(to be created by MAIA-D01)* | canonical member-facing MAIA Desktop Companion |
| `jarvis-desktop/` | governed founder/operator/development surface — **patterns only**, not a base |
| `electron/` | LabTools utility window — **not** MAIA Desktop |
| `desktop-app/` | **this tree** — legacy, frozen |

See `docs/ops/MAIA-D00_DESKTOP_CANONICAL_RECONCILIATION_2026-08-25.md` §2.2 for the census that
produced this ruling.
