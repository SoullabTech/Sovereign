# Writer's Studio — when a beta grant ends: keep the Free Studio, lose only Pro (design, 2026-11-13)

**Owner lane:** SoullabTech/Sovereign#1800 (Writer's Studio). JARVIS flow under `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md`.
**Canonical read:** `origin/clean-main-no-secrets` = `deb062753f` (includes #2261, dated beta grants, built dark).
**Standing:** DESIGN ONLY. ⛔ No source change · ⛔ no grant, migration, flag or env change · ⛔ no deploy · ⛔ no production read.
Every code statement below is a **code-read at `deb062753f`** (what the code says), not a runtime or member witness.

## 0. The rulings this design serves

| Ruling | Where recorded | What it says |
|---|---|---|
| Beta term = one year | #1800, 2026-11-13 06:57Z | *"for beta testers we give them a year access"* |
| Expiry handling | #1800, 2026-11-13 06:58Z, item 5 | **Expiry removes only the Pro capabilities.** Works, revisions, identity and owner-controlled export are kept. |
| Free stays usable | founder, relayed by the doorway session 2026-11-13 | *"pro writing should be still available on free"* |
| Admit Free (direction) | PR #2077 §6, 2026-11-02 (open PR, not canon) | Free members are admitted once the Free/Pro boundary is enforced server-side; built dark. |
| Free = one active Work | PR #2077 §6.2, 2026-11-02 (open PR, not canon) | Free = the whole Studio as built, on one active Work. Pro = more than one active Work + each Pro-only capability as it ships. |
| Pro on the entitlement layer | `lib/auth/wholeWorkEntitlement.ts` header, 2026-11-11 | `writing.wholeWork` is the Free/Pro line; `members.tier = 'pro'` also holds it. |

## 1. The defect, stated as a crossing

**Crossing: grant expiry → Studio corridor.** At `deb062753f` one predicate, `writersStudioBetaAccess()`
(`lib/writersStudio/betaAccessServer.ts:27`), answers three different questions at once:

1. may this member enter the Studio corridor? (admission)
2. are they Free or Pro? (plan)
3. do they hold `writing.wholeWork`? (Pro entitlement)

When a dated grant lapses, `decideBetaGrant()` (`lib/writersStudio/betaGrants.ts:37-45`) returns
`{ active: false, hasHistory: true }`, `writersStudioBetaAccess()` returns `not_in_pilot`, and the member is refused at
the proxy for **the whole corridor** — Write, the Spark door, Sources, Develop, Review — not just Pro.

**Preserved evidence of the defect (not fixed here):** the header of `lib/writersStudio/betaGrants.ts:12-13` says
*"expiry removes Pro capabilities only"*. At this SHA that comment is false: expiry removes admission. The build must
correct it; this PR leaves it visible.

Two further facts make the problem worse than "Free is lost":

- **Expiry and revoke are indistinguishable today.** `decideBetaGrant()` collapses both into `{ active: false, hasHistory: true }`.
  The design needs to tell them apart.
- **There is no Free/Pro line inside the corridor to fall back to.** Only `writing.wholeWork` is enforced, and only when
  `WS_PRO_GATE_ENABLED === 'true'`. With the gate off (the default), `resolveWholeWork()` grants it to everyone without
  reading anything. The one-active-Work limit (`multiple_active_works`, the other enforced Pro line ruled in #2077 §6.2)
  is **not built**: nothing in `lib/` or `app/` counts active Works.

## 2. Census — what gates on admission and what gates on Pro

### 2.1 The deciders

| Function | File | Reads | Returns |
|---|---|---|---|
| `writersStudioBetaAccess(memberId)` | `lib/writersStudio/betaAccessServer.ts:27` | founder/cto role; `WS_BETA_GRANT_MODE`; dated grant log; legacy `ops_contacts.metadata.writers_studio_beta` | `eligible` + basis (`founder_witness` · `active_beta_tester` · `dated_beta_grant` · `not_in_pilot`) |
| `decideBetaGrant(latest, now)` | `lib/writersStudio/betaGrants.ts:37` | latest grant event | `active` · `hasHistory` (expired = revoked) |
| `decideWriterStudioPlan(pilot)` | `lib/writersStudio/planPolicy.ts:97` | the above | eligible → `pro`, `pilotEligible: true`; else → `free`, `basis: 'public_not_launched'`, `pilotEligible: false` |
| `writerStudioPlanForMember` | `lib/writersStudio/planAccessServer.ts:5` | the above | plan decision |
| `writerStudioAdmissionForMember` | `lib/writersStudio/admissionServer.ts:10` | plan decision | allowed **iff `pilotEligible`** — i.e. iff Pro |
| `resolveWholeWork(memberId)` | `lib/auth/wholeWorkEntitlement.ts:55` | `WS_PRO_GATE_ENABLED`; beta access; `members.tier` | gate off → everyone; pilot → yes; tier `pro` → yes; else no |

So **admission = Pro** by construction (`admissionServer.ts:12`). The Free branch of `decideWriterStudioPlan()` exists
but no admitted member can ever receive it.

### 2.2 Callers, classified by what the gate is *for*

| Gate site | Today asks | Should ask | Notes |
|---|---|---|---|
| `proxy.ts:662-700` — corridor (`isWriterStudioRestrictedPath`): all `/writers-studio/**` pages, `/api/writers-studio/**` (except `local-review`), `/api/sovereign/writers-studio/**` (except `beta-access`, `plan`), `manuscripts/blank`, and 15 manuscript actions (`ask`, `attention-map`, `chapter-reviews`, `develop`, `developmental-orientation`, `lineage-*`, `locus`, `readings`, `review-discuss`, `sections`, `structure`, `themes`, `write-state`) | Pro (via admission) | **Admission** | Per #2077 §6.2 all of these are Free ("the whole Studio as built"). |
| `app/api/sovereign/writers-studio/arrival/route.ts:52` — Spark door / Inspiration Opening | Pro | **Admission** | Live on production `585e9d427` per the doorway session (not witnessed here). |
| `app/api/sovereign/writers-studio/journey/route.ts:32,59`, `journey/[answerId]/route.ts:31` | Pro | **Admission** | |
| `app/api/sovereign/writers-studio/beta-feedback/route.ts:18` | Pro | **Admission** | A writer whose beta ended is still a beta voice. |
| `app/api/sovereign/manuscripts/ingest/route.ts:293` — audience D1, "same predicate as the page" | Pro | **Admission** + the one-Work check | Ingest creates a Work. `new_original_file_ingest` stays an independent release hold either way. |
| `app/api/sovereign/writers-studio/beta-access/route.ts:21` — introspection | Pro | **Report both** | Must be able to say "your beta Pro ended on <date>; your Studio stays open". |
| `app/api/sovereign/writers-studio/plan/route.ts:21` — introspection | plan (Pro-or-out) | **Report plan + basis** | `free` with a truthful lapsed basis. |
| `lib/auth/entitlements.ts:51,61` → `resolveWholeWork` → `lib/writersStudio/studio/passRun.ts:108`, `synthesizeAttentionMap.ts:126`, `manuscripts/[id]/editorial-pass/route.ts:43` | Pro | **Pro** (unchanged) | The whole-book editorial pass. |
| *(none)* — `multiple_active_works` | — | **Pro** | Not built. Required before any Free member exists (§4, D1). |

Outside the corridor and not affected: `/press/manuscript`, `manuscripts/route.ts`, `[id]/route.ts`, `[id]/draft/**`,
`[id]/render`, `[id]/editorial-letter/**`, `[id]/editorial-pass` (gated only by `writing.wholeWork`), `local-review/**`.
These keep their own member/Work authority, which is why Works stay readable and exportable after expiry today.

## 3. The separation

### 3.1 One owner, two answers

Keep one owning module (`betaAccessServer.ts`) and make it answer **standing** and **plan** separately, instead of
adding a corrective condition at each caller.

```
writersStudioStanding(memberId) →
  | { admitted: true,  plan: 'pro',  basis: 'founder_witness' | 'active_beta_tester' | 'dated_beta_grant', expiresAt? }
  | { admitted: true,  plan: 'free', basis: 'grant_lapsed', endedAt }
  | { admitted: false, basis: 'not_in_pilot' | 'grant_revoked' }
```

- `writersStudioBetaAccess()` keeps its current meaning, **beta Pro**, so `resolveWholeWork()` and every Pro gate are
  untouched: a lapsed member is not `eligible`, so `writing.wholeWork` falls through to `members.tier`.
- `decideBetaGrant()` distinguishes `lapsed` (latest event is `grant`/`extend`, `expires_at ≤ now`) from `revoked`
  (latest event is `revoke`).
- `decideWriterStudioPlan()` takes the standing and can finally return `free` for an admitted member.
  `admissionServer` reads `admitted`, not `pilotEligible`.
- The admission callers in §2.2 move to `writersStudioStanding()`; the Pro callers do not move.

### 3.2 Who gets the Free standing — and why this does not open the Studio

`grant_lapsed` is reachable **only** by a member whose own dated-grant log shows a founder/CTO-recorded `grant` or
`extend` that has run out. That is a person who was individually admitted, identity-bound and audited. Nobody else can
reach it:

- a member with no grant history stays `not_in_pilot` (the legacy boolean is unchanged);
- `WS_BETA_GRANT_MODE = 'legacy'` (the default) never reads the grant log, so nobody can lapse;
- query flags, browser state, `members.tier` and payment still cannot produce standing.

The wider "admit Free now" direction (#2077 §6) would later add one more Free basis behind its own dark switch. This
design neither builds nor needs it.

### 3.3 Never Free without a Pro line

Free standing is meaningful only if Pro is actually withheld. Two structural conditions, both enforced in code, not
in operating notes:

1. **`grant_lapsed` admits only when `WS_PRO_GATE_ENABLED === 'true'`.** With the gate off, everyone holds
   `writing.wholeWork`; admitting a lapsed member then would hand them Pro. With the gate off, a lapsed member stays out
   exactly as today — no regression, no silent Pro.
2. **The one-active-Work limit must exist before the first lapse can happen.** Otherwise a lapsed writer keeps
   `multiple_active_works`. This is #2077 §6.2 step 1, already directed, with its open definition (which object is an
   "active Work": `living_works` vs manuscripts). A lapsed writer with several Works keeps all of them readable and
   exportable; only creating or activating another is refused, honestly, with nothing lost.

### 3.4 What the writer meets (scope note)

Expiry notice, 30/7-day reminders, the extension request, and the `/writers-studio/plans` page (still a dead link in
`WriterPreferencesMenu.tsx`) are **separate** items under the #1800 rulings 3, 4 and 6 and are not designed here. This
design only guarantees that the introspection routes can tell the truth ("beta Pro ended on <date>; your Studio and
Works stay"), so that copy has something true to say.

## 4. Dependencies and order (for after the ruling)

| Step | Change | Needs |
|---|---|---|
| D1 | One-active-Work enforcement (#2077 §6.2 step 1) | Definition of "active Work" |
| S1 | `decideBetaGrant()`: lapsed ≠ revoked (pure) | — |
| S2 | `writersStudioStanding()` in `betaAccessServer.ts`; plan decision takes standing; correct the `betaGrants.ts:12-13` comment | S1 |
| S3 | Admission callers (§2.2) move to standing; Pro callers untouched | S2 |
| S4 | Introspection routes report plan + basis + dates | S2 |
| Gate | Production may reach `WS_BETA_GRANT_MODE = 'dated'`/`transition` with live grants only after D1–S4 are deployed and witnessed, and before **2027-11-13** | founder go, #1938 hold |

No migration: the grant event table from #2261 already records everything the standing needs.
Rebase note: open PR #2260 (doorways) touches `betaAccessServer.ts`, `betaGrants.ts`, `planPolicy.ts` and `proxy.ts`;
whichever lands second rebases.

## 5. Falsifiers

Each is a test that must be able to fail; the "mutation" column names the change that should turn it red.

| # | Given | Expect | Mutation that must fail it |
|---|---|---|---|
| F1 | mode `dated`, gate on, latest event `grant` expired yesterday | standing `admitted`, plan `free`, basis `grant_lapsed`; proxy lets `/writers-studio` and `arrival` through | admission still reading `pilotEligible` |
| F2 | same as F1, `members.tier = 'free'` | `writersStudioBetaAccess` not eligible; `resolveWholeWork` not entitled; editorial pass → 403 `whole_work_entitlement_required` | lapsed basis counted as beta Pro |
| F3 | same as F1 but **gate off** | standing **not admitted** (lapsed stays out) | removing the gate-on condition from §3.3 |
| F4 | member never granted, no legacy flag, not founder | not admitted: page → redirect, API → 403 `WRITER_STUDIO_INVITATION_REQUIRED`, `arrival` → 403 | any default that admits no-history members as Free |
| F5 | latest event `revoke` | per founder ruling (§6): **not admitted** under A | treating revoke as lapse (A) / as exclusion (B) |
| F6 | mode `legacy`, an expired grant row exists | grant log never read; behaviour identical to today | lapse logic running in legacy mode |
| F7 | mode `transition`, legacy boolean true, latest grant expired | **Free**, never Pro | legacy boolean re-elevating a lapsed member |
| F8 | lapsed member, second Work create / activate | refused honestly; existing Works still listed, readable, exportable | one-Work check missing or deleting/hiding Works |
| F9 | grant lookup throws | proxy answers 503 `WRITER_STUDIO_ADMISSION_UNAVAILABLE`; routes refuse; never read as Free or as out | catch that returns a default standing |
| F10 | founder/CTO | Pro witness, unchanged in every mode | founder check moved after the grant lookup |
| F11 | lapsed, then `extend` recorded | Pro again, `writing.wholeWork` restored | standing cached from the lapse |
| F12 | lapsed member with `members.tier = 'pro'` | Free standing + `writing.wholeWork` (the 2026-11-11 tier ruling); tier alone with no grant history → still not admitted | tier opening the corridor |
| F13 | revoked or lapsed member | `/press/manuscript` and `manuscripts/[id]` read + render still work for their own Works | adding the Studio gate to Press routes |
| F14 | `plan` and `beta-access` routes for a lapsed member | `plan: 'free'`, `basis: 'grant_lapsed'`, the end date; never `pro` | introspection still projecting Pro-or-out |
| F15 | lapsed member sets a query flag / cookie claiming Pro | no change | any client input reaching the decision |

F1–F7, F9–F12 can run as pure-decision and proxy tests without a database (the deciders are already split into pure
functions). F8 waits on D1. F13 is an existing-behaviour witness to keep. None of these substitutes for an F6 writer walk
of a lapsed account before dated grants go live.

## 6. The one question for the founder

> **When a beta grant is *revoked* (not left to expire), should the writer also keep the Free Studio, or leave the
> Studio entirely?**

- **A (recommended): revoke removes Studio entry; expiry keeps Free.** Revoke is the operator's corrective act — a grant
  recorded to the wrong account, a broken identity binding, a safety removal — and those must fail closed. Your
  2026-11-13 ruling 5 speaks of expiry. Works stay readable and exportable through Press either way. If you later want
  to end someone's Pro early but keep their Free Studio, that is a new, explicit operator action, not a reuse of revoke.
- **B: revoke behaves like expiry** (Free stays). Simpler for writers, but the operator then has no way to take an
  account out of the Studio short of clearing its history.

Everything else in this document follows from rulings already recorded and needs no further ruling.

## 7. What this does not authorize

No build, migration, grant, flag or env change, invitation, email, merge or deploy. Release ledger #1938 (HOLD) and
#1800's gates still govern. The build in §4 needs its own authorization after the §6 ruling.
