# WU-009 — Relationship-Memory Path: Code Verification

**Date**: 2026-08-10
**Status**: Verification only. No implementation, no production change, no feature flags.
**Verdict**: The "formatter-first" hypothesis is **partially falsified**. The path is **mixed**, and it contains a **live constitutional defect in production today**.

---

## 1. The actual live trace

`loadRelationshipMemory()` → `formatRelationshipMemoryForPrompt()` → prompt string.

| Tier | Loader | Formatter | Params |
|---|---|---|---|
| FAST | `lib/sovereign/maiaService.ts:678` | `maiaService.ts:1085` | themes 3, breakthroughs 1, patterns **off** |
| CORE | `maiaService.ts:1415` | `lib/sovereign/maiaVoice.ts:891` (`buildMaiaWisePrompt`) | themes 5, breakthroughs 2, patterns on |
| DEEP | `maiaService.ts:1823` | via `MaiaContext.relationshipMemory` → `maiaVoice.ts:891` | themes 10, breakthroughs 5, patterns on |
| BETWEEN | `app/api/between/chat/route.ts:1109` | same formatter | themes 5, breakthroughs 3, patterns on |

All four gated on `!isSanctuary` / non-anon. **FAST and CORE both receive relationship memory today**; they differ only in retrieval depth, not in governance. DEEP and BETWEEN also receive it — this is broader than WU-009 assumed.

**Epistemic distinctions present before formatting: none.** `RelationshipMemoryContext` (`RelationshipMemoryService.ts:125-153`) carries no `source`, no `confidence`, no `memberAffirmed`, no `evidence`, no correction status. There is nothing for the formatter to preserve or destroy — the standing was never constructed.

---

## 2. Producer state, verified against production (`maia-postgres`, 2026-08-10)

| Field | Rows | Writers in code | True classification |
|---|---|---|---|
| `essence` (encounters, first/last date, name) | `relationship_essences` = **140**, writing today | `RelationshipAnamnesisStorage/Postgres/_Direct` — live | **formatter-first ✅** — truthful substrate |
| `themes`, `currentFocus` | `conversation_themes` = **0** | `saveConversationTheme` exists at `:466` with **zero callers** | **producer-absent** ❌ |
| `patterns`, `emergingPatterns` | `relationship_patterns` = **0** | `saveRelationshipPattern` at `:512`, **zero callers** | **producer-absent** ❌ |
| `breakthroughs` | `breakthrough_moments` = **942** (121 in last 30d, 29 members) | `MemoryWriteback.ts:384` | **producer-malformed** ⚠️ |
| `trustLevel` | `= essence.morphicResonance` raw | `1.00` on **24 of 140** members | **producer-malformed + formatter fabricates** 🔴 |
| `intimacyLevel` | none — arithmetic over encounter count + duration (`:384-402`) | n/a | **derived, no referent** 🔴 |
| `relationshipPhase` | none — thresholds over resonance/encounters (`:357-378`) | n/a | member-level typing |

### Breakthrough provenance
`MemoryWriteback.writeBreakthroughMoment` fires when `significance >= 0.5` **or** a regex pattern matches — significance built from message length, `/thank|grateful|realize/i`, `/i feel|i think/i`, `/no,|actually/i` (`:461-482`). The stored `insight` is `extractInsight(userMessage, assistantResponse)`.

Verbatim member content is deliberately not reproduced here. Characterised structurally, the 5 most recent rows are:

| # | Character of stored `insight` | Length | Would a member call this their breakthrough? |
|---|---|---|---|
| 1 | first-person statement of an open question the member is sitting with | ~70 chars | plausibly — but they never said so |
| 2 | third-person narration of an anecdote, **names two other people** | ~110 chars | no — it is a story fragment about third parties |
| 3 | fragment about a third party's location, **truncated mid-token** (`:[`) | ~30 chars | no — not a sentence |
| 4 | sentence fragment beginning mid-clause (`that the …`) | ~50 chars | no |
| 5 | two words, no proposition | 9 chars | no |

The discriminating facts: **1 of 5 is even a candidate**; 3 of 5 are not well-formed sentences; one captures **third-party personal information** the member disclosed about someone else; one is truncated mid-token, showing the extractor is slicing rather than selecting.

No member gesture, no confidence, no referent. These are **regex-selected conversation fragments**, and the formatter quotes them back verbatim as the member's breakthrough.

---

## 3. Live constitutional defect (highest severity found)

`RelationshipMemoryService.ts:573` — **unconditional**, every tier, every member with an essence:

```
Relationship quality: ${phase}, trust ${(trustLevel*100).toFixed(0)}%, intimacy ${(intimacyLevel*100).toFixed(0)}%
```

For the 24 members at `morphic_resonance = 1.00` this renders **`trust 100%, intimacy 100%`** into the live prompt. `intimacyLevel` saturates independently: `0.5·resonance + min(enc·0.03, 0.3) + min(days·0.001, 0.2)`.

This is a system-manufactured intimacy claim with no member act behind it. It runs against:
- **MAIA Oath / Canon** — "refusal to simulate intimacy, certainty, or power where none is ethically grounded"
- **No attachment capture** vow
- **Constitutional Direction of Authority** — a quantified relational claim manufactured below Recognition and injected as fact

Second defect, same function `:557-562`: `Recent breakthrough: "<insight>"` renders heuristic fragments as the member's breakthroughs. Row 5 in the table above is two words long and asserts nothing; MAIA presents it to that member as their recent breakthrough.

---

## 4. Consequences for the Relational Depth lane

The four tester-facing capabilities map onto substrate as follows:

| Capability | Substrate today | Verdict |
|---|---|---|
| **Remember** (specific prior moments) | `breakthrough_moments` 942 rows, malformed provenance | possible **after** producer re-grounding |
| **Connect** (cross-conversation themes) | `conversation_themes` = **0 rows, no writer** | **no substrate** |
| **Notice movement** (change over time) | requires theme time-series | **no substrate** |
| **Recognize recurrence** | `relationship_patterns` = **0 rows, no writer** | **no substrate** |
| Elapsed-time / encounter continuity | `relationship_essences`, live | **available now** |

**Therefore: the Relational Depth lane is not a formatter unit.** Three of its five target capabilities have no producer at all. Rehabilitating `formatRelationshipMemoryForPrompt` alone cannot deliver them, and speccing implementation against "the data already exists" would have reproduced exactly the inflation the record corrections of 2026-08-09 were written to stop.

**Awareness-chain interaction**: not traced in this unit. `awareness-language-adapter` is imported at `maiaVoice.ts:5`, adjacent to the formatter call at `:891`, but its consumer graph is a separate trace and remains open.

---

## 5. Smallest safe next unit

**CC-U1 — Remove fabricated relational standing (a subtraction, not a feature).**

Scope, all inside `formatRelationshipMemoryForPrompt`:
1. Delete the `trust N% / intimacy N%` line (`:573`). Replace with nothing, or with the truthful count already held: `"N conversations over M days."`
2. Gate breakthrough rendering behind member affirmation; until that flag exists, suppress the quoted-insight lines.
3. Leave `relationshipPhase` out of the prompt — it is a member-level type derived from a saturated scalar.

No schema change. No new flag. No producer change. Fully reversible. Reduces claim-surface immediately without waiting on DEEP.

**CC-U2 — the real prerequisite for depth**: a `conversation_themes` producer with member-affirmation standing (`source`, `evidence`, `memberAffirmed`, correction status). Until this exists, "Connect / Notice movement / Recognize recurrence" cannot be built, only simulated.

**Not authorized by this document**: any edit, deploy, migration, or flag. This is evidence only.
