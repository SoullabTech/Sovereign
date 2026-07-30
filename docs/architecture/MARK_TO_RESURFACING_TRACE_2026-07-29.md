# Provenance Trace — "Mark this" → resurfacing

**Discovery artifact. No recommendations, no proposed primitives, no design alternatives.**
Every edge below is either verified against the pinned referent or explicitly left as a gap.

```text
Repository instance:                  /Users/soullab/MAIA-SOVEREIGN
Working-tree branch (NOT referent):   chore/field-study-method-candidate  — 430 behind trunk, 29 ahead
Canonical branch:                     origin/clean-main-no-secrets
Canonical commit:                     ea39fe3b0
Deployed commit:                      4b3448c6f   (Merge PR #796)
Trunk ahead of deployed:              37 commits
Files reconciled against production:  11 of 11 — trunk == prod for every file on this path
Runtime execution verified:           No — the mark→resurfacing flow was never exercised
Runtime STATE read (2 facts only):    deployed commit identity · MAIA_USE_CLAUDE_CONSULTATION → UNSET
```

⚠️ **Runtime state and runtime execution are different classes, and this header
declares both because declaring only the first under-reports.** Nothing here was
established by marking a moment and observing it resurface. Two facts *were* read
from the live container — which is why the DEEP-primary coverage finding is
runtime-grounded while every other claim in this document is not. Do not let the
absence of execution evidence discount those two, and do not let their presence
upgrade anything else.

Trunk/deployed byte-identity was confirmed per file with
`git diff --quiet 4b3448c6f origin/clean-main-no-secrets -- <path>`; for
`components/OracleConversation.tsx` it was independently confirmed by blob hash
(`c906bcb311083755c8fec6e02730331282eb0fcd` at both refs). **The 37-commit
trunk/production gap does not touch this path** — that is a finding, not an
assumption.

## Evidence classes — kept separate, never merged

| Class | Meaning |
|---|---|
| **VC+D** | Verified in canonical and deployed code |
| **RF** | Repository fact, runtime unverified |
| **PRQ** | Production-runtime question — not answerable from the repository |
| **GAP** | Could not be established |
| **FSC** | **Falsified stale-checkout finding** — recorded as falsified, not reworded |

---

## The trace

| Link | Class | Result |
|---|---|---|
| 1. UI gesture → route | **VC+D** | Per-message hover affordance → `POST /api/sovereign/episodes/mark` |
| 2. Route → persistence | **VC+D** | Raw `INSERT` into `episodic_memories`, behind a server-side R18 refusal |
| 3. Persistence → episodic object | **VC+D** | `MarkedEpisodeSnapshot`, owned by `lib/maia/memoryLoaders.ts` |
| 4. Provenance recorded | **VC+D** | **Session-scoped only** — no turn id, no message id, no foreign keys |
| 5. Recall selection | **VC+D** | Recency only. No embeddings, no scoring, no relevance computation |
| 6. Resurfacing trigger | **VC+D** | **No trigger** — rebuilt every turn, independent of the member's message |
| 7. Member-facing rendering | **VC+D / GAP** | One page reads marks; it has no navigational door |

### Link 1 — gesture → route

`VC+D`. The mark gesture is a per-message hover control rendered only on
member-authored messages and never in Sanctuary. Handler POSTs through
`apiFetch` (so it carries the native/Safari auth-header path, not bare cookies).

Client guards, all before any network call: `isSanctuary` early return ·
already-kept idempotence · empty-text · unresolved member identity.
Undo exists — `DELETE` on the same route.

Evidence — `OracleConversation.tsx` at canonical (`ea39fe3b0`, blob-identical to
deployed): L8913 render guard · L8793–8796 guards · L8801–8806 identity guard ·
L8808–8815 POST · L8835 DELETE.

### Link 2 — route → persistence

`VC+D`. `app/api/sovereign/episodes/mark/route.ts` at canonical is **393 lines**
and refuses before writing. Trunk line numbers:

- Auth: `getMemberIdFromRequest` — L120 (GET), L168 (POST).
- `sourceSessionId` is **REQUIRED**; its absence is a Sanctuary-boundary
  refusal, not a validation error — L32–33, L207–209, refusal code `R18` L219.
- **Server-side Sanctuary guard (R18)** resolves the named session's ownership
  and sanctuary state in SQL and refuses *before any write* — L225–226,
  L249–268, refusal L271–275. Invariant 6 is stated as absolute, holding "even
  for an explicit member request" (L41).
- The resolution is deliberately an **allowlist, not a blocklist** (L241–248):
  the write proceeds only when the session resolves as owned by the
  authenticated member AND non-Sanctuary. Another member's session resolves
  identically to a nonexistent one — so a cross-member id cannot launder
  provenance or act as an existence oracle.
- Insert — L308–311, `VALUES ($1, $2, $3, TRUE, $4, $5, 'normal')`. Returns 201
  (L325). Status contract: 400 invalid verbatim · 401 no member · 403 R18
  (L158–159). Delete — L372.
- ⚠️ The column list at L309–310 was not individually enumerated in this pass.

### Link 3 — persistence → episodic object

`VC+D`. A mark reads back as `MarkedEpisodeSnapshot`, owned by
`lib/maia/memoryLoaders.ts:275-281` (byte-identical to trunk and prod).

**`EpisodicMemoryService` is not on this path.** It lives at
`lib/consciousness/memory/EpisodicMemoryService.ts` with 7 public methods, 6
with zero callers; the one reachable method is behind `MemoryPalaceOrchestrator`
on the older `app/api/oracle/conversation` route. Its legacy selectors
*structurally cannot* return marked rows: they filter on `significance`, which
marked rows leave NULL by design.

**No synthesis between persistence and object.** Raw insert, untrimmed;
interpretive columns had their DEFAULTs and NOT NULLs stripped by migration
`20260531000001_episodic_member_marked_provenance.sql:56-64`; a CHECK enforces
the verbatim↔marked biconditional (`:79-90`). The only transforms are whitespace
collapse and a 280-char display truncation at render. **The no-synthesis
discipline is enforced at the schema, not by convention.**

Marks and atoms are **separate substrates** — `episodic_memories` vs
`member_memory_atoms`, no schema, loader, or type overlap. They are sibling
prompt blocks. `is_breakthrough` and its `crossing_must_be_false` sibling belong
to atoms, not marks.

### Link 4 — provenance recorded

`VC+D`. **Session-scoped only.** The live caller sends exactly
`{verbatimText, sourceSessionId}`. `sourceTurnId` is accepted by the route and
**never sent by the only caller** — it appears nowhere in
`OracleConversation.tsx` at canonical.

- The session id is client-minted and **day-rotating**: `session_${Date.now()}`,
  rotating per calendar day (`lib/maia/presence/conversationIdentity.ts:36-43`).
- **No foreign keys** anywhere on the path. `user_id` is `TEXT`, not
  `uuid REFERENCES members(id)`; `source_turn_id` / `source_session_id` are bare
  `TEXT` (`20260115000010_episodic_memories.sql:7`, `20260531000001_...:72-73`).
- **Human authorship IS row-distinguishable** — `marked_by_member` plus the
  biconditional CHECK. From the row alone, a member-authored mark cannot be
  confused with a system inference.

### Link 5 — recall selection

`VC+D`. Two queries, both `marked_by_member = TRUE` + `ORDER BY created_at DESC`.
**Recency only — no embeddings, no keyword, no scoring.** `semantic_vector`
exists on the table, is backfilled by a nomic script, and is **never read by any
selection path**; the backfill embeds title/description columns that are NULL for
marked rows, so marked rows are skipped entirely.
Post-SQL filtering is a 90-day window then `slice(0, 5)`
(`lib/maia/episodicRecallBlock.ts:81,84,106-114`).

### Link 6 — resurfacing trigger

`VC+D`. **There is no trigger.** The block is rebuilt every turn for any
recognized non-Sanctuary member, independent of what the member just said
(`app/api/sovereign/app/maia/list/route.ts:783`, `:879-897`). Relevance is
delegated to the model *in prose*: "Reference these only if directly relevant to
what the member is bringing now" (`episodicRecallBlock.ts:126-127`). A sibling
feature on the same route *does* have a message-dependent trigger
(`detectForwardReadiness(message)`, `:899-906`), so the absence here is
structural, not incidental.

**Coverage by processing profile** (`lib/sovereign/maiaService.ts` at canonical):

| Profile | Episodic injected | Evidence |
|---|---|---|
| FAST | **YES** | read L1228, interpolated L1283 — **bypasses the shared helper** |
| CORE | **YES** | L1570 → `buildMaiaWisePrompt` L1577 → `appendAllContextAddenda` |
| DEEP-repair | **YES** | L2206 → `buildMaiaComprehensivePrompt` L2213 |
| DEEP-primary (local draft) | **NO** | L2044–2049, no prompt seam by construction |
| DEEP-primary (consultation) | **NO, live** | L2068/2070 gated on `MAIA_USE_CLAUDE_CONSULTATION`; **UNSET in production** |

Channel membership is defined in **three separate places** — the shared helper,
the FAST template literal, and the consultation lane's pre-joined string — so the
channel set can differ per profile independently of naming.

DEEP-primary being unwired is a **documented governance choice**, not a defect:
`maiaService.ts:2203-2205` states it "remains unwired — observability-only
there, per mission scope (do not fix in this diff)."

### Link 7 — member-facing rendering

`VC+D` for what exists; `GAP` for reachability.

- **`/maia/moments`** is the only surface that reads marks
  (`app/maia/moments/page.tsx:55`). Explicit empty state at zero marks (`:124-131`).
- **The in-transcript "Kept." indicator does not hydrate on reload.** `useState({})`,
  no loader; the only two writes are post-POST and post-DELETE. A member
  returning to a reloaded transcript **cannot see which of their own messages
  they previously marked.**
- **Resurfacing via language works** — dated verbatim lines enter the prompt,
  gated on opt-out / Sanctuary / empty / 90-day recency.
- **Provenance is asserted to the model, not to the member.** The API returns
  `markedByMember` / `sourceSessionId` / `sourceTurnId`; the client type
  discards them, and the page renders date + text only. A member cannot see
  *why* something resurfaced.
- **`GAP` — no navigational door.** Canonical `lib/navigation/maiaNav.ts` has 16
  `route:` declarations; **none is `/maia/moments`**. The only member-facing link
  in the repo is `href="/maia/moments"` inside the post-mark branch of the
  transcript (`OracleConversation.tsx:8929`). The page is reachable **only in the
  moment just after marking**. No tier/role/flag gate was found on it.

---

## Three persistence grammars under one word

All three are live in production. This is an architectural fact, not a UX opinion.

| Affordance | Endpoint | Substrate | Epistemic property |
|---|---|---|---|
| Header bookmark — *"Keep something from this conversation"* (always visible, #749) | `/api/capsules/from-chat-window` | capsule | window-level derivative (16 messages) |
| Rail item — *"Keeps"*, tooltip *"Moments you have held onto"* | → `/maia/keep-capture` | psyche portfolio | portfolio artifact |
| Per-message hover — *"Keep this moment"* | `/api/sovereign/episodes/mark` | episodic mark | verbatim, member-authored, interpretive columns forbidden |

Two further mark-like entry points exist and are **not** traced to persistence
here: `KeepAffordance` → `/api/psyche/conversational-keep/respond` (imported into
`OracleConversation.tsx` but **never rendered** — no `<KeepAffordance` JSX exists
anywhere), and a "Mark this moment" in `LivingEncounterView.tsx:227` which PATCHes
a different route using **bare `fetch`**, not `apiFetch`.

## Consent — two distinct consents, one of them unreachable

`VC+D`. **Marking and recalling are separate consents.** The write path
deliberately does not consult the recall gate (mark route L57-60).

Recall consent is `members.episodic_recall_enabled`, **default TRUE** — an
opt-**out**, enforced in TypeScript (`memoryLoaders.ts:328-341`,
`episodicRecallBlock.ts:91-93`), *not* in the selection SQL.

⚠️ **`RF` — no writer exists for that column.** A `git grep` across `app/` and
`lib/` at canonical returns only reads and comments;
`app/api/members/recall-preferences/route.ts:20` lists it as a *future* field
("when episodic Phase 2 lands"). **The opt-out is settable only in the database.**

Contrast, same repository, different feature: Daily Anchors use
`surface_preference` — default **private**, explicit opt-**in**, enforced as a
**SQL predicate** (`lib/anchor/loadRecentAnchors.ts:66`), with the code noting
enforcement is "structural (SQL predicate), not by prompt discipline" (`:19-20`),
and a gesture route that can actually set it. The two features implement consent
in opposite directions with different enforcement layers.

---

## Falsified findings — recorded as falsified, not reworded

| # | Finding | Why it fell |
|---|---|---|
| 1 | "The mark route has no server-side Sanctuary awareness" | **FSC.** Read from a checkout 430 commits behind. `f82cd4cd0` + `9752db4f2` are live in `4b3448c6f`. The route refuses Sanctuary-origin writes in SQL before persisting. |
| 2 | "#749's header Keep is not present" | **FSC.** Live in production (`2a6070ffd`). |
| 3 | *"'No navigational door to /maia/moments' is a stale-checkout artifact"* | **A falsified falsification.** Claude falsified a **correct** finding using a grep count: the match was a *tooltip* ("Moments you have held onto") on an item routing to `/maia/keep-capture`. The original finding stands. |

⭐ **Finding 3 is its own methodological observation, not a navigation detail:**

> **A grep hit is evidence that a string exists, not that the referenced
> behavior exists.**

Same class as *names are not evidence*, one level up: it applies to the
*verification* pass, not only the observation pass.

## Method integrity

**The load-bearing method result of this trace:**

> A repository observation is not grounded until the observed build is named and
> reconciled against the canonical and deployed referents.

The trace was run without build pinning and **a third of it was corrupted**.
Scoping the damage was mechanical (`git diff --quiet` per file): of 11 files, 8
were byte-identical to trunk and their findings survived; 3 diverged and their
findings were falsified or unverifiable. The re-run pinned every read via
`git show origin/clean-main-no-secrets:<path>`.

**Three defects observed in this trace, structurally identical:**

| Defect | Form |
|---|---|
| Unpinned repository observation | evidence real, referent unnamed |
| A classification imported onto a correct observation (`GAP` for a documented governance choice) | evidence real, class invented |
| A lexical match treated as behavioral evidence | evidence real, claim outran it |

> **In all three: the evidence was real; the claim outran what the evidence established.**

Build pinning is one of the four structural capabilities distinguishing the two
D1 candidate instruments. Its absence here materially corrupted a result. **That
is an observation about this trace, and it decides nothing about D1.**

## Open architectural questions

Places the trace could not establish what happens. Not defects, not proposals.

1. **`PRQ`** — Is the older `app/api/oracle/conversation` route (the only path
   reaching `EpisodicMemoryService`) live in production traffic?
2. **`PRQ`** — Do other writers to `episodic_memories`
   (`app/api/journal/quick/list`, `app/api/maia/memory/ingest`,
   `scripts/run-session-summary-worker.ts`) ever set `marked_by_member`? Their
   exclusion is asserted from the loader's WHERE clause, not confirmed per write site.
3. **`PRQ`** — Does `consultClaudeForConsciousness` place `contextAddenda` into
   its outgoing system prompt? Implementation outside the traced files. Moot in
   production while the env var is unset.
4. **`RF`** — The R18 ownership check treats a session with `member_id IS NULL`
   as owned by the requester (mark route L253, L261). Observed property; its
   intent is not established here.
5. **`GAP`** — Whether any component outside the nav registry surfaces
   `/maia/moments` by composing the path dynamically. The search was literal-string based.
6. **`GAP`** — Whether `middleware.ts` gates `/maia/moments`. Not read.
7. **`PRQ`** — Whether a second live conversation route populates
   `meta.episodicRecallAddendum`. It is the only one in source.
8. **Not repo-answerable** — which of the three "keep" affordances product
   intends as *the* mark gesture.

## Category 1 observations — held, not authorized

Recording that something *could* become a shared primitive does not authorize
building one.

- `MarkedEpisodeSnapshot` and the mark route's `MarkedEpisodeRow`/`shape()`
  describe the same columns in two shapes.
- `loadRecentMarkedEpisodes` and the mark route's GET issue the same filtered
  query with different LIMITs.
- Episodic recall channel membership is declared in three places (shared helper,
  FAST template, consultation join).
- 40+ worktrees under `.claude/worktrees/` hold divergent copies of
  `episodes/mark/route.ts`. Only the canonical version was read.
