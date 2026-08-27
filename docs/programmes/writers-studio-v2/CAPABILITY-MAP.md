# WRITERS-STUDIO-V2 — Capability Map

What already exists. A WS2 unit **moves** these into the new architecture. It
does not re-implement them, and it does not lose them.

Resolved from the repository on 2026-08-27. Re-resolve rather than trust this
list if it looks stale.

---

## Live API substrate

```text
app/api/sovereign/manuscripts/route.ts                       list · create
app/api/sovereign/manuscripts/blank/route.ts                 new empty manuscript
app/api/sovereign/manuscripts/ingest/route.ts                file-backed + pasted intake
app/api/sovereign/manuscripts/[id]/route.ts                  read one
app/api/sovereign/manuscripts/[id]/title/route.ts            rename
app/api/sovereign/manuscripts/[id]/draft/route.ts            working draft read/write
app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts  version list
app/api/sovereign/manuscripts/[id]/draft/revisions/[revision] restore one version
app/api/sovereign/manuscripts/[id]/candidates/route.ts       find/replace candidates
app/api/sovereign/manuscripts/[id]/keeps/route.ts            accepted changes
app/api/sovereign/manuscripts/[id]/collections/route.ts      collections
app/api/sovereign/manuscripts/[id]/render/route.ts           render/export path

app/api/sovereign/studio/companion/route.ts                  MAIA in the room
app/api/sovereign/studio/materials/route.ts                  materials list/create
app/api/sovereign/studio/materials/[id]/route.ts             one material
app/api/sovereign/studio/materials/[id]/file/route.ts        material file bytes
app/api/sovereign/studio/review/route.ts                     developmental review
app/api/sovereign/studio/review/[id]/advance/route.ts        review progression
app/api/sovereign/studio/review/finding/[id]/route.ts        finding disposition
```

## Live surfaces (the room being replaced)

```text
app/writers-studio/page.tsx           entry
app/writers-studio/HomeView.tsx       work home (precursor to WS2-05)
app/writers-studio/canvas/page.tsx    the room — owns manuscript selection
        Worktable.tsx                 layout host
        WritingSurface.tsx            plain <textarea>. No rich text yet — WS2-04
        Companion.tsx                 MAIA region — WS2-09
        MaterialsDrawer.tsx           materials — WS2-06
        StructureRail.tsx             structure — WS2-07
        VersionsPanel.tsx             versions
        DevelopmentalReview.tsx       review — WS2-08
        WorkDrawer.tsx                work context
```

## Intelligence substrate

```text
lib/studio/companionStance.ts      RoomFacts — everything MAIA receives per turn
lib/studio/reviewLens.ts           reader lenses
lib/studio/developmental/          developmental review engine
lib/studio/materials/              materials model
lib/studio/manuscriptTools.ts      find/replace, candidates, keeps
lib/studio/diff.ts                 version diffing
lib/studio/mentorDiscipline.ts     refusal / non-authority discipline
lib/studio/patternInquiryProtocol.ts
```

### What MAIA actually receives — load-bearing for WS2-07 and WS2-09

`RoomFacts` is the whole of MAIA's per-turn situation:

```ts
workTitle · workPurpose · workForm · workStage
materials[] { label, kind, sentence }
manuscriptTitle · draftChars
draftExcerpt        // DRAFT_EXCERPT_CHARS = 6000 — the opening only
```

There is **no structure, no revision history, no current cursor position, and no
prior review finding** in that object. MAIA is structurally *beside* the writing
movement, not inside it. This is provable from code without walking the room,
and it is the substrate WS2-07 and WS2-09 have to change — deliberately, with
exclusion designed in, not by handing MAIA the whole manuscript.

The honesty scaffolding already exists and must survive:

- the context block states the excerpt is an excerpt
- the stance forbids inventing material not present in what was given

## Data

```text
member_manuscripts          work/manuscript identity
manuscript_working_drafts   live draft content
manuscript_sections         sections/chapters
living_work_materials       materials + provenance
```

PostgreSQL, self-hosted. Never Supabase.

## Known gaps (not defects — unbuilt)

- no rich-text editor; both writing surfaces are plain `<textarea>`
- no chapter-level editing in the room (sections exist in data)
- no goals / statistics surface
- no publish/export room (a render route exists)
- no notes / research / templates / word web / comments surfaces
