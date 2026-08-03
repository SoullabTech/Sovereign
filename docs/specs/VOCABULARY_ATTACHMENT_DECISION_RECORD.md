# Vocabulary Attachment — Decision Record

**Status:** ⏳ **OPEN.** Structure and lifecycle direction recorded as **leans**; the
attachment decision itself is **not ruled**.
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

## 4. The collision, and the lean that resolves it

> **When the practitioner relationship ends, whose language does the member's retained field
> memory use?**

A person may leave a coaching program while keeping a decade of insights.

> **The memory must not become a permanent advertisement for one practitioner's vocabulary.**

### Proposed rule — LEAN, not ruled

- Historical member artifacts **preserve the member's own words**
- Practitioner vocabulary **may frame active experiences**
- Active context **may render the practitioner's expression**
- Retained memory **degrades toward member language, not practitioner language**

---

## 5. 🔴 The implementation consequence of §4

This is the part that is easy to get wrong and expensive to reverse.

> **Vocabulary must be resolved at RENDER time, never substituted at WRITE time.**

If a practitioner's label is baked into the stored artifact when it is created, **degradation
in §4 becomes impossible** — there is nothing left to degrade *from*, because the member's
material now literally contains the practitioner's words. The stored record must hold the
**universal verb plus the member's own words**; the expression layer is applied on the way
out, against the relationship's *current* state.

Corollaries:

- Storage is vocabulary-neutral. `member_field_note_threads` already satisfies this — it
  stores the member's text against a neutral tag, not a practitioner label. **This is
  accidentally correct today and must be protected deliberately.**
- A vocabulary change by a practitioner is **not a data migration.** If it ever looks like
  one, write-time substitution has crept in.
- The same artifact renders differently in an active relationship and after it ends. That is
  the intended behaviour, not a bug.

### Open inside §4

1. **Is degradation automatic or a member gesture?** Automatic degradation is a system act on
   the member's material — arguably only removing framing the member never authored, but it
   is still the system acting unbidden. A member gesture is safer and may be friction the
   member never wanted.
2. **What triggers it** — relationship end, withdrawal, practitioner change, or elapsed time?
3. **Is degradation reversible** if the member returns to that practitioner?

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

## 7. ⛔ Still to rule — the decision this record exists for

1. **Attachment point** — practitioner · program · practice field · relationship · member
   journey, or a combination (§2, §3).
2. **Whether the two-layer lean (§3) becomes the ruling.**
3. **Whether the degradation rule (§4) becomes the ruling**, and how §5's three open
   questions resolve.
4. **Default vocabulary** where a practitioner supplies none.
5. **Layer suppression** — may a practitioner hide a layer their practice does not use?

---

## 8. Not authorized

- ⛔ No implementation before §7.1 is ruled.
- ⛔ No binding to `practice_fields` on grounds of convenience.
- ⛔ **No write-time vocabulary substitution, under any attachment model** — this one holds
  regardless of how §7 resolves.
- ⛔ No second domain expression before the seam exists.
- ⛔ No rewrite of Phase 1.
