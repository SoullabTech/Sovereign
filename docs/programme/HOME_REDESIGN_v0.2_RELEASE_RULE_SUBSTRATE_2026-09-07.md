# Writer's Studio Home v0.2 — Revised Release Rule · Substrate Census

**Date:** 2026-09-07 · **Lane:** HOME-REDESIGN-01 · **Branch:** `build/ws-home-redesign-slice-a`
**Evidence class:** `L` (laboratory — source read, no production run behind any claim here)

---

## 0. The founder's revised release rule (2026-09-07)

> *No Home v0.2 deployment until themes, Work visual identity, From Your Work, and History
> are real — not merely documented. Soundtrack integration can wait. Those four cannot.*

Received on witnessing the deployed Home. The founder's reading of that screenshot:

> *It is still basically the old product with a prettier hero.*

That reading is correct and the prior slice plan did not meet it. **Slice A (`ea3a746ac`) is
therefore not v0.2** and must not be deployed as such. It is the field's floor, not the room.

## 1. What the screenshot established (F, direct)

Four facts, all confirmed in source:

| Observed | Confirmed in source | Status |
|---|---|---|
| Generic stock hero represents every writer's world | `HomeView.tsx` `<Hero>` — one fixed `/writers-studio-hero.jpg` | Slice B |
| One warm brown palette, no choice | `pressTheme.ts` — a single frozen `as const` object | **BLOCKING** |
| `No writing yet · written August 14` on a card | `workMeta` read `lastWrittenAt` without requiring characters | **REPAIRED** `ea3a746ac` |
| Continuity reduced to title · pages · `lastWrittenAt` | `CurrentManuscript` carries exactly those and no words | **BLOCKING** |

A fifth, not raised but visible: the hero title reads `ELEMENTAL_ALCHEMY` — an upload
**filename** standing in for a book's name. Recorded, not repaired; title provenance is a
separate finding from this lane.

## 2. Substrate census — the four blocking requirements

### 2.1 FROM YOUR WORK — ✅ **the data exists; the door does not**

`manuscript_keeps` is exactly what this section needs and could not be better shaped for it:

- `verbatim_text` — the member's own characters, stored un-trimmed
- written **only** by an explicit member gesture; the route's doctrine bars any detector,
  summarizer or background job from calling it
- the server re-verifies the passage exists verbatim in that member's own section before
  writing — *keeps cannot originate text*
- joins to `manuscript_sections` for `heading` + `position`, so a line can say where it lives

This is "things you marked" with provenance already enforced at the write boundary. **No
inference is required and none is possible.**

⛔ **The blocker is a read door, not data.** Keeps are readable only at
`GET /api/sovereign/manuscripts/[id]` — one manuscript at a time. The Home knows `keepCount`
(a number) and cannot reach a single word. This is the sixth instance of the lane's recurring
pattern: **the command exists, the door doesn't.**

**Build:** `GET /api/sovereign/keeps` — the member's marked lines across all their manuscripts
(`verbatimText · manuscriptId · manuscriptTitle · heading · createdAt`), member-scoped by
credential. Small, additive, no migration.

⛔ **Reflection Gold Lines are NOT this.** The founder's instruction stands: *borrow the
grammar, do not pretend Reflection capsules are automatically part of a Work.* Capsules are a
different custody object. Keeps are already inside the Work.

⛔ **Section body text is available and is the wrong source.** Picking a line out of
`manuscript_sections.body` would be **the system choosing what is beautiful in the member's
book** — a curation act with no member gesture beneath it. Keeps carry the gesture. If the
field ever draws on unmarked prose, that is a separate ruling, not an implementation detail.

### 2.2 HISTORY — ✅ **every act named in the founder's sketch is already recorded**

| Founder's line | Record | Inference required |
|---|---|---|
| `returned to Elemental Alchemy` | `lastWrittenAt` (API-gated to `updated_at > created_at`) | none |
| `kept a version` | `working_draft_revisions` — `revision_number · note · created_at`; `note` is member-authored | none |
| `worked in Chapter 4` | revision + `section_partition` (WS2-07A section addressability) | none |
| *(available, unlisted)* brought writing into the Studio | `manuscript_source_arrivals` (custody) | none |
| *(available, unlisted)* made this a Work / placed a material | `living_works` expressions + materials `declaredAt` | none |

**The founder's constraint — *only acts we can genuinely establish appear* — is satisfiable
today with zero inferred process state.** No "you were restructuring."

**Build:** a cross-Work act reader + a HISTORY section. Additive, no migration.
Open design question for founder: **grouping by day is a rendering choice; is a day with three
acts allowed to collapse?** Collapsing invents a summary. Recommend: list acts, group by date
header, never summarize a day.

### 2.3 ATMOSPHERE — ⛔ **no substrate whatsoever**

`pressTheme.ts` is one frozen palette. There is no atmosphere concept anywhere in the Studio,
and the file's own header records that its values are **deliberately duplicated** into
`app/press/manuscript/page.tsx` and `WorkingDraftEditor.tsx` rather than imported.

That duplication is the real cost. *"The atmosphere should carry through the entire Studio,
not just Home"* means those three copies must first become one source. Persisting a choice is
easy; **propagating it is the work.**

Persistence: `member_settings` exists but is a MAIA-interaction table (voice, memory depth,
notifications). A Studio atmosphere does not belong in it. Recommend a Studio-scoped row.

**Build:** (a) collapse three palettes into one authored set — `Atelier · Night Study · Forest ·
Cloud · Midnight`, no raw colour picker; (b) member choice + persistence + migration;
(c) propagation through shell, Home, Canvas, Manuscript Room. **This is the largest of the
four and the only one requiring a migration.**

### 2.4 WORK VISUAL IDENTITY — ⛔ **no substrate; needs a founder ruling before code**

No image storage exists for a Work. Two precedents, neither a fit as-is: `members.avatar_url`
is a bare TEXT URL (no upload), and `app/api/studio/files/` is Co-Lab file custody, which
carries its own scoped-surface obligations and the **Co-Lab Release Gate**.

**Founder ruling needed before implementation:** does a Work cover live in Co-Lab file
custody, or does a Work own its own image? They have different deletion, sharing and gate
consequences. A cover placed in Co-Lab custody inherits Co-Lab's boundary rules; a Work-owned
image needs its own storage, its own delete cascade, and its own answer to *what happens to
the image when the Work is deleted.*

⛔ **No MAIA-generated cover. No inferred mood.** Standing.

## 3. Recommended sequencing (highest leverage first)

1. **FROM YOUR WORK** — the founder's own read: *"the part I think changes the room most."*
   It is also the cheapest of the four (one read route, no migration) and the only one whose
   provenance discipline is **already enforced at the write boundary**. Ship first.
2. **HISTORY** — second cheapest, no migration, and it makes the Work's life visible without
   any interpretive claim.
3. **ATMOSPHERE** — largest, needs a migration, and the palette de-duplication is a
   prerequisite that pays for itself across the whole Studio.
4. **WORK VISUAL IDENTITY** — blocked on a founder ruling (§2.4), not on code.

1 and 2 are independent of 3 and 4 and can land while the atmosphere ruling and the cover
custody ruling are still open.

## 4. Standing

- `ea3a746ac` — Slice A committed on `build/ws-home-redesign-slice-a`. Typecheck green
  (230 errors · baseline 239 · 0 regressions), 314 Studio tests pass, no-supabase clean.
- ⛔ **NOT DEPLOYED. NOT v0.2.** The revised release rule holds.
- ⛔ Founder rulings owed: Work-cover custody (§2.4); HISTORY day-collapse (§2.2).
- Soundtrack: deferred by founder act.
