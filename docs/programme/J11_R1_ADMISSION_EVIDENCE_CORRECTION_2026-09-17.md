# J11-R1 — ADMISSION EVIDENCE CORRECTION

**Status:** ✅ DOCUMENTARY CORRECTION · J11 FIRST-FALSIFICATION RESULT PRESERVED
**Corrects:** `docs/programme/J11_GRANT_EFFECT_BOUNDARY_FALSIFICATION_2026-09-17.md` §5
**J11 original:** `c6028851e3cd28693473d489cc67aa1050bba0b8`
**Evidence anchor:** `59043c3e0640b6c372e9c65feaf2027c825412d1`
**Class:** documentary only · ⛔ NOT A BUILD · ⛔ NOT A REPAIR

This record corrects one factual overstatement discovered during the ancestry/canonical-transfer reconciliation. It does not alter J11's candidate invariant, reopen implementation, or modify the admission mechanism.

---

## 1. The incorrect sentence

J11 §5 states that `decideAdmission(...)`:

> denies identity, path, domain, entity-type, and applicable page-range mismatches

That sentence is **withdrawn**.

`lib/corpus/admission.ts` at the exact J10/J11 evidence anchor does not implement `domain`, `entity-type`, or page-range predicates.

The error appears to have imported a more general governed-admission shape into the description of this specific function. The Representation Authority Law applies to this correction too: a generalized pattern may not acquire authority over the concrete implementation being described.

---

## 2. Exact admission contract at the evidence anchor

At `59043c3e`, `decideAdmission(...)` evaluates corpus candidates through these actual gates:

1. **Declaration membership** — no matching rule means `EXCLUDED`.
2. **Admitting classification** — `unclassified_legacy` and `operational_human_record` do not permit corpus membership.
3. **Structured authority basis** — an admitting classification without a structured authority basis is `EXCLUDED`.
4. **Authority/class compatibility** — the authority kind must be permitted for the declared classification.
5. **Rights-holder authorization shape** — `rights_holder_authorized` requires a named rights holder, a governed-record evidence source, and an exact 64-hex subject SHA-256.
6. **Candidate custody** — symbolic-link candidates are excluded; unreadable candidates are excluded.
7. **Exact subject binding** — where rights-holder authorization supplies a subject digest, the candidate bytes must hash to that exact SHA-256.
8. **Governed evidence custody** — governed authority evidence must remain inside `docs/corpus-authority`, must not be a symlink, must be readable, and must contain the declared evidence marker.
9. **Rights-holder evidence binding** — the governed record must name the declared rights holder and bind the authorized subject SHA-256.
10. **Human-record defence in depth** — a declared candidate carrying a configured human-record signal is `REFUSED`.
11. **Admission** — only after all applicable checks pass is the candidate added to `admitted`.

The declaration is therefore fail-closed, but along the dimensions the implementation actually governs.

---

## 3. Corrected J11 §5 reading

Read the affected J11 passage as:

> `decideAdmission(...)` excludes a candidate when no declaration rule applies; when the declared classification does not permit corpus membership; when the required structured authority basis is absent, incompatible, or insufficiently evidenced; when governed subject/evidence custody checks fail; and refuses declared material carrying a configured human-record signal. Only after all applicable declared authority checks pass is the candidate admitted.

All other J11 §5 language remains unchanged unless contradicted by this correction.

---

## 4. Does this falsify the healthy control?

**No.**

J11's falsification used admission for one bounded proposition:

> storage/location membership alone does not authorize corpus participation.

That proposition remains directly supported by the implementation:

```text
no declaration                      → EXCLUDED
non-admitting classification        → EXCLUDED
missing/invalid authority basis     → EXCLUDED
failed exact governed checks        → EXCLUDED
human-record signal after declare   → REFUSED
applicable checks pass              → ADMITTED
```

The incorrect extra predicate names were not necessary to that conclusion.

Therefore:

```text
J11 candidate invariant             ✅ SURVIVES
admission healthy-control result    ✅ SURVIVES
J11 §5 predicate description        ⛔ ORIGINAL SENTENCE WITHDRAWN
corrected description               ✅ THIS RECORD
implementation                      ⛔ UNCHANGED
```

---

## 5. Canonical-transfer consequence

`c6028851` must not be transferred or cited as though the withdrawn sentence remains authoritative on its own.

For documentary custody, J11 is now read as the pair:

```text
c6028851  J11 first falsification
    +
J11-R1    this correction
```

A later clean canonical transfer may preserve the original J11 blob **only if this R1 correction crosses with it** and the transfer record makes the supersession explicit.

No raw ancestry becomes eligible merely because the correction exists.

---

## Standing

```text
J11 first-falsification result      ✅ PRESERVED
one constitutional invariant
+ domain-specific enforcement       ✅ PRESERVED AS BOUNDED CANDIDATE
universality                        ⛔ NOT ESTABLISHED
J11 §5 inaccurate predicate list    ⛔ WITHDRAWN
admission implementation            ⛔ UNMODIFIED
repair / runtime / production       ⛔ UNOPENED
canonical transfer                  eligible for reconstruction as bounded documentary set,
                                    subject to current-head freshness gate
```
