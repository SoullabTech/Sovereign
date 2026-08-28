# Arrival threshold — open findings register

**Opened:** 2026-08-28 · **Status:** live register. Each entry is unresolved by ruling, not by
neglect. ⛔ None of these may be "tidied up" by a future session: closing one requires the
evidence or the ruling named in it.

---

## ARRIVAL-RETURN-TONE-01 — unresolved design semantic

> **Should first arrival and return intentionally carry different ceremonial weight?**

**Observed.** The arrival remodel's typography reaches the email branch only:

| | `/signup` — email phase (`UnifiedAuth.tsx:616`) | `/signin` — password phase (`:539`) |
|---|---|---|
| heading | `Welcome.` — Spectral serif, with the period | `Welcome` — plain sans, no period |
| subtitle | `text-slate-300/95` — warmed by the remodel | `text-slate-300/80` — original |

The remodelled field, card and Holoflower reach **both** phases (`cardStyle` is on the outer
container); only the typography splits.

**Why it is held open.** There is plausible product logic in the asymmetry — initiation and return
need not carry identical ceremony:

```
new member  → "Welcome." · Spectral · warmer threshold
returning   → "Welcome"  · plainer, quicker re-entry
```

But nothing records that as an intention, so as it stands it is **accidental composition that
happens to be defensible**. Those are different things, and only one of them is design.

⛔ **Do not normalize the two phases to match.** Do not "fix the inconsistency". The question must
be answered first; whichever way it is answered, the contract then names it.

**Closes when:** the founder rules on whether return is a deliberately lighter ceremony, and the
Experience Contract records that ruling.

---

## ARRIVAL-BIOMETRIC-REFLOW-01 — suspected, needs live witness

> **Does a control appear after the arrival has finished resolving, and move the stack when it does?**

**Mechanism.** `bioAvailable` starts `false` and is set by an async availability check in an effect
after mount (`UnifiedAuth.tsx:236-253`). The Touch/Face ID button therefore cannot be in the first
painted frame; it is inserted when the WebAuthn call returns.

**Why this outranks the easing question.** Treatment D's gesture means *arrival resolving into
clarity*, completing at ~300–560 ms. If structure changes after that:

```
field settles
   ↓
interface appears complete
   ↓
new door materializes
   ↓
layout moves
```

then the motion has told the member the arrival was finished when it was not. That is a
falsehood at the threshold, and it contradicts the motion grammar far more seriously than whether
blur reaches zero at 300 ms or 560 ms. **The reflow witness therefore precedes any easing
decision.**

**Verdicts the harness can return:**

| Outcome | Reading | Next |
|---|---|---|
| **arrives late and shifts the stack** | **CONFIRMED** — the gesture claimed an arrival that then changed | do **not** tune easing |
| arrives late, no displacement | not reproduced — nothing the member had oriented to moved | curve may be judged on feel |
| present at first paint | collapsed — no late arrival to witness | curve may be judged on feel |
| **no biometric control ever appeared** | **NON-ADJUDICATING** — the finding was not exercised | ⛔ **not a pass**; re-run with a registered credential |

That fourth row is the one that will be misread. A run where the control never appears looks like
a clean result and is not one: it tested nothing. `capture-arrival.mjs` therefore reports it
separately, in the summary line and in `adjudication.txt`, rather than folding it into "not
reproduced". Both branches were verified by simulation on 2026-08-28 — a page serving the control
returns *collapsed*, the same page with it removed returns *NON-ADJUDICATING*.

**Acceptance condition, in full:**

```
LIVE APP  +  registered biometric credential  +  D-SIGNIN  +  phase × width × time witness
```

**Closes when:** `capture-arrival.mjs` is run against the live app on a device with a registered
biometric credential, and `reflow-report.json` returns an *adjudicating* verdict for `/signin` at
all four widths.

---

## ARRIVAL-AUTH-HIERARCHY-01 — held pending usage evidence

> **How much authentication complexity belongs visibly at the return threshold?**

**Superseded framing.** "Should five ways in exist at first contact?" was the wrong question and
is retired — five was the *returning maximum*, not first contact. Corrected picture:

```
/signup   first encounter · email phase first  · ~3 visible ways in
/signin   returning       · password phase first · 4-5 · biometric conditional
```

**Held because one column is missing:**

```
source / history    why the path exists          — have it (DOORS_AND_PHASES §3)
usage               who actually needs it        — MISSING
threshold design    how prominently it appears   — cannot be decided without the middle column
```

The source record already shows this cost being paid once: username + password was demoted to a
12px link, read as hidden to members who had set a password during induction, and had to be
promoted back on 2026-08-24. Demoting a door again without usage data would repeat that as
speculation about member behaviour.

**Closes when:** per-path usage is measured, and the founder rules on the return threshold's
visible complexity.

---

## Retired

**"Five doors at first contact"** — incorrect framing, retired 2026-08-28. I reported the maximum
case (returning member, known device, biometric registered) as though it were the surface every
member meets. A genuinely new member on `/signup` meets three, two of them third-party.
