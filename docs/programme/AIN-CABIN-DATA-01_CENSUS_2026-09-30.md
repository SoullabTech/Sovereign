# AIN-CABIN-DATA-01 — Local Member/Data Authority Census

**Status:** census complete; falsifier suite next  
**Base:** 9909a1cf6  
**Question:** which existing local substrate can become the single authoritative local store for the member's own Cabin field?

## Governing sentence

> **Cabin memory must be locally authoritative for the member's field; browser claims, stale caches, and legacy memory stores may not impersonate that authority.**

## Existing candidates

### Candidate A — lib/memory/stores/SQLiteMemoryStore.ts

A real SQLite implementation using better-sqlite3.

It currently owns four memory concepts:

- core_memory
- working_memory
- recall_memory
- archival_memory

It also stores memory associations and optional embeddings.

**Defeat:** it has no canonical member record, no Living Work model, no manuscript model, no Work-expression declaration, and no authenticated ownership boundary. Making it the Cabin authority would collapse the newer Work/Manuscript ontology into an older memory schema.

### Candidate B — lib/services/DatabaseService.ts

A generic SQLite service using sqlite3 + sqlite.

Its built-in migrations create:

- users
- memories
- analytics_events
- daimonic_encounters
- configurations
- user_api_keys

lib/core/ServiceRegistry.ts can configure it with sqlite:///data/spiralogic.db.

**Defeat:** the service is explicitly marked as prototype/unused in its source boundary, and its schema does not represent the canonical members, living_works, living_work_expressions, member_manuscripts, or current memory provenance model. It is therefore a substrate candidate, not an authority we can adopt by fiat.

### Candidate C — browser localStorage

Existing identity and preference code uses keys such as explorerId, beta_user, explorerName, and room-specific preferences.

**Defeat:** browser storage is member-editable and therefore cannot establish identity or ownership. Writer's Studio explicitly refuses to derive member, Work, or conversation identity from it. It remains suitable only for expendable presentation/preferences where an existing contract permits it.

### Candidate D — PostgreSQL

This is the current canonical server authority. Living Works, expressions, manuscripts, member identity, House preferences, and most memory services resolve here.

**Defeat for Cabin:** it is not local to the Desktop. Keeping it as the Cabin's hidden authority would make Runtime-01 a local renderer around a remote/cloud-dependent data plane rather than a sovereign Cabin.

## Canonical data that the Cabin must eventually own

### Identity

The canonical member endpoint resolves identity from a verified credential and the members table. Client-provided member IDs are explicitly refused.

### Works

living_works is member-owned. Work identity is not inferred from browser state.

### Declarations

living_work_expressions is the authority for the relationship between a Work and an expression such as a manuscript. A manuscript may intentionally belong to more than one Work.

### Manuscripts

member_manuscripts is member-owned authored material. The current Studio deliberately re-derives Work context from manuscript identity plus declaration rows instead of persisting a "last Work" guess.

### House

house_member_preferences is durable member state with revision/optimistic-concurrency semantics.

### Memory

Current session memory and several other memory systems are PostgreSQL-backed. The existing SQLite memory implementation cannot simply be substituted because its ontology and authority model differ.

## Falsifier requirements

A local candidate is defeated if it cannot prove all of these:

1. **Identity authority:** a member record can be resolved without trusting a browser-supplied member id.
2. **Ownership:** a Work cannot be read or mutated across member boundaries.
3. **Declaration semantics:** a manuscript can declare zero, one, or multiple Works without silent selection.
4. **Durability:** a Work/manuscript/declaration survives process restart.
5. **Reload derivation:** current Work is derived from manuscript identity plus declarations, not from a stored "last Work" field.
6. **Memory separation:** memory records can be scoped to the local member without becoming a second Work identity system.
7. **No cloud fallback:** when the local store is unavailable, the Cabin reports unavailable rather than silently querying PostgreSQL.
8. **Single authority:** the same local store owns identity, Work declarations, manuscripts, and the first local memory slice; no two competing local databases are introduced.

## Non-goals for DATA-01

This lane does not yet reproduce the entire PostgreSQL schema locally.

It does not migrate every administrative, practitioner, analytics, billing, community, or collective table.

The first local field is deliberately limited to the member's inhabited path:

    Identity
      ↓
    House
      ↓
    Work
      ↓
    Manuscript
      ↓
    MAIA conversation / memory

Everything outside that path remains a later capability boundary.


## Implementation and witness result

**Local authority:** `lib/cabin/localStore.ts`, backed by Node SQLite in one durable Cabin database.

**Canonical doors adapted in offline mode:**

- `/api/members/me`
- `/api/members/session`
- `/api/house/preferences`
- `/api/sovereign/living-works`
- `/api/sovereign/living-works/:id`
- `/api/sovereign/living-works/:id/expressions`
- `/api/sovereign/manuscripts`
- `/api/sovereign/manuscripts/:id`

**No second Work/Manuscript API vocabulary was introduced.**

**F1–F8 witness outcome:**

1. identity/session authority — green;
2. member ownership — green;
3. multi-Work manuscript declaration — green;
4. process-restart durability — green;
5. House preference revision semantics — green;
6. PostgreSQL fallback refusal — green;
7. canonical route adaptation — green;
8. packaged standalone restart — green.

**Focused Cabin suite:** 29/29 pass.

**Full Desktop suite:** 387/387 pass.

**Production build:** `next build` completed with exit code 0 and emitted the standalone server, static assets, and public assets.

**Repository type-health:** the no-regression gate found 223 current errors against 239 baselined. One new diagnostic remains in `lib/stripe/config.ts:23`; it is outside this lane. The gate correctly failed rather than absorbing it. No Cabin diagnostic was reported as new.

## Deliberate boundary

MAIA cognition and the larger sovereign memory substrate remain server/PostgreSQL-backed. In Cabin mode, both live MAIA routes fail closed with `503 CABIN_COGNITION_NOT_LOCAL` rather than falling through to PostgreSQL.

That boundary is intentional. The next lane is conversational memory localization, with its own census and falsifier suite before implementation.
