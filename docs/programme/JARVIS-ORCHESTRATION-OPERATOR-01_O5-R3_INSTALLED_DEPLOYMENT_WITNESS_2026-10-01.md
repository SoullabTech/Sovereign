# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R3 — Installed Deployment Witness

**Date:** 2026-10-01
**Canonical base:** `2463f66d6b02af3edcfdd6c092fadc2d129b4f72`
**O5-R3 admission:** PR #1570 merged as `bd4b9ba5ed0032dc289cd4dbcc70e2dcf9783461`; the admitted O5-R3 lineage is an ancestor of this deployment SHA.
**Standing:** ⭐ installed post-R3 Desktop deployed and live · explicit canonical substrate binding established · rollback copy preserved.

## 1. Deployment substrate

A dedicated local runtime checkout was created at:

`/Users/soullab/.jarvis/runtime/sovereign-canonical`

It is detached at exactly:

`2463f66d6b02af3edcfdd6c092fadc2d129b4f72`

and was clean at deployment witness time. Before packaging, the O5-R3 freeze, integration proof and matrix were re-run there:

- `verify:jarvis-o5-r3-freeze` — **FREEZE INTACT**;
- `test:jarvis-o5-r3` — **17 passed · 0 failed**;
- `matrix:jarvis-o5-r3` — **LETHAL + DISCRIMINATING · CLASS A AS PREDICTED**.

## 2. Installed artifact

`/Applications/JARVIS.app` was packaged directly from that checkout. Its shipped `Contents/Resources/build-info.json` records:

- `app_build_sha`: **`2463f66d6`**;
- `built_at`: **`2026-10-01T02:09:36.567Z`**.

`codesign --verify --deep --strict` reports the application **valid on disk** and satisfying its Designated Requirement.

The prior installed application was preserved before replacement as:

`/Applications/JARVIS.app.pre-o5r3-20261001`

That copy is the immediate artifact rollback boundary.

## 3. Explicit substrate binding

The previous Preferences binding named the disposable September 24 working-room checkout. It was replaced through JARVIS's own `repo-config` primitive with:

```json
{
  "version": 1,
  "repo_root": "/Users/soullab/.jarvis/runtime/sovereign-canonical",
  "set_at": "2026-10-01T02:10:16.061Z",
  "set_by": "o5-r3-admitted-deployment-20261001"
}
```

`launchctl getenv JARVIS_REPO_ROOT` returned no value, so no launchd environment override superseded this explicit Preferences binding.

## 4. Live installed witness

The installed app was launched after the binding was written. The Mac Studio observed:

- main PID: **50784**;
- process incarnation: **Wed Sep 30 22:10:24 2026**;
- executable: `/Applications/JARVIS.app/Contents/MacOS/JARVIS`;
- packaged renderer path: `/Applications/JARVIS.app/Contents/Resources/app.asar`;
- runtime substrate HEAD: **`2463f66d6b02af3edcfdd6c092fadc2d129b4f72`**;
- runtime substrate state: **CLEAN**.

At witness time no other active process matched any grant-writer entry point (`work-unit-control`, `o5-recovery-census`, `o5-path-b-recovery`, either grant store, or `grant-writer-lease`).

## 5. Scope discipline

This record does **not** manufacture another R3 admission proof. Admission is the #1570 constitutional/runtime-binding record. This act proves that an installed Desktop artifact and its explicit execution substrate now both sit on a canonical SHA that contains that admitted lineage.

No production grant mutation was required for this deployment witness. The R3 holder/refusal mechanism had already been witnessed independently on the Mac Studio before admission; deployment preserves that code unchanged.

**Standing: O5-R3 ADMITTED ✅ · INSTALLED DESKTOP POST-R3 ✅ · EXPLICIT STABLE SUBSTRATE BINDING ✅ · LIVE INSTALLED PROCESS ✅ · rollback artifact preserved.**
