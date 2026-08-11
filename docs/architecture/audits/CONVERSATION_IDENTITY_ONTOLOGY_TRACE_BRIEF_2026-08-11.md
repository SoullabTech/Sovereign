# Continuation Brief — Conversation Identity Ontology Trace

**Status:** READ-ONLY HANDOFF ARTIFACT. Unopened unit.
**Written:** 2026-08-11
**Production referent:** `3954fbfab`
**Custody:** documentation-only artifact, committed on an isolated docs branch. No implementation
authorized by this commit.

> **Custody note — 2026-08-11, added at commit time. Corrects a production-state fact only; no
> finding, retraction, hypothesis, or rejected-design ruling was altered.**
> Between writing and commit, trunk advanced to `f52e8e1c6` (PR #1029, another lane). **Production
> remains `3954fbfab`.** The line `TRUNK == PRODUCTION: yes` in §6 was true when written and is now
> stale: trunk is ahead of production by unrelated work. Every substantive finding in §2–§5 was
> observed against production `3954fbfab` and is unaffected.

> This brief exists so the next unit inherits **evidence state and epistemic boundaries**, not just a
> task description. Several conclusions in this session were reached, then withdrawn on better
> evidence. The withdrawals are recorded deliberately — do not re-derive the retracted versions.

---

## 0. Governing invariant (verbatim)

> **No observability instrument may be treated as proof of model-context inclusion unless it is
> derived from, or reconciled against, the final prompt assembly path.**

This invalidated the method being used mid-audit. `context-inventory` was being read as the witness
of what MAIA received. It is not. See §3.

---

## 1. The five proof levels

These are **five distinct facts**, not one. Conflating them produced a false severance report during
this session.

```
loaded
  → formatted
    → registered in inventory
      → appended to prompt
        → present in final model context
```

Proven independent: a substrate can be `registered in inventory = false` while
`appended to prompt = true` (§3). Any audit using inventory membership as a proxy for prompt
presence is **methodologically invalid**.

---

## 2. Amended audit findings — what reaches the prompt

Empirically established from production logs on real member turns (member `ce284751…`), plus
direct reading of the FAST template at `lib/sovereign/maiaService.ts:1297`.

| Substrate | Verdict | Evidence |
|---|---|---|
| Anamnesis essence (`relationship_essences`) | ✅ **REACHES PROMPT** | `loadRelationshipMemory()` → `formatRelationshipMemoryForPrompt()` → `relationshipContext` (`maiaService.ts:1090`) → interpolated `maiaService.ts:1297`. ~1,693 encounters/turn. **Inventory-invisible.** |
| Episodic recall | ✅ reaches prompt | 1,082 chars; `candidateCount 4 · emitted true` |
| Memory atoms | ✅ reaches prompt | 8 loaded, injected, 1,186 chars (read side healthy; write side is a separate known issue) |
| Member web | ✅ reaches prompt | patterns=3 summaries=3 journals=5 |
| Memory orchestrator | ✅ reaches prompt | 408 chars |
| Astrology · Wu Xing · Place · Knowledge gate | ✅ reach prompt | per-turn FAST lines |
| **Conversational recall** | ⚠️ **CONDITIONAL** | gated by conversation-ID form — see §4 |
| Relational context | ⚠️ 2 of 4 turns | handoff transport defect — see §5 |
| Relational signals (`member_relational_signals`) | ❌ UI card only | never prompt-wired |
| `context-inventory` as an instrument | ❌ **INCOMPLETE WITNESS** | see §3 |

### Retracted during this session — do not re-derive

- ❌ *"Anamnesis is severed / the largest severance found."* **False.** It reaches the prompt on
  every turn, early in the template. It merely does not appear in the inventory.
- ❌ *"MAIA ignores injected relational context she was given."* **False.** The decisive quote
  (*"You've named Nathan twice now. That's it."*) came from a turn with **no injection**. She was
  accurate.
- ❌ *"Formatter over-restraint causes the thin responses."* **Weakened to hypothesis.** The turns
  that looked damning lacked both relational context *and* conversational recall.
- ❌ *"The three Relationship → LabTools buttons are pro-gated dead ends."* **False.** They carry
  exact `minTier: 'free'` rules and `matchRule()` runs an exact-match pass before the prefix
  catch-all.

---

## 3. The two proven `context-inventory` counterexamples

`[MAIA] context-inventory` emits `available` and `evidenceProviders`. Both omit substrates that
**do** reach the prompt:

1. **Anamnesis / `relationshipContext`** — absent from both lists; interpolated at
   `maiaService.ts:1297` ahead of most addenda.
2. **`relationalContextAddendum`** — absent from both lists; injected and confirmed by its own
   log marker and by presence in the compiled bundle.

Consequence: the inventory is a **parallel bookkeeping system that can drift**, not a witness.

**Design consequence (recorded, not authorized):** prompt truth should eventually be generated from
the actual assembly graph rather than manually declared —
`substrate → source → bytes/tokens → assembly position → gate → reason admitted/excluded →
final-context proof`.

---

## 4. The conversation-identity evidence (the reason this unit exists)

### 4.1 Observed correlation — 6/6, same member, same route, same tier

```
conversationId: 'd80b708d-b189-41ea-9378-b4cd758041e3'   → conversationalRecall: TRUE
conversationId: '17abb69e-3b02-4a5e-adbc-70beac79c0f7'   → conversationalRecall: TRUE
conversationId: 'session_1786459323099'                  → conversationalRecall: FALSE
conversationId: 'session_1786487063372'                  → conversationalRecall: FALSE
conversationId: 'session_1786487063372'                  → conversationalRecall: FALSE
conversationId: 'session_1786487063372'                  → conversationalRecall: FALSE
```

UUID form → recall present. `session_<timestamp>` form → recall absent.

### 4.2 Client-side persistence observed

These keys were present in the member's browser `localStorage`:

```
maia_conversation_session_1786400396527
maia_conversation_session_1786459323099
```

### 4.3 The link

`session_1786459323099` appears **both** as a client-persisted `localStorage` key **and** in
production logs as the `conversationId`, with `conversationalRecall: false`.

No UUID-form conversation ID was found among the client-persisted keys.

### 4.4 Current hypothesis — ⚠️ HYPOTHESIS, NOT FINDING

```
browser / client                    server / durable system
      ↓                                    ↓
session_<timestamp>                      UUID
      ↓                                    ↓
accepted as conversationId          conversationId
      ↓                                    ↓
durable-memory behavior differs     conversational recall succeeds
```

If confirmed, the defect is **not** "conversation IDs have incompatible formats." It is potentially:

> **Two layers believe they possess authority to establish conversation identity.**

This would place it in the same failure family as the relational-handoff defect (§5): *client-owned
state silently determining whether durable memory assembles.*

It would also mean **normalization is the dangerous repair** — it would conceal an authority split
rather than fix it.

---

## 5. Paused dependency — Relational Handoff Lifetime & Consent Contract

**Status:** paused, unopened. Downstream of this unit.

Root cause already established (do not re-investigate):

```
ROOT CAUSE:  STATE DIVERGENCE — UI CONTINUITY vs REQUEST CONTINUITY
NOT:         model failure / formatter failure / server read-wire failure
```

Proven:
- `maia_return_path` + `maia_return_label` persist in `localStorage` (`seedPrompt.ts:189`)
- `relationshipContextId` derives from a **one-shot seed**; `consumeMaiaSeed()` calls
  `clearMaiaSeedPrompt()` on read
- `sessionRelationshipContextId` is a `useRef` (`OracleConversation.tsx:1558`) set **only** in a
  mount-only effect (`:1617`)
- Observed live: chip displayed, context ID absent, no relationship key in storage

Inferred (not observed): a remount occurred between the injected and uninjected turns.

Contract to satisfy when the unit opens:

> A relational handoff is a consented, session-scoped transport state. Its visible UI state and its
> request payload state must remain equivalent throughout that session.
>
> `handoff visible ⇔ relationshipContextId actually eligible to travel`
>
> with Sanctuary as an explicit exception that must be **reflected in the UI** rather than silently
> breaking the equivalence.

Attached proof obligations:
1. Cross-account stale ID — server already scopes `WHERE r.id = $1 AND r.member_id = $2`
   (fail-closed). Prove with an explicit **negative test**; do not re-invent the protection.
2. Sanctuary truthfulness — the UI must not imply active relational carry while Sanctuary
   suppresses injection.
3. Lifetime ownership — a conversation-session concept already exists client-side. Reuse it **only
   if** it genuinely matches the semantic lifetime. **This depends on the ontology trace below.**

Rejected designs (with reasons, do not revisit):
- Re-deriving relationship identity from the return path — `maia_return_path` is `"/relationships"`,
  the *index*. It cannot identify which relationship. Deriving identity from it would manufacture
  specificity from insufficient state.
- Clearing the chip when the transient ID dies, as the *primary* design — makes the interface
  truthful but destroys the continuity gesture the member deliberately initiated.

---

## 6. Production state

```
PRODUCTION SHA:      3954fbfab   (deploy-lane, provenance verified, healthy)
DEPLOYED THIS UNIT:  40e7b8039 — relational-context read wire (PR #1028, merged)
CONSTITUTION GATES:  colab 33/0 · memory 10/0 · relationships 10/0 · maia 6/0
TRUNK == PRODUCTION: yes
```

The read wire is live, correct, and **inert after the handoff state dies**.

Known unrelated live findings (recorded, not owned by this unit):
- `OPENAI_API_KEY` set in production alongside `ANTHROPIC_API_KEY` — flagged by the MAIA
  constitution gate against the sovereignty invariant.
- `member_memory_atoms` write side frozen since 2026-06-27; in-chat conversational keep is dark
  behind `CONVERSATIONAL_KEEP_ENABLED`, set in no `.env` file.
- 98.6% of relational entries (1,149 / 1,165) attach to per-member `Unresolved Relational Field`
  buckets rather than named people. Attribution binding is unresolved.
- Linguistic reification: an unattributed field was spoken of as *"this relationship."* Proven as a
  linguistic event. **Whether it shares a cause with the 98.6% distribution is HYPOTHESIS.**
- `CLAUDE.md` names the Co-Lab gate as `verify-colab-boundaries.ts` (does not exist; real name
  `verify-constitution-colab.ts`) and states 31/31 (now 33/33).
- Formatter placeholder leak: `dominant_pattern` can hold the literal UI string
  `"Not enough history yet."`, which renders as an observed theme. OBSERVED / DEFERRED.

---

## 7. Prohibited in the next unit

- ❌ Do **not** implement anything.
- ❌ Do **not** repair `context-inventory`.
- ❌ Do **not** normalize, alias, or migrate conversation IDs.
- ❌ Do **not** resume the relational-handoff unit.
- ❌ Do **not** touch the formatter.

---

## 8. NEXT-UNIT INSTRUCTION (verbatim)

> Trace conversation identity end-to-end for UUID and `session_<timestamp>` forms. Treat them as
> potentially different semantic objects until proven otherwise. Do not normalize, alias, migrate,
> or repair. Determine where each form is minted, transported, normalized, persisted, keyed, and
> consumed; identify every runtime branch whose behavior differs by identifier form; and classify
> the divergence as syntactic, historical, transport-specific, lifecycle-specific,
> authority-specific, or architectural.

Required trace chain, run **separately for each identity family**:

```
mint → transport → normalization → persistence → lookup key
     → recall eligibility → prompt assembly → final-context proof
```

Specific questions to answer:

- where UUID IDs are minted;
- where `session_<timestamp>` IDs are minted;
- whether either is transformed or aliased;
- which database columns/tables each reaches;
- whether memory **writers** and memory **readers** use the same identifier semantics;
- whether handoff / session / continuity paths choose one form preferentially;
- whether any substrate **besides** conversational recall branches on the format;
- whether either identifier is actually a proxy for **session authority**, **member continuity**,
  **transport origin**, or **UI surface** rather than just identity.

And the central question:

> **What is the authoritative identity of a conversation, and which layer currently has authority
> to create it?**

---

## 9. Why this matters

Continuity requires identity through change. Before MAIA can reliably perceive the transformation of
a relationship across time, the infrastructure has to know **what persists as the same conversation**
across transport, sessions, handoffs, and durable memory.

The recurring lesson from this session: a member-visible *"MAIA forgot me"* was caused by a small
client-side transport-state omission while storage, retrieval, attribution, formatting, and model
behavior were **all functioning correctly**. Continuity debugging must trace the whole path rather
than begin by blaming "memory" or the model.
