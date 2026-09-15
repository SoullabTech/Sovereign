# `CONTINUITY-REMAINDER-01` · ACT 2 — WHY idx 39 WAS ABSENT AT W1

**Date** 2026-09-15 · **Founder-run retrieval; adjudication only.** ⛔ No repair · no replay ·
no oracle change · no tie-break rule · P1 unaltered · production `e57ca1baa` untouched.

> **BOUNDARY (ACT 1 closure §2, in force):** ACT 2 may explain why idx 39 was absent at W1.
> ⛔ It may not repair HOP 1, alter P1, or introduce a tie-break rule.

---

## 1 · VERDICT

```text
PARAPHRASE ....... ⭐⭐ CONFIRMED
FIRST-ASK ........ ⛔ EXCLUDED — the prior naming turn exists, same session, 17:51:13Z
APERTURE DRIFT ... ⛔ IMMATERIAL — the turn is inadmissible at ANY aperture (§3)
```

---

## 2 · THE TWO PROBES

| | timestamp | probe | tokens after the bridge's own tokenizer |
| --- | --- | --- | --- |
| **P1** | `18:52:08Z` | *"can you remember the phrase I shared with you eralier"* | `remember · phrase · shared · eralier` |
| **W1** | `20:16:44Z` | *"what was that phrase I mentioned earlier?"* | `phrase · mentioned · earlier` |

⭐⭐ **`remember` is absent from the W1 probe.** The member said **`mentioned`**.

⭐ W1 sits between the bridge commit `0f58a7f93` (`20:01:34Z`) and the rollback container
(`20:27:38Z`), and inside the session's span (`17:07:15Z → 20:17:28Z`). The window is
consistent; ⛔ nothing here rests on that consistency.

---

## 3 · ⭐⭐ THE DECISIVE MEASUREMENT

The prior naming turn — `17:51:13Z`, the only turn in the session that **names the target** —
tokenizes to `remember · saying · something · silver · cedar`.

```text
LINK to P1 probe  =  ["remember"]     ⭐ one token, and one only   (ACT 1 §3, re-confirmed)
LINK to W1 probe  =  []               ⛔⛔ EMPTY
```

⛔⛔ **It shares no token with the W1 probe.** HOP 1 admits a prefix turn only on a non-stopword
token shared with the probe, so at W1 **the naming turn could not be admitted as a hop under
any aperture, at any depth, in any window.** ⭐ That is why aperture drift is not merely
unsupported but **immaterial**: widening the prefix cannot admit a turn that fails the token
test.

⭐ The marker was **structurally unreachable at W1**, and it became unreachable for one reason:
the member asked the same question in different words.

---

## 4 · WHAT THE BRIDGE BRIDGED THROUGH INSTEAD

The prefix turns that **would** be admitted at W1, and what they carry:

| admitted turn | admitted via | its carriers for W1 |
| --- | --- | --- |
| `17:50:39Z` failed ask | `phrase`, `earlier` | `before · answer · remember · gave · conversation · started` |
| `18:52:08Z` (the P1 probe itself) | `phrase` | `remember · shared · eralier` |

⭐⭐ **Both admitted hops are themselves failed retrospective asks, and every carrier they
offer is retrieval or generic vocabulary. Not one names the object.** Whatever displaced
exchanges those carriers reach are reached by accident — which is ACT 1 closure finding 3
(`[5,15,27]` is an undifferentiated `n=1` set), now with a cause rather than an inference.

### 4.1 ⛔ The probe-token exclusion does not protect against retrieval vocabulary

At P1, `remember` was **excluded as a carrier** (it was in the probe) and did its work as the
**admitter** of the naming turn. At W1, `remember` is **absent from the probe**, so it is no
longer excluded — and appears as a **carrier** on both admitted hops.

> ⭐⭐ The same forbidden word is load-bearing in both runs; only its ROLE changed, and what
> changed it was the member's choice of synonym. ⛔ The exclusion rule does not keep retrieval
> vocabulary out of the mechanism — it decides which retrieval words do the work.

---

## 5 · ⭐ THE LAW UNDERNEATH, STATED ONCE

HOP 1 requires lexical overlap between **the current ask** and **a prior ask**. Two paraphrases
of the same opaque retrospective question are made almost entirely of retrieval vocabulary —
so retrieval vocabulary is the **only** thing they can share.

```text
P1 succeeded because `remember` happened to appear in BOTH the probe and the naming turn.
W1 failed because the member said `mentioned` instead.
```

⛔ **That is not a ranking property, a weighting property, or a corpus property. It is a
coincidence of wording.**

⚠️ **This sharpens ACT 1 closure finding 2.** P1's green was not merely *purchased with the
disputed token*; it was purchased with a **lexical coincidence between two paraphrases of the
same failed question.** ⛔ Recorded as adjudication input. ⛔ P1 is NOT re-adjudicated here —
that remains owed, and is not ACT 2's to perform.

---

## 6 · ⚠️ WHAT REMAINS UNVERIFIED, AND IS NOT NEEDED

- ⛔ **The `🌉 [L1/bridge]` line is GONE.** Live container `GIT_COMMIT=e57ca1baa` (the rollback
  build), `sessionBridge.ts` **absent from the image**, `grep "[L1/bridge]"` **empty**, and
  `docker ps -a` shows a single container created `20:27:38Z`. ⭐ **Container churn plus
  rollback — as predicted in the closure, and NOT evidence about the bridge.**
- ⚠️ **`[5,15,27] via 38` is therefore unverifiable** and rests on recollection alone. It is
  also not straightforwardly reconcilable: by `20:16:44Z` the session carried ~43 member turns,
  so exchange 38 would likely be **displaced**, and the hop my reconstruction admits is the
  `18:52:08Z` ask at a **higher** index. ⛔ The discrepancy is unresolvable with the log gone.
  ⭐ **The §3 finding does not depend on it** — an empty token intersection settles admission
  without reference to any index.
- ⛔ **No transcript prose is carried into this record.** One matched row (`17:49:00Z`) is a
  personal narrative and is excluded entirely under `C1-BRIDGE-01 §5`; only probe strings
  appear, per the precedent §4 already set.

---

## 7 · STANDING

```text
W1 cause ........................ ⭐⭐ PARAPHRASE · CONFIRMED · measured
first-ask / aperture ............ ⛔ EXCLUDED / IMMATERIAL
ACT 2 question .................. ✅ ANSWERED · boundary observed
HOP 1 admissibility defect ...... ⭐ FOUND (ACT 1) · ⛔ NOT REPAIRED
P1 evidentiary standing ......... ⚠️ STILL REQUIRES RE-ADJUDICATION · ⛔ not performed here
behavioural repair .............. ⛔ NOT AUTHORIZED
tie-break rule .................. ⛔ NOT INTRODUCED
ACT 3 falsifiers ................ ⛔ NOT AUTHORED
first-ask opaque memory ......... ⛔ UNOPENED · PRESERVED · separate lane
deployment ...................... ⛔ NOT AUTHORIZED
production ...................... e57ca1baa · UNTOUCHED
```
