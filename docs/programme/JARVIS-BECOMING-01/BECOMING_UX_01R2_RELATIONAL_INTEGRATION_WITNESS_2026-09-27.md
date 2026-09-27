# BECOMING-UX-01R2 — Relational integration after Return

**Date:** 27 September 2026
**Exact code source:** `1bc5e70c8488d608be82161e6e98a7b8b232d65e`
**Branch:** `feature/becoming-local-candidate-20260927`
**Preview:** `http://localhost:3797/becoming`
**Bundle SHA-256:** `7d09e3e83e5ce6d4bd3f5b65cd8e82beee09129ef2490ed6a55ea3e5c8d141c2`

## Founder finding

The founder completed the full guided Future Self journey and reported that the experience “sort of deadened” after all the material had been gathered. The missing act was a supportive synthesis and an ongoing conversation with MAIA that did not require the member to repeat the journey.

A second founder clarification fixed the navigation law: asking MAIA for synthesis must **not dump the member into /maia**. The conversation belongs in the same Becoming field by default. A full-MAIA doorway may later be offered as a separate choice, but only when it can preserve continuity rather than opening a blank conversation.
## Repair

After an explicit Return, Becoming now offers **Talk with MAIA about this journey** inside the Return surface. The member remains at `/becoming`.

One explicit gesture hands MAIA the complete member-authored journey: where the member began, each imagined possibility, member-entered present/future dialogue, discernment, unresolved material, Return, chosen carry, and any member-noticed Across Time connection.

The handoff text is inspectable before sending. It explicitly labels future imagery and future-perspective dialogue as imaginal, not predictive or external communication. It asks MAIA to begin with a supportive synthesis, distinguish hypotheses from member-authored material, avoid future-self impersonation or destiny claims, and then ask one natural question to deepen the conversation.

After synthesis, the member can continue talking with MAIA **inside Becoming**. The journey remains the relational context; no retyping is required.
## Full-MAIA option

The accepted experience hierarchy is:

> **Primary: Stay here with MAIA.**
>
> **Secondary option: Continue in full MAIA.**

The secondary doorway is intentionally **not wired in this local candidate**. On the isolated preview, a direct jump to port 3597 would not prove that the in-field transcript and exact journey context entered the canonical full-MAIA conversation without loss. A later integrated House act must wire that optional doorway through the same canonical MAIA relationship before presenting it as continuous.

This refusal to fake continuity is part of the repair, not an omission.

## Safety and sovereignty

No journey reaches MAIA merely because it was written, returned, or kept. The localhost bridge accepts exactly one fixed MAIA POST path and refuses calls without the explicit Becoming handoff header. Malformed handoffs fail before proxying. The browser-local journey store remains separate from MAIA memory.
The verified web session cookie is httpOnly, SameSite=Lax, path=/ and not port-scoped; the local bridge can forward the browser-provided cookie to the existing localhost MAIA route without exposing it to client JavaScript. This is a local founder-review seam, not the final House integration design.

The automated browser witness mocks MAIA responses. It therefore proves handoff shape, visibility, same-field continuity, and follow-up behavior without spending a provider call or writing synthetic conversation history. No automated real-MAIA turn is claimed.

## Verification

- strict isolated TypeScript check: **PASS**
- Becoming logical/handoff tests: **32 passed / 0 failed / 0 skipped**
- visible browser journey + in-field MAIA witness: **23 passed / 0 failed**
- first MAIA handoff contains the whole journey and the no-repeat instruction
- follow-up sends through the same in-field conversation UI
- URL remains `/becoming` through synthesis and follow-up
- no-header proxy attempt: **403**
- malformed explicit handoff: **400**
- mobile journey/readability invariants remain passing
- real House on port 3597 remains untouched by automated witness
## Standing

**GUIDED FUTURE SELF JOURNEY + POST-RETURN IN-FIELD MAIA SYNTHESIS IMPLEMENTED · CORE 32/32 · BROWSER 23/23 · REAL PROVIDER CALL NOT AUTOMATED · OPTIONAL FULL-MAIA DOORWAY DEFERRED UNTIL CONTINUITY-PRESERVING INTEGRATION · NO PRODUCTION CHANGE.**

The next human act is to reopen the founder's already-kept journey and choose **Talk with MAIA about this journey**. That is the first live relational witness. The acceptance question is whether MAIA receives enough of the journey to offer a meaningful synthesis and continue naturally without making the member retell it.

If accepted, the next engineering boundary is the real House integration of this same-field MAIA surface, followed by account-grade Becoming persistence and the optional continuity-preserving **Continue in full MAIA** doorway.
