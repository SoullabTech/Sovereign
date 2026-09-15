# `C1-BRIDGE-01` — read-only evidence act

**Authority** founder ruling 2026-09-15, after R1 rejected the recurrence repair.
**Scope** ⛔ no behavioural code · no weights · no deployment · production `e57ca1baa` untouched.
**Corpus** the authoritative frozen production session (control reproduces `[2,3,36]`).

---

## 1. The question

> Does the corpus contain a deterministic evidentiary path from the current
> retrospective demand, through the active prefix, to displaced index 22?

⛔ The bridge hypothesis was **not** assumed correct and no fixture was built for it. The
corpus was asked what relations it already contains.

---

## 2. ⭐ A path exists, member-originated at both hops

```
HOP 1   probe(40)  member:[remember, phrase, shared, eralier]
          idx 38   member:[remember, phrase]     assistant:[phrase]
          idx 39   member:[remember]             assistant:[remember]

HOP 2   from idx 39 (member-linked to the probe):
          → displaced 22   member-shared:[markerA, markerB]   ⭐ MARKER
          → displaced 24   member-shared:[markerB, markerA]   (the member's return)
          → displaced 36   member-shared:[…, remember]
          14 displaced exchanges share member tokens with idx 39

PATH    40 →[remember]→ 39 →[markerA, markerB]→ 22
```

⭐ Both marker-bearing exchanges rank **first and second** from idx 39 by member-shared
token count. The relation is real and is not faint.

---

## 3. ⭐ The member/assistant split is load-bearing, measurably

⚠️ **16 displaced exchanges** become reachable from idx 39 through **MAIA's echo alone**:
`[1,3,5,7,10,12,15,20,21,26,28,29,31,32,33,37]`.

⛔ A bridge rule that does not distinguish origin admits all sixteen. This is the same
defect the recurrence inquiry already refused — MAIA's own language manufacturing member
significance — reappearing one layer up in the topology.

---

## 4. ⛔⛔ WHAT THIS CORPUS CANNOT ESTABLISH — and the reason matters

**idx 39 is not ordinary context. It is the member's PREVIOUS FAILED RETRIEVAL ATTEMPT,
and it NAMES THE TARGET in the asking:**

> *"do you remember me saying the something about a silver Cedar"*

⭐ The bridge traverses idx 39 precisely because the member had already asked once and
supplied the marker themselves. Remove idx 39 and the remaining prefix exchange, idx 38,
reaches `[5, 15, 27, 36]` — **the marker is absent.** Within this corpus the entire path
rests on a prior naming.

```
bridge relation EXISTS, member-originated         ✅ ESTABLISHED
member/assistant split is load-bearing            ✅ ESTABLISHED (16 false targets)
bridge works WITHOUT a prior naming attempt       ⛔ NOT ESTABLISHED
                                                     ⛔ and this corpus CANNOT establish it
```

⚠️ **A member who asks ONCE** — the ordinary case, and the case `S` will present — leaves
no exchange carrying both the probe's words and the marker's. The bridge would have
nothing to traverse.

⭐ So the finding is narrower than *"bridge validated"*. What is validated is that **this
corpus contains a bridge**, and that the bridge exists **because the member asked twice**.
⛔ Declaring the mechanism sound on this evidence would repeat the lane's characteristic
error one more time: a relation discovered after the fact, in a corpus that happens to
contain it.

---

## 5. ⚠️ A prior claim of mine, corrected

*"The scorer only ever sees tokens; df, overlap, rarity and recurrence depend on token
identity, never on meaning."* ⛔ **False in one bounded place.** `retrospectiveDemand`
reads lexical meaning — it matches `" earlier "`, `" i shared "`, `" remember "` on the
raw string **before ranking begins**.

⭐ That error is why FREEZE-01 was invalid: veiling erased the cues, demand fell to 0, the
gate never opened, and the deployed scorer recovered nothing. The control caught it.

⭐ **Recorded so a future privacy-preserving witness does not repeat the category error:
a content-free corpus is faithful for IDENTITY-based mechanisms and destroys
MEANING-based ones. Both kinds exist in this scorer.**

---

## 6. Standing

```
C1-BRIDGE-01              ✅ EVIDENCE ACT COMPLETE (read-only)
bridge path               ✅ EXISTS · member-originated · 40 → 39 → 22
origin split              ✅ NECESSARY · 16 false targets without it
single-ask case           ⛔ UNESTABLISHED — needs a corpus without a prior naming
implementation            ⛔ NOT AUTHORIZED
counterexample corpus     ⛔ OWED before any bridge rule (founder ruling)
second C1 repair          ⛔ NOT AUTHORIZED
weight tuning             ⛔ NOT AUTHORIZED
S semantic probe          ⛔ UNOPENED · PRESERVED
deployment                ⛔ NOT AUTHORIZED
production                e57ca1baa · UNTOUCHED
```
