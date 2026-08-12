# CMC-001 · CONTINUITY-INTEGRITY FINDING 01

**The durable conversational record may not represent the conversation the member experienced.**

Ruled to remain inside CMC-001 by founder act 2026-08-12. A member-facing portion is referred out separately; **that referral does not remove this finding from the census.**

**Referent**: `refs/heads/clean-main-no-secrets` @ `52a3b924b7cf52013c1c8b0d635359c2cad672fc` · `lib/sovereign/maiaService.ts` blob `e8f5bf6d9badcec949f58d8fa0ac9ba0e01954c1`

---

## The finding

> **Persisted conversational history may contain pre-rewrite assistant text rather than the final text presented to the member. Therefore durable conversational recall may not represent the conversation the member actually experienced.**

## Established ordering

| Step | Line | Operates on |
|---|---|---|
| Voice synthesis | `:3069` `synthesizeMaiaVoice(text)` | **A** |
| Persistence | `:3081` `addConversationExchange(sessionId, input, text, …)` | **A** |
| AIN shape rewrite | `:3615` `generateText({ systemPrompt: AIN_NO_MENU_REWRITE_PROMPT, … })` → `rewritten` | **A → B** |

```
MAIA generates A
     ↓
voice speaks A
     ↓
conversation history stores A
     ↓
AIN rewrites A to B
     ↓
member reads B
```

The rewrite occurs **after** both persistence and synthesis. `evidence_basis: STATIC_POSSIBLE` · `observed_status: NOT_OBSERVED` · `referent_binding` as above.

## Why this belongs to the census, not only to a defect lane

CMC-001 exists to establish what canonical MAIA's continuity architecture actually carries. This finding is about the **substrate itself**, not about a surface built on it.

Every contributor traced in Units 1–5 — conversational recall above all — draws on the persisted exchange record. If that record stores **A** while the member read **B**, then:

* future conversational recall retrieves text the member never saw;
* MAIA may accurately recall having said something the member has no memory of;
* the discrepancy is invisible at retrieval, because **A** is a well-formed assistant turn and carries no marker distinguishing it from delivered text;
* provenance is intact and *wrong* — the record faithfully preserves a string that was never part of the conversation.

That last point is the sharpest. This is not a provenance-loss defect of the kind Units 1–5 catalogued. It is a case where provenance survives perfectly and attests to the wrong thing.

## Relationship to the DEEP inversion

Unit 6 established two distinct failures. They are not the same problem and should not be merged:

1. **Continuity not reaching speech.** On DEEP, the normal path receives no accumulated relationship; it arrives only via failure-triggered regeneration.
2. **Speech not faithfully becoming continuity.** What is written to the durable record may differ from what was delivered.

Together they describe a loop in which memory infrastructure can be extensive and the experienced relationship can still be discontinuous — rich context withheld going in, inaccurate text recorded coming out.

Whether that loop actually closes in production is **not established**. See below.

## What is NOT established

* Whether the AIN rewrite path executes in production. Unit 6 records it as **default-open outside production**; the production condition is unverified.
* How often **A** and **B** materially differ. A shape rewrite may leave text substantially unchanged in many cases.
* Whether any other persistence site records post-rewrite text, which would make the record inconsistent rather than uniformly pre-rewrite.
* Phase selection remains `RUNTIME_BRANCH_UNRESOLVED`.

**Do not read this as "MAIA's memory is corrupted."** It establishes that the recording path can diverge from the delivered path, not that it habitually does.

## Referred out separately

The member-facing half — **synthesized speech, persisted response, and displayed response may diverge because rewriting occurs after voice synthesis and persistence** — is filed as its own defect record with unassigned ownership. Per founder ruling, that referral is additive: it does not withdraw this finding from CMC-001.

## No repair

None authorized, none proposed. §XIX applies.
