# RF — Relationship Essence Authority Trace

**READ-ONLY TRACE — BUILDING CLOSED** · 2026-08-14

Bound SHA: `22200f967` (verified: `docker exec maia-sovereign printenv GIT_COMMIT` → `22200f967`, `DEPLOY_LANE=deploy-lane`).
All code citations are `git show 22200f967:<path>`. The working tree (`d41b8b355`, dirty) was **not** read.
DB: `maia-postgres:5432/maia_consciousness` on `minisforum`. **No writes were issued.** All SQL was `SELECT`.

---

## 0. VERDICT — THE DECISIVE FORK

> **FACT — `relationship_essences` ENTERS THE LIVE SYSTEM PROMPT. This is a clocked containment issue, not dormant accumulation.**

It is **not** write-only and **not** unreachable. Three independent legs, each established separately:

1. **FACT (code, final assembly).** `lib/sovereign/maiaService.ts:1350` — the FAST-tier system prompt template literal interpolates `${relationshipContext}` directly, between `${cognitiveScaffolding}` and `${selfletPromptBlock}`. `relationshipContext` is defined at `lib/sovereign/maiaService.ts:1143-1145` as `relationshipMemory ? formatRelationshipMemoryForPrompt(relationshipMemory) : ''`. **This is final assembly, not availability.**
2. **FACT (code, second tier).** CORE tier: `lib/sovereign/maiaService.ts:1596` passes `relationshipMemory` into the voice context; `lib/sovereign/maiaVoice.ts:870-875` does `adaptedPrompt += relationshipContext`. Second, structurally different composition seam.
3. **FACT (runtime, production, last 72h).** `docker logs maia-sovereign --since 72h`:
   ```
   💫 [ANAMNESIS-SERVER] Essence loaded: 65 encounters, L5 inferred
   🌊 [Relationship Memory FAST] Loaded: 65 encounters, deep phase
   💾 [ANAMNESIS] Essence saved to PostgreSQL: soul_49ae4717-…
   💫 [ANAMNESIS] Essence saved: encounters=66 morphic=1.00
   ```
   Load **and** write observed under live traffic on the sovereign lane.

**What exactly reaches the prompt** (`lib/memory/RelationshipMemoryService.ts:533-575`, `formatRelationshipMemoryForPrompt`):

```
🌊 RELATIONSHIP MEMORY:
{N} conversations over {D} days with {userName} ({phase} relationship). Last spoke {…}. Working with: {themes}.
…
Relationship quality: {phase}, trust {NN}%, intimacy {NN}%
```

It is emitted as **flat declarative fact**. There is no hedging, no provenance marker, no "observed", no "tentative", no instruction to hold it lightly. Contrast the retired lane's `generateAnamnesisPrompt` (`lib/consciousness/RelationshipAnamnesisPostgres.ts:144-185`), which is stronger still — *"I know you at a level beyond what we've said"* — and explicitly instructs concealment of the mechanism: *"Don't reference data … Speak from soul knowing."*

**Load-bearing correction to the framing:** `presence_quality` — the field most likely to be read as a psychological description — is **NOT** in the sovereign prompt. `formatRelationshipMemoryForPrompt` never reads it. `morphic_resonance` **IS** in the sovereign prompt, rendered as **`trust {NN}%`**. That inversion is the core finding of §2.

---

## 1. THE AUTHORITY PATH

```
member turn
  → POST /api/sovereign/app/maia/list
     ├─ READ  (pre-response, gated !isSanctuary)
     │    maiaService.ts:734-744 (FAST) / :1461-1480 (CORE) / :1875-1886 (DEEP)
     │      → loadRelationshipMemory(userId)            RelationshipMemoryService.ts:158
     │        → loadRelationshipEssence(userId)         RelationshipMemoryService.ts:48-94
     │          SELECT * FROM relationship_essences WHERE soul_signature=$1 OR user_id=$1 LIMIT 1
     │      → formatRelationshipMemoryForPrompt()       RelationshipMemoryService.ts:533
     │      → ${relationshipContext} in prompt literal  maiaService.ts:1350         ◀── PROMPT ARRIVAL
     │        (CORE: maiaVoice.ts:870-875 `adaptedPrompt +=`)                        ◀── PROMPT ARRIVAL
     │
     └─ WRITE (post-response, fire-and-forget, gated !isSanctuary)
          app/api/sovereign/app/maia/list/route.ts:1470-1507
            → captureEssence()          RelationshipAnamnesisPostgres.ts:49-133
            → saveRelationshipEssence()  RelationshipAnamnesisPostgres.ts:256-320
              INSERT … ON CONFLICT (user_id) DO UPDATE
```

**FACT.** The write is unconditional on any consent flag. There is **no** env kill-switch, **no** member preference column, **no** `surface_preference`-style gate. The only guard is `!isSanctuary` (`route.ts:1472`). Compare `member_daily_anchors.surface_preference` and the `INTERRUPTION_LEDGER_ENABLED` flag twelve lines above it in the same file — this substrate has neither.

**FACT.** The write is **per turn**, not per session (`encounter_count = existing + 1` on every turn; `RelationshipAnamnesisPostgres.ts:112`). The log line `encounters=66` after `65` on consecutive turns confirms.

**FACT.** A second, independent writer exists at `lib/consciousness/RelationshipAnamnesisStorage.ts:22-100` (SELECT/UPDATE/INSERT). Its live callers are **NOT ESTABLISHED**.

---

## 2. FIELD-BY-FIELD CUSTODY

| field | class | produced by | in prompt? | member-visible? |
|---|---|---|---|---|
| `soul_signature` | **derived, deterministic** | `` `soul_${userId}` `` — `RelationshipAnamnesisPostgres.ts:42-47`. The method is named `detectSoulSignature(userMessage, userId, context)` and **ignores every argument except `userId`**. | no | see §3 |
| `user_id` | imported | session identity | no | — |
| `user_name` | imported | `(meta as any)?.userName` (client-supplied) or prior row — `route.ts:1477` | **yes** (`summary`, RMS:425-430) | **yes** — §3, and greeting §5 |
| `presence_quality` | **INFERRED** | `sensePresenceQuality`, `RelationshipAnamnesisPostgres.ts:188-215` | **NO** (sovereign lane) | **yes** — §3 |
| `archetypal_resonances` | **inferred, append-only** | `route.ts:1493` = `knowledgeGateResult?.source_mix?.[0]?.source \|\| 'depth_psychology'`; pushed without pruning at `:88-91` | no | **yes** — §3 |
| `spiral_position.stage` | observed→inferred | `wuxingSnapshot.moment.momentDominant[0]` (`route.ts:1487`) | no | **yes** — §3 |
| `spiral_position.emergingAwareness` | **vacuous** | hardcoded `[]` (`route.ts:1491`) | no | **yes** (empty) |
| `relationship_field.depth` | **CONSTANT** | hardcoded `{ depth: 0.7 }` (`route.ts:1496`) | no | **yes** — §3 |
| `relationship_field.quality` | **CONSTANT-DERIVED** | `senseRelationshipQuality` (RAP:217-235) on depth=0.7 → always `"Present, engaged, unfolding"` | no | **yes** — §3 |
| `relationship_field.breakthroughs` | **append-only, unbounded** | `breakthroughs.push(...)` (RAP:102-104); on the sovereign lane `recalibrationEvent: null` (`route.ts:1495`) so nothing is appended **now** — extant lists are legacy from the retired oracle lane | no | **yes** — §3 |
| `first/last_encounter` | observed | timestamps | **yes** (days-since, RMS:433-442) | **yes** |
| `encounter_count` | observed | per-turn counter | **yes** (RMS:426-430) | **yes** |
| `morphic_resonance` | **COMPUTED, NOT MEASURED** | `Math.min(0.1 + encounterCount*0.1, 1.0)` — `RelationshipAnamnesisPostgres.ts:113` | **YES — as `trust {NN}%`** | **yes** — §3 |

### 2a. `presence_quality` — inferred from one turn, stored as settled description

**FACT.** `sensePresenceQuality` (`RelationshipAnamnesisPostgres.ts:188-215`) is four regexes over `conversationHistory.map(m=>m.content).join(' ')`:

```
/tender|gentle|soft|vulnerable/  → 'Tender vulnerability, open heart'
/fierce|strong|clear|direct/     → 'Fierce clarity, grounded strength'
/curious|wondering|exploring/    → 'Open curiosity, exploratory presence'
/depth|mystery|sacred/           → 'Reverent depth, mystery-holding'
fallback                         → 'Present, listening, unfolding'
```

**FACT.** On the sovereign lane `conversationHistory` is **exactly two messages — the current turn only** (`route.ts:1483-1486`): the member's message and MAIA's reply. It is not conversation history. Prior turns are never considered.

**FACT.** The regex therefore also matches **MAIA's own output**. If MAIA uses the word "gentle", the member is recorded as *"Tender vulnerability, open heart."*

**FACT.** Each turn **overwrites** the field (`ON CONFLICT … presence_quality = EXCLUDED.presence_quality`). The stored value is whichever branch the **most recent single turn** hit. Production distribution is consistent with this: `Present, listening, unfolding` 98 · `Fierce clarity, grounded strength` 31 · `Open curiosity, exploratory presence` 11 · `Tender vulnerability, open heart` 1 · `Reverent depth, mystery-holding` 1 (n=142).

**INFERENCE (high confidence).** The three descriptive branches are ordered, unweighted, first-match-wins. `/clear|direct/` are common ordinary words. The 31 members labelled *"Fierce clarity, grounded strength"* are, in the main, members whose last turn contained the word "clear". The label is a keyword artifact presented as a character description.

**Originating turn retained?** **NO.** Nothing links the row to the turn that produced it — no turn id, no timestamp of the matching text, no matched token. `updated_at` is the only trace and it is overwritten. **The evidence for the claim is destroyed at the moment the claim is stored.**

**Tentative or settled?** **Settled.** Stored as bare `text NOT NULL`. No confidence, no provenance, no hedge column.

### 2b. `morphic_resonance` — a saturating turn counter, rendered to the model as "trust"

**FACT.** `morphicResonance = Math.min(0.1 + encounterCount * 0.1, 1.0)` (`RelationshipAnamnesisPostgres.ts:113`). It is a pure function of turn count. It measures **nothing** about resonance, rapport, or the member. It saturates at 1.0 after 9 turns.

**FACT.** Production: 107 rows at 0.2, 25 rows at **1.0**. The 25 are simply members past 9 turns.

**FACT.** `RelationshipMemoryService.ts:223` — `const trustLevel = essence?.morphicResonance || 0;`
**FACT.** `RelationshipMemoryService.ts:572` — `` parts.push(`\nRelationship quality: ${phase}, trust ${(trustLevel*100).toFixed(0)}%, intimacy ${(intimacyLevel*100).toFixed(0)}%\n`) ``

**Therefore (FACT, by composition through §0):** for 25 members, MAIA's live system prompt currently asserts **`trust 100%`**. No member conferred trust. No trust was observed. A turn counter hit its ceiling and was relabelled.

**FACT.** `intimacyLevel` (`RelationshipMemoryService.ts:384-401`) is likewise arithmetic on the same counter plus elapsed days: `morphicResonance*0.5 + min(encounters*0.03, 0.3) + min(days*0.001, 0.2)`. Also rendered as a percentage.

**FACT — escalation, not just mislabel.** `determineRelationshipPhase` (`RelationshipMemoryService.ts:357-379`) derives `'deep'` from `resonance > 0.6 && encounters > 10`. `formatRelationshipMemoryForPrompt:544` then **unlocks additional prompt disclosure** — recurring themes with context, recent breakthrough text, emerging patterns — only for `established`/`deep`. **A turn counter gates how much of a member's material is injected into the prompt.** The log line `65 encounters, deep phase` is that gate opening in production.

---

## 3. THE UNAUTHENTICATED READ — highest-severity finding

**FACT.** `app/api/relationship-essence/route.ts` at `22200f967` (39 lines, full text read) contains **no authentication, no session check, no member-identity check, and no authorization**. It takes `soulSignature` from the query string and returns the row.

**FACT — probed through the production reverse proxy** (`Host: soullab.life` → `maia-caddy`, from inside the Docker network, no cookie, no `x-member-id`, no Authorization header):

```
http://maia-caddy  status=200
keys=soul_signature,user_id,user_name,presence_quality,archetypal_resonances,
     spiral_position,relationship_field,first_encounter,last_encounter,
     encounter_count,morphic_resonance
```

The response contained a **real member's legal name** and their inferred `presence_quality` string. Middleware did not intercept (`git show 22200f967:middleware.ts` — no `relationship-essence` entry; no auth branch reached this path).

**FACT.** The key is guessable by construction. `soul_signature = 'soul_' + user_id` (`RelationshipAnamnesisPostgres.ts:46`), and production confirms the shape: `count(*)=142`, `count(DISTINCT soul_signature)=142`, `count(*) WHERE soul_signature = user_id::text` = **0**. **Anyone holding any member's `user_id` can read that member's full essence record — name, inferred presence description, archetypal list, spiral position, breakthrough log, encounter history — with a single unauthenticated GET.**

**Scope discipline.** This was proven **through the edge proxy from inside the Docker network**. The DNS → router → minisforum public hop was **not** traversed. That final hop is **NOT ESTABLISHED**; there is no evidence it is filtered, and Caddy applied no auth.

**Cross-member effect.** The `ON CONFLICT (user_id)` write and all reads are keyed per member; `sig_eq_uid = 0` rules out signature/id collision, so **one member's row does not contaminate another's prompt** — that is **not** the exposure here. The exposure is **read access across members**, above.

**Note (structural fragility, not a live defect).** `RelationshipMemoryService.ts:64` — `WHERE soul_signature = $1 OR user_id = $1 LIMIT 1` — is an unordered `OR` with `LIMIT 1` and no deterministic tiebreak. It is safe **only** because the two namespaces cannot currently collide.

---

## 4. INSPECT · CORRECT · WITHDRAW · RELEASE

| affordance | state |
|---|---|
| **inspect** | No member-facing surface **ESTABLISHED**. The only read endpoint is the unauthenticated one in §3 — which is exposure, not inspection: it requires the member to know their own opaque `user_id` and read raw JSON. |
| **correct** | **NONE.** No PATCH/PUT anywhere. `POST` → `405` (probed in-container). |
| **withdraw** | **NONE.** No per-record deletion, no opt-out flag, no consent column in the schema (14 columns, all listed in §2; none is a preference). |
| **release** | **Only via full account deletion** — `app/api/members/delete-account/route.ts:108`. |
| **Sanctuary** | **Honored, both directions** — write `route.ts:1472 (!isSanctuary)`; read `maiaService.ts:735, 1471`. This is the one working consent control. |

**FACT — the deletion manifest mislabels the table.** `app/api/members/delete-account/route.ts:108`:

```ts
{ table: 'relationship_essences', column: 'user_id', label: 'people you noted' },
```

`relationship_essences` holds **MAIA's inferred description of the member**. It is not people the member noted. A member exercising deletion is shown a category name that conceals what is being deleted — and, prior to deletion, gives them no way to learn the record exists. Grouped alongside genuinely relational tables (`relationship_events`, `user_relationship_context`), the mislabel is not obviously a mislabel.

---

## 5. MEMBER-FACING RENDER

**FACT.** `user_name` from this table is member-visible in the greeting: `lib/services/greetingService.ts:713-721` loads the essence and `:721` sets `recognizedName = relationshipEssence?.userName || context.userName || 'friend'`, called from `components/OracleConversation.tsx:3393`.

**NOT ESTABLISHED.** Whether `presenceQuality` is *rendered* in greeting text. `relationshipEssence` is placed on `GreetingContext` (`greetingService.ts:759`) and `lib/greetings/greetingRender.ts` / `greetingStyle.ts` / `types.ts` reference it, but the render path was **not traced to a rendered string**. Availability is not composition — unresolved.

**FACT.** `greetingService.ts:2` imports from `lib/consciousness/RelationshipAnamnesis` (the **client** variant), whose `loadRelationshipEssence` (`RelationshipAnamnesis.ts:376-378`) fetches `/api/relationship-essence?soulSignature=…` — the unauthenticated route of §3. **That route is not orphaned; it is the greeting's live data source.**

**FACT.** `app/api/pfi/live-engagement/route.ts:44-89` (also unauthenticated; `userId` from query string) returns real `presenceQuality`, `archetypalResonances`, `morphicResonance`, `relationshipField.depth` from this table, interleaved with hardcoded fabrications (`responseDepth: 0.84`, `emotionalResonance: 0.76`, `sessionDuration: 450000 // simulated`). Real inference and invented numbers are returned in one indistinguishable payload.

**FACT (non-finding, recorded to prevent misreading).** `app/pfi-monitor/page.tsx`, `app/maia/realtime-monitor/page.tsx`, `components/consciousness/HigherSelfSystemPanel.tsx`, `MeditationAwakeningPlatform.tsx` all contain `presenceQuality`/`morphic_resonance` identifiers but are driven by `Math.random()` and hardcoded seeds (e.g. `pfi-monitor/page.tsx:177-179`). **Name collision, not this substrate.** Do not cite them as render evidence.

**NOT ESTABLISHED.** Any appearance of essence fields in the `/api/sovereign/app/maia/list` response body. `responseData` (`route.ts` ~1538+) carries `memoryHealth`, `runtimeContext`, `ainState`, `stateVector` — no essence field observed.

---

## 6. THE 404 — CLASSIFICATION

**The premise was mistaken. `/api/relationship-essence` is built, mounted, and reachable.**

**FACT — built artifacts in the running container:**
```
docker exec maia-sovereign ls -la .next/server/app/api/relationship-essence/
  route.js (10484)  route.js.nft.json  route_client-reference-manifest.js   [Aug 14 00:52]

.next/app-path-routes-manifest.json:
  "/api/relationship-essence/route": "/api/relationship-essence"
```

**FACT — in-container probes (`http://localhost:3000`):**
```
GET  /api/relationship-essence                      → 404  {"error":"Not found"}
GET  /api/relationship-essence?userId=test          → 404  {"error":"Not found"}
POST /api/relationship-essence                      → 405
GET  /api/relationship-essence?soulSignature=soul_2cea…  → 200  (full record)
```

**Cause (FACT, `route.ts:12-32`):** with no `soulSignature` param the handler defaults to the literal string `'unknown'`, queries `WHERE soul_signature = 'unknown'`, gets zero rows, and returns its **own application-level** `404 {"error":"Not found"}` at line 31. Source and runtime agree exactly.

**Classification.** **None of the six offered categories applies**, and I decline to force one — the route is not `NOT BUILT`, not `BUILT UNDER ANOTHER PATH` (manifest maps it to its own path), not `AUTH/PROXY-INTERCEPTED` (no auth exists to intercept it; §3), not `PRESENT BUT UNREACHABLE` (it returns 200), and not `SOURCE/RUNTIME DIVERGENT` (they match line-for-line). `METHOD-SPECIFIC` is true but incidental (GET-only, POST→405) and is **not** the cause of the observed 404.

**Correct classification: `BUILT · MOUNTED · REACHABLE — semantic 404 by design, parameter-specific.`** The earlier 404 was a probe without the required `soulSignature` query parameter. **This closes the 404 as a non-issue and simultaneously opens §3, which is the real finding: the route works, and it works for anyone.**

---

## 7. NOT ESTABLISHED (completion states, not gaps to paper over)

1. Whether `presenceQuality` is rendered into member-visible greeting text (`lib/greetings/greetingRender.ts` render path untraced) — §5.
2. Whether the DNS → router → minisforum public hop exposes `/api/relationship-essence` to the open internet. Proven only to the edge proxy — §3.
3. Whether `lib/agents/PersonalOracleAgent.ts:861-877` (which **does** compose `generateAnamnesisPrompt`, including `presenceQuality`) has any live caller. Every `PersonalOracleAgent` hit outside it was under `app/api/_backend/**`.
4. Live callers of the second writer, `lib/consciousness/RelationshipAnamnesisStorage.ts`.
5. DEEP-tier prompt arrival. `maiaService.ts:1875-1886` loads and sets `(meta as any).relationshipMemory`, but the DEEP prompt builder was **not** traced to a final assembly. Availability only — do not claim DEEP.
6. Whether any member has ever seen any field of this record. No inspection surface was found; absence of a surface is not proof of absence of exposure.
7. Provenance of the 142 rows (member-generated vs. backfill/fixture). Not audited here.
8. Whether the 50-entry `breakthroughs` list on the top row (`gold_seal: achieved` ×N, `rupture: detected` ×N) is reachable by any current reader. It is legacy from the retired oracle lane; `recalibrationEvent: null` on the sovereign lane means nothing is appended now.

---

## 8. SUMMARY OF THE CONTAINMENT ISSUE

**FACT.** A per-turn, consent-ungated writer maintains a row per member. Two of its fields reach MAIA's live system prompt as unhedged declarative fact. One of them — `morphic_resonance`, rendered **`trust {NN}%`** — is arithmetic on a turn counter and measures nothing; it currently asserts `trust 100%` for 25 members. The same counter gates how much additional member material the prompt discloses. A third field, `presence_quality`, is a first-match regex over a **single turn** (including MAIA's own words), stored as settled description, overwritten each turn, with the originating evidence discarded. The member cannot inspect, correct, or withdraw any of it; deletion is all-or-nothing and labelled *"people you noted."* Separately, the full record — including legal name — is readable by **any unauthenticated request** bearing a `soul_signature` derived deterministically from the member's `user_id`.

**Preserve the data. It is evidence.** ⛔ Nothing in this document authorizes a fix, a schema change, a migration, or a deletion. Building is CLOSED.

*Recorded read-only 2026-08-14 against `22200f967`. No writes issued.*
