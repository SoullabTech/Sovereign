# Editorial Disclosure — Repair Specification

**2026-09-21** · founder ruling · **SPECIFICATION ONLY, NO CODE WRITTEN**
**Standing** ⭐ REQUIREMENT RULED · ⛔ TWO VOCABULARY VALUES OWED ·
⛔ IMPLEMENTATION NOT AUTHORIZED · ⛔ W1 HELD

---

## The ruling

> **External editorial processing requires authorization before dispatch, AND a
> durable record identifying the destination and the disclosed context.**
> `TurnPosture` remains an additional safeguard. ⭐ **A receipt cannot substitute
> for permission.**

Three things stay distinct, and the implementation must not merge them:

| | |
|---|---|
| **authorization** | the writer permitted this crossing — ⛔ the receipt does not supply it |
| **attempted dispatch** | a request was about to leave, or did |
| **observed outcome** | what came back, if anything |

⛔ **An attempt recorded is never a claim of delivery.**

## ⭐ The substrate already models this. Nothing new is needed for it.

`context_disclosure_receipts` carries `state IN ('attempted','crossed')`, and
its own documentation states the semantics this ruling requires:

> `state=attempted` means **A CROSSING MAY HAVE OCCURRED AND WAS NOT CONFIRMED**
> — never that nothing crossed.

and, in `contextDisclosureReceipt.ts`:

> ⛔ Does NOT authorize a crossing. An `attempted` receipt is ambiguous by
> design … a `crossed` one certainly represents an earlier crossing.

⭐⭐ **That is precisely the timeout case.** A request that may have left and
whose response was lost is `attempted` — neither "sent" nor "not sent," and the
vocabulary already refuses to round it to either. ⛔ No new state is required,
and adding one would weaken an instrument that already tells the truth.

## Discipline of the wiring

1. **Authorize first.** ⛔ Absent authorization, no dispatch — and no receipt,
   because there was no crossing to record.
2. **Mint `attempted` BEFORE the request leaves the process.** ⛔ Minting after
   return cannot record a crossing whose response never came back.
3. **Confirm to `crossed` only on a confirmed provider outcome.** ⛔ Never on
   dispatch, never on absence of error.
4. **A failure between 2 and 3 leaves the receipt `attempted`, permanently and
   truthfully.** ⛔ It is not deleted, not downgraded, not rewritten to say
   nothing happened.
5. ⛔⛔ **No manuscript prose in the receipt.** Not text, excerpt, summary,
   digest, offset, length or geometry — the table's constitution already forbids
   all of it, and this path must not become the exception.

## ⛔ OWED BEFORE IMPLEMENTATION — two founder rulings

Neither is chosen here, on the precedent `20260913000002` set: *"adding a
gesture value here would be exactly the accompanying vocabulary redesign this
change was separated in order to avoid."*

**1 · A boundary value.** Current CHECK admits two, and the editorial turn is
neither:

| value | path |
|---|---|
| `writers_studio.focus->maia_cognition` | the Focus crossing |
| `writers_studio.developmental_ask->maia_cognition` | the developmental Ask (S3) |

⛔ Reusing either would falsify provenance — the same reasoning `20260913000002`
gives for refusing to reuse the Focus value. ⭐ A convenient nearby boundary is
not evidence it is the same boundary.

**2 · A gesture value.** Current CHECK admits `ask_maia`, `work_with_this`,
`widen_focus`, `authorize_sections`. The editorial act is *the writer asking
MAIA to work on this passage at a declared latitude.* ⚠️ `work_with_this` may
fit — ⛔ but "may fit" is how vocabulary drifts, and this is a ruling, not an
inference.

## Sequencing

1. Founder rules the two values
2. Migration adds them — ⛔ nothing else, no accompanying redesign
3. Wire the five-point discipline into the editorial turn path
4. Falsifiers: no authorization → no dispatch · dispatch → `attempted` exists
   before the request leaves · confirmed outcome → `crossed` · induced timeout →
   stays `attempted` · ⛔ no prose in any receipt column
5. **Re-run the witness against the updated version**, per the founder ruling
6. Only then does W1 resume

## Held

⛔ **W1 stays held.** ⛔ Diagnosis of `structured_refused` continues on
**synthetic text only** — ⛔ no manuscript passage leaves the machine until this
lands. ⛔ Editing protections — scope, voice, sequence, latitude — are untouched
by this repair and must remain so.
