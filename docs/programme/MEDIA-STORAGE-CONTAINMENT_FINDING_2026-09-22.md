# MEDIA STORAGE CONTAINMENT — FINDING (NO REPAIR)

STATUS: FINDING · source-confirmed + mechanism runtime-demonstrated · ⛔ **NO REPAIR IN THIS RECORD**
**Date**: 2026-09-22 · **Occasioned by**: a bounded external static pass (Codex Security), independently verified here.

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Standing

**`MEDIA_STORAGE_BASE` has no containment discipline.** This is ⛔ not "a traversal bug
in two upload routes" — it is an **unguarded path-composition layer**. Every component
joined onto the base (`projectId`, `subdir`, `filename`, `uploadId`, `relativePath`) is
caller-supplied, and **no syntactic validation of any path component exists anywhere in
`app/api/media/`** (verified: zero matches for uuid/regex/schema validation).

## 2. LIVE · unsanitized client filename reaches a filesystem write

`upload/route.ts:86` → `storeFile(projectId, 'original', file.name, buffer)`
`upload-chunk/route.ts:55,90` → `x-filename` header → `assembleChunks` → same sink

```ts
// lib/media/storage.ts:46-50
const relativePath = join(projectId, subdir, filename);        // join NORMALIZES
const absolutePath = join(MEDIA_STORAGE_BASE, relativePath);
await mkdir(join(MEDIA_STORAGE_BASE, projectId, subdir), …);    // SAFE prefix
await writeFile(absolutePath, data);                           // JOINED path
```

⭐ **The `mkdir` and the `writeFile` use different paths.** The directory is created
safely; the file is written wherever the name resolves. No `basename`, no charset
filter, and **no containment assertion anywhere** in `lib/media/` or `app/api/media/`.

**Mechanism demonstrated** (that exact code, isolated temp dir, no app, no production):

```
'../../proj-B/original/victim.txt'  → overwrote another project's file
'../../../escaped.txt'              → escaped MEDIA_STORAGE_BASE entirely
```

## 3. ⭐⭐ THE PERSISTED PATH GIVES THE WRITE A READER

`storeFile` **returns** the traversed `relativePath` (`proj-B/original/victim.txt`), and
that value is persisted as the asset's `storage_path`. The serve route then reads it
back out of the database and streams it:

```
serve/route.ts:32  SELECT a.storage_path …
              :45  fileExists(asset.storage_path)
              :70  getFileStream(asset.storage_path)      → join(BASE, relativePath), uncontained
```

⭐ **So write and read compose.** A traversed path stored at upload time is replayed by
the serve route later. **The database is the laundering step that makes the traversal
look legitimate** — the read is not a second bug, it is the first bug's consumer.

## 4. Additional uncontained sinks — ⛔ NOT in the external report

| sink | component | status |
|---|---|---|
| `storeStream` :69-70 | `filename` | same shape as `storeFile` |
| `getChunkDir` :205 → `storeChunk` :218-219 | **`uploadId`** (`x-upload-id`, checked only for truthiness) | attacker-directed `mkdir -p` + write |
| `fileExists`/`getFileSize`/`getFileStats`/`getFilePath` :97-134 | `relativePath` | uncontained read |
| `deleteFile` :141 (`unlink`) · `deleteProjectDir` :153 (`rm` recursive) | `relativePath` / `projectId` | ⚠️ **LATENT — defined, no callers outside `storage.ts`** |

⚠️ The destructive pair is recorded as **latent, not live**: reachability would need a
caller, and none exists today. ⛔ Do not report it as exploitable.

## 5. Bounds, stated honestly

- **Authenticated-only.** `getMemberIdFromRequest` holds; the dev member fallback at
  `projects/route.ts:28` **is** correctly gated (`&& NODE_ENV === 'development'`, then 401).
- Writes occur as the server process uid — **not** proof of privilege escalation.
- ⛔ **No production exploitation was attempted, and none should be.** §2 is a mechanism
  demonstration in a temp directory; production reachability and filesystem permissions
  are **NOT ESTABLISHED**.

## 6. Separate finding — a decorative environment guard

```ts
// app/api/media/projects/route.ts:20-21
if (process.env.NODE_ENV === 'development') return DEV_PRACTITIONER_ID;
return DEV_PRACTITIONER_ID; // TODO: look up from members/practitioners
```

**Both branches return the same constant.** This is worse than a hardcoded id: it is a
guard that *reads* as an environment gate and is not one, so a reviewer scanning quickly
concludes production differs. Authentication holds; **authorization collapses** — every
authenticated member resolves to one practitioner, and `:42` filters
`practitioner_id = $1`.

⭐ The honest repair is a **decision, not a patch**: implement the lookup, or make the
non-development branch **fail closed**, so the missing lookup becomes impossible to
forget rather than silently permissive. ⛔ Not taken in this record.

## 7. ⚠️ Consequence for the proposed repair shape

A `basename` + charset filter + containment assert **on `filename` in `storeFile`** is
necessary and **not sufficient**: it leaves `uploadId`, `projectId` and the
`relativePath` read/delete sinks uncontained. The repair primitive must be a
**contain-on-resolve helper used by every function that composes a path from the base**,
plus per-segment component validation. Recorded so the repair is not scoped to the two
routes the external pass happened to name.

⚠️ And one trap in the charset shape: `.` and `..` are **entirely** `[A-Za-z0-9._-]`, so a
filter permitting `.` does **not** reject `..` — and `basename('../..')` is `'..'`, which
still escapes one level. Whole-name `.`/`..`/empty must be rejected explicitly.

## 8. Standing

containment **ABSENT** · §2 write mechanism **CONFIRMED + DEMONSTRATED** · §3 write→read
composition **CONFIRMED FROM SOURCE** · §4 extra sinks **CONFIRMED**, destructive pair
**LATENT** · §6 authorization collapse **CONFIRMED** · production reachability **NOT
ESTABLISHED** · ⛔ **no code changed by this record** · ⛔ no production touched · ⛔ no
exploitation attempted · repair **candidate to follow as a separate act**.
