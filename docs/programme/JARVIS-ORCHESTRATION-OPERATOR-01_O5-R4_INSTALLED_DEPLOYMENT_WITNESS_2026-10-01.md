# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R4 — Installed Deployment Witness

**Date:** 2026-10-01  
**Canonical / installed SHA:** `c6102a347af14600ea49edc108dd720f649d7e2c`  
**R4 law:** initial freeze #1591 + E9 amendment #1595  
**R4 implementation:** #1592  
**Standing:** ⭐ post-R4 installed Desktop deployed and live · stable canonical substrate bound · prior artifact preserved.

## 1. Canonical admission

O5-R4 is canonical through merge commit `c6102a347af14600ea49edc108dd720f649d7e2c`.

The admitted lineage includes:

- initial R4 evidence-return freeze;
- freeze amendment 1 restoring R1 F6's positive cross-lane propagation requirement as R4-E9;
- W4.v2 `finding` / `proposal` evidence admission;
- proposal → O1 `CANDIDATE` projection;
- targeted evidence-only consequence-finding projection to exactly `affected_lane`.

## 2. Deployment substrate

The stable local runtime checkout remains:

`/Users/soullab/.jarvis/runtime/sovereign-canonical`

It was moved forward from clean ancestor `5cdef27b5f584d71457aeaca7ac8466540689fda` to detached canonical:

`c6102a347af14600ea49edc108dd720f649d7e2c`

The checkout was **CLEAN** at witness time.

Before packaging, this exact substrate passed:

### O5-R3 preservation

- R3 freeze — **INTACT**;
- R3 Mac-host integration — **17/17**;
- R3 matrix — **LETHAL + DISCRIMINATING · CLASS A AS PREDICTED**.

### O5-R4 admission mechanism

- amended R4 freeze — **INTACT**;
- R4 matrix — **R4-E1…E9 PASS / DC-E1…E9 KILLED / LETHAL + DISCRIMINATING**;
- real-module evidence-return integration — **5/5** including R4-E9.

The E9 witness proves that an authentic admitted W4 consequence finding produces a pure projection containing only:

`target_lane · source · source_ref · evidence`

with `target_lane` exactly equal to `affected_lane`; ordinary findings and forged or post-admission-altered records do not project.

## 3. Installed artifact

The prior installed JARVIS was build `5cdef27b5` and was a clean ancestor of R4 canonical. It was quit before replacement and preserved by same-volume rename as:

`/Applications/JARVIS.app.pre-o5r4-20261001-5cdef27b5`

This avoided duplicating the application during a low-disk condition and preserves the immediate artifact rollback boundary.

`/Applications/JARVIS.app` was then packaged directly from the witnessed canonical substrate. Its shipped build stamp is:

```json
{
  "app_build_sha": "c6102a347",
  "built_at": "2026-10-01T13:03:54.514Z"
}
```

`codesign --verify --deep --strict` reports:

- **valid on disk**;
- **satisfies its Designated Requirement**.

## 4. Explicit runtime binding

JARVIS Preferences now records:

```json
{
  "version": 1,
  "repo_root": "/Users/soullab/.jarvis/runtime/sovereign-canonical",
  "set_at": "2026-10-01T13:04:37.985Z",
  "set_by": "o5-r4-admitted-deployment-20261001"
}
```

`launchctl getenv JARVIS_REPO_ROOT` returned no value, so no launchd environment override supersedes this binding.

## 5. Live installed witness

After launch, the Mac Studio observed:

- main PID: **11043**;
- process incarnation: **Thu Oct 1 09:04:38 2026**;
- executable: `/Applications/JARVIS.app/Contents/MacOS/JARVIS`;
- window title: **`JARVIS — build c6102a347`**;
- artifact stamp: **`c6102a347`**;
- bound runtime full SHA: **`c6102a347af14600ea49edc108dd720f649d7e2c`**;
- bound runtime state: **CLEAN**.

At witness time no other process matched the known grant-writer entry points (`work-unit-control`, `o5-recovery-census`, `o5-path-b-recovery`, either grant store, or `grant-writer-lease`).

## 6. Scope discipline

This deployment witness does not add R4 law or mechanism. It proves that the installed Desktop and its explicitly bound execution substrate now both sit on the admitted R4 canonical SHA.

No production grant mutation, cross-lane mutation, O7 founder-inbox behavior, O8 semantic merge behavior, or scheduler behavior was performed by this deployment act.

**Standing: O5-R4 ADMITTED ✅ · E9 AMENDMENT CANONICAL ✅ · INSTALLED DESKTOP POST-R4 ✅ · STABLE EXPLICIT SUBSTRATE ✅ · LIVE BUILD/PROCESS WITNESS ✅ · R3 PRESERVED ✅ · ROLLBACK `5cdef27b5` PRESERVED ✅.**
