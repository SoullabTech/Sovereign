# NW-D00 — Safety / Off-Ramp Inheritance Trace

**Task**: bounded parallel task authorized alongside NW-R01 — *"trace the interview route for
actual safety/off-ramp inheritance."*
**Resolves**: census UNKNOWN #1.
**Answer**: **No safety or off-ramp layer is inherited.** What is inherited is a constitutional
floor that is conditionally composed and contains no escalation path.

---

## The path traced

`components/now-what/NowWhatRoom.tsx` → `POST /api/now-what/interview` →
`composeRoomTurnPrompt()` (`lib/maia/roomComposition.ts`) → `getLLMProvider()`
(`lib/consciousness/LLMProvider.ts`).

## Finding 1 — the constitutional floor is composed, but conditionally

`lib/maia/roomComposition.ts:292` composes the system prompt as:

```
[ MAIA_RUNTIME_PROMPT, presence, fieldBlock, positionBlock, lessonBlock, roomPrompt ]
```

The constitutional floor is genuinely first. **But line 285 short-circuits above it:**

```js
if (!presenceEnabled && !fieldBlock) {
  return { systemPrompt: roomPrompt, field: null };
}
```

`presenceEnabled` is `process.env.NOW_WHAT_MAIA_PRESENCE_ENABLED === '1'`. So when MAIA presence
is **off** and no field block resolves, the room runs on **its own room prompt alone** — the
constitutional floor is not composed at all. Whether that branch is live in production depends
on the deployed env, which this trace did not read.

## Finding 2 — the constitutional floor contains no crisis or referral instruction

Searched `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` for
`crisis|suicid|harm|emergency|therap|clinical|refer|professional help|danger`. Every hit is
**stylistic, and points the wrong way** for safety purposes:

- *"Speak as a wise, grounded ally, not a therapist or technician."*
- *"Speak as a real person, not a chatbot, guru, or therapist."*
- *"No therapeutic-sounding frameworks like 'What I'm hearing is…'"*
- *"Use 'I notice' instead of 'I see' or 'I observe' — feels more present and less clinical."*

These instruct MAIA to avoid clinical *register*. None of them provides an escalation path, a
referral, a scope boundary, or a stopping rule. A prompt that says "don't sound clinical" while
providing no off-ramp is, for §XX purposes, worse than silent: it shapes the voice toward
intimacy without bounding the encounter.

## Finding 3 — the provider layer has none either

`lib/consciousness/LLMProvider.ts`: no `crisis|safety|harm|risk|moderation` hits. No
moderation pass, no classifier, no stop condition.

## Finding 4 — the MAIA-wide safety modules are not on this path

`lib/spiritual-support/context-detection-system.ts` and siblings exist elsewhere in MAIA. They
are **not imported** by the interview route, by `roomComposition`, or by `LLMProvider`. Whatever
protection they provide on `/api/oracle/*` or `/api/sovereign/*` does not reach The Room.

---

## Ruling

Census finding **F7** is **CONFIRMED and narrowed**: the absence is not merely of the *word*
"crisis" in the Now What? namespace — it is of any safety behaviour on the actual conversational
path, including the shared layers that path composes through.

§XX of the directive has **no substrate anywhere in the Now What? conversational path.** This is
not a copy gap; it is an unbuilt capability on the one surface in the environment where a member
speaks freely and at length.

Two items for the founder, neither of which this unit is authorized to build:

1. **The env branch (Finding 1)** should be resolved regardless of the safety question — a
   constitutional floor that can be skipped by an env flag is not a floor. Verify
   `NOW_WHAT_MAIA_PRESENCE_ENABLED` in production.
2. **§XX needs its own slice.** Defining coaching / reflection / education / AI assistance /
   psychological intervention / therapy / crisis, and the referral rules between them, is
   NW-R02 and NW-D01 work. It should not be improvised into a prompt.
