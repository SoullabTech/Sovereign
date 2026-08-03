# AIN OS Constitution — Article: Conflict, Yield, and Evidence

**Date:** 2026-08-03 · **Status:** ⛔ **DRAFT. NOT CANON. NOT OPERATIVE.**
Article of [the AIN OS Experience Constitution](AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT_2026-08-03.md).
Founder-authored §2/§3/§4/§6 content, recorded by Claude; **§1 principle hierarchy is Claude-drafted
and is the section most in need of founder ruling.**

> A constitution is not tested when principles agree. It is tested when they collide.
> **For AIN OS, the collision cases are the product.**

---

## 1. Principle hierarchy — DRAFT, requires ruling

A total ordering of seven principles would be false precision. What the collisions actually show is
**two tiers with different failure semantics**:

### Tier 1 — Enforced boundaries
Violating one is a **defect**, not a tradeoff. Each derives from ratified canon and has, or should
have, enforcement below the interface.

| Principle | Derives from | Enforcement today |
|---|---|---|
| Human meaning remains human-owned | **Invariant 16** — Constitutional Direction of Authority | prompt/product discipline; no mechanical gate |
| Privacy is structural | Q-C ruling; E-3 | ✅ gate `verify-coach-field-boundaries.ts` `1d`; person-owned tables unreachable from practitioner queries |
| Authorship is visible — **content and presence** | Q-A ratified | ◐ content only; **presence has no enforcement** |
| MAIA is resident, not the authority | MAIA Oath | product discipline |

### Tier 2 — Design commitments
Genuine tradeoffs. May yield to Tier 1 always, and to each other under a **named** yield rule.

- Orientation before intelligence
- Relationship is the primary context
- Familiar outside, transformative inside

### The two governing rules

> **R1. Tier 2 never overrides Tier 1.** A better experience is not a reason to cross an enforced
> boundary.
>
> **R2. A Tier 1 conflict resolves to the more restrictive reading**, and the conflict is recorded
> rather than silently resolved.
>
> **R3. Every yield is named at the point of use** — in the code, in the spec, and where a person
> can encounter its effect. An unnamed yield is indistinguishable from an unnoticed violation.

This explains the collision set: every conflict found so far is **Tier 2 pressing against Tier 1**
(orientation wanting to expose a privacy boundary) or **Tier 2 against Tier 2** (familiar navigation
against relationship-primary framing). None is Tier 1 against Tier 1 — which is evidence the tiers
are drawn in roughly the right place.

## 2. Yield rules

Four, as authored, with scope noted:

### Y1 · Familiarity vs transparency
> **Expose familiar human concepts first. Reveal architectural complexity only when needed for
> understanding, trust, or agency.** The architecture serves the human; it does not become the
> interface.

Scope: Tier 2 internal (#7 yielding to #1 under a named condition). The three triggers —
*understanding, trust, agency* — are the operable part; without them "when needed" is unbounded.

### Y2 · Personalization vs sovereignty
> **The system may increase relevance, but it may not increase authority.** A better recommendation
> is still only a suggestion.

⚠️ **Requires reconciliation with §4.** Relevance *is* presence authorship — increasing relevance
means the system is authoring what appears. Y2 permits it; §4 requires that every appearance name
whose act caused it. **These are compatible only if relevance is constrained to answer *why now* and
*whose act*.** Stated without that link, Y2 and §4 will be read as licensing opposite things.

### Y3 · Reflection vs interpretation
> **The system may point to evidence; the human determines meaning.**

✅ Allowed: *"You wrote about leaving your role in March and again in June."*
⛔ Not allowed: *"You have a recurring fear of abandonment."*

The first reveals a relationship between artifacts the person can verify. The second creates a
psychological claim. See §3.1 for the one part of this still open.

### Y4 · Safety vs usefulness
> **Safety boundaries constrain action, not presence.** The system remains available without
> crossing the boundary.

⚠️ **Scope limit — this does not resolve Q-P2.** Y4 governs MAIA's own conduct: MAIA stays present
without acting past a boundary. It does **not** govern *rendering another person's boundary to a
third party*. On Larry's client page, "remaining available" about material he cannot see is exactly
the rendered-absence problem — E-3 ruled private sovereignty is **silent**, and a labelled empty slot
is not silence. Q-P2 remains open and must not be considered closed by Y4.

## 3. The four acts

| Act | Meaning | Authority — as authored | Authority — **recommended correction** |
|---|---|---|---|
| **Remember** | retrieve what exists | system | ⛔ **member consent; the system only executes** |
| **Reflect** | reveal relationship to evidence | shared boundary | shared boundary ✅ |
| **Suggest** | offer possibility | system | ⛔ **whoever invited it; unsolicited = no author** |
| **Act** | change reality | human authorization | human authorization ✅ |

**Two rows need correcting, and the correction comes from this constitution's own §4.**

**Remember.** Retrieval is not a system authority in this system. It is consent-governed in shipped
code: Sanctuary Mode's absolute boundary; `member_daily_anchors.surface_preference` defaulting to
`member_pulled` (private) with contextual surfacing requiring the member's own opt-in; the atoms
`return_preference` model; refusal **R08**. The mechanism is the system's; **what may be held and
what may surface is the member's.** Writing "authority: system" on this row would license against
behavior that is already live and consent-gated.

**Suggest.** A suggestion whose appearance nobody authored fails §4 by construction — the only
answer to *"whose act put this here"* is *the system's*. This is also already ruled: Continue lists
**named doors, never a computed suggestion.** The honest rule is that a suggestion's authority is
**derived from the invitation**, and unsolicited suggestion is where a companion becomes a feed.

> **The self-consistency finding: the presence-provenance principle invalidates "system" as an
> authority on two of the four rows.** That is a good sign — the new principle is doing real work
> rather than describing existing practice.

### 3.1 Reflect — the one genuinely open question

Reflection is where AI systems become dangerous, and *anchoring* is the right answer: reflection is
admissible when it is anchored to artifacts the person authored and can verify.

**What anchoring does not yet settle: who chose the unit.**
*"You wrote about leaving your role in March and again in June"* is verifiable — but *"leaving your
role"* is a category, and something selected it. If MAIA chose the unit, an interpretive act occurred
before the factual claim was made, and the factual claim inherits its framing.

Three candidate resolutions, none ruled:

1. **Member-authored units only** — reflection may only count categories the member named (a mark,
   a title, a Keep). Most restrictive; provably safe; possibly too narrow to be useful.
2. **Quoted units** — the unit must be the person's own words, reproduced verbatim, not paraphrased
   into a theme.
3. **Unit disclosed and refusable** — MAIA may propose a unit, must show it as a proposal, and the
   member may reject it, which is then remembered.

**Recommend ruling this before any reflective surface ships.** It is the smallest remaining piece of
the third-voice question and everything else about *Reflect* is settled.

## 4. Presence has provenance

> **Every surfaced item must be able to answer: who created it · who confirmed it · who caused it to
> appear here · why is it appearing now.**

Content authorship and presence authorship are different, and only the first is currently enforced.
The worked example is exact: a card reading *"You have been struggling with confidence"* attributed
to MAIA looks transparent, and the transparency is incomplete — *why did it appear?* Because the
member asked, because the member selected a theme, because a model inferred relevance, or because a
ranking prioritized it. Those are four different systems wearing the same card.

**Scope: everywhere.** MAIA conversations · Field notes · Author Studio suggestions · Soul Portrait ·
practitioner views · memory retrieval.

**Two consequences that follow immediately:**

- **A rendered slot is a presence claim.** An empty labelled band asserts that something belongs
  there. Its presence must be authored like anything else — which is why Q-P2 is a §4 question, not
  a copywriting question.
- **Ranking is authorship.** Any ordering that is not a member gesture or a chronology of authored
  acts must answer *why now*. This is the generalization of **E-2** — *kept, not last; the member's
  gesture determines presence* — from the Field to the whole platform.

⚠️ **Enforcement gap:** unlike privacy (which has a gate) presence-provenance has no mechanism. As
prose it is a description, not a boundary. **Before it is ratified, name what enforces it** — a
required field on surfaced objects, a lint, or a review gate — or it joins the set of controls that
exist only in documentation.

## 5. Failure modes and their detection tests

| Failure mode | Detection test |
|---|---|
| **False coherence** — appears wiser, more certain, more connected than the evidence warrants | *Can this claim fail?* Name the observation that would falsify it. |
| **False absence** — appears to know less than it does | Does a shipped, verified capability go undescribed or get denied? |
| **Hidden authority** | Which of the four acts is this, and who authorized *that act*? |
| **Blended authorship** | Delete the attribution line. Does the sentence still read as true? If yes, it was written in the system's voice. |
| **Surveillance disguised as personalization** | Name the act and its author. Activity-derived signal is surveillance with good typography. |
| **Complexity exposed instead of absorbed** | Did the person have to learn a system concept to complete a human intention? |

### 5.1 The symmetric pair

> **False coherence:** *"MAIA understands your pattern."*
> **False absence:** *"The system has no continuity"* — when verified memory exists.

Both are failures of the same discipline in opposite directions. This is already ratified in the
project record as inflation drift and its inverse (*live infrastructure stays invisible until
explicitly measured; naming the mechanism, not the mythology*). Recording the pair here consolidates
it rather than introducing it.

**The trustworthy posture, which is the article's summary:**

> Here is what exists. Here is what does not. Here is what is inferred. Here is what remains unknown.

Note that this posture is itself a presence-provenance claim about the system's own state — the four
categories are exactly *created / confirmed / caused-to-appear / why-now* applied to capability
rather than to content.

## 6. Parent and child charters

```
AIN OS Experience Constitution
   ├── Member Experience Charter
   ├── Practitioner Experience Charter
   ├── Author Studio Charter
   ├── Now What? Charter
   └── MAIA Interaction Charter
```

Children inherit authorship rules, relationship rules, intelligence boundaries, agency principles;
each surface expresses them differently. This avoids both *one constitution that says nothing useful*
and *every studio inventing its own worldview*. The structure is right.

⚠️ **One structural problem: the tree mixes three axes.** *Member* and *Practitioner* are
**audiences**; *Author Studio* and *Now What?* are **surfaces**; *MAIA* is an **agent**. Now What?
has both a member surface and a practitioner surface, so a Now What? Charter would inherit from two
parents — and the first question any real conflict raises is *which charter governs*.

**Recommended: one axis, surfaces, with audience as views inside each.**

```
AIN OS Experience Constitution
   ├── Now What? Charter          (member view · practitioner view)
   ├── Author Studio Charter      (⟵ the existing Member Experience Design Constitution)
   └── MAIA Interaction Charter   (cross-cutting: applies within every surface)
```

Audience-level rules (what a practitioner may ever see of a member) belong in the constitution
itself, not in a sibling charter — they are precisely the Tier 1 boundaries, and Tier 1 must not be
re-expressible per surface.

**Blocking action, unchanged:** the Author's Studio **Member Experience Design Constitution** already
exists, is not operative, and its yield clause is unruled. Under this structure it becomes the Author
Studio Charter and its yield clause resolves by inheriting §1–§2. **Do not ratify this article while
that document still stands as an unrelated peer.**

---

## 7. Open items

| # | Item | Kind |
|---|---|---|
| 1 | **§1 principle hierarchy** — Claude-drafted tiers require founder ruling | ruling |
| 2 | **§3.1 who chooses the unit of reflection** — three candidates, none ruled | ruling; blocks any reflective surface |
| 3 | **§2 Y2 ⟷ §4 reconciliation** — relevance permitted vs presence must be authored | drafting |
| 4 | **§4 enforcement** — presence-provenance has no mechanism; prose is not a boundary | mechanism |
| 5 | **§6 charter tree axis** — surfaces vs audiences vs agents | ruling |
| 6 | **Author's Studio charter reconciliation** | blocking, unchanged |
| 7 | **Q-P2 rendered absence** — explicitly *not* closed by Y4 | ruling |

⛔ Nothing here authorizes code. Navigation model, first-30-seconds, and the Slice 0 prototype
specification remain not-started and blocked on items 2, 5, and 7.
