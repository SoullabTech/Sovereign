# FOUNDER RULING — SG-D5 — AUTHORITATIVE INTEGRATION TRUNK

> This artifact exists to make an already-issued founder ruling durably citeable.
> It records a decision that was made elsewhere; it does not make one.

---

## IDENTITY

| Field | Value |
|---|---|
| **RULING ID** | `SG-D5` |
| **SERIES** | JARVIS System Graph founder decisions (`SG-D1`…`SG-D5`) |
| **ISSUER** | Founder |
| **DATE ISSUED** | 2026-08-10 |
| **DATE PUBLISHED** | 2026-08-10 |
| **SUBJECT** | Which git ref constitutes authoritative integration trunk for System Graph canonicality |
| **STATUS** | Issued by founder; published durably by this artifact |

**On the identifier.** The founder issued this decision as `D5`, continuing the `D1`–`D4`
series raised in the JARVIS System Graph WU-001 audit. The bare identifier `D5` is
**already in use** in this repository for an unrelated decision — `Decision ID | D5`,
"Theme scope", in `docs/governance/FOUNDER_DECISION_DOCKET_2026-07-29.md`. To keep future
graph citation unambiguous, this ruling is recorded as **`SG-D5`**, namespaced to the
System Graph decision series. The founder's authorization for this publication explicitly
permitted "`D5` or repository-consistent stable identifier". No change to the ruling's
substance is implied by the namespacing.

---

## THE RULING

The following is the founder's decision as issued. It is reproduced verbatim.

> **D5 — AUTHORITATIVE INTEGRATION TRUNK**
>
> For JARVIS System Graph canonicality, the authoritative integration trunk is
> `refs/remotes/origin/clean-main-no-secrets`.
>
> `refs/heads/clean-main-no-secrets` is a local branch and does not acquire canonical
> standing merely by sharing the branch name.
>
> `main` is not the current authoritative integration trunk.
>
> Trunk reachability claims must identify the exact ref and observation point used.
>
> A remote-tracking ref represents the last locally observed state of the published trunk;
> currentness beyond that observation must not be inferred without fresher evidence.
>
> This ruling defines canonicality for System Graph purposes. It does not authorize
> merging, rebasing, fetching, resetting, deleting, or otherwise reconciling any local
> lineage.

### Ref classes

```
CANONICAL PUBLISHED TRUNK
refs/remotes/origin/clean-main-no-secrets
        │  current published repository standing
        ▼

LOCAL TRACKING / WORKING REF
refs/heads/clean-main-no-secrets
        │  may be ahead, behind, stale, or divergent
        ▼  not canonical merely by name

LOCAL main
        ▼  historical/divergent unless separately restored to authority
```

---

## AUTHORITY SCOPE

**DOES AUTHORIZE**

- Computing trunk-reachability and canonicality, for System Graph purposes, against
  `refs/remotes/origin/clean-main-no-secrets`.
- Citing this artifact as the governing ruling for that computation.

**DOES NOT AUTHORIZE**

- Merging, rebasing, fetching, resetting, deleting, or otherwise reconciling any local
  lineage — stated expressly in the ruling itself.
- SG-01, SG-02, or any System Graph implementation unit.
- Completion of `SG-D1` (durable identity for founder rulings generally). This artifact
  gives **one** ruling a stable ID; it does not establish the general scheme.
- Any repair of Builder state, or of the ungoverned-lane condition.
- Any production change.

Publication ≠ execution. A durable ruling is not implementation authority.

---

## RATIONALE — founder's stated reasoning, not itself ruling

Recorded as the reasoning the founder gave. It carries no independent authority.

The branch **identity** was established by two sources — `origin/HEAD` points to
`origin/clean-main-no-secrets`, and repository `CLAUDE.md` names `clean-main-no-secrets`
as the main branch — but canonicality could not safely be attached to whichever local ref
happened to carry that spelling, because the local and remote refs of that name were found
to be materially different. For System Graph purposes "canonical" answers: *what published
repository lineage currently represents the integration authority?* That is the
remote-tracking integration ref.

---

## OBSERVED CONSEQUENCES — measurements, not rulings

These are observations at a stated observation point. They are **not** additional rulings
and must not be cited as such. They will go stale.

```
OBSERVATION POINT:  2026-08-10
FETCH STATE:        refs/remotes/origin/clean-main-no-secrets = d2db55d7b
                    (last locally observed; no fetch performed by this unit)
```

| Ref | State relative to `feature/labtools-redesign` @ `25db0eec9` |
|---|---|
| `refs/remotes/origin/clean-main-no-secrets` @ `d2db55d7b` | 41 ahead / 408 behind — **HEAD NOT reachable → off-trunk** |
| `refs/heads/clean-main-no-secrets` | 23 ahead / 0 behind |
| `refs/heads/main` @ `a8020fa3e` | 2001 ahead / 506 behind |

Consequences following from the ruling as applied to the above:

- `25db0eec9` is **off-trunk** under SG-D5. The WU-001 System Graph audit and the SG-001
  cold execution both read substrate at that commit; that material is therefore off-trunk
  as of this observation point.
- The divergence between the local and remote refs sharing the name
  `clean-main-no-secrets` is the specific ambiguity SG-D5 resolves.
- Any future System Graph trunk-reachability claim must carry both the exact ref and its
  observation point, per the ruling.

---

## OPEN QUESTIONS — explicitly unresolved

- **`SG-D1`** — do founder rulings receive durable identity as a general scheme? Raised in
  WU-001; **not resolved here**. This artifact is a single instance, not the scheme.
- **`SG-D2`** — may the System Field ever render member relational data? Unresolved.
- **`SG-D3`** — is `$AIN_HOME` an acceptable authoritative live source for display?
  Unresolved.
- **`SG-D4`** — are elemental lenses first-class? Unresolved.
- Freshness of `origin/clean-main-no-secrets` beyond the observation point above. The
  ruling forbids inferring currentness without fresher evidence.

---

## PROVENANCE AND STANDING

| Field | Value |
|---|---|
| Source of the ruling | Founder, in session, 2026-08-10 |
| Recovered from | Founder's verbatim ruling text as issued in that session |
| Published by | Builder claim `s-1efc0487`, unit `sg-d5-trunk-ruling-publication` |
| Published onto | `chore/sg-d5-trunk-ruling`, branched from `origin/clean-main-no-secrets` @ `d2db55d7b` |
| Wording | Reproduced verbatim; no wording reconstructed |

**Standing of this artifact at the moment of writing:** committed to a branch descending
from the authoritative trunk, and therefore durable and citeable by commit SHA. It is
**not yet merged or pushed**, and is therefore **not yet trunk-reachable** under the very
ruling it records. `preserved ≠ published`; `published ≠ canonical`. Promotion to trunk is
a separate governed act that this artifact does not perform and does not authorize.

Once published, **this artifact is the citeable ruling.** The originating conversation is
not canonical after publication.
