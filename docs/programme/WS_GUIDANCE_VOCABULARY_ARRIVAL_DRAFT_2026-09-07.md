# Writer's Studio vocabulary — ARRIVAL group

## ⚠ PROVISIONAL · FOUNDER REVIEW REQUIRED · NOT CANON · DESIGN ONLY · NO BUILD

Deliberately **separate** from `WS_GUIDANCE_CONTRACT_2026-09-07.md` so provisional
wording cannot become doctrine by sitting inside an accepted contract.

**Scope: four terms.** Work · Source · Working Draft · Section. Nothing else.
This is a method test — does source-promotion produce language worth keeping —
before it is scaled to the remaining thirteen.

## How to read this

```text
▸ PROMOTED       meaning inherited from source, with file:line provenance
⚠ INVENTED GAP   the codebase does not supply this — founder language required
```

**The rule that governs every entry:** the vocabulary defines MEANING. Runtime
state defines availability, health and knowledge (contract §1, §1a). No entry
below says "you have", "you can start one here", or anything else a runtime must
answer.

## A finding, before the entries

The existing language is **excellent and architectural**. It was written for
engineers holding a constitutional line, not for a writer arriving. So the
promotion splits in a way worth naming:

```text
MEANING          almost always inheritable — the doctrine is precise
MEMBER PHRASING  almost always invented — register, not substance
```

Every short form below is therefore ⚠ in *phrasing* even where ▸ in *meaning*.
That is the honest report on the method, and the reason founder review is
required rather than optional.

---

## Work

**▸ PROMOTED — meaning** · `app/writers-studio/workContext.ts:6-8`

> *"A Work becomes the Studio's current context only through a member's own
> declaration — a living_work_expressions row they created placing this
> manuscript in that Work. Nothing here infers, ranks, or picks."*

`workContext.ts:11-17` — three cases kept as three: no declaring Work (the
manuscript is on the table and that is all the room knows); one (explicit
persistent context); two or more (ambiguous, and correct — never guessed).

**⚠ INVENTED GAP — short form** *(phrasing mine; meaning promoted)*

> A Work is the larger thing your writing belongs to. You declare it yourself —
> the Studio never decides that a piece of writing belongs to a Work.

**⚠ INVENTED GAP — full form** *(phrasing mine)*

> A Work is the identity you give something you are making — a book, a
> collection, a project. A manuscript can sit on the table without belonging to
> any Work. When you declare one, the Studio carries that context with you.
> A manuscript may belong to more than one Work by design; where that is true,
> the Studio says so rather than choosing for you.

**⚠ INVENTED GAP — what happens** — *no source language found.* The
consequences of declaring a Work (what changes for the writer) are architectural
in source and never stated in member terms. **Founder language required.**

---

## Source

**▸ PROMOTED — meaning** · `app/api/sovereign/manuscripts/ingest/route.ts:19-23`

> *"the artifact's exact bytes and the extraction they produced are placed in
> custody HERE, before the member can edit and before any segmentation runs."*

`lib/manuscript/ingest/parseUpload.ts:10` — *"The author's words, unchanged. We
never rewrite, summarize, or add."*

`lib/manuscript/source/arrivals.ts:18-20` — bytes to the vault, then the row, so
*"'the bytes exist' and 'a row says they do' cannot drift apart silently."*

**⚠ INVENTED GAP — short form** *(phrasing mine; meaning promoted)*

> Source is what arrived — the file you brought in, kept exactly as it was.
> Nothing you do later changes it.

**⚠ INVENTED GAP — full form** *(phrasing mine)*

> When you bring a file into the Studio, its exact bytes and the text read out of
> them are kept as the record of what arrived. That record is never rewritten.
> It exists so that what you started from stays knowable, however far your
> writing travels from it.

---

## Working Draft

**▸ PROMOTED — meaning** · `lib/manuscript/sections/seedInvariant.ts:4-8`

> *"Making a Working Draft section-addressable is a REPRESENTATION change, not
> an edit. The writer's characters must survive it exactly."*

`lib/manuscript/development/preparation.ts:9` establishes the distinction from
Source directly: *"a Work can hold 185 Source sections while its draft holds"* a
different count — two namespaces, not one.

**⚠ INVENTED GAP — short form** *(phrasing mine; meaning promoted)*

> The Working Draft is where you write. It starts from Source but is yours to
> change; Source stays as it arrived.

**⚠ INVENTED GAP — full form** *(phrasing mine)*

> Your Working Draft is the living text — the one you edit. It is initialized
> from Source and then goes its own way. The two are counted separately on
> purpose: the Studio can tell you what has changed since you began precisely
> because it never conflates them. Changing how the draft is organized is not
> the same as changing what it says, and the Studio holds that line.

---

## Section

**▸ PROMOTED — meaning** · `lib/manuscript/ingest/segment.ts:8-12`

> *"segmentation is MECHANICAL ONLY… The system never segments semantically and
> never invents headings. Headings come from the document's own characters. Body
> text is carried verbatim (no trim, no normalization). The member confirms or
> redraws the cuts before anything is saved."*

**⚠ INVENTED GAP — short form** *(phrasing mine; meaning promoted)*

> A section is one addressable piece of your writing. The cuts come from your own
> headings — the Studio proposes, you confirm.

**⚠ INVENTED GAP — full form** *(phrasing mine)*

> Sections are how the Studio addresses parts of your writing so you and MAIA can
> point at the same place. They are cut mechanically from headings already in
> your text — nothing is inferred about meaning, and no heading is invented. You
> confirm or redraw the cuts before anything is saved.

---

## Method assessment

**Does source-promotion produce language worth keeping?** Partly, and the split
is clean:

```text
WORKED WELL   meaning · doctrine · what the system refuses to do
              — the source is unusually precise about its own limits
DID NOT       member register · consequence ("what happens if I do")
              — the codebase states obligations, not experiences
```

`Work → what happens` is the clearest gap: **no source language exists for it at
all.** Not a phrasing problem — the Studio has never said, anywhere, what
declaring a Work does for the writer.

Recommendation: promote meaning, have the founder author register and
consequence. Do not scale to the remaining thirteen until this group is ruled on.
