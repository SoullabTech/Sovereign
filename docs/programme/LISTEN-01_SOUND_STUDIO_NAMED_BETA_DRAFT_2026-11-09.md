# LISTEN-01 · Sound Studio named beta — reviewer guide, confidentiality note and operator runbook

**Status: DRAFT for founder approval.** Owner lane: LISTEN-01 (#1979). Founder direction 2026-11-09: open the
dark-launched Sound Studio to a named group of about five reviewers for professional review and insight.

This document authorizes nothing on its own. The cohort is opened only by the operator steps in Part C, after
PR #2199 is merged and deployed. It is not a public release, a member release or an iOS release.

---

## Part A — Reviewer guide (to send to each reviewer)

### What you are reviewing

Sound Studio is Soullab's listening room: original, long-form sound fields for arriving, focusing, resting and
sleeping. You have early access as one of a small group of reviewers. Nothing here is finished, and your candid,
professional judgment is the point.

**Five works are open to you:**

| Work | Length | What it is |
|---|---|---|
| Open Ground | 6 min | An original procedural drone composition (432 Hz reference, no beat) |
| Night Ground 01 — Guided Arrival | 12 min | Music with a synthetic guiding voice ("Bella") |
| Night Ground 01 — Nicole First Night | ~109 min (two parts) | Music with a synthetic voice ("Nicole") for a first night |
| Night Ground 01 — Extended Night | until you stop | Nicole once, then the music core continues until Stop |
| Night Ground 01 — Music Only | ~109 min (two parts) | The music alone, no voice |

Both voices are synthetic, rendered locally. No human performer is recorded.

### How to get in

1. Sign in at soullab.life with your Soullab account.
2. Go to **soullab.life/listen**. If you see "not found", tell us: your account may not be on the list yet.
3. A web browser on a computer is the best first experience (Chrome, Safari, Firefox, Edge). iPhone in the
   browser works, but some phone behaviours (AirPlay, Bluetooth switching, lock-screen controls) are still under
   test. The iOS app does not yet play these works.

### What we would love you to listen for

Please use headphones or good speakers at a comfortable level, and take breaks. Then, for each work you try, a few
lines on each of these is ideal:

1. **First impression.** What did you hear and feel in the first two minutes?
2. **Craft.** Mix, level, tone, dynamics, voice placement, edits, the loop or ending. Anything that sounds wrong?
3. **Arc.** Does the piece move well through its passages? Where did your attention drift or return?
4. **Purpose.** Does it suit what it says it is for (arrival, focus, rest, sleep)? Would you use it for that?
5. **The room.** Was it clear how to start, pause, stop, and leave? Anything confusing or in the way?
6. **One change.** If you could change one thing, what would it be?

**Two things we are not asking for:** we are not asking whether the sound "works" on your brain or health, and
we make no such claim. We are asking for your experience and your professional ear.

### How to send feedback

- **In the app:** the bug-report button (bottom corner) for anything broken. Say which work and roughly where.
- **Your review:** reply to the invitation email with your notes, in any form. A voice memo is welcome.

### Safety

Listen at a comfortable volume. Do not use the sleep works while driving or doing anything that needs your full
attention. Stop if anything feels unpleasant.

---

## Part B — Confidentiality and feedback note (DRAFT — needs founder approval; not legal advice)

> Thank you for reviewing Sound Studio before anyone else hears it.
>
> **Please keep it private.** The works, the room and anything you learn about unreleased Soullab plans are
> confidential. Please do not record, download, share, post or describe them publicly until Soullab releases them.
>
> **Your feedback.** You are free to say as much or as little as you like. Soullab may use your feedback to
> improve Sound Studio, without owing you anything for it. We will not quote you or name you publicly without
> asking you first.
>
> **No obligation.** You can stop at any time, and we can end early access at any time.
>
> **Your data.** We see that you used Sound Studio as part of normal site operation. We do not record what you
> listened to for any other purpose, and we do not train any model on your listening or your feedback.

⚠️ Before sending: confirm the last paragraph matches what the system actually does (it is written from the
design intent, not from a runtime audit). Counsel review is advisable if any reviewer is acting professionally
under contract.

---

## Part C — Operator runbook (founder or operator; production)

Preconditions:
1. PR #2199 merged into `clean-main-no-secrets` and deployed by its SHA (flag still off).
2. Dark-launch witness on production: `/listen` → 404; every `/media/sound-studio/...` URL → 404, signed in and not.

To open the beta:
1. **Collect the five reviewers' Soullab member ids.** Each reviewer needs an account. The founder supplies the
   ids (do not infer identities from member data).
2. **Set the cohort** in the production env on minisforum, next to `FOUNDER_MEMBER_IDS`:
   `SOULLAB_LISTEN_BETA_MEMBER_IDS=<uuid>,<uuid>,...`
3. **Turn the flag on:** `SOULLAB_LISTEN_REVIEW_ENABLED=1`. Recreate the container through the deploy lane, not a
   bare `docker compose up` (see CLAUDE.md, deploy lane lock).
4. **Witness, before any invitation:**
   - a founder session: `/listen` renders; each audio URL streams (206 with a Range header);
   - a fictional or non-cohort member session: `/listen` → 404; audio → 404;
   - signed out: audio → 401; `/listen` redirects to sign-in;
   - the Co-Lab release gate in the container: `docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'` → **0 failed**.
5. **Invite** with Part A, and Part B once approved.

To withdraw a work from reviewers: remove it from `SOUND_STUDIO_BETA_RELEASED` in
`lib/listening/soundStudioMediaGate.ts` and deploy. The room does not yet hide a withdrawn work, so its card
would remain and fail to play; hiding it needs a small UI change.

To close the beta: unset `SOULLAB_LISTEN_REVIEW_ENABLED` (everything returns to 404) or empty the cohort list.

### Known limits for this beta

- **iOS app:** the app does not bundle these works and has no gated remote path yet, so reviewers should use a
  browser. iPhone Safari playback is untested for this route.
- **Persistent player:** with the flag on, the root-layout listening boundary may mount for any signed-in member
  on listening routes, but members outside the cohort cannot open the room or load any audio.
- **Native "Play with your music" mix:** not included.
- **Rights:** all five works are founder-declared original, and their voices are synthetic. Independent rights
  review and release authority remain open for any release beyond this named beta.

## Operator note — 2026-11-12 (first named reviewer; same-SHA redeploy trap)

- Review fixes F4 (Sanctuary refusal) and F6 (consent v2, theme synthesis) shipped in #2245 and are live on `9d99abf99`.
- First named reviewer added to `SOULLAB_LISTEN_BETA_MEMBER_IDS` in `.env.production` on minisforum (one member id; no ids are recorded in the repo).
- ⚠️ The env file is read only when the container is created, so an env-only change needs a cutover. **Do not re-`prepare-maia` the SHA that is already running**: it re-points `maia-sovereign:<sha>` at a new image, and `cutover-maia` then refuses with "Exact rollback artifact … is no longer restorable". Cut over a new SHA instead (any new commit on `clean-main-no-secrets`).
