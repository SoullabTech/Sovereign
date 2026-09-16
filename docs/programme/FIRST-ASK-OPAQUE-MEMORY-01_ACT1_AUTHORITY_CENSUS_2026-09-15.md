# FIRST-ASK-OPAQUE-MEMORY-01 · ACT 1 · Authority census

**Date:** 2026-09-15
**Branch:** `chore/first-ask-opaque-memory-01-20260915`
**Opening base:** `77e6cff57` · `CONTINUITY-REMAINDER-01` closed
**Scope:** read-only substrate + authority census. No implementation, deploy, or `S` act.

## 1. Opening question

Can first-ask opaque memory recover a member's own earlier words without giving MAIA authority to decide what mattered?

The census separates two questions that prior memory machinery often conflates:

1. **Retention:** are the original member words durably available?
2. **Authority:** what evidence may make those words eligible for an opaque later ask?

The first is largely solved in current substrate. The second is not.

## 2. Current production custody

At ACT 1 sealing, production reports `GIT_COMMIT=c9f397d67`.

This is an independent runtime movement after the selection-law witness. Read-only ancestry check proves accepted selection subject `762c3c4ed` **is an ancestor** of `c9f397d67`; this lane does not interpret or ratify the later deployment.

No production mutation is authorized here.## 3. Production substrate census

Aggregate production counts observed during ACT 1:

```text
conversation_turns             42,395 rows · 221 members
developmental_memories          2,158 rows · 37 members
breakthrough_moments            1,400 rows · 34 members
member_memory_atoms               142 rows · 10 members
episodic member-marked              11 rows · 3 members
atom breakthrough-marked             0 rows
conversation_themes                  0 rows
```

These counts establish availability, not authority.

### Raw-turn substrate

`conversation_turns` preserves member/MAIA role, content, session identity, exchange identity, and server-minted provenance. It does **not** carry a field meaning “this mattered.”

### Developmental writeback substrate

The live sovereign route invokes `MemoryWritebackService.writeBack` after recognized non-Sanctuary turns with `memoryMode: 'longterm'` forced for this write path.

`developmental_memories.trigger_event.raw.userMessage` retains up to 500 characters of original member text; `raw.assistantResponse` is retained separately. Normal developmental recall surfaces the distilled `content_text`, not those raw words.Over the last 7 days, 131 developmental rows were formed; all 131 retained both raw member and raw MAIA text. Mean stored significance was 0.548 (min 0.400, max 1.000).

This proves encode-time retention exists. It does **not** prove the significance score is lawful opaque-recall authority.

## 4. Why current system significance is not authority

`MemoryWriteback.calculateSignificance` starts at 0.30. It can increase because:

- the member message is long;
- MAIA's own response exceeds 500 characters;
- simple emotional-language regexes match;
- correction-language regexes match;
- stable-fact regexes match.

The write threshold is 0.35. Therefore MAIA's own generated verbosity can contribute to promotion.

A system score may be operationally useful elsewhere. It cannot mean “this is what the member meant later” and cannot, by itself, establish opaque-recall eligibility.

## 5. Member-authorized substrates already exist

### Member-marked episodic memory

The episodic mark route states the governing doctrine directly: MAIA may preserve what the member marked; MAIA may not add what the member did not author.

It stores the member's verbatim words and source provenance while intentionally leaving interpretive significance, emotional intensity, breakthrough level, and spiral stage NULL.### Member memory atoms / Keeps

The atom substrate is intended for member placement and explicit gestures such as return preference, “still here,” set aside, protect, archive, and breakthrough marking. The current production population is historically mixed: the observed rows carry `generated_by=unattributed-historical`, so row existence alone is not clean member-authority evidence.

### Breakthrough moments / themes

`breakthrough_moments` has broad production population and may be system-written from MemoryWriteback. `conversation_themes` is empty in production. Neither may be treated as member significance merely because its schema sounds meaningful.

## 6. ACT 1 finding

The storage substrate required for first-ask opaque memory is **not missing**.

What is missing is a lawful admission rule connecting a later opaque ask to a bounded set of earlier member-authored candidates without converting MAIA's interpretation into member meaning.

The candidate architecture may reuse raw member-authored material already retained in `conversation_turns` or another provenance-safe carrier. It must not inherit `developmental_memories.significance` as retrieval authority.

## 7. Constitutional boundary carried into ACT 2

> **MAIA may preserve evidence that a member returned to, retained, or explicitly marked a moment. She may use that evidence to find the member's own words later. She may not convert her own interpretation of a moment into evidence that the moment mattered.**

ACT 2 must formalize evidence classes and ambiguity law under that boundary. `S` remains unspent.