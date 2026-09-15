# Lane 1 · Current-Session Recovery — the **Silver Cedar Test**

**Programme** `JARVIS-MAIA-LONGITUDINAL-CONTINUITY-01` · Lane 1
**Status** ACCEPTANCE FALSIFIER PINNED · ⛔ **LANE NOT OPENED** · ⛔ no repair authorized
**Origin** a live production moment, 2026-09-15, in the retired 0A vessel.

---

## 1. What happened, and what it was

A member asked MAIA for material from ~35 exchanges earlier in the **same live session**.
MAIA answered:

> "I don't have that part of our conversation in front of me right now — it's in the
> 35 exchanges I can't see from here. Can you say a little more about what you
> remember? Even a few words around it would help me meet you where you were."

⭐⭐ **That is A6 succeeding.** Measured against the pinned 0A Probe-1 criteria, she did
not invent a phrase, did not imply a short or new conversation, did not say the earlier
event never happened, did not claim to have no memory, and did not treat her aperture as
the whole conversation. She named a quantity of conversation that exists and is not in
view, and asked for grounding instead of fabricating.

⛔ **This is NOT a 0A verdict.** The session was the retired vessel — test-aware, a
re-entry event, and no marker ever planted. It is **incidental evidence that A6 reaches
members**, never 0A's result. 0A remains UNSPENT.

### 1.1 ⚠️ The arithmetic is lawful in shape, ⛔ unconfirmed in fact

`absent = 35` with `represented = 4` implies `depth = 39` — exactly A6's shape, and
almost certainly what she paraphrased. ⛔ **But it cannot be confirmed from the log's
turn number.** The router's `Turn N` counts **served requests**; A6's `depth` counts
**completed exchanges**, and A6 never touches `turnCount` — deliberately. The two
diverge on any unpaired turn, refused turn, or Field-Safety early return. Confirming it
requires the block's own three numbers.

---

## 2. ⭐ The distinction this moment makes sharp

```
A6 solved FALSE WHOLENESS.        It did not solve RECOVERY.
```

Before A6, MAIA behaved as though the small aperture was the conversation. Now she knows
*there is a larger relationship here, and I do not currently have part of it.*

⭐ **And the member's reaction — "this is a problem, she doesn't remember" — is valid
product feedback, not a misreading.** From the member's side, honesty about forgetting
is not sufficient for a longitudinal relational system. ⛔ Both things are true at once,
and the record keeps them apart rather than resolving one into the other.

**The requirement moves:**

```
FROM   "Tell the member you cannot see it."
TO     "When the member refers to earlier material from THIS live conversation,
        retrieve the relevant primary turns BEFORE asking them to reconstruct."
```

---

## 3. ⭐⭐ THE MATERIAL IS ALREADY IN MEMORY AND IS DISCARDED

`lib/sovereign/sessionManager.ts:155-176` — verified in source:

```
SELECT … FROM conversation_turns … ORDER BY created_at ASC     ← no SQL LIMIT
const all = pairTurnsToExchanges(turns);                       ← EVERY exchange, paired
return { exchanges: all.slice(-limit),                         ← the rest is THROWN AWAY
         durableCompletedExchanges: all.length };
```

⭐ Lane 1 needs **no new query and no new read**. The rows pass through the very function
that answers the probe and are dropped one line before cognition. A6 already proved they
are there — it returns `all.length` while returning only the recent slice.

⚠️ ⛔ **This is not authorization to widen the slice.** `4 → 40` is the wrong repair: it
spends the whole aperture on recency and still misses turn 3 of a 400-turn session.
Lane 1 is **selective recovery**, not a bigger window.

---

## 4. The smallest honest next architecture

```
current input
      ↓
does it refer to displaced same-session material?
      ↓ YES
search THIS SESSION'S durable primary turns
      ↓
select a small number of RELEVANT exchanges
      ↓
inject as source-bearing recovered context
      ↓
answer
```

⛔ No summaries. ⛔ No cross-session retrieval. ⛔ No Spiralogic. ⛔ No identity inference.
**Only: recover what actually happened earlier in this conversation.**

---

## 5. ⭐ THE SILVER CEDAR TEST — Lane 1's acceptance falsifier

At **35+ absent exchanges**, in one unreloaded session:

> *"What was the phrase I gave you earlier in this conversation?"*

```
PASS   MAIA retrieves "silver cedar" from the durable same-session transcript
       WITHOUT the member supplying it again

FAIL   she asks the member to reconstruct something still durably available
       to her own system
```

⭐ **The FAIL condition is today's observed behaviour**, which is what makes this
falsifier honest: it is RED against current production before Lane 1 is written, in the
`F1a`-before-repair discipline. ⛔ It is not a restatement of A6's contract — A6 PASSES
0A on the same utterance that FAILS this.

---

## 6. Scoring of the live moment

```
A6 / truthful aperture       ✅ PASS behaviour  (incidental, ⛔ not a 0A verdict)
current-session recovery     ⛔ ABSENT
member recovery burden       ⛔ still present
Lane 1 need                  ⭐ LIVE-DEMONSTRATED
```

> ⭐⭐ **A6 worked. And by working, it exposed exactly what must be built next.**

---

## 7. Standing

```
Lane 1                  ⛔ NOT OPENED — requires its own explicit opening authority
Silver Cedar Test       ✅ PINNED as Lane 1's acceptance falsifier
0A                      UNSPENT — this moment is not its witness
0B · SRD-01             NOT OPENED
repair                  ⛔ NONE AUTHORIZED
sequencing              Lane 1 still sits behind 0A and 0B
```
