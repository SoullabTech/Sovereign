# LOOP 5 — Relational Identity Trace (`relationshipId` across every boundary)

**Date:** 2026-08-13 · **Mode:** READ-ONLY mechanical trace · **Author:** JARVIS reconciliation lane
**Scope:** Loop 5 (identity trace) + Loop 6 (data ↔ experience) + Loop 4 (bounded production witness)
**Explicitly NOT in scope:** R&D recovery, git lineage narrative, capability matrix — those belong to
`docs/architecture/audits/RELATIONAL_FIELD_RND_TO_PRODUCTION_RECONCILIATION.md` (separate owner).
Nothing here was edited, fixed, deployed, or mutated.

**Evidence tags:** `SOURCE-PROVEN` (read at a named git ref) · `PRODUCTION-PROVEN` (read-only prod
SELECT / running SHA) · `INFERRED` · `UNRESOLVED`.

---

## §0. Ref binding — the starting premise is WRONG

| Claim in the mandate | Finding | Tag |
|---|---|---|
| trunk `origin/clean-main-no-secrets` = `52a3b924b` | ✅ confirmed (`52a3b924b7cf52013c1c8b0d635359c2cad672fc`) | SOURCE-PROVEN |
| production runs `9aefae046` | ✅ confirmed — `docker exec maia-sovereign printenv GIT_COMMIT` → `9aefae046`; container created `2026-08-13T16:32:45Z` | PRODUCTION-PROVEN |
| "these are DIVERGED" | ❌ **FALSE.** They are **not** diverged. `git merge-base --is-ancestor 52a3b924b 9aefae046` → **true**. `rev-list --count 9aefae046..52a3b924b` = **0**; `52a3b924b..9aefae046` = **15**. | SOURCE-PROVEN |

**Production is 15 commits AHEAD of trunk, and trunk is wholly contained in production.**
This is a fast-forward relationship, not a fork. Production is running unmerged work
(`c2d8f0f04 … 9aefae046`: the SECREM-001/ph2-001/R1/R2 continuity + voice line).

⚠️ **Consequence for this trace:** "trunk vs production" is not a two-sided comparison. Everything
true at trunk is true at production unless one of those 15 commits changed it. Only **one**
relational-path file differs across the two refs:

```
git diff --stat 52a3b924b 9aefae046 -- <all relational path files>
 app/api/sovereign/app/maia/route.ts | 4 ++++
```

…and that 4-line insertion is `originRoute: '/api/sovereign/app/maia'` (R1 serving-route witness).
**It is unrelated to relationship identity.**

> **Therefore: the entire Loop-5 boundary table below is IDENTICAL at trunk and at production.**
> `lib/consciousness/relationalObserver.ts`, `lib/relationships/relationshipSignalService.ts`,
> `app/api/sovereign/app/maia/list/route.ts`, `app/relationships/page.tsx`,
> `app/relationships/[id]/page.tsx`, `app/api/relationships/**` are **byte-identical** at both refs.
> Each row is stated once and holds for both. `SOURCE-PROVEN` at both refs.

---

## §1. CONTRADICTION — the named starting component does not exist

| Starting evidence | Finding | Tag |
|---|---|---|
| `components/relationships/RelationshipConversation.tsx` sends `consciousnessContext: { source: 'relationships:room', relationshipId }` | ❌ **The file exists in NO ref.** Absent at `52a3b924b`, absent at `9aefae046`, absent at `HEAD`, absent from the working tree, and absent from **every** local and remote branch (scanned all `refs/heads` + `refs/remotes`). | SOURCE-PROVEN |
| the string `'relationships:room'` | ❌ **Zero occurrences** anywhere at either ref. | SOURCE-PROVEN |
| `consciousnessContext` carrying a `relationshipId` | ❌ Only **two** senders exist at prod — `components/academy/AcademySheet.tsx:251` and `components/consciousness/BetweenChatInterface.tsx:251`. **Neither is the relationship room and neither carries a `relationshipId`.** No `lib/**` consumer reads it for relationship identity. | SOURCE-PROVEN |

**The real mechanism has a different name.** The relationship room hands identity to MAIA via
`seedFromSource('relationships:thread', …, { contextId: id })` → localStorage → `OracleConversation`
→ request field **`relationshipContextId`** (not `consciousnessContext.relationshipId`).

⛔ **Do not cite `RelationshipConversation.tsx` or `consciousnessContext` in the reconciliation
document.** They are phantom referents. The correct chain is traced in §2.

---

## §2. THE BOUNDARY TABLE (identical at trunk `52a3b924b` and production `9aefae046`)

Two distinct lanes exist. Trace both.

### Lane A — MAIA conversation (the "Take this to MAIA" handoff)

| # | Boundary | Mechanism (exact) | Class | Tag |
|---|---|---|---|---|
| A1 | **component** — relationship room | `app/relationships/[id]/page.tsx:194` — button "Take this to MAIA" → `seedFromSource('relationships:thread', 'I want to bring this into our conversation.', { contextId: id })` then `router.push('/maia')` | **PRESENT** | SOURCE-PROVEN |
| A2 | **component → component** (localStorage hop) | `lib/maia/seedPrompt.ts:84` writes `contextId` into `MAIA_SEED_META_KEY` (`maia_seed_meta`) | **TRANSFORMED** (`relationshipId` → `meta.contextId`; crosses a client-storage boundary, not HTTP) | SOURCE-PROVEN |
| A3 | **seed consumption** | `components/OracleConversation.tsx:1721-1723` — `if (seed.source === 'relationships:thread' && seed.contextId) sessionRelationshipContextId.current = seed.contextId` — held in a ref **for the whole session** | **TRANSFORMED** (→ session-sticky ref) | SOURCE-PROVEN |
| A4 | **request payload** | `components/OracleConversation.tsx:5266-5268` — `...(sessionRelationshipContextId.current && { relationshipContextId: … })` | **TRANSFORMED** (renamed `relationshipContextId`) | SOURCE-PROVEN |
| A5 | **route handler — READ side** | `app/api/sovereign/app/maia/list/route.ts:874` — `const handoffId = (body as any)?.relationshipContextId` → `getMemberActiveRelationalContext(userId, { relationshipId: handoffId })` (Sanctuary-gated, explicit-handoff-only) | **PRESENT** ✅ | SOURCE-PROVEN |
| A6 | **consciousnessContext** | ❌ **not a boundary in this system.** `app/api/sovereign/app/maia/route.ts:97` destructures `{ sessionId, message, includeAudio, voiceProfile, userId, ...meta }`; `consciousnessContext` would land in `...meta` and be spread into `getMaiaResponse({ meta })`, but **no `lib/**` code reads it for relationship identity.** | **IGNORED** | SOURCE-PROVEN |
| A7 | **MAIA / orchestrator (prompt)** | `relationalContextAddendum = formatRelationalContextForPrompt(relCtx)`; `relationalContextId = relCtx.relationshipId` (`list/route.ts:872-882`), surfaced at `:1248` in context-inventory | **PRESENT** ✅ | SOURCE-PROVEN |
| A8 | **relational observer** | `list/route.ts:1642` — `observeRelationalContent(userId, message, orchestratorResult.text, { isSanctuary })`. Signature (`lib/consciousness/relationalObserver.ts:127`) is `(memberId, userMessage, maiaResponse, posture)` — **there is no relationship parameter at all.** | **NULL** (identity structurally cannot be passed) | SOURCE-PROVEN |
| A9 | **signal persistence** | `list/route.ts:1654` — `persistDetectedSignal(userId, detected, null, sourceTurnId)`. Signature (`relationshipSignalService.ts:153`) **does** accept `relationshipId?: string \| null` — a **literal `null`** is passed. Same at `app/api/sovereign/app/maia/route.ts:386`. | **NULL** (parameter exists, deliberately voided) | SOURCE-PROVEN |
| A10 | **relationship entry** | `relationalObserver.ts:161-179` — resolves-or-creates a per-member bucket `WHERE name = 'Unresolved Relational Field'`, then `insertOne('relationship_entries', { relationship_id: <bucket>, confidence, … })` and `relationship_entry_patterns` | **REPLACED** ⛔ (the handed-off relationship is substituted by the catch-all bucket) | SOURCE-PROVEN |
| A11 | **retrieval** | `getMemberActiveRelationalContext(userId, { relationshipId: handoffId })` reads the **handed-off** relationship — which contains none of the observer's writes | **PRESENT but disjoint** | SOURCE-PROVEN |
| A12 | **subsequent MAIA turn** | Session-sticky ref re-sends `relationshipContextId` each POST → read succeeds; but every turn's observation went to the bucket | **PRESENT (read) / REPLACED (write)** | SOURCE-PROVEN |

### 🔑 The mechanical crux (single most important finding)

**Read and write happen inside the SAME function, in the SAME request, and the identity is in
lexical scope at the write site.**

`app/api/sovereign/app/maia/list/route.ts` has exactly one `POST` handler (line 262).
- `let relationalContextId: string | undefined;` declared **line 872**, assigned **line 882**.
- `observeRelationalContent(userId, …)` at **line 1642** — no relationship arg (none exists).
- `persistDetectedSignal(userId, detected, **null**, sourceTurnId)` at **line 1654**.

`relationalContextId` (and `handoffId`) are live variables at line 1654. The identity is **not lost
in transit — it is discarded at the write.** `SOURCE-PROVEN`.

The route's own comment (`list/route.ts:860-863`) admits the inverse half of this:
*"MAIA wrote relational content on every live turn … and never once read it back. This closes that
loop on the live route."* The **read** loop was closed. The **write** loop was not.

### Lane B — member gesture (manual entry / check-in)

| # | Boundary | Mechanism | Class | Tag |
|---|---|---|---|---|
| B1 | component | `app/relationships/[id]/page.tsx:303` textarea → `POST /api/relationships/${id}/entries` | **PRESENT** | SOURCE-PROVEN |
| B2 | route handler | `app/api/relationships/[id]/entries/route.ts:77,99-100` — `const { id } = await params;` → `insertOne('relationship_entries', { relationship_id: id, … })` | **PRESENT** ✅ | SOURCE-PROVEN |
| B3 | check-in | `app/api/relationships/[id]/checkin/route.ts:37,97-98,111-113` — `relationship_id: id`, plus `relationship_field_state` upsert | **PRESENT** ✅ | SOURCE-PROVEN |
| B4 | observer/MAIA | Lane B never touches the observer | n/a | SOURCE-PROVEN |

---

## §3. DECISIVE ANSWER — can a member's typed words attach to THAT relationship today?

**YES — but only via member gesture, and NOT via conversation.** Two facts, both `SOURCE-PROVEN`
at both refs:

1. ⚠️ **There is no MAIA conversation composer inside the relationship room at all.**
   `app/relationships/[id]/page.tsx` (381 lines) imports only `FieldToneIndicator`, `CheckInFlow`,
   `RelationshipTimeline`, `seedFromSource`. It calls `GET/PATCH /api/relationships/[id]`,
   `POST /api/relationships/[id]/entries`. **It never posts to any MAIA route.**
   The mandate's decisive behavioural test — *"a message typed in a specific relationship's room"* —
   **has no in-room conversational referent to test.** Typed words in that room go through a
   note/threshold/reflection composer, not a chat.

2. **The two lanes, stated precisely:**
   - ✅ **Member gestures that attach correctly** — `POST /api/relationships/[id]/entries` and
     `POST /api/relationships/[id]/checkin`. Both bind `relationship_id` directly from the route
     param. Written with `confidence = NULL` (member-declared). **Correct, verifiable, working.**
   - ⛔ **Conversation / observer material that does not** — everything on the MAIA route.
     Even after an explicit "Take this to MAIA" handoff where the route **successfully reads** the
     relationship, `observeRelationalContent` cannot receive it (no parameter) and
     `persistDetectedSignal` is handed literal `null`. **100% of it lands in the bucket or nowhere.**

**The net shape: MAIA can read a relationship but can never write to one.**

---

## §4. LOOP 6 — production DB, re-measured 2026-08-13 (`PRODUCTION-PROVEN`)

Read-only SELECTs via `ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc …'`.

| Metric | Value |
|---|---|
| `member_relationships` total | **46** (38 not archived) |
| … named `'Unresolved Relational Field'` | **31** |
| … distinct members with any relationship | **31** |
| … distinct members with a bucket | **31** |
| `relationship_entries` total | **1190** |
| … sitting in `'Unresolved Relational Field'` buckets | **1172 (98.5%)** |
| … `confidence IS NULL` (member-declared) | **18** |
| … `confidence IS NOT NULL` (observer-inferred) | **1172** |
| … created last 7 days | **89** |
| … created last 30 days | **160** |
| `member_relational_signals` total | **440** |
| … with non-null `relationship_id` | **0** |

**Derived, exact:**
- **31 of 31 members have a bucket. Every single member who has any relationship row has one.**
- **Observer entries (1172) = bucket entries (1172).** The correspondence is total: *every* inferred
  entry is in a bucket, and *every* bucket entry is inferred. **Zero leakage in either direction.**
- **0 / 440 signals carry a relationship_id** — exact confirmation of the literal `null` at A9.
- Only **15** of 46 relationships are human-named; **31** are machine-generated buckets. **The
  observer has authored twice as many "relationships" as members have.**

**Recency asymmetry (the live-drift measurement):**

| Lane | Latest row | Volume |
|---|---|---|
| Observer → bucket (`confidence IS NOT NULL`) | **2026-08-13 (today)** | 89 in last 7 days |
| Member gesture (`confidence IS NULL`) | **2026-07-06** | 18 total, ever |

⚠️ **The misattributing lane is writing today. The correct lane has been silent for 5+ weeks.**
The gap is widening in production, right now.

Entry kinds (all lanes): `note` 592 · `reflection` 286 · `threshold` 189 · `rupture` 107 ·
`checkin` 14 · `repair` 2.

### (a) Given this DB state, what member-facing experience does it produce?

A member opens `/relationships` and sees their human relationships **beside a card literally titled
"Unresolved Relational Field"** — a system artifact rendered as a peer of their named people.
Opening it shows a timeline of MAIA's inferences about their relational life, correct in content but
detached from every person it concerns. Their named relationships stay nearly empty (18 entries
across all members, ever) while the bucket accumulates (1172). MAIA, in conversation, never refers
back to a specific person from prior turns — because no turn ever wrote to a person. The system
appears to be *watching* rather than *accompanying*: it demonstrably noticed, but filed everything
into an undifferentiated heap. `INFERRED` (from PRODUCTION-PROVEN counts + SOURCE-PROVEN render path).

### (b) What persistence state produced the founder's screenshot?

**Exactly reproduced.** The founder's member id is `ce284751-e457-42f6-89b6-bc07d0876682`, holding
**7 named relationships + 1 bucket = 8 cards** — matching the screenshot's Jason, Nathan, Augusten,
Tara, Sophie, Andrea, Alex + "Unresolved Relational Field". `PRODUCTION-PROVEN`.

**The exact query and component:**

- **Query** — `app/api/relationships/route.ts:21-31`:
  ```sql
  SELECT r.id, r.name, r.realm, r.bond_type, r.note, r.created_at, r.updated_at,
         fs.field_tone, fs.active_signals, fs.dominant_pattern, fs.last_checkin_at
  FROM member_relationships r
  LEFT JOIN relationship_field_state fs ON fs.relationship_id = r.id
  WHERE r.member_id = $1 AND r.archived_at IS NULL
  ORDER BY COALESCE(fs.last_checkin_at, r.updated_at) DESC
  ```
  ⚠️ **There is no name filter and no provenance filter.** Member-authored relationships and
  observer-authored buckets are indistinguishable to this query.

- **Component** — `app/relationships/page.tsx:26` `fetch('/api/relationships')` → `:115` group by
  realm → `:124` `items.map((r) => <RelationshipCard …>)`. **No `Unresolved` special-case exists**
  (grep for `Unresolved` in that file: zero hits).

- **Root cause:** `relationalObserver.ts:172-178` inserts the bucket into `member_relationships`
  with `realm: 'outer'` — the *same table and same realm* as human relationships. It is a
  first-class row, so it renders as a first-class card. The list page has never been reshaped
  (only `/relationships/[id]` was, and that work is not at trunk or production).

---

## §5. LOOP 4 — bounded production witness

Per mandate: **no authentication as any real member, no walking production with member data.**
Evidence restricted to running SHA, container state, and read-only SELECTs.

| Item | Finding | Tag |
|---|---|---|
| Running SHA | `9aefae046` | PRODUCTION-PROVEN |
| Container created | `2026-08-13T16:32:45Z` (today) | PRODUCTION-PROVEN |
| Serving route for MAIA turns | `app/api/sovereign/app/maia/list/route.ts` — the route holding both the read bridge and the null write | SOURCE-PROVEN |
| `app/api/oracle/conversation` | Retired **410** (`route.ts:452`); it is the *only other* reader of `relationshipContextId` (`:703`) and is dead. | SOURCE-PROVEN |

**Behavioural test — resolved by structure, not by walk.** The mandate's decisive test presupposes a
conversation composer inside the relationship room. §3 establishes `SOURCE-PROVEN` that **no such
composer exists at either ref**, so the walk cannot be performed against trunk or production code —
there is nothing to type into. The equivalent reachable test (handoff → type in `/maia`) is answered
mechanically and unambiguously by A8/A9/A10: **the observation attaches to the bucket, and the
signal attaches to nothing.** The production counts in §4 (1172/1172 and 0/440) are the aggregate
witness of exactly that outcome across 31 members. No local walk could produce stronger evidence
than the 100%-correspondence already measured in production.

### ⚠️ CONTRADICTION found in the local dev DB — flagged, unresolved

`localhost:5432 maia_consciousness` (separate from production):

| Metric | Local | Production |
|---|---|---|
| `member_relationships` | 18 | 46 |
| `'Unresolved Relational Field'` | 4 | 31 |
| `relationship_entries` | 283 | 1190 |
| `member_relational_signals` with `relationship_id` | **36 of 38** | **0 of 440** |

**Local has 36 signals carrying a non-null `relationship_id`; production has zero.** All 36 are
`source = 'maia_conversation'`, created **2026-08-10 → 2026-08-11**, across **2** members.

⚠️ **No code at trunk or at production can produce those rows** — both live call sites pass literal
`null`. They were therefore written by a code path that exists **only outside these two refs**
(a branch, a local patch, or a script). This is consistent with the mandate's note that reshaping
work "is stranded on a branch," but the branch was **not identified** in this loop.

**`UNRESOLVED`** — flagged for the reconciliation document, which owns branch/lineage recovery.
⛔ Do not treat those 36 local rows as evidence that attachment works anywhere; they are evidence
that *something not shipped* once wrote them.

---

## §6. Starting-evidence verdict table

| # | Starting claim | Trunk `52a3b924b` | Production `9aefae046` | Tag |
|---|---|---|---|---|
| 1 | `RelationshipConversation.tsx` sends `consciousnessContext: { source: 'relationships:room', relationshipId }` | ❌ **FALSE — file exists in no ref** | ❌ **FALSE — same** | SOURCE-PROVEN |
| 2 | `app/api/sovereign/app/maia/route.ts` ignores `consciousnessContext` entirely | ✅ **TRUE** (lands in `...meta`, never read for identity) — but **vacuous**, nothing sends it | ✅ **TRUE — same** | SOURCE-PROVEN |
| 3 | `observeRelationalContent(memberId, userMessage, maiaResponse, posture)` has NO relationship parameter | ✅ **TRUE** (`relationalObserver.ts:127`) | ✅ **TRUE — byte-identical file** | SOURCE-PROVEN |
| 4 | `persistDetectedSignal(memberId, detected, relationshipId?, sourceTurnId?)` HAS the parameter, passed literal `null` at both live call sites | ✅ **TRUE** (`signalService.ts:153`; call sites `list/route.ts:1654`, `maia/route.ts:386`) | ✅ **TRUE — same** | SOURCE-PROVEN + PRODUCTION-PROVEN (0/440) |
| 5 | `relationalObserver.ts` resolves/creates a per-member `'Unresolved Relational Field'` and writes entries there | ✅ **TRUE** (`:161-179`, `:193`, `:209`, `:225`) | ✅ **TRUE — same** | SOURCE-PROVEN + PRODUCTION-PROVEN (31 buckets / 1172 entries) |
| 6 | trunk and production are DIVERGED | ❌ **FALSE — production is 15 commits AHEAD; trunk is an ancestor** | — | SOURCE-PROVEN |

**Claims 3, 4, 5 fully reproduced independently. Claims 1 and 6 are false. Claim 2 is true but
describes a channel nothing uses — the real channel is `relationshipContextId`.**

---

## §7. What this loop does NOT establish

Held open rather than completed, per stop conditions:

- ⛔ Which branch produced the 36 local `relationship_id`-bearing signals (§5). **UNRESOLVED.**
- ⛔ Whether the observer's bucket design was intentional-and-provisional or an unreviewed default.
  The code comment (*"observations accumulate here until the member explicitly maps them"*) implies
  a mapping gesture was intended; **no such mapping surface was found at either ref**. `UNRESOLVED`.
- ⛔ Member-felt experience. §4(a) is `INFERRED` from counts and render path, **not** member witness.
  No member phenomenology was collected. It must not be cited as experiential evidence.
- ⛔ **Nothing here authorizes a fix.** This is a discovered gap, not homework. Passing `handoffId`
  into the write sites is a two-line change that is *mechanically obvious* and *constitutionally
  non-obvious* — it would make MAIA's inferences write onto named people, which is a Sanctuary /
  provenance / consent question (observer-inferred content acquiring a person's identity), not an
  implementation question. State: `DISCOVERED`. Escalation belongs to the reconciliation document.
