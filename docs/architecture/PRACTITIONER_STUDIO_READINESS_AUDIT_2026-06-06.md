# Practitioner Studio — Readiness Audit

- **Date**: 2026-06-06
- **Purpose**: Drive the next 2–3 months of polish toward inviting practitioners into Soullab Practitioner Studio. Practitioners evaluate Studio as *one operational environment* — so this audits the whole surface set, not the attention loop alone.
- **Method**: Code audit (parallel read-only passes over `app/studio/*`, `app/team/*`, `components/*`, `lib/studio/moduleDefinitions.ts`, `lib/navigation/maiaNav.ts`). Conservative + evidence-based; "unverified" where runtime behavior couldn't be confirmed from code.
- **Calibration**: This is a *code* audit. **Discoverable** and **Mobile-ready** especially want a real device pass to confirm — Kelly's lived "how many taps to For You / do I know where to look" test refines those two columns. Treat ratings as Designed-layer until device-verified.

> **Headline:** The infrastructure is strong. The *surfacing* is the gap. The single biggest readiness blocker is **navigation/discoverability**, which sits upstream of nearly every surface.

---

## §1 — The Matrix

Legend: ✅ solid · ⚠️ partial/risk · ❌ broken/missing · ? unverified

| Surface | Exists | Wired | Discoverable | Mobile-ready | Practitioner-ready | Classification |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Command Center** `/studio` | ✅ | ✅ (triage/tasks/daily hooks) | ✅ alwaysOn | ❌ `grid-cols-4`/`-3` no responsive prefix → overflow | ❌ | **Built but unclear** (mobile-broken landing) |
| **Clients** `/studio/clients` | ✅ | ✅ CRUD `/api/studio/clients` | ✅ 4 presets | ✅ `grid-cols-1 md:2 lg:3` | ✅ | **Live & usable** |
| **Sessions** `/studio/sessions` | ✅ | ✅ `useBookings` | ✅ 3 presets | ✅ flex/text | ✅ | **Live & usable** |
| **Session Room** `/studio/session-room` | ✅ | ✅ scribe + MAIA + recording | ❌ in **0 presets** (opt-in only) | ✅ | ⚠️ | **Built but hidden** |
| **Booking** `/studio/booking` | ✅ | ✅ real availability + reservations + calendar sync | ✅ 6 presets | ✅ (reservations table unverified) | ✅ | **Live & usable** |
| **Tasks** `/studio/tasks` | ✅ | ✅ `/api/studio/tasks` + energy state | ⚠️ only 2 presets | ⚠️ `grid-cols-5` energy picker tight | ⚠️ | **Live & usable** (narrow exposure) |
| **Communications** `/studio/comms` | ✅ | ⚠️ inbox = `mockMessages`; SMS send route unverified; no email backend found | ⚠️ 4 presets | ⚠️ many fixed `w-`; resizable panel | ❌ | **Built but unclear** |
| **Vault** `/studio/vault` | ✅ | ✅ encrypted file CRUD `/api/studio/files` | ✅ **all 8 presets** | ✅ `grid-cols-2 md:4 lg:6` | ✅ | **Live & usable** |
| **Co-lab** `/team` | ✅ | ✅ | ❌ only `consultant` preset; invisible to generalist/therapy | ⚠️ (via drawer if enabled) | ❌ | **Built but hidden** |
| **Attention / For You** `/team/for-you` | ✅ | ✅ polls `/api/team/attention` | ❌ buried 2–3 levels; no top-level indicator | ⚠️ behind hamburger | ❌ | **Built but unclear** |
| **MAIA — member** `/maia` | ✅ | ✅ | ✅ global rail | ✅ | ✅ | **Live & usable** (different sovereignty — see §4) |
| **MAIA — studio** `/studio/maia` | ✅ | ✅ | ✅ 3 presets | ? | ✅ | **Live & usable** |
| **Studio Navigation** (system) | — | — | ❌ flat list + dual rail | ❌ 4 hardcoded tabs + clip | ❌ | **The #1 issue** (see §3) |

---

## §2 — Per-surface notes (evidence)

- **Command Center** — real data (triage/agent-tasks/daily-log hooks) but `grid-cols-4`/`grid-cols-3` with **no** `md:`/`sm:` (`app/studio/page.tsx:155,247`) → overflows on a phone. It's the *landing page* — a broken first impression. **Highest-leverage mobile fix.**
- **Clients / Sessions / Vault / Booking** — the practitioner core is genuinely **Live & usable**: real APIs, responsive layouts, default-on for the common portal types. Booking even has availability + calendar sync. These are launch-ready (modulo a device pass on Booking's reservations table).
- **Session Room** — fully built (recording, transcript, MAIA mentor) but in **0 portal presets** → a practitioner never sees it unless they hand-enable it in Settings. Pure surfacing gap.
- **Tasks** — solid backend (energy-state matching, Focus Garden) but only in 2 presets and the 5-col energy picker is tight on ~390px.
- **Communications** — the **one real wiring gap**: the inbox renders `lib/studio/mockMessages.ts` (static), SMS-send code exists but no verified email/SMS backend. UI is done; the engine is unconfirmed.
- **Co-lab + For You** — strong infra (the whole attention loop we just shipped), but Co-lab is in **only the `consultant` preset**, and For You sits behind Co-lab's sidebar behind the mobile hamburger. *This is the discoverability problem in microcosm.*

---

## §3 — Cross-cutting patterns (the real findings)

**1. Infrastructure is ahead of surfacing — confirmed as a pattern.**
Session Room, Co-lab, and For You are all built+wired but hidden/opt-in/buried. The engineering is strong; the *"a practitioner immediately understands where this is and what it does"* layer is missing. This is the dominant readiness blocker, and it's the *easier* class of problem.

**2. Navigation is the #1 issue (your flag, validated).**
- **Dual rail**: the global MAIA rail (56px, `MaiaLeftRail`) is always present *and* the Studio sidebar is offset beside it — two nav systems with no clear "which world am I in" signal.
- **Flat list**: the Studio sidebar renders ~13 modules (generalist) as an undifferentiated linear list. Category metadata (`core/clients/operations/tools/collaboration`) **exists** in `moduleDefinitions.ts` and `getModulesByCategory()` but is **never rendered**.
- **Mobile**: 4 hardcoded bottom tabs (Comms/Caseload/Tasks/Calendar) + everything else behind the hamburger; Co-lab/For You in neither. Plus the drawer-clip we just fixed.
Fixing navigation unlocks discoverability for *every* surface above — highest leverage in the whole audit.

**3. Mobile-readiness is uneven.**
Clients/Sessions/Booking/Vault are solid; Command Center is broken; Comms/Tasks have risks. Mobile needs a deliberate per-surface pass, not a blanket assumption.

**4. Portal presets under-expose strong features.**
Session Room (0 presets), Co-lab (1), Tasks (2) are built but barely defaulted-on. A preset review is cheap and high-impact.

---

## §4 — Sovereignty boundary (hold the line)

- **MAIA stays a companion, not a notification center.** No global bell; attention counts ride on the **Co-lab** entry (coordination-scoped), never as an ambient app-wide alert. (Locked in `COLAB_ATTENTION_LAYER_SPEC` / `ATTENTION_SUBSTRATE_GENERALIZATION`.)
- The dual-rail clarification must not turn the MAIA rail into a Studio task surface — keep the *member field* (MAIA) and the *practice* (Studio) legibly distinct.

---

## §5 — Recommended sequencing (toward practitioner launch)

**Phase 1 — Navigation & discoverability** *(biggest unlock; upstream of everything)*
- Restructure the Studio sidebar to use its existing categories (group, don't flat-list).
- Promote **Co-lab → first-class** nav + attention count badge (the chosen "#2" direction); surface **For You** top-level.
- Rationalize the dual rail (clear world/practice boundary) + mobile bottom-tabs/hamburger hierarchy.
- Fix **Command Center** mobile grid (broken landing page).

**Phase 2 — Mobile polish, per surface**
- Command Center grid, Comms panels, Tasks energy picker, Booking reservations table — device-verified.

**Phase 3 — Wiring completion**
- **Communications** backend (real email/SMS, retire `mockMessages`) — the one genuine engine gap.
- Attention **request legibility** (`Request → recipient · Waiting/Opened/Resolved/Declined`) + For You card clarity.
- Portal **preset review** (default-on for Session Room / Co-lab / Tasks where appropriate).

**Phase 4 — Attention external layer**
- Email **digest** (held step-5). Re-prioritized *up* for practitioners: they won't live in-app, so they need to know attention is waiting without polling. In-app legibility (Phase 3) proves first.

**Held / never:** global notification bell; MAIA-as-notification-center; push until in-app proven.

---

## §6 — Caveats

- Code-assessed, **not** device-verified. Kelly's device pass (open Studio → confirm labels unclipped → navigate to Co-lab → find For You → count taps) directly refines the **Discoverable** and **Mobile-ready** columns.
- "Wired" = real API/DB calls found in code; runtime correctness not exercised here.
- "Practitioner-ready" is the synthesis (needs Exists+Wired+Discoverable+Mobile all holding) — most surfaces fail on Discoverable or Mobile, *not* on whether they were built.
