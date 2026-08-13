# PWA Deployment & Continuity Witness — 2026-08-13

**Status:** witness complete. **No repair performed. No cache cleared. No redeploy.**
**Evidence class:** production runtime trace + bound DB turn + deployed-SHA code read.

## The witnessed failure

MAIA on the PWA, to an authenticated member:

> "I don't actually have persistent memory between our conversations by default. Each session
> starts fresh for me unless there's a specific memory system built into the platform you're
> using to reach me."

## Binding the referent

| Question | Answer | Evidence |
|---|---|---|
| Turn identity | `maia_turns.id = 173899`, `2026-08-13 14:46:38+00` | prod DB |
| Session | `voice-3b3ce541-0c1a-42d4-b5a7-82c69ec1c651` | prod DB |
| Member | `ce284751…` (authenticated) | `[MAIA] userId resolved` |
| Deployed SHA | `78ea266c5`, container created `2026-08-13T12:06:17Z` | `printenv GIT_COMMIT` |
| Build lane | `deploy-lane` (tripwire-clean) | `printenv DEPLOY_LANE` |
| Endpoint reached | `sovereign/app/maia/list`, `ROUTE_KNOWN: true` | `[MAIA/runtime]` |
| Profile | **CORE** | `📊 Training data logged | Profile: CORE | Turn ID: 173899` |

The turn is **2h40m newer than the running build**. Not a stale build. Not a stale
service worker. The PWA reached the canonical route.

## Hypotheses, adjudicated

1. **Older deployed build** — ❌ ruled out. Build 12:06Z, turn 14:46Z.
2. **Stale SW serving different routing** — ❌ ruled out. Canonical route reached, turn persisted.
3. **Contributors not populated** — ❌ **ruled out, decisively.**
   - `conversational-block { candidateCount: 6, emitted: true, surfacedCount: 6 }`
   - `episodic-block { candidateCount: 4, emitted: true, surfacedCount: 4 }`
   - `atoms loaded: { count: 8 }` — of `available: 133, eligible: 128`
   - `memoryHealth: conf 'high'` — conv ok, ep ok, atoms ok, rel ok, dev ok
4. **Lost in FAST/CORE/DEEP carriage** — ❌ ruled out. `PROMPT_BLOCK_CHARS: 14947` on CORE.
5. **Prompt/instruction produced the disclaimer** — ✅ **CONFIRMED. This is the cause.**
6. **Deployed referent unbound** — ⚠️ partially true, but **not causal** here. See §Work Review.

### `FALLBACK: true` is a false lead — do not pursue it

`lib/maia/maiaRuntimeContext.ts:269` — `fallbackActive = configured && !!(ollamaUrl && ollamaModel)`.
It reports that a local Ollama fallback is **configured**, not that it was **used**.
Same log line reads `PROVIDER: 'anthropic', MODEL: 'claude-sonnet-4-5'`. The turn ran on
Anthropic. The field name is misleading and should be renamed `FALLBACK_CONFIGURED`.

## Root cause

Memory reached the model. **The model then lied about its own architecture, and the
output-side guard failed to catch the lie.**

Both defenses exist on the deployed SHA and are correctly wired:

- `MEMORY_CANON_GUARD_PROMPT` — injected via `lib/sovereign/maiaService.ts:149`
- `scrubMemoryAmnesia` — called at `app/api/sovereign/app/maia/list/route.ts:1275`,
  result written back to `orchestratorResult.text` at :1290

The prompt guard is, in the route's own words, "an instruction the model can override."
It was overridden. The scrubber is the backstop — and **its regex family does not match the
observed shape.** Executed against `FORBIDDEN_AMNESIA_PATTERNS` (11 patterns, deployed source):

```
OBSERVED-A  "I don't actually have persistent memory between our conversations"  → NOT CAUGHT
OBSERVED-B  "Each session starts fresh for me…"                                  → NOT CAUGHT
CONTROL     "I don't have memory between conversations"                          → CAUGHT (#0)
```

Three independent coverage gaps:

1. **Adverb insertion** between negation and verb — `don't` **`actually`** `have`.
   Pattern #0 requires the verb immediately after the negation.
2. **Adjective insertion** between verb and memory-noun — `have` **`persistent`** `memory`.
   Pattern #0's optional group admits only `any ` / `the `.
3. **Third-person-singular `starts fresh`** — pattern #2 is
   `(?:coming|starting|come|start)(?:ing)? (?:in )?fresh` — matches `start fresh` and
   `starting fresh`, **not** `starts fresh`.

Gap 3 is a **repeat**: turn `171138` (2026-04-24) leaked "each conversation starts fresh
for me" through the same hole. The 2026-08-04 incident hardened verb synonyms; it did not
harden adverb/adjective insertion or verb inflection.

**No prompt instructs MAIA to disclaim memory.** The disclaimer is base-model self-description
surfacing through an incomplete filter.

## The 42-minute window — a silent revert

Image tag history on minisforum (`docker images`), all 2026-08-13 UTC:

| Built | Image tag | Head commit | Carries ph2-001 memory work? |
|---|---|---|---|
| 11:03:09 | `6f56f1926` | feat(ph2-001): final candidate — 1cc52e1d3 plus Add-on A | **YES** |
| 11:45:05 | `357462c98` | fix(maia): P0 repair — voice recovery | no |
| 12:05:08 | `78ea266c5` | fix(a11y): amplitude luminance flashing | no → became `:current` + `:prod` |
| 12:06:17 | container start | — | — |
| **14:46:38** | **witnessed failure** | — | — |

`6f56f1926` contains `90e169018` (cross-session continuity fails loudly), `994c284d5`
(restore prompt-authority invariant on the member route), `939ca9b4a` (report context
composition truthfully per tier). It was live for **≈42 minutes**.

`357462c98` and `78ea266c5` sit on `fix/p0-voice-recovery` / `fix/p0-voice-recovery-clean`,
forked from `52a3b924b` — **before** the ph2-001 work. Deploying them did not "fail"; it
built exactly what was asked and thereby **silently reverted** the memory release. Diff
between live and the reverted build across the memory surface:

```
app/api/sovereign/app/maia/list/route.ts |  24 +++++-
lib/sovereign/maiaService.ts             | 135 ++++++++++++++++++++++++-------
lib/sovereign/maiaVoice.ts               | 123 ++++------------------------
3 files changed, 147 insertions(+), 135 deletions(-)
```

**So "the newest upgraded MAIA was up and working" was true — at 11:03 UTC.** The member
turn happened 3 hours after two unrelated voice/a11y deploys took it back out.

### But the revert did not cause this utterance

`lib/maia/prompts/memoryCanonGuard.ts` is **byte-identical** between `78ea266c5` and
`6f56f1926`. The observed text is NOT CAUGHT by either build's pattern set. **The sentence
would have leaked on the upgraded build too.** Two independent failures:

- **A — guard regex gap.** Proximate cause of the utterance. Present in both builds.
- **B — silent revert.** Did not cause this sentence; removed 3 days of memory and
  prompt-authority work from production without any lane noticing.

The deploy-lane `flock` serializes deploys. It does **not** detect that the SHA being
deployed lacks another lane's already-deployed work. That is the structural gap.

## Work review — the deployed referent is behind

18 memory/continuity/relational commits landed on branches in the last 5 days.
**17 of 18 are NOT ancestors of the deployed SHA.** Only `40e7b8039` is live.

Not deployed includes: `90e169018` cross-session continuity fails loudly · `939ca9b4a`
report context composition truthfully per tier · `994c284d5` restore prompt-authority
invariant on the member route · `69019956a` honour member withdrawal across retrieval ·
`630330431` WOI-001 witness gate · `d716935dc` SECREM-001 depthConfig prompt bypass
(**security**) · the full `ph2-001` TODAY relational continuity release.

Production runs `78ea266c5` = canonical `52a3b924b` + two a11y/voice commits, on
`fix/p0-voice-recovery-clean`. So: prod carries the canonical base and an *older* generation
of the memory work — which is why memory retrieved correctly. The last few days' refinements
are real, committed, and **sitting unmerged**.

`d716935dc` (client-controlled prompt bypass) being undeployed is independently notable.

## SECOND WITNESS (iOS, turn 173902) — this relocates the root cause

`maia_turns.id = 173902`, `2026-08-13 14:54:37+00`, session `voice-eb0b980f…`, **iOS**:

> "I don't have memory of past conversations each session starts fresh for me. What I do
> have is your natal chart and profile…"

Executed against the **deployed** guard: **CAUGHT by pattern #0.** This text is squarely
inside the blocklist. The scrubber should have replaced it and logged `[MAIA] §V scrub fired`.

**Production emitted zero scrub lines in 24 hours** (ASCII-verified grep; `grep -ic scrub` = 0).
The un-scrubbed text was persisted. **The guard did not run on this path.**

That demotes the regex-gap finding. It explains turn 173899's exotic phrasings; it does not
explain 173902, which the regex catches. The real failure is upstream of the regex.

### The traffic split

| Measure | 24h |
|---|---|
| `maia_turns` rows | **73** |
| `[MAIA/runtime]` emissions (`MAIA_ROUTE: 'sovereign/app/maia/list'`) | **5** |
| `scrub fired` | **0** |

**68 of 73 turns (93%) were served by a path that never builds the runtime context and
never invokes the guard.** Every trace cited earlier in this document — 8 atoms, 14.9k
prompt chars, conversational 6/6, episodic 4/4, `memoryHealth: high` — describes the
**5-turn minority**. It was never evidence about the path most members are on.

### The candidate path

On deployed SHA `78ea266c5`, exactly four routes reference `maiaService` / `orchestratorResult`.
Only one is guarded:

```
UNGUARDED app/api/admin/command-center/field-engines/route.ts
UNGUARDED app/api/between/chat/route.ts
UNGUARDED app/api/sovereign/app/maia/route.ts      ← 460 lines, the /list sibling
GUARDED   app/api/sovereign/app/maia/list/route.ts
```

`app/api/sovereign/app/maia/route.ts` at `78ea266c5` contains **none** of:
`scrubMemoryAmnesia`, `buildMaiaRuntimeContext`, conversational recall, episodic recall,
atoms loading. It **does** import `getMaiaResponse` (so it inherits
`MEMORY_CANON_GUARD_PROMPT` in the system prompt — an instruction, overridable),
`getCognitiveProfile`, `buildMemoryInfluencePlan`, `loadRecentDevelopmentalMemories`.

**That capability profile matches the witness signature exactly:**

| Contributor | Route capability | Witnessed |
|---|---|---|
| Profile / natal | present (`getCognitiveProfile`) | ✓ MAIA had it |
| Conversational recall | **absent** | ✗ denied |
| Episodic recall | **absent** | ✗ denied |
| Atoms | **absent** | ✗ denied |
| Post-gen scrubber | **absent** | ✗ leaked |
| Runtime observability | **absent** | ✗ no trace |

This is the founder's read confirmed by structure: **person memory survives; relationship
memory does not** — because they are loaded by *different routes*, and the member-facing
one loads only the first.

### ⛔ RETRACTED — the `/api/between/chat` binding below does NOT hold

**Retracted 2026-08-13, same session.** The section that follows inferred production traffic
from the *existence* of a client default without proving anything flows through it. A census
of every `<OracleConversation>` mount refutes it:

```
DECLARED  app/field/talk/page.tsx                    → /list
DECLARED  app/maia/page.tsx (×2)                     → /list
DECLARED  app/studio/maia/page.tsx                   → /list
DECLARED  components/maia/presence/MaiaPresence.tsx  → /list
(5th match is the component's own definition, not a mount)
```

**All four real mounts declare `apiEndpoint`. The silent default is never exercised through
`OracleConversation`.** The default remains a latent hazard worth removing (founder step 3,
fail-closed) but it is **not** the active cause and must not be P0'd as such.

Direct `/api/between/chat` callers that do exist: `app/chat-test/page.tsx` (test page),
`components/oracle/EmbeddedMAIAChat.tsx`, `components/consciousness/BetweenChatInterface.tsx`
(hardcoded `localhost:3005` — non-functional in production), and a server-side forward from
`app/api/community/elemental-alchemy/ask`. None is shown to carry the witnessed turns.

The retracted reasoning is preserved below rather than deleted, per corrigibility discipline.

### Where the evidence actually narrows to

All 73 rows land in `maia_turns`. Writers of that table:

- `lib/sovereign/maiaService.ts:3323` — fires inside `getMaiaResponse`, so **every**
  `getMaiaResponse` caller logs a turn
- `app/api/oracle/conversation/route.ts` — retired 2026-07-17 (410)
- `app/api/voice/stream-conversation/route.ts` — **no client callers found in repo**

`getMaiaResponse` has exactly two callers:

| Route | runtime ctx | scrubber | turns logged |
|---|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts` | **yes** | **yes** | yes |
| `app/api/sovereign/app/maia/route.ts` | **no** | **no** | yes |

`/list` emitted 5 runtime contexts in 24h. 73 turns were logged. The 68-turn remainder is
therefore most consistent with `app/api/sovereign/app/maia/route.ts` — **the original
candidate in this document, reached again by a different road.**

⚠️ **This is a structural narrowing, not a witness.** No client caller of that route has
been located either, and `voice/stream-conversation` has not been empirically excluded.
The observed session-id format (`voice-<uuid>`) matches **neither** in-repo mint site
(`voice-${Date.now()}` in `app/api/voice/persist/route.ts:90` and
`lib/voice/MaiaRealtimeWebRTC.ts:518`) — so the id originates client-side from a surface
not yet identified.

**Correcting a claim made earlier this session:** I said R1 was bound and needed no
instrumentation. That was wrong. `maia_turns` has no `origin_route` column, and
`processing_profile` / `primary_engine` / `used_claude_consult` are **identical**
(`CORE` / `claude-3-sonnet` / `t`) across all recent turns, so the DB cannot discriminate.
**R1's authorized instrumentation is required after all.**

### [RETRACTED — preserved for lineage] the `/api/between/chat` binding

`components/OracleConversation.tsx:618`:

```ts
apiEndpoint = '/api/between/chat', // Default to current behavior
```

**`/api/between/chat` is the default endpoint of the conversation component.** Only four
mounts override it to `/list`: `MaiaPresence.tsx:239`, `app/maia/page.tsx:831` and `:1528`,
`app/studio/maia/page.tsx:118`, `app/field/talk/page.tsx:415`. Every other mount — and any
client that does not pass the prop — falls through to the default.

`app/api/between/chat/route.ts` at `78ea266c5` is **2,665 lines** and contains:

| | |
|---|---|
| `scrubMemoryAmnesia` | **0** |
| `buildMaiaRuntimeContext` | **0** |
| `getMaiaResponse` (the maiaService entry that injects `MEMORY_CANON_GUARD_PROMPT`) | **0** |
| `MEMORY_CANON_GUARD_PROMPT` in its generator `lib/consciousness/maiaOrchestrator.ts` | **0** |

**Neither guard exists on this path.** Not the prompt-level instruction, not the
post-generation scrubber. That is why 173902's text — which pattern #0 catches — was
persisted verbatim, and why zero scrub lines appear in 24 hours.

It is **not** memory-less. It loads its own, divergent set:

```
natal (28 refs) · astrology · loadRelationshipMemory · loadSignificantMoments
developmentalMemory · buildMemoryInfluencePlan · loadMemberMemoryAtomsForPrompt
getUserConversationHistory(effectiveUserId, 10, safeSessionId)   ← :1096, cross-session
```

Correcting an earlier candidate in this document: `app/api/sovereign/app/maia/route.ts` was
a structural guess. The evidence now points to `/api/between/chat`. The natal/astrology
weight (28 refs) matches the iOS witness verbatim — *"What I do have is your natal chart
and profile."*

**The real shape is not "full MAIA vs profile-only MAIA."** It is **two independently
authored continuity contracts behind one member-facing identity** — one instrumented and
guarded, one neither — and the *default* is the ungoverned one.

## Secondary defect (separate, real)

Every `voice-`-prefixed session id fails a UUID cast in production:

```
❌ [POSTGRES] Query error: invalid input syntax for type uuid: "voice-3b3ce541-0c1a-42d4-b5a7-82c69ec1c651"
```

Fired 4× for the witnessed session alone. Some write or read keyed on session id is erroring
on every voice turn. Not the cause of this failure — the memory that mattered loaded from
member id — but it is an unreconciled continuity error on the live path.

## What this changes

The headline is **not** "memory isn't on the PWA." Memory *is* on the PWA, assembling
correctly at high health. The failure is at the last inch: MAIA's ability to describe her own
architecture truthfully, and a filter that catches one phrasing family but not its inflections.

## Preserved, not acted on

- Stale-state preservation is moot — the install was not stale. Refresh freely.
- No patch written. Guard-hardening, the `FALLBACK` field rename, the UUID cast, and the
  merge/deploy decision for the 17 undeployed commits are all **AWAITING_AUTHORITY**.

---

# ADDENDUM — R1 instrumentation lane (session `s-44159e3e`, 2026-08-13 ~15:10–15:40Z)

Authored in the governed lane `feat/maia-route-edge-witness`, worktree
`/Users/soullab/maia-route-witness`, branched from the deployed SHA `78ea266c5`
(0 dirty at branch time). Everything above is preserved unaltered.

## Custody actions

Three claims existed on unit `maia-route-edge-witness`. Two were closed as **abandoned**
(governance acts, no process signalled):

- `s-7600314d` — held the *main* checkout `/Users/soullab/MAIA-SOVEREIGN`, which sits on
  `feature/labtools-redesign` with 488 dirty paths, and had never created the unit branch.
  A repair authored on that base would have been uncustodied from the first line.
- `s-8e0ac85c` — duplicate queued claim on the same unit and same branch name (since 08-11).

`s-44159e3e` is now the single execution authority for this unit.

⚠️ **Custody hazard noted:** this document and `docs/ops/DEPLOY_LINEAGE_GATE_SPEC_2026-08-13.md`
existed **only as uncommitted files in that 488-dirty checkout, on no branch**. They were
copied byte-exact into this lane and committed here. `local ≠ committed` — the forensic record
of this incident was one `git clean` away from being lost.

## Correction — a reading made *inside this lane*, withdrawn

Mid-investigation this lane read the 24-hour `agent_runs` distribution (226 CORE + 128 FAST,
all labelled `/api/sovereign/app/maia`) as **binding the witnessed turns to that route**.

**Withdrawn.** Every one of those rows predates `13:20:21Z`; turns 173899 and 173902 are at
`14:46:38Z` and `14:54:37Z`. A join of `maia_turns` to `agent_runs` within ±20s of either
witnessed turn returns **zero rows**. The corpus-callosum witness went dark before the incident
window and cannot bind either turn.

## The deeper reason `agent_runs.origin_route` could never have answered R1

`agent_runs.origin_route` is **not an observation — it is a hardcoded default.**

- `lib/sovereign/maiaService.ts:3516` passes `originRoute: originRoute ?? '/api/sovereign/app/maia'`.
- **Neither serving route passed `originRoute` at all** before this change.

So every conversational turn from *both* routes was recorded under the single label
`/api/sovereign/app/maia`. The all-time counts —

| origin_route | rows | last emission |
|---|---|---|
| `/api/sovereign/app/maia` | 34,534 | 2026-08-13 13:20:21Z |
| `/api/between/chat` | 312 | 2026-07-26 16:03Z |
| `/api/sovereign/app/maia/list` | 117 | 2026-07-16 14:04Z |

— must therefore **not** be read as traffic share. The 117 `/list` rows come from one
explicitly-labelled `logAgentRun` call site (the interruption ledger,
`list/route.ts:1435`), not from the conversational path.

`meta.endpoint` is no substitute: **`/list` sets `endpoint: '/api/sovereign/app/maia'` — its
sibling's path — in eight places.** Both candidate discriminators were structurally incapable
of distinguishing the two routes.

This is the same failure class as `FALLBACK: true` above: **a default that reads like a
measurement.** It is why the R1 field is written with no fallback, so that *unattributed*
stays visibly distinct from *attributed*.

## Superseded: `/api/maia/log-turn` is not the writer

An intermediate step in this lane identified `app/api/maia/log-turn/route.ts` as the
`maia_turns` writer (it is the only file containing a literal `INSERT INTO maia_turns`).
**It is not.** It inserts `role, content, engine, meta` — none of which exist on the
production table (`user_text`, `maia_text`, `primary_engine`, …) — and it has **zero callers**.
It is dead code that would throw on any invocation. Recorded as a separate bounded defect;
not repaired here.

The actual write path is:

```
serving route → getMaiaResponse (lib/sovereign/maiaService.ts:2379)
  → logMaiaTurn (lib/learning/maiaTrainingDataService.ts:471)
    → MaiaTrainingDataService.logTurn (:189)
      → SELECT log_maia_conversation_turn(...)   ← Postgres stored function, 12 params
      → UPDATE maia_turns SET ...                ← extended-field write
```

The stored-function signature was left untouched; `origin_route` rides the existing
post-insert `UPDATE`, which is the smaller reversible unit.

## What this lane changed (diagnostic only)

1. `database/migrations/20260813000001_maia_turns_origin_route.sql` — nullable
   `maia_turns.origin_route text` + index. No `NOT NULL`, no `DEFAULT`.
2. `lib/learning/maiaTrainingDataService.ts` — `LogTurnRequest.originRoute`, persisted via the
   existing `UPDATE` using `COALESCE` so an unsupplied field never clobbers an existing value.
3. `lib/sovereign/maiaService.ts` — forwards the already-existing `MaiaRequest.originRoute`
   into `logMaiaTurn`, **with no `??` fallback**.
4. Both serving routes declare their own literal at the HTTP boundary.
5. `__tests__/maia-turn-origin-route.test.ts` — 8 pins, including that the two routes do not
   collapse to one value and that an undeclared origin never invents a path.

**Not changed:** routing, guards, memory composition, `meta.endpoint` (its mislabel is
preserved as evidence, per "preserve evidence of structural defects"), `/api/between/chat`,
and Sanctuary behavior — Sanctuary turns skip `logMaiaTurn` entirely and so never reach
this column.

## Standing corrections carried forward

- `/api/between/chat` remains a **latent** hazard. It is not the established cause, and no
  production routing change is authorized from that inference.
- Corpus Callosum emission ceasing at `13:20:21Z` remains a **candidate second regression**,
  bounded and unabsorbed.
- R2's two-contracts finding stands independently of R1.
- R1 is **not yet bound**: a fresh PWA turn and a fresh iOS turn, post-deploy, are what close it.

## R1 deployment — landed 2026-08-13 15:41Z

Deployed via `scripts/deploy-production.sh deploy 4b5e04a1e` (full path — the migration
required it). Evidence from the deploy log, not from an exit code:

- `[deploy-ctx] DEPLOY TARGET (immutable): 4b5e04a1e` — materialized by `git archive`
- `[deploy-ctx:ok] Running container provenance verified: GIT_COMMIT=4b5e04a1e == asserted 4b5e04a1e`
- migration applied: `→ 20260813000001_maia_turns_origin_route.sql` — BEGIN / ALTER TABLE /
  CREATE INDEX / COMMENT / COMMIT; `Applied 1 new migrations (491 already applied)`
- all 15 containers healthy; smoke tests PASS incl. Constitutional verification
  (Co-Lab + Memory + Relationships + Development + MAIA)
- `4b5e04a1e` is a fast-forward descendant of the SHA it replaced (`78ea266c5`) — this
  deploy removed nothing that was live.

Production baseline captured immediately before the first witness turns:
`max(maia_turns.id) = 173902`, rows with `origin_route IS NOT NULL` = **0**, total = 173423.
Any turn with `id > 173902` is new; any non-null `origin_route` is attributable to this change.

### ⚠️ CORRECTION — the 6f56f1926 image no longer exists on the host

An earlier note in this lane observed that the memory build's image was still present on
minisforum and called it "recoverable as an image." **This deploy pruned it:**

```
[deploy-tag] Pruning stale rollback tag: maia-sovereign:6f56f1926 (created 2026-08-13T11:03:09Z)
[deploy-tag] SHA-tag retention: kept newest 3, removed 1 (RETAIN_SHA_TAGS=3)
```

The **commit** `6f56f1926` is untouched and checked out at `/Users/soullab/ph2-today`
(branch `feature/ph2-001-final-candidate`), so no work is lost. What is lost is the
fast image-level rollback path to it — R3 reconciliation must rebuild from source.

Recorded as a bounded observation, not a defect to fix here: `RETAIN_SHA_TAGS=3` is
time-ordered and has no notion of "this image is the subject of an open investigation."

---

# ⛔ MAJOR CORRECTION — §III is superseded. Both amnesia turns came from a memoryless voice route.

R1 bound the serving route on 2026-08-13 ~15:55Z. The answer was **not** any route this
investigation had been reasoning about.

## What R1 actually returned

- **iOS witness: NO ROW.** Nothing above `173902` was created. Speech recognition completed
  (`VOICE TRACE` reached the full phrase) but the client never turned it into a request. The
  iOS failure is **upstream of `getMaiaResponse` and upstream of `maia_turns`** — neither
  memory nor routing stranded it. Separately bounded; belongs to the voice repair lane.
- **PWA witness: row `173903`, `origin_route` = NULL.** NULL was the informative outcome: it
  means *neither declaring route served it*. The runtime log named the actual path:

```
🔊 [StreamConversation] Message: "R1 PWA witness can you hear me"
[ClaudeService] Streaming response for: "R1 PWA witness..."
```

## The fourth continuity contract

`app/api/voice/stream-conversation/route.ts`, measured on the deployed tree:

| symbol | count |
|---|---|
| `logMaiaTurn` | 2 — writes `maia_turns` directly; profile hardcoded `'CORE'` |
| `ClaudeService` | 3 — reaches the model directly |
| `getMaiaResponse`, `buildMaiaRuntimeContext` | 0 |
| `scrubMemoryAmnesia`, `MEMORY_CANON_GUARD` | **0** |
| `loadRelationshipMemory`, `loadSignificantMoments`, `loadMemberMemoryAtomsForPrompt`, `developmentalMemory` | **0** |

It bypasses `maiaService` entirely. **No memory of any kind is loaded, and no amnesia guard
runs.** Sanctuary IS respected (local `sanctuary` flag gates the logging).

## The correction to §III

§III characterized PWA turn `173899` as a **guard coverage defect** — a forbidden phrase
escaping the deployed regex on an otherwise-governed `/list` path with "substantial memory
context assembled." **That is withdrawn.**

Evidence (read-only, 2026-08-13): turn `173903` is a *confirmed* StreamConversation turn, and
its signature is three hardcoded literals from that route. Turns `173899`–`173902` carry the
identical signature:

| id | primary_engine | used_claude_consult | profile | latency_ms |
|---|---|---|---|---|
| 173899 (PWA witness) | claude-3-sonnet | t | CORE | 6049 |
| 173900 | claude-3-sonnet | t | CORE | 6989 |
| 173901 | claude-3-sonnet | t | CORE | 3416 |
| 173902 (iOS witness) | claude-3-sonnet | t | CORE | 4451 |
| **173903 (CONFIRMED StreamConversation)** | claude-3-sonnet | t | CORE | 2084 |

The `maiaService` path sets `primary_engine` from `meta.engine \|\| 'deepseek-r1'` and *computes*
FAST/CORE/DEEP. A pinned `claude-3-sonnet` + `used_claude_consult=true` + always-`CORE` is the
StreamConversation fingerprint.

⚠️ **Evidence class:** this is a **fingerprint match against a confirmed exemplar**, not a
per-turn log binding. Pre-deploy logs are unrecoverable (below). It is strong — same signature,
same latency band, both sessions were voice — but it is inference, not runtime trace.

### What this means

**MAIA was not evading a guard. She was describing her actual situation.** On
`stream-conversation` she has no memory at all, so "I don't have persistent memory between
conversations" was *true on that path*. Two separately-diagnosed defects (a PWA regex escape and
an iOS route-governance gap) collapse into **one cause**: PWA and iOS voice both travel a route
that bypasses the entire memory architecture.

§II's two-contracts finding stands and is now **four** contracts, with a concrete P0 target.

## ⚠️ Ops lesson — the deploy destroyed the incident's own logs

`docker logs maia-sovereign --since 14:40 --until 15:00` returns **0 lines**. The 15:41 deploy
recreated the container, discarding every log line from the incident window. The diagnostic
deploy destroyed the forensic record it was deployed to obtain. Recorded, not repaired.
