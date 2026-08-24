# IDENTITY-BINDING-01 — minimum prospective substrate (specification only)

> **Standing:** SPECIFICATION ONLY. Changes **zero historical rows**. No migration is authorized,
> no table is created, no door is modified by this document. Adoption requires a separate ruling.
> `principal` is a **PLACEHOLDER**; the naming question is open (`person` is taken — see
> `IDENTITY_CONTINUITY_DESIGN_2026-08-24.md` §1.2).

**Question:** What is the minimum principal↔member binding model and identity-resolution boundary
that prevents the ninth auth door from minting another disconnected member, while changing zero
historical rows?

---

## 1. The mint mechanism, exactly

Measured at `app/api/auth/signin/google/callback/route.ts:150-200`. Every OAuth door follows this
shape:

```text
1. oauth_accounts.provider_user_id matches   → resolve to that member
2. else members.email = provider email       → LINK to that member
3. else                                      → MINT a new member
```

**Kelly's split is step 3 firing because step 2 missed.** Member A carries
`kelly@soullab.life`; the Google assertion carried `soullab1@gmail.com`. No row matched, so a
member was minted. **Email-string equality is the only cross-door resolution key that exists.**

One human with two email addresses therefore becomes two members — deterministically, silently,
at any door. This is the defect, stated mechanically.

## 2. Both failure directions are real

```text
FALSE SPLIT   same human, different verified identifier   → mints a second member   (Kelly, observed)
FALSE MERGE   reused / transferred / changed address      → links to the wrong human (latent, step 2)
```

Step 2 is not a safe fix to widen — loosening it trades an observed split for an unobserved merge,
and a false merge is **materially worse**: it exposes one person's history to another. Any
substrate must reduce false splits **without** increasing false merges.

## 3. Minimum substrate

### 3.1 One additive relation (proposed, not created)

```text
principal                          principal_member_binding
  id                                 principal_id
  created_at                         member_id
                                     basis         how the binding was established
                                     evidence      what was actually witnessed
                                     standing      PROPOSED | ESTABLISHED | REVOKED
                                     created_at
                                     revoked_at
```

Additive only. No column on `members` changes. No historical row is touched. A member with no
binding behaves **exactly as it does today** — that is what makes this a migration path rather
than a flag day.

### 3.2 The resolution boundary (the whole point)

A door may **auto-resolve** only on a **verified identifier already bound to a principal**:

```text
AUTO-RESOLVE  provider_user_id already bound            → deterministic, safe
AUTO-RESOLVE  verified identifier already bound         → deterministic, safe
MINT + FLAG   nothing bound matches                     → mint member, leave UNBOUND
NEVER         infer a binding from email / name /
              device cohort / behavioral similarity     → prohibited (founder ruling)
```

The ninth door is prevented from minting a *disconnected* member not by guessing harder, but by
**making unbound state visible and bindable** instead of invisible. Kelly's B was disconnected for
six months because nothing recorded that it was unbound — there was no concept of bound.

### 3.3 Binding is an evidenced act

`standing` begins `PROPOSED` and becomes `ESTABLISHED` only by an act carrying evidence — the
human demonstrating control of both doors, or an adjudicated ruling. Never by similarity.
Revocable. **This is the safeguard that stops the substrate becoming an automated
account-merging machine.**

## 4. What this substrate deliberately does NOT include

- No principal-scoped read API. `readPrincipalHistory` is specified in the predecessor as a
  requirement on any future reader; it is **not** built here.
- No settings, consent, or spiral-state resolution. Those remain `UNRESOLVED` by ruling.
- No projection recomputation.
- No change to any of the 8 minting sites.
- No binding for Kelly. Evidence for A↔B is unusually strong, but creating the first binding is an
  **act**, not a consequence of this document.

## 5. Why this is the right smallest unit

It is the only part of Architecture C that is **prospective**: it changes what happens at the
*next* door, and nothing about the past. Every other component of C (spanning reads, recomputed
projections, present-authority state) can be built later, incrementally, against a substrate that
already records who is bound to whom — and none of them can be built coherently before it.

```text
zero historical rows changed
zero existing behavior changed for unbound members
one new question answerable that is unanswerable today:
    "is this member known to belong to a durable self, and on what evidence?"
```

## 6. Stopping condition

This unit is complete when the binding model and resolution boundary are specified — which this
document does. It does **not** proceed to implementation, migration, or Kelly's binding.
