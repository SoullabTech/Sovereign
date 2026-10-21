# Kelly's World / JARVIS — separately authorized installation plan

Date: 2026-10-12
Disposition: **PREPARED PLAN ONLY. NO DESKTOP INSTALLATION, RUNTIME REBINDING, OR WRITER'S STUDIO BETA DEPLOYMENT.**

## Identity, currently in force
- Installed: `/Applications/JARVIS.app`, bundle `life.soullab.jarvis`, version `0.1.0-alpha`.
- Installed build stamp: `c6102a347` (2026-10-01). Existing signed app is currently trusted by Apple Development: Kelly Nezat (N9DTF6434L).
- Installed JARVIS runtime binding: `~/.jarvis/runtime/sovereign-canonical`, observed `c6102a347a`. This historical checkout is missing the Kelly's World current `desktop-viewmodel.mjs` reader.
- Engineering candidate: `feature/jarvis-ws-beta-workstream-20261012`. The candidate is **not the installed app or bound runtime**; the new JARVIS Work Unit remains DRAFT, LOCAL_ONLY, and not an executor.
- Existing old application backup: `~/JARVIS-backups/JARVIS-2463f66d6-backup.app` is from a different build and does not replace a **new, exact pre-install backup**.

## Release sequence, with independent holds

### G0 — Canonical source integration
- Review the feature branch PR and merge only through existing sovereignty/branch checks. Do not rebase/push over concurrent canonical changes.
- Rerun the 32-test Founder Workspace matrix, the 5-room Chrome witness, TypeScript no-regression, and build/packaging checks at the exact integrated SHA.
- Keep the seven-gate evidence-index/source-hash reader and Work Unit identity unchanged; do not introduce automatic execution or invite authority.
- Stop if a merge, test, or current-substrate incompatibility appears.

### G1 — Package *outside* the installed app
- From a checked-out, verified integrated SHA, install pinned `jarvis-desktop` packaging dependencies to the **staging checkout only** with a healthy local npm cache; do not use T7 until its I/O passes.
- Use the package's `pack` target **not** `install:app`. Its `stamp` records build SHA; `electron-builder --mac --dir` assembles a candidate under `jarvis-desktop/dist`.
- Verify the output `build-info.json` exactly matches the integrated SHA; compare packaged `app.asar` and signed app hashes, bundle identifier/version, signing identity, and `codesign --verify --deep --strict`.
- Confirm the packaged app contains the five-room renderer, and the intended governed canonical substrate actually contains `scripts/builder/founder-workspace/desktop-viewmodel.mjs` plus the release-evidence reader. A new binary using the old substrate is not an accepted release.
- No packaging output is an authorization to install.

### G2 — Founder installation decision
Present the exact integrated SHA, bundle hash, signing evidence, declared runtime path and head, regressions, current running sessions, rollback backup location, and proposed observation checklist. **Require a new explicit approval** for that exact bundle and binding. Neither this plan nor JARVIS's DRAFT Work Unit grants it.

### G3 — Guarded installation (only after G2 approval)
- Independently confirm old `/Applications/JARVIS.app` build stamp and signature still match this plan. Stop on drift.
- Back up the exact installed application and persisted runtime-selection configuration to a protected local custody location. Verify byte identity and permissions; do not include credentials in source control.
- End only the JARVIS instance/active operator sessions through an accepted human or governed process. Preserve any pending work.
- Copy the verified new app into a **separate, prepared staging pathname**, inspect it, and perform an approved replacement with a rollback-ready previous app. Do not invoke the package's destructive `install:app` script, which runs `rm -rf /Applications/JARVIS.app`.
- Explicitly select a verified canonical substrate; no unobserved symlink, inferred default path, or automatic repository rebinding.
- Launch and witness Today, Work, Graph, Monitor and System under the installed artifact and selected substrate. Verify all seven gates, no invented live health, no false Needs Kelly, and `release_approval=NOT_AUTHORIZED`. Confirm existing operator controls still work within their grants.
- If any acceptance fails, restore the exact prior app and prior binding configuration and re-witness the previous build. Do not silently substitute a different checkout.
- Record the new and old build hashes, host, start/end times, and the outcome; retain the rollback until independently retired.

## Non-goals and STOP rules
- No live Writer's Studio deployment, schema migration, source-upload reopening, Caddy change, tester invitation or member access grant.
- No background scheduler, no autonomous task authority, no general network/model spend authorization.
- No alteration of member content or secrets, and no outside distribution of locally signed developer binaries.
- No claim that isolated Chrome evidence is equivalent to a signed, installed-app witness.

## Installed-JARVIS relation to Writer's Studio beta
This workstream shows the beta's verified/historical evidence and unresolved release decisions; it is **not** a deployment orchestrator until a distinct governed operator capability and explicit execution grant have been admitted. The same seven gates must remain visible if any future JARVIS installer is approved.
