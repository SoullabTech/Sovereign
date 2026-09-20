# MOTION-CENSUS-01 — Motion Census

**Opened** 2026-09-20 · founder act · **READ ONLY**
**Instrument** `scripts/witness/motion-census.ts` (this act's only new artifact)
**Standing** CENSUS COMPLETE · ⛔ NO REPAIR AUTHORIZED · ⛔ NO MOTION LAW RATIFIED · PRODUCTION UNTOUCHED

---

## Why this lane exists

Five external design skills were assessed for integration
(`ui-ux-pro-max`, `taste-skill`, `awesome-claude-design`, `design-md-chrome`,
`design-motion-principles`). Four were rejected or deferred. The fifth was not
adopted either — but assessing it surfaced a question the repository could
answer about itself, and that question became this lane.

Soullab has design law and an enforcing gate (`npm run check:design-canon`).
**Motion is the dimension that law barely covers**, and where it does, it is
framed as a *rendering-bug workaround* rather than a principle:

> "Framer Motion animations can cause rendering issues. For critical content
> visibility: use CSS transitions instead of `motion.div`; avoid
> `initial={{ opacity: 0 }}` on important content."
> — `docs/SOULLAB_DESIGN_CANON.md`, "Animations & Transitions" (~20 lines of 481)

The canon's "Don't" list repeats it: *"Use Framer Motion for elements that must
be visible on load."*

The census measures how that guidance fared. **It does not repair it.**

## Scope discipline

"Member-facing" is **not redefined here**. `IN_SCOPE` / `OUT_OF_SCOPE` are copied
verbatim from `scripts/check-design-canon.ts`, so census numbers and gate numbers
denote the same population. If that gate's scope changes, this instrument is
stale and must be re-derived — never patched to disagree.

1,560 `.tsx` files scanned. 107 motion-carrying files fell outside member-facing
scope and are excluded from every number below.

---

## Findings

### M1 · Scale

**780** member-facing files carry motion.

### M2 · Reduced-motion coverage

| | files | % |
|---|---:|---:|
| honour `prefers-reduced-motion` | **13** | **1.7%** |
| no reduced-motion path | 767 | 98.3% |

Counted generously: the CSS media query, framer's `useReducedMotion`, **and**
Tailwind's `motion-safe:` / `motion-reduce:` variants all score as honouring.
The number is 1.7% under the most permissive detector, not the strictest.

### M3 · Unbounded motion (no resting state)

**551 files (70.6%)** contain motion that never resolves; **542 of those have no
reduced-motion path.**

| pattern | occurrences |
|---|---:|
| `repeat: Infinity` | 548 |
| `animate-spin` | 432 |
| `animate-pulse` | 309 |
| CSS `infinite` | 35 |
| `animate-ping` | 18 |
| `animate-bounce` | 13 |

⛔ **Lawfulness is NOT adjudicated.** A spinner during a real wait is honest
feedback. A pulsing invitation that never stops is a hook. The census
distinguishes neither, and must not be read as if it did.

### M4 · Entrance animation from invisible

**493 files (63.2%)** render content that starts invisible and is made visible by
the motion library — the exact pattern the canon's "Don't" list names.

⛔ **Criticality is UNADJUDICATED.** The census counts the pattern, not the
offence. Deciding which content "must be visible on load" is a human judgment.

### M5 · Duration vocabulary

**85 distinct duration values.** Top: `0.8`(151) `1`(150) `2`(139) `0.5`(139)
`0.6`(101) `0.3`(93) `3`(78) `0.2`(75) `4`(65) `1.5`(53).

There is no motion scale. There is a long tail with a heavy head.

### M6 · Experience Contract coverage

**18 of 780 (2.3%)** motion files are covered by an Experience Contract.

⛔ Coverage ≠ motion was considered. **No contract carries a motion field**, and
`_TEMPLATE.md` has none to carry. A covered file's contract is silent on motion.

---

## ⭐ The two findings that matter

### 1 · Unbounded motion concentrates in exactly the surfaces the canon already names as the failure mode

Ranked by unguarded unbounded motion, the head of the list is dashboards:

```
38  components/dashboard/AudioUnlockDashboard.tsx
37  app/dashboard/page.tsx
30  components/dashboard/ReflectionsDashboard.tsx
24  app/dashboard/metrics/page.tsx
20  app/dashboard/settings/page.tsx
18  app/dashboard/dreams/page.tsx
```

`INHABITABLE_ARCHITECTURE_STANDARD` law 3 — *the first screen is a threshold,
not a dashboard*. The design gate's own header names the regression it exists to
stop: *"cards, dashboards, office forms and arbitrary palettes."*

**The motion census reached the same surfaces from an independent axis.**
Motion is not a separate problem sitting beside the Warehouse — it is
co-located with it. A Warehouse that also pulses is a Warehouse that will not
let you look away from it, which engages law 5 (*remove anything that makes the
system visible unnecessarily*) and law 6 (*adaptive disappearance*).

⚠️ Co-location is **observed**, not explained. Whether motion density *causes*
dashboard-ness, or both follow from the same authoring habit, is unestablished.

### 2 · ⭐⭐ MAIA's own words render from `opacity: 0` behind the motion library

Every message-rendering component on the conversation path:

| component | `initial opacity:0` | reduced-motion |
|---|---:|---:|
| `components/OracleConversation.tsx` | 16 | 3 |
| `components/chat/SacredChatInput.tsx` | 12 | 0 |
| `components/chat/ChatGPTStyleInput.tsx` | 6 | 0 |
| `components/chat/MessageBubble.tsx` | 4 | 0 |
| `components/chat/MaiaBubble.tsx` | 3 | 0 |
| `components/chat/ConversationFlow.tsx` | 3 | 0 |
| `components/chat/ChatMessage.tsx` | 1 | 0 |
| *(and the rest of `components/chat/*`)* | | 0 |

`OracleConversation.tsx` is the **only** conversation surface carrying any
reduced-motion handling at all.

The canon's motion guidance exists *because* "Framer Motion animations can cause
rendering issues," and names critical-content visibility as the reason. **MAIA's
turn is critical content by any reading of that sentence**, and it is rendered
from invisible, in every message component.

⛔ **NO RENDER FAILURE HAS BEEN OBSERVED.** This is **structural exposure, not a
measured defect.** The census read source; it did not run the app, reproduce a
blank turn, or establish that any member ever lost a message this way.

⚠️ It is, however, **the same shape** as the 2026-09-07 voice-silence defect,
one layer out. There the fault was MAIA's turn being *committed* as a side effect
of TTS, so a stalled TTS erased her words. Here her turn is committed correctly
and then handed to a motion library to decide whether it becomes *visible*.
Both put MAIA's speech downstream of a subsystem that has no stake in it.
*Voice may have a different capture path; it may not have a different mind* —
and the transcript of that mind should not be contingent on an animation
completing.

⛔ **Naming the resemblance is not establishing the defect.** The 2026-09-07 fault
was measured; this one is not. Closing the gap needs a runtime witness this lane
does not authorize.

---

## What this census establishes / does not establish

**ESTABLISHED** — the six counts above, over the gate's own member-facing
population, at this commit; that no Experience Contract can express a motion
decision; that conversation-path components render from invisible without a
reduced-motion path.

**NOT ESTABLISHED** — that any specific animation is unlawful · that any member
experienced a lost or unreadable turn · that motion density causes dashboard-ness
· that 1.7% is the *correct* reduced-motion figure for MAIA (no target exists to
measure against) · anything about the deployed runtime, which was not read.

---

## Owed, in order — ⛔ none authorized by this record

1. **Founder ruling: does motion get law, and where?** Either a motion section in
   `SOULLAB_DESIGN_CANON.md` grounded in sovereignty rather than bug-avoidance,
   or a `motion:` field in `_TEMPLATE.md` so contracts must state a motion
   decision. **Not both by default** — a second unenforced charter joins the same
   shelf the contracts README warns about.
2. **A runtime witness for finding 2**, if and only if the ruling wants it: does a
   message whose entrance animation fails to complete leave MAIA's words
   unreadable? That is the question the census cannot answer from source.
3. **Adjudication of M3** — which loops are feedback and which are hooks. Needs a
   human, per surface, and probably only for the head of the ranked list.

⛔ NOT AUTHORIZED BY THIS RECORD: any component change · any motion refactor ·
adding `prefers-reduced-motion` anywhere · touching the design-canon gate ·
adopting `design-motion-principles` or any external design skill · deploy ·
migration.

⭐ *The canon predicted this failure mode in writing, and 493 files did it anyway.
That is not a discipline problem. It is what the contracts README already
diagnosed: not missing principles — missing consequence.*
