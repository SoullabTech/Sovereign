# JARVIS UNIT 9 — RUN 003 (AUDIT RECORD)

| Field | Value |
|---|---|
| packet | `jarvis-u9-provider-trace-003` |
| lane | **`local-native`** |
| transport | `POST http://localhost:11434/api/generate` |
| worker | `maia-coder:latest` (18 GB, `num_ctx 65536`) |
| context | 7 precision fragments, 2,330 est tokens (Unit 8 router) |
| HEAD | `54809f994` (clean worktree) |
| duration | **6 s** (Run 001: 116 s · Run 002: 106 s) |
| exit | **0** |
| escalation | **REQUIRED** (see verification) |

## Worker output (verbatim, unedited)

```
LIVE ENTRY POINT: app/api/sovereign/app/maia/list/route.ts:257
CALL CHAIN:
- route.ts:257 -> lib/sovereign/maiaService.ts:6
- lib/sovereign/maiaService.ts:6 -> lib/ai/modelService.ts:76
PROVIDER SELECTION: lib/ai/modelService.ts:76 (generateText function)
EVIDENCE: …:52 TEXT_MODEL_PROVIDER · …:154 anthropic branch · …:186 local fallback
FAILURES: None identified
UNKNOWNS: generateWithClaude / generateWithLocalModel not included in the excerpts.
```

## Independent verification (§9) — 6 claims checked

| # | Citation | Actual line content | Verdict |
|---|---|---|---|
| 1 | `route.ts:257` | `}` | ❌ **FABRICATED** — `POST` is at **253** at this HEAD |
| 2 | `maiaService.ts:6` | `import { generateText, type ProviderMeta } from '../ai/modelService';` | ✅ |
| 3 | `modelService.ts:76` | `export async function generateText(req: TextRequest)` | ✅ |
| 4 | `modelService.ts:52` | `export const TEXT_MODEL_PROVIDER: TextModelProvider =` | ✅ |
| 5 | `modelService.ts:154` | `if (TEXT_MODEL_PROVIDER === 'anthropic' \|\| … 'moonshot')` | ✅ |
| 6 | `modelService.ts:186` | `console.log('🔮 Using local model (Ollama/DeepSeek)')` | ✅ |

**Passed 5 · Failed 1.** All 6 citations fell inside supplied fragment ranges, so
range-membership alone would have passed all six — only checking the cited line
against source caught claim 1.

### Root cause of the fabrication

The fragment the worker was shown for `route.ts` (lines 255-262 at clean HEAD)
contains `if (process.env.CAPACITOR_BUILD)`, not the handler. The number `257`
appears in the packet's own `verification_commands` (`sed -n '257p' …`). The worker
echoed a leaked hint rather than reading its evidence.

Two defects, both ours, both now recorded:
- `verification_commands` leaked the expected answer into the prompt.
- Selectors were authored against a dirty working tree (`POST` at 257) while the
  delegate worktree is clean `54809f994` (`POST` at 253).

The worker also again reported `escalation_required: false` — third consecutive run
with that self-report while its output did not warrant trust.

## Disposition

**EVIDENCE INSUFFICIENT → ESCALATION REQUIRED.** The headline claim is unsupported
by the evidence supplied. 5/6 remaining citations are sound and the substantive
trace (route → maiaService:6 → modelService:76 `generateText`) is correct.

**Transport objective: ACHIEVED.** The worker executed, in 6 seconds, and produced
verifiable evidence for the first time across three runs.
