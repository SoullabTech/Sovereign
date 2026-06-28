# MAIA Groups + Meetings — Architecture Sketch

**Status:** Design sketch. No code. 2026-06-27.
**Question it answers:** can a practitioner run a group meeting (Teams, Zoom, Jitsi, …) from inside MAIA — link-launch and/or auto-created? **Yes — and most of the substrate already exists.**

## Guiding principle (sovereignty)

**Provider-agnostic.** MAIA already supports **8 meeting providers** (`none, livekit, jitsi, zoom, google_meet, proton_meet, microsoft_teams, custom`). Teams is **one adapter**, not the center of gravity. MAIA *launches and orchestrates* meetings; it does not become a Microsoft app. Self-hostable (Jitsi, LiveKit) and privacy-respecting (Proton Meet) providers stay first-class defaults; Teams/Zoom/Meet are practitioner opt-ins. Don't build the architecture around Microsoft.

## What already exists (grounding)

- **Groups already store a meeting** — `client_groups` has `meeting_link`, `meeting_day`, `meeting_time`, `meeting_duration_minutes`, `meeting_location_type` (`database/migrations/20260202300001_client_groups.sql`). Level-1 link-launch is ~80% schema-ready.
- **Provider layer** — `rl_sessions.meeting_provider` (enum, 8 providers) + `meeting_url`; `lib/trust/` defines `MEETING_PROVIDERS`, `MeetingMeta` (passcode / waitingRoom / e2ee / **recordingConsent**), and `setSessionMeeting`/`getSessionMeeting`. **[BUILT, lightly wired]** — session-level today.
- **Microsoft Graph** — `lib/calendar/MicrosoftGraphService.ts` already does per-member OAuth (`getAuthUrl`/`exchangeCodeForTokens`/`refreshAccessToken`/`getValidAccessToken`/`isConnected`) + `listCalendars` + `createEvent`. **[LIVE for calendar]**. Teams meeting auto-create = `createEvent` with `isOnlineMeeting: true, onlineMeetingProvider: 'teamsForBusiness'` → Graph returns the Teams join URL. A *small* extension, not a new integration. **Confirmed feasible with the existing scope** — the OAuth already requests `Calendars.ReadWrite`, which permits this; **no re-consent.** One `createEvent` call creates the Teams meeting + calendar event + supports recurrence + attendees → covering *create meeting · store URL · schedule recurring · sync calendar · invite members* in a single call. (Add/remove participants = a follow-up PATCH on the event.)
- **Group members** — the practitioner contacts layer (`docs/specs/PRACTITIONER_CONTACTS_LAYER_2026-06-27.md`): a group's contacts/clients are the invitee list.

## Two integration levels

**Level 1 — Link-launch (provider-agnostic, mostly built).** A group / group-session stores `{ provider, meeting_url, meta }`; a "Start Meeting" button opens the URL (browser or native app). Works for ANY provider — paste a Teams/Zoom/Jitsi link. Zero external coupling. **Ships first.**

**Level 2 — Auto-create (per-provider adapter, opt-in).** MAIA generates the meeting + invites members. Implemented behind one interface so it stays provider-agnostic:

```ts
interface MeetingProviderAdapter {
  createMeeting(opts): Promise<{ url: string; meta?: MeetingMeta }>   // Level 2
  addParticipants?(...): Promise<void>
  removeParticipants?(...): Promise<void>
  attendance?(...): Promise<AttendanceRecord[]>
}
```
- **TeamsAdapter** → extend `MicrosoftGraphService.createEvent({ isOnlineMeeting: true, … })` (uses the practitioner's own Microsoft OAuth).
- **JitsiAdapter / LiveKitAdapter** → self-host; deterministic room URL / signed token; no external account. *(sovereignty default)*
- **ZoomAdapter / GoogleMeetAdapter** → their APIs. **ManualAdapter** → paste a link (Level 1).

## Core model

- **GroupSession** — a scheduled or instant meeting for a group: `{ group_id, scheduled_at, recurrence, provider, meeting_url, meta, created_by }`. Reuse `lib/trust` `MeetingMeta` and the `rl_sessions` provider pattern rather than inventing new fields.
- **Invitations** — invite group members (contacts/clients) via MAIA comms (existing) + optionally the provider invite (Graph attendees for Teams).
- **Attendance** — Level 1: join-token / self-report. Level 2: provider attendance (Graph attendance reports for Teams).
- **Recurring sessions** — recurrence rule on GroupSession; Level 2 syncs to the provider calendar (`createEvent` already exists).
- **AI-assisted facilitation** — *separate, later, consent-gated.* MAIA alongside a group session for notes/facilitation is gated by `recordingConsent` + Sanctuary + the non-manipulation vows. **MAIA never silently joins or records.**

## Sovereignty / governance

- Provider is the **practitioner's** choice; Teams requires **their** Microsoft OAuth (per-practitioner opt-in), never a platform-wide Microsoft dependency.
- Recording / AI-join is **consent-gated** (`MeetingMeta.recordingConsent`, Sanctuary, the vows). No silent recording.
- Minimal data to providers — only what's needed to invite, with consent. Member data stays in MAIA.

## Build order (if pursued)

1. **Level 1 for groups** — "Start Meeting" + provider picker on a group, using the existing `client_groups.meeting_link` + provider. Mostly UI + a thin API; substrate exists. *(sovereignty-safe, fastest value)*
2. `MeetingProviderAdapter` interface + **Manual / Jitsi / LiveKit** adapters (self-host first).
3. **TeamsAdapter** (extend `MicrosoftGraphService`, `isOnlineMeeting`) — Level 2, opt-in.
4. GroupSession scheduling + invitations (reuse comms + contacts layer).
5. Recurrence + calendar sync.
6. *(later, separate)* AI-assisted facilitation — consent-gated.

**Recommendation (updated per "Studio central to everything"):** Studio is the orchestration hub — meetings, groups, contacts, sessions all flow through it. Build the **Teams auto-create adapter** (Graph `createEvent` + `isOnlineMeeting`, reusing the existing `Calendars.ReadWrite` scope) as the first Level-2 provider; it delivers the full capability list (create · invite · recurring · calendar-sync · store URL) Studio-side, with no re-consent. Keep it **behind the `MeetingProviderAdapter` interface** so Jitsi/LiveKit/Zoom stay available and MAIA isn't Microsoft-locked (near-zero extra cost — Studio still owns orchestration, Teams is the provider it calls). Level 1 link-launch remains the universal fallback for any pasted link. Net: **Studio-central + full Teams auto-create, without lock-in.**
