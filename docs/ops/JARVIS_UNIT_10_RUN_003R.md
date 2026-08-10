# JARVIS UNIT 10 — RUN 003-R (AUDIT RECORD)

## Unit 9 baseline (frozen, not reinterpreted)

| Field | Value |
|---|---|
| packet | `jarvis-u9-provider-trace-003` · lane `local-native` |
| worker / backend | `maia-coder:latest` · Ollama `localhost:11434` |
| control probe | 254 prompt tokens → `OK` (same 5 words the CLI called "too long") |
| duration / exit | 6 s / **0** |
| result | substantive trace with citations |
| verification | **5 of 6 passed; 1 fabricated** — `route.ts:257` is `}`; `POST` is at 253 |
| disposition | EVIDENCE INSUFFICIENT → ESCALATION REQUIRED |

Native transport succeeded. The failed citation was a packet/provenance defect,
not grounds to weaken verification.

## Run 003-R

| Field | Value |
|---|---|
| packet | `jarvis-u10-provider-trace-003r` |
| transport | native Ollama `/api/generate` (unchanged from Unit 9) |
| worker | `maia-coder:latest` |
| execution HEAD | `54809f994` — same tree for selector, materialization, worker, verifier |
| leakage lint | **OK** — 0 violations |
| duration / exit | **29 s / 0** |
| disposition | **VERIFIED** |

### Selector provenance — all rebound at execution HEAD

| Source | Anchor | Resolved | Rebound |
|---|---|---|---|
| `route.ts` | `export async function POST` | **253-259** | YES |
| `route.ts` | `from '@/lib/sovereign/maiaService'` | 86 | YES |
| `maiaService.ts` | `from '../ai/modelService'` | 6 | YES |
| `modelService.ts` | `export async function generateText` | 76-96 | YES |
| `modelService.ts` | `export const TEXT_MODEL_PROVIDER` | 52-54 | YES |
| `modelService.ts` | `// Primary: Claude (Anthropic)` | 153-195 | YES |

No selector carried a literal expected line number. No verification command
reached the worker.

## Worker result (verbatim)

```
LIVE ENTRY POINT: app/api/sovereign/app/maia/list/route.ts:253
CALL CHAIN: route.ts:253 → route.ts:86 → maiaService.ts:6 → modelService.ts:76
PROVIDER SELECTION: lib/ai/modelService.ts:153 (function generateText)
EVIDENCE: …:52-53 TEXT_MODEL_PROVIDER definition · …:154-193 provider branch logic
FAILURES: None identified in the provided context
UNKNOWNS: generateWithClaude / generateWithLocalModel implementations not provided;
          MAIA_INFERENCE_MODE and ENABLE_MULTI_ENGINE values not provided; behavior
          when TEXT_MODEL_PROVIDER is neither 'anthropic' nor 'moonshot' not shown.
```

## Independent verification (§9) — 7 citations

| Citation | Actual line content | Valid | Claim supported |
|---|---|---|---|
| `route.ts:253` | `export async function POST(req: NextRequest) {` | ✅ | ✅ |
| `route.ts:86` | `import { getMaiaResponse } from '@/lib/sovereign/maiaService';` | ✅ | ✅ |
| `maiaService.ts:6` | `import { generateText, type ProviderMeta } from '../ai/modelService';` | ✅ | ✅ |
| `modelService.ts:76` | `export async function generateText(req: TextRequest)` | ✅ | ✅ |
| `modelService.ts:52` | `export const TEXT_MODEL_PROVIDER: TextModelProvider =` | ✅ | ✅ |
| `modelService.ts:154` | `if (TEXT_MODEL_PROVIDER === 'anthropic' \|\| … 'moonshot')` | ✅ | ✅ |
| `modelService.ts:153` | `// Primary: Claude (Anthropic)` | ✅ | ⚠️ imprecise |

**7/7 citations valid · 7/7 inside supplied context · 6/7 claims exactly supported.**

The one imprecision: the worker labelled `:153` "the if statement that checks
TEXT_MODEL_PROVIDER"; 153 is the comment introducing that branch and the `if` is
at 154. The worker separately and correctly cited `154-193` as the branch logic,
so no material claim is falsified. Recorded rather than smoothed over.

Crucially this is a different class of error from Unit 9's: there, the cited line
contained `}` and the claim was fabricated from a leaked hint. Here every cited
line contains what the worker says it does.

The worker again self-reported `escalation_required: false` — fourth consecutive
run. Verification, not self-report, decided the disposition in all four.

## Controlled comparison

| | Unit 9 Run 003 | Unit 10 Run 003-R |
|---|---|---|
| transport | native | native (unchanged) |
| leakage | `sed -n '257p'` in prompt | **lint OK, 0 violations** |
| selector provenance | dirty tree, unbound | **anchor-rebound at execution HEAD** |
| entry point returned | 257 ❌ | **253 ✅** |
| citations valid | 5/6 | **7/7** |
| disposition | EVIDENCE INSUFFICIENT | **VERIFIED** |

**Did SHA-bound, non-leaking context convert execution-success/evidence-insufficient
into execution-success/VERIFIED? YES.**
