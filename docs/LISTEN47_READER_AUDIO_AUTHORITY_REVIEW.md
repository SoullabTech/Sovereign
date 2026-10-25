# LISTEN-47 — Reader identity and shared audio authority review

**Date:** 2026-10-25 ET
**Owner:** LISTEN-01 (#1979)
**Supporting authority:** AUDIO-PLATFORM-01 (#1984)
**Base:** `review/listen-03-native-20261024` at `660e10697ff9f12e7837b4ee9f1dc132d1169a50`
**Disposition:** review candidate only; production and release remain held.

## Purpose

Admit the existing Elemental Alchemy Reader to the same browser-web member/session and audio-output authority already accepted for the Sound Field. This act does not create another player, shell, identity lane, model lane, source owner, or release process.

## Source changes

- Reader identity is consumed from the existing `/api/members/session` receipt through `AuthenticatedListeningBoundary`; local storage and caller-supplied member headers are removed.
- Reader narration acquires `soullab:exclusive-audio-output:v1` before playback.
- Priority is explicit: protected/MAIA speech → Reader narration → ambient music.
- Reader Pause, Stop, ended, error, route exit, member change, session end, revocation and expiry release output.
- Failed Reader start never restores prior music automatically.
- Persistent music remains behind `SOULLAB_LISTEN_REVIEW_ENABLED`; Reader session verification and narration authority do not depend on that flag.
- `/maia/community/elemental-alchemy/reader`, `/api/reader/moments`, and `/api/reader/ask` receive exact authenticated access rules.
- Reader manifests may carry real segment UUIDs; moments are validated, member-owned, and presented in the UI's camel-case contract.
- Listening Room exposes one explicit Next `Link` doorway to the existing Reader.

## Exact-source evidence

### Source and policy

- Reader/boundary/access/output contract: **21/21 PASS**
- inherited Listening source integrity: **25/25 PASS**
- inherited MAIA speech-lease suite: **5/5 PASS**
- focused changed-file TypeScript scan: **no LISTEN-47 file errors**; the broader repository still reports its existing unrelated baseline errors, so no repository-wide typecheck claim is made.

### Real Next/Chrome journey — review transport enabled

Using Next `16.3.8`, Node `v22.22.3`, system Chrome, strict access mode, a disposable fictional PostgreSQL clone, and synthetic local WAV/manifest fixtures: **31/31 PASS**.

The journey proves:

- authenticated Listening → Reader App Router continuity;
- current music remains active until Reader is explicitly started;
- Reader acquires the shared output lock and pauses music;
- music cannot preempt Reader;
- Stop and route exit release Reader without restarting music;
- Reader refuses while a protected output lock is held;
- a fresh member act starts playback after release;
- MAIA focus pauses Reader and does not restart music;
- a second Reader tab preempts the first; closing it does not restart the first;
- one fictional member can save and reopen a highlight;
- a second fictional member sees no first-member moment;
- member switch, revoked session and expired session close or withhold Reader output;
- zero external network requests and zero page errors.

### Review transport disabled

With `SOULLAB_LISTEN_REVIEW_ENABLED=0`: **8/8 PASS**.

Anonymous Reader page/API access is refused. An authenticated browser member receives a verified Reader receipt, no persistent music dock mounts, Reader still acquires and releases the shared output lock, and no external request or page error occurs.

## Evidence custody

Evidence is stored outside source at:

`/Volumes/T7 Shield/soullab-content/LISTEN47-READER-AUDIO-AUTHORITY-20261025`

Primary artifacts:

- `listen47-reader-browser-witness.cjs`
- `listen47-reader-browser-result.json`
- `listen47-reader-review-flag-off-witness.cjs`
- `listen47-reader-review-flag-off-result.json`
- `LISTEN47_reader_narration_authority.png`

The browser audio and book content are fictional local fixtures. No commercial master, artist stem, member account, production database, external model, provider spend, or deployment was used.

## Explicit limits

- browser web and cookie-authenticated review only;
- Safari/iOS header-token transport not admitted;
- native wrappers, JARVIS/Electron and Cabin/offline not admitted;
- no lock-screen/background-media qualification;
- Ask MAIA authenticated boundary and source validation are covered, but no live model call was made;
- no artist-authorized Organic Current + Open Water master or shaping rights;
- no beta, production flag, deployment, signing, or release authorization.

## Next gate

The next independent gate remains the creator-authorized Organic Current + Open Water A+B composition: exact source/master custody, rights, permitted shaping, Restore Artist Original, and founder/artist felt acceptance. Reader/native qualifications remain separate from that creative gate.
