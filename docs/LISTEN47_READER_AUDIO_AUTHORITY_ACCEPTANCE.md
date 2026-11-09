# LISTEN-47 — Reader identity and shared audio authority

**Status:** review candidate · browser/fictional-member acceptance PASS · production HOLD
**Parent review-line SHA:** `660e10697ff9f12e7837b4ee9f1dc132d1169a50`
**Owner:** LISTEN-01 #1979 · supporting authority AUDIO-PLATFORM-01 #1984

## Purpose

Admit the existing Elemental Alchemy Reader to the existing persistent Sound Field without creating a second player, identity source, audio coordinator, application, or release process.

Reader narration is member-started and higher priority than persistent music. MAIA voice remains higher priority than Reader. None of these transitions automatically resumes previously paused sound.

## Implemented boundary

- Reader obtains lifecycle identity from the canonical `/api/members/session` receipt.
- Global identity healing now verifies `/api/members/me` with the credential only and repairs stale `memberId`/explorer cache keys from server truth.
- Web authentication uses the httpOnly session cookie; the existing Safari/Capacitor credential path may send `x-session-token`.
- Browser-stored member IDs and bare identity headers are never attached as authority.
- `/api/members/me`, Reader moments, and Reader/MAIA reflection APIs now have exact authenticated access-matrix rules; their handlers still independently derive identity from the credential.
- Reader owns one explicit `reader-narration` Web Lock lease before playback starts.
- Reader narration may preempt persistent music; persistent music may not preempt active Reader narration.
- MAIA speech and protected Writer/external focus may pause Reader.
- Pause, Stop, ended, playback error, route disposal, session end, verified member switch, revoked session, and authentication failure release Reader output.
- No transition silently restarts music. A new member act is required.
- Reader is now part of the approved browser route family rather than a hidden exception.
- The existing Elemental Alchemy hub contains one deliberate **Read & Listen** entry.

## Defects found during acceptance

1. **Stale browser member claim contaminated a valid cookie session.** The general client fetch helper and global identity healer attached `x-member-id` from browser storage. The server correctly refused the mismatch. Reader, the root Listening boundary, and identity healing now use credential-only requests; the healer repairs stale cache keys from server truth instead of falsely demanding reauthentication.
2. **Fast-click fallback race.** `/listen` could render its play surface before the root transport had completed session verification. A rapid member click could hit the standalone fallback and disappear during provider mount. Root mode now exposes explicit `checking/ready/denied/unavailable` state, disables audio controls until verified, and never invokes the standalone player during root-session resolution.
3. **Background-tab witness polling.** The first witness used requestAnimationFrame polling in the background music tab. The app had correctly suspended its AudioContext, but the observer stopped polling. The published witness uses interval polling and preserves the failed run as evidence history.
4. **Member-switch remount observation.** The root transport intentionally unmounts between verified members. The witness now proves both phases: old output retires, then the new verified member's Reader remounts idle.

## Acceptance results

### Exact browser / PostgreSQL witness

`tests/listening/listen47_reader_audio_authority_browser_witness.cjs`

**21/21 PASS**, with zero page errors and zero external requests:

- delayed session receipt keeps the fast-click play surface disabled;
- verified receipt enables one play surface;
- Sound Field starts one output;
- Reader route is admitted in strict mode;
- browser member identity cannot override the verified cookie member;
- Reader private requests carry no bare member header;
- Reader narration preempts Sound Field music;
- music cannot preempt active Reader narration;
- Reader Pause releases output without music auto-resume;
- a fresh member act resumes music;
- MAIA focus pauses Reader without resuming music;
- explicit Reader Stop resets position;
- verified A→B switch retires A output;
- verified B remounts Reader idle;
- PostgreSQL revocation stops Reader and clears the private surface;
- anonymous Reader route redirects to sign-in;
- anonymous Reader API returns 401.

The witness requires only a disposable fictional Next/PostgreSQL fixture and a fictional local WAV. Its base URL, database URL, audio path, evidence directory, fictional session tokens, and fictional member UUIDs are environment parameters. The reproducible database fixture is `tests/listening/fixtures/listen47_reader_audio_authority.sql`.

### Source and inherited tests

- focused Reader/boundary/audio tests: **30/30 PASS**;
- rights, backup, and receptive-field tests under the documented TS loader: **52/52 PASS**;
- Listening page authentication: **4/4 PASS**;
- Listening source integrity: **25/25 PASS**;
- focused TypeScript check of all changed runtime files: **PASS**;
- `git diff --check`: **PASS**.

## Non-claims and remaining holds

This result does **not** establish:

- production deployment or feature enablement;
- real Safari/iPhone background and lock-screen behavior;
- native Capacitor, JARVIS/Electron, or Cabin/offline audio authority;
- licensed music, an artist-authorized master, or Organic Current + Open Water A+B acceptance;
- full production database migration/image acceptance;
- independent privacy/security/recovery review;
- beta or public release.

The Sound Field remains disabled by default. Artist rights, A+B creative acceptance, mobile/native qualification, privacy/recovery, beta, and production release remain separate gates.
