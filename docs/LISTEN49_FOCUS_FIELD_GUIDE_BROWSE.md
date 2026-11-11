# LISTEN-49 — Focus Field Guide Me / Browse interface

**Status:** review candidate only. This continues LISTEN-01 on the existing Listening review line. It is not a new app, player, recommendation service, identity system, memory system, catalog or release process.

## Purpose

Bring the founder-ratified Focus Field session model into the existing Listening Room through two doors:

- **Guide Me** uses only task, focus need and stimulation selected in the current form to offer a transparent, revisable musical-world suggestion.
- **Browse** lets the member choose focus need and musical world directly.

The interface starts and carries an in-memory work-session clock. It does not start music automatically and does not grant access to any track, channel or recording.

## Member choices

Tasks: Writing, Reading, Coding, Studying, Administration, Creative Work, Thinking and Open Work.

Focus needs: Arrive, Steady, Deep, Activate, Create and Reset.

Musical worlds: Classical, Ambient, Cinematic, Downtempo/Electronic, Organic/Acoustic, Nature-integrated and Rhythmic/Percussive.

Stimulation: Low, Medium and High.

Durations: 25, 50, 90, custom 5–240 minutes or untimed.

## Runtime contract

The session lives only in the already authenticated root Listening provider and therefore can remain present across approved Soullab routes. No browser or server persistence is added.

- Start is an explicit member action.
- Pause and every Reader/MAIA/output interruption require a fresh member resume action.
- Stop is explicit and terminal.
- Timer completion pauses existing music; it never starts or restarts music.
- Changing focus need, musical world or stimulation preserves task and timer.
- Session end or member change clears the in-memory session.
- Feedback is bounded to helped / neutral / distracting plus up to four explicit tags.
- Feedback is not productivity scoring and is not MAIA memory.

## Transparent suggestion rule

`focusFieldGuide.ts` is a small deterministic scoring table. It has no profile, history, learned weights, model/provider, analytics, work inspection or hidden state. Its output declares `inputAuthority: current-visible-choices-only`. The member can ignore or replace every suggestion.

## Explicit non-claims

This candidate does not provide:

- a licensed or playable focus channel;
- rights, entitlement, media URLs or a streaming provider;
- automatic audio start;
- Focus Memory or saved-combination persistence;
- productivity measurement, ADHD diagnosis or listener typing;
- Safari/iPhone/background/lock-screen qualification;
- beta, production enablement, deployment or release.

The next separate gate is rights-cleared focus-channel production and binding admitted media to the existing shared audio authority.
