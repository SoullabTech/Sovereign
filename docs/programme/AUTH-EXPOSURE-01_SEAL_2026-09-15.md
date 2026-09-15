# AUTH-EXPOSURE-01 — Act seal (founder ruling, 2026-09-15)

**Sealed at**: the U-1 witness act's own stopping point. ⛔ Nothing was added to it.
**Subject SHA**: `1a555430`

| | Standing |
|---|---|
| Census (114 routes) | ✅ **COMPLETE** |
| U-1 repository supply chain | ✅ **ESTABLISHED** |
| U-1 production env value | ⛔ **NOT OBSERVED** |
| Runtime mode | ⚠️ **PERMISSIVE — ENTAILED, NOT WITNESSED** |
| 79 unmapped routes | ⚠️ handler-authorized **on that entailment** |
| F-01 / F-05 | ⚠️ **unaffected by U-1** · eligible for later independent witness |
| Repairs | ⛔ **NOT AUTHORIZED** |
| Production | **UNTOUCHED** |

## The two rulings this seal carries

**1. U-1 stays open.** *"We cannot find a repository path to strict"* was not permitted to
become *"production is definitely permissive."* `.env.production` and a manual container
override remain live host-only possibilities, so the entailment is a reading, not a finding.

**2. ⭐ U-1 is NOT a prerequisite for F-01 and F-05.** U-1 governs the interpretation of the
large **unmapped** majority. F-01 (`POST /api/practitioners/create`) and F-05
(`GET /api/stellium/chart/[clientId]`) sit on **mapped** routes and never depended on the
permissive default. They may proceed to independent witness under their own act, before or
after U-1 closes, and their disposition does not move with it.

## ⭐ The three states the `.next/server` check separates

```
variable absent
variable present and read
variable present but the deployed bundle cannot observe it
```

Without the third, someone sets `ACCESS_CONTROL_MODE=strict`, observes no error, and
concludes the system moved to strict mode. **It would not have moved.** This is why the
check is specified alongside `printenv` rather than as a fallback to it.

## Next act, when the production host is reachable

**U-1 COMPLETION WITNESS** — scope: run the four read-only checks in
`AUTH-EXPOSURE-01_U-1_WITNESS_2026-09-15.md` §6 and answer one question:
*is the deployed organism running `strict` or `permissive`?*

⛔ No HTTP attack · ⛔ no member data · ⛔ no configuration change · ⛔ no route probed ·
⛔ no reclassification beyond what the four checks themselves prove.

**The lane's standing rule, unchanged: an unreachable host is a limitation to be named,
never a gap to be filled with inference.**
