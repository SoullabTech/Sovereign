# LIVING-FIELD-R2-MOUNT-01 · Pre-mount census

**Date:** 2026-09-30
**Class:** presentation admission / bounded cohort rollout
**Subject:** PR #1539 exact head `2640ec28e6`
**Base at census:** canonical `e7dbb8722e`
**Current gate:** custody merge → dependency declaration → cohort mount falsifiers → rendered witness
**Stop:** no R2 member mount before PR #1539 is canonical; no R2F; no new inference; no memory expansion; no general rollout

## 1 · Existing member surface

`/maia/living-field` currently mounts `PersonalLivingFieldDashboard`, which mounts
`LivingFieldInstrument` (R1R3) additively above the existing Living Field dashboard.

This is the fallback surface and remains authoritative for every member outside the
named R2 cohort.

## 2 · R2 presentation candidate

The complete approved room composition is `LivingFieldGrokkerShell`:

- left Soullab orientation rail;
- top context / inquiry / field search;
- center `BiologicalSpatialFieldPrototype`;
- right `LivingFieldIlluminationPanel`;
- bottom scale / viewpoint instrument inside the spatial field.

The room canon says Grokker is a spatial Soullab room, not a separate product or graph
dashboard. The center Living Field remains dominant.

## 3 · Dependency gate

Founder ruling in the #1539 custody record requires these packages to be explicitly
declared before any R2 surface becomes production-reachable.

| package | currently resolves as | direct declaration |
|---|---:|---|
| `d3-hierarchy` | 3.1.2 via `d3@7.9.0` | absent |
| `d3-interpolate` | 3.0.1 via `d3@7.9.0` / recharts | absent |
| `cytoscape` | 3.34.3 via mermaid dev tooling | absent |
| `cytoscape-fcose` | 2.2.0 via mermaid dev tooling | absent |

Therefore R2 mount is mechanically CLOSED until the four declarations are direct and
lockfile/type/build gates are green. This is dependency custody, not authorization to
mount the fCoSE research prototype.

## 4 · Cohort authority

Browser-local `spiralogic-feature-flags` is not a lawful cohort authority: it is
member-editable localStorage.

The existing Living Field GET already resolves the authenticated member through
`getMemberIdFromRequest()`. The mount lane should reuse that verified identity and a
server-held, fail-closed named cohort authority, following the existing
`LAB_ACCESS_MEMBER_IDS` pattern rather than misclassifying testers as founders.

Proposed authority vocabulary:

```text
LIVING_FIELD_R2_ENABLED
LIVING_FIELD_R2_MEMBER_IDS
```

Rules:

1. global kill switch false/unset → R1R3 for everyone;
2. enabled + verified member in named cohort → R2 candidate;
3. enabled + member not in cohort → R1R3 unchanged;
4. missing/invalid identity → existing auth behavior, never R2;
5. cohort membership grants no authority outside Living Field presentation.

The server may return a presentation entitlement in the existing Living Field response;
the client must not decide cohort membership from a public/member-id list.

## 5 · Rollout law

The first cohort adds **people, not capabilities**.

R2 cohort presentation is frozen at the admitted R2E2 corpus. It does not add:

- R2F navigation continuity;
- durable navigation history;
- MAIA interpretation of navigation;
- pattern naming or gestalt classification;
- new semantic edges;
- memory writes or relation learning;
- live Source Fabric;
- autonomous child-ecology generation.

The existing canonical Living Field presentation remains the fallback for non-R2 members and for any
mount HOLD. At current canon, R1R3 itself is separately governed by `EARLY_FIELD_*`; the R2
gate must preserve that decision rather than broaden or replace it.

## 6 · Responsive finding

The final R2D3 Soullab shell was witnessed at 1600×1000. Earlier R2 camera/field stages
have 390×844 mobile witnesses, but the final rail + search + Illuminator composition does
not have a corresponding mobile witness.

The shell currently switches from a three-column grid to `display:block` below 900px.
That is not sufficient evidence that the complete room remains inhabitable on mobile.

First mount therefore admits the complete R2 shell only where its layout is witnessed.
Unwitnessed narrow viewports retain R1R3 until a separate responsive witness passes.

## 7 · R2F standing

`/private/tmp/jarvis-visual-field-r2f` contains an uncommitted session-navigation
experiment: Return, Path, sessionStorage continuity, and navigation snapshots.

R2E2's programme record says R2E2 PASS may open R2F. R2F is not in PR #1539 and is not
part of the R2 mount. It must remain a separate governed lane.

## 8 · Mount falsifiers to build after custody merge

- **M1 — fallback:** non-R2 member receives the same canonical Living Field presentation they would receive with the R2 gate absent, including the separate EARLY-FIELD-01 decision.
- **M2 — fail closed:** missing switch / empty cohort / invalid identity cannot expose R2.
- **M3 — named cohort:** only a verified listed member receives R2 presentation.
- **M4 — dependency custody:** all four ruled packages are direct declarations.
- **M5 — no R2F:** mounted R2 contains no navigation-continuity/sessionStorage seam.
- **M6 — no cognition widening:** mount adds no MAIA prompt, inference, memory, or relation write.
- **M7 — House return:** `?from=house` preserves the governed House threshold/return behavior.
- **M8 — failure fallback:** R2 render failure cannot strand the member; R1R3 remains available.
- **M9 — viewport law:** complete shell appears only in a witnessed viewport class.
- **M10 — existing data law:** Living Field data/provenance/failure truthfulness remains unchanged.

Each defeat candidate must die for its named reason before implementation is admitted.

## 9 · Execution order

1. Merge PR #1539 as the reserved founder act.
2. Re-open this census against the exact merge-result SHA; stop on drift.
3. Declare the four ruled dependencies directly; run lockfile/build/type gates.
4. Build M1–M10 falsifiers before the mount mechanism.
5. Add server-held cohort authority at the existing verified identity boundary.
6. Mount `LivingFieldGrokkerShell` only for the admitted cohort + witnessed viewport.
7. Preserve the canonical Living Field fallback exactly, including EARLY-FIELD-01.
8. Walk House → Living Field → spatial depth → Wider/Whole → House with synthetic data.
9. Founder witness.
10. Small cohort witness. HOLD on return failure, provenance/consent drift, or disruption of the existing Living Field.
11. Stop before general rollout.

## 10 · Current standing

**CENSUS COMPLETE · BUILD CLOSED pending #1539 canonical custody.**

PR #1539 CI at the time of this census: all required checks green, including Docker
build, diagrams, TypeScript no-regression, sovereignty, empty-database reconstruction,
JARVIS patch-admission falsifiers, Axis 1 adjudication, covenant gates, and GitGuardian.
