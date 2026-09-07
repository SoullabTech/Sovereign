# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## FIRST JARVIS ACT · DISCOVER — WHOLE-TERRAIN CENSUS

**Lane** `flows/WRITERS-STUDIO-CAPABILITY-COMPLETION-01.flow.md`
**Custody** branch `claude/writers-studio-capability-clxw8d` · HEAD `e7e1e075` · tree clean at census start
**Mode** READ-ONLY. No build. No migration. No deploy. No repair.
**Status** CENSUS COMPLETE — STOP FOR FOUNDER ADJUDICATION

---

## 0 · WHAT THE TERRAIN ACTUALLY IS

The declared Writer's Studio is not sixteen destinations. It is **three
independent declaration sites**, and they do not agree with each other:

| Site | File | Declares |
|---|---|---|
| The map | `app/writers-studio/studioMap.ts` `STUDIO_MAP` | 16 rail destinations in 3 bands |
| The mode bar | `app/writers-studio/studioMap.ts` `STUDIO_MODES` | 5 modes |
| The lower band | `app/writers-studio/canvas/StudioLowerBand.tsx` `STRUCTURE_SURFACES` | 4 structure surfaces, one of which (**Threads**) exists nowhere else |

**Finding X-1.** `Threads` is a member-visible unavailable surface that appears
in no map, no mode, no doc, and no ruling. It entered through a reference
screen and has no governing record.

Two rendering boundaries exist, and they disagree by design (recorded in
`studioMap.ts`, WS2-03B amendment to WS2-02):

- `visibleDestinations()` — **Studio Home drops** `later` destinations.
- `shellDestinations()` — **the Canvas rail presents them, unavailable.**

So the unbuilt territory is visible to a member **only inside the Canvas**.

---

## 1 · REACHABILITY LEDGER

Actionability in the Canvas rail is resolved at
`app/writers-studio/canvas/page.tsx:130`:

```
const SATISFIED_IN_ROOM = ['materials', 'structure', 'versions', 'conversations']
```

| id | label | band | map says | member reality | evidence |
|---|---|---|---|---|---|
| home | Home | work | available | **LIVE** | `/writers-studio` |
| manuscript | Manuscript | work | available | **LIVE** | `CANVAS_HREF` |
| materials | Materials | work | later | **LIVE as panel** | `MaterialsDrawer.tsx` · `/api/sovereign/living-works/[id]/materials` |
| structure | Structure | work | later | **LIVE as panel** | outline column · `manuscript_sections` · `20260906000001_manuscript_section_heading_depth` |
| notes | Notes | work | later | **NOTHING** | label + icon only |
| versions | Versions | work | later | **LIVE as panel** | `StudioLowerBand` revisions · `workingDraftClient` |
| goals | Goals | work | later | **NOTHING** | band region states "NO SUBSTRATE" in prose |
| conversations | Conversations | maia | later | **LIVE as panel** | `StudioConversation.tsx` · `studioConversation.test.ts` |
| discover | Discover | maia | later | **NOTHING** | label + icon only |
| insights | Insights | maia | later | **NOTHING (presentation only)** | `StudioInsightChip` / `MaiaReading` reachable from `MaiaColumn` + fixture; no insight object, no store |
| suggestions | Suggestions | maia | later | **NOTHING** | label only |
| find-replace | Find/Replace | tools | later | **NOTHING** | label + icon only |
| statistics | Statistics | tools | later | **LIVE in the same room, NOT in the rail** | `StudioLowerBand` computes words/sections/versions via `lib/writersStudio/draftWords.ts` |
| timeline | Timeline | tools | later | **NOTHING** | label + icon only |
| word-web | Word Web | tools | later | **NOTHING** | label + icon only |
| export | Export | tools | available | **LIVE** | `/press/manuscript?tab=export` |

**Modes**

| mode | map says | reality |
|---|---|---|
| write | available | LIVE — `CANVAS_HREF` |
| develop | available | LIVE — `/writers-studio/develop`, full substrate (see §4) |
| explore | later | nothing |
| review | later | **a route named `/writers-studio/review` EXISTS** and is not this mode |
| publish | later | nothing |

**Finding X-2 · STATISTICS CONTRADICTION.** In the Canvas, the rail draws
*Statistics* as unavailable while the lower band of the same screen shows the
counted figures. The capability is live; the destination denies it.

**Finding X-3 · REVIEW NAME COLLISION.** `app/writers-studio/review/page.tsx`
is a proposal-witness harness (read-and-review-only, no adoption endpoint),
reachable only through `reviewPath` returned by
`app/api/sovereign/manuscripts/[id]/structure/read/route.ts:144`. It is linked
from no member surface. It shares its name with an unbuilt mode.

**Finding X-4 · FR-C HAS NO REPOSITORY RECORD.** `grep` over the whole tree
returns FR-C / FR-D only inside this lane's own flow file. The rulings are
binding per the founder, but they are not written down anywhere the code can
be audited against.

**Finding X-5 · FR-C IS NOT CURRENTLY SATISFIED BY THE RAIL.**
`StudioRailItem` renders an unavailable destination as a `<span>` with
`aria-disabled`, `opacity 0.55`, quiet ink — **it is dimmed, and its state is
never said.** No text, no note, no `title`, no screen-reader state.
FR-C as stated ("must be said, not merely dimmed") is therefore *asserted PASS
in the flow and observably FAIL in the render*. Recorded, not repaired.

---

## 2 · PACKET A — MEMBER-AUTHORED

**Confirmed Packet A:** `notes`, `goals`
**Reclassified INTO Packet A by census:** `materials`, `structure`, `versions`
(already live as panels — they are the member's own material, hierarchy, and
kept revisions; nothing infers them)

### Harvest — the precedent already exists and is strong

**Keeps** (`app/writers-studio/useManuscriptKeeps.ts`,
`/api/sovereign/manuscripts/[id]/keeps`) is a live member-authored object:
verbatim text the writer selected, attached to a section, nothing generated.
It is the nearest existing kin to Notes and the convergence candidate.

**`maiaOffering.ts` already rules on Goals** — and permits them:

> *Writer-declared goal progress MAY be quantified.* … *MAIA-generated
> evaluative judgement MUST NOT be quantified.*

Goals is the one unbuilt destination whose constitutional question is
**already settled**. What is missing is substrate, not authority.

`StudioLowerBand.tsx` records the exact trap: reference screen 04's three gold
progress bars "would have invented a measurement of a member's writing."

### Open before build

- Is a Note attached to a Work, a section, a passage, or global?
- Does Notes converge with Keeps, or is a Keep a *selection* and a Note an
  *addition* — two objects, not one? (Census position: they are two.)
- Does a Note enter export? versions? memory?
- May MAIA propose into a Note, and if so, does it stay a proposal until an
  explicit member gesture? (`lib/writersStudio/__tests__/adoptionRequiresGesture.test.ts`
  is the existing law to bind to.)
- Goals: what may be declared — words, sections, dates? Who may edit? Does a
  missed goal ever produce a MAIA reading? (Census position: it must not.)

**No Packet A capability is proposed for build here.**

---

## 3 · PACKET B — MAIA-DERIVED

**Confirmed Packet B:** `discover`, `insights`, `suggestions`
**Unresolved, argued below:** `conversations`, `word-web`

### The decisive finding

**Finding B-1 · A FULLY-CONSTITUTED MAIA-DERIVED SURFACE ALREADY EXISTS, AND
IT IS NOT IN THIS BAND.** The Develop mode (WS2-07, BUILD-07A→07F) is a built,
tested, migrated MAIA-derived capability with:

| concern | where it is already answered |
|---|---|
| the derived object | `developmental_readings` (`20260904000001`, v2 `20260904000002`) |
| frozen evidence | `lib/manuscript/development/` — `EvidenceRef`, `readState`, `bindEvidence` |
| member standing | `developmental_observation_standing` (`20260906000001`) · `Standing = keep \| dismiss \| unresolved` |
| UNSET ≠ UNKNOWN | `lib/writersStudio/observationStanding.ts` |
| cannot act on the work | `lib/writersStudio/__tests__/developSurfaceCannotAct.test.ts` |
| no score may cross | `app/writers-studio/maiaOffering.ts` · `assertNoMemberFacingScore` |
| dialogue without authorship | BUILD-07E, `ObservationDialogue.tsx` |

So the honest question for Packet B is **not** "what should Insights become?"
It is:

> **Are Discover / Insights / Suggestions three unbuilt rooms, or are they
> three obsolete labels for a capability that already shipped as a MODE?**

Census position: **presumptively obsolete.** They carry no object, no store, no
spec, no ruling, and no doc. The only artifacts wearing their vocabulary are
presentation primitives (`StudioInsightChip`, `MaiaReading`) whose live use is
inside `MaiaColumn`, not inside any Insights destination. Building them would
create a **second MAIA-derived authority** beside a constituted one — the
duplicate-implementation failure §4 of the flow forbids.

### `word-web` — reclassification argued

The flow places Word Web in Packet C and instructs reclassification rather than
category-stretching. A word web that draws only lexical co-occurrence is
mechanical; one that draws *concepts, themes or importance* is inference.
There is no implementation to inspect, so the census cannot settle it from
evidence — but the name alone cannot hold it in C. **Recorded as
Packet C-declared / Packet B-suspected. Requires a founder ruling on what it
computes before it can be classified at all.**

### `conversations` — genuinely a third thing

Live as a panel, `later` as a destination, promotable only through
`situatedHrefs` when a Work can be addressed. It is not derived material — it
is a relational surface. **Neither A nor B cleanly. Left UNRESOLVED.**

---

## 4 · PACKET C — MECHANICAL INSTRUMENTS

| instrument | mechanical? | census reading |
|---|---|---|
| **Statistics** | YES | Already live in the lower band, already disciplined to counted-not-judged. The work is **not building it — it is reconciling the rail with it** (Finding X-2). Lowest-risk, smallest coherent capability in the whole census. |
| **Find/Replace** | Find yes; **Replace is the only mutating capability in this lane** | No preview, no reversibility, no scope semantics, no interaction with the append-only revision store or `sectionSaveQueue`. Must state: what scope, previewable, reversible, does it produce a revision. |
| **Timeline** | CONDITIONAL | The flow permits it "only if chronology is actually represented." Manuscript structure carries `position` and `heading_depth` — **order, not time.** The only real time axis in the Studio is the revision store. A Timeline built today would either visualize *versions* (which is Versions) or invent a chronology. **Defer or rename.** |
| **Word Web** | DISPUTED | See §3. |

---

## 5 · DEFER / REMOVE CANDIDATES

- **`discover`, `insights`, `suggestions`** — remove-or-rule candidates. They
  duplicate a shipped mode and hold no substrate. Per §9 of the flow, FR-C does
  not oblige them to ship.
- **`timeline`** — defer until a represented chronology exists, or rename to
  what it would actually show.
- **`threads`** — undeclared surface (Finding X-1). Remove or constitute.
- **The Explore and Publish modes** — outside this census's evidence; named
  only as promises.

**Nothing is removed by this census.**

---

## 6 · UNKNOWN

- What FR-C and FR-D actually say (no repository record — Finding X-4).
- What Word Web computes.
- Whether Notes and Keeps are one object or two.
- Whether the four satisfied-in-room panels should be *promoted to
  destinations* or the map should stop declaring them as such.

---

## 7 · STOP CONDITIONS OBSERVED

- No build. No migration. No deploy. No repair of X-2 or X-5.
- No packet sequenced. No implementation order proposed (flow §14).
- Founder must rule each packet independently.

**STOP FOR FOUNDER ADJUDICATION.**
