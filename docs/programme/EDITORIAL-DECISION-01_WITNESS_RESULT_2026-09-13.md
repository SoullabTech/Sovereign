# EDITORIAL-DECISION-01 — the real specimen, witnessed

**Subject** `fb89484ff` · founder's machine · `maia_focus_witness` · 2026-09-13
**Work** *Elemental Alchemy (KDP print)* · reading `3f692e22` · draft `48ccfc89` **v34**

```text
D1   chain a89128f9-310d-4566-833c-f2bd02ebdd0d   event_index 0
```

> **Keep the campfire recurrence. Each return must advance rather than merely repeat.**
>
> *Intent* — the lived campfire experience remains phenomenological first.
> *Principle* — lived scene → interpretation → presence → sustaining → embers.

---

## Every acceptance item, measured

```text
new chain · event_index 0                                    ok
governs exactly {o1}                                         ok
⛔ o4 ABSENT — that edge was never authored                   ok
authorship  member_confirmed_maia_proposal                   ok
ruled against working draft v34                              ok

⭐⭐ standing rows  0 → 0                                     ok   THE COUPLING LAW
manuscript still at version 34                               ok
⛔ manuscript text byte-identical (md5 before vs after)       ok

current lookup returns D1                                    ok
history holds exactly one event                              ok
scope reads back as o1 only                                  ok
⭐ UNKNOWN ≠ UNSET                                            ok
an unavailable lookup withholds the act                      ok

⭐ UPDATE the event          refused · 23001 · real trigger   ok
⭐ DELETE a governs row      refused · 23001 · real trigger   ok
⭐ DELETE the event          refused · 23001 · real trigger   ok
decisions 0 → 1                                              ok
```

⭐ **The coupling law is now a reading, not a claim.** `standings 0 → 0` was
measured across the act. Recording what the writer decided about the Work wrote
nothing about their disposition toward the observation.

⭐ **D3 is vindicated in production, not in a fixture.** `DELETE a governs row
is refused` is the check that exists because the design originally protected
only the parent table. Without the founder's amendment this witness would have
shown scope being silently deletable, and the scope-on-event ruling would have
been a comment rather than a guarantee.

## The act was recorded through the seam, not by hand

⛔ No INSERT was written. `recordEditorialDecision(memberId, workId, …)` did it,
so the witness attests the **authority** that governs writing, not merely that
the table exists.

## ⚠️ One instrument note, not applied

The three refusals each print a full `pg` stack trace, because `transaction()`
logs on its rollback path. Correct, but noisy enough that a genuine failure
could hide inside it. **Not changed here** — the instrument that produced this
record stays as it ran. Silence `console.error` around the probes next time.

## Standing

```text
EDITORIAL-DECISION-01     IMPLEMENTED · REAL SPECIMEN WITNESSED · CLOSED

migration                 applied to maia_focus_witness ONLY
production                untouched · migration NOT applied there
manuscript                v34 · byte-identical
standings                 0 · none written
decision→decision edge    KNOWN MISSING · not supersession · held until earned

HELD                      RevisionProposal · staged diff · manuscript mutation
                          · write authority
```

⭐ Next: `EDITORIAL-WRITE-01`, specimen o26 / `WITNESS-ALPHA` — **the first point
at which anything in this programme changes the Work.**
