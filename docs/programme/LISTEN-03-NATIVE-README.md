# Soullab Listening Room — Build 03 (native source candidate)

An **isolated, source-owner-review-only** Next.js App Router integration candidate. Not merged or deployed; does not connect Spotify/TIDAL account APIs or host commercial music.

- Proposed route: `app/listen/page.tsx` — requires `SOULLAB_LISTEN_REVIEW_ENABLED=1` **and** an authenticated Soullab member before rendering, default 404.
- UI: `app/listen/ListenRoom.tsx`, `app/listen/listen.module.css` — four moods, interactive low-level WebAudio sound studies, private in-memory metadata shelf and reflection, explicit export.
- Rights policy: `lib/listening/rightsPolicy.ts` — *server-only reference policy*, all missing/uncertain rights refused. Not a playable-media API and no license receipts from real artists.
- Portability: `lib/listening/portableCollections.ts` — offline URL allowlist and safe CSV/M3U ingestion of metadata only; no remote file fetch or music playback.
- Tests: `tests/listening/contracts.test.mjs` — 18 passing rights/portability tests. Additional browser regression runs only against earlier Build 02 portable prototype.

**Source authority:** See `docs/LISTEN03_SOURCE_OWNER_REVIEW.md`. No protected main source, released URL, database, Mac Studio checkout, provider contract, real-member records, or third-party recording was changed or accessed to make this candidate.


## LISTEN-04 bounded portability and local fidelity amendment (October 24)

- Member-initiated `Restore Soullab export` imports only the application’s export format. Revalidates every collection, link, track URL and size limit; replaces existing unsaved tab state only with explicit confirmation. **This is not cross-device account sync**.
- A separately contained `LocalAudioDesk` uses a file chooser and browser-generated Blob URL so members can play their own FLAC/WAV/MP3/M4A/AAC/Ogg/Opus files in this device's browser with native accessible controls. The audio is not uploaded, made public, analyzed or rebroadcast. Browser decoding and output hardware vary; file extension alone does not establish actual output resolution.
- Local file playback pauses the synthesized preview, and starting the preview pauses the member file. Existing Writer STOP event fires for local playback, but cross-route shared audio-focus governance remains a release-blocking test.
- Rights to upload, synchronize, redistribute, publicly perform or serve commercial music have **not** been granted. The `rightsPolicy` predicate is not a signature verifier or independent revocation authority.
- Review-only, behind unchanged `SOULLAB_LISTEN_REVIEW_ENABLED=1` and existing member authentication. Nothing deployed or merged.

**Additional safety resolution:** the original rights-field predicate was too optimistic: a well-formed claim looked 'VERIFIED' even when evidence was just a string. Build 04 now **always refuses hosting/delivery** until an independently accepted rights attestation and negative-revocation authority exist; a structurally complete fictional claim yields `INDEPENDENT_RIGHTS_AUTHORITY_REQUIRED`.

## LISTEN-05: portable private backup review (2026-10-24)

Optional passphrase-encrypted export/restore of the member's **metadata and journal only**, via local WebCrypto AES-256-GCM / PBKDF2. New `app/listen/PrivateBackupDesk.tsx`, `lib/listening/privateBackup.ts`, tests, and review doc. No provider service integration, account storage, secret storage, or cloud synchronization. A forgotten passphrase cannot be recovered by Soullab. Independent crypto/security acceptance required before member test.

**Verified in isolated source:** 35/35 privacy/rights/portability/pure-crypto tests, 3/3 mocked auth tests, 24/24 syntax/structure checks, strict TypeScript compile for pure modules. **Not** a joined real Next/PostgreSQL build. See `docs/LISTEN05_SOURCE_OWNER_REVIEW.md` for the important COOKIE+header concordance mismatch and native iPhone route hold.
