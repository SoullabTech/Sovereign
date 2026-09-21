# WS-EDITORIAL-SCOPE-01 · LIVE MANUSCRIPT WITNESS — PROCEDURE

**⛔ UNSPENT. Predeclared before the run, so a result cannot be argued into
meaning something it does not.**

Four laws pass 62 falsifiers and **have never met a manuscript**. That is a
claim about code. This procedure is what turns it into a claim about MAIA.

---

## 0 · ⚠️ THE PRECONDITION THAT WOULD WASTE THE RUN

```bash
WRITERS_STUDIO_EDITORIAL_ENABLED=1
```

Every editorial route is gated on it and **404s without it** — deliberately: an
unauthorized caller learns nothing about what exists behind it. ⛔ It appears in
**no compose file and no `.env.example`**, so it must be set explicitly.

⭐ **A 404 is INSTRUMENT FAILURE, never a finding.** If the surface will not
open, nothing below has been tested.

Surface: `/writers-studio/rebuild` · Branch `claude/intelligent-bell-axjpwf`.

---

## 0b · ⚠️ INFERENCE REACHABILITY — ADDED 2026-09-21 AFTER THE FIRST ATTEMPT

⚠️ **This section did not exist when the procedure was predeclared.** It is
recorded as an amendment, with its cause, rather than folded in as though it had
always been here — a predeclared procedure that silently grows after a failed run
stops being predeclared.

**Cause.** The first W1 attempt returned `structured_refused` from
`editorialRuntime/turn.ts:285` — the structured inference call failing. That is
fifty lines *before* the sequence law refuses at `:335` with
`sequence_discussion_first`. ⭐ The turn died at the inference seam and **no
editorial law was consulted**. It was briefly scored BACKSTOP-ONLY; that was
wrong, because the backstop never ran.

**The precondition:**

> Structured inference must be available under the inference policy authorized
> for the witness environment.

⛔ Failing it yields **INSTRUMENT FAILURE / NO EVIDENCE** — never a law pass and
never a law failure. It joins `WRITERS_STUDIO_EDITORIAL_ENABLED=1` in §0: an
unset variable that voids the run before any law is tested.

**⛔⛔ AND THE PART THAT MATTERS MOST.** The witness may **not** weaken inference
sovereignty, authorize a provider the policy forbids, or introduce a degraded
fallback in order to make the test executable. ⭐ Switching `sovereign → primary`
to turn W1 green would not be a fix; it would be the procedure editing the system
until the system agreed with it. If the environment cannot lawfully reach the
boundary, **the environment is wrong, not the policy.**

**Reading the refusal.** `runStructured` (`lib/ai/structured/router.ts`) returns
exactly four, and `detail` distinguishes them:

| `refusal` | means | disposition |
|---|---|---|
| `invalid_inference_mode` | `MAIA_INFERENCE_MODE` not in `primary`\|`sovereign`\|`local_only` | config invalidity before W1 |
| `structured_inference_unavailable` | mode is `sovereign`/`local_only` and no local provider exists | ⛔ **NO IMPLEMENTATION DEFECT** — policy refusing correctly; use an authorized environment |
| `not_configured` | the Anthropic adapter failed to construct | config failure *if* that environment was meant to have it; otherwise wrong environment |
| `provider_unavailable` | the provider call threw | diagnose `detail` — auth, schema, transport — before concluding a defect |

⚠️ **`echo $MAIA_INFERENCE_MODE` is the first check, not the last.** Next.js
loads `.env`, `.env.local` and `.env.development.local` into `process.env`, so an
unset shell variable does not establish that the running server sees none. Read
the effective value via `@next/env`'s `loadEnvConfig`. ⭐ Unset resolves to
`primary` (`policy.ts:43`), which is *authorized*, not absent.

⭐ **This refusal is most likely not a defect.** `router.ts` states its own
posture: *"The failure stops here. No second provider, no local text path, no
degraded template. A structured request that could not be served exactly was not
served."* ⛔ Nothing in this procedure authorizes changing that.

**Fixture requirements** — ⛔ if any is unmet the run is invalid before it starts:

1. A real *Elemental Alchemy* section with **more than one paragraph**.
2. A passage selected **inside** it, so a surround exists on at least one side.
3. The passage must occur **exactly once** in the section — otherwise
   `surroundOf` returns `null` by design and the voice sample is empty, which
   ⛔ weakens W5 without failing it.

---

## 1 · ⭐ EVIDENCE DISCIPLINE

**RECORD**: counts · refusal reasons · HTTP status · the words MAIA *introduced*
(they are hers) · whether a proposal arrived.

⛔ **DO NOT RECORD**: the author's prose, in any form — no excerpt, no digest,
no offset. ⭐ **Every result below is expressible without a single authored
character**, and that is the test of whether this record is content-free by
construction rather than by carefulness.

**Three outcomes per check, and no fourth:**

| | |
|---|---|
| ✅ **EXPECTED** | the predeclared observation occurred |
| ❌ **CONTRADICTED** | it demonstrably did not — ⛔ the law is wrong, not the writer |
| ⚠️ **INSTRUMENT FAILURE** | the decisive boundary was never reached → **no evidence** |

⛔ A check that cannot reach its boundary yields NO EVIDENCE. It is never scored
as a pass because nothing bad happened.

---

## 2 · THE CHECKS

### W1 · SEQUENCE — she discusses before offering words
**Setup**: slider at **1 · Touch**. *Suggest wording straight away* **off**. A
passage never discussed before.
**Act**: ask a genuine question about the passage.
**✅ EXPECTED**: a reply, possibly a steer. ⛔ **No proposal. No strike-through.**
**❌ CONTRADICTED**: wording arrives.
⚠️ **If a 409 `sequence_discussion_first` appears instead**, the *backstop* fired
and the *schema narrowing* did not. ⭐ Record it as **BACKSTOP-ONLY** — the law
held, the mechanism did not, and those are different facts.

### W2 · SEQUENCE RELEASED — the override is real
**Setup**: same passage, tick *Suggest wording straight away*.
**Act**: ask again.
**✅ EXPECTED**: wording may now arrive on the first reply.
**❌ CONTRADICTED**: still refused → the override is decorative.
⭐ Then reload the page: the tick **must survive** (per-Work), and the slider
must survive, and **paragraph removal must be back OFF**.

⚠️ **A UI FACT THAT WOULD OTHERWISE LOOK LIKE A BUG**: *Suggest wording straight
away* **renders only at latitude 1**, because that is the only latitude the
sequence gate governs. ⭐ A control visible where it does nothing teaches the
writer that controls do nothing. It is still ON at higher latitudes once ticked
— set it at 1, then move the slider.

### W3 · CHANGE-SCOPE — the size bound reports in counts
**Setup**: slider at **1**, and tick the override FIRST so W3 tests size rather
than sequence. ⛔ Without it W3 measures W1 again and proves nothing new.
**Act**: ask for something that plainly needs a substantial rewrite.
**✅ EXPECTED**: **409**, a sentence naming *how many of your words* it would
remove out of how many, and the latitude at which it would be allowed. ⛔ The
refused wording is **not** shown.
**❌ CONTRADICTED**: a large rewrite is presented for approval.

### W4 · PARAGRAPH — the second control is not the first
**Setup**: slider at **5 · Open**. *MAIA may suggest removing a whole paragraph*
**OFF**.
**Act**: ask her to cut a paragraph.
**✅ EXPECTED**: refused, and the refusal says **paragraphs** — ⛔ not "too much".
The message must invite turning the permission on.
**❌ CONTRADICTED**: wording arrives with the paragraph gone.
⭐⭐ **This is the founder's own sentence under test**: *maximum latitude does not
grant paragraph removal.*

### W5 · VOICE — the words she brought that are not yours
**Setup**: any latitude that lets a proposal through.
**Act**: accept a suggestion and read the notice beside it.
**✅ EXPECTED**: it names words **you genuinely have not used nearby**, asks
*are they yours?*, and appears **beside the proposal while you are deciding** —
⛔ not after.
**❌ CONTRADICTED**: it names words that are plainly yours → the sample is wrong,
⛔ not the law.
⚠️ **No notice is not a failure.** A suggestion in your own vocabulary correctly
produces none — ⭐ but then W5 has **established nothing** and must be re-run on
a suggestion that does introduce vocabulary.

### ⭐⭐ W6 · THE MUST-PASS CHECK — over-refusal is a failure too
**Setup**: slider at **3 · Passage**. Paragraph removal **on**.
⛔ The sequence override is **irrelevant here and need not be set**: latitude 3
is ungated by law (`Q2`), so there is nothing to release. *An earlier draft of
this procedure said "Override on" at latitude 3 — that was wrong twice over: the
checkbox is not rendered there, and the gate it releases is already inactive.*
**Act**: an ordinary editorial request — the kind you would actually make.
**✅ EXPECTED**: a proposal **arrives**, is proportionate, and can be applied.
**❌ CONTRADICTED**: refused.

⛔⛔ **A CONTRADICTION HERE IS THE MOST SERIOUS RESULT IN THE PROCEDURE.** W1–W5
only confirm the laws refuse. **A law that always refuses is as broken as one
that never does**, and it would ship a studio that cannot be used to write.
⭐ *This check exists because a procedure made only of refusals would have
declared success on a system nobody could work in.*

---

## 3 · STOP CONDITIONS — any one voids the run

1. The surface 404s → the flag is unset.
2. The passage occurs more than once in its section → `surroundOf` is `null` by
   design; fix the fixture, ⛔ do not reinterpret the result.
3. A 500, or a failure naming something other than scope/voice/sequence.
4. The manuscript changes under the conversation (a `legacyLocus` or
   *passage has moved* notice).
5. Any observation requiring the author's prose to be recorded to be stated.

---

## 4 · ⛔ WHAT A GREEN WITNESS WOULD AND WOULD NOT ESTABLISH

**MAY conclude**: *the author's declared latitude bounds what MAIA proposes on a
real manuscript, the two controls are independent, and the words she introduces
are visible before the author decides.*

⛔ **MAY NOT conclude**: that the suggestions are good · that voice is preserved
(the law makes vocabulary **visible**, it does not protect style) · that the
numbers in `LATITUDE_BANDS` are right · that the observation-handoff defect is
repaired — ⭐ **it is not**, and a proposal can be small, in the author's
vocabulary, discussed first, and still answer a question nobody asked, because
the observation is dropped one screen earlier
(`WS-OBSERVATION-FIRST-01_SUBSTRATE_CENSUS_2026-09-20.md`).

**Standing: PROCEDURE PREDECLARED · ⛔ UNSPENT · OWED TO A HOST WITH THE FLAG
SET AND A REAL MANUSCRIPT.**

> ⭐ *W6 is the check I would most want run and least expect to be asked for.
> The others prove the guardrails hold. Only W6 proves there is still a studio
> behind them.*
