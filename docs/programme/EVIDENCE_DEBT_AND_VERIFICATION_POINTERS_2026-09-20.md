# Two Operating Practices — Evidence Debt · Verification Pointers

**Status**: Proposal. **Not canon. Not adopted.** Adoption touches `CLAUDE.md` and the JARVIS manual and is a founder act.
**Date**: 2026-09-20
**Origin**: `docs/research/EXTERNAL_SUBSTRATE_SURVEY_2026-09-20.md` and `docs/architecture/MEMORY_LEGIBILITY_DIRECTION_2026-09-20.md`. Both practices answer defects observed while doing that work, not defects reasoned about in advance.
**Altitude**: two mechanics, one line each in practice. Deliberately small.

---

## Practice 1 — Falsifier Owed

### The defect

Lane discipline authorizes building a mechanism, then correctly refuses to authorize the member-facing
surface, because the surface needs a ruling the lane does not hold. **This is the governance working.** Its
residue is code that is correct, committed, and **never exercised**.

Observed 2026-09-20 by corpus search — three objects with no caller found anywhere outside their own
definition or barrel export:

| Object | Search result |
| --- | --- |
| `components/memory/PreferenceConfirmation.tsx` | exported via `components/memory/index.ts`; no page or route imports it |
| `lib/memory/confidenceDecay.ts` → `shouldPromptForConfirmation()` | only occurrence in the repository is its own definition |
| `app/api/memory/stale-preferences/route.ts` | exists, authenticated; no caller found |

⚠️ *"No caller found by search"* is not *"never executed."* An HTTP route may be reached by tooling a search
cannot see. The claim is bounded to what the search establishes.

By our own S3 law, **a built-but-unreached object is where wrong assumptions survive**. When a ruling finally
opens the surface, several never-exercised objects are integrated at once — the condition the lane discipline
exists to prevent, reached by the lane discipline's own success.

### The mechanic

When a lane closes having built an object it was not authorized to wire, its closure record carries one line:

```
FALSIFIER OWED — <object path>
  proposition: <the claim that would be tested if the object were exercised>
  instrument:  <the class of witness that would test it>
```

Appended to a single registry, `docs/programme/FALSIFIERS_OWED.md`, one row per object. **Discharged when the
object is exercised by a witness — not when it is wired.** Wiring and witnessing are different events, and
collapsing them is the error this practice exists to prevent.

### Why this is not a TODO list

A TODO says *connect this*. A falsifier owed says *this object's central proposition has never been tested,
and here is the test*. The first is wiring-debt; the second is **evidence-debt**. The S3 lane already ratified
the underlying law in its Class B ordering — **lethality is a precondition of implementation, not a hope about
it.** This applies the same ordering to objects built ahead of their surface.

### Cost and bounds

One line per closure. **⛔ Does not authorize wiring. ⛔ Does not open a lane. ⛔ Does not require the
falsifier be written — only named.** A named falsifier that is never written still converts an invisible debt
into a visible one.

---

## Practice 2 — Verification Pointer

### The defect

An anchor bullet asserting runtime state is accurate when written and silently ages. A session that reasons
*from the anchor* rather than *from the repository* reproduces a stale claim confidently.

**Observed in this session.** The survey asserted *"the open Cut-1 traceability non-conformance."* True when
the anchor bullet was written; false since `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01` closed on 2026-09-16. One
grep corrected it. The stale claim had already been written into a committed document first.

Same defect class as two findings already on the record:

- **2026-07-31** — *"design decisions had been made from remembered impressions carrying the authority of
  research."*
- **2026-09-07** — *"the I0.5 record says the opposite of what is now true."*

The standing rule exists — *do not assume remembered research exists; verify before building from it.* It
lives in a research document. **It is not where sessions start.**

### The mechanic

Any anchor bullet asserting **current** runtime or repository state carries a bracketed pointer to the
cheapest artifact that re-establishes it:

```
… Cut-1 decay exclusions are durably traced per turn
  [verify: lib/memory/cut1Trace.ts · MemoryBundle.ts recordCut1Trace call site]
```

The pointer is **not proof**. It is a re-verification address.

### The load-bearing rule

> **Absence of a pointer means the claim is historical, not current.** A bullet without a pointer may not be
> cited as present state.

This makes the default safe and requires **no rewriting of existing bullets** — most of them *are* historical,
and the default classifies them correctly. New pointers are added going forward; the record is not edited to
read as though it had always carried them.

### Pointers name operations, never bare line numbers

Direct application of the ratified **D1** discipline: cite the operation, not the line. A pointer reading
`MemoryBundle.ts:270` becomes a lie the moment an unrelated edit lands above it. A pointer reading
`MemoryBundle.ts · recordCut1Trace call site` survives. Files and symbols; never a bare line number.

### Cost and bounds

Seconds at write time. **⛔ Does not make a claim true — makes it checkable.** ⛔ Does not authorize a session
to change a bullet it verified as stale; a stale bullet is **marked superseded in place**, never edited to
read as though it had always said otherwise.

---

## What adoption would require

| Practice | Touches | Act |
| --- | --- | --- |
| Falsifier Owed | JARVIS manual (closure requirements) · new registry file | Founder act; the manual governs closure discipline |
| Verification Pointer | `CLAUDE.md` priority-thread convention | Founder act |

Both are reversible and neither changes any runtime, schema, or gate. Either may be adopted without the
other.

**Neither is adopted by this document.** Nothing here was executed, wired, or deployed. Production untouched.
