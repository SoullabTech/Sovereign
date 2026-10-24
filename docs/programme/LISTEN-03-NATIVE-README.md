# Soullab Listening Room — Build 03 (native source candidate)

An **isolated, source-owner-review-only** Next.js App Router integration candidate. Not merged or deployed; does not connect Spotify/TIDAL account APIs or host commercial music.

- Proposed route: `app/listen/page.tsx` — requires `SOULLAB_LISTEN_REVIEW_ENABLED=1` **and** an authenticated Soullab member before rendering, default 404.
- UI: `app/listen/ListenRoom.tsx`, `app/listen/listen.module.css` — four moods, interactive low-level WebAudio sound studies, private in-memory metadata shelf and reflection, explicit export.
- Rights policy: `lib/listening/rightsPolicy.ts` — *server-only reference policy*, all missing/uncertain rights refused. Not a playable-media API and no license receipts from real artists.
- Portability: `lib/listening/portableCollections.ts` — offline URL allowlist and safe CSV/M3U ingestion of metadata only; no remote file fetch or music playback.
- Tests: `tests/listening/contracts.test.mjs` — 18 passing rights/portability tests. Additional browser regression runs only against earlier Build 02 portable prototype.

**Source authority:** See `docs/LISTEN03_SOURCE_OWNER_REVIEW.md`. No protected main source, released URL, database, Mac Studio checkout, provider contract, real-member records, or third-party recording was changed or accessed to make this candidate.

