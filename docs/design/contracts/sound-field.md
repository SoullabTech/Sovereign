---
room: Sound Field
human_activity: choosing a sound field or member-started Reader narration and carrying one governed audio experience through Soullab while remaining free to pause, stop, leave, or continue without surrendering control or collapsing distinct rooms into one music application.
surfaces:
  - app/layout.tsx
  - app/listen/ListenRoom.tsx
  - app/listen/LocalAudioDesk.tsx
  - app/maia/community/elemental-alchemy/page.tsx
  - app/maia/community/elemental-alchemy/reader/page.tsx
  - components/listening/AuthenticatedListeningBoundary.tsx
  - components/listening/PersistentListeningProvider.tsx
  - components/reader/AudioControls.tsx
  - components/reader/AudiobookReader.tsx
  - components/reader/ReflectionDrawer.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — continuity may cross rooms without erasing the purpose or character of any room
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — the House holds coherence while each room remains itself
  - MAIA_OATH — sound never impersonates MAIA, starts itself, or overrides the member's explicit intent
  - SOULLAB_THEME — the persistent listening control remains subordinate, restrained, legible, and materially honest
reference_surfaces:
  - app/listen/ListenRoom.tsx
  - components/listening/PersistentListeningProvider.tsx
  - docs/design/contracts/house-room.md
  - docs/design/contracts/maia-room.md
  - docs/design/contracts/flagship-studio.md
shared_with_house: verified member/session truth, restrained hierarchy, explicit choice, clear leaving and returning, and one coherent field across approved destinations.
distinct_to_room: the Sound Field is member-held auditory continuity. Other rooms do not become music interfaces; the dock appears only after an explicit listening gesture, never reads room content, never interprets the member, and never lets MAIA, memory, or navigation silently reshape the sound.
screenshot_desktop: docs/design/contracts/screenshots/sound-field-persistent-listening-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/sound-field-persistent-listening-mobile.png
experience_verification: 2026-10-26 Chromium + fictional PostgreSQL acceptance using the actual root boundary, Sound Field transport, Elemental Alchemy Reader, and shared output lease. Twenty-one of twenty-one checks passed. A deliberately delayed first session receipt kept every root audio start surface disabled until verified; Reader narration preempted music, music could not preempt Reader, MAIA paused Reader, Pause/Stop/ended/error and verified member/session transitions released output, revoked and anonymous sessions failed closed, and no sound resumed automatically. Zero external requests and zero page errors occurred. The existing screenshots remain bounded persistent-field references; they are not claims of final Reader visual polish, native-device behavior, artist rights, production, or release acceptance.
---

# Sound Field — Experience Contract

## What this room is for

The Sound Field lets a member begin a chosen listening experience and carry it quietly through approved parts of Soullab. The field belongs to the member's attention, not to the route currently on screen. It should support focus, reflection, creativity, rest, grief, contemplation, and return without prescribing an outcome or converting every destination into a player.

This contract governs the root admission boundary and the persistent listening presence only. It does not define music rights, artist agreements, sound design, the final Sound Sanctuary catalogue, native-device behavior, Cabin identity, or production release.

## Arrival

The boundary adds no new arrival message and no new application shell. The member enters through the existing Listening Room and begins sound through an explicit gesture. Only then may the persistent dock accompany them to another approved room.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Begin a sound study | Existing Listening Room language | Sound begins only after member action; no ambient autoplay or inferred desire. |
| Pause | `Pause` | Temporarily quiets the member's chosen field without pretending it has ended. |
| Stop | `Stop` | Ends and clears the field; this is the unambiguous sovereignty gesture. |
| Move to another approved room | Existing House and room navigation | Navigation remains navigation. The sound follows without making the destination speak or behave like Sound Sanctuary. |
| Return to Listening | Existing return path | The member may return to shape or replace the field without losing authorship of the choice. |

## Route and identity boundary

The browser-first candidate mounts one transport only for a server-verified member on the approved online route families:

- Listening;
- House and Home;
- MAIA;
- Writer's Studio;
- Journal;
- Astrology;
- the Elemental Alchemy Reader.

The strict application access matrix admits exactly `/listen`, `/api/members/session`, `/api/members/me`, `/api/members/signout`, `/api/reader/moments`, and `/api/reader/ask` at the authenticated outer boundary. It grants no `/listen/*`, member-session, or Reader API wildcard. Reader handlers independently derive member ownership from the verified credential. The page remains disabled by default behind the existing review flag; the current-session receipt is the only identity seam consumed by this boundary, and the exact sign-out route must revoke that session rather than merely hide the player.

Public, sign-in, account, administrative, practitioner/live-session, Cabin, and unapproved routes receive no player and no private listening state. Browser strings, URLs, local storage, feature labels, and MAIA visibility are not identity evidence.

The browser client uses the httpOnly session cookie and may carry the established `x-session-token` credential in Safari/Capacitor contexts; it never attaches a browser-stored member ID as authority. Real Safari/iOS device behavior, native wrappers, JARVIS/Electron, and Cabin/offline remain separate qualifications. Reader is admitted only because its audiobook element now uses this verified session boundary and the shared output lease rather than inheriting authority implicitly.

## Audio relationship

The Sound Field and Reader are participants in one shared audio authority, never parallel authorities. MAIA speech and protected live sessions have highest priority; member-started Reader narration may preempt persistent music; music may not preempt active narration. A focus loss, member switch, session revocation, route disposal, Pause, Stop, end, or error releases output, but nothing automatically restarts earlier sound. Resume requires a fresh member act.

The field carries only its own playback state. It does not carry page text, Journal content, astrology data, manuscript material, MAIA conversation, developmental inference, or member memory into audio processing.

## Forbidden here

- sound or private player state on a public or signed-out route;
- automatic start or automatic restart;
- more than one persistent transport or simultaneously audible Reader/music output for the same member surface;
- identity inferred from local storage, a route parameter, or a bare member ID;
- a room's content silently altering music, density, rhythm, mood, or recommendation;
- MAIA interpreting what the member's listening “means” without an explicit encounter;
- replacing House, Writer's Studio, Journal, Astrology, or MAIA with a universal music shell;
- presenting a synthetic review sketch as artist-authorized finished music;
- treating browser acceptance as iPhone, Electron, Cabin, rights, beta, or production acceptance.

## The two brand tests

**Same house?** Yes. The boundary uses the same verified member reality, quiet field hierarchy, reversible gestures, and respect for distinct rooms that govern the House. The persistent dock is restrained and subordinate rather than promotional or dashboard-like.

**Distinct room?** Yes. Sound Field is the only experience whose primary human activity is carrying a chosen auditory field across other places. House orients, MAIA encounters, Writer's Studio develops Work, Journal holds reflection, and Astrology opens the chart. None of them becomes Sound Field merely because sound continues there.

## Evidence standing

The desktop and mobile screenshots are from an isolated fictional browser fixture built from the actual boundary and transport source. They demonstrate route persistence and the dock's presence at two viewports. They are not claims about final visual polish or the integrated production application.

The current Chromium/PostgreSQL witness passed twenty-one checks: the root play surface remained disabled during a deliberately delayed session receipt; verified readiness exposed one music transport; browser identity claims could not override the verified cookie member; Reader requests carried no bare member header; narration preempted music and held the exclusive lease; music could not preempt narration; Pause and MAIA focus released narration without music auto-resume; explicit Stop reset narration; verified A→B transition retired A and remounted B idle; PostgreSQL revocation cleared Reader; anonymous route/API access failed closed; zero external network and zero page errors occurred.
