# Now What? — MAIA quality acceptance, and the local history defect

**Date:** 2026-09-03 · **Branch:** `claude/maia-quality-acceptance`
**Status:** ⚠️ **DEFECT CONFIRMED (contract) · RUNTIME UNPROVEN**
**Witness:** `npx tsx scripts/witness/now-what-register-and-history.ts` — **6 confirmed · 0 unconfirmed**

> The system prompt may know how to be relational.
> **The model cannot relate to a conversation it cannot see.**

---

## A. The defect

### A.1 Observed contract divergence

`LLMProvider.generateSimple()` accepts `messages[]` — a full alternating history — and routes to one of two providers. **The two providers do not receive the same conversation.**

| Path | Receives | Site |
|---|---|---|
| **Claude** | the entire `messages[]` array | `LLMProvider.ts:582`, `:590` |
| **Ollama** | `messages[messages.length - 1]?.content` — **one string** | `LLMProvider.ts:569`, `:604`, `:613` |

All three Ollama call sites in `generateSimple()` truncate. They are:

- **`:569`** — the tier-routed local path (`!forceClaude && config.provider === 'ollama'`)
- **`:604`** — the Claude-failure fallback
- **`:613`** — the Claude-not-configured path

### A.2 The divergence is structural, not a call-site slip

```ts
private async generateOllama(
  systemPrompt: string,
  userInput: string,          // ← no messages parameter exists
  config: LLMConfig,
  startTime: number
): Promise<LLMResponse>
```

`generateClaude` takes an optional `messages?: Array<{role, content}>` (`:368`). `generateOllama` **cannot** take history. Fixing the call sites alone would not repair this; the helper's contract is single-turn by construction.

### A.3 What this means behaviourally

```
What a member reasonably experiences:        What the local path actually does:

  turn 1 ─┐                                    turn 1 → model (fresh context)
  turn 2  ├─ one conversation                  turn 2 → model (fresh context)
  turn 3  │                                    turn 3 → model (fresh context)
  turn 4 ─┘                                    turn 4 → model (fresh context)
```

This is not "the same conversation on a weaker model." It is **repeated single-turn generation.** It predicts, precisely: shallow replies · no continuity · forgetting what was just said · generic questions · no thread-following.

**It compounds with the response grammar.** `lib/nowWhat/roomGrammar.ts` requires every reply to be *"impossible to send unchanged to a different person"* and forbids generic questions. Enforcing that on a model with no conversation guarantees the failure the instruction exists to prevent.

### A.4 Classification

⛔ **Shared provider defect. NOT a Now What? prompt defect.** Every caller of `generateSimple()` that routes local is affected, not only this room.

**Expected invariant, currently violated:**

> Given the same `messages[]` input, provider selection may change model **capability**. It must not silently change the **conversational-context contract**.

⛔ **Not repaired in this act.** Repair is separately authorized. Recording custody, not fixing.

---

## B. Register selection — how a turn chooses its model

```ts
// lib/maia/roomComposition.ts:75
export function cloudRegisterPinned(): boolean {
  return process.env.NOW_WHAT_CLOUD_REGISTER === '1';
}
```

```ts
// app/api/now-what/interview/route.ts:398
const result = await getLLMProvider().generateSimple({
  tier: mode === 'turn' ? 'core' : 'deep',   // :399
  systemPrompt, messages, maxTokens,
  forceClaude: cloudRegisterPinned(),        // :403
});
```

| `NOW_WHAT_CLOUD_REGISTER` | `LOCAL_TIER_ENABLED` | tier `core` serves |
|---|---|---|
| `1` | any | **`claude-sonnet-4-6`**, full history |
| unset | `true` | **`OLLAMA_MODEL_GENERAL`** (prod: `qwen2.5:7b`), **last message only** |
| unset | `false` | `claude-sonnet-4-6`, full history |

`TIER_LLM_CONFIG.core` is `LOCAL_TIER_ENABLED`-conditional at `LLMProvider.ts:124-126`; the provider guard is at `:567`.

**The entire register decision for a paid, client-facing product rests on one unset-by-default environment variable.**

---

## C. Runtime acceptance lane

⛔ **Gates 0–5 require production access and are UNRUN.** No configuration file, and no result in §A/§B, substitutes for a runtime artifact.

### Gate 0 — exact deployed SHA
```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```
Record it. Every result below is evidence about **that SHA only**.

### Gate 1 — provider · **STOP-THE-LINE**
One authenticated turn through `/now-what/conversation`. Read the reply's `served` artifact (`route.ts:420`).

**Required:** `served.provider === 'anthropic'` · `served.model === 'claude-sonnet-4-6'`

⛔ If `served.provider === 'ollama'` — **STOP. Run no qualitative evaluation.** Scoring conversation quality on a path that discards history measures the defect, not the product. Fix the register first.

⛔ **Do not infer the provider from environment configuration.** Witness the artifact returned by the actual turn.

### Gate 2 — field composition
Confirm the turn reports the intended Now What? field composed, not `field:null`.
⛔ Do not add unapproved Larry material to make this pass. The Materials Agreement is unsigned; Attachment A §3 is empty.

### Gate 3 — presence / continuity
Establish whether `NOW_WHAT_MAIA_PRESENCE_ENABLED` and memory composition are live in the running environment. Presence names only.

### Gate 4 — multi-turn behavioural witness
**Only after 1–3 pass.** 12–15 representative conversations:

| # | Probe |
|---|---|
| 1 | follows a fact introduced several turns earlier |
| 2 | distinguishes two people mentioned earlier |
| 3 | remembers a correction |
| 4 | repairs a misunderstanding rather than advancing |
| 5 | returns to an unresolved thread naturally |
| 6 | specific rather than generic |
| 7 | one intelligent question, not an interrogation |
| 8 | practical executive/work problem |
| 9 | relational/emotional problem without therapeutic boilerplate |
| 10 | handles ambiguity |
| 11 | answers "what did I tell you earlier?" |
| 12 | admits when Larry-specific knowledge is not in the approved corpus |
| 13 | does **not** fabricate Larry's teachings |

Probes 1–5 and 11 are exactly what §A predicts will fail on the local path. If Gate 1 was skipped, a failure here is uninterpretable.

### Gate 5 — comparison
Compare this route against canonical MAIA on equivalent material. Diagnose any thinness in this order:

**provider → context composition → memory/presence → field composition → prompt behaviour**

⛔ **Do not prompt-tune.** If the route is thinner, the cause is upstream of the prompt. Tuning prose against a model that cannot see the conversation buries the defect under wording.

### Scorecard (to fill at runtime)

| | |
|---|---|
| Deployed SHA | `________` |
| `served.provider` / `served.model` | `________` |
| Field composed | `________` |
| Presence / memory | `________` |
| Median latency | `________` |
| Probes passed | `___ / 13` |
| Qualitative failures | `________` |

---

## D. Proposed requirement — qualified conversational register

**Recorded as a proposal. Not implemented in this act.**

> **Now What? has a qualified conversational register. If that register cannot be provided, the conversation does not silently substitute an unqualified one.**

Graceful degradation is right for most computation. Here it changes the **nature of the product**: the entire visible value is one excellent conversation, and there is nowhere for mediocre intelligence to hide. Silent downgrade is what produced this situation.

This does not mean Claude forever. A local model could qualify — but qualification must be **behavioural and contextual**, not "this model returned text." A model that cannot receive `messages[]` cannot qualify at all, whatever its weights.

Placement to be decided later: startup assertion · field-configuration invariant · route-level refusal · some combination.

---

## E. Correction to the record

We were too quick to file Larry's complaints as *"he doesn't understand the product."*

His dislike of the coaching architecture may still be a separate matter — that judgement stands. But his reports that MAIA was **poor, forgetful, or unable to do things** may have been **technically correct bug reports**, and were treated as impressions.

If he was served `qwen2.5:7b` with only his current message, he did not meet "MAIA at a slightly lower level." He met something structurally different, and he described it accurately.

Whether that is what he actually met is **Gate 1**, and it is unrun. Until then this is a well-supported hypothesis about production, not a finding about production.

**Do not send Larry the replacement before Gate 1.**

---

## Provenance

- `scripts/witness/now-what-register-and-history.ts` — W1–W5 + W2b, 6/6 confirmed, deterministic, no production or model server required.
- The witness proves the **contract**. It cannot prove what production serves. That is Gate 1.
