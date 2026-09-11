# MEMBER-ACCESS-01 · STAGE 6 — RULING ON THE CORRECTED TARGET

**Opened** 2026-09-11 by founder act. **Ratification and closure of the target
architecture. Not implementation.**

> **After absorbing the falsifiers, is there now one architecture precise enough to
> hand to migration design without making the member carry any of its complexity?**

**Answer: QUALIFIED YES — one precision is still missing (§4), and one tension is
unresolved (§5).** Both are named here rather than discovered in migration design.

---

## 1 · Ratified — the five Stage-5 consequences

### R-B1 · Identity requires a nameable-contact SET

Email may not remain a singular identity column. A member is **none of** their
surfaces:

```
SOULLAB MEMBER  ·  immutable members.id
   ├── contact / identifier   verified, current
   ├── contact / identifier   verified, alternate
   ├── passkey(s) · password (legacy) · linked Google · linked Apple
   └── recovery credential(s)
```

The username survives as a **migration compatibility path** for members who still
depend on it. **It is not the future public doorway.**

### R-B3 · One-time assisted enrolment is legitimate; permanent rescue is not

> **Establish person → bind verified recovery/contact → preserve the same
> `members.id` → member is independently recoverable thereafter.**

The honest solution to a cohort with insufficient trustworthy evidence is **a
governed human ceremony once**, not clever automation.

### R-B4 · Unrecognised IdP authentication may never silently create membership ⭐

```
SIGN-IN WITH GOOGLE/APPLE     unknown provider identity
                              → NEVER creates · link or fail safely

EXPLICIT JOIN / INVITATION    provider proves control of an authenticator
                              → Soullab separately establishes membership
                              → ONE identity created as an explicit act
                              → provider identity linked to it
```

> **Authentication may prove a person. It may not silently grant standing.**

⭐ This is the **third independent arrival at one law**. Circles ratified it as
**FR-18** (*a recorded removal standing outranks a generic invitation*); Stage 3
generalised it as **D-17 / I-8**; B4 finds it again at the IdP boundary. **A law
that three unrelated lanes derive independently is load-bearing, not stylistic.**

### R-B5 · Waiting is a state, not a trap

A pending asynchronous channel **must never monopolise the doorway when another
valid path exists.** Honesty about acceptance is necessary and insufficient: four
truthful minutes of *"still waiting"* is truthful and terrible.

### R-B6 · Two floors

```
ORDINARY FLOOR        verified email recovery
FAILURE-DOMAIN FLOOR  non-mail recovery capability
```

> **Offline recovery is optional for the member to adopt and mandatory for the
> architecture to provide.** A member may decline — **and Soullab must know they
> have.**

## 2 · New invariants

**I-14 · Authentication proves a person; it never grants standing.**
*Violated by:* any authentication flow that creates membership as a side effect.

**I-15 · A pending channel never monopolises the doorway.**
Where another valid path exists it is reachable *during* the wait.

**I-16 · Non-mail recovery is architecturally mandatory; adoption is optional and
declining is recorded.** A member's reduced-recovery posture is a **known state**,
never an unexamined absence.

**I-17 · A contact resolves to exactly one identity, or the system refuses to
resolve it.** *(New — see §4.)* Ambiguity is answered by refusal, never by a pick.

## 3 · New migration invariants

**M-8 · No working legacy credential retires** unless that member has a **proven
replacement path AND a proven recovery path**, or has **explicitly chosen the
reduced-recovery posture.**
> *Never make the architecture cleaner by quietly making somebody more fragile.*

**M-9 · Legacy retirement is FORBIDDEN until every existing identity is classified:**

```
A  independently migratable
B  requires one-time assisted enrolment
C  intentionally dormant / unreachable
D  unresolved            ← must reach ZERO before any legacy door is removed
```

### Resilience metrics — fleet health, not preference statistics

```
% members with a passkey
% with verified email recovery
% with an independent (non-mail) recovery path
% with only ONE remaining access path        ← the fragility number
```

## 4 · 🔴 THE MISSING PRECISION — contact→identity resolution is not yet unique

R-B1 says *locate the identity by a nameable contact*. **That is under-specified,
and production already contains the ambiguity.**

- `database/migrations/20260103000001_members.sql:10` — `email VARCHAR(255)`.
  **Nullable. NOT UNIQUE.** No unique index exists on it anywhere.
- `auth/signin/google/callback` resolves the fallback with
  `SELECT … WHERE email = $1 **LIMIT 1**`. **Where an address matches more than one
  member, `LIMIT 1` silently picks one** — and the picked row becomes the identity
  the provider is linked to.

**Plausible in Soullab specifically**, not merely in theory: a teen and adult
environment, families, and shared household addresses are all in scope.

⭐ **And Soullab has already solved this correctly once.** The practitioner
reconciliation subsystem models exactly these states:
`verified_unique_email · **ambiguous_multiple_members** · manual_review_required`
— **it names ambiguity and refuses to guess.** I-17 is not a new discipline being
imported; it is an existing house pattern that the auth path never adopted.

**Required before migration design:** a production count of addresses resolving to
more than one member. **Unknown today**, and it gates R-B1.

## 5 · ⚠️ UNRESOLVED TENSION — B5 pulls against I-10

**I-15** wants another valid path offered during the wait. **I-10** forbids
disclosing which authenticators exist before authentication. Offering *"use your
passkey instead"* **truthfully** requires knowing this person has one — which is the
disclosure I-10 refuses.

Three shapes, none chosen here:
1. **Invariant option set** — the same alternatives for everyone; honest, sometimes
   offers a door that will not open.
2. **Post-proof disclosure** — alternatives appear only after something is proven;
   preserves I-10 and helps latest.
3. **Device-local evidence** — the browser's own passkey availability, which
   Soullab never has to assert.

⛔ **Named, not decided.** A tension recorded is a design input; a tension
discovered during implementation is a defect.

## 6 · The corrected target

```
                    MAIA THRESHOLD
                     [ Continue ]
                 ┌────────┴────────┐
          discoverable          nameable
            passkey             contact
                 └────────┬────────┘
                          ↓
                 DURABLE SOULLAB ID
        ┌─────────────────┼─────────────────┐
 AUTHENTICATORS       CONTACTS          RECOVERY
 passkeys             verified set      email (ordinary floor)
 password (legacy)                      independent (failure-domain floor)
 linked IdPs
                          ↓
            ONE AUTHENTICATION AUTHORITY
                          ↓
              ONE SESSION AUTHORITY  (web + native representations)
                          ↓
                    ONE LIFECYCLE
                          ↓
                        MAIA
```

> ⭐ **The threshold no longer needs to know which door created you.**
> That was the test. The architecture meets it.

**The Stage 4 gate is unchanged:** B if the framework can be pointed at the existing
`members` table with `members.id` preserved; otherwise A with the invariants given
machine enforcement.

## 7 · Answer to the Stage 6 question

> **QUALIFIED YES.**

Precise enough to hand to migration design **once two things are done**, neither of
which is implementation:

1. **Count the ambiguity** (§4) — addresses resolving to more than one member, and
   the B3 cohort with no verified deliverable address. Both are **read-only
   production questions**, and both gate design rather than code.
2. **Choose a shape for the B5 ⇄ I-10 tension** (§5), or record it as deliberately
   deferred with the three options standing.

Everything else the member would have carried is now carried by the architecture:
they do not learn signup-vs-signin, username-vs-email, passkey-vs-WebAuthn, session
mechanics, which door created them, or whether a code is login or recovery.

⚠️ **One honest caveat on "without making the member carry any of its complexity":**
R-B3 means a small historical cohort **will** carry some — a one-time assisted
enrolment. That is a real cost, deliberately accepted, bounded, and **counted before
it is spent**. It is not the same as ongoing rescue, and the record should not
smooth it into zero.

## 8 · Standing

```
STAGE 6   COMPLETE — corrected target RATIFIED
  RATIFIED       R-B1 · R-B3 · R-B4 · R-B5 · R-B6
  NEW            I-14 · I-15 · I-16 · I-17 · M-8 · M-9 + resilience metrics
  GATE           Stage 4 A/B framework gate UNCHANGED
  OPEN           §4 ambiguity count (gates R-B1) · §5 B5⇄I-10 tension

⛔ NOT AUTHORIZED   schema · code · migration · account mutation · vendor adoption
⛔ UNCHANGED        production · the door · WebAuthn state · social auth · x-member-id
```
