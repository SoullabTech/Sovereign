# WRITERS-STUDIO-V10-RECOVERY-01 — A2-14 → Exact V10 Adapter Matrix

Presentation authority: f9fbb828bd8bed9a1bbeaa0e3b24d6d10db1c89f
Runtime authority: 6f97bc3e2b59e72afdc9b9317c8fe4eb2918e1c4

Rule: adapt live state/actions into the exact V10 contracts. Do not redesign V10 to fit the runtime.

Status vocabulary:

- READY_DIRECT — current A2-14 host already owns the exact state/action.
- READY_PRIOR_ADAPTER — a later convergence act already proved a pure adapter over real substrate.
- PURE_ADAPTER_REQUIRED — source truth exists; a pure projection into V10 props is still required.
- EVENT_PORT_REQUIRED — V10 renders the accepted control but the fixture component has no live callback prop.
- SUBSTRATE_GAP — the accepted surface promises something current runtime does not yet truthfully provide.
- SEPARATE_AUTHORITY — governed outside the exact V10 Write/Develop/Review renderer graph.

## 1. Shell / identity / navigation

| V10 object | Exact V10 contract | A2-14 / repo source | Status | Recovery law |
|---|---|---|---|---|
| Studio shell | StudioShell | existing Work/manuscript context + member identity | PURE_ADAPTER_REQUIRED | Keep exact shell DOM/CSS. Bind identity only; no invented destinations. |
| Work identity | ProjectIdentity.workTitle/workKind | Living Work + manuscript context | READY_DIRECT | Verbatim member-owned title/form/count only. |
| Write / Develop / Review nav | NAV_DESTINATIONS | existing canonical routes and place address | READY_PRIOR_ADAPTER | Prior R1-1C/C1B navigation work is reusable; carry manuscript + relationship identity. |
| Member identity | MemberIdentity | existing authenticated member identity seam | PURE_ADAPTER_REQUIRED | No fixture initials/name. |
| Guided / Learning / Direct | FacetControl / Facet | lib/writersStudio/editorialDepth.ts | READY_DIRECT | Same intelligence, telling only; never changes authority/scope. |
| Atmosphere | AtmosphereBand | presentation only | READY_DIRECT | Exact V10 blob. Zero information. |

## 2. WRITE — manuscript and place

| V10 object/action | V10 marker | A2-14 live authority | Status | Recovery law |
|---|---|---|---|---|
| Manuscript text | ManuscriptView | RebuildWritingBoundary → SectionWriting.bodyOf | READY_DIRECT | Existing writing queue stays sole authorship authority. |
| Chapter/place labels | CrumbBar, ManuscriptView | RebuildSection, chapterSpanFor, focus id | READY_PRIOR_ADAPTER | Reuse C1A toWritePlace/toWriteHeading/toWriteFoot; no invented labels. |
| Live editor | manuscript body | RebuildAuthoredBody | EVENT_PORT_REQUIRED | Exact V10 manuscript composition needs a live-editor slot without changing resting geometry. |
| Hold exact passage | HOLD_PASSAGE | holdPassage | READY_DIRECT | Preserve exact code-point range + current revision. |
| Focus place | manuscript selection / section | focusWritingSection, rememberPlace | READY_DIRECT | Persist place separately from relationship. |
| Full manuscript / Focus | accepted Write utility | existing Full Canvas / whole-manuscript seam | READY_DIRECT | Must not become a second manuscript authority. |
| Save state | accepted footer/status | section save queue + writing.currentRevisionId | READY_DIRECT | Truthful saving/conflict/error states only. |

## 3. WRITE — contextual MAIA / Editorial

| V10 object/action | V10 marker | A2-14 live authority | Status | Recovery law |
|---|---|---|---|---|
| Open MAIA on held passage | HOLD_PASSAGE / Ask MAIA | openWorkspace, resolveEditorialForAct | EVENT_PORT_REQUIRED | V10 panel becomes controlled; no route duplication. |
| Close MAIA | RELEASE | closeWorkspace / editorial release semantics | EVENT_PORT_REQUIRED | Dismiss without moving manuscript locus. |
| Discuss | MaiaTab=Discuss | sendEditorial, bound Editorial thread | READY_DIRECT | Same thread/locus; Sanctuary current at gesture. |
| Revise | MaiaTab=Revise | proposal chain in Editorial thread | READY_DIRECT | Same governed proposal chain. |
| Teach | MaiaTab=Teach | teaching intelligence exists platform-wide; no proven Writer’s Studio tab seam in A2-14 | SUBSTRATE_GAP | Do not make the tab live until a Writer’s Studio teaching act is explicitly bound. |
| Reason | MaiaTab=Reason | per-edit Why this? exists; no proven general Reason-tab seam | SUBSTRATE_GAP | Keep per-edit reasoning where real; do not fake a general tab. |
| What MAIA read | MaiaTab=What MAIA read | Developmental reading coverage / Review payloads | PURE_ADAPTER_REQUIRED | Show exact coverage/frozen reading identity. |
| Member question | MaiaCopy.memberAsk | Editorial thread turns | PURE_ADAPTER_REQUIRED | Exact current thread only. |
| MAIA reply | MaiaCopy.opening/noticed/limits/coverage | Editorial/reading output | PURE_ADAPTER_REQUIRED | No summary generation solely to fill fixture fields. |
| Editing latitude | not fixture-owned | existing useEditingLatitude + Editorial turn scope | READY_DIRECT | Must remain live even if not a permanent V10 control. |
| Voice notice | contextual suggestion notice | A2 Editorial turn voice notice | READY_DIRECT | Travels with suggestion. |

## 4. WRITE — alternatives / preview / Apply / Undo / History

| V10 object/action | V10 marker | A2-14 live authority | Status | Recovery law |
|---|---|---|---|---|
| Alternatives | data-alternatives=peer | editorialThread.versions | PURE_ADAPTER_REQUIRED | Unranked peer alternatives; include Keep my original. |
| Read in context | READ_IN_CONTEXT | current selected version + inline preview | READY_DIRECT | Required before Apply. |
| Back to alternatives | BACK_TO_ALTERNATIVES | clear preview, retain versions | READY_DIRECT | No mutation. |
| Apply | APPLY | applySuggested → adoptBoundEditorialVersion | READY_DIRECT | Explicit exact version only. |
| Applied receipt | phase=applied | application receipt / refreshed context | PURE_ADAPTER_REQUIRED | Exact calm receipt; no success before server receipt. |
| Undo | UNDO | undoSuggested | READY_DIRECT | Exact prior wording through existing undo authority. |
| History | OPEN_OVERLAY history | editorialThread.versions + application state | PURE_ADAPTER_REQUIRED | Distinguish current/previous/exploration without ranking. |
| Close history | CLOSE_OVERLAY | local overlay state | EVENT_PORT_REQUIRED | Presentation-only state. |

## 5. A2 relationship continuity inside exact V10 Write

| Capability | A2-14 authority | Status | Recovery law |
|---|---|---|---|
| Begin relationship | beginA2Relationship | READY_DIRECT | Explicit member gesture only. |
| Choose relationship | chooseA2Relationship | READY_DIRECT | Never infer among multiple parents. |
| Leave relationship | leaveA2Relationship | READY_DIRECT | Clear return/carry state lawfully. |
| Durable relationship return | read/writeRelationshipReturnClient | READY_DIRECT | Independent of manuscript place. |
| Durable manuscript place | read/writePlaceReturnClient | READY_DIRECT | Section place only; no hidden cognition. |
| Carry earlier MAIA response | readEligibleCarrySources + sendBoundEditorialTurn(carry) | READY_DIRECT | One source, explicit, one-shot, exact server re-resolution. |
| Carry chooser presentation | A2-14 RevisionDesk props/state | EVENT_PORT_REQUIRED | Place inside anchored V10 MAIA without turning relationship into transcript/history. |
| Sanctuary refusal | current gesture-scoped posture | READY_DIRECT | No durable Editorial/carry act while unavailable/unresolved. |

## 6. REVIEW

| V10 object/action | V10 contract | Current authority | Status | Recovery law |
|---|---|---|---|---|
| Review view model | ReviewView | durable Developmental readings + current manuscript | READY_PRIOR_ADAPTER | Reuse realReview.ts; it was built as a pure real-reader→V10 Review adapter. |
| Golden-preserving Review presentation | ReviewPresentation successor | R1-1A | READY_PRIOR_ADAPTER | Preserve V10 goldens; do not route through old workbench cards. |
| Lens filters | Review tabs | current reviewLens / selected reading lens | READY_DIRECT | Filter only; never silently commission. |
| Finding order | findings | current durable observation addresses | PURE_ADAPTER_REQUIRED | Book/page order, never relevance rank. |
| Go to passage | data-return-to | exact section/address navigation | READY_PRIOR_ADAPTER | Reuse R1-2 navigation. |
| Discuss | data-action=discuss | openReviewDiscussion / commissionReviewDiscuss | READY_DIRECT | Same admitted finding identity. |
| Explore | data-action=explore | no single governed live semantics in A2-14 | SUBSTRATE_GAP | Do not expose as active until a lawful destination is named. |
| Back to Review | trail | R1-2 navigationFor / review return | READY_PRIOR_ADAPTER | First-class, exact return. |
| Stale reading | StaleReading | reading frozenAt + current revision / assessment | READY_PRIOR_ADAPTER | No silent reread; previous reading remains reachable. |
| Read again | data-commission=reread | developmental reader commission | PURE_ADAPTER_REQUIRED | New explicit reading; historical reading preserved. |
| Not now | data-dismiss=reread | presentation acknowledgement state | EVENT_PORT_REQUIRED | Compacts warning; does not erase stale qualification. |
| What MAIA read | coverage | durable reading coverage | READY_PRIOR_ADAPTER | Exact coverage only. |
| Add own observation | OwnObservation | UI exists, durable member-observation substrate not implemented | SUBSTRATE_GAP | Do not claim kept with passage until OBSERVATION-ADDRESS durability exists. |
| Previous/next finding | TrailPosition | selected finding list/address | PURE_ADAPTER_REQUIRED | Navigation only, no ranking. |

## 7. DEVELOP

| V10 object | V10 contract | Current authority | Status | Recovery law |
|---|---|---|---|---|
| Develop observations | DevelopView.observations | developmental reading observations + evidence | PURE_ADAPTER_REQUIRED | Use governed DevelopObservation; no hand-authored frame logic. |
| Coverage | DevelopView.coverage | reading coverage | READY_DIRECT | Exact count/depth/frozen time. |
| Lens standing | DevelopView.lenses | reading summaries / requested/completed lens state | PURE_ADAPTER_REQUIRED | Distinguish not-read / partial / read / read-nothing. |
| Structure view | WorkStructure | authored manuscript structure | PURE_ADAPTER_REQUIRED | Declared only; otherwise honest undeclared state. |
| Opening / purpose | DevelopView.opening | Living Work declaration / member-authored opening if present | PURE_ADAPTER_REQUIRED | Never infer purpose from prose. |
| Structure / Voice / Continuity / Reader observations | governed reading lenses | current developmental reader | PURE_ADAPTER_REQUIRED | One shared evidence substrate. |
| Themes | accepted V10 view | no independent durable Themes truth system; may be represented only from governed observations | PURE_ADAPTER_REQUIRED | No separate hand-authored theme intelligence. |
| Continuity Map | ContinuityMapData | type/law exists; no verified real aggregate presence producer found in A2-14 host | SUBSTRATE_GAP | Must be countable/checkable before rendering measured-looking cells. |
| What MAIA read | CoverageLine | reading coverage | READY_DIRECT | Reachable disclosure. |
| Ask MAIA about observation | observation dialogue exists in current Develop room | READY_DIRECT | Bound to readingId + observationKey. |
| Return to manuscript evidence | observation returnTo / exact passage evidence | current evidence refs + place navigation | READY_DIRECT | Exact passage when available, truthful section fallback otherwise. |

## 8. Home / arrival / broader correct-reference frames

The exact V10 screenshot renderer governs Write / Develop / Review. Home and later founder-confirmed reference frames are governed by their separate canons and rulings.

| Surface | Authority | Status |
|---|---|---|
| Home / first arrival | Home/Arrival canons + current HomeView substrate | SEPARATE_AUTHORITY |
| Story / Spiral Map | member-declared map law + founder-confirmed visual refs | SUBSTRATE/ADAPTER AUDIT REQUIRED |
| Materials / notes / research | capability-honest navigation and sources substrate | SEPARATE_AUTHORITY |
| Full mobile family | V10 goldens + visual/mobile canons | MUST BE RE-WITNESSED AFTER LIVE ADAPTERS |

## 9. Known blockers before an honest full live V10 claim

1. V10 fixture components are pure renderers, not live controllers. Event ports/controlled state must be added without changing accepted resting DOM/CSS.
2. Write live editor insertion must use the current one-authority writing boundary while preserving exact V10 manuscript geometry.
3. Member observation durability is not present. OwnObservation is visual capability only until OBSERVATION-ADDRESS implementation lawfully exists.
4. Develop Continuity Map lacks a verified real aggregate presence producer in A2-14. A measured-looking map cannot be populated from inference.
5. Teach / general Reason tabs are not both proven live Writer’s Studio seams. They cannot be activated merely because V10 fixtures render them.
6. Review multi-reading composition needs a pure aggregate adapter when rendering the whole chapter review; single durable-reading Review already has a proven real adapter.
7. Utility controls that are only fixture affordances must undergo capability census before live activation.
8. Home and later correct-reference frames are separate authorities, not permission to mutate the frozen V10 component blobs casually.

## 10. Implementation order after this matrix is accepted

1. Recover exact V10 presentation blobs into the recovery lane.
2. Add typed controlled-action ports with a zero-diff fixture default.
3. Bind shell identity/nav/facet from real state.
4. Bind live Write manuscript/editor/place.
5. Bind Editorial alternatives → context → Apply → Undo/History.
6. Bind A2 relationship + carry inside anchored MAIA.
7. Bind real Review through the proven realReview / ReviewPresentation lineage.
8. Add whole-review aggregate adapter and return trail.
9. Bind Develop observations/coverage/structure; stop measured map where substrate is absent.
10. Resolve substrate gaps in their existing governed programmes, not with UI cheats.
11. Re-render all 44 V10 goldens plus founder-confirmed reference comparisons.
12. Founder side-by-side before canonical admission.
