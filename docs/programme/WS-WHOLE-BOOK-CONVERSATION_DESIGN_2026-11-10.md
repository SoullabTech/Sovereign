# Whole-book conversation — MAIA carries her complete earlier readings (DESIGN, for founder review)

```
STATUS:     APPROVED (founder, 2026-11-10: "Approve as recommended") — D1 (c), D2 200,000 chars,
            D3 partial readings labelled and only when no complete one, D4 separate. Implementation
            per §6 on feature/ws-whole-book-conversation-20261110. Merge and deploy remain separate
            founder decisions under HOLD #1938.
OWNER:      Writer's Studio #1800 · governed by #1982 · release HOLD #1938 in force
CANONICAL:  c3798a420 (clean-main-no-secrets, includes #2210)
ORIGIN:     Elemental Alchemy acceptance walk, 2026-11-10 (walk record §10i)
```

## 0. The ruling this implements

**Founder, 2026-11-10.** Asked: *"For whole-book questions, should MAIA draw on her complete
earlier readings?"* Answer: **"Yes, design it"**.

The principle as put to the founder:

> When the writer asks about the whole book in the Work conversation, MAIA draws on her
> complete earlier whole-book readings (every observation, in full), and exact text is brought
> in only for chapters the writer names.

This **extends** G6 (founder ruling 2026-11-09, "Yes, on those terms": readings are carried on
the consent given when they were commissioned). It does not replace G6, and every G6 term still
holds (§3).

## 1. What the walk showed (evidence, not hypothesis)

On Work `55742458`, Develop mode, with a whole-Work standing grant:

| Turn | What reached MAIA | Why |
|---|---|---|
| W3 "what is this book fundamentally about… ground it in specific chapters" | **1 section** (the title-only opener) + 8 of 26 observations of one reading, several cut mid-sentence | the question matched none of `workReadScope.ts`'s fixed whole-Work phrases, so selection fell to the locus; `carriedReadings.ts` carried at most 3 readings × 8 observations × 600 chars |
| W3b "looking across the whole book…" | 40 sections (≈60k chars) | the phrase matched, but `READ_CHAR_BUDGET = 60_000` and `MAX_READ_SECTIONS = 40` cover about a sixth of a 386k-char book |

**Both answers were also cut off by the token ceiling.** That is fixed separately in #2210
(merged; not yet deployed).

**Consequence.** Even with complete answers, a whole-book question gets either the opener or
a sixth of the book, plus a fragment of MAIA's own reading. MAIA reported this honestly both
times. That is honest, but it is not knowledge of the book.

## 2. The design

### 2a. Two sources, kept distinct (no change in kind)

- **Her account:** completed readings the writer commissioned, carried as observations. On a
  whole-book question this becomes **complete**.
- **The text:** saved section text, under the standing permission, with a receipt per
  crossing. **Unchanged:** host-selected and bounded. Named chapters still bring their text.

A whole-book question does **not** try to load the whole book as text. It loads the whole
*account*, plus text only for what the writer names or is standing in.

### 2b. Whole-book carry mode (`carriedReadings.ts`)

When the turn's scope is the whole Work (§2c):

1. **Which readings.** The latest reading **per lens** (G6, unchanged) among readings with
   **complete body coverage** of the current topology. Every current section is `body` in
   `coverage`.
2. **Partial readings** (for example the Sept 2026 readings of `55742458` that read 17–24 of
   262 sections in body) are **included and labelled with their exact coverage** ("read 24 of
   262 sections in full"), and **only when no complete reading exists for that lens**.
   *Recommended (D3).*
3. **Every observation, in full.** There is no 8-per-reading cap and no 600-char cut. Each
   observation keeps its `doesNotEstablish`, and gains the **headings** of the sections its
   evidence refs point to, so she can say where in the book she saw it. Headings only; ⛔ no
   quoted text from the refs.
4. **No lens cap of 3.** Up to the eight lenses the reader has.
5. **Ceiling: `WHOLE_BOOK_CARRY_CHARS`**, recommended **200,000 chars** (about 50k tokens).
   The full eight-lens set on the 55-section Work is about 134k chars.
   - Over the ceiling, readings are dropped **whole**, oldest first, never cut mid-observation.
   - She is told exactly which were left out (the existing "you were given N of M" line).
   - ⛔ Never a silent drop.
6. **Staleness, unchanged and per chapter.** Each chapter is marked changed, unchanged or
   cannot-tell. When a reading's revision is older than the current draft, the header says so
   plainly.
7. **Dismissed observations stay out** (G6 × D5, unchanged).

### 2c. When is the turn's scope "the whole Work"?

This is the open decision (D1). The walk proved that phrase matching misses ordinary
whole-book questions.

- **(a) Explicit, writer-declared (recommended).** A visible control in the Work conversation:
  **"About: where I am · the whole book"**. Default is *where I am*. It lasts for the thread
  until changed, and is shown on every answer's "what she read" line.
  - This follows the project's law that scope is **member-declared, never inferred**.
  - It also makes the scope a witnessable fact in the record.
- **(b) Broader phrase detection.** Widen `WHOLE_WORK` to cover phrases like "this book" or
  "fundamentally about". It is cheap, but it is inference, it will keep missing phrasings, and
  it is fragile. Acceptable only as a convenience *that offers* the whole-book scope ("Ask
  about the whole book?"), never one that switches it silently.
- **(c) Both:** (a) is the authority, (b) only offers.

**Recommendation: (c).** The control decides. The phrase list may suggest flipping it, and
never flips it silently.

### 2d. The prompt (`carriedReadingsSays`)

- The header, in whole-book mode: *"Your complete account of the whole book, from the readings
  the writer commissioned. It is your account, it may be wrong, and it is not the text."*
- It lists every lens with its date, revision, coverage ("all 55 sections" / "24 of 262") and
  observation count.
- **Instruction, added:** when you answer about the whole book, say which reading or readings
  you are drawing on. Where an answer needs the words of a passage, ask the writer to point you
  to it, or use the text you were given this turn. Never present an earlier observation as
  something you have just re-read.
- The existing guards stay: a reading never grounds a quotation (`withoutCarriedReadings`), and
  it is not the writer's view.

### 2e. Cost and latency (owed to the founder, not hidden)

- **Input per whole-book turn:** about 35–50k tokens of carried account, against about 15k
  today. On `claude-opus-5` at $5 per million input tokens that is roughly **$0.20–0.25 a turn**
  before caching.
- **Prompt caching:** the carried block is identical across turns of a thread on the same
  revision, so it is the natural cache candidate. That cuts repeat cost by about 90% on the
  cached part. It goes in **as a separate, measured step**, not in this change.
- **Latency:** larger input and answers up to 16k tokens mean slower turns. The walk already
  measured about 37s per answer. The **iOS native 30-second cap** (`lib/http/apiBase.ts:30`)
  already cuts these off, and whole-book turns will make that worse. **D4.**

## 3. What does NOT change

- G6 terms: the account is carried on the commissioning consent; it never supplies chapter text;
  **Sanctuary carries nothing**; latest per lens, never "the latest reading".
- T11: a conversational read is not Editorial Reading coverage, and carrying the account
  discharges **no** `DEVELOPMENTAL_NON_CONCLUSIONS`. `author-intent` and `reader-effect` stay
  permanent.
- Text crossings: host-selected, bounded and receipted, exactly as now.
- Quote fidelity: readings never ground a quotation of the writing.
- The convergence ruling: observations are unranked and in manuscript order. Whole-book mode
  orders them by lens, then by `position`, ⛔ never by importance.

## 4. Laws and defeat candidates (lethality first, before implementation)

Write the suite first. Build one deliberately wrong candidate per law and prove each one dies.
Only then implement. Fictional manuscripts only.

| # | Law | Defeat candidate (must die) |
|---|---|---|
| WB1 | Whole-book scope carries **every** non-dismissed observation of each selected reading | the old 8-per-reading cap |
| WB2 | No observation text is shortened | the 600-char cut |
| WB3 | A complete reading is preferred over a partial one for the same lens; a partial one is labelled with exact coverage | latest-wins regardless of coverage, or a partial reading presented as whole |
| WB4 | Over the ceiling, whole readings drop oldest-first and the drop is stated to MAIA | cutting mid-observation, or dropping silently |
| WB5 | Chapter-scoped turns behave exactly as today | always carrying everything |
| WB6 | Whole-book scope is set only by the writer's control; a phrase can only *offer* it | phrase detection switching scope silently |
| WB7 | The scope is recorded on the answer's provenance and shown in "what she read" | scope applied but not recorded |
| WB8 | Readings never ground a quotation (A2 unchanged) | the carried block counted among quote sources |
| WB9 | Sanctuary carries nothing; dismissed observations stay out | carry in Sanctuary, or ignore set-aside |
| WB10 | Stale chapters are flagged; a reading from an older revision says so in its header | no staleness in whole-book mode |

**Founder-witness only** (UNKNOWN until walked):
- whether whole-book answers feel like an editor who knows the book;
- whether naming "which reading" reads as trust or as machinery.

## 5. Decisions owed (one each, with a recommendation)

- **D1.** How whole-book scope is declared. **Recommend (c):** writer control decides; phrases
  only offer.
- **D2.** Ceiling for the carried account. **Recommend 200,000 chars**, with caching as a later
  measured step.
- **D3.** Partial-coverage readings in whole-book mode. **Recommend:** include them labelled,
  only when no complete reading exists for that lens.
- **D4.** iOS's 30s native timeout on Ask turns. **Recommend** a separate, small change: a
  route-specific longer timeout for the Ask call on native, with the existing labelled-timeout
  message. ⛔ Not part of this change.

## 6. Order of work, after approval

1. The suite (WB1–WB10) with defeat candidates, proven lethal.
2. The `carriedReadings.ts` whole-book mode, and the `carriedReadingsSays` wording.
3. The scope control in `WorkConversation.tsx`, plus the scope on provenance.
4. Route walk on a disposable migrated database: a fictional 3-chapter Work with two complete
   readings.
5. The founder's acceptance walk resumes after deploy, under HOLD #1938, on `55742458`, ideally
   after a fresh whole-Work editorial pass so complete readings exist for it.

## 6a. Implementation evidence (2026-11-10, branch `feature/ws-whole-book-conversation-20261110`)

**Built:**
- `carriedReadings.ts`: `selectCarried`, `buildCarriedSet`, `WHOLE_BOOK_CARRY_CHARS = 200_000`. The loader now uses them.
- `askReader.ts`: the whole-book wording, with the same header and end markers so that
  `withoutCarriedReadings` still strips it; `carryScope` on the provenance.
- The route: `carryScope` comes **only** from `body.carryScope === 'whole_book'`; it is recorded in
  the answer's provenance and returned.
- `askClient.ts` sends it.
- `WorkConversation.tsx`: the **"About: where I am · the whole book"** control. A matching phrase
  shows an **offer** ("Ask about the whole book?") and never switches the scope. State is held in
  the component only: this surface's existing law forbids browser storage, so the scope resets to
  "where I am" when the conversation is reopened.

**Laws:** `lib/manuscript/ask/__tests__/wholeBookCarry.test.ts`, **15/15 pass.**

**Lethality:** every defeat candidate fails its named law:

| Candidate | Wrong implementation | Result |
|---|---|---|
| DC-WB1 | 8-per-reading cap | killed |
| DC-WB2 | 600-char cut | killed |
| DC-WB3 | latest-wins regardless of coverage | killed |
| DC-WB4 | drop newest instead of oldest | killed |
| DC-WB4b | silent drop | killed |
| DC-WB5 | "here" loses its limits | killed |
| DC-WB6 | scope inferred from the question | killed |
| DC-WB7 | scope not saved in provenance | killed |
| DC-WB8 | block not stripped from quote grounding | killed |
| DC-WB9 | dismissed observations carried | killed |
| DC-WB10 | older-revision line removed | killed |

⭐ **DC-WB7 first SURVIVED.** The test matched the scope in the response JSON as well as in the
provenance. The test was repaired, not the code: it now looks inside the `answerProvenance`
block. After the repair, DC-WB7 is killed.

**Route walk:** `tests/constitutional/ws-whole-book/dynamic/route.walk.test.ts`, gated by
`WS_WHOLE_BOOK_DYNAMIC=fictional-only` and a loopback `DATABASE_URL`.
- It ran on a **disposable database** built like CI's empty-database reconstruction (baseline,
  then all migrations), which was **dropped afterwards**. The dev database was not touched.
- **4/4 pass:**
  - WBW1: the whole book declared means all 10 arc observations, uncut; the scope is saved in
    `ask_turns.answer_provenance` and returned.
  - WBW2: the default scope keeps the chapter limits, and *does* carry her reading (not vacuous).
  - WBW3: a whole-book phrase alone does not switch the scope.
  - WBW4: Sanctuary carries nothing.
- With the route forced to ignore the declared scope, **WBW1 fails.**

**Wider suites:** the Ask and Writer's Studio suites pass **1,761/1,762**. The one failure,
`askSourceCloseout` "a developmental thread never reaches the structure frozen side", fails
identically on unmodified canonical. `npm run typecheck` shows **no TypeScript regressions.**

**Not established:** model behaviour, cost and latency on real readings, and the founder's
experience. Those come from the walk after a deploy, under HOLD #1938.

## 7. Not authorized by this document

Any code, migration, deploy, merge, or change to G6 / T11 / quote fidelity; prompt caching;
the iOS timeout change; new JARVIS permissions.
