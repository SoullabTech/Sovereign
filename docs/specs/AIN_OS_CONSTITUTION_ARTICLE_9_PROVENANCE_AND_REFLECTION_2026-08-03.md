# AIN OS Constitution — Article 9: Provenance and Reflection

**Date:** 2026-08-03 · **Status:** ⛔ **DRAFT. NOT CANON. NOT OPERATIVE.**
Article of [the AIN OS Experience Constitution](AIN_OS_EXPERIENCE_CONSTITUTION_DRAFT_2026-08-03.md);
follows [Article 8 — Conflict, Yield, and Evidence](AIN_OS_CONSTITUTION_ARTICLE_CONFLICT_YIELD_EVIDENCE_2026-08-03.md).
Founder-authored structure and levels; recorded, checked, and extended by Claude.

> **The system performs the mechanism. The human retains the authority.**

That sentence resolves the four-act table and should be quoted in the constitution itself. It is the
generative rule the corrected table was reaching for.

---

## 1. The four provenance questions

Every surfaced object must be able to answer all four:

| # | Question | Name |
|---|---|---|
| 1 | Who created this? | **content provenance** |
| 2 | Who accepted or affirmed it? | **confirmation provenance** |
| 3 | Why is this appearing here, now? | **presence provenance** |
| 4 | Who authorized this action? | **authority provenance** |

> Without presence provenance, a system can be technically transparent while still manipulating
> attention.

**These are not four new inventions.** Questions 1 and 2 already exist in shipped code:
`field_program_positions.stated_by ∈ (member_confirmed, member_stated, practitioner_seeded)` with
`member_confirmed_at` NULL until the member's own gesture is exactly content + confirmation
provenance, expressed as schema. **Article 9 extends an existing pattern to two more questions rather
than introducing a new one** — which is the strongest available argument that it is implementable.

Scope: everywhere. MAIA conversations · memory retrieval · Field notes · Author Studio suggestions ·
Soul Portrait · practitioner views · Now What? surfaces.

## 2. Reflection levels

Reflection is not one category. Four levels, with what each may say:

| Level | Form | Example | Status |
|---|---|---|---|
| **L1 — Retrieval** | member-declared units only | *"You saved these three passages."* | ✅ admissible |
| **L2 — Evidence** | the member's own words, verbatim | *"In March you wrote: 'I don't think I can continue this role.'"* | ✅ admissible — **with a presence condition** (§2.1) |
| **L3 — Relationship** | a named relation between artifacts | *"These two passages appear connected."* | ⚠️ **conditionally admissible — and not where it looks** (§2.2) |
| **L4 — Interpretation** | a claim about the person | *"You have a pattern of avoidance."* | ⛔ forbidden |

### 2.1 L2's residue: selection is an act

Quoting verbatim removes interpretation from the *content*. It does not remove it from the
*selection*. Why that passage, out of everything written? The interpretive act moved upstream — which
is precisely what §1's presence provenance exists to catch.

> **L2 rule: the words are the member's, so the content is clean; the appearance is the system's
> unless the member's gesture or invitation put it there.** L2 is admissible on request, on a member
> gesture, or inside a member-initiated review. It is not admissible unsolicited.

### 2.2 ⚠️ L3 is not intermediate in risk — an unnamed relation is the least falsifiable claim in the ladder

The levels are ordered by how much the system says. **They are not ordered by risk**, and treating
them as a safety gradient is the trap.

*"These two passages appear connected"* contains a hidden predicate: **connected *how*?** The system
asserts an association and leaves the dimension blank, so the member supplies the meaning. That reads
as sovereignty-preserving and is the opposite: the system planted the association, took no
responsibility for it, and the member experiences their own filled-in meaning as their own insight.

Apply the project's standing test — ***can this claim fail?***

- *"You have a pattern of avoidance"* (L4) is wrong-able. The member can contest it. It is forbidden
  for other reasons, but it is at least falsifiable.
- *"These two passages appear connected"* (L3, unnamed) **cannot fail.** Any two artifacts are
  connected under some description. An unfalsifiable claim is the definition of false coherence.

> **L3 rule: a relation may be surfaced only when the relation itself is stated and checkable.**
>
> ⛔ *"These two passages appear connected."*
> ✅ *"Both of these mention leaving your role."* — the member can verify it, and can say *no, the
> second one isn't about that*, which means it can fail.

This also resolves Article 8 §3.1 (*who chose the unit*) at L3: **naming the relation names the
unit.** The unit stops being hidden the moment the connecting dimension has to be stated out loud.

### 2.3 The residual open item

L1 and L2 are settled by the rules above. L4 is forbidden. **L3 is admissible under §2.2 but the
choice of *which* relation to name remains a system act** — narrower than the original question, and
now bounded: the member can see the relation, verify it, and reject it. Whether a rejection must be
remembered (so the same relation is not re-proposed) is unruled and worth deciding — it is the
difference between a proposal and a nag.

## 3. The Reflect boundary

| | Permitted |
|---|---|
| **What MAIA may surface unprompted** | L1 only — member-declared units, and only where the member's own gesture accounts for the appearance |
| **What requires member participation** | L2 and L3 — an invitation, a request, or a member-initiated review |
| **What requires explicit consent** | any reflection that crosses a person boundary — surfacing to a practitioner, or drawing on material the member has not elected to share |
| **What is forbidden at any consent level** | L4. A member cannot consent their way into being told what their pattern means; that is not a privacy question but an authority question, and authority does not transfer |

⭐ The last row is the one to keep. **Consent governs visibility; it does not grant the system
interpretive authority.** A member saying *"tell me what you see"* invites L2/L3, not L4 — because
what L4 offers is not information the member lacks access to, it is a determination of meaning that
Invariant 16 places with them.

## 4. Enforcement pathway

Prose is a description, not a boundary. Four mechanisms, in increasing strength:

### 4.1 Schema
A provenance quad on surfaced objects, following the existing `stated_by` / `member_confirmed_at`
precedent: `created_by` · `confirmed_by` + `confirmed_at` · **`presence_reason`** (enum: member
gesture · member request · authored act by counterpart · scheduled · system relevance) ·
`authorized_by`. **`presence_reason` is the new field and the one that does the work** — an object
that cannot name why it appeared cannot be rendered.

### 4.2 Event records — with a hard constraint
`member_field_note_events` already exists, is member-keyed, and no practitioner route reads it.

> ⚠️ **Provenance records must be readable only by the person the item is shown to.** A
> platform-wide provenance log that any party can query *is* the surveillance surface — it would
> reconstruct exactly the activity trail E-3 forbids. Provenance is a property of a rendering, not a
> shared ledger.

### 4.3 UI constraint
No render path may surface an object lacking a `presence_reason`. This is enforceable at the
component boundary rather than by review — the same shape as *"never show disabled verbs"*: the
constraint is structural, so the violation cannot be drawn.

### 4.4 Tests — including one that mechanizes the hardest invariant

Extend the `verify-coach-field-boundaries.ts` pattern with:

- **Provenance completeness** — no surfaced object lacks the quad.
- ⭐ **Practitioner-view indistinguishability.** Render the practitioner's view against two fixtures
  that differ **only** in the member's private material — private reflections present vs absent,
  something withdrawn vs never created, MAIA having noticed vs not. **The rendered output must be
  identical.**

That test is the mechanical form of the §5 property below, and it is the strongest thing in this
article: it converts *"the absence itself should not become information"* from a design intention
into a gate that fails a build. Any difference — a slot, a count, a spacing change, an ordering
shift — is a leak, and the diff names it.

## 5. Y2 / Y4 separated — two different questions

Article 8 conflated these. They are distinct:

| | Presence provenance | Boundary rendering |
|---|---|---|
| **Question** | *Why did this appear?* | *How do we respect what does not belong to another person?* |
| **Answer form** | *"Because you saved this."* | Larry does not see a mysterious empty **Private Reflections** box |
| **Governs** | attention within one person's view | what one person's view may reveal about another |
| **Failure** | manipulated attention | inference across a person boundary |

**The boundary-rendering property, stated formally:**

> **A practitioner's view must be a function only of shared material.** From the shape of the
> interface, no one may infer that another person reflected, withdrew something, is withholding
> something, or that MAIA noticed something.

⭐ This closes **Q-P2** — but by a different route than either option previously on the table. Q-P2
asked how a practitioner experiences a structural absence without reading it as a defect. The answer
is: **they do not experience it at all.** There is no absence to interpret, because the view does not
vary with what is hidden. What Larry may be told — once, in the platform's honest description of what
a practitioner can and cannot see — is a *statement about the system*, not a *rendering of Senja's
state*. The first is orientation; the second is the leak.

Q-P2 moves from open to **resolved-pending-ratification**, with §4.4 as its evidence.

## 6. Charter inheritance — the correction that matters

> **Child charters do not redefine Tier 1.** They specify vocabulary, workflows, interactions, and
> evidence requirements. Tier 1 flows downward. **Constitutional inheritance, not independent
> constitutions.**

This resolves the dangerous half of the axis problem: no child can weaken a boundary. What remains is
a **routing** question, not a safety one — which charter governs a given surface — and it is
resolvable by convention rather than by ruling.

⚠️ **One inconsistency remains in the proposed tree.** A *Practitioner Experience Charter* whose
content is "what a practitioner may see" would place **Tier 1 material inside a child**, contradicting
the inheritance rule in the same document. Visibility across a person boundary is Tier 1 by
construction.

**Recommended:** Member and Practitioner charters may carry vocabulary, workflow, and evidence
requirements **only**. Every rule of the form *"X may/may not see Y"* stays in the constitution, where
it cannot be re-expressed, softened, or forked per surface. With that constraint the proposed tree
works as drawn.

---

## 7. Open items after this article

| # | Item | State |
|---|---|---|
| 1 | **Article 8 §1 principle hierarchy** — two tiers, Claude-drafted | ⏳ ruling |
| 2 | Unit-of-reflection | ✅ **largely resolved** — §2.2 (naming the relation names the unit) |
| 3 | L3 rejection memory — must a declined relation not be re-proposed? | ⏳ small ruling |
| 4 | Y2 ⟷ Y4 | ✅ **separated** (§5) |
| 5 | Presence-provenance enforcement | ✅ **pathway drafted** (§4) — ⏳ needs build authorization |
| 6 | Charter tree axis | ✅ **resolved by inheritance** + the §6 constraint |
| 7 | **Q-P2 rendered absence** | ✅ **resolved pending ratification** (§5) — the view does not vary |
| 8 | Author's Studio charter reconciliation | ⏳ **still blocking** |
| 9 | Vision Studio has no verified referent in the repo | ⏳ confirm before citing |

⛔ Nothing here authorizes code. §4 describes an enforcement pathway; building it is a separate
authorization.

> The hardest part of AIN OS is not intelligence. It is knowing when intelligence must remain
> subordinate to relationship.
