# Naming ruling · a proposal and an authorization are different objects

**Ratified** founder, 2026-09-14.
**Status** NAMING ONLY. ⛔ No migration is authorized by this ruling. No schema
work has been done. The current tables are unchanged.

---

## The ruling

> A **proposal** is something the writer and MAIA may work on.
> An **authorization** is one exact state permitted to cross into the Work.

```
PROPOSAL                          AUTHORIZATION
  collaborative                     exact
  revisable                         immutable
  successor-carried                 bound to one Work state
  authored versions                 bound to one exact proposal version
  may remain inspection-only        carries the expected-text / target guard
  never mutates the manuscript      single-use
                                    is what the write boundary consumes
```

⛔ **Do not reconcile the two schemas by deciding which version of
`manuscript_revision_proposals` wins.** The distinction is not a collision to
resolve; it is two objects that were sharing one table because only one of them
had been built.

## Naming direction

```
manuscript_revision_proposals          collaborative proposal / thread root
manuscript_revision_proposal_versions  append-only authored staged states
manuscript_revision_authorizations     exact executable binding to one version
```

The current exact-change table is **misnamed for the architecture we now have**.
Conceptually it is an authorization record, not the evolving proposal.

## The consequence that carries the weight

```
replacement_text     belongs to the PROPOSAL VERSION
expected_text        belongs to the AUTHORIZATION
target identity      belongs to the AUTHORIZATION
base Work state      belongs to the AUTHORIZATION
```

⭐⭐ This is the trap already caught during the design of step 3, now given a
home in the schema rather than only in a comment:

> **Changing what should replace the text must never silently change what text
> the authorization is allowed to replace.**

One is authored and evolves; the other is a fact about the Work at a version and
must not move when the authored side does. They were edited by the same gesture
only because they were columns on the same row.

And an acceptance names **the exact staged version it accepted**, which is what
lets the record answer truthfully: *MAIA proposed A, MAIA revised it to B, Kelly
changed it to C, and Kelly accepted C.*

## Sequence

```
1  repair repeatable Show change            DONE · 07741b991
2  finish the local runtime witness         OPEN
3  close Step 2, only if the UX witness passes
4  design staged-version succession under this naming
5  then author schema reconciliation
```

⛔ Step 5 is last, and nothing about it is authorized here.
