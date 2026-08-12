# CRP-001 — SCHEMA FREEZE RECORD

**Frozen object:** `CRP-001-UNIT-RETURN-SCHEMA-v1.md`
**Status:** FROZEN AS CANDIDATE HOUSE SCHEMA
**Freeze date:** 2026-08-12
**Ordered by:** Founder (process-closure step 1)

---

## 1. Frozen artifact

```text
path:    /Users/soullab/CRP-001-UNIT-RETURN-SCHEMA-v1.md
sha256:  fac499a66964a30b023caea3e91eb985254ffd83b46ec0f788a3d4d56d9e3aee
bytes:   13681
```

Any unit return claiming conformance to `CRP-001-UNIT-RETURN-SCHEMA-v1` is
claiming conformance to **this hash**. A return citing v1 against a different
hash is citing an object that does not exist under that name.

## 2. What freeze means here

- The schema may not be edited in place. A change produces `-v2` with its own
  freeze record, and units state which version they returned against.
- Freeze is not authorization. CRP-001 remains AUTHORED / NOT AUTHORIZED, and
  no MAIA repair unit is open.
- Freeze is not enforcement. See §4.

## 3. Content frozen at this hash

v1 as frozen includes, beyond the founder's original schema:

- §2.1 non-establishment list expressed as **crossings**, not stages;
- §2.3 adjacency rule + *investigation order may vary, proof adjacency may not*;
- §2.4 nine-state canonical vocabulary, `FINAL PROMPT` rejected as malformed,
  candidate-bound participation defined for FINAL MODEL REQUEST;
- §2.5 founder-ruled house form;
- **§2.6 `evidence window`** — added 2026-08-12 immediately before freeze,
  with per-crossing minimum windows. See §5 below: this was added by the
  assistant, not the founder, and is the one part of v1 not founder-ruled.
- §3 classification ↔ disposition mapping;
- §6 enforcement, still OPEN.

## 4. The freeze location is volatile — RESOLVED 2026-08-12

> **Resolved by Step 3.** This schema now lives at
> `docs/architecture/governance/crp-001/CRP-001-UNIT-RETURN-SCHEMA-v1.md` in
> `github.com/SoullabTech/Sovereign`, commit `6ac3230611b2eadeac6688f368a39769ed78834c`,
> blob `ab2ae3a7879a7df8ccbdcea67c31682990880bbb`, based on
> `origin/clean-main-no-secrets` @ `969841012d7e1353ff73e570f00f53c0f7792a2b`.
> The sha256 below is unchanged and now has a canonical ref behind it.
> The `/Users/soullab` copy is a **stale mirror**, not the schema.
>
> The original finding is preserved below as authored, because the reasoning
> is what generalizes — it applies to the next governance object too.

### 4.0 Original finding (as authored, pre-resolution)

`/Users/soullab` **is not a git repository** (`git rev-parse` returns
*not a git repository*, confirmed 2026-08-12).

Consequences, stated plainly rather than assumed away:

- This hash is bound to a path on one machine's filesystem, not to a
  canonical remote ref + SHA.
- Nothing prevents in-place edit of the frozen file. The hash detects it after
  the fact; it does not prevent it.
- CRP-001 §3 requires every unit to bind *canonical ref + SHA*. A schema that
  itself has no canonical ref cannot satisfy the binding discipline it
  imposes on the units that cite it.

This repeats the defect already recorded against the MIR-001 instrument
freeze: hashes recorded, location volatile, prospectivity asserted rather than
proven.

**Unruled:** where the frozen governance objects live such that they have a
canonical ref. Until that is settled, this record is *evidence of intent to
freeze*, not a freeze that can be independently verified by a later reader on
another machine.

## 5. Authorship flag — §2.6 is not founder-ruled

Every other element of v1 was either authored by the founder or explicitly
ruled by the founder on 2026-08-12.

`§2.6 evidence window` was added by the assistant, unprompted, because the
founder's own step-5 conformance test — *"claim of experienced continuity from
one exchange → should be rejected mechanically"* — was not mechanically
enforceable against v1 as it then stood. No field carried the observation
window, so nothing could distinguish a one-exchange claim from a
twenty-session one.

The per-crossing minimums in §2.6's table, in particular the terminal
crossing's **≥2 sessions / ≥1 leave-return boundary / >1 subject**, are an
assistant judgment about what "longitudinal" requires. They are the most
arguable numbers in the schema and are flagged here rather than buried.

If the founder rejects or revises §2.6, v1 is superseded by v2 and this freeze
record is void.

### 5.1 Founder ruling on §2.6 — 2026-08-12

- **Principle: ACCEPTED.** Evidence-window requirements must be mechanical and
  crossing-specific. This stands as house law.
- **Numeric minima: PROVISIONAL.** The `≥2 sessions / ≥1 leave-return
  boundary / >1 subject` thresholds for the terminal crossing, and the
  single-exchange minima for the other seven crossings, are **not ratified**.
  They are in force as working defaults only, and a unit relying on them
  must state that its admissibility rests on a provisional threshold.

**Handling note — first application of our own freeze rule.** This ruling was
recorded here rather than edited into the frozen file. Annotating the frozen
object in place is precisely the edit §2 forbids, and issuing v2 for a status
change would churn the version line. Consequence, stated because it is a
fragility and not a tidy outcome: **v1's normative status is now split across
two files.** Any reader of `CRP-001-UNIT-RETURN-SCHEMA-v1.md` must read this
record alongside it, or they will read provisional thresholds as ratified.

When the founder rules the minima, that produces **v2** with the ruling folded
into §2.6 inline, and this split closes.

---

## LOG

- **2026-08-12** — Freeze recorded at the hash above. Volatility of the freeze
  location noted as unresolved (§4). §2.6 authorship flagged (§5).
