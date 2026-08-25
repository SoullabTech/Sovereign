# electron/ — STATUS: LabTools utility window only

**Founder ruling R2, 2026-08-25 (MAIA Desktop Companion programme).**

```
SCOPE:               LabTools utility window — nothing else
IS MAIA DESKTOP:     ⛔ NO
RELEASE AUTHORITY:   ⛔ NONE for the MAIA/JARVIS Desktop programme
DELETION:            ⛔ NOT YET
```

`electron/main.js` opens a single window titled **"MAIA LabTools + IPP"** on `/maia/labtools`
(dev: `http://localhost:3000/maia/labtools`; prod: `out/maia/labtools/index.html`). That is its
entire purpose and it may keep it.

## ⚠️ PACKAGING HAZARD — recorded, not yet corrected

The **root** `package.json` still points at this tree:

```json
"main": "electron/main.js",
"desktop:package": "electron-builder",
"desktop:build":   "npm run build && npm run desktop:package",
"desktop:start":   "electron electron/main.js",
"desktop:dev":     "... electron electron/main.js"
```

So **`npm run desktop:package` at repo root packages the LabTools window** — not MAIA Desktop,
not JARVIS Desktop. Any release run through that script would produce an artifact that is not the
product it claims to be.

**Standing instruction:** do not perform release packaging for the MAIA/JARVIS Desktop programme
until a later, explicit packaging unit corrects and *proves* the canonical target. Per founder
ruling, that correction must **not** be folded into MAIA-D00A or MAIA-D01.

Census: `docs/ops/MAIA-D00_DESKTOP_CANONICAL_RECONCILIATION_2026-08-25.md` §2.1.
