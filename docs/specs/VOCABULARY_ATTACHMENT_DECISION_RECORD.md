# Vocabulary Attachment — Decision Record

**Status:** ⏳ **PARTIALLY RULED.** Boundaries (CF-D5a) and the render firewall (CF-D5c) are
**settled**; lens-release mechanics are **ruled** (§4.3–4.5). **CF-D5b — vocabulary
authorship — and the attachment model remain open.** See the ledger, §7.
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

## 7. Decision ledger

| Ref | Decision | State |
|---|---|---|
| **CF-D5a** | Vocabulary boundaries — constraint vs naming authority | ✅ **settled** (§1) |
| **CF-D5c** | Attachment boundary — the render firewall | ✅ **settled** (§5) |
| **CF-D5b** | **Vocabulary authorship — who may author the lens** | ⏳ **open** |
| — | Attachment model — which entity carries the vocabulary | ⏳ open (§2) |
| — | Lens-release mechanics | ✅ ruled (§4.3–4.5) |
| — | Two naming layers (§3) | ⏳ lean, not ruled |
| — | Default vocabulary where none is supplied | ⏳ open |
| — | Layer suppression — may a practitioner hide an unused layer? | ⏳ open |
| **D9** | Human encounter authorization | ⏳ open, independent |

### CF-D5b is now much narrower than it looks

> **CF-D5b is not deciding who owns meaning. That is already settled.**
>
> It decides only **who is permitted to author the temporary lens** through which universal
> human work is expressed.

Ownership, authorship of meaning, and the render firewall are all settled above. What remains
is a question about **the lens**, and a lens is by construction temporary, non-owning and
releasable.

---

## 8. Not authorized

- ⛔ No implementation before CF-D5b and the attachment model are ruled.
- ⛔ No binding to `practice_fields` on grounds of convenience.
- ⛔ **No write-time vocabulary substitution, under any attachment model** — this holds
  regardless of how anything else resolves.
- ⛔ **No product language implying the post-relationship state is reduced** (§4.2).
- ⛔ No second domain expression before the seam exists.
- ⛔ No rewrite of Phase 1.
