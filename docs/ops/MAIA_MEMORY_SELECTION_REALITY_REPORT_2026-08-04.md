# Memory Selection Reality Report — Phase 1

**Date:** 2026-08-04 · **Referent:** deployed SHA `57b0324fd` (container created 2026-08-04T15:27Z, minisforum) · **Method:** `git show`/`git grep` at the SHA only — working tree never cited · **Status:** evidence report. No code modified. Classification ruling belongs to the founder per the lane charter (code reveals → founder decides fit → observability → behavior change).

## 1. Runtime provenance
- Deployed SHA: `57b0324fd`, verified via `docker exec maia-sovereign printenv GIT_COMMIT`.
- Active route: `app/api/sovereign/app/maia/list/route.ts` (sibling `…/maia/route.ts:6` self-declares superseded).
- Live confirmation: 4 `[MAIA/sovereign] atoms loaded` emissions in 48h, most recent `{ count: 8, userId: 'ce284751...' }` — the path fires under real member traffic and the limit saturates.

## 2. Selection path (call chain at the SHA)
```
route.ts:783  allowCrossSessionMemory && userId
route.ts:834  loadMemberMemoryAtomsForPrompt(userId)        ← no limit arg passed
lib/maia/memoryAtomsLoader.ts:230–286  SQL retrieval
route.ts:836  formatAtomsForPrompt (loader:361)
route.ts:838  atomsAddendum
route.ts:1058 getMaiaResponse({ meta: { atomsAddendum, atomsLoadedCount } })
lib/sovereign/maiaService.ts:1284  FAST template interpolation
lib/sovereign/maiaVoice.ts:524 buildMaiaWisePrompt → appendAllContextAddenda (:482)  CORE
```
DEEP-primary orchestrator does **not** inject atoms (only Claude-consultation lane `maiaService.ts:2086` and DEEP-repair `:2211`) — consistent with the addenda-channel divergence record.

## 3. Selection criteria (`memoryAtomsLoader.ts:274–284`)
```sql
FROM member_memory_atoms
WHERE member_id = $1
  AND memory_scope = 'personal'
  AND status IN ('active','still_alive')
  AND return_preference IN ('contextual_doorway','ritual_review_opt_in')
  AND NOT ('sacred_protected' = ANY(registers))
  AND (source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)
  AND member_response_status IS DISTINCT FROM 'rejected'
ORDER BY is_breakthrough DESC, kept_at DESC
LIMIT $2
```
Consent participates **in the WHERE clause** (`return_preference` = the member's standing-consent model; `sacred_protected`; `rejected`). Relevance does **not** participate anywhere: the current message text never reaches the query. Ranking is breakthrough-first, then recency. Personal scope only.

## 4. Where the 8 lives
`memoryAtomsLoader.ts:232` — `limit: number = 8,` a **parameter default** bound to `LIMIT $2`. The sovereign route omits the argument, so production runs the default. Oracle (`oracle/conversation/route.ts:674`) and between/chat (`:1869`) pass `8` explicitly. It is a hard SQL cap, not an emergent survivor count.

Other caps on the path: atom body truncated to 200 chars (loader:409; practitioner 300 at :469) · conversational recall 6 exchanges (route:853) · episodes 5 (route:881) · developmental 3 / themes 10 (route:786–787).

## 5. Gates
- `allowCrossSessionMemory = isRecognizedUser && !isSanctuary` (route:420; sanctuary from `meta.sanctuary`, :408).
- No per-member consent flag for atoms at route level — consent is entirely the SQL `return_preference` clause. `conversational_recall_enabled` (`lib/maia/memoryLoaders.ts:241–254`, default-on) gates the conversational-recall layer only, not atoms.
- Tier: FAST and CORE inject; DEEP-primary does not.

## 6. Suppression after retrieval
None for atoms. No dedup, no scrubbing, no char budget — `PROMPT_BLOCK_CHARS` (`maiaRuntimeContext.ts:283–293, 348`) only **observes** size, never truncates. Loader failure returns `[]` silently (fail-empty, loader:308–319, marker `atoms loader failure-empty`).

## 7. Log markers at this SHA
`[MAIA/sovereign] atoms loaded: {count,userId}` (route:839) · `atoms: none surfacable for this member` (:841) · `atoms loader failure-empty` (loader:315) · `breakthrough surfaced` (route:925) · `[MAIA] conversational-block` (:864) · `memoryHealth` (:963) · `🧬 [FAST] atoms-addendum injected` (maiaService:1242) · `[MAIA] context-inventory` incl. `atoms:{loaded,injected,chars}` (maiaService:2898).

## 8. The measured decomposition (production, member `ce284751…`)
| Stage | Count |
|---|---|
| Stored (all scopes/statuses) | **133** |
| Eligible (full WHERE, no LIMIT) | **128** |
| Injected | **8** |

The consent/status filters remove only 5 atoms. **The `LIMIT 8` removes 120** — ~94% of what the member has consented to surface is silently dropped every turn, chosen purely by breakthrough-flag + recency. (The earlier "142" figure was close but not exact for this member; likely a different count moment or scope — noted, not material.)

## 9. Classification evidence (ruling reserved for founder)
- **Not stale wiring**: three routes consistently use 8; path is live and saturating.
- **Not consent-shaped**: consent already acted upstream in the WHERE; the LIMIT cuts *consented* material.
- **No documented rationale found at the SHA** (no comment, no config, no canon citation on the constant) — consistent with an *inherited implementation constant*, but "deliberate cognitive boundary" cannot be excluded from code alone; that is a fit question, not a code question.
- **The opaque-gate criterion is met regardless of intent**: nothing records *which* 120 were dropped or why — there is no `offered`/`withheld` distinction anywhere on the path (FTR grammar gap confirmed at runtime).

## Phase 2 seed (gap map, from this evidence)
| Transition | Observable | Persisted | Explainable | Governed |
|---|---|---|---|---|
| STORED→RETRIEVED | log count only | ✗ | SQL is legible | consent WHERE ✓ |
| RETRIEVED→ELIGIBLE | collapsed into SQL (same step) | ✗ | ✓ | ✓ |
| ELIGIBLE→OFFERED | **✗ — LIMIT 8 is invisible** | ✗ | ✗ (no reason recorded) | ✗ |
| OFFERED→INJECTED | `context-inventory` chars | ✗ | partial | tier-dependent (DEEP ✗) |
| INJECTED→USED | **unknown — correctly unmeasured** | ✗ | ✗ | n/a |
