# AUTH-EXPOSURE-01 · FIRST ACT — trace census of the practitioner-facing authorization boundary

**Date:** 2026-09-14 · **Subject SHA:** `1a555430` · **Altitude:** STATIC (source at the subject)
**Scope traced:** 76 route files — `app/api/practitioner/**` (63) · `app/api/practitioners/**` (4) ·
`app/api/caseload/**` (9) — plus `middleware.ts` and `config/accessMatrix.ts`.
**Runtime witnesses: NONE SPENT.** No request was issued to production or to any shadow.
**Nothing was repaired.** No file outside `docs/` was modified by this act.

## 0 · What this record is, and what it is not

Every classification below is earned from source read at `1a555430`. A static
**PROVED EXPOSURE** means *the code at this SHA admits the act*; it is not a claim that
production admits it today. Each one therefore carries the runtime fact that would close the gap.
Conversely, no finding here is softened because it lacks a runtime witness — the source is
evidence about the source, and it is conclusive at that altitude.

The lane inherited no conclusion from P1-02. Two of the premises it was opened on are
**corrected** below (§5, §6) and three are **confirmed and sharpened** (§2, §3, §4).

---

## 1 · The structural answer to question H — middleware classifies; it does not refuse

`middleware.ts` calls `checkAccess(pathname, tier, roles, authed)` from `config/accessMatrix.ts`.
`getAccessMode()` returns `'strict'` only when `ACCESS_CONTROL_MODE === 'strict'`; otherwise
**permissive**, in which an unmapped route is `{ allowed: true, reason: 'no-rule-match' }` and the
request is forwarded with an `x-access-unmapped: 1` flag. *Flagged, not refused.*

Classifying all 944 API route paths at the subject against the matrix:

```text
API route files                                                944
  UNMAPPED         → permissive mode forwards, no auth decision  587
  minTier only     → waived by §2 below, any authed member        272
  rolesAnyOf       → role actually enforced                        67
  public: true     → allowed by rule                               18
```

**859 of 944 API routes receive no effective authorization decision from the middleware.** For
those routes the handler is the entire boundary. This is not an edge condition reached by an
unmapped route; it is the normal condition of the API surface.

*Instrument limitation, declared:* the classifier reimplements `matchRule`'s exact-then-prefix
passes faithfully and approximates its third (JS regex) pass in Python. Only 40 matrix rules name
an `/api` path at all, so the approximation cannot move the order of magnitude, but a specific
regex-matched path could be misfiled. Every path named individually below was read and confirmed.

*Production mode is documentary, not witnessed:* four independent repo records
(`docs/reviews/LAYER1_ROUTE_INVENTORY_2026-07-30.md`, `LAYER2_REACHABILITY_SCREENING_2026-07-30.md`,
`TIER_ENFORCEMENT_AUDIT_2026-07-30.md`, `HOUSE_00_STANDING_RECORD.md` SR-56 / F-14, plus test
headers in `__tests__/auth-01-d4b-*` and `app/api/invites/__tests__/*`) state that production
leaves `ACCESS_CONTROL_MODE` unset → permissive. That is **E1 evidence about records**, and the
production value remains owed as **W-1**, a single `printenv`.

---

## 2 · TENSION (E3) — the tier waiver has no environment guard

`middleware.ts` `case 'insufficient-tier'` (≈344–374 at this SHA; cite the *branch*, not the line)
evaluates `rule.rolesAnyOf` independently — a prior repair, and a correct one — and then
**forwards the request unconditionally**. There is no `NODE_ENV` condition anywhere in the branch.
The only `NODE_ENV` reads in the file are the dev bypass for `/api/stellium` and `/api/notifications`
and the unmapped-route log.

The comment above it says commercial tier gating *"stays disabled during development."* The code
disables it everywhere.

**Consequence.** A rule whose only constraint is `minTier` is, in effect, *"any authenticated
member."* 133 of 260 matrix rules have that shape (272 route paths). This is the mechanism that
makes §3 reachable.

Whether the waiver *should* be lifted is a billing-and-gating decision and is **not this lane's**.
What this lane establishes is that the comment and the code do not describe the same scope, and
that no reader of the matrix can predict enforcement from the rule alone.

---

## 3 · A-1 · PROVED EXPOSURE (static) — practitioner elevation by any authenticated member

`POST /api/practitioners/create`

| | |
|---|---|
| A · unauthenticated | **REFUSED** — non-public rule, `unauthenticated` branch, API early-returns 401 |
| B · authenticated ordinary member | **REACHABLE** — rule is `minTier: 'pro'` with **no** `rolesAnyOf`; `insufficient-tier` → waiver (§2) → forwarded |
| D · identity | **NONE DERIVED.** The handler never resolves a caller |
| G · elevation | **YES** |
| F · data crossing | no member content — what crosses is **authority** |

The handler reads `body.memberId`, confirms the `members` row exists, `INSERT`s an **`'active'`**
`practitioners` row with caller-chosen `slug`, `name`, `email`, `portal_type`, `enabled_modules`,
and then executes `UPDATE members SET is_practitioner = true, updated_at = NOW() WHERE id = $1`
against the **body-supplied** id. Its own comment names the consumers of that column: auth whoami,
Nostr practitioner gating, caseload, and the team surface.

So an authenticated member of **any** tier can make themselves — or any member whose UUID they
hold — a practitioner. No role check, no admin check, no self-check, no approval record.

**Runtime discriminator (W-2a):** one POST from a synthetic authenticated member against a
disposable shadow, asserting on the `practitioners` row and the `members.is_practitioner` value.

---

## 4 · A-2 · PROVED EXPOSURE (static) — unauthenticated read *and write* of practitioner case material

Eight of nine `app/api/caseload/**` routes are **UNMAPPED** (§1) and derive the actor from the
request:

```text
GET  /api/caseload/list                        actor = ?memberId=
GET  /api/caseload/[caseId]/list               actor = ?memberId=     PATCH · DELETE present
GET  /api/caseload/[caseId]/notes              actor = ?memberId=     POST  (actor = body.memberId)
GET  /api/caseload/[caseId]/consultations      actor = ?memberId=     POST present
GET  /api/caseload/[caseId]/captures           actor = ?memberId=     POST · DELETE present
GET  /api/caseload/[caseId]/memories/list      actor = ?memberId=     POST present
GET  /api/caseload/[caseId]/patterns           actor = ?memberId=
POST /api/caseload/[caseId]/memories/search    actor UNKNOWN — see note
```

⭐ **`GET /api/caseload/list` checks the status of the member named in the query string.** It calls
`CaseStore.isPractitioner(memberId)` → `SELECT is_practitioner FROM members WHERE id = $1` on the
*named* id, refuses with 403 if that member is not a practitioner, and otherwise returns
`listCases(memberId)` and `getCaseCounts(memberId)`. The 403 is real and it protects nothing: it
establishes that **somebody** is a practitioner, never that the caller is.

⭐ **The ownership predicate is correct and its second argument is supplied by the caller.**
`CaseStore.getCase(caseId, practitionerId)` is `WHERE id = $1 AND practitioner_id = $2` — exactly
the right shape. Fed a client-supplied `memberId`, it proves possession of a UUID, not identity.
*This is the sharpest object in the census: a scoping query indistinguishable from a correct one,
whose authority was lost upstream at the point identity should have been derived.*

**Question A = YES.** **Question F:** practitioner case records; session notes whose `note_type`
admits `session · observation · consultation · progress · intake · discharge · supervision`;
consultations; case memories; derived patterns — clinical material about third parties who are not
the caller's own members.

"Knows a member UUID" is not a barrier: `lib/auth/getMemberFromRequest.ts`'s own header records
that member UUIDs are exposed to clients, which is why the bare-UUID identity path was removed
there.

`POST /api/caseload/[caseId]/memories/search` matched no actor pattern in the scan and was not
read line-by-line — **UNKNOWN**, not refusal. `POST /api/caseload/transcribe` is the one route in
the family that derives identity from the session (`getMemberIdFromRequest`) and is **not** in
this class.

**Runtime discriminator (W-2b):** one unauthenticated GET against a disposable shadow holding a
synthetic practitioner and a synthetic case. Metadata assertions only.

---

## 5 · A-3 / A-4 — the `practitioners/*` family authorizes by assertion

**A-3 · PROVED EXPOSURE (static) · `POST /api/practitioners/onboarding`** — UNMAPPED; no identity
derivation of any kind; `UPDATE practitioners SET status = 'active', onboarded_at = NOW() WHERE
id = $1 AND status = 'onboarding'` on a **body-supplied** `practitionerId`. Its GET discloses
`id · status · onboarded_at · has_theme` for a query-named practitioner. An unauthenticated caller
can activate a practitioner record that is still in onboarding.

**A-4 · PROVED EXPOSURE (static) · `POST /api/practitioners/check`** — rule is
`{ exact: '/api/practitioners/check', public: true }`, so middleware answers without touching
identity, by design. The handler returns `id · slug · name · **email** · status` for a body-named
member. A practitioner's registered email is disclosed to any caller holding a member UUID.
⚠️ Unlike A-1/A-2/A-3, `public: true` is a **recorded decision**, so this is routed to the founder
as a posture question — *was disclosing the email intended?* — not asserted as an unintended
defect. What is not in doubt is that it is authorization by assertion.

`POST /api/practitioners/verify-passcode` derives the member from the session before validating a
passcode → **not** in this class.

---

## 6 · A-5 · PROVED EXPOSURE (static, write side) — one route object, refusing on read, admitting on write

`/api/practitioner/clients/[clientId]/spiralogic-report`

- **GET → PROVED REFUSAL.** Practitioner from `requireMemberId()` (session-backed);
  `WHERE member_id = $1 AND practitioner_id = $2`.
- **POST → PROVED EXPOSURE.** Practitioner from the session, then **no relationship check at all**
  before `INSERT INTO spiralogic_reports (member_id, practitioner_id, birth_data, report_data)`
  with `member_id = clientId` taken from the URL.

Any authenticated member may create a report row associating themselves as practitioner-of-record
to **any member id they name**, carrying body-supplied birth data. That is question C in write
form, and the answer is yes.

⭐ *Same route, same file, same identity helper — and two different authorities.* Family
resemblance is therefore not evidence: this is why §7's 47 remaining routes are not promoted.

**UNKNOWN, and named:** whether such a row surfaces in the named member's experience. Readers of
`spiralogic_reports` were not traced in this act. **W-4** is that static trace, and it decides
whether A-5 is record fabrication with member-visible effect or an unauthorized association only.

---

## 7 · PROVED REFUSAL and WIRED-BUT-UNOBSERVED — two premise corrections

⭐ **Identity derivation is broadly hardened, and the census premise must narrow accordingly.**
`getMemberIdFromRequest` · `requireMemberId` · `getMemberIdIfAuthenticated` ·
`getAuthenticatedMember` each resolve identity from `auth_sessions` (unrevoked, unexpired), and
each carries a recorded removal of a former bare-`x-member-id` path
(`getMemberFromRequest.ts` header; `session.ts` "Method 3 … REMOVED"; the AUTH-01-D note inside
`app/api/practitioner/practices/route.ts`'s `getMemberIdWithFallback`, which now returns `null`
where the header fallback used to be). `getCurrentPractitioner` / `requirePractitioner` build on
the first and additionally require `practitioners.status = 'active'`.

54 of the 76 traced routes import one of these helpers. So *"multiple families derive actor
identity from client-controlled input"* **holds** for the caseload family and the
`practitioners/*` family, and **does not hold** for the practitioner families that import these
helpers. The exposure is concentrated, not diffuse — which is better news operationally and worse
news architecturally, because the two conventions live side by side with nothing that refuses the
weaker one.

⭐ **Correction — the two access models are in different conditions and must not share a sentence.**
- `config/accessMatrix.ts` **IS** on the routed path; `middleware.ts` imports and calls it. Its
  defect is not disuse but **population**: 587 API routes have no rule in it, and 272 more match a
  rule the waiver empties (§1, §2).
- `lib/security/requireAccess.ts` has **zero importers** (verified across `app`, `lib`, `config`,
  `components`, `middleware.ts`) and says so in its own header, which also records that its
  `x-access-*` header-trust branch was removed by AUTH-BOUNDARY-01 while unimported.

*One model is routed and under-populated; the other is unreached. Nothing in the evidence says
either was intended to protect the routed practitioner paths — intent is not in the source, and
this record does not supply it.*

**WIRED-BUT-UNOBSERVED — 47 routes.** Session-derived identity verified statically; per-route
resource scoping not individually verified in this act. Sampled and found correctly scoped:
`clients/digest` (`getMessageDigest`: `WHERE id = $1 AND practitioner_id = $2`),
`clients/spiralogic-report` GET, `practices` GET. One sampled route failed on its write path (§6).

**Not traced (declared, with reason):** `app/api/studio/**` (120) and `app/api/team/**` (34) are
adjacent and member-scoped, not the practitioner↔member crossing this lane's question names;
`/api/practice/worlds/practitioner`, `/api/stripe/webhook/practitioner`,
`/api/studio/practitioner-observations*`. Extending the trace to them is a founder call, not an
assumption this record makes. **`caseload` and `practitioners/*` are two families, not six** — the
six-family decomposition was not inherited, and this act's own decomposition is what is recorded.

---

## 8 · Standing table

```text
A-1  POST /api/practitioners/create               PROVED EXPOSURE (static)   auth'd member → elevation
A-2  /api/caseload/** (8 routes)                  PROVED EXPOSURE (static)   unauthenticated R/W
A-3  POST /api/practitioners/onboarding           PROVED EXPOSURE (static)   unauthenticated activation
A-4  POST /api/practitioners/check                PROVED EXPOSURE (static)   public rule → email disclosure
                                                                             ⚠️ posture question, founder
A-5  POST …/clients/[clientId]/spiralogic-report  PROVED EXPOSURE (static)   cross-member write
S-1  middleware coverage                          859/944 no auth decision
S-2  tier waiver, no env guard                    TENSION (E3) comment vs code
  ·  identity helpers (4)                         PROVED REFUSAL (static)
  ·  clients GET family (sampled 2)               PROVED REFUSAL (static)
  ·  47 helper-importing routes                   WIRED-BUT-UNOBSERVED
  ·  caseload …/memories/search                   UNKNOWN
  ·  readers of spiralogic_reports                UNKNOWN → W-4
  ·  studio (120) · team (34)                     NOT TRACED (declared)
```

## 9 · Owed, unspent, bounded

```text
W-1  production ACCESS_CONTROL_MODE — one printenv.
     Decides whether A-2 and A-3 are unauthenticated in production or 404.
W-2  disposable-shadow exploitability witness for A-1 · A-2 · A-3 · A-5.
     Synthetic identities, metadata assertions only. No real member content.
W-3  are these routes served in production at all — a 404/405 probe on a synthetic id,
     which reads no member data.
W-4  static trace of the readers of spiralogic_reports (closes A-5's UNKNOWN).
```

**Escalation.** If W-1 returns unset (permissive) **and** W-3 shows the caseload routes served,
A-2 is an unauthenticated cross-member read of clinical material in production, and the charter's
§7 containment rule applies. Containment is a founder act; this record does not take it.

**A containment shape, named as a proposal and not taken:** the cheapest instrument that closes
A-1 through A-4 without any redesign is four matrix rules plus a caller-identity derivation in
each handler — i.e. population and derivation, not architecture. ⛔ Not authorized here. It is
recorded so that the first repair act is not also the first time anyone asks how small it could be.

---
_First act of AUTH-EXPOSURE-01. Static altitude. No runtime witness spent. Nothing repaired._
