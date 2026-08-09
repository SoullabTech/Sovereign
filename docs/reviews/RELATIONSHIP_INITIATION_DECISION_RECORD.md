# Relationship Initiation — Decision Record

**Date opened:** 2026-08-03 · **Status:** ⏳ **OPEN — RI-1…RI-6 unruled.** Claude may Draft and Record, never Ratify.
⛔ **No implementation follows from this document.**
**Upstream:** [`NOW_WHAT_CLIENT_JOURNEY_MAP.md`](../specs/NOW_WHAT_CLIENT_JOURNEY_MAP.md) ·
[onboarding pre-implementation review](../specs/NOW_WHAT_ONBOARDING_PRE_IMPLEMENTATION_REVIEW.md)
**Built substrate:** `field_invitations` (program invitation) @ `46e8b5bb0` — ⛔ **a different object from the one decided here.**

---

## 0. The principle these decisions serve

> ### **The person trusts Larry. They have never agreed to AIN.**

**Two consents, first-class, neither implying the other:**

| | Consent | Means |
|---|---|---|
| **C1 · Relationship** | *"I accept Larry's invitation."* | I recognise Larry · I understand why I am invited · I choose to continue this relationship |
| **C2 · Environment** | *"I choose to enter this environment."* | I understand what AIN is · MAIA's role · what information is mine · what is shared and what stays private |

⭐ **All three of these must remain possible, or the model is not real:**
trust Larry but **decline AIN** · enter AIN **without a practitioner** · work with Larry while **choosing
boundaries** on what is shared.

**Order is load-bearing:** `AIN consent → Now What? expression → member meaning`.
⛔ **Never** `Larry's framework → AIN acceptance hidden inside`.

---

## 1. The object being decided

⛔ **Not `field_invitations`.** That is built, and it is the *program* invitation.

| | Program invitation (built) | **Relationship initiation (this record)** |
|---|---|---|
| Recipient | existing member | **unknown person** |
| Auth | authenticated | **pre-account** |
| Relationship | already exists | **begins** |
| Scope | session | **token** |
| Gesture | accept / decline | **discover → consent → create** |

⚠️ Working name only — `relationship_invitations` / `client_invitation_tokens`. ⛔ Naming is part of RI-1, not a given.

---

## RI-1 · Who may create an invitation?

**Constrained by prior rulings, not yet decided.** Program invitations already gate on *authoring a field*
(`getAuthoredField`). The same gate is the obvious default; it is not automatically the right one, because
this object creates **people**, not contexts.

| | Option | Consequence |
|---|---|---|
| **A** | Any field author | consistent with the built gate; a new practitioner can invite strangers on day one |
| **B** | Field author **+ an explicit issuing grant** | slower; makes "who may bring people into AIN" a deliberate act rather than a side effect of authoring |
| **C** | Founder-issued only, for the pilot | ⭐ smallest reversible surface for one practitioner; ⛔ not a general answer |

⚠️ **Volume is a sovereignty question, not an ops question.** An unbounded issuer turns a trust bridge into
an acquisition channel.

### ⭐⭐⭐ The real risk is TRUST LAUNDERING (founder, 2026-08-03)

> **If anyone can issue invitations, the system begins borrowing trust from relationships it has not earned.**

⛔ The question is **not** *"who can send an email."* It is:

> ### **Who has earned the right to open an AIN threshold for another person?**

| Issuer | Benefit | Risk |
|---|---|---|
| Platform only | strongest AIN boundary | limits practitioner autonomy |
| **Approved practitioners** | aligns with the relationship model | **requires a practitioner trust model** |
| Any practitioner | scalable | trust boundary weakens |
| Members | network growth | highest acquisition risk |

### 🔴 Measured 2026-08-03 — three of the four options have no substrate

| What exists | What does not |
|---|---|
| `members.is_practitioner BOOLEAN DEFAULT false` (`20260107000001_practitioner_caseload.sql`) | ⛔ **no approval act, no approver, no grant record, no audit** |
| Field-authoring authority = owning a `practice_fields` row (`practitioner_member_id`), via `getAuthoredField` | ⛔ **no practitioner status, verification, or tier of trust.** `practitioner_tier_pricing` is **billing**, not trust |

⇒ **Only *platform only* and *any field author* are implementable today.** *Approved practitioners*
requires an authority object AIN does not have.

⚠️⚠️ **And `is_practitioner` is a flag without provenance** — it records *that* someone is a practitioner,
never *who said so*. In a system whose central invariant is **attribution follows authorship**, the one
column that would gate opening a threshold for a stranger carries no author. ⛔ **Do not build RI-1 on
top of it without deciding that first.**

### ⛔ RI-1 — BLOCKED on a missing constitutional object (founder, 2026-08-03)

**The question was framed downstream of its prerequisite.**

| Asked | Prerequisite |
|---|---|
| *Who may issue a relationship initiation invitation?* | ⭐ **Who has the authority to represent that they may open this threshold for another person?** |

> **The invitation is not a feature permission. It is a delegated act of trust.**

**The four options were never equivalent — each carries a hidden assumption:**

| Option | Hidden assumption |
|---|---|
| Platform only | AIN retains all threshold-opening authority |
| **Approved practitioners** | ⭐ **someone has an attributable approval act** — matches the intended relational model, and **requires the missing layer** |
| **Any field author** | 🔴 **authorship implies trust authority** |
| Member referral | relationship trust transfers into platform authority |

🔴 **Option 3 is the dangerous one:** *"you created a practice field, therefore you may invite strangers
into AIN."* That **quietly transforms creative authority into relational authority.** They are different —
someone can be an excellent practitioner and still not have authority to open a platform relationship **on
behalf of AIN**.

### The missing object — Practitioner Standing Grant

```text
subject      practitioner
granted_by   authority          ← the part that does not exist today
scope        what they may do
created_at   when
status       active | revoked
```

⛔ **Not bureaucracy — attribution follows authorship.** `is_practitioner = true` answers *what is true*;
it does not answer *who made it true*. Sufficient for ordinary application logic; **not sufficient for
opening a threshold to another human being.**

```text
RI-1 issuer
    ⏳ BLOCKED on Practitioner Standing Authority
    Question:        who grants the right to open a pre-member consent instrument?
    Required before: "approved practitioner" can exist as an issuer class
```

⛔⛔ **No implementation may use `is_practitioner` as the answer.**

---

## RI-2 · What does the recipient see before accepting?

⭐⭐⭐ **Both names, separately.** A welcome naming only Larry **harvests his trust for a platform the person
has not met**. A welcome naming only the platform **discards the reason they came**.

```
Larry Closs has invited you to explore Now What?

Now What? is a platform from Soullab that helps you continue your
reflection and development between conversations.

  → Would you like to learn more and decide whether this
    environment is right for you?
```

⛔ **The first action is not conversion.** ⛔ Not *"Create your account."*

**Open sub-questions:** does the invitation carry Larry's own words (his object, permanently attributed) or
only the system frame? Is MAIA named here or at C2? **Ruling:** ⬜ ______

---

## RI-3 · What expires?

| Candidate | Note |
|---|---|
| The **token** | ✅ standard; expiry length is the question |
| The **offer** | ⚠️ different thing — a practitioner withdrawing is `withdrawn_at`, not expiry |
| The **person's ability to decide** | ⛔ **must not expire under pressure.** A countdown converts an invitation into a sales mechanic |

⚠️ **Single-use vs re-openable** matters more than duration: a single-use token that dies mid-orientation
strands someone who did nothing wrong (see RI-5). **Ruling:** ⬜ ______

---

## RI-4 · What happens if they decline?

**Must be a real decline:** ⛔ no residue · ⛔ no retry nag · ⛔ no re-invitation loop.
Precedent exists — program departure is a **hard DELETE with zero residue**, because *a closed-state
column would be an enrollment ledger by another name.*

⚠️ **Genuinely two-sided, and I do not think it is mine to settle:** should Larry learn it was declined?

| | For | Against |
|---|---|---|
| **Tell Larry** | it is **his** invitation; he needs to know not to re-send, and would learn in conversation anyway | the decline is the **person's act about themselves**, and reporting it upward makes AIN an informant about a non-member |
| **Don't** | strongest sovereignty reading | Larry re-invites into silence |

⭐ **Founder-indicated middle:** Larry sees his **own invitation's** state — *answered / unanswered* —
**without the answer.**

> **An invitation is a communication act. A person is allowed to respond. The response does not become a
> behavioural signal.**

```text
✅ Larry: "I offered a doorway."
⛔ Larry: "I know what happened internally after they approached it."
```

**Ruling:** ⬜ ______

---

## RI-5 · Accept, but do not complete orientation?

**Already constrained** by the amended invariant: *no entry path may bypass the orientation required for
informed participation.* ⇒ **They are not yet a participating member.** C1 given, C2 not.

⛔ **The state must not be silently upgraded**, and ⛔ **must not be presented as failure.** A person who
stopped to think is behaving correctly.

### ⭐⭐⭐ The naming correction (founder, 2026-08-03)

⛔ **Not `onboarding_incomplete`** — that language **already assumes membership**. Accurate:

```text
relationship acknowledged
environment consent pending
```

> **The person has not failed onboarding. AIN has not acquired a member. The system is waiting for a choice.**

### Direction (founder-indicated: **B**)

| | | |
|---|---|---|
| **A · ephemeral threshold** | no member record · no engagement history · no progress state · no analytics — the invitation is the **only** artifact | strongest sovereignty; less recovery if they return |
| **B · minimal invitation state** ⭐ | remembers only the **mechanics** — created · sent · accepted · expired. ⛔ **never** orientation progress · pages viewed · hesitation · time spent | *"treats the invitation as a **relationship object**, not a **person object**"* |

### ⚠️ The mechanism that decides whether B is real

**"Accepted" — by whom?** If acceptance is stored with an acceptor identity, B has created a person record
while claiming not to. B satisfies the principle **only** if the state belongs to the **invitation**:

```
✅ field-initiation row:  accepted_at TIMESTAMPTZ     ← the token was consumed
⛔ NEVER:                 accepted_by_person_id       ← there is no person yet
```

### 🔴 And the part that is not zero

The invitation row **necessarily carries a non-member's contact details**, because Larry supplied them.
**The minimum evidence is not "nothing" — it is "the address Larry already had."** That is honest and
unavoidable; what follows from it is a **retention** question, not a collection one:

⭐ **Follow the departure precedent — hard-delete on decline or expiry, zero residue.** A declined
invitation that leaves a row behind is a record of a person who said no.

### ✅ RI-5 — RULED (founder, 2026-08-03)

> **Before AIN consent, acceptance belongs to the INVITATION, not the person.** The system may record that
> an invitation was accepted, but may not **identify, profile, or observe** the person who accepted it
> until they choose to enter the environment.

> ⭐⭐⭐ **An invitation may know that it was acted upon. It may not know WHO acted upon it until that
> person chooses to become a member.**

**Object boundary — schema-level, not philosophical:**

| ✅ may contain | ⛔ may not contain |
|---|---|
| `issuer` · `recipient_contact` · `created_at` · `expires_at` · `accepted_at` · `declined_at` | person identity · member identity · engagement history · behavioural telemetry |

⛔⛔ **The moment `accepted_by_member_id` exists, the invitation has crossed the threshold and become a
person record.** `accepted_at TIMESTAMPTZ` allowed · `accepted_by_member_id UUID` **not allowed**.

**Lifecycle — the contact detail is invitation PROVENANCE, not member data:**

```text
Invitation created
      ├── accepted → transition to consent flow
      ├── declined → DELETE the invitation record
      └── expired  → DELETE the invitation record
```

⭐ **The deletion is not cleanup. It is enforcement of the principle:**
> **A person who declined entry does not become an artifact of the system.**

Consistent with the departure ruling — *ending a relationship should not leave behind an identity shadow.*

---

## RI-6 · What does Larry see before the person chooses AIN?

> ⭐⭐⭐ **Before C2 the person is not a member. There is no member-side data, and none may be manufactured.**

| Larry may see | Larry may NOT see |
|---|---|
| that **he** issued an invitation, and to whom (**he supplied it — he already knows**) | anything the person does inside AIN |
| whether it is answered — **pending RI-4** | orientation progress · time spent · pages read · hesitation |
| | ⛔ **any inference drawn from any of the above** |

⚠️ **The trap:** *"Larry should know how engagement is going."* Engagement telemetry about a person who has
not consented to the environment is **surveillance with a warm justification** — and it is exactly the
inversion the whole architecture exists to prevent.

### ⭐⭐⭐ The boundary (founder, 2026-08-03)

> **Larry owns the invitation he creates. He does not own the person's response process.**

| ✅ May know | ❌ May not know |
|---|---|
| *"I sent an invitation to Kelly."* | *"Kelly read three screens."* |
| *"The invitation was accepted."* (pending RI-4) | *"Kelly stopped at the consent page."* |
| | *"Kelly spent 12 minutes exploring."* · *"Kelly is interested but hesitant."* |

⭐ **Those are not relationship facts. They are observations about a person inside an environment they have
not entered.**

**Ruling:** ⬜ ______

---

## 2. Where the orientations split

| **Universal orientation — AIN** | **Now What? orientation — expression** |
|---|---|
| What is AIN? · What is MAIA? · Who owns my reflections? · What happens with my information? · How do I choose what to carry forward? | Why am I here with Larry? · What does flourishing after achievement mean? · What might I explore? · How might this support my next chapter? |

⛔ Screen 3's dimensions remain **HELD** — five lists circulate in Larry's name, none from Larry.

---

## 2b. ⭐⭐⭐ The framing rule for the next record

⛔ **Do not ask** *"what data do we collect before membership?"* — that frames **collection as the default**.

> ### **Ask: what is the minimum evidence required to honour a relationship invitation without creating a person record?**

**The extension of the Client Field invariant:**

> **A relationship can create an invitation. It cannot create ownership.**

| Larry can create | Larry cannot create — until the person chooses AIN |
|---|---|
| an invitation · a context · a developmental offering | membership · identity · meaning · engagement data |

⭐ The built bridge (`46e8b5bb0`) already separates **invitation authorship** ⊥ **invitation response** ⊥
**member meaning**. **The initiation object must preserve the same separation** — one layer earlier, where
there is not yet a person on the other side.

---

## RI-7 · ⏳ What event converts invitation → member?

**Candidates:** account creation · acceptance of AIN consent (**C2**) · completion of universal orientation.

> **The conversion event is the exact moment AIN is allowed to know: *this is now a person who chose to enter.***

### ⭐⭐⭐ These three are not interchangeable, and only one can be the event

| Candidate | Verdict |
|---|---|
| **Completion of universal orientation** | ⛔ **cannot be the event.** Orientation must be *completed* to make C2 informed — so it happens **before** consent. If conversion waited for it, AIN would have to track someone's progress through orientation while they are still a non-member, which is **exactly the RI-5 violation, one layer later** |
| **Account creation** | ⛔ **not the event — it is the CONSEQUENCE.** An account created before C2 is a person record made from a clicked link |
| **✅ C2 — acceptance of AIN consent** | **the event.** It is the only one that is a *choice by the person about the environment* |

### ⚠️ The architectural consequence, and it is load-bearing

If C2 is the conversion, then **universal orientation is rendered to a NON-MEMBER**:

```text
invitation → orientation (anonymous · token-scoped · ⛔ NO server-side progress)
           → C2 consent  ← CONVERSION
           → account creation
           → member
```

⛔ **Orientation may therefore store no progress state.** It must be resumable from the **token alone**, or
not resumable at all. Any *"you left off on screen 3"* is a person record that predates consent.

⭐ This also satisfies the amended entry invariant — *no entry path may bypass the orientation required for
informed participation* — because orientation now sits **upstream** of consent rather than after it.

### ✅ RI-7 — RULED (founder, 2026-08-03)

> **Consent to enter AIN is the conversion event. Account creation is an implementation consequence of that
> consent, not the evidence of it.**

⛔ **None of these is a member:** an email address · a token holder · an orientation participant · an
account shell. **The member exists when the person chooses the environment.**

⛔ **The inversion this refuses:** `invitation → account → orientation → consent` — which makes consent a
**confirmation of a decision already made on the person's behalf.**

⭐ **Orientation is a threshold experience, not a workflow.** A normal SaaS model wants
`screen_1_complete · screen_2_complete · screen_3_complete` because it wants funnel analytics. This
architecture needs only: *the person encountered the threshold · had enough information to choose · chose.*

> The product question changes from ⛔ *"how do we optimise completion?"*
> to ✅ **"what must a person understand before they can make a meaningful choice?"**

---

## 3. Status

```
Principle          ✅ two consents, neither implying the other
Object             ⚠️ distinct from field_invitations — naming in RI-1
RI-1 issuer        ⏳ Larry only · any practitioner · platform · member referral?
RI-2 arrival       ✅ both names, separately — first action is not conversion
RI-3 lifetime      ⏳ fixed expiry · issuer-revocable · immediate delete on decline
RI-4 decline       ✅ answered/unanswered — the system is not the messenger of a private choice
RI-5 partial state ✅ RULED — invitation state, never person state; delete on decline/expiry
RI-6 visibility    ✅ relationship facts, not person telemetry
RI-7 conversion    ✅ RULED — C2 is the event; account creation is its consequence
                      ⇒ orientation is pre-consent, anonymous, and stores NO progress
Implementation     ⛔ NOT AUTHORIZED
```

⭐⭐⭐ **What the missing object actually is:** ⛔ **not a bigger invitation table.** It is a
**PRE-MEMBER CONSENT INSTRUMENT.** `field_invitations` (built, `46e8b5bb0`) remains correctly scoped to
existing members; the initiation object lives one layer earlier, where there is not yet a person on the
other side.

> That distinction is what prevents the Now What? onboarding from becoming a **practitioner-branded
> acquisition funnel**, and keeps it as what the architecture is trying to create: **a trusted doorway
> into a sovereign environment.**

> ⭐ **The digital version should not create more intimacy than the human relationship provides.**
> Larry hands someone an invitation to dinner. He knows he offered it. He does not receive a report on
> whether they opened the envelope, reread it, or hesitated before declining.

> The invitation bridge is technically proven. The remaining work is **the trust handoff — without
> converting trust into ownership.**
