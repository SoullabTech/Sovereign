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

## 3a. ⭐⭐ THE DEFECT NAMED: carriers aimed at the wrong TEMPORAL DOMAIN

⛔ The memory organism is not absent. Its carriers are pointed at the wrong time.

```
CURRENT SESSION
  recent 3 / 4 / 5 exchanges     → cognition
  older turns in the SAME session → ⛔ STRANDED — no carrier at all

OTHER SESSIONS
  cross-session turns · conversational recall · developmental memories ·
  breakthroughs · session remembrances · member-marked episodes · derived
                                  → variously available
```

⭐ In a short conversation this behaves reasonably. In a long one the exclusion turns
pathological — the intent

> *"don't echo the current conversation back at the member"*

quietly becomes

> ⛔ *"exclude the only history that matters right now."*

### 3a.1 ⭐ The missing layer is the TEMPORAL MIDDLE

```
NOW                                          LONG-TERM
recent aperture   ←—— ??? ——→   cross-session memory
```

That `???` is **the displaced remainder of the current ongoing encounter.** For a
relational system it is decisive, because much of the most meaningful material is
neither recent enough to remain in working context nor old enough to belong to "past
sessions." ⭐ It is simply **earlier in the same living conversation** — which is why
this is obvious from the member's side and easy for the architecture to miss.

> ⭐⭐ **MAIA does not need more memory layers first. She needs the existing memory
> organism to include the temporal middle: the part of the current relationship that has
> fallen out of working context but has not ceased to matter.**

---

## 4. The smallest honest next architecture

```
current utterance
      ↓
recent aperture REMAINS INTACT
      ↓
search ONLY displaced turns from THIS session
      ↓
EXCLUDE exchanges already represented
      ↓
rank for relevance / significance / correction
      ↓
return a VERY SMALL source-bearing set
      ↓
inject into cognition
```

⛔ No summaries. ⛔ No cross-session retrieval. ⛔ No Spiralogic. ⛔ No identity inference.
**Only: recover what actually happened earlier in this conversation.**

### 4.1 ⛔⛔ DO NOT REMOVE `session_id <> $2` FROM THE EXISTING CARRIERS

The cheap repair is to drop the exclusion predicate from `MemoryBundle.ts:226` and
`memoryLoaders.ts:212`. ⛔ **Refused.** That would produce echo, duplication, and
competing retrieval paths across carriers that were each designed for a different
temporal domain.

⭐ Lane 1 needs a **dedicated current-session recovery carrier** whose subject is exactly:
*displaced primary turns from this same session that are relevant to the present
utterance.* The existing carriers keep their exclusion and keep their jobs.

### 4.2 ⭐⭐ CROSS-LANE CONSTRAINT — Lane 1 MUST feed A6's accounting

⚠️ **If Lane 1 injects recovered exchanges without telling A6, it re-breaks A6.**

A6 derives `absent = depth − represented`, where `represented` is counted at the tier's
final aperture. Recover two displaced exchanges into cognition and the truth becomes
`represented = 6 · absent = 33` — while A6, unchanged, still states `4` and `35`.

⛔ **That is a false statement about her own view, which is the precise defect A6 was
built to repair.**

### 4.3 ⭐⭐ THE BOUNDARY — self-location is computed from the FINAL COMPOSITION

⚠️ An earlier draft of §4.2 said *"Lane 1 must feed A6's accounting"* — a **push** model
in which each carrier reports what it contributed. ⭐ **SUPERSEDED, ⛔ not deleted.** It
is brittle: every future lane that contributes material would have to remember to
increment A6, and **truthful self-location would become dependent on side-channel
bookkeeping** — reliable exactly until one carrier forgets.

⭐ The **pull** model is the law:

> ⭐⭐ **Self-location is computed from the final cognitive composition, never maintained
> by individual memory carriers.**

```
depth        = unique completed exchanges durably recorded for this session

represented  = unique completed exchanges ACTUALLY PRESENT in FINAL cognition,
               after recent aperture + recovery + any future source-bearing
               carrier has composed

absent       = depth − represented
```

**Two corollaries:**

- ⛔ **Retrieved but discarded before the model sees it does NOT count as represented.**
- ⭐ **The same exchange present through two carriers counts ONCE**, by durable exchange
  identity.

⭐ This preserves A6's original law exactly — *represented* means **what MAIA actually
has before her**, ⛔ never what some upstream stage fetched. And it scales: protected
significance, summaries, developmental continuity and every later carrier become unable
to silently falsify A6 merely by adding context.

### 4.4 ⚠️ IMPLEMENTATION CONSEQUENCE — A6's derivation point must move

A6 derives per tier at that tier's **final aperture**, immediately before prompt
assembly (`maiaService.ts:1072` FAST · `:1826` CORE). ⭐ That is correct **today**,
because the aperture is the only exchange-bearing carrier for the current session — so
"final aperture" and "final composition" coincide.

⚠️ **They stop coinciding the moment Lane 1 lands.** Adopting §4.3 therefore implies
relocating A6's derivation **downstream of every exchange-bearing carrier**, which is a
change to A6 itself.

⛔ Not circular: the continuity block is part of the prompt but contributes no
exchanges, so it never counts itself.

⛔ Naming this constraint is not authorization to implement it, and ⛔ it does not reopen
A6's acceptance — A6 is correct for the composition that exists today.

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
