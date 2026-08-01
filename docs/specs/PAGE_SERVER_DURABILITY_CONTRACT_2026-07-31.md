# Page — Server Durability Contract

**Status: contract only. Not implemented under this act.**

The local prototype (`localStorage`) is a behavior reference, not durability. This is the same
behavior moved to the server. The page stays quiet; this layer must be stronger than the page
looks.

---

## Current draft

The canonical server copy of a work.

| Field | Meaning |
| --- | --- |
| `workId` | the work this draft belongs to |
| `currentRevisionId` | pointer to a **complete** revision |
| `updatedAt` | when the pointer last advanced |

The current draft holds no content of its own. It points at a revision.

## Revisions — append-only

Immutable. Never edited, never deleted, never rewound.

| Field | Meaning |
| --- | --- |
| `revisionId` | immutable identity |
| `parentRevisionId` | the revision this one followed (`null` for the first) |
| `memberId` | author |
| `content` | full snapshot, or a delta durable enough to reconstruct without other optional records |
| `createdAt` | when written |
| `reason` | `autosave` · `checkpoint` · `restore` |

## Save

1. Client sends `baseRevisionId` — the revision it was working from — plus content and an
   `idempotencyKey`.
2. Server accepts **only if** `baseRevisionId === currentRevisionId`.
3. Server writes a new revision.
4. Server **atomically** advances `currentRevisionId` to it.

Step 4 happens only after step 3 is complete and durable.

## Conflict

- Respond **409**, including the server's `currentRevisionId`.
- **Never overwrite silently.**
- The client stops autosaving and shows a plain conflict message. It does not merge, retry, or
  resolve on its own.

## Restore

- Restore takes a target `revisionId` and the client's `baseRevisionId`; a stale base is a **409**,
  the same as a save.
- The displaced draft is preserved by construction — `currentRevisionId` already points at an
  immutable revision, which remains in the log.
- Restore **appends a new revision** whose content equals the target's, with
  `reason: restore` and `parent = ` the displaced revision.
- History is never rewound or truncated. Restoring is therefore itself restorable.
- Unsaved client edits must be saved before a restore, or the restore is refused. Restore is not a
  way to discard work silently.

## Recovery

- An incomplete write never becomes current — the pointer advances only after the revision is
  durable.
- `currentRevisionId` always points at a complete revision.
- **Idempotent**: a repeated request carrying the same `idempotencyKey` **and the same payload**
  returns the revision created by the first attempt. It does not create a second.
- Keys are scoped to **`(memberId, workId, operation)`** — not a global namespace. The same string
  used by a different member, against a different work, or for a different operation is a different
  key.
- A key reused with a **different payload** is a **409**, never a silent replay of the first
  result.

## Distinguishing the two conflicts

Both are 409 and the client must handle them differently, so the response carries which one it is.

| Reason | Meaning | Client |
| --- | --- | --- |
| `stale_base` | someone else advanced the draft | stop autosaving, show the conflict message |
| `idempotency_key_reuse` | same key, different payload | a client defect — do not retry, report it |

## Endpoints

| Purpose | Shape |
| --- | --- |
| Fetch current draft | `GET /works/{workId}/draft` → `currentRevisionId`, content, `updatedAt` |
| Save a new revision | `POST /works/{workId}/revisions` ← `baseRevisionId`, content, `idempotencyKey` |
| List revisions | `GET /works/{workId}/revisions` → id, parent, author, `createdAt`, reason |
| Fetch one revision | `GET /works/{workId}/revisions/{revisionId}` |
| Restore a revision | `POST /works/{workId}/revisions/{revisionId}/restore` ← `baseRevisionId`, `idempotencyKey` |

## Acceptance

1. Reload never empties the draft.
2. Earlier versions remain available.
3. Restore is reversible.
4. Two clients cannot silently overwrite each other.
5. A failed write does not advance the current revision.
6. Repeated requests are idempotent.

## Not in scope

Browser undo · Safari event handling · UI design · merge behavior · collaborative editing ·
retention and pruning policy · storage engine and schema choices beyond the fields named above.
