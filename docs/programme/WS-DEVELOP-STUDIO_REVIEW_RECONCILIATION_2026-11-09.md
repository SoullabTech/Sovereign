# Review reconciliation — Develop plan journey (2026-11-09)

Each reviewer examined the code separately; each finding was checked against the code by Claude Code (the accountable executor) before any repair.
⛔ None of these reviews is Class A / R20 independent acceptance. Two were same-family (Claude subagents without shared context); two were local
open-weight models run on the Mac Studio (nothing left the machine). ChatGPT's reviews arrive through the founder and are recorded in the owner thread.
Codex and Kimi were not used: the founder's interim hold of 2026-09-20 blocks sending repository source to external providers.

| Reviewer | Candidate | Findings | Confirmed in code | Outcome |
|---|---|---|---|---|
| Claude subagent · security (no shared context) | `87cdf49e5` | 7 | 5 (removed-step text kept forever · thread from another manuscript · GET read text without permission · chapters in the system prompt · null body 500) | fixed in `17234b6d1`; Sanctuary-is-client-asserted kept as an open item |
| Claude subagent · correctness (no shared context) | `87cdf49e5` | 9 | 8 (editor text vs saved text · case-folded offsets · grounding/locating mismatch · receipts over-reported · fresh plan unusable · lost update + unguarded status · link not tied to hand-off · desk-open timing · missing outcome read as linked) | fixed in `17234b6d1`; hand-off provenance at the server recorded as a limitation |
| ChatGPT (via founder) | `8a7b83659` packet | requirements, not defects: bind plans to decisions; discussing ≠ reopening; G6 first | — | built in `8a7b83659` (decisions digest) and `9efc0122b` (G6) |
| Local · Qwen3 Coder 30B (`jarvis-qwen3-coder:65k`) | `8a7b83659` | 6 | **0** — all contradicted by the code (link query already binds step-in-plan, member and manuscript; edit/delete already filter manuscript; empty-on-missing-table is documented) | none needed |
| Local · GPT-OSS 20B | `8a7b83659` | 5 substantive (rest were repeated "None" rows) | **0** — "cross-member link" (both bound to the requester), "omitted Sanctuary passes" (refused unless explicitly false), "empty ask" (trimmed and refused), "existence probe" (foreign and missing both refuse identically) | none needed; first run returned no answer (reasoning channel only), rerun with low reasoning effort |

## What the comparison says
- The two context-free Claude reviews found every confirmed defect; the local 20–30B models found none and produced several confident false positives. On this code, the local models are useful as a cheap second look but not as evidence of safety.
- Disagreements were settled by reading the code, not by vote. Agreement among models is not certification.
- Still owed: independent human/Class A security acceptance of Sanctuary handling, standing permission, receipts and tenant isolation; a real-model walk; the founder walk.
