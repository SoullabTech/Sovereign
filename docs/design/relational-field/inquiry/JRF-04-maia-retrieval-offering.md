**PROPOSED — NOT RATIFIED** · invocation JRF-04 · 2026-08-13

# JRF-04 — MAIA Retrieval and Offering

The protocol by which MAIA may **retrieve → attribute → temporally locate → offer
tentatively → receive correction** regarding relational material, and the seam
question underneath it: *where, on the live path, could such a block actually
reach the model?*

---

## Scope

**The question given:** design each of the five stages, and establish — not assume —
the live composition seam across FAST / CORE / DEEP.

**Examined:** the live conversation route and its addenda channel; `maiaService.ts`
tier processors; `maiaVoice.ts` prompt builders and the shared addenda helper; the
relational substrate under `lib/relationships/`; relational schema migrations; the
refusal registry and its executable twin; consent-gate precedents (atoms, anchors).

**Not examined:** production runtime (no `runtime_events` query, no container
inspection — this is a static trace against the working tree, branch
`feature/labtools-redesign`, dirty); the Relationship Room UI surfaces; RF-R6
recognition design; voice/TTS egress; the `between/chat` lane.

⚠️ **All repo evidence below is the working tree, not deployed `22200f967`.** Where a
claim is production-grounded it is because a prior audit document says so, and that
document is cited as the source of the production claim, not re-derived here.

---

## Evidence and existing infrastructure

### 1. The live route is `/api/sovereign/app/maia/list`

**FACT** The conversation client posts there: `components/OracleConversation.tsx:815`
(comment naming "the canonical `/api/sovereign/app/maia/list` fetch"),
`lib/hooks/useMaiaChat.ts:129`, `app/book-companion/ain/page.tsx:151`,
`components/academy/AcademySheet.tsx:240`.

**FACT** `app/api/oracle/conversation/route.ts` hard-refuses (`refusal: 'R19'` at
`:441`; `use: '/api/sovereign/app/maia'` at `:450`). It is the retired lane.

**FACT** A second live-ish file exists — `app/api/sovereign/app/maia/route.ts` (459
lines) — which also calls `getMaiaResponse` (`:22`) and carries the relational
observer (`:28-30`, fired at `:365-387`). It composes far fewer addenda than
`list/route.ts` (1583 lines). ⚠️ **Two sibling routes under the same segment both
call the generator.** Which one serves which client is **NOT ESTABLISHED**; the
grep above establishes only that the conversation UI calls `/list`.

### 2. There are TWO prompt-composition mechanisms, not one

**FACT — FAST.** `fastPathResponse` (`lib/sovereign/maiaService.ts:640`) reads each
addendum off `meta` into a local const (`:1110-1252`) and interpolates them by hand
into a single template literal, `baseSystemPrompt` (`:1288-1290`), which is passed
to `generateText({ systemPrompt: baseSystemPrompt })` at `:1333-1334`.
**Composition ESTABLISHED** — the string reaches the model.

**FACT — CORE.** `corePathResponse` (`:1373`) populates a `MaiaContext` from `meta`
(`:1577-1585`), calls `buildMaiaWisePrompt` (`:1589`), which calls
`appendAllContextAddenda` (`lib/sovereign/maiaVoice.ts:912`; defined `:488`), and the
result is passed to `generateText` at `:1717-1718`. **Composition ESTABLISHED.**

**FACT — DEEP-repair.** `buildMaiaComprehensivePrompt` (`maiaVoice.ts:952`) also calls
`appendAllContextAddenda` (`:1044`); invoked from `maiaService.ts:2227`, emitted at
`:2238-2239`. **Composition ESTABLISHED, conditional on the repair branch firing.**

**FACT — DEEP-primary.** The only prompt seam is the Claude consultation lane,
gated by `process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true'`
(`maiaService.ts:2080`). The in-code comment at `:2088-2091` states plainly: *"the
local orchestrator draft has no prompt seam by construction — it weaves templates,
it does not read a system prompt."*

**FACT** `MAIA_USE_CLAUDE_CONSULTATION` appears in **no** repo env file
(`.env`, `.env.local`, `.env.docker`, `.env.production`, `.env.staging`,
`.env.example` all checked directly), and in **no** compose file or Dockerfile.
Second, structurally different method: a repo-wide code/doc grep returns only three
kinds of hit — the read site, a doc string, and audit documents.
`docs/design/CAPSULE_ELIGIBILITY_DEEP_COMPOSITION_RECONCILIATION_2026-08-09.md:8,73`
records it **UNSET in the running production container**, concluding *"DEEP-primary
is the live DEEP behaviour."*

> ⭐ **DEEP-primary prompt arrival for any retrieval block is NOT ESTABLISHED, and
> the code comment says it is structurally unavailable, not merely unwired.**

### 3. `ADDENDA_SPECS` is a single point of truth for two tiers out of four

**FACT** `lib/sovereign/maiaVoice.ts:405-434` defines `ADDENDA_SPECS`, 24 entries,
iterated by `appendAllContextAddenda` (`:488-523`). Its own header comment
(`:371-378`) claims it is used by `buildMaiaWisePrompt` for *"FAST + CORE tiers."*

⚠️ **That comment is wrong on FAST.** `buildMaiaWisePrompt` is called at
`maiaService.ts:1589` and `:1744` — both inside `corePathResponse` (`:1373-1784`).
`fastPathResponse` never calls it. FAST re-declares the same addenda by hand.

**INFERENCE (from the two composition sites above):** adding one relational addendum
requires **two independent edits** — an `ADDENDA_SPECS` row *and* a new interpolation
in the FAST literal. This is not the historical divergence; it is a live one. It is
precisely the shape of the failure recorded in
`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` — which itself notes at
`:125` that the consultation lane is *"the only real prompt seam on DEEP-primary."*

### 4. ⭐ The Interface Humility guardrail does not reach FAST

**FACT** `INTERFACE_HUMILITY_GUARDRAIL` (`maiaVoice.ts:472`) is the codebase's
existing tentative-offering discipline — *"A signal is a question, never a verdict…
Prefer 'I notice…', 'I wonder…', 'does this fit?' over 'this means', 'you are'…"*

**FACT** It has exactly one append site: `maiaVoice.ts:521`, inside
`appendAllContextAddenda`. A repo-wide grep over `lib/` and `app/` returns only the
definition, that append, and one comment in `lib/practiceField/fieldGuidance.ts:21`.

**INFERENCE (from §2 + §3):** **FAST turns do not receive Interface Humility.** The
tier that carries the *most* member-retrieved material — I6, the FAST direct splice
of conversational + episodic recall, per
`docs/design/MEMORY_COMPOSITION_CONTRACT_2026-08-09.md` §1.1 — carries the *least*
offering discipline. That is the exact inversion this invocation exists to prevent.

### 5. Per-tier reachability is already mapped, and no ingress is tier-invariant

**FACT** `docs/design/MEMORY_COMPOSITION_CONTRACT_2026-08-09.md` §1.1 gives the
ingress×tier matrix and concludes: *"No ingress reaches all four tiers. No tier
receives all ingresses."* §2 gives the field-preservation matrix, in which
`supersession / correction` is **⛔ discarded by every single ingress**, and
`source / provenance` survives only as ⚠️ prose.

> ⭐⭐ **This is the decisive architectural fact for JRF-04.** The two fields the
> RF-R3 protocol depends on most — *provenance* and *supersession* — are the two the
> existing composition layer preserves worst. A2 §5's four-part eligibility test
> cannot be represented at the prompt boundary today in any typed form; only as prose
> MAIA may ignore.

### 6. A relational context block already exists — wired only to the dead lane

**FACT** `lib/relationships/buildRelationalContextBlock.ts` (107 lines,
founder-written, header records "V1.1 — written by Kelly, tested across two cheap
loops (12 conversations each)"), and `getMemberActiveRelationalContext`
(`lib/relationships/relationshipContextService.ts:64`).

**FACT** Both are imported by exactly one file:
`app/api/oracle/conversation/route.ts:84-85`, used at `:702`, `:2409`, `:2526` —
**the retired R19 lane.** Grep across `lib/`, `app/`, `components/` returns no other
importer. The live route imports only `detectRelationalSignal` and
`persistDetectedSignal` (`list/route.ts:11-12`) — the **write** side.

> ⛔ **The relational read path is severed on the live route, exactly as spiral-state
> was.** The write fires; nothing composes it back.

**FACT — the eligibility predicate that exists** (`relationshipContextService.ts:84-90`):
selects one `member_relationships` row by `member_id`, `archived_at IS NULL`, and
`updated_at > NOW() - ($2 || ' days')::interval`, `ORDER BY updated_at DESC LIMIT 1`.
Then entries by `relationship_id`, `ORDER BY created_at DESC LIMIT $2` (`:131-135`).

⚠️ **There is no consent term in that predicate.** Recency is the only gate.

### 7. ⭐ The existing block is a NON-retrieval doctrine

**FACT** `buildRelationalContextBlock.ts` instructs, verbatim in part:
*"What you are given to see is not what you are given to say."* It forbids naming the
themes, listing the tensions, narrating the continuity, referencing mode/realm/bond
as labels; requires that *"If a pattern is named, the user names it first… If the
other person is named, the user names them first"*; and closes *"Say less than you
think you should."* Its header warns: *"IF MAIA'S STANCE BREAKS IN PRODUCTION:
tighten constraints. Do NOT add data."*

**This is a live contradiction with A1/A2 and is surfaced, not reconciled** — see
§Constitutional conflicts.

### 8. Schema — the RF-R3 constraints are absent from every existing table

**FACT** `member_relationships` (`database/migrations/20260403000001_relationship_field_v1.sql:5-14`):
`id, member_id, name, realm, bond_type, note, created_at, updated_at, archived_at`.
No consent column. No `posture_at_creation`.

**FACT** `relationship_entries` (same file, `:39-52`): `kind` ∈ (checkin, note,
reflection, threshold, rupture, repair), `felt_signals[]`, `free_text`,
`maia_reflection`, `pattern_hint`, `field_tone_snapshot`, `suggested_movement`,
`content`, `confidence`, `created_at`. **No gesture witness. No write-once guarantee
on `free_text`. No `superseded_by`. No `affirmed_at`. No consent gate.**
⚠️ Note `maia_reflection` sits in the *same row* as member text — MAIA's words and
the member's words share a record with no structural separator.

**FACT** `member_relational_signals`
(`database/migrations/20260409000010_member_relational_signals.sql:49`):
`source TEXT NOT NULL CHECK (source IN ('maia_conversation', 'labtool_manual'))`.
Confirms A2 §0's account exactly — the column is a downstream label.

### 9. Consent-gate and rendering precedents that already work

**FACT** `lib/maia/memoryAtomsLoader.ts:279` — `AND return_preference IN
('contextual_doorway', 'ritual_review_opt_in')`, enforced **in the loader's SQL**.
**FACT** `lib/anchor/loadRecentAnchors.ts:66` — same shape on `surface_preference`.
A2 §7 directs `retrieval_consent` to follow this, not invent a third.

**FACT — attribution rendering precedent.** `formatAtomsForPrompt`
(`lib/maia/memoryAtomsLoader.ts`) emits `# MEMBER-PLACED PORTFOLIO`, states *"These
are member-placed, not system-inferred,"* renders each item as
`"title" — kept <relative time> — …`, tags `marked as a breakthrough by the member`,
and closes with *"Discipline: surface as the atoms themselves declare. No cross-atom
claims."* This is a working attribution + temporal + anti-synthesis template.

**FACT — temporal rendering precedent.** `lib/maia/conversationalRecallBlock.ts:156-161`
yields relative strings: `N weeks ago`, `N days ago`, `N hours ago`.
⚠️ **Relative-only.** A2 §5's exemplar is *absolute* — *"You wrote in June."*
No absolute-date renderer for member material was found.

### 10. Refusal registry — and what is NOT in it

**FACT** `docs/architecture/REFUSAL_REGISTRY.md` ("Candidate certification instrument
— NOT canon"), executable twin `tests/constitutional/refusal-registry/index.ts:12-33`.
Range **R01–R22, no R12** (R11's slot is `R-A5`).

> ⚠️ **R23 and R24 do not exist.** The invocation prompt named them; a grep for
> `\bR2[3-9]\b` across `docs/`, `lib/`, `app/`, `tests/` returns nothing. **NOT
> ESTABLISHED** — treat those two IDs as unallocated, and available.

**Covering this seam, partially:**

| ID | What it holds | Enforcement |
|---|---|---|
| **R04** | `sacred_protected` atoms never surface in ambient recall | loader SQL |
| **R07** | a declined practitioner observation never resurfaces | SQL predicate |
| **R08** | no ambient Daily Anchor without member standing consent | `lib/anchor/surfacePreference.ts:15,17,41` |
| **R14** | system never authors member identity at the emission boundary | `lib/sovereign/identityPredicateGuard.ts:74` |
| **R16** | persisted inferred developmental state cannot shape stance un-admitted | `lib/relational/developmentalStateAdmission.ts` |
| **R18/R20/R21** | Sanctuary boundaries | routes + stores |

**NOT covered — genuine gaps:**

1. ⛔ **No refusal governs MAIA speaking about a relationship or a third person.**
2. ⛔ **No refusal governs temporal misrepresentation** — presenting a superseded or
   old declaration in the present tense. A2 §5 clause 4 has no enforcement analogue.
3. ⛔ **No refusal governs attribution-carrying** — that retrieved material must
   arrive marked with who said it.

### 11. The one tier-invariant chokepoint that exists

**FACT** `finalizeMemberFacingText` (`maiaService.ts:2344-2371`) runs
`sanitizeMaiaOutput`, presence constraints, and `enforceIdentityPredicateConstraint`
(the R14 guard, `:2362`), then logs telemetry. It is called at `:3031` inside
`getMaiaResponse` (`:2372`), plus a separate RCN branch at `:2830`.

**INFERENCE (from the call at `:3031` sitting in `getMaiaResponse` after tier
dispatch, all three tier processors being invoked from within `getMaiaResponse`):**
this is an **egress chokepoint that all tiers pass through.** ⚠️ Not verified by
execution; the `:2830` branch means there is more than one finalize path.

> ⭐ This matters enormously: composition is tier-divergent and DEEP-primary has no
> seam at all — but **egress converges.** A guarantee placed at ingress protects at
> most 2.5 tiers; a guarantee placed at egress protects all of them.

---

## Proposed design

**RECOMMENDATION** throughout. Nothing below is authorized; building is closed.

### Stage 0 — the governing asymmetry (design premise)

**RECOMMENDATION.** Because composition is provably tier-divergent (§2, §5) and
DEEP-primary has no prompt seam by construction (§2), **the retrieval protocol must
not be built as an ingress-only guarantee.** It must be *paired*:

- **Ingress** determines *what MAIA is permitted to know this turn* (eligibility).
- **Egress** determines *what MAIA is permitted to have said* (utterance form).

A design that only does ingress will be correct on CORE, correct on FAST only after a
duplicated edit, and **silently absent on DEEP-primary** — where the member cannot
tell the difference. That is the failure this programme already committed once.

### Stage 1 — Retrieve

**RECOMMENDATION — the eligibility predicate.** A declaration is eligible iff, in the
**loader's SQL**, not in caller code:

```
declaration exists for this assertion            (A2 §1 — event, not column)
AND relationship_id = <the relationship in view> (A2 §9 — required at creation)
AND retrieval_consent = TRUE                     (A2 §8.2 — silence is not consent)
AND withdrawn_at IS NULL                         (A2 §4 — withdrawal stops retrieval)
AND posture_at_creation IS DISTINCT FROM 'sanctuary'   (A2 §7)
AND member_id = <authenticated member>
```

Currentness is **not** a filter. A superseded declaration remains retrievable and is
rendered *as history with its date* (A2 §5 clause 4). Filtering it out would silently
destroy the member's own record of change — which is the substance of A1 §2's
*"visible history of what changed and when."*

**RECOMMENDATION — eligibility is computed, never stored.** Per A2 §9: no
`is_eligible` / `is_current` column. The loader derives standing by joining the
declaration to its lineage each time. ⛔ No cache, no materialized view, no
denormalized bit.

**RECOMMENDATION — where it runs.** In a loader under `lib/relationships/`, called
from `app/api/sovereign/app/maia/list/route.ts` inside the existing
`allowCrossSessionMemory && userId` guard (the block spanning `:837-950`, alongside
atoms and conversational recall), producing `relationalDeclarationsAddendum` on
`meta`. This reuses the proven gate; it does not invent a second one.

**RECOMMENDATION — currentness is not a TTL.** ⛔ Do **not** reuse
`relationshipContextService`'s `updated_at > NOW() - interval` recency window (§6) as
a standing gate. Recency is a *relevance* heuristic; standing is a *lineage* fact.
Conflating them lets the passage of time perform supersession — a system act on a
member's declaration, forbidden by A2 §4.

### Stage 2 — Attribute

**RECOMMENDATION.** The block must be **typed at load and rendered with attribution
inline**, following `formatAtomsForPrompt` (§9), not free prose. Minimum per item:

| Carried | Rendered as |
|---|---|
| `declared_text` (verbatim, never paraphrased) | in quotation marks |
| who authored it | *"you wrote"* / *"you said"* — second person, member-authored |
| that it was **declared**, not observed | section header naming the class |
| its relationship referent | the relationship as the member named it |
| standing | current · superseded on \<date\> · corrected on \<date\> |

**RECOMMENDATION — one section per class, never merged.** DECLARED material and
MAIA's own in-turn OBSERVED material must occupy **separate, separately-headed
sections**. A2 §3 makes the classes disjoint; a merged block is where the distinction
dies, because the model sees one list.

⛔ **Do not render `maia_reflection` in the same item as member text** (§8). MAIA's
prior words re-entering as if member-authored is the laundering path.

**RECOMMENDATION — a `# RELATIONAL DECLARATIONS` header carrying its own discipline
line**, exactly as atoms do: *"These are the member's own declared words, preserved
as written. They are not system observations. Do not cross-reference or synthesize
across them."*

### Stage 3 — Temporally locate

**RECOMMENDATION.** Every retrieved declaration carries **an absolute date, not only
a relative one.** §9 establishes the codebase has only relative rendering. A2 §5's
exemplar is absolute (*"in June"*) for a reason: *"three weeks ago"* degrades
gracefully into ambient present-tense, *"in June"* does not.

**RECOMMENDATION — three temporal forms, chosen by standing, not by age:**

| Standing | Rendered |
|---|---|
| current, affirmed | *"you wrote in \<month\>, and affirmed it in \<month\>"* |
| current, never re-affirmed | *"you wrote in \<month\>"* — no affirmation implied |
| superseded | *"you wrote in \<month\>; in \<month\> you said that had changed"* |
| corrected | *"you wrote in \<month\>; you later corrected that to \<text\>"* |

**RECOMMENDATION — the block states the negative explicitly.** A line the model
cannot route around: *"You do not know whether any of this is still true. The dates
tell you when it was said, not whether it holds now."* Absent this, the model
supplies present tense by default — that is what language models do with undated
propositions, and it is not fixable by hoping.

### Stage 4 — Offer tentatively ⭐ (the heart)

**RECOMMENDATION — the utterance rule, in one line:**

> **MAIA may quote what the member said, dated. She may ask whether it still holds.
> She may not state what the relationship is.**

**PERMITTED utterances:**

- *"You wrote in June: 'we've stopped calling'. Is that still how it is?"* (A2 §5, verbatim)
- *"In March you described wanting more distance there. You're speaking differently
  today — does that feel like a change, or are both present?"* (A1 §3's shape)
- *"You said something about this before, and then you corrected me. I want to make
  sure I'm carrying the correction, not the first version."*
- *"You told me this mattered. I don't know whether it still does."*
- *"I have something you wrote about this. Do you want me to bring it in?"* — ⭐ the
  **asked-permission** form, appropriate when the material is heavy.
- *"I noticed something while you were speaking just now — that's mine, not yours,
  and it may be wrong."* (OBSERVED, in-turn, attributed to MAIA — A2 §3)

**FORBIDDEN utterances:**

- ⛔ *"Your relationship with X is distant."* (A2 §5, verbatim prohibition)
- ⛔ *"You've been struggling with your mother."* — present tense over a past declaration
- ⛔ *"There's a pattern here where you become the one who repairs things."* — INFERRED
  class, closed until RF-R6 (A2 §3)
- ⛔ *"I've noticed you tend to…"* — an observation asserted as accumulated knowledge;
  OBSERVED is in-turn only (A2 §8.3)
- ⛔ *"I know this has been hard for you."* — claims knowledge of present state
- ⛔ *"Based on what you've shared, it seems like the boundary isn't holding."* —
  synthesis across declarations
- ⛔ *"She probably feels…"* — claims knowledge of the third person
  (`buildRelationalContextBlock` already forbids this; it must survive)
- ⛔ *"You told me you were done with that"* used as **leverage** — a declaration
  quoted back to hold a member to a past self. ⭐ This is the most dangerous
  permitted-looking move in the entire protocol: the sentence is *true*, *attributed*,
  and *dated*, and it is still a violation, because its function is not offering but
  binding. It fails A1's *"remain free to determine what it means."*

**RECOMMENDATION — the grammatical test, stated so it can be checked mechanically:**

> A retrieval utterance must be **either a quotation with a date, or a question.**
> Never a declarative sentence in the present tense whose subject is the member, the
> other person, or the relationship.

This is the same grammatical shape `enforceIdentityPredicateConstraint` already
enforces for identity (§10, R14) — extended from *"you are X"* to *"your relationship
is X."* **Reuse that guard's mechanism; do not write a second one.**

**RECOMMENDATION — one offer per turn.** Retrieval that surfaces three declarations
at once is a dossier reading, not a witness. A1 §2: *"a continuity space, not a
psychological dossier."*

### Stage 5 — Receive correction

**RECOMMENDATION — a correction must be an event with a record, or the loop is
theatre.** A2 §5 closes: *"the member's answer is itself a gesture, and therefore may
produce a new Declaration."* Concretely, when MAIA offers and the member contradicts:

1. **In-turn (already exists).** `buildCorrectionRepairBlock`
   (`list/route.ts:783-797`, `meta.correctionRepairAddendum`) detects a correction
   signal in the member's message and injects a block placed **last** among addenda.
   ⭐ **Reuse this.** It is deterministic, DB-free, Sanctuary-safe, and already live.
   ⚠️ It reaches FAST (`maiaService.ts:1238-1241`) and CORE/DEEP-repair
   (`ADDENDA_SPECS`) — and **not DEEP-primary**.
2. **MAIA's obligatory in-turn move.** The block must require, not suggest: *drop the
   prior framing entirely; do not defend it; do not explain why you offered it; state
   that you are carrying the correction forward.*
3. **Durable — and here is the boundary.** ⛔ MAIA may **not** write the correction.
   A2 §4 forbids any system process from performing Affirm/Correct/Supersede/Withdraw/
   Release, and A2 §4's ⭐ note requires the member's *intent* to be captured
   explicitly — *"a system that guesses which one happened is authoring meaning
   again."* MAIA cannot know whether the member meant **Correct** (*"that's not what I
   meant"*) or **Supersede** (*"true then, not now"*). ⛔ She must not choose.
4. **RECOMMENDATION — the offer, not the write.** MAIA offers a gesture the member
   performs: *"Do you want to change what you wrote, or add that it's since changed?"*
   The member's tap is the authenticated act; the resulting Declaration begins there,
   **never backdated** (A2 §8.1). Two buttons, two meanings — because the two meanings
   are constitutionally distinct.
5. **RECOMMENDATION — the consequence that makes it real.** Until the member acts, the
   corrected declaration is **suppressed from retrieval for the remainder of the
   session** — an in-memory, session-scoped suppression, ⛔ never persisted (A2 §8.3's
   anti-laundering clause: a suppression row readable as *"the member disputes this"*
   **is** persisted relational knowledge, whatever the table is called). MAIA being
   contradicted and then re-offering the same thing two turns later is the failure
   mode that makes correction feel decorative.

### Stage 6 — Seam placement

**RECOMMENDATION — ingress, in order of what it actually buys:**

1. Add **one** `ADDENDA_SPECS` row in `lib/sovereign/maiaVoice.ts` → CORE +
   DEEP-repair. ✅ verified mechanism.
2. Add the matching interpolation to the FAST literal (`maiaService.ts:~1290`) → FAST.
   ⚠️ **Duplicated edit — unavoidable until §3's divergence is closed.**
3. DEEP-primary: ⛔ **no seam exists.** Do not claim coverage. State it in the ship
   note as **NOT ESTABLISHED**, and let it be a known hole rather than an assumed fix.

**RECOMMENDATION — egress, which is what actually holds:** extend
`enforceIdentityPredicateConstraint` (`lib/sovereign/identityPredicateGuard.ts`) with
a **relational-predicate** pattern set, so that a declarative present-tense assertion
about a relationship or a third person is reframed before emission. Because
`finalizeMemberFacingText` is a convergent chokepoint (§11), this is the only
protection that covers DEEP-primary at all.

⚠️ This makes the egress guard the **load-bearing** control and the ingress block the
*enabling* one — the inverse of how memory layers have been built here so far. Stated
plainly because it is the substantive design claim of this document.

**RECOMMENDATION — before any of it: fix the Interface Humility hole (§4).** Appending
`INTERFACE_HUMILITY_GUARDRAIL` to the FAST literal is a two-line change that closes an
existing, unrelated, live defect. ⚠️ Per JARVIS Core §D — *do not absorb adjacent
defects merely because they were discovered* — it is reported here as a **separate
finding warranting its own unit**, not folded into this work.

---

## Risks and falsification cases

1. **The egress guard is regex-shaped and relational predicates are not.**
   *"Things seem harder with her lately"* is a verdict with no copula. If a pattern set
   cannot reach acceptable recall on such sentences, the egress recommendation
   collapses and the design is ingress-only — i.e. DEEP-primary is uncovered, and this
   document's central claim is **wrong**. **This is the primary falsifier.**
2. **The FAST literal drifts again.** If a subsequent addendum lands in
   `ADDENDA_SPECS` only, relational material becomes CORE-only while logs report it
   emitted. Falsifier: a per-tier emission witness disagreeing with `PROMPT_BLOCK_CHARS`.
3. **Prompt instructions are not guarantees.** *"You do not know whether this is still
   true"* is an instruction the model can override — as it demonstrably did on
   2026-08-04, when MAIA denied having memory while memory was injected
   (`list/route.ts:1112-1120`). Falsifier: a member turn where MAIA speaks a dated
   declaration in present tense with the block present.
4. **`buildRelationalContextBlock` and a retrieval block cancel each other.** One says
   *say nothing of what you were given*; the other supplies material to quote. A model
   receiving both may go silent (safe, useless) or resolve the conflict arbitrarily
   (unsafe). Falsifier: a test loop of the kind Kelly already ran, 12 conversations,
   both blocks present.
5. **Session-scoped suppression leaks.** Any implementation that persists suppression
   violates A2 §8.3. Falsifier: a store from which *"member disputed X"* is readable.
6. **One-offer-per-turn is unfalsified.** I asserted it from A1 §2's *"not a dossier."*
   It may simply be wrong — some members may want the whole history. **Untested.**
7. **The two-route ambiguity (§1).** If `app/api/sovereign/app/maia/route.ts` also
   serves live traffic, everything designed for `/list` misses it. **NOT ESTABLISHED.**

---

## Constitutional conflicts

**Named, not resolved. All require founder adjudication.**

### C1 ⭐ — `buildRelationalContextBlock` vs. A1/A2 retrieval

**FACT** The founder-authored, loop-tested block says: *"What you are given to see is
not what you are given to say… Do not name the themes you have been told about… If a
pattern is named, the user names it first."*

**FACT** A1's movement is `retrieve → attribute → offer → ask → receive correction`,
and A2 §5's exemplar has MAIA *quoting the member's declaration aloud.*

⚠️ **These are not obviously reconcilable, and I will not reconcile them.** A candidate
distinction — the block governs **inferred/observed** material (which must stay silent)
while A2 governs **declared** material (which the member authored and consented to hear
back) — is *plausible*, is consistent with A2 §3's disjoint classes, and is **not
stated in either document.** The V1.1 block's own instruction is *"tighten constraints.
Do NOT add data,"* and a retrieval block is definitionally adding data.

⛔ Note also: the block's header warns the reflex when stance fails is to widen the
context block, and *"that makes the prompt heavier without making it sharper."* RF-R3
retrieval is exactly that reflex, arriving with better provenance. That may make it
legitimate. It does not make it different in shape.

### C2 — `maia_reflection` shares a row with member text

`relationship_entries.maia_reflection` (§8) sits beside `free_text`. A2 §3's classes
are disjoint; this column is a structural blend point. ⛔ Not a bug to fix in passing —
it is prior custody, and it is where MAIA's words can re-enter as the member's.

### C3 — the 18 UNPROVEN entries are visible to a naive loader

A2 §8.1: the 18 `relationship_entries` with `confidence IS NULL` are **not**
retro-eligible. But `getMemberActiveRelationalContext` (§6) selects entries with **no
class filter at all**. Any loader modelled on it inherits the defect. ⚠️ The existing
code contradicts A2 §8.1 today — it is inert only because its sole caller is retired.

### C4 — Sanctuary posture cannot be reconstructed

A2 §7: declarations must carry `posture_at_creation` **from creation**, never
backfilled. `member_relationships` and `relationship_entries` have no such column
(§8). ⛔ Therefore no existing relational row can ever be proven non-Sanctuary. This
is a further, independent reason the 18 cannot be promoted — it reaches the same
conclusion as A2 §8.1 by a different route.

### C5 — R14's guard vs. quoting a member's own words

`enforceIdentityPredicateConstraint` reframes second-person identity predicates.
*"You wrote: 'I am done with him'"* contains one — inside a quotation the member
authored. ⚠️ If the guard is extended per Stage 6 without quotation-awareness, **it
will mutilate the member's own preserved wording**, violating A2 §2 requirement 4
(`declared_text` immutable) at the emission boundary. Any extension must be
quote-aware. **This is a real, specific, checkable hazard.**

### C6 — the retrieval block is invisible on DEEP-primary

A1 §6 requires **visible corrigibility**. On DEEP-primary the block does not arrive,
so there is nothing to correct — while the member sees the same MAIA. ⚠️ A capability
that is present on some turns and absent on others, with no member-visible difference,
is a **corrigibility** failure, not merely a coverage gap.

---

## Reuse opportunities

**Must not be duplicated.**

| Substrate | Path | Reuse for |
|---|---|---|
| Consent-gate-in-SQL pattern | `lib/maia/memoryAtomsLoader.ts:279`; `lib/anchor/loadRecentAnchors.ts:66` | `retrieval_consent` predicate (A2 §7 directs this) |
| Attribution + anti-synthesis rendering | `formatAtomsForPrompt` | the declarations block's shape, headers, discipline line |
| Relative-time renderer | `lib/maia/conversationalRecallBlock.ts:156-161` | ⚠️ needs an **absolute-date** sibling |
| Addenda registry | `ADDENDA_SPECS`, `maiaVoice.ts:405-434` | one row — CORE + DEEP-repair |
| Route-level consent gate | `list/route.ts` `allowCrossSessionMemory && userId` | the loader call site |
| In-turn correction repair | `lib/maia/correctionRepair.ts`; wired `list/route.ts:783-797` | Stage 5.1–5.2 entirely |
| Egress identity guard | `lib/sovereign/identityPredicateGuard.ts` | extend, ⛔ do not fork (see C5) |
| Relational stance doctrine | `lib/relationships/buildRelationalContextBlock.ts` | ⭐ **recover, do not rewrite** — founder-authored and loop-tested |
| Ingress×tier map | `docs/design/MEMORY_COMPOSITION_CONTRACT_2026-08-09.md` §1.1, §2 | ⛔ do not re-derive; extend |
| Refusal registry + harness | `tests/constitutional/refusal-registry/index.ts` | new refusal IDs (R23/R24 unallocated) |
| Sanctuary relational guard | `app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts` | posture enforcement precedent |

---

## Unresolved founder decisions

1. **Does `buildRelationalContextBlock`'s "what you see is not what you say" govern
   DECLARED material, or only INFERRED/OBSERVED material?** *Recommended ruling:* it
   governs INFERRED and OBSERVED absolutely, and does **not** govern a member's own
   consented, dated declaration quoted back to them — because the member authored it
   and separately consented to hearing it. The two blocks then compose rather than
   collide. **This must be ruled explicitly; it is currently ambiguous in both
   documents, and no implementer should resolve it.** (C1)
2. **Is the load-bearing guarantee at ingress or at egress?** *Recommended ruling:*
   **egress** — extend the R14 identity-predicate guard to relational predicates,
   quote-aware. It is the only chokepoint reaching DEEP-primary, and prompt
   instructions have already been demonstrated overridable in production. (§11, §2)
3. **Must relational retrieval be suppressed entirely on DEEP-primary until it has a
   prompt seam?** *Recommended ruling:* **yes** — a capability silently absent on some
   turns fails A1 §6 visible corrigibility. Route-level: if the turn resolves DEEP and
   consultation is off, do not load. Absence of a claim beats an unevenly honoured one.
4. **When a member contradicts MAIA, may MAIA write anything durable?**
   *Recommended ruling:* **no.** She offers the gesture; the member performs it; the
   Declaration begins at that act. A2 §4 forbids system-performed correction, and MAIA
   cannot distinguish Correct from Supersede without guessing the member's meaning.
5. **May session-scoped suppression of a contradicted declaration exist in memory?**
   *Recommended ruling:* **yes, in memory only, never persisted** — otherwise
   correction has no consequence and the loop is decorative; but any durable row would
   be laundered relational knowledge under A2 §8.3.
6. **Must retrieved declarations carry absolute dates, not only relative ones?**
   *Recommended ruling:* **yes** — A2 §5's own exemplar is absolute, and relative
   phrasing degrades into ambient present tense, which is the precise failure the
   temporal-location stage exists to prevent.
7. **Should two new refusals be allocated — relational-retrieval-consent and
   temporal-misrepresentation?** *Recommended ruling:* **yes, R23 and R24** (verified
   unallocated), each with an executable harness, since neither is covered today and
   both are load-bearing for this protocol.

---

## Dissent and uncertainty

**Where I disagree with the design authority.**

⚠️ A2 §5 presents retrieval eligibility as though the four clauses can be satisfied
and the offer then follows. **The composition layer cannot represent clauses 1 and 4.**
Per `MEMORY_COMPOSITION_CONTRACT` §2, `supersession / correction` is discarded by
*every* ingress and provenance survives only as prose. So *"offer it as history with
its date"* is not, today, a property of the system — it is a sentence in a prompt the
model may ignore. **A2 §5 as written describes an intention; it does not describe a
capacity.** I do not think it should be softened — I think the gap should be named in
A2 rather than discovered at build time.

⚠️ I also dissent, mildly, from A1's framing that MAIA "enters as witness." On
DEEP-primary she cannot enter at all (§2). *"MAIA enters as witness"* is true of
FAST and CORE and **NOT ESTABLISHED** for the tier that fires on the deepest turns —
which is, plausibly, exactly when relational material matters most. That inversion is
worth the founder's attention independently of this protocol.

**Where I disagree with myself.**

- The egress-guard recommendation (Stage 6, decision 2) is the strongest claim here
  and rests on a regex-class mechanism handling a semantic problem. Relational
  verdicts are frequently copula-free. ⚠️ I recommend it because it is the only thing
  reaching DEEP-primary, **not** because I am confident it works. If risk 1
  falsifies, decision 2 should be re-ruled.
- I recommended one offer per turn on aesthetic and constitutional grounds with **no
  member evidence.** It may be paternalistic.
- I am uneasy that the whole protocol makes MAIA quote people to themselves. Even
  perfectly executed — attributed, dated, tentative, correctable — there is a register
  in which *"you wrote in June…"* lands as being kept a file on. A1 §2's *"continuity
  space, not a psychological dossier"* is a distinction of **intent**; whether it is a
  distinction of **experience** is a member-witness question, and nothing in this
  static trace can answer it. ⚠️ **I would not call this protocol validated by any
  amount of code review.**

**NOT ESTABLISHED, collected:**

- DEEP-primary prompt arrival for any retrieval block (code comment says structurally
  unavailable; production `MAIA_USE_CLAUDE_CONSULTATION` UNSET per cited audit).
- R23 / R24 — **do not exist**; register is R01–R22, no R12.
- Whether `app/api/sovereign/app/maia/route.ts` serves live traffic alongside `/list`.
- Tier coverage of `finalizeMemberFacingText` (inferred convergent from the `:3031`
  call site; a second finalize path exists at `:2830`; not execution-verified).
- Any production runtime claim whatsoever — this is a static trace of a dirty working
  tree on `feature/labtools-redesign`, **not** deployed `22200f967`.
