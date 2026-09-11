# MEMBER-ACCESS-01 · STAGE 6 ADDENDUM — THE CONTACT-EVIDENCE MODEL

**2026-09-11.** Produced while preparing the two authorised read-only censuses.

> *"If the schema cannot distinguish those states, that is itself the Stage 6 result
> and becomes a Stage 7 prerequisite."* — founder

**It cannot. This is that result.**

Census script: `scripts/witness/member-access-contact-census.sql` — SELECT only, no
addresses printed, no mutation.

---

## 1 · The three facts, and what production actually knows

| fact | status |
|---|---|
| **ADDRESS PRESENT** | ✅ countable exactly |
| **ADDRESS VERIFIED** | ⚠️ countable only as a **floor**, and the floor is badly wrong |
| **ADDRESS DELIVERABLE** | 🔴 **not countable as such** — and not manufactured |

### 1.1 · 🔴 `members.email_verified` records one flow, not the fact

**Exactly one route writes it** — `app/api/members/verify-email`, the token-link
flow. **The email-CODE flow, which is the live default door, never sets it.**

> A member who has signed in by emailed code fifty times still reads
> `email_verified = false`.

The column is not wrong; it is **narrower than its name**. Any count built on it
undercounts verification by an unknown and probably large margin. ⛔ It must never be
read as *"has not verified their address."*

### 1.2 · 🔴 The mail ledger cannot answer deliverability, twice over

1. It records **provider acceptance**, never recipient delivery — there is no bounce
   or complaint webhook anywhere in the system.
2. Its `member_ref` is **derived in application code**, not stored as a member id, so
   **it cannot be joined to `members` in SQL at all.**

⭐ The privacy design that makes the ledger safe is the same design that makes it
useless for this question. That is a correct trade, and it means delivery evidence
must come from somewhere else.

## 2 · ⭐ The one real positive signal — and it is not in the mail system

```
magic_link_tokens.used_at IS NOT NULL
   ⟹ a magic link was CLICKED
   ⟹ the message reached a human who acted on it
```

`app/api/members/magic-link/route.ts:300` is the **only** writer of `used_at`.

**This proves delivery AND control in one observable** — which is precisely what
"verified" is supposed to mean. **The strongest contact evidence Soullab holds is an
authentication artifact, not a mail artifact.**

## 3 · ⛔ The trap that was avoided

`magic_link_tokens.used = true` looks like redemption. **It has three
indistinguishable causes:**

| cause | writer |
|---|---|
| redeemed by code | `email-code/verify:119` — sets `used`, **deliberately never `used_at`** |
| **invalidated by a newer request** | `magic-link/route.ts:100` — bulk `UPDATE … WHERE used = false` |
| attempt-capped | `email-code/verify:96` |

**Nothing in the row separates them.** A census built on `used = true` would have
produced a large, confident, entirely fictional "deliverable" population — the exact
manufacture the founder's precision forbade. **The ambiguous set is counted as
nothing.**

⚠️ Note the irony worth keeping: `used_at` is skipped by the code path *deliberately
and for a good reason* (older schemas may lack the column), and that defensive choice
is what erases the evidence. **A compatibility hedge became an observability loss.**

## 4 · What the census can therefore return

**Census A — ambiguity:** fully answerable. `members.email` has **no unique
constraint** (`20260103000001_members.sql:10` — nullable, not unique), so ambiguity
is possible by construction.

**Census B — contact evidence:** five honest buckets plus one **named absence**:

```
s1  no contact address
s2  present · verification unknown
s3  verified by token-link flow only
s4  positive delivery evidence only      ← clicked a magic link
s5  both
s6  known delivery failure               ← STRUCTURALLY 0, printed as a named absence
```

`s6` prints `0` **so it is never read as "no failures."** It is `NOT OBSERVED`, not
`OBSERVED EMPTY` — the Stage 1 §4 discipline applied at the reading step.

**Populations A / B / C** are then derived under the founder's rule — *a contact may
resolve identity only if **unique and verified*** — with evidence taken as the
token-link flag **OR** a clicked magic link.

## 5 · The Stage 7 prerequisite this creates

> **Soullab cannot currently answer "is this member reachable?" — and the target
> architecture makes email the ordinary recovery floor.**

A floor whose load-bearing property is unmeasurable is a floor on faith. Therefore:

**P-1 · Verification must become a fact about an address, not a side effect of one
route.** Every flow that proves control of an address must record that proof in one
place. *(This is I-9 — each role separately governed — applied to evidence.)*

**P-2 · Delivery evidence needs a home.** Either MAIL-xx supplies layer-2 truth, or
authentication artifacts are recognised as the evidence of record. **Today the second
is true by accident; it should be true by design.**

**P-3 · Recoverability becomes a first-class member state**, derived from evidence
and readable — the denominator for M-9's A/B/C/D classification and for the Stage 6
resilience metrics.

⛔ **None of this is authorized here.** They are prerequisites recorded so Stage 7
does not discover them.

## 5.1 · Founder refinement 2026-09-11 — the prerequisites are TEMPORAL, not boolean

> **Do not create another boolean called `deliverable`. Deliverability is temporal
> evidence, not a permanent property. A mailbox that worked six months ago can fail
> tomorrow.**

**I-18 (new).** *Deliverability is an event history, never a stored property.* Any
column asserting an address is reachable is asserting something no system can know
in advance.

The corrected target for the prerequisites:

```
CONTACT              an address attached to a durable member identity

VERIFICATION EVENT   we proved control of this contact
                     at this TIME, by this MECHANISM

DELIVERY EVENT       accepted / delivered / bounced / failed / unknown
                     at this TIME

RECOVERABILITY       DERIVED from currently usable authenticators
                     and recovery paths
```

### P-1 refined — one durable fact, many mechanisms
A successful **email-code login** and a **redeemed magic link** must both be able to
produce the *same* durable fact: **this member proved control of this contact, at
this time, by this mechanism.** Today `email_verified` accidentally means *"passed
through one particular route"*; that must stop being authoritative.

### P-2 refined — evidence belongs to the CONTACT, not the member
The privacy-safe join point is a **contact id** — not a raw address, and not
necessarily `members.id`:

```
member → member_contact → mail / verification events
```

The ledger stays privacy-conscious and can still answer *"what happened when we tried
to reach this recovery contact?"* ⛔ **And a provider's `accepted` still never becomes
`delivered`.**

### P-3 refined — ⭐ recoverability must be DERIVED, and the reason is F4

> *"I would be wary of a manually maintained `recoverable = true`. That is exactly how
> `has_webauthn = true` with zero credentials happened."*

```
RECOVERABLE IF   usable passkey exists
              OR usable legacy credential exists
              OR verified recovery contact exists AND a mail path is available
              OR independent recovery credential exists
```

⭐ **This is I-2 arriving at a fourth site.** *Capability is derived from
authoritative substrate, never duplicated into a flag.* The eight broken accounts are
no longer only a defect to repair — they are **the worked example that predicts the
next flag before it is written.**

### Correction to §2 — `used_at` is evidence, not a design
`magic_link_tokens.used_at` is excellent evidence of a **historical verification
event**. ⛔ **It must not become the future verification database.** Its accidental
usefulness tells us **what event the future system needs to record deliberately** —
that is its whole contribution, and reading it as a design would be building on an
artifact of one route, which is the same error as `email_verified`.

### Why this pass was necessary at all
`used = true` looked semantically obvious and had **three causes**. Had it simply been
counted, **Stage 7 would have been built on fabricated certainty.** That is the
argument for the census gate in one line.

## 6 · Standing

```
STAGE 6            COMPLETE · QUALIFIED YES
EVIDENCE MODEL     INSUFFICIENT — explicitly established, not suspected

P-1  contact verification    REQUIRED · NOT DESIGNED
P-2  delivery evidence       REQUIRED · NOT DESIGNED
P-3  recoverability state    REQUIRED · NOT DESIGNED   (derived, never stored)
I-18 deliverability is temporal evidence, never a stored property

STAGE 7            HELD
NEXT               run the read-only production census from the Mac Studio

⛔ IMPLEMENTATION · SCHEMA CHANGE · MIGRATION · AUTH CHANGE · VENDOR — ALL NO
```

⭐ **On reading the census when it runs:** the important thing is **not whether a
column prints `0`.** It is whether **each number has an honest epistemic meaning** —
which of `OBSERVED`, `OBSERVED EMPTY` and `NOT OBSERVED` it is. `s6` is printed
precisely to make that distinction unavoidable.

> **A floor whose load-bearing property is unmeasurable is a floor on faith.**

**To run:**

```bash
ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab maia_consciousness" \
  < scripts/witness/member-access-contact-census.sql
```
