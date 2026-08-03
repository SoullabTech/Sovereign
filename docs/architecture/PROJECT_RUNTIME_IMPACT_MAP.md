# Project Runtime Impact Map — `7c9dd5192` → `bfdf5512c`

**Observation only. No recommendations.**

Scope: which runtime paths the pinned release object touches, which it leaves untouched, what depends
on the single migration, and where coupling is not visible from the surface being changed.

---

## 1. Surface-by-surface

| Surface | Touched? | What changed |
| --- | --- | --- |
| **Workbench** | ✅ heavily | 3 API routes re-gated (`requireFounder` → `requireArranger`); 5 components rewritten for the verb set; new `lib/workbench/{access,arrange,sources/keep}.ts`; new member page `/maia/workbench` |
| **WriterField** | ✅ new | `app/press/manuscript/WriterField.tsx` + DOM tests; `WorkingDraftEditor.tsx` and `page.tsx` modified |
| **Member Field** | ⚠️ indirect | No runtime file under a "member field" path changed. The Field is touched only through `member_memory_atoms`, which the Keep adapter now **reads** (never writes) |
| **Practitioner Notes** | ❌ untouched | No file changed |
| **Living Works** | ⚠️ indirect | No `living_works` runtime file changed. `app/press/studio/*` (shell identity, current manuscript) changed and sits adjacent to it |
| **Book Studio** | ✅ | Workbench lives under `app/book-studio/*` and `app/api/book-studio/*`; the founder Press pages themselves are unchanged apart from the Workbench |
| **Shared libraries** | ✅ **widest** | `lib/db/postgres.ts` — imported by **709 files** |

---

## 2. Untouched runtime paths

No file changed under: `middleware.ts` · `lib/auth/**` · `lib/voice/**` · `lib/maia/**` ·
`lib/sovereign/**` · `lib/consciousness/**` · `app/api/sovereign/app/maia/**` ·
`app/api/between/**` · Practitioner Studio · Caseload · Journal · House · Anchor · iOS/Capacitor.

The conversational runtime, the memory loaders, and the voice path are not modified by this release
object.

---

## 3. Migration dependencies

One migration, `20260802000001_manuscript_title_optional.sql`, on `member_manuscripts`.

**Code that depends on it having run:**

- `app/api/sovereign/manuscripts/blank/route.ts` (new) — creates a manuscript with no title
- `app/api/sovereign/manuscripts/route.ts` — `title: string | null`
- `lib/manuscript/untitledExpression.ts` (new)
- `app/press/manuscript/WriterField.tsx`, `page.tsx`, `WorkingDraftEditor.tsx`
- `app/press/studio/useCurrentManuscript.ts`, `shellIdentity.ts`, `StudioShell.tsx`

**Ordering property:** the migration widens (`DROP NOT NULL`). Schema-before-code is safe; the
reverse is not — code that writes a NULL title against the un-migrated table violates `NOT NULL`.

**Rollback property:** once any NULL-title row exists, restoring `NOT NULL` fails. The migration is
forward-safe and backward-lossy.

**Path note:** a quick `deploy-maia` rebuild runs no migrations. Delivering the code without the
migration puts the blank-manuscript path in a failing state.

---

## 4. Hidden coupling

### 4.1 `lib/db/postgres.ts` → 709 importers

The largest coupling in the release object, and the least visible: nothing in the Workbench or
WriterField diffs reveals it. The 42P01 change alters the failure mode of **every** query in the
application, including surfaces this release otherwise never touches (§2). A surface can be
"untouched" by file and still behave differently after this release.

### 4.2 Workbench components are shared between two surfaces

`Room` / `Shelf` / `Table` / `Group` / `Card` render both the founder Workbench
(`/book-studio/workbench`) and the new member Workbench (`/maia/workbench`). The member surface
suppresses upload and graduation via props (`canUpload={false}`, `canGraduate={false}`), which
default to `true` so the founder render is unchanged. **A future edit to these components reaches
both surfaces at once.** Server-side gating is the actual boundary: `uploads/*` and
`drafts/from-group` remain `requireFounder()`.

### 4.3 The Keep adapter couples the Workbench to the Field substrate

`lib/workbench/sources/keep.ts` reads `member_memory_atoms` directly. A change to atom columns,
statuses, `memory_scope`, or provenance values propagates into the Workbench Shelf even though no
Workbench file changes. The adapter is read-only, so the coupling is one-directional.

### 4.4 Shelf fan-out flattens sources

`shelf/route.ts` merges all enabled adapters and sorts by `createdAt` (`.flat().sort()`). Source
identity survives on each card (`source` field) but not in the list's structure. Adding a second
adapter changes what every existing caller receives.

### 4.5 `requireArranger()` wraps `requireFounder()`

`lib/workbench/access.ts` calls `requireFounder()` first and falls through on 403. A change to
founder-allowlist semantics (`FOUNDER_MEMBER_IDS`) therefore changes member Workbench behavior too.

---

## 5. Runtime paths newly reachable

| Path | Reachable by | Note |
| --- | --- | --- |
| `/maia/workbench` | any authenticated member | new surface |
| `GET /api/book-studio/workbench/shelf` | any authenticated member | member role searches `keep` only |
| `GET/POST /api/book-studio/workbench/tables` | any authenticated member | scoped to own `arranger_id` |
| `GET/PATCH/DELETE /api/book-studio/workbench/tables/[id]` | any authenticated member | scoped to own `arranger_id` |
| `POST /api/sovereign/manuscripts/blank` | per that route's own gate | new |

Observed substrate state at audit time: `workbench_tables` 1 row, `workbench_uploads` 0,
`member_memory_atoms` 142 (none with `generated_by = 'member-gesture'`).
