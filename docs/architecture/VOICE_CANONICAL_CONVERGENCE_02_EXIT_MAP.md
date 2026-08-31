# VOICE-CANONICAL-CONVERGENCE-02 — the exit map

**Status:** read-only finding, 2026-08-31. No repair in this artifact.
**Unit question:** after authoritative member text exists, does every
response-producing spoken path converge into the same guarded canonical
cognition used by typed turns?
**Answer: NO. RED.**

Subject: `handleVoiceTranscript` (`components/OracleConversation.tsx:6638–7290`).

---

## 1 · Every exit, classified

Fifteen returns. They fall into **three** classes, not the two the mandate
anticipated.

### A · Non-response exits — ALLOWED

The turn is refused before it becomes a member turn. No MAIA response, no
cognition, correctly no convergence.

| line | guard |
|---|---|
| 6644 | empty transcript |
| 6660 | busy / mic paused |
| 6675 | duplicate within 30 s |
| 7082 | punctuation-only |
| 7116 | **ghost phrase** — YouTube/video audio bleed |
| 7123 | **echo cooldown** — inside `echoSuppressUntil` |
| 7139 | **echo similarity** — "Transcript appears to be MAIA's voice" |
| 7151 | processing/responding re-entry |
| 7158 | duplicate of last message |
| 7199 | **scribe** — passive witness, *"Don't trigger MAIA response"* |

⭐ These are the admission guards. They are the correct shape and the unit must
not disturb them. Note three separate echo defences at 7116/7123/7139 — evidence
that MAIA hearing herself has been a recurring, already-fought problem.

### B · Response-producing exits — THE UNIT'S SUBJECT

| line | exit | reaches canonical cognition? |
|---|---|---|
| 7268 | `await handleTextMessage(cleanedText)` | ✅ **YES** — the certified path |
| 7263 | `sendStreamingMessage(...)` → `return` | ⛔ **NO** — parallel authority |

⛔ **7263 is reached by default.** `streamingVoiceMode` is
`useState(() => { return true; })` (`:985`), and the gate is
`streamingVoiceMode && !showChatInterface` (`:7211`). So the *default* spoken
turn takes the divergent exit and never reaches 7268.

### C · ⚠️ SPOKEN-WITHOUT-COGNITION — a class the mandate did not anticipate

Branches where **MAIA speaks to the member** with no cognition anywhere in the
path. `maiaSpeak()` is invoked directly on text assembled locally or returned by
a data API.

| line | what MAIA says | source of the words |
|---|---|---|
| 6712 | crisis response script | local script (⚠️ see below) |
| 6897 / 6902 | transits summary, or a failure line | `/api/astrology/transits/today` |
| 6911 / 6916 | personal transits, or "I need your birth chart data…" | data API |
| 6937 | summary | data API |
| 6955 / 6957 | action items, or "I didn't find any clear action items" | data API |
| 6978 | replay of a paused response | `pausedResponseRef` |
| 7001 | voice-command acknowledgement | `voiceCmd.acknowledgmentText` |
| 7067 | confirmation | local |

**Are these response-producing?** By the mandate's test — *"any branch that
generates a MAIA response before convergence is RED"* — the honest answer is
**they are neither cleanly A nor B**, and the unit must rule rather than assume:

- They are **not cognition**: no model authors them, so there is no *second
  mind* here. That is the invariant the programme protects, and it is intact.
- They **are member-facing utterances in MAIA's voice**, so they bypass the
  canonical egress finalization exactly as the streaming route does.

⭐ Proposed classification, for founder ruling: **class C is a
DIFFERENT DEFECT CLASS from class B.** B is a second mind; C is a first-person
utterance channel that never passes egress. Repairing them together would
widen this unit past its mandate. C should be recorded and deferred.

⚠️ **6712 is the sharpest instance and deserves separate naming.** It speaks a
crisis script and *deliberately does not return* (`// Don't return - let the
message go through with crisis context`). So a crisis utterance is spoken
outside any guard, and the turn then also proceeds to cognition. That is the one
place in class C where the member is most vulnerable and the guard coverage is
least established.

---

## 2 · What the divergent exit actually reaches

`app/api/voice/stream-conversation/route.ts` — 1,639 lines.

```
getMaiaResponse                     0
maiaService                         0
buildMaiaWisePrompt                 0
finalizeMemberFacingText            0
enforceIdentityPredicateConstraint  0
getClaudeService                    2   ← its own model authority
```

It imports and operates its own Claude service, memory bundle
(`MemoryBundleService`), relational/threshold stack, prompt machinery
(`MEMORY_CANON_GUARD_PROMPT`, `voiceStreamGuard`) and TTS. It is not a thinner
call into canonical cognition — it is **a second cognition**.

## 3 · R13, precisely

The Refusal Registry audits the live spine
`OracleConversation → /api/sovereign/app/maia/list → getMaiaResponse()`, and R13
names `finalizeMemberFacingText` as the egress funnel **on that spine**. It also
names *"route an egress around the funnel"* as the hostile-fork action that
violates the refusal.

```
R13 implementation on canonical spine    DEMONSTRATED ✅
R13 coverage of streaming voice          NOT ESTABLISHED
"single egress funnel" as a GLOBAL claim SUSPECT / overbroad
```

⛔ **Do not repair this by copying the identity guard into the streaming route.**
That yields a better-guarded second mind, which still fails the deeper
invariant. The guard must apply *because spoken output uses the canonical
egress*, not because a guard was duplicated.

## 4 · Why the previous proof missed all of this

`__tests__/voice-non-degradation.test.ts` asserted `handleTextMessage(` appears
somewhere in the handler, and that four **named** routes do not:

```js
['/api/between/chat','/api/sovereign/app/maia','/api/oracle/conversation','/api/maia/chat']
```

`/api/voice/stream-conversation` was not among them, so the suite passed while
the default spoken path diverged. A denylist cannot find what it was not told to
look for. The replacement must be **positive**: enumerate response-producing
exits and constrain their count — and a deliberate probe adding a second one
must fail the gate.

## 5 · Verdict

```
Exactly one response-producing convergence point       ✗ two (7263, 7268)
Spoken and typed enter the same cognition              ✗ default spoken does not
No spoken path invokes a separate model authority      ✗ getClaudeService
No spoken path assembles substitute cognition context  ✗ own MemoryBundle + prompts
Canonical guards apply via canonical egress            ✗ funnel absent from route
Passive/scribe exits distinguishable                   ✓ class A is clean
Enforcement test is positive                           ✗ denylist
Probe adding a second exit fails the gate              ✗ no such gate exists
```

**RED on seven of eight.** The one that passes — the admission guards — is the
part nobody built in a hurry.
