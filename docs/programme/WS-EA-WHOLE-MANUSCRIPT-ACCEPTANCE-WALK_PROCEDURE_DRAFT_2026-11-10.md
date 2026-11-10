# Elemental Alchemy — Whole-Manuscript Acceptance Walk (procedure DRAFT)

```
STATUS:      DRAFT — candidate for Writer's Studio owner record #1800. Not posted.
OWNER:       Writer's Studio #1800 · governed by Continuity #1982 · release HOLD #1938 in force
EXECUTOR:    founder walks · Claude Code records and checks
CANONICAL:   b3f246b456e5797dbd08ab2c8c74099181da8204 (clean-main-no-secrets, read 2026-11-10)
PROD STAMP:  ee9dcf394 (per #1938, 9 Nov) — re-witness before the walk; never assume
NOT A LANE:  this is an acceptance walk inside the existing Writer's Studio project
AUTHORIZES:  nothing — no code, migration, deploy, invitation, JARVIS grant or release
```

## 0. What this walk is for

**Acceptance standard (founder proposal, adopted as the walk's question):**
*MAIA knows the manuscript well enough to have a meaningful editorial conversation about the
whole work, stays truthful about what she has read, and never requires the writer to explain
their own book again.*

Real-author case: *Elemental Alchemy*, the founder's own book, under the founder's own account.
Founder-only. No other member, and no member data other than the founder's own.

## 1. Corrections carried in from the reconciliation (2026-11-10)

These change the proposal that started this draft, and they bind the pass criteria below.

1. **The standing read scope is implemented, not just ruled.** Part B landed as `2d48f897f`, then
   `29dbce29a` and `9139df270` (independent-review fixes), all 2026-11-08, and all ancestors of
   the production stamp `ee9dcf394`. **UNKNOWN:** whether its migration was applied in
   production, and whether the 11-08 failure (MAIA sending the writer back to "Read this
   chapter") is fixed live. The walk answers this; nothing before it does.
2. **The conversation is budgeted. The deliberate reading is not.**
   - Work conversation: `READ_CHAR_BUDGET = 60_000` characters and `MAX_READ_SECTIONS = 40` per
     answer (`lib/manuscript/ask/workReadScope.ts`). Sections that don't fit are returned as
     `overBudget`.
   - Deliberate developmental reading: `DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 500_000`
     (`lib/manuscript/developmentalReader/contract.ts`). Elemental Alchemy is about 385,000
     code points, so the whole book fits here.
   - **Consequence:** an answer about the whole book is lawful only if it rests on the
     deliberate reading, or says plainly that it is working from part of the book. A
     conversational read is never whole-book coverage (law T11).
3. **Observations are not ranked.** Convergence charter §4: the first whole-book review shows
   observations **unranked, all reachable**, with presentation in manuscript order.
   Prioritization is a separate act the writer commissions explicitly. The proposal's "three to
   five ranked opportunities" therefore becomes W6 below. It is never a property of the
   overview.
4. **Some non-conclusions are permanent.** `author-intent` and `reader-effect` are never
   discharged. *"Does the final chapter fulfill the opening's promise?"* and *"where will the
   reader feel the insight?"* can be answered only as observations grounded in covered text,
   never as verdicts about intent or effect.
5. **The binding precondition the proposal left out (P3).** Canonical still holds Elemental
   Alchemy as governed knowledge (results in §9): `app/api/_backend/data/founder-knowledge/elemental-alchemy-*.json`,
   the `/api/elemental-alchemy/*` and `/api/community/elemental-alchemy/*` routes, and the ingest
   contract named in the convergence charter. Unless that material is shown to be unreachable
   from the paths the walk exercises, a whole-book reading can't be told apart from MAIA
   recalling what she already knew. If it is not proved, the walk yields **NO EVIDENCE**.

## 2. Preconditions — all must hold before W1, or the walk does not start

| # | Precondition | Evidence class required |
|---|---|---|
| P1 | Production SHA re-witnessed, and the Part B commits are ancestors of it | `printenv GIT_COMMIT` + `git merge-base --is-ancestor` |
| P2 | The standing-scope migration is applied in production | read-only `schema_migrations` row for that file (name it from source first) |
| P3 | **EA governed knowledge is unreachable** from the Studio reading, the Ask and the Work-conversation paths used here | source trace of each path's context assembly **and** a negative probe (§5, D1); a code-read alone is not enough |
| P4 | The manuscript to be used is identified by id, its section count is known, and it is the founder's | founder names it; Claude Code reads only ids and counts, never prose |
| P5 | Release HOLD #1938 and Class A #1969 remain unchanged by this walk | statement in the record |
| P6 | Sanctuary is **off** for the walk, so the scope is honoured; one deliberate Sanctuary probe is W9 | founder toggle state recorded |

⚠️ P3 is an engineering question, not a formality. If tracing shows any path in this walk that
can reach the EA knowledge, **stop and report**. Making it unreachable is a separate act that
needs its own authorization. It is not walk preparation.

## 3. The walk

Each step records: time · route used · HTTP outcome · what MAIA said she read · pass/fail ·
anything she claimed without evidence. **No authored prose appears in the record** (see §6).

**W1 — Intake and integrity.** Upload the complete original manuscript through Writer's Studio
(or confirm the existing one from P4).
*Pass:* every section is accounted for, with no silent drop. The section count matches what the
founder expects. Front and back matter are either included or explicitly named as excluded. The
original file is preserved as Source, separate from the Draft.

**W2 — Explicit authorization.** The founder authorizes reading at the level they choose. For the
deliberate reading that is the developmental act. For the conversation it is the standing scope,
at the **Work** level.
*Pass:* nothing is granted by default or inferred. The grant is visible and can be revoked.

**W3 — Coverage receipt.** Before any overview, MAIA states what she read.
*Pass:* the coverage names every section, or names exactly which ones were not read and why. A
refusal over the ceiling refuses the whole book and trims nothing (it shouldn't occur at ~385k).
The coverage stays visible on the surface (law L8), not hidden behind editorial detail.

**W4 — The whole-book overview.** Request the integrated reading.
*Pass:* it draws relationships across the opening, middle and conclusion, with section
references. The Fire → Water → Earth → Air → Aether → Living Spiral movement is recognised **from
the text**, with refs. Observations are unranked and in manuscript order. No verdicts about
`author-intent` or `reader-effect`.
*Fail:* a chapter-by-chapter summary presented as integration · claims without refs · any
phrasing that matches EA governed knowledge rather than the manuscript (cross-check against D1).

**W5 — Commissioned questions.** Ask each as its own turn:
- the book's arc, and whether the close answers what the opening sets up (as an observation)
- ideas introduced and later underdeveloped (missed opportunities)
- what is strongest
- where the argument may lose force

*Pass:* each answer is specific, cites sections, and separates *apparent weakness* from *a choice
MAIA may not understand*, asking rather than ruling on the second. When the founder explains a
choice, the reading is revised, not deleted, and does not automatically defer.

**W6 — Prioritization, commissioned explicitly.** Founder asks, in their own words, for what to
work on first.
*Pass:* MAIA treats this as a new, commissioned act. Her rationale cites observations from W4 and
W5. Nothing in the W4 set becomes unreachable as a result. *Fail:* the overview reorders itself,
or the priorities appear without being asked for.

**W7 — Open conversation and cross-chapter recall.** Talk naturally about the book, with at least
three questions that each need a different, non-adjacent chapter, including one opening and one
closing chapter.
*Pass:* she answers from saved text, and the "what she read" line names the sections and their
revisions. When a question exceeds the 60k budget, she says so (`overBudget`), never implying she
read what she didn't. *Fail:* she sends the writer to "Read this chapter" again (the 11-08
defect), or quotes text that was not supplied.

**W8 — Leave and return.** Navigate away to another Studio surface, come back, resume the same
thread, and ask about a chapter discussed earlier. Then repeat once after a full sign-out and
sign-in.
*Pass:* the thread resumes, text context is restored from saved revisions (not rebuilt from chat
history alone), and nothing needs reintroducing.

**W9 — Boundaries.**
- (a) Revoke the scope mid-thread. The next Ask carries no body, and she says so.
- (b) Sanctuary on. The scope is suspended and nothing is retained.
- (c) Optional: revise one section, and confirm she notices the text moved.

*Pass:* each behaves as T5, T7 and T4 require.

**W11 — The editorial pass: issue after issue** (founder standard, 2026-11-10).
*The founder's standard:* "I want our platform to function conversationally on the level
chatgpt did with me when editing my work. It offered options, refined my own offerings and
walked me through issue after issue until we refined the full book."

Run after W4–W8, in the Work conversation and Write on `55742458`. Take **at least three
issues in three different chapters** all the way through:

1. MAIA raises the issue, grounded in a passage. Issues come in manuscript order, or in an
   order the founder commissions ("take me through the arc problems").
2. She offers options: alternatives, or questions with answer buttons.
3. The founder counters with their own wording.
4. She refines **the founder's version**. She doesn't replace it with hers.
5. The founder adopts it, adjusts it, or declines.
6. She carries what was decided, and why, into the next issue without being asked.
7. After the third issue, leave. Then return in a new session and say "let's keep going".

*Pass:*
- each step happens in conversation, without the founder re-explaining the book;
- what was settled stays settled and is not re-raised;
- adopted changes appear in the manuscript only through the founder's adoption;
- on return, she knows which issues were settled and offers the next one.

*Record per step:* worked · worked with friction (name it) · absent (name the missing
crossing). **"Absent" is a design finding, not a walk failure.** The crossings found absent are
the evidence for designing the pass (Convergence step 7). They are not grounds for a repair
during the walk.

*Watch for:*
- options that steer, where buttons carry MAIA's preferred answer;
- refinement that drifts into MAIA's voice;
- an implied ranking ("the most important issue is…") that was never commissioned;
- a decision lost between issues;
- "which issue were we on?" on return.

**W10 — Manuscript stays central.** Throughout, the manuscript remains the primary surface, and
no observation takes over the conversation without the writer choosing it.
*This is founder witness only.*

## 4. Pass / fail ledger

| Capability | Step | Pass | Defeat condition, recorded if seen |
|---|---|---|---|
| Complete intake | W1 | all sections accounted for | silent drop or merge |
| Honest coverage | W3 | named coverage, visible | coverage claimed but not shown |
| Whole-book reading | W4 | cross-book relationships with refs | summary dressed as integration |
| Missed opportunities | W5 | specific, credible, cited | generic craft advice |
| Prioritization | W6 | only when commissioned; set intact | ranking baked into the overview |
| Authorial control | all | nothing applied without instruction | any unrequested write |
| Continuity | W7–W8 | no reintroduction needed | "press Read this chapter" again |
| Honest memory | W7 | over-budget stated | implies reading she didn't do |
| Source not recollection | W4–W7 | refs resolve to manuscript text | wording traceable to EA knowledge |
| Boundaries | W9 | revoke and Sanctuary honoured | body after revoke |
| Editorial pass | W11 | ≥3 issues carried through options → founder wording → refinement → adoption → next; resumes after leaving | lost decisions, steering options, MAIA's voice replacing the founder's, no resume |

**A stop yields NO EVIDENCE, never a partial pass.** A technical pass cannot override a failure
the founder experienced.

**Founder-witness only (UNKNOWN until walked; no automated result may report these):**
- whether it feels like an editor who has genuinely read the book
- whether the "what she read" line reads as trust or as machinery
- W10
- whether challenge stays open to the author's explanation

## 5. Discriminators (so a pass can't be manufactured)

- **D1 — recollection probe.** Before the walk, Claude Code lists distinctive phrasings that
  appear in EA governed knowledge but **not** in the manuscript (from file diffs, ids only in the
  record). If any of them appears in a W4–W7 answer, the result is P3 failure, NO EVIDENCE.
- **D2 — ref resolution.** Every section reference in W4–W6 must resolve to a real section id in
  the P4 manuscript.
- **D3 — budget honesty.** At least one W7 question must be built to exceed 60k (for example, "across
  the whole book…") so that the over-budget path is actually exercised.

## 6. Evidence discipline

- The record holds route, status, section **ids**, revision numbers, counts, booleans and the
  founder's pass/fail. It carries **no manuscript prose, excerpts, digests or offsets.** If the
  founder chooses to quote their own book in a separate note, that note is theirs, not this
  record's.
- Side effects on the founder's data (readings, threads, receipts, scope events) are listed at
  the end of the walk.
- Production is read only. No schema, config or permission change is made as part of the walk.

## 7. Stops

Stop and report, with no workaround, when: P1–P6 cannot be established · the EA knowledge is
reachable · the 11-08 defect reproduces (record it, finish only the steps that remain meaningful,
then stop) · the reading hangs with no visible progress (the open 11-08 defect, recorded with its
duration) · any cross-member signal appears (raise to Class A #1969 immediately) · MAIA writes to
the manuscript without instruction.

## 8. Known open items this walk will touch, not fix

- Deliberate reading: an unbounded wait with no progress shown (11-08).
- Send button disabled while multiple threads are unresolved, with no hint why (11-08).
- The observation-identity / standing-address bridge (`OBSERVATION-ADDRESS-01`) is not opened, so
  per-observation member actions in W5–W6 may not persist under `observation_id`. Record what
  happens; do not repair it.

## 9. Precondition results — P1–P3 (2026-11-10, read-only)

**P1 — PASS.** Production `docker exec maia-sovereign printenv GIT_COMMIT` → `ee9dcf394`.
Container created 2026-11-09T22:21:49Z, image `sha256:94498d50…`, matching #1938. All three
Part B commits (`2d48f897f`, `29dbce29a`, `9139df270`) are ancestors of `ee9dcf394`.

**P2 — PASS.** The scope migration is `database/migrations/20261108000001_work_reading_scope.sql`.
The production `schema_migrations` row exists (applied 2026-11-09 19:35:27Z), and
`to_regclass('public.work_reading_scope_events')` resolves. Read-only query; nothing written.

**P3 — SOURCE HALF PASS for the walk's paths · one path EXCLUDED · probe half OWED.**
Method: a transitive import graph over canonical `b3f246b45` (static, dynamic and `require`
imports, `@/` resolved), plus every SQL table those files name.

- **Clean (no EA governed knowledge reachable):** `manuscripts/[id]/ask` (73 files),
  `readings` (36), `read-scope`, `chapter-reviews`, `review-discuss`,
  `developmental-orientation`, `lineage-orientation`, `lineage-chapter`, `lineage-scan`,
  `themes`, `attention-map`, `develop/preparation` and `structure/read`.
  - None reaches `founder-knowledge/elemental-alchemy-*.json`, the `/api/elemental-alchemy/*`
    routes, an EA ingest contract or any corpus table.
  - The Ask and reading paths reach the model only through `lib/ai/structured/*`, with no MAIA
    runtime prompt.
  - Every table they read is the member's own manuscript, reading, thread, scope or receipt data.
  - The only "Elemental Alchemy" strings on these paths are code comments
    (`developmentalReader/read.ts`, `contract.ts`, `structure/evidence.ts`), not prompt text.
- **⛔ EXCLUDED from whole-book evidence: `/api/writers-studio/editorial/turn`** (the
  Write/Edit `EditorialConversation`).
  - It assembles the canonical MAIA floor (`lib/maia/canonical-turn/floor.ts`), which carries
    `MAIA_RUNTIME_PROMPT`. That imports `lib/ai/prompts/ainIntegrativeAlchemy.ts`, the
    AIN/Spiralogic elemental framework, which is the book's own conceptual ground.
  - The path also carries `PLATFORM_KNOWLEDGE_ADDENDUM` and a teaching-retrieval contract.
  - There is no EA text in it, but recognising "Fire → … → Aether" there can't be told apart
    from the framework prompt. **W4–W7 must use the Develop reading and the Work conversation
    only.** Anything observed in EditorialConversation is recorded, but carries no whole-book
    evidence.
- **Residuals, named rather than resolved:**
  - (a) The Ask route also reads the member's own `living_work_writer_understanding` and
    `writer_studio_corrections`. These are founder-authored and lawful, but if they describe the
    book, the founder should note what they say before W4.
  - (b) The model's own pretraining cannot be ruled out by any code trace if the published
    book is in it.
  - (c) The graph is static. Runtime-built paths or environment-selected providers aren't
    proved absent; the only `fetch` the trace found leads to the structured adapter.
- **Owed:** D1, the recollection probe, which is the negative half of P3. It runs as the
  walk's first act, against the live Develop reading, and needs the founder's session. Until
  it runs, P3 is not passed.

## 10. Preflight — route, gates and evidence mechanism (2026-11-10, read-only)

This answers the review-lane acceptance contract (eight stages). Everything here was read only.
Manuscript content was **not** read; only ids, counts, lengths, lenses and dates.

**Correction to the review lane.** The review lane states that the standing read scope "has not
yet been verified as implemented." That was true of the record and is now superseded by §9 P1/P2:
the code and its migration are live in production. What remains **unwitnessed** is the behaviour,
which is W7–W9's job.

| # | Stage | Verdict | Evidence |
|---|---|---|---|
| 1 | Manuscript integrity | **READY via an existing Work** · fresh upload **BLOCKED** | see "Route" below |
| 2 | Read consent | **READY** | developmental reading: member-commissioned per request, Sanctuary or undeclared posture → 409 and nothing read (`readings/route.ts`, ruling 2026-11-09). Conversation: standing scope, member-granted, revocable (`read-scope` route, `work_reading_scope_events`) |
| 3 | Coverage evidence | **READY — two different mechanisms** | deliberate reading: the frozen reading's `coverage` marks each section `body` (text supplied) or `position` (only its place known), with `read_state` binding revision, range and digest. Conversation: one `context_disclosure_receipts` row per crossing at boundary `writers_studio.work_conversation->maia_cognition`. ⚠️ The deliberate reading mints **no** disclosure receipt; its custody record is the reading itself. Do not look for one. |
| 4 | Integrated reading | **READY structurally · quality UNWITNESSED** | see "Prior readings" below |
| 5 | Editorial discernment | **UNWITNESSED** | needs the walk |
| 6 | Natural dialogue | **UNWITNESSED** · 11-08 defect not yet re-tested since the scope shipped | Ask route reaches `carriedReadings.ts`, `workReadScope.ts`; budget 60k / 40 sections |
| 7 | Return continuity | **UNWITNESSED** | threads persist (`ask_threads` / `ask_turns`) |
| 8 | Epistemic integrity | **PARTLY READY** · P3 probe owed | quote gate (`quoteFidelity.ts`); `overBudget` disclosure; D1 not yet run |

**Route.**
- **Fresh upload is BLOCKED at the production edge.** Production Caddy (`maia-caddy`, read
  2026-11-10) answers `POST|PUT|PATCH /api/writers-studio/sources*` and
  `/api/book-studio/workbench/uploads*` with **423 "Source writing temporarily unavailable"**
  (`@source_write_pre_migration_hold`, SOURCE-CUSTODY-EDGE-01; retire only after the stated
  proofs). The Writer's Studio upload page posts to exactly that path
  (`app/writers-studio/sources/page.tsx:230`). ⛔ Do not attempt an upload; lifting the hold is
  not part of this walk.
- **Existing Works on the founder account** (member `ce284751…`, all `member_uploaded`,
  `source_custodied`):

  | Work | Title (as stored) | Sections | Code points | Created |
  |---|---|---|---|---|
  | `55742458…` | ELEMENTAL_ALCHEMY | 262 | 377,169 | 2026-09-07 |
  | `dd1a3718…` | Elemental Alchemy ILLUSTRATED Foreword Review 6x9 FINAL | 55 | 400,682 | 2026-10-29 |
  | `477941cf…` `c6e16098…` `9026ba42…` `d4f94ca6…` `893bcc84…` | same title as `dd1a3718` | 55 each | 400,682 each | 11-03 → 11-04 |

  Both sizes fit the 500,000 ceiling. ⚠️ **Six Works have the same title and size.** The founder
  must name the one Work that is "the complete original" (P4). Claude Code does not choose it.
  The five later copies look like repeat uploads; that is recorded here, not acted on.
  ⚠️ One further Work titled after the book belongs to a **different member id**. It is
  excluded, and nothing beyond its title, size and owner id was read.

**Prior readings (metadata only).**
- `dd1a3718…` has **eight readings from 2026-10-29** (lenses: reader, coherence, voice, themes,
  arc, continuity, structure, development). Each has **body coverage 55/55** and holds 13–27
  observations.
- So a whole-book, full-body reading of this Work has already completed in production.
  ⭐ Stage 4 is therefore not hypothetical; what is unwitnessed is the quality of those
  readings and what the conversation does with them.
- `55742458…` has one full-body reading (2026-09-08, 262/262). Its later readings cover only
  17–24 of 262 sections in body, the rest by position only. ⚠️ Using that Work for the walk would
  mean a mostly-position overview unless a new whole-scope reading is commissioned.
- ⚠️ All of these readings **predate** the 11-08 standing scope, and have never been tested
  against it in conversation.

**Provider gate.** Production has `ANTHROPIC_API_KEY` present (presence only; value not read).
`MAIA_INFERENCE_MODE`, `MAIA_DEVELOPMENTAL_READER_MODEL` and `MAIA_ASK_MODEL` are unset, so code
defaults apply. No provider activation is needed. No feature flag gates the readings or Ask
routes beyond authentication, ownership and posture.

**Security gates in force, which the walk must not cross:** Class A #1969 HOLD (H1 session
binding) · source-write edge hold (above) · release HOLD #1938. None of them blocks a
founder-only reading or conversation on an existing Work. A cross-member signal during the walk
→ stop and raise it to #1969.

**On the review lane's test prompts.**
- **Prompt 1** presupposes coverage ("having read the complete manuscript"). Ask instead after
  W3 has shown coverage, or phrase it neutrally, so that MAIA's own account of what she read is
  tested rather than supplied to her.
- **Prompt 4** ("improve only three things") is the commissioned prioritization act, W6. It
  belongs after the unranked overview, never inside it.
- Prompts 2 and 3 map to W4 and W5 unchanged.

## 10a. P4 — Work named (founder, 2026-11-10)

**The walk's Work is `dd1a3718…`** ("Elemental Alchemy ILLUSTRATED Foreword Review 6x9 FINAL",
55 sections, 400,682 code points, created 2026-10-29, founder account). The founder named it in
the Claude Code session in answer to the question "Which Elemental Alchemy Work is the complete
original for the walk?"

- `55742458…` and the five later copies of `dd1a3718` are **not** walk Works. Nothing is done
  to them.
- The eight readings of 2026-10-29 are prior evidence only. W4 commissions a **fresh** whole
  reading, so that the walk's reading is bound to the current revision and is observed live.

**Precondition standing:** P1 ✅ · P2 ✅ · P3 source half ✅, probe (D1) owed · P4 ✅ ·
P5 ✅ (no hold changed) · P6 to be set by the founder at walk start.

**D1 design (proposed, not run).** Candidate phrases are drawn from the repository's EA
governed-knowledge files. Each is checked **inside the production database** for presence in
`dd1a3718`'s sections, and only a present/absent boolean per phrase returns. Manuscript text
never leaves the host and never enters this record. Phrases found absent from the manuscript
become the recollection markers for W4–W7.

## 10b. D1 — marker preparation RUN (2026-11-10, read-only)

**Method.**
- Candidate phrases came from the canonical EA governed-knowledge files in
  `app/api/_backend/data/founder-knowledge/`. They are 8-word windows after normalization
  (lowercase, every run of non-alphanumerics collapsed to one space), sampled evenly, 60 per
  group.
- Each was checked with `position()` inside a `BEGIN TRANSACTION READ ONLY … ROLLBACK` session
  in production `maia-postgres`. It was checked against `dd1a3718`'s Source sections
  (`manuscript_sections`) and against its working-draft sections, both normalized the same way.
- Only `id, in_source, in_draft` booleans returned. No manuscript text left the host, and none
  is in this record.

**What the knowledge files contain.**
- `elemental-alchemy-full.json` holds an **earlier edition's full text**: 10 chapters,
  ~440k chars, plus a 51k introduction, a 17k preface and a 2.8M-char `appendix`.
- `elemental-alchemy-book.json` and `elemental-alchemy-processed.json` hold **derived** material:
  `coreTeachings`, per-chapter `keyTeachings`, `elementalWisdom.*.healingApplications`.

**Result (300 phrases, Source and Draft agree on every one):**

| Group | Checked | Found in `dd1a3718` | Absent → markers |
|---|---|---|---|
| coreTeachings (derived) | 60 | 20 | 40 |
| keyTeachings (derived) | 60 | 10 | 50 |
| healingApplications (derived) | 60 | 11 | 49 |
| earlier-edition chapters | 60 | 26 | 34 |
| appendix | 60 | 1 | 59 |
| **Total** | **300** | **68** | **232** |

**What this establishes and what it doesn't.**
- ⭐ The governed knowledge **overlaps the walk's manuscript substantially**: 26/60 earlier-edition
  windows appear verbatim. For that overlap, wording cannot tell reading from recollection. This
  is exactly why P3 needed proof by path (§9), not by output.
- **232 markers** now exist: wording that is in the stored knowledge and **not** in `dd1a3718`.
  If a marker, or a close paraphrase of one, appears in a W4–W7 answer, that is evidence of
  recollection → P3 FAIL → the walk yields NO EVIDENCE.
- ⚠️ The markers can catch recollection; **their absence does not prove reading.** Proof of
  reading stays with the §9 path trace, coverage (W3) and ref resolution (D2).
- ⚠️ Absence carries some false-absence risk: windows can straddle a section boundary, and
  editions can differ trivially. A marker hit is judged by the founder, not counted mechanically.
- **Custody of the markers:** they are working material in the session scratchpad
  (`d1_markers.json`), not this record. They can be regenerated deterministically from canonical
  `b3f246b45` by this method.

**P3 standing:** source half ✅ · markers ✅ prepared · **probe half completes only when W4–W7
outputs are checked against the markers.** P3 is therefore not yet passed.

## 10c. Phase A — structural review of the eight existing readings (2026-11-10, read-only)

Requested by the review lane: review the existing readings with their revision and coverage
evidence, **without a new provider request.** Each check ran in a `READ ONLY … ROLLBACK`
session. Only counts and booleans returned; no observation or manuscript text entered this
record.

| Check | Result |
|---|---|
| Custody | all eight bound to draft `fdc33504…` **revision 1**, one shared `input_fingerprint` (`95ce1f2d70fa…`) |
| Staleness | the current draft is still revision 1 → **no text has moved** since the readings were frozen |
| Coverage | 55/55 sections in body for every lens (§10) |
| Reader | `anthropic` / `claude-opus-5`, all eight |
| Observations | **147** in total, each with `observationId`, `basisFingerprint`, `position` and `admissionIndex` (OBSERVATION-IDENTITY-01 present) |
| Non-conclusions | every one of 147 carries a non-empty `doesNotEstablish` |
| **D2 ref resolution** | **541/541 evidence refs resolve** to sections of the current draft (452 passage · 41 section · 8 section-run) |
| **D1 markers on existing output** | **0 of 232 markers** appear in the 147 observations |
| Spread across the book | refs touch **44 of 55** sections. By thirds of the book: **18/18 · 19/19 · 7/18** |

**What this establishes.**
- The existing readings are structurally sound. They are anchored to the exact current text,
  they cite real passages, they carry their non-conclusions, and they show no trace of the
  stored EA knowledge. This is the first actual output-side evidence for P3. It covers existing
  readings only; W4–W7 still owe the live check.

**What it does not establish.**
- Quality. Whether they grasp the book's organizing vision is the founder's judgment in Phase A
  proper, made by reading them in the Studio.
- ⚠️ **The final third is thinly cited (7 of 18 sections).** Whatever the readings say about how
  the book closes rests on far less of the close than of the opening. That is a pointed question
  for W5 ("does the close answer the opening?"), and the founder should check it when reading
  them. ⛔ It is not attributed: sparse citation could reflect the readings, or the shape of
  the closing sections. Not determined.

**Added step — W7b, the 11-08 regression on `55742458…`** (review lane's proposal, adopted).
Passing on `dd1a3718` does not show the 11-08 false-denial is fixed on the Work where it
occurred. In W7b, grant the Work-level scope on `55742458`, read one chapter there, and ask the
same kind of follow-up. *Pass:* she answers from saved text, and the receipt names the section.
*Fail:* she sends the writer back to "Read this chapter".

**Note on independent evaluation outside MAIA.** The review lane offers to evaluate these
readings itself. Doing that means copying MAIA's observations — which cite and quote the
manuscript — into a cloud provider outside MAIA's sovereignty boundary. Whether to do so is the
founder's decision about the founder's own book. ⛔ Claude Code will not prepare an export for
it unasked. A founder reading the observations in the Studio needs no export.

## 10d. ⛔ P4 REOPENED — `dd1a3718` fails W1 integrity (founder witness, 2026-11-10)

**Founder witness** (production, founder's own session, Develop on `dd1a3718`, three
screenshots): *"this is all messed up with copy — not my manuscript but parts of it."*

**Shape, confirmed read-only.** Only positions, headings and lengths were read; no body text.

- **Pos 0** (10,642 chars, no heading): the title page, dedication and disclaimer are merged
  into one "Section 1", with print page numbers inline.
- **Truncated headings**: "Chapter 3: Understanding the", "Chapter 4: The Elements of",
  "Chapter 5: Fire — The Element". The rest of each heading flowed into the body. This is a
  print-layout line wrap.
- **Inconsistent granularity**: Fire is split into 13 sub-sections (pos 8–20), while Water,
  Earth, Air, Aether and Living Spiral are each one section (pos 21–25, 20k–73k chars).
- **Pos 26–42**: back matter (scales, chapter summaries, astrology), imported as peer sections.
- ⭐ **Pos 43–54**: the **per-chapter bibliography**, imported under bare chapter headings
  ("CHAPTER 1: THE JOURNEY BEGINS" … "CONCLUSION…") with **no "Bibliography" parent**. Every
  section is citation-dense (4–13 citation patterns each). In the reading rail this reads as a
  **second copy of the book's chapters**, which is what the founder saw.

**What this changes.**
- **The §10c "final third 7/18" finding is now attributed to the source.** Positions 37–54 are
  appendix and bibliography, and the book's actual close (Chapter 10, pos 25) sits mid-Work.
  Splitting into thirds by position was a misleading instrument for this Work. That finding is
  **superseded** as a signal about MAIA, and kept here rather than deleted.
- ⭐ **MAIA's visible answer in the founder's conversation is correct and honest.** She said the
  material under that heading is bibliography, not chapter prose, and asked whether 43–54 is a
  later draft or meant to coexist rather than guess. This is positive conversational evidence
  of epistemic integrity, recorded for the walk; it is not yet scored.
- ⛔ **`dd1a3718` cannot serve as "the complete original"** for an acceptance walk. Any
  whole-book reading of it is a reading of a print-interior extraction with merged front matter
  and an unlabelled bibliography presented as chapters.
- **Not a disclosure defect.** The Work is owner-scoped and was shown only in the founder's own
  session. The defect is **import fidelity**: how the Oct 29 illustrated print file was
  segmented. It is recorded here and not repaired: the upload path is under the 423 edge hold,
  and changing segmentation needs its own authorization.

**Comparison: `55742458` (262 sections, 386,031 chars in the draft), heading-level shape only.**
- Full chapter titles, not truncated.
- An explicit **Part One / Two / Three** structure, with per-chapter Introductions and
  Conclusions.
- **"Appendix" (pos 226) and "Bibliography" (pos 247)** label the back matter, so the
  per-chapter citation headings (248–260) sit *under* Bibliography.
- ⚠️ Front matter still deserves a look: positions 0–15 include two "Elemental Alchemy"
  sections and two "Part One — The Ground" headings, possibly a table of contents imported as
  sections. Its later readings had partial body coverage, which W4's fresh whole reading would
  replace.
- **Prima facie `55742458` is the closer import of the manuscript as written.** Only the founder
  can confirm that.

**Founder decision owed: the walk's Work.** The candidates are `55742458` (recommended,
pending a founder look at its front matter) or a clean original upload (⛔ blocked by the 423
source-write edge hold). Until it is decided, the walk does not start.

## 10e. P4 — Work re-named: `55742458` (founder, 2026-11-10)

**The walk's Work is now `55742458-be2c-406a-a158-d0438cf02892`** ("ELEMENTAL_ALCHEMY", 262
sections, 5 versions, all on Sep 7). The founder compared both Works in Write view and answered
"Yes, use 55742458". **This supersedes §10a's choice of `dd1a3718`**, which is kept in the
record and not edited.

**Founder-witnessed shape (Write view).**
- Front matter is in separate sections: Permissions, Dedication, Disclaimer, Contents, Preface.
- Chapter titles are full, and Parts One, Two and Three are present.
- ⚠️ The title runs across three short sections (1–3), and positions 8–10 look like
  table-of-contents entries imported as headings. Both are short; MAIA may remark on them.
- ⚠️ Five versions mean this is the founder's **working draft**, not the untouched original.
  That is lawful for the walk, because readings and conversation bind to the current saved
  revision. The record says "the current revision", not "the original".

**D1 re-run against `55742458`** (same 300 phrases, same read-only method, booleans only):

| Group | Present (source / draft) | Absent from both → markers |
|---|---|---|
| coreTeachings | 30 / 30 | 30 |
| keyTeachings | 23 / 25 | 35 |
| healingApplications | 25 / 25 | 35 |
| earlier-edition chapters | 39 / 41 | 19 |
| appendix | 1 / 1 | 59 |
| **Total** | | **178** |

- **The stored knowledge overlaps this Work more than `dd1a3718`**: 41/60 earlier-edition windows
  are verbatim in the draft. Proof by path (§9) carries even more weight here.
- ⚠️ **Four phrases are in the draft but not in Source.** The founder's Sep 7 edits introduced
  wording that matches the stored knowledge. Recorded and not attributed.
- **The walk uses 178 markers** (`d1_markers_55742458.json`, session scratchpad). The 232 computed
  for `dd1a3718` do not apply to this Work.

**§10c Phase A was run on `dd1a3718` and does not transfer to this Work.** The walk's W4
commissions a fresh whole-scope reading, and that reading is what gets reviewed. W7 and W7b now
run on the same Work: the 11-08 false denial happened here.

**Walk links (founder's session on soullab.life):**
- Develop: `/writers-studio/develop?m=55742458-be2c-406a-a158-d0438cf02892`
- Work (canvas, Work conversation, reading permission):
  `/writers-studio/canvas?m=55742458-be2c-406a-a158-d0438cf02892`

**Precondition standing:** P1 ✅ · P2 ✅ · P3 source half ✅ (route trace, Work-independent),
markers ✅ (178), probe half owed during the walk · **P4 ✅ `55742458`** · P5 ✅ · P6 at walk start.

## 10f. Eight-reading assessment of `dd1a3718` — content-minimal receipt (2026-11-10)

This answers the review lane's task: assess the eight completed readings, read-only, with no new
provider call. The full assessment paraphrases MAIA's observations about private manuscript
content, so it is held **privately** for the founder (session scratchpad) and is ⛔ not
committed, posted or sent to another provider. This receipt carries identifiers, counts and
classifications only.

**Authority.**
- The founder (Work owner; `dd1a3718` and `55742458` have the same owner, verified) directed
  the assessment in session.
- Retrieval was a `READ ONLY … ROLLBACK` copy from production into this Claude Code session,
  via the same provider family that produced the readings.
- No new reading call, no write, no log of manuscript text.

| Reading | Lens | Rev | Obs | Refs (front · body · back · bib) |
|---|---|---|---|---|
| `217e0c66` | development | 1 | 14 | 4 · 45 · 7 · 0 |
| `8edc7fa5` | structure | 1 | 25 | 2 · 68 · 10 · 2 |
| `82912bf2` | continuity | 1 | 13 | 2 · 28 · 0 · 0 |
| `4c8ec5b1` | arc | 1 | 14 | 3 · 37 · 4 · 1 |
| `d8013cc3` | themes | 1 | 17 | 2 · 77 · 1 · 0 |
| `79d6a47d` | voice | 1 | 16 | 2 · 46 · 4 · 0 |
| `3ff2fb7e` | coherence | 1 | 27 | 3 · 77 · 9 · 0 |
| `8b4b9663` | reader | 1 | 21 | 4 · 53 · 10 · 0 |

- All eight are bound to draft `fdc33504` revision 1, still current, with body coverage
  55/55.
- Non-conclusions: author-intent, reader-effect and editorial-consequence on all 147;
  whole-work-pattern 66 · chronology 24 · authored-structure-relation 18 ·
  across-unread-span 11 · outside-coverage 9.
- Ranking phrases 0 · intent claims 0 · reader-effect predictions 0 · D1 markers 0/232 ·
  refs resolving 541/541.

**Classifications:**
- whole-work understanding **PASS**;
- developmental arc **PASS**;
- cross-element relationships **PASS**;
- editorial insight **PASS, with import contamination**;
- authorship **PASS**;
- provenance **PASS**;
- responsiveness to correction **UNWITNESSED**.

**Discrepancies, with no content in this receipt:**
- **D-a:** at least 8 observations across 4 lenses treat print-import artifacts (mid-sentence
  breaks, split headings, empty chapter opener, uneven Fire granularity) as features of the
  manuscript.
- **D-b:** a duplicated front-matter passage found by 5 lenses; real or import-made, unknown.
- **D-c:** a bibliography "Introduction" entry with no Introduction in this Work; `55742458` has
  Introduction sections, which suggests the print file dropped them.
- **D-d:** `outside-coverage` and `across-unread-span` declared on 20 observations despite 55/55
  body coverage.

**Outstanding questions:**
1. Does MAIA separate import damage from authorship once told? (W7 and W11)
2. D-b and D-c, founder checks against the manuscript.
3. D-d, for the developmental-reader owner.

**Bearing on the walk.** These readings are of an unfaithful import and are **not** the walk's
evidence (P4 = `55742458`). They show what the reader does with a whole book at full body
coverage: a strong, grounded, non-prescriptive developmental report. They make D-a's question
the sharpest one to put to MAIA in conversation.

## 10g. Founder-operated walk — readiness checklist (2026-11-10)

**Route: READY.** These reach the reader and Ask paths traced in §9:
`/writers-studio/canvas?m=55742458-be2c-406a-a158-d0438cf02892` and
`/writers-studio/develop?m=55742458-be2c-406a-a158-d0438cf02892`.

**Class A #1969 condition, not circumvented.**
- The held defect is the H1 hook `app/writers-studio/useHouseStudioH1WorkClaim.ts`:
  *"admission can retain previous member's verdict across session changes."*
- It is used by the P4R1 room controllers, and **only when `h1AdmissionNeeded(params)`**, i.e.
  when arriving through the House H1 path.
- **Walk condition:**
  - open the Work by the direct URLs above, not through the House;
  - use only the founder account in that browser, with no account switching during the walk;
  - if another account was signed in there earlier, sign out and back in as the founder
    first.
- ⛔ This is a containment for the walk, not a clearance of #1969.

**Agent-run walk: not possible now.** Claude in Chrome is not connected. If an agent drove the
walk, the evidence class would change: founder-witness items would stay UNWITNESSED, and W11's
founder wording cannot be supplied by an agent. **The walk is founder-operated.**

| # | Step | Status now |
|---|---|---|
| P6 | Sanctuary off | founder, at start |
| W1 | integrity of `55742458` | front matter checked by the founder in Write ✅; title runs across sections 1–3 and TOC entries sit at 8–10 (minor) |
| W2 | grant "Let MAIA read my saved work" | UNWITNESSED |
| W3 | MAIA states what she can access (revised first prompt) | UNWITNESSED |
| W4 | fresh whole reading from Develop; note the duration | UNWITNESSED |
| W5 | arc · missed opportunities · strongest · loss of force | UNWITNESSED |
| W6 | three things to improve, commissioned explicitly | UNWITNESSED |
| W7 | cross-chapter recall, opening and close; **ask about import damage vs authorship (D-a)** | UNWITNESSED |
| W7b | 11-08 false-denial regression on this Work | UNWITNESSED · kept separate in the record |
| W8 | leave and return, then sign out and back in | UNWITNESSED |
| W9 | Stop (revoke) mid-thread; Sanctuary probe | UNWITNESSED |
| W10 | manuscript stays central | founder witness only |
| W11 | issue-after-issue pass, ≥3 issues, resume | UNWITNESSED |
| After | Claude Code checks answers against 178 markers + reads receipts | owed |

## 10h. Developmental understanding — independent criterion (review lane, adopted 2026-11-10)

This is scored **separately** from the pass/fail ledger, on evidence from W3–W8 and W11.

| Ability | What is scored |
|---|---|
| **Recognition** | MAIA sees that the book explores the elements' relationship to lived experience, not merely a categorization of states |
| **Reorganization** | after the author's correction (checklist item 6), she genuinely revises her account of the architecture, rather than repeating the correction in agreeable language, and still names any evidence against the revised view |
| **Integration** | in a later session she brings the revised understanding back, grounds it in sections, and can still acknowledge contrary evidence |

**Scale:** 0 failed · 1 superficial · 2 grounded · 3 sustained and revisable · **UNWITNESSED**
when there is no evidence. ⛔ **No developmental score compensates for a source,
authorization or provenance failure.**

**Classification note.**
- The §10f assessment is **Claude Code's** read of the eight readings. It is **not** an
  independent evaluation and **not** the founder's editorial verdict.
- The interpretive quality of those readings stays **UNWITNESSED by the founder** until the
  founder reads them.

**Walk status as of this entry** (read-only check of production metadata):
- No scope grant events for this Work.
- No reading of `55742458` in the last two days.
- One Work conversation thread, from 2026-11-09 23:49Z (2 turns), which predates the walk.
- **The founder walk has not yet run.** The eight-item companion checklist is a template, and all
  eight items are open.

## 10i. Walk log — founder walk on `55742458` (2026-11-10, founder session, production)

**P6** Sanctuary off (founder).
**W2** ✅ The founder pressed "Let MAIA read my saved work". The scope event is a `grant` at level
`work`, 22:16:38Z. ⭐ The previous silent disabled Send now explains itself ("Send waits until you
do") — improved since 11-08. The founder started a new thread (`9cd3464f…`, 22:18:20Z).

**W3** — the revised first prompt (no interpretation supplied).
- **What MAIA reported having:**
  - the 261 headings;
  - the text of the one section the founder was standing in (the untitled opener, title only);
  - her own reading of 2026-09-08 (development lens, revision 5), of which she can see only
    **8 of 26 observations, several cut off mid-sentence.**

  She declined to go further than that.
- **Receipts:** exactly **one** crossing, `work_conversation->maia_cognition`, state `crossed`,
  section = pos 0 (39 chars), carrying the scope event. Answer provenance is
  `anthropic/claude-opus-5`, bound to that locus digest.
- **Markers:** 0 of 178.

| Check | Result |
|---|---|
| Epistemic integrity (self-report = receipts) | **PASS** — her account matches the receipt exactly |
| Recollection | **PASS** — 0/178 markers |
| Whole-work access under a granted Work-level scope | ⛔ **FAIL — named crossing** |

**The broken crossing, from source** (`lib/manuscript/ask/workReadScope.ts`). At `work` level the
host selects:
1. the locus;
2. then sections whose **heading the question names**;
3. then the whole Work **only if the question matches a fixed phrase list** ("whole / entire /
   full book|manuscript|work|draft", "throughout", "across the book|chapters", "overall",
   "from the start").

"What this book is fundamentally about… ground it in specific chapters" matches none of these,
so selection fell to the locus alone. Even when the phrases match, the 60,000-character budget
covers roughly a sixth of this Work.

The earlier reading reaches the conversation **truncated** (8 of 26 observations, cut
mid-sentence: `carriedReadings.ts`). ⛔ Not repaired; recorded as walk evidence.

*A granted Work-level scope does not make the whole Work available to a whole-Work question
asked in natural language.*

**W3 — MAIA's answer is cut off.** The stored answer is 1,315 chars and ends mid-sentence ("…and
treated again at"). The founder's screen shows the same. ⚠️ An answer truncated in storage or
generation is not attributed.

**W10 — founder witness, during W3** (primary data, recorded before any explanation):
1. *"the columns are FIXED! they should be movable."*
2. *"the Manuscript section looks terrible and it is not organized nor easy to follow especially
   on such a well developed manuscript."*

**Read-only context for (2):**
- This Work's Source already carries its hierarchy: `heading_depth` 1 on 25 sections, 2 on 25,
  3 on 211 (WS2-08 / BUILD-08A).
- But it has **0 confirmed structure units**, because member-confirmed hierarchy (BUILD-08B) is
  on HOLD.
- So the rail shows 262 entries as one flat list.
- **The crossing that's broken:** imported heading depth → the manuscript rail.

**For (1):** no column-resize mechanism exists in `app/writers-studio` (canonical `b3f246b45`),
and draft PR #2208 (Develop density views) does not address it.

⛔ Both are recorded, not repaired. They are product findings for founder decision outside the
walk.

**⚠️ Surface correction (founder, 2026-11-10).** W2–W3 ran on `/writers-studio/canvas`, a link
Claude Code supplied, which is **not** the founder's working studio. The working studio is
`/writers-studio?mode=…&m=…` (reached from Home), and its Write rail **already nests** Parts →
Chapters → sub-sections. So the flat-rail finding above applies to **canvas only**.

**The W2–W3 evidence stands:**
- the same Ask route (`manuscripts/[id]/ask`) and the same Work-level scope grant are shared;
- the real studio's Develop mode mounts the same `ReadScopeControl` (`DevelopStage.tsx`).

**Remaining steps run in the working studio:**
- **W3/W4/W5/W7 in Develop mode** (`/writers-studio?m=55742458-…&mode=develop`).
- **W11 in Write mode.** Its MAIA panel uses `/api/writers-studio/editorial/turn`, which §9 P3
  excludes from whole-book evidence because it carries the MAIA runtime framework prompt. W11
  is scored for the *pass behaviour* only, never as evidence of whole-book reading.

**W3b — Claude-run in the founder's session** (built-in browser, founder-directed: "run all of
the necessary tests here first"). Develop mode, same thread `9cd3464f`.
- **Prompt:** "Looking across the whole book, from the start to the end, what do you understand it
  to be fundamentally about? Tell me which parts of the text you actually have in front of you
  for this answer."
- **Receipts:** 40 sections crossed (= `MAX_READ_SECTIONS`), all carrying the scope event. The
  whole-book phrase path fired.
- **The answer is cut off at 140 chars**, stored and on screen identically: "…the three readings
  in front of me now are of Chapter".
- ⭐ The answer's "what she read" list is visible on screen, with "Go there / Read it here" per
  section. **L8 PASS.**

**⛔ BLOCKER for every conversational step: both Work-conversation answers in this walk are
truncated mid-sentence** (1,315 and 140 chars).
- `askReader.ts:593` caps answers at `maxTokens: 1200`.
- Answer provenance and the server logs record **no stop reason**, so the cause is
  **unattributed**. Whether the provider stopped at the token limit, or something else cut the
  text, can't be determined from stored evidence.
- The answer **got shorter as the context grew** (1 section → 40 sections). That is consistent
  with a budget being consumed before the visible text, but not proof of it.
- ⛔ **W5, W7, W7b, W8 and W11 were NOT run.** Their answers would be cut off and unscorable, and
  each attempt spends a model call on the founder's book.

**Found while walking, not tested:**
- **Develop mode's rail nests the whole outline** (Parts → Chapters → sub-sections, through
  Appendix and Bibliography).
- The studio already contains **"Start an editorial pass"** (`P4R1DevelopView.tsx`, inside "More
  ways to explore"). It runs the eight lens readings over the whole manuscript, then synthesizes
  an ordered list of places to edit, offering "revision directions and alternate wording. You
  decide what, if anything, to use." **That is the founder's W11 standard as an existing
  feature.** The control was not reachable from the section-reading view used here. Its
  location in the UI is to be found by the founder; not commissioned.

**Class A #1969:** the H1 admission hook engages whenever the Work parameter is present
(`h1AdmissionNeeded`). The containment is unchanged: founder account only, no account switching.
Prefer links without `from=house` for the walk.

## 11. Not authorized by this document

Code changes · migrations · making EA knowledge unreachable · deploys · posting this to #1800 ·
invitations · new JARVIS permissions · any change to HOLD #1938 or Class A #1969.
