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

## 5A. Navigation identity — RULED

**RULED — founder, 2026-08-03.** The earlier question was the wrong one:

| ⛔ Was asked | ✅ Actually asked |
|---|---|
| *"Is the Client Field a place the member goes?"* | *"Is the Client Field the member's experience of their work?"* |

> ### The Client Field is not another destination. It is the field rendered through the current relationship context.

The Member Field is already ratified as the platform root. A Client Field that were a
*sibling* would give the member **two homes** — and the second one would have been created by
the practitioner relationship. That is a lens becoming the owner's name for the environment:
it fails the invariant (§6A of the vocabulary record) directly.

```
⛔ REFUSED — a menu of competing identities

AIN
 ├── Client Field
 ├── Now What?
 ├── Author Studio
 └── other rooms
```

```
✅ RULED — the environment stays primary

AIN
 |
 Member Field
 |
 +-- Now What? lens
 +-- Author lens
 +-- Spiritual direction lens
```

### What this ruling produces

Navigation becomes a **consequence** of the vocabulary resolution chain, not a separate
system: practice-field context resolving *is* what "the Client Field is active" means. Lens
release then applies to navigation exactly as it applies to artifacts — the relationship ends,
the lens releases, and the member keeps their home.

⛔⛔ **No separate client-side navigation model may be built.** Building one would recreate
the second root this ruling rejects.

---

## 6. Open — status after the 2026-08-03 sitting

1. ~~**Where does vocabulary live?**~~ ✅ **RULED** — read-time resolution chain, not a
   carrier. See the vocabulary record §6C.
2. ~~**Is there a default vocabulary?**~~ ✅ **RULED** — the universal verb. Vocabulary is
   **not** mandatory at field creation.
3. ~~**May a practitioner suppress a layer?**~~ ✅ **RULED — no.** Suppression of a universal
   capability is re-authorization, not relabeling.
4. **Relationship to `practice_fields`** — ⏳ **still open.** The chain names a *practice-field
   context* position; whether the existing `practice_fields` table is the carrier for it
   remains an assumption. ⛔ No binding on grounds of convenience.
5. **Language governance layer** — ⏳ **newly opened by CF-D5b.** Verb binding closes the
   authority hole; the language hole (`Practice → Assignment`) is not mechanically decidable
   and needs a governance surface.

---

## 7. What this does not authorize

- ⛔ No rewrite of Phase 1 — it is reclassified, not rejected.
- ⛔ No claim that the Phase 1 walk tests the universal field.
- ⛔ No new domain expressions before the vocabulary seam exists.
- ⛔ No separate client-side navigation surface (§5A).
- ⛔ No `practice_fields` binding before §6.4 is ruled.
