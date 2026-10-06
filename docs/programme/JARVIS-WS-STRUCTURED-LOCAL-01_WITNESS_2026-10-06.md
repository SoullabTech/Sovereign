# JARVIS — Writer's Studio Local Structured Inference 01
## Governed Seam Amendment Witness — 2026-10-06

Programme: `WS-STRUCTURED-LOCAL-01`
Founder authorization: 2026-10-06, explicit direction to proceed with the local structured-inference repair.

## Problem witnessed

Writer's Studio Developmental Reading could complete locally, but the subsequent evidence-bound Attention Map synthesis still entered the Anthropic structured adapter. On the local founder environment that path failed before dispatch because no Anthropic authentication was configured.

Observed failure:

```text
POST /api/sovereign/manuscripts/.../attention-map 502
[structured] provider_unavailable
preflightMessage: Could not resolve authentication method...
```

The result was a truthful but incomplete member experience: MAIA had read the chapter, but could not gather the structured impressions.

## Ruling

Local structured inference is a first-class governed provider, not a fallback.

- The caller continues to pin the exact model.
- The platform continues to own inference mode and provider authorization.
- No provider failure falls through to a second provider.
- In primary mode, an explicitly configured local model is executed locally; other pinned models remain on the external path.
- In sovereign/local_only mode, the configured local structured provider is the only serving path.
- Missing local configuration still refuses.

## Implementation

Governed seam amendment commit:

`62fdad60cdaa69ea6384a02a704bc136af2e5732`

Changes:

- added `lib/ai/structured/ollamaStructuredAdapter.ts`
- amended `lib/ai/structured/router.ts` to admit a configured local structured model without fallback
- added `MAIA_LOCAL_STRUCTURED_MODEL` as the local provider/model authorization binding
- wired Writer's Studio Attention Map model resolution to that configured local structured model
- added adapter and routing tests

The Ollama adapter preserves:

- pinned model
- ordered system/user/assistant roles
- JSON tool schemas
- required named-tool selection
- token ceiling
- one completed response
- response model identity and agreement
- input/output token usage
- dispatch observation on provider errors
- required-schema validation before a tool result can leave the adapter

## Real local model witness

Local runtime:

```text
Ollama 0.35.1
model qwen3-coder:30b
```

Real structured smoke test through the production `runStructured` API:

```json
{
  "ok": true,
  "result": {
    "content": [
      {
        "type": "tool_use",
        "name": "return_x",
        "input": { "x": 3 }
      }
    ],
    "stopReason": "end_turn",
    "usage": {
      "inputTokens": 260,
      "outputTokens": 22
    },
    "provenance": {
      "provider": "ollama",
      "model": "qwen3-coder:30b",
      "reportedModel": "qwen3-coder:30b",
      "modelAgreement": "agreed"
    }
  }
}
```

No external provider was used.

## Machine gates

Focused structured-inference gates before baseline admission:

```text
5 suites passed
51 tests passed
Writer's Studio flagship typecheck passed
git diff --check passed
```

Governed seam isolation after baseline movement:

```text
1 suite passed
18 tests passed
five seam files byte-identical to governed baseline
plain-text seam remains byte-identical to canonical
```

## Governed baseline

Previous governed seam baseline:

`8ea119d52cbf0d79ab641943930cf0b294bbfbb1`

New governed seam baseline:

`62fdad60cdaa69ea6384a02a704bc136af2e5732`

The active pin now covers:

1. `lib/ai/structured/types.ts`
2. `lib/ai/structured/policy.ts`
3. `lib/ai/structured/router.ts`
4. `lib/ai/structured/anthropicStructuredAdapter.ts`
5. `lib/ai/structured/ollamaStructuredAdapter.ts`

## Next witness

Start the local Writer's Studio server with:

```text
MAIA_LOCAL_STRUCTURED_MODEL=qwen3-coder:30b
```

Then use the real Elemental Alchemy Chapter 10 flow:

```text
Develop → Chapter 10 → Read this chapter
```

Pass condition: the existing evidence-bearing chapter reading synthesizes into a four-item Attention Map through Ollama and renders in Develop with `provider=ollama`, exact model agreement, no Anthropic authentication attempt, and no manuscript mutation.
