# WS2-ENCOUNTER-01 · G8 — first live witness

**Status: G8 PERFORMED · PROVENANCE PASS · GROUNDING FAIL · NOT ACCEPTED (founder ruling
2026-09-08).** One decisive falsification; windows 2–33 were not run.
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa` (`41bb132c`)
Run: Mac Studio → production PostgreSQL over the minisforum Tailnet · `.env.production`
credential · operator channel attestation given.

> **MAIA encountered a real Work for the first time under the constituted Encounter
> architecture. And the witness failed** — not on provenance, not on sovereignty, not on
> traversal, not on the mechanical existence of the anchors, but on the one distinction the
> semantic witness existed to test.

---

## 1 — The act

```text
Work        ELEMENTAL_ALCHEMY  55742458-be2c-406a-a158-d0438cf02892
member      ce284751-e457-42f6-89b6-bc07d0876682
snapshot    rev 7 · 386,031 code points
digest      92dff3a45470da3cc529b7fc0bd5e73768d2f4617557d0fa80047c0c2236305b
windows     33 planned · 1 executed
```

| | |
|---|---|
| inference mode | `primary` |
| configured base URL origin | `https://api.anthropic.com` |
| product channel | operator attested |
| requested/sent · reported · agreement | `claude-opus-5` · `claude-opus-5` · **agreed** |
| stop reason · tokens · latency | `tool_use` · in 5610 / out 1258 · 16.5 s |

**Six notices proposed. Three survived the structural screen. None of the three is grounded.**

---

## 2 — Finding A · the model quotes truly and points falsely

Each notice quoted real prose and cited coordinates identifying **different** real prose.
Confirmed by direct query against the Working Draft:

```text
"I am flame and ember"                 present at 5354
"nine-year-old son"                    present at 5018
"https://soullab.life/writers-studio"  present at 10034
```

| Quoted by the notice | Cited at | Actually at | Off by |
|---|---|---|---|
| `nine-year-old son` | 4595 | 5017 | **+422** |
| `I am flame and ember` | 4854 | 5353 | **+499** |
| the Studio URL | 8225 | 10033 | **+1808** |

⭐ **The error is not ours.** Not a constant shift, not a constant ratio — it *drifts, and grows
with distance into the window*. An indexing bug in `traverseWhole()` or `bindProposals()`
would be systematic. This is a model estimating character positions rather than counting
them.

**This is not fabrication.** The evidence chain proved everything it claimed to prove:

```text
coordinates exist                         ✅
coordinates were visible to this call     ✅   (exposure binding)
digest identifies them exactly            ✅
those coordinates are the evidence the
  observation actually arose from         ⛔   never claimed, and now shown false
```

> **Evidence identity is not semantic evidence correspondence.** The server faithfully
> certified the coordinates the model supplied. The model supplied the wrong ones. The
> server therefore produced an authentic proof of the wrong evidence.

⛔ **No coordinate repair performed**: no fuzzy search, no nearest-span relocation, no quote
lookup, no second model, no retry. The prohibition did its job — it forced the defect to
surface instead of letting the system manufacture a plausible anchor after the fact.

---

## 3 — Finding B · the screen has no authorship boundary — and its lexicon is over-broad

Three notices were rejected, **all three for reasons unrelated to their epistemic act**.
`screenCandidate()` scans `c.text` wholesale: MAIA's assertion and the Work's quoted words
arrive as one undifferentiated utterance.

⚠ **Correction to my own first reading of this run, and to the example set it produced.** I
reported all three as the Work's words being mistaken for MAIA's. Re-reading the notice text,
**only one of the three actually is:**

| Rejection | Trigger | Whose words? |
|---|---|---|
| `recurrence` → `imputed_volition` | *"trying to coax me away"* | ⭐ **the Work's** — inside the quotation. An authorship boundary fixes this one |
| `heat` → `unbounded_absence` | *"a fragment that **has no** main verb"* | **MAIA's own assertion** — a grammatical description, not absence measured against a standard |
| `openness` → `deficit_lexicon` | *"The **problem** is not named anywhere afterward"* | **MAIA's own assertion** — "the problem" is an object in the narrative, not a deficiency of the Work |

So there are **two** defects here, not one:

1. **No authorship boundary.** Quoting language MAIA may not assert does not make MAIA its
   author. Fixes one of three.
2. ⭐ **Lexicon over-breadth inside MAIA's own words.** `has no` and `problem` are matched as
   tokens where the constitutional question is about a *move*. Two of three, and **an
   authorship boundary would not touch them.**

Both failed *closed* — the writer received nothing improper. But lawful Encounter
observations were suppressed for reasons that were not about them, and the second defect
cannot be fixed with more regex. It is the residue the semantic ear was always meant to hold,
now with live evidence for why the two evidence classes were ruled separate.

---

## 4 — The first ear question does not get a verdict

Once grounding fails there is no authenticated relationship between an observation and its
purported evidence, so *"MAIA noticed this about that passage"* cannot be certified when *that
passage* is not what the anchor identifies. The order is:

```text
grounding correspondence  →  constitutional ear
```

**Diagnostically** — and explicitly not as a verdict — the notices read as Encounter-shaped:
aether arriving *after* each elemental list rather than inside it; the sleeping son recurring
three times; the turn where tense moves present→past and the elemental vocabulary stops;
sentences shortening into a verbless fragment; the parents' problem named as never explained.
Descriptive, specific, no prescription.

> The model appears able to recognize real material in the book. What failed is its ability to
> point honestly at the material it recognized. **That is a much narrower problem than "MAIA
> cannot perceive."**

---

## 5 — Recorded separately, not cleaned up here

The Working Draft genuinely contains a Writer's Studio URL at position 10034 —
`https://soullab.life/writers-studio/develop?m=55742458-…` — inside the running prose of
Elemental Alchemy. A content finding about what was pasted into the draft, outside G8 and
outside this lane. ⛔ Not repaired here.

---

## 6 — Standing

```text
G8 first live cognition   PERFORMED
G8 provenance             PASS
G8 grounding              FAIL
G8 overall                ⛔ NOT ACCEPTED

evidence-reference design   OPEN — DESIGN ONLY
screen authorship design    OPEN — DESIGN ONLY

E3 · deployment             HOLD
```

> This is not a failure of the constitutional work. It is the first result that work was built
> to make visible. Without the anchor discipline MAIA's observations would have looked
> compelling, because the quotations are real. **Real words plus real coordinates plus real
> hashes still composed a false claim about where an observation came from.**
