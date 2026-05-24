# Move 2 (Learning Spine) — Read-Only Diagnostic

**Date:** 2026-05-24
**Mode:** Read-only (no edits). All findings verified against live production env + checked-in source.

---

## Move 1 Confirmation

`ANTHROPIC_API_KEY` rotated. Confirmed in `maia-sovereign` container on minisforum:
- length = 108 chars
- prefix = `sk-ant-`
- format consistent with current Anthropic key shape.

## Production env (relevant)

| Var | Value |
|---|---|
| `ANTHROPIC_API_KEY` | present (108 chars, `sk-ant-…`) |
| `MAIA_SHADOW_MODE` | **unset** → defaults *on* in code (`!== '0'`) |
| `MAIA_SHADOW_ENGINES` | **unset** → defaults to **`deepseek-r1:8b`** (hardcoded fallback) |
| `MAIA_INFERENCE_MODE` | **unset** → sovereign router gated off (`lib/ai/modelService.ts:80-84`) |
| `OLLAMA_MODEL_GENERAL` | `qwen2.5:7b` |
| `OLLAMA_MODEL_DEEP` | `qwen2.5:14b-instruct` |
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` |

**Drift:** shadow defaults to a model the rest of the production stack is not deployed against (Ollama serves Qwen, shadow asks for DeepSeek). If DeepSeek-r1:8b isn't pulled into the production Ollama, shadow simply fails silently and `local models offline, skipping shadow mode` fires (`lib/learning/shadowModeRunner.ts:48`).

---

## 1. Current capture path

```
oracle/conversation/route.ts
  → lib/sovereign/maiaService.ts (primary inference, returns text)
    ↓ logMaiaTurn() returns turnId from maia_turns        [lib/sovereign/maiaService.ts:3066]
    ↓ if turnId>0 && MAIA_SHADOW_MODE!=='0':              [maiaService.ts:3088]
       runShadowEngines({turnId, ...})  ── fire-and-forget [maiaService.ts:3093]
         ↓ shadowModeRunner.ts
           ↓ for each shadow engine: generateWithLocalModel()
           ↓ EngineComparisonService.logShadowResponses() [shadowModeRunner.ts L~150]
             ↓ inserts rows into maia_engine_comparisons  [engineComparisonService.ts:97]
               WITH is_primary IMPLICITLY FALSE          (uses logEngineResponse w/ isPrimary=false)
```

Schema (`database/migrations/20260204000001_engine_comparisons.sql`):
```
maia_engine_comparisons:
  turn_id BIGINT REFERENCES maia_turns(id)
  engine_name TEXT
  is_primary BOOLEAN DEFAULT false
  response_text TEXT
  …
```

`turn_id` is the shared identity. It already links both paths — Move 2 needs **no new ID plumbing**.

## 2. Why only shadow rows are written

- `EngineComparisonService.logEngineResponse({isPrimary: true})` **exists** and works.
- Grep across all `*.ts` for `logEngineResponse` callers with `isPrimary: true`: **zero call sites.**
- Oracle conversation route grep for `EngineComparisonService|logEngineResponse|logPrimaryResponse|is_primary`: **NO_PRIMARY_LOG_CALL_FOUND**.
- The primary response text and engine identity are stored in `maia_turns` (one row per conversational turn, `engine` column) but **never written as the `is_primary=TRUE` row of the comparison table**.

So `maia_engine_comparisons` currently holds *only orphan shadow rows*. With nothing to compare against, no reviewer workflow can function. The substrate monitor's "single model fallback" message reflects exactly this.

## 3. Is `is_primary=TRUE` a one-line fix or structural fix?

**Small structural addition (~10 lines, single file).** Not one line; not architectural either.

- No schema change (column exists).
- No new ID plumbing (`turnId` already in scope).
- New call site: directly after the shadow trigger at `lib/sovereign/maiaService.ts:3093`.
- Required local values (all in scope at that point):
  - `turnId` ✅
  - primary response text ✅ (whatever `logMaiaTurn` was given)
  - primary engine identifier — **needs to be lifted out of inference call site** (currently embedded in maia_turns `engine` column write but not retained as a variable; this is the only mildly structural piece)
  - response time — measurable via timestamp delta around the primary inference

## 4. Is `deepseek-r1:8b` hardcoded, configured, or stale?

**Hybrid — env-configurable with a hardcoded default that is stale relative to deployed Ollama.**

- `lib/learning/shadowModeRunner.ts:20`:
  ```ts
  const SHADOW_ENGINES = (process.env.MAIA_SHADOW_ENGINES || 'deepseek-r1:8b').split(',');
  ```
- `MAIA_SHADOW_ENGINES` is unset in production → the `'deepseek-r1:8b'` literal is what runs.
- Production Ollama serves `qwen2.5:7b` / `qwen2.5:14b-instruct`. DeepSeek-r1:8b is **not** the deployed local model.
- Unverified: whether `deepseek-r1:8b` is even pulled into the Ollama instance on the host. If not, every shadow attempt fails the `checkLocalModelHealth` gate and exits silently.

## 5. Can/should Qwen be the shadow target?

**Yes — recommended as the Move 2 intentional alignment.**

Rationale:
- Qwen2.5:7b is what the rest of the local-model stack is deployed against (`OLLAMA_MODEL_GENERAL`).
- Aligning shadow with the deployed general model means the comparison evaluates *"the model we'd actually consider graduating to"*, not a parallel experimental one.
- Learning Spine Move 2 specifically calls for *intentional* shadow alignment — `MAIA_SHADOW_ENGINES=qwen2.5:7b` makes that intent explicit and removes the silent stale-default failure mode.
- Optional later: add `qwen2.5:14b-instruct` for DEEP-profile turns; keep single shadow engine for first slice.

Pre-flip verification needed: confirm `qwen2.5:7b` is actually available on the host's Ollama (`ollama list` on minisforum) — should be, since it's serving inference, but worth checking before the shadow flips.

## 6. Smallest safe Move 2 patch

**Two changes, both contained.**

### A) Code (`lib/sovereign/maiaService.ts`, one new block ~10 lines)

Immediately after the existing shadow trigger (around line 3104), add fire-and-forget primary-engine logging:

```ts
// Loop C: log primary engine response so paired comparison exists
if (turnId > 0) {
  try {
    const { EngineComparisonService } = await import('../learning/engineComparisonService');
    EngineComparisonService.logEngineResponse({
      turnId,
      engineName: primaryEngineId,        // captured from the inference call
      isPrimary: true,
      responseText: response,              // primary text already in scope
      responseTimeMs: primaryLatencyMs,    // measured around the primary call
      processingProfile,
    }).catch(err => console.warn('⚠️ [PRIMARY-LOG] Failed:', err));
  } catch (primaryLogErr) {
    console.warn('⚠️ [PRIMARY-LOG] Import failed:', primaryLogErr);
  }
}
```

Prerequisite: ensure `primaryEngineId` and `primaryLatencyMs` are bound as locals at this scope. They are computed during the primary inference earlier in the function but not retained as named variables. Lift them. This is the only structural ask.

Must remain fire-and-forget (no `await` on `logEngineResponse`). Must not throw into the user path.

### B) Production env (no code change)

Set explicitly on minisforum (avoid relying on coincidence of unset defaults):
```
MAIA_SHADOW_MODE=1
MAIA_SHADOW_ENGINES=qwen2.5:7b
```

Then redeploy and verify:
1. A real user turn produces **two** rows in `maia_engine_comparisons` with the same `turn_id`: one `is_primary=TRUE` (Claude), one `is_primary=FALSE` (qwen2.5:7b).
2. Substrate monitor should begin reporting paired execution (the literal "single model fallback" message clears itself — runtime fact has changed).

## What is NOT in this patch (held)

- No sovereign router activation (`MAIA_INFERENCE_MODE` stays unset — separate arc).
- No removal of dormant DeepSeek references elsewhere — only the `SHADOW_ENGINES` default is at issue here.
- No reviewer UI work — that is Move 4, lands on `/admin/maia/engine-comparisons` (separate surface), not on substrate.
- No additional engines beyond Qwen for first slice — Move 3 is bounded (20–50 paired turns, one shadow target).

## Next gate after this patch lands

20–50 paired turns captured → Move 3 closes. Then Move 4 (thinnest reviewer) can stand up. Until then, substrate continues to report state honestly.
