# Phase 4 · review of `bodyAuthorization.ts` (`4be90954e`)

```text
MODE            REVIEW ONLY · ⛔ no surface constructed
SUBJECT         lib/writersStudio/bodyAuthorization.ts @ 4be90954e
MEASURED AGAINST the P1 protocol AS IT NOW EXISTS — six result kinds plus
                refusals, the ratified sixth state, and the actId contract the
                FOCUS-WITNESS-01 failure produced
CLASSIFICATION  ⭐ SPLIT  (with AMEND items inside the part that survives)
```

⛔ The helper was written **before** `DISCLOSURE_UNAVAILABLE` was ratified as a
sixth state and **before** `actId` existed as a UI contract. It is reviewed as a
candidate, not adopted because it survived a pause.

---

## 1 · Current responsibility

```text
viewFor(result)      protocol result → { kind, sections, act, facts, message }
nameSections(ids)    1 / 2 / N rendering
authorizeRequest()   builds the ACT 3 request body
DisclosureFact       NAMES the facts a rendering must carry, so a test can
                     require them of the copy instead of trusting the words
```

⭐ `DisclosureFact` is the part most worth keeping: it makes copy falsifiable.

---

## 2 · P1 states — handled, missed, wrong

```text
BODY_AUTHORITY_REQUIRED   ✅ handled
BODY_SCOPE_INCOMPLETE     ✅ handled
DISCLOSURE_UNAVAILABLE    ✅ handled · all three facts present
BODY_UNVERIFIABLE         ✅ handled · distinct from the above
ALREADY_CONSUMED          ✅ handled · completed vs incomplete distinguished

⛔ CONTINUED               WRONG NAME — the route emits `BODY_AUTHORIZED`.
                          The helper's success case can never match a real
                          response.
⛔ expired                 MISSING — the route returns `{ refusal: 'expired' }`
                          (410) for a lapsed pendingAskRef. No view exists.
⛔ unknown                 MISSING — `{ refusal: 'unknown' }` (404).
⛔ pending_ask_mismatch    MISSING — 409.
⛔ pending_ask_unavailable MISSING — 503 at ACT 2; the member is offered a
                          resume that cannot be created.
⛔ decline                 MISSING — a purely client-side act, so it has no
                          protocol result, but the surface still owes it a state.
```

⭐⭐ **A structural mismatch, not a list of gaps.** The helper models only
`{ result }` responses. **The route expresses several outcomes as `{ refusal }`
instead**, and those are exactly the continuity failures a member is most likely
to hit — an expired or unknown pending Ask. A copy mapper that cannot see
refusals will render nothing for them, and the surface will improvise.

---

## 3 · Does it collapse `DISCLOSURE_UNAVAILABLE` into `BODY_UNVERIFIABLE`?

**NO — and this is the strongest part of the helper.**

```text
DISCLOSURE_UNAVAILABLE  facts: authorization_happened · nothing_was_read
                               · new_act_required
BODY_UNVERIFIABLE       facts: permission_established · evidence_unverifiable
```

Distinct fact sets, distinct copy, no shared "try again". ✅ Passes review item 1.

---

## 4 · Scope vocabulary

✅ **No `passage` in any member-facing string.** The word appears three times, all
in prohibition prose.

⛔ **BUT THE HELPER RENDERS SECTION IDS AS THOUGH THEY WERE NAMES.** `sections`
arrives from the route as **UUIDs** — the route deliberately sends ids only — and
`nameSections()` interpolates them straight into the sentence:

> *"I need to read `7d49fa3d-45e3-43cc-921c-44032903bd1f` to answer that
> faithfully."*

⭐ That is not a copy bug; it is the **heading question arriving as an
implementation gap**. Headings were ruled lawful to *show* the member for
recognition. The route does not send them, and the helper assumes it does.
⛔ Not resolved here: whether the surface fetches headings separately, or the
route's ACT 2 payload gains a member-recognisable label, is a design decision.

---

## 5 · Authorization as an ACT — the SPLIT

⛔ The helper has **no act identity, no in-flight state, no retry discipline**.
`authorizeRequest()` builds a body and returns it; nothing owns the gesture.

⛔ **Do not stuff act identity into a copy mapper because the requirement
arrived.** Proposed ownership:

```text
bodyAuthorization.ts        KEEP · pure protocol → copy · plus DisclosureFact
                            ⛔ never mints, never holds, never retries

<interaction owner>         NEW · holds the human act
  pendingAskRef             server-issued, held for this paused Ask
  selectedSectionIds        the member's choice
  actId                     ⭐ minted ONCE per physical press
  inFlight / attempt state  so a retry is a retry, not a new act
  lastResult                the protocol result driving the view
```

**The law it must implement:**

```text
physical press              → mint actId ONCE
transport retry             → SAME actId
double-click while active   → ⛔ no second actId
DISCLOSURE_UNAVAILABLE      → that act is SPENT
member presses again        → NEW actId
```

⛔ **`actId` is act identity, never authority.**

---

## 6 · ⭐⭐ A FINDING THE REVIEW SURFACED — ACT 3 HAS NO ACT IDENTITY

The `actId` contract is **ratified on the Focus route** (`isUsableActId`, F1k).
The developmental Ask's ACT 3 does **not** have it: `parseAuthorizeAct` accepts
`act`, `pendingAskRef`, `authorizes` and nothing else.

Consequence today:

```text
member presses Authorize
  → ACT 3 sent · server claims the pendingAskRef · crossing completes
  → HTTP response lost
  → client retries the SAME press
  → server: ALREADY_CONSUMED
```

⭐ **That is safe** — single-consumption is the anti-replay control and it holds.
⚠️ **But it is not truthful about the act.** The member's one press is reported
back as though they had tried to reuse a spent authorization. F1k's own reasoning
applies verbatim: *only the surface that watched the writer press the button knows
whether this is that press again or a new one.*

⛔ **NOT DECIDED HERE.** Whether ACT 3 should carry `actId` — so a lost-response
retry is recognised as the same act rather than reported as consumed — is a
protocol question, and the last one of these produced a ratified state. It is put
to the founder rather than built.

---

## 7 · React state classification (proposed, not built)

```text
render-derived      the view returned by viewFor(result) · recomputed freely
interaction-lived   actId · selectedSectionIds · pendingAskRef · inFlight
                    ⭐ actId belongs HERE — a rerender must never mint one
request-lived       the in-flight promise / abort handle
server-derived      required sections · whether body is required · whether the
                    disclosure is lawful
                    ⛔ THE CLIENT IS NEVER AUTHORITATIVE FOR THESE — the server
                      re-derives them at ACT 3 regardless of what was sent
```

---

## 8 · Retry copy

The helper's `act` field already distinguishes `authorize` /
`authorize_remaining` / `reauthorize`, ⭐ which is the right axis: `reauthorize`
means a **new member act**, not a transport retry.

⛔ What is missing is the transport case. There is no `act: 'retry_same'`, so the
surface has no vocabulary for *"the network failed before the server's outcome was
known — send the same act again."* Without it, a surface will reach for the word
"Try again" in both places, and those are now different things.

---

## Classification

```text
⭐ SPLIT
   keep bodyAuthorization.ts as a PURE protocol → copy module
   introduce a separate interaction owner for the human act

   AMEND, inside the part that survives:
     CONTINUED → BODY_AUTHORIZED
     add refusal-bearing outcomes: expired · unknown · pending_ask_mismatch
                                   · pending_ask_unavailable
     add a decline view
     add act: 'retry_same' for the transport case
     stop assuming `sections` are member-readable names
```

---

## Standing

```text
REVIEW                    COMPLETE
CLASSIFICATION            SPLIT + AMEND
SURFACE CONSTRUCTION      ⛔ NOT STARTED — waiting on this review's ruling

OPEN FOR RULING           §6 does ACT 3 gain actId?
                          §4 how does the member see WHICH section?

4be90954e                 preserved · not adopted
#1283                     OPEN · Class C · records only
Focus runtime             held · MERGE and DEPLOY not authorized
PRODUCTION MIGRATION      NOT AUTHORIZED
PRODUCTION                untouched
```
