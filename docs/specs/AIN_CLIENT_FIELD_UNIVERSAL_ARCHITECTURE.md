# AIN Client Field — Universal Architecture

**Status:** **RULED — founder, 2026-08-03.** Upstream of the Now What? lane.
**Relationship to prior artifacts:** governs `MY_WORK_FIELD_GOVERNANCE_MODEL_V1.md` and
`MY_WORK_FIELD_UX_SPEC_V1.md`, which describe **one expression** of this field, not the
field itself.

---

## 0. The correction

> **The Client Field should not be redesigned around Larry.** It should become the **AIN
> human development field**, and Now What? becomes the first flagship expression running
> on it.

**The mistake to avoid: making the universal field speak Larry's language everywhere.**

```
                    AIN / Universal Client Field
                              |
        ------------------------------------------------
        |                      |                       |
   Executive Coaching      Spiritual Direction     Education /
   Now What?               Healing                 Other Practices
```

Now What? does not **replace** the universal field. It **fills** it.

---

## 1. The universal question

> *"What am I working with, and how does it continue to live in my life?"*

The field is a **human development environment**, not a coaching dashboard.

---

## 2. The five universal layers

### 1 · Current Work — *"What is alive for me right now?"*

A leadership challenge · a relationship transition · a spiritual inquiry · a learning goal ·
a health or life change · a creative project.

**Source:** member declaration, or practitioner context **attributed**.

### 2 · Practice — *"What am I experimenting with?"*

| Domain | Example |
|---|---|
| Executive | *Have the conversation you have been avoiding.* |
| Healing | *Notice where your body signals resistance.* |
| Learning | *Practise the new skill daily.* |
| Spiritual | *Sit with this question.* |

> **Practice is an invitation, not compliance.**

### 3 · Explore — *"What am I discovering?"*

Where meaning emerges: insights · observations · questions · patterns · realisations.

**Never:** AI interpretation · practitioner diagnosis · scores.

### 4 · Keep — *"What is worth carrying forward?"*

The member's field memory: decisions · commitments · insights · moments of clarity ·
meaningful experiences.

### 5 · Connect — *"Who am I connected with in this work?"*

Coach · teacher · facilitator · guide · group · cohort · community.

---

## 3. The architecture rule

> **The universal layer owns the VERBS. Practitioners own the VOCABULARY.**

| Universal verb | Now What? (executive) | Another practitioner (healing) |
|---|---|---|
| **Focus** | Leadership Focus | Healing Journey |
| **Practice** | Flourishing Practice | Somatic Practice |
| **Explore** | Executive Insight | Integration |
| **Keep** | Leadership Commitments | Transformation |
| **Connect** | Coach Relationship | Guide Relationship |

**Same architecture. Different domain language.**

This is what keeps the field from becoming a coaching product with other domains bolted on.

---

## 4. What the member never sees

Programs · lessons · stages · objects · assignments are **practitioner-side structures.**
They organize the practitioner's authoring; they are never the member's mental model.

For an executive, the field reads as **"my leadership development environment,"** never
**"my coaching homework portal."**

```
My Leadership Work

  What I'm focusing on
  What I'm practising
  What I'm learning
  What I'm carrying forward
  Who I'm working with
```

---

## 5. 🔴 Finding — Phase 1 hard-codes one domain's vocabulary

Verified at `78358f979` (`feature/my-work-field-phase-1`). The Phase 1 shell ships
executive-coaching language **in the universal layer**, where under §3 only verbs belong:

| Location | String | Domain-bound term |
|---|---|---|
| threshold `line` | "Where your **leadership** work continues between conversations." | leadership |
| arrival copy | "When your **practitioner** invites you into a **programme**…" | programme |
| strand label | "**Decisions** you are carrying" | decision |
| strand label | "**Questions** you are living" | — (universal) |
| strand label | "What you are **practising**" | — (universal) |
| block eyebrow | "Shared with your **coach**" | coach |
| trust copy | "the **decisions** you are working through, what you are practising, the **questions** you are living" | decision |

**This does not invalidate Phase 1.** It reclassifies it: Phase 1 is a **Now What?
expression**, correctly built, sitting at the wrong altitude. The structure — contextual
stream, arrival-as-welcome, context-before-objects, preserved authorship — is universal and
survives. The **labels** are Larry's and must move into a vocabulary layer.

**Consequence for the encounter walk:** the instrument at
`docs/reviews/CLIENT_FIELD_PHASE_1_ENCOUNTER_INSTRUMENT.md` tests `78358f979` as an
**executive** surface. That is still a valid test of the Now What? expression. It is **not**
a test of the universal field, and its results may not be cited as one.

---

## 6. Open — not ruled here

1. **Where does vocabulary live?** A practice-field-scoped label set, a per-program override,
   or practitioner-authored? This is the P0 of the universal lane.
2. **Is there a default vocabulary** when a practitioner supplies none — a neutral universal
   set, or is vocabulary mandatory at field creation?
3. **Do the five layers bind 1:1 to the five verbs**, or can a practitioner suppress a layer
   their practice does not use?
4. **Relationship to `practice_fields`** — the existing field-scoping table is the obvious
   carrier for vocabulary, but that is an assumption, not a ruling.

---

## 7. What this does not authorize

- ⛔ No code. No vocabulary layer built before §6.1 is ruled.
- ⛔ No rewrite of Phase 1 — it is reclassified, not rejected.
- ⛔ No claim that the Phase 1 walk tests the universal field.
- ⛔ No new domain expressions before the vocabulary seam exists.
