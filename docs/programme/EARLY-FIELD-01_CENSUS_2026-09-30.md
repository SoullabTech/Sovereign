# EARLY-FIELD-01 · Controlled Cohort Admission · R1 census · 2026-09-30

```text
Class: A programme · rollout infrastructure (not Living Field product logic)
Canonical base: 7ec42ce6 (merge of #1539)
Production runtime: 04005ca7c (pre-#1539, pre-#1536)
Standing: CENSUS COMPLETE · ⛔ NOT BUILT · one founder ruling owed (§2)
Deployment law: canon is merged but not cleared for broad deploy; next rollout
                is canonical + EARLY-FIELD-01, never canon alone
```

## 1 · Census findings (read-only)

### 1.1 Living Field is an established member surface, not a new one

It is live in production today at `04005ca7c`, and members reach it through:

| Path | Where |
|---|---|
| House doorway | `app/house/page.tsx:125` → `/maia/living-field?from=house` |
| House catalog | `lib/house/catalog.ts` (`id:'living-field'`, `centerEligible:true`) |
| House destinations | `lib/navigation/houseDestinations.ts:135` |
| MAIA nav | `lib/navigation/maiaNav.ts:56` |
| Vision Studio | `app/maia/vision-studio/page.tsx:30` (router push); `VisionStudioRoom` mounts `LivingConstellationPanel` |
| Practice Field | `PracticeFieldEditor` mounts `LivingConstellationPanel`, which links to `/maia/living-field` |
| Page | `app/maia/living-field/page.tsx` (`'use client'`, identity from `getValidMemberId()`) |
| Data | 10 API routes under `app/api/maia/living-field/**` and `app/api/maia/living-constellation`; identity comes from the verified session (`getMemberIdFromRequest` → `maia_session` / `x-session-token`) |

Members' own authored material lives behind these routes: dimension expressions, version
history, consents and encounters.

### 1.2 What #1539 actually changes for a member

| Change | Reaches | Gateable without duplication? |
|---|---|---|
| `LivingFieldInstrument` (R1R3 doorway/WORLD), mounted in `PersonalLivingFieldDashboard` | Living Field page only | **Yes**: one mount point; the instrument is session-local and uses no API |
| `livingFieldHierarchy.ts` (data for the instrument) | instrument only | yes (follows the mount) |
| Lane voice in panels (subtitles, "Wider field", "life" centre, empty states) | Living Field page **and** Vision Studio and Practice Field (via `LivingConstellationPanel`) | No, only by duplicating components |
| Truthfulness and provenance wording (`68211fea`, `6326abbc`, `92b3ecaa`) | same | No, and mostly it restores or strengthens canon law |
| R2 `physics/**` | nowhere (unmounted) | n/a |

### 1.3 Existing authority patterns

- **`lib/access/labAccess.ts`**: `LAB_ACCESS_MEMBER_IDS` env allowlist ∪ founders, checked
  against `getCurrentSession()`, fails closed, and grants nothing beyond Lab Tools. Its own ruling
  forbids reusing it for other doors, so it is a **pattern to copy, not an authority to share**.
- **`app/labtools/layout.tsx`**: a server layout gate. 401 goes to `/signin?next=`; otherwise
  `GateScreen` explains the refusal.
- **`/api/founder/rollout`**: a beta-tester CRM funnel (`ops_contacts`), **not** an access
  authority. There is **no existing canonical rollout or feature-access authority**, so this
  stop condition is not triggered.
- **Kill switches**: the convention is an env flag read at request time (e.g.
  `MAIA_ANCHOR_CONTEXT_ENABLED`, `WRITERS_STUDIO_EDITORIAL_ENABLED`). There is no general
  feature-flag platform, and ⛔ none will be built.
- **House presentation**: `lib/navigation/houseDispositions.ts` declares presentation state only.
  Its own invariant says disposition values must not carry audience or access meaning, so
  audience gating must not be expressed there.

### 1.4 Identity

The Living Field APIs already derive identity from the verified session, not from a client
claim. A server-side `canEnterEarlyField()` can reuse `getCurrentSession()`, exactly as
`requireLabAccess()` does. No identity-law conflict.

## 2 · The ruling owed: what is "the early field"?

As chartered, R4 gates **entry to `/maia/living-field`** for non-cohort members. The census
shows that would **retract an existing production surface**. Every member outside the cohort would lose
access to their own authored Living Field material, and to the constellation door in Vision
Studio and Practice Field. That goes beyond a rollout gate. It is a Class A consent and
ownership change in its own right (members cut off from what they wrote), which is why this
lane stops here rather than building it.

**Option A (recommended): gate the #1539 delta, not the room.**
- `/maia/living-field` stays open to every member, as it is today.
- The **R1R3 instrument** renders only when the server says so. `canEnterEarlyField()` runs on
  the verified session, and the Living Field API response (or a server component) carries the
  decision. No client flag, URL parameter or `localStorage` value can grant it. The instrument
  has no data and makes no API calls, so the only thing to protect is whether it is presented.
  A non-admitted member who constructs any URL gets the pre-#1539 room.
- Rollback: an empty `EARLY_FIELD_MEMBER_IDS`, or `EARLY_FIELD_ENABLED=false`, closes it for
  everyone with no code or migration.
- **Limit, stated plainly:** the copy and truthfulness changes reach every member regardless,
  because they sit in shared panels. Most of them restore or strengthen canon wording. The
  lane-voice subtitles and empty states are the only broadly exposed new language.

**Option B: gate the whole room, as chartered.** This hides the House doorway, returns 403 on
direct entry and refuses the 10 APIs for non-cohort members. It is technically straightforward, but it removes members' access to
their own material for the length of the cohort. I recommend against it unless that retraction
is intended.

**Not in this lane either way:** H1 (#1536/#1538, House → Writer's Studio) is also merged and
ungated. `EARLY-FIELD-01` as chartered covers the Living Field only. H1's exposure needs its
own decision before a broad deploy.

## 3 · What happens after the ruling

R2–R7 are built against the chosen scope: a distinct `EARLY_FIELD_MEMBER_IDS` authority;
one `canEnterEarlyField()`; a fail-closed rollback switch; no persistence; and six falsifiers
(client-only gate · fail-open config · identity confusion · shared lab authority · cosmetic
rollback · broad exposure), each killing its defeat candidate for the named reason. After
that come R8 (observation contract) and R9 (widening criteria).

The #1539 real-stack walk (port 3139, test member) remains separate, owed evidence.

---

## 4 · Founder ruling R1 (2026-09-30): Option A. Charter correction

> **Original assumption:** Living Field itself was the new rollout surface.
> **Observed reality:** Living Field is established production infrastructure; #1539 added a
> bounded R1R3 instrument inside it.
> **Therefore the governed object of EARLY-FIELD-01 is the new instrument's exposure, not the
> room's existence.** That distinction is now authoritative for this lane.

- **Not gated, by ruling:** `/maia/living-field`, the House doorway, MAIA nav, Vision Studio and
  Practice Field circulation, every Living Field API, and all member-authored dimensions,
  expressions, history, consents and encounters. A member outside the cohort keeps exactly the
  access they had before #1539.
- **A non-cohort member sees the ordinary room.** There is no access-denied page, no 403, no
  message implying the room is restricted, and no disabled doorway. The instrument is simply absent.
- **The shared #1539 copy and truthfulness wording stays broadly exposed**, by explicit ruling after
  this census. No second boundary for wording.
- **H1 (#1536/#1538) is not governed here.** It needs its own exposure ruling before broad deploy.
- **The original direct-route falsifier is superseded** by the instrument-authority falsifier (L1
  and the structural tests in §5).

## 5 · Built (R2–R7)

| Piece | Where |
|---|---|
| Authority, one decision `canEnterEarlyField(verifiedMemberId)` | `lib/access/earlyFieldAccess.ts` |
| Server decision delivered | `GET /api/maia/living-field` → `early_field: { instrument }`, computed from the `getMemberIdFromRequest` verified session; the route reads no request parameter |
| Single mount, default closed | `PersonalLivingFieldDashboard`: `{earlyFieldInstrument === true && <LivingFieldInstrument />}`; the page passes only `data.early_field?.instrument === true` |
| Config | `EARLY_FIELD_ENABLED` (exactly `"true"` opens; `"false"`/absent closes; other values are malformed → closed) · `EARLY_FIELD_MEMBER_IDS` (UUIDs; one malformed entry → closed for everyone); documented in `.env.example` |
| Rollback | `EARLY_FIELD_ENABLED=false` → instrument gone for everyone, room intact. No code, no migration, no member data touched |
| Persistence | none. Cohort membership is env configuration only; nothing is written |

**Distinct authority.** It is neither `labAccess` nor founder access, and founders are **not**
admitted automatically. Membership is explicit. The authority module imports neither list (guarded
by a test).

**R7 falsifiers** (`lib/access/__tests__/earlyFieldAccess.test.ts`, 19 tests). Six laws run
against the real decision and six defeat candidates. The real decision passes all six, and each
candidate dies on its named law:

| Defeat candidate | Killed by |
|---|---|
| client-only gate (`?early=1`, storage flag) | L1 no client input grants admission |
| fail-open configuration | L2 absent/malformed config fails closed (7 configs) |
| identity substitution (claimed id) | L3 only the verified identity counts |
| shared lab authority | L4 lab/founder membership grants nothing |
| cosmetic rollback (ignores `ENABLED=false`) | L5 `ENABLED=false` closes it for everyone |
| broad exposure (any authenticated member) | L6 enabled cohort admits only listed members |

Structural falsifiers:
- exactly **one** instrument mount in `app/**` and `components/**`, and it is gated
- the page takes the decision only from the API response
- the route uses the verified `memberId` and reads no `searchParams`, `nextUrl` or `request.url`
- the authority consults no lab or founder list and writes nothing
- the room itself carries no admission check

**Mutation check.** Three real-code mutants were each killed by exactly one test, and the restored
code passes 19/19:
- unconditional mount
- route trusts `?early=1`
- page trusts the URL

**⚠️ The honest limit of "server-authoritative".** The decision is made only on the server from
the verified session, and no URL, query, storage, cookie claim or request parameter can change it.
The instrument's JavaScript still ships in the page bundle, as all client code does. A member who
rewrites their own browser's runtime could render it locally. That reveals nothing and writes
nothing: the instrument is session-local, uses no API, and holds no data. No web gate can prevent
someone running code in their own browser. This gate governs what Soullab presents.

## 6 · R8 · Observation contract (what the cohort witnesses)

The cohort witnesses **the R1R3 instrument and its integration into the existing Living Field**:
- entry into the instrument from the established room
- threshold behaviour
- identity continuity
- session-local behaviour (nothing persists)
- evidence-loading and failure states where applicable
- circulation back into the Living Field and the House
- no mutation of member content through instrument use
- the instrument never visible to non-cohort members
- clean rollback to the ordinary room

**Evidence sources:** existing operational logs and explicit witness reports from cohort members.
⛔ No new behavioural telemetry for this rollout.

## 7 · R9 · Widening criteria (all required; widening stays a founder decision)

1. The #1539 real-stack R1R3 walk passes on canonical-equivalent code (port 3139, test member).
2. This falsifier suite passes on the deployed SHA.
3. **Exclusion witnessed in production:** a non-cohort member sees the ordinary room with no
   instrument, and no URL, query or storage manipulation mounts it.
4. **Rollback witnessed in production:** `EARLY_FIELD_ENABLED=false` removes the instrument for the
   cohort, and the room and member material stay intact.
5. No identity leakage or cross-member context contamination observed.
6. No unresolved Class A defect.
7. Cohort members complete the intended circulation without developer intervention.
8. Every defect found during the cohort has an explicit disposition.

"No one complained" is not a criterion.

## 8 · R10 · Deployment law

Canon `7ec42ce6` is **merged but not cleared** for broad production deployment. The next rollout is
**canonical + EARLY-FIELD-01**, deployed with `EARLY_FIELD_ENABLED=false` until the cohort is
named, and never canon alone. H1's exposure ruling is also owed before any broad deploy.
