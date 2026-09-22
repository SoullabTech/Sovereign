# JARVIS-WRITERS-STUDIO-COMPLETE-01 / R0 + D0
## Complete reality census + target experience blueprint

**Date:** 2026-09-22
**Class:** research · architecture · product design only
**Canonical base:** `239eba62c8a60db602c4151c4f5a65c95e371f1b`
**Production:** untouched; serving an older build
**Implementation authority:** NONE
**Founder gate:** `YES — BUILD THIS / REVISE / REJECT — REDESIGN`

> **The manuscript is the primary object. MAIA, tools, analysis, and revision exist around the writing — not the other way around.**

> **Never optimize the existing manuscript page into permanence. Preserve implementation contracts; do not preserve an obsolete interaction model.**

## 1. Executive finding

The current Writer's Studio is not one incomplete room. It is three live, parallel compositions over overlapping substrate:

| Route | Primary host | Approx. size | Composition character |
|---|---|---:|---|
| `/writers-studio/canvas` | `CanvasClient` | 1,507 lines | shared shell + rail + panels + permanent MAIA composition |
| `/writers-studio/rebuild` | `RebuildStudioClient` | 2,038 lines | hand-built header/grid + inline insight/revision integration |
| `/writers-studio/develop` | `DevelopRoom` | 1,381 lines | shared shell + read-only developmental manuscript + observation dialogue |

The member-facing Writer's Studio population is **18,740 TSX lines before tests**.

The same responsibilities are implemented more than once:
- manuscript body / manuscript navigation: at least three compositions;
- editorial conversation: `EditorialConversation`, `RevisionDesk + InlineWorkspace`, `ObservationDialogue`;
- workspace container: `WriterStudioShell`, Rebuild's hand-built shell, plus insight workspaces;
- orientation, review presentation, and MAIA presence: multiple competing surfaces.

**R0 conclusion:** the finished Studio must be composed from the strongest existing guarantees. No current room is adopted wholesale.
## 2. Three-room disposition

### Canvas — `/writers-studio/canvas`
**Strongest assets**
- `WholeManuscriptSurface`: continuous manuscript over section-addressable truth;
- `SectionWritingSession`, `SectionWritingSurface`, `useSectionWriting`: mature writing/save substrate;
- `WriterStudioShell`: reusable responsive shell mechanics;
- `EditorialConversation`: durable server-owned conversation/version/adoption semantics;
- `ManuscriptOutline` / `StructuredOutline`: mature manuscript navigation.

**Debt**
- permanent shell rail and capability architecture compete with manuscript hierarchy;
- permanent MAIA column contradicts contextual manuscript-first target;
- multiple panels expose system structure;
- old five-mode / destination organization is not the final experience law.

**Disposition:** **RECOMPOSE.** Mine primitives; do not preserve room composition.

### Rebuild — `/writers-studio/rebuild`
**Strongest assets**
- canonical host address;
- chapter-review integration;
- exact-locus editorial recovery;
- inline `ManuscriptPassage` revision markup;
- member-version, apply, undo, Work-context and structure wiring;
- A1C measured geometry proof.

**Debt**
- 2,038-line host owns too many responsibilities;
- hand-built shell duplicates shared shell behavior;
- editorial machinery is visibly dense;
- unavailable editorial capability still renders a complete-looking control surface;
- review lens/manifest mechanics are member-visible;
- current composition can close technically without becoming a recognizably new product.

**Disposition:** **REPLACE AS COMPOSITION / KEEP AS INTEGRATION MINE.**

### Develop — `/writers-studio/develop`
**Strongest assets**
- explicit law: reading machinery is substrate, not design authority;
- frozen reading / observation / evidence / staleness presentation;
- read-only `WholeManuscriptSurface` use;
- exact passage highlighting;
- preparation/refusal honesty.

**Debt**
- separate room fragments the A0 one-conversation / one-Work experience;
- `ObservationDialogue` duplicates editorial conversation;
- developmental operation still appears as a separate product surface.

**Disposition:** **RECOMPOSE INTO REVIEW MOVEMENT.** Do not retire route until integrated product proves replacement.
## 3. Reality and reuse map

| Surface / substrate | R0 disposition | Reason |
|---|---|---|
| `RebuildStudioClient.tsx` | **REPLACE / DECOMPOSE** | transitional integration host, not permanent product architecture |
| `rebuild.css` | **RECOMPOSE** | retain useful manuscript/scroll rules, replace room-specific composition |
| `WholeManuscriptSurface` | **KEEP AS SUBSTRATE** | continuous manuscript + section identity + window/capture safeguards |
| `useSectionWriting` | **KEEP AS SUBSTRATE** | writing authority, save queue, capture-on-leave |
| `SectionWritingSession/Surface` | **KEEP AS SUBSTRATE** | section-native editing guarantees |
| `RebuildAuthoredBody` | **REPLACE / CONSOLIDATE** | duplicate manuscript rendering; prefer one manuscript authority |
| `ManuscriptOutline/StructuredOutline` | **RECOMPOSE** | authored hierarchy valuable; current presentation not binding |
| `WriterStudioShell` | **RECOMPOSE** | useful responsive mechanics; current permanent rail/mode composition conflicts |
| `StudioRail` | **RETIRE FROM PRIMARY EXPERIENCE** | exposes software hierarchy/machinery |
| `StudioModeBar` | **REPLACE** | WRITE/DEVELOP/EXPLORE/REVIEW/PUBLISH is not target core movement model |
| `StudioMovements` | **RECOMPOSE** | Work / Review / Ask MAIA aligns with target |
| `PlaceInWork` component | **KEEP** | human-readable location |
| `placeInWork.ts` | **KEEP AS AUTHORITY** | shared place grammar |
| `placeCrumb.ts` | **KEEP AS AUTHORITY** | back-to-manuscript location |
| `ManuscriptPassage` | **KEEP / RECOMPOSE PRESENTATION** | strong exact-locus and inline edit-mark semantics |
| `InlineWorkspace` | **KEEP AS SUBSTRATE** | stable portal preserves unsaved draft while locus moves |
| `RevisionDesk` | **RECOMPOSE** | strong capabilities; current surface exposes too much machinery |
| `InsightReading` | **RECOMPOSE** | evidence/coverage law strong; must become supporting explanation, not second workspace |
| `InsightReadings` | **KEEP / RECOMPOSE** | visited-reading continuity useful |
| `MaiaListen` | **KEEP** | existing read-aloud control |
| `EditingLatitude` | **UNRESOLVED / HIDE BY DEFAULT** | E6 member-facing exposure not ruled |
| `EditorialConversation` | **KEEP SERVER SEMANTICS / REPLACE UI** | strongest durable thread/version/adoption model |
| `ObservationDialogue` | **REPLACE INTO UNIFIED CONVERSATION** | duplicate conversation product |
| `CanvasWorkspace` | **RECOMPOSE** | useful contextual workspace; not separate product |
| `chapterReview` + manifest | **KEEP AS SUBSTRATE** | coverage and frozen-read continuity |
| editorial API routes | **KEEP AS SUBSTRATE · GATED** | thread/turn/version/adoption/undo exist but 404 unless feature flag enabled |
| `focus/route.ts` | **KEEP** | canonical Work-context cognition boundary |
| source upload routes | **KEEP** | real source custody; not source verification |
| Work context/declarations | **KEEP** | member declaration law |
## 4. Product debt register

1. **Three parallel rooms** with overlapping member-visible responsibility.
2. **Three conversation implementations** with different state/lifecycle models.
3. **Duplicate manuscript renderers** create multiple candidates for canonical writing presentation.
4. **Permanent rail/panel architecture** competes with manuscript hierarchy.
5. **Rebuild hand-rolls its shell** and centralizes too much state in one component.
6. **Feature-gated editorial runtime** can produce a complete-looking but inert revision UI.
7. **Chapter review exposes lenses/manifests** as writer-operated machinery.
8. **Whole-work review orchestration is absent.** Existing reader ceiling must remain; writer should not operate pass/range machinery.
9. **E4 durable authorship provenance remains unresolved.**
10. **E6 depth / `data-workbench-scope` remains unresolved.**
11. **`reviewLens` / manifest exposure is inherited debt.**
12. **Version history is partial**: lineage exists; complete named compare/restore UX does not.
13. **Voice playback exists; voice-note capture into this flow is absent.**
14. **Related passages exist partially** through insight evidence; unified full-width treatment is not composed.
15. **Source upload exists; external source/quote verification does not.**
16. **Manuscript-level similarity/repetition search does not exist.**
17. **Ranking/prioritization remains unauthorized.**
18. **No-draft arrival needs an honest product state rather than a manuscript-structure refusal.**
19. **Mobile/narrow behavior is split across room-specific responsive rules.**
20. **Production remains on an older build** and is not part of R0+D0.

## 5. Canonical red UX suites

Exact baseline on canonical:
- 2 suites;
- 18 tests;
- 15 green;
- 3 red.

### `workbenchUsability.test.ts`
Two red assertions concern literal failure copy.

**Classification:** **PARTLY VALID — REWRITE REQUIRED.**

The product obligations remain valid:
- long review exposes progressive state rather than one blocking spinner;
- failed lens remains distinguishable from completed-zero-observation lens.

The exact expected copy is stale. Current source already distinguishes failure stage through `FAILED_AT` and specific refusal copy. Future falsifier should assert semantic state, not one legacy phrase.

### `guidedEditorialLoop.test.ts`
One red assertion expects the bound response button **Partly** after rendering without an exact editorial binding.

**Classification:** **STALE AGAINST CURRENT LAW.**

C6 deliberately suppresses bound editorial response vocabulary when there is no exact member-chosen passage range. The membrane is the intended behavior.
## 6. External reference research — reference, never authority

| Reference | Pattern observed | Useful here | Rejected / constrained here |
|---|---|---|---|
| Ulysses · official editor customization guide | full-screen, hide interface, contextual overlays | writing can reclaim the room without destroying capability | no assumption that minimalist hiding alone solves workflow |
| Figma · official comments guidance | discussion pinned to a canvas location; comments can be hidden | conversation should stay attached to manuscript locus and recede when not active | Writer's Studio is authorship, not multi-user design review |
| Google Docs · official suggesting guidance | suggestion does not replace original until owner accepts; preview before/after | proposed edits stay distinct and owner-controlled; context preview is first-class | no bulk-accept default for MAIA proposals; exact-authority rules are stricter |
| Microsoft Word · official Track Changes guidance | inline insertion/deletion markup; exact accept/reject; reviewing pane secondary | markup belongs in document; review panel is supporting surface | no generic reviewer authority; MAIA never becomes co-author by default |

Research consequence:
- **manuscript owns the room;**
- **conversation is locus-bound and contextual;**
- **proposal remains visibly different from adopted text;**
- **supporting review surfaces may appear on demand but do not become the primary object.**

## 7. Target experience architecture

### At rest
The manuscript is the largest, quietest, visually dominant object.
- authored hierarchy is reachable contextually;
- Work / Review / Ask MAIA are the primary movements;
- MAIA has no permanent acreage merely because cognition exists;
- history, sources, reasoning, lenses and advanced controls are on demand;
- Focus can remove nearly all chrome without changing Work identity or save state.

### Passage selected
Selection creates one exact locus.
- passage remains visible;
- conversation opens **inside the manuscript flow** at that locus;
- place, draft, Work and thread identity do not fork;
- closing conversation returns to the unchanged manuscript location.

### Conversation
One relationship carries:
- understand;
- disagree/challenge;
- learn;
- explore;
- revision discussion.

Reasoning and teaching are disclosures inside the same relationship, not separate products.

### Revision
A proposal is a possibility.
- manuscript remains visible;
- changed words are marked in context;
- original is preserved;
- alternatives are named by purpose, not ranked;
- discussion remains available while a proposal exists.
### Alternatives
Examples:
- More embodied
- Quieter ending
- Closer to the original cadence
- Keep mine

No default winner. Selecting an alternative chooses what to inspect, not what to apply.

### Read in context
- candidate is projected at the exact passage;
- application remains disabled until the required review act is satisfied;
- writer can return to alternatives or conversation without losing state.

### Apply + Undo
- one exact version is authorized;
- applied receipt names exact place;
- Undo is immediately visible;
- undo restores wording while history truthfully records that application and undo occurred.

### Review
Review is a movement over the same manuscript.
- findings are returned to authored locations;
- coverage is always visible as trust evidence;
- lenses/passes/manifests remain behind MAIA;
- opening a finding returns to the manuscript and the same unified conversation seam.

### Related passages
Supporting comparisons receive real horizontal room when opened.
They are not squeezed into a permanent sidebar.
Evidence state remains visible.

### No-draft / new Work
A Work with no manuscript does not enter a fake manuscript room.
The Studio names what exists and offers only real next acts.

### Narrow/mobile
- manuscript remains the only permanent surface;
- outline becomes an overlay;
- review becomes a bottom sheet / contextual layer;
- conversation remains inline in document flow;
- no desktop three-column squeeze.
## 8. State transition map

```text
Studio Home
  ↓
Work
  ↓
Manuscript
  ↓ select exact passage
Passage held
  ↓
Conversation at passage
  ├─ Understand / Why this?
  ├─ Challenge / I see it differently
  ├─ Learn more
  └─ Explore another approach
          ↓
     Revision alternatives
          ↓
     Read in context
          ↓ deliberate exact-version act
        Apply
          ↓
     Applied receipt
          ├─ Undo → same manuscript · same place
          └─ Continue → same conversation · same place
```

Review path:

```text
Manuscript
  ↓ Review
Chapter / Work review
  ↓ finding
Exact authored place
  ↓
Same conversation seam
  ↓
Revision / discussion
  ↓
Manuscript
```

Every close/back path returns to a known Work + authored place. No state is a terminal report page.

## 9. Information hierarchy

| Object/control | Target status |
|---|---|
| manuscript | **PERMANENT / PRIMARY** |
| current Work + authored place | **PERMANENT / QUIET** |
| Work / Review / Ask MAIA | **PERMANENT / MINIMAL** |
| outline | **CONTEXTUAL**; collapsible/overlay |
| MAIA conversation | **CONTEXTUAL** at active locus |
| scope | **CONTEXTUAL, HUMAN-LANGUAGE** |
| coverage | **VISIBLE WHEN A READING EXISTS** |
| reasoning | **ON DEMAND** |
| teaching | **ON DEMAND** |
| version history | **ON DEMAND** |
| related passages | **ON DEMAND / FULL-WIDTH WHEN OPEN** |
| sources | **ON DEMAND** |
| Work Compass | **CONTEXTUAL / QUIET** |
| review lenses | **HIDDEN FROM ORDINARY WRITER FLOW** |
| review manifest | **REMOVED FROM WRITER-FACING EXPERIENCE** |
| editorial depth | **UNRESOLVED; HIDDEN BY DEFAULT** |
| editing latitude | **UNRESOLVED; HIDDEN BY DEFAULT** |
| paragraph-removal permission | **UNRESOLVED; HIDDEN BY DEFAULT** |
| technical diagnostics | **REMOVED FROM ORDINARY EXPERIENCE** |
## 10. Capability-honesty matrix

| Visible target action | Current substrate | State | Product rule until built |
|---|---|---|---|
| write in section-addressable manuscript | section writing/save substrate | **FULLY LIVE** | show |
| whole-manuscript continuous writing | `WholeManuscriptSurface` | **FULLY LIVE** | show |
| exact place / return | place grammar + crumb | **FULLY LIVE** | show |
| Ask MAIA at Work/passage | focus crossing + editorial turn seams | **LIVE / context-dependent** | show only when valid locus/Work exists |
| durable editorial conversation | thread/turn routes | **PARTIAL · FEATURE-GATED** | target may be designed; production UI must hide if gate is off |
| MAIA proposal/version | editorial runtime | **PARTIAL · FEATURE-GATED** | same |
| member alternative version | version route | **PARTIAL · FEATURE-GATED** | same |
| exact apply | adoption route + authorization | **PARTIAL · FEATURE-GATED** | same |
| Undo | undo route | **PARTIAL · FEATURE-GATED** | same |
| Listen to MAIA | `MaiaListen` | **LIVE** | show contextually |
| voice note into conversation | no complete Studio substrate | **ABSENT** | do not offer until built |
| chapter review | chapter review + frozen reading substrate | **LIVE / bounded** | show |
| whole-Work review | bounded reader exists; orchestration above it absent | **PARTIAL** | do not promise seamless whole review until orchestration exists |
| related passages | insight evidence passages | **PARTIAL** | show only verified/known relations |
| version compare/history | version lineage exists | **PARTIAL** | on-demand; no restore promise beyond substrate |
| source upload/materials | source routes | **LIVE** | on-demand |
| external source/quote verification | none in manuscript substrate | **ABSENT** | do not offer |
| manuscript repetition/similarity | none in manuscript substrate | **ABSENT** | do not offer |
| durable MAIA-vs-writer prose provenance | partial version authorship; E4 unresolved | **PARTIAL / BLOCKING** | no stronger authorship claim than record supports |
| ranking / priority map | authority unresolved | **UNAUTHORIZED** | preserve manuscript order / unranked findings |
## 11. Acceptance falsifiers

1. **Visual non-event:** founder opens candidate and asks “Where is the new build?” → FAIL.
2. **Manuscript displacement:** assistant/tools visually dominate Work → FAIL.
3. **Machinery exposure:** ordinary editorial act requires lens/pass/range/manifest operation → FAIL.
4. **Conversation fragmentation:** scope/review/proposal change loses active conversation/draft → FAIL.
5. **Place loss:** any path cannot return to exact manuscript location → FAIL.
6. **Unauthored mutation:** manuscript text changes without deliberate writer act → FAIL.
7. **Opaque revision:** writer cannot see what changed, why, before-state, or undo → FAIL.
8. **Verdict alternatives:** UI implies one proposal is correct/best without authority → FAIL.
9. **Fake capability:** visible active control has no working substrate → FAIL.
10. **Authorship ambiguity:** record cannot distinguish authorship where constitution requires it → FAIL.
11. **Large-display regression:** bigger viewport permanently enlarges chrome while Work becomes less primary → FAIL.
12. **Mobile collapse failure:** narrow layout loses Work/place/conversation/recovery → FAIL.
13. **Second-workspace regression:** reading/explanation and revision render as competing live workspaces → FAIL.
14. **Dead-end review:** finding opens a report state with no direct return into manuscript → FAIL.
15. **Gate dishonesty:** editorial feature off yet revision controls appear active → FAIL.

## 12. Prototype artifact

Interactive prototype:

`docs/design/prototypes/jarvis-writers-studio-complete-r0d0/index.html`

Local review URL during this act:

`http://localhost:3101/`

Prototype states are clickable and may also be addressed with `?state=` for deterministic visual capture.

Reference captures:
- `desktop-manuscript.png`
- `desktop-conversation.png`
- `desktop-alternatives.png`
- `desktop-read-in-context.png`
- `desktop-applied-undo.png`
- `desktop-chapter-review.png`
- `desktop-related-passages.png`
- `mobile-manuscript.png`
- `mobile-conversation.png`
- `mobile-alternatives.png`

The prototype is design evidence only. It has no API, persistence, model, auth, schema or production authority.
## 13. Implementation dependency graph

```text
R0+D0 founder-approved blueprint
        ↓
B0 composition architecture
        ├─ preserve section writing/save authority
        ├─ preserve place identity
        ├─ preserve thread/version/adoption/undo authority
        └─ define one manuscript + one conversation host
        ↓
B1 manuscript-first host shell
        ↓
B2 unified passage conversation
        ↓
B3 alternatives → context → apply → undo
        ↓
B4 integrated review → finding → manuscript
        ↓
B5 whole-Work orchestration over bounded reads
        ↓
B6 teaching + voice/capture
        ↓
B7 authorship provenance + source boundaries
        ↓
I0 integrated product
        ↓
X0 founder product walk
        ↓
R1 release readiness
        ↓
Founder merge adjudication
        ↓
Separate production deployment act
```

Blocking dependencies:
- E4 durable authorship provenance before strong provenance claims;
- E6 machinery-exposure ruling for depth / workbench scope;
- editorial feature-gate disposition before revision can be claimed generally live;
- whole-work orchestration before seamless whole-Work review;
- ranking remains excluded until separately authorized.

## 14. Proposed build sequence

### B0 — composition architecture
Decompose the transitional host and define authoritative component boundaries. Behavior-preserving.

### B1 — manuscript-first canvas
Replace permanent three-column furniture with manuscript-owned composition. Contextual outline, contextual MAIA, honest no-draft state.

### B2 — unified conversation
One passage/section/chapter/Work relationship surface. Preserve exact-locus state and unsaved drafts.

### B3 — revision experience
Plural alternatives, direct manuscript markup, discuss, Read in context, exact Apply, receipt, Undo, history.

### B4 — review integration
Chapter review and findings become contextual movements over the same manuscript. Hide lens/pass machinery; preserve coverage.

### B5 — whole-Work intelligence
Build orchestration above bounded reads without moving the reading ceiling.

### B6 — teaching + voice
Technique explanation, Listen to MAIA, interruption/resume, voice-note capture when authorized.

### B7 — provenance + sources
Close E4, preserve protected quotations and source custody; do not imply external verification.

### I0 / X0 / R1
Integrated assembly, founder walk, full release gates. No intermediate stage may redefine product completion.
## 15. Founder decision docket

### D1 — MAIA at rest
**Question:** permanent panel, small presence, or absent until invoked?
**R0 recommendation:** contextual presence; no permanent acreage.
**Why:** manuscript primacy and F2/F11.

### D2 — desktop outline
**Question:** open by default on wide screens or collapsed by default?
**Prototype:** open wide, overlay/collapsed narrow.
**Founder ruling required.**

### D3 — scope presentation
**Question:** exact control shape for passage/section/chapter/Work.
**Recommendation:** human-language contextual control, never pass/range machinery.

### D4 — E6 depth / editing latitude
**Question:** should depth/latitude surface at all in ordinary flow?
**Recommendation if unresolved:** hide; provide ordinary-language conversation acts.

### D5 — `data-workbench-scope`, reviewLens, manifests
**Recommendation:** remove from ordinary writer-facing experience; retain internally/diagnostically.

### D6 — version history
**Question:** how much lineage inline?
**Recommendation:** current alternative + named siblings inline; full lineage on demand.

### D7 — whole-Work review
**Question:** implementation shape above bounded reader.
**Dependency:** new orchestration act; no ceiling widening.

### D8 — E4 durable authorship provenance
**Question:** durable representation of writer-authored vs MAIA-proposed-and-adopted vs writer-rewritten.
**Status:** blocking constitutional/product debt.

### D9 — source verification
**Question:** whether/when MAIA may consult external sources.
**Status:** new capability class; absent from this blueprint's active controls.

### D10 — ranking
**Question:** whether MAIA may prioritize findings.
**Status:** unresolved authority. Prototype uses no ranking.

### D11 — route retirement
**Question:** when `canvas/` and `develop/` may redirect/retire.
**Recommendation:** only after integrated `rebuild/` passes founder acceptance and parity witnesses.

## 16. R0+D0 standing

R0 research and D0 prototype may be complete only when:
1. founder opens the interactive prototype;
2. founder walks the critical states;
3. founder rules one of:
   - **YES — BUILD THIS**
   - **REVISE**
   - **REJECT / REDESIGN**

Until **YES — BUILD THIS**:

> **NO WRITER'S STUDIO RUNTIME IMPLEMENTATION.**

The programme closure law remains unchanged: the programme closes only when the integrated member-visible Studio is unmistakably new at first entry, supports the manuscript → conversation → revision → apply → undo loop, passes founder experiential acceptance and release gates, and is ready for a separate production-deployment decision.
