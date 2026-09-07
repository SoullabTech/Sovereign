# Writer's Studio vocabulary — ARRIVAL group

## ⚠ PROVISIONAL · FOUNDER REVIEW REQUIRED · NOT CANON · DESIGN ONLY · NO BUILD

Deliberately **separate** from `WS_GUIDANCE_CONTRACT_2026-09-07.md` so provisional
wording cannot become doctrine by sitting inside an accepted contract.

**Scope: four terms.** Work · Source · Working Draft · Section. Nothing else.
This is a method test — does source-promotion produce language worth keeping —
before it is scaled to the remaining thirteen.

## How to read this

```text
▸ SOURCE MEANING            derived from source, with file:line provenance
◇ FOUNDER REGISTER NEEDED   how we say it to a writer — founder-authored/ratified
△ CONSEQUENCE RULING NEEDED what it changes for the writer — behavior derived,
                            then a founder ruling on which parts matter
⚠ GAP                       actual missing doctrine or unresolved behavior
```

**Marker revision (founder, 2026-09-07).** The first pass marked member phrasing
`⚠ INVENTED GAP`. That did its diagnostic job but mislabels the finding: register
is not a defect in the source. **Code should not be expected to contain finished
member prose.** `⚠` is now reserved for genuinely missing doctrine.

**The rule that governs every entry:** the vocabulary defines MEANING. Runtime
state defines availability, health and knowledge (contract §1, §1a). No entry
below says "you have", "you can start one here", or anything else a runtime must
answer.

## The template (founder ruling, 2026-09-07)

Three authorities hide inside one vocabulary entry, and they must not be merged:

```text
1  MEANING           what the concept is          → source-derived where possible
2  MEMBER REGISTER   how we say it to a writer    → founder-authored / ratified
3  CONSEQUENCE       what it changes or enables   → behavior derived from source,
                                                    then a founder ruling on which
                                                    consequences matter to the writer
```

Availability, health and current state sit **outside all three** — runtime-derived
only (contract §1, §1a).

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

**▸ SOURCE MEANING** · `app/writers-studio/workContext.ts:6-8`

> *"A Work becomes the Studio's current context only through a member's own
> declaration… Nothing here infers, ranks, or picks."*

`workContext.ts:11-17` — three cases kept as three: none declaring (the manuscript
is on the table and that is all the room knows); one (explicit persistent
context); two or more (ambiguous, and correct — never guessed).

**◇ FOUNDER REGISTER — recommended, awaiting Kelly's ratification**

> **Short** — A Work is the larger project you declare this writing as part of.
> The Studio never decides that relationship for you.

> **Full** — A Work gives your writing a project context — a book, collection, or
> other work you name. Declaring one lets the Studio keep Work-dependent
> conversations and materials situated to the project you chose. It does not
> change your manuscript or decide what belongs together.

*Why not "the larger thing your writing belongs to" (the first pass): **belongs
to** can sound ontologically discovered. The writer **declares** the relationship.*

**△ CONSEQUENCE — founder ruling recorded above.**

---

## Source

**▸ SOURCE MEANING** · `app/api/sovereign/manuscripts/ingest/route.ts:19-23`

> *"the artifact's exact bytes and the extraction they produced are placed in
> custody HERE, before the member can edit and before any segmentation runs."*

`lib/manuscript/ingest/parseUpload.ts:10` — *"The author's words, unchanged. We
never rewrite, summarize, or add."* · `lib/manuscript/source/arrivals.ts:18-20` —
bytes to the vault, then the row, so *"'the bytes exist' and 'a row says they do'
cannot drift apart silently."*

**◇ FOUNDER REGISTER — recommended, awaiting ratification**

> **Short** — Source is the writing as it arrived in the Studio. It stays
> unchanged as the record of what you began with.

> **Full** — Source preserves what arrived before you began changing it in the
> Studio. The original material and the text read from it remain a stable record
> of your starting point, while your Working Draft can continue to change.

*Broadened from the first pass's "file": the invariant is **what arrived**, not a
particular ingestion mechanism.*

---

## Working Draft

**▸ SOURCE MEANING** · `lib/manuscript/sections/seedInvariant.ts:4-8`

> *"Making a Working Draft section-addressable is a REPRESENTATION change, not an
> edit. The writer's characters must survive it exactly."*

`lib/manuscript/development/preparation.ts:9` — a Work can hold 185 Source
sections while its draft holds a different count: two namespaces, not one.

**◇ FOUNDER REGISTER — recommended, awaiting ratification**

> **Short** — Your Working Draft is where your writing changes. It begins from
> Source, while Source stays as the record of what arrived.

> **Full** — The Working Draft is the living version of your manuscript — the text
> you edit and develop. It begins from Source but then has its own history. That
> separation lets the Studio distinguish what arrived from what you later changed
> without treating organization changes as changes to your words.

*"Living **version**" over "living text": it sets up **Keep a version** later
without implying a mystical category.*

---

## Section

**▸ SOURCE MEANING** · `lib/manuscript/ingest/segment.ts:8-12`

> *"segmentation is MECHANICAL ONLY… The system never segments semantically and
> never invents headings. Headings come from the document's own characters. Body
> text is carried verbatim… The member confirms or redraws the cuts before
> anything is saved."*

**◇ FOUNDER REGISTER — recommended, awaiting ratification**

> **Short** — A section is one addressable part of your writing. The Studio
> proposes boundaries from heading-like lines already in your text; you confirm or
> redraw them.

> **Full** — Sections let you and MAIA refer to the same parts of a manuscript.
> The Studio proposes them mechanically from structural signals already present in
> your writing — it does not invent headings or decide what a passage means. You
> confirm or redraw the boundaries before they are saved.

**⚠ The first pass was wrong here, materially.** It said *"the cuts come from your
own headings"* — a claim of writer intent the segmenter cannot support. The
regex admits Markdown headings, `Chapter N`, **and ALL-CAPS lines**, and an
ALL-CAPS line is a mechanical boundary that may not be a heading the writer meant.
`WS_LAUNCH_CENSUS` proved it: four contents-page entries became sections in a real
book. **"Structural signals already present"** is what the code can stand behind;
"your own headings" is not.

## Method assessment

**Does source-promotion produce language worth keeping?** Partly, and the split
is clean:

```text
WORKED WELL   meaning · doctrine · what the system refuses to do
              — the source is unusually precise about its own limits
DID NOT       member register · consequence ("what happens if I do")
              — the codebase states obligations, not experiences
```

**Correction to this draft's own finding (founder, 2026-09-07).** The first pass
called `Work → what happens` a hole in doctrine. It is not. Source already
establishes that declaring a Work creates explicit persistent context and stops
the Studio guessing which project a manuscript belongs to. The hole is in
**member-level consequence language**, and the open question is narrower and
answerable by ruling rather than by more searching:

> *Which consequences of declaring a Work matter enough to tell the writer?*

**Founder ruling:** *Declaring a Work tells the Studio what larger project this
writing belongs with, so Work-dependent parts of the Studio can stay situated to
the project the writer named. It does not alter the writing or decide anything
about it.*

## Method ruling

```text
ARRIVAL METHOD             ACCEPTED
source-derived meaning     SCALE
agent-authored register    DO NOT SCALE AS CANON
founder-ratified register  REQUIRED
consequence                derive behavior first, then founder decides what
                           matters to the member
availability / health      runtime-derived only
knowledge                  PRESENT / ABSENT / UNKNOWN
```

Next group under the revised template: **Structure · Materials · Keep a version ·
Export** — after these four are ratified, not before.
