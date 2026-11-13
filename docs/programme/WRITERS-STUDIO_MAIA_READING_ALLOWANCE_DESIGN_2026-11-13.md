# Writer's Studio — the MAIA reading allowance (design, 2026-11-13)

**Owner lane:** SoullabTech/Sovereign#1800. JARVIS flow under `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md`.
**Canonical read:** `origin/clean-main-no-secrets` = `1645d041c9`.
**Standing:** DESIGN ONLY. ⛔ No source, flag, migration or deploy. Every code statement is a code-read at `1645d041c9`
(census by a read-only search agent, load-bearing lines re-checked by hand: `passRun.ts:32,151`,
`anthropicStructuredAdapter.ts:118,139`, `oracleUsageLoggingService.ts:63,83`). Nothing here is a runtime or member witness.

## 0. Rulings this serves (all 2026-11-13, founder, recorded on #1800)

| Ruling | Words |
|---|---|
| Free keeps writing | *"pro writing should be still available on free"* |
| Free never limits Works; meter MAIA | *"Yes, meter MAIA instead"* (after proposing *"a certain bandwidth"* — *"several smaller works … or a large work that would take up that bandwidth"*) |
| The conflict with "new Works only" resolved | *"Meter MAIA, retire the limit"* — `WS_FREE_WORK_LIMIT_ENABLED` stays off; **step B's Free door waits for this meter** |
| Pro | the whole-book editorial pass (`writing.wholeWork`) + a much larger MAIA allowance + each Pro capability as it ships |

## 1. Census — where MAIA reads a writer's material

**One seam carries almost everything.** 17 of 19 acts reach the model through `runStructured`
(`lib/ai/structured/router.ts:66`) → `executeOnce` (`lib/ai/structured/anthropicStructuredAdapter.ts`), Anthropic only, no
retries, and that path already returns `usage { inputTokens, outputTokens }` (`:118,139`). The two exceptions: **Focus**
(`/api/writers-studio/focus` → `modelService.ts`, Claude with an Ollama fallback) and **Candidates**
(`manuscripts/[id]/candidates` → `LLMProvider` `core` tier, Ollama when `LOCAL_TIER_ENABLED`).

| Act (route) | Writer's gesture | Material | Calls per gesture | Limit today |
|---|---|---|---|---|
| `manuscripts/[id]/readings` | one lens | whole Work or a range, ≤500k code points | 2 | none |
| chapter review (client loop → readings) | "Review chapter" | one chapter | up to 18 | none |
| `manuscripts/[id]/editorial-pass` (Pro) | whole-book pass | whole Work | ~20, up to 38 | **3 runs / member / rolling day** (`MAIA_PASS_RUNS_PER_DAY`, `passRun.ts:32,151`); Free gets one taste per Work (`WS_PRO_TASTE_ENABLED`) |
| `attention-map` + letter opening | synthesis / kept letter | observations, short quotes | 1–2 | none (deep mode is Pro) |
| `manuscripts/[id]/ask` | a question | ≤40 sections / 60k chars + history | 1–2 | none |
| `living-works/[id]/ask` | a question about a Work | no prose | 1 | none |
| `writers-studio/arrival` (Spark door) | first conversation / first page | ≤12k chars + ≤20 turns | 1 | admission only |
| `plans`, `review-discuss`, `developmental-orientation`, `lineage-orientation` | one act each | bounded | 1 | none |
| `structure/read` | structure reading | ≤8 sections / 60k chars | up to 3 | none |
| `lineage-scan` | lineage scan | **whole Work, no size cap** | 1 | none |
| `lineage-chapter` | chapter lineage | windows of ≤30k chars | 1 per window, parallel, split-retry | none |
| `living-works/[id]/source-field-orientation` | orientation | all non-Sanctuary sources, **no cap** | 1 | none |
| `writers-studio/editorial/turn` | editorial turn | passage + whole thread | 1 | none |
| `writers-studio/focus` | focus | section / range / whole Work, **no cap** | ≥1 | none |
| `manuscripts/[id]/candidates` | find quotes | one section in 20k chunks | 1 per chunk | none |

**What is recorded today:** nothing aggregates usage and nothing computes cost. Tokens are kept only in pieces —
`ask_turns.answer_provenance` (output only), `editorial_turn_bindings` (full usage), a refusal audit file (no member id),
an opt-in console line. `editorial_pass_run_events` has no tokens. **So no one can yet say what a Free writer costs.**

**Precedents to reuse:** `oracle_usage_events` + `checkUserQuota()` (`lib/learning/oracleUsageLoggingService.ts:63,83`,
`ORACLE_DAILY_QUOTA` default 50) — a per-member usage table with a quota check; `audio_usage_events` keyed by member;
the pass's own `daily_limit` refusal. No Writer credit or monthly meter exists.

## 2. Design

### 2.1 What is metered — and what never is

- **Metered:** a model call that reads the writer's material on a member's behalf, through Claude. Every row in §1.
- **Never metered:** writing, saving, revising, reading one's own Works, export, erasure, import, the Studio itself,
  and any call answered by local Ollama (no cost).
- **Sanctuary is never metered and never recorded.** The Sanctuary invariants (CLAUDE.md, "Minimal metadata — only log
  that a sanctuary session occurred") allow no per-turn usage row. The acts that run in Sanctuary today (Work-anchored ask
  without sections, Living-Work ask, arrival) carry no prose and are small, so the exposure is bounded. A meter that
  would need to remember a Sanctuary turn is the wrong meter.

### 2.2 One owner, two moments

A new `lib/writersStudio/maiaAllowance.ts` owns the meter. Callers do two things:

1. **Before an act — `mayRead(memberId)`** at the route, alongside admission. Answers `allowed` while any allowance is
   left this month. An act is never cut off half-way: if it starts, it finishes, and what it used is recorded.
2. **After each model call — `recordReading(memberId, usage, act)`** at the seam. `runStructured` gains an optional
   `meter: { memberId, act }` field; when present the seam appends one row after the call returns. Focus and Candidates
   are wired the same way at their own clients (Claude path only).

Storage: an append-only `writers_studio_maia_usage` table — `member_id`, `occurred_at`, `act` (route key),
`input_tokens`, `output_tokens`, `model`. **No content, no Work id, no manuscript text, no prompt.** Monthly total =
`SUM` over the member's current calendar month (UTC). A read failure **fails closed to "unavailable"**, never to "free
reading" and never to "used up".

### 2.3 Plans

| | Free | Pro (beta grant, founder/CTO, or `members.tier = 'pro'`) |
|---|---|---|
| Works, words, writing, export | unlimited | unlimited |
| MAIA readings | monthly allowance **F** | monthly allowance **P ≫ F** |
| Whole-book editorial pass | one taste per Work (existing) | yes, counts against **P**; existing 3/day cap kept |

**F** and **P** are the founder's to set, from measurement (§2.5). Who is Pro is read from the existing owners
(`writersStudioStanding()` / `resolveWholeWork()`), never re-decided here.

### 2.4 What the writer meets

- A quiet line in the Studio once 80% is used: how much is left and when it renews.
- At the end of the allowance, a MAIA act answers plainly — e.g. *"You've used this month's MAIA readings. They renew on
  1 December. Your writing, your Works and everything you've made stay exactly as they are."* — plus the existing
  *Ask about Pro* path (step C). No checkout, no automatic charge, nothing hidden or locked.
- MAIA never describes the allowance as a judgement of the writer or the work.

### 2.5 Order of build

| Step | Change | Gate |
|---|---|---|
| M1 | `writers_studio_maia_usage` migration + `recordReading` at the seam and the two other clients — **shadow mode**: records, never refuses (`WS_MAIA_METER_MODE=shadow`) | migration review; Co-Lab gate |
| M2 | Founder reads a usage summary (per-plan medians and tails, no member names) after a few weeks of real use and sets **F** and **P** | founder ruling |
| M3 | `mayRead` at every route in §1, refusal copy, 80% line (`WS_MAIA_METER_MODE=enforce`) | F6 walk on Free and Pro |
| M4 | `freeAdmission.ts`: the door's precondition becomes `WS_PRO_GATE_ENABLED` **and the meter in `enforce`**, replacing `WS_FREE_WORK_LIMIT_ENABLED` (founder ruling above). Step A's code removed in its own change | founder go |

Default mode is off: no row written, nothing refused, today's behaviour exactly.

## 3. The one question for the founder

> **What should the allowance count — the amount MAIA reads, or the number of times she reads?**

- **A (recommended): the amount — "words MAIA reads"** (measured from input tokens, shown to the writer as words).
  It is your *bandwidth* idea made literal: several small Works or one large Work draw on the same allowance in
  proportion to what MAIA actually reads, which is also what it costs. A question about one paragraph costs a little; a
  lineage scan of a whole book costs a lot. Writers already think in words.
- **B: the count — "readings"** (each act = 1). Easier to explain, but a one-line question and a whole-book scan count
  the same, so Free must be set low enough for the expensive acts and feels stingy for the cheap ones — or acts must
  be weighted, which is A with extra steps.

Everything else here follows from rulings already recorded or from existing instruments (Sanctuary invariants,
fail-closed doctrine, the oracle quota precedent) and needs no ruling. **F** and **P** wait for M2.

### 3.1 Founder ruling (Kelly, 2026-11-13, in the Claude Code session): **A — words MAIA reads**

Asked "count words MAIA reads, or number of readings?", the founder answered *"whatever is best"*, delegating to the
recommendation. **A is taken:** the allowance is an amount of reading, measured from input tokens at the seam and shown
to the writer as words. **F** and **P** are expressed in words per calendar month and still wait for M2.
**Standing:** settles §3 only. ⛔ M1–M4 each still need their own go; M1 adds a migration and is at least Class A.

## 4. Falsifiers

| # | Given | Expect | Mutation that must fail it |
|---|---|---|---|
| A1 | meter off (default) | no usage row written, no act refused | recording or refusing while off |
| A2 | `shadow` | every Claude reading appends one row with member, act, tokens; nothing refused even far over any amount | refusing in shadow |
| A3 | any mode | a usage row holds no text, prompt, Work id or manuscript id | adding a content column |
| A4 | Sanctuary act | no row written, in every mode | metering Sanctuary |
| A5 | Ollama-answered call | no row | metering local calls |
| A6 | `enforce`, Free over **F** | MAIA act refused before any model call, plain copy, 429 like the pass's `daily_limit`; no model call made | checking after the call |
| A7 | Free over **F** | save, revise, read, export, erase, import, new Work all still succeed | the meter reaching non-MAIA routes |
| A8 | `enforce`, an act started with allowance left that runs over | finishes; full usage recorded | cutting an act mid-way |
| A9 | Pro member | measured against **P**, never **F**; a beta grant that ends moves the member to **F** at once | Pro read cached past the grant's end |
| A10 | usage read fails | act refused as *unavailable*; never treated as unlimited or as used up | defaulting either way |
| A11 | new calendar month | total starts at zero | rolling window or carry-over (unless ruled) |
| A12 | step B door | stays closed unless the Pro gate is on **and** the meter is in `enforce`; `WS_FREE_WORK_LIMIT_ENABLED` no longer opens it | old precondition still sufficient |
| A13 | an act wired outside the seam (Focus, Candidates) | recorded like any other | a new Claude caller added without the meter (a registry test lists every caller of the Anthropic client from Writer routes) |

## 5. Found in passing (not fixed here)

- `lineage-scan`, `source-field-orientation` and `focus` send a whole Work with **no size cap**; `readings` caps at
  500k code points. A cost ceiling per act is a separate decision.
- `lineage-*`, `*-orientation` and `candidates` have **no Sanctuary check**.
- `lib/writersStudio/freeAdmission.ts` cites `docs/programme/WRITERS-STUDIO_FREE_STUDIO_PLAN_2026-11-13.md`, which is
  not on canonical; it exists only on the unmerged branch `chore/ws-free-studio-plan-20261113` (`eda6f7cf91`).

## 6. Not authorized

No build, migration, flag, merge or deploy. HOLD #1938 governs. M1–M4 each need their own go after §3 is ruled.
