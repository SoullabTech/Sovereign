# Practitioner Studio — Phase 1: Navigation & Discoverability Spec

- **Date**: 2026-06-06
- **Status**: PROPOSED · Designed-layer
- **Builds on**: `docs/architecture/PRACTITIONER_STUDIO_READINESS_AUDIT_2026-06-06.md`
- **Goal**: Define **what a practitioner sees on day one** — the IA that makes the (already-built) Studio legible. Phase 1 is discoverability, not new features.
- **Principle**: Surfacing, not building. Every surface referenced here already exists and is wired (per the audit). This spec moves them to where a practitioner instinctively looks.

> **The day-one test (Kelly):** a practitioner signs in, lands somewhere, and within seconds knows *what needs them, who's active, what's next, and what's waiting* — without being taught the nav.

---

## §1 — Day one, narrated

1. Practitioner signs in → lands on **Command Center** (`/studio`).
2. Command Center answers four questions immediately: **what needs attention · active clients · upcoming sessions · open requests.**
3. The **primary practice nav** is grouped and legible. Co-lab is a first-class entry with a live count when attention is waiting.
4. Tapping **Co-lab** opens its first room, **For You** — the attention queue — with Channels / DMs / Decisions alongside.
5. Deeper-practice tools (Session Room, etc.) live one layer down — present, not shouting.

That's the whole Phase 1 experience. Everything below specifies it concretely.

---

## §2 — Primary navigation IA

### The two tiers (resolving the dual-rail)
The audit found two nav systems side-by-side. They are **kept, but given distinct, legible jobs** — not merged (merging is a larger change; see §9 open decision):

- **Member rail** (the thin 56px `MaiaLeftRail`, far left): *"your MAIA field & worlds / return to center."* It is the **member** space switcher. In the practice context it recedes (calm) and is clearly *not* the practice nav.
- **Practice nav** (the Studio sidebar / mobile drawer): *"your practice."* This is where the practitioner lives day-to-day. **Grouped by the category metadata that already exists** (`moduleDefinitions.ts` `category`: core / clients / operations / tools / collaboration) but is currently never rendered.

### The grouped practice nav (day-one, generalist)
Render `getModulesByCategory()` with headers instead of a flat 13-item list:

```
CORE
  Command Center        ← landing
  MAIA                  (studio consult)
COLLABORATION
  Co-lab            ③   ← promoted to first-class, attention count rides here
CLIENTS
  Clients
  Client Portal
OPERATIONS
  Sessions
  Booking
  Tasks
TOOLS
  Vault
  … (Session Room, Media, etc. — present, lower)
SETTINGS
```

- **Co-lab promoted**: its own group near the top (Collaboration), first-class peer to Clients/Sessions — not buried, not portal-gated. (Also: add `teams` to the common portal presets — today it's only in `consultant`; see §7.)
- **Session Room stays one layer down** (strategically hidden) — in Tools/deeper, reachable but not competing with daily surfaces. *Correct hierarchy, per Kelly.*
- **Attention count** (`③`) renders on the **Co-lab** entry only — coordination-scoped, never a global bell (§6).

### Mobile
- Replace the 4 **hardcoded** bottom tabs with the practitioner's actual top destinations, and ensure **Co-lab (with badge)** is reachable in one tap (bottom tab or pinned), not only via the hamburger.
- The grouped drawer mirrors desktop (category headers).
- (Drawer clip already fixed + deployed, `ae9fafb9f`.)

---

## §3 — Command Center (the highest-leverage screen)

The landing must answer the four day-one questions, mobile-first. It is **already wired** (`useTriageItems`, `useAgentTasks`, `useDailyLog`) — the work is (a) compose the four answers, (b) fix the mobile layout.

Day-one Command Center sections:
1. **Needs attention** — triage queue (wired) + **open requests directed at me** (the attention loop, surfaced *here* too — its highest-visibility home).
2. **Active clients** — today's/this-week's active caseload.
3. **Upcoming sessions** — next few.
4. **Open loops** — quick count of For You / requests, linking into Co-lab.

**Mobile fix (blocking):** `app/studio/page.tsx:155,247` use `grid-cols-4` / `grid-cols-3` with no responsive prefix → overflow on a phone. Change to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (stack on mobile). This is the broken first impression; it ships in Phase 1.

> Surfacing open requests on Command Center is what makes attention *discoverable without a global notification system* — it lives on the screen the practitioner already lands on, and in Co-lab. Two contextual homes, zero ambient bell.

---

## §4 — Co-lab as the operational substrate

Co-lab is the daily coordination layer. Its internal IA (mostly already built — channels, DMs, `/team/decisions`, `/team/for-you`):

```
Co-lab
  For You      ← first room: requests/mentions directed at me (the attention queue)
  Channels
  DMs
  Decisions
```

- **For You is the landing room of Co-lab**, not a separate nav domain. Tapping Co-lab → For You by default when there's open attention; otherwise Co-lab home with For You one tap away.
- The **count badge** rides on the Co-lab entry (the rail/practice-nav item), reflecting open attention items. (`/api/team/attention` `openCount`, already built; today it's only on the buried For You link.)
- This keeps attention **contextual to Co-lab** — exactly the sovereignty-preserving shape (§6).

---

## §5 — Request legibility

A Request must communicate its loop state inline, on both the message and the For You card. The data already exists (`attention_items` + `getSenderAttentionStates`); this is presentation:

```
Request → Jondi · Waiting      (open, not yet opened)
Request → Jondi · Opened       (opened_at set, still open)
Request → Jondi · Resolved
Request → Jondi · Declined
```

- Sender sees `→ recipient · state` on their own Request messages (today it's tiny sender-only text after reload — make it legible).
- For You card shows requester, channel/source, excerpt, and state clearly (audit #4).
- "Waiting" is the human label for open-unopened (warmer than "Sent").

---

## §6 — Sovereignty (hold the line)

- **MAIA is never a notification center.** No global bell, no ambient app-wide alert.
- **Attention rides on Co-lab** (a coordination destination) — `Co-lab ③` means "Co-lab has something for you," scoped, dismissible by acting.
- Member rail (MAIA field) and practice nav (Studio) stay **legibly distinct** — the two-tier clarification must not turn the MAIA rail into a task surface.

---

## §7 — Build sequence (Kelly's order → concrete changes)

1. **Command Center mobile** — `app/studio/page.tsx` responsive grids + compose the 4 day-one sections (incl. open-requests).
2. **Group the practice nav** — render `getModulesByCategory()` with headers in `app/studio/layout.tsx` (desktop sidebar + mobile drawer), replacing the flat list.
3. **Promote Co-lab to first-class** — its own group near top; add `teams` to common portal presets (`moduleDefinitions.ts` `MODULE_PRESETS`).
4. **Attention count on Co-lab** — badge on the Co-lab nav entry (reuse `/api/team/attention` `openCount` + the `ForYouLink` polling pattern).
5. **For You inside Co-lab** — make For You Co-lab's first room; ensure it's reachable in ≤1 tap from the Co-lab entry; mobile reachability without deep hamburger nesting.
6. **Request legibility** — `Request → recipient · state` in `MessageBubble.tsx` + the For You card.

*Then (Phase 2+, out of this spec):* mobile polish per surface, Communications backend wiring, attention email digest.

---

## §8 — Out of scope (deferred)

- Communications real backend (mock inbox → email/SMS) — Phase 3.
- Attention email **digest** / push — Phase 4 (re-prioritized up for practitioners, but after in-app proves).
- Full dual-rail *merge* into a single nav — see §9.
- Per-surface mobile polish beyond Command Center — Phase 2.

---

## §9 — Open decisions for Kelly

1. **Dual-rail depth.** This spec *clarifies* the two tiers (member rail recedes; practice nav is primary + grouped). Your day-one example (`MAIA / Co-lab / Clients / Sessions / Booking / Vault` in one list) could also imply a *fuller merge* into a single primary nav. Clarify-two-tiers is lower-risk for the timeline; full-merge is cleaner but bigger. **Which?**
2. **Command Center widgets** — are the four sections (§3) the right four, or would you swap one (e.g., revenue/today's schedule)?
3. **Mobile bottom tabs** — which destinations earn a bottom-tab slot for a generalist? (Proposed: Command Center · Co-lab · Clients · Sessions.)
4. **Co-lab default-on** — confirm adding `teams` to generalist/therapy/clinician presets (not just consultant).
