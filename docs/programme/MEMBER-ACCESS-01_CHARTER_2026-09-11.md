# MEMBER-ACCESS-01 — Effortless, Sovereign Entry

**Opened** 2026-09-11 by founder act. **Branch** `claude/busy-meitner-ppms4e`.
**Standing: STAGE 0 IN PROGRESS · NO RULING · NO REPAIR · PRODUCTION UNTOUCHED.**

---

## 1 · Why this is a lane and not a bug

A password form was the visible defect. It is not the object of study.

Access has produced friction for two years, and each occurrence has been repaired
locally as its own bug. The member does not experience a signup bug, a verification
bug and a recovery bug. **The member experiences one door.** That mismatch — many
repairs, one lived surface — is the evidence that local fixes have not composed
into a coherent whole, and it is the reason this is opened as a lane.

> *Don't let today's bug choose the next two years of Soullab authentication
> architecture.*

## 2 · The object

The whole journey, as one object:

```
INVITATION → ACCOUNT CREATION → EMAIL VERIFICATION → FIRST SIGN-IN → ONBOARDING
   → RETURNING SIGN-IN → NEW DEVICE → PASSKEY / FACE ID / TOUCH ID
   → EMAIL CODE FALLBACK → PASSWORD, if retained → ACCOUNT RECOVERY
   → EMAIL FAILURE / LOST DEVICE → BACK INSIDE
```

## 3 · The research question

Not *"should `/signin` open on email?"* — that framing is what produced the
withdrawn ruling. The question is:

> **What authentication architecture produces the lowest cognitive burden and
> highest recoverability while maintaining strong security and sovereignty?**

## 4 · Experiential requirements — declared BEFORE any implementation is read

A member should never have to wonder: *Do I have an account? Am I supposed to have
a password? Where did my password come from? Why didn't the email arrive? Am I
signing up or signing in? Which of these choices am I supposed to use? Did it work?
Where do I go next?*

**The system should generally know more about the authentication state than the
member does — and use that knowledge to remove decisions rather than expose
machinery.**

## 5 · The NO list (binding on every candidate)

```
ONE obvious action at a time
NO credential the member never established
NO dead ends
NO raw system errors
NO ambiguous signup-vs-signin states
NO dependency on remembering which auth method was used
NO invisible failure when email delivery breaks
NO account-enumeration leakage
NO unrecoverable account state
NO authentication success followed by onboarding limbo
NO need for Kelly to rescue ordinary members manually
```

The last is a **serious acceptance criterion for a beta product**, not an aspiration.

## 6 · The hard acceptance test

> **A normal member must be able to enter, leave, return six months later on a new
> device, recover if necessary, and get back to their work without Kelly's help.**

If that holds, authentication disappears into the background — which is where it
belongs.

## 7 · Stages

| Stage | Name | Standing |
|---|---|---|
| 0 | CURRENT TRUTH — map every entry path present today. No repairs. | **IN PROGRESS** |
| 1 | FAILURE CENSUS — what failed, where, for whom, why, what intervention, was it visible | NOT STARTED |
| 2 | EXTERNAL RESEARCH — GitHub implementations · NIST/WebAuthn/OWASP · Hugging Face · consumer exemplars · passwordless · recovery architecture | NOT STARTED |
| 3 | DISTINCTIONS — identity · authentication · verification · authorization · onboarding · recovery · session continuity | NOT STARTED |
| 4 | CANDIDATE ARCHITECTURES — 3–4, not 20 | NOT STARTED |
| 5 | JOURNEY FALSIFICATION — every candidate against real states | NOT STARTED |
| 6 | RULING — choose ONE entry architecture | NOT STARTED |
| 7 | MIGRATION — how existing accounts get there safely | NOT STARTED |
| 8 | IMPLEMENT + WITNESS — only now change production | NOT STARTED |

Stage 2 examines **actual open-source code, not only UX essays**: Better Auth,
Auth.js, Keycloak, SuperTokens, Logto, Ory, Zitadel. The question asked of each is
*which architecture actually solves our problem*, never *which has more features*.
Hugging Face is studied as a **working product journey**, not adopted as
infrastructure.

## 8 · Withdrawn, and why it is recorded rather than erased

An **email-first** ruling was made, implemented (`f55db772`) and **withdrawn the
same day, unreleased** (`ad81bfea`). It never reached production.

It was withdrawn on its reasoning, not on a mistake: **email-OTP-first replaces one
presumption with a kinder presumption rather than removing it.** Both password-first
and OTP-first presume a credential before knowing who is entering.

The **2026-08 entry-intent ruling therefore still stands** and `/signin` still opens
on password. `components/auth/__tests__/entryMode.test.ts` records that the
challenge against it is OPEN so a reader cannot mistake *unchanged* for
*unexamined*, and an assertion keeps the `AUTH-DOOR-01` marker adjacent to the
decision so the door cannot be repaired as a drive-by.

## 9 · What is already settled and binds every candidate

> **Never ask a member for a credential the system has never established with them.**

Recorded in `CLAUDE.md` under the onboarding invariants. General: it applies
wherever a surface presumes a credential rather than establishing one.

Also settled, and asserted in `entryMode.test.ts` independently of geometry:
the email step must not reveal whether an account exists; an established password
member must not have to hunt for their door.

## 10 · Standing evidence carried into the lane

- **5 of 7 stalled accounts** sit at the step straight after account creation
  (`onboarding_step` = `faq` × 5, `begin` × 2; nobody at `onboarding`).
- **30-day signups: 5 created, 1 onboarded, 4 stalled.** n=5 — a signal, not a rate.
- **2026-09-11**: an operator holding a valid 6-digit code typed it into the
  password field and was correctly refused by the wrong form — *the interface
  contradicting the authentication model.*
- Mail delivery is **not** the cause: provider acceptance witnessed on
  `auth:magic-link`, `auth:email-code` and `auth:passkey-recovery`.
- `/api/members/progress` POST takes `memberId` from the request body with **no
  session check** — `onboarded`, `onboarding_step` and `youth_onboarded` are
  settable by an unauthenticated caller. Open, unrepaired, carried into Stage 1.

## 11 · Prohibitions for this lane

⛔ No repair during Stage 0 — a census that fixes what it finds cannot report what
was there. ⛔ No door changed before Stage 6. ⛔ No production change before
Stage 8. ⛔ No candidate chosen from feature count. ⛔ A stage does not open because
the previous one looks finished; it opens on a founder act.
