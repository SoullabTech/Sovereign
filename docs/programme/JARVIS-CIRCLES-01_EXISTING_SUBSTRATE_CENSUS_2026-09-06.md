# CIRCLE-00 · Existing-Substrate Census

**Method:** READ ONLY. Static read of the working tree at commit `39daacae`, branch
`claude/jarvis-circles-programme-reouzc`.
**Epistemic kind of every claim below:** **OBSERVED (source code, this checkout).**
**No recommendations appear in this document.** Interpretation lives in the Gap Register.

## 0. Census limitations — stated up front

1. **No production database access from this session.** Zero runtime evidence. Row counts,
   live Circle count, live membership count, and whether any Circle has ever been used are
   **UNKNOWN**. Every "live" question in this census is answered from code, not from data.
2. **No production log access.** No runtime markers were read.
3. Therefore: nothing here establishes liveness. *Built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

---

## 1. Inventory

### 1.1 Migrations (2)

| File | Tables created |
|---|---|
| `20260213000004_circles_commons.sql` (121 L) | `circles`, `circle_memberships`, `circle_invites`, `shared_artifacts` |
| `20260402100001_circle_living_fields.sql` (53 L) | `circle_inquiries`, `circle_inquiry_responses` |

**6 tables total.** All FK-cascade from `circles(id) ON DELETE CASCADE`.

### 1.2 Services — `lib/circles/` (759 L across 10 files)

`circleService` (118) · `inquiryService` (193) · `types` (139) · `fieldPulseService` (110) ·
`sharingService` (104) · `inviteService` (79) · `consentService` (49) · `membershipService` (40) ·
`useOfferToCircle` (31) · `index` (6)

### 1.3 API routes — `app/api/circles/` (16 route files)

`/` (GET list-mine, POST create) · `/join` (POST) · `/shared` (POST) ·
`/shared/[sharedId]/revoke` (POST) · `/pulse-summary` (GET) · `/[circleId]` (GET) ·
`/[circleId]/feed` · `/[circleId]/members` · `/[circleId]/pulse` · `/[circleId]/leave` ·
`/[circleId]/consent` · `/[circleId]/invite` · `/[circleId]/inquiries` ·
`/[circleId]/inquiries/[inquiryId]` · `/…/close` · `/…/respond`

### 1.4 UI

**Pages:** `app/commons/circles/{page,new/page,[circleId]/page,layout}.tsx` (622 L) ·
`app/commons/join/page.tsx`
**Components:** `components/circles/` — 9 files, 1,111 L (`CircleInquiry` 264 ·
`ShareToCircleModal` 245 · `FieldPresence` 134 · `FieldMemory` 126 · `CircleSettings` 121 ·
`SharedFeed` 119 · `CircleConsentGate` 96 · `CircleMembers` 70 · `FieldSignal` 36)

### 1.5 Canon

`docs/canon/CIRCLE_FIELD_DOCTRINE.md` (129 L) — Core Law, Membrane Invariant, Coherence Function,
7 Principles, Interaction Order, 8 Structural Constraints, 4 Open Questions, The Test.

---

## 2. Identity and authorization

### 2.1 Session resolution — sound

All 16 routes resolve identity through `getMemberIdFromRequest()`
(`lib/auth/getMemberFromRequest.ts`). **Zero routes trust a bare `x-member-id`.** The module
carries an explicit hardening note: a prior version accepted `x-member-id` after a mere existence
check, permitting impersonation; that vector is removed. A `x-member-id` / `maia_member_id` claim
is now honored **only** when it matches the session-resolved member; a mismatch is rejected.
Credential sources: `maia_session` cookie → `auth_sessions`; `x-session-token` header (iOS/ITP).

### 2.2 Membership gate — consistently applied at the service layer

`getCircleWithMembership(circleId, memberId)` throws `FORBIDDEN` unless an
`active`-status membership row exists. It is called by: `listCircleMembers`, `listFeed`,
`shareArtifact`, `setConsent`, `leaveCircle`, `createInquiry`, `respondToInquiry`,
`listInquiries`, `getInquiryWithResponses`.

**Not called by:** `getCirclePulse` / `getCirclePulseLight` (gated by their callers instead —
`/[circleId]/pulse/route.ts:19` calls it explicitly; `/pulse-summary` derives ids from
`listMyCircles`), `regenerateInvite` (creator-only check instead), `joinWithInvite`
(token-only, by design), `revokeArtifact` (`WHERE shared_by = $1`, owner-scoped instead).

### 2.3 ⚠️ The founder gate is a **UI** gate, not an **authorization** gate

| Surface | Gate |
|---|---|
| `app/commons/circles/layout.tsx` | `requireFounder()` → refusal screen "Circles is not open for v1" |
| `config/accessMatrix.ts:271` `/commons/circles` | `minTier: 'free'` |
| `config/accessMatrix.ts:504` `/api/circles` (prefix) | **`minTier: 'free'` — all authenticated members** |
| `config/accessMatrix.ts:272` `/commons/join` | **`public: true`** |

**OBSERVED:** the entire Circle API is reachable by any authenticated member at free tier. No
route in `app/api/circles/**` imports `requireFounder`. The founder gate exists on one Next.js
layout only.

This is **not** an inter-Circle data leak — service-layer membership scoping (§2.2) still holds,
and a caller cannot read a Circle they are not an active member of. What it means is narrower and
exact: **the sentence "Circles is not open for v1" describes the UI, not the authorization
surface.** A member with a session and an invite token can create, join, share, respond and
revoke against the live API today.

---

## 3. What the doctrine claims vs. what the code enforces

| Doctrine constraint (`CIRCLE_FIELD_DOCTRINE.md`) | Code state |
|---|---|
| One inquiry at a time per circle | ✅ enforced — `inquiryService.ts:38-45` `SELECT … status='open'` guard |
| One response per member per inquiry | ✅ enforced — DB `UNIQUE(inquiry_id, member_id)` + `23505` → `ALREADY_RESPONDED` |
| Responses hidden until contributed | ✅ enforced **server-side** — `getInquiryWithResponses` returns `responses: []` when `hasResponded === false`. Exception: `status !== 'open'` reveals all |
| Manual sharing only | ✅ enforced — `shareArtifact` throws `CONSENT_REQUIRED` unless `consent_mode='manual'` |
| Revocation cascade | ✅ on **leave** (`membershipService`) and on **consent withdrawal** (`consentService`). ❌ **no cascade on removal** — see §4.2 |
| Revocation does not touch the source | ✅ `revoked_at` set; source item untouched |
| 2-member minimum for theme surfacing | ⬜ **unreachable** — theme signals are hardcoded empty (§4.4) |
| No counts / percentages / scores in circle surfaces | ⚠️ `listInquiries` returns `response_count::int` to the client (`inquiryService.ts:151`) |
| **Feel → Contribute → Browse** | ⚠️ **partial** — enforced for **inquiries**; **not** for the shared feed. `listFeed` returns every non-revoked artifact to any active member with no contribution precondition |
| MAIA is a steward of coherence inside a circle | ⬜ **entirely unbuilt** (§4.5) |

---

## 4. Confirmed absences and dead paths

### 4.1 There is no discovery. At all.
`listMyCircles` is the only listing function in the codebase. Grep for `listAllCircles` /
`discover` / `browse` across `lib/circles/` and `app/api/circles/`: **zero hits.** A member can
reach a Circle only by holding an invite token. **Interest declaration, search, and the "outer
membrane" preview described in the mandate are 0% built.**

### 4.2 `visibility` and `invite_enabled` are inert columns
`circles.visibility` (`CHECK IN ('invite_only','open')`) and `circles.invite_enabled` exist in
schema and are `SELECT`ed in `getCircleWithMembership`. They are **never written after the row
default, never read by any branch, and never enforced.** `'open'` visibility has no meaning in
any code path.

### 4.3 `status='removed'` has no writer
The `circle_memberships.status` CHECK admits `'removed'`. **No code path anywhere sets it.**
Removal-by-facilitator is unimplemented. Consequence if it were ever set by hand: the
leave-cascade in `membershipService.leaveCircle` would **not** fire, so a removed member's shared
artifacts would remain in the feed.

### 4.4 Field pulse is structurally hollowed — deliberately
`fieldPulseService.getCirclePulse` sets `const signals: FieldSignal[] = []` unconditionally, with
a documented sovereignty correction (2026-07-17, founder ruling R5/R12) suspending
`member_theme_signals` from any shared field. **Consequences:** `FieldSignal` renders nothing;
`derivePhase(_, hasSignals, _)` has a permanently-false branch, making the `'integrating'` phase
**unreachable from the pulse**; the doctrine's 2-member anonymity threshold has nothing to
threshold.
**Dangling reference:** the correction note cites
`docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md` — **that file does not
exist on this branch.** (Same failure class as the `verify-colab-boundaries.ts` citation in
`CLAUDE.md`.)

### 4.5 MAIA has no presence inside a Circle
Grep for `maia` across `lib/circles/`, `components/circles/`, `app/commons/circles/` returns
**only Tailwind class names** (`text-maia-ink-40`, `bg-maia-navy-850`, …). There is no prompt, no
context builder, no reflection surface, no field-witness call site. `circle_inquiries.field_synthesis`
is **free text written by the human who opened the inquiry** (`closeInquiry(inquiryId, memberId,
fieldSynthesis)`), never by MAIA. Doctrine Principle 3 is **0% built**.

### 4.6 There is no Circle ↔ Co-Lab bridge
"Co-Lab" in this codebase is `studio_teams` (`lib/team/colabTeams.ts`, cookie `colab_team_id`,
17 team migrations). `lib/circles/**` and `lib/team/**` share **zero imports in either direction.**
No transfer object, no typed crossing, no membership relation.

### 4.7 There is no Circle boundary verifier
`scripts/verify-constitution-colab.ts` (the mandatory pre-invite gate) asserts scoping for
**people · DM threads · sessions · encounters · colab-scope atoms · colab-scope files**.
**Circles are not among its scopes.** No equivalent script exists for Circles.

### 4.8 `status='integrating'` is a one-way door
`closeInquiry` sets `'integrating'` when a synthesis is supplied, `'closed'` otherwise. No code
path transitions out of `'integrating'`, and `respondToInquiry` refuses anything not `'open'`.

---

## 5. Every path that can cross Personal ↔ Circle today

| # | Path | Mechanism | Consent act | Reversible |
|---|---|---|---|---|
| 1 | Studio Decision → Circle | `app/studio/decisions/[id]/page.tsx:824` "Offer to Circle" → `ShareToCircleModal` → `POST /api/circles/shared` | explicit click + modal | ✅ owner revoke |
| 2 | Studio Change → Circle | `app/studio/changes/[id]/page.tsx:857` | explicit | ✅ |
| 3 | Session Room → Circle | `app/studio/session-room/page.tsx:1714` | explicit | ✅ |
| 4 | Shared feed → Circle | `components/circles/SharedFeed.tsx:72` | explicit | ✅ |
| 5 | Member text → Circle | inquiry response (`/…/respond`) | explicit authorship | ❌ **no delete/withdraw path for a response** |
| 6 | Member text → Circle | `field_synthesis` at inquiry close | explicit authorship | ❌ no edit path |

**Nothing crosses implicitly.** There is **no** path from MAIA conversation, memory atoms,
semantic memory, anchors, or inferred themes into a Circle. The `member_theme_signals` path was
the only one and it was severed (§4.4).

**Not offered from MAIA:** `app/maia/page.tsx:1894` and
`components/maia/panels/RelationshipsPanel.tsx:85` only `router.push('/commons/circles')` — navigation,
not offering. The mandate's "MAIA exchange → Circle" offer does not exist.

---

## 6. Navigation entry points

`lib/navigation/maiaNav.ts:137` · `lib/navigation/houseDestinations.ts:405` ·
`app/maia/page.tsx:1894` · `components/maia/panels/RelationshipsPanel.tsx:85` ·
`app/commons/join/page.tsx:83`. All resolve to `/commons/circles`, which is behind
`requireFounder()`. **A non-founder member following any of these five links today receives the
refusal screen** ("Circles · Shared field · Circles is not open for v1").

---

## 7. Quantified state

| Dimension | Count |
|---|---|
| Tables | 6 |
| API routes | 16 |
| Service LOC | 759 |
| Component LOC | 1,111 |
| Page LOC | 622 |
| Doctrine LOC | 129 |
| **Total Circle substrate** | **~2,800 LOC + 6 tables** |
| Discovery mechanisms | **0** |
| MAIA-in-Circle call sites | **0** |
| Circle↔Co-Lab bridges | **0** |
| Circle boundary-verifier checks | **0** |
| Production rows observed | **UNKNOWN — no DB access this session** |

---

## 8. Typology placement (per the six-category typology)

- **Cat 6 candidate (live runtime authority):** identity/auth resolution; membership scoping;
  consent + revocation cascade; inquiry contribute-before-see. **Cannot be confirmed Cat 6 without
  production rows** — see §0.
- **Cat 3 (built substrate, gated, 0 confirmed member callers):** the whole Circle surface, behind
  `requireFounder()` on the UI.
- **Cat 2 (canonical primitive, no runtime authority):** `CIRCLE_FIELD_DOCTRINE.md` —
  the Membrane Invariant, the Coherence Function, Feel → Contribute → Browse.
- **Cat 5 (frozen):** `member_theme_signals` → shared field. Explicitly suspended by founder ruling.
- **Cat 1 (preserved direction, unauthorized):** discovery · outer membrane · Constellations ·
  Commons-of-Circles · fission · Circle↔Co-Lab bridge · MAIA-as-field-witness.
