# WS2-03B · STRANDED STUDIO SHELL — CUSTODY FINDING · 2026-09-05

**This record does not authorize recovering, cherry-picking, merging, rebasing,
or modifying WS2-03B.** It preserves the custody finding so the stranded shell
is not rebuilt from memory or mistaken for absent work.

Read-only census. Nothing was lifted, merged or rebased to produce it.

---

## 1 · The finding, in one sentence

A finished Writer's Studio shell exists on an unmerged branch; canonical
**deliberately** stopped before it during an earlier convergence, and five
subsequent units — including BUILD-07D — have been built against the canonical
shell instead. The shell is not lost, not absent, and not superseded.

## 2 · Provenance

```text
SOURCE BRANCH               claude/writers-studio-ws2-03b-qf49hj
SOURCE TIP                  eeb452dcb  (2026-08-31)
FOUNDATIONAL SHELL COMMIT   3c49aab30  (2026-08-29)
                            "WS2-03B — the Studio, not another skin on the Canvas"
ALSO CONTAINS IT            claude/ws2-developmental-editing-capture
PULL REQUEST                none found for WS2-03B itself
```

`3c49aab30` replaces the drawer composition with the five-mode shell: standing
manuscript outline, MAIA column, lower band, rewritten rail, new Canvas
composition. It commits its own captures under
`docs/design/writer-studio/captures/` — including
`ws2-03b-writers-studio-1680.png`, which is the running surface, not a mockup.

## 3 · Current divergence

```text
base      717d01d1b   2026-08-28
ahead     128 commits
behind    321 commits
canonical cc257f7ee   at the time of this census
```

## 4 · Already recovered to canonical, by another route

The 05A/05B substrate and its migrations reached canonical through explicit
custody/convergence commits (`WS2-05B-CUSTODY-01 — canonical custody of the
05A/05B substrate`, and `Custody A — land the 05A/05B substrate on canonical
lineage`). Verified present on canonical:

```text
database/migrations/20260830000001_manuscript_draft_sections.sql
database/migrations/20260830000002_manuscript_structure.sql
database/migrations/20260831000001_structure_proposal_reader_provenance.sql
```

The branch still carries its own copies. **Any future custody pass must take
canonical's versions, never the branch's.**

## 5 · Still stranded — absent from canonical entirely

```text
Studio primitives     studio/StudioRail · StudioModeBar · StudioPanel ·
                      StudioSurface · StudioIcon · StudioInsightChip ·
                      StudioScrollbars · index.ts
Columns               canvas/MaiaColumn · ManuscriptOutline ·
                      StructuredOutline · StudioLowerBand ·
                      ReadingsEntry · studio/MaiaReading
Section-native write  canvas/SectionWritingSurface · SectionWritingSession ·
                      app/api/sovereign/manuscripts/[id]/sections/[sectionId] ·
                      app/api/sovereign/manuscripts/[id]/write-state
Studio handoff        app/maia/StudioHandoffBanner · useStudioHandoff ·
                      app/writers-studio/maiaOffering.ts
Fixtures              studio/__fixtures__/CanonicalRail · InertControls ·
                      WritingFieldComposition
Test suites           shellProjection · studioFidelity · studioPrimitives ·
                      studioConversation · studioTheme · maiaOffering ·
                      canvasWriteModeGate · studioHandoff
```

Thirty-three files canonical does not have. They are clean adds: a custody pass
would lift them with no conflict at all.

## 6 · Why it is stranded

Not oversight, and not silent. The canonical-convergence commit states that the
03b branch was **not merged**, and that `StructuredOutline` was deferred because
bringing its dependency chain forward opens `studioMap.ts` and therefore the
WS2-03B shell restructure — ruled to require *its own unit, not a side effect*.

The shell was consciously left outside the canonical product lineage. It was
never declared the current runtime.

## 7 · Current consequence

**BUILD-07D was correctly implemented against the canonical Writer's Studio —
the one that exists today.** Its Develop room, its `revision_not_current`
repair, and the Writer Canvas recovery link were all built and witnessed
against canonical's shell. That is the right target; nothing in 07D is
invalidated by this finding.

Gate A, Gate B(a) and the constructed v2 render witness stand as recorded.

## 8 · Merge census (read-only simulation)

`git merge-tree --write-tree` against canonical `cc257f7ee` — **7 conflicted
paths out of 128 commits**:

```text
canonical SUPERSEDES (add/add; canonical's copy is the evolved one)
  app/writers-studio/canvas/StructureReview.tsx    03B 1198+   canon 1479+
  lib/manuscript/structure/maiaReader.ts           03B  764+   canon  806+
  lib/writersStudio/reviewClient.ts                03B  193+   canon  289+
  lib/manuscript/structure/canonicalFingerprint.ts 03B   45+   canon   54+

REAL RECONCILIATION
  app/writers-studio/canvas/page.tsx               03B 884+/358-  canon 85+/2-
  app/writers-studio/canvas/Worktable.tsx          03B  50+/7-    canon 280+/40-
  lib/sovereign/maiaService.ts                     03B  77+/2-    canon 120+/8-

NOTABLE
  app/writers-studio/studioMap.ts   AUTO-MERGES — the file whose dependency
                                    chain caused the deferral no longer conflicts
```

## 9 · 07D ↔ WS2-03B reconciliation surface

```text
app/writers-studio/canvas/page.tsx
app/writers-studio/studioMap.ts
CANVAS_HREF / DEVELOP_HREF
canvasForManuscript(...)
Writer Canvas "Keep a version" recovery path      ← added by the 07D repair
Develop entry in the new shell
```

**The shell does not know Develop exists.** WS2-03B contains zero references to
`DEVELOP_HREF` or `/writers-studio/develop`; its `ReadingsEntry` reads
`ProposalSummary` — 05B structure proposals, not developmental readings. The
shell predates BUILD-07D and has no seat for it. Recovery is therefore a lift
**plus** a new integration, not a lift alone.

## 10 · Sequence (founder ruling, 2026-09-05)

```text
NOW
07D candidate 2315c7994
    ↓  finish D1–D8 against the current canonical shell
    ↓  founder ACCEPT / REJECT
    ↓  mentor line / merge sequence
    ↓  07D CLOSED

THEN
WS2-03B SHELL CUSTODY / CONVERGENCE
    ↓  recover the stranded shell onto then-current canonical
    ↓  reconcile 07D navigation + Develop integration
    ↓  fresh shell/integration acceptance
```

The later custody acceptance **must not inherit D1–D8** for the integration
points the shell rewrite changes. It must freshly prove at least:

```text
Canvas → Develop
Develop → Canvas
Keep a version → return → reread
manuscript identity survives navigation
mobile / responsive shell
Develop remains reachable in the new StudioModeBar / rail
```

## 11 · Why this is its own unit

The standing rule is that a new lane opens only for a genuinely different
problem requiring separate custody. This qualifies: the developmental-reading
unit and the stranded Studio-shell custody problem are different objects, with
different provenance and different acceptance obligations.

```text
FUTURE ACTION   a second custody / convergence pass
NOT             merge or rebase of the 321-behind branch
NOT             authorized by this findings record
```

Stop touching WS2-03B. Finish D1–D8. After 07D closes, open the shell custody
unit from this pinned census rather than rediscovering the branch again.
