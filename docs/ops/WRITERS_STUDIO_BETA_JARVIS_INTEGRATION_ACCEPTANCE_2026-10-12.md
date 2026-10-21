# JARVIS / Kelly's World — Writer’s Studio Small Beta integration acceptance

Date: 2026-10-12
Decision: **ENGINEERING ACCEPTANCE FOR REVIEW. NO INSTALLED-APP OR BETA RELEASE AUTHORIZATION.**
Work Unit: `v2-writer-s-studio-small-beta-launch-mv5adx5f`
Candidate feature branch: `feature/jarvis-ws-beta-workstream-20261012`
Starting feature commit: `458d7faadac838c663280152799316e82808b61f`.

## Single workstream, no duplicate authority

The governed JARVIS Work Unit is DRAFT/E0/LOCAL_ONLY. The one read-only release-evidence index is an auxiliary, hash-verified historical projection; it is not a second Work Unit, approval record, provider grant, deployment command, scheduled job, invitation, or source of live production health.

The *same* Work Unit projects to Kelly's World Today, Work, Graph, Monitor, and System. Seven release gates remain visible and `release_approval` is `NOT_AUTHORIZED` on every surface. Tampering with a referenced receipt downgrades its standing to unverified.

## Acceptance evidence

1. Founder Workspace constitutional matrix, **32/32 passed**. Execution: `node --test tests/constitutional/founder-workspace/*.mjs`. Witness log: `/tmp/jarvis-ws-beta-constitutional-final-20261012.log`.
2. Real Chrome desktop walkthrough of all five rooms **PASS**, with zero external network requests, zero JavaScript page errors, and the seven gates visible. Witness: `scripts/witness/ws-beta-workstream-desktop-browser-20261012.cjs` and `/tmp/jarvis-ws-beta-desktop-final-20261012.log`.
3. TypeScript no-regression gate **PASS** (`npm run typecheck`): 222 current errors vs 239 baseline, no new error identities. Existing TypeScript debt remains and this is not a clean full compilation receipt. Log: `/tmp/jarvis-ws-beta-typecheck-20261012.log`.
4. Existing release-evidence reader falsifiers, **9/9 passed** within the full matrix. Missing/changed/out-of-root source or invalid release authority never becomes a passing gate.
5. Merge-overlap review: starting feature tip is 14 commits behind and 7 ahead of observed `origin/clean-main-no-secrets`, and diff of paths from merge base has **0 overlapping paths**. This is not a merge or integration result.

## Two bounded constitutional repairs

- `tests/constitutional/founder-workspace/b5r3-five-domain-intake.mjs`: corrected inherited stale string-matcher to assert the actual, stronger Team visibility rule: explicit observed state first, then truthful partial/not-connected fallback. Product implementation was not changed.
- `scripts/ops/workstation-storage-census.sh` and B3 constitutional witness: in an **explicit synthetic test mode** (`CENSUS_SKIP_EXTERNAL_MODELS=1`) do not walk external model volumes, which include a known unreliable T7. The returned record says **not observed**, not zero/good. Ordinary production census behavior is unchanged. B3 matrix passed individually and again under the full matrix.

## Desktop-installation readiness and stop

Installed app: `/Applications/JARVIS.app`, signed with Apple Development authority; embedded build stamp `c6102a347` from October 1. The installed JARVIS substrate is `~/.jarvis/runtime/sovereign-canonical`, at `c6102a347a`, and lacks the current `scripts/builder/founder-workspace/desktop-viewmodel.mjs`. The presently installed application is **not displaying this new release workstream**.

A new app binary and its canonical substrate must be selected, built, signed, and verified **after** independent integration of this branch onto current canonical source. A new UI binary alone does not grant the missing substrate reader.

The existing `jarvis-desktop/package.json` has an `install:app` script that removes `/Applications/JARVIS.app` before copying a new app. **Do not execute that script as an unattended installation.** No binary was replaced, no runtime binding changed, and no package/build dependencies were installed during this acceptance check.

See `WRITERS_STUDIO_BETA_JARVIS_DESKTOP_INSTALL_PLAN_2026-10-12.md` for the independently governed promotion, backup, installation, health, and rollback requirements.

## Unchanged Writer's Studio release holds

Migration custody/prefix compatibility, server-side crash-safe source upload custody, internal ingress, final release image/rollback, iPhone Safari, and Jondi's real private Work return and microphone observations remain OPEN/HOLD as independently recorded. This JARVIS acceptance never opens production writes, authorizes a schema migration, deploys Writer's Studio, or invites any member.
