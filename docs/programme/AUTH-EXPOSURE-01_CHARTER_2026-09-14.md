# AUTH-EXPOSURE-01 — Member / Practitioner Authorization Boundary

**Opened:** 2026-09-14 by founder ruling · **Class:** urgent bounded security investigation
**Subject SHA:** `1a555430` (merge of #1295; HEAD of `claude/nice-franklin-noe4gb` at opening)
**Flow:** B — independent of FLOW A (`PHASE-1-WHOLE-ORGANISM-CENSUS`, P1-03/04/05)
**First act:** census + exploitability trace only. No repair.

## 1 · The question

> Can one human actor read, alter, or acquire practitioner-level access to another member's
> data without an authenticated and authorized relationship?

## 2 · Why this is its own lane

The Phase-1 census produced enough to open a security lane and **not enough to close one**. The
findings that justified opening it are properties of *records about the organism*; exploitability
is a property of *paths*. Those are different objects, and conflating them is how a census turns
into a breach report or a breach turns into a footnote.

**This lane inherits no conclusion from P1-02.** It does not begin from "a security
vulnerability is confirmed." It earns each path, in evidence, by itself. Where the two lanes'
findings agree, the agreement is corroboration; where P1-02 said more than this lane can
establish, this lane says less.

## 3 · What the first act must establish, per path

| | Question |
|---|---|
| A | Can an **unauthenticated** caller reach it? |
| B | Can an **authenticated ordinary member** reach it? |
| C | Can **practitioner A name member B** and receive or alter B's data? |
| D | Is caller identity derived from: authenticated session · URL param · query param · request body · mixed/fallback? |
| E | Is the vulnerable-looking handler actually **reachable at the subject SHA**? |
| F | What exact member data crosses the boundary if it succeeds? |
| G | Can practitioner status be **created or elevated** without an authorized actor? |
| H | Does middleware **refuse**, or merely classify the route unmapped? |

## 4 · Classification vocabulary

```text
PROVED EXPOSURE        the whole chain is established in evidence
PROVED REFUSAL         the path refuses, and the refusing operation is named
WIRED-BUT-UNOBSERVED   the mechanism is present; its effect is not established
NOT REACHABLE          no caller can reach it at the subject
UNKNOWN                evidence cannot choose among the remaining explanations
```

**Altitude is declared with every classification.** A class earned from source at a named SHA is
a *static* classification; a class earned from a request that actually ran is a *runtime witness*.
The record never lets the first wear the second's name. A static PROVED EXPOSURE means *the code
at this SHA admits it*; it does not by itself mean *production admits it today*, and the record
names exactly which runtime fact would close that gap.

## 5 · Boundaries (founder)

```text
⛔ no access-model redesign
⛔ no consent architecture redesign
⛔ no role-system redesign
⛔ no schema change
⛔ no broad middleware rewrite
⛔ no real member-content inspection
⛔ no repair until the exposure is witnessed and bounded
```

Synthetic or test identities and metadata only. **No authorization defect in this lane requires
reading a real member's content to prove.** If proving something appears to require it, that is
evidence the instrument is wrong, not that the boundary should be crossed.

## 6 · Priority

Highest operational priority, ahead of architecture work. It does **not** block P1-03/04/05,
which are documentation and synthesis acts and cannot worsen the exposure.

```text
security lane   AUTH-EXPOSURE-01    🟠 URGENT
census lane     P1-03/04/05         🟢 record-only, may continue
```

## 7 · Escalation rule

If the first witness proves unauthorized cross-member reading, or unauthenticated practitioner
elevation, **against production**, that is a containment event and is handled as one — it does
not wait for P1-07.

Containment is a founder act. This lane may establish and report; it may not deploy, disable a
route, change a rule, or otherwise alter production by itself.

## 8 · Exit conditions for the first act

1. Every practitioner-facing path at the subject SHA carries a class and an altitude.
2. Every PROVED EXPOSURE names the operation that admits it and the data that crosses.
3. Every UNKNOWN names the instrument that would resolve it.
4. The runtime witnesses owed are named, bounded, and unspent.
5. Nothing is repaired.

---
_Lane record. Opened under founder ruling 2026-09-14. No source file was modified by this act._
