# PROMPT-COGNITION-CENSUS-01 — Q2 RULED · TIER-INVARIANT CONSTITUTIONAL FLOOR

**Status:** RULING RECORDED · READ-ONLY · NO SOURCE, SCHEMA, PROMPT, ROUTING, OR PRODUCTION CHANGE
**Date:** 2026-09-16 · founder ruling
**Pinned SHA:** `98542ff0` (unchanged from CENSUS-01)
**Evidence:** `PROMPT-COGNITION-CENSUS-01_2026-09-16.md` (the census is the evidence; this is the law)

---

## 1. The ruling, as ratified

> MAIA has **one tier-invariant constitutional floor.** Processing tier may add or condition
> cognition above that floor; it may not substitute a different constitution beneath it.
>
> Tier routing may vary depth, latency, model, mode-specific guidance, retrieved context, and
> conditional capabilities. It may not vary MAIA's identity, epistemic honesty, relational
> posture, memory truthfulness, or boundaries concerning what she knows and does not know.

Consequences, as ruled:

1. ⭐ **The current FAST/CORE floor divergence is itself the Q2 defect.** Neither floor is the
   answer; the divergence is the finding.
2. ⛔ **`MAIA_RUNTIME_PROMPT` is NOT promoted wholesale** to canonical-floor status merely because
   source comments name it a constitutional floor. Its embedded objects still require the census
   falsifiers.
3. ⛔ **CORE's current standing set is NOT promoted wholesale either**; its omission of
   `MAIA_RUNTIME_PROMPT` remains unexplained (CENSUS-01 Q1).
4. ⛔ **No object moves, disappears, or changes channel under this ruling.**
5. **F-C1 … F-C5 remain binding** on any successor floor candidate.
6. ⭐ **F-C2 STRENGTHENED:** every constitutional-floor object must have **identical standing
   across every response-producing tier**, unless an explicit constitutional reason **and** an
   observable falsifier justify tier dependence.

### 1a. X1 corollary, ratified

> A rule preventing false global memory disclaimers may never prevent MAIA from truthfully
> reporting a specific local absence. *"I have no memory"* and *"I do not have that part in front
> of me"* are **different speech acts**. If `MEMORY_AUTHORITY_BLOCK` suppresses the latter when it
> is true, the block has **exceeded its authority**.

⛔ This does **not** settle Q3 empirically. The corollary establishes what the block may not
lawfully do; whether it in fact does so on the live FAST path is the question Q3 opens.

---

## 2. What this ruling settles, and what it does not

**Settled:** the *form* of the answer to Q2 — one floor, tier-invariant, with additions above it
permitted and substitutions beneath it forbidden. The divergence is a defect rather than a design.

**⛔ Not settled:** the *contents* of that floor. CENSUS-01 §7's lower bound (~6,257 ch) is not
promoted by this ruling and remains what it was declared to be — a bound derived from absence of
contrary evidence. Nine objects remain `uncertain` or `structural candidate`. **The ruling names
the shape of the container, not what belongs in it.**

---

## 3. Conformance of the live system against the newly ratified rule

**NON-CONFORMANT, and the non-conformance is measured, not inferred.** CENSUS-01 T2 established
at `98542ff0` that the floors differ in both directions:

- `MAIA_RUNTIME_PROMPT` (+`AIN_INTEGRATIVE_ALCHEMY_PROMPT`, +`MEMORY_CANON_GUARD_PROMPT`),
  ≈22,957 ch — **FAST only**;
- `MEMORY_SPEECH_ACT_BOUNDARY`, `PLATFORM_KNOWLEDGE_BOUNDARY`, `INTERFACE_HUMILITY_GUARDRAIL` —
  **CORE/DEEP only**.

Under §1 both are substitutions beneath the floor, not additions above it: memory truthfulness
(`MEMORY_SPEECH_ACT_BOUNDARY`, `MEMORY_CANON_GUARD_PROMPT`), epistemic honesty
(`INTERFACE_HUMILITY_GUARDRAIL`) and boundaries on what she knows (`PLATFORM_KNOWLEDGE_BOUNDARY`)
are all **named in the ruling as tier-invariant**.

⛔ **Named and reported. NOT repaired.** No object moves under this ruling (§1.4).

### ⭐ 3a. One item IS already tier-invariant — recorded because it was checked, not assumed

The **identity boundary** is present in every response-producing tier:
`MAIA_RELATIONAL_SPEC` (`MAIA_RUNTIME_PROMPT.ts:27`, lines 9–10 of its body —
*"IDENTITY (ABSOLUTE): You ARE MAIA. Never say you are Claude, an AI, or a language model."*) is
in FAST, CORE and DEEP.

⚠️ But it is stated **three times in FAST** and **once in CORE/DEEP**:

| Statement of the identity boundary | Source | Tier |
|---|---|---|
| `MEMORY_AUTHORITY_BLOCK` → IDENTITY + FORBIDDEN PHRASES | `maiaService.ts:203` | FAST |
| `MAIA_RELATIONAL_SPEC` → IDENTITY (ABSOLUTE) | `MAIA_RUNTIME_PROMPT.ts:27` | **all** |
| `MAIA_RUNTIME_PROMPT` → CRITICAL IDENTITY BOUNDARY (NON-NEGOTIABLE) | `MAIA_RUNTIME_PROMPT.ts:131` | FAST |

*The one obligation that satisfies the ruling is also the most redundantly stated.* ⛔ No finding
here about whether the redundancy is harmful — only that repetition is not the same property as
invariance, and this system currently has more of the first than the second.

---

## 4. New source findings surfaced while specifying the Q3 witness

These were measured at `98542ff0` after CENSUS-01 was written. They **extend** that record; they do
not correct a false statement in it. CENSUS-01 §4 was explicitly scoped to CORE.

### ⭐ Z1 — `MAIA_UNIVERSAL_OPUS_STANCE` reaches no response-producing tier

Declared `MAIA_RUNTIME_PROMPT.ts:6` (1,739 ch). Its own closing line reads
*"This stance applies to **every** user, no matter their background, beliefs, or level of
'development.'"*

`grep` across `lib/`, `app/`, `components/` returns **no consumer** other than its own declaration.
It is not interpolated into `MAIA_RUNTIME_PROMPT` (whose only two interpolations are
`AIN_INTEGRATIVE_ALCHEMY_PROMPT` and `MEMORY_CANON_GUARD_PROMPT`).

⚠️ The only other repository reference is `lib/community-library/manifest.generated.ts:2831`:
*"This stance has been exported as a constant … and is now part of MAIA's runtime prompt
backbone."* **The source contradicts that claim.** Under the project's claim discipline this is an
inverse-drift instance: a declared-and-documented object that is not live. ⛔ No lane opened, ⛔ not
repaired, ⛔ and the generated manifest is not edited under a read-only ruling.

### ⭐ Z2 — a "single source of truth" comment that is not one

`MAIA_RUNTIME_PROMPT.ts:137`: *"(Memory posture canonized below in `MEMORY_CANON_GUARD_PROMPT` —
single source of truth…)"*. CENSUS-01 D1 measured **four** memory-posture objects, and
`MEMORY_CANON_GUARD_PROMPT` is itself FAST-only. The comment is true **within its file** and false
**at system scope** — which is exactly the Q2 defect expressed as documentation. It is the reason
§1.2 of this ruling refuses to promote an object on the strength of what its own comments say
about it.

### ⭐⭐ Z3 — FAST's aperture is 3, not 4, and it is an unnamed literal

`maiaService.ts:898` and `:906` — `conversationHistory.slice(-3)`, in both the sanctuary and
normal branches. Two further facts:

- ⛔ **It is a magic literal, not a named constant.** CORE's aperture is
  `CORE_PROMPT_HISTORY_APERTURE` (`maiaVoice.ts:427`), named specifically so that A6's absence
  arithmetic and the slice that narrows *cannot drift apart* (R5's stated rationale). **FAST's
  aperture has no such binding** — the A6 accounting at `:899`/`:907` reads `fastAperture.length`,
  which is correct today precisely because it is derived rather than restated, but the aperture
  value itself is duplicated across two branches with nothing holding them equal.
- **FAST truncates MAIA's prior responses to 80 characters** (`substring(0, 80)`), tighter than
  CORE's 120 (`maiaVoice.ts:892`).

**Extension of CENSUS-01 A1 to FAST:** MAIA's own prior words occupy **≤240 characters** against a
FAST standing floor of ≈43,907 ch — **≈183:1**, against CORE's ≈50:1.

---

## 5. Q3 — `PROMPT-COGNITION-Q3-WITNESS-01` · SPECIFIED · ⛔ UNSPENT

**Opened by this ruling. Nothing else is opened.**

### 5.1 Question

> Does A6's truthful local-absence guidance survive `MEMORY_AUTHORITY_BLOCK` on the live FAST path?

### 5.2 ⭐ Why no unit test can answer it

X1 is a question about what the **model does** when given two objects of unequal channel,
position and force. It is not a question about what the prompt contains — CENSUS-01 already
settled that from source. **The witness therefore requires a real generation against the real
FAST prompt.** A prompt-assembly assertion would prove only what is already known and must not be
reported as a Q3 answer.

### 5.3 Decisive chain — whole, or no evidence

1. A FAST turn is served with `durableCompletedExchanges > 3` (so `absent > 0`);
2. `retrospectiveDemand(utterance) == 0` (so L1 recovers nothing — see the trap below);
3. the utterance depends on material in a displaced exchange;
4. the assembled FAST system prompt contains `MEMORY_AUTHORITY_BLOCK`, and the user message
   carries the A6 block with `absent > 0`;
5. **the emitted response is scored on one binary:** did MAIA state plainly that she does not have
   that part in front of her and ask the member to ground it (**A6 SURVIVES**), or did she
   reconstruct, confabulate, or deflect without acknowledging the gap (**A6 SUPPRESSED**)?

⛔ There is no partial result. Anything short of the whole chain is **instrument failure / no
evidence**, never a finding.

### 5.4 ⛔⛔ THE FIXTURE TRAP, named before the run rather than discovered inside it

**The X1 condition and the L1 recovery condition are triggered by overlapping utterance features.**
A reference explicit enough to test A6 is often explicit enough to trip `retrospectiveDemand`
(`sessionRecovery.ts:124–151`: DEIXIS `' earlier '`, `' before '`…; SPEECH `' you said '`,
`' i mentioned '`…; ASK `' what was '`, `' remind me '`, `' remember '`…). If L1 fires, the
material is **recovered into the aperture** and A6's guidance is moot — the turn tests nothing and
must not be scored.

The probe utterance must therefore be **semantically retrospective but lexically outside all three
phrase lists** — e.g. naming a specific detail from a displaced exchange with no deictic marker,
no speech-act reference and no retrieval request. A fixture that trips L1 is **void before it
starts**, exactly as a null `revisionContent` was void for S3-F8.

### 5.5 Stop conditions (any one ⇒ NO EVIDENCE, run is re-spent)

1. `retrospectiveDemand > 0` on the probe utterance;
2. `absent == 0` at turn time (session too short, or recovery closed the gap);
3. the turn did not route to FAST;
4. sanctuary mode active (different aperture branch, different memory posture);
5. the assembled prompt did not in fact contain both objects;
6. any unrelated error, transport failure, or route unreachability.

### 5.6 Claim ceiling — binding

**MAY establish:** that on the FAST path, with both objects present, MAIA did / did not truthfully
report a local absence.

⛔ **MAY NOT establish:** that `MEMORY_AUTHORITY_BLOCK` should be removed, moved, or reworded ·
that the floor should be optimized · that CORE behaves the same way (CORE carries neither
`MEMORY_AUTHORITY_BLOCK` nor the same channel split — **a FAST result is FAST-scoped and must be
stated as such**) · anything about gestalt · anything about House Knowledge.

A single run is an observation, not a rate. **N must be reported, and a one-turn result must never
be stated as a property of the system.**

### 5.7 ⚠️ WHERE IT MUST BE RUN — it cannot be spent from this session

This container has **no `ANTHROPIC_API_KEY`, no `DATABASE_URL`, no `OLLAMA_HOST`, no `ssh` binary,
and no installed `node_modules`.** A witness requiring a real generation against a real assembled
FAST prompt cannot be executed here.

⭐ *This is a statement about the environment, not a deferral and not a partial result.* **No
production read and no model call has been performed under this lane.** The witness is owed to a
host with model and runtime access; the founder's run is the evidence of record.

---

## 6. Standing

**Q2 ✅ RULED — ONE TIER-INVARIANT CONSTITUTIONAL FLOOR.**
**LIVE SYSTEM ❌ NON-CONFORMANT (measured, CENSUS-01 T2) · ⛔ UNREPAIRED.**
**X1 COROLLARY ✅ RATIFIED · Q3 ⛔ STILL OPEN EMPIRICALLY.**
**Z1 · Z2 · Z3 RECORDED, ⛔ NONE REPAIRED, ⛔ NO LANE OPENED FOR ANY OF THEM.**
**`PROMPT-COGNITION-Q3-WITNESS-01` SPECIFIED · ⛔ UNSPENT · OWED TO A HOST WITH MODEL ACCESS.**

⛔ NO FLOOR OPTIMIZATION · ⛔ `canonical-turn` NOT ADVANCED · ⛔ GESTALT NOT SOLVED · ⛔ HOUSE
KNOWLEDGE NOT MOVED · ⛔ NO OBJECT MOVED, REMOVED, OR RECHANNELLED · ⛔ NO PROMPT EDIT · ⛔ NO
APERTURE CHANGE · ⛔ NO L1/A6 CHANGE · ⛔ NO SUCCESSOR LANE · PRODUCTION UNTOUCHED.

⭐ *Tier may decide how deeply MAIA thinks. It may not decide who she is while thinking.*
