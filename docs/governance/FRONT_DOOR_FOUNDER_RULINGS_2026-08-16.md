# Founder Rulings — Front Door / Authentication Programme

**Ruled 2026-08-16 by Kelly Nezat (founder).** Binding. Supersedes the recommendations in
`docs/architecture/FRONT_DOOR_CURRENT_TO_TARGET_2026-08-16.md` §8, which are now settled.

## Standing reframe

**Signup/onboarding design is no longer the critical path. Authentication integrity is.**
No further investment in front-door polish until the authorization surface is adjudicated and
repaired.

## R1 — Email → six-digit code is the canonical front door: **YES**

Evidence cited: 67 token redemptions → 67 sessions created, zero `session_missing_after_verify`.

Hierarchy is simplified to:

```
PRIMARY               Email → code
RETURNING ACCELERATOR Passkey / Face ID where genuinely available
SECONDARY             Apple / Google where useful
PASSWORD              retire from primary UX unless a compelling recovery need exists
```

Rationale on password: signup mints credentials the member never receives, then the card asks for
the generated username. Incoherent as shipped (defect D11).

## R2 — Authenticate before meeting MAIA: **YES**

Identity here is not account administration. MAIA sits at the centre of memory, astrology,
relationships, Studio work and continuity; permitting an apparently persistent relationship before
establishing which person it belongs to produces the identity-splitting class already observed in
production (defect D3).

**Constraint attached: one small threshold, not four gates.**

## R3 — Minimum consent before first exchange: **YES — minimal and explicit**

Product requirement: *before the first persistent MAIA exchange, the person knows this is a private
conversational relationship, that continuity/memory may be used to support future conversations, and
agrees to the governing terms/privacy notice.*

Brief. First arrival is not legal paperwork. **The legal language itself is a separate governed unit
and is not authorized by this ruling.**

## R4 — Are any of the four post-signup gates constitutive of arrival: **NO**

**Authentication + essential consent constitute arrival. Then the person meets MAIA.**

```
ARRIVE → email → code → essential consent → MAIA
```

`/onboarding`, `/choose`, and WeekZeroOnboarding's six steps become **progressive enrichment**,
invited by MAIA relationally after arrival: preferred name/context, what brought them here, birth
data when Astrology becomes relevant, interests/focus, deeper continuity settings.

## Hard invariant established by this ruling

> **Authentication or recovery must resolve an existing human before any path is permitted to mint
> another member identity.**

Otherwise the best onboarding experience still severs a person from MAIA's memory.

## Programme sequence (binding order)

| Phase | Work | Owner |
|---|---|---|
| **P0** | Rotate exposed password | **Founder** |
| **P1** | Authorization boundary — adjudicate + repair middleware / route trust | JARVIS |
| **P2** | Identity uniqueness — prevent duplicate creation, normalize email identity, recovery finds existing member | JARVIS |
| **P3** | Minimum consent — first-exchange boundary | JARVIS |
| **P4** | Front door — email-code canonical, simplify choices, retire dead password UX | JARVIS |
| **P5** | Arrival — authentication → consent → MAIA | JARVIS |
| **P6** | Progressive onboarding — optional context after first encounter | JARVIS |
| **P7** | Experience witness — new / returning / recovery / Safari / PWA / iOS | Human |
| **P8** | Deploy | JARVIS |

**P0 is genuinely first.** Deleting a publicly exposed credential does not make it secret again.
File removal is worthwhile cleanup, but it is not remediation and must not be reported as such.

## ⛔ Explicitly NOT authorized

- Changing `/signin` copy first
- Removing the dormant waitlist switch
- Adding onboarding screens
- Building a new auth mechanism
- Broadly "authenticating everything"
- Merging duplicate users by hand
- Wiring the three zero-consumer onboarding fields into MAIA merely because they exist
- **Sending the four historical outreach emails** until sender/reply handling is settled

The four stranded people are real and were already approved. Recovery outreach is **independent of**
the security repair and remains held, not cancelled.

## Target first arrival (founder-authored)

> **Welcome to Soullab**
> Enter your email to continue.
> → code
>
> **Before you meet MAIA**
> MAIA can develop continuity with you over time. Your conversations and remembered context are
> handled according to Soullab's privacy and consent practices.
> **Continue** → MAIA

Then MAIA begins onboarding relationally, rather than the software interrogating the person before
they are allowed into the relationship.

**Governing direction: secure identity first, then almost immediately MAIA.**

---

## R5 — Authorization architecture: **Option C (ruled 2026-08-16)**

Demote middleware to UX/reachability only. Move real authorization into a **Node-runtime guard** that
verifies the opaque session against `auth_sessions` and derives roles/tier **server-side**. **Do not**
migrate to JWT/signed sessions.

**Governing invariant:** *Middleware may decide where a request goes. It may not decide who the person
is or what they are authorized to do.*

**Authorized:** rewrite `requireAccess` around the existing session-resolution machinery; derive
identity/roles/tier from trusted server state; ignore client role headers for authz; migrate confirmed
founder/admin routes + confirmed member-scoped bypasses onto the canonical guard; inventory remaining
unguarded candidates and remediate in bounded batches; add negative controls (fabricated
`x-member-id`/`x-maia-roles` cannot grant access); preserve opaque sessions.

**Not yet:** change session format · invalidate the 483 live sessions · flip `ACCESS_CONTROL_MODE`
globally to strict · treat middleware as a security boundary · 97-route blind mechanical rewrite.

## R6 — Kristen canonical identity: **Identity B (ruled 2026-08-16)**

`bce7a472…` (lowercase email) is canonical — it carries the lived longitudinal relationship. A is a
historical/secondary shell whose unique structures must be preserved.

```
R6 CANONICAL IDENTITY      B — APPROVED
CONTINUITY RECONSTRUCTION  AUTHORIZED
MIGRATION DESIGN           AUTHORIZED
DATA MIGRATION             NOT YET AUTHORIZED
DELETION OF A              NOT AUTHORIZED
```

Migration principle: preserve B in place; re-attribute only A's legitimate unique structures where
semantics permit; provenance ledger; no duplicated memory rows; aliases so future auth always resolves
Kristen→B; test MAIA continuity post-migration; retire A only when nothing depends on it.

## Revised priority order (founder, 2026-08-16)

P0 exposed password (manual) · **P1 authorization boundary — current top technical priority** · P2
identity continuity (prevent splits; Kristen B canonical; preserve-first design) · P3 minimum consent ·
P4 front door · P5 direct arrival into MAIA.

## R7 — P1 tranche order and the D4 gate (ruled 2026-08-16)

Sweep **admin/internal routes first; hold all member-facing route hardening behind D4.** Tightening a
route from `x-member-id` trust to verified session converts a latent hole into a visible mobile outage
if the native client isn't reliably presenting a real token. So the native credential path is a
**dependency** of member-facing remediation, not a reason to leave the hole open.

```
0. P0 password rotation            independent / urgent
1. ADMIN / INTERNAL TRANCHE        LAND NOW — zero expected member-auth impact
2. D4 NATIVE TOKEN PATH            repair + verify + iOS/Capacitor WITNESS
3. MEMBER-FACING AUTH TRANCHE      BLOCKED UNTIL D4 built + verified + witnessed
```

**Member-facing route hardening is BLOCKED UNTIL** D4 native auth is BUILT, VERIFIED, and iOS/Capacitor
WITNESSED, with `getMemberIdFromRequest()` resolving a member on the native path. PWA/web get their own
positive control; the specific gated risk is native.

**Authorized tranche-1 custody:** the 3 `/api/admin/monitoring/*` repairs, their 6/6 negative-control
test, and only the directly-associated adjudication/ruling records. Ordinary gates, no `--no-verify`,
no unrelated cleanup. Contract that must hold: fabricated `x-member-id` → DENY · fabricated
`x-maia-roles` → DENY · verified admin session → ALLOW.

**Post-D4, attack the 98 as consequence-ranked batches, not a sweep:** (1) writes/deletes ·
(2) practitioner/client + PHI · (3) memory/relationship/consent · (4) MAIA member-scoped context ·
(5) member PII · (6) remaining reads · (7) routes possibly public by design. Per route, first classify
PUBLIC / SELF-SCOPED / PRACTITIONER→CLIENT / ADMIN / SERVICE-TO-SERVICE, then apply the correct
actor→subject contract. **Do not mechanically replace every `x-member-id` with one helper.**

## Ledger naming correction (founder, 2026-08-16)

**D4 (native-token path) is a SEPARATE programme unit from P2 (Kristen/identity continuity).** They are
operationally coupled — D4 gates member-facing hardening, and identity integrity underlies both — but
they are not the same unit. "P2 complete" must never ambiguously mean either. In this ledger:

- **P2 / Kristen** = identity continuity: canonical B, preserve-first consolidation design, uniqueness
  constraint. (R6)
- **D4 / Native** = the Capacitor/iOS credential chain proven end-to-end to `getMemberIdFromRequest()`.
  Prerequisite for tranche 3, tracked on its own.
