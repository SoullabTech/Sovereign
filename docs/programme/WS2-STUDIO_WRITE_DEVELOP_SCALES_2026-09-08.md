# Writer's Studio — WRITE and DEVELOP as two scales of one process · ARCHITECTURE

**Stated by**: founder, 2026-09-08.
**Status**: ⛔ **ARCHITECTURE RECORDED. NOT BUILT. NOT AUTHORIZED.**

---

## The distinction

**WRITE** — close range, inside the manuscript. Review · discuss · look deeper · edit with MAIA ·
explore possibilities · keep a version before consequential changes. *The writer is still writing.
MAIA is beside them.*

**DEVELOPMENT** — one level higher. Not another generic literary scan from zero, but a reading of
**what the writer's actual choices are becoming**:

> *"Across several sections you've been protecting the same movement: lived experience first,
> framework second. That choice is becoming one of the book's organizing principles. In the later
> chapters, though, the framework increasingly arrives before the lived material. That may be the
> larger transition you're now encountering."*

The loop:

```
Write locally → understand locally → act → Development sees the emerging whole
→ return to the relevant writing
```

Not: *write → finish → press an AI analysis button → receive a report.*

---

## 1 · ⭐⭐ The Developmental Context is a memory-consent object

The middle layer carries **writer intentions, standings, decisions, actions and open questions**.
That is memory of a particularly intimate kind: what a person decided about their own work, and
what they are still wrestling with.

⛔ **Sanctuary law applies in full.** *No stealth memory. Sanctuary Mode governs what is held, how,
and why.* A layer that quietly accumulates *"Kelly spent time wrestling with this transition"* is
exactly what that vow was written about.

The precedent to follow is already in this codebase and was hard-won: the Daily Anchor
`surface_preference` gate, where **eligibility originates from a member act, not a deploy flag**.
The Developmental Context needs at least that, and arguably more, because its entries are the
writer's *unresolved* material rather than their finished words.

⭐ **The design question to settle before anything is built: is the context written by default and
opted out of, or written only on a member act?** Given what it holds, the answer is not obvious
and it is not ours.

## 2 · ⛔ It must not be Encounter state — Encounter's ephemerality was deliberate

`read.ts` states it as law:

> *no persistence — nothing is written. There is no encounters table*
> *no carry-forward — nothing here is reachable by a later intention act*

The Developmental Context requires exactly the persistence Encounter refuses. **That is not a
contradiction if the layers stay separate**: Encounter remains a stateless perceiving act, and
the context is a **separately constituted store** that a member act may write *into* — never a
side effect of MAIA having looked.

⛔ If the context is implemented by relaxing Encounter's no-persistence rule, the E2 ruling
dissolves silently and every Encounter becomes a recording.

## 3 · ⭐ Four authorship classes, not two — and one of them will blur

The founder's own safeguard, which deserves a name and a type:

> **MAIA's observation does not become writer intent merely because it was discussed.**

This is the E1/E2 authorship split one scale up. There, `MaiaNotice` and `WriterRecollection`
deliberately have **no common supertype** — *a shared PRESENTATION union is fine, a shared
semantic record that lets one masquerade as the other is not.* The same discipline must hold here,
across more classes:

| entry | authored by | authority |
|---|---|---|
| **observation** | MAIA | a claim, anchored, screened |
| **writer intention** | writer | what they say they are doing |
| **writer standing** | writer | **a decision — binding** |
| **action** | neither | a fact about the manuscript, from the revision store |
| **open question** | ⚠ **whichever raised it** | never joint |

⭐ **"Open question" is where it will blur.** A question MAIA asked that the writer engaged with
will *feel* shared. It is not. A question MAIA raised and the writer never answered must never
harden into *"an unresolved thread the writer is carrying"* — that would make MAIA's curiosity
into the writer's burden, and then Development would reason from it as if the writer had put it
there.

## 4 · ⭐⭐ This resolves the fork I left open yesterday — better than either branch

The whole-work reading record posed: synthesize from **the Work whole**, or from **the 226
notices**? I named the second as tempting and dangerous — *interpretation of interpretation*.

**The Developmental Context is a third and better answer**, and it beats both:

| | whole Work | notices | **developmental context** |
|---|---|---|---|
| scope | genuine | genuine | genuine |
| evidence chain | anchors → text | anchors → notices ⛔ | **fact → anchor → text** ✅ |
| carries writer decisions | ✗ | ✗ | **✅** |
| cost | ~100k tokens/read | cheap | cheap |

The decisive difference is the third row. Neither prior option contained **what the writer
decided** — and *"how is the whole work developing?"* is a question about the writer's choices,
not only about the text. A reading built on the Work alone can describe the manuscript; only this
one can say *"you have been protecting the same movement."*

## 5 · ⛔ The drift risk, and the one number that bounds it

If Development reasons over accumulated observations, and observations are MAIA's, then over time
**MAIA increasingly reasons about her own prior readings.** Compounding interpretation.

The bound is already measured: **F-1 partial grounding persists** — MAIA's observations are the
*least* reliable entries the store will hold, while writer standings and manuscript actions are
facts. ⭐ **Weight them accordingly, and never let an observation age into a premise.**

## 6 · ✅ The drill-down is already built

> *"This larger pattern is especially visible in Chapters 2, 5 and 8."* → **Take me there.**

`Anchor{startCodePoint, endCodePoint, spanDigest}` plus `anchorsAreCurrent()` already does this,
and the digest earns its keep exactly here: if the writer has since revised that passage, the
system says **the anchor is stale** rather than landing them silently on different prose. That is
the payoff of the exact-excerpt and scope work — navigation back into the manuscript was what the
anchors were always for.

## 7 · What this gives the calibration lane

A clearer and better-ordered target, in the founder's terms: **teach MAIA to be genuinely useful
beside the writer at the local scale first**, then preserve enough grounded developmental context
for her to become insightful at the whole-work scale.

⭐ **Local usefulness is also the cheaper thing to calibrate.** *"I'm trying to move from personal
experience into explaining Fire — is that coming through?"* is a judgment the writer can make
immediately, about a passage they are holding in mind. Whole-work readings take a whole Work to
produce and a whole book's memory to judge.

## 8 · Standing

```
WRITE / DEVELOPMENT two scales      RECORDED — not built, not authorized
Developmental Context layer         ⛔ memory-consent object — Sanctuary applies (§1)
Encounter stays ephemeral           ⛔ must not be relaxed to implement §1 (§2)
four authorship classes             ⛔ typed separately; "open question" never joint (§3)
whole-work synthesis fork           ⭐ RESOLVED by §4 — context, not Work-blind or notice-blind
drill-down navigation               ✅ already supported by anchors + digest staleness

F-7 · F-8 · G8 FAIL                 unchanged
JARVIS-MAIA-HELPER-CALIB-01         charter drafted, NOT OPENED
E3 · PR · deploy                    HOLD
```

> Write is where the writer works. Development is where the work is understood. The middle layer
> is what makes the second possible — and it is also the part that holds a person's unfinished
> thinking, so it is the part that has to be consented to.
