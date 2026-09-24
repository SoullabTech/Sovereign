# JARVIS-FOUNDER-WORKSPACE-01 · B6R1R1
## Citation-conformant evidence response + resolved turn context

**Date:** 2026-09-24
**Predecessor:** B6R1 `6a77f05fca51a51c28b97b36a4727399cbd255e6`
**Act:** **B6R1R1 — CITATION-CONFORMANT EVIDENCE RESPONSE + RESOLVED TURN CONTEXT**
**Standing:** **BOUNDED IMPLEMENTATION CANDIDATE**

B6R1 proved that JARVIS can receive the right Writer's Studio context:

- exact canonical evidence;
- a bounded ChatGPT orientation receipt;
- local JARVIS reasoning;
- strict separation between evidence and partner orientation.

The installed Founder walk then established the remaining failure:

> the model understood the evidence but returned prose such as “Lines 1–23” instead of machine-valid `path:LINE` citations.

The canonical verifier correctly refused to treat that answer as grounded.

B6R1R1 repairs the response contract. It does **not** weaken the verifier.

## 1 · Response contract

Evidence-bearing C1 turns now ask the local model for JSON only:

```json
{
  "schema": "jarvis.grounded-response.v1",
  "supported_claims": [
    {
      "claim": "plain-language factual claim",
      "evidence": [
        {
          "fragment": 1,
          "quote": "verbatim source words copied from that fragment"
        }
      ]
    }
  ],
  "unsupported_claims": [
    "important thing Kelly asked about that the supplied evidence does not establish"
  ]
}
```

The worker does **not** author a repository path or final citation.

It names only:

- the 1-based fragment number JARVIS supplied;
- a substantial verbatim excerpt from that fragment.

The worker does **not** choose the source line. JARVIS token-matches the quoted source words back into the actual materialized fragment, requires a unique match, derives the absolute source line or line range, and only then constructs the citation:

```text
source/path.md:LINE
source/path.md:START-END
```

Markdown markers and warning icons may be omitted from the worker's quote, but the underlying source-word sequence may not be changed. The model cannot invent either the path or line used in the final citation.

The evidence-established section does not display the model's paraphrase as the grounded fact. Once a quote is validated, JARVIS renders the corresponding canonical source excerpt itself. This prevents a model interpretation—or partner-orientation language—from riding an unrelated valid citation into the evidence-established section.

## 2 · Fail-closed claim handling

A model claim is admitted under **What the evidence establishes** only when every evidence reference attached to that claim passes:

1. the fragment exists;
2. the quote is substantial rather than punctuation-only;
3. the quoted source-word sequence occurs uniquely inside that fragment.

If any check fails, the claim is moved to:

> **What I cannot establish from this evidence**

with no citation attached.

Malformed JSON, wrong schema, missing evidence, weak / fabricated / ambiguous quotes, and out-of-range fragment numbers therefore produce no supported claim. Any line number the model happens to emit is ignored.

The existing canonical `verifyEvidence()` implementation remains byte-identical to B6R1.

## 3 · Resolved turn context

A field safely resolved from Kelly's words is not silently promoted into a persistent field selection.

The Work room distinguishes:

```text
Current field   = a field Kelly explicitly selected
Turn context    = a field JARVIS safely resolved for one reasoning turn
```

For the current Writer's Studio example:

> **Turn context: Writer's Studio**

is shown after the turn resolves, while the interface separately explains that no persistent field was silently selected.

## 4 · Epistemic lanes remain separate

The rendered answer names:

```text
Turn context
Canonical evidence
Partner context (orientation only)

What the evidence establishes
What I cannot establish from this evidence
```

A MAIA, ChatGPT, or Claude Code handoff cannot satisfy a canonical evidence reference.

Partner context remains orientation only and grants no authority.

## 5 · Exact non-authorizations

B6R1R1 does not authorize:

```text
canonical verifier change         NO
repository write                  NO
Work Unit mutation                NO
new IPC channel                   NO
new provider authority            NO
frontier execution                NO
voice                             NO
B7 graph join                     NO
merge / deploy / production       NO
```

The B6R1R1 output contract improves grounding. It does not create a new authority surface.

## 6 · Local Qwen witness

The exact Founder request:

> **Investigate what is blocking Writer's Studio.**

was exercised locally after the structured response repair.

Observed:

```text
model                    qwen2.5:7b
transport                local Ollama
canonical field          WRITERS-STUDIO
canonical SHA            e886888416062c7fcbcf899040e3827bc8013835
canonical fragments      2
partner orientation      ChatGPT
grounded claims          3
unsupported claims       2
canonical citations      6 / 6 valid
verifyEvidence()         PASS
```

JARVIS derived the final citations itself, including citation ranges such as:

```text
docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md:21-22
docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md:620
docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md:621
docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md:641-642
```

The unchanged canonical verifier then accepted every emitted citation as contained in the materialized evidence.

This establishes **citation containment**, not omniscient semantic truth. The Work-room label is therefore **evidence grounding**, distinct from local execution success and from a stronger claim that every paraphrase is philosophically or semantically complete.

## 7 · Stop boundary

B6R1R1 stops before B7.

No merge, deployment, production mutation, graph relationship join, new provider authority, or new IPC channel is authorized by this act.
