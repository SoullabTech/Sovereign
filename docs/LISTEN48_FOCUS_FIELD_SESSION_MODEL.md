# LISTEN-48 — Focus Field Session Model

**Status:** review-only session foundation · no audio catalog · no production enablement

**Owner:** LISTEN-01 #1979

**Supporting audio authority:** AUDIO-PLATFORM-01 #1984

**Base:** existing Listening review line after LISTEN-47 Reader admission

## Purpose

Focus Field gives a member a simple way to begin and hold a work session while choosing the kind of attention and music that fits today. It is part of the existing Sound Field—not a separate productivity application, player, recommendation authority, memory system, or release lane.

The first milestone is deliberately pure and media-agnostic. It models the session before the Guide Me/Browse interface or any focus catalog is connected.

## Member choices

### Task

- Writing
- Reading
- Coding
- Studying
- Administration
- Creative work
- Thinking
- Open work

An optional short task label may help the member orient, but it is not inspected, scored, interpreted, or retained in a saved combination.

### Focus need

- **Arrive** — settle sensory noise and begin
- **Steady** — maintain ordinary sustained attention
- **Deep** — support long-form concentration
- **Activate** — add energy when quietness is under-stimulating
- **Create** — support associative and generative work
- **Reset** — provide a short recovery interval

Focus need and musical taste remain independent. A member can choose Deep Classical today, Deep Ambient tomorrow, or Cinematic Activate without being assigned a fixed “brain type.”

### Musical world

- Classical
- Ambient
- Cinematic
- Electronic
- Organic
- Nature
- Rhythmic

These are session preferences, not rights grants, channel IDs, playlists, or promises that media exists. The later catalog gate must separately establish playable, rights-cleared sources.

### Stimulation

- Low
- Medium
- High

### Duration

- 25 minutes
- 50 minutes
- 90 minutes
- Custom: 5–240 whole minutes
- Untimed

### Entry

- Guide Me
- Browse

This field records how the member arrived. It does not implement the later recommendation system.

## Lifecycle

A Focus Field session moves through:

`ready → running → paused → running → completed/stopped`

Rules:

1. A session starts only through an explicit member action.
2. Reader, MAIA, protected live audio, device interruption, route interruption, or playback error may pause the session.
3. Every pause requires a fresh member action before resuming.
4. Session end, member switch, rights revocation, or unavailable source stops the session rather than preserving hidden resumability.
5. Timed sessions complete only when elapsed time reaches the chosen duration.
6. Untimed sessions never complete themselves.
7. Changing focus need, musical world, or stimulation preserves the task and timer.
8. No transition starts, stops, or authorizes audio by itself.

## Feedback

After a completed or stopped session, the member may privately record:

- Helped
- Neutral
- Distracting

Optional bounded tags:

- Needed more energy
- Needed less movement
- Music became too noticeable
- This style worked well
- Session felt too short
- Session felt too long

Feedback is not a productivity score. It does not inspect pages, manuscripts, keystrokes, facial expression, physiology, or emotional state. It does not become global MAIA memory automatically.

## Saved combinations

A private saved combination may keep:

- broad task kind;
- focus need;
- musical world;
- stimulation;
- duration;
- a member-written combination name.

It deliberately excludes:

- the task label;
- elapsed time;
- interruption history;
- feedback;
- member ID or session credential;
- audio bytes, track IDs, URLs, or provider metadata.

## Media and rights boundary

`FOCUS_SESSION_MEDIA_AUTHORITY` is permanently `none` in this model.

The session model cannot authorize playback. A later playable channel must independently pass:

- verified member/session admission;
- current entitlement;
- master, composition, performer, sample, territory, and shaping rights;
- non-revoked and non-expired evidence;
- the existing exclusive output lease;
- Reader and MAIA interruption rules;
- device/runtime acceptance.

A selection such as “Deep · Cinematic · High” expresses preference only. It does not identify or license a recording.

## Privacy and dignity

Forbidden in this milestone:

- page-content surveillance;
- manuscript, journal, chart, or MAIA-conversation inspection;
- keystroke or app-activity monitoring;
- inferred productivity;
- diagnostic ADHD or nervous-system typing;
- biometric or facial inference;
- automatic soundtrack restart;
- background conversion of feedback into global memory;
- a recommendation presented as knowledge of the member’s brain.

## Relationship to the Sound Field

Focus Field uses the already-admitted persistent music transport. It does not add another player or output coordinator.

The established priority remains:

`MAIA/protected voice → Reader narration → persistent music`

If Reader or MAIA interrupts a focus session, the session pauses and music remains paused until the member deliberately resumes.

## Acceptance for this gate

The pure model must prove:

- exact founder-ratified taxonomies;
- bounded preset, custom, and untimed duration;
- explicit start and explicit member resume;
- Reader/MAIA interruption without automatic resume;
- truthful elapsed/remaining time;
- world/stimulation changes preserve task and timer;
- authority-loss transitions stop;
- feedback only after completion/stop;
- saved combinations exclude private task text and session history;
- no network, storage, audio, identity, biometric, or timer side effects;
- no media or rights authority.

## Next interface gate

After this model is accepted, build the **Guide Me / Browse** interface against it:

1. ask only the task, duration, focus need, and desired stimulation;
2. suggest without diagnosing;
3. let the member freely revise the suggestion;
4. let musical worlds change without resetting the work session;
5. show one restrained persistent session control;
6. preserve explicit Stop and no automatic resume.

The first eight rights-cleared channels remain a separate subsequent media-production gate. Organic Current + Open Water remains a distinct artist-authorized creative work, not a substitute for the full Focus Field catalog.
