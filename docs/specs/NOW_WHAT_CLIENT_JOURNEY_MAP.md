# Now What? — Client Journey Map

**Date:** 2026-08-03 · **Status:** ⛔ **JOURNEY MAP — the artifact requested before code.** Authorizes nothing.
**Companion:** [`NOW_WHAT_ONBOARDING_PRE_IMPLEMENTATION_REVIEW.md`](NOW_WHAT_ONBOARDING_PRE_IMPLEMENTATION_REVIEW.md)
**Substrate referenced:** `feature/now-what-invitation-loop` @ `46e8b5bb0`

> ⭐⭐⭐ **The invitation loop is not the onboarding flow.** The bridge answers *"how does an existing
> relationship create a context for a member?"* Onboarding answers *"how does a person who does not yet
> know AIN or Now What? enter the environment?"* **They meet. They are not the same path.**

---

## 1. The journey, with owner per layer

```
   Unknown person
         │                      ← knows Larry. Does not know Soullab, AIN, or MAIA.
         ▼
   Larry's invitation                                    OWNER: Larry
         │                        a relationship act, in his words, his name
         ▼
   ╔═══════════════════════════════════════════════════╗
   ║  TRUST THRESHOLD                    OWNER: shared  ║   ← §3. The sacred one.
   ╚═══════════════════════════════════════════════════╝
         │
         ▼
   Account creation                                      OWNER: AIN
         │                        identity, security, consent to the platform
         ▼
   AIN universal orientation                             OWNER: AIN
         │                        what this environment is · what it will not do
         ▼
   Now What? flourishing orientation                     OWNER: Now What? (expression)
         │                        Larry's lens · ⛔ Screen 3 held, §4
         ▼
   Ongoing Client Field                                  OWNER: MEMBER
                                  their meaning, their memory, portable beyond Larry
```

| Layer | Owner | May never be owned by |
|---|---|---|
| Invitation relationship | **Larry** | the platform (⇒ absorption) |
| Account / security | **AIN** | the practitioner |
| Universal orientation | **AIN** | the expression |
| Flourishing lens | **Now What?** | the universal layer |
| **Meaning** | **MEMBER** | ⛔ **anyone else, ever** |

---

## 2. ⭐⭐⭐ Two invitation objects, and they must not be conflated

**Founder, 2026-08-03:** *invitation to a member already in the system* ⊥ *invitation to become a member
through a trusted relationship.*

| | **Program invitation** | **Relationship initiation** |
|---|---|---|
| Addressed to | an **existing member** standing in a program | **someone who is not a member** |
| Presupposes | account · orientation · position | **nothing** |
| Creates | a context for work | **a person's entry into the platform** |
| Object | ✅ **`field_invitations` — BUILT** (`46e8b5bb0`) | ⛔ **DOES NOT EXIST** |
| Failure if conflated | — | a stranger with no account hits a surface that assumes one, or an account is created by a link they merely clicked |

⚠️ **What is built covers the right-hand column not at all.** `field_invitations` has no token, no
addressee-without-an-account, and its member endpoint requires a session. **That is correct, not a defect** —
it is one of the two objects, doing its own job.

⭐ **The second object is the actual next build**, and it is a *relationship initiation*, not an enrollment.

---

## 3. The trust threshold — the sacred part, stated as an invariant

> ### **The person trusts LARRY. They have never agreed to AIN.**

⛔⛔ **The failure to design against: someone joins a platform they never chose, because they trusted
their coach.** That is a sovereignty breach performed with an entirely friendly gesture, and it would be
invisible in every metric — the funnel would look excellent.

**Therefore two consents, never one:**

| # | Consent | To whom | ⛔ May not be implied by |
|---|---|---|---|
| **1** | *I accept Larry's invitation* | **Larry** | clicking a link |
| **2** | *I choose to enter this environment* | **AIN** | consent 1 |

⭐⭐⭐ **Founder ruling applied:** *the invitation creates the account **journey**, not the account.*
Before an account exists, the person must: **accept** the invitation · **know who invited them** ·
**consent** to entering the relationship · **establish their own identity.**
> **An invitation is an invitation, not enrollment.**

⚠️ **Design consequence:** the arrival screen must name **Larry** and **Soullab/AIN separately.** A
welcome that names only Larry harvests his trust for a platform the person has not met. A welcome that
names only the platform discards the reason they came.

---

## 4. Screen 3 — HELD (founder)

✅ The **container** may exist: *"What aspect of flourishing would you like to explore?"*
⛔ The dimensions may not. **Five different five-item lists now circulate in Larry's name; none came from
Larry** (review artifact §0). ⛔ **Do not create a "close enough" PERMA/flourishing interpretation.**
Larry's actual taxonomy is inserted **only after provenance**.

---

## 5. Onboarding origin — as ruled

```sql
onboarding_origin ∈ { 'direct', 'invited_practitioner', 'invited_program' }
```

⛔ **Not** `skipped_begin = true`. That frames invitation as an **exception**. It is not a shortcut — it is
a **legitimate doorway**.

> **Every member receives orientation. The doorway may differ.**

⚠️ `members.onboarding_step` is `VARCHAR(50)` with **no CHECK constraint** — origin can be added with no
migration. Convenient, and exactly why the value set is written down here instead of being discovered
later from data.

---

## 6. What this map does not settle

| # | Open | Holder |
|---|---|---|
| **1** | The relationship-initiation object: token? email? expiry? single-use? who may issue? | founder |
| **2** | Larry's flourishing taxonomy | **Larry** — needs the signed instrument |
| **3** | Whether `/intro-maia` · `/intro-daimon` are restored or removed (documented in `CLAUDE.md`, absent on trunk) | founder |
| **4** | Where universal orientation ends and the flourishing lens begins, screen by screen | founder |

⛔ **No component, route, migration, or copy has been written for any of this.**

> **A practitioner can open a doorway into someone's development without becoming the owner of that
> person's development.** The invitation bridge proves it at the member layer. The trust threshold is
> where it has to hold for someone who is not a member yet — and that is the part that does not exist.
