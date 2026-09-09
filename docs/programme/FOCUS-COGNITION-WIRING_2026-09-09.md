# FOCUS COGNITION WIRING — the narrow lane

**2026-09-09 · BUILT · CODE GATES GREEN · ⛔ HUMAN WITNESS NOT RUN · `#1275` FROZEN.**

> ⭐⭐ **One authorized boundary, one accountable crossing, one canonical MAIA —
> and no invisible alternate path.**

## The one lawful path

```text
member Focus act → posture + ONE requestId → establishDisclosureBoundary()
   ↳ only may_cross continues
→ assemble the authorized Focus (SERVER-SIDE, only now)
→ canonical MAIA cognition          ← ⭐ THE CROSSING IS THIS HANDOFF
→ confirmDisclosureCrossed()
→ §3a presentation
```

| Artifact | |
|---|---|
| `app/api/writers-studio/focus/route.ts` | the only route that may send Work context. Founder-gated, **off by default, 404 not 403** — an unauthorized caller learns nothing about what exists. It resolves identity, holds one `requestId`, and delegates. |
| `lib/writers-studio/focusCrossing.ts` | the constituted path. Every guarantee lives here, so a second route cannot acquire them by copying half of the first. |
| `lib/writers-studio/assembleFocus.ts` | reads the Work **after** `may_cross`; ownership is part of the read, not a separable check. |
| `lib/writers-studio/writersStudioCognition.ts` | `getMaiaResponse`, room held constant, Focus carried as context beside the writer's ask. |

## Two definitions frozen before implementation

⭐ **The crossing is the HANDOFF, not the answer.** The receipt confirms because
cognition was handed the context, not because a response came back. A generation
failure after handoff leaves a truthful `crossed`; a route failure before handoff
never confirms.

> **The receipt is evidence of disclosure, not of successful inference. Response
> success is not disclosure evidence — handoff is.**

⭐⭐ **The client never supplies Work text**, and the route rejects a `focusText`
field outright. *If the client supplied the passage, the boundary would be
decorative* — the text would already have left the Work, and the receipt would
describe a crossing the client, not the boundary, controlled. The writer's
selection **range** travels in the request (it is their act) and is absent from
the receipt, where an offset would be a locator.

## Gates — C1–C6 · 21 falsifiers

| | | |
|---|---|---|
| C1 | boundary singularity — **exactly once** | 4 |
| C2 | no Work assembled before `may_cross` | 3 |
| C3 | confirm on handoff; never on an answer; never before | 3 |
| C4 | no scope substitution | 2 |
| C5 | canonical MAIA, no private brain | 3 |
| C6 | one receipt / one crossing / one carried id | 3 |
| — | the lane stays narrow | 3 |

⭐ **C1's hostile mutation** adds a second cognition call beside the constituted
path and asserts C1 goes **RED** — the architectural drift most likely to arrive
later. It also records what makes that drift dangerous: the second handoff
carried **no receipt at all**.

⭐ C1 also walks `lib/writers-studio` and `app/api/writers-studio` and fails if
any module other than the constituted path calls the cognition port or the
receipt store directly. *"At least once" is not the standard.*

⛔ The lane emits **only** `work` / `member_invoked` /
`writers_studio.focus->maia_cognition`, and a falsifier asserts no journal, Keep,
memory, decision, astrology, I Ching, tarot or ambient source is wired. Those
values remain closed in the substrate's CHECKs; each is a later source-class lane.

⚠️ **Instrument fault, found and fixed before reading the verdict:** the C4
fixture returned a junk `request_ref`, so the store correctly reported an
identity mismatch and C4 failed **for the wrong reason**. A fixture for
"an unresolved prior attempt" must describe the SAME disclosure, or it is testing
a different case. Same family as the §3a mutation test — *a test that fails for
the wrong reason is not evidence about the right one.*

**Gates:** `lib/disclosure` + `lib/writers-studio` **147 passed · 0 failed** ·
typecheck 228 vs baseline 239 · 0 regressions · `check:no-supabase` clean.

## ⛔ What is NOT proven

**No real Focus has crossed.** These are code gates. The seven-step human witness
is owed and unrun:

1. select a real passage · 2. ask MAIA · 3. receipt becomes `crossed` ·
4. the response unmistakably engages the passage · 5. forced pre-boundary failure
→ nothing crosses, correct §3a state · 6. forced post-handoff confirm failure →
*MAIA received the Focus*, never *nothing was sent* · 7. **Continue without
Focus** → an ordinary request only after that gesture.

Also unproven: that `getMaiaResponse` does anything with `meta.writerFocusContext`
— the room policy and producer registry exist, but **this lane did not verify that
the canonical turn actually admits the Focus as a producer.** Step 4 of the human
witness is the check that would catch it, and until it runs, *the Focus may be
crossing a boundary into a mind that is not yet reading it.*

**Standing: SUBSTRATE-A CLOSED · REQUEST-ORDER-01 REPAIRED · §3a CLOSED AS
CONTRACT · COGNITION-WIRING BUILT, CODE-GATED · REAL FOCUS CROSSING NOT PROVEN ·
`#1275` FROZEN.**
