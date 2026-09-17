# F5-C — MEMBER INFORMATION CUSTODY GRAPH (REPOSITORY, READ-ONLY)

```
D9               CLOSED
F5               OPEN
F5-A             CLOSED — PASS AS CENSUS
F5-B             CLOSED — NON-AUTHORITATIVE
F5-C             ACTIVE
F5-D onward      NOT AUTHORIZED

Evidence subject 7ee173db0d54f7340353316d11729b88480434a5   (unchanged, not re-bound)
Custody/context  claude/clever-einstein-mojiar @ a4b4df31
Repository max   REACHABLE
LIVE · EXERCISED · VERIFIED   UNASSIGNABLE

Auth repair NO · Prefix repair NO · delete-my-memory repair NO · Schema NO
Migration NO · FK proposal NO · Deletion NO · Deployment NO · Production probing NO
Recommendation NO · F5-D selection NO
```

**Subject integrity.** `git diff 7ee173db..a4b4df31 -- . ':!docs'` is empty: the two
intervening commits add only F5-A and F5-B records. The source under census is
byte-identical to the pinned subject.

---

## 0. Instrument disclosure — one material correction, stated not absorbed

The first inventory pass parsed `database/migrations/*.sql` only and reported 585
tables, 275 member-bound. It **missed `database/baseline/0001_baseline_2026-09-01.sql`**
entirely — a 1.6 MB schema capture of 634 tables with an accompanying migration
ledger manifest.

That omission produced a false negative I nearly recorded: it reported
`developmental_memories` as having no canonical creation, when the baseline
creates it. The error was caught by checking a table the organism is known to
use, against the parser's claim that it does not exist.

The inventory below is rebuilt on the **baseline as the authoritative canonical
inventory**, unioned with migration-created names where a question requires it.

`scripts/capture-baseline.sh` states its own contract: the capture must come from
production (*"capture from production, or do not capture"*), and the manifest is
built from the source database's own `schema_migrations` rather than from the
filesystem — a filename with no file on disk is stamped with a NULL checksum
rather than reconstructed. **Repository evidence establishes that contract; the
capture act itself is UNWITNESSED here.** Everything below inherits that caveat.

A second, smaller correction: a column-type regex written for migration syntax
returned zero UUID columns against the baseline, whose `pg_dump` output quotes
type names (`"user_id" "text"`). Both counts are from the corrected parse.

---

## 1. Custody inventory

From the baseline capture (2026-09-01):

```
canonical tables                                    634
member-bound (carrying an identity column)          302
  identity column typed uuid                        185
  identity column typed text / varchar               80
  bound by another identity column only              37
  carrying an embedding / vector column               8
  carrying a multi-sovereign marker                  18
```

Identity columns counted: `user_id`, `member_id`, `owner_id`, `author_id`,
`created_by`, `subject_member_id`, `participant_id`, `actor_id`,
`from_member_id`, `to_member_id`, `client_member_id`, `practitioner_member_id`.

**Scope statement:** this inventory is baseline-scoped. Tables created by
migrations after 2026-09-01 (the union is 664 names) are not separately counted
as member-bound; where a specific such table matters it is named individually.

---

## 2. The four overlays

### 2.1 Account-closure awareness

`app/api/members/delete-account/route.ts` inspects **42 table names** across its
`GOVERNED_CONTENT` and `OPTIONAL_CLEANUP` lists.

- 35 exist in the baseline.
- 3 exist only in post-baseline migrations (`context_disclosure_receipts`,
  `episode_links`, `session_insights`) — expected, not a finding.
- **4 exist nowhere in the canonical schema surface**, baseline or migrations:
  `member_preferences`, `relationship_events`, `scribe_artifacts`,
  `semantic_memory_vectors`.

The route's `governedContentFor` catches a missing-table error and does not
count it, on the stated ground that absence of a table is not evidence of absence
of content. **That posture is what makes this safe rather than dangerous** — the
refusal default means an uncounted table cannot cause a wrongful deletion. It
also means four of the route's declared inspection domains presently inspect
nothing, and would do so silently.

```
member-bound tables in the baseline                         302
inspected by the account-closure preflight                   35
NOT inspected by any located erasure path                   267
  of those, carrying a members FK (cascade-capable)         ~169
  of those, carrying no members FK                           ~71
```

### 2.2 `/api/sovereignty/delete-my-memory` targets

```
elemental_evolution · wisdom_moments · ain_consciousness_memory
elemental_personalities · maia_adaptations
```

**Zero of five appear in the baseline. Zero of five appear in any
`database/migrations/*.sql`. Zero of five appear in the 664-name union.**

Their only `CREATE TABLE` statements in the repository are in `db/migrations/`
(20 files, outside the deployed runner path) and in `backups/field-stable-v1-schema.sql`.

This is production-schema-captured corroboration of F5-B §1.3, which rested on
migration-directory evidence alone. The operation that declares *all your
consciousness data, across all systems* targets five tables that the canonical
schema surface does not contain.

### 2.3 Domain-specific erasure paths

| path | custody reached |
|---|---|
| manuscript erasure | `member_manuscripts` (+ declaration rows), `manuscript_source_arrivals` refs → `vault_erasure_queue` → vault bytes |
| sanctuary purge | `conversation_turns` rows for one `session_id` |
| circle response withdrawal | `circle_inquiry_responses` content columns (tombstone) |
| export-archive deletion | one `exportArchive` row + its file on disk |

Each reaches its own domain and nothing beyond it. None is member-wide.

### 2.4 Non-participation / recall controls

| control | canonical presence | enforced at a located retrieval path? |
|---|---|---|
| `members.conversational_recall_enabled` | yes | **yes** — `lib/maia/conversationalRecallBlock.ts`; declared as `consentBasis` in `lib/maia/canonical-turn/producerRegistry.ts` |
| `members.episodic_recall_enabled` | yes | **yes** — same registry, `loadRecentMarkedEpisodes` |
| `member_daily_anchors.surface_preference` | yes | yes — loader gate (`lib/anchor/loadRecentAnchors.ts`), default private |
| atoms `return_preference` | yes | yes — 21 TS files |
| sanctuary (turn-level) | n/a — behavioural | **yes, as non-creation** — `lib/consciousness/interruptionLedger.ts` returns on `turn.sanctuary`; `maiaOrchestrator` carries a sanctuary-skip sentinel |
| `developmental_memories.visibility` / `share_scope` | yes | **no located memory-retrieval path filters on either** |
| `declined_at` | yes (1 schema file) | **no reader anywhere in `lib/**` or `app/**`** |
| `valid_to` / supersession | yes | partial — F5-A/TEMPORAL lane records the fallback gap; unchanged here |

---

## 3. Custody graph — loci and erasure standing

Classification is repository-level: **PROVEN ERASED** means a located erasure
path provably *reaches* the locus in canonical source. Runtime exercise is
**UNWITNESSED** for every row.

### 3.1 Primary member content

| locus | identity binding | writer | reader | erasure standing |
|---|---|---|---|---|
| `conversation_turns` | `user_id TEXT` | `TurnsStore.addTurn/addExchange/addTranslation`; `app/api/voice/persist`, `app/api/conversation/turns` | `TurnsStore` readers, memory bundle | **PROVEN ERASED** for a sanctuary session (`deleteBySessionId` via `sessionFinalizer`, and the end-session purge). **NOT GOVERNED BY LOCATED ERASURE PATH** for non-sanctuary turns — account closure counts them and then refuses. |
| `maia_sessions` | `user_id` | session lifecycle | orchestrators | **NOT GOVERNED BY LOCATED ERASURE PATH** (counted, refused) |
| journals (`quick_`, `elemental_`, `holoflower_journal_entries`) | `user_id` | journal routes | journal + memory readers | **NOT GOVERNED BY LOCATED ERASURE PATH** |
| `reflection_capsules` | `user_id TEXT` | capsule routes | `/api/capsules` | scoped delete exists per capsule (`deleteCapsule`, auth `requireMemberId`) → **PROVEN ERASED** per row; member-wide: **NOT GOVERNED** |
| `member_manuscripts` + sections/keeps | `member_id` | ingest | Writer's Studio | **PROVEN ERASED** (F5-A §2.1) |

### 3.2 Memory and interpretive loci

| locus | identity | notes | erasure standing |
|---|---|---|---|
| `developmental_memories` | `user_id TEXT`, **no FK** | carries `vector_embedding vector(1536)` **in-row**; also `visibility`, `share_scope`, `confirmed_by_user`, `valid_from`/`valid_to`, `recall_count` | **NOT GOVERNED BY LOCATED ERASURE PATH** — present in `OPTIONAL_CLEANUP`, so reached only on the success branch, which a member holding content never reaches |
| `episodic_memories` | `user_id TEXT` | | **NOT GOVERNED** (counted, refused). One narrow deletion exists at `app/api/sovereign/episodes/mark` (unmark) |
| `episodes`, `episode_links`, `breakthrough_moments` | `user_id` | | **NOT GOVERNED** |
| `conversation_insights`, `conversation_themes` | `user_id` | derived; `conversation_insights` carries a vector column | **NOT GOVERNED** |
| `soul_patterns`, `pattern_connections`, `consciousness_traces`, `consciousness_expansion_events`, `spiral_stage_transitions` | `user_id` | interpretive ledgers | **NOT GOVERNED** |
| `conversation_memory_uses` | `user_id` | the retrieval ledger the temporal lane measured | **NOT GOVERNED** |
| `memory_cut1_trace_runs` | member-bound | Cut-1 traceability, live per CLAUDE.md | **UNRESOLVED** — not in the closure list, no located path |
| `context_disclosure_receipts` | `member_id` | content-free; **named in the closure list deliberately**, with the source stating retention may be shared by decision but not by accident | **NOT GOVERNED** (counted, refused) — but *visible* to the preflight, which is the property its annotation was added to secure |

### 3.3 Embedding / vector custody

Eight member-bound baseline tables carry an embedding or vector column:

```
case_memory_chunks · consciousness_expansion_events · conversation_insights
developmental_memories · pattern_connections · selflet_nodes
user_relationship_context · user_session_patterns
```

Six are counted by the account-closure preflight; **`case_memory_chunks` and
`selflet_nodes` are not named by any located erasure path.**

The structurally important fact: in every one of the eight, the embedding is a
**column on the member-bound row**, not a row in a separate vector store. No
external vector index (Pinecone, Qdrant, Chroma, a standalone embedding table
keyed to a source id) was located in canonical source. **Erasing the row erases
its embedding**, wherever a path reaches the row. Where no path reaches the row,
the embedding is retained with it.

`selflet_nodes` is the exception worth naming: it carries an embedding and
**no source reference at all** (§4).

### 3.4 Non-database loci

| locus | binding | erasure mechanism | standing |
|---|---|---|---|
| vault bytes (`lib/storage/fileVault.ts`) | path referenced by `manuscript_source_arrivals.artifact_ref` | `destroyVaultBytes` — unlinks, then **`stat`s to confirm absence and throws if the path survives**; refuses a path outside the vault root loudly rather than reporting success | **PROVEN ERASED** for manuscript-owned bytes |
| `deleteVaultBytes` (the sibling) | same | best-effort; a permission error, read-only mount or refused traversal all return normally | **not an erasure mechanism** — the source names this explicitly as right for cleanup and wrong for custody |
| `vault_erasure_queue` | `artifact_ref` | rows removed by the sweep on success | **PROVEN ERASED** on sweep; rows are the durable record of bytes still owed |
| export archives on disk | `exportArchive.userId` (Prisma) | `DELETE /api/premium-storage/export` — `fs.unlink` + row delete, ownership checked against session | **PROVEN ERASED** per archive; **NOT GOVERNED** member-wide |
| container stdout / Docker logs | member ids as join keys | **`scripts/guards/member-id-log-gate.ts`** — a mechanical recurrence guard over `logging sink × identifier-bearing value`, which treats `.slice(0,8)` truncation as a violation rather than a fix; 120 `memberRef()` call sites | **PROVEN NON-PARTICIPATING** as to *raw* identifiers, by a build-time guard. **UNRESOLVED** as to log content already emitted, and as to non-identifier member material in logs. Logs are reached by no erasure path. |
| in-process caches | `Map<string, …>` keyed by member id across agent and voice modules | process lifetime only | **PROVEN NON-PARTICIPATING** as durable custody; not reached by, and not requiring, an erasure path |

---

## 4. Derived artifacts — the lineage gap

The governing question asked only whether the repository can establish that
derived material came from specific source material. Testing each derived locus
for a source-naming column:

| derived locus | source reference |
|---|---|
| `case_memory_chunks` | `source_type` + `source_id` — **specific** |
| `conversation_insights` | `session_id` only — **coarse** |
| `user_session_patterns` | `session_id` only — **coarse** |
| `consciousness_expansion_events` | `session_id` only — **coarse** |
| `selflet_nodes` | **none** |
| `conversation_themes` | **none** |
| `soul_patterns` | **none** |
| `pattern_connections` | **none** |
| `user_relationship_context` | **none** |
| `episodes` | **none** |
| `breakthrough_moments` | **none** |

**Seven of eleven derived or interpretive loci carry no source reference at all.
Three carry only a session identifier, which names a container rather than the
material.**

The consequence, stated as a gap and not repaired:

> For most derived material in this organism, the repository cannot establish
> that a given derived row came from given source material. If a source row were
> erased, no located mechanism would identify what was computed from it, and no
> located mechanism reads a lineage column in order to follow one.

`developmental_memories` is the instructive counter-case: its derivation
(`vector_embedding`) lives *on the row it derives from*, so the lineage question
does not arise — erasure of the source is erasure of the derivative, necessarily.
That is a property of co-location, not of a lineage mechanism.

**No lineage repair, no provenance column, and no cascade is proposed.**

---

## 5. Multi-sovereign material

Eighteen member-bound baseline tables carry a multi-sovereign marker
(`share_scope`, `shared_with`, `visibility`, `circle_id`, `recipient_id`,
`to_member_id`, `thread_id`, `participant`):

```
artifact_shares · attention_items · circle_invites · circle_memberships · circles
commons_rooms · comms_events · community_reactions · community_replies
conversation_turns · developmental_memories · holoflower_journal_entries
member_field_note_events · member_idea_recognition_events · offerings
session_artifacts · user_relationship_context · wisdom_fields
```

**Four are counted by the account-closure preflight** (`conversation_turns`,
`developmental_memories`, `holoflower_journal_entries`, `user_relationship_context`).
**Fourteen are named by no located erasure path.**

`developmental_memories` is the locus that matters most here: it is member-bound
by `user_id`, carries an in-row embedding, carries `visibility` and `share_scope`
columns — **and no located memory-retrieval path filters on either**. A column
that would express another sovereign's stake in the row is declared and unread.

Where multi-sovereign boundaries *are* enforced, F5-A §6 records the pattern and
it is unchanged: manuscript erasure refuses `declared_in_other_works`; circle
withdrawal tombstones rather than deletes; an unowned session cannot be purged.

---

## 6. The graph, compressed

```
                    account closure ──counts 35──┐
                          │ refuses              │
                          ▼                      ▼
  302 member-bound     [ 35 seen ]        [ 267 unseen by any located path ]
  baseline tables           │                      │
                            │                      ├─ 71 with no members FK
                            │                      └─ 169 FK-bearing, unnamed
                            │
  delete-my-memory ──targets 5── none of which exist canonically
                            │
  domain paths ──reach── manuscripts · one session's turns ·
                         one circle response · one export archive
                            │
  vault bytes ──PROVEN ERASED via destroyVaultBytes (absence observed)
  logs ──── raw identifiers guarded at build time; content ungoverned
  caches ── process-local, non-durable
  derived ─ 7 of 11 loci carry no source reference → LINEAGE GAP
```

---

## 7. What F5-C did not establish

- Any runtime fact. Every standing above is repository reachability; **runtime
  exercise is UNWITNESSED throughout.**
- That the baseline was in fact captured from production — only that its own
  contract requires it.
- Row counts, occupancy, or whether any locus presently holds member material.
- Whether the 267 unseen loci contain personal material in practice; the
  classification is *not reached by a located erasure path*, which is a statement
  about mechanism, not about content.
- Whether post-baseline migrations added further member-bound loci beyond those
  named individually.
- Whether the four non-existent closure-list names ever existed.
- What any of this should become. **Not asked, not answered.**

---

## 8. Standing

```
F5-C             COMPLETE

Inventory        634 canonical tables · 302 member-bound
PROVEN ERASED               manuscript custody · vault bytes · queued refs ·
                            per-capsule · per-archive · sanctuary session turns
PROVEN NON-PARTICIPATING    recall gates (conversational · episodic) ·
                            anchor surface preference · atom return preference ·
                            sanctuary non-creation · raw ids in logs (build guard) ·
                            in-process caches (non-durable)
PROVEN RETAINED             none assigned — would require runtime evidence
NOT GOVERNED BY LOCATED
  ERASURE PATH              267 member-bound loci, incl. developmental_memories,
                            episodic_memories, journals, interpretive ledgers,
                            14 of 18 multi-sovereign loci, 2 of 8 embedding loci
UNRESOLVED                  memory_cut1_trace_runs · emitted log content ·
                            declined_at (no reader) · visibility/share_scope
                            (declared, unenforced at retrieval)

LINEAGE GAP      7 of 11 derived loci carry no source reference; 3 carry only
                 a session id. RECORDED, NOT REPAIRED.

Instrument correction stated: baseline schema omitted from the first pass.

Mutation NONE · Repair NONE · Schema UNTOUCHED · Migration NONE
Production UNTOUCHED · Recommendation NONE · F5-D NOT CHOSEN
```

> *The organism erases well where it has built a path, guards identifiers at the
> boundary where it has built a guard, and holds 267 member-bound loci that no
> located path names. What it cannot presently do is say what was computed from
> what — so even a complete erasure of sources would leave the derivatives
> unidentifiable as theirs.*
