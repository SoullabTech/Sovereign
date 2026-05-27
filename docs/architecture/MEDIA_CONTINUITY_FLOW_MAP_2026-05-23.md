# Live Camera → Media continuity map

**Date:** 2026-05-23
**Status:** Tracing only. No architecture proposed.
**Governing canon:** [`MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md`](../canon/MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md)

This map traces one canonical flow as it exists today. It does not propose changes.

## 1. What exists

**UI surfaces**
- `app/studio/camera/page.tsx` (575L) — Live camera/recording UI. Uses browser `MediaRecorder` API.
- `app/studio/media/page.tsx` + `app/studio/media/[projectId]/page.tsx` — real media-projects client surface.
- `app/model-studio/media/page.tsx` — pure demo (hardcoded `demoMedia` array; no fetch, no API calls).

**API (real, wired to PostgreSQL + Whisper)**
- `app/api/media/projects/route.ts` — list/create projects.
- `app/api/media/projects/[projectId]/upload/route.ts` — `FormData` single-file upload.
- `app/api/media/projects/[projectId]/upload-chunk/route.ts` — chunked upload.
- `app/api/media/projects/[projectId]/transcribe/route.ts` — enqueues `transcribe + classify + summarize` jobs.
- `app/api/media/projects/[projectId]/transcript/route.ts` — GET stored transcript.
- `app/api/media/projects/[projectId]/jobs|assets|exports|integrations/route.ts`.
- `lib/media/enqueueJobs.ts` — pipeline `validate → inspect → [thumbnail, waveform, audio_extract] → transcribe → [classify, summarize]`.
- `lib/media/processors.ts` — POSTs `multipart/form-data` to `${WHISPER_URL}/v1/audio/transcriptions`. Summary via Ollama `deepseek-r1:8b`.
- `lib/trust/mediaDisclosure.ts` — trust gate on exports/integrations.

**Nostr**
- `app/api/nostr/publish/record/route.ts` — recording surface only. Accepts `{eventId, contentType, signatureMode, relayUrl, publishedAt, anonymous}`. Fire-and-forget log of a publish that already happened client-side. No `/api/nostr/publish/route.ts` exists at parent path.

**Whisper container**
- `maia-whisper` in `docker-compose.production.yml`; processors hit faster-whisper `/v1/audio/transcriptions`. Returns `{text, segments}` stored in `media_transcripts(project_id, engine, language, full_text, segments, word_count, status)`.

## 2. Where recording/audio/transcript actually goes

- **Camera recording**: `mediaRecorder.onstop` builds a `Blob`, creates an `<a download>`, **triggers a browser download** (`soullab-recording-${Date.now()}.webm`). It is not sent to any API. (`app/studio/camera/page.tsx` L161-169.)
- **Media projects path** (separate from camera): file → `/upload` or `/upload-chunk` → local filesystem (`lib/media/storage.ts`) → `enqueueProcessingPipeline` → PostgreSQL `media_jobs` / `media_assets`.
- **Transcript**: Whisper → `media_transcripts` row (full_text, segments, word_count). Summary → same row's `summary` field.

## 3. Metadata that survives

`media_projects`, `media_assets`, `media_jobs`, `media_transcripts` (with `segments` JSON), `media_exports`, `media_integrations`. Schema in `database/migrations/20260407100001_media_studio_build_a.sql`.

## 4. Continuity breaks

- **Hard break #1 — Camera → Media projects.** `app/studio/camera/page.tsx` contains zero references to `project`, `upload`, `/api/`. The recording lands in the user's Downloads folder. No upstream call to `/api/media/projects` or `/upload`.
- **Hard break #2 — Transcript → MAIA memory.** Grep across `lib/memory`, `lib/consciousness`, `app/api/memory`, `app/api/oracle` for `media_transcripts` / `media_project` returns zero matches. Transcripts are stored, never read by the relational/memory stack.
- **Hard break #3 — Nostr publish input.** `nostr/publish/record` only logs that a publish happened; the actual content-to-event composition lives client-side and is not wired to media-project transcripts or exports.
- **Soft break — model-studio/media.** Pure demo page; no connection to the real `/api/media/projects` surface.

## 5. Manual steps still required

- User manually saves the camera `.webm` from Downloads.
- User manually creates a media project and uploads the saved file.
- User manually hits `/transcribe` (or relies on initial pipeline) — there is a `POST /transcribe` route specifically for manual re-trigger.
- User manually composes/signs/relays a Nostr event client-side; server only records the receipt.

## 6. Pure gaps (don't exist)

- **No resonance/theme/symbol extractor over transcripts.** `processClassify` and `processSummarize` exist (Ollama summary + classify), but no module extracts themes/signals/symbols into MAIA's atoms/memory layers. `member_memory_atoms` is not touched by media processing.
- **No archive reader.** Nothing in the cognition path reads `media_transcripts`.
- **No camera → project bridge.**
- **No `soullab-media-engine` content** at `/Users/soullab/soullab-media-engine` (just README + .gitignore from tonight's scaffold).
- **No Book Studio ↔ media linkage.** `app/api/book-studio/*` exists in parallel but no shared route or shared schema with `media/projects`.

## Architecture evidence (a / b / c)

The evidence points to **(a) a routing layer between existing organs that already exist in-repo.**

Reasoning from what's on disk, not preference:
- Storage organs exist and are wired (camera capture; projects/assets/jobs/transcripts; Whisper; Ollama summarize; Nostr publish-record; Book Studio).
- The breaks are all *between* organs, not inside them: camera doesn't POST to upload; transcripts don't feed memory; nostr-publish has no upstream content source; Book Studio is parallel.
- `soullab-media-engine` is empty — no sibling repo content to integrate against.
- `model-studio/media` is demo-only — not a competing surface, just a stub.

The shape of what is missing is **connective tissue** (camera→upload bridge, transcript→memory reader, transcript→nostr composer, transcript→book-studio importer), not new storage or processing organs.

## Stop point

Map ends here. No build, no refactor, no architecture proposal. Per the canon: *the boundary must hold under load before more is built.*
