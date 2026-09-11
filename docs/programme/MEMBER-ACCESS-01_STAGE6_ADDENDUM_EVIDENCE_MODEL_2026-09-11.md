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

## 6 · Standing

```
CENSUS SCRIPT   written · read-only · not yet run (no production access from this session)
FINDING         production cannot distinguish verified from deliverable;
                the evidence model itself is a Stage 7 prerequisite
NEW             P-1 · P-2 · P-3 recorded, none authorized

⛔ STAGE 7 HELD · no schema · no code · no migration · no vendor · no auth change
```

**To run:**

```bash
ssh soullab@minisforum "docker exec -i maia-postgres psql -U soullab maia_consciousness" \
  < scripts/witness/member-access-contact-census.sql
```
