# Authored Text-Surface Inventory — outside Press

> **Class: measurement. Governs nothing. Recommends, does not fix.** Converts ledger D‑14's
> outstanding `[V]` sweep into evidence. **No surface is classified as `.writing-surface` or
> `.press-field`** — those names belong to Press today. This inventory answers exactly one
> question per surface: *does the member author words here?*
>
> **Referent:** worktree at canonical `b6cf2be3f` + held D‑05. 1,405 `.tsx`/`.jsx` files
> under `app/**` and `components/**`, excluding `app/press/**`, tests, and node_modules.

---

## Method, and why it is narrow

The global rule in `app/globals.css` sets **both** properties:

```css
input, textarea, select { @apply text-gray-900 bg-white; }
```

A surface that inherits **both** is readable — dark text on a white field. The defect
appears only where a surface **overrides the background but not the colour**, leaving
`rgb(17,24,39)` on whatever ground the design actually uses. That is the discriminator, and
it is mechanical.

**60 of 1,405 files' text-entry surfaces match it.** Every one inherits
`color: rgb(17,24,39)` — that part is `[S]`, certain from the cascade.

**Whether that fails contrast is `[V]` per surface**, because it depends on the ground
behind it. A dark ground makes it the Press defect; a light ground makes it merely
redundant. **Contrast was not measured** — doing so requires visiting each surface
authenticated, which is a separate act. **No contrast figure in this document is claimed.**

---

## A · Member authors words here

| Surface | Own words? | Current class | Inherits global colour? | Contrast | Recommendation |
| --- | --- | --- | --- | --- | --- |
| `components/maia/field-lab/CrossingRoom.tsx:187` — *"Begin wherever you are…"* | **yes** | implicit | yes | `[V]` | measure first — strongest candidate |
| `CrossingRoom.tsx:243` — *"Say more…"* | **yes** | implicit | yes | `[V]` | measure |
| `CrossingRoom.tsx:467` — *"Name it in your own words…"* | **yes** | implicit | yes | `[V]` | measure |
| `CrossingRoom.tsx:503` — *"Name one of the threads in your own words…"* | **yes** | implicit | yes | `[V]` | measure |
| `CrossingRoom.tsx:550` — *"Name your own thread…"* | **yes** | implicit | yes | `[V]` | measure |
| `components/maia/field-lab/YourThreads.tsx:113` | likely | implicit | yes | `[V]` | measure |
| `components/maia/relational-navigation/Flows.tsx:62` | likely | implicit | yes | `[V]` | measure |
| `components/askMaia/AskMaiaAskBox.tsx:134` | **yes** | implicit | yes | `[V]` | measure |
| `components/oracle/EmbeddedMAIAChat.tsx:293` — *"Ask about your reading…"* | **yes** | implicit | yes | `[V]` | measure |
| `app/book-companion/ain/page.tsx:445` — *"What would you like to explore…"* | **yes** | implicit | yes | `[V]` | measure |
| `components/astrology/ChineseAstrologyDiscussion.tsx:231` | **yes** | implicit | yes | `[V]` | measure |
| `components/invites/InviteManager.tsx:265` — *"A note to remind yourself…"* | **yes** | implicit | yes | `[V]` | measure |
| `components/feedback/FeedbackSheet.tsx:319` | **yes** | implicit | yes | `[V]` | measure |
| `components/voice/VoiceMaskListeningTest.tsx:296` | **yes** | implicit | yes | `[V]` | measure |
| `app/partner-welcome/page.tsx:286` — project description | **yes** | implicit | yes | `[V]` | measure |

**Note the five CrossingRoom entries.** Three of them say *"in your own words"* in their own
placeholder text. Whatever vocabulary the platform eventually adopts, these are the clearest
non-Press instances of a member authoring meaning — the Field Lab asks people to name their
own experience, and the naming field is the act.

## B · Form fields — no member-authored words

Excluded per the founder's scope: passwords · usernames · emails · passkeys · invitation
codes · display names · search boxes (`"Search conversations…"`, `"Search transcripts…"`) ·
custom voice names · birth data. **41 surfaces.** No recommendation; the global rule is
correct for them, and the background override is a visual choice, not a defect.

## C · One structural finding

**`components/ui/input.tsx:9`** is a shared primitive. It overrides the background and
declares no colour, so **every consumer inherits the condition** — it is neither an authored
surface nor a form field, it is the substrate under both. It is the only entry here whose
treatment would propagate. **Named, not touched.**

---

## What this establishes, and what it does not

**Establishes `[E]`:** a second family of consumers exists outside Press where members
author words into surfaces that inherit the global form colour. **The Press distinction has
a second consumer.**

**Does not establish:** that the Press vocabulary generalizes. Under *promote abstractions
only after observing a second consumer*, the second consumer is now observed — which makes
the question askable, not answered. Whether `.writing-surface` / `.press-field` become
platform vocabulary, or whether the platform needs its own, is a governance question that
**this document does not open**.

**Next honest step, if wanted:** measure contrast on the five CrossingRoom surfaces. They
are the highest-value sample — member-authored by their own copy, on a MAIA ground rather
than a Press ground.
