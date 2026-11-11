---
room: Sound Field
human_activity: choosing a sound field, beginning member-started Reader narration, or holding a member-directed focus session and carrying that governed auditory or attentional field through Soullab while remaining free to pause, stop, leave, retune, or continue without surrendering control or collapsing distinct rooms into one music application.
surfaces:
  - app/layout.tsx
  - app/listen/ListenRoom.tsx
  - app/listen/LocalAudioDesk.tsx
  - app/maia/community/elemental-alchemy/page.tsx
  - app/maia/community/elemental-alchemy/reader/page.tsx
  - components/listening/AuthenticatedListeningBoundary.tsx
  - components/listening/PersistentListeningProvider.tsx
  - components/listening/FocusFieldDesk.tsx
  - components/reader/AudioControls.tsx
  - components/reader/AudiobookReader.tsx
  - components/reader/ReflectionDrawer.tsx
  - lib/listening/focusFieldSession.ts
  - lib/listening/focusFieldGuide.ts
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — continuity may cross rooms without erasing the purpose or character of any room
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — the House holds coherence while each room remains itself
  - MAIA_OATH — sound never impersonates MAIA, starts itself, or overrides the member's explicit intent
  - SOULLAB_THEME — the persistent listening control remains subordinate, restrained, legible, and materially honest
reference_surfaces:
  - app/listen/ListenRoom.tsx
  - components/listening/PersistentListeningProvider.tsx
  - components/listening/FocusFieldDesk.tsx
  - lib/listening/focusFieldSession.ts
  - docs/design/contracts/house-room.md
  - docs/design/contracts/maia-room.md
  - docs/design/contracts/flagship-studio.md
shared_with_house: verified member/session truth, restrained hierarchy, explicit choice, clear leaving and returning, and one coherent field across approved destinations.
distinct_to_room: the Sound Field is member-held auditory continuity. Other rooms do not become music interfaces; the dock appears only after an explicit listening gesture, never reads room content, never interprets the member, and never lets MAIA, memory, or navigation silently reshape the sound.
screenshot_desktop: docs/design/contracts/screenshots/sound-field-focus-field-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/sound-field-focus-field-mobile.png
experience_verification: 2026-10-26 actual Next 16.3.8 + Chromium + fictional PostgreSQL acceptance on the existing authenticated Sound Field. LISTEN-49 passed 21 of 21 checks: Guide Me and Browse were both available; the visible Activate/High/Administration choices transparently suggested Rhythmic; starting a session started no audio; the timer persisted through real Writer’s Studio client navigation; MAIA and real Reader narration paused the session without automatic resume; a fresh member act resumed it; musical world and stimulation retuned without resetting task or clock; Stop was terminal; bounded feedback remained in memory; verified A→B member change cleared the private session; zero external requests and zero page errors occurred. This is additive to LISTEN-47’s separate 21-of-21 Reader/music shared-output acceptance. Desktop and mobile screenshots show the actual Guide Me surface at two viewports, not licensed channels, final music, native-device behavior, artist rights, production, or release acceptance.
---

# Sound Field — Experience Contract

## What this room is for

The Sound Field lets a member begin a chosen listening experience and carry it quietly through approved parts of Soullab. The field belongs to the member's attention, not to the route currently on screen. It should support focus, reflection, creativity, rest, grief, contemplation, and return without prescribing an outcome or converting every destination into a player.

This contract governs the root admission boundary and the persistent listening presence only. It does not define music rights, artist agreements, sound design, the final Sound Sanctuary catalogue, native-device behavior, Cabin identity, or production release.

## Arrival

The boundary adds no new arrival message and no new application shell. The member enters through the existing Listening Room. Sound begins only through an explicit listening gesture. Focus Field begins only through a separate explicit session gesture and initially starts a private clock—not audio. Only an active member-held sound or focus session may place its restrained dock across another approved room.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Begin a sound study | Existing Listening Room language | Sound begins only after member action; no ambient autoplay or inferred desire. |
| Start focus session | `Start focus session` | Starts a private timer and chosen attention frame only. It does not start music or claim a channel. |
| Pause | `Pause` / `Pause session` | Temporarily quiets sound or pauses the focus clock without pretending the experience has ended. |
| Resume | `Resume by my action` | Makes the fresh member act explicit after MAIA, Reader, device, route, or voluntary interruption. |
| Retune | Musical world and stimulation selectors | Changes the member's chosen support without resetting task or clock and without inspecting the work. |
| Stop | `Stop` / `Stop session` | Ends and clears the field or session; this is the unambiguous sovereignty gesture. |
| Move to another approved room | Existing House and room navigation | Navigation remains navigation. The field follows without making the destination speak or behave like Sound Sanctuary. |
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

## Focus Field session foundation

Focus Field is a member-directed way to hold a work session inside this same Sound Field. It keeps task kind, focus need, musical world, stimulation, and duration as separate choices. Classical, Ambient, Cinematic, Electronic, Organic, Nature, and Rhythmic are preferences—not channels, tracks, or rights grants. Arrive, Steady, Deep, Activate, Create, and Reset describe the kind of support requested today, not a fixed brain type.

The pure session model does not play audio, select a recording, inspect work, or score productivity. It starts only through member action. Reader, MAIA, protected live audio, device interruption, route interruption, or error may pause it; every resume requires another member act. Session end, member switch, rights revocation, or source unavailability stops it. Changing musical world or stimulation preserves the task and timer.

The current interface offers two doors. **Guide Me** uses only the task, focus need, and stimulation visible in the current unsaved form. Its deterministic table declares `current-visible-choices-only`, exposes a primary suggestion plus alternatives, and lets the member replace any result. It has no profile, history, learned weights, provider model, analytics, or hidden state. **Browse** lets the member select the musical world directly. Neither door starts sound. Classical, Ambient, Cinematic, Downtempo/Electronic, Organic/Acoustic, Nature-integrated, and Rhythmic/Percussive remain musical-world preferences until independently rights-cleared channels are admitted.

Private feedback is optional and bounded to Helped, Neutral, or Distracting plus a small set of member-chosen observations. In LISTEN-49 it remains in the authenticated provider's memory only; no server or browser persistence is added. A later saved combination may keep broad preferences but must exclude the task label, session history, identity, credentials, and audio metadata. It does not become global MAIA memory automatically.

`FOCUS_SESSION_MEDIA_AUTHORITY` remains `none`. Every playable focus channel must later pass independent identity, entitlement, media-rights, source, and output-lease gates.

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

The desktop and mobile screenshots are from the actual LISTEN-49 Next/Chromium review candidate with a fictional authenticated PostgreSQL member. They show the Guide Me form, independent focus-need and musical-world structure, transparent suggestion, and responsive layout. They are not claims about licensed channels, final visual polish, iPhone behavior, or the integrated production application.

The LISTEN-47 Chromium/PostgreSQL witness passed twenty-one Reader/music authority checks. The later LISTEN-49 witness passed twenty-one Focus Field checks on the same admitted boundary: explicit no-audio start, Guide Me/Browse, cross-room timer continuity, MAIA and Reader pause, no automatic resume, explicit retune/Stop, private in-memory feedback, verified-member clearing, zero external network, and zero page errors. These are browser review results only.

## LISTEN-50 · First Eight Focus Channel Gate

The Focus Field catalog begins with eight production briefs: Deep Classical, Piano Concentration, Ambient Stillness, Cinematic Momentum, Organic Attention, Downtempo Flow, Nature Current, and High-Stimulation Focus.

Their names and creative briefs are not playback authority. Every initial entry is unplayable, contains no media URL, and requires independently verified master, composition, performer, sample, territory, term, on-demand, timed-session, cross-route, background, mobile, editing/looping, credit, and revocation receipts. Even a structurally complete package remains blocked pending the independent media authority.

No download, offline Cabin, public broadcast, shared session, unbounded remix, stem isolation, AI analysis, model training, or voice imitation is included in this gate. The 48-second synthetic review studies are not channel masters.
