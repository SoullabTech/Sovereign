# SHADOW & GOLD — `SHADOW-GOLD-01` · CENSUS + AUTHORED COPY

**Date** 2026-09-08 · **Status** ⛔ **CENSUS + RECORDED COPY. NOTHING BUILT. NOT AUTHORIZED.**

---

## 1 · The authored member copy — recorded verbatim, founder-authored

> ### Shadow & Gold
> *Ourselves Reflected*
>
> Shadow & Gold is a space for exploring parts of yourself that may be easier to see through your
> reactions to other people, relationships, dreams, conflicts, attractions, and recurring patterns.
>
> **Shadow does not mean "bad."** It means something may have been left outside the version of
> yourself you learned to identify with.
>
> And sometimes what has been left out is not darkness at all. It may be confidence, creativity,
> authority, tenderness, desire, play, or some other quality you have difficulty recognizing as your
> own. This is sometimes called the **golden shadow**.
>
> **You might come here when…**
> · someone affects you much more strongly than you understand
> · the same relationship pattern keeps repeating
> · you feel unusually irritated, fascinated, jealous, ashamed, or drawn to someone
> · a dream or image stays with you
> · you notice a quality in another person that you deeply admire or reject
> · you sense there is something in yourself you have not fully met
>
> **What MAIA does here**
> MAIA will help you explore, **not diagnose you**. She may help you notice patterns, ask questions,
> consider projection, or look at what an encounter might be revealing about you.
>
> **But the other person remains real.** Not everything is a projection, and MAIA will not reduce
> someone who hurt, loved, challenged, or inspired you to "just a mirror."
>
> The guiding question is simply: ***What of me might be becoming visible through this encounter?***
>
> You decide what resonates, what belongs to you, and what does not.
>
> **MAIA holds the lantern. You decide where to look.**
>
> **Begin** — bring a person, reaction, dream, conflict, attraction, recurring pattern — or simply say:
> *"I want to explore something through Shadow & Gold."*

**Placement direction (founder):** a **visible Shadow & Gold card/Field in MAIA**, not hidden inside
general conversation, with a simple **Explore Shadow & Gold** entry. MAIA may **recognize** an explicit
request (*"Can we do shadow work?"*) and **offer** to enter the Field — ⛔ **never silently interpret
the conversation through it.** ⭐ **It should be in the House.**

---

## 2 · ⚠️ THREE FINDINGS FROM THE CENSUS — read before designing

### 2.1 ⭐⭐ "House" already denotes TWO different things, and shadow work is bound to the OTHER one

| | |
|---|---|
| **the navigation House** | `components/maia/MaiaHouseSheet.tsx` — *"one quiet doorway opens the whole world"*, governed by a **NAVIGATION CONTRACT (2026-07-27)** |
| **the astrological house** | `SacredHouseWheel.tsx` · `TraditionalHouseWheel.tsx` · `HouseDeepDiveSheet.tsx` · migration `20260522000004_house_system_porphyry_default` — houses **1–12** |

⭐ **The existing shadow substrate is keyed to the ASTROLOGICAL house**: `lib/consciousness/shadowWorkFlows`
exports **`generateHouseShadowFlow`**, and `/api/consciousness/shadow-work` takes `?house=1-12`.

> ⛔ **"Put Shadow & Gold in the House" is therefore ambiguous in the codebase's own vocabulary.** The
> founder means the **navigation doorway**. An implementer reading `generateHouseShadowFlow` could
> reasonably conclude otherwise. **This is the `FieldPhase` / `CircleConstitutionState` collision
> (CA-14) in a third location** — same strings, different questions, no compiler help.

### 2.2 ⚠️ "Shadow" also already denotes an auth defect, not a practice

`app/api/__tests__/practitionerShadowContainment.test.ts` is **AUTH-01-D3** — *practitioner **shadow**
authority containment*, where "shadow" means a **duplicate route-local `getMemberFromRequest` shadowing
the hardened module**. ⛔ **Nothing to do with shadow work.** Recorded so a future session does not read
it as prior constitutional governance of this practice — it is not.

### 2.3 ⭐ A shadow-work substrate ALREADY EXISTS, and its status is unestablished

`lib/consciousness/shadowWorkFlows` · `/api/consciousness/shadow-work` ·
`components/consciousness/ShadowWorkGuide.tsx` · `ShadowWorkSheet.tsx` ·
`app/api/_backend/src/agents/ShadowAgent.ts` (a **live Corpus Callosum voice**, per the anchor) ·
`shadowWorkModule.ts` · `spiralogic_kb/shadow_evolution.json` · `app/dashboard/shadow` ·
`app/api/elemental-alchemy/shadow` · `app/labtools/parts-shadow`.

⛔ **Whether these are live, dormant, or Cat 3/4 is NOT established by this census** — that is a
read-only classification act nobody has performed.

> ⚠️ **This is the I0 "Commons denotes three things" pattern repeating.** Building Shadow & Gold fresh
> **or** adopting/renaming existing substrate is a **real fork with a real cost either way**, and it
> must not be decided by whichever file an implementer opens first.

---

## 3 · The navigation contract Shadow & Gold would be entering

`MaiaHouseSheet` is explicit: every destination comes from **one authoritative model**,
`lib/navigation/houseDestinations`, **dispatched by kind** — native route · member sheet · web bridge.

> *"That is what stops the registry, the mobile allowlist, and the native bundle from drifting apart
> and producing silent white screens on iPhone."*

⛔ So adding a House card is **not** adding a card. It is a registry entry **plus** a dispatch kind
**plus** allowlist/bundle agreement. The known failure mode is a **dead button on iPhone**.

Also load-bearing, and already true of the House: *"No new data, no persistence, no inference; opening
the House is a member act."*

---

## 4 · Constitutional bindings the copy already satisfies

| copy | binding |
|---|---|
| *"help you explore, **not diagnose**"* | Canon — no guru stance, no diagnosis, no authority |
| *"**the other person remains real** … not just a mirror"* | ⭐ guards against **interpretive displacement**; the strongest line in the piece |
| *"**You** decide what resonates, what belongs to you"* | member sovereignty over meaning; facts may be derived, **meaning is declared** |
| *"MAIA holds the lantern. **You** decide where to look."* | Interface Humility (Invariant 16) |
| **golden shadow** | refuses the pathologizing frame — what was left out may be confidence, play, authority |
| **explicit entry; offer, never silently interpret** | ⭐ the **no-ambient-appropriation** shape (FR-06's logic, one domain over) |

---

## 5 · Two questions the copy does not yet answer

### D-S1 · ⭐ What happens to material about a third party who never consented?

Shadow & Gold invites a member to bring **a person** — *someone who hurt, loved, challenged or inspired
you.* That produces MAIA-held content **about a named third party who has no account, no consent, and
no standing here.**

- Does it enter long-term memory, or is Shadow & Gold **Sanctuary-shaped by default**?
- The lane's own doctrine is relevant: **an interest declaration is an act against nobody** — but
  *"here is what I think is really going on with my brother"* **is not**.

⛔ Not decided. **This is the first question, ahead of any build.**

### D-S2 · Does the invitation to look at projection become a way to dismiss a real grievance?

The copy already guards it (*"not everything is a projection"*). ⚠️ The residual is **behavioural, not
copy**: under what conditions does MAIA **decline** to read an encounter as projection — for example
where a member describes harm? *A lantern pointed at the wrong thing is still a lantern.*

---

## 6 · Standing

```
SHADOW-GOLD-01     CENSUS + AUTHORED COPY RECORDED
FORK               build fresh vs adopt existing substrate — OPEN (§2.3)
D-S1 · D-S2        OPEN
IMPLEMENTATION     NOT AUTHORIZED
HOUSE REGISTRY     UNTOUCHED
```

⛔ Nothing built · no registry entry · no route · no component · no schema.
