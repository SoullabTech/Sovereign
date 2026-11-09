# WS-CRAFT-CONVENTIONS-01 · Census and design proposal (2026-11-09)

```
STATUS:     PROPOSAL for founder review. Authorizes nothing.
            No code, no prompt text changed, no craft content authored, no store.
REQUEST:    Founder, verbatim: "MAIA should know all editing, writing and development
            conventions and how to engage them through the studio."
CANONICAL:  clean-main-no-secrets = 84e12cf00562069fad4550b6a8eea3742d58c874 (git ls-remote, 2026-11-09)
READ AT:    feature/ws-work-continuity-part-a-suite @ 6f91eda56 (0 behind, 73 ahead of canonical).
            Every "exists" below was read at that head; canonical may lack the newest Develop work.
LANE:       This request lands INSIDE the existing Writers Academy lane
            (WRITERS-STUDIO-ACADEMY-01 / SEMANTIC-FIELD-01). It does not open a new lane.
NOT:        ACAD-3 content, ACAD-4 wiring, any directive change, any storage, merge, deploy.
```

## 0. The one tension, stated first

The request asks MAIA to know *all* conventions. MAIA's ratified law says she begins **from
the passage, never from a standard of good writing** (`lib/writersStudio/editorialIntelligence.ts:11`),
that the voice lens takes **the manuscript as the reference, never an external standard**
(`lib/manuscript/developmentalReader/contract.ts:67`), and that teaching **describes a technique
and never prescribes quality** (ACAD-1 §3; CONVERGENCE-01 failure condition 6).

A convention *is* an outside standard. So the design question is not "how do we load the
conventions into MAIA" but **"how does MAIA hold the conventions as knowledge about what
writers and editors commonly do, without ever using them as a measure of this writer's
pages."** Everything below answers that. Where it cannot be answered by existing law, it is
put to you as a ruling (§6).

## 1. What already exists (recovered, not assumed)

| What | Where | What it gives MAIA |
|---|---|---|
| The model's own craft knowledge | Claude, every turn | Already broad: editing levels, POV, scene, pacing, dialogue, genre, style manuals, publishing. **Ungoverned as content**; governed only by the stance directives below. |
| Editorial stance | `lib/writersStudio/editorialIntelligence.ts` | Begin from the passage; preserve before changing; friction as passage-specific tension; possibilities unranked; reader effects hypothetical; smallest sufficient intervention; leaving it unchanged is valid. |
| Three depths, Guided · Learning · Direct | `lib/writersStudio/editorialDepth.ts:43` | How much MAIA translates and explains, never how much she writes (§9.3). Learning: "Describe what the technique does. Do not prescribe what good writing is." Direct: full vocabulary, but "naming a move precisely is not the same as establishing it." |
| Attunement, style response, epistemic integrity, text accuracy | same file, `:121`–`:197` | No inference about the writer; richer language never licenses a stronger claim; checkable claims checked; exact quotation. |
| Teaching turn | `lib/writersStudio/teachingTurn.ts` | One idea, in the writer's words, one steering question. Five anchors (`passage · observation · change · direction · continue`). Eleven "Teach me" entry points share it (Academy roadmap Phase 0, #2047). |
| Nine developmental lenses, meanings ratified 2026-09-04 | `lib/manuscript/developmentalReader/contract.ts:41,60` | `overview · structure · development · continuity · arc · themes · voice · coherence · reader`. This **is** developmental editing, as a commissioned reading. |
| Editing latitude, five bands | `lib/manuscript/editorialScope/contract.ts:133` | `Touch · Line · Passage · Shape · Open`, default 1. This **is** the professional ladder from proofreading through line and substantive editing, in plain words. |
| Proof-correction marks | `lib/writersStudio/craftProfessionalMarks.ts` | `STET · TR · ¶ · No ¶ · close up · # · CAPS · lc · DEL · INS · REP`: copy-editing marks, already shown on changes. |
| Editorial approaches (for a returning idea) | `lib/writersStudio/editorialApproaches.ts` | Preserve-and-deepen, echo, try another form… each with benefit and trade-off; "do not invent client accounts, quotations, or sources". |
| Declared kind of Work | `lib/writersStudio/workKind.ts` | `fiction · nonfiction · practitioner`, declared, never inferred; plain-language starters per kind. |
| Development plan | `lib/writersStudio/developmentPlan.ts` | Up to five steps, each with `direction` and `why`, grounded in the chapter's text. |
| The Academy contract and suite | ACAD-1 contract (+ founder rulings §11), ACAD-2 suite frozen (`tests/constitutional/writers-studio-academy/FREEZE.json`) | A **CraftIdea** = an authored, reviewed statement that describes a technique and shows where the writer's own text shows it. No level/score/quality fields. **Founder authors**; ≥1 beta-writer read + founder ratification; static reviewed file in the repo. |
| The Academy library itself | Roadmap Phase 3 (ACAD-3) | **Does not exist.** No craft idea has been written. Teach-me turns are free-generated today. |

Searched and **not found** anywhere in `docs/programme`, `docs/canon`, `lib/` or the craft
branches: a catalogue of editing levels or craft conventions; any rule set for POV, dialogue or
genre; "Chicago", "query letter", "manuscript format", or an editorial (non-CSS) style sheet.
The mentor-presence research notes cover developmental editors and writing teachers only; line
editing, copyediting and editorial-letter conventions were not researched
(`editor_mentor_practice.md` L113). Unmerged branches checked (`chore/developmental-editor-spec`,
`feature/writers-studio-direct-maia-craft-20261009`, `…craftsmans-table-r1-20261006`,
`feature/ws-living-compass-academy-r1-20261022`, `feature/academy-teaching-field-tf01-20261017`)
hold UI and evidence work, not a convention set. Absence is a fact about these searches.

**Finding 1.** MAIA does not lack convention *knowledge*; the model has it. What is missing is
**governance of which conventions are offered, how they are named, and through which act of
the writer they arrive.** "Make MAIA know the conventions" is therefore mostly a content and
reach question, and the reach question is already designed (ACAD-1/ACAD-4).

**Finding 2.** Three of the four editing levels already exist as instruments under plain
names (lenses = developmental; latitude = line/substantive scope; marks = copy). Nothing ties
the plain names to the professional names a writer may meet elsewhere.

**Finding 3.** Some conventions cannot meet the ACAD-1 contract at all, because it requires a
passage anchor (`anchorRequirement` "required and non-empty"): manuscript format, front and back
matter, permissions, query letters, word-count expectations. These are not techniques visible in
a passage. Today they are reachable only as MAIA's unreviewed general knowledge in the
conversation.

## 2. Census by convention family

Status key: **INSTRUMENT** = a Studio mechanism embodies it · **STANCE** = governed only by the
directives · **MODEL** = model knowledge, ungoverned as content · **ABSENT** = neither.

| Family | Covers | Status today | Gap |
|---|---|---|---|
| A. Editing levels | developmental · line · copy · proofreading; editorial letter; author queries | INSTRUMENT (lenses, latitude, marks), plain names only | No map to professional names; no "query" convention (an editor's question in the margin, which is close to MAIA's own stance). |
| B. Narrative craft | structure, scene and summary, point of view, voice, pacing, dialogue, character, setting, tension | STANCE + MODEL; lenses cover structure, arc, voice (work-relative), reader | No reviewed ideas; no POV, pacing or dialogue lens (and none proposed, §4.3). |
| C. Nonfiction craft | argument, claim and evidence, framing, chapter architecture, citation, the author's authority | STANCE + MODEL; `coherence`, `development` lenses; nonfiction starters | No reviewed ideas. |
| D. A helper's book (practitioner) | case material, consent and anonymization, practices and exercises, scope-of-practice claims, the reader as someone in difficulty | STANCE (one clause: no invented client accounts) + MODEL | The ethical conventions (consent, disguise, not overstating efficacy) are the most consequential and the least present. |
| E. Genre and form | novel genres, memoir, personal essay, poetry, hybrid forms, the book's promise to its reader | MODEL ("fits my genre" in one approach) | Genre is where a convention most easily becomes a rubric ("thrillers must…"). |
| F. Revision practice | big to small, passes, reverse outline, reading aloud, distance, keeping versions | INSTRUMENT in part (plan, versions, latitude default 1) | No reviewed ideas about revising as a practice. |
| G. Mechanics and house style | spelling variants, punctuation incl. dialogue punctuation, numbers, capitalization of coined terms, a style manual, a style sheet | STANCE (text accuracy) + MODEL | **No writer-declared style sheet.** Copy-level consistency has nothing of the writer's to be consistent with. |
| H. Manuscript and publishing | manuscript format, front and back matter, permissions and quotation, word counts by market, query/proposal, comparable titles, traditional vs independent | MODEL only | Not anchorable (Finding 3); facts change with market and date. |

## 3. The principle question (one, with a recommended ruling)

> **When the writer asks about a convention, does MAIA answer from her general knowledge under
> the stance law, with the reviewed Academy library as the unit she *offers and names*; or may
> she speak about conventions only through reviewed library entries?**

Two competent implementers would differ here, so it is above the boundary.

**Recommended: the first.** "All conventions" cannot be met by a library of single-digit size,
and refusing to answer "how is dialogue usually punctuated?" until an idea is founder-authored
would fail the writer. So:
- **Asked:** MAIA may draw on her general knowledge of any convention, under the stance in §4.2.
- **Offered:** anything MAIA *offers unprompted as a teaching moment* (Teach me cards, a named
  craft idea, a source line) comes only from the reviewed library. This is ACAD-1 unchanged.
- The difference is who initiated. The writer's question is the license; MAIA's initiative
  requires review.

## 4. Design proposal

### 4.1 Four homes, by kind of convention (never one prompt blob)

| Kind | Home | Why there |
|---|---|---|
| **Technique** (families B–F) | ACAD-1 Tier 1 craft ideas, founder-authored. A separate index maps each `ideaId` to a family (A–H) and to the declared Work kinds it applies to. | The index lives at its own address so the frozen ACAD-2 contract is not edited. Family and kind are facts about subject and reach, never level. |
| **Editing practice** (family A) | The existing instruments, plus a fixed map from plain to professional names: lens reading → developmental edit; Touch → proofreading/light copy; Line → line edit; Passage, Shape → substantive edit; Open → rewrite. Shown only when the writer asks or chose Direct. | Nothing new to build except words; Guided keeps the plain names (`editorialDepth.ts:46`). |
| **House style** (family G) | A **writer-declared style sheet** per Work: the writer's own choices (spelling, serial comma, numbers, coined terms). MAIA may notice an inconsistency only against the writer's declared choice, and may ask, never decide. | The manuscript and the writer's declarations stay the reference. Observe → ask → member declares → record (L7). Storage is not designed here; a census of `living_works` first (no duplicate primitive). |
| **Publishing reference** (family H) | Conversation only, on request, as general knowledge, always marked as varying by publisher, market and date. Not a library entry until Door 2 decides a non-anchored kind. | It cannot meet the anchor rule, and inventing a weaker contract for it now would precede Door 2. |

### 4.2 The stance MAIA takes toward any convention (candidate directive, not yet text)

A short, server-owned directive composed beside `editorialDirective`, at every depth, carrying
these rules. Wording is yours to approve; this states the content:

1. A convention is described as **what writers or editors commonly do, what it does for a
   reader, what it can cost, and where practice differs** (genre, tradition, culture, period,
   publisher). Never as a rule the writer is following or breaking.
2. **This manuscript stays the reference.** A convention never becomes a measure of the
   writer's pages; "breaks the convention", "should", "must", "correct" and "incorrect" are not
   used about the writer's choices. Departure from a convention may be named only as a choice,
   with what it does.
3. **No unsolicited conventions.** MAIA names a convention only when the writer asks, or when a
   writer-chosen teaching moment draws a reviewed idea. She does not volunteer "this is not how
   X is usually done".
4. **Mechanics against the writer's own choices.** Where the writer has declared a choice, MAIA
   may point out an inconsistency with it; where they have not, she asks which they want.
5. **Changing facts are marked.** Publishing and market conventions are said to vary and may be
   out of date; MAIA does not invent figures, rules or publisher requirements.
6. **Nothing about the writer.** Which conventions a writer knows or asks about establishes
   nothing about their level (L6c); nothing is stored.
7. **A convention never enlarges MAIA's writing.** Explaining a convention never arrives with
   rewritten prose; an example sentence, if asked for, is marked as illustration and is not
   placed in the Work (§9.3, L6b).

### 4.2a Candidate wording (DRAFT for ruling 2; not in code)

Written in the writer's voice, like the existing directives in `editorialDepth.ts`. Proposed
name `CONVENTION_STANCE_DIRECTIVE`, composed inside `editorialDirective()` after
`EDITORIAL_INTELLIGENCE_DIRECTIVE`, so it reaches all three depths and both MAIA paths. The
depth texts stay byte-identical; Guided's ban on technical terms and Learning's length rule still
govern how it sounds.

> 1. When I ask about a convention of writing, editing or publishing, tell me what writers or
>    editors commonly do, what it does for a reader, what it can cost, and where practice differs
>    by genre, tradition, culture, period or publisher.
> 2. My manuscript stays the reference. Do not measure my pages against a convention, and do not
>    call my choices correct, incorrect, or a broken rule. If my writing departs from a common
>    practice, describe the departure as a choice and say what it does.
> 3. Do not bring up a convention unless I have asked about it or asked you to teach me about
>    this passage.
> 4. For spelling, punctuation, numbers and capitalization, keep to the choices I have made in
>    this Work. Where I have not made one, ask which I want instead of choosing for me.
> 5. Publishing and market conventions differ between publishers and change over time. Say so,
>    and do not state a figure, requirement or rule you cannot support.
> 6. Which conventions I know or ask about says nothing about me as a writer.
> 7. Explaining a convention never comes with my passage rewritten. If I ask for an example,
>    make up a short one that is not a rewrite of my words, say it is only an illustration, and
>    do not put it into my Work.

Choices made in drafting, open to your change:
- **Rule 3** keeps MAIA's existing Learning behaviour ("teach the one craft idea most at work
  here") lawful, because there the writer asked to be taught. Without that clause the rule would
  silence the Teach-me buttons.
- **Rule 4** works today without a style sheet: "choices I have made" can be read from the
  passage and the conversation. A declared style sheet (ruling 4) would only make them durable.
- **Rule 7** allows an invented example on request. It is stricter than T1 ("not by default")
  because it never rewrites the writer's words, even on request, inside a convention answer.
  Asking for a rewrite stays the existing proposal path, under latitude and authorization.
- No word in it names a level of skill, ranks practices, or calls anything good or bad.

**Acceptance, before any merge.** Run a before/after witness on real replies, using fictional
passages only, in the way the accuracy witness was run (`WRITERS-ACADEMY_ACCURACY_WITNESS_2026-11-07.md`).
Ask one question per family (A–H) at each depth, plus one unrelated passage question to test
rule 3. Read each reply against rules 1–7. The prescriptive-wording proxy (`should`, `must`,
`breaks`, `correct`) is a proxy only. "Describes, not prescribes" stays your judgement. Test
guards: the directive reaches all three depths, is absent from proposal text, and leaves the
depth texts byte-identical.

### 4.3 How each reaches the writer (existing surfaces only)

| Surface | Writer's act | What MAIA may do with conventions |
|---|---|---|
| Develop conversation (DevelopCompanion / WorkConversation) and "Ask MAIA" box | Asks in their own words ("how do editors usually handle…") | Answer from general knowledge under §4.2, anchored to their chapter when one is open. |
| Passage selection → "Teach me about this" / Passage Focus | Selects words, chooses Teach me | One teaching turn; once ACAD-4 is wired, drawn from a reviewed idea whose anchor matches, with its source shown (ACAD-1 §6). |
| Readings (lenses) | Commissions a lens | Unchanged. **No new POV, pacing or dialogue lens proposed**: a lens is a frozen reader contract with ratified meaning, and adding one is its own act. These are reachable today by asking. |
| Plan | Accepts or edits a step | A step's `why` may name a convention only descriptively; no step exists because a convention "requires" it. |
| Passage desk / latitude / marks | Chooses a band; reads a change | Professional names on request (§4.1); marks already explain themselves. |
| Style sheet (proposed, not built) | Declares a choice | Consistency with the writer's own choice only. |

### 4.4 Guards, to be authored with any implementation (falsifier, then defeat candidate)

- No code path maps a passage to a list of convention violations, checks, or a count.
- No convention text enters a proposal or the Work.
- No convention named in a reply the writer did not ask for (proxy only; labelled as proxy).
- Depth parity: the same convention question gets the same substance at all three depths.
- Prescriptive wording ("should", "must", "breaks the rule") about the writer's choices: proxy
  check only; **"describes, not prescribes" stays a human-witness item** (ACAD-1 §3).
- Style-sheet consistency never fires without a writer-declared choice.

## 5. Mapping to MAIA's law

| Law | How this proposal holds it |
|---|---|
| Begin from the passage; manuscript is the reference (`editorialIntelligence.ts:11`, voice lens) | §4.2 rules 1–2; style sheet is the writer's, not a manual's. |
| Teaching describes, never prescribes (ACAD-1 §3; CONVERGENCE-01 condition 6) | Library ideas unchanged; general answers under rule 1. |
| §9.3 / L6b: a facet changes how much MAIA explains, never how much she writes | §4.2 rule 7; depth parity guard. |
| Nothing ranked or graded; no rubric (convergence §4) | No checklist path (§4.4); conventions are never iterated over a passage. |
| Writer authorizes every change (L5) | Conventions never produce a change; latitude and proposals unchanged. |
| No unsolicited cues | §4.2 rule 3; §3 (offered only from the reviewed library). |
| L6c / L6e: no inference about the writer | §4.2 rule 6. |
| Invariant 14, cultural sovereignty | Rule 1 "where practice differs"; genre and tradition never universalized. |
| L7 member-declared state | Style sheet: observe → ask → declare. |
| A0 non-conclusions: `author-intent`, `reader-effect` permanent; evidence never establishes defect or that anything should change (EDITORIAL-READING-01 A0 §VI) | A convention never licenses "this should change" or a claim about why the writer chose something; reader effects of a convention stay possible readings. |
| Mentor research T1–T6 (recommended, **not ratified**) | T1 no rewriting by default → rule 7; T2/T3 writer's focus first, "most important" is ranking → conventions never prioritised; T4 a possible reader's reading only → rule 1; T5 no unsolicited cues → rule 3; T6 "editorial companion" in the UI → professional names stay off the surface unless asked. |
| Declared kind sets the vocabulary (WS-DEVELOP-STUDIO design D13) | Family index carries the declared Work kinds; a fiction convention is not offered in a helper's book, and kind is never inferred. |
| Founder authors craft ideas (ACAD-1 §11 ruling 4) | This document authors none. Topic families are a census, not ideas. |
| Sanctuary | Untouched: nothing here reads, stores or proposes anything in Sanctuary. |
| Provider law (Anthropic or local Ollama only) | No new provider; no external style or publishing service. |

## 6. Rulings requested (each separately)

1. **§3 principle**: asked → general knowledge under the stance; offered → reviewed library only. *Recommended: yes.*
2. **§4.2 stance directive**: approve its content, then its exact wording, then a before/after witness on real replies (fictional passages), as with the accuracy directive. *Recommended: first implementation step.*
3. **Professional-name map** (§4.1, family A): plain names stay; professional names on request and in Direct. *Recommended: yes, small.*
4. **Style sheet** (family G): approve as a direction; storage census first; no build. *Recommended: hold until after Jondi's walk.*
5. **Publishing reference** (family H): conversation-only general knowledge, marked as variable; no library kind until Door 2. *Recommended: yes.*
6. **Authoring** (ACAD-3): the founder writes the first craft ideas. Do you want Claude to draft *candidate* ideas per family for your review, explicitly asked for under ruling 4? *No recommendation; your call.*
7. **Order**: the Academy roadmap puts Jondi's walk before Phase 2 and the founder-written library in Phase 3. Does this request reorder that? *Recommended: no; item 2 can run alongside as a stance change because it adds no capability.*

## 6a. Founder rulings recorded (additive; §6 above is preserved)

| § 6 item | Ruling | Date | Effect |
|---|---|---|---|
| 1. §3 principle | **APPROVED** ("Approve principle") | 2026-11-09 | When the writer asks, MAIA may answer about any convention from her general knowledge, under the stance law. Anything MAIA offers unprompted as a teaching moment comes only from the reviewed Academy library (ACAD-1 unchanged). |
| 2. Stance directive: content and wording | **APPROVED** ("Approve wording"), §4.2a rules 1–7 exactly as drafted | 2026-11-09 | The text is fixed. Changing it means a new ruling, not an edit. |
| 2 (cont.) Implement and witness | **AUTHORIZED** ("Implement and witness") | 2026-11-09 | Implemented in `editorialDepth.ts` (commit `2a49e3a34`). The instruction-level witness is in `WS-CRAFT-CONVENTIONS-01_STANCE_WITNESS_2026-11-09.md`. Not merged, not deployed. |
| 8. Writer-directed editorial attention | **APPROVED** (founder, 2026-11-09; §6b) | 2026-11-09 | A separate ruling. **The seven approved rules are unchanged, word for word.** |

Still open: items 3–7.

## 6b. Ruling 8 — Writer-directed editorial attention (founder, 2026-11-09)

**Ruling (founder, verbatim):**
> Approved — new ruling: Writer-directed editorial attention.
> MAIA must not introduce unsolicited spelling, punctuation, dialect, or surface-consistency
> observations when the writer has asked about another aspect of the work.
> Such observations become appropriate only when the writer explicitly requests proofreading,
> copyediting, consistency review, or continuing attention to those matters.
> If wording prevents comprehension, MAIA may ask for clarification without initiating an
> editorial review.
> Preserve the seven approved stance rules unchanged. Record this as a separate ruling.

**Principle (founder):** "MAIA follows the writer's attention rather than redirecting it toward an
editorial problem the writer did not ask her to solve." And: "MAIA's editorial intelligence
should be available without becoming intrusive. That is what makes her a companion to the writer
rather than an automated critic."

**Boundary (founder):**
- When discussing meaning, voice, character, structure, or emotional depth: no unsolicited
  spelling or copyediting observations.
- When asked to proofread, copyedit, or check consistency: identify relevant issues, distinguish
  conventions from errors, and preserve the writer's authority.
- When a possible typo prevents understanding: ask for clarification rather than start a broader
  correction.
- When the writer explicitly requests continuing editorial vigilance: respect that scope until it
  is changed or withdrawn.

"A writer choosing colour and color differently may be making a mistake, exercising artistic
judgment, or writing across linguistic traditions. MAIA should not assume which."

**Acceptance requirements (founder):**
1. Repeat the 13-case before-and-after witness.
2. Zero unsolicited spelling flags in the 12 previously identified unasked-spelling cases.
3. Explicitly requested correction and teaching still work.
4. Check all three editorial depths.
5. Complete the real-MAIA Develop and Passage Focus walks with fictional work.

No merge or deploy until the remaining approvals and independent acceptance gates are satisfied.
Founder references: SOULLAB-CONTINUITY-01 (#1982), the Writer's Studio owner record (#1800), and
the release controls (#1938) remain in force.

**Relation to the seven rules.** Ruling 8 sits beside them and edits none of them. It governs
*when* surface matters are in scope. Rule 4 governs how MAIA treats the writer's choices once they
are.

**Directive text** (`WRITER_ATTENTION_DIRECTIVE`, composed right after the seven rules). Drafted by
Claude from the ruling above, in the writer's voice like the others; the ruling, not this
wording, is the authority:

> When I have asked about something else in my work, such as meaning, voice, character,
> structure or feeling, do not bring up spelling, punctuation, dialect or surface-consistency
> points. Raise them only when I explicitly ask you to proofread, copyedit or review
> consistency, or ask you to keep watching for them. An open question, such as what you notice
> in a passage or what kind of edit it needs, is not that request. Then name what is relevant, say which differences may be
> conventions or choices and which look like errors, and leave each decision with me. If my
> wording stops you understanding what I mean, ask me about that one place, without starting an
> editorial review. If I ask you to keep watching for these things, do so until I change or
> withdraw that request. A difference such as colour and color may be a mistake, a choice, or
> writing across language traditions; do not assume which.

**Wording revision (same day, before any merge).** Run 4 of the witness left 6 unasked flags in
36 replies, on open questions ("what do you notice", "which edit does it need"). The sentence
"An open question… is not that request" and the word "explicitly" were added. Both restate the
ruling ("only when the writer explicitly requests"); neither changes it.

**One limit, stated.** "Until changed or withdrawn" holds within a conversation, because the
request lives in the writer's own turns. Nothing about the writer is stored (rule 6). Vigilance
that lasts across conversations would need a member-declared setting, which is not designed here.

## 7. Standing and what was not done

- At proposal time: nothing built. Since then, rulings 2 and 8 are implemented (§6a); no craft idea
  drafted; no storage; no merge or deploy.
- Not verified: whether the Develop companion path composes `editorialDirective` today (the
  Ask reader composes Guided only, `lib/manuscript/ask/developmentalAskReader.ts:73`); confirm
  before item 2 is wired.
- Not verified: the convergence charter's "no additional product-capability lane until the spine
  has been walked" (ACADEMY-01 census §3 item 7). This proposal opens no lane, but the founder
  may want to note it.
- The two MAIA behaviour defects being fixed in the parent session (false quote retraction,
  reading permission suggested inside Sanctuary) were not touched.
