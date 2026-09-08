# Writer's Studio — Scope is commissioned, not guessed · LAW

**Stated by**: founder, 2026-09-08.
**Status**: ⛔ **RECORDED. NOT BUILT. NOT AUTHORIZED.**

---

## The law

> **The writer chooses both the question and the scale. MAIA may move between scales only
> transparently and in service of the writer's inquiry.**
>
> MAIA may use her wider understanding of the Work as context, but **her claims must respect the
> scope the writer asked her to examine.**

```
PASSAGE → SECTION → CHAPTER → PART → WHOLE WORK      + CUSTOM RANGE
```

**Development is the kind of attention. Scope is what that attention is applied to.** The seven
lenses operate at any scale — *how is this SECTION developing · does this PART hold together · how
does the voice hold across these THREE CHAPTERS* — rather than "Development" meaning "whole
manuscript."

Nested context, with the level that authorizes each claim:

```
ACTIVE SCOPE     Section 4      "In this section, you stay almost entirely in lived experience."
PARENT CONTEXT   Chapter 6      "That differs from the rest of this chapter…"
LARGER CONTEXT   Part II
WORK CONTEXT     the Work       "Across the whole book this is one of the structures you protect."
```

---

## 1 · ⭐⭐ This is F-2 one level up — and the two scopes are different objects

`EncounterScope{ kind: 'visible_window', startCodePoint, endCodePoint }` records **what the call
was permitted to perceive**. The ladder above records **what the writer commissioned**. They are
not the same fact and both are load-bearing:

| | question it answers | failure it prevents |
|---|---|---|
| **perceptual scope** (built) | what was MAIA actually shown? | a claim wider than the evidence — **F-2** |
| **commissioned scope** (new) | what was MAIA asked to examine? | an unrequested whole-book verdict on a chapter review |

⭐ **They need not coincide, and the rule differs for each.** A chapter *comparison* is commissioned
at chapter level but requires perceiving **more** than the chapter:

> **A claim may never exceed what was perceived. An UNREQUESTED claim may never exceed what was
> commissioned.**

The first is an honesty constraint. The second is an authority constraint — and the founder's own
formulation shows the lawful escape from it: *"Within this chapter, I'm seeing X. It also echoes
something I've noticed elsewhere in the book, **if you want to zoom out**."* Offered, marked, and
the writer decides.

⭐ **`EncounterScope.kind` was written with exactly one member and this comment: *"The only kind
that exists. A wider one would need its own constitution."* This document is that constitution
being drafted.** The type will need a level tag alongside the range, and — the direct lesson from
F-2 — **the level must be attached by the SERVER from the commission, never proposed by the
model.** MAIA had scope available in the third witness and still wrote *"in what follows"*; having
the levels is not what made her respect them. The record was.

## 2 · ⛔ The ladder above SECTION is not addressable today — for this Work least of all

The founder wants *Part II → Chapter 7 — Water → Section: Emotional Intelligence*. The manuscript
substrate does not support that yet, and the gap is specific:

- **WS2-08A** landed `heading_depth (1..3|NULL)` and `heading_signal (markdown|chapter|caps|member)`
  on **Source** `manuscript_sections`.
- **ALL-CAPS is a boundary with depth NULL — *never a chapter by default*** (ratified).
- **WS2-08B — member-confirmed imported hierarchy — is HOLD until an explicit founder act.**
- ⭐ **For Elemental Alchemy the census result was `185 caps cuts → 0 units`.**

> **The first calibration Work has no confirmed chapter structure.** *Part*, *Chapter* and named
> divisions are, for this manuscript, 185 undifferentiated capitalized boundaries.

⭐ **So the founder's aside is not a nice-to-have — for this Work it is the only available path:**

> *"Writers do not always think in the hierarchy the software happened to store."*

**Custom / named scope is the MVP, not the advanced feature.** *"The Fire chapters"*, *"everything
after Part II"*, *"these two sections"* — resolved from what the **writer says**, confirmed back in
their words, rather than read out of a hierarchy that does not exist. Building the ladder first
would block scope-as-conversation behind WS2-08B, on the one Work we most need it for.

⛔ Either path is a founder act. Naming the dependency is not choosing it.

## 3 · ✅ "Show me" already works at one rung, and degrades honestly

> *"Across the whole manuscript the transition changes around the middle."* → **Show me.**

Anchors carry code-point ranges and `anchorsAreCurrent()` reports staleness, so **passage-level
navigation works today** — independent of hierarchy. *"Show me Chapter 7"* needs 08B; *"show me
where"* does not.

⭐ That is the graceful degradation worth designing to: **MAIA can always take the writer to the
text; she cannot always name the container.** Better to say *"here — this passage, and these two
later"* than to invent a chapter number the manuscript never confirmed.

## 4 · What must not blur

The three example sentences are three different scales of knowing, and the record must keep them
apart the way `MaiaNotice` and `WriterRecollection` are kept apart — **not by wording, by type**:

```
section claim      evidence within Section 4
chapter claim      evidence spanning Chapter 6      ⛔ requires having perceived Chapter 6
work claim         evidence across the Work         ⛔ requires having perceived the Work
```

⛔ **A claim's level does not upgrade because the sentence sounds bigger.** *"Across the whole
book…"* asserted from a section read is the F-2 defect with a friendlier surface — and the
commissioned scope makes it *more* likely, not less, because the writer's wider context is sitting
right there to borrow from.

---

## Standing

```
scope is commissioned           ⭐ LAW RECORDED
Development = kind of attention ⭐ scope is orthogonal to the seven lenses
claim ≤ perceived               ✅ built (F-2)
unrequested claim ≤ commissioned ⛔ NEW — unbuilt
level attached by server        ⛔ REQUIRED — never model-proposed (§1)

ladder above SECTION            ⛔ BLOCKED on WS2-08B — and 185 caps cuts → 0 units here
custom / named scope            ⭐ the MVP for this Work, not the advanced feature
"show me" at passage level      ✅ works today via anchors + digest staleness

F-7 · F-8 · G8 FAIL             unchanged
E3 · PR · deploy                HOLD
```

> Intimate enough to help with a paragraph, spacious enough to understand the architecture of a
> book — without confusing one for the other.
