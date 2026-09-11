# MEMBER-ACCESS-01 · STAGE 5 — JOURNEY FALSIFICATION

**Opened** 2026-09-11 by founder act, with **D1 RATIFIED**.
**Purpose: try to break the target experience.** Not to validate it.

> *If it cannot survive the existing-member journeys, it does not deserve to be built.*

**Target under test:** durable Soullab identity · derived capability · one session
authority · MAIA threshold (I-13) · D1 as ratified — passkey preferred and never
mandatory, **no mandatory sync posture**, verified email code as the target-state
universal floor, optional offline recovery credential.

**Verdict format:** `SURVIVES` · `SURVIVES WITH RESIDUE` · `🔴 BREAKS`.

---

## 1 · The sixteen existing-member journeys

| # | journey | verdict |
|---|---|---|
| 1 | password member returns | 🔴 **BREAKS — B1** |
| 2 | email-code member returns | SURVIVES |
| 3 | Google-linked member returns | SURVIVES WITH RESIDUE — B2 |
| 4 | Apple-linked member returns | SURVIVES WITH RESIDUE — B2 |
| 5 | working passkey member returns | SURVIVES |
| 6 | one of the 8 false-`has_webauthn` returns | SURVIVES ⭐ |
| 7 | member with no verified recovery email returns | 🔴 **BREAKS — B3** |
| 8 | partially onboarded member returns | SURVIVES WITH RESIDUE |
| 9 | member changed their email address | 🔴 **BREAKS — B4** |
| 10 | member changed name/username | SURVIVES |
| 11 | new phone after six months | SURVIVES — conditional on 7 and 15 |
| 12 | lost the old phone completely | SURVIVES — conditional on 7 and 15 |
| 13 | no access to the old authenticator | SURVIVES — conditional on 7 and 15 |
| 14 | email delivery delayed | 🔴 **BREAKS — B5** |
| 15 | email delivery permanently fails | 🔴 **BREAKS — B6** |
| 16 | migration fails halfway | SURVIVES — *by construction, if written additively* |

**Six breaks. Three are structural.**

---

## 2 · The breaks

### 🔴 B1 — THE IDENTIFIER PROBLEM. *Heather's failure survives the redesign.*

The threshold resolves *method* invisibly. It cannot resolve *who you are* without
asking. So it asks — for what?

- Ask for **email**: members whose `members.email` is absent, stale, or simply not
  what they think it is cannot answer.
- Ask for **username**: today's usernames are `wbp`, `soul3f2a`, `GOOGLE-…`-derived
  strings. **Nobody remembers them.** Scenario 1 is exactly the lockout that opened
  this lane.
- Ask for **"email or username"**: the member is now reading Soullab's internal
  machinery at the threshold — D-15 and I-13 violated in the first field.

⭐ **Finding: I-13 is achievable for METHOD and not yet for IDENTIFIER.** The
architecture unified *how you prove it* and left *how you name yourself* untouched.

**What the architecture must add:** one field that accepts **any** identifier the
member might plausibly know, resolving silently, revealing nothing (I-10) — which
requires contact addresses to be **a set attached to the identity**, not a column.

### 🔴 B3 — THE POPULATION THE FLOOR DOES NOT REACH

D1 makes verified email the universal floor. **Universal is a target state, not a
present fact.** Two sub-cases:

- **Has a working credential, no verified email** → enters by the old path, then is
  *invited* to establish recovery. ✅ Exactly the founder's migration order.
- 🔴 **No working credential AND no verified email** → **there is no path that is
  not a human**. The floor does not reach them.

⭐ **The honest distinction:** this is **not** *"Kelly repairs the account"* — it is
*"Kelly deliberately establishes one recovery path, once, before anything retires."*
A one-time human enrolment is legitimate; per-return rescue is the thing forbidden.

**Requires, before any legacy retirement:** a census of members with no verified,
deliverable address. That number is **unknown today** — §6 of Stage 1.

### 🔴 B4 — FIRST-LINK BY EMAIL IS CREATE-ON-MISS

⚠️ **A hypothesis was corrected here by reading the source.** I expected OAuth to
join on the mutable email. It does not: `auth/signin/google/callback` checks the
**`oauth_accounts` link first** (`provider_user_id`, the `sub` claim), and only then
falls back to email. **An already-linked member survives an email change.** The
Stage 3 §2.1 concern is narrower than stated there.

**The real break is the fallback's failure mode.** When neither the link nor the
email matches, the flow **creates a new member** (`INSERT INTO members … 'GOOGLE-'`).
So any mismatch — a second Google account, a work address, a changed provider email
— **mints a duplicate identity inside an authentication flow.**

That is **I-1 violated by a heuristic miss**, and it is Stage 3's settled rule
inverted: *IdPs may link, never create.*

**What the architecture must do:** an unrecognised provider identity **asks to be
linked** — *"verify by email to connect this to your account"* — and never creates.

### 🔴 B5 — HONEST AND STILL PAINFUL

I-6 governs *acceptance*: Soullab may say "code sent" only once a transport accepted
it. **True, and no comfort during the four minutes it does not arrive.** The member
has no information and no alternative, and the architecture has nothing to say in
the gap — because layer-2 delivery truth lives in MAIL-xx.

⭐ **Honesty is necessary and not sufficient.** The product answer is not a better
message but **a second path offered while waiting**, so the gap is never a wait with
one exit.

### 🔴 B6 — THE FLOOR IS A SINGLE POINT OF FAILURE

D1 makes email the universal floor. Therefore **a total mail failure — vendor
suspension, quota, domain reputation, bounce — is a total access outage for every
member without a working passkey.** FR-B at maximum blast radius.

**This is not hypothetical. 2026-08-24 was a rehearsal**: quota exhausted, mail
unavailable, accounts created that could not authenticate.

⭐ **Therefore the optional offline recovery credential is not optional in the
architecture — only in the member's adoption of it.** It is the **only mechanism in
D1 that survives a total mail outage**. It should be offered broadly and early, not
filed as a nicety for the security-minded, and its adoption rate is a **fleet
resilience metric**, not a preference statistic.

### Residues

- **B2 (journeys 3–4):** a member whose provider address differs from the one they
  remember gets a code sent to an address they cannot read — a silent dead end
  reachable from a correct-looking action. Mitigated by B1's fix, not by B4's.
- **Journey 8:** resume must be computed from server truth and must not deliver a
  member to a step they never saw — today `register-email` writes `faq` while the
  door sends them to `/onboarding`. FR-C residue; I-4 necessary, not sufficient.
- **Journey 16:** survives **only if** the migration is written additively —
  add, dual-run, switch, retire — with every intermediate state authenticating by
  the old path. That is a constraint on Stage 6/7, asserted here so it cannot be
  discovered late.

---

## 3 · The new-member clean path

```
MAIA threshold → Continue → identify / verify → ONE identity
   → name + minimal onboarding → inside → "make returning easier" → passkey if desired
```

**SURVIVES.** The new member never meets signup-vs-signin, username-vs-email,
passkey-vs-WebAuthn, session mechanics, whether Google "created" them, or whether a
code is login or recovery.

⚠️ **One condition:** the passkey offer lands **after** they are inside and **must
be refusable without consequence** (M-3). An offer that blocks the room is a
migration ceremony at the front door wearing a different coat.

## 4 · The I-13 experiential falsifier

> Can MAIA's threshold present `Welcome back · [Continue]` without asking which
> authentication system the member previously used?

**METHOD: YES.** Live session → conditional-UI passkey → strongest available
credential → recovery, all resolved without a menu. The six-door list disappears.

**IDENTIFIER: NOT YET.** See B1. The threshold still needs the member to name
themselves, and today's identifiers are not nameable.

> **VERDICT: I-13 is HALF MET. The architecture unified authentication and left
> identification alone.** That half is the difference between *"Welcome back"* and
> *"Welcome back — and who are you, in our terms?"*

## 5 · Standing

```
STAGE 5   COMPLETE — the architecture SURVIVES, and is NOT YET BUILDABLE AS SPECIFIED

STRUCTURAL BREAKS, all requiring an architectural answer before implementation:
  B1  identifier resolution      contact addresses must be a SET on the identity
  B3  the unreachable population  census + one-time human enrolment before retirement
  B4  create-on-miss              IdPs link or ask; they never create
  B6  mail as single point        the offline credential is fleet resilience, not a nicety

PRODUCT BREAK:
  B5  honest waiting              a second path offered during the gap, not a better message

⛔ IMPLEMENTATION · MIGRATION · VENDOR ADOPTION — ALL NOT AUTHORIZED
⛔ production · the door · WebAuthn state · social auth · x-member-id — UNCHANGED
```

> **The architecture is sound and incomplete.** Four of the six breaks are additions
> it must absorb, not refutations of it. B1 and B6 are the two that change its shape:
> **identity needs a nameable surface, and the universal floor needs a floor of its
> own.**
