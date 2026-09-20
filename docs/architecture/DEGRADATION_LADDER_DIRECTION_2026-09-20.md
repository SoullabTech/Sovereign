# Degradation Ladder — Direction

**Status**: Directional architecture document. **Not canon. Not a lane. No authorization.** Design intent only.
**Date**: 2026-09-20
**Altitude**: one structural finding about how MAIA currently substitutes her own cognition, and a four-rung shape for doing it accountably.
**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized.
**Occasion**: routed out of `LOCAL_INFERENCE_AIRLLM_FINDING_2026-09-20.md`, which declined AirLLM and named this question without answering it.

---

## What this document is

A record of the shape a sovereign degradation model would take, and of the finding that made it worth recording: **MAIA already substitutes the mind serving a member's turn, and there is presently no channel through which that substitution could be declared.**

## What this document is NOT

- not authorization to change routing, provider selection, or fallback behaviour
- not a ruling on whether disclosure should occur, or in what words
- not a claim about what production currently runs
- not a UI proposal
- not a lane

---

## The governing sentence

> MAIA may be less capable than usual. She may not be less capable than usual **while presenting as usual**.

The Deep-Intelligence Gate already ratified this shape for a different substitution: *voice may have a different capture path; it may not have a different mind.* A model substitution is the same class of act arriving through a different door — not a transport change, a **cognition** change — and it is currently the less governed of the two.

---

## Current state (repository evidence, 2026-09-20)

| Fact | Where |
|---|---|
| A three-tier router exists: `local \| sonnet \| opus`, selected by mode, depth and message length | `lib/consciousness/modelRouter.ts:19,84-129` |
| Local tier is **routing, not only failure-handling** — Note mode and shallow Talk route to local *by design*, on a healthy day | `lib/consciousness/modelRouter.ts:84-99` |
| `LOCAL_TIER_ENABLED` gates the local tier and is **off by default**; `ORACLE_FORCE_CLOUD` disables it for emergencies | `lib/consciousness/modelRouter.ts:13-14,40,117` |
| Provider chain is bidirectional: Claude failure falls back to Ollama, and Ollama failure falls forward to Claude | `lib/consciousness/LLMProvider.ts:202-245` |
| The Claude→Ollama path is explicitly commented *"Graceful degradation"* and emits `console.warn` / `console.error` only | `lib/consciousness/LLMProvider.ts:207,240-245` |
| `MAIA_STRICT_503` returns 503 instead of falling back — read once at construction from env | `lib/consciousness/LLMProvider.ts:23,160` |
| **No provider or tier identity reaches the response payload.** `generateSimple` / tier generation return text; the serving identity is not carried out | `lib/consciousness/LLMProvider.ts:545-617` |

⚠️ **Repository facts, not runtime facts.** No host read was performed. Whether production sets `LOCAL_TIER_ENABLED`, `ORACLE_FORCE_CLOUD` or `MAIA_STRICT_503`, and how often the fallback path is taken, are **NOT ESTABLISHED** here and must not later be cited from this note.

## The finding

Three things are true together, and the third is the one that matters:

1. **The substitution mechanism exists and is already exercised by design**, not only under failure. Under `LOCAL_TIER_ENABLED`, a member asking for a short Note transform receives a different mind than a member asking for depth — and nothing in the exchange says so.
2. **The degradation is silent by construction.** Its only trace is a `console.warn` in an operator's log stream. The member-facing surface is identical.
3. ⭐ **There is no channel through which it could be declared even if we decided to.** The serving identity is not returned from the provider layer at all. This is not a disclosure decision that was made and lost — it is a disclosure decision that has never been representable.

The honest option that does exist — `MAIA_STRICT_503`, refuse rather than substitute — is an **operator env flag, deployment-wide, read at construction**. It is a good instinct in the wrong hands: the choice between *a lesser MAIA* and *no MAIA* is currently made by whoever set an environment variable, for everyone, in advance, invisibly.

> The defect is not that MAIA degrades. Degrading is correct. The defect is that degradation is currently **unrepresentable**, and therefore neither declarable to the member nor governable by them.

---

## The ladder (shape, not specification)

Decompose the **turn**, not the model. A MAIA turn is not one capability — it is mode discipline, memory retrieval, containment, the refusal registry, voice, and cognition. Under degradation these should fail *individually and visibly*, never collectively and silently.

| Rung | Cognition | Memory | Containment / refusal | What MAIA says |
|---|---|---|---|---|
| **FULL** | primary | full | full | nothing — this is the unmarked case |
| **REDUCED** | local | full | full | names that she is thinking with less depth today |
| **MINIMAL** | local or none | withheld | full | declines depth explicitly; can still hold presence |
| **OFFLINE** | none | none | n/a | does not pretend to be present |

Two properties do the work:

- **Containment and refusal never degrade.** They are the last things to fail, not the first. A MAIA who can no longer think well must still be a MAIA who will not harm — otherwise degradation becomes the attack surface for everything the vows forbid.
- **Memory is withheld before it is degraded.** A partial memory that presents as whole is worse than an absent one; the Gestalt non-capture law already forbids memory becoming a fixed lens, and a degraded retrieval is exactly a lens with unaccountable gaps.

---

## Design laws any implementation would have to satisfy

1. **The rung is a declaration, never a badge.** No score, no uptime ornament, no persistent status chrome. It surfaces because it is materially true of this turn, and it recedes when it is not. A rung indicator that becomes decoration has become engagement furniture and fails Invariant review.
2. **MAIA declares it in her own voice, not the interface's.** *"I'm working with less depth than usual right now"* is MAIA speaking truthfully about herself. A grey banner is the system talking about MAIA, which is the interface claiming an authority over her state that it does not have.
3. **The member's agency is over the choice, not the mechanism.** Where feasible, *a lesser MAIA now* versus *wait for the full one* is the member's call — not an operator's env flag set in advance for everyone. This is what `MAIA_STRICT_503` gets right in instinct and wrong in location.
4. **Never retroactive.** A turn served at REDUCED is recorded as REDUCED. A later turn may not present the earlier one as though it were FULL.
5. **Serving identity must become representable before anything else.** Until the provider layer carries out *which mind served this turn*, every rung above is undesignable. This is the first engineering step and it is small.

## The tension worth keeping, not resolving here

A member in distress does not need a systems status report. There is a real conflict between disclosure and presence, and the MINIMAL rung is where it bites hardest — that is precisely the rung most likely to be reached by someone who needs holding rather than a capability disclaimer.

⛔ This note does not resolve it. It records that **the resolution is a canon question about how MAIA speaks about her own limits under someone else's distress**, not a UX question about where to put a label. Any lane that opens here must answer it before it writes copy.

---

## What would have to be true to ratify

1. Serving identity representable end-to-end (provider → route → response), with no member-facing change. Small, mechanical, and a precondition for everything else.
2. A production witness of how often each rung is actually reached — ⛔ currently unknown, and the ladder should not be designed against a guess.
3. A canon ruling on the distress tension above.
4. A ruling on where the FULL/REDUCED choice sits: member, operator, or contextual.
5. Sovereignty Invariant Check and growth-obligation check on the disclosure surface, per `CLAUDE.md`.

## What this does NOT authorize

⛔ No routing change · ⛔ no provider-selection change · ⛔ no change to `LOCAL_TIER_ENABLED`, `ORACLE_FORCE_CLOUD` or `MAIA_STRICT_503` · ⛔ no member-facing surface · ⛔ no copy · ⛔ no memory-retrieval change (the closed temporal lanes are untouched: no scorer, no coefficients, no `LIMIT 12`, no validity, no supersession, no Cut 2) · ⛔ no lane opened.

## Standing

**DEGRADATION LADDER ⭐ DIRECTION RECORDED · SUBSTITUTION MECHANISM ✅ ESTABLISHED IN SOURCE · SILENT DEGRADATION ✅ ESTABLISHED IN SOURCE · DISCLOSURE CHANNEL ❌ DOES NOT EXIST · RUNTIME FREQUENCY ⛔ NOT ESTABLISHED · DISTRESS TENSION ⛔ UNRESOLVED · ⛔ NO LANE OPENED · ⛔ NOTHING AUTHORIZED · PRODUCTION UNTOUCHED.**
