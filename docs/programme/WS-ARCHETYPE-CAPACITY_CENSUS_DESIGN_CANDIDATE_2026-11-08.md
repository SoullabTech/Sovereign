# Writer's Studio — capacity census (design candidate) — 2026-11-08

STATUS: read-only census; a DESIGN CANDIDATE. It authorizes no build, opens no capability lane, and is not canon.
CHECKOUT: `feature/ws-work-continuity-part-a-suite` @ `2eba114a8` (not canonical). Method: an Explore subagent traced imports and routes
(no browser walk); two of its claims were re-checked by me (marked ✔). "LIVE" = reachable from a member surface by import/route tracing, NOT witnessed.
Governing frame: one MAIA, capacities are stances the member declares (L6c, L7), a facet changes how much MAIA explains, never how much she writes (L6b).

## Structural fact that changes how to read the code
The member-facing `/writers-studio` renders `P4R1StudioHost` from `app/dev/writers-studio-p4r1/`, which pulls in `app/dev/writers-studio-pc3-live/*`.
"app/dev" files are LIVE via `/writers-studio`. Modes: home · write · develop · review · publish · listen. Other live routes: `/writers-studio/rebuild`,
`/canvas`, `/develop`, `/sources`, `/press/manuscript`. Which a member reaches by default, and any plan/beta gating, was NOT verified.

## Capacity × substrate
| # | Capacity | State | Evidence (paths) | Member gesture |
|---|---|---|---|---|
| 1 | Creative listener / oral capture | BUILT-UNWIRED for ideas/dreams | `dev/pc3-live/P4R1VoiceCapture.tsx`; `lib/writersStudio/listen/*` | mic in the passage dance feeds a question to MAIA only; Listen mode is read-aloud takes. **No route writes transcribed ideas into a Work** |
| 2 | Story architect | LIVE | `lib/manuscript/structure/*`; `manuscripts/[id]/structure/{read,proposals,…/adopt}`; `canvas/StructureReview.tsx` | structure review; adopt a proposal |
| 3 | Writing companion | PARTIAL | `insight/RevisionDesk.tsx`; `editorialDepth.ts` ("do not write more of my prose") | MAIA offers alternative wording for an EXISTING passage. No drafting from nothing found. A persistent MAIA-authored mark after apply: not found |
| 4 | Developmental editor | LIVE | `lib/manuscript/developmentalReading/*`, `developmentalReader/*`; `flagship/DevelopReview.tsx` | Develop/Review; "Talk about this" |
| 5 | Line editor | LIVE | `api/writers-studio/editorial/*`; `lib/manuscript/editorialRuntime/*` | propose, preview, apply, "Undo that application". `draft/revisions` route has no UI caller |
| 6 | Teacher of craft | LIVE (partial) | `lib/writersStudio/teachingTurn.ts`, `editorialDepth.ts` | "Teach me why" / "Teach me about…". No technique library; Academy is DESIGNED-ONLY |
| 7 | Mentor / Work steward | MIXED | `writerUnderstanding*.ts` (LIVE, fed to Ask, attention map, orientation); `observationStanding.ts`, `refusalRecord` (LIVE); `writerCorrections*` (LIVE) | Develop form; DevelopRoom. **"Work Compass" as an object: NO-SUBSTRATE ✔ (no code hits).** Long-arc continuity is structural only; prose is `'unmeasured'` |
| 8 | Research librarian / fact checker | PARTIAL | `lib/manuscript/ask/quoteFidelity.ts` (Ask only ✔); lineage scan routes; `sourceVerification.ts` | quote existence in the Work conversation. Citation formatting: NO-SUBSTRATE |
| 9 | Reader / audience advocate | THIN | `readerRelationship` field inside WriterUnderstanding | no reader-perspective lens found on live surfaces (lens list not enumerated) |
| 10 | Rights & ethics steward | NO-SUBSTRATE | — | only body-reading authorization and source privacy/Sanctuary exist; nothing for attribution, permissions, or named people in memoir |
| 11 | Publishing producer | PARTIAL LIVE | `P4R1PublishRoom → ProducePanel` (KDP paperback/hardcover PDF, EPUB3); `memberBookExportRelease`; `/press/manuscript?tab=export` | produce/export. Cover study is session-only; `printPageQuality.ts` unwired; front/back matter and metadata: NO-SUBSTRATE |
| 12 | Archivist / continuity keeper | PARTIAL | `P4R1HistoryContainer`; editorial thread/version/undo; `observationDialogueResume`; `heldPassageContinuity`; return-place routes | history in the writer's words; resume conversations. No "what changed since" diff for the writer found |

## Facets and stance assignment
- Facets: `editorialDepth.ts` — `EditorialDepth`, default `guided` for every member; the writer's "Teach me why" sets learning, "Go deeper" sets direct.
  The flagship `FacetControl` is a display chip; in Develop the facet capability is flagged "absent until facet selection has real authority".
  Depth is session state, not persisted (not verified end to end). `workingStyle.ts` has a different vocabulary (pace/explanation) in localStorage.
- No code found that lets MAIA assign a stance or facet to the writer (grep only; the server `responseDepth` path was not fully traced).

## Honesty of the map
`studioMap.ts` enforces `assertStudioMapHonest` (a `later` destination carries no href). `later` with no href: Materials, Structure, Notes, Versions, Goals,
Conversations, Discover, Insights, Suggestions, Find/Replace, Statistics, Timeline, Word Web; modes Explore/Review/Publish. Materials shows a count of 24 and
Notes 12, which look like fixture counts on unbuilt destinations. The map is stale against the P4R1 host: Review and Publish are live modes there. The map's own
check passes by construction; no test compares UI copy to substrate beyond the href rule.

## Cross-capacity handoff gaps (the crossings)
1. **Oral input never reaches the Work.** Voice feeds a question, not a source or a section. (Verified by the census, not walked.)
2. ~~Writer's declared purpose may not reach the line editor~~ — **refuted on re-check ✔**: `editorialRuntime/turn.ts` references WriterUnderstanding. Whether the "preserve" items are honoured in the proposal is NOT verified.
3. Structure proposals/adoptions and a reading's coverage are not visibly passed to line-edit proposals (not verified either way).
4. Settled/refused observations live in Develop; `craftSettledChoicesR1` has a single importer, so a refusal is not shown to other capacities. This is the "author decisions survive return" gap.
5. Depth is session state; Develop readings and later sessions do not share it.
6. **The quote gate covers only the Work conversation ✔.** The editorial turn (which also quotes the writer's text) is not covered.
7. Quote and lineage findings do not flow into export/publish; there are no citations, front matter or metadata.
8. The cover study is session-only; cover work is lost between sessions.
9. The studio map contradicts the live modes.

## What this suggests (design candidates, none authorized)
- The strongest foundations: Story architect, Developmental editor, Line editor, Teacher (turn-level), Writer's declared purpose, refusal standing.
- The two real crossings to fix before adding any stance: **decision continuity** (4, 5) and **input reaching the Work** (1). Both are handoffs, not new archetypes.
- Extend the quote gate to the editorial turn (a small, reversible, test-first change; needs its own go).
- No-substrate capacities (10 rights/ethics; citation formatting; front/back matter; reader lens; a Work Compass) each need their own founder act before they appear in any menu or intent list.
- The Writer stance remains a ruling, not a build.

## Not verified
Runtime behaviour, feature flags and plan gating, the lens list, what `WorkInspiration` is, whether Review/Publish are shown to all members, the server `responseDepth` path,
and who calls `editorialDiff.ts`.
