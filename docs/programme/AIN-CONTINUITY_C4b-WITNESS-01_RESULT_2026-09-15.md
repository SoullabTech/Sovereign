# `C4b-WITNESS-01` — CLIENT SELECTION WITNESS · RESULT · ⭐ RED

**Status**: ✅ **SPENT** · **Outcome: RED** · ⛔ **NO REPAIR PERFORMED**
**Authorized by**: founder act — *"`C4b-WITNESS-01 — CLIENT SELECTION WITNESS`"*, 2026-09-15
**Date**: 2026-09-15 · **Branch**: `claude/sweet-mayer-on4m5x` · **Predecessor**: `C4-WITNESS-01` RED

---

## 0. RESULT

> **RED on all five required conditions.** The live client selected the defective 100-row
> PostgreSQL set over a smaller, recency-correct local set — **and then overwrote the local cache
> with it**, destroying the only client-side copy of the newer material.

⭐⭐ **Stronger than the authorizing act predicted.** The witness was asked whether the client
*prefers* more rows to better continuity. It does — and the same code path (`:3129`,
`localStorage.setItem(storageKey, JSON.stringify(pgMessages.slice(-50)))`) then **writes the stale
set back over the recency-correct cache.** The newer turns are not merely deselected for this turn;
after one reload there is nothing recency-correct left on the device to lose again.

---

## 1. THE DISCRIMINATING FIXTURE (as specified)

```
DB session wit-session-01   150 turns, 150 DISTINCT monotonic created_at
PG set     (server)         turns   1–100    count 100    ← oldest, newest ABSENT
local cache (localStorage)  turns 101–150    count  50    ← recency-correct, newest PRESENT
selection rule                          100 > 50
```

⭐ **The smaller set is temporally better than the larger set** — the trap the authorizing act named
is avoided. `loadedMessages` was not made stale to shrink it; it was made **newer** and smaller.

⭐ **The shape is the one the real client produces.** `OracleConversation.tsx:3129` persists
`pgMessages.slice(-50)` — a last-50 tail. A member mid-conversation holds exactly such a
recency-correct tail. ⚠️ Honest limit: the cache was **seeded** with turns 101–150 rather than grown
by live conversation, so it is the real *shape* from a constructed *origin*.

---

## 2. THE FIVE CONDITIONS

| # | Condition | Result | Evidence |
|---|---|:--:|---|
| 1 | `pgMessages.length > loadedMessages.length` | ✅ **true** | `💾 [localStorage] Loaded 50 messages` then `💾 [PostgreSQL] Loaded 100 messages` |
| 2 | client chooses `pgMessages` | ✅ **true** | the `[PostgreSQL] Loaded` line is emitted **only inside** the `if (pgMessages.length > loadedMessages.length)` branch (`:3124-3126`) |
| 3 | chosen set lacks session newest turn | ✅ **true** | PG set is the oldest 100 (`C4-WITNESS-01`); newest is `turn-150` |
| 4 | pre-selection `loadedMessages` contained newest | ✅ **true** | seeded cache = turns 101–150, last = `turn-150` |
| 5 | final client state consequently loses that newer material | ✅ **true** | **§3** |

### Console sequence, as observed

```
💫 [MAIA] Restored session: wit-session-01
💾 [localStorage] Loaded 50 messages for MAIA context (UI starts fresh)
💾 [PostgreSQL] Loaded 100 messages for MAIA context
💾 [localStorage] Saved 50 messages
```

---

## 3. CONDITION 5 — SETTLED FINAL STATE, NOT THE BRANCH FIRING

The authorizing act warned: *"Don't infer UI harm merely from the branch executing if some later
reconciliation restores the recent messages."* So the final client state was read directly, **15
seconds after load**, once all effects had settled:

```
FINAL_LOCALSTORAGE  {"count":50,"first":"turn-51","last":"turn-100",
                     "has_turn150":false,"has_turn101":false}
```

> The cache that held turns **101–150** now holds turns **51–100**. Turn 150 — the session's newest
> — is **absent from the client entirely**. ⛔ **No later reconciliation restored it.**

⚠️ **ONE LINK IN THE CHAIN IS UNWITNESSED, AND IS NOT INFERRED.** The outgoing
`conversationHistory` on a subsequent turn was **not captured**: the mounted surface presented no
reachable text input (voice/holoflower state; typing did not open one), so no member turn could be
sent. `historicalMessagesRef.current = loadedMessages` (`:3143`) is the array
`truncateHistoryForAPI` later reads, ⛔ **but that this specific prompt payload therefore omits
turns 101–150 is entailed, not witnessed.** Recorded as owed.

⭐ The distinction is kept because it is exactly the one this programme exists to protect: **the
destruction of the client's newer material is witnessed; its consequence for one specific prompt is
not.**

---

## 4. CONTAINMENT AND FIXTURE FAITHFULNESS

- **Disposable shadow PostgreSQL 16**, `127.0.0.1:55432`, database `maia_shadow`. ⛔ Production never
  contacted; `DATABASE_URL` unset in this container except for the shadow.
- **Full migration set applied**: **431 applied · 56 refused** (absent extensions/predecessors) —
  the same ratio the S3 witness reported. `conversation_turns`, `auth_sessions`, `members` all
  present.
- ⭐ **The fixture had to satisfy the real production write contract.** The S5 provenance trigger
  (`20260718000001_s5_provenance_substrate.sql:240`) **refused** the first seeding attempt —
  *"posture NULL is not writable"* — and required `posture_at_creation='normal'` plus all six
  provenance keys. ⚠️ This also means `C4-WITNESS-01`'s narrower 5-migration shadow **lacked that
  trigger**; it governs INSERTs and cannot affect the SELECT that witness measured, ⛔ but it is
  recorded rather than left unsaid.
- **Real browser, real client**: Chromium via Playwright, the actual `/maia` page, the actual
  `OracleConversation` mount, real cookie + `auth_sessions`-backed session. ⛔ **No client code was
  modified**; localStorage and cookies were seeded as a returning member's device would carry them.
- **Teardown**: app stopped, shadow server stopped, cluster directory deleted — all three confirmed.

---

## 5. WHAT IS NOW ESTABLISHED END-TO-END

```
SERVER DEFECT        ✅ WITNESSED   oldest 100 returned, newest absent      (C4)
CLIENT SELECTION     ✅ WITNESSED   larger stale set chosen over newer set  (C4b)
CACHE DESTRUCTION    ✅ WITNESSED   recency-correct cache overwritten       (C4b, unasked)
PROMPT PAYLOAD       ⏳ ENTAILED, NOT WITNESSED                            (§3)
REPAIR AUTHORITY     ⛔ NOT GRANTED
```

⛔ **Still not established**: how often real sessions exceed 100 turns; that this is *the* explanation
for MAIA's historical visible forgetting (it is *an* established mechanism, not a measured cause);
anything about C1, C2 or the five continuities.

---

## 6. STANDING

```
C4                        ✅ WITNESSED
C4b                       ✅ WITNESSED · RED
outgoing-prompt link      ⏳ OWED (needs a reachable text surface)
continuity-depth repair   ⛔ UNOPENED
Phases I · II · III       ⛔ UNOPENED

production · schema · migrations · prompts · ORDER BY · LIMIT
the client comparison at :3124 · the cache write at :3129        untouched
```

⛔ **The act ends here**: evidence preserved · result classified · **stop**. A new founder ruling is
required before any repair. ⛔ Nothing in the explicitly-unauthorized list was touched.

---

## 7. FOUNDER DISPOSITION — 2026-09-15

### 7.1 · THE WORDING BOUNDARY, HELD **[F]**

> ⛔ **Do not write**: *"This proves MAIA cognitively forgot turns 101–150."*
> ✅ **Write**: *"This proves the client destroys the recent continuity state that cognition depends
> upon; model-payload loss remains unwitnessed."*

*"We have not yet directly witnessed a model request in which turns 101–150 are absent because of
this mechanism. The code path makes that consequence plausible — and apparently strongly entailed
from `historicalMessagesRef.current` feeding `truncateHistoryForAPI` — but your refusal to upgrade
it was correct."* **[F]**

### 7.2 · ⭐⭐ TWO DEFECTS, NOT ONE **[F]**

```
D1 · SELECTION DEFECT
     "more rows" wins over "more recent rows"          (OracleConversation.tsx:3124)

D2 · DESTRUCTIVE PERSISTENCE DEFECT
     the selected stale set overwrites the better cache (OracleConversation.tsx:3129)
```

> *"A repair that fixes only one could still leave continuity broken."* **[F]** — fix the server
> ordering but keep destructive replacement → fragile; fix the overwrite but still prefer the stale
> set → the current session is still wrong; merge naïvely → duplicates, ordering and provenance
> problems.

⭐ **D2 is arguably the more urgent**, because it removes the fallback that could have corrected the
next load.

### 7.3 · ⚠️ THE EXISTING MERGE PRIMITIVE IS NOT SAFE TO LEAN ON

**[J]** Attached to the repair law because the founder's *"merge naïvely"* hazard is **not
hypothetical — the adjacent helper already has that shape.** `truncateHistoryForAPI`
(`OracleConversation.tsx:372-405`), re-read for this disposition:

- it concatenates **historical first, then current**, and ⛔ **never sorts by timestamp** — the
  resulting sequence is ordered by **source**, not by **time**;
- `slice(-maxMessages)` therefore takes the most recent **array positions**, not the most recent
  **turns**;
- dedupe is by `id`, and *"Messages without ID always added"* (`:395-397`) — **an id-less message
  bypasses dedupe entirely.**

> ⛔ **"Just merge the two carriers" would produce a temporally scrambled history using the
> primitive already in the file.** Any repair that reconciles carriers must sort by time and must
> not rely on this helper's ordering. ⛔ Recorded as an observation informing repair, ⛔ not a repair.

### 7.4 · SEQUENCING **[F]**

```
C4c · PROMPT-PAYLOAD WITNESS   — completes causal attribution to cognition
C4-REPAIR-01                   — repairs already-witnessed continuity corruption
```

> *"C4c is useful scientifically. It is **not** a prerequisite for repairing destructive client
> state."* **[F]** — the client destruction is independently harmful and fully witnessed.

### 7.5 · FIXTURE CAVEATS STAY ATTACHED TO FIXTURE FIDELITY **[F]**

`431 applied / 56 refused` is **evidence about this shadow reconstruction**, ⛔ never a statement
about production schema completeness. The S5 trigger episode likewise bears only on fixture
fidelity: full schema partially reconstructed · provenance trigger active · first invalid seed
correctly refused · governed fixture passed the real write contract. ⛔ It does not alter C4a's
SELECT result.

### 7.6 · STANDING AFTER DISPOSITION

```
C4a  server temporal slice          🔴 WITNESSED
C4b  client stale-set preference    🔴 WITNESSED
C4b  recency-correct cache loss     🔴 WITNESSED
C4b  persistent cache regression    🔴 WITNESSED

C4c  outgoing model payload         ⏳ ENTAILED, NOT WITNESSED · OWED / NOT OPEN
     model cognitive omission       ⏳ NOT YET WITNESSED

repair authority                    ⛔ STILL NOT GRANTED
```
