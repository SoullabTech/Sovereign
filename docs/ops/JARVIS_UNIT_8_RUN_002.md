# JARVIS UNIT 8 — RUN 002 (AUDIT RECORD)

Authority: `docs/ops/JARVIS_UNIT_8_PRECISION_CONTEXT.md`

## Run 001 baseline (frozen — not reinterpreted)

| Field | Value |
|---|---|
| packet | `jarvis-u7-provider-trace` |
| context strategy | whole files (3 selected, names only) |
| context burden | ~100 KB of source the worker had to read |
| worker / backend | `maia-coder:latest` · Ollama `localhost:11434` |
| duration | 116 s |
| exit | 1 |
| failure | `Prompt is too long` |
| evidence returned | none |
| disposition | ESCALATION REQUIRED |

maia-coder genuinely executed; the prompt exceeded its usable window; JARVIS
correctly escalated. **A context-packaging failure, not a worker-quality failure.**

## Run 002

| Field | Value |
|---|---|
| packet | `jarvis-u8-provider-trace-002` |
| context strategy | **7 precision line-range fragments, materialized with provenance** |
| est. input | **2,330 tokens** (threshold 32,768 · limit 65,536 · headroom 30,438) |
| budget status | **OK** — checked before invocation |
| worker / backend | `maia-coder:latest` · Ollama `localhost:11434` · `ANTHROPIC_API_KEY` blanked |
| Builder claim | `s-fc0c7f49` |
| invocation | `bash scripts/ain-delegate.sh local jarvis-u8-provider-trace-002` |
| duration | **106 s** |
| exit | **1** |
| transcript | 211 bytes — `Prompt is too long` |
| evidence returned | none |
| disposition | **ESCALATION REQUIRED** |

### Materialized context manifest

| Source | Selector | Lines | SHA-256 (16) | Reason |
|---|---|---|---|---|
| `app/api/sovereign/app/maia/list/route.ts` | lines | 255-262 | `e697fea0cba0` | candidate live entry point |
| `app/api/sovereign/app/maia/list/route.ts` | lines | 84-90 | `b6fd580b2618` | route imports — delegation target |
| `lib/sovereign/maiaService.ts` | lines | 1-12 | `74857b60612e` | service imports — text-generation source |
| `lib/sovereign/maiaService.ts` | lines | 1333-1344 | `45ccab36a78f` | a generation call site |
| `lib/ai/modelService.ts` | lines | 47-64 | `e0b49ef2f06a` | provider constant + type |
| `lib/ai/modelService.ts` | lines | 76-96 | `01dde0c8623d` | selection function head |
| `lib/ai/modelService.ts` | lines | 150-194 | `a97fc5cdf609` | remaining provider branches |

No conclusions were embedded in `established_facts` — evidence only.

## Control experiment (decisive)

```
$ maia-code -p "Reply with the word OK." --permission-mode bypassPermissions
Execution error
```

A five-word prompt fails identically. **The overflow is therefore not attributable
to the work packet at any size.**

Harness overhead measured: repo `CLAUDE.md` = 47,362 bytes ≈ 11,840 tokens,
auto-loaded before packet content, plus system prompt, tool schemas, and MCP
definitions.

## Independent verification (§9)

| Check | Result |
|---|---|
| Claims checked | **0** — worker returned no citations |
| Passed | 0 |
| Failed | 0 |
| Verification commands re-run by JARVIS | **4/4 PASS** |
| Boundary respected | YES — `files_changed: []` |
| Verified | **NO** |
| Escalation required | **YES** |

The worker again self-reported `escalation_required: false` while exiting non-zero
with `recommended_next_action: "reject"`. JARVIS again escalated on objective
evidence rather than the self-report — the same contract defect Run 001 recorded,
now reproduced. Two runs, same inconsistency: this is systematic, not incidental.

## Run 001 vs Run 002

| | Run 001 | Run 002 |
|---|---|---|
| context strategy | whole files | 7 precision ranges |
| context size | ~100 KB to read | 2,330 est tokens |
| budget gate | none | **OK, pre-invocation** |
| provenance | file names only | path + sha + range + hash + reason |
| duration | 116 s | 106 s |
| exit | 1 | 1 |
| failure layer | CONTEXT | **RUNTIME** |
| disposition | ESCALATION REQUIRED | ESCALATION REQUIRED |

**Did precision context selection convert failure into verified success? NO.**

It did convert the *failure layer*: Run 001 failed because the packet was too big;
Run 002's packet is provably small and the same wrapper still fails on a five-word
prompt. That is real diagnostic progress and an honest negative result.

## Failure attribution (§11)

**RUNTIME.** The `maia-code` wrapper inherits Claude Code's unbounded harness
overhead. Fixing it requires reducing what the harness loads (e.g. a minimal
`CLAUDE.md` for worker lanes, or calling Ollama's API directly instead of through
the Claude Code CLI) — neither of which is Unit 8 scope.

Per §11: not tuned, not worked around, failed honestly.
