# Vocabulary Attachment — Decision Record

**Status:** ✅ **RULED — founder, 2026-08-03**, in the completion-docket sitting
(`docs/governance/CLIENT_FIELD_COMPLETION_DOCKET_2026-08-03.md`). CF-D5a, CF-D5b and CF-D5c
are settled; lens release is ruled (§4.3–4.5); the attachment model is ruled (§6B). The
ledger (§7) carries the closed state. **D9 remains open and is independent.**
**Governed by:** `AIN_VOCABULARY_ARCHITECTURE.md` (constraint/naming split) ·
`AIN_CLIENT_FIELD_UNIVERSAL_ARCHITECTURE.md`
**Why this blocks everything below it:** this decision determines whether every future
practitioner expression **remains a lens** or **becomes a competing ontology.**

---

## 1. The two authorities, settled

```
             CONSTRAINT AUTHORITY
                    ↓
                  Core
                    ↓
        Practitioner expression boundary
                    ↓
                  Member
                    ↑
              MEANING AUTHORITY
```

**Not competing hierarchies — they govern different things.**

### Core governs the envelope

*What actions are permitted? What boundaries cannot be crossed? What must remain true
regardless of domain?*

| ✅ Allowed | `Practice → Flourishing Practice` |
|---|---|
| ⛔ Not allowed | `Practice → Assignment` |

The word changed **and the authority model changed with it** — from invitation to
compliance. That is the exact failure mode vocabulary governance exists to prevent.

### Member governs meaning inside the envelope

The member's authority is **meaning authority**, not unlimited system authority.

```
Universal:      Keep
Expression:     Leadership Insights
Member:         "The moment I stopped trying to solve every problem myself."
```

The system may **not** improve that into *"Your breakthrough around delegation."* That would
be the system claiming authorship.

---

## 2. Why attachment is the real decision

> **Attachment determines lifecycle.**

Not the labels. The labels are downstream. Where vocabulary *lives* decides what happens to
a member's language when a program ends, a practitioner changes their framing, or a
relationship concludes.

### The four candidates

| Attached to | Advantage | Risk |
|---|---|---|
| **Practitioner** | authentic practitioner voice | member memory may inherit someone else's language **indefinitely** |
| **Program** | easy contextual expression | vocabulary **disappears when the program ends** |
| **Practice field** | aligns with an ongoing developmental relationship | may be **too broad** where a practitioner has multiple offerings |
| **Member (personal)** | strongest sovereignty | **cannot replace** practitioner expression — it complements it |

---

## 3. Lean — two naming layers, not one

> Recorded as a **lean**, not a ruling.

```
Expression vocabulary          Personal vocabulary
(practitioner / field)    +    (member)
```

The member layer does not *replace* the expression layer; the two coexist and resolve
differently depending on what is being rendered.

---

## 4. Lens release — RULED

> **When the practitioner relationship ends, whose language does the member's retained field
> memory use?**

A person may leave a coaching program while keeping a decade of insights.

> **The memory must not become a permanent advertisement for one practitioner's vocabulary.**

### 4.0 The formulation that keeps this consistent

> **This is not a transformation of the member's artifact. It is a change in the context
> through which the artifact is viewed.**

Nothing is rewritten. Nothing is lost. The lens is released; the object is untouched.

### 4.1 The rule — RULED

- Historical member artifacts **preserve the member's own words**
- Practitioner vocabulary **may frame active experiences**
- Active context **may render the practitioner's expression**
- Retained memory **returns to member language, not practitioner language**

### 4.2 ⚠️ Terminology guard — do not call this "degradation"

The word itself creates a bias:

| Read from | Reads as |
|---|---|
| the system | `rich contextual rendering → neutral rendering` = **loss** |
| the member | `external frame → portable meaning` = **maturation** |

> **The relationship added a lens. It did not create the meaning.**

**Product language must never imply the post-relationship state is a reduced state.** This
document uses **lens release** and **returning to portable meaning**. The term "degradation"
is retired — it survives in the git history of this file and nowhere else.

### 4.3 Automatic or member gesture — RULED

The clean line:

| | Requires |
|---|---|
| **Removal** of practitioner framing | **automatic** — permitted without a member act |
| **Addition** of new meaning | **a member gesture** |

**Because the practitioner label was never owned by the member.** Removing a contextual lens
does not alter the member's artifact.

```
Stored:              "I don't have to solve every problem immediately."
Rendered with Larry: "Leadership Presence — staying grounded with uncertainty"
Rendered after:      "I don't have to solve every problem immediately."
```

No member decision was needed, because **the member's content did not change.**

By contrast, *"I want to continue using Leadership Presence as my framework"* **is a new
member act** and requires a gesture.

### 4.4 Trigger — RULED: relational state, not time

| ✅ Strong | ⛔ Rejected |
|---|---|
| relationship ends | **elapsed time** |
| practitioner access withdrawn | |
| member leaves the practice | |
| practitioner vocabulary changes | |

Time is rejected on principle, not on difficulty: *"this lens expired because enough days
passed"* **turns a relationship boundary into an algorithmic judgment.**

### 4.5 Reversibility — RULED

If the member returns, **the old context can return without restoring ownership.**

```
✅  member language + current context
⛔  restore the old practitioner imprint
```

**The relationship resumes. The ownership never changed.**

---

## 5. 🔴 The implementation consequence — the render firewall

Easy to get wrong, expensive to reverse.

> **Vocabulary must be resolved at RENDER time, never substituted at WRITE time.**

```
WRITE PATH                          READ PATH
member words + neutral structure    active relationship context
            ↓                                   ↓
      stored artifact               practitioner vocabulary applied
                                                ↓
                                       rendered experience
```

If a practitioner's label is baked into the stored artifact at creation, **lens release
becomes impossible** — there is nothing left to release, because the member's material now
literally contains the practitioner's words. The stored record holds the **universal verb
plus the member's own words**; the expression layer is applied on the way out, against the
relationship's *current* state.

The same stored object legitimately appears differently:

| During the relationship | *"Leadership Presence — insight you are carrying"* |
|---|---|
| After the relationship | *"Insight you are carrying"* |

**The second is not a loss. It is the architecture honouring ownership.**

Corollaries:

- Storage is vocabulary-neutral. `member_field_note_threads` already satisfies this — it
  stores the member's text against a neutral tag, not a practitioner label. **This is
  accidentally correct today and must be protected deliberately.**
- A vocabulary change by a practitioner is **not a data migration.** If it ever looks like
  one, write-time substitution has crept in.
- The same artifact rendering differently during and after a relationship is **intended
  behaviour, not a bug.**

---

## 5A. What this buys the universal field

The universal layer no longer needs to know Larry's terminology, executive-coaching language,
positive-psychology vocabulary, spiritual-direction language or therapeutic language.

It needs to know only:

- **what kind of human activity is occurring**
- **who authored the meaning**
- **what permissions apply**

> **Expressions can come and go. The field remains.**

```
                    CORE
        universal verbs / invariants
                     ↓
          PRACTITIONER EXPRESSION
       temporary contextual vocabulary
                     ↓
             MEMBER EXPERIENCE
                     ↓
          MEMBER-AUTHORED MEMORY
       language + meaning owned by member
```

---

## 6. Phase 1 reclassified — a vocabulary instance, not an extraction

`78358f979` is **not something to "extract."** It should become a **vocabulary instance.**

```
Universal Field
        |
Now What? Expression
        |
Executive Leadership vocabulary
        |
Larry-specific content
```

> **The implementation mistake was not the experience design. The mistake was putting the
> third layer directly into the second.**

The domain vocabulary is hard-coded into the expression rather than being a swappable
instance beneath it. Phase 1's interaction design is correct and stays; its labels become the
first instance once §7 is ruled.

---

## 6B. CF-D5b — vocabulary authorship — RULED

> **Practitioners may author expressions within an enforced universal envelope.**

**RULED — founder, 2026-08-03.**

### What a practitioner MAY author

Their own domain language over the universal verbs — *Leadership Presence · Flourishing
Practice · Executive Reflection.*

### What a practitioner MAY NOT redefine — the non-overridable list

⛔ Fixed by Core, not negotiable by any expression:

- **what a decision is**
- **who owns an insight**
- **what counts as completion**
- **what the member's experience means**

These are not vocabulary. They are the envelope. A label that moves any of them is not a
relabel — it is a re-authorization, and it is refused.

### 🔴 The critical guard — technical mapping is not safety

> **A vocabulary label is not safe merely because it maps technically to a universal verb.**

| Universal verb | Allowed expression | Risky expression |
|---|---|---|
| `Practice` | Leadership Practice | **Assignment** |

`Assignment` bound to the `Practice` verb still behaves as an invitation *to the system* —
and imports a **compliance relationship** to the member reading it. The authority hole and
the language hole are **different holes**:

| Layer | Closed by | Mechanism |
|---|---|---|
| **Authority** — what the system does | verb binding: every label binds to exactly one universal verb | ✅ mechanical. Authority attaches to the **verb**, not the string; the render firewall (§5) guarantees the stored object carries the verb |
| **Language** — what the member reads | ⏳ **a language governance layer** | ❌ **not mechanically decidable.** Requires a governance surface, not a validator |

> **CF-D5b is therefore not only a data-model decision. It requires a language governance
> layer.**

⛔⛔ **Do not claim CF-D5b is enforced once verb binding ships.** Verb binding closes the
authority hole and leaves the language hole open. Claiming otherwise makes the boundary a
description. The language governance layer's **design** is downstream work; its **necessity**
is ruled here.

---

## 6C. Attachment — RULED: a read-time resolution chain

**RULED — founder, 2026-08-03.** The question was reshaped before it was answered:

| ⛔ Was asked | ✅ Actually asked |
|---|---|
| *"Where does the lens live?"* | *"How is context resolved when rendering?"* |

No single carrier can work: the four ruled release triggers (§4.4) each name a **different**
entity. That is why every candidate in §2 carries a fatal risk. Attachment is a **lookup**,
not an owner.

```
Member meaning
      ↑
Practice field context
      ↑
Program context
      ↑
Universal verb
```

Resolution is **first match wins**, read-time, per §5.

### The invariant this preserves

> **Context may shape perception; it may not acquire ownership.**

```
During the Larry relationship:   "Your exploration through Leadership Presence"
After the relationship:          "Your exploration"
```

**The member's artifact did not change. Only the lens released.**

### Release behaviour — no special-casing, no migration

| Trigger (§4.4) | Behaviour | Migration |
|---|---|---|
| program ends | program context drops · practice-field context still resolves | none |
| member leaves the practice | both drop · falls to the universal verb — the member's own words | none |
| practitioner changes vocabulary | practice-field context changes for everyone at once | **none** — if it ever looks like a migration, write-time substitution has crept in |
| member returns | context resolves again · ownership never moved (§4.5) | none |

### ⏳ Member personal vocabulary — deferred

The **Member meaning** layer is ruled as the top of the chain but **not built in v1**: §4.3
requires a member gesture for any *addition* of meaning, and no such gesture exists.
⛔ Shipping it without one would manufacture the gesture.

### Closed by derivation from this ruling

| Ref | Question | Ruled |
|---|---|---|
| universal §6.2 | default vocabulary when none is supplied | **the universal verb.** Vocabulary is **not** mandatory at field creation |
| §3 | two naming layers — lean or ruled | **ruled** — they are chain positions, resolved in order |
| universal §6.3 | may a practitioner **suppress** a layer | ⛔ **No.** Suppression of a universal capability is re-authorization (§1). *A layer with no content does not render* already covers the real case — that is emptiness, not suppression |

---

## 6A. The invariant

> ### A lens can illuminate experience. It cannot become the owner's name for the experience.

This is the whole Client Field challenge in one line. Practitioners matter; frameworks
matter; developmental language matters — **and the person's life remains theirs.**

Every rule in this document is a consequence of that sentence. Where a future decision is
ambiguous, resolve it against this.

### The lifecycle it produces

```
DURING the relationship          AFTER the relationship

Practitioner expression
        ↓
   temporary lens                     member meaning
        ↓                                   ↓
  member experience              portable member artifact
        ↓
   member meaning
```

**Nothing is migrated. Nothing is rewritten. Nothing is "cleaned."** The artifact was always
the member's.

### Why time-based release was rejected

A timer would manufacture an authority nobody granted: *"this relationship is no longer
relevant because six months passed."* That is not relational intelligence.

> **A relationship has state. It does not have an expiration algorithm.**

---

## 7. Decision ledger

| Ref | Decision | State |
|---|---|---|
| **CF-D5a** | Vocabulary boundaries — constraint vs naming authority | ✅ **settled** (§1) |
| **CF-D5c** | Attachment boundary — the render firewall | ✅ **settled** (§5) |
| **CF-D5b** | **Vocabulary authorship — who may author the lens** | ✅ **RULED 2026-08-03** (§6B) — practitioner authors within an enforced envelope; ⏳ **language governance layer required, not yet designed** |
| — | Attachment model — which entity carries the vocabulary | ✅ **RULED 2026-08-03** (§6C) — read-time resolution chain |
| — | Lens-release mechanics | ✅ ruled (§4.3–4.5) |
| — | Two naming layers (§3) | ✅ **ruled** — chain positions (§6C) |
| — | Default vocabulary where none is supplied | ✅ **ruled** — the universal verb (§6C) |
| — | Layer suppression — may a practitioner hide an unused layer? | ✅ **ruled — no** (§6C) |
| — | Member personal vocabulary layer | ⏳ **deferred to v2** — needs a member gesture that does not exist (§6C) |
| — | **Language governance layer** — design | ⏳ **open, newly opened by CF-D5b** |
| **D9** | Human encounter authorization | ⏳ open, independent |

### The CF-D5 stack — three different questions

```
CF-D5a   Vocabulary boundaries   "What may a lens DO?"          ✅
   ↓
CF-D5c   Lens lifecycle          "How long may it remain?"      ✅
   ↓
CF-D5b   Lens authorship         "Who may CREATE the lens?"     ⏳
```

### CF-D5b is now much narrower than it looks

**It does not decide:**

- ⛔ who owns meaning
- ⛔ whether member memory persists
- ⛔ whether practitioner language can become identity
- ⛔ whether context survives

Those are already constrained by §1, §4, §5 and §6A.

> **It decides only: who is allowed to create a temporary interpretive layer around a
> universal capability?**

A lens is by construction temporary, non-owning and releasable. Whoever receives authorship
of it **cannot acquire ownership through it** — that path is closed independently, above.

---

## 8. Not authorized

- ⛔ No claim that CF-D5b is *enforced* until the language governance layer exists — verb
  binding closes the authority hole only (§6B).
- ⛔ No member personal vocabulary layer before a member gesture exists (§6C).
- ⛔ No binding to `practice_fields` on grounds of convenience.
- ⛔ **No write-time vocabulary substitution, under any attachment model** — this holds
  regardless of how anything else resolves.
- ⛔ **No product language implying the post-relationship state is reduced** (§4.2).
- ⛔ No second domain expression before the seam exists.
- ⛔ No rewrite of Phase 1.
