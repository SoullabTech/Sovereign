# Now What? — MAIA quality acceptance, and the local history defect

**Date:** 2026-09-03 · **Branch:** `claude/maia-quality-acceptance`
**Status:** ⚠️ **DEFECT CONFIRMED (contract) · RUNTIME UNPROVEN**
**Witness:** `npx tsx scripts/witness/now-what-register-and-history.ts` — **6 confirmed · 0 unconfirmed**

> ## Founder ruling
>
> **Now What? will not create the appearance that MAIA knows a client or knows Larry's work unless the runtime can demonstrate that she actually does.** Memory, authorized practitioner corpus, full conversational context and qualified conversational intelligence are **release requirements, not enhancements.**
>
> The objective is not merely to satisfy Larry's complaint. The objective is to give his clients something **substantially better than the conventional branded chatbot he could build elsewhere.**

> **We do not ship the appearance of intelligence. We ship the conditions that make intelligent relationship possible.**

The beautiful simple interface is close to irrelevant unless what sits underneath it is real. The illusion is easy to assemble and hard to see from outside:

```
  beautiful Now What? interface  +  Larry's name  +  AI responses  =  looks finished

  but underneath:  no corpus  ·  or no memory  ·  or 7B with missing history

                                                  =  not the product
```

**That cannot happen again.**

> The system prompt may know how to be relational.
> **The model cannot relate to a conversation it cannot see.**

---

## Completion — three things simultaneously true

**1 · MAIA knows the person.** Legitimate conversational continuity, appropriate cross-session memory, member-authored Keep, developmental context where authorized, full current-turn history.

**2 · MAIA knows Larry's work.** His approved talks, writings, frameworks, exercises, programs and resources, as an explicitly authorized corpus with source provenance. She draws on them accurately **and can tell when something is not in his material.**

**3 · MAIA brings the two together intelligently.** Not retrieving a PDF. Not remembering a name. Recognising what *this* client is wrestling with and bringing the relevant part of Larry's work into the living conversation — **without pretending to be Larry or forcing his framework onto the person.**

**The product is the third thing.** One and two are its preconditions.

### The acceptance bar is experiential

The founder must be able to sit with it and have this work:

> *"Last week I told you about what was happening with Sarah. Something changed."*

— and MAIA knows what is meant. Then:

> *"Larry talked about something that might help with this. What was it?"*

— and she finds the right thing from his **actual authorized** work, explains it naturally, and connects it to what has been discussed. Then, deliberately, something Larry never said:

> — and she **does not manufacture Larry.** *"I don't have that in the material Larry has shared here."*

**That is trustworthy intelligence.** All three moments, in one sitting, or the product is not done.

### No silent degradation

If the qualified conversational system cannot run, **Now What? says it is temporarily unavailable.** It does not quietly serve a substantially weaker system and call that MAIA.

### `/nowwhat-demo` is not evidence

The public scripted demo is a legitimate design prototype — it says its replies are scripted, on every screen. ⛔ **It must never be cited as evidence that Now What? is ready.** It calls no model, holds no memory, and carries no corpus.

The real acceptance surface is **`/now-what/conversation`**, authenticated, with *full history → memory → Larry corpus → qualified model → provenance* all witnessed on actual turns.

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

## F. What Larry's route actually runs today

Four separate questions, four different answers. Conflating them is how a
customer gets told something untrue.

| | Status |
|---|---|
| **Larry's full IP / library** | ⛔ **NOT active.** Not "not loaded" — *hard-closed in code.* |
| **Current MAIA memory / field / grammar intelligence** | ✅ **Wired.** The route composes the constitutional prompt, developmental memory, member atoms, cross-session recall, field context, program position, and the Now What? grammar — through the shared room-composition layer, in one turn. |
| **Canonical MAIA Turn (CMT-01)** | ⚠️ **On main, not powering his conversation.** M0–M2 only: closed turn object, participation contract, manifest, refusals 25–31, and a **shadow** on `/list`. The canonical renderer had zero live callers; legacy remains response-producing. M3 — the cognition cutover — was never authorized. |
| **Highest conversational quality** | ⛔ **Unproven.** Register and history defect both unqualified. |

### F.1 The corpus channel is closed at the function, not merely empty

```ts
// lib/practiceField/practiceFieldService.ts:289
export function corpusIsComposable(_field: PracticeField): boolean {
  return false;
}
```

`active_field_content` cannot reach MAIA's prompt today, whatever a field holds. What *can* compose is narrow and self-descriptive: the practitioner's own about / how-we-work text, `how_maia_supports` past its governance check, and field guidance past its validator — each only once ratified.

The header records why, and the reasoning generalises well beyond this field:

> *"a revision proves a practitioner **changed something**, never that they **reviewed what MAIA may compose**. That signal is provenance, not permission."*

> *"When ratification lands, this becomes a real check; **it does not become `true`**."*

The closure followed an incident in which ~63,861 characters of candidate material sat in a Now What? field. No Larry-authored IP and no third-party text reached runtime.

⚠️ **Unknown from source alone:** whether his materials are already sitting in the production database or vault awaiting authorization. That needs a runtime/database witness. It changes nothing about composition — the gate refuses regardless — but it changes the custody question.

### F.2 Four gates before "finished"

Non-negotiable, in dependency order:

1. **Larry corpus** — build the explicit authorization/ratification seam, then attach *only* what he has actually approved. The seam is the work; the attaching is trivial after it.
2. **High-register provider** — his client-facing conversation must reliably reach the qualified register, not drop to `qwen2.5:7b` because of host configuration. (§B, §D)
3. **Conversation continuity** — repair the shared `generateSimple()` history defect regardless of which provider Larry normally reaches. A provider change must never silently convert "whole conversation" into "last message only." (§A)
4. **Canonical intelligence** — decide whether Now What? enters the CMT-01 spine when M3 is ready, rather than leaving this specialised interview route as a parallel intelligence-construction path indefinitely.

Gates 2 and 3 are independent: fixing the pin does not fix the defect, and fixing the defect does not guarantee the register.

### F.3 What may and may not be said to Larry

⚠️ **The distinction this whole document exists to protect: the capability existing in the route is not evidence the deployed experience is receiving it.** Presence and memory depend on runtime configuration; field composition depends on authorization and on what is actually ratified. Tonight demonstrated exactly how far apart those two things can drift.

✅ **May say:** Now What? uses MAIA's real conversational engine, not a separate chatbot. It is **built to support** continuity, member memory, practitioner field context, and the governed Now What? conversational grammar.

⛔ **May not yet say:** that his current deployed experience is using the full memory/presence stack · that his field material is being composed · that MAIA is trained on or grounded in his work · that the Canonical MAIA Turn architecture is powering his conversations. **Each of those requires runtime evidence or further implementation.**

The honest sentence available today:

> *"I built the application. I am now qualifying the intelligence underneath it before I put your clients into it."*

Given what §A found, that is not caution. It is the accurate statement.

### F.4 Memory headroom — a design constraint on the simple product

A simple interface does not need deep memory **surfaced**. It must not have memory **removed**.

The Larry cut is a presentation decision, never a capability decision. `/now-what/conversation` calls the same `POST /api/now-what/interview` the richer room calls, so developmental memory, member atoms, cross-session recall and field context compose underneath a screen that shows none of them. Nothing was stripped to make the product simple; the surface was quietened.

**This is load-bearing and easy to lose.** The obvious next "simplification" — giving the thin route its own lighter model call, or trimming composition it appears not to use — would buy a little latency and permanently cap what the product can become. Adding memory back later is not a UI change; it is a re-architecture.

> **The simple product's ceiling must stay as high as the sophisticated one's. Only its floor is quieter.**

So when Larry wants to add to the build — his corpus, uploads, richer continuity, practitioner surfaces — the answer should be *turn it on*, not *rebuild it*. Every gate in §F.2 is written to be satisfiable without touching his interface.

---

## G. Founder ruling — intelligence completion (2026-09-03)

> **Now What? is not finished unless MAIA remembers the client and knows Larry's approved work.**
> The simple interface can stay simple. **The intelligence underneath cannot be thin.**

These cease to be gates-in-analysis and become **release requirements**. The UI is unchanged and stays unchanged — no rooms, dashboards, practitioner navigation or other surfaces return. **All remaining work is underneath the conversation.**

### G.1 The conjunction that is the product

| | Gives MAIA |
|---|---|
| **Memory** | knowledge of **the person** |
| **Larry's corpus** | knowledge of **the practice** |

- Without the corpus → a good relational assistant wearing his branding.
- Without memory → a knowledgeable chatbot that forgets the person.
- **The product being sold is the conjunction:** MAIA knows the person, knows the practitioner's work, and holds the relationship between them over time.

### G.2 Release requirements

**A · Memory and continuity — active, not merely available**

Runtime proof that Larry's conversation receives: full current-conversation history · cross-session conversational recall · developmental memory influence where authorized · member-authored atoms and kept material · continuity across returns.

And the §A repair: **every provider receives the same conversational-history contract.** A weaker provider may be less capable. It may not silently receive *less of the conversation.*

**B · Corpus authority — real, not bypassed**

⛔ **Do not solve this by making `corpusIsComposable()` return `true`.** That destroys the governance deliberately built after the 63,861-character incident.

Implement the seam its own contract anticipates:

```
Larry approves corpus revision X for MAIA use
              ↓
   authorization record: approved_by · approved_at ·
   authorization_version · the exact revision approved
              ↓
   current field revision MATCHES that authorization
              ↓
   corpusIsComposable(field) = a verified check
```

If his existing agreement already grants this use, **record that authorization against the corpus.** If it does not, **obtain explicit written approval.** Then his library may compose.

**C · Corpus content**

Inventory and ingest only what he is authorized to provide: talks · transcripts · writings · frameworks · exercises · worksheets · program material · other approved resources. **Source provenance preserved per item.** MAIA should know what is in the corpus and visibly not fabricate what is not.

**D · Qualified register**

A qualified high-capability provider **with full conversation context, or explicit unavailability.** No invisible cognitive downgrade. Witness `served.provider` / `served.model` from actual turns — never from configuration.

**E · Acceptance tests the conjunction, not the parts**

Not *"does MAIA remember?"* nor *"can she retrieve Larry's material?"* but:

> **Can she remember this particular client while intelligently bringing Larry's body of work into the conversation — without impersonating Larry, forcing his framework onto the person, or inventing what she does not have?**

A real authenticated member must be able to:

1. refer to something said earlier in the same conversation, and MAIA remembers it
2. return later, and MAIA appropriately remembers prior context
3. ask about something genuinely in Larry's corpus and get an accurate answer
4. ask about something **absent** from it and have MAIA **refuse to invent**
5. meet his material brought in naturally, not as generic retrieval
6. **remain the author of their own meaning** rather than being interpreted through his framework

Requirement 6 is the sovereignty invariant surviving contact with a practitioner corpus. It is the one most easily lost by making retrieval work well.

⛔ **No UI expansion in this lane.**

---

## Provenance

- `scripts/witness/now-what-register-and-history.ts` — W1–W5 + W2b, 6/6 confirmed, deterministic, no production or model server required.
- The witness proves the **contract**. It cannot prove what production serves. That is Gate 1.
