# MEMBER-ACCESS-01 · STAGE 3 — DISTINCTIONS

**Opened** 2026-09-11 by founder act. Stage 2 showed the next risk is **category
confusion**, so the categories become explicit before any architecture is chosen.

> **What are the things Soullab has been treating as one thing that must become
> separate?**

**Output:** a distinction register and **candidate-independent invariants**.
**Not a vendor choice.**

## 0 · What Stage 3 may NOT decide

⛔ **D1 is PROTECTED.** Device-bound vs synced passkey vs email recovery vs recovery
secret vs some combination is **Stage 4**. Stage 3 establishes only **what recovery
is, what authority it has, and what it may not do.**

⛔ Also deferred: whether passwords disappear · whether Google/Apple remain · which
framework wins · whether synced passkeys are acceptable · what replaces Resend ·
whether `x-member-id` survives.

---

## 1 · The distinction register

Each row: the conflation, the Soullab evidence, the fracture it explains.

| # | Distinction | Soullab evidence | Fracture |
|---|---|---|---|
| D-01 | **person / member identity ≠ authenticator** | 10 creation paths each write their own member row | FR-C |
| D-02 | **authenticator ≠ authentication ceremony** | 8 accounts with `has_webauthn=true` and zero credentials are offered a ceremony that cannot complete | FR-A |
| D-03 | **authentication ≠ session** | 17 session minters; several mint at registration without a distinct authentication event | FR-C |
| D-04 | **session ≠ authorization** | `tier`, `roles`, `entitlements`, `labAccess`, `requireCircleAccess` are separate from being signed in | — |
| D-05 | **identity ≠ lifecycle state** | `register-email` writes `onboarding_step='faq'`; `register-local` writes `onboarded:true` | FR-C |
| D-06 | **sign-in ≠ recovery** | `/api/members/recover` mails the **passkey itself** — recovery implemented as credential redelivery | FR-B |
| D-07 | **credential presence ≠ capability flag** | `webauthn/authenticate/options` gates on `members.has_webauthn`, not the credential store | FR-A |
| D-08 | **external IdP ≠ Soullab identity** | 4 OAuth callbacks insert member rows | FR-C |
| D-09 | **transport accepted ≠ message delivered** | ledger records `accepted`; the 2026-08-24 incident sat entirely inside that gap | FR-B |
| D-10 | **message delivered ≠ authentication progressed** | a delivered code is not a completed sign-in | FR-B |
| D-11 | **web session representation ≠ native session representation** | `x-member-id` exists as a *parallel identity concept*, not a second representation of one session | FR-C |
| D-12 | **compatibility bridge ≠ target architecture** | `/begin` deprecated 2026-05-16, still documented and still routed to | FR-D |
| D-13 | **migration ≠ re-enrollment** | no precedent; asserted before it can be violated | FR-D |
| D-14 | **telemetry ≠ truth** | `audit_logs` unconfirmed in production; `NOT OBSERVED` ≠ `OBSERVED EMPTY` | FR-D |

### Added in Stage 3, on evidence

| # | Distinction | Evidence | Fracture |
|---|---|---|---|
| D-15 | ⭐ **identifier ≠ identity** | Heather's account: members think in **email**, `/api/members/signin` authenticates on **username** (`wbp`). She held a valid identity and could not name herself to the door | FR-A |
| D-16 | **verification ≠ authentication** | `register-email` accepts a **recently-used magic-link token** as authority to create an account, in a 30-minute window anchored to code *request*. A proof of address control is spent as a proof of person | FR-A |
| D-17 | ⭐ **invitation ≠ standing** | Already ratified elsewhere in this repo as **FR-18** (Circles): *a recorded removal standing outranks a generic invitation* — because *a generic bearer credential had enough authority to overwrite a recorded relational act*. **The same law, unrecognised, is the shape of the invite/join paths here** | FR-C |
| D-18 | **enrollment offered ≠ enrollment completed** | the eight again, from the other side | FR-A |
| D-19 | **account existence ≠ disclosable fact** | witnessed non-enumeration at `/api/members/email-code`. The system may *know*; it may not *tell* | — |

## 2 · Email is five roles wearing one column

```
EMAIL as ...
  identifier          the join key that finds the member
  contact address     where Soullab writes to a person
  bootstrap           what licenses first account creation
  recovery channel    how access is restored when all else fails
  authenticator       a code to this address mints a session TODAY
```

**All five are collapsed onto `members.email`**, with no per-role state.

### 2.1 · 🔴 The collapse is load-bearing, and it composes into a takeover chain

Two separately documented facts, read together for the first time here:

1. `app/api/auth/signin/google/callback/route.ts:170` — OAuth **joins on email**:
   `SELECT id … FROM members WHERE email = $1`. Found → link; not found → create.
   **Email is the identity join key.**
2. `send-verification` **did** accept `{memberId, email}` unauthenticated and write
   the caller-supplied address onto the member row — **until MAIL-03 containment
   closed it on 2026-09-07.** ⭐ **CORRECTED 2026-09-11: the instance is CLOSED.**

> **Rewriting a member's *contact address* silently rewrites their *identifier*, and
> the identifier is what a later social sign-in joins on.**

⚠️ **The chain is HISTORICAL, not live**, and is kept because the *class* is what
Stage 3 exists to name. Three things survive the repair:

- **Fact 1 stands unchanged.** OAuth still joins identity on `members.email`. Email
  is still the identity join key, and that is a live property of the system.
- **The repair proves the distinction rather than removing the need for it.** Its own
  header reasons in exactly these terms — *"changing a member's address is a separate
  authenticated act that must confirm to the OLD address first, and it does not live
  behind a send endpoint."* **That is I-9 already being practised by one route.** The
  gap is that it is a local discipline, not a system property.
- **One route closed is not the class closed.** Any future write to `members.email`
  inherits the same power, because the column still carries five roles.

### 2.2 · Not all bad news

`oauth_accounts` (`member_id · provider · provider_user_id`) is **already the right
shape** — an authenticator table hanging off a member. The pattern Soullab needs
exists in the codebase; it is simply not universal. **D-01 is not a foreign idea
being imported. It is an existing local practice that never generalised.**

## 3 · Social login: which question is it answering?

```
Does Google/Apple ...
  (a) CREATE the member                               ← Soullab today
  (b) PROVE control of an external identity, then
      LINK to an existing durable Soullab member      ← the shape of oauth_accounts
```

Today it is **both, decided by a race**: link if an email row exists, create if not.
Whether social login is retained is Stage 4. **That it must be (b) and never (a) is
a Stage 3 invariant** — because (a) is precisely the mechanism that makes a member's
identity depend on which door they happened to use.

## 4 · Candidate-independent invariants

Each is falsifiable and names what violates it. None selects an architecture.

**I-1 · One person, one durable identity.**
One Soullab member has exactly one durable identity. Authenticators are added,
lost, revoked and replaced around it without changing who the person is.
*Violated by:* any door that creates a member when one already exists.

**I-2 · Capability is derived, never duplicated.**
Authenticator availability is a query against authoritative credential state. No
capability flag is authority.
*Violated by:* `has_webauthn = true` with zero credentials — currently true for 8.

**I-3 · One session authority.**
All successful authentication converges on one session model. Web and native are
**representations** of it, never separate authorities.
*Violated by:* `x-member-id` as a parallel notion of who the caller is.

**I-4 · Lifecycle is independent of door.**
A member's lifecycle state never depends on which authenticator or route created
them.
*Violated by:* `register-email` → `faq` vs `register-local` → `onboarded`.

**I-5 · Recovery restores; it never creates.**
Recovery returns access to an **existing** identity. It may not mint a second
identity, and it may not hand back a reusable credential.
*Violated by:* recovery that mails the passkey itself.
⛔ *What recovery may not do* is settled here. **Which mechanism recovery uses is D1 — Stage 4.**

**I-6 · A success statement describes something the system knows happened.** ⭐
No member-facing claim may assert an event the system has not observed. "Code sent"
requires a transport acceptance; it never follows from *intent to send*.
*Violated by:* every FR-A failure in Stage 1. **This is the direct attack on the
dominant fracture.**

**I-7 · Verification proves an address; it does not prove a person.**
A verification artifact may not be spent as an authentication grant.
*Violated by:* a used magic-link token licensing account creation.

**I-8 · Identity is not asserted by a bearer token.**
A generic credential anyone could hold never outranks a recorded act about a
specific person. *(= FR-18, generalised out of the Circles lane.)*

**I-9 · Each role of an identifier is separately governed.**
Changing a contact address is not changing an identifier, an authenticator, or a
recovery channel. Each transition has its own authority and its own proof.
*Violated by:* one unauthenticated write to `members.email` moving all five.

**I-10 · The system may know what it must not say.**
Account existence is never disclosed by differential response, timing or wording.

**I-11 · Absence of a record is not evidence of absence.**
`OBSERVED` / `OBSERVED EMPTY` / `NOT OBSERVED` are three states, decided at the
reading step. *(Inherited verbatim from `AUTH_THREAD_LEDGER_2026-08-27.md`.)*
*Consequence:* no improvement claim may rest on an un-instrumented baseline.

**I-12 · A compatibility bridge declares its own retirement.**
Temporary support carries the condition under which it is removed. Absent that, it
is permanent architecture acquired by inertia.

## 5 · Migration invariants

**M-1 · Continuity is total.** Same identity, history, permissions, work, memory,
programme state.
**M-2 · An existing working credential keeps working throughout migration.**
**M-3 · A new authenticator may be added only after a safe authentication** — never
as a condition of entry.
**M-4 · A legacy credential retires only after its replacement is proven** for that
member, not for the population.
**M-5 · Partial migration cannot strand a member.** Every intermediate state is a
state a member can be in and still get in.
**M-6 · Failure recovery cannot require Kelly editing the database.** ⭐ Stage 1's
rescue-cost metric as a design constraint: **SELF-RECOVERED was 0 of 8.**
**M-7 · Migration is not re-enrollment.** No member recreates themselves.

> **The system migrates around the member; the member does not migrate around the
> system.**

## 6 · The geometry reversal

```
CURRENT              door → account semantics → identity / session / lifecycle
TARGET               durable member identity
                       → available authenticators
                         → authentication
                           → one session authority
                             → one lifecycle
```

> **The door becomes a way to reach the person. It stops defining the person.**

Every distinction in §1 is an instance of that inversion, and every invariant in §4
is a constraint that makes the inversion hold under change.

## 7 · Standing

```
STAGE 3   COMPLETE — register + invariants produced
          19 distinctions · 12 invariants · 7 migration invariants
          D1 PROTECTED · no vendor chosen · no door changed · production untouched

NEXT      Stage 4 — candidate architectures, and the difficult choices:
          recovery (D1) · sovereignty · migration · what replaces the present system
```
