# Co-Lab Image Attachments — Spec (smallest safe v1)

**Date**: 2026-06-10
**Branch target**: `clean-main-no-secrets` (build on a feature branch)
**Status**: SPEC — pre-build

## Core principle (load-bearing)

> Co-Lab can gain attachments, but it should **not become a separate file system.**

Bytes live in the **existing studio file-vault filesystem** (`FILE_STORAGE_PATH`, default `/app/data/vault`) via a shared low-level storage helper. We do **not** introduce a second blob store, a base64-in-DB path, a new uploads directory, or any third-party storage.

## Scope (first pass)

- **Images only** (`image/png`, `image/jpeg`, `image/gif`, `image/webp`).
- **Both surfaces**: channel messages (`team_messages`) and DMs (`team_dm_messages`).
- Upload button (paperclip) in the shared composer.
- Thumbnail **preview before send** (client-side `URL.createObjectURL`, no server round-trip until send).
- Thumbnail **render after send** in message bubbles.
- **Click to open full image**.
- **Permission tied to the conversation/channel** — serving an image reuses the exact same access gate as reading the message it's attached to.
- No third-party storage.
- **Text-only messages unchanged.**

## What we are NOT doing in v1 (named follow-ups)

- No server-side thumbnail generation (no `sharp` in the repo). Thumbnails = CSS-scaled originals; full image = same bytes. *Follow-up: add `sharp` + a real thumbnail derivative.*
- No registration of team-chat bytes in the `practitioner_files` registry. The bytes share the vault **filesystem**; the metadata lives on the message (per instruction). *Follow-up: unify all vault bytes under one registry table once `practitioner_files.practitioner_id` is made nullable.*
- No refactor of the existing studio upload route onto the new shared helper. Studio stays untouched in v1; both callers write to the same `FILE_STORAGE_PATH` root, guaranteeing one filesystem. *Follow-up: migrate studio onto `lib/storage/fileVault.ts`.*
- No orphan-GC machinery — avoided by design (upload happens atomically with send; there is no unlinked-attachment state).
- Non-image file types, drag-and-drop, paste-to-upload — later.
- **iOS/Capacitor image serving** — the serve route authorizes via same-origin cookies (works on web). An `<img src>` request cannot send the `x-member-id` header the iOS WebView relies on (the documented Capacitor cookie trap), so in-app image loading on iOS will need a short-lived signed query-param token on the serve URL. *Follow-up before iOS ships Co-Lab images.* Web (desktop/PWA) works in v1.

## Edit / delete: not present in v1 (forward-compatible)

Co-Lab has **no message-edit and no message-delete** feature today (message routes are GET + POST only; no `editMessage`/`deleteMessage`, no PATCH/DELETE handler). Attachments are designed to inherit both correctly when they arrive:
- **Delete** (future soft-delete via `deleted_at`): every list/stream query already filters `deleted_at IS NULL`, so the message + its thumbnails drop from the UI; the serve lookup also filters `deleted_at IS NULL`, so a deleted message's image returns 404. (Bytes remain on disk — the GC follow-up.)
- **Edit** (future): `UPDATE … SET body, edited_at …` does not touch the `attachments` column, so the DB preserves it. **Caveat for the implementer:** the edit handler MUST return the message with `attachments` mapped (via `toClientAttachments`), or an optimistic client replace will blank the image until reload.

## Hydration symmetry (verified)

All read/write paths serialize attachments through the same `toClientAttachments(parseStoredAttachments(row.attachments), <serveBase>)` helper, so live-stream and refresh hydrate identically: channel list / since-stream / replies / send (`ChannelService` :211, :296, :348, :461) and DM list / since-stream (`mapDMRow`) / send (`DMService` :68, :307). Reaction + attention enrichment mutate message objects in place — no rebuild drops attachments.

## Grounding (verified file:line facts)

**Vault storage** (`app/api/studio/files/route.ts`)
- Bytes: `writeFile(path.join(STORAGE_BASE, storagePath), buffer)` where `STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault'`, `storagePath = {practitioner_id}/{fileId}.{ext}` (`route.ts:19, 253-267`).
- Read back: `readFile(fullPath)` (`app/api/studio/files/[fileId]/route.ts:56`).
- Serve gate is owner-only: `WHERE id = $1 AND practitioner_id = $2` (`[fileId]/route.ts:39-42`) — **not reusable for chat**; chat needs a conversation-membership gate.
- No reusable helper exists — write/read logic is inline. No image library.

**Message tables**
- `team_messages` (`database/migrations/20260321000001_team_messaging.sql:35-50`): `id`, `channel_id`, `sender_id`, `body`, `parent_id`, `edited_at`, `deleted_at`, `created_at`, `message_kind`. UUID PK. No JSONB yet.
- `team_dm_messages` (`database/migrations/20260321000002_team_dm_threads.sql:20-32`): `id`, `dm_thread_id`, `sender_id`, `body`, `edited_at`, `deleted_at`, `created_at`, `message_kind`. Separate table. UUID PK. No JSONB yet.
- Channel insert: `ChannelService.sendMessage()` `INSERT INTO team_messages (...) RETURNING *` (`lib/team/ChannelService.ts:374-402`).
- DM insert: `DMService.sendDMMessage()` `INSERT INTO team_dm_messages (...) RETURNING *` (`lib/team/DMService.ts:241-273`).
- Channel list `SELECT tm.* ...` (`ChannelService.ts:179-209`) — a new column rides along automatically.
- DM list `SELECT dm.* ...` (`DMService.ts:171-192`).
- Types: `TeamMessage` (`lib/team/types.ts:29-52`), `DMMessage` (`lib/team/DMService.ts:23-33`).

**Permission gates (reused verbatim for serving)**
- Channel: `requireChannelAccess(channelId, memberId)` (`lib/team/permissions.ts:28-49`).
- DM: inline membership check `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2` (`DMService.ts:147-151, 254-258`).
- Auth identity: `getMemberIdFromRequest(request)` (`lib/auth/getMemberFromRequest.ts:13-48`) — same as sibling routes. (Known weakness: bare `x-member-id` is forgeable on `clean-main`; the image is gated **identically** to the message it belongs to, so it is no more exposed than the message itself. Hardening tracked separately.)

**UI**
- Shared composer `components/team/MessageInput.tsx` — used by both `ChannelView.tsx` (`onSend` at line ~422) and `DMView.tsx` (line ~182). Submit handler at `MessageInput.tsx:114-133`; `onSend(body, kind)` today.
- Channel send: `ChannelView.sendMessage()` POSTs JSON `{ body, messageKind }` then optimistically appends the returned message (`ChannelView.tsx:142-161`).
- DM send: `DMView.sendMessage()` POSTs JSON `{ body }`, optimistic append (`DMView.tsx:78-88`).
- Channel bubble: `components/team/MessageBubble.tsx` renders body via `<MessageText>` (~line 124-126).
- DM bubble: inline JSX in `DMView.tsx` map (~line 171-173). **Channels and DMs use different bubble renderers** — both get the thumbnail block.

## Design

### Data model
Add a JSONB column to **both** message tables (matches "attachment metadata to `team_messages`"):

```sql
ALTER TABLE team_messages    ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE team_dm_messages ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
```

Each element (`MessageAttachment`):
```ts
{ id, kind: 'image', filename, mimeType, sizeBytes, storagePath, width?, height? }
```
`storagePath` is relative to `FILE_STORAGE_PATH` (e.g. `team-chat/<uuid>.png`). It is **never** sent to the client — the client only receives a serve URL.

### Byte storage helper — `lib/storage/fileVault.ts`
Neutral, shared module (the single write/read mechanism):
- `resolveVaultRoot()` → `process.env.FILE_STORAGE_PATH || '/app/data/vault'`.
- `sanitizeName(name)` — same rule as studio.
- `writeVaultBytes(namespace, fileId, ext, buffer)` → writes `{root}/{namespace}/{fileId}.{ext}`, returns the relative `storagePath`.
- `readVaultBytes(storagePath)` → buffer.
- Team chat uses `namespace = 'team-chat'`. Same root as studio ⇒ one filesystem.

### Upload + send (single atomic multipart request — no orphans)
The composer holds picked `File[]` in memory and previews them locally. On send, if attachments are present the client POSTs `multipart/form-data` (text + image bytes) to the **existing** message route; otherwise the current JSON path is used unchanged.

Server (both send routes):
1. Detect `content-type`. JSON branch = today's behavior, untouched.
2. Multipart branch: read `body`, `messageKind`/`message_type`, and image file(s).
3. Validate each: mime allowlist, `≤ 10 MB`, `≤ 5` images/message. Reject otherwise (400).
4. `writeVaultBytes('team-chat', uuid, ext, buf)` for each → build `MessageAttachment[]`.
5. Call the service insert with `attachments` → message row carries the JSONB.
6. Return the message **including** `attachments`, each rewritten to a serve URL (see below). Optimistic append shows it instantly.

Image-only messages (empty text) are allowed when ≥1 attachment is present; `body` persists as `''` (satisfies `NOT NULL`).

### Serving (permission tied to the conversation)
Two new GET routes, conversation-scoped so the membership gate is structural:
- `GET /api/team/channels/[channelId]/attachments/[attachmentId]`
- `GET /api/team/dm/[dmId]/attachments/[attachmentId]`

Each:
1. `getMemberIdFromRequest(request)` → 401 if none.
2. Authorize with the **same** gate as message reads: `requireChannelAccess(channelId, memberId)` / `team_dm_members` membership → 403 if denied.
3. Locate the attachment **scoped to the conversation** (cannot cross conversations):
   ```sql
   SELECT att->>'storagePath' AS storage_path, att->>'mimeType' AS mime_type, att->>'filename' AS filename
   FROM team_messages tm, jsonb_array_elements(tm.attachments) att
   WHERE tm.channel_id = $1 AND att->>'id' = $2 AND tm.deleted_at IS NULL
   LIMIT 1
   ```
   (DM variant keys on `dm_thread_id`.)
4. `readVaultBytes(storage_path)` → stream with `Content-Type: <mime>`, `Content-Disposition: inline`, long cache header (immutable content, uuid URL).

The serve URL placed on returned attachments:
`/api/team/channels/<channelId>/attachments/<attachmentId>` (or the DM form).

### UI changes
- **`MessageInput.tsx`**: paperclip button (`<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden>`), `File[]` state, a preview strip above the input row (objectURL thumbnails + remove ✕). `onSend` becomes `(body, kind, attachments: File[])`. Send enabled when `body.trim()` **or** attachments present.
- **`ChannelView.sendMessage` / `DMView.sendMessage`**: when attachments present build `FormData` and POST multipart; else JSON (unchanged). Append returned message (with `attachments`) optimistically.
- **`MessageBubble.tsx`** (channels) and **`DMView` bubble**: after `<MessageText>`, render `attachments` as a thumbnail grid (`max-h-48 rounded-lg`); click opens the full image (new tab / lightbox).

## Permission & safety summary
- Upload authorized by the send route's existing member-auth + the conversation gate (you can only attach to a conversation you can post in).
- Serving authorized by the **same** conversation gate as reading the message.
- Mime allowlist + size cap + count cap on the server (never trust client).
- `storagePath` never leaves the server; clients get opaque serve URLs.
- Bytes co-located in the vault filesystem — one file system.

## Build order
1. Migration (both `ALTER TABLE ... ADD COLUMN attachments JSONB`).
2. `lib/storage/fileVault.ts` (shared byte helper).
3. Types: `MessageAttachment` + `attachments` on `TeamMessage` and `DMMessage`.
4. Services: thread `attachments` through `sendMessage` / `sendDMMessage` inserts + list mappings; relax empty-body when attachments present.
5. Send routes: multipart branch (validate → write bytes → insert → return with serve URLs); JSON branch untouched.
6. Serve routes: two conversation-scoped GET routes.
7. UI: `MessageInput`, `ChannelView`, `DMView`, `MessageBubble`.
8. Verify: `npm run typecheck`, `npm run check:no-supabase`.

## Verification scope (honest)
Typecheck + no-supabase run locally. **Live behavior** (upload → render → click-to-open, and the cross-conversation 403) requires an authenticated team session against a real DB — verified post-deploy via an authed session, consistent with how team features are verified in this project. The migration must be applied on minisforum before the routes will accept attachments.
