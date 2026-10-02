# MAIA-MAVEN-T1A — J4 EXPERIENCE / SEMANTIC CONTRACT

**Status:** ⭐ **RATIFIED FOUNDER CONTRACT. J4 CLOSED.**
**Date:** 2026-09-17
**Authority:** founder ruling — MAIA-MAVEN-T1A J4, entered 2026-09-17
**Charter:** `MAIA-MAVEN-T1A_KEEP_INVOCATION_CHARTER_2026-09-17.md`
**Next gate:** ⛔ J5 build NOT authorized — see §9.

---

## ⭐⭐ 1. The resulting architecture — four distinct acts

```text
ENCOUNTER   Material exists in the present interaction.
KEEP        The member deliberately authorizes selected present material to persist.
REOPEN      The member deliberately authorizes prior persistent material to cross
            back into the present.
CONTINUE    The member deliberately leaves a thread available for resumed continuity.
```

> ⭐⭐ **None implies another.**

And overriding all of them:

> **SANCTUARY = ENCOUNTER ONLY.**

⭐ The central clarification: **Keep is authorship of persistence; Reopen is authorship of
retrieval.** Separating them prevents a seemingly innocent *"remember this"* gesture from
becoming a back door through which the whole accumulated model of the person silently re-enters
the conversation.

### The two crossings, kept apart

| Act | Crossing |
|---|---|
| **KEEP** | current Encounter → future persistence |
| **REOPEN** | prior continuity → present generative context |

---

## 2. Sanctuary cannot produce a Keep — **RULING: NO**

A Keep **cannot originate from a Sanctuary turn.**

Sanctuary means: **Encounter yes. History no. Memory no. Continuation no.**

⛔ Nothing from inside Sanctuary may become persistent content — not raw text, quotation,
summary, embedding, characterization, inferred memory, or Keep — **even when the member
explicitly asks for it.**

If a member says *"keep this"* while Sanctuary is active, MAIA **must refuse the persistence
crossing**. MAIA may explain:

> Sanctuary does not carry anything from this space forward. If you want something preserved,
> leave Sanctuary and say it again outside Sanctuary.

⛔⛔ **MAIA must not carry, summarize, quote, or reconstruct the Sanctuary material across that
boundary for them.** The member may subsequently author something anew outside Sanctuary — ⭐
**that is a new member act, not a Keep extracted from Sanctuary.**

*Consistent with R5 and CLAUDE.md Sanctuary invariant 6. Resolves the open question the charter
was forbidden to answer alone.*

---

## 3. KEEP does not reopen prior continuity — **RULING: NO**

A deliberate Keep invocation is **not** the deliberate reopening of continuity permitted by R1.

*"Keep this"* authorizes the **first crossing only**. ⛔ It gives MAIA **no authority** to
retrieve old Keeps, memories, history, characterization, or continuation material into the
current conversation.

⭐ **This remains true inside `START_FRESH`.** A member may create a new Keep during a
non-Sanctuary `START_FRESH` encounter **without thereby reopening anything that existed before
that encounter.**

> Reopening prior continuity requires its own deliberate member act.

---

## 4. The legitimate Keep act

**The primitive:**

> **The member deliberately places material into Keep.**

Direct Keep invocation includes: *"Keep this."* · *"Save this as a Keep."* · *"I want to keep
that sentence."* · an explicit Keep control applied by the member.

### The language distinction remains authoritative

| Utterance | Act |
|---|---|
| *"Keep this"* | **KEEP** |
| *"Keep this open"* / *"Leave this open"* / *"Come back to this"* | **CONTINUE** |

> ⛔⛔ **There is no fallback from CONTINUE to KEEP when continuation is unavailable.**

⭐ That prohibition is the load-bearing one: a system that "helpfully" degrades an unavailable
CONTINUE into a KEEP would silently convert a request to leave something open into an act of
persistence the member never authorized.

---

## 5. What exactly is kept

> ⭐⭐ **Exact referent before interpretation.**

The system preserves **the material the member selected**, not MAIA's interpretation of its
significance.

- If the member selects **their own words**, those words are the kept material.
- If the member deliberately selects **MAIA's words**, those may be kept as **member-adopted
  MAIA material, retaining their provenance.**
- ⛔ MAIA must not silently summarize, expand, reinterpret, extract a *"lesson,"* or convert the
  passage into a **characterization of the member**.
- If *"this"* has more than one plausible referent, **MAIA resolves the ambiguity with the
  member rather than choosing.**
- ⛔ **Derived meaning does not acquire persistence merely because the source material was kept.**

> **Adoption, not extraction.**
> **Nothing enters the member's enduring world merely because MAIA judged it meaningful.**

⭐ This is continuous with the doctrine `app/api/sovereign/keeps/route.ts` already enforces —
*a keep cannot originate text* — and extends it: a keep cannot originate **meaning** either.

---

## 6. MAIA may assist; MAIA may not become the selector

### MAIA MAY

- clarify what the member means by *"this"*;
- expose the boundary of the material about to be kept;
- read back or display the proposed selection;
- preserve member-selected wording faithfully;
- distinguish KEEP from CONTINUE;
- help the member narrow a set **when the member asks**.

### ⛔ MAIA MAY NOT

- silently decide what is important enough to Keep;
- automatically extract *"memorable"* moments;
- turn conversational relevance into persistence;
- infer which prior Keeps should return because they appear relevant to the current conversation.

### Candidate generation

If the member **explicitly asks** MAIA to help identify possible material, MAIA may offer
candidates conversationally.

> ⭐ **Candidate generation is not Keep selection. Nothing crosses until the member chooses.**

---

## 7. Reopening continuity

A continuity reopening must itself be a **deliberate member instruction** to bring prior material
forward — e.g. *"Show me what I've kept about this."* · *"Bring back my recent Keeps."* ·
*"Use the Keeps I made about the book."*

> **The member's instruction supplies the constraint.**

Within that constraint, **mechanically declared ordering — such as the existing recency order —
is legitimate.**

⛔⛔ MAIA must **not** substitute *"relevant to what we're discussing"* as an undeclared retrieval
constraint.

> ⭐ **Conversational relevance is not member permission.**

**If the requested set cannot enter the conversational context without the system deciding which
material matters, MAIA must narrow transparently with the member or decline to narrow.**

> ⭐ **Refusing to select is a valid outcome.**

*This answers the charter's §3.3 over-set question: the admissible answers are member-supplied
constraint, declared mechanical ordering, transparent narrowing, or refusal — and nothing else.*

---

## 8. Charter deliverables — disposition

| # | Deliverable | Disposition |
|---|---|---|
| 1 | Invocation grammar | ✅ §4 — KEEP vs CONTINUE, no fallback |
| 2 | Qualified Keep names + ruled scope | ⚠️ **PARTIAL** — R8 rules the *family/qualified* structure; ⛔ the qualified names themselves and which Keep T1-A reaches are **not yet ruled** |
| 3 | Narrowing rule incl. over-set behaviour | ✅ §7 |
| 4 | Provenance contract | ✅ §5 — member-adopted MAIA material retains provenance |
| 5 | Negative control | ⚠️ **OWED at J5** — stated as law in §5–6; ⛔ no falsifier authored |
| 6 | Continuity-Positions placement | ✅ Memory = explicit member standing · Continuation = not implied (§1, §3) |
| 7 | R1 interaction | ✅ §3 — KEEP does not reopen, including inside `START_FRESH` |
| — | Sanctuary origination | ✅ §2 — RULING: NO |

---

## 9. Gate disposition

> ⭐ **J4 CLOSED on this contract.**

⛔ **This ruling opens none of:** capability-registry work · memory redesign · Sanctuary
implementation · `/maia` UI work · production code.

**The next gate is the smallest repository-truth test of whether the existing seams can actually
preserve these four distinctions without MAIA becoming the selector.**

⭐ That is a **census/falsifier question, not a build** — it asks whether
`app/api/sovereign/keeps/route.ts`, `lib/sanctuary/turnPosture.ts`, the Changes lifecycle and the
existing disclosure seams can already express ENCOUNTER / KEEP / REOPEN / CONTINUE as four
separate acts, or whether any of them presently collapses two. ⛔ It requires its own founder act
to open.

---

## 10. Standing

`MAIA-MAVEN-T1A` **J4 ✅ CLOSED** · contract RATIFIED · four acts established · Sanctuary
origination ⛔ REFUSED · KEEP↛REOPEN ⛔ REFUSED · CONTINUE↛KEEP fallback ⛔ FORBIDDEN · qualified
Keep names ⚠️ OWED · negative-control falsifier ⚠️ OWED at J5 · ⛔ J5 build NOT AUTHORIZED ·
⛔ no capability-registry, memory, Sanctuary or `/maia` work authorized · production UNTOUCHED.
