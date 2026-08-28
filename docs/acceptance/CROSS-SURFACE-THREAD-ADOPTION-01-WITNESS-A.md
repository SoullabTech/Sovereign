# CROSS-SURFACE-THREAD-ADOPTION-01 — Witness A

**Web ↔ web live adoption · ACCEPTED 2026-08-28**

---

## 1. Candidate

```
candidate SHA   1377e8b435195e345129e1196ceb629ec536d5f0
branch          claude/cross-surface-thread-adoption-01
pinned          detached worktree at /tmp/witness-1377e8b4, frozen for the duration
target          http://127.0.0.1:3110  (isolated local witness, never production)
```

The candidate was not modified at any point during this witness. See §10.

## 2. Acceptance rule

```
PASS = A0 ∧ A1 ∧ A2 ∧ A3

A0  Window 2 mounted and settled — exchange 1 rendered on screen — strictly
    before exchange 2 began. A genuine prior observer, not a late mount.
A1  Window 1's exchange 2 completed and settled, established by authenticated
    canonical-turn observation at 250 ms sampling resolution — not by
    elapsed-time inference and not by a sleep.
A2  Window 2 adopted it with no reload and no interaction, within 5000 ms.
A3  The adopted exchange appears exactly once, in canonical position.
```

Polling was **diagnostic only** and never an assertion. The UI adoption is the
assertion; the poll chronology explains *how* it happened and is used only to
classify a failure.

## 3. Substrate — bootstrap ledger

The witness database is **not** a migration-built database. Stated precisely so
this cannot later be read as evidence about migration integrity:

```
empty isolated witness DB (volume destroyed and recreated; 0 tables verified)
+ complete production-derived schema-only transplant
    - schema metadata only: no rows, no member data, no conversations, no memory corpus
    - no ownership, privileges or comments
    - pgvector + pgcrypto arrived with the dump itself
+ production schema_migrations ledger only (500 rows: filenames, checksums, applied_at)
    - operational migration metadata; no member content
+ canonical migration chain NOT exercised — superseded by the transplant
+ candidate at 127.0.0.1:3110
```

Isolation was affirmatively proven before any exchange:

```
members 0 · conversation_turns 0 · auth_sessions 0 · schema_migrations 500
pg_stat_user_tables with rows > 0 (excluding schema_migrations): (0 rows)
```

The transplant carried production's real write gates, so the witness exercised
them rather than a simplified schema:

```
conversation_turns
  exchange_id  uuid
  seq          smallint NOT NULL DEFAULT 0
  "idx_conversation_turns_exchange_role" UNIQUE btree (exchange_id, seq) WHERE exchange_id IS NOT NULL
  BEFORE INSERT  s5_refuse_tombstoned_trigger
  BEFORE INSERT  s5_require_minted_provenance_trigger
  posture_at_creation TEXT NOT NULL (no default)
```

## 4. Final run — measured evidence

```
RUN=MTDIKUV8   CANDIDATE=1377e8b4   TARGET=http://127.0.0.1:3110   EXIT=0
HEALTH=200

NONCE_E1=WITNESS_A_E1_1377e8b4_MTDIKUV8
NONCE_E2=WITNESS_A_E2_1377e8b4_MTDIKUV8

A1_SEED=PASS exchange=3ebceed0-b2f3-4656-b98d-9d249bcab2c5 session=session_1787955565084

A0 detail: tRestored=1787955567243  tA0=1787955571480  tEx2Start=1787955571480
           restored_before_ex2_ms=4237   settle_delta_ms=0

A0=PASS
A1=PASS
A2=PASS elapsed_ms=898  adopted_before_A1=false
A3=PASS occurrences=1   canonical_order=true
WITNESS_A=PASS

window 2 /api/conversation/turns (diagnostic)
  before A0: 3   after A0: 1
  +1155ms  200  /api/conversation/turns
```

Window 2 had exchange 1 on screen **4.237 seconds** before exchange 2 began, so
mount-time history restoration cannot explain the result. It then adopted the
new exchange **898 ms** after canonical completion, off a single `200` poll,
without being touched, focused, scrolled or reloaded.

## 5. Repetition

```
run         A0            A1     A2                A3
MTDIHFMV    FAIL (tie)    PASS   PASS  906 ms      PASS  occurrences=1  canonical=true
MTDIITJM    FAIL (tie)    PASS   PASS  905 ms      PASS  occurrences=1  canonical=true
MTDIJK1I    FAIL (tie)    PASS   PASS  930 ms      PASS  occurrences=1  canonical=true
MTDIKUV8    PASS          PASS   PASS  898 ms      PASS  occurrences=1  canonical=true
```

**The four-gate PASS is one run (MTDIKUV8), not four.** The record must not be
read as `A0 PASS ×4`.

In the first three runs A0 was evaluated by `tA0 < tEx2Start`, two timestamps
captured in program order with no `await` between them; they landed in the same
millisecond and the strict comparison failed on clock resolution. That assertion
could only ever fail on a tie, so those three runs did not *test* A0 — they
failed a tautology. Window 2's ordering is guaranteed by program order in all
four runs, but the substantive condition (exchange 1 rendered before exchange 2
began) was only **measured** in MTDIKUV8.

What the repetition does establish is A1–A3 across four independent runs:
adoption latency `906 · 905 · 930 · 898 ms`, no duplicates, canonical order every
time. A scheduling accident is not a plausible explanation for that spread.

## 6. What this witness establishes

A mounted `/maia` web surface discovers and adopts a subsequently completed
canonical exchange authored on another simultaneously active web surface,
without reload or member action, preserving identity and canonical order.

Specifically exercised:

- visible-surface polling and its gate (`mayPoll` refusing while a turn is in flight)
- canonical tail retrieval — the repaired newest-100 read in `app/api/conversation/turns/route.ts`
- `exchange_id` + `seq` representation matching (`representationKey`, `localRepresentations`)
- `planAdoption` — additive, identity-keyed, never wholesale replacement
- insertion anchoring (`afterLocalId` / `beforeLocalId`)
- duplicate suppression (`occurrences=1`, four runs)

...against production's actual `conversation_turns`, including the
`s5_require_minted_provenance` and `s5_refuse_tombstoned` insert triggers.

**Incidental observation of independent value.** Every language provider was
unavailable throughout (see §8). Both halves of each exchange nonetheless became
durable — the member's words were not lost to the outage, and the failure was
recorded as a turn rather than vanishing. Server timing: `getMaiaResponse ok in
261ms`, `durableMaiaTurn ok in 263ms`. The F1 durability boundary held under
total provider failure, observed under conditions nobody arranged.

## 7. Explicit non-claims

These are part of the acceptance, not footnotes to be dropped later.

```
Provider qualification
  Language providers were unavailable. Assistant content was the durable
  fail-closed response string. Valid for adoption because adoption is
  content-agnostic by design — it keys on exchange_id + seq, never on text.
  This does NOT witness normal-provider conversation behaviour. No run has
  been made with a working provider.

Database qualification
  Production-derived schema transplant, NOT a migration-built database.
  MIGRATION-BOOTSTRAP-01 remains FAILED / OPEN and is not repaired,
  mitigated, or made less severe by this PASS.

Surface qualification
  Web ↔ web only. No Electron/Desktop behaviour is witnessed or inferred.
  Desktop identity carry, capture release, shell containment and lifecycle
  remain unwitnessed.

Outstanding witnesses
  E — Desktop ↔ web adoption     NOT RUN
  B — midnight boundary          DEFERRED to natural day rollover
  C/D — streaming voice          GATED: KOKORO_TTS_URL absent from the
                                 witness environment; cloud TTS is not an
                                 authorised workaround
```

## 8. Open incidental findings

None repaired during this witness. Each is recorded for separate disposition.

```
MIGRATION-BOOTSTRAP-01   FAILED / OPEN
  Canonical migrations cannot construct a database from zero. Four confirmed
  mechanisms:
    A. creation provenance absent — production relations with no executable CREATE
       (developmental_memories, integration_passes, studio_people, studio_meetings)
    B. cross-file temporal ordering — ALTER before the later CREATE (5)
    C. foreign-key temporal dependency — FK target created later
       (comms_threads, marketing_contacts, and overlaps)
    D. intra-file ordering — 20260204000001_engine_comparisons.sql:28 creates a
       view joining maia_misattunements, which line 44 of the same file creates
  Also: the repository's only DDL for developmental_memories lives in a markdown
  document (CONSCIOUSNESS_MEMORY_SYSTEM_COMPLETE.md:212) and materially
  contradicts both the runtime and a later migration — created_at vs formed_at,
  REAL[] vs pgvector, six columns absent, significance REAL vs the NUMERIC the
  migration's own function signature requires.
  Severity: 20260112000010 is the first entry in required_migrations.txt — the
  schema gate's declared boot prerequisite — and cannot execute against the
  schema its own predecessors produce.
  Historical migration files must NOT be edited: schema_migrations checksums
  make that production-breaking.

SUBSTRATE-INFERENCE-01   OPEN
  Anthropic 401 (API key invalid); Ollama fallback model llama3.1:8b absent;
  OPENAI_API_KEY is the literal template placeholder sk-REPLA*E_ME.
  Non-blocking for adoption.

VOICE-PROVIDER-01        OPEN
  Runtime speech path is "OpenAI TTS error (no fallback - OpenAI TTS only)",
  and the build prints "External AI dependencies found: openai", against
  CLAUDE.md: "Never use OpenAI or other cloud AI providers" and "Voice: Local
  TTS/STT or browser APIs only."

AUDIT-PATH-01            OPEN · non-blocking
  Container prepares /app/data/audit-logs; runtime writes ./audit-logs.
  Observed: EACCES mkdir './audit-logs'. Affects any container built this way.

unnamed, minor
  403 /api/relationship-essence?soulSignature=soul_guest from a signed-in surface
  aria-label="Text input" applied to a <button>, not an input
  fixed "Report a bug" control (z-[60]) intercepts pointer events over content
  /api/members/register returns 429 after repeated runs (rate limit)
  relation "audit_logs" / "lattice_nodes" do not exist — expected transplant
    consequences, non-blocking, filed under MIGRATION-BOOTSTRAP-01
```

## 9. Disposition

```
WITNESS_A = PASS · ACCEPTED
Witness E = NEXT
```

## 10. Integrity of the acceptance

**No candidate implementation change was made to obtain this pass.** The
candidate stayed pinned at `1377e8b4` throughout; the database was never altered
to accommodate a failing assertion; no API key was repaired to reach a verdict.
Only the external witness harness (`/tmp/witness-a-1377e8b4.mjs`, outside the
repository) was corrected, each time because one of *its* assumptions was
falsified.

That progression is preserved deliberately — it shows the acceptance apparatus
being corrected rather than the implementation being tuned to the test:

```
HARNESS-ENTRY-01           harness assumed /maia opens in text mode. It opens in
                           VOICE mode; the composer is intentionally absent and
                           MAIA offers a "Switch to text mode" control. Repaired
                           by using that control, not by forcing state.

composer mis-binding       harness fell back to [aria-label="Text input"], which
                           is a <button>, and concluded text mode was already
                           active. Repaired to bind the textarea only.

locator ambiguity          two "Switch to text mode" controls exist (desktop and
                           an md:hidden twin); a non-.first() locator threw under
                           strict mode and was swallowed as "not visible".

hydration race             a one-shot dispatch before React attached its handler
                           was a silent no-op. Repaired with wait-and-retry.

HARNESS-A1-OBSERVATION-01  A1 was observed through a parallel API client rather
                           than the page's own credential, and assumed a session
                           id. Repaired to discover the canonical thread through
                           the member's recent turns, read with the page's own
                           credential. SUBSTRATE_NO_RESPONSE, raised while this
                           defect was active, was WITHDRAWN: the server had
                           completed and durably written the exchange in ~263 ms.

out-of-scope TTS           speech generation was invited into a text-adoption
                           experiment. Repaired by disabling MAIA's voice through
                           the supported control plus the same persisted
                           preference key the control writes.

A0 assertion               compared two timestamps captured in program order with
                           nothing between them; it could only fail on a clock
                           tie, and did, three times. Replaced with a substantive
                           assertion — exchange 1 rendered on screen strictly
                           before exchange 2 began — which is a stronger claim
                           than the one it replaced, not a relaxed one.
```

An identity-split hypothesis was raised and **falsified** rather than assumed:
every canonical turn was written under `31276ae6-134c-41f8-a126-70d11d9aef3b`,
the same and only member the harness authenticated as.
