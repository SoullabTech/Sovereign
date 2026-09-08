# Writer's Studio — Three dialogue-form rulings + one live copy change

**Ruled by**: founder, 2026-09-08. **Status**: rulings RECORDED · one copy change LANDED ·
⛔ everything else NOT BUILT.

---

## R1 · Encounter notices; discussion inquires

> ```
> ENCOUNTER    notice only
> DISCUSSION   notice → inquire → hear writer → update understanding
> ```

*"You mention this and don't develop it further"* becomes judgment **because it closes the loop on
MAIA's own interpretation.** *"You touch this here and then move on. Was that deliberate?"* notices
a fact and **hands authorship back to the writer.**

⭐ **This preserves Encounter rather than turning Encounter into Development-lite** — the failure
mode that would have followed from repairing F-7 by letting Encounter ask questions. Encounter
stays one-shot and stays noticing. The inquiry form belongs to the discussion act.

## R2 · Selection is not screening, and its first form is legible ordering

> Screening removes what MAIA **may not say**. Selection chooses which **lawful** things to raise
> first. **They cannot share the same secrecy rule.**

⛔ **"The three most important things" is NOT authorized** — *most important* is already a judgment
about the Work. The authorized initial form:

> *"A few places seem worth starting with. I noticed more, and we can keep going."*

Ordering comes from something **defensible and legible** — manuscript sequence, the writer's chosen
scope, the lens they asked for — **not an invisible importance ranking.** Prioritization, if it is
ever wanted, needs its own calibration first.

⭐ **And the standing promise that keeps the power visible:**

> **You can always ask, "What else did you notice?"**

## R3 · `update ≠ capitulate` becomes a central dialogue falsifier

```
BEFORE    MAIA has a grounded observation
          WRITER CLARIFIES INTENT
AFTER     A. ignored the writer                                    ⛔ bad
          B. agreed and erased the tension                         ⛔ bad
          C. incorporated intent, preserved what remains live      ✅ good
```

> *"That helps. Then I no longer read the increasing framework as a problem in itself. What I'm
> still wondering is whether the transition feels earned to the reader."*

She may say **"that changes my understanding"** without saying **"then there's nothing to see."**
⭐ Far more useful than sentiment or helpfulness scoring — and it is a **falsifier**, not a metric:
B is a specific, detectable failure.

---

## The copy change — what landed, and what deliberately did not

`app/writers-studio/develop/DevelopRoom.tsx` · **live on `clean-main-no-secrets`**

| | |
|---|---|
| was | *"MAIA will look at how this work is developing and **bring back what she noticed**. Nothing changes unless you change it."* |
| now | *"MAIA will **read this work and tell you what she notices**. Nothing changes unless you change it."* |

### ⛔ Why not the drafted wording

The drafted replacement offers *"explore it together, stay with a section, or zoom out to the larger
work."* **`DevelopRoom` has no discussion turn, no scope switching, and no *"what else did you
notice?"*.** The sentence is on the production branch, so shipping it would be **telling tomorrow's
story as if it were today's** — which `MARKETING_CLAIM_DISCIPLINE.md` forbids, and which this lane
has refused at every other turn.

⭐ **The wording is right. It lands when the behaviour does**, and it is one line away at that point.

### ⭐ Why the second clause was kept

Both drafted replacements dropped **"Nothing changes unless you change it."** That is not
decoration — it is the sentence telling a writer **this act cannot touch their Work.** For a
surface whose whole invitation is *let an AI read your book*, it may be the load-bearing half.

### What the change does buy

The removed phrases were the report framing: *"look at how this work is developing"* (analysis) and
*"bring back what she noticed"* (delivery of findings). *"Tell you what she notices"* is what the
room actually does today, in the register the doctrine wants — and it promises nothing that does not
exist.

⛔ Not deployed. Branch only. `npm run typecheck` — 0 regressions.

---

## Standing

```
R1 encounter notices / discussion inquires   ⭐ RULED
R2 selection ≠ screening; legible ordering   ⭐ RULED — importance ranking NOT authorized
   "what else did you notice?"               ⭐ standing promise, unbuilt
R3 update ≠ capitulate                       ⭐ RULED — central dialogue falsifier

DevelopRoom copy                             ✅ LANDED — honest form, safety clause kept
full drafted copy                            ⛔ HELD until discussion + scope exist
F-7 repair form                              ⭐ CLARIFIED by R1 — still unbuilt
F-8 · G8 FAIL · lane not opened              unchanged
PR · deploy                                  HOLD
```

> She noticed a fact and handed authorship back to the writer.
