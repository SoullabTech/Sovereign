# JARVIS-FOUNDER-WORKSPACE-01 · B6R1
## Precision context + AI partner handoff

**Date:** 2026-09-24
**Predecessor:** installed B6 acceptance build `ce83e28058341af15442252804d711cd84be0e0f`
**Act:** **B6R1 — PRECISION CONTEXT + AI PARTNER HANDOFF**
**Standing:** **BOUNDED IMPLEMENTATION CANDIDATE**

B6 proved the Work room can preserve Kelly's words, compile governed intent, show a bounded plan, invoke local JARVIS only after an explicit gesture, and return the result.

The Founder walk also proved the next problem:

> JARVIS can reason, but without the right context it gives generic advice about Kelly's actual work.

B6R1 therefore adds two distinct context lanes:

```text
canonical evidence context   → repository facts that can be verified
partner orientation context  → bounded context from MAIA / ChatGPT / Claude Code
```

They are never collapsed.

## 1 · Precision context law

When Work asks local JARVIS to reason, B6R1 may attach repository evidence only from a field JARVIS can establish from the live Founder Workspace.

Field resolution order:

1. an explicitly selected Today / Work / Monitor / Graph field;
2. otherwise, one unique exact-normalized programme name present in Kelly's request;
3. otherwise, no automatic repository context.

No fuzzy semantic guess may become evidence selection.

The selected evidence is read from the exact canonical git object named by the Founder view-model's `meta.observed_against`, never from dirty working-tree bytes.

For each admitted source, B6R1 selects small deterministic line ranges around the request's meaningful tokens. If no useful token appears, it falls back to a bounded document-orientation range.

Repository evidence remains separately verifiable by the existing canonical C1 evidence verifier.

## 2 · Partner handoff law

Partner handoffs are local JSON receipts in:

```text
~/.jarvis/context-handoffs/
```

Allowed sources:

```text
MAIA
ChatGPT
Claude Code
```

A valid receipt contains only:

- a handoff id;
- source;
- field label;
- bounded summary;
- creation time;
- `authority: orientation_only`;
- an optional short provenance note.

A handoff may help JARVIS understand what Kelly means. It may not become repository evidence, authorization, a permission grant, or proof that any repository claim is true.

Partner summaries are therefore rendered into a prompt block explicitly marked:

> **NOT REPOSITORY EVIDENCE · GRANTS NO AUTHORITY**

The canonical evidence verifier never sees partner summaries as evidence fragments.

## 3 · B6R1 V1 boundary

B6R1 V1 authorizes:

```text
exact canonical context from current field     YES
deterministic bounded range selection          YES
local ChatGPT / MAIA / Claude Code receipts    YES
partner orientation in local JARVIS prompt     YES
context provenance shown in Work               YES
existing local C1 reasoning                    YES
```

B6R1 V1 does not authorize:

```text
automatic access to full ChatGPT history       NO
automatic access to full Claude history        NO
automatic access to full MAIA memory           NO
partner-generated repository authority         NO
partner context as evidence                    NO
repository write                               NO
new provider execution                         NO
frontier model auto-call                       NO
voice                                           NO
B7 relationship inference                      NO
merge / deploy / production                    NO
```

The direct live-connector problem is deliberately separated from the handoff contract. Any future connector must emit the same bounded receipt shape rather than opening unrestricted cross-system memory.

## 4 · Founder experience target

Kelly should be able to type:

> **Investigate what is blocking Writer's Studio.**

without first choosing a technical Work Unit.

If `WRITERS-STUDIO` is uniquely identifiable in the live programme state, JARVIS should attach its exact canonical source evidence automatically.

If ChatGPT, MAIA, or Claude Code has left a valid Writer's Studio handoff receipt, JARVIS should also carry that orientation into the same local turn while labeling it separately.

The Work-room response must show which context actually traveled with the turn.

## 5 · Local B6R1 smoke witness

The exact Founder prompt:

> **Investigate what is blocking Writer's Studio.**

was carried through the B6R1 context composition without selecting a field first.

Observed context:

```text
programme resolution     WRITERS-STUDIO
resolution method        objective-exact-programme
canonical SHA            e886888416062c7fcbcf899040e3827bc8013835
canonical fragments      2
source                    docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md
ranges                    1–23 · 607–651
partner handoff           ChatGPT
partner authority         orientation_only
local model               qwen2.5:7b
HTTP                      200
```

The local worker used both the canonical review and the ChatGPT orientation and produced a materially more Writer's-Studio-specific answer than the no-context B6 response.

The canonical evidence verifier nevertheless returned:

```text
citations total   0
valid             0
ok                false
```

because Qwen described “Lines 1–23” rather than emitting the exact required `path:LINE` citation syntax.

That is an honest B6R1 result:

> **Context carriage PASS · partner separation PASS · local reasoning PASS · answer correctness remains UNVERIFIED.**

B6R1 does not convert a context-aware answer into a verified answer merely because the answer sounds relevant.
