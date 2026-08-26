# MLX-06 — System Census · Phase 1

**Date:** 2026-08-25 · **Mode:** LOOK → TRACE → MAP → REPORT → **STOP**
**No code modified. No implementation. MLX-03 stimulus untouched (`c137e44`).**

**Evidence basis:** source tracing on branch `claude/maia-onboarding-orientation-djtoii`, plus feature-flag
defaults. **Production runtime was not reachable from this session** (no `ssh`, `soullab.life` outside the
egress allowlist), so **LIVE means "wired end-to-end in source with its flag default-on"**, not "verified
serving members." Anything requiring runtime proof is marked ⚠.

---

## 1 · CURRENT STATE MATRIX

| Surface | State | Route | Primary files | APIs / data | Behavior | Major gap |
|---|---|---|---|---|---|---|
| **Sign in** | **LIVE** | `/signin` | `app/signin/page.tsx` → `components/auth/UnifiedAuth.tsx` (701L) | `/api/members/email-code`, `/api/auth/*`, `lib/auth/serverSessions.ts` | One front door. Email + one-time code primary; biometric return; Google/Apple secondary; password = recovery. `arrivalSignin` flag default **ON** | none material |
| **Sign up / join** | **LIVE** | `/signup` | same component, `mode="signup"` | same | Email → 6-digit code → name → "Enter MAIA" | — |
| **Verification** | **LIVE** | — | `app/api/members/email-code/verify` | `auth_sessions`, `members` | 6-digit code, resend, change-email | — |
| **Post-auth routing** | **LIVE** | — | `UnifiedAuth.tsx:390` | `members.onboarded` | `onboarded ? '/maia' : '/onboarding'` | **routes new members into the three framework screens** |
| **First arrival (onboarding)** | **LIVE — and it is the old flow** | `/onboarding` | `CompleteWelcomeFlow.tsx` → `ConsciousnessPreparation` · `BirthDataStep` · `SageTealWelcome` | `/api/members/progress` | 10-lens self-classification → birth data → five elements | **R1 target not built.** Lens answer written to `localStorage.consciousnessPreparation`, **read by nothing** |
| **Arrival ceremony** | **LIVE** | `/maia` (in-page) | `lib/maia/arrivalState.ts`, `MaiaCenterField.tsx`, `OracleConversation.tsx` | `localStorage maia_has_arrived` | First-visit-only clean arrival; "I'm ready" crossing; `arrivalEntry` flag default **ON** | **not the doorway** — no "what is asking for your attention", no doorway set |
| **Doorways** | **DESIGNED** | — | prototype only (`c137e44`) | — | — | **entirely absent from product** |
| **MAIA entry** | **LIVE** | `/maia` | `app/maia/page.tsx` (2166L), `MaiaShell.tsx` (406L) | — | Shell + center field + conversation | page is very large; many concerns in one file |
| **MAIA text** | **LIVE** | — | `OracleConversation.tsx` | `/api/sovereign/app/maia/list` | FAST/CORE/DEEP tiers | — |
| **MAIA voice** | **LIVE** ⚠ | — | `AdaptiveVoiceMicButton`, `EnhancedVoiceMicButton`, `SimpleVoiceMic`, `OrganicVoiceMaia` | `/api/voice/{transcribe,local-tts,openai-tts,stream-conversation,webrtc-session}` | Voice + text coexist; voice-driven world navigation in `MaiaShell` | **four generations of mic component**; no unified Present/Listening/Speaking state language |
| **House** | **LIVE** | `/maia` (sheet) | `MaiaHouseSheet.tsx`, `lib/navigation/maiaNav.ts`, `houseDestinations.ts` | registry only | Sheet with **Your Center · Worlds · Rooms**; rail retired 2026-07-22 | **renders as a destination list, not a threshold**; no Continue/Kept/Recent |
| **My Life** | **PARTIAL** | — | `houseDestinations.ts` `group:'life'` | — | **The group exists in data** with a `── My Life ──` comment | **flattened at render**: `MaiaHouseSheet:125` merges `life` + `work` into one `Worlds` section. The realm heading is never shown |
| **My Contribution** | **PARTIAL** | — | `group:'work'` (Contribution Field) | — | same | same — merged into `Worlds`; name not surfaced |
| **My Practice** | **MISSING (as a realm)** | `/practitioner`, `/studio`, `/caseload`, `/sessions` | `lib/practitioner/*`, `lib/coachField/*` | practitioner tables | Surfaces exist and are substantial | **no House branch**; `audience` gate exists but is used for Studios, not a practice sphere |
| **Continue** | **PARTIAL** | `/home` | `app/home/page.tsx`, `PortalThreshold.tsx` | `maia_sessions` (last session) | "Your Gathering" strip links to `/maia` | **not in the House**; lives on a second threshold; not called Continue |
| **Kept** | **PARTIAL** | `/maia/keep-capture` (614L) | `KEEPS_RAIL_ITEM`, atoms | `member_memory_atoms`, `/api/sovereign/atoms/[id]` | Atoms exist, `is_breakthrough`, `return_preference` | **no House surface**; `/home` shows one recent atom only |
| **Recent** | **MISSING** | — | — | `maia_sessions` exists | — | no surface named Recent anywhere |
| **Living Field** | **BUILT** | `/maia/living-field` (93L) | registry `group:'life'` | `living_encounters`, `living_encounter_events` | reachable, registered | thin page relative to substrate |
| **Journal** | **LIVE** | `/labtools/journal` (21L) | `QuickJournalSheet`, deep-link | journal tables | capture sheet + deep link from `/maia` | label/route mismatch (`Journal` → `/labtools/…`) |
| **Anchor** | **LIVE** | `/maia/anchor` (208L) | `lib/anchor/*` | `member_daily_anchors`, `surface_preference` | consent-gated ambient surfacing shipped | — |
| **Relationships** | **BUILT, off the House** | `/relationships` (147L) | `app/relationships/page.tsx` | `/api/relationships` (+`checkin`,`entries`), `member_relationships` | outer/inner/transpersonal; auth + member-scoped | **not in the registry**; R2 reduced scope not yet applied — system-authored fields still written |
| **Desktop navigation** | **LIVE** | — | `MaiaShell` + `MaiaHouseSheet` | registry | House sheet is the navigation | no persistent spatial shell; drawer only |
| **Mobile / PWA navigation** | **PARTIAL** | — | same components; `public/manifest.json` | — | Same sheet on mobile; `isNative` reachability classification exists | **no mobile-specific navigation**; no bottom nav component exists |
| **Memory / continuity** | **LIVE** ⚠ | — | `memoryAtomsLoader`, `conversationalRecallBlock`, `memoryHealth`, `loadRecentAnchors` | live route `sovereign/app/maia/list` | atoms + conversational recall + anchors reach the prompt | DEEP tier still blocked at `buildComprehensiveVoicePrompt`; **no member-facing continuity surface** |
| **Field (as product noun)** | **MISSING** | — | — | — | — | does not exist |

---

## 2 · SIGN-IN → MAIA → HOUSE GAP MAP

```
   SIGN IN / SIGN UP        ██████████  LIVE      one front door, code + biometric
           ↓
   POST-AUTH ROUTING        ██████████  LIVE      but routes to the OLD onboarding
           ↓
   ARRIVAL                  ████░░░░░░  PARTIAL   ceremony exists · doorway MISSING
           ↓
   MAIA FIRST CONTACT       ███████░░░  PARTIAL   live, but context-blind at arrival
           ↓
   HOUSE                    ██████░░░░  PARTIAL   a destination list, not a threshold
           ↓
   CONTINUE / KEPT / RECENT ██░░░░░░░░  FRAGMENTED  Continue on /home · Kept in a room · Recent absent
           ↓
   RETURN                   ███░░░░░░░  PARTIAL   returning member sees the same House as a new one
```

| | What exists | What is fragmented | What is missing | Composable from existing code | Genuinely new build |
|---|---|---|---|---|---|
| **Auth** | full front door | — | — | — | — |
| **Arrival** | ceremony, two-state marker | old `/onboarding` runs in parallel | doorway set + contextual opening | arrival state machine reusable | doorway UI + opening map |
| **First contact** | conversation, tiers, memory | — | arrival context reaching first turn | prompt assembly already accepts addenda | pass arrival context into first turn |
| **House** | registry, sheet, groups in data | `life`/`work` flattened to `Worlds` | realm headings, Continue/Kept/Recent | **grouping is a render change only** | threshold composition |
| **Continuity** | atoms, sessions, anchors, recall | Continue on `/home`, Kept in a room | Recent; one continuity surface | all three data sources exist | House continuity block |
| **Return** | — | two thresholds (`/home`, `/maia`) | member-state-aware threshold | member-state derivable from existing queries | state matrix rendering |

---

## 3 · MOBILE VS DESKTOP

| | Desktop | Mobile | Difference |
|---|---|---|---|
| Navigation | House sheet (drawer) | **same sheet** | none — mobile is the desktop drawer |
| Shell | `MaiaShell`, rail retired | same | no mobile-specific composition |
| Conversation | full | responsive (24 commits of mobile/transcript work) | genuinely adapted |
| Voice | mic components | same | `isNative` affects route reachability only |
| PWA | — | `manifest.json` present | no service worker found at `public/sw.js` |
| Bottom nav | n/a | **does not exist** | the charter's "one thumb" mobile House has no component |

**Finding:** mobile and desktop are currently **clones, not siblings.** The one place they diverge is
reachability classification for native builds, which is a build concern rather than an experience one.

---

## 4 · REUSABLE EXISTING COMPONENTS

- `UnifiedAuth` — the whole front door. Do not touch.
- `lib/maia/arrivalState.ts` — two-state arrival constitution; the doorway belongs **inside** it.
- `lib/navigation/houseDestinations.ts` + `maiaNav.ts` — registry with `life`/`work`/`rooms` groups, `audience`
  gating, conditional visibility, drift tests. **The realm spine is already modelled here.**
- `MaiaHouseSheet` — sheet chrome, group sections, native/web hints.
- `PortalThreshold` + `app/home/page.tsx` — the Continue/Kept queries **already written**
  (`maia_sessions` last row, `member_memory_atoms` latest with `is_breakthrough`).
- `memoryAtomsLoader`, `conversationalRecallBlock`, `loadRecentAnchors`, `memoryHealth` — continuity substrate.
- `lib/maia/presence/place.ts` — governed room registry incl. `/home`.
- Design tokens in `app/globals.css` (`--sl-*`, 22 declarations).

---

## 5 · GENUINELY MISSING

1. **Doorway set + contextual first turn** — no equivalent exists.
2. **A continuity block in the House** — Continue/Kept/Recent as one surface.
3. **Recent** — no surface, though `maia_sessions` holds the data.
4. **Realm headings** — `My Life` / `My Contribution` exist in data, never rendered as names.
5. **My Practice as a House branch.**
6. **Field** — the product noun does not exist in any form.
7. **Mobile-native navigation** — no bottom nav, no one-thumb House.
8. **Member-state-aware threshold** — the House renders the same for a first-day and a two-year member.

---

## 6 · TOP 5 HIGH-LEVERAGE GAPS

| # | Gap | Why it is high leverage |
|---|---|---|
| **1** | **Post-auth routes new members into the old onboarding** (`UnifiedAuth.tsx:390`) | Every new member meets the ten-lens screen. One conditional stands between the current product and the ruled arrival. Highest ratio of member impact to code touched. |
| **2** | **`life`/`work` flattened into `Worlds` at render** (`MaiaHouseSheet.tsx:125`) | The R5a realm spine is **already in the data**. This is a presentation change, not an architecture build — arguably the cheapest structural win in the programme. |
| **3** | **Continuity exists but has no member surface** | Atoms, sessions, anchors and recall are all live; the member cannot see any of it. Continue/Kept/Recent is composition of existing queries, not new capability. |
| **4** | **Two thresholds** (`/home` and `/maia`) | Q1 ruled `/maia` canonical. `/home` holds the Continue/Kept queries the House needs — so resolving this and gap 3 are the same work. |
| **5** | **Arrival is context-blind at first contact** | The ceremony exists and conversation is live, but nothing the member brings shapes MAIA's opening. This is what makes first contact generic. |

**Note the shape:** four of the five are **composition or presentation of code that already exists**, not new
capability. The census supports the charter's expectation — this is more composition than construction.

---

## 7 · RECOMMENDED FIRST BOUNDED BUILD UNIT

### Unit A — **The House shows the member's world**

**Not** the arrival replacement. Gap 1 is higher-impact but touches the live signup path for every new member;
it should follow a unit that proves the House can receive them. This unit is inward-facing, reversible, and
makes the destination worth arriving at.

**Objective**
Render the realm spine and a continuity block in the House: `My Life` and `My Contribution` as named groups,
and `Continue` / `Kept` / `Recent` composed from queries that already exist on `/home`.

**Exact file scope**
```
components/maia/MaiaHouseSheet.tsx      render life/work as named sections; add continuity block
lib/navigation/houseDestinations.ts     group display names only (no route changes)
app/api/…/house-continuity/route.ts     NEW — member-scoped read: last session, recent atoms, recent places
app/home/page.tsx                       READ ONLY this unit — source of the queries, not modified
```

**Routes affected** — `/maia` only. `/home` untouched (its consolidation is a later unit).

**Expected visual change**
The House sheet gains, above `Worlds`: a single `Continue` row, then `Kept` and `Recent` as quiet signals.
`Worlds` splits into `My Life` and `My Contribution` with their names shown. Rooms unchanged.

**Expected behavioral change**
A member with a prior session sees where they were and can resume. A member with kept atoms sees them.
A member with neither sees the doorway-less House exactly as today — **evidence-gated, no empty scaffolding.**

**Tests required**
- `houseNavDrift.test.ts` still passes (registry ↔ House parity).
- New: continuity endpoint is member-scoped; returns empty for a member with no data.
- New: House renders no continuity block when all three are empty.
- Consent: the block shows the member their own material only — it must not widen what MAIA receives
  (`return_preference` / `surface_preference` untouched, two-channel rule).
- `npm run typecheck` no-regression gate.
- Co-Lab boundary gate **if** any migration lands — this unit should need none.

**Rollback** — single revert; no schema change, no route change, no data written.

**Explicit stop condition**
Stop when the House renders realm names and an evidence-gated continuity block on `/maia`, tests pass, and the
before/after is reviewed on desktop and mobile. **Do not** in this unit: touch `/onboarding`, add doorways,
consolidate `/home`, add Field, add My Practice, or modify the frozen prototype.

---

**STOPPED. Awaiting authorization.**
