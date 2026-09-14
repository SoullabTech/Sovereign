# JOP-04 · R0 — Record-only reconciliation of the canonical-identity design to D4

**Status:** ⭐ **SEALED.** Record-only. ⛔ **No product code changed. Handlers touched: 0.**
**Semantic subject:** `2d3a399043d7ef36984bd56b9de8448f79e9af29`
**Witness:** `scripts/jop04/r0-reconciliation-witness.mjs` — read-only · **9 passed · 0 failed**

---

## The collision R0 clears

At the semantic subject, **D4 and the canonical-identity design contradicted each other**, and the
design was the older law. D4 rules *omission belongs to the caller; default resolution belongs to the
host.* The design still said `{}` and `{ref:'HEAD'}` were *"two different requests · one ACT"*, still
listed that pair and `{}` vs `{max_results:200}` in its equivalence corpus as **SAME act identity**,
and still described *"canonicalize before dispatch and let the handler receive the canonical values"*
as incidentally repairing H1.

⛔ **That last one is the dangerous residue**: it is the **pre-D4 repair shape**. Left standing, the
first implementation-bearing artifact would have encoded the last surviving pre-D4 assumption into
the repair — folding the host's default into the caller's canonical terms, which is precisely what
D4 forbids.

```text
H1 OLD            caller omission + explicit host-default value  → SAME canonical act
H1 D4-RATIFIED    caller omission + explicit value               → DIFFERENT canonical invocation

                  caller omission  → caller_terms preserve ABSENCE
                                   → host resolves the effective value SEPARATELY
                                   → host_terms retain source=host_default
```

⭐ **This is a record consequence of D4, not a new semantic ruling.**

---

## What changed in the record — superseded in place, never erased

```text
§4 H1 core claim      "two different REQUESTS · one ACT"
                      → struck; replaced by DIFFERENT canonical invocations ·
                        SAME current effective execution ONLY, with the caller_terms /
                        host_terms split written out
                      ⭐ the HAZARD is unchanged and real — what changed is the REPAIR SHAPE:
                        the defect is an UNRECORDED HOST CONTRIBUTION, not two spellings
                        needing collapse. Collapsing them is now itself a defect (D3.2 · D3-F7).

§8 corpus row 1       git.rev_parse {} vs { ref:'HEAD' }        SAME act  → SUPERSEDED BY D4
§8 corpus row 2       repo.grep { max_results:200 } vs {}       SAME act  → SUPERSEDED BY D4 + D3.2
                      (200 is source=host_default in one and caller-authored in the other — D3-F7)

§7 versioning         "(folding defaults into canonical form)"  → struck, pointed to §4
§9 repair (a)         "canonicalize before dispatch and let the handler receive the canonical
                      values — which incidentally repairs H1"   → struck; ratified shape stated:

                          canonicalize ONLY what the caller supplied
                            +
                          resolve omissions into a SEPARATELY-AUTHORED execution plan

                      ⛔ plus the caveat: if an inner execution-operation representation later
                      treats the two effective operations alike, that representation MAY NOT be
                      the sole identity bound by authority — the exact invocation must still
                      preserve caller-versus-host authorship.

footer HAZARD H1      reclassified: unrecorded host contribution, not canonicalization collapse
```

⛔ **The §5 path-normalization question is untouched** by this correction and remains as written.

---

## Witness

⭐ **Section-scoped and membership-based, never a tree-wide zero grep.** Five prior
self-contamination incidents in this programme established why: an instrument that scans prose for a
token it must also name will find itself, and a global-zero assertion cannot survive its own
documentation. Every check asks *"does THIS PASSAGE say X"*, never *"does the tree contain no X"*. An
`activeClaim()` helper distinguishes a **struck or superseded** occurrence from a **live** one, so the
retained history cannot be mistaken for the claim returning.

```text
1  the ACTIVE H1 law says unrecorded host contribution, not caller default     3 checks
2  the two stale equivalence pairs are visibly superseded                      2 checks
3  the ACTIVE canonicalization language does not fold host defaults            3 checks
4  no product code changed since the semantic subject                          1 check
                                                                      9 passed · 0 failed
```

---

## Standing

```text
SEMANTIC LANE       ✅ CLOSED        D4 · D1 · D5 · D6 · D3 · D2 · F-C · F-D · F-E

R0                  ⭐ SEALED — the design record is now internally consistent with D4
R1 REPAIR SPEC      ⭐ AUTHORIZED — may begin without a further founder ruling
R1 WITNESS          ⭐ AUTHORIZED — pre-repair only

PRODUCT REPAIR      ⛔ NOT AUTHORIZED
RB-6B AUTHORITY     ⛔ NOT AUTHORIZED
check.run           ⛔ OUT OF SCOPE
```

**R1 custody, as pre-declared:** `SUBJECT = 2d3a39904 + this R0 reconciliation` ·
`INSTRUMENT = spec + predeclared witness, NO repair` · `REPAIR = future, instrument unchanged`. The
acceptance instrument runs first against the **unrepaired** subject — **known repair obligations
EXPECTED RED, protected invariants EXPECTED GREEN** — proving the judge can see the defects before it
is asked to certify their repair. ⛔ **The existing D1/D5/D6/D3/D2 evidence witnesses are NOT
rewritten into acceptance tests**: some correctly prove the defect and must cease matching after
repair. **History stays history.**
