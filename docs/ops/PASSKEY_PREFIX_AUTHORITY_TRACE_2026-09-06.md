# Passkey Prefix Authority Trace — 2026-09-06

> **Read-only trace. No production writes, no test registration, no invite created, no code changed,
> no repair performed.** Authorized by the founder as a pre-Gate-0 inquiry because the question sits
> on the entrance boundary of the Founder Pilot and costs no production state to answer.

**The narrow question:** *what authority, if any, does an arbitrary prefix-matching passkey acquire
beyond bypassing the invite lookup?*

```text
SUBJECT      isAdminPasskey() and everything downstream of it
PREFIXES     SOULLAB-  MAIA-  PIONEER-  FOUNDING-
SOURCE       canonical @ 2b8cb332 (branch), production runtime 50302f5d9
METHOD       static read of the auth chain — routes, session, matrix, founder guard, migrations
```

---

## VERDICT 1 · PRIVILEGE ESCALATION — **NEGATIVE. Finding retired by evidence.**

An arbitrary prefix-matching passkey acquires **no role, no tier, and no privilege**. Five
independent facts, each sufficient on its own:

```text
1  REGISTRATION SETS NOTHING
   app/api/members/register/route.ts — the INSERT names only
     passkey · username · password_hash · name · email · onboarding_step · birth_date
   No roles column. No tier column. No admin flag. The passkey is STORED, never interpreted.

2  THE DEFAULTS ARE ORDINARY
   20260120000002_members_access_control.sql
     tier  VARCHAR(50) DEFAULT 'free'
     roles TEXT[]      DEFAULT ARRAY['member']::TEXT[]
   A prefix registration lands on exactly these.

3  SIGN-IN READS THE ROW, NOT THE PASSKEY
   app/api/members/signin/route.ts selects tier and roles FROM THE MEMBER ROW and passes them to
   setAccessCookies(…, member.tier || 'free', member.roles || ['member']). The passkey is selected
   for identity, never consulted for authority.

4  FOUNDER ACCESS IS AN EXPLICIT UUID ALLOWLIST
   lib/founder/founderAuth.ts — requireFounder() checks FOUNDER_MEMBER_IDS.has(session.memberId).
   Passkey-independent. No prefix can reach it.

5  THE ONE PASSKEY→TIER MECHANISM IS DEAD AND WOULD NOT MATCH ANYWAY
   lib/auth/inviteConfig.ts exports isFoundingPasskey() / getTierForPasskey() → 'founding' |
   'standard'. Repo-wide search: ZERO CALLERS outside the file. It is also an EXACT-MATCH
   allowlist (SOULLAB-CATH, SOULLAB-RYAN, INVITE-LUMINARY-1…10), not a prefix rule — so even if it
   were wired, an invented SOULLAB-XYZ would not match it.
```

Supporting: `lib/auth/identityAssertions.ts` strips caller-supplied `x-maia-roles` /
`x-access-roles`, so a prefix member cannot assert roles over the wire either.

**No difference exists between `SOULLAB-`, `MAIA-`, `PIONEER-` and `FOUNDING-`.** All four are
members of one array in one predicate, used identically in both routes. `FOUNDING-` confers nothing
despite its name.

⛔ **This verdict is about privilege only.** It does not excuse Verdict 2.

---

## VERDICT 2 · ADMISSION BYPASS — **CONFIRMED. Admission-integrity defect.**

**Any string beginning `SOULLAB-`, `MAIA-`, `PIONEER-` or `FOUNDING-` can register as a member with
no invite whatsoever.**

The chain, exactly:

```text
/api/members/check
  members lookup → miss
  invites lookup → miss (or the table errors, swallowed by safeQuery)
  isAdminPasskey(passkey) → TRUE
  ⇒ responds { isInvite: true, inviteStatus: 'valid', isAdminPasskey: true }
    i.e. the surface is TOLD it is a valid invite

/api/members/register
  format gate:  if (!isAdminPasskey(...)) → 400
  invite lookup: performed, and its result is ADVISORY —
    "// If no invite found but it's an admin passkey, that's fine - continue"
  ⇒ INSERT proceeds; no invite row is required, consumed, or redeemed
```

The only friction is a rate limit: **3 registrations per 10 minutes per IP**.

`SOULLAB-ANYTHING` is a working registration credential. The invite system is not the gate; the
prefix is.

### The naming is part of the defect

`isAdminPasskey()` is a **format check misnamed as an authorization check**, and both routes carry
comments reinforcing the wrong reading — *"admin passkeys"*, *"always allowed"*. The generator's own
comment states the true purpose plainly:

> `lib/auth/inviteConfig.ts` — *"Keeps the `SOULLAB-` prefix (required by the registration format
> gate, `isAdminPasskey`)"*

A future reader repairing "admission" will look for an authorization bug and find none, because the
bug is that a format predicate is standing where an authorization predicate should be.

### Legacy-bootstrap reading

The comments (*"always allowed even without invites table"*, `safeQuery` swallowing
missing-table errors) show this is **deliberate bootstrap tolerance**: the system was built to keep
working before `invites` existed. That explains it; it does not make it safe now that `invites`
does exist and a pilot is about to admit strangers.

---

## Consequence for Gate 0 — the pilot is NOT blocked by this

Real generated invites **do** carry the `SOULLAB-` prefix by design:

```text
generateInvitePasskey() → SOULLAB-XXXXX-XXXXX-XXXX
  Crockford-style base32 (0 O 1 I L U omitted), 14 symbols, crypto.getRandomValues,
  rejection-sampled to avoid modulo bias ≈ 68.7 bits
```

So a legitimately issued invite passes the format gate and Gate 0 can proceed on one.

⛔ **Do NOT use an invented prefix code for the Gate 0 test.** Registering with `SOULLAB-TESTER`
would exercise the bypass, not the stranger journey. Issue a real invite through the invite path
beforehand — that is setup, not rescue — then do not touch it again.

⚠️ **One drift worth noting:** `foundingPasskeys` still lists `INVITE-LUMINARY-1…10`, and `INVITE-`
is **not** among the four accepted prefixes. Those passkeys would be refused at registration with
*"Invalid passkey format"*. Dead code today (zero callers), but it shows the two lists have drifted
apart.

---

## Ruling shape (per the authorization)

```text
arbitrary prefix → elevated role/tier/privilege        NOT FOUND — retired by evidence
arbitrary prefix → ordinary member, invite bypassed    CONFIRMED — admission-integrity defect
prefix does not bypass registration as suspected       DISPROVED — it does bypass it
```

**If tomorrow's pilot is meant to be invite-gated, this is a repair-before-launch item.** It is not
a privilege escalation and not a hard security blocker in the escalation sense, but it means the
invitation is decorative: anyone who learns the prefix convention can self-admit, and the pilot's
"invited testers only" boundary would not hold. The repair is small — require a valid pending invite
unless an explicit, narrow bootstrap allowlist applies — but it is a code change and is NOT
authorized by this trace.
