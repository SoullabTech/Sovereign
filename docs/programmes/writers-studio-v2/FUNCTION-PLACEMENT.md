# WRITERS-STUDIO-V2 — Function Placement

Every function the Studio has, placed in the five-mode architecture.

Companion to `DESIGN-CONTRACT.md`. That file governs how a room **looks** and is
**FROZEN** — the reference pack landed in `1493c28c0`. This file governs where
each function **lives**, and it never depended on the images at all.

Resolved from `CAPABILITY-MAP.md` and the repository on 2026-08-27.

---

## §0 — What this settles, and what it cannot

**Settles:** which mode owns each function, which modes may show it, which unit
moves it, and what happens to the functions that do not exist yet.

**Does not settle:** composition, hierarchy, density, typography — anything a
screenshot would decide. Those are settled by the frozen pack
(`DESIGN-CONTRACT.md` §0). A unit may be *planned* and *built* against this
file; it may not claim **visual** acceptance against it — visual acceptance
compares against an image.

**Corrected 2026-08-28.** This section previously said composition waited on the
images arriving. They arrived in `1493c28c0` on 2026-08-27. Placement and
composition are now both resolvable; they remain resolvable from *different*
documents, which is why this file and the Design Contract stay separate.

---

## §1 — The frame

Five modes. One environment.

```text
WRITE      the manuscript, the chapter, the sentence
DEVELOP    the work seen whole — review, findings, evidence
EXPLORE    work home — what exists, what is recent, what MAIA noticed
REVIEW     reader lenses, dispositions, response
PUBLISH    assembly, export, sharing
```

Three things are not modes and are never absent — they belong to the **shell**
(WS2-03) and every mode inherits them:

| Persistent | What it is | Backed by |
|---|---|---|
| **the work** | which work, which manuscript, which position — never ambiguous | `manuscripts/[id]`, `WorkDrawer` |
| **MAIA** | one companion region, context-aware per mode | `studio/companion`, `companionStance` |
| **navigation** | shallow, persistent, one move back to the manuscript | WS2-03 shell |

**The one-owner rule.** Every function below has exactly one owning mode. Other
modes may open a *view* onto it. A view reads the owner's state and renders it;
it never carries a second copy of the logic. This is what keeps Materials,
Structure and Versions from quietly becoming applications of their own — the
failure `DESIGN-CONTRACT §1` names.

---

## §2 — Placement

### WRITE — owner of the draft (WS2-04)

| Function | Substrate | Notes |
|---|---|---|
| draft read / autosave / checkpoint | `[id]/draft` | the writing surface's whole contract |
| chapter editing in the room | `manuscriptMap.ts`, `manuscript_sections` | frames; splice preserves the whole book |
| rich text | — | **unbuilt.** both surfaces are plain `<textarea>` |
| focus mode | — | unbuilt; shell-level, lands with WS2-04 |
| find in manuscript / replace | `candidates`, `keeps`, `manuscriptTools.ts` | |
| versions, contextual | `draft/revisions`, `[revision]`, `diff.ts` | **view** onto STRUCTURE's owner |
| materials, contextual | `studio/materials` | **view** onto MATERIALS |
| structure rail as navigator | `manuscriptMap.ts` | **view** onto STRUCTURE |

### EXPLORE / Work Home — owner of arrival (WS2-05)

| Function | Substrate | Notes |
|---|---|---|
| what exists / what is recent | `manuscripts` (list) | |
| open a work | `canvasIdentity.ts` | D-010: emit the exact identity or refuse |
| start a new work | `manuscripts/blank` | |
| import a work | `manuscripts/ingest` | **WS2-01B open** — see STATE |
| the cut on import | `lib/manuscript/ingest/segment.ts` | **WS2-01C fixed**, undeployed (D-013) |
| rename | `[id]/title` | |
| what MAIA noticed | `studio/companion` | **view** onto MAIA |
| goals | — | unbuilt → WS2-10, surfaces here |

### MATERIALS — owner of sources (WS2-06)

| Function | Substrate | Notes |
|---|---|---|
| materials list / create | `studio/materials` | |
| one material | `studio/materials/[id]` | |
| file bytes / preview | `studio/materials/[id]/file` | transcript · audio · doc · image |
| provenance | `living_work_materials`, `lib/studio/materials` | where it came from, verbatim |
| relationship-to-work | `lib/studio/materials` | the writer's sentence, not our inference |

### STRUCTURE — owner of the map (WS2-07)

| Function | Substrate | Notes |
|---|---|---|
| structure map / outline | `manuscriptMap.ts`, `manuscript_sections` | locate, never derive |
| drift reporting | `DraftMap.adrift` | named, never hidden |
| doorless parts | `DraftMap.unnamed` | D-013: unnamed is not missing |
| versions | `draft/revisions`, `diff.ts` | **owner**; WRITE holds a view |
| movements · threads · continuity · timeline | — | unbuilt |
| attentional architecture | — | STRUCTURE-02 held and redefined (D-005) |

### DEVELOP / REVIEW — owner of the work seen whole (WS2-08)

| Function | Substrate | Notes |
|---|---|---|
| developmental review | `studio/review`, `lib/studio/developmental/` | |
| review progression | `studio/review/[id]/advance` | |
| findings + evidence passages | `studio/review/finding/[id]` | a finding carries its passage |
| dispositions | `studio/review/finding/[id]` | **the writer assigns importance** |
| reader lenses | `lib/studio/reviewLens.ts` | REVIEW mode's substrate |

### MAIA — owner of the companion (WS2-09)

| Function | Substrate | Notes |
|---|---|---|
| MAIA in the room | `studio/companion` | ⚠ currently 404 in production (quarantined) |
| per-turn situation | `lib/studio/companionStance.ts` → `RoomFacts` | |
| refusal / non-authority | `lib/studio/mentorDiscipline.ts` | must survive the rebuild |
| pattern inquiry | `lib/studio/patternInquiryProtocol.ts` | |

**The load-bearing fact.** `RoomFacts` today is `workTitle · workPurpose ·
workForm · workStage · materials[] · manuscriptTitle · draftChars ·
draftExcerpt` (6000 chars — **the opening only**). No structure, no revision
history, no cursor position, no prior finding. MAIA is structurally *beside* the
writing movement, not inside it. This is exactly why the founder's MAIA said
"only the front matter and the beginning of the Preface are visible to me" —
that was MAIA reporting its situation accurately, not a bug.

WS2-07 and WS2-09 change that **deliberately, with exclusion designed in** —
never by handing MAIA the whole manuscript. The honesty scaffolding that already
exists (the block states the excerpt is an excerpt; the stance forbids inventing
material not given) must survive intact.

### PUBLISH — owner of assembly (WS2-11)

| Function | Substrate | Notes |
|---|---|---|
| render / export | `[id]/render` | |
| manuscript assembly | `[id]/collections` | |
| sharing / review workflow | — | unbuilt |

### Supporting fields (WS2-10)

Goals · statistics · Notes · Research · Templates · Word Web · comments. All
unbuilt. Each surfaces **inside the mode where it is needed** — none becomes a
sixth mode. Goals and statistics land in EXPLORE; Notes and Research in WRITE;
comments in REVIEW.

### Integration (WS2-12)

Identity custody · migrations · regression suite · permissions · responsive
behaviour. The custody pins from WS2-01 (`canvasParamPin.test.ts`,
`canvasIdentity.test.ts`) and the segmentation contract (`segment.test.ts`) are
the seed of that suite and move forward unchanged.

---

## §3 — Functions that appear in more than one mode

Three, and only three. Each has one owner and one or more views:

```text
versions     owner STRUCTURE   view in WRITE
materials    owner MATERIALS   view in WRITE, view in EXPLORE
MAIA         owner MAIA        present in all five (shell region)
```

Anything else appearing twice is a duplication defect, not a design choice.

---

## §4 — What is never shown as a measurement

Binding, from `DECISIONS.md` D-003 and `DESIGN-CONTRACT.md` §4.

**Computed and showable:** word count · material count · chapter count · goal
progress against a writer-declared target · reading time · version count ·
finding count · passage count.

**Refused:** movement health % · cohesion % · "Coherence: Strong" · "High
Priority" · any score, grade, or ranking MAIA produced.

Where a reference screen shows such a number, the implementation ships **what
MAIA actually noticed, with the passage it noticed it in** — and the writer
assigns the importance. This survives every unit; it is not a WS2-08 detail.

---

## §5 — What is still missing to design the rooms themselves

1. ~~The eight reference screens.~~ **RESOLVED** — in custody at
   `docs/design/writer-studio/references/` since `1493c28c0`. WS2-00 CLOSED.
2. `studio/companion` returning 200 in production — MAIA is present in all five
   modes, so its 404 degrades all of them, not one. **Still open.**
3. **A–D of the WS2-02 hold** (`WS2-02-03-AUTHORITY-AUDIT.md`) — object model,
   MAIA relationship, provenance architecture, ontology crosswalk. Added
   2026-08-28. These do not block *specification* against this file; they block
   WS2-02 from beginning.

None of these blocks WS2-02's design system or WS2-03's shell from being
**specified** against this file. (2) blocks them from being **accepted**; (3)
blocks them from being **started**.

⚠ **This file's §2 owners are Functional Owners, not Modes.** Seven owners
against five modes is not a defect in either list — see the audit's Finding D
and the crosswalk. Do not reconcile them by deleting from one.

---

LAST UPDATED 2026-08-28
