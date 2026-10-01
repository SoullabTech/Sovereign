# WS-ADVANCED-RUNTIME-01 · Phase 1 — Lineage census · 2026-10-01

```text
Class: programme · read-only census (repository truth only)
Canonical at census: 038949a8d (clean-main-no-secrets)
Production runtime at census: bde0f6590
Founder direction (2026-10-01): stop expanding scope; converge Writer's Studio
  on ONE production candidate → close blockers → prove → cohort → admit → archive.
This record: ⛔ no code changed · ⛔ no branch merged · ⛔ no migration authored · ⛔ no deploy
```

## 1 · Answer: where the most advanced Studio already is

**Canonical is the base, not one branch among several.** Since 2026-09-20, the PC3, P4R1, flagship, small-beta, H1 and multi-manuscript lanes have landed on `clean-main-no-secrets`. Production `/writers-studio` mounts one unified host:

```text
app/writers-studio/page.tsx
  → app/dev/writers-studio-p4r1/P4R1StudioHost     (mode = home | write | develop | review)
      → app/dev/writers-studio-pc3-live/P4R1{Home,WriteEdit,Develop,Review}Controller
```

Present on canonical today, checked against source and tests:

| Founder Phase 1 requirement | On canonical | Where |
|---|---|---|
| Manuscript-first workspace | ✅ | P4R1 host, `p4r1UnifiedHost` / `productionWorkspaceMount` tests |
| House → Work → manuscript continuity | ✅ | #1551 + #1578 (`h1Arrival.ts`, `situatedWork.ts`), cohort-gated |
| Multi-manuscript chooser, no silent first pick | ✅ | H1-R2 (`8d4f6e557`, `e91dcb1bf`), `modeEntryTarget` → `choose` |
| Write / Develop / Review | ✅ | four controllers |
| Alternatives → apply → undo | ✅ | `EditorialDancePanel`, `p4r1EditorialDance*` tests |
| Selection-aware editorial interaction | ⚠️ partial | an improvement is unmerged (§2, B3) |
| MAIA conversational carry | ⚠️ partial | relationship + explicit carry are unmerged (§2, B1) |
| Durable return / continuity | ❌ not on canonical | unmerged (§2, B1) |
| Governed H1 arrival seam | ✅ | single interpreter `h1Arrival.ts`; guard #1584 |
| Identity / session convergence | ⚠️ Studio yes, Living Field no | §4 |
| Accepted V10 / PC3 visual authority | ✅ | PC3 restore + P4R1 appearance |

## 2 · Unmerged Studio work: what would still add to canonical

Method: every remote branch committed after 2026-09-25 was trial-merged into canonical (`git merge-tree`) and restricted to Studio paths. Superseded branches are listed so they are not re-merged later.

| # | Branch | Adds | Merge | Verdict |
|---|---|---|---|---|
| **B1** | `feature/ws-full-experience-r2-20260930` | **durable return state, A2 MAIA relationship custody, scope-identity succession, explicit prior-MAIA carry selection** (10 commits, 64 files, +7.6k) | ⚠️ 1 content conflict: `P4R1WriteEditController.tsx` | **ABSORB.** This is the main missing lineage. |
| B2 | `feature/ws-r2-review-work-conversation-20260930` | Work conversation carried into Review (3 files) | clean | ABSORB |
| B3 | `fix/ws-write-spacing-section-navigation-20260930` | manuscript selection made immediately useful (8 files) | clean | ABSORB |
| — | `fix/ws-canonical-route-convergence`, `fix/ws-develop-pc3-live-route`, `fix/ws-import-draft-seed` | route / import convergence | conflicts | **SUPERSEDED.** Equivalents landed (`596f4a6f6`, `a547e07be`) |
| — | `feature/ws-pc3-live-reconciliation-03/03b`, `feature/ws-roadmap-d3r1` | PC3 reconciliation | 45–56 conflicts | **SUPERSEDED.** Landed as `5d729c295` / `53e70459f` / `31f6a63f5` |
| — | `fix/ws-multi-manuscript-explicit-choice`, `claude/beautiful-mayer-*`, `claude/vigilant-edison-*` | H1-R2 predecessors | conflicts | **SUPERSEDED** by #1578 |
| — | `house-cabin-*`, `cabin-h4-*`, `ain-cabin-*` | House / Cabin lane; touches Studio files at the edge | — | **OUT OF SCOPE.** A separate lane, ⛔ not absorbed |

### ⚠️ B1 carries schema, so absorbing it is a schema-deploy decision

| B1 migration | Collision on canonical |
|---|---|
| `20260925000005_writer_editorial_relationship_custody.sql` | none |
| `20260925000006_writer_editorial_scope_identity_successor.sql` | none |
| `20260926000001_writer_studio_return_state.sql` | ⛔ **prefix collision** with canonical's `20260926000001_member_facet_crossings.sql` |

The withholding was deliberate: canonical's small-beta restore was kept "schema-free" (`6897e3a07`), and the Home restore withheld pending schema. Under the 2026-09-07 finding, merging B1 into canonical means the next full deploy applies these three migrations. So absorbing B1 needs:

1. a founder act authorizing its schema;
2. the prefix repaired to a free number first, with the precedent being PRODUCTION-MIGRATION-PREFIX-REPAIR-01;
3. B1's own falsifier suites re-run on the merged tree.

## 3 · The Home gap, located

`P4R1HomeController` (canonical) shows one of two things:

- **When `work=` is carried and H1-admitted:** the `P4R1WorkArrival` panel, which is the arrival surface again, not a Home for that Work.
- **Otherwise:** `P4R1HomeView`, where *resume* is picked by `arrivalFor()` as the Work with the **greatest writing extent across all Works**. The `m` (manuscript) parameter the writing room carries is **ignored**.

Mode switches preserve the query string (`onMode` in all three room controllers). So pressing **Home** from inside Work B can show the arrival panel, or a Home that resumes Work A.

**Repair shape (proposal, ⛔ not built):** Home resolves the Work that **owns the carried `m`**, through the existing `situatedWork` resolver, which is the single Work interpreter. It renders the Studio Home *for that Work*. Fallback to the global Home only when `m` is absent or resolves to no declared Work.
- ⛔ No second resolver.
- ⛔ Nothing derived from browser storage.
- A Work holding several manuscripts still never silently picks one.

## 4 · Identity: one member, two derivations

| Surface | How it learns who the member is |
|---|---|
| Writer's Studio | server-resolved: `/api/members/me` via the session token (`useMemberIdentity.ts`, which explicitly refuses localStorage) |
| Early Field / H1 admission | server-resolved: `getMemberIdFromRequest`, which refuses a disagreeing `x-member-id` |
| **Living Field components** | **`localStorage` (`beta_user` / `memberId`) → raw `x-member-id` header** in `LivingEncounterView`, `LivingFieldCard`, `LivingFieldDetailPanel`, `LivingFieldGatheringPanel`, `PhaseStatePanel`, and the `app/maia/living-field/page.tsx` comment |

So "Studio and Living Field recognize different versions of the same person" has a structural cause. ⚠️ The repair sits **outside Writer's Studio code** and touches Living Field and the auth contract (Class B). Whether it is a Studio blocker or its own bounded lane is a founder call (§6, Q2).

## 5 · Plurality: the Phase 5 archive list (⛔ not acted on)

Canonical holds **seven** Studio implementations. Only the P4R1 host plus `pc3-live` serve `/writers-studio`:

```text
SERVING   app/dev/writers-studio-p4r1/           ← production host lives under app/dev/
SERVING   app/dev/writers-studio-pc3-live/       ← the four live controllers
PARTIAL   app/writers-studio/full-redesign/      ← rooms/adapters imported by the live host
LEGACY    app/writers-studio/rebuild/            (own route /writers-studio/rebuild)
LEGACY    app/writers-studio/canvas/             (own route /writers-studio/canvas)
LEGACY    app/writers-studio/flagship/ · insight/ · studio/
LEGACY    app/writers-studio/develop/ · review/  (own routes)
DEV       app/dev/writers-studio-full-redesign-review/
```

Phase 5 should promote the serving host out of `app/dev/` and retire the legacy routes. This is listed now so the candidate does not grow new dependencies on them.

## 6 · Founder decisions owed before Phase 1 can close

- **Q1 — Absorb B1 with its schema?** Recommended: **yes**, with the prefix repaired and an explicit schema-authorization act. Without B1 there is no durable return and no MAIA relationship carry.
- **Q2 — Identity: blocker in this lane, or a sibling lane?** Recommended: a **bounded sibling lane** (Living Field → server-resolved identity) run in parallel, so Studio does not absorb a Class-B auth change.
- **Q3 — Candidate construction.** Recommended: branch `feature/ws-advanced-runtime-candidate-<date>` from canonical. Merge B1 (resolve the one conflict), B2 and B3, plus the Home repair (§3), and nothing else. One candidate owns the Studio.

## 7 · Standing

`CENSUS COMPLETE · CANONICAL = BASE · B1 ABSORB (⚠️ schema + prefix collision) · B2/B3 ABSORB · 7 SUPERSEDED · HOME GAP LOCATED · LIVING FIELD IDENTITY DIVERGENCE LOCATED · ⛔ NO CANDIDATE BUILT · ⛔ NO MERGE · ⛔ NO SCHEMA · ⛔ NO DEPLOY`
